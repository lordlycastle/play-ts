import * as t from 'io-ts';
import { pipe } from 'fp-ts/lib/pipeable';
import { chain, fromOption } from 'fp-ts/lib/Either';
import { none, Option, some } from 'fp-ts/lib/Option';

type Value<T extends Record<string, unknown>> = T[keyof T];

const isEnumValue = <Enum extends Record<string, string>>(
  e: Enum,
  str: string
): str is Value<Enum> => Object.values(e).includes(str);

const getEnumValueFromString = <Enum extends Record<string, string>>(
  e: Enum,
  str: string
): Option<Value<Enum>> => {
  const key: keyof Enum | undefined = Object.entries(e).find(([_, value]) => value === str)?.[0];
  return key ? some(e[key]) : none;
};

export const getEnumFromStringCodec = <Enum extends Record<string, string>>(
  e: Enum
): t.Type<Value<Enum>, string> =>
  new t.Type(
    `EnumFromString: ${JSON.stringify(e)}`,
    (u: unknown): u is Value<Enum> => t.string.is(u) && isEnumValue(e, u),
    (u: unknown, c: t.Context) =>
      pipe(
        t.string.validate(u, c),
        chain<t.Errors, string, Value<Enum>>(str =>
          fromOption<t.Errors>(() => [
            { value: u, context: c, message: `Not a valid value for enum ${JSON.stringify(e)}` },
          ])(getEnumValueFromString<Enum>(e, str))
        )
      ),
    val => val.toString()
  );
