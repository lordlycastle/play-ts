export type FixedDeepPartial<T extends Record<string, unknown>> = {
  [K in keyof T]?: unknown extends T[K]
    ? unknown
    : T[K] extends Record<string, unknown>
    ? FixedDeepPartial<T[K]>
    : T[K];
};
