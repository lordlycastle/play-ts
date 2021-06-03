import { flow } from 'fp-ts/function';
import { curry } from 'ramda';
import { expect } from './shared/expectations.spec';
import { ExcludeMatchingProperties } from './main';
import * as sinon from 'sinon';

describe('main.ts', function() {
  describe('', () => {
    it('should fails', function() {
      expect(true).to.be.false;
    });
  })
  it('should exclude the mentioned properties', function() {
    const wholeObject = {a: 1, b: 2, c: 3};
    const excludeMatchingProperties: ExcludeMatchingProperties<typeof wholeObject, 'b' | 'c'> = wholeObject;
    expect({a: 1}).to.be.deep.equal(excludeMatchingProperties)
  });
});

describe('stubbing curried functions', function() {
  const _ = {
     threeArgFunc: (a: string, b: string, c: number) => `${a}-${b}-${c}`,
    twoArgFunc: (b: string, c: number) => `${b}***${c}`,
  }
   function testFunction(addSuffix?: boolean): string {
     const curriedFunc = addSuffix
       ? curry(_.threeArgFunc)(`suffix: ${addSuffix} //`)
       : curry(_.twoArgFunc)  ;
     return flow(curriedFunc)('hello', 42);
   }

  it('should add suffix', function() {
    const suffixResult: string = 'suffix: true // ...';
    const threeArgFuncStub = sinon.stub(_, 'threeArgFunc').resolves(suffixResult);
    const result = testFunction(true);
    expect(result).to.eql(suffixResult);
    expect(threeArgFuncStub.calledOnce).to.be.true;
  });

  it('should not add suffix', function() {
    const expResult: string = '...';
    const threeArgFuncStub = sinon.stub(_, 'twoArgFunc').resolves(expResult);
    const result = testFunction(true);
    expect(result).to.eql(result);
    expect(threeArgFuncStub.calledOnce).to.be.true;
  });
});
