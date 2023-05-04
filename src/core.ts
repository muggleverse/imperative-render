import { createDeferred } from './utils'

export type ImperativeRenderOption = {
  /** where to append wrapper dom */
  container?: HTMLElement

  provider?: any
}

const DefaultClearCallback = (instance) => instance.destroy()

export function createManager() {
  const set = new Set()
  let index = 1

  const manager = {
    config(option?: ImperativeRenderOption) {
      Object.assign(config, option)

      return config
    },
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

  const config = {
    container: document.body,
    manager,
    provider: null,
  }

  return manager
}

export const manager = createManager()

export function implement<DeferredValue extends any>(opt?: ImperativeRenderOption) {
  const option = { ...manager.config(), ...opt }

  const { promise, resolve, reject } = createDeferred<DeferredValue>()

  const impl = {
    promise,
    resolve,
    reject,
    active: true,
    index: option.manager.nextIndex(),

    // destroy: foo,
    // create: foo,
    // setActive: foo,
    // waitUntil: foo,
  }

  return { impl, option }
}

export function attachCreateAndDestoryToController(
  controller: any,
  opt: ReturnType<typeof implement>['option'],
  mountUnmount: ($el: HTMLDivElement) => Function,
) {
  let $el: HTMLDivElement
  let unmount: Function

  function destroy() {
    /**
     * setTimeout is used to avoid the following warning:
     * Warning: Attempted to synchronously unmount a root while React was already rendering. React cannot finish unmounting the root until the current render has completed, which may lead to a race condition.
     */
    setTimeout(() => {
      unmount()

      opt.container.removeChild($el)
      opt.manager.delete(controller)

      $el = null as any
    })
  }

  function create() {
    $el = document.createElement('div')

    opt.container.appendChild($el)
    opt.manager.add(controller)

    unmount = mountUnmount($el)

    if (typeof unmount !== 'function') {
      throw TypeError('mountUnmount should return a function')
    }
  }

  Object.assign(controller, { destroy, create })

  return controller
}
