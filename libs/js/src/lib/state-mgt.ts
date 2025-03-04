import { BehaviorSubject } from 'rxjs'

type State<T extends Record<string, unknown>> = ReturnType<typeof createState<T>>
type ReadOnlyState<T extends Record<string, unknown>> = Pick<State<T>, 'get' | 'asObservable'>

function createState<T extends Record<string, unknown>>(initialState: T) {
  type GetPartialState = (currentState: T) => Partial<T>

  const state$ = new BehaviorSubject<T>(initialState)

  return {
    update(newState: Partial<T> | GetPartialState) {
      let getNewState: GetPartialState

      if (typeof newState !== 'function') {
        getNewState = () => newState
      } else {
        getNewState = newState
      }

      state$.next({ ...state$.value, ...getNewState(state$.value) })
    },
    get() {
      return state$.value
    },
    asObservable() {
      return state$.asObservable()
    },
    readOnly() {
      return {
        get: () => state$.value,
        asObservable: () => state$.asObservable(),
      }
    },
  }
}

export { createState }
export type { State, ReadOnlyState }
