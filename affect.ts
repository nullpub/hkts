import type * as TC from "./type_classes.ts";
import type { _0, _1, _2, _3 } from "./types.ts";

import * as E from "./either.ts";
import { createDo } from "./derivations.ts";
import { flow, identity, pipe } from "./fns.ts";
import { createSequenceStruct, createSequenceTuple } from "./sequence.ts";

/***************************************************************************************************
 * @section Types
 **************************************************************************************************/

export type Affect<R, E, A> = (r: R) => Promise<E.Either<E, A>>;

/***************************************************************************************************
 * @section Utilites
 **************************************************************************************************/

export const aff = async <A>(a: A): Promise<A> => a;

export const then = <A, B>(fab: (a: A) => B) =>
  (p: Promise<A>): Promise<B> => p.then(fab);

/***************************************************************************************************
 * @section Constructors
 **************************************************************************************************/

export const ask: <R>() => Affect<R, never, R> = () => async (r) => E.right(r);

export const asks = <R, E = never, A = never>(
  fra: (r: R) => Promise<A>,
): Affect<R, E, A> => async (r) => fra(r).then(E.right);

export const asksLeft = <R, E = never, A = never>(
  fre: (r: R) => Promise<E>,
): Affect<R, E, A> => async (r) => fre(r).then(E.left);

export const right = <R = never, E = never, A = never>(
  right: A,
): Affect<R, E, A> => async () => E.right(right);

export const left = <R = never, E = never, A = never>(
  left: E,
): Affect<R, E, A> => async () => E.left(left);

/***************************************************************************************************
 * @section Modules
 **************************************************************************************************/

export const Functor: TC.Functor<Affect<_0, _1, _2>, 3> = {
  map: (fab) => (ta) => flow(ta, then(E.map(fab))),
};

export const Apply: TC.Apply<Affect<_0, _1, _2>, 3> = {
  ap: (tfab) =>
    (ta) =>
      async (r) => {
        const efab = await tfab(r);
        const ea = await ta(r);
        return pipe(
          ea,
          E.ap(efab),
        );
      },
  map: Functor.map,
};

export const Applicative: TC.Applicative<Affect<_0, _1, _2>, 3> = {
  of: right,
  ap: Apply.ap,
  map: Functor.map,
};

export const Chain: TC.Chain<Affect<_0, _1, _2>, 3> = {
  ap: Apply.ap,
  map: Functor.map,
  chain: (fatb) =>
    (ta) =>
      async (r) => {
        const ea = await ta(r);
        return E.isLeft(ea) ? ea : fatb(ea.right)(r);
      },
};

export const Monad: TC.Monad<Affect<_0, _1, _2>, 3> = {
  of: Applicative.of,
  ap: Apply.ap,
  map: Functor.map,
  join: Chain.chain(identity),
  chain: Chain.chain,
};

/***************************************************************************************************
 * @section Pipeables
 **************************************************************************************************/

export const { of, ap, map, join, chain } = Monad;

export const compose = <E = never, A = never, B = never>(
  aeb: Affect<A, E, B>,
) =>
  <R>(rea: Affect<R, E, A>): Affect<R, E, B> =>
    async (r) => {
      const ea = await rea(r);
      return E.isLeft(ea) ? ea : await aeb(ea.right);
    };

export const recover = <E, A>(fea: (e: E) => A) =>
  <R>(ta: Affect<R, E, A>): Affect<R, E, A> =>
    flow(ta, then(E.fold(flow(fea, E.right), E.right)));

/***************************************************************************************************
 * @section Sequence
 **************************************************************************************************/

export const sequenceTuple = createSequenceTuple(Apply);

export const sequenceStruct = createSequenceStruct(Apply);

/***************************************************************************************************
 * Do
 **************************************************************************************************/

export const { Do, bind, bindTo } = createDo(Monad);
