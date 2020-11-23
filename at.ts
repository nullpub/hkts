import type { Lens } from "./lens.ts";

import * as O from "./option.ts";
import * as R from "./record.ts";

/***************************************************************************************************
 * @section Models
 **************************************************************************************************/

export type At<S, I, A> = {
  readonly at: (i: I) => Lens<S, A>;
};

/***************************************************************************************************
 * @section Instance Getters
 **************************************************************************************************/

export const atRecord = <A = never>(): At<
  Readonly<Record<string, A>>,
  string,
  O.Option<A>
> => ({
  at: (key) => ({
    get: (r) => O.fromNullable(r[key]),
    set: O.fold(
      (a) => R.insertAt(key, a),
      () => R.deleteAt(key),
    ),
  }),
});

export const atMap = <A = never>(): At<
  Map<string, A>,
  string,
  O.Option<A>
> => ({
  at: (key) => ({
    get: (m) => O.fromNullable(m.get(key)),
    set: O.fold(
      (a) => (m) => m.set(key, a),
      () =>
        (m) => {
          m.delete(key);
          return m;
        },
    ),
  }),
});
