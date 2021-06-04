export type ToQueryParams<
  // eslint-disable-next-line @typescript-eslint/ban-types
  T extends object
> = {
  [Key in keyof T]: NonNullable<T[Key]> extends unknown[] ? string[] | string : string;
};
