import * as t from 'io-ts';
import { isRight } from 'fp-ts/lib/Either';

export const ArrayOrSingleValue = <T, O = T>(elementCodec: t.Type<T, O>): t.Type<T[], O[]> =>
  new t.Type(
    'ArrayOrSingleElement',
    t.array(elementCodec).is,
    (u, c) => {
      const asSingleElement = elementCodec.decode(u);
      return isRight(asSingleElement)
        ? t.success([asSingleElement.right])
        : t.array(elementCodec).validate(u, c);
    },
    t.array(elementCodec).encode
  );
