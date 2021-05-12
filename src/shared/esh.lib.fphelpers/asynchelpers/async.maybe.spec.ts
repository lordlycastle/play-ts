import { Maybe, None, Some } from '../fptswrappers/maybe';
import { AsyncMaybe } from './async.maybe';
import { expect } from '../testing/expectations';

describe('AsyncMaybe', () => {
  const testNumber = 42;
  const testRejectedMessage = 'this promise was rejected';
  const testSome = AsyncMaybe.from<number>(Promise.resolve(Some(testNumber)));
  const testNone = AsyncMaybe.from<number>(Promise.resolve(None()));
  const testRejected = (): AsyncMaybe<number> =>
    AsyncMaybe.from<number>(Promise.reject(testRejectedMessage));

  const answer = (i: number): string => `the answer is ${i}`;
  const expectedAnswerString = 'the answer is 42';

  describe('construction', () => {
    it('from some', async () => {
      const test = AsyncMaybe.from(Some(testNumber));
      expect((await test.value).orNull()).to.eq(testNumber);
    });

    it('from none', async () => {
      const test = AsyncMaybe.from(None());
      expect((await test.value).isNone()).to.eq(true);
    });

    it('from some promise', async () => {
      expect((await testSome.value).orNull()).to.eq(testNumber);
    });

    it('from none promise', async () => {
      expect((await testNone.value).isNone()).to.eq(true);
    });

    it('should be awaitable', async () => {
      expect((await testSome).orNull()).to.eq(testNumber);
    });
  });

  describe('map', () => {
    const f: (arg: number) => string = answer;

    it('map from rejected', () => {
      return expect(testRejected().map(f)).to.be.rejectedWith(testRejectedMessage);
    });

    it('map from some', async () => {
      expect((await testSome.map(f)).orNull()).to.eq(expectedAnswerString);
    });

    it('map from none', async () => {
      expect((await testNone.map(f)).isNone()).to.eq(true);
    });
  });

  describe('flatMap', () => {
    const flatMapRejectMessage = 'I have a bad feeling about this...';
    const someFunc: (arg: number) => Promise<Maybe<string>> = i => Promise.resolve(Some(answer(i)));
    const noneFunc: (arg: number) => Promise<Maybe<string>> = _i => Promise.resolve(None());
    const rejectFunc: (arg: number) => Promise<Maybe<string>> = _i =>
      Promise.reject(flatMapRejectMessage);
    const asyncMaybeSomeFunc: (arg: number) => AsyncMaybe<string> = i =>
      AsyncMaybe.from(Some(answer(i)));
    const asyncMaybeNoneFunc: (arg: number) => AsyncMaybe<string> = _i => AsyncMaybe.from(None());
    const asyncMaybeRejectFunc: (arg: number) => AsyncMaybe<string> = _i =>
      AsyncMaybe.from(Promise.reject(flatMapRejectMessage));

    it('flatMap from rejected', () => {
      return expect(testRejected().flatMap(someFunc)).to.be.rejectedWith(testRejectedMessage);
    });

    it('flatMap some to some', async () => {
      expect((await testSome.flatMap(someFunc)).orNull()).to.eq(expectedAnswerString);
      expect((await testSome.flatMap(asyncMaybeSomeFunc)).orNull()).to.eq(expectedAnswerString);
    });

    it('flatMap some to none', async () => {
      expect((await testSome.flatMap(noneFunc)).isNone()).to.eq(true);
      expect((await testSome.flatMap(asyncMaybeNoneFunc)).isNone()).to.eq(true);
    });

    it('flatMap from none', async () => {
      expect((await testNone.flatMap(someFunc)).isNone()).to.eq(true);
      expect((await testNone.flatMap(asyncMaybeSomeFunc)).isNone()).to.eq(true);
    });

    it('flatMap to rejected promise', async () => {
      await expect(testSome.flatMap(rejectFunc)).to.be.rejectedWith(flatMapRejectMessage);
      return expect(testSome.flatMap(asyncMaybeRejectFunc)).to.be.rejectedWith(
        flatMapRejectMessage
      );
    });
  });

  describe('flatMapSync', () => {
    const someFunc: (arg: number) => Maybe<string> = i => Some(answer(i));
    const noneFunc: (arg: number) => Maybe<string> = _i => None();

    it('flatMapSync from rejected', () => {
      return expect(testRejected().flatMapSync(someFunc)).to.be.rejectedWith(testRejectedMessage);
    });

    it('flatMapSync some to some', async () => {
      expect((await testSome.flatMapSync(someFunc)).orNull()).to.eq(expectedAnswerString);
    });

    it('flatMapSync some to none', async () => {
      expect((await testSome.flatMapSync(noneFunc)).isNone()).to.eq(true);
    });

    it('flatMapSync from none', async () => {
      expect((await testNone.flatMapSync(someFunc)).isNone()).to.eq(true);
    });
  });

  describe('orElseThrow', () => {
    it('orElseThrow', async () => {
      const errMsg = 'this is a test error';
      const testErr = (): Error => new Error(errMsg);
      await expect(testSome.orElseThrow(testErr())).to.eventually.eq(testNumber);
      return expect(testNone.orElseThrow(testErr())).to.be.rejectedWith(errMsg);
    });
  });

  describe('toAsyncValidation', () => {
    const err = new Error('test error');
    it('some', async () => {
      const testString = 'test';
      const s = AsyncMaybe.from(Some(testString));
      await expect(s.toAsyncValidation(err).successOrThrow()).to.eventually.eq(testString);
    });
    it('none', async () => {
      const s = AsyncMaybe.from(None());
      await expect(s.toAsyncValidation(err).successOrThrow()).to.be.rejectedWith(err);
    });
  });
});
