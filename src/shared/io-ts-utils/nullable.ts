import * as t from 'io-ts';

export const Nullable = <T, S = T>(codec: t.Type<T, S>): t.Type<T | null, S | null> =>
  t.union([t.null, codec], `Nullable${codec.name}`);
