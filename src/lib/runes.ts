import type { Readable, Unsubscriber } from 'svelte/store';

/**
 * Subscribe to a Svelte store and forward values to a setter.
 * Returns the unsubscribe function.
 */
export function mirrorStore<T>(store: Readable<T>, set: (value: T) => void): Unsubscriber {
  return store.subscribe(set);
}

/**
 * Subscribe to multiple stores at once and return a single disposer.
 */
export function mirrorStores(unsubscribers: Unsubscriber[]): Unsubscriber {
  return () => {
    for (const unsub of unsubscribers) {
      try {
        unsub();
      } catch {
        // noop
      }
    }
  };
}
