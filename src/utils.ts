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

const DefaultClearCallback = (instance) => instance.destroy()

export function createManage() {
  const set = new Set()
  let index = 1
  return {
    add: set.add,
    delete: set.delete,
    clear(callback = DefaultClearCallback) {
      new Set(set).forEach(callback)

      set.clear()
      index = 1
    },
    nextIndex() {
      return index++
    },
  }
}
