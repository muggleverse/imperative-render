export const inactivatedUntilPromise = (inactivatedUntilPromise, setActive) => {
  setActive(false)

  if (typeof inactivatedUntilPromise === 'function') inactivatedUntilPromise = inactivatedUntilPromise()
  return inactivatedUntilPromise.finally(() => setActive(true))
}

export type WaitUntil<D> = (apromise: (() => PromiseLike<D>) | PromiseLike<D>) => PromiseLike<D>
