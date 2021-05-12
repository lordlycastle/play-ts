import { expect } from '../expectations.spec';
import {
  NumberGreaterThan,
  NumberGreaterThanFromString,
  NumberWithPredicateFromString,
  PositiveIntegerFromString,
  PositiveNumber,
  PositiveNumberFromString,
  StrictlyPositiveIntegerFromString,
  StrictlyPositiveNumber,
  StrictlyPositiveNumberFromString,
} from './numbers';
import { isLeft, isRight, Right } from 'fp-ts/lib/Either';
import { validateWithDecoder } from '../validation/validateWithDecoder';

describe('numbers', () => {
  it('PositiveNumber', () => {
    [-1, '42'].forEach(number => {
      expect(isLeft(PositiveNumber.decode(number))).to.eq(true);
    });
    [0, 42].forEach(number => {
      expect(isRight(PositiveNumber.decode(number))).to.eq(true);
      expect((PositiveNumber.decode(number) as Right<number>).right).to.eq(number);
    });
  });

  it('StrictlyPositiveNumber', () => {
    [-1, '42', 0].forEach(number => {
      expect(isLeft(StrictlyPositiveNumber.decode(number))).to.eq(true);
    });
    expect(isRight(StrictlyPositiveNumber.decode(1))).to.eq(true);
    expect((StrictlyPositiveNumber.decode(1) as Right<number>).right).to.eq(1);
  });

  it('PositiveNumberFromString', () => {
    expect(isLeft(PositiveNumberFromString.decode('-1'))).to.eq(true);
    expect(isRight(PositiveNumberFromString.decode('42'))).to.eq(true);
    expect((PositiveNumberFromString.decode('42') as Right<number>).right).to.eq(42);
  });

  it('StrictlyPositiveNumberFromString', () => {
    ['-1', '0'].forEach(numberAsStr => {
      expect(isLeft(StrictlyPositiveNumberFromString.decode(numberAsStr))).to.eq(true);
    });
    expect(isRight(StrictlyPositiveNumberFromString.decode('42'))).to.eq(true);
    expect((StrictlyPositiveNumberFromString.decode('42') as Right<number>).right).to.eq(42);
  });

  it('PositiveIntegerFromString', () => {
    ['-1', '1.1', 'NaN'].forEach(str => {
      expect(isLeft(PositiveIntegerFromString.decode(str))).to.eq(true);
    });
    expect(isRight(PositiveIntegerFromString.decode('42'))).to.eq(true);
    expect((PositiveIntegerFromString.decode('42') as Right<number>).right).to.eq(42);
  });

  it('StrictlyPositiveIntegerFromString', () => {
    ['-1', '0', '1.1', 'NaN'].forEach(numberAsStr => {
      expect(isLeft(StrictlyPositiveIntegerFromString.decode(numberAsStr))).to.eq(true);
    });
    expect(isRight(StrictlyPositiveIntegerFromString.decode('42'))).to.eq(true);
    expect((StrictlyPositiveIntegerFromString.decode('42') as Right<number>).right).to.eq(42);
  });

  it('NumberGreaterThan', () => {
    [2, 3].forEach(number => {
      expect(isLeft(NumberGreaterThan(3).decode(number))).to.eq(true);
    });
    expect(isRight(NumberGreaterThan(3).decode(4))).to.eq(true);
    expect((NumberGreaterThan(3).decode(4) as Right<number>).right).to.eq(4);
  });

  it('NumberGreaterThanFromString', () => {
    ['2', '3', 'NaN', true].forEach(number => {
      expect(isLeft(NumberGreaterThanFromString(3).decode(number))).to.eq(true);
    });
    expect(isRight(NumberGreaterThanFromString(3).decode('4'))).to.eq(true);
    expect((NumberGreaterThanFromString(3).decode('4') as Right<number>).right).to.eq(4);
  });

  it('NumberWithPredicateFromString', () => {
    const isPositive = (n: number): boolean => n >= 0;
    ['-1', 'NaN', true].forEach((number: unknown) => {
      expect(isLeft(NumberWithPredicateFromString(isPositive).decode(number))).to.eq(true);
      expect(NumberWithPredicateFromString(isPositive).is(number)).to.eq(false);
    });
    const success = validateWithDecoder(NumberWithPredicateFromString(isPositive))('2');
    expect(success.successOrThrow()).to.eq(2);
    expect(NumberWithPredicateFromString(isPositive).is('2')).to.eq(true);
    expect(NumberWithPredicateFromString(isPositive).encode(2)).to.eq('2');
  });
});
