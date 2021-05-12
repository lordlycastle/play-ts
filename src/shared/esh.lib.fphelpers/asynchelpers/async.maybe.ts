import { AsyncValidation } from './async.validation';
import { Awaitable } from './awaitable';
import { Maybe, None } from '../fptswrappers/maybe';
import { Fail, Success } from '../fptswrappers/validation';

export class AsyncMaybe<T> extends Awaitable<Maybe<T>> {
  private constructor(val: Maybe<T> | Promise<Maybe<T>>) {
    super(val);
  }

  public static from<T>(val: Maybe<T> | Promise<Maybe<T>>): AsyncMaybe<T> {
    return new AsyncMaybe(val);
  }

  get value(): Promise<Maybe<T>> {
    return this.wrapped;
  }

  public flatMap<S>(f: (arg: T) => Promise<Maybe<S>> | AsyncMaybe<S>): AsyncMaybe<S> {
    const fConsolidated: (x: T) => Promise<Maybe<S>> = x => {
      const res = f(x);
      return res instanceof AsyncMaybe ? res.value : res;
    };
    return new AsyncMaybe<S>(
      this.wrapped.then(val => (val.isSome() ? fConsolidated(val.some()) : Promise.resolve(None())))
    );
  }

  public flatMapSync<S>(f: (arg: T) => Maybe<S>): AsyncMaybe<S> {
    return AsyncMaybe.from(this.wrapped.then(m => m.flatMap(f)));
  }

  public map<S>(f: (arg: T) => S): AsyncMaybe<S> {
    return new AsyncMaybe<S>(this.wrapped.then(val => val.map(f)));
  }

  public orElseThrow(err: Error): Promise<T> {
    return this.wrapped.then(m => m.orElseThrow(err));
  }

  public toAsyncValidation<E>(e: E): AsyncValidation<T, E> {
    return AsyncValidation.from(this.value.then(m => (m.isSome() ? Success(m.some()) : Fail(e))));
  }
}
