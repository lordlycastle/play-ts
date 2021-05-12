import {
  chain,
  fold,
  Some as FptsSome,
  isNone,
  isSome,
  mapNullable,
  none,
  Option,
  some,
} from 'fp-ts/lib/Option';
import { AsyncMaybe } from '../asynchelpers/async.maybe';
import { Fail, Success, Validation } from './validation';

/**
 * Adapter providing the functionality of monets Maybe by means of fp-ts.
 */

export type Maybe<T> = SomeMaybe<T> | NoneMaybe<T>;

export const Some = <T>(arg: T): Maybe<T> => new SomeMaybe(arg);

export const None = <T>(): Maybe<T> => new NoneMaybe<T>();

export const fromOption = <T>(arg: Option<T>): Maybe<T> => {
  return fold(
    () => None<T>(),
    (x: T) => Some(x)
  )(arg);
};

export const fromNull = <T>(arg: T | null | undefined): Maybe<T> =>
  arg === null || arg === undefined ? None() : Some(arg);

export const fromUndefined = <T>(arg: T | undefined): Maybe<T> =>
  arg === undefined ? None() : Some(arg);

export const fromFalsy = <T>(arg: T | null | undefined): Maybe<T> => (arg ? Some(arg) : None());

abstract class AbstractMaybe<T> {
  protected constructor(readonly wrapped: Option<T>) {}

  public toOption(): Option<T> {
    return this.wrapped;
  }

  public isSome(): this is SomeMaybe<T> {
    return isSome(this.wrapped);
  }

  public isNone(): this is NoneMaybe<T> {
    return isNone(this.wrapped);
  }

  public orNull(): T | null {
    return this.isSome() ? this.some() : null;
  }

  public orJust(x: T): T {
    return this.isSome() ? this.some() : x;
  }

  public orUndefined(): T | undefined {
    return this.isSome() ? this.some() : undefined;
  }

  public orElseRun(callback: () => void): void {
    if (this.isNone()) {
      callback();
    }
  }

  protected abstract orElseThrow(err: Error | string): T;

  public toValidation<E>(e: E): Validation<E, T> {
    return this.isSome() ? Success(this.some()) : Fail(e);
  }

  public filter(predicate: (arg: T) => boolean): Maybe<T> {
    return this.isSome() ? (predicate(this.some()) ? Some(this.some()) : None()) : None();
  }

  public forEach(callback: (arg: T) => void): void {
    if (this.isSome()) {
      callback(this.some());
    }
  }

  // also works slightly different from the monet version, accept null/undefined maps on purpose here
  public map<S>(f: (arg: T) => S | null | undefined): Maybe<S> {
    return fromOption(mapNullable(f)(this.wrapped));
  }

  public flatMap<S>(f: (arg: T) => Maybe<S>): Maybe<S> {
    return fromOption(chain((arg: T) => f(arg).toOption())(this.wrapped));
  }

  public flatMapAsync<S>(this: Maybe<T>, f: (arg: T) => AsyncMaybe<S>): AsyncMaybe<S> {
    return AsyncMaybe.from(this).flatMap(f);
  }

  public cata<X>(fNone: () => X, fSome: (arg: T) => X): X {
    return this.isSome() ? fSome(this.some()) : fNone();
  }
}

export class SomeMaybe<T> extends AbstractMaybe<T> {
  constructor(arg: T) {
    super(some(arg));
  }

  public some(): T {
    return (this.wrapped as FptsSome<T>).value;
  }

  public orElseThrow(): T {
    return this.some();
  }
}

export class NoneMaybe<T> extends AbstractMaybe<T> {
  constructor() {
    super(none);
  }

  public orElseThrow(err: Error | string): T {
    if (typeof err === 'string') {
      this.throw(new Error(err));
    }
    this.throw(err);
  }

  // do not inline - keeps typescript from identifying NoneMaybe with AbstractMaybe type
  protected throw(err: Error): never {
    throw err;
  }
}
