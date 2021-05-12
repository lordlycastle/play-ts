import { UnionFromValues } from './unionFromArray';
import { expect } from '../expectations.spec';
import { validateWithDecoder } from '../validation/validateWithDecoder';

describe('UnionFromValues', () => {
  const values = ['value1', 'value2', 42];
  const TestCodec = UnionFromValues(values);
  const test = validateWithDecoder(TestCodec);

  it('should fail if not at least two values are supplied', () => {
    expect(() => UnionFromValues(['value'])).to.throw(/Expected array to have length at least 2/);
  });

  it('should build union of literals for each value', () => {
    expect(test('value1').successOrThrow()).to.eq('value1');
    expect(test(42).successOrThrow()).to.eq(42);
    expect(() => test(2).successOrThrow()).to.throw(/Invalid value/);
    expect(() => test('somethingElse').successOrThrow()).to.throw(/Invalid value/);
  });
});
