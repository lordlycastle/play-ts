import * as t from 'io-ts';

export const intersectAndMakeMandatory = <T extends t.Props, S extends t.Props>(
  mandatory: t.TypeC<T>,
  optional: t.PartialC<S>
): t.TypeC<T & S> =>
  t.type(
    {
      ...mandatory.props,
      ...optional.props,
    },
    `${mandatory.name}_and_${optional.name}_all_mandatory`
  );
