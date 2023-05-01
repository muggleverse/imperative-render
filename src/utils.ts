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

export function createManager() {
  const set = new Set()
  let index = 1
  return {
    add(value) {
      set.add(value)
    },
    delete(value) {
      set.delete(value)
      console.log('delete', value, set.size)
      if (set.size === 0) index = 1
    },
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

type RestFunc<R> = (...args) => R
export function compose<R>(f1: RestFunc<R>, ...funcs: RestFunc<R>[]): RestFunc<R> {
  if (funcs.length === 0) {
    return f1
  }

  return funcs.reduce((acc, cur) => {
    return (...args) => acc(cur(...args))
  }, f1)
}

export const inactivatedUntilPromise = (inactivatedUntilPromise, setActive) => {
  setActive(false)

  if (typeof inactivatedUntilPromise === 'function') inactivatedUntilPromise = inactivatedUntilPromise()
  return inactivatedUntilPromise.finally(() => setActive(true))
}

export const foo = () => void 0
