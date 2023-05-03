import { createApp, defineComponent, h, ref, Component, Ref } from 'vue'

import { attachCreateAndDestoryToController, compose, createDeferred, foo, inactivatedUntilPromise } from './utils'
import type { WaitUntil } from './utils'
import { DefaultOption, ImperativeRenderOption } from './option'

export { manager } from './option'

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
  const opt = { ...DefaultOption, ...option }

  const { promise, resolve, reject } = createDeferred<DeferredValue>()

  const controller = {
    props,
    promise,
    resolve,
    reject,
    destroy: foo,
    create: foo,
    active: foo as unknown as Ref<boolean>,
    setActive: foo as (value: boolean) => void,
    waitUntil: foo as unknown as WaitUntil<DeferredValue>,
    index: opt.manager.nextIndex(),
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

  attachCreateAndDestoryToController(controller, opt, ($el) => {
    const root = createApp(HOC)
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
