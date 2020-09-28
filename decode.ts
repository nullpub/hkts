import type { _ } from "./hkts.ts";
import type * as TC from "./type_classes.ts";

import { pipe, Refinement } from "./fns.ts";
import * as S from "./schemable.ts";
import * as G from "./guard.ts";
import * as E from "./either.ts";
import * as R from "./record.ts";
import * as T from "./tree.ts";
import * as DE from "./decode_error.ts";
import * as FS from "./free_semigroup.ts";
import { createPipeableMonad } from "./derivations.ts";

/***************************************************************************************************
 * @section Types
 **************************************************************************************************/

export interface Decoder<I, A> {
  decode: (i: I) => Decoded<A>;
}

export type DecodeError = FS.FreeSemigroup<DE.DecodeError<string>>;

export type Decoded<A> = E.Either<DecodeError, A>;

export type InputOf<D> = D extends Decoder<infer I, infer _> ? I : never;

export type TypeOf<D> = D extends Decoder<infer _, infer A> ? A : never;

/***************************************************************************************************
 * @section Modules
 **************************************************************************************************/

const Monad = E.getRightMonad(DE.getSemigroup<string>());

const Applicative: TC.Applicative<Decoded<_>> = {
  of: Monad.of,
  ap: Monad.ap,
  map: Monad.map,
};

const Alt: TC.Alt<Decoded<_>> = E.Alt;

const { of, ap, map, join, chain } = createPipeableMonad(Monad);

const traverse = R.indexedTraverse(Applicative);

/***************************************************************************************************
 * @section Module Pipeables
 **************************************************************************************************/

const mapLeft = (fef: (e: DecodeError) => DecodeError) =>
  <A>(ta: Decoded<A>): Decoded<A> => E.isLeft(ta) ? E.left(ta.left) : ta;

const bimap = <A, B>(fef: (e: DecodeError) => DecodeError, fab: (a: A) => B) =>
  (ta: Decoded<A>): Decoded<B> =>
    E.isLeft(ta) ? E.left(ta.left) : E.right(fab(ta.right));

/***************************************************************************************************
 * @section DecodeError Constructors
 **************************************************************************************************/

export const error = (actual: unknown, message: string): DecodeError =>
  FS.of(DE.leaf(actual, message));

export const success: <A>(a: A) => Decoded<A> = E.right;

export const failure = <A = never>(
  actual: unknown,
  message: string,
): Decoded<A> => E.left(error(actual, message));

/***************************************************************************************************
 * @section Constructors
 **************************************************************************************************/

export const fromRefinement = <I, A extends I>(
  refinement: Refinement<I, A>,
  expected: string,
): Decoder<I, A> => ({
  decode: (i) => refinement(i) ? E.right(i) : E.left(error(i, expected)),
});

export const fromGuard = <I, A extends I>(
  guard: G.Guard<I, A>,
  expected: string,
): Decoder<I, A> => fromRefinement(guard.is, expected);

/***************************************************************************************************
 * @section Utilities
 **************************************************************************************************/

const traverseRecordWithIndex = <A, B>(
  f: (a: A, k: string) => Decoded<B>,
  r: Record<string, A>,
): Decoded<Record<string, B>> => {
  const ks = Object.keys(r);
  if (ks.length === 0) {
    return Monad.of({});
  }
  let fr: Decoded<Record<string, B>> = Monad.of({});
  for (const key of ks) {
    fr = Monad.ap(
      Monad.map((r) =>
        (b: B) => {
          r[key] = b;
          return r;
        }, fr),
      f(r[key], key),
    );
  }
  return fr;
};

const traverseArrayWithIndex = <A, B>(
  fab: (a: A, i: number) => Decoded<B>,
  as: A[],
): Decoded<B[]> =>
  as.reduce(
    (mbs, a, i) =>
      Monad.ap(
        Monad.map((bs) =>
          (b: B) => {
            bs.push(b);
            return bs;
          }, mbs),
        fab(a, i),
      ),
    Monad.of<Array<B>>([]),
  );

const compactRecord = <A>(
  r: Record<string, E.Either<void, A>>,
): Record<string, A> => {
  const out: Record<string, A> = {};
  for (const k in r) {
    const rk = r[k];
    if (E.isRight(rk)) {
      out[k] = rk.right;
    }
  }
  return out;
};

const undefinedProperty = Monad.of<E.Either<void, unknown>>(E.right(undefined));

const skipProperty = Monad.of<E.Either<void, unknown>>(E.left(undefined));

const toTree: (e: DE.DecodeError<string>) => T.Tree<string> = DE.fold({
  Leaf: (input, error) =>
    T.make(`cannot decode ${JSON.stringify(input)}, should be ${error}`),
  Key: (key, kind, errors) =>
    T.make(`${kind} property ${JSON.stringify(key)}`, toForest(errors)),
  Index: (index, kind, errors) =>
    T.make(`${kind} index ${index}`, toForest(errors)),
  Member: (index, errors) => T.make(`member ${index}`, toForest(errors)),
  Lazy: (id, errors) => T.make(`lazy type ${id}`, toForest(errors)),
  Wrap: (error, errors) => T.make(error, toForest(errors)),
});

const toForest: (e: DecodeError) => ReadonlyArray<T.Tree<string>> = FS.fold(
  (value) => [toTree(value)],
  (left, right) => toForest(left).concat(toForest(right)),
);

export const draw = (e: DecodeError): string =>
  toForest(e).map(T.drawTree).join("\n");

export const stringify: <A>(e: E.Either<DecodeError, A>) => string = E.fold(
  draw,
  (a) => JSON.stringify(a, null, 2),
);

/***************************************************************************************************
 * @section Decoder Schemables
 **************************************************************************************************/

export const literal = <A extends readonly [S.Literal, ...S.Literal[]]>(
  values: A,
): Decoder<unknown, A[number]> => ({
  decode: (i) =>
    G.literal(values).is(i) ? E.right(i) : E.left(
      error(i, values.map((value) => JSON.stringify(value)).join(" | ")),
    ),
});

export const string: Decoder<unknown, string> = fromGuard(G.string, "string");

export const number: Decoder<unknown, number> = fromGuard(G.number, "number");

export const boolean: Decoder<unknown, boolean> = fromGuard(
  G.boolean,
  "boolean",
);

export const unknownArray: Decoder<unknown, Array<unknown>> = fromGuard(
  G.unknownArray,
  "unknownArray",
);

export const unknownRecord: Decoder<unknown, Record<string, unknown>> =
  fromGuard(G.unknownRecord, "unknownRecord");

/***************************************************************************************************
 * @section Combinators
 **************************************************************************************************/

export const mapLeftWithInput = <I>(
  f: (input: I, e: DecodeError) => DecodeError,
) =>
  <A>(decoder: Decoder<I, A>): Decoder<I, A> => ({
    decode: (i) => E.Bifunctor.mapLeft((e) => f(i, e), decoder.decode(i)),
  });

export const withMessage = <I>(
  message: (input: I, e: DecodeError) => string,
): (<A>(decoder: Decoder<I, A>) => Decoder<I, A>) =>
  mapLeftWithInput((input, e) => FS.of(DE.wrap(message(input, e), e)));

export const refine = <A, B extends A>(
  refinement: (a: A) => a is B,
  id: string,
) =>
  <I>(from: Decoder<I, A>): Decoder<I, B> => ({
    decode: (i) =>
      pipe(
        from.decode(i),
        E.chain((a) => refinement(a) ? E.right(a) : E.left(error(i, id))),
      ),
  });

export const nullable = <I, A>(
  or: Decoder<I, A>,
): Decoder<null | I, null | A> => ({
  decode: (i) =>
    i === null ? E.right(i as A | null) : E.Bifunctor.mapLeft(
      (e) => FS.concat(FS.of(DE.member(0, error(i, "null"))), e),
      or.decode(i),
    ),
});

export const type = <P extends Record<string, Decoder<any, any>>>(
  properties: P,
): Decoder<
  unknown,
  { [K in keyof P]: TypeOf<P[K]> }
> => ({
  decode: (i) =>
    pipe(
      unknownRecord.decode(i),
      chain((r) =>
        traverseRecordWithIndex(
          ({ decode }, key) =>
            pipe(
              decode(r[key]),
              mapLeft((e) => FS.of(DE.key(key, DE.required, e))),
            ),
          properties,
        ) as any
      ),
    ),
});

export const partial = <P extends Record<string, Decoder<any, any>>>(
  properties: P,
): Decoder<
  unknown,
  Partial<{ [K in keyof P]: TypeOf<P[K]> }>
> => {
  return ({
    decode: (i) =>
      pipe(
        unknownRecord.decode(i),
        chain((r) =>
          Monad.map(
            compactRecord as any,
            traverseRecordWithIndex(
              ({ decode }, key) => {
                const ikey = r[key];
                if (ikey === undefined) {
                  return key in r ? undefinedProperty : skipProperty;
                }
                return pipe(
                  decode(ikey),
                  bimap(
                    (e) => FS.of(DE.key(key, DE.optional, e)),
                    (a) => E.right(a),
                  ),
                );
              },
              properties,
            ),
          )
        ),
      ),
  });
};

export const array = <A>(item: Decoder<unknown, A>): Decoder<unknown, A[]> => ({
  decode: (i) =>
    pipe(
      unknownArray.decode(i),
      chain((as) =>
        traverseArrayWithIndex(
          (a, i) =>
            pipe(
              item.decode(a),
              mapLeft((e) => FS.of(DE.index(i, DE.optional, e))),
            ),
          as,
        )
      ),
    ),
});

export const record = <A>(
  codomain: Decoder<unknown, A>,
): Decoder<unknown, Record<string, A>> => ({
  decode: (i) =>
    pipe(
      unknownRecord.decode(i),
      chain((r) =>
        traverseRecordWithIndex(
          (i, key) =>
            pipe(
              codomain.decode(i),
              mapLeft((e) => FS.of(DE.key(key, DE.required, e))),
            ),
          r,
        )
      ),
    ),
});

export const tuple = <A extends ReadonlyArray<unknown>>(
  ...components: { [K in keyof A]: Decoder<unknown, A[K]> }
): Decoder<unknown, A> => ({
  decode: (i) =>
    pipe(
      unknownArray.decode(i),
      chain((as) =>
        traverseArrayWithIndex(
          ({ decode }, i) =>
            pipe(
              decode(as[i]),
              mapLeft((e) => FS.of(DE.index(i, DE.required, e))),
            ),
          (components as unknown) as Decoder<any, any>[],
        ) as any
      ),
    ),
});

export const union = <
  MS extends readonly [Decoder<any, any>, ...Array<Decoder<any, any>>],
>(
  ...members: MS
): Decoder<InputOf<MS[keyof MS]>, TypeOf<MS[keyof MS]>> => ({
  decode: (i) => {
    let out: Decoded<TypeOf<MS[keyof MS]>> = pipe(
      members[0].decode(i),
      mapLeft((e) => FS.of(DE.member(0, e))),
    );
    for (let index = 1; index < members.length; index++) {
      out = Alt.alt(
        out,
        pipe(
          members[index].decode(i),
          mapLeft((e) => FS.of(DE.member(index, e))),
        ),
      );
    }
    return out;
  },
});

export const intersect = <IA, A, IB, B>(
  left: Decoder<IA, A>,
  right: Decoder<IB, B>,
): Decoder<IA & IB, A & B> => ({
  decode: (i) =>
    Monad.ap(
      Monad.map((a: A) => (b: B) => S.intersect_(a, b), left.decode(i)),
      right.decode(i),
    ),
});

export const sum = <T extends string, A>(
  tag: T,
  members: { [K in keyof A]: Decoder<unknown, A[K]> },
): Decoder<unknown, A[keyof A]> => ({
  decode: (i) =>
    pipe(
      unknownRecord.decode(i),
      chain((ir) => {
        const keys = Object.keys(members);
        const v = ir[tag];
        if (typeof v === "string" && v in members) {
          return (members as any)[v].decode(ir);
        }
        return E.left(FS.of(
          DE.key(
            tag,
            DE.required,
            error(
              v,
              keys.length === 0
                ? "never"
                : keys.map((k) => JSON.stringify(k)).join(" | "),
            ),
          ),
        ));
      }),
    ),
});

export const lazy = <I, A>(
  id: string,
  f: () => Decoder<I, A>,
): Decoder<I, A> => {
  const get = S.memoize<void, Decoder<I, A>>(f);
  return ({
    decode: (i) =>
      pipe(
        get().decode(i),
        mapLeft((e) => FS.of(DE.lazy(id, e))),
      ),
  });
};

export const compose = <I, A extends I, B extends A>(
  ia: Decoder<I, A>,
  ab: Decoder<A, B>,
): Decoder<I, B> => ({
  decode: (i) =>
    pipe(
      ia.decode(i),
      chain(ab.decode),
    ),
});

export const Schemable: S.Schemable<Decoder<unknown, _>> = {
  literal,
  string: () => string,
  number: () => number,
  boolean: () => boolean,
  nullable: nullable,
  type,
  partial,
  record,
  array,
  tuple: tuple as S.TupleSchemable<Decoder<unknown, _>, 1>,
  intersect,
  sum,
  lazy,
};
