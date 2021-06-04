import { expect } from '../expectations.spec';
import { assertExhaustiveness } from './assertExhaustiveness';

describe('assertExhaustiveness', () => {
  it('should throw custom error', () => {
    expect(() =>
      assertExhaustiveness(
        (msg: unknown) =>
          new Error(`${typeof msg === 'string' ? msg : 'not a string'}`)
      )('argh' as never)
    ).to.throw(Error, 'argh');
  });

  it('should throw default error', () => {
    expect(() => assertExhaustiveness()('argh' as never)).to.throw(/argh/);
  });
});
