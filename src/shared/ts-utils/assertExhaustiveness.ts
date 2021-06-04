export const assertExhaustiveness =
  (createError?: (arg: unknown) => Error) =>
  (arg: never): never => {
    throw createError?.(arg) ?? new Error(`Invalid input: ${arg as string}`);
  };
