# Rx State Utils - React

- Simple utilities to use state management based on RxJS.
- It allows writing more declarative code, separating side-effects from pure functions.
- This allows framework independent state management, by separating State and App Logic from view-layer, so it can be easy to migrate Frontend frameworks/libraries.

## Projects using this Library

- [Todo App - Edit on StackBlitz](https://stackblitz.com/edit/vitejs-vite-5qnba2?file=src%2FApp.tsx)
- [Todo App - GitHub](https://github.com/HarshRohila/rx-state-utils/tree/master/react-example)

## Basic Idea of State Management with RxJS

- Components will emit events and will subscribe(or listen) to state changes.
- Components can also subscribe to Features (explained below). Features will take events Observable as inputs and will have logic for updating state.

## Install

- This library is having peer dependencies, rxjs and react, make sure you have them in your project.
- `npm i @rx-state-utils/react`

## Events

We can convert Component events to Observables so that we can use RxJS operators on them. That will make code more declarative. To convert Events to Observables `useEvent` hook is provided.

Consider below Example component

```jsx
import { useEvent } from '@rx-state-utils/react'

function Example() {
  const [text$, textChangeHandler] = useEvent((ev) => ev.target.value)

  return <input type="text" onInput={textChangeHandler} value={text} />
}
```

`useEvent` returns 2 values, first is the Observable value and second is the handler which you can attach to your element. It also accepts an optional callback, which you can use to map incoming event to some value.

In example above,

- Event handler `textChangeHandler` is attached to input of type text.
- Event is mapped to target's text value.
- `text$` is Observable

TypeScript example looks like below

```tsx
import { useEvent } from '@rx-state-utils/react'

function Example() {
  const [text$, textChangeHandler] = useEvent<React.FormEvent<HTMLInputElement>, string>(
    (ev) => (ev.target as HTMLInputElement)['value']
  )

  return <input type="text" onInput={textChangeHandler} value={text} />
}
```

## State

- To create state use `createState`. This should be in separate file than component to separate state from view. Here, I will name the file `facade.ts`

```js
// facade.ts
import { createState } from '@rx-state-utils/react'

const state = createState({
  todos: [],
  text: '',
})
```

In TypeScript,

```ts
import { createState } from '@rx-state-utils/react'
// facade.ts
const state = createState<State>({
  todos: [] as Todo[],
  text: '',
})
export { state }
```

You can export this state and component can subscribe to this state and update its internal state using it.

```tsx
import { useSubscribe } from '@rx-state-utils/react'
import { state } from './facade'
import { useState } from 'react'

const [todos, setTodos] = useState([])
const [text, setText] = useState('')
// Update Framework state, so it can update its view
useSubscribe(state.asObservable(), (state) => {
  setTodos(state.todos)
  setText(state.text)
})
```

Above example,

- is using `useSubscribe` to subscribe to `state.asObservable()`. `useSubscribe` automatically unsubscribes on component destroy to prevent memory leaks.

> Note: We need to update React's state so it knows when to update its view. Ideally a component should only set React's state once in this way. We will update the state created with `createState` only(not the React's state) and those will get applied to React's state with this subscription.

## Available State operations

You can do the following with the State created with `createState`

- Update

  ```ts
  state.update({ text: 'new text' })
  ```

  - This will immutably update the text property of the state.
  - To use current state while updating current state you can do the following.

  ```ts
  state.update((currentState) => ({
    todos: [...currentState.todos, todo], // add a todo in current todos
    text: '',
  }))
  ```

- Get Current State

  ```ts
  const currentState = state.get()
  ```

- State as observable, to which component can subscribe to

  ```ts
  const state$ = state.asObservable()
  ```

## Example usage in a React App

- You can define features in facade.ts file like below, and the component can subscribe to the features.

```ts
// facade.ts
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

export { Features }
```

```tsx
// Example.tsx
import { useJustSubscribe } from '@rx-state-utils/react'

function Example() {
  useJustSubscribe(Features.setText(text$), Features.addTodo(add$))
}
```

- `useJustSubscribe` hook is used to just subscribe and don't do anything else. Like `useSubscribe`, it will also auto-unsubscribe on component destroy.
- Using this way we have side-effects separated in `tap` operators.
- The state and its update logic in `facade.ts` file are separated from component/view-layer `Example.tsx` file.
- Now, in future, if we want to migrate to other view-layer or Frontend-framework, we just need to update component file and subscribe to state and features and emit Observable Events, the `facade.ts` file can remain the same.
