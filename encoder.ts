// deno-lint-ignore-file no-explicit-any

import type * as TC from "./type_classes.ts";
import type { _0, _1 } from "./types.ts";

import { flow, identity, intersect as _intersect, memoize } from "./fns.ts";

/***************************************************************************************************
 * @section Types
 **************************************************************************************************/

export type Encoder<O, A> = {
  readonly encode: (a: A) => O;
};

export type TypeOf<E> = E extends Encoder<any, infer A> ? A : never;

export type OutputOf<E> = E extends Encoder<infer O, any> ? O : never;

/***************************************************************************************************
 * @section Combinators
 **************************************************************************************************/

export const nullable = <O, A>(
  or: Encoder<O, A>,
): Encoder<null | O, null | A> => ({
  encode: (a) => (a === null ? null : or.encode(a)),
});

export const type = <P extends Record<string, Encoder<any, any>>>(
  properties: P,
): Encoder<
  { [K in keyof P]: OutputOf<P[K]> },
  { [K in keyof P]: TypeOf<P[K]> }
> => ({
  encode: (a) => {
    const o: Record<keyof P, any> = {} as any;
    for (const k in properties) {
      o[k] = properties[k].encode(a[k]);
    }
    return o;
  },
});

export const partial = <P extends Record<string, Encoder<any, any>>>(
  properties: P,
): Encoder<
  Partial<{ [K in keyof P]: OutputOf<P[K]> }>,
  Partial<{ [K in keyof P]: TypeOf<P[K]> }>
> => ({
  encode: (a) => {
    const o: Record<keyof P, any> = {} as any;
    for (const k in properties) {
      const v = a[k];
      if (k in a) {
        o[k] = v === undefined ? undefined : properties[k].encode(v);
      }
    }
    return o;
  },
});

export const record = <O, A>(
  codomain: Encoder<O, A>,
): Encoder<Record<string, O>, Record<string, A>> => ({
  encode: (r) => {
    const o: Record<string, O> = {};
    for (const k in r) {
      o[k] = codomain.encode(r[k]);
    }
    return o;
  },
});

export const array = <O, A>(
  item: Encoder<O, A>,
): Encoder<Array<O>, Array<A>> => ({
  encode: (as) => as.map(item.encode),
});

export const tuple = <C extends ReadonlyArray<Encoder<any, any>>>(
  ...components: C
): Encoder<
  { [K in keyof C]: OutputOf<C[K]> },
  { [K in keyof C]: TypeOf<C[K]> }
> => ({
  encode: (as) => components.map((c, i) => c.encode(as[i])) as any,
});

export const intersect = <P, B>(right: Encoder<P, B>) =>
  <O, A>(left: Encoder<O, A>): Encoder<O & P, A & B> => ({
    encode: (ab) => _intersect(left.encode(ab), right.encode(ab)),
  });

export const sum = <T extends string>(
  tag: T,
) =>
  <MS extends Record<string, Encoder<any, any>>>(
    members: MS,
  ): Encoder<OutputOf<MS[keyof MS]>, TypeOf<MS[keyof MS]>> => ({
    encode: (a) => members[a[tag]].encode(a),
  });

export const lazy = <O, A>(f: () => Encoder<O, A>): Encoder<O, A> => {
  const get = memoize<void, Encoder<O, A>>(f);
  return {
    encode: (a) => get().encode(a),
  };
};

/***************************************************************************************************
 * @section Modules
 **************************************************************************************************/

export const Contravariant: TC.Contravariant<Encoder<_0, _1>, 2> = {
  contramap: (fab, tb) => ({ encode: flow(fab, tb.encode) }),
};

export const Category: TC.Category<Encoder<_0, _1>> = {
  compose: (tij, tjk) => Contravariant.contramap(tjk.encode, tij),
  id: () => ({ encode: identity }),
};
