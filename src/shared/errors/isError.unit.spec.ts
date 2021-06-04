import { expect } from '../expectations.spec';
import { assertIsError } from './isError';

describe('assertIsError', () => {
  it('should work as expected', () => {
    const helloString = 'hello world';
    expect(() => assertIsError(new Error(helloString))).to.not.throw();
    expect(() => assertIsError(helloString)).to.throw(helloString);
  });
});
