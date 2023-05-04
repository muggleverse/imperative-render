import { createApp, defineComponent, h, ref, Component, Ref } from 'vue'

import { compose, foo, inactivatedUntilPromise } from './utils'
import type { WaitUntil } from './utils'
import { implement, attachCreateAndDestoryToController, ImperativeRenderOption } from './core'

export { manager } from './core'
export type { ImperativeRenderOption } from './core'

const Hoc = defineComponent({
  props: ['Comp', 'option', 'controller', 'impl', 'p'],

  setup({ Comp, option, controller, impl, p }) {
    const active = ref(true)

    const setActive = (value) => {
      active.value = value
    }

    const inactivated = () => {
      active.value = false
    }

    Object.assign(controller, {
      active,
      setActive,
      resolve: compose(inactivated, impl.resolve),
      reject: compose(inactivated, impl.reject),
      waitUntil: (apromise) => inactivatedUntilPromise(apromise, setActive),
    })

    return () => {
      const children = h(Comp, p)

      return option.provider ? h(option.provider, null, { default: () => children }) : children
    }
  },
})

/**
 * Imperative render YourComponent to DOM, and return a controller.
 * You can use the controller to resolve/reject the promise, or destroy the component.
 * YourComponent not only receive props from params, but also receive extra props: resolve/reject/destroy/active/index.
 */
export function imperativeRender<DeferredValue extends any, Props extends {} = {}>(
  Comp: Component<Props>,
  props?: Props,
  opt?: ImperativeRenderOption,
) {
  const { impl, option } = implement<DeferredValue>(opt)

  const controller = {
    ...impl,
    active: foo as unknown as Ref<boolean>,
    destroy: foo,
    create: foo,
    setActive: foo as (value: boolean) => void,
    waitUntil: foo as unknown as WaitUntil<DeferredValue>,
  }

  const p = Object.assign({}, props, { controller })

  attachCreateAndDestoryToController(controller, option, ($el) => {
    const root = createApp(Hoc, { Comp, option, controller, impl, p })
    root.mount($el)

    return () => root.unmount()
  })

  controller.create()

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
export type ImperativeRenderProps<DeferredValue extends any, Props extends {}> = {
  controller: ImperativeRenderController<DeferredValue, Props>
}
