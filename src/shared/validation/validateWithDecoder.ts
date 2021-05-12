import { pipe } from 'fp-ts/lib/pipeable';
import * as t from 'io-ts';
import { failure } from 'io-ts/lib/PathReporter';
import {
  fromEither,
  Validation,
} from '../esh.lib.fphelpers/fptswrappers/validation';

export function validateWithDecoder<T, S = unknown, E = never>(
  decoder: t.Type<T, S>
): (u: unknown) => Validation<string, T>;
export function validateWithDecoder<T, S = unknown, E = never>(
  decoder: t.Type<T, S>,
  errorProducer: (msg: string) => E
): (u: unknown) => Validation<E, T>;
export function validateWithDecoder<T, S = unknown, E = never>(
  decoder: t.Type<T, S>,
  errorProducer?: (msg: string) => E
): (u: unknown) => Validation<string, T> | Validation<E, T> {
  return (u: unknown): Validation<string, T> | Validation<E, T> => {
    const res = fromEither(pipe(decoder.decode(u)))
      .failMap(failure)
      .failMap(strs => strs.join(','));
    return errorProducer ? res.failMap(errorProducer) : res;
  };
}
