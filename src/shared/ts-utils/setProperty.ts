import { assignWith, omitBy } from 'lodash';
import { Maybe, SomeMaybe } from '../esh.lib.fphelpers/fptswrappers/maybe';

export const addOptionalProperty = <T, K extends keyof T = keyof T>(
  o: T,
  key: K,
  prop: Maybe<T[K]>
): T => prop.map((p: T[K]): T => ({ ...o, [key]: p })).orJust(o);

export const addOptionalProperties = <T>(o: T, props: { [K in keyof T]?: Maybe<T[K]> }): T =>
  assignWith(
    o,
    omitBy(props, <S>(m?: Maybe<S>) => m === undefined || m.isNone()),
    <S>(_: S, m: SomeMaybe<S>) => m.some()
  );
