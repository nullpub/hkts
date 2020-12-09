import type * as TC from "./type_classes.ts";
import type { _, Fn, Predicate } from "./types.ts";

import * as S from "./set.ts";
import * as M from "./map.ts";
import * as D from "./derivations.ts";
import { _reduce } from "./array.ts";
import { fold as foldMonoid } from "./monoid.ts";
import { fromEquals, getTupleSetoid } from "./setoid.ts";
import { createSequenceStruct, createSequenceTuple } from "./sequence.ts";
import { constant, flow, memoize, pipe, swap } from "./fns.ts";

/***************************************************************************************************
 * @section Models
 **************************************************************************************************/

export type Empty = {
  readonly tag: "Empty";
};

export type Vertex<A> = {
  readonly tag: "Vertex";
  readonly value: A;
};

export type Overlay<A> = {
  readonly tag: "Overlay";
  readonly left: Graph<A>;
  readonly right: Graph<A>;
};

export type Connect<A> = {
  readonly tag: "Connect";
  readonly from: Graph<A>;
  readonly to: Graph<A>;
};

export type Graph<A> =
  | Empty
  | Vertex<A>
  | Overlay<A>
  | Connect<A>;

export type AdjacencyMap<A> = Map<A, Set<A>>;

/***************************************************************************************************
 * @section Fold
 **************************************************************************************************/

export const fold = <A, B>(
  onEmpty: () => B,
  onVertex: (a: A) => B,
  onOverlay: (left: B, right: B) => B,
  onConnect: (from: B, to: B) => B,
): (g: Graph<A>) => B => {
  const go = (g: Graph<A>): B => {
    switch (g.tag) {
      case "Empty":
        return onEmpty();
      case "Vertex":
        return onVertex(g.value);
      case "Overlay":
        return onOverlay(go(g.left), go(g.right));
      case "Connect":
        return onConnect(go(g.from), go(g.to));
    }
  };

  return go;
};

/***************************************************************************************************
 * @section Constructors
 **************************************************************************************************/

export const zero: Graph<never> = ({ tag: "Empty" });

export const empty = <A = never>(): Graph<A> => zero;

export const vertex = <A>(value: A): Graph<A> => ({ tag: "Vertex", value });

export const vertices = <A>(values: A[]): Graph<A> =>
  overlays(values.map(vertex));

export const overlay = <A>(left: Graph<A>, right: Graph<A>): Graph<A> => ({
  tag: "Overlay",
  left,
  right,
});

export const overlays = <A>(gs: Array<Graph<A>>): Graph<A> =>
  gs.reduce(overlay, empty());

export const connect = <A>(from: Graph<A>, to: Graph<A>): Graph<A> => ({
  tag: "Connect",
  from,
  to,
});

export const connects = <A>(gs: Array<Graph<A>>): Graph<A> =>
  gs.reduce(connect, empty());

export const edge = <A>(x: A, y: A): Graph<A> => connect(vertex(x), vertex(y));

export const edges = <A>(es: Array<[A, A]>): Graph<A> =>
  overlays(es.map(([x, y]) => edge(x, y)));

export const clique = <A>(values: A[]): Graph<A> =>
  connects(values.map(vertex));

/***************************************************************************************************
 * @section Utilities
 **************************************************************************************************/

const constOne = constant(1);

const constTrue = constant(true);

const constFalse = constant(false);

const or = (a: boolean, b: boolean): boolean => a || b;

const and = (a: boolean, b: boolean): boolean => a && b;

const add = (a: number, b: number): number => a + b;

const getInstanceHelpers = memoize(<A>(SA: TC.Setoid<A>) => {
  const tupleSetoid = getTupleSetoid(SA, SA);
  const setSetoid = S.getSetoid(SA);
  const setTupleSetoid = S.getSetoid(tupleSetoid);

  const setUnion = S.union(SA);
  const setTupleUnion = S.union(tupleSetoid);

  const { chain: chainS, map: mapS } = S.getMonad(tupleSetoid);

  const vertexSet: (g: Graph<A>) => Set<A> = fold(
    S.empty,
    S.of,
    (a, b) => setUnion(a)(b),
    (a, b) => setUnion(a)(b),
  );

  const edgeSet = (g: Graph<A>): Set<[A, A]> => {
    switch (g.tag) {
      case "Empty":
      case "Vertex":
        return S.zero;
      case "Overlay":
        return setTupleUnion(edgeSet(g.left))(edgeSet(g.right));
      case "Connect":
        return setTupleUnion(setTupleUnion(edgeSet(g.from))(edgeSet(g.to)))(
          chainS(
            (x) => mapS((y) => [x, y], vertexSet(g.to)),
            vertexSet(g.from),
          ),
        );
    }
  };

  const graphSetoid = fromEquals<Graph<A>>((x, y) => {
    if (x.tag === "Empty") {
      return y.tag === "Empty";
    } else {
      return and(
        setSetoid.equals(vertexSet(x), vertexSet(y)),
        setTupleSetoid.equals(edgeSet(x), edgeSet(y)),
      );
    }
  });

  const monoidSet = S.getUnionMonoid(SA);
  const monoidMap = M.getMonoid(SA, monoidSet);

  return {
    tupleSetoid,
    setSetoid,
    setTupleSetoid,
    setUnion,
    setTupleUnion,
    vertexSet,
    edgeSet,
    graphSetoid,
    monoidSet,
    monoidMap,
  };
});

/***************************************************************************************************
 * @section Modules
 **************************************************************************************************/

export const Monad = D.createMonad<Graph<_>>({
  of: vertex,
  map: (fab) =>
    flow(
      fold(
        empty,
        flow(fab, vertex),
        overlay,
        connect,
      ),
    ),
  chain: (fatb) =>
    flow(
      fold(
        empty,
        flow(fatb, fold(empty, vertex, overlay, connect)),
        overlay,
        connect,
      ),
    ),
});

export const Apply: TC.Apply<Graph<_>> = Monad;

export const Applicative: TC.Applicative<Graph<_>> = Monad;

/***************************************************************************************************
 * @section Module Getters
 **************************************************************************************************/

export const getSetoid = <A>(SA: TC.Setoid<A>): TC.Setoid<Graph<A>> =>
  getInstanceHelpers(SA).graphSetoid;

export const getShow = <A>(
  SA: TC.Setoid<A>,
  SH: TC.Show<A>,
): TC.Show<Graph<A>> => {
  const _toAdjacencyMap = toAdjacencyMap(SA);
  const _set = S.getShow(SH);
  return {
    show: (ta) => {
      const adjacencyMap = _toAdjacencyMap(ta);
      const out = [];
      for (const [vertex, set] of adjacencyMap) {
        const neighbors = [];
        for (const neighbor of set) {
          neighbors.push(SH.show(neighbor));
        }
        out.push(`${SH.show(vertex)} => [${neighbors.join(", ")}]`);
      }
      return out.join("\n");
    },
  };
};

/***************************************************************************************************
 * @section pipeables
 **************************************************************************************************/

export const { of, ap, map, join, chain } = Monad;

export const sequenceTuple = createSequenceTuple(Apply);

export const sequenceStruct = createSequenceStruct(Apply);

export const hasVertex = <A>(SA: TC.Setoid<A>) =>
  (vertex: A) =>
    (graph: Graph<A>): boolean =>
      pipe(
        graph,
        fold(constFalse, (a) => SA.equals(vertex, a), or, or),
      );

export const hasEdge = <A>(SA: TC.Setoid<A>) =>
  (edgeFrom: A, edgeTo: A) =>
    (g: Graph<A>): boolean => {
      const f = pipe(
        g,
        fold(
          () => (n: number) => n,
          (a) =>
            (n) =>
              n === 0
                ? (SA.equals(edgeFrom, a) ? 1 : 0)
                : SA.equals(edgeTo, a)
                ? 2
                : 1,
          (left, right) =>
            (n) => {
              const hold = left(n);
              return hold === 0
                ? right(n)
                : hold === 1
                ? right(n) === 2 ? 2 : 1
                : 2;
            },
          (from, to) =>
            (n: number) => {
              const res = from(n);
              return res === 2 ? 2 : to(res);
            },
        ),
      );

      return f(0) === 2;
    };

export const induce = <A>(predicate: Predicate<A>) =>
  (ta: Graph<A>): Graph<A> =>
    pipe(ta, chain((a: A) => predicate(a) ? vertex(a) : empty()));

export const removeVertex = <A>(SA: TC.Setoid<A>) =>
  (v: A): (g: Graph<A>) => Graph<A> => induce((a) => !SA.equals(v, a));

export const splitVertex = <A>(SA: TC.Setoid<A>) =>
  (a: A, as: A[]) =>
    (ta: Graph<A>): Graph<A> =>
      pipe(ta, chain((v) => SA.equals(a, v) ? vertices(as) : vertex(v)));

export const isEmpty = <A>(g: Graph<A>): boolean =>
  fold(constTrue, constFalse, and, and)(g);

export const size = <A>(g: Graph<A>): number =>
  fold(constOne, constOne, add, add)(g);

export const transpose = <A>(g: Graph<A>): Graph<A> =>
  pipe(g, fold(empty, vertex, overlay, swap(connect)));

const _simple = <A>(SA: TC.Setoid<A>) => {
  const { graphSetoid: { equals } } = getInstanceHelpers(SA);
  return (op: Fn<[Graph<A>, Graph<A>], Graph<A>>) => {
    return (a: Graph<A>, b: Graph<A>): Graph<A> => {
      const c = op(a, b);
      switch (true) {
        case equals(a, c):
          return a;
        case equals(b, c):
          return b;
        default:
          return c;
      }
    };
  };
};

export const simplify = <A>(SA: TC.Setoid<A>) => {
  const simple = _simple(SA);
  return (g: Graph<A>): Graph<A> =>
    pipe(g, fold(empty, vertex, simple(overlay), simple(connect)));
};

export const toAdjacencyMap = <A>(SA: TC.Setoid<A>) => {
  const { monoidMap } = getInstanceHelpers(SA);
  return fold<A, AdjacencyMap<A>>(
    constant(M.zero),
    (x) => M.singleton(x, S.zero),
    monoidMap.concat,
    (x, y) => {
      const productEdges = new Map<A, Set<A>>();
      for (const key of x.keys()) {
        productEdges.set(key, new Set(y.keys()));
      }
      return foldMonoid(monoidMap)([x, y, productEdges]);
    },
  );
};

export const isSubgraph = <A>(SA: TC.Setoid<A>) => {
  const subset = S.isSubset(SA);
  const subsetSetoid: TC.Setoid<Set<A>> = { equals: (a, b) => subset(a)(b) };
  const submap = M.isSubmap(SA, subsetSetoid);
  const adjacenctMap = toAdjacencyMap(SA);

  return (parent: Graph<A>) =>
    (sub: Graph<A>): boolean => submap(adjacenctMap(sub))(adjacenctMap(parent));
};
