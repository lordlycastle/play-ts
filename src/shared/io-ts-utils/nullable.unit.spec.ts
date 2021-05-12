import * as t from 'io-ts';
import { Nullable } from './nullable';
import { expect } from '../expectations.spec';
import { validateWithDecoder } from '../validation/validateWithDecoder';

describe('Nullable', () => {
  const testCodec = Nullable(t.string);
  it('should allow null values', () => {
    expect(validateWithDecoder(testCodec)('hello').successOrThrow()).to.eq('hello');
    expect(validateWithDecoder(testCodec)(null).successOrThrow()).to.be.null;
    expect(validateWithDecoder(testCodec)(1).isFail()).to.eq(true);
  });

  it('should have meaningful name', () => {
    expect(testCodec.name).to.eq(`Nullable${t.string.name}`);
  });
});
