import * as util from 'util';

export function llog(obj: unknown, detailed = true) {
  console.log(
    util.inspect(obj, {
      showHidden: detailed,
      depth: null,
      colors: true,
    })
  );
}
