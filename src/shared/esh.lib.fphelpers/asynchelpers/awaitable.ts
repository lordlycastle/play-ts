export class Awaitable<T> implements PromiseLike<T> {
  protected readonly wrapped: Promise<T>;

  constructor(val: T | Promise<T>) {
    this.wrapped = val instanceof Promise ? val : Promise.resolve(val);
  }

  public then<TResult1 = T, TResult2 = never>(
    onFulfilled?: (value: T) => TResult1 | PromiseLike<TResult1>,
    onRejected?: (reason: Error | string) => TResult2 | PromiseLike<TResult2>
  ): PromiseLike<TResult1 | TResult2> {
    return this.wrapped.then(onFulfilled, onRejected);
  }
}
