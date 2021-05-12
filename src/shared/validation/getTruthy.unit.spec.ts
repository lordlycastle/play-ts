import { getTruthy } from './getTruthy';
import { expect } from '../expectations.spec';

describe('getTruthy', () => {
  it('works', () => {
    expect(() => getTruthy(null)).to.throw();
    expect(getTruthy('foobar')).to.eq('foobar');
  });
});
