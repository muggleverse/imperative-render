import { createApp, defineComponent, h, ref, Component, VNodeProps, AllowedComponentProps } from 'vue'

import {
  _nextTick,
  compose,
  createDeferred,
  createManager,
  foo,
  ImperativeRenderController,
  ImperativeRenderProps,
} from './utils'

export type { ImperativeRenderController, ImperativeRenderProps }

/**
 * manager for ImperativeRender, use it to clear all active components
 *
 * @example manager.clear() // clear all components
 */
export const manager = createManager()

export type ImperativeRenderOption = {
  /**
   * where to append wrapper dom
   * @default document.body
   * @example document.getElementById('app')
   */
  container?: HTMLElement

  /**
   * manually control destroy/create
   */
  manual?: boolean
}

const DefaultOption = {
  container: document.body,
}

/**
 * Imperative render YourComponent to DOM, and return a controller.
 * You can use the controller to resolve/reject the promise, or destroy the component.
 * YourComponent not only receive props from params, but also receive extra props: resolve/reject/destroy/active/index.
 *
 * @param Comp Rendered YourComponent
 * @param props Props of Component
 * @param {ImperativeRenderOption} option
 *
 * @example
 * const controller = imperativeRender(YourComponent, { name: 'imperativeRender' })
 * const { promise, resolve, reject, destroy, props, index } = controller
 */
export function imperativeRender<DeferredValue extends any, Props extends ImperativeRenderProps<DeferredValue>>(
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
    active: true,
    setActive: foo as any,
    waitUntil: foo as any,
    index: manager.nextIndex(),
  } as ImperativeRenderController<DeferredValue>

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
      waitUntil: (apromise) => {
        setActive(false)

        if (typeof apromise === 'function') apromise = apromise()
        return apromise.finally(() => setActive(true))
      },
    })

    return h(Comp, { ...props, controller } as any)
  })

  const el = document.createElement('div')
  const root = createApp(HOC)

  function destroy() {
    /**
     * _nextTick is used to avoid the following warning:
     *
     * Warning: Attempted to synchronously unmount a root while React was already rendering.
     * React cannot finish unmounting the root until the current render has completed, which may lead to a race condition.
     */
    _nextTick(() => {
      manager.delete(controller)
      root.unmount()
      opt.container.removeChild(el)
    })
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
 *
 * @param Comp Rendered YourComponent
 * @param props Props of Component
 * @param {ImperativeRenderOption} option
 *
 * @example
 * asyncImperativeRender(YourComponent, { name: 'imperativeRender' }).then(console.log).catch(console.error)
 */
export function asyncImperativeRender<DeferredValue extends any, Props extends ImperativeRenderProps<DeferredValue>>(
  Comp: Component<Props>,
  props?: Props,
  option?: ImperativeRenderOption,
) {
  return imperativeRender<DeferredValue, Props>(Comp, props, option).promise
}
