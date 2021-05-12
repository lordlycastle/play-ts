import * as t from 'io-ts';
import { intersectAndMakeMandatory } from './intersectAndMakeMandatory';
import { validateWithDecoder } from '../validation/validateWithDecoder';
import { expect } from '../expectations.spec';

describe('intersectAndMakeMandatory', () => {
  const optional = t.partial(
    {
      hello: t.string,
    },
    'TestOptional'
  );

  const mandatory = t.type(
    {
      world: t.number,
    },
    'TestMandatory'
  );

  it('should set name', () => {
    expect(intersectAndMakeMandatory(mandatory, optional).name).to.match(
      /^TestMandatory_and_TestOptional.*/
    );
  });

  it('should combine properties and make optional props mandatory', () => {
    const intersection = t.intersection([optional, mandatory]);
    const intersectionAllMandatory = intersectAndMakeMandatory(mandatory, optional);

    const withoutOptional = {
      world: 42,
    };
    const withOptionalSetToUndefined = {
      hello: undefined,
      world: 42,
    };
    const withOptional = {
      hello: 'foo',
      world: 42,
    };

    const validateIntersection = validateWithDecoder(intersection);
    const validateIntersectionAllMandatory = validateWithDecoder(intersectionAllMandatory);

    expect(validateIntersection(withoutOptional).isSuccess()).to.eq(true);
    expect(validateIntersection(withOptionalSetToUndefined).isSuccess()).to.eq(true);
    expect(validateIntersection(withOptional).isSuccess()).to.eq(true);
    expect(validateIntersectionAllMandatory(withoutOptional).isFail()).to.eq(true);
    expect(validateIntersectionAllMandatory(withOptionalSetToUndefined).isFail()).to.eq(true);
    expect(validateIntersectionAllMandatory(withOptional).successOrThrow()).to.deep.equal(
      withOptional
    );
  });
});
