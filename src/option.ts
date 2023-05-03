import { createManager } from './utils'

/**
 * manager for ImperativeRender, use it to clear all active components
 *
 * @example manager.clear() // clear all components
 */
export const manager = createManager()

export type ImperativeRenderOption = {
  /** where to append wrapper dom */
  container?: HTMLElement

  /** manager for ImperativeRender, use it to clear all active components */
  manager?: ReturnType<typeof createManager>
}

export const DefaultOption = {
  container: document.body,
  manager,
}
