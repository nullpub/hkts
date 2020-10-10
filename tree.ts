import type * as TC from "./type_classes.ts";
import type { _ } from "./types.ts";

import { createSequenceTuple, createSequenceStruct } from "./sequence.ts";
import * as A from "./array.ts";
import * as D from "./derivations.ts";

/***************************************************************************************************
 * @section Optimizations
 **************************************************************************************************/

const _concat = A.getMonoid<Tree<any>>().concat;

const _draw = (indentation: string, forest: Forest<string>): string => {
  let r: string = "";
  const len = forest.length;
  let tree: Tree<string>;
  for (let i = 0; i < len; i++) {
    tree = forest[i];
    const isLast = i === len - 1;
    r += indentation + (isLast ? "└" : "├") + "─ " + tree.value;
    r += _draw(indentation + (len > 1 && !isLast ? "│  " : "   "), tree.forest);
  }
  return r;
};

/***************************************************************************************************
 * @section Types
 **************************************************************************************************/

export type Forest<A> = ReadonlyArray<Tree<A>>;

export type Tree<A> = {
  readonly value: A;
  readonly forest: Forest<A>;
};

/***************************************************************************************************
 * @section Constructors
 **************************************************************************************************/

export const make = <A>(value: A, forest: Forest<A> = A.zero): Tree<A> => ({
  value,
  forest,
});

/***************************************************************************************************
 * @section Module Getters
 **************************************************************************************************/

export const getShow = <A>(S: TC.Show<A>): TC.Show<Tree<A>> => {
  const show = (ta: Tree<A>): string =>
    ta.forest === A.zero || ta.forest.length === 0
      ? `Tree(${S.show(ta.value)})`
      : `Tree(${S.show(ta.value)}, [${ta.forest.map(show).join(", ")}])`;
  return ({ show });
};

/***************************************************************************************************
 * @section Modules
 **************************************************************************************************/

export const Monad = D.createMonad<Tree<_>>({
  of: make,
  chain: (fatb, ta) => chain(fatb)(ta),
});

export const Apply: TC.Apply<Tree<_>> = {
  ap: Monad.ap,
  map: Monad.map,
};

/***************************************************************************************************
 * @section Pipeables
 **************************************************************************************************/

export const chain = <A, B>(f: (a: A) => Tree<B>) =>
  (ma: Tree<A>): Tree<B> => {
    const { value, forest } = f(ma.value);
    return {
      value,
      forest: _concat(forest, ma.forest.map(chain(f))),
    };
  };

export const drawForest = (forest: Forest<string>): string =>
  _draw("\n", forest);

export const drawTree = (tree: Tree<string>): string =>
  tree.value + drawForest(tree.forest);

export const fold = <A, B>(f: (a: A, bs: Array<B>) => B) =>
  (tree: Tree<A>): B => {
    const go = (tree: Tree<A>): B => f(tree.value, tree.forest.map(go));
    return go(tree);
  };

export const { of, ap, map, join } = D.createPipeableMonad(Monad);

/***************************************************************************************************
 * @section Sequence
 **************************************************************************************************/

export const sequenceTuple = createSequenceTuple(Apply);

export const sequenceStruct = createSequenceStruct(Apply);
