const DefaultClearCallback = (instance) => instance.destroy()

export function createManager() {
  const set = new Set()
  let index = 1
  return {
    add(value) {
      set.add(value)
    },
    delete(value) {
      set.delete(value)
      if (set.size === 0) index = 1
    },
    clear(callback = DefaultClearCallback) {
      new Set(set).forEach(callback)

      set.clear()
      index = 1
    },
    nextIndex() {
      return index++
    },
  }
}
