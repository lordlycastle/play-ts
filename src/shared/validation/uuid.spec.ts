import { UUID } from 'io-ts-types';
import { parseOrThrow } from './parseOrThrow';

// generates a recognizable uuid reproducibly from a string for tests
export const testUuid = (
  kind: 'cs' | 'loc' | 'con' | 'ratedCpoPriceVersion' | 'cpoPriceVersion',
  // tslint:disable-next-line:max-union-size
  i: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9
): UUID => {
  const kindToNumberMapping = {
    cs: 1, // charging spot
    loc: 2, // location
    con: 3, // connector
    ratedCpoPriceVersion: 4,
    cpoPriceVersion: 5,
  };

  return parseOrThrow(
    UUID,
    `${kindToNumberMapping[kind]}0000000-0000-0000-0000-00000000000${i.toFixed(0)}`
  );
};

export const cs1Id = testUuid('cs', 1);
export const cs2Id = testUuid('cs', 2);
export const cs3Id = testUuid('cs', 3);

export const loc1Id = testUuid('loc', 1);
export const loc2Id = testUuid('loc', 2);
export const loc3Id = testUuid('loc', 3);
export const loc4Id = testUuid('loc', 4);

export const con1Id = testUuid('con', 1);
export const con2Id = testUuid('con', 2);
export const con3Id = testUuid('con', 3);
