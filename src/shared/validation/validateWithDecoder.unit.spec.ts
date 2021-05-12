import * as t from 'io-ts';
import { expect } from '../expectations.spec';
import { validateWithDecoder } from './validateWithDecoder';

const TestingType = t.type(
  {
    oneProperty: t.number,
    anotherProperty: t.string,
  },
  'TestingType'
);

const validObject = {
  oneProperty: 42,
  anotherProperty: 'forty two',
};

const invalidObject = {
  oneProperty: '42',
  anotherProperty: 'forty two',
};

describe('validateWithDecoder', () => {
  const validate = validateWithDecoder(TestingType);

  it('for valid input', () => {
    const result = validate(validObject);

    expect(result.isSuccess() && result.success()).to.deep.equal(validObject);
  });

  it('for invalid input', () => {
    const result = validate(invalidObject);

    expect(result.isFail() && typeof result.fail() === 'string').to.eq(true);
    expect(result.isFail() && result.fail().length).to.be.gte(1);
  });

});
