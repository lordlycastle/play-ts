import { readonlyArray } from 'fp-ts/lib/ReadonlyArray';
import { Either, either, getValidation } from 'fp-ts/lib/Either';
import { arraySemigroup, stringSemigroup } from '../utility/semigroups';
import { Pair } from '../utility/pair';
import { fromEither, Validation } from './validation';
import { Option, option } from 'fp-ts/lib/Option';
import { fromOption, Maybe } from './maybe';
import { AsyncValidation } from '../asynchelpers/async.validation';
import { AsyncMaybe } from '../asynchelpers/async.maybe';

export class ReadonlyList<T> {
  constructor(private readonly wrapped: readonly T[]) {}

  public toArray(): readonly T[] {
    return this.wrapped;
  }

  public map<S>(f: (arg: T) => S): ReadonlyList<S> {
    return new ReadonlyList<S>(this.wrapped.map(f));
  }

  public flatMap<S>(f: (arg: T) => ReadonlyList<S>): ReadonlyList<S> {
    return new ReadonlyList<S>(
      this.wrapped.map(t => f(t).toArray()).reduce((acc, cur) => acc.concat(cur), [])
    );
  }

  public reduce<U = T>(a: (acc: U, cur: T) => U, initialValue: U): U {
    return this.wrapped.reduce(a, initialValue);
  }

  // traverse and sequence validation
  /**
   * traverse the array applying f to every every element
   * if at least one of the validations returned by f is a Fail, the overall result will be
   * a fail with this Fails argument. If all validations returned are Successes, the overall result
   * will be a Success holding the array of the successful outputs
   * @param f: validate an array element
   */
  public traverseToValidation<E, S = T>(
    f: (arg: T) => Validation<E, S>
  ): Validation<E, ReadonlyList<S>> {
    return fromEither(
      readonlyArray.traverse(either)(this.wrapped, (x: T): Either<E, S> => f(x).toEither())
    ).map(fromArray);
  }

  /**
   * Same as "traverseToValidation", only now failures (that must be strings) will be accumulated
   * using the provided separator, or ", " by default.
   * @param f: validate an array element
   * @param separator
   */
  public traverseToValidationAccFailStrings<S = T>(
    f: (arg: T) => Validation<string, S>,
    separator = ', '
  ): Validation<string, ReadonlyList<S>> {
    return fromEither(
      readonlyArray.traverse(getValidation(stringSemigroup(separator)))(
        this.wrapped,
        (x: T): Either<string, S> => f(x).toEither()
      )
    ).map(fromArray);
  }

  /**
   * Same as "traverseToValidation", only now failures (that must be of an array type) will be
   * accumulated.
   * @param f: validate an array element
   */
  public traverseToValidationAccFailArrays<E, S = T>(
    f: (arg: T) => Validation<E[], S>
  ): Validation<E[], ReadonlyList<S>> {
    return fromEither(
      readonlyArray.traverse(getValidation<E[]>(arraySemigroup))(
        this.wrapped,
        (x: T): Either<E[], S> => f(x).toEither()
      )
    ).map(fromArray);
  }

  /**
   * Traverse the array and validate every element using f. The Fails will be collected in the
   * left side of the Pair, the Successes in the right side.
   * @param f: validate an array element
   */
  public validateAndAccToPair<E, S = T>(f: (arg: T) => Validation<E, S>): Pair<E[], S[]> {
    return this.wrapped.reduce((acc: Pair<E[], S[]>, cur: T): Pair<E[], S[]> => {
      const curValidated: Validation<E, S> = f(cur);
      return curValidated.isSuccess()
        ? acc.map<S[]>(rights => [...rights, curValidated.success()])
        : acc.mapLeft<E[]>(lefts => [...lefts, curValidated.fail()]);
    }, new Pair<E[], S[]>([], []));
  }

  /**
   * Turn an array of Validations in a Validation of an array applying the following logic:
   * - if one of the validations is a Fail, the result validation will be a fail with this error
   * - if all of the validations are Successes, the result validation will hold the array of success
   * values
   */
  public sequenceValidation<E, S>(
    this: ReadonlyList<Validation<E, S>>
  ): Validation<E, ReadonlyList<S>> {
    return fromEither(readonlyArray.sequence(either)(this.wrapped.map(val => val.toEither()))).map(
      fromArray
    );
  }

  /**
   * Same as "sequenceValidation", except that now, Fail values (that must be strings) are
   * accumulated using the provided separator (or ", " by default).
   * @param separator
   */
  public sequenceValidationAccFailStrings<S>(
    this: ReadonlyList<Validation<string, S>>,
    separator = ', '
  ): Validation<string, ReadonlyList<S>> {
    return fromEither(
      readonlyArray.sequence(getValidation(stringSemigroup(separator)))(
        this.wrapped.map(val => val.toEither())
      )
    ).map(fromArray);
  }

  /**
   * Same as "sequenceValidation", except that now, Fail values (that must be of an array type) are
   * accumulated.
   */
  public sequenceValidationAccFailArrays<E, S>(
    this: ReadonlyList<Validation<E[], S>>
  ): Validation<E[], ReadonlyList<S>> {
    return fromEither(
      readonlyArray.sequence(getValidation<E[]>(arraySemigroup))(
        this.wrapped.map(val => val.toEither())
      )
    ).map(fromArray);
  }

  /**
   * For an array of Validations, collect fail values in the left, and success values in the
   * right side of the result Pair.
   */
  public sequenceToPair<E, S>(this: ReadonlyList<Validation<E, S>>): Pair<E[], S[]> {
    return this.wrapped.reduce(
      (acc: Pair<E[], S[]>, cur: Validation<E, S>): Pair<E[], S[]> =>
        cur.isSuccess()
          ? acc.map(rights => [...rights, cur.success()])
          : acc.mapLeft(lefts => [...lefts, cur.fail()]),
      new Pair<E[], S[]>([], [])
    );
  }

  // traverse and sequence Maybe
  /**
   * traverse the array applying f to every every element
   * if at least one of the resulting Maybes returned by f is a None, the overall result will be
   * a None. If all maybes returned are Somes, the overall result
   * will be a Some holding the array of the successful outputs.
   * @param f: Map an array element to a Maybe
   */
  public traverseToMaybe<S = T>(f: (arg: T) => Maybe<S>): Maybe<ReadonlyList<S>> {
    return fromOption(
      readonlyArray.traverse(option)(this.wrapped, (x: T): Option<S> => f(x).toOption())
    ).map(fromArray);
  }

  /**
   * Turn an array of Maybes in a Maybe of an array applying the following logic:
   * - if one of the maybes is a None, the result Maybe will be a None
   * - if all of the maybes are Somes, the result Maybe will hold the array of values
   */
  public sequenceMaybe<S = T>(this: ReadonlyList<Maybe<S>>): Maybe<ReadonlyList<S>> {
    return fromOption(readonlyArray.sequence(option)(this.wrapped.map(val => val.toOption()))).map(
      fromArray
    );
  }

  // traverse and sequence AsyncValidation
  /**
   * traverse the array applying f to every element
   * if at least one of the AsyncValidations returned by f is a Fail, the overall result will be
   * a Fail with this Fails argument. If all validations returned are Successes, the overall result
   * will be a Success holding the array of the successful outputs
   * @param f: asynchronously validate an array element
   */
  public traverseToAsyncValidation<E, S = T>(
    f: (arg: T) => AsyncValidation<S, E>
  ): AsyncValidation<ReadonlyList<S>, E> {
    return AsyncValidation.from(
      Promise.all(this.wrapped.map(f)).then(vals => fromArray(vals).sequenceValidation())
    );
  }

  /**
   * Same as "traverseToAsyncValidation", only now failures (that must be strings) will be accumulated
   * using the provided separator, or ", " by default.
   * @param f: asynchronously validate an array element
   * @param separator
   */
  public traverseToAsyncValidationAccFailStrings<S = T>(
    f: (arg: T) => AsyncValidation<S, string>,
    separator = ', '
  ): AsyncValidation<ReadonlyList<S>, string> {
    return AsyncValidation.from(
      Promise.all(this.wrapped.map(f)).then(vals =>
        fromArray(vals).sequenceValidationAccFailStrings(separator)
      )
    );
  }

  /**
   * Same as "traverseToAsyncValidation", only now failures (that must be of an array type) will be
   * accumulated.
   * @param f: asynchronously validate an array element
   */
  public traverseToAsyncValidationAccFailArrays<E, S = T>(
    f: (arg: T) => AsyncValidation<S, E[]>
  ): AsyncValidation<ReadonlyList<S>, E[]> {
    return AsyncValidation.from(
      Promise.all(this.wrapped.map(f)).then(vals =>
        fromArray(vals).sequenceValidationAccFailArrays()
      )
    );
  }

  /**
   * Traverse the array and asynchronously validate every element using f. The Fails will be
   * collected in the left side of the Pair, the Successes in the right side.
   * @param f: asynchronously validate an array element
   */
  public validateAsyncAndAccToPair<E, S = T>(
    f: (arg: T) => AsyncValidation<S, E>
  ): Promise<Pair<E[], S[]>> {
    return Promise.all(this.wrapped.map(f)).then(vals => fromArray(vals).sequenceToPair());
  }

  /**
   * Turn an array of AsyncValidations in an AsyncValidation of an array applying the
   * following logic:
   * - if one of the validations is a Fail, the result validation will be a fail with this Fails
   * argument
   * - if all of the validations are Successes, the result validation will hold the array of
   * success values
   */
  public sequenceAsyncValidation<E, S>(
    this: ReadonlyList<AsyncValidation<S, E>>
  ): AsyncValidation<ReadonlyList<S>, E> {
    return AsyncValidation.from(
      Promise.all(this.wrapped).then((vals: readonly Validation<E, S>[]) =>
        fromArray(vals).sequenceValidation()
      )
    );
  }

  /**
   * Same as "sequenceAsyncValidation", except that now, Fail values (that must be strings) are
   * accumulated using the provided separator (or ", " by default).
   * @param separator
   */
  public sequenceAsyncValidationAccFailStrings<S>(
    this: ReadonlyList<AsyncValidation<S, string>>,
    separator = ', '
  ): AsyncValidation<ReadonlyList<S>, string> {
    return AsyncValidation.from(
      Promise.all(this.wrapped).then((vals: readonly Validation<string, S>[]) =>
        fromArray(vals).sequenceValidationAccFailStrings(separator)
      )
    );
  }

  /**
   * Same as "sequenceAsyncValidation", except that now, Fail values (that must be of an array type)
   * are accumulated.
   */
  public sequenceAsyncValidationAccFailArrays<E, S>(
    this: ReadonlyList<AsyncValidation<S, E[]>>
  ): AsyncValidation<ReadonlyList<S>, E[]> {
    return AsyncValidation.from(
      Promise.all(this.wrapped).then((vals: readonly Validation<E[], S>[]) =>
        fromArray(vals).sequenceValidationAccFailArrays()
      )
    );
  }

  /**
   * For an array of AsyncValidations, collect fail values in the left, and success values in the
   * right side of the result Pair.
   */
  public sequenceAsyncValidationToPair<E, S>(
    this: ReadonlyList<AsyncValidation<S, E>>
  ): Promise<Pair<E[], S[]>> {
    return Promise.all(this.wrapped).then(vals => fromArray(vals).sequenceToPair());
  }

  /**
   * traverse the array applying f to every element
   * if at least one of the resulting AsyncMaybes returned by f is a None, the overall result will be
   * a None. If all maybes returned are Somes, the overall result
   * will be a Some holding the array of the successful outputs.
   * @param f: Asynchronously ap an array element to a Maybe
   */
  public traverseToAsyncMaybe<S = T>(f: (arg: T) => AsyncMaybe<S>): AsyncMaybe<ReadonlyList<S>> {
    return AsyncMaybe.from(
      Promise.all(this.wrapped.map(f)).then(ms => fromArray(ms).sequenceMaybe())
    );
  }

  /**
   * Turn an array of AsyncMaybes in a AsyncMaybe of an array applying the following logic:
   * - if one of the maybes is a None, the result Maybe will be a None
   * - if all of the maybes are Somes, the result Maybe will hold the array of values
   */
  public sequenceAsyncMaybe<S>(this: ReadonlyList<AsyncMaybe<S>>): AsyncMaybe<ReadonlyList<S>> {
    return AsyncMaybe.from(Promise.all(this.wrapped).then(ms => fromArray(ms).sequenceMaybe()));
  }
}

export const fromArray = <T>(arr: readonly T[]): ReadonlyList<T> => new ReadonlyList<T>(arr);
