import { None, Some } from '../esh.lib.fphelpers/fptswrappers/maybe';
import { expect } from '../expectations.spec';
import { addOptionalProperties, addOptionalProperty } from './setProperty';

describe('setProperty', () => {
  type Test = {
    a: string;
    b?: string;
    c?: number;
    d?: number;
  };

  it('add optional property', () => {
    const test: Test = { a: 'hello' };
    expect(addOptionalProperty(test, 'b', None())).to.deep.equal(test);
    expect(addOptionalProperty(test, 'b', Some('world'))).to.deep.equal({ ...test, b: 'world' });
  });

  it('add optional properties', () => {
    const test: Test = { a: 'hello' };
    expect(
      addOptionalProperties(test, {
        b: Some('world'),
        c: Some(42),
        d: None(),
      })
    ).to.deep.equal({ ...test, b: 'world', c: 42 });
  });
});
