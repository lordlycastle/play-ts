import { expect } from '../expectations.spec';
import { hasProperty } from './hasProperty';

describe('hasProperty', () => {
  it('should check for property', () => {
    const testObject = { hello: 'world' };
    expect(hasProperty(testObject, 'hello')).to.eq(true);
    expect(hasProperty(testObject, 'world')).to.eq(false);
  });
});
