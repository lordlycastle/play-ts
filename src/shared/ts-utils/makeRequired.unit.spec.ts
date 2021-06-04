import { expect } from '../expectations.spec';
import { assertIsNonNull, validateIsNonNull } from './makeRequired';

type TestType = {
  hello?: number | null;
  world: number;
};

const ok: TestType = {
  hello: 1,
  world: 2,
};
const notOk: TestType = {
  world: 2,
};
const alsoNotOk: TestType = {
  hello: null,
  world: 2,
};
const testProp = 'hello';
const expectedErrorRegExp = new RegExp(`Expected .* to have property ${testProp}`);

describe('assertIsNonNull', () => {
  it('should pass if property exists', () => {
    expect(() => assertIsNonNull(ok, testProp)).to.not.throw;
  });

  it('should throw if property is not present', () => {
    expect(() => assertIsNonNull(notOk, testProp)).to.throw(expectedErrorRegExp);
  });

  it('should throw if property is null', () => {
    expect(() => assertIsNonNull(alsoNotOk, testProp)).to.throw(expectedErrorRegExp);
  });
});

describe('validateHasProperty', () => {
  it('should return success if property exists', () => {
    expect(validateIsNonNull(ok, testProp).successOrThrow()).to.deep.equal(ok);
  });

  const shouldHaveBeenAFail = 'Should have been a fail';
  it('should return fail if property is not set', () => {
    const failVal = validateIsNonNull(notOk, testProp);
    if (!failVal.isFail()) {
      expect.fail(shouldHaveBeenAFail);
      return;
    }
    expect(failVal.fail().message).matches(expectedErrorRegExp);
  });

  it('should return fail if property is not set', () => {
    const failVal = validateIsNonNull(alsoNotOk, testProp);
    if (!failVal.isFail()) {
      expect.fail(shouldHaveBeenAFail);
      return;
    }
    expect(failVal.fail().message).matches(expectedErrorRegExp);
  });

  it('should use custom error Builder if provided', () => {
    const failVal = validateIsNonNull(notOk, testProp, str => new Error(str));
    if (!failVal.isFail()) {
      expect.fail(shouldHaveBeenAFail);
      return;
    }
    expect(failVal.fail()).to.be.instanceOf(Error);
  });
});
