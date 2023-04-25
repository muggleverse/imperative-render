import { ComponentType, createElement, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { _nextTick, compose, createDeferred, createManager, foo } from './utils'

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
 * Extra Props From ImperativeRender, can help you define your own type
 */
export type ImperativeRenderProps<DeferredValue = any> = {
  controller: ImperativeRenderController<DeferredValue>
}

export type ImperativeRenderController<DeferredValue = any> = {
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
  setActive: React.Dispatch<React.SetStateAction<boolean>>

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
   *
   * @see You must wait until YourComponent is rendered before you can use it !!!
   * @example
   * const controller = imperativeRender(YourComponent, { name: 'first' })
   * setTimeout(async () => {
   *  const value = await controller.waitUntil(asyncImperativeRender(YourComponent, { name: 'second' }))
   * }, 1000)
   */
  waitUntil: (apromise: (() => PromiseLike<DeferredValue>) | PromiseLike<DeferredValue>) => PromiseLike<DeferredValue>
}

/**
 * Imperative render React Component to DOM, and return a controller.
 * You can use the controller to resolve/reject the promise, or destroy the component.
 * YourComponent not only receive props from params, but also receive extra props: resolve/reject/destroy/active/index.
 *
 * @param Comp Rendered React Component
 * @param props Props of Component
 * @param {ImperativeRenderOption} option
 *
 * @example
 * const controller = imperativeRender(YourComponent, { name: 'imperativeRender' })
 * const { promise, resolve, reject, destroy, props, index } = controller
 */
export function imperativeRender<DeferredValue extends any, Props extends ImperativeRenderProps<DeferredValue>>(
  Comp: ComponentType<Props>,
  props?: Omit<Props, 'controller'>,
  option?: ImperativeRenderOption,
) {
  const opt = { ...DefaultOption, ...option }

  const { promise, resolve, reject } = createDeferred<DeferredValue>()

  const el = document.createElement('div')
  const root = createRoot(el)

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
    root.render(createElement(HOC))
    manager.add(controller)
  }

  function HOC() {
    const [active, setActive] = useState(true)

    const inactivated = () => setActive(false)

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

    return createElement(Comp, { ...props, controller } as any)
  }

  create()

  return controller
}

/**
 * Imperative render React Component to DOM, and return a promise only.
 * YourComponent not only receive props from params, but also receive extra props: resolve/reject/destroy/active/index.
 *
 * @param Comp Rendered React Component
 * @param props Props of Component
 * @param {ImperativeRenderOption} option
 *
 * @example
 * asyncImperativeRender(YourComponent, { name: 'imperativeRender' }).then(console.log).catch(console.error)
 */
export function asyncImperativeRender<DeferredValue extends any, Props extends ImperativeRenderProps<DeferredValue>>(
  Comp: ComponentType<Props>,
  props?: Omit<Props, 'controller'>,
  option?: ImperativeRenderOption,
) {
  return imperativeRender<DeferredValue, Props>(Comp, props, option).promise
}
