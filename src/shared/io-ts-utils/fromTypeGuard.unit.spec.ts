import { keys } from 'ramda';
import { FromTypeGuard } from './fromTypeGuard';
import { expect } from '../expectations.spec';
import { validateWithDecoder } from '../validation/validateWithDecoder';

describe('FromTypeGuard', () => {
  const testGuard = (u: unknown): u is { a: unknown } => keys(u).includes('a');

  const testCodec = FromTypeGuard(testGuard);
  const testValidator = validateWithDecoder(testCodec);

  it('should work as expected', () => {
    const ok = { a: 'hello' };
    const alsoOk = { a: 'hello', b: 'world' };
    const notOk = { b: 42 };
    const alsoNotOk = 'something else';

    expect(testValidator(ok).successOrThrow()).to.deep.equal(ok);
    expect(testValidator(alsoOk).successOrThrow()).to.deep.equal(alsoOk);
    expect(testValidator(notOk).isFail()).to.eq(true);
    expect(testValidator(alsoNotOk).isFail()).to.eq(true);
    expect(testCodec.name).to.eq('testGuard');
  });
});
