import type { _ } from "./hkts.ts";

import { pipe, Refinement } from "./fns.ts";
import * as S from "./schemable.ts";

/***************************************************************************************************
 * @section Types
 **************************************************************************************************/

export interface Guard<I, A extends I> {
  is: Refinement<I, A>;
}

export type InputOf<D> = D extends Guard<infer I, any> ? I : never;

export type TypeOf<D> = D extends Guard<any, infer A> ? A : never;

/***************************************************************************************************
 * @section Guard Schemables
 **************************************************************************************************/

export const literal = <A extends readonly [S.Literal, ...S.Literal[]]>(
  ...values: A
): Guard<unknown, A[number]> => ({
  is: (u: unknown): u is A[number] => values.findIndex((a) => a === u) !== -1,
});

export const string: Guard<unknown, string> = {
  is: (u: unknown): u is string => typeof u === "string",
};

export const number: Guard<unknown, number> = {
  is: (u: unknown): u is number => typeof u === "number" && !isNaN(u),
};

export const boolean: Guard<unknown, boolean> = {
  is: (u: unknown): u is boolean => typeof u === "boolean",
};

export const unknownArray: Guard<unknown, Array<unknown>> = {
  is: Array.isArray,
};

export const unknownRecord: Guard<unknown, Record<string, unknown>> = {
  is: (u: unknown): u is Record<string, unknown> =>
    Object.prototype.toString.call(u) === "[object Object]",
};

export const refine = <I, A extends I, B extends A>(
  refinement: (a: A) => a is B,
) =>
  (
    from: Guard<I, A>,
  ): Guard<I, B> => ({
    is: (i: I): i is B => from.is(i) && refinement(i),
  });

export const nullable = <I, A extends I>(
  or: Guard<I, A>,
): Guard<null | I, null | A> => ({
  is: (i): i is null | A => i === null || or.is(i),
});

export const type = <A>(
  properties: { [K in keyof A]: Guard<unknown, A[K]> },
): Guard<unknown, { [K in keyof A]: A[K] }> =>
  pipe(
    unknownRecord,
    refine((r): r is {
      [K in keyof A]: A[K];
    } => {
      for (const k in properties) {
        if (!(k in r) || !properties[k].is(r[k])) {
          return false;
        }
      }
      return true;
    }),
  );

export const partial = <A>(
  properties: { [K in keyof A]: Guard<unknown, A[K]> },
): Guard<unknown, Partial<{ [K in keyof A]: A[K] }>> =>
  pipe(
    unknownRecord,
    refine((r): r is Partial<A> => {
      for (const k in properties) {
        const v = r[k];
        if (v !== undefined && !properties[k].is(v)) {
          return false;
        }
      }
      return true;
    }),
  );

export const array = <A>(item: Guard<unknown, A>): Guard<unknown, Array<A>> =>
  pipe(
    unknownArray,
    refine((us): us is Array<A> => us.every(item.is)),
  );

export const record = <A>(
  codomain: Guard<unknown, A>,
): Guard<unknown, Record<string, A>> =>
  pipe(
    unknownRecord,
    refine((r): r is Record<string, A> => {
      for (const k in r) {
        if (!codomain.is(r[k])) {
          return false;
        }
      }
      return true;
    }),
  );

export const tuple = <A extends ReadonlyArray<unknown>>(
  ...components: { [K in keyof A]: Guard<unknown, A[K]> }
): Guard<unknown, A> => ({
  is: (u): u is A =>
    Array.isArray(u) && u.length === components.length &&
    components.every((c, i) => c.is(u[i])),
});

export const intersect = <A, B>(
  left: Guard<unknown, A>,
  right: Guard<unknown, B>,
): Guard<unknown, A & B> => ({
  is: (u: unknown): u is A & B => left.is(u) && right.is(u),
});

export const union = <A extends readonly [unknown, ...Array<unknown>]>(
  ...members: { [K in keyof A]: Guard<unknown, A[K]> }
): Guard<unknown, A[number]> => ({
  is: (u: unknown): u is A | A[number] => members.some((m) => m.is(u)),
});

export const lazy = <A>(f: () => Guard<unknown, A>): Guard<unknown, A> => {
  const get = S.memoize<void, Guard<unknown, A>>(f);
  return {
    is: (u: unknown): u is A => get().is(u),
  };
};

export const alt = <I, A extends I>(that: () => Guard<I, A>) =>
  (me: Guard<I, A>): Guard<I, A> => ({
    is: (i): i is A => me.is(i) || that().is(i),
  });

export const zero = <I, A extends I>(): Guard<I, A> => ({
  is: (_): _ is A => false,
});

export const compose = <I, A extends I, B extends A>(to: Guard<A, B>) =>
  (from: Guard<I, A>): Guard<I, B> => ({
    is: (i): i is B => from.is(i) && to.is(i),
  });

export const id = <A>(): Guard<A, A> => ({
  is: (_): _ is A => true,
});

export const sum = <T extends string, A>(
  tag: T,
  members: { [K in keyof A]: Guard<unknown, A[K]> },
): Guard<unknown, A[keyof A]> =>
  pipe(
    unknownRecord,
    refine((r): r is any => {
      const v = r[tag] as keyof A;
      if (v in members) {
        return members[v].is(r);
      }
      return false;
    }),
  );

/***************************************************************************************************
 * @section Guard Schemable
 **************************************************************************************************/

export const Schemable: S.Schemable<Guard<unknown, _>> = {
  literal,
  string: () => string,
  number: () => number,
  boolean: () => boolean,
  nullable: nullable,
  type,
  partial,
  record,
  array,
  tuple: tuple as S.TupleSchemable<Guard<unknown, _>, 1>,
  intersect,
  sum,
  lazy: (_, f) => lazy(f),
};
