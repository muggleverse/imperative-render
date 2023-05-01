import { ComponentType, createElement, useState } from 'react'
import { createRoot } from 'react-dom/client'

import { compose, createDeferred, createManager, foo, inactivatedUntilPromise } from './utils'

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
   * set active state, this will trigger re-render, You must wait until YourComponent is rendered before you can use it !!!
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
   */
  waitUntil: (apromise: (() => PromiseLike<DeferredValue>) | PromiseLike<DeferredValue>) => PromiseLike<DeferredValue>
}

/**
 * manager for ImperativeRender, use it to clear all active components
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
  Comp: ComponentType<Props>,
  props?: Omit<Props, 'controller'>,
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

  function HOC() {
    const [active, setActive] = useState(true)

    const inactivated = () => setActive(false)

    Object.assign(controller, {
      active,
      setActive,
      resolve: compose(inactivated, resolve),
      reject: compose(inactivated, reject),
      waitUntil: (apromise) => inactivatedUntilPromise(apromise, setActive),
    })

    return createElement(Comp, { ...props, controller } as any)
  }

  const el = document.createElement('div')
  const root = createRoot(el)

  function destroy() {
    /**
     * setTimeout is used to avoid the following warning:
     *
     * Warning: Attempted to synchronously unmount a root while React was already rendering.
     * React cannot finish unmounting the root until the current render has completed, which may lead to a race condition.
     */
    setTimeout(() => {
      manager.delete(controller)
      root.unmount()
      opt.container.removeChild(el)
    }, 180)
  }

  function create() {
    opt.container.appendChild(el)
    root.render(createElement(HOC))
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
  Comp: ComponentType<Props>,
  props?: Omit<Props, 'controller'>,
  option?: ImperativeRenderOption,
) {
  return imperativeRender<DeferredValue, Props>(Comp, props, option).promise
}
