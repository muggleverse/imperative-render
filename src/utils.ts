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

export const _nextTick = requestIdleCallback || setTimeout

export const foo = () => void 0

/**
 * Extra Props From ImperativeRender, can help you define your own type
 */
export type ImperativeRenderProps<DeferredValue = any> = {
  controller?: ImperativeRenderController<DeferredValue>
}

export type ImperativeRenderController<DeferredValue = any, SetActive extends any = (value: boolean) => void> = {
  promise: Promise<DeferredValue>

  /**
   * resolve the promise with value
   */
  resolve: (value: DeferredValue | PromiseLike<DeferredValue>) => void

  /**
   * reject the promise with reason
   */
  reject: (reason?: any) => void

  /**
   * destroy the component
   */
  destroy: () => void

  /**
   * set active state, this will trigger re-render
   *
   * @see You must wait until YourComponent is rendered before you can use it !!!
   */
  setActive: SetActive

  /**
   * whether the component is activated
   */
  active: boolean

  /**
   * the index of component in queue. Is increasing, but not necessarily continuous
   */
  index: number

  /**
   * Deactivate first, then call Promise/AsyncFunction, and activate at the end. May help you in nested situations,
   */
  waitUntil: (apromise: (() => PromiseLike<DeferredValue>) | PromiseLike<DeferredValue>) => PromiseLike<DeferredValue>
}
