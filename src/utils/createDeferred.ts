type Deferred<V> = {
  resolve: (value: V | PromiseLike<V>) => void
  reject: (reason?: any) => void
  promise: Promise<V>
}

export function createDeferred<T>() {
  const defer = {} as Deferred<T>

  defer.promise = new Promise<T>((resolve, reject) => {
    defer.resolve = resolve
    defer.reject = reject
  })

  return defer
}
