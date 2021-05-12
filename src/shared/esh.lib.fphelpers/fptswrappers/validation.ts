import {
  ap,
  bimap,
  chain,
  Either,
  fold,
  getValidation,
  isLeft,
  isRight,
  Left,
  left,
  map,
  mapLeft,
  Right,
  right,
} from 'fp-ts/lib/Either';
import { AsyncValidation } from '../asynchelpers/async.validation';
import { fromUndefined, Maybe, None } from './maybe';
import { arraySemigroup, stringSemigroup } from '../utility/semigroups';

/**
 * Adapter providing the functionality of monets Validation by means of fp-ts.
 */

export type IValidationAcc = () => IValidationAcc;

export type Validation<E, T> = SuccessValidation<E, T> | FailValidation<E, T>;

export const Success = <E, T>(arg: T): Validation<E, T> => new SuccessValidation(arg);

export const Fail = <E, T>(arg: E): Validation<E, T> => new FailValidation(arg);

export const fromEither = <E, T>(arg: Either<E, T>): Validation<E, T> =>
  isRight(arg) ? new SuccessValidation(arg.right) : new FailValidation(arg.left);

abstract class AbstractValidation<E, T> {
  protected constructor(readonly wrapped: Either<E, T>) {}

  public toEither(): Either<E, T> {
    return this.wrapped;
  }

  public toMaybe(): Maybe<T> {
    return this.isSuccess() ? fromUndefined(this.success()) : None();
  }

  public isSuccess(): this is SuccessValidation<E, T> {
    return isRight(this.wrapped);
  }

  public isFail(): this is FailValidation<E, T> {
    return isLeft(this.wrapped);
  }

  public forEach(callback: (arg: T) => void): void {
    if (this.isSuccess()) {
      callback(this.success());
    }
  }

  public forEachFail(callback: (arg: E) => void): void {
    if (this.isFail()) {
      callback(this.fail());
    }
  }

  public map<S>(f: (arg: T) => S): Validation<E, S> {
    return fromEither(map(f)(this.wrapped));
  }

  public failMap<F>(f: (arg: E) => F): Validation<F, T> {
    return fromEither(mapLeft(f)(this.wrapped));
  }

  public flatMap<S>(f: (arg: T) => Validation<E, S>): Validation<E, S> {
    return fromEither(chain((arg: T) => f(arg).toEither())(this.wrapped));
  }

  public flatMapAsync<S>(
    this: Validation<E, T>,
    f: (arg: T) => AsyncValidation<S, E> | Promise<Validation<E, S>>
  ): AsyncValidation<S, E> {
    // @ts-ignore
    return AsyncValidation.from(this).flatMap(f);
  }

  public bimap<F, S>(f: (arg: E) => F, g: (arg: T) => S): Validation<F, S> {
    return fromEither(bimap(f, g)(this.wrapped));
  }

  public cata<X>(f: (arg: E) => X, g: (arg: T) => X): X {
    return fold(f, g)(this.wrapped);
  }

  public ap<S>(f: Validation<E, (arg: T) => S>): Validation<E, S> {
    return fromEither(ap(this.wrapped)(f.toEither()));
  }

  public apAccStrings<S>(
    this: Validation<string, T>,
    f: Validation<string, (arg: T) => S>,
    separator = ', '
  ): Validation<string, S> {
    return fromEither(getValidation(stringSemigroup(separator)).ap(f.toEither(), this.wrapped));
  }

  public apAccArray<F, S>(
    this: Validation<F[], T>,
    f: Validation<F[], (arg: T) => S>
  ): Validation<F[], S> {
    return fromEither(getValidation<F[]>(arraySemigroup).ap(f.toEither(), this.wrapped));
  }

  public acc(): Validation<E, IValidationAcc> {
    const x: IValidationAcc = (): IValidationAcc => x;
    return this.map(() => x);
  }

  // convenience method, no counterpart in monet
  public logError(
    this: Validation<Error | string, T>,
    logger: (msg: string) => void,
    customPrefix?: string
  ): Validation<Error | string, T> {
    if (this.isFail()) {
      const failure = this.fail();
      const baseMessage = `${typeof failure === 'string' ? failure : failure.message}`;
      logger(customPrefix ? `${customPrefix}: ${baseMessage}` : baseMessage);
    }
    return this;
  }

  abstract successOrThrow(this: Validation<string | string[] | Error, T>): T;
}
export class SuccessValidation<E, T> extends AbstractValidation<E, T> {
  constructor(arg: T) {
    super(right(arg));
  }

  public success(): T {
    return (this.wrapped as Right<T>).right;
  }

  public successOrThrow(): T {
    return this.success();
  }
}

export class FailValidation<E, T> extends AbstractValidation<E, T> {
  constructor(arg: E) {
    super(left(arg));
  }

  public fail(): E {
    return (this.wrapped as Left<E>).left;
  }

  successOrThrow(): T {
    const fail = this.fail();
    throw typeof fail === 'string'
      ? new Error(fail)
      : isStringArray(fail)
      ? new Error(fail.join(', '))
      : fail;
  }
}

const isStringArray = (arr: unknown): arr is string[] =>
  Array.isArray(arr) && arr.filter(s => typeof s !== 'string').length === 0;
