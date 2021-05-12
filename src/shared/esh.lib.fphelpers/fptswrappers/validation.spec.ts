import * as sinon from 'sinon';
import { AsyncValidation } from '../asynchelpers/async.validation';
import { expect } from '../testing/expectations';
import { Fail, Success, Validation } from './validation';

const shouldBeSuccessMessage = 'Should be Success';
const shouldBeFailMessage = 'Should be Fail';
const shouldBeASome = 'Should be a Some';

describe('Validation', () => {
  const failMessage = 'this was an error';
  const successMessage = 'success!';
  const testValidationFailed = Fail<string, string>(failMessage);
  const testValidationSuccess = Success<string, string>(successMessage);

  describe('isSuccess / isFail', () => {
    it('isSuccess', () => {
      expect(testValidationSuccess.isSuccess()).to.eq(true);
      expect(testValidationFailed.isSuccess()).to.eq(false);
    });

    it('isFail', () => {
      expect(testValidationSuccess.isFail()).to.eq(false);
      expect(testValidationFailed.isFail()).to.eq(true);
    });
  });

  describe('toMaybe', () => {
    it('from success', () => {
      const maybe = testValidationSuccess.toMaybe();
      if (!maybe.isSome()) {
        return expect.fail(shouldBeASome);
      }
      return expect(maybe.some()).to.eq(successMessage);
    });

    it('from fail', () => {
      expect(testValidationFailed.toMaybe().isNone()).to.eq(true);
    });
  });

  describe('forEach', () => {
    const callback = sinon.spy();

    beforeEach(() => callback.resetHistory());

    after(() => sinon.restore());

    it('for success', () => {
      testValidationSuccess.forEach(callback);
      expect(callback.calledWithExactly(successMessage)).to.eq(true);
    });

    it('for fail', () => {
      testValidationFailed.forEach(callback);
      expect(callback.callCount).to.eq(0);
    });
  });

  describe('forEachFail', () => {
    const callback = sinon.spy();

    beforeEach(() => callback.resetHistory());

    after(() => sinon.restore());

    it('for success', () => {
      testValidationSuccess.forEachFail(callback);
      expect(callback.callCount).to.eq(0);
    });

    it('for fail', () => {
      testValidationFailed.forEachFail(callback);
      expect(callback.calledWithExactly(failMessage)).to.eq(true);
    });
  });

  describe('map', () => {
    const f = (arg: string): number => arg.length;
    it('map success', () => {
      const mapped = testValidationSuccess.map(f);
      if (!mapped.isSuccess()) {
        return expect.fail(shouldBeSuccessMessage);
      }
      return expect(mapped.success()).to.eq(successMessage.length);
    });

    it('map fail', () => {
      const mapped = testValidationFailed.map(f);
      if (!mapped.isFail()) {
        return expect.fail(shouldBeFailMessage);
      }
      return expect(mapped.fail()).to.eq(failMessage);
    });
  });

  describe('failMap', () => {
    const f = (arg: string): number => arg.length;
    it('failMap success', () => {
      const failMapped = testValidationSuccess.failMap(f);
      if (!failMapped.isSuccess()) {
        return expect.fail(shouldBeSuccessMessage);
      }
      return expect(failMapped.success()).to.eq(successMessage);
    });

    it('failMap fail', () => {
      const failMapped = testValidationFailed.failMap(f);
      if (!failMapped.isFail()) {
        return expect.fail(shouldBeFailMessage);
      }
      return expect(failMapped.fail()).to.eq(failMessage.length);
    });
  });

  describe('flatMap', () => {
    const anotherErrorMessage = 'another error message';
    const f = (arg: string): Validation<string, number> => Success(arg.length);
    const g = (_arg: string): Validation<string, number> => Fail(anotherErrorMessage);

    it('flatMap from fail', () => {
      const flatMapped = testValidationFailed.flatMap(f);
      if (!flatMapped.isFail()) {
        return expect.fail(shouldBeFailMessage);
      }
      return expect(flatMapped.fail()).to.eq(failMessage);
    });

    it('flatMap success to success', () => {
      const flatMapped = testValidationSuccess.flatMap(f);
      if (!flatMapped.isSuccess()) {
        return expect.fail(shouldBeSuccessMessage);
      }
      return expect(flatMapped.success()).to.eq(successMessage.length);
    });

    it('flatMap success to fail', () => {
      const flatMapped = testValidationSuccess.flatMap(g);
      if (!flatMapped.isFail()) {
        return expect.fail(shouldBeFailMessage);
      }
      return expect(flatMapped.fail()).to.eq(anotherErrorMessage);
    });
  });

  describe('flatMapAsync', () => {
    const anotherErrorMessage = 'another error message';
    const f = (arg: string): AsyncValidation<number, string> =>
      AsyncValidation.from(Success(arg.length));
    const g = (_arg: string): AsyncValidation<number, string> =>
      AsyncValidation.from(Fail(anotherErrorMessage));

    it('flatMapAsync from fail', async () => {
      const flatMapped = await testValidationFailed.flatMapAsync(f);
      if (!flatMapped.isFail()) {
        return expect.fail(shouldBeFailMessage);
      }
      return expect(flatMapped.fail()).to.eq(failMessage);
    });

    it('flatMapAsync success to success', async () => {
      const flatMapped = await testValidationSuccess.flatMapAsync(f);
      if (!flatMapped.isSuccess()) {
        return expect.fail(shouldBeSuccessMessage);
      }
      return expect(flatMapped.success()).to.eq(successMessage.length);
    });

    it('flatMapAsync success to fail', async () => {
      const flatMapped = await testValidationSuccess.flatMapAsync(g);
      if (!flatMapped.isFail()) {
        return expect.fail(shouldBeFailMessage);
      }
      return expect(flatMapped.fail()).to.eq(anotherErrorMessage);
    });
  });

  describe('bimap', () => {
    const f = (arg: string): number => arg.length;
    const g = (arg: string): number => arg.length + 1;

    it('bimap from success', () => {
      const biMapped = testValidationSuccess.bimap(f, g);
      if (!biMapped.isSuccess()) {
        return expect.fail(shouldBeSuccessMessage);
      }
      return expect(biMapped.success()).to.eq(successMessage.length + 1);
    });

    it('bimap from fail', () => {
      const biMapped = testValidationFailed.bimap(f, g);
      if (!biMapped.isFail()) {
        return expect.fail(shouldBeFailMessage);
      }
      return expect(biMapped.fail()).to.eq(failMessage.length);
    });
  });

  describe('cata', () => {
    const f = (arg: string): number => arg.length;
    const g = (arg: string): number => arg.length + 1;

    it('cata from success', () => {
      expect(testValidationSuccess.cata(f, g)).to.eq(successMessage.length + 1);
    });

    it('cata from fail', () => {
      expect(testValidationFailed.cata(f, g)).to.eq(failMessage.length);
    });
  });

  describe('ap and acc', () => {
    const anotherFailMessage = 'another-fail-message';
    const fSuccess = Success<string, (arg: string) => number>(x => x.length);
    const fFail = Fail<string, (arg: string) => number>(anotherFailMessage);
    const fFailArray = Fail<string, (arg: string) => number>(anotherFailMessage);

    it('ap from success', () => {
      const apped = testValidationSuccess.ap(fSuccess);
      if (!apped.isSuccess()) {
        return expect.fail(shouldBeSuccessMessage);
      }
      return expect(apped.success()).to.eq(successMessage.length);
    });

    it('ap from success to fail', () => {
      const apped = testValidationSuccess.ap(fFail);
      if (!apped.isFail()) {
        return expect.fail(shouldBeFailMessage);
      }
      return expect(apped.fail()).to.eq(anotherFailMessage);
    });

    it('ap fail to success', () => {
      const apped = testValidationFailed.ap(fSuccess);
      if (!apped.isFail()) {
        return expect.fail(shouldBeFailMessage);
      }
      return expect(apped.fail()).to.eq(failMessage);
    });

    it('ap fail to fail', () => {
      const apped = testValidationFailed.ap(fFail);
      const appedAccumulated = testValidationFailed.apAccStrings(fFailArray, 'x');
      if (!(apped.isFail() && appedAccumulated.isFail())) {
        return expect.fail(shouldBeFailMessage);
      }
      expect(apped.fail()).to.eq(anotherFailMessage);
      return expect(appedAccumulated.fail()).to.eq([anotherFailMessage, failMessage].join('x'));
    });

    it('apAccStrings', () => {
      const anotherTestFail = Fail(anotherFailMessage);
      const yetAnotherFailMessage = 'yet another fail message';
      const yetAnotherFail = Fail(yetAnotherFailMessage);
      const apped = testValidationFailed.apAccStrings(
        anotherTestFail.apAccStrings(
          yetAnotherFail.apAccStrings(Success<string, string>('test').acc())
        )
      );
      if (!apped.isFail()) {
        return expect.fail(shouldBeFailMessage);
      }
      return expect(apped.fail()).to.eq(
        [yetAnotherFailMessage, anotherFailMessage, failMessage].join(', ')
      );
    });

    it('apAccArray', () => {
      const errMsg1 = 'error_1';
      const errMsg2 = 'error_2';
      const arraySuccess = Success<Error[], string>(successMessage);
      const arrayFail = Fail<Error[], string>([new Error(errMsg1)]);
      const fValSuccess = Success<Error[], (arg: string) => number>(str => str.length);
      const fValFail = Fail<Error[], (arg: string) => number>([new Error(errMsg2)]);

      const resFailToFail = arrayFail.apAccArray(fValFail);
      const resFailToSuccess = arrayFail.apAccArray(fValSuccess);
      const resSuccessToFail = arraySuccess.apAccArray(fValFail);
      const resSuccessToSuccess = arraySuccess.apAccArray(fValSuccess);

      if (
        !resFailToFail.isFail() ||
        !resFailToSuccess.isFail() ||
        !resSuccessToFail.isFail() ||
        !resSuccessToSuccess.isSuccess()
      ) {
        return expect.fail('invalid Validation state');
      }
      expect(resFailToFail.fail().map(err => err.message)).to.deep.equalInAnyOrder([
        errMsg1,
        errMsg2,
      ]);
      expect(resFailToSuccess.fail().map(err => err.message)).to.deep.equal([errMsg1]);
      expect(resSuccessToFail.fail().map(err => err.message)).to.deep.equal([errMsg2]);
      return expect(resSuccessToSuccess.success()).to.eq(successMessage.length);
    });
  });

  describe('logError', () => {
    it('logError should not alter validation', () => {
      const failWithError = Fail<Error, number>(new Error('Some test error'));
      const successCase = Success<Error, number>(42);
      const consoleLogger = (str: string): void => {
        console.log(str);
      };

      const failed = failWithError.logError(consoleLogger, 'prefix') as Validation<Error, number>;
      const succeeded = successCase.logError(consoleLogger);
      if (!(failed.isFail() && succeeded.isSuccess())) {
        return expect.fail('Invalid test data.');
      }
      expect(failed.fail().message).to.eq('Some test error');
      return expect(succeeded.success()).to.eq(42);
    });
  });

  describe('successOrThrow', () => {
    it('successOrThrow on Fail', () => {
      expect(() => testValidationFailed.successOrThrow()).to.throw(failMessage);
    });

    it('successOrThrow on Success', () => {
      expect(testValidationSuccess.successOrThrow()).to.eq(successMessage);
    });
  });
});
