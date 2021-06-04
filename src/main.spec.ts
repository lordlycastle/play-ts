import { flow } from 'fp-ts/function';
import { curry } from 'ramda';
import * as sinon from 'sinon';
import { ExcludeMatchingProperties } from './main';
import { expect } from './shared/expectations.spec';

describe('main.ts', function () {
  describe('_sample', () => {
    it('should pass', function () {
      expect(true).to.be.true;
    });
  });

  it('should exclude the mentioned properties', function () {
    // Why is the type of this var ..., number>.
    // It should be all numbers except  1
    const excludeMatchingProperties: ExcludeMatchingProperties<
    { a: 1, b: 2, c: 3 },
      Exclude<number, 1>
    > = { a: 1, b: 2, c: 3 };
    expect(excludeMatchingProperties).to.be.deep.equal({ a: 1 });
  });
});

describe('stubbing curried functions', function () {
  const _ = {
    threeArgFunc: (a: string, b: string, c: number) => `${a}-${b}-${c}`,
    twoArgFunc: (b: string, c: number) => `${b}***${c}`,
  };

  function testFunction(addSuffix?: boolean, b: string = 'hello', c: number = 42): string {
    const curriedFunc = addSuffix
      ? curry(_.threeArgFunc)(`suffix: ${addSuffix} //`)
      : curry(_.twoArgFunc);
    return flow(curriedFunc)(b, c);
  }

  it('should add suffix', function () {
    const suffixResult: string = 'suffix: true // ...';
    const threeArgFuncStub = sinon
      .stub(_, 'threeArgFunc')
      .resolves(suffixResult);
    const result = testFunction(true);
    expect(result).to.eql(suffixResult);
    expect(threeArgFuncStub.calledOnce).to.be.true;
  });

  it('should not add suffix', function () {
    const expResult: string = '...';
    const twoArgFuncStub = sinon.stub(_, 'twoArgFunc').resolves(expResult);
    const result = testFunction(true);
    expect(result).to.eql(result);
    expect(twoArgFuncStub.calledOnce).to.be.true;
  });
  it('should not add suffix ... using calls', function () {
    const twoArgFuncStub = sinon.stub(_, 'twoArgFunc').callsFake((b: string, c: number) => `${b}***${c}`);
    const result = testFunction(true);
    expect(result).to.eql('hello***42');
    expect(twoArgFuncStub.calledOnce).to.be.true;
  });
});
