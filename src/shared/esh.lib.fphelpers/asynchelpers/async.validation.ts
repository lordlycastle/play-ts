import { Fail, Success, Validation } from '../fptswrappers/validation';
import { AsyncMaybe } from './async.maybe';
import { Awaitable } from './awaitable';

export class AsyncValidation<T, E = Error> extends Awaitable<Validation<E, T>> {
  private constructor(val: Validation<E, T> | Promise<Validation<E, T>>) {
    super(val);
  }

  public static from<T, E = Error>(
    val: Validation<E, T> | Promise<Validation<E, T>>
  ): AsyncValidation<T, E> {
    return new AsyncValidation(val);
  }

  public static fromTry<T, E = unknown>(callback: () => Promise<T>): AsyncValidation<T, E> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return new AsyncValidation(
      callback().then(
        res => Success(res),
        rej => Fail(rej)
      )
    );
  }

  get value(): Promise<Validation<E, T>> {
    return this.wrapped;
  }

  public flatMap<S>(
    f: (arg: T) => Promise<Validation<E, S>> | AsyncValidation<S, E>
  ): AsyncValidation<S, E> {
    const fConsolidated: (x: T) => Promise<Validation<E, S>> = x => {
      const res = f(x);
      return res instanceof AsyncValidation ? res.value : res;
    };
    return new AsyncValidation<S, E>(
      this.wrapped.then(val =>
        val.isSuccess() ? fConsolidated(val.success()) : Promise.resolve(Fail(val.fail()))
      )
    );
  }

  public flatMapSync<S>(f: (arg: T) => Validation<E, S>): AsyncValidation<S, E> {
    return new AsyncValidation<S, E>(this.wrapped.then(val => val.flatMap(f)));
  }

  public map<S>(f: (arg: T) => S): AsyncValidation<S, E> {
    return new AsyncValidation<S, E>(this.wrapped.then(val => val.map(f)));
  }

  public bimap<S, F>(f: (arg: E) => F, g: (arg: T) => S): AsyncValidation<S, F> {
    return new AsyncValidation<S, F>(this.wrapped.then(val => val.bimap(f, g)));
  }

  public failMap<F>(f: (arg: E) => F): AsyncValidation<T, F> {
    return new AsyncValidation<T, F>(this.wrapped.then(val => val.failMap(f)));
  }

  public cata<X>(f: (arg: E) => X, g: (arg: T) => X): Promise<X> {
    return this.wrapped.then(val => val.cata(f, g));
  }

  public successThen<S>(
    this: AsyncValidation<T, never>,
    f: (arg: T) => S | PromiseLike<S>
  ): PromiseLike<S> {
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    return this.wrapped.then(val => f((val ).success()));
  }

  public logError(
    this: AsyncValidation<T>,
    logger: (msg: string) => void,
    customPrefix?: string
  ): AsyncValidation<T>;
  public logError(
    this: AsyncValidation<T, string>,
    logger: (msg: string) => void,
    customPrefix?: string
  ): AsyncValidation<T, string>;
  public logError(
    this: AsyncValidation<T, Error | string>,
    logger: (msg: string) => void,
    customPrefix?: string
  ): AsyncValidation<T, Error | string> {
    return new AsyncValidation<T, Error | string>(
      this.wrapped.then(val => val.logError(logger, customPrefix))
    );
  }

  public runForSuccess(callback: (arg: T) => void | PromiseLike<void>): PromiseLike<void> {
    return this.then(val => {
      if (val.isSuccess()) {
        return callback(val.success());
      }
    });
  }

  public successOrThrow(this: AsyncValidation<T, string | string[] | Error>): Promise<T> {
    return this.wrapped.then(val => val.successOrThrow());
  }

  public toAsyncMaybe(): AsyncMaybe<T> {
    return AsyncMaybe.from(this.value.then(val => val.toMaybe()));
  }
}
