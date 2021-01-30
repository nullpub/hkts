import type { _, NonEmptyRecord, Refinement } from "../types.ts";

import { identity, memoize, pipe } from "../fns.ts";

import * as S from "./schemable.ts";

/***************************************************************************************************
 * @section Types
 **************************************************************************************************/

export type Guard<I, A extends I> = Refinement<I, A>;

export type InputOf<D> = D extends Guard<infer I, infer _> ? I : never;

export type TypeOf<D> = D extends Guard<infer _, infer A> ? A : never;

/***************************************************************************************************
 * @section Constructors
 **************************************************************************************************/

export const refineUnknown: <A>(
  refinement: Refinement<unknown, A>,
) => Guard<unknown, A> = identity;

/***************************************************************************************************
 * @section Guard Schemables
 **************************************************************************************************/

export const unknown = (u: unknown): u is unknown => true;

export const literal = <A extends readonly [S.Literal, ...S.Literal[]]>(
  ...values: A
): Guard<unknown, A[number]> =>
  (u: unknown): u is A[number] => values.findIndex((a) => a === u) !== -1;

export const string = refineUnknown((u): u is string => typeof u === "string");

export const number = refineUnknown(
  (u): u is number => typeof u === "number" && !isNaN(u),
);

export const boolean = refineUnknown(
  (u): u is boolean => typeof u === "boolean",
);

export const unknownArray = refineUnknown(Array.isArray);

export const unknownRecord = refineUnknown(
  (u): u is Record<string, unknown> =>
    Object.prototype.toString.call(u) === "[object Object]",
);

export const refine = <I, A extends I, B extends A>(
  refinement: (a: A) => a is B,
) =>
  (from: Guard<I, A>): Guard<I, B> =>
    (i: I): i is B => from(i) && refinement(i);

export const nullable = <I, A extends I>(
  or: Guard<I, A>,
): Guard<null | I, null | A> => (i): i is null | A => i === null || or(i);

export const type = <A>(
  properties: NonEmptyRecord<{ [K in keyof A]: Guard<unknown, A[K]> }>,
): Guard<unknown, { [K in keyof A]: A[K] }> =>
  pipe(
    unknownRecord,
    refine((r): r is {
      [K in keyof A]: A[K];
    } => {
      for (const k in properties) {
        if (!(k in r) || !properties[k](r[k])) {
          return false;
        }
      }
      return true;
    }),
  );

export const partial = <A>(
  properties: NonEmptyRecord<{ [K in keyof A]: Guard<unknown, A[K]> }>,
): Guard<unknown, Partial<{ [K in keyof A]: A[K] }>> =>
  pipe(
    unknownRecord,
    refine((r): r is Partial<A> => {
      for (const k in properties) {
        const v = r[k];
        if (v !== undefined && !properties[k](v)) {
          return false;
        }
      }
      return true;
    }),
  );

export const array = <A>(item: Guard<unknown, A>): Guard<unknown, Array<A>> =>
  pipe(
    unknownArray,
    refine((us): us is Array<A> => us.every(item)),
  );

export const record = <A>(
  codomain: Guard<unknown, A>,
): Guard<unknown, Record<string, A>> =>
  pipe(
    unknownRecord,
    refine((r): r is Record<string, A> => {
      for (const k in r) {
        if (!codomain(r[k])) {
          return false;
        }
      }
      return true;
    }),
  );

export const tuple = <A extends ReadonlyArray<unknown>>(
  ...components: { [K in keyof A]: Guard<unknown, A[K]> }
): Guard<unknown, A> =>
  (u): u is A =>
    Array.isArray(u) &&
    u.length === components.length &&
    components.every((c, i) => c(u[i]));

export const intersect = <A, B>(
  left: Guard<unknown, A>,
  right: Guard<unknown, B>,
): Guard<unknown, A & B> => (u: unknown): u is A & B => left(u) && right(u);

export const union = <A extends readonly [unknown, ...Array<unknown>]>(
  ...members: { [K in keyof A]: Guard<unknown, A[K]> }
): Guard<unknown, A[number]> =>
  (u: unknown): u is A | A[number] => members.some((m) => m(u));

export const lazy = <A>(f: () => Guard<unknown, A>): Guard<unknown, A> => {
  const get = memoize<void, Guard<unknown, A>>(f);
  return (u: unknown): u is A => get()(u);
};

export const alt = <I, A extends I>(that: () => Guard<I, A>) =>
  (
    me: Guard<I, A>,
  ): Guard<I, A> => (i): i is A => me(i) || that()(i);

export const zero = <I, A extends I>(): Guard<I, A> => (_): _ is A => false;

export const compose = <I, A extends I, B extends A>(to: Guard<A, B>) =>
  (
    from: Guard<I, A>,
  ): Guard<I, B> => (i): i is B => from(i) && to(i);

export const id = <A>(): Guard<A, A> => (_): _ is A => true;

export const sum = <T extends string, A>(
  tag: T,
  members: { [K in keyof A]: Guard<unknown, A[K]> },
): Guard<unknown, A[keyof A]> =>
  pipe(
    unknownRecord,
    // deno-lint-ignore no-explicit-any
    refine((r): r is any => {
      const v = r[tag] as keyof A;
      if (v in members) {
        return members[v](r);
      }
      return false;
    }),
  );

/***************************************************************************************************
 * @section Guard Schemable
 **************************************************************************************************/

export const Schemable: S.Schemable<Guard<unknown, _>> = {
  unknown: () => unknown,
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
