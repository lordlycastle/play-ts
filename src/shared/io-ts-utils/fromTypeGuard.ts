import * as t from 'io-ts';
import { identity } from 'ramda';

type TypeGuard<T> = (u: unknown) => u is T;

export const FromTypeGuard = <T>(guard: TypeGuard<T>): t.Type<T> =>
  new t.Type<T>(
    guard.name,
    guard,
    (u: unknown, c: t.Context) => (guard(u) ? t.success(u) : t.failure(u, c)),
    identity
  );
