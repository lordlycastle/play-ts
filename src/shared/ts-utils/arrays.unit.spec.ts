import { expect } from '../expectations.spec';
import { hasNonZeroLength } from './arrays';

describe('arrays', () => {
  it('hasNonZeroLength', () => {
    expect(hasNonZeroLength([1])).to.eq(true);
    expect(hasNonZeroLength([])).to.eq(false);
  });
});
