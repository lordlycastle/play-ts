import { expect } from '../testing/expectations';
import { arraySemigroup, stringSemigroup } from './semigroups';

describe('semigroups', () => {
  it('string semigroup', () => {
    expect(stringSemigroup('--').concat('hello', 'world')).to.eq('hello--world');
  });

  it('array semigroup', () => {
    expect(arraySemigroup.concat([1], [2, 3])).to.eql([1, 2, 3]);
  });
});
