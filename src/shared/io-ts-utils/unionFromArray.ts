import * as t from 'io-ts';

function assertHasLengthGreaterThanOne<T>(arg: T[]): asserts arg is [T, T, ...T[]] {
  if (arg.length < 2) {
    throw new Error(`Expected array to have length at least 2, found length ${arg.length}`);
  }
}

export const UnionFromValues = <T extends string | boolean | number>(vals: T[]): t.Type<T> => {
  const literalCodecs = vals.map(val => t.literal(val));
  assertHasLengthGreaterThanOne(literalCodecs);
  return t.union(literalCodecs);
};
