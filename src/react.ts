import { ComponentType, createElement, useState } from 'react'
import { createRoot } from 'react-dom/client'

import { attachCreateAndDestoryToController, compose, foo, inactivatedUntilPromise } from './utils'
import type { WaitUntil } from './utils'
import { implement, ImperativeRenderOption } from './core'

export { manager } from './core'
export type { ImperativeRenderOption } from './core'

function HOC({ Comp, controller, impl, p }) {
  const [active, setActive] = useState(true)

  const inactivated = () => setActive(false)

  Object.assign(controller, {
    active,
    setActive,
    resolve: compose(inactivated, impl.resolve),
    reject: compose(inactivated, impl.reject),
    waitUntil: (apromise) => inactivatedUntilPromise(apromise, setActive),
  })

  return createElement(Comp, p)
}

export function imperativeRender<DeferredValue extends any, Props extends {}>(
  Comp: ComponentType<Props>,
  props?: Omit<Props, 'controller'>,
  option?: ImperativeRenderOption,
) {
  const { impl, opt } = implement<DeferredValue>(option)

  const controller = {
    ...impl,
    destroy: foo,
    create: foo,
    setActive: foo as React.Dispatch<React.SetStateAction<boolean>>,
    waitUntil: foo as WaitUntil<DeferredValue>,
  }

  const p = Object.assign({}, props, { controller }) as unknown as Props

  attachCreateAndDestoryToController(controller, opt, ($el) => {
    const root = createRoot($el)
    root.render(createElement(HOC, { Comp, controller, impl, p }))

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
