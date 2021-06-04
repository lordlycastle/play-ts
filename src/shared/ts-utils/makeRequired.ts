import { assertIsError } from '../errors/isError';
import {
  Fail,
  Success,
  Validation,
} from '../esh.lib.fphelpers/fptswrappers/validation';

export type MakeRequired<T, K extends keyof T> = {
  [R in K]-?: NonNullable<T[R]>;
} &
  Omit<T, K>;

export function assertIsNonNull<T, K extends keyof T>(
  obj: T,
  key: K
): asserts obj is T & MakeRequired<T, K> {
  if (obj[key] === undefined || obj[key] === null) {
    throw new Error(`Expected object ${JSON.stringify(obj)} to have property ${key.toString()}`);
  }
}

export function validateIsNonNull<T, K extends keyof T>(
  obj: T,
  key: K
): Validation<Error, T & MakeRequired<T, K>>;
export function validateIsNonNull<T, K extends keyof T, E>(
  obj: T,
  key: K,
  customErrorConstructor: (str: string) => E
): Validation<E, T & MakeRequired<T, K>>;
export function validateIsNonNull<T, K extends keyof T, E>(
  obj: T,
  key: K,
  customErrorConstructor?: (str: string) => E
): Validation<E | Error, T & MakeRequired<T, K>> {
  try {
    assertIsNonNull(obj, key);
    return Success(obj);
  } catch (err) {
    assertIsError(err);
    const buildErr = (str: string): E | Error =>
      customErrorConstructor ? customErrorConstructor(str) : new Error(str);
    return Fail(buildErr(err.message));
  }
}
