import * as t from 'io-ts';
import { chain } from 'fp-ts/lib/Either';
import { pipe } from 'fp-ts/lib/pipeable';
import { errStr } from '../utils';
import { parseOrThrow } from '../validation/parseOrThrow';
import * as moment from 'moment';

export const StringMatchingRegExp = (regExp: RegExp): t.Type<string> =>
  new t.Type(
    'StringMatchingRegExp',
    (u: unknown): u is string => t.string.is(u) && regExp.test(u),
    (u, c) =>
      pipe(
        t.string.validate(u, c),
        chain(str =>
          regExp.test(str)
            ? t.success(str)
            : t.failure(str, c, errStr`Invalid input ${u}: Should match ${regExp.toString()}`)
        )
      ),
    x => x
  );

export const BasicEmailRegExp = StringMatchingRegExp(/^[\w_\-.]+@[\w_\-.]+[.][a-zA-Z]+$/);

// Does not take into account which months have 28, 29, 30 or 31 days
const validDateRegex = /^([12]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01]))$/;

// DayDate represents a date in the format YYYY-MM-DD
export const DayDateCodec = StringMatchingRegExp(validDateRegex);
export const nowDayDate = (): DayDate =>
  parseOrThrow(DayDateCodec, moment.utc(new Date()).toISOString().slice(0, 10));

export type DayDate = t.TypeOf<typeof DayDateCodec>;

export const momentToDayDate = (someMoment: moment.Moment): DayDate => {
  return parseOrThrow(DayDateCodec, someMoment.utc().toISOString().slice(0, 10));
};
