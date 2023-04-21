import { RefObject, ReactElement, cloneElement, createRef, ReactComponentElement } from 'react'
import { createRoot } from 'react-dom/client'
import { createDeferred } from './utils'

import * as manage from './queue'

export type Instance<R, P> = {
  ref: RefObject<R>
  props: P
  index: number
  destroy: () => void
}

export function imperativeRender<E extends ReactElement>(element: E, container?: HTMLElement) {
  const ref = createRef<E>()
  const deferred = createDeferred()
  const cloned = cloneElement(element, { ref, deferred })

  let div: any = document.createElement('div')
  const root = createRoot(div)

  const instance = { ref, props: cloned.props, index: manage.nextIndex(), destroy }

  function destroy() {
    manage.remove(instance) // 1. remove from queue
    root.unmount() // 2. unmount from wrapper
    div.remove() // 3. remove wrapper dom
  }

  ;(container || document.body).appendChild(div) // 1. append wrapper dom
  root.render(cloned) // 2. render to wrapper
  manage.add(instance) // 3. add to queue

  return instance
}
