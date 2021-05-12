import { llog } from './shared/llog';

export type ExcludeMatchingProperties<T, V> = Pick<
  T,
  { readonly [K in keyof T]-?: T[K] extends V ? never : K }[keyof T]
>;

type A = 11 | 22 | 3 | 4;
type B = 1 | 2 | 4;
const x: ExcludeMatchingProperties<A, B> = 4;
llog(x);
