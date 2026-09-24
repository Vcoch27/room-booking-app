import type { Snapshot, Unsubscribe } from "./repository";

export type Subscribe<T> = (
  next: (value: Snapshot<T>) => void,
  fail: (error: Error) => void,
) => Unsubscribe;

/** Adapt one realtime snapshot to an abortable Query request, including synchronous demo sources. */
export function firstSnapshot<T>(
  subscribe: Subscribe<T>,
  signal: AbortSignal,
): Promise<Snapshot<T>> {
  return new Promise((resolve, reject) => {
    let off: Unsubscribe | undefined;
    let finished = false;
    const finish = (action: () => void) => {
      if (finished) return;
      finished = true;
      signal.removeEventListener("abort", abort);
      off?.();
      action();
    };
    const abort = () => finish(() => reject(new Error("Request cancelled")));
    if (signal.aborted) {
      abort();
      return;
    }
    signal.addEventListener("abort", abort, { once: true });
    try {
      off = subscribe(
        (value) => finish(() => resolve(value)),
        (error) => finish(() => reject(error)),
      );
      if (finished) off();
    } catch (error) {
      finish(() => reject(error));
    }
  });
}
