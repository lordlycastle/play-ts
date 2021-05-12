import { Fail, Success, Validation } from './validation';
import { expect } from '../testing/expectations';
import { Pair } from '../utility/pair';
import { fromArray, ReadonlyList } from './readonly.list';
import { Maybe, None, Some } from './maybe';
import { AsyncValidation } from '../asynchelpers/async.validation';
import { AsyncMaybe } from '../asynchelpers/async.maybe';

describe('ReadonlyList', () => {
  const invalidStateMessage = 'Invalid validation state';

  it('map', () => {
    const f = (str: string): number => str.length;
    expect(
      fromArray(['hello', 'world!'])
        .map(f)
        .toArray()
    ).to.eql([5, 6]);
  });

  it('flatMap', () => {
    const f = (str: string): ReadonlyList<string> => fromArray(str.split('.'));
    expect(
      fromArray(['he.llo', 'w.o.rld!'])
        .flatMap(f)
        .toArray()
    ).to.eql(['he', 'llo', 'w', 'o', 'rld!']);
  });

  it('reduce', () => {
    const totalLetterCount = fromArray(['hello', 'world!']).reduce(
      (acc, cur) => acc + cur.length,
      0
    );
    expect(totalLetterCount).to.eq(11);
  });

  describe('traverse validation', () => {
    const valFunction = (n: number): Validation<string, number> =>
      n > 1 ? Success(n) : Fail(`${n} is <= 1`);
    const valFunctionArray = (n: number): Validation<Error[], number> =>
      n > 1 ? Success(n) : Fail([new Error(`${n} is <= 1`)]);

    it('traverseValidation', () => {
      const successCase = fromArray([2, 3]).traverseToValidation(valFunction);
      const failCase = fromArray([0, 1, 2]).traverseToValidation(valFunction);
      if (!successCase.isSuccess() || !failCase.isFail()) {
        return expect.fail(invalidStateMessage);
      }
      expect(failCase.fail()).to.eq('0 is <= 1');
      return expect(successCase.success().toArray()).to.eql([2, 3]);
    });

    it('traverseValidationAccString', () => {
      const successCase = fromArray([2, 3]).traverseToValidationAccFailStrings(valFunction);
      const failCase = fromArray([0, 1, 2]).traverseToValidationAccFailStrings(valFunction);
      if (!successCase.isSuccess() || !failCase.isFail()) {
        return expect.fail(invalidStateMessage);
      }
      expect(failCase.fail()).to.eq('0 is <= 1, 1 is <= 1');
      return expect(successCase.success().toArray()).to.eql([2, 3]);
    });

    it('traverseValidationAccArray', () => {
      const successCase = fromArray([2, 3]).traverseToValidationAccFailArrays(valFunctionArray);
      const failCase = fromArray([0, 1, 2]).traverseToValidationAccFailArrays(valFunctionArray);
      if (!successCase.isSuccess() || !failCase.isFail()) {
        return expect.fail(invalidStateMessage);
      }
      expect(failCase.fail().map(err => err.message)).to.eql(['0 is <= 1', '1 is <= 1']);
      return expect(successCase.success().toArray()).to.eql([2, 3]);
    });

    it('traverseToPair', () => {
      const test = fromArray([0, 1, 2, 3]).validateAndAccToPair(valFunction);
      expect(test.getLeft()).to.eql(['0 is <= 1', '1 is <= 1']);
      expect(test.getRight()).to.eql([2, 3]);
    });
  });

  describe('sequence validation', () => {
    it('sequenceValidation', () => {
      const successCase = fromArray([Success(2), Success(3)]).sequenceValidation();
      const failCase = fromArray([
        Fail('argh'),
        Fail('uff'),
        Success(2),
        Success(3),
      ]).sequenceValidation();
      if (!successCase.isSuccess() || !failCase.isFail()) {
        return expect.fail(invalidStateMessage);
      }
      expect(failCase.fail()).to.eq('argh');
      return expect(successCase.success().toArray()).to.eql([2, 3]);
    });

    it('sequenceValidationAccString', () => {
      const successCase = fromArray([
        Success<string, number>(2),
        Success<string, number>(3),
      ]).sequenceValidationAccFailStrings();
      const failCase = fromArray([
        Fail<string, number>('argh'),
        Fail<string, number>('uff'),
        Success<string, number>(2),
        Success<string, number>(3),
      ]).sequenceValidationAccFailStrings();
      if (!successCase.isSuccess() || !failCase.isFail()) {
        return expect.fail(invalidStateMessage);
      }
      expect(failCase.fail()).to.eq('argh, uff');
      return expect(successCase.success().toArray()).to.eql([2, 3]);
    });

    it('sequenceValidationAccArray', () => {
      const successCase = fromArray([
        Success<Error[], number>(2),
        Success<Error[], number>(3),
      ]).sequenceValidationAccFailArrays();
      const failCase = fromArray([
        Fail<Error[], number>([new Error('argh')]),
        Fail<Error[], number>([new Error('uff')]),
        Success<Error[], number>(2),
        Success<Error[], number>(3),
      ]).sequenceValidationAccFailArrays();
      if (!successCase.isSuccess() || !failCase.isFail()) {
        return expect.fail(invalidStateMessage);
      }
      expect(failCase.fail().map(err => err.message)).to.eql(['argh', 'uff']);
      return expect(successCase.success().toArray()).to.eql([2, 3]);
    });

    it('sequenceToPair', () => {
      const test: Pair<Error[], number[]> = fromArray([
        Fail<Error, number>(new Error('argh')),
        Fail<Error, number>(new Error('uff')),
        Success<Error, number>(2),
        Success<Error, number>(3),
      ]).sequenceToPair();
      expect(test.getLeft().map(err => err.message)).to.eql(['argh', 'uff']);
      expect(test.getRight()).to.eql([2, 3]);
    });
  });

  describe('traverse maybe', () => {
    const valFunction = (n: number): Maybe<number> => (n > 1 ? Some(n) : None());

    it('traverseMaybe', () => {
      const someCase = fromArray([2, 3]).traverseToMaybe(valFunction);
      const noneCase = fromArray([0, 1, 2]).traverseToMaybe(valFunction);
      if (!someCase.isSome() || !noneCase.isNone()) {
        return expect.fail(invalidStateMessage);
      }
      return expect(someCase.some().toArray()).to.eql([2, 3]);
    });
  });

  describe('sequence maybe', () => {
    it('sequenceMaybe', () => {
      const someCase = fromArray([Some(2), Some(3)]).sequenceMaybe();
      const noneCase = fromArray([None<number>(), Some(2), Some(3)]).sequenceMaybe();
      if (!someCase.isSome() || !noneCase.isNone()) {
        return expect.fail(invalidStateMessage);
      }
      return expect(someCase.some().toArray()).to.eql([2, 3]);
    });
  });

  describe('traverse async validation', () => {
    const valFunction = (n: number): AsyncValidation<number, string> =>
      AsyncValidation.from(n > 1 ? Success(n) : Fail(`${n} is <= 1`));
    const valFunctionArray = (n: number): AsyncValidation<number, Error[]> =>
      AsyncValidation.from(n > 1 ? Success(n) : Fail([new Error(`${n} is <= 1`)]));

    it('traverseToAsyncValidation', async () => {
      const successCase = await fromArray([2, 3]).traverseToAsyncValidation(valFunction);
      const failCase = await fromArray([0, 1, 2]).traverseToAsyncValidation(valFunction);
      if (!successCase.isSuccess() || !failCase.isFail()) {
        return expect.fail(invalidStateMessage);
      }
      expect(failCase.fail()).to.eq('0 is <= 1');
      return expect(successCase.success().toArray()).to.eql([2, 3]);
    });

    it('traverseToAsyncValidationAccFailStrings', async () => {
      const successCase = await fromArray([2, 3]).traverseToAsyncValidationAccFailStrings(
        valFunction
      );
      const failCase = await fromArray([0, 1, 2]).traverseToAsyncValidationAccFailStrings(
        valFunction
      );
      if (!successCase.isSuccess() || !failCase.isFail()) {
        return expect.fail(invalidStateMessage);
      }
      expect(failCase.fail()).to.eq('0 is <= 1, 1 is <= 1');
      return expect(successCase.success().toArray()).to.eql([2, 3]);
    });

    it('traverseToAsyncValidationAccFailArrays', async () => {
      const successCase = await fromArray([2, 3]).traverseToAsyncValidationAccFailArrays(
        valFunctionArray
      );
      const failCase = await fromArray([0, 1, 2]).traverseToAsyncValidationAccFailArrays(
        valFunctionArray
      );
      if (!successCase.isSuccess() || !failCase.isFail()) {
        return expect.fail(invalidStateMessage);
      }

      // @ts-ignore
      expect(failCase.fail().map(err => err.message)).to.eql(['0 is <= 1', '1 is <= 1']);
      return expect(successCase.success().toArray()).to.eql([2, 3]);
    });

    it('validateAsyncAndAccToPair', async () => {
      const test = await fromArray([0, 1, 2, 3]).validateAsyncAndAccToPair(valFunction);
      expect(test.getLeft()).to.eql(['0 is <= 1', '1 is <= 1']);
      expect(test.getRight()).to.eql([2, 3]);
    });
  });

  describe('sequence async validation', () => {
    it('sequenceAsyncValidation', async () => {
      const successCase = await fromArray([
        AsyncValidation.from(Success(2)),
        AsyncValidation.from(Success(3)),
      ]).sequenceAsyncValidation();
      const failCase = await fromArray([
        AsyncValidation.from(Fail('argh')),
        AsyncValidation.from(Fail('uff')),
        AsyncValidation.from(Success(2)),
        AsyncValidation.from(Success(3)),
      ]).sequenceAsyncValidation();
      if (!successCase.isSuccess() || !failCase.isFail()) {
        return expect.fail(invalidStateMessage);
      }
      expect(failCase.fail()).to.eq('argh');
      return expect(successCase.success().toArray()).to.eql([2, 3]);
    });

    it('sequenceAsyncValidationAccFailStrings', async () => {
      const successCase = await fromArray([
        AsyncValidation.from<number, string>(Success(2)),
        AsyncValidation.from<number, string>(Success(3)),
      ]).sequenceAsyncValidationAccFailStrings();
      const failCase = await fromArray([
        AsyncValidation.from<number, string>(Fail('argh')),
        AsyncValidation.from<number, string>(Fail('uff')),
        AsyncValidation.from<number, string>(Success(2)),
        AsyncValidation.from<number, string>(Success(3)),
      ]).sequenceAsyncValidationAccFailStrings();
      if (!successCase.isSuccess() || !failCase.isFail()) {
        return expect.fail(invalidStateMessage);
      }
      expect(failCase.fail()).to.eq('argh, uff');
      return expect(successCase.success().toArray()).to.eql([2, 3]);
    });

    it('sequenceAsyncValidationAccFailArrays', async () => {
      const successCase = await fromArray([
        AsyncValidation.from<number, Error[]>(Success(2)),
        AsyncValidation.from<number, Error[]>(Success(3)),
      ]).sequenceAsyncValidationAccFailArrays();
      const failCase = await fromArray([
        AsyncValidation.from<number, Error[]>(Fail([new Error('argh')])),
        AsyncValidation.from<number, Error[]>(Fail([new Error('uff')])),
        AsyncValidation.from<number, Error[]>(Success(2)),
        AsyncValidation.from<number, Error[]>(Success(3)),
      ]).sequenceAsyncValidationAccFailArrays();
      if (!successCase.isSuccess() || !failCase.isFail()) {
        return expect.fail(invalidStateMessage);
      }
      // @ts-ignore
      expect(failCase.fail().map(err => err.message)).to.eql(['argh', 'uff']);
      return expect(successCase.success().toArray()).to.eql([2, 3]);
    });

    it('sequenceAsyncValidationToPair', async () => {
      const test: Pair<Error[], number[]> = await fromArray([
        AsyncValidation.from<number, Error>(Fail(new Error('argh'))),
        AsyncValidation.from<number, Error>(Fail(new Error('uff'))),
        AsyncValidation.from<number, Error>(Success(2)),
        AsyncValidation.from<number, Error>(Success(3)),
      ]).sequenceAsyncValidationToPair();
      expect(test.getLeft().map(err => err.message)).to.eql(['argh', 'uff']);
      expect(test.getRight()).to.eql([2, 3]);
    });
  });

  describe('traverse async maybe', () => {
    const valFunction = (n: number): AsyncMaybe<number> =>
      AsyncMaybe.from(n > 1 ? Some(n) : None());

    it('traverseToAsyncMaybe', async () => {
      const someCase = await fromArray([2, 3]).traverseToAsyncMaybe(valFunction);
      const noneCase = await fromArray([0, 1, 2]).traverseToAsyncMaybe(valFunction);
      if (!someCase.isSome() || !noneCase.isNone()) {
        return expect.fail(invalidStateMessage);
      }
      return expect(someCase.some().toArray()).to.eql([2, 3]);
    });
  });

  describe('sequence', () => {
    it('sequenceAsyncMaybe', async () => {
      const someCase = await fromArray([
        AsyncMaybe.from(Some(2)),
        AsyncMaybe.from(Some(3)),
      ]).sequenceAsyncMaybe();
      const noneCase = await fromArray([
        AsyncMaybe.from(None()),
        AsyncMaybe.from(Some(2)),
        AsyncMaybe.from(Some(3)),
      ]).sequenceAsyncMaybe();
      if (!someCase.isSome() || !noneCase.isNone()) {
        return expect.fail(invalidStateMessage);
      }
      return expect(someCase.some().toArray()).to.eql([2, 3]);
    });
  });
});
