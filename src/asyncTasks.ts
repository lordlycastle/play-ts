import {
  Either,
  left as eitherLeft,
  right as eitherRight,
} from 'fp-ts/lib/Either';
import {
  chain,
  chainEitherK, fold,
  left,
  mapLeft,
  right,
  TaskEither,
  tryCatch,
} from 'fp-ts/lib/TaskEither';
import { pipe } from 'fp-ts/lib/function';
import { llog } from './shared/llog';

const wait = (ms: number): Promise<void> =>
  new Promise((res) => setTimeout(res, ms));

function fakeAxiosGet(): Promise<unknown> {
  return Promise.reject('hello world');
}

function validate(u: unknown): Either<Error, string> {
  return typeof u === 'string' && u.startsWith('h')
    ? eitherRight(u)
    : eitherLeft(new Error('not a string'));
}

function followUp(str: string): TaskEither<Error, string> {
  if (str.length > 5) {
    return right(str);
  } else {
    return left(new Error('blubb'));
  }
}

async function main() {
  const test = pipe(
    tryCatch(
      () => fakeAxiosGet(),
      (reason) => {
        return reason instanceof Error ? reason : new Error(JSON.stringify(reason));
      }
    ),
    chainEitherK(validate),
    chain(followUp),
    mapLeft(err => err.message)
    // fold(e => `${e}---`, a => console.log(a))
  );

  const result: Promise<Either<string, string>> = test();
  const output = await result;
  llog(JSON.stringify(output));
}

main().catch(err => {
  console.log(err);
})
