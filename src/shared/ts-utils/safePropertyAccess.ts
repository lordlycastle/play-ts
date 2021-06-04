import { hasOwnProperty as recordHasOwnProperty } from 'fp-ts/lib/Record';
import * as t from 'io-ts';
import {
  fromUndefined,
  Maybe, None,
  Some,
} from '../esh.lib.fphelpers/fptswrappers/maybe';
import { validateWithDecoder } from '../validation/validateWithDecoder';

export function get(prop: string): (u: unknown) => Maybe<unknown>;
export function get<T = unknown, S = T>(
  prop: string,
  codec: t.Type<T, S>
): (u: unknown) => Maybe<T>;
export function get<T = unknown, S = T>(
  prop: string,
  codec?: t.Type<T, S>
): (u: unknown) => Maybe<T> | Maybe<unknown> {
  const path = prop.split('.');
  return (u: unknown) => {
    if (path.length === 1) {
      if (codec) {
        return getAndValidateProp(u, prop, codec);
      }
      if (t.array(t.unknown).is(u) && !isNaN(Number.parseInt(prop))) {
        return u[Number.parseInt(prop)] ? Some(u[Number.parseInt(prop)]) : None();
      }
      return getAndValidateProp(u, prop, t.unknown);
    }
    const nestedPath = path.slice(1).join('.');
    return get(path[0])(u).flatMap(codec ? get(nestedPath, codec) : get(nestedPath));
  };
}

const hasKey = <T, P extends string>(obj: T, key: P): obj is T & { [Prop in P]: unknown } =>
  Object.getOwnPropertyNames(obj).includes(key);

function getAndValidateProp<T = unknown, S = T>(u: unknown, prop: string, codec: t.Type<T, S>) {
  if (t.array(t.unknown).is(u) && !isNaN(Number.parseInt(prop))) {
    return validateWithDecoder(codec)(u[Number.parseInt(prop)]).toMaybe();
  }
  if (t.record(t.string, t.unknown).is(u) && recordHasOwnProperty(prop, u)) {
    return validateWithDecoder(codec)(u[prop]).toMaybe();
  }

  if (u instanceof Error && hasKey(u, prop)) {
    return fromUndefined(u[prop]);
  }

  return None();
}
