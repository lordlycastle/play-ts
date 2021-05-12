import * as lodash from 'lodash';
import * as t from 'io-ts';

export const spellOutOptionalString = (x: string | undefined): string =>
  x === undefined ? 'undefined' : x;

/*
 * Tagged string template function to conveniently interpolate various data into error messages without
 * worrying about escaping or type warnings.
 */
export const errStr = (
  strings: TemplateStringsArray,
  ...interpolations: Array<unknown>
): string => {
  const mapInterpolation = (x: unknown): string => {
    if (x instanceof Error) {
      return `${x.name} ${x.message}`;
    } else if (x === null) {
      return 'null';
    } else if (x === undefined) {
      return 'undefined';
    } else if (typeof x === 'string' || typeof x === 'object') {
      return JSON.stringify(x);
    } else if (typeof x === 'number') {
      return x.toString();
    } else {
      return 'strange type';
    }
  };
  let result = '';
  for (let i = 0; i < interpolations.length; i++) {
    result += strings[i];
    result += mapInterpolation(interpolations[i]);
  }
  result += strings[strings.length - 1];
  return result;
};

export function hasUndefinedValues(object: Record<string, unknown> | unknown[]): boolean {
  return Object.entries(object).reduce(
    (acc, [_, value]) =>
      acc ||
      (t.union([t.record(t.string, t.unknown), t.array(t.unknown)]).is(value)
        ? hasUndefinedValues(value)
        : value === undefined),
    false as boolean
  );
}

export function convertToValidJson(object: Record<string, unknown>): unknown {
  console.error(
    `Object${JSON.stringify(object, (_: string, val: unknown) =>
      val === undefined ? 'undefined' : val
    )} contains undefined values - converting to valid JSON.`
  );
  return JSON.parse(JSON.stringify(object));
}

/**
 * shuffledArrayCopy - returns a copy of the input array, but in random order.
 * Uses Fisher-Yates shuffle.
 * **NOTE: Does a pseudo-random shuffle. Do not use when randomness is
 *       relevant for security.**
 * @param array: array of numbers to shuffle
 */
export function shuffledArrayCopy(array: number[]): number[] {
  return lodash.shuffle(lodash.cloneDeep(array));
}
