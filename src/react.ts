import { ComponentType, createElement, useState } from 'react'
import { createRoot } from 'react-dom/client'

import { attachCreateAndDestoryToController, compose, createDeferred, foo, inactivatedUntilPromise } from './utils'
import type { WaitUntil } from './utils'
import { DefaultOption, ImperativeRenderOption } from './option'

export { manager } from './option'

/**
 * Imperative render YourComponent to DOM, and return a controller.
 * You can use the controller to resolve/reject the promise, or destroy the component.
 * YourComponent not only receive props from params, but also receive extra props: resolve/reject/destroy/active/index.
 *
 * @tips Please call destroy actively, otherwise it will cause memory leak
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
    destroy: foo,
    create: foo,
    active: true,
    setActive: foo as React.Dispatch<React.SetStateAction<boolean>>,
    waitUntil: foo as unknown as WaitUntil<DeferredValue>,
    index: opt.manager.nextIndex(),
  }

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

  attachCreateAndDestoryToController(controller, opt, ($el) => {
    const root = createRoot($el)
    root.render(createElement(HOC))

    return () => root.unmount()
  })

  controller.create()

  return controller
}

/**
 * Imperative render YourComponent to DOM, and return a promise only.
 * YourComponent not only receive props from params, but also receive extra props: resolve/reject/destroy/active/index.
 *
 * @tips Automatically destroyed after the promise finally
 */
export function asyncImperativeRender<DeferredValue extends any, Props extends {}>(
  Comp: ComponentType<Props>,
  props?: Omit<Props, 'controller'>,
  option?: ImperativeRenderOption,
) {
  const controller = imperativeRender<DeferredValue, Props>(Comp, props, option)

  controller.promise.finally(controller.destroy)

  return controller.promise
}

export type ImperativeRenderController<DeferredValue extends any = any, Props extends {} = {}> = ReturnType<
  typeof imperativeRender<DeferredValue, Props>
>

/**
 * Extra Props From ImperativeRender, can help you define your own type
 */
export type ImperativeRenderProps<DeferredValue extends any = any, Props extends {} = {}> = {
  controller: ImperativeRenderController<DeferredValue, Props>
}
