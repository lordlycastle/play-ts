import { Pair } from './pair';
import { expect } from '../testing/expectations';

describe('Pair', () => {
  const fLeft = (str: string): number => str.length;
  const fRight = (n: number): string => `The answer is ${n}`;

  const leftString = 'hello world';
  const rightNo = 42;
  const pair = new Pair(leftString, rightNo);
  const answerString = 'The answer is 42';

  it('map', () => {
    const mapped = pair.map(fRight);
    expect(mapped.getLeft()).to.eq(leftString);
    expect(mapped.getRight()).to.eq(answerString);
  });

  it('mapLeft', () => {
    const leftMapped = pair.mapLeft(fLeft);
    expect(leftMapped.getLeft()).to.eq(leftString.length);
    expect(leftMapped.getRight()).to.eq(rightNo);
  });

  it('bimap', () => {
    const bimapped = pair.bimap(fLeft, fRight);
    expect(bimapped.getLeft()).to.eq(11);
    expect(bimapped.getRight()).to.eq(answerString);
  });
});
