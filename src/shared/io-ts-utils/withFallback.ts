import * as t from 'io-ts';

export const WithFallback = <T, S = T>(codec: t.Type<T, S>, fallback: T): t.Type<T, S> =>
  new t.Type<T, S>(
    `${codec.name}_WithFallback`,
    codec.is,
    (u, c) => (u === undefined ? t.success(fallback) : codec.validate(u, c)),
    codec.encode
  );
