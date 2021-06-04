import { hasOwnProperty as hasKey } from 'fp-ts/lib/Record';
import { record, string, unknown } from 'io-ts';

export const hasProperty = <T>(o: T, prop: string): prop is keyof T & string =>
  record(string, unknown).is(o) && hasKey(prop, o);
