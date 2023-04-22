import { ReactElement, cloneElement, createRef, ReactComponentElement } from 'react'
import { createRoot } from 'react-dom/client'
import { createDeferred, createManage } from './utils'

export const manager = createManage()

export function imperativeRender<E extends ReactElement>(element: E, container?: HTMLElement) {
  const ref = createRef<E>()
  const deferred = createDeferred()
  const cloned = cloneElement(element, { ref, deferred })

  const wrapper: any = document.createElement('div')
  const root = createRoot(wrapper)

  const instance = { ref, props: cloned.props, index: manager.nextIndex(), destroy, resolve, reject }

  function resolve(value) {
    deferred.resolve(value)
    destroy()
  }

  function reject(reason) {
    deferred.reject(reason)
    destroy()
  }

  function destroy() {
    manager.delete(instance) // 1. delete from queue
    root.unmount() // 2. unmount from wrapper
    wrapper.remove() // 3. remove wrapper dom
  }

  ;(container || document.body).appendChild(wrapper) // 1. append wrapper dom
  root.render(cloned) // 2. render to wrapper
  manager.add(instance) // 3. add to queue

  return instance
}
