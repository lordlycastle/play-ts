export function assertIsError(err: unknown): asserts err is Error {
  if (!(typeof err === 'object' && err instanceof Error)) {
    throw err;
  }
}
