import type { Semigroup } from "./type_classes.ts";

import { identity } from "./fns.ts";

export const getFirstSemigroup = <A = never>(): Semigroup<A> => ({
  concat: identity,
});

export const getLastSemigroup = <A = never>(): Semigroup<A> => ({
  concat: (_, b) => b,
});

export const getArraySemigroup = <A = never>(): Semigroup<A[]> => ({
  concat: (as, bs) => as.concat(bs),
});
