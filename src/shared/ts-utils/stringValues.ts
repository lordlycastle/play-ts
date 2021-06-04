export type ReplaceValuesWithString<T> = T extends unknown[] ? string[] : string;

export type StringValues<T extends Record<string, unknown>> = {
  [Key in keyof T]: ReplaceValuesWithString<T[Key]>;
};
