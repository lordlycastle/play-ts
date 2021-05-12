import { WithFallback } from './withFallback';
import * as t from 'io-ts';
import { isLeft, isRight } from 'fp-ts/lib/Either';
import { expect } from '../expectations.spec';

describe('WithFallback', () => {
  const fallback = '42';
  const testCodec = WithFallback(t.string, fallback);
  it('should use fallback when needed', () => {
    const ok = testCodec.decode('hello');
    const okWithFallback = testCodec.decode(undefined);
    const notOk = testCodec.decode(42);
    if (!isRight(ok) || !isRight(okWithFallback)) {
      return expect.fail('Validation should have passed');
    }
    expect(ok.right).to.eq('hello');
    expect(okWithFallback.right).to.eq(fallback);
    return expect(isLeft(notOk)).to.eq(true);
  });
});
