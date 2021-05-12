export const getTruthy = <T>(x: T | undefined | null, message?: string): T => {
  if (x) {
    return x;
  }
  throw new Error(message ?? 'Value is not truthy');
};
