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
      { a: 1; b: 2; c: 3 },
      Exclude<number, 1>
    > = { a: 1, b: 2, c: 3 };
    expect(excludeMatchingProperties).to.be.deep.equal({ a: 1 });
  });
});

describe('stubbing curried functions', function () {
  beforeEach(() => {
    sinon.restore();
  });

  const _ = {
    threeArgFunc: (a: string, b: string, c: number) => `${a}-${b}-${c}`,
    twoArgFunc: (b: string, c: number) => `${b}***${c}`,
    // threeArgsCurried: (b: string, c: number) =>
    //   curry(_.threeArgFunc)('suffix:')(b)(c),
  };

  function testFunction(
    addSuffix?: boolean,
    b: string = 'hello',
    c: number = 42
  ): string {
    const curriedFunc = addSuffix
      ? curry(_.threeArgFunc)('suffix:')
      : curry(_.twoArgFunc);
    return flow(curriedFunc)(b, c);
  }



  it('should add suffix', function () {
    const b = 'hi';
    const c = 41;
    const suffixResult: string = `suffix:-${b}-${c}`;
    const threeArgFuncStub = sinon
      .stub(_, 'threeArgFunc')
      .callsFake((a, b, c) => `${a}-${b}-${c}`);
    const result = testFunction(true, b, c);
    expect(result).to.eql(suffixResult);
    expect(threeArgFuncStub.calledOnce).to.be.true;
  });

  it('should not add suffix', function () {
    const b = 'hi';
    const c = 41;
    const twoArgFuncStub = sinon.stub(_, 'twoArgFunc').callsFake((b, c) => `${b}-${c}`);
    const result = testFunction(false, b, c);
    expect(result).to.eql(`${b}-${c}`);
    expect(twoArgFuncStub.calledOnce).to.be.true;
  });

  it('should not add suffix ... using calls', function () {
    const twoArgFuncStub = sinon
      .stub(_, 'twoArgFunc')
      .callsFake((b: string, c: number) => `${b}***${c}`);
    const result = testFunction(false);
    expect(result).to.eql('hello***42');
    expect(twoArgFuncStub.calledOnce).to.be.true;
  });
});

describe('array expectations', () => {
  it('should contains members', function () {
    const arr = [1, 2, 3];
    expect(arr).to.have.members([1, 2, 3]);
    expect(arr).to.have.members([2, 3, 1]);
    expect(arr).to.include.members([2, 3]);
    expect(arr).to.containSubset([2, 3, 1, 4]);
  });
});
