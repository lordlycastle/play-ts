import { expect } from '../expectations.spec';
import { isLeft, isRight } from 'fp-ts/lib/Either';
import { BasicEmailRegExp, DayDateCodec, nowDayDate, StringMatchingRegExp } from './strings';
import { validateWithDecoder } from '../validation/validateWithDecoder';

describe('StringMatchingRegExp', () => {
  const testRegExp = /^h.*/;
  const regExpCodec = StringMatchingRegExp(testRegExp);
  it('should reject non-strings', () => {
    expect(isLeft(regExpCodec.decode(1))).to.eq(true);
  });
  it('should test with provided RegExp', () => {
    expect(isLeft(regExpCodec.decode('world'))).to.eq(true);
    const ok = regExpCodec.decode('hello');
    if (!isRight(ok)) {
      return expect.fail('Validation should have succeeded');
    }
    return expect(ok.right).to.eq('hello');
  });
});

describe('BasicEmailRegExp', () => {
  const okTestSpec = [
    'a@elli.eco',
    'test.user@ext.elli.eco',
    'test-user@ext.elli.eco',
    'test_123@gmail.com',
    'test@test123.com',
  ];
  const notOkTestSpec = ['a@elli.eco;b@elli.eco', 'a b@elli.eco', 'noatsign'];

  okTestSpec.forEach(str => {
    it(`${str} is a valid email`, () => {
      expect(validateWithDecoder(BasicEmailRegExp)(str).successOrThrow()).to.eq(str);
    });
  });

  notOkTestSpec.forEach(str => {
    it(`${str} is not a valid email`, () => {
      expect(validateWithDecoder(BasicEmailRegExp)(str).isFail()).to.eq(true);
    });
  });
});

describe('DayDate', () => {
  it('accepts valid input', () => {
    expect(DayDateCodec.is('2021-02-24')).to.be.true;
    expect(DayDateCodec.is(nowDayDate())).to.be.true;
  });
  it('rejects invalid input', () => {
    expect(DayDateCodec.is('2021-02-24T12:37:14.019Z')).to.be.false;
    expect(DayDateCodec.is('2021-02-24T')).to.be.false;
    expect(DayDateCodec.is('2021-02-2')).to.be.false;
  });
});
