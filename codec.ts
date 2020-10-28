import type { _0, _1, _2 } from "./types.ts";
import type * as S from "./schemable.ts";

import * as D from "./decoder.ts";
import * as E from "./encoder.ts";
import { identity, pipe } from "./fns.ts";

/***************************************************************************************************
 * @section Types
 **************************************************************************************************/

export type Codec<I, O, A> = D.Decoder<I, A> & E.Encoder<O, A>;

export type InputOf<C> = D.InputOf<C>;

export type OutputOf<C> = E.OutputOf<C>;

export type TypeOf<C> = E.TypeOf<C>;

/***************************************************************************************************
 * @section Types
 **************************************************************************************************/

export const make = <I, O, A>(
  decoder: D.Decoder<I, A>,
  encoder: E.Encoder<O, A>,
): Codec<I, O, A> => ({
  decode: decoder.decode,
  encode: encoder.encode,
});

export const fromDecoder = <I, A>(
  decoder: D.Decoder<I, A>,
): Codec<I, A, A> => ({
  decode: decoder.decode,
  encode: identity,
});

/***************************************************************************************************
 * @section Combinators
 **************************************************************************************************/

export const literal = <A extends readonly [S.Literal, ...S.Literal[]]>(
  ...values: A
): Codec<unknown, A[number], A[number]> => fromDecoder(D.literal(...values));

export const string = fromDecoder(D.string);

export const number = fromDecoder(D.number);

export const boolean = fromDecoder(D.boolean);

export const unknownArray = fromDecoder(D.unknownArray);

export const unknownRecord = fromDecoder(D.unknownRecord);

export const mapLeftWithInput = <I>(
  f: (i: I, e: D.DecodeError) => D.DecodeError,
) =>
  <O, A>(
    codec: Codec<I, O, A>,
  ): Codec<I, O, A> => make(pipe(codec, D.mapLeftWithInput(f)), codec);

export const refine = <A, B extends A>(
  refinement: (a: A) => a is B,
  id: string,
) => {
  const refine = D.refine(refinement, id);
  return <I, O>(from: Codec<I, O, A>): Codec<I, O, B> =>
    make(refine(from), from);
};

export const nullable = <I, O, A>(
  or: Codec<I, O, A>,
): Codec<null | I, null | O, null | A> => make(D.nullable(or), E.nullable(or));

export const type = <
  P extends Record<string, Codec<unknown, unknown, unknown>>,
>(
  properties: P,
) => fromDecoder(D.type(properties));

export const partial = <
  P extends Record<string, Codec<unknown, unknown, unknown>>,
>(
  properties: P,
) => fromDecoder(D.partial(properties));

export const array = <O, A>(
  item: Codec<unknown, O, A>,
) => fromDecoder(D.array(item));

export const record = <O, A>(
  codomain: Codec<unknown, O, A>,
) => fromDecoder(D.record(codomain));

export const tuple = <A extends ReadonlyArray<unknown>>(
  ...components: { [K in keyof A]: Codec<unknown, A[K], A[K]> }
): Codec<unknown, A, A> =>
  (fromDecoder(D.tuple(...components)) as unknown) as Codec<unknown, A, A>;

export const intersect = <OA, A, OB, B>(
  left: Codec<unknown, OA, A>,
  right: Codec<unknown, OB, B>,
) => fromDecoder(D.intersect(left, right));

export const sum = <
  T extends string,
  M extends Record<string, Codec<unknown, unknown, unknown>>,
>(
  tag: T,
  members: M,
) => fromDecoder(D.sum(tag, members));

export const lazy = <I, O, A>(
  id: string,
  f: () => Codec<I, O, A>,
) => fromDecoder(D.lazy(id, f));

/***************************************************************************************************
 * @section Modules
 **************************************************************************************************/

export const Schemable: S.Schemable<Codec<unknown, _0, _0>> = {
  literal,
  string: () => string,
  number: () => number,
  boolean: () => boolean,
  nullable: nullable,
  type: type as S.TypeSchemable<Codec<unknown, _0, _0>, 1>,
  partial: partial as S.PartialSchemable<Codec<unknown, _0, _0>, 1>,
  record,
  array,
  tuple: tuple as S.TupleSchemable<Codec<unknown, _0, _0>, 1>,
  intersect: intersect,
  sum: sum as S.SumSchemable<Codec<unknown, _0, _0>, 1>,
  lazy,
};
