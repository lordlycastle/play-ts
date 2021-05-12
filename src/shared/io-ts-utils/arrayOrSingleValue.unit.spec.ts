import { ArrayOrSingleValue } from './arrayOrSingleValue';
import * as t from 'io-ts';
import { expect } from '../expectations.spec';
import { isRight } from 'fp-ts/lib/Either';

describe('ArrayOrSingleValue', () => {
  const codec = ArrayOrSingleValue(t.number);

  it('should decode single value to array', () => {
    const decoded = codec.decode(1);
    if (!isRight(decoded)) {
      return expect.fail('should have passed');
    }
    return expect(decoded.right).to.eql([1]);
  });

  it('should decode array', () => {
    const decoded = codec.decode([1, 2]);
    if (!isRight(decoded)) {
      return expect.fail('should have passed');
    }
    return expect(decoded.right).to.eql([1, 2]);
  });

  it('should fail for invalid input', () => {
    expect(isRight(codec.decode(['1', '2']))).to.eq(false);
  });
});
