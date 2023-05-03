type RestFunc<R> = (...args) => R
export function compose<R>(f1: RestFunc<R>, ...funcs: RestFunc<R>[]): RestFunc<R> {
  if (funcs.length === 0) {
    return f1
  }

  return funcs.reduce((acc, cur) => {
    return (...args) => acc(cur(...args))
  }, f1)
}
