export type ReplaceWithOptional<
  T extends Record<string, unknown>,
  K extends keyof T,
  S extends Record<K, unknown>
> = {
  [Key in K]?: S[Key];
} &
  Omit<T, K>;

export type ReplaceWithMandatory<
  T extends Record<string, unknown>,
  K extends keyof T,
  S extends Record<K, unknown>
> = {
  [Key in K]: S[Key];
} &
  Omit<T, K>;
