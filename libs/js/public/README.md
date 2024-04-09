# Rx State Utils

- Simple utilities to use state management based on RxJS.
- This is meant to be used in apps using class-based components, like [Stencil.js](https://stenciljs.com/). If you are using React, you should use [@rx-state-utils/react](https://www.npmjs.com/package/@rx-state-utils/react)
- It allows writing more declarative code, separating side-effects from pure functions.
- This allows framework independent state management, by separating State and App Logic from view-layer, so it can be easy to migrate Frontend frameworks/libraries.
- This is used in my [youtube-frontend project - PipedRx](https://github.com/HarshRohila/youtube-frontend)

## Basic Idea of State Management with RxJS

- Components will emit events and will subscribe(or listen) to state changes.
- Components can also subscribe to Features (explained below). Features will take events Observable as inputs and will have logic for updating state.

## Install

- This library is having "rxjs" as peer dependency.
- `npm i @rx-state-utils/js`

## Events

We can convert Component events to Observables so that we can use RxJS operators on them. That will make code more declarative. To convert Events to Observables `createEvent` function is provided.

Consider below Example component

```jsx
import { createEvent } from '@rx-state-utils/js'

class Example() {

	searchTextChangeEvent = createEvent(ev => ev.target["value"])

	render() {
  	return <input
			type="text"
			class="search-input"
			value={searchText}
			placeholder="Search"
			onInput={this.searchTextChangeEvent.handler}
		/>
	}
}
```

`createEvent` returns 2 values in an object, first is the Observable value `$` and second is the `handler` which you can attach to your element. It also accepts an optional callback, which you can use to map incoming event to some value.

In example above,

- Event handler `this.searchTextChangeEvent.handler` is attached to input of type text.
- Event is mapped to target's text value.
- `this.searchTextChangeEvent.$` is Observable

TypeScript example looks like below

```tsx
import { createEvent } from '@rx-state-utils/js'

class Example() {

	searchTextChangeEvent = createEvent<Event, string>(ev => ev.target["value"])

	render() {
  	return <input
			type="text"
			class="search-input"
			value={searchText}
			placeholder="Search"
			onInput={this.searchTextChangeEvent.handler}
		/>
	}
}
```

## State

- To create state use `createState`. This should be in separate file than component to separate state from view. Here, I will name the file `facade.ts`

```js
// facade.ts
import { createState } from '@rx-state-utils/js'

const state = createState({
  todos: [],
  text: '',
})
```

In TypeScript,

```ts
// facade.ts
import { createState } from '@rx-state-utils/js'

const state = createState<State>({
  todos: [] as Todo[],
  text: '',
})
export { state }
```

You can export this state and a component can subscribe to this state and update its internal state using it.

## Subscription to Observables

- When component is subscribing to some Observable, it should unsubscribe it to avoid memory leak. Common place to unsubscribe is Destroy method of the class component.
- This Library provides utilities to avoid writing unsubscribe logic on destroy.
- To use that, create a global file, lets say `state-mgt.ts` and initialize component utility with the name of Destroy method name used by your class component. In case of Stencil.js, its `disconnectedCallback`, so we can initialize like below,

```ts
// state-mgt.ts
import { initComponentUtil } from '@rx-state-utils/js'

const componentUtil = initComponentUtil({
  componentDestroyHandlerName: 'disconnectedCallback',
})

export { componentUtil }
```

Now you can use exported `componentUtil` in your components for subscribing to Observables like below.

> Note: we are writing below logic in `componentWillLoad` in case of Stencil.js. In other frameworks, usually, it would be the Component's method which gets called once on first load.

```tsx
import { componentUtil } from './stat-mgt.ts'

class Example() {
	componentWillLoad() {
		const component = componentUtil(this)

		component.subscribe(state.asObservable(), state => {
			this.todos = state.todos
			this.text = state.text
		})
	}
}
```

Above example,

- is using `component.subscribe` to subscribe to `state.asObservable()`. This will automatically unsubscribes on component destroy to prevent memory leaks.

> Note: We need to update Framework's state so it knows when to update its view. Ideally a component should only set Framework's state once in this way. We will update the state created with `createState` only(not the Framework's state) and those will get applied to Framework's state with this subscription.

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

## Example usage in an App

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
// Example.ts
import { Features } from "./facade.ts"

class Example() {
	componentWillLoad() {
		const component = componentUtil(this)

		component.justSubscribe(Features.addTodo(add$), Features.setText(text$))
	}
}
```

- `component.justSubscribe` is used to just subscribe and don't do anything else. Like `component.subscribe`, it will also auto-unsubscribe on component destroy.
- Using this way we have side-effects separated in `tap` operators.
- The state and its update logic in `facade.ts` file are separated from component/view-layer `Example.tsx` file.
- Now, in future, if we want to migrate to other view-layer or Frontend-framework, we just need to update component file and subscribe to state and features and emit Observable Events, the `facade.ts` file can remain the same.
