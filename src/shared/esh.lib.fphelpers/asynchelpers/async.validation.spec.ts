import { Fail, Success, Validation } from '../fptswrappers/validation';
import { AsyncValidation } from './async.validation';
import { expect } from '../testing/expectations';
import * as sinon from 'sinon';

describe('AsyncValidation', () => {
  const testNumber = 42;
  const testValidationErrorMessage = 'validation failed';
  const testRejectedMessage = 'rejected';
  const testSuccess = AsyncValidation.from<number, Error>(Promise.resolve(Success(testNumber)));
  const testFail = AsyncValidation.from<number, Error>(
    Promise.resolve(Fail(new Error(testValidationErrorMessage)))
  );
  const testReject = (): AsyncValidation<number> =>
    AsyncValidation.from<number, Error>(Promise.reject(testRejectedMessage));

  const answer = (i: number): string => `the answer is ${i}`;
  const answerExpectation = 'the answer is 42';

  const shouldBeSuccessMessage = 'Should be a Success';
  const shouldBeFailMessage = 'Should be a Fail';

  describe('construction', () => {
    it('from Validation (success)', async () => {
      const test = AsyncValidation.from(Success(testNumber));
      const val = await test.value;
      if (!val.isSuccess()) {
        return expect.fail(shouldBeSuccessMessage);
      }
      return expect(val.success()).to.eq(testNumber);
    });

    it('from Validation (failure)', async () => {
      const test = AsyncValidation.from(Fail(testValidationErrorMessage));
      const val = await test.value;
      if (!val.isFail()) {
        return expect.fail(shouldBeFailMessage);
      }
      return expect(val.fail()).to.eq(testValidationErrorMessage);
    });

    it('from Validation Promise (resolved)', async () => {
      const val = await testSuccess.value;
      if (!val.isSuccess()) {
        return expect.fail(shouldBeSuccessMessage);
      }
      return expect(val.success()).to.eq(testNumber);
    });

    it('from Validation Promise (rejected)', () => {
      const test = AsyncValidation.from(Promise.reject(testRejectedMessage));
      return expect(test.value).to.be.rejectedWith(testRejectedMessage);
    });

    it('should be awaitable', async () => {
      const test = AsyncValidation.from(Success(testNumber));
      const res = await test;
      if (!res.isSuccess()) {
        return expect.fail(shouldBeSuccessMessage);
      }
      return expect(res.success()).to.eq(testNumber);
    });

    describe('from try', () => {
      it('resolve case', async () => {
        const val = await AsyncValidation.fromTry(() => Promise.resolve(testNumber)).value;
        if (!val.isSuccess()) {
          return expect.fail(shouldBeSuccessMessage);
        }
        return expect(val.success()).to.eq(testNumber);
      });

      it('reject case', async () => {
        const val = await AsyncValidation.fromTry(() => Promise.reject(testRejectedMessage)).value;
        if (!val.isFail()) {
          return expect.fail(shouldBeFailMessage);
        }
        return expect(val.fail()).to.eq(testRejectedMessage);
      });
    });
  });

  describe('map', () => {
    const f = answer;

    it('map from rejected', async () => {
      return expect(testReject().map(f)).to.be.rejectedWith(testRejectedMessage);
    });

    it('map from success', async () => {
      const mapped = await testSuccess.map(f);
      if (!mapped.isSuccess()) {
        return expect.fail(shouldBeSuccessMessage);
      }
      return expect(mapped.success()).to.eq(answerExpectation);
    });

    it('map from fail', async () => {
      const mapped = await testFail.map(f);
      if (!mapped.isFail()) {
        return expect.fail(shouldBeFailMessage);
      }
      return expect(mapped.fail().message).to.eq(testValidationErrorMessage);
    });
  });

  describe('failMap', () => {
    const f = (err: Error): string => err.message;

    it('failMap from rejected', async () => {
      return expect(testReject().failMap(f)).to.be.rejectedWith(testRejectedMessage);
    });

    it('failMap from success', async () => {
      const failMapped = await testSuccess.failMap(f);
      if (!failMapped.isSuccess()) {
        return expect.fail(shouldBeSuccessMessage);
      }
      return expect(failMapped.success()).to.eq(testNumber);
    });

    it('failMap from fail', async () => {
      const failMapped = await testFail.failMap(f);
      if (!failMapped.isFail()) {
        return expect.fail(shouldBeFailMessage);
      }
      return expect(failMapped.fail()).to.eq(testValidationErrorMessage);
    });
  });

  describe('bimap', () => {
    const failFunc = (err: Error): string => err.message;
    const successFunc = answer;

    it('bimap from rejected', async () => {
      return expect(testReject().bimap(failFunc, successFunc)).to.be.rejectedWith(
        testRejectedMessage
      );
    });

    it('bimap success case', async () => {
      const biMapped = await testSuccess.bimap(failFunc, successFunc);
      if (!biMapped.isSuccess()) {
        return expect.fail(shouldBeSuccessMessage);
      }
      return expect(biMapped.success()).to.eq(answerExpectation);
    });

    it('bimap fail case', async () => {
      const biMapped = await testFail.bimap(failFunc, successFunc);
      if (!biMapped.isFail()) {
        return expect.fail(shouldBeFailMessage);
      }
      return expect(biMapped.fail()).to.eql(testValidationErrorMessage);
    });
  });

  describe('flatMap', () => {
    const errorMessage = 'something went wrong';
    const rejectMessage = 'I have a bad feeling about this...';
    const successFunc = (i: number): Promise<Validation<Error, string>> =>
      Promise.resolve(Success(answer(i)));
    const failFunc = (_i: number): Promise<Validation<Error, string>> =>
      Promise.resolve(Fail(new Error(errorMessage)));
    const rejectFunc = (_i: number): Promise<Validation<Error, string>> =>
      Promise.reject(rejectMessage);
    const asyncValidationSuccessFunc = (i: number): AsyncValidation<string, Error> =>
      AsyncValidation.from(Success(answer(i)));
    const asyncValidationFailFunc = (_i: number): AsyncValidation<string, Error> =>
      AsyncValidation.from(Fail(new Error(errorMessage)));
    const asyncValidationRejectFunc = (_i: number): AsyncValidation<string, Error> =>
      AsyncValidation.from(Promise.reject(rejectMessage));

    it('flatMap from rejected', () => {
      return expect(testReject().flatMap(successFunc)).to.be.rejectedWith(testRejectedMessage);
    });

    it('flatMap success to success case', async () => {
      const flatMapped = await testSuccess.flatMap(successFunc);
      const flatMappedAsync = await testSuccess.flatMap(asyncValidationSuccessFunc);
      if (!(flatMapped.isSuccess() && flatMappedAsync.isSuccess())) {
        return expect.fail(shouldBeSuccessMessage);
      }
      expect(flatMapped.success()).to.eq(answerExpectation);
      return expect(flatMappedAsync.success()).to.eq(answerExpectation);
    });

    it('flatMap success to fail case', async () => {
      const flatMapped = await testSuccess.flatMap(failFunc);
      const flatMappedAsync = await testSuccess.flatMap(asyncValidationFailFunc);
      if (!(flatMapped.isFail() && flatMappedAsync.isFail())) {
        return expect.fail(shouldBeFailMessage);
      }
      expect(flatMapped.fail().message).to.eq(errorMessage);
      return expect(flatMappedAsync.fail().message).to.eq(errorMessage);
    });

    it('flatMap from fail case', async () => {
      const flatMapped = await testFail.flatMap(successFunc);
      const flatMappedAsync = await testFail.flatMap(asyncValidationSuccessFunc);
      if (!(flatMapped.isFail() && flatMappedAsync.isFail())) {
        return expect.fail(shouldBeFailMessage);
      }
      expect(flatMapped.fail().message).to.eq(testValidationErrorMessage);
      return expect(flatMappedAsync.fail().message).to.eq(testValidationErrorMessage);
    });

    it('flatMap to rejected promise', async () => {
      await expect(testSuccess.flatMap(rejectFunc)).to.be.rejectedWith(rejectMessage);
      return expect(testSuccess.flatMap(asyncValidationRejectFunc)).to.be.rejectedWith(
        rejectMessage
      );
    });
  });

  describe('flatMapSync', () => {
    const errorMessage = 'something went wrong';
    const successFunc = (i: number): Validation<Error, string> => Success(answer(i));
    const failFunc = (_i: number): Validation<Error, string> => Fail(new Error(errorMessage));

    it('flatMapSync from rejected', () => {
      return expect(testReject().flatMapSync(successFunc)).to.be.rejectedWith(testRejectedMessage);
    });

    it('flatMapSync success to success case', async () => {
      const flatMapped = await testSuccess.flatMapSync(successFunc);
      if (!flatMapped.isSuccess()) {
        return expect.fail(shouldBeSuccessMessage);
      }
      return expect(flatMapped.success()).to.eq(answerExpectation);
    });

    it('flatMapSync success to fail case', async () => {
      const flatMapped = await testSuccess.flatMapSync(failFunc);
      if (!flatMapped.isFail()) {
        return expect.fail(shouldBeFailMessage);
      }
      return expect(flatMapped.fail().message).to.eq(errorMessage);
    });

    it('flatMapSync from fail case', async () => {
      const flatMapped = await testFail.flatMapSync(successFunc);
      if (!flatMapped.isFail()) {
        return expect.fail(shouldBeFailMessage);
      }
      return expect(flatMapped.fail().message).to.eq(testValidationErrorMessage);
    });
  });

  describe('cata', () => {
    const fFail = (err: Error): string => err.message;
    const fSuccess = answer;
    it('cata for Success', async () => {
      expect(await testFail.cata(fFail, fSuccess)).to.eq(testValidationErrorMessage);
    });

    it('cata for Fail', async () => {
      expect(await testSuccess.cata(fFail, fSuccess)).to.eq(answerExpectation);
    });
  });

  describe('successThen', () => {
    const fResolve = (i: number): Promise<string> => Promise.resolve(answer(i));
    const fReject = (_i: number): Promise<string> => Promise.reject(new Error(testRejectedMessage));
    const guaranteedSuccessValidation: AsyncValidation<number, never> = AsyncValidation.from(
      Success(42)
    );
    it('resolve case', async () => {
      expect(await guaranteedSuccessValidation.successThen(fResolve)).to.eq(answerExpectation);
    });

    it('reject case', () => {
      return expect(guaranteedSuccessValidation.successThen(fReject)).to.be.rejectedWith(
        testRejectedMessage
      );
    });
  });

  describe('logError', () => {
    it('logError should not alter original validation', async () => {
      const consoleLogger = (str: string): void => {
        console.log(str);
      };
      const failed = await testFail.logError(consoleLogger);
      const succeeded = await testSuccess.logError(consoleLogger);
      if (!(succeeded.isSuccess() && failed.isFail())) {
        return expect.fail('Invalid validation states');
      }
      expect(failed.fail().message).to.eq(testValidationErrorMessage);
      return expect(succeeded.success()).to.eq(testNumber);
    });
  });

  describe('runForSuccess', () => {
    const callbackSpy = sinon.stub().resolves();

    afterEach(() => callbackSpy.resetHistory());

    after(() => sinon.restore());

    it('should not run for fail', async () => {
      await testFail.runForSuccess(callbackSpy);
      expect(callbackSpy.callCount).to.eq(0);
    });

    it('should run for success with success value', async () => {
      await testSuccess.runForSuccess(callbackSpy);
      expect(callbackSpy.callCount).to.eq(1);
      expect(callbackSpy.calledWith(testNumber)).to.eq(true);
    });
  });

  describe('successOrThrow', () => {
    it('successOrThrow on Fail', () => {
      return expect(testFail.successOrThrow()).to.be.rejectedWith(testValidationErrorMessage);
    });

    it('successOrThrow on Success', async () => {
      return expect(testSuccess.successOrThrow()).to.eventually.eq(testNumber);
    });
  });

  describe('toAsyncMaybe', () => {
    it('success', async () => {
      const testString = 'hello';
      const successAsyncValidation = AsyncValidation.from(Success(testString));
      expect(
        await successAsyncValidation.toAsyncMaybe().orElseThrow(new Error('Should be a Some'))
      ).to.eq(testString);
    });

    it('fail', async () => {
      const failAsyncValidation = AsyncValidation.from(Fail('error'));
      expect((await failAsyncValidation.toAsyncMaybe()).isNone()).to.eq(true);
    });
  });
});
