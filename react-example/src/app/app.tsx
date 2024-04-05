// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { useEvent, useJustSubscribe, useSubscribe } from '@rx-state-utils/react'
import { Features, state } from './facade'
import { useState } from 'react'
import { Todo } from './todo.service'

export function App() {
  // Declare Component Events
  const [text$, textChangeHandler] = useEvent<React.FormEvent<HTMLInputElement>, string>(
    (ev) => (ev.target as HTMLInputElement)['value']
  )
  const [add$, addHandler] = useEvent<React.FormEvent<HTMLFormElement>, void>((ev) => {
    ev.preventDefault()
  })

  // Subscribe to Features this component will provide using events
  useJustSubscribe(Features.setText(text$), Features.addTodo(add$))

  const [todos, setTodos] = useState<Todo[]>([])
  const [text, setText] = useState<string>('')

  // Update Framework state, so it can update its view
  useSubscribe(state.asObservable(), (state) => {
    setTodos(state.todos)
    setText(state.text)
  })

  return (
    <div>
      <h1>
        <span> Todo App to test rx-state-utils </span>
      </h1>
      <form onSubmit={addHandler}>
        <input className="input" type="text" placeholder="Type here" onInput={textChangeHandler} value={text} />
        <button className="add" type="submit">
          Add
        </button>
        <ul>
          {todos.map((todo) => (
            <li className="todo-text" key={todo.id}>
              {todo.text}
            </li>
          ))}
        </ul>
      </form>
    </div>
  )
}

export default App
