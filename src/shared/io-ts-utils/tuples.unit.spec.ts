import { expect } from '../expectations.spec';
import { isRight, Right } from 'fp-ts/lib/Either';
import { ExactTuple } from './tuples';
import * as t from 'io-ts';

describe('ExactTuple', () => {
  it('typeguards', () => {
    expect(ExactTuple([t.number]).is([1])).to.eq(true);
    expect(ExactTuple([t.number]).is([2, 3])).to.eq(false);
  });

  it('should pass', () => {
    const res = ExactTuple([t.string]).decode(['hello']);
    expect(isRight(res)).to.eq(true);
    expect((res as Right<[string]>).right[0]).to.eq('hello');
  });

  it('should fail', () => {
    expect(isRight(ExactTuple([t.string]).decode(['hello', 'world']))).to.eq(false);
  });
});
