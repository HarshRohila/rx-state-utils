import { Observable, Observer, Subject, takeUntil } from 'rxjs';
import { createState } from './lib/state-mgt';
import { useCallback, useEffect, useState } from './lib/hooks';

function useJustSubscribe(...observables: Observable<unknown>[]) {
  useEffect(() => {
    const destroy$ = new Subject<void>();

    observables.forEach((obs) => {
      obs.pipe(takeUntil(destroy$)).subscribe();
    });

    return () => {
      destroy$.next();
      destroy$.complete();
    };
  }, []);
}

function useSubscribe<T>(obs: Observable<T>, callback: Partial<Observer<T>> | ((value: T) => void)) {
  useEffect(() => {
    const destroy$ = new Subject<void>();

    obs.pipe(takeUntil(destroy$)).subscribe(callback);

    return () => {
      destroy$.next();
      destroy$.complete();
    };
  }, []);
}

function useEvent<U, T = U>(
  mapper?: (sourceEvent: U) => T,
  { once }: { once: boolean } = { once: false }
): [Observable<T>, (ev: U) => void] {
  const [event] = useState(new Subject<T>());

  const handler = useCallback(function handler(ev: U) {
    let newValue: T;
    if (mapper) {
      newValue = mapper(ev);
    } else {
      newValue = ev as unknown as T;
    }
    event.next(newValue);
    if (once) event.complete();
  }, []);

  return [event.asObservable(), handler];
}

function useVoidEvent<T>({ once }: { once: boolean } = { once: false }): [Observable<void>, (ev: T) => void] {
  return useEvent<T, void>(() => undefined, { once });
}

export { useJustSubscribe, useSubscribe, useEvent, useVoidEvent, createState };
