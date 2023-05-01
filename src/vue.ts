import { createApp, defineComponent, h, ref, Component, Ref } from 'vue'

import { compose, createDeferred, createManager, foo, inactivatedUntilPromise } from './utils'

/**
 * manager for ImperativeRender, use it to clear all active components
 *
 * @example manager.clear() // clear all components
 */
export const manager = createManager()

export type ImperativeRenderOption = {
  /**
   * where to append wrapper dom
   */
  container?: HTMLElement
}

const DefaultOption = {
  container: document.body,
}

/**
 * Imperative render YourComponent to DOM, and return a controller.
 * You can use the controller to resolve/reject the promise, or destroy the component.
 * YourComponent not only receive props from params, but also receive extra props: resolve/reject/destroy/active/index.
 */
export function imperativeRender<DeferredValue extends any, Props extends {}>(
  Comp: Component<Props>,
  props?: Props,
  option?: ImperativeRenderOption,
) {
  const opt = { ...DefaultOption, ...option }

  const { promise, resolve, reject } = createDeferred<DeferredValue>()

  const controller = {
    props,
    promise,
    resolve,
    reject,
    destroy,
    create,
    active: foo as unknown as Ref<boolean>,
    setActive: foo as (value: boolean) => void,
    waitUntil: foo as unknown as (
      apromise: (() => PromiseLike<DeferredValue>) | PromiseLike<DeferredValue>,
    ) => PromiseLike<DeferredValue>,
    index: manager.nextIndex(),
  }

  const HOC = defineComponent(() => {
    const active = ref(true)

    const setActive = (value: boolean) => {
      active.value = value
    }

    const inactivated = () => {
      active.value = false
    }

    Object.assign(controller, {
      active,
      setActive,
      resolve: compose(inactivated, resolve),
      reject: compose(inactivated, reject),
      waitUntil: (apromise) => inactivatedUntilPromise(apromise, setActive),
    })

    return () => h(Comp, Object.assign({}, props, { controller }))
  })

  const el = document.createElement('div')
  const root = createApp(HOC)

  function destroy() {
    setTimeout(() => {
      manager.delete(controller)
      root.unmount()
      opt.container.removeChild(el)
    }, 180)
  }

  function create() {
    opt.container.appendChild(el)
    root.mount(el)
    manager.add(controller)
  }

  create()

  return controller
}

/**
 * Imperative render YourComponent to DOM, and return a promise only.
 * YourComponent not only receive props from params, but also receive extra props: resolve/reject/destroy/active/index.
 */
export function asyncImperativeRender<DeferredValue extends any, Props extends {}>(
  Comp: Component<Props>,
  props?: Props,
  option?: ImperativeRenderOption,
) {
  return imperativeRender<DeferredValue, Props>(Comp, props, option).promise
}

export type ImperativeRenderController<DeferredValue> = ReturnType<typeof imperativeRender>

/**
 * Extra Props From ImperativeRender, can help you define your own type
 */
export type ImperativeRenderProps<DeferredValue = any> = {
  controller: ImperativeRenderController<DeferredValue>
}
