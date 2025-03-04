import { Observable, Observer, Subject } from 'rxjs'
import { untilDestroyed } from './lib/until-destroyed'
import { createState, ReadOnlyState, State } from './lib/state-mgt'

function initComponentUtil({ componentDestroyHandlerName }: { componentDestroyHandlerName: string }) {
  return function initInComponent(componentContext: any) {
    const pub = {
      untilDestroyed<T>(anyObservable: Observable<T>) {
        return anyObservable.pipe(untilDestroyed(componentContext, componentDestroyHandlerName))
      },
      justSubscribe(...observables: Observable<unknown>[]) {
        observables.forEach((obs) => {
          pub.untilDestroyed(obs).subscribe()
        })
      },
      subscribe<T>(anyObservable: Observable<T>, callback: Partial<Observer<T>> | ((value: T) => void)) {
        return anyObservable.pipe(pub.untilDestroyed).subscribe(callback)
      },
    }

    return pub
  }
}

function createEvent<U, T = U>(mapper?: (sourceEvent: U) => T, { once }: { once: boolean } = { once: false }) {
  const event = new Subject<T>()

  function handler(ev: U) {
    let newValue: T
    if (mapper) {
      newValue = mapper(ev)
    } else {
      newValue = ev as unknown as T
    }
    event.next(newValue)
    if (once) event.complete()
  }

  return {
    $: event.asObservable(),
    handler,
  }
}

function createVoidEvent<T>({ once }: { once: boolean } = { once: false }) {
  return createEvent<T, void>(() => undefined, { once })
}

export { initComponentUtil, createEvent, createVoidEvent, createState }
export type { ReadOnlyState, State }
