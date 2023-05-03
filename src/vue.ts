import { createApp, defineComponent, h, ref, Component, Ref } from 'vue'

import { attachCreateAndDestoryToController, compose, foo, inactivatedUntilPromise } from './utils'
import type { WaitUntil } from './utils'
import { implement, ImperativeRenderOption } from './core'

export { manager } from './core'
export type { ImperativeRenderOption } from './core'

const HOC = defineComponent({
  props: ['Comp', 'controller', 'impl', 'p'],

  setup({ Comp, controller, impl, p }) {
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

    return () => h(Comp, p)
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
  option?: ImperativeRenderOption,
) {
  const { impl, opt } = implement<DeferredValue>(option)

  const controller = {
    ...impl,
    active: foo as unknown as Ref<boolean>,
    destroy: foo,
    create: foo,
    setActive: foo as (value: boolean) => void,
    waitUntil: foo as unknown as WaitUntil<DeferredValue>,
  }

  const p = Object.assign({}, props, { controller })

  attachCreateAndDestoryToController(controller, opt, ($el) => {
    const root = createApp(HOC, { Comp, controller, impl, p })
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
