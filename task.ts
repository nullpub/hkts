import type * as TC from "./type_classes.ts";
import type { _, Lazy } from "./types.ts";

import { createSequenceStruct, createSequenceTuple } from "./sequence.ts";
import { apply, flow, wait } from "./fns.ts";
import { createDo } from "./derivations.ts";

/***************************************************************************************************
 * @section Types
 **************************************************************************************************/

export type Task<A> = () => Promise<A>;

/***************************************************************************************************
 * @section Combinators
 **************************************************************************************************/

export const delay = (ms: number) =>
  <A>(ma: Task<A>): Task<A> => () => wait(ms).then(ma);

export const fromThunk = <A>(fa: Lazy<A>): Task<A> => async () => fa();

export const tryCatch = <A>(fa: Lazy<A>, onError: (e: unknown) => A): Task<A> =>
  async () => {
    try {
      return fa();
    } catch (e) {
      return onError(e);
    }
  };

/***************************************************************************************************
 * @section Modules (Parallel)
 **************************************************************************************************/

export const Functor: TC.Functor<Task<_>> = {
  map: (fab) => (ta) => () => ta().then(fab),
};

export const Apply: TC.Apply<Task<_>> = {
  ap: (tfab) =>
    (ta) => () => Promise.all([tfab(), ta()]).then(([f, a]) => f(a)),
  map: Functor.map,
};

export const Applicative: TC.Applicative<Task<_>> = {
  of: (a) => () => Promise.resolve(a),
  ap: Apply.ap,
  map: Functor.map,
};

export const Chain: TC.Chain<Task<_>> = {
  ap: Apply.ap,
  map: Functor.map,
  chain: (fatb) => (ta) => () => ta().then(flow(fatb, apply())),
};

export const Monad: TC.Monad<Task<_>> = {
  of: Applicative.of,
  ap: Apply.ap,
  map: Functor.map,
  join: (tta) => () => tta().then(apply()),
  chain: Chain.chain,
};

/***************************************************************************************************
 * @section Modules (Parallel)
 **************************************************************************************************/

export const ApplySeq: TC.Apply<Task<_>> = {
  ap: (tfab) => (ta) => async () => (await tfab())(await ta()),
  map: Functor.map,
};

export const MonadSeq: TC.Monad<Task<_>> = {
  of: Applicative.of,
  ap: ApplySeq.ap,
  map: Functor.map,
  join: (tta) => () => tta().then(apply()),
  chain: Chain.chain,
};

/***************************************************************************************************
 * @section Pipeables
 **************************************************************************************************/

export const { of, ap, map, join, chain } = Monad;

/***************************************************************************************************
 * @section Sequence
 **************************************************************************************************/

export const sequenceTuple = createSequenceTuple(Apply);

export const sequenceStruct = createSequenceStruct(Apply);

export const sequenceTupleSeq = createSequenceTuple(ApplySeq);

export const sequenceStructSeq = createSequenceStruct(ApplySeq);

/***************************************************************************************************
 * Do Notation
 **************************************************************************************************/

export const { Do, bind, bindTo } = createDo(Monad);
