import { fold, left } from 'fp-ts/lib/Either';
import { pipe } from 'fp-ts/lib/pipeable';
import { Type } from 'io-ts';
import { PathReporter } from 'io-ts/lib/PathReporter';

export const parseOrThrow = <A, O, I>(type: Type<A, O, I>, input: I): A => {
  return pipe(
    type.decode(input),
    fold(
      errors => {
        throw new Error(JSON.stringify(PathReporter.report(left(errors)), null, 4));
      },
      config => config
    )
  );
};
