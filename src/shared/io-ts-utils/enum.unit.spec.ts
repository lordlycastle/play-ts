import { getEnumFromStringCodec } from './enum';
import { isRight } from 'fp-ts/lib/Either';
import { expect } from '../expectations.spec';

describe('EnumFromString', () => {
  enum TestEnum {
    THIS = 'IS',
    A = 'TEST',
  }

  type TestSpec = {
    input: unknown;
    expectedToPass: boolean;
    description: string;
  };

  const EnumCodec = getEnumFromStringCodec(TestEnum);

  const testSpecs: TestSpec[] = [
    {
      input: 'TEST',
      expectedToPass: true,
      description: 'valid enum value as string',
    },
    {
      input: TestEnum.THIS,
      expectedToPass: true,
      description: 'valid enum value',
    },
    {
      input: 'A',
      expectedToPass: false,
      description: 'invalid string value',
    },
    {
      input: 123,
      expectedToPass: false,
      description: 'value that is not a string',
    },
  ];

  testSpecs.forEach(spec => {
    it(`for ${spec.description}`, () => {
      expect(EnumCodec.is(spec.input)).to.eq(spec.expectedToPass);
      const res = EnumCodec.decode(spec.input);
      expect(isRight(res)).to.eq(spec.expectedToPass);
      if (spec.expectedToPass && isRight(res)) {
        expect(res.right).to.eq(spec.input);
      }
    });
  });
});
