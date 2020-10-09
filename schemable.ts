import type { $, _ } from "./types.ts";
import type { LS } from "./type_classes.ts";

/***************************************************************************************************
 * @section Types
 **************************************************************************************************/

export type Literal = string | number | boolean | null;

/***************************************************************************************************
 * @section Schemables
 **************************************************************************************************/

export type LiteralSchemable<T, L extends LS> = {
  1: <A extends [Literal, ...Literal[]]>(...s: A) => $<T, [A[number]]>;
  2: <E, A extends [Literal, ...Literal[]]>(...s: A) => $<T, [E, A[number]]>;
  3: <R, E, A extends [Literal, ...Literal[]]>(
    ...s: A
  ) => $<T, [R, E, A[number]]>;
  4: <S, R, E, A extends [Literal, ...Literal[]]>(
    ...s: A
  ) => $<T, [S, R, E, A[number]]>;
}[L];

export type StringSchemable<T, L extends LS> = {
  1: () => $<T, [string]>;
  2: <E>() => $<T, [E, string]>;
  3: <R, E>() => $<T, [R, E, string]>;
  4: <S, R, E>() => $<T, [S, R, E, string]>;
}[L];

export type NumberSchemable<T, L extends LS> = {
  1: () => $<T, [number]>;
  2: <E>() => $<T, [E, number]>;
  3: <R, E>() => $<T, [R, E, number]>;
  4: <S, R, E>() => $<T, [S, R, E, number]>;
}[L];

export type BooleanSchemable<T, L extends LS> = {
  1: () => $<T, [boolean]>;
  2: <E>() => $<T, [E, boolean]>;
  3: <R, E>() => $<T, [R, E, boolean]>;
  4: <S, R, E>() => $<T, [S, R, E, boolean]>;
}[L];

export type NullableSchemable<T, L extends LS> = {
  1: <A>(or: $<T, [A]>) => $<T, [null | A]>;
  2: <E, A>(or: $<T, [E, A]>) => $<T, [E, null | A]>;
  3: <R, E, A>(or: $<T, [R, E, A]>) => $<T, [R, E, null | A]>;
  4: <S, R, E, A>(or: $<T, [S, R, E, A]>) => $<T, [S, R, E, null | A]>;
}[L];

export type TypeSchemable<T, L extends LS> = {
  1: <A>(
    properties: { [K in keyof A]: $<T, [A[K]]> },
  ) => $<T, [{ [K in keyof A]: A[K] }]>;
  2: <E, A>(
    properties: { [K in keyof A]: $<T, [E, A[K]]> },
  ) => $<T, [E, { [K in keyof A]: A[K] }]>;
  3: <R, E, A>(
    properties: { [K in keyof A]: $<T, [R, E, A[K]]> },
  ) => $<T, [R, E, { [K in keyof A]: A[K] }]>;
  4: <S, R, E, A>(
    properties: { [K in keyof A]: $<T, [S, R, E, A[K]]> },
  ) => $<T, [S, R, E, { [K in keyof A]: A[K] }]>;
}[L];

export type PartialSchemable<T, L extends LS> = {
  1: <A>(
    properties: { [K in keyof A]: $<T, [A[K]]> },
  ) => $<T, [Partial<{ [K in keyof A]: A[K] }>]>;
  2: <E, A>(
    properties: { [K in keyof A]: $<T, [E, A[K]]> },
  ) => $<T, [E, Partial<{ [K in keyof A]: A[K] }>]>;
  3: <R, E, A>(
    properties: { [K in keyof A]: $<T, [R, E, A[K]]> },
  ) => $<T, [R, E, Partial<{ [K in keyof A]: A[K] }>]>;
  4: <S, R, E, A>(
    properties: { [K in keyof A]: $<T, [S, R, E, A[K]]> },
  ) => $<T, [S, R, E, Partial<{ [K in keyof A]: A[K] }>]>;
}[L];

export type RecordSchemable<T, L extends LS> = {
  1: <A>(codomain: $<T, [A]>) => $<T, [Record<string, A>]>;
  2: <E, A>(codomain: $<T, [E, A]>) => $<T, [E, Record<string, A>]>;
  3: <R, E, A>(codomain: $<T, [R, E, A]>) => $<T, [R, E, Record<string, A>]>;
  4: <S, R, E, A>(
    codomain: $<T, [S, R, E, A]>,
  ) => $<T, [S, R, E, Record<string, A>]>;
}[L];

export type ArraySchemable<T, L extends LS> = {
  1: <A>(item: $<T, [A]>) => $<T, [Array<A>]>;
  2: <E, A>(item: $<T, [E, A]>) => $<T, [E, Array<A>]>;
  3: <R, E, A>(item: $<T, [R, E, A]>) => $<T, [R, E, Array<A>]>;
  4: <S, R, E, A>(item: $<T, [S, R, E, A]>) => $<T, [S, R, E, Array<A>]>;
}[L];

export type TupleSchemable<T, L extends LS> = {
  1: <A extends ReadonlyArray<unknown>>(
    ...components: { [K in keyof A]: $<T, [A[K]]> }
  ) => $<T, [A]>;
  2: <E, A extends ReadonlyArray<unknown>>(
    ...components: { [K in keyof A]: $<T, [E, A[K]]> }
  ) => $<T, [E, A]>;
  3: <R, E, A extends ReadonlyArray<unknown>>(
    ...components: { [K in keyof A]: $<T, [R, E, A[K]]> }
  ) => $<T, [R, E, A]>;
  4: <S, R, E, A extends ReadonlyArray<unknown>>(
    ...components: { [K in keyof A]: $<T, [S, R, E, A[K]]> }
  ) => $<T, [S, R, E, A]>;
}[L];

export type IntersectSchemable<T, L extends LS> = {
  1: <A, B>(a: $<T, [A]>, b: $<T, [B]>) => $<T, [A & B]>;
  2: <E, A, B>(a: $<T, [E, A]>, b: $<T, [E, B]>) => $<T, [E, A & B]>;
  3: <R, E, A, B>(
    a: $<T, [R, E, A]>,
    b: $<T, [R, E, B]>,
  ) => $<T, [R, E, A & B]>;
  4: <S, R, E, A, B>(
    a: $<T, [S, R, E, A]>,
    b: $<T, [S, R, E, B]>,
  ) => $<T, [S, R, E, A & B]>;
}[L];

export type SumSchemable<T, L extends LS> = {
  1: <U extends string, A>(
    tag: U,
    members: { [K in keyof A]: $<T, [A[K]]> },
  ) => $<T, [A[keyof A]]>;
  2: <U extends string, E, A>(
    tag: U,
    members: { [K in keyof A]: $<T, [E, A[K]]> },
  ) => $<T, [E, A[keyof A]]>;
  3: <U extends string, R, E, A>(
    tag: U,
    members: { [K in keyof A]: $<T, [R, E, A[K]]> },
  ) => $<T, [R, E, A[keyof A]]>;
  4: <U extends string, S, R, E, A>(
    tag: U,
    members: { [K in keyof A]: $<T, [S, R, E, A[K]]> },
  ) => $<T, [S, R, E, A[keyof A]]>;
}[L];

export type LazySchemable<T, L extends LS> = {
  1: <A>(id: string, f: () => $<T, [A]>) => $<T, [A]>;
  2: <E, A>(id: string, f: () => $<T, [E, A]>) => $<T, [E, A]>;
  3: <R, E, A>(id: string, f: () => $<T, [R, E, A]>) => $<T, [R, E, A]>;
  4: <S, R, E, A>(
    id: string,
    f: () => $<T, [S, R, E, A]>,
  ) => $<T, [S, R, E, A]>;
}[L];

/***************************************************************************************************
 * @section Module Definitions
 **************************************************************************************************/

export type Schemable<T, L extends LS = 1> = {
  readonly literal: LiteralSchemable<T, L>;
  readonly string: StringSchemable<T, L>;
  readonly number: NumberSchemable<T, L>;
  readonly boolean: BooleanSchemable<T, L>;
  readonly nullable: NullableSchemable<T, L>;
  readonly type: TypeSchemable<T, L>;
  readonly partial: PartialSchemable<T, L>;
  readonly record: RecordSchemable<T, L>;
  readonly array: ArraySchemable<T, L>;
  readonly tuple: TupleSchemable<T, L>;
  readonly intersect: IntersectSchemable<T, L>;
  readonly sum: SumSchemable<T, L>;
  readonly lazy: LazySchemable<T, L>;
};

export type Schema<A, L extends LS = 1> = {
  1: <T>(S: Schemable<T>) => $<T, [A]>;
  2: <T, E>(S: Schemable<T>) => $<T, [E, A]>;
  3: <T, R, E>(S: Schemable<T>) => $<T, [R, E, A]>;
  4: <T, S, R, E>(S: Schemable<T>) => $<T, [S, R, E, A]>;
}[L];

/***************************************************************************************************
 * @section Utilities
 **************************************************************************************************/

export const memoize = <A, B>(f: (a: A) => B): (a: A) => B => {
  let cache = new Map();
  return (a) => {
    if (cache.has(a)) {
      return cache.get(a);
    }
    const b = f(a);
    cache.set(a, b);
    return b;
  };
};

const typeOf = (x: unknown): string => (x === null ? "null" : typeof x);

export const intersect_ = <A, B>(a: A, b: B): A & B => {
  if (a !== undefined && b !== undefined) {
    const tx = typeOf(a);
    const ty = typeOf(b);
    if (tx === "object" || ty === "object") {
      return Object.assign({}, a, b);
    }
  }
  return b as any;
};

type MakeSchema<L extends LS = 1> = {
  1: <A>(S: Schema<A, L>) => Schema<A, L>;
  2: <A>(S: Schema<A, L>) => Schema<A, L>;
  3: <A>(S: Schema<A, L>) => Schema<A, L>;
  4: <A>(S: Schema<A, L>) => Schema<A, L>;
}[L];

export const make: MakeSchema = <A>(schema: Schema<A>): Schema<A> =>
  memoize(schema);
