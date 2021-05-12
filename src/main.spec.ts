import { expect } from './shared/expectations.spec';
import { ExcludeMatchingProperties } from './main';

describe('main.ts', function() {
  it('should exclude the mentioned properties', function() {
    const wholeObject = {a: 1, b: 2, c: 3};
    const excludeMatchingProperties: ExcludeMatchingProperties<typeof wholeObject, 'b' | 'c'> = wholeObject;
    expect({a: 1}).to.be.deep.equal(excludeMatchingProperties)
  });
});
