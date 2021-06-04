import { flow, pipe } from 'fp-ts/function';
import { curry } from 'ramda';
import { llog } from './shared/llog';
import { apS, flatten } from 'fp-ts/Array';


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
// export declare const myApS: <N, A, B>(
//   name: Exclude<N, keyof A>,
//   fb: B[]
// ) => (
//   fa: A[]
// ) => { readonly [K in N | keyof A]: K extends keyof A ? A[K] : B }[];

// llog(apS())

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
