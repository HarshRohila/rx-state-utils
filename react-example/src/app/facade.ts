import { createState } from '@rx-state-utils/react'
import { Todo, TodoCreator } from './todo.service'
import { Observable, map, tap } from 'rxjs'

interface State {
  todos: Todo[]
  text: string
}

const state = createState<State>({
  todos: [] as Todo[],
  text: '',
})

const todoCreator = TodoCreator()

const Features = {
  addTodo(add$: Observable<void>) {
    return add$.pipe(
      map(() => todoCreator.createTodo({ text: state.get().text })),
      tap((todo) => {
        state.update((currentState) => ({
          todos: [...currentState.todos, todo],
          text: '',
        }))
      })
    )
  },
  setText(text$: Observable<string>) {
    return text$.pipe(
      tap((text) => {
        state.update({ text })
      })
    )
  },
}

export { state, Features }
