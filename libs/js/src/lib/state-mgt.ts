import { BehaviorSubject } from 'rxjs';

function createState<T>(initialState: T) {
  type GetPartialState = (currentState: T) => Partial<T>;

  const state$ = new BehaviorSubject<T>(initialState);

  return {
    update(newState: Partial<T> | GetPartialState) {
      let getNewState: GetPartialState;

      if (typeof newState !== 'function') {
        getNewState = () => newState;
      } else {
        getNewState = newState;
      }

      state$.next({ ...state$.value, ...getNewState(state$.value) });
    },
    get() {
      return state$.value;
    },
    asObservable() {
      return state$.asObservable();
    },
  };
}

export { createState };
