import { expect } from '../expectations.spec';
import { parseOrThrow } from './parseOrThrow';
import * as t from 'io-ts';

describe('parseOrThrow', () => {
  it('throws on parsing error', () => {
    expect(() => parseOrThrow(t.string, 5)).throws(
      '[\n    "Invalid value 5 supplied to : string"\n]'
    );
  });
  it('succeeds for good value', () => {
    expect(parseOrThrow(t.string, 'foobar')).to.eq('foobar');
  });
});
