export function attachCreateAndDestoryToController(controller, opt, mountUnmount: ($el: HTMLDivElement) => Function) {
  let $el: HTMLDivElement | null
  let unmount: Function

  function destroy() {
    /**
     * setTimeout is used to avoid the following warning:
     * Warning: Attempted to synchronously unmount a root while React was already rendering. React cannot finish unmounting the root until the current render has completed, which may lead to a race condition.
     */
    setTimeout(() => {
      unmount()

      opt.container.removeChild($el)
      opt.manager.delete(controller)

      $el = null
    })
  }

  function create() {
    $el = document.createElement('div')

    opt.container.appendChild($el)
    opt.manager.add(controller)

    unmount = mountUnmount($el)

    if (typeof unmount !== 'function') {
      throw TypeError('mountUnmount should return a function')
    }
  }

  Object.assign(controller, { destroy, create })

  return controller
}
