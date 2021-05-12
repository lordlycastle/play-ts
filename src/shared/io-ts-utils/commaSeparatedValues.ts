import * as t from 'io-ts';
import { pipe } from 'fp-ts/lib/pipeable';
import { chain } from 'fp-ts/lib/Either';

export const CommaSeparatedValues = <T>(elCodec: t.Type<T, string>): t.Type<T[], string> =>
  new t.Type<T[], string>(
    `CommaSeparated${elCodec.name}Values`,
    t.array(elCodec).is,
    (u, c) =>
      pipe(
        t.string.validate(u, c),
        chain(str => t.array(elCodec).validate(str.split(','), c))
      ),
    ts => ts.map(elCodec.encode).join(',')
  );
