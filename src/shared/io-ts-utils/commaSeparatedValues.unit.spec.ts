import * as t from 'io-ts';
import { expect } from '../expectations.spec';
import { validateWithDecoder } from '../validation/validateWithDecoder';
import { CommaSeparatedValues } from './commaSeparatedValues';

describe('CommaSeparatedValues', () => {
  const UnionCodec = t.union(
    [t.literal('value1'), t.literal('value2'), t.literal('value3')],
    'TestValue'
  );
  const TestCodec = CommaSeparatedValues(UnionCodec);

  it('success', () => {
    const validated = validateWithDecoder(TestCodec)('value1,value3').successOrThrow();
    expect(validated).to.deep.equal(['value1', 'value3']);
  });

  it('fail', () => {
    expect(() => validateWithDecoder(TestCodec)('value2,somethingElse').successOrThrow()).to.throw(
      /Invalid value .* CommaSeparatedTestValueValues/
    );
  });
});
