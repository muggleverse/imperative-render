import { createDeferred, createManager } from './utils'

/**
 * manager for ImperativeRender, use it to clear all active components
 *
 * @example manager.clear() // clear all
 */
export const manager = createManager()

export type ImperativeRenderOption = {
  /** where to append wrapper dom */
  container?: HTMLElement

  /** manager for ImperativeRender, use it to clear all active components */
  manager?: ReturnType<typeof createManager>
}

const DefaultOption = {
  container: document.body,
  manager,
}

export function implement<DeferredValue extends any>(option?: ImperativeRenderOption) {
  const opt = { ...DefaultOption, ...option }

  const { promise, resolve, reject } = createDeferred<DeferredValue>()

  const impl = {
    promise,
    resolve,
    reject,
    active: true,
    index: opt.manager.nextIndex(),

    // destroy: foo,
    // create: foo,
    // setActive: foo,
    // waitUntil: foo,
  }

  return { impl, opt }
}
