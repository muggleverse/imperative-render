import { ComponentType, createElement, useState } from 'react'
import { createRoot } from 'react-dom/client'

import { compose, foo, inactivatedUntilPromise } from './utils'
import type { WaitUntil } from './utils'
import { implement, attachCreateAndDestoryToController, ImperativeRenderOption } from './core'

export { manager } from './core'
export type { ImperativeRenderOption } from './core'

function Hoc({ Comp, option, controller, impl, p }) {
  const [active, setActive] = useState(true)

  const inactivated = () => setActive(false)

  Object.assign(controller, {
    active,
    setActive,
    resolve: compose(inactivated, impl.resolve),
    reject: compose(inactivated, impl.reject),
    waitUntil: (apromise) => inactivatedUntilPromise(apromise, setActive),
  })

  const children = createElement(Comp, p)

  return option.provider ? createElement(option.provider, { children }) : children
}

export function imperativeRender<DeferredValue extends any, Props extends {}>(
  Comp: ComponentType<Props>,
  props?: Omit<Props, 'controller'>,
  opt?: ImperativeRenderOption,
) {
  const { impl, option } = implement<DeferredValue>(opt)

  const controller = {
    ...impl,
    destroy: foo,
    create: foo,
    setActive: foo as React.Dispatch<React.SetStateAction<boolean>>,
    waitUntil: foo as WaitUntil<DeferredValue>,
  }

  const p = Object.assign({}, props, { controller }) as unknown as Props

  attachCreateAndDestoryToController(controller, option, ($el) => {
    const root = createRoot($el)
    root.render(createElement(Hoc, { Comp, option, controller, impl, p }))

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
