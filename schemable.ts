import { $, _ } from "./hkts.ts";

export type LS = 1 | 2 | 3;

export type Literal = string | number | boolean | null;

export type LiteralSchemable<S, L extends LS> = {
  1: <A extends [Literal, ...Literal[]]>(...vs: A) => $<S, [A[number]]>;
  2: <E, A extends [Literal, ...Literal[]]>(...vs: A) => $<S, [E, A[number]]>;
  3: <R, E, A extends [Literal, ...Literal[]]>(
    ...vs: A
  ) => $<S, [R, E, A[number]]>;
}[L];

export type StringSchemable<S, L extends LS> = {
  1: () => $<S, [string]>;
  2: <E>() => $<S, [E, string]>;
  3: <R, E>() => $<S, [R, E, string]>;
}[L];

export type NumberSchemable<S, L extends LS> = {
  1: () => $<S, [number]>;
  2: <E>() => $<S, [E, number]>;
  3: <R, E>() => $<S, [R, E, number]>;
}[L];

export type BooleanSchemable<S, L extends LS> = {
  1: () => $<S, [boolean]>;
  2: <E>() => $<S, [E, boolean]>;
  3: <R, E>() => $<S, [R, E, boolean]>;
}[L];

export type NullableSchemable<S, L extends LS> = {
  1: <A>(or: $<S, [A]>) => $<S, [null | A]>;
  2: <E, A>(or: $<S, [E, A]>) => $<S, [E, null | A]>;
  3: <R, E, A>(or: $<S, [R, E, A]>) => $<S, [R, E, null | A]>;
}[L];

export type TypeSchemable<S, L extends LS> = {
  1: <A>(
    properties: { [K in keyof A]: $<S, [A[K]]> },
  ) => $<S, [{ [K in keyof A]: A[K] }]>;
  2: <E, A>(
    properties: { [K in keyof A]: $<S, [E, A[K]]> },
  ) => $<S, [E, { [K in keyof A]: A[K] }]>;
  3: <R, E, A>(
    properties: { [K in keyof A]: $<S, [R, E, A[K]]> },
  ) => $<S, [R, E, { [K in keyof A]: A[K] }]>;
}[L];

export type PartialSchemable<S, L extends LS> = {
  1: <A>(
    properties: { [K in keyof A]: $<S, [A[K]]> },
  ) => $<S, [Partial<{ [K in keyof A]: A[K] }>]>;
  2: <E, A>(
    properties: { [K in keyof A]: $<S, [E, A[K]]> },
  ) => $<S, [E, Partial<{ [K in keyof A]: A[K] }>]>;
  3: <R, E, A>(
    properties: { [K in keyof A]: $<S, [R, E, A[K]]> },
  ) => $<S, [R, E, Partial<{ [K in keyof A]: A[K] }>]>;
}[L];

export type RecordSchemable<S, L extends LS> = {
  1: <A>(codomain: $<S, [A]>) => $<S, [Record<string, A>]>;
  2: <E, A>(codomain: $<S, [E, A]>) => $<S, [E, Record<string, A>]>;
  3: <R, E, A>(codomain: $<S, [R, E, A]>) => $<S, [R, E, Record<string, A>]>;
}[L];

export type ArraySchemable<S, L extends LS> = {
  1: <A>(item: $<S, [A]>) => $<S, [Array<A>]>;
  2: <E, A>(item: $<S, [E, A]>) => $<S, [E, Array<A>]>;
  3: <R, E, A>(item: $<S, [R, E, A]>) => $<S, [R, E, Array<A>]>;
}[L];

export type TupleSchemable<S, L extends LS> = {
  1: <A extends ReadonlyArray<unknown>>(
    ...components: { [K in keyof A]: $<S, [A[K]]> }
  ) => $<S, [A]>;
  2: <E, A extends ReadonlyArray<unknown>>(
    ...components: { [K in keyof A]: $<S, [E, A[K]]> }
  ) => $<S, [E, A]>;
  3: <R, E, A extends ReadonlyArray<unknown>>(
    ...components: { [K in keyof A]: $<S, [R, E, A[K]]> }
  ) => $<S, [R, E, A]>;
}[L];

export type IntersectSchemable<S, L extends LS> = {
  1: <B>(b: $<S, [B]>) => <A>(a: $<S, [A]>) => $<S, [A & B]>;
  2: <E, B>(b: $<S, [E, B]>) => <A>(a: $<S, [E, A]>) => $<S, [E, A & B]>;
  3: <R, E, B>(
    b: $<S, [R, E, B]>,
  ) => <A>(a: $<S, [R, E, A]>) => $<S, [R, E, A & B]>;
}[L];

export type SumSchemable<S, L extends LS> = {
  1: <T extends string>(
    tag: T,
  ) => <A>(members: { [K in keyof A]: $<S, [A[K]]> }) => $<S, [A[keyof A]]>;
  2: <T extends string>(
    tag: T,
  ) => <E, A>(
    members: { [K in keyof A]: $<S, [E, A[K]]> },
  ) => $<S, [E, A[keyof A]]>;
  3: <T extends string>(
    tag: T,
  ) => <R, E, A>(
    members: { [K in keyof A]: $<S, [R, E, A[K]]> },
  ) => $<S, [R, E, A[keyof A]]>;
}[L];

export type LazySchemable<S, L extends LS> = {
  1: <A>(id: string, f: () => $<S, [A]>) => $<S, [A]>;
  2: <E, A>(id: string, f: () => $<S, [E, A]>) => $<S, [E, A]>;
  3: <R, E, A>(id: string, f: () => $<S, [R, E, A]>) => $<S, [R, E, A]>;
}[L];

export type Schemable<S, L extends LS = 1> = {
  readonly literal: LiteralSchemable<S, L>;
  readonly string: StringSchemable<S, L>;
  readonly number: NumberSchemable<S, L>;
  readonly boolean: BooleanSchemable<S, L>;
  readonly nullable: NullableSchemable<S, L>;
  readonly type: TypeSchemable<S, L>;
  readonly partial: PartialSchemable<S, L>;
  readonly record: RecordSchemable<S, L>;
  readonly array: ArraySchemable<S, L>;
  readonly tuple: TupleSchemable<S, L>;
  readonly intersect: IntersectSchemable<S, L>;
  readonly sum: SumSchemable<S, L>;
  readonly lazy: LazySchemable<S, L>;
};

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

export interface Schema<A> {
  <S>(S: Schemable<S>): $<S, [A]>;
}

export const make = <A>(schema: Schema<A>): Schema<A> => memoize(schema);
