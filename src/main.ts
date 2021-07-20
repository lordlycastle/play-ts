import { flow, pipe } from 'fp-ts/function';
import { Errors } from 'io-ts';
import { curry } from 'ramda';
import { MarkOptional } from 'ts-essentials';
import { llog } from './shared/llog';
import { apS, flatten } from 'fp-ts/Array';
import {
  Fail,
  Validation,
} from './shared/esh.lib.fphelpers/fptswrappers/validation';

type CheckExtends<T, K> = T extends K ? true : never;

// Object Types
type Oa = {
  a: string;
  b: number;
};
type Ob = {
  b: number;
  c: boolean;
};
type A = 11 | 22 | 3 | 4;
type B = 1 | 2 | 4;

export type ExcludeMatchingProperties<T, V> = Pick<
  T,
  { [K in keyof T]: T[K] extends V ? never : K }[keyof T]
>;
type _Exclude<T, K extends T> = Exclude<T, K>;
type _Omit<T, K extends keyof T> = Omit<T, K>;

type EMP = ExcludeMatchingProperties<Oa, string>;
type EMPa = ExcludeMatchingProperties<Oa, 'a' | 'b'>;

/**
 * Exclude from T those types that are assignable to U
 */

const x: ExcludeMatchingProperties<A, B> = 4;
llog(x);

// apS from fp-ts
export declare const myApS: <N, A, B>(
  name: Exclude<N, keyof A>,
  fb: B[]
) => (
  fa: A[]
) => { readonly [K in (N | keyof A) & string]: K extends keyof A ? A[K] : B }[];

// apS from fp-ts Either

// llog(apS());

const someFlag: boolean | undefined = true;

async function flowCurried(): Promise<string> {
  // Q: HOW does this work? The curry from both requests 3 or 2 args?
  return flow(
    curry(
      someFlag
        ? (a: string, b: number, c: boolean) => `${a}-${b}-${String(c)}`
        : (b: number, c: boolean) => `$NO-a//-${b}-${String(c)}`
    )
  )(1, false);
}

// llog(await flowCurried());

// This should make all picked required...
type PickWhereValue<T, K extends keyof T> = {
  [Key in K]-?: T[Key] extends null | undefined ? never : T[Key];
};
type OptionalConditions = { a?: string; b?: number };
let pickedFromOptional: PickWhereValue<OptionalConditions, 'a' | 'b'>;
pickedFromOptional = {};
llog(pickedFromOptional);
// Now how do you do this based on value.
const whereOptional: OptionalConditions = { a: 'xyz', b: 21 };
// const where: PickWhereValue<OptionalConditions, Object.keys(whereOptional)>

// const x = this.getItem(id)
//   .cata<Validation<Errors, { item: Oa; updated: boolean }>>(
//     (err) => Fail(err),
//     (item) => {
//       const updated = this.udpate(item);
//       return {item, updated};
//     }
//   )
//   .failMap((err) => console.log(error))
//   .validateWithDecoder(UpdatedItem);


type Apple = Validation<string, {a: string}>;
type Boy = Validation<string, { b: number }>;
function call(): Apple {
  const a: Apple = Fail('failed apple');
  const b: Boy = Fail('failed boy');
  if (b.isFail()) {
    return b;
  }
  return a;
}
console.log(call().wrapped);
