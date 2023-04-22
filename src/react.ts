import { ComponentType, createElement, createRef } from 'react'
import { createRoot } from 'react-dom/client'
import { createDeferred, createManage } from './utils'

export const manager = createManage()

type Option = {
  container?: HTMLElement
}

const DefaultOption = {
  container: document.body,
}

export function imperativeRender<Value = any, RefObject = any, Props = any>(
  Comp: ComponentType<Props>,
  props?: Omit<Props, 'resolve' | 'reject'>,
  option?: Option,
) {
  const opt = { ...DefaultOption, ...option }

  const ref = createRef<RefObject>()
  const { promise, resolve, reject } = createDeferred<Value>()

  const wrapper: any = document.createElement('div')
  const root = createRoot(wrapper)
  const mergedProps = { ...props, ref, resolve, reject }

  const instance = { promise, resolve, reject, ref, destroy, props: mergedProps, index: manager.nextIndex() }

  function destroy() {
    manager.delete(instance) // 1. delete from queue
    root.unmount() // 2. unmount from wrapper
    wrapper.remove() // 3. remove wrapper dom
  }

  opt.container.appendChild(wrapper) // 1. append wrapper dom
  root.render(createElement(Comp as any, mergedProps)) // 2. render to wrapper
  manager.add(instance) // 3. add to queue

  return instance
}

export function asyncImperativeRender<Value = any, RefObject = any, Props extends Object = {}>(
  Comp: ComponentType<Props>,
  props?: Props,
  option?: Option,
) {
  const instance = imperativeRender<Value, RefObject>(Comp, props, option)
  return instance.promise
}
