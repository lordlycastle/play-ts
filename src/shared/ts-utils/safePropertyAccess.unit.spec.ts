import { expect } from '../expectations.spec';
import { get } from './safePropertyAccess';
import * as t from 'io-ts';

describe('safePropertyAccess', () => {
  const test: unknown = {
    hello: 'world',
    some: { nested: 'property' },
    other: {
      someArray: [{ someElement: 'theElement' }],
    },
  };
  const nestedPath = 'some.nested';

  it('get property', () => {
    expect(get('hello')(test).orUndefined()).to.eq('world');
    expect(get('some')(test).flatMap(get('nested')).orUndefined()).to.eq('property');
    expect(get(nestedPath)(test).orUndefined()).to.eq('property');
    expect(get('some.other.prop')(test).isNone()).to.eq(true);
    expect(get('nonexisting')(test).isNone()).to.eq(true);
  });

  it('get property validated', () => {
    expect(get(nestedPath, t.string)(test).orUndefined()).to.eq('property');
    expect(get(nestedPath, t.number)(test).isNone()).to.eq(true);
    expect(get('some.other.prop', t.unknown)(test).isNone()).to.eq(true);
  });

  it('get property from array', () => {
    const pathWithArray = 'other.someArray.0.someElement';
    expect(get(pathWithArray, t.string)(test).orUndefined()).to.eq('theElement');
    expect(get(pathWithArray, t.number)(test).isNone()).to.eq(true);
    expect(get(pathWithArray)(test).orUndefined()).to.eq('theElement');
  });

  it('get property from array with index out of bound should give undefined', () => {
    expect(get('other.someArray.2.someElement')(test).orUndefined()).to.be.undefined;
  });

  it('should cope with undefined values correctly', () => {
    expect(get('someProp')(undefined).isNone()).to.eq(true);
    expect(get('someProp', t.string)(undefined).isNone()).to.eq(true);
  });

  it('should cope with errors correctly', () => {
    const testErrMsg = 'Test Error';
    const test = new Error(testErrMsg);
    expect(get('message', t.string)(test).orUndefined()).to.eq(testErrMsg);
  });

  it('should deal with nested error', () => {
    class TestError extends Error {
      constructor(msg: string, public nested: { a: { b: string } }) {
        super(msg);
      }
    }
    const testErrMsg = 'Test Error';
    const test = {
      prop: {
        with: new TestError(testErrMsg, { a: { b: 'hello world' } }),
      },
    };
    expect(get('prop.with.nested.a.b', t.string)(test).orUndefined()).to.eq('hello world');
    // inherited prop
    expect(get('prop.with.message', t.string)(test).orUndefined()).to.eq(testErrMsg);
  });
});
