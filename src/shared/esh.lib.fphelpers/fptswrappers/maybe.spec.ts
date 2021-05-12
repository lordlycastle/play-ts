import { expect } from '../testing/expectations';
import { none, some } from 'fp-ts/lib/Option';
import * as sinon from 'sinon';
import { fromFalsy, fromNull, fromOption, fromUndefined, Maybe, None, Some } from './maybe';
import { AsyncMaybe } from '../asynchelpers/async.maybe';

const shouldBeASome = 'Should be a Some';

describe('Maybe', () => {
  const someMessage = 'this is some message';
  const someMaybe = Some(someMessage);
  const noneMaybe = None<string>();

  it('Some / None', () => {
    if (!someMaybe.isSome()) {
      return expect.fail(shouldBeASome);
    }
    if (!noneMaybe.isNone()) {
      return expect.fail('Should be a None');
    }
    return expect(someMaybe.some()).to.eq(someMessage);
  });

  it('from Option', () => {
    const maybe = fromOption<string>(some(someMessage));
    if (!maybe.isSome()) {
      return expect.fail(shouldBeASome);
    }
    expect(maybe.some()).to.eq(someMessage);
    return expect(fromOption(none).isNone()).to.eq(true);
  });

  it('fromNull', () => {
    const maybe = fromNull(someMessage);
    if (!maybe.isSome()) {
      return expect.fail(shouldBeASome);
    }
    expect(maybe.some()).to.eq(someMessage);
    expect(fromNull(null).isNone()).to.eq(true);
    return expect(fromNull(undefined).isNone()).to.eq(true);
  });

  it('fromUndefined', () => {
    const maybe = fromUndefined(someMessage);
    if (!maybe.isSome()) {
      return expect.fail(shouldBeASome);
    }
    expect(maybe.some()).to.eq(someMessage);
    return expect(fromUndefined(undefined).isNone()).to.eq(true);
  });

  it('fromFalsy', () => {
    const maybe = fromFalsy(someMessage);
    if (!maybe.isSome()) {
      return expect.fail(shouldBeASome);
    }
    expect(maybe.some()).to.eq(someMessage);
    expect(fromFalsy(null).isNone()).to.eq(true);
    expect(fromFalsy(undefined).isNone()).to.eq(true);
    return expect(fromFalsy('').isNone()).to.eq(true);
  });

  it('orNull', () => {
    expect(someMaybe.orNull()).to.eq(someMessage);
    expect(noneMaybe.orNull()).to.eql(null);
  });

  it('orJust', () => {
    expect(someMaybe.orJust('hello')).to.eq(someMessage);
    expect(noneMaybe.orJust('hello')).to.eql('hello');
  });

  it('orUndefined', () => {
    expect(someMaybe.orUndefined()).to.eq(someMessage);
    expect(noneMaybe.orUndefined()).to.eq(undefined);
  });

  it('orElseThrow', () => {
    const errMessage = 'argh';
    expect(() => noneMaybe.orElseThrow(errMessage)).to.throw(errMessage);
    expect(someMaybe.orElseThrow(errMessage)).to.eq(someMessage);
  });

  it('toValidation', () => {
    const someValidation = someMaybe.toValidation('Error');
    const noneValidation = noneMaybe.toValidation('Error');
    if (!(someValidation.isSuccess() && noneValidation.isFail())) {
      return expect.fail('Invalid validation state.');
    }
    expect(someValidation.success()).to.eq(someMessage);
    return expect(noneValidation.fail()).to.eq('Error');
  });

  it('filter', () => {
    const isString = (arg: unknown): boolean => typeof arg === 'string';
    const maybe = someMaybe.filter(isString);
    if (!maybe.isSome()) {
      return expect.fail(shouldBeASome);
    }
    expect(maybe.some()).to.eq(someMessage);
    expect(
      Some(42)
        .filter(isString)
        .isNone()
    ).to.eq(true);
    return expect(noneMaybe.filter(isString).isNone()).to.eq(true);
  });

  it('forEach', () => {
    const callback = sinon.spy();
    noneMaybe.forEach(callback);
    expect(callback.callCount).to.eq(0);
    someMaybe.forEach(callback);
    expect(callback.calledWithExactly(someMessage)).to.eq(true);
  });

  it('orElseRun', () => {
    const callback = sinon.spy();
    someMaybe.orElseRun(callback);
    expect(callback.callCount).to.eq(0);
    noneMaybe.orElseRun(callback);
    expect(callback.callCount).to.eq(1);
    sinon.restore();
  });

  it('map', () => {
    const f = (arg: string): number => arg.length;
    const g = (_arg: string): null => null;
    const h = (_arg: string): undefined => undefined;
    const maybe = someMaybe.map(f);
    if (!maybe.isSome()) {
      return expect.fail(shouldBeASome);
    }
    expect(maybe.some()).to.eq(someMessage.length);
    expect(noneMaybe.map(f).isNone()).to.eq(true);
    expect(someMaybe.map(g).isNone()).to.eq(true);
    return expect(someMaybe.map(h).isNone()).to.eq(true);
  });

  it('flatMap', () => {
    const fSome = (arg: string): Maybe<number> => Some(arg.length);
    const fNone = (_arg: string): Maybe<number> => None();
    const maybe = someMaybe.flatMap(fSome);
    if (maybe.isNone()) {
      return expect.fail(shouldBeASome);
    }
    expect(maybe.some()).to.eq(someMessage.length);
    expect(someMaybe.flatMap(fNone).isNone()).to.eq(true);
    return expect(noneMaybe.flatMap(fSome).isNone()).to.eq(true);
  });

  it('flatMapAsync', async () => {
    const fSome = (arg: string): AsyncMaybe<number> => AsyncMaybe.from(Some(arg.length));
    const fNone = (_arg: string): AsyncMaybe<number> => AsyncMaybe.from(None());
    const maybe = await someMaybe.flatMapAsync(fSome);
    if (!maybe.isSome()) {
      return expect.fail(shouldBeASome);
    }
    expect(maybe.some()).to.eq(someMessage.length);
    expect((await someMaybe.flatMapAsync(fNone)).isNone()).to.eq(true);
    return expect((await noneMaybe.flatMapAsync(fSome)).isNone()).to.eq(true);
  });

  it('cata', () => {
    const fSome = (arg: string): number => arg.length;
    const fNone = (): number => 1234;
    expect(someMaybe.cata(fNone, fSome)).to.eq(someMessage.length);
    expect(noneMaybe.cata(fNone, fSome)).to.eq(1234);
  });
});
