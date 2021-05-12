import * as t from 'io-ts';
import { NumberFromString } from 'io-ts-types/lib/NumberFromString';
import { IntFromString } from 'io-ts-types/lib/IntFromString';
import { pipe } from 'fp-ts/lib/pipeable';
import { chain, isRight } from 'fp-ts/lib/Either';

type PositiveBrand = {
  readonly Positive: unique symbol;
};

type StrictlyPositiveBrand = {
  readonly StrictlyPositive: unique symbol;
};

export const PositiveNumber = t.brand(
  t.number,
  (x: number): x is t.Branded<number, PositiveBrand> => x >= 0,
  'Positive'
);
export type PositiveNumber = t.TypeOf<typeof PositiveNumber>;

export const StrictlyPositiveNumber = t.brand(
  t.number,
  (x: number): x is t.Branded<number, StrictlyPositiveBrand> => x > 0,
  'StrictlyPositive'
);
export type StrictlyPositiveNumber = t.TypeOf<typeof StrictlyPositiveNumber>;

export const PositiveInteger = t.intersection([PositiveNumber, t.Int]);
export type PositiveInteger = t.TypeOf<typeof PositiveInteger>;

export const PositiveNumberFromString = NumberFromString.pipe(PositiveNumber);
export const PositiveIntegerFromString = t.intersection([PositiveNumberFromString, IntFromString]);

export const NumberWithPredicateFromString = (
  predicate: (n: number) => boolean
): t.Type<number, string> =>
  new t.Type(
    'NumberWithPredicate',
    (u: unknown): u is number => {
      const number = NumberFromString.decode(u);
      return isRight(number) && predicate(number.right);
    },
    (u, context) =>
      pipe(
        NumberFromString.validate(u, context),
        chain((n: number) => (predicate(n) ? t.success(n) : t.failure(u, context)))
      ),
    (n: number) => n.toString()
  );

export const StrictlyPositiveInteger = t.intersection([StrictlyPositiveNumber, t.Int]);
export type StrictlyPositiveInteger = t.TypeOf<typeof StrictlyPositiveInteger>;

export const StrictlyPositiveNumberFromString = NumberFromString.pipe(StrictlyPositiveNumber);
export const StrictlyPositiveIntegerFromString = t.intersection([
  StrictlyPositiveNumberFromString,
  IntFromString,
]);

const isNumberGreaterThan = (threshold: number) => (u: unknown): u is number =>
  typeof u === 'number' && u > threshold;

export const NumberGreaterThan = (n: number): t.Type<number, number> =>
  new t.Type<number, number, unknown>(
    'NumberGreaterThan',
    isNumberGreaterThan(n),
    (input, context) =>
      pipe(
        t.number.validate(input, context),
        chain(number =>
          isNumberGreaterThan(n)(number) ? t.success(number) : t.failure(input, context)
        )
      ),
    x => x
  );

export const NumberGreaterThanFromString = (n: number): t.Type<number, string> =>
  NumberFromString.pipe(NumberGreaterThan(n));

export const IsIntAndPositive = (n: number): boolean => n >= 0 && Number.isInteger(n);
