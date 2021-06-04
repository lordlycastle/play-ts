export type MakeOptional<T, K extends keyof T> = {
  [R in K]?: T[R];
} &
  Omit<T, K>;
