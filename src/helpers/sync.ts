export type ArrayParams<T = unknown> = T extends Array<infer U> ? U[] : unknown[]
export type MaybeAsyncFunction<Params extends ArrayParams, Result> = (...args: Params) => Result | Promise<Result>;
export type EachItem<T, R = unknown> = T extends MaybeAsyncFunction<infer Params, R>
  ? [fn: T, params: Params] | [data: R]
  : [unknown];

export type SyncParams<T> = T extends Array<EachItem<infer U>> ? Array<EachItem<U>> : Array<unknown>;
export type SyncResult<T extends Array<unknown>> = T extends Array<EachItem<unknown, infer R>> ? R[] : [];

export async function sync<T extends Array<unknown>>(
  ...items: SyncParams<T>
): Promise<SyncResult<T>> {
  const results: Array<unknown> = [];

  for (const item of items) {
    if (!Array.isArray(item)) {
      results.push(undefined);
      continue;
    }

    const [fn, params] = item as EachItem<T> as [unknown, unknown];
    
    if (typeof fn === "function") {
      results.push(await fn(params));
      continue;
    }

    results.push(await fn);
  }

  return results as SyncResult<T>;
}
