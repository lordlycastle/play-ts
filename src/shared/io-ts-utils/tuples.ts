import * as t from 'io-ts';
import { pipe } from 'fp-ts/lib/pipeable';
import { chain } from 'fp-ts/lib/Either';

// add overloads as needed
export const ExactTuple = <T>(cs: [t.Type<T>]): t.Type<[T]> =>
  new t.Type(
    'ExactTuple',
    (u: unknown): u is [T] => t.tuple(cs).is(u) && u.length === cs.length,
    (u, c) =>
      pipe(
        t.array(t.unknown).validate(u, c),
        chain(arr => (arr.length === cs.length ? t.tuple(cs).validate(u, c) : t.failure(u, c)))
      ),
    tuple => tuple
  );
