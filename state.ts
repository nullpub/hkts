import type * as TC from "./type_classes.ts";
import type { _0, _1 } from "./types.ts";

import { createDo } from "./derivations.ts";
import { flow, identity } from "./fns.ts";
import { createSequenceStruct, createSequenceTuple } from "./sequence.ts";

/***************************************************************************************************
 * @section Types
 **************************************************************************************************/

export interface State<S, A> {
  (s: S): [A, S];
}

/***************************************************************************************************
 * @section Constructors
 **************************************************************************************************/

export const get: <S>() => State<S, S> = () => (s) => [s, s];

export const put: <S>(s: S) => State<S, void> = (s) => () => [undefined, s];

export const modify: <S>(f: (s: S) => S) => State<S, void> = (f) =>
  (s) => [
    undefined,
    f(s),
  ];

export const gets: <S, A>(f: (s: S) => A) => State<S, A> = (f) =>
  (s) => [
    f(s),
    s,
  ];

/***************************************************************************************************
 * @section Modules
 **************************************************************************************************/

export const Functor: TC.Functor<State<_0, _1>, 2> = {
  map: (fab) => (ta) => flow(ta, ([a, s]) => [fab(a), s]),
};

export const Apply: TC.Apply<State<_0, _1>, 2> = {
  ap: (tfab) =>
    (ta) =>
      (s1) => {
        const [fab, s2] = tfab(s1);
        const [a, s3] = ta(s2);
        return [fab(a), s3];
      },
  map: Functor.map,
};

export const Applicative: TC.Applicative<State<_0, _1>, 2> = {
  of: (a) => (s) => [a, s],
  ap: Apply.ap,
  map: Functor.map,
};

export const Chain: TC.Chain<State<_0, _1>, 2> = {
  ap: Apply.ap,
  map: Functor.map,
  chain: (fatb) => (ta) => flow(ta, ([a, s]) => fatb(a)(s)),
};

export const Monad: TC.Monad<State<_0, _1>, 2> = {
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

export const evaluate = <S>(s: S) => <A>(ma: State<S, A>): A => ma(s)[0];

export const execute = <S>(s: S) => <A>(ma: State<S, A>): S => ma(s)[1];

/***************************************************************************************************
 * @section Sequence
 **************************************************************************************************/

export const sequenceTuple = createSequenceTuple(Apply);

export const sequenceStruct = createSequenceStruct(Apply);

/***************************************************************************************************
 * Do
 **************************************************************************************************/

export const { Do, bind, bindTo } = createDo(Monad);
