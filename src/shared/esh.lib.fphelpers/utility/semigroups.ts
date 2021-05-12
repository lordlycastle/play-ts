import { Semigroup } from 'fp-ts/lib/Semigroup';

export const stringSemigroup = (separator = ', '): Semigroup<string> => ({
  concat: (x: string, y: string): string => `${x}${separator}${y}`,
});

export const arraySemigroup = {
  concat: <E>(x: E[], y: E[]): E[] => x.concat(y),
};
