import { assertEquals } from "https://deno.land/std/testing/asserts.ts";

import type * as TC from "../type_classes.ts";
import type { $, Predicate } from "../types.ts";

/***************************************************************************************************
 * @section Assert: Extended Equals (calls functions and awaits promises until reduced)
 **************************************************************************************************/

const isFunction = (t: unknown): t is Function => typeof t === "function";

const isPromise = (t: unknown): t is Promise<unknown> => t instanceof Promise;

const evaluate = async (t: unknown): Promise<any> => {
  let out: any = t;
  while (isFunction(out) || isPromise(out)) {
    if (isFunction(out)) {
      out = out();
    } else {
      out = await out;
    }
  }
  return out;
};

export const assertRunEquals = async <T>(
  left: T,
  right: T,
  name: string,
): Promise<void> =>
  assertEquals(await evaluate(left), await evaluate(right), name);

/***************************************************************************************************
 * @section Assert: Setoid
 **************************************************************************************************/

/**
 * Values a, b, and c must be equal, z must not be equal
 */
export const assertSetoid = async <T>(
  S: TC.Setoid<T>,
  name: string,
  { a, b, c, z }: Record<"a" | "b" | "c" | "z", T>,
): Promise<void> => {
  // DNE
  await assertRunEquals(
    S.equals(a, z),
    false,
    `${name} : Setoid Unequaal`,
  );

  // Reflexivity: S.equals(a, a) === true
  await assertRunEquals(
    S.equals(a, a),
    true,
    `${name} : Setoid Reflexivity`,
  );

  // Symmetry: S.equals(a, b) === S.equals(b, a)
  await assertRunEquals(
    S.equals(a, b),
    S.equals(b, a),
    `${name} : Setoid Symmetry`,
  );

  // Transitivity: if S.equals(a, b) and S.equals(b, c), then S.equals(a, c)
  await assertRunEquals(
    S.equals(a, b) &&
      S.equals(b, c),
    S.equals(a, c),
    `${name} : Setoid Transitivity`,
  );
};

/***************************************************************************************************
 * @section Assert: Ord
 **************************************************************************************************/

/**
 * Values must have a < b or b < a
 */
export const assertOrd = async <T>(
  S: TC.Ord<T>,
  name: string,
  { a, b }: Record<"a" | "b", T>,
): Promise<void> => {
  // Totality: S.lte(a, b) or S.lte(b, a)
  await assertRunEquals(
    S.lte(a, b) || S.lte(b, a),
    true,
    `${name} : Ord Totality`,
  );

  // Assert Setoid
  await assertSetoid(S, name, { a, b: a, c: a, z: b });
};

/***************************************************************************************************
 * @section Assert: Semigroup
 **************************************************************************************************/

export const assertSemigroup = async <T>(
  S: TC.Semigroup<T>,
  name: string,
  { a, b, c }: Record<"a" | "b" | "c", T>,
): Promise<void> => {
  // Associativity: S.concat(S.concat(a, b), c) ≡ S.concat(a, S.concat(b, c))
  await assertRunEquals(
    S.concat(S.concat(a, b), c),
    S.concat(a, S.concat(b, c)),
    `${name} : Semigroup Associativity`,
  );
};

/***************************************************************************************************
 * @section Assert: Monoid
 **************************************************************************************************/

export const assertMonoid = async <T>(
  M: TC.Monoid<T>,
  name: string,
  { a, b, c }: Record<"a" | "b" | "c", T>,
): Promise<void> => {
  // Right identity: M.concat(a, M.empty()) ≡ a
  await assertRunEquals(
    M.concat(a, M.empty()),
    a,
    `${name} : Monoid Right Identity`,
  );

  // Left identity: M.concat(M.empty(), a) ≡ a
  await assertRunEquals(
    M.concat(M.empty(), a),
    a,
    `${name} : Monoid Left Identity`,
  );

  // Assert Semigroup
  await assertSemigroup(M, name, { a, b, c });
};

/***************************************************************************************************
 * @section Assert: Group
 **************************************************************************************************/

export const assertGroup = async <T>(
  G: TC.Group<T>,
  name: string,
  { a, b, c }: Record<"a" | "b" | "c", T>,
): Promise<void> => {
  // Right inverse: G.concat(a, G.invert(a)) ≡ G.empty()
  await assertRunEquals(
    G.concat(a, G.invert(a)),
    G.empty(),
    `${name} : Group Right Inverse`,
  );

  // Left inverse: G.concat(G.invert(a), a) ≡ G.empty()
  await assertRunEquals(
    G.concat(G.invert(a), a),
    G.empty(),
    `${name} : Group Left Inverse`,
  );

  // Assert Monoid Laws
  await assertMonoid(G, name, { a, b, c });
};

/***************************************************************************************************
 * @section Assert: Semigroupoid
 * @todo Extend Types
 **************************************************************************************************/

export const assertSemigroupoid = async <T>(
  S: TC.Semigroupoid<T>,
  name: string,
  { a, b, c }: Record<"a" | "b" | "c", $<T, [any, any]>>,
): Promise<void> => {
  // Associativity: S.compose(S.compose(a, b), c) ≡ S.compose(a, S.compose(b, c))
  await assertRunEquals(
    S.compose(S.compose(a, b), c),
    S.compose(a, S.compose(b, c)),
    `${name} : Semigroupoid Associativity`,
  );
};

/***************************************************************************************************
 * @section Assert: Category
 * @todo Extend Types
 **************************************************************************************************/

export const assertCategory = async <T>(
  C: TC.Category<T>,
  name: string,
  { a, b, c }: Record<"a" | "b" | "c", $<T, [any, any]>>,
): Promise<void> => {
  // Right identity: M.compose(a, M.id()) ≡ a
  await assertRunEquals(
    C.compose(a, C.id()),
    a,
    `${name} : Category Right Identity`,
  );

  // Left identity: M.compose(M.id(), a) ≡ a
  await assertRunEquals(
    C.compose(C.id(), a),
    a,
    `${name} : Category Left Identity`,
  );

  // Assert Semigroupoid
  await assertSemigroupoid(C, name, { a, b, c });
};

/***************************************************************************************************
 * @section Assert: Filterable
 **************************************************************************************************/

type AssertFilterable = {
  <T, L extends 1, A>(
    M: TC.Filterable<T, L>,
    name: string,
    values: {
      a: $<T, [A]>;
      b: $<T, [A]>;
      f: Predicate<A>;
      g: Predicate<A>;
    },
  ): Promise<void>;
  <T, L extends 2, A>(
    M: TC.Filterable<T, L>,
    name: string,
    values: {
      a: $<T, [any, A]>;
      b: $<T, [any, A]>;
      f: Predicate<A>;
      g: Predicate<A>;
    },
  ): Promise<void>;
  <T, L extends 3, A>(
    M: TC.Filterable<T, L>,
    name: string,
    values: {
      a: $<T, [any, any, A]>;
      b: $<T, [any, any, A]>;
      f: Predicate<A>;
      g: Predicate<A>;
    },
  ): Promise<void>;
  <T, L extends 4, A>(
    M: TC.Filterable<T, L>,
    name: string,
    values: {
      a: $<T, [any, any, any, A]>;
      b: $<T, [any, any, any, A]>;
      f: Predicate<A>;
      g: Predicate<A>;
    },
  ): Promise<void>;
};

export const assertFilterable: AssertFilterable = async <T, A>(
  F: TC.Filterable<T>,
  name: string,
  { a, b, f, g }: {
    a: $<T, [A]>;
    b: $<T, [A]>;
    f: Predicate<A>;
    g: Predicate<A>;
  },
): Promise<void> => {
  // Distributivity: F.filter(x => f(x) && g(x), a) ≡ F.filter(g, F.filter(f, a))
  await assertRunEquals(
    F.filter((n) => f(n) && g(n), a),
    F.filter(g, F.filter(f, a)),
    `${name} : Filterable Distributivity`,
  );

  // Identity: F.filter(x => true, a) ≡ a
  await assertRunEquals(
    F.filter((n) => true, a),
    a,
    `${name} : Filterable Identity`,
  );

  // Annihilation: F.filter(x => false, a) ≡ F.filter(x => false, b)
  await assertRunEquals(
    F.filter((n) => false, a),
    F.filter((n) => false, b),
    `${name} : Filterable Annihilation`,
  );
};

/***************************************************************************************************
 * @section Assert: Functor
 **************************************************************************************************/

type AssertFunctor = {
  <T, L extends 1, A, B, C>(
    M: TC.Functor<T, L>,
    name: string,
    values: {
      ta: $<T, [A]>;
      fab: (a: A) => B;
      fbc: (b: B) => C;
    },
  ): Promise<void>;
  <T, L extends 2, E, A, B, C>(
    M: TC.Functor<T, L>,
    name: string,
    values: {
      ta: $<T, [E, A]>;
      fab: (a: A) => B;
      fbc: (b: B) => C;
    },
  ): Promise<void>;
  <T, L extends 3, R, E, A, B, C>(
    M: TC.Functor<T, L>,
    name: string,
    values: {
      ta: $<T, [R, E, A]>;
      fab: (a: A) => B;
      fbc: (b: B) => C;
    },
  ): Promise<void>;
  <T, L extends 4, S, R, E, A, B, C>(
    M: TC.Functor<T, L>,
    name: string,
    values: {
      ta: $<T, [S, R, E, A]>;
      fab: (a: A) => B;
      fbc: (b: B) => C;
    },
  ): Promise<void>;
};

export const assertFunctor: AssertFunctor = async <T, A, B, C>(
  F: TC.Functor<T>,
  name: string,
  { ta, fab, fbc }: {
    ta: $<T, [A]>;
    fab: (a: A) => B;
    fbc: (b: B) => C;
  },
): Promise<void> => {
  // Identity: F.map(x => x, a) ≡ a
  await assertRunEquals(
    F.map((x) => x, ta),
    ta,
    `${name} : Functor Identity`,
  );

  // Composition: F.map(x => f(g(x)), a) ≡ F.map(f, F.map(g, a))
  await assertRunEquals(
    F.map(
      (a) => fbc(fab(a)),
      ta,
    ),
    F.map(fbc, F.map(fab, ta)),
    `${name} : Functor Composition`,
  );
};

/***************************************************************************************************
 * @section Assert: Bifunctor
 **************************************************************************************************/

type AssertBifunctor = {
  <T, L extends 1, A, B, C, X, Y, Z>(
    M: TC.Bifunctor<T, L>,
    name: string,
    values: {
      tax: $<T, [A, X]>;
      fab: (a: A) => B;
      fbc: (b: B) => C;
      fxy: (x: X) => Y;
      fyz: (y: Y) => Z;
    },
  ): Promise<void>;
  <T, L extends 2, A, B, C, X, Y, Z>(
    M: TC.Bifunctor<T, L>,
    name: string,
    values: {
      tax: $<T, [A, X]>;
      fab: (a: A) => B;
      fbc: (b: B) => C;
      fxy: (x: X) => Y;
      fyz: (y: Y) => Z;
    },
  ): Promise<void>;
  <T, L extends 3, R, A, B, C, X, Y, Z>(
    M: TC.Bifunctor<T, L>,
    name: string,
    values: {
      tax: $<T, [R, A, X]>;
      fab: (a: A) => B;
      fbc: (b: B) => C;
      fxy: (x: X) => Y;
      fyz: (y: Y) => Z;
    },
  ): Promise<void>;
  <T, L extends 4, S, R, A, B, C, X, Y, Z>(
    M: TC.Bifunctor<T, L>,
    name: string,
    values: {
      tax: $<T, [S, R, A, X]>;
      fab: (a: A) => B;
      fbc: (b: B) => C;
      fxy: (x: X) => Y;
      fyz: (y: Y) => Z;
    },
  ): Promise<void>;
};

export const assertBifunctor: AssertBifunctor = async <T, A, B, C, X, Y, Z>(
  B: TC.Bifunctor<T>,
  name: string,
  { tax, fab, fbc, fxy, fyz }: {
    tax: $<T, [A, X]>;
    fab: (a: A) => B;
    fbc: (b: B) => C;
    fxy: (x: X) => Y;
    fyz: (y: Y) => Z;
  },
): Promise<void> => {
  // Identity: B.bimap(x => x, x => x, a) ≡ a
  await assertRunEquals(
    B.bimap((x) => x, (x) => x, tax),
    tax,
    `${name} : Bifunctor Identity`,
  );

  // Composition: B.bimap(x => f(g(x)), x => h(i(x)), a) ≡ B.bimap(f, h, B.bimap(g, i, a))
  await assertRunEquals(
    B.bimap(
      (a) => fbc(fab(a)),
      (x) => fyz(fxy(x)),
      tax,
    ),
    B.bimap(fbc, fyz, B.bimap(fab, fxy, tax)),
    `${name} : Bifunctor Composition`,
  );
};

/***************************************************************************************************
 * @section Assert: Contravariant
 **************************************************************************************************/

type AssertContravariant = {
  <T, L extends 1, A, B, C>(
    M: TC.Contravariant<T, L>,
    name: string,
    values: {
      tc: $<T, [C]>;
      fab: (a: A) => B;
      fbc: (b: B) => C;
    },
  ): Promise<void>;
  <T, L extends 2, E, A, B, C>(
    M: TC.Contravariant<T, L>,
    name: string,
    values: {
      tc: $<T, [E, C]>;
      fab: (a: A) => B;
      fbc: (b: B) => C;
    },
  ): Promise<void>;
  <T, L extends 3, R, E, A, B, C>(
    M: TC.Contravariant<T, L>,
    name: string,
    values: {
      tc: $<T, [R, E, C]>;
      fab: (a: A) => B;
      fbc: (b: B) => C;
    },
  ): Promise<void>;
  <T, L extends 4, S, R, E, A, B, C>(
    M: TC.Contravariant<T, L>,
    name: string,
    values: {
      tc: $<T, [S, R, E, C]>;
      fab: (a: A) => B;
      fbc: (b: B) => C;
    },
  ): Promise<void>;
};

export const assertContravariant: AssertContravariant = async <T, A, B, C>(
  C: TC.Contravariant<T>,
  name: string,
  { tc, fab, fbc }: {
    tc: $<T, [C]>;
    fab: (a: A) => B;
    fbc: (b: B) => C;
  },
): Promise<void> => {
  // Identity: F.contramap(x => x, a) ≡ a
  await assertRunEquals(
    C.contramap((x) => x, tc),
    tc,
    `${name} : Contravariant Identity`,
  );

  // Composition: F.contramap(x => f(g(x)), a) ≡ F.contramap(g, F.contramap(f, a))
  await assertRunEquals(
    C.contramap(
      (a: A) => fbc(fab(a)),
      tc,
    ),
    C.contramap(fab, C.contramap(fbc, tc)),
    `${name} : Contravariant Composition`,
  );
};

/***************************************************************************************************
 * @section Assert: Profunctor
 **************************************************************************************************/

type AssertProfunctor = {
  <T, L extends 1, A, B, C, X, Y, Z>(
    M: TC.Profunctor<T, L>,
    name: string,
    values: {
      tcx: $<T, [C, X]>;
      fab: (a: A) => B;
      fbc: (b: B) => C;
      fxy: (x: X) => Y;
      fyz: (y: Y) => Z;
    },
  ): Promise<void>;
  <T, L extends 2, A, B, C, X, Y, Z>(
    M: TC.Profunctor<T, L>,
    name: string,
    values: {
      tcx: $<T, [C, X]>;
      fab: (a: A) => B;
      fbc: (b: B) => C;
      fxy: (x: X) => Y;
      fyz: (y: Y) => Z;
    },
  ): Promise<void>;
  <T, L extends 3, R, A, B, C, X, Y, Z>(
    M: TC.Profunctor<T, L>,
    name: string,
    values: {
      tcx: $<T, [R, C, X]>;
      fab: (a: A) => B;
      fbc: (b: B) => C;
      fxy: (x: X) => Y;
      fyz: (y: Y) => Z;
    },
  ): Promise<void>;
  <T, L extends 4, S, R, A, B, C, X, Y, Z>(
    M: TC.Profunctor<T, L>,
    name: string,
    values: {
      tcx: $<T, [S, R, C, X]>;
      fab: (a: A) => B;
      fbc: (b: B) => C;
      fxy: (x: X) => Y;
      fyz: (y: Y) => Z;
    },
  ): Promise<void>;
};

export const assertProfunctor: AssertProfunctor = async <T, A, B, C, X, Y, Z>(
  P: TC.Profunctor<T>,
  name: string,
  { tcx, fab, fbc, fxy, fyz }: {
    tcx: $<T, [C, X]>;
    fab: (a: A) => B;
    fbc: (b: B) => C;
    fxy: (x: X) => Y;
    fyz: (y: Y) => Z;
  },
): Promise<void> => {
  // Identity: P.promap(x => x, x => x, a) ≡ a
  await assertRunEquals(
    P.promap((x) => x, (x) => x, tcx),
    tcx,
    `${name} : Profunctor Identity`,
  );

  // Composition: P.promap(x => f(g(x)), x => h(i(x)), a) ≡ P.promap(g, h, P.promap(f, i, a))
  await assertRunEquals(
    P.promap(
      (a: A) => fbc(fab(a)),
      (x) => fyz(fxy(x)),
      tcx,
    ),
    P.promap(fab, fyz, P.promap(fbc, fxy, tcx)),
    `${name} : Profunctor Composition`,
  );
};

/***************************************************************************************************
 * @section Assert: Apply
 **************************************************************************************************/

type AssertApply = {
  <T, L extends 1, A, B, C>(
    M: TC.Apply<T, L>,
    name: string,
    values: {
      ta: $<T, [A]>;
      fab: (a: A) => B;
      fbc: (b: B) => C;
      tfab: $<T, [(a: A) => B]>;
      tfbc: $<T, [(b: B) => C]>;
    },
  ): Promise<void>;
  <T, L extends 2, E, A, B, C>(
    M: TC.Apply<T, L>,
    name: string,
    values: {
      ta: $<T, [E, A]>;
      fab: (a: A) => B;
      fbc: (b: B) => C;
      tfab: $<T, [E, (a: A) => B]>;
      tfbc: $<T, [E, (b: B) => C]>;
    },
  ): Promise<void>;
  <T, L extends 3, R, E, A, B, C>(
    M: TC.Apply<T, L>,
    name: string,
    values: {
      ta: $<T, [R, E, A]>;
      fab: (a: A) => B;
      fbc: (b: B) => C;
      tfab: $<T, [R, E, (a: A) => B]>;
      tfbc: $<T, [R, E, (b: B) => C]>;
    },
  ): Promise<void>;
  <T, L extends 4, S, R, E, A, B, C>(
    M: TC.Apply<T, L>,
    name: string,
    values: {
      ta: $<T, [S, R, E, A]>;
      fab: (a: A) => B;
      fbc: (b: B) => C;
      tfab: $<T, [S, R, E, (a: A) => B]>;
      tfbc: $<T, [S, R, E, (b: B) => C]>;
    },
  ): Promise<void>;
};

export const assertApply: AssertApply = async <T, A, B, C>(
  A: TC.Apply<T>,
  name: string,
  { ta, fab, fbc, tfab, tfbc }: {
    ta: $<T, [A]>;
    fab: (a: A) => B;
    fbc: (b: B) => C;
    tfab: $<T, [(a: A) => B]>;
    tfbc: $<T, [(b: B) => C]>;
  },
): Promise<void> => {
  // Composition: A.ap(A.ap(A.map(f => g => x => f(g(x)), a), u), v) ≡ A.ap(a, A.ap(u, v))
  await assertRunEquals(
    A.ap(
      A.ap(
        A.map((f: (b: B) => C) => (g: (a: A) => B) => (x: A) => f(g(x)), tfbc),
        tfab,
      ),
      ta,
    ),
    A.ap(tfbc, A.ap(tfab, ta)),
    `${name} : Apply Composition`,
  );

  // Assert Functor
  await assertFunctor(A, name, { ta, fab, fbc });
};

/***************************************************************************************************
 * @section Assert: Applicative
 **************************************************************************************************/

type AssertApplicative = {
  <T, L extends 1, A, B, C>(
    A: TC.Applicative<T, L>,
    name: string,
    values: {
      a: A;
      ta: $<T, [A]>;
      fab: (a: A) => B;
      fbc: (b: B) => C;
      tfab: $<T, [(a: A) => B]>;
      tfbc: $<T, [(b: B) => C]>;
    },
  ): Promise<void>;
  <T, L extends 2, E, A, B, C>(
    A: TC.Applicative<T, L>,
    name: string,
    values: {
      a: A;
      ta: $<T, [E, A]>;
      fab: (a: A) => B;
      fbc: (b: B) => C;
      tfab: $<T, [E, (a: A) => B]>;
      tfbc: $<T, [E, (b: B) => C]>;
    },
  ): Promise<void>;
  <T, L extends 3, R, E, A, B, C>(
    A: TC.Applicative<T, L>,
    name: string,
    values: {
      a: A;
      ta: $<T, [R, E, A]>;
      fab: (a: A) => B;
      fbc: (b: B) => C;
      tfab: $<T, [R, E, (a: A) => B]>;
      tfbc: $<T, [R, E, (b: B) => C]>;
    },
  ): Promise<void>;
  <T, L extends 4, S, R, E, A, B, C>(
    A: TC.Applicative<T, L>,
    name: string,
    values: {
      a: A;
      ta: $<T, [S, R, E, A]>;
      fab: (a: A) => B;
      fbc: (b: B) => C;
      tfab: $<T, [S, R, E, (a: A) => B]>;
      tfbc: $<T, [S, R, E, (b: B) => C]>;
    },
  ): Promise<void>;
};

export const assertApplicative: AssertApplicative = async <T, A, B, C>(
  A: TC.Applicative<T>,
  name: string,
  { a, ta, fab, fbc, tfab, tfbc }: {
    a: A;
    ta: $<T, [A]>;
    fab: (a: A) => B;
    fbc: (b: B) => C;
    tfab: $<T, [(a: A) => B]>;
    tfbc: $<T, [(b: B) => C]>;
  },
): Promise<void> => {
  // Identity: A.ap(A.of(x => x), v) ≡ v
  await assertRunEquals(
    A.ap(A.of((x: any) => x), ta),
    ta,
    `${name} : Applicative Identity`,
  );

  // Homomorphism: A.ap(A.of(f), A.of(x)) ≡ A.of(f(x))
  await assertRunEquals(
    A.ap(A.of(fab), A.of(a)),
    A.of(fab(a)),
    `${name} : Applicative Homomorphism`,
  );

  // Interchange: A.ap(u, A.of(y)) ≡ A.ap(A.of(f => f(y)), u)
  await assertRunEquals(
    A.ap(tfab, A.of(a)),
    A.ap(A.of((f: typeof fab) => f(a)), tfab),
    `${name} : Applicative Interchange`,
  );

  // Assert Apply
  await assertApply(A, name, { ta, fab, fbc, tfab, tfbc });
};

/***************************************************************************************************
 * @section Assert: Alt
 **************************************************************************************************/

type AssertAlt = {
  <T, L extends 1, A, B, C>(
    A: TC.Alt<T, L>,
    name: string,
    values: {
      ta: $<T, [A]>;
      tb: $<T, [A]>;
      tc: $<T, [A]>;
      fab: (a: A) => B;
      fbc: (b: B) => C;
    },
  ): Promise<void>;
  <T, L extends 2, E, A, B, C>(
    A: TC.Alt<T, L>,
    name: string,
    values: {
      ta: $<T, [E, A]>;
      tb: $<T, [E, A]>;
      tc: $<T, [E, A]>;
      fab: (a: A) => B;
      fbc: (b: B) => C;
    },
  ): Promise<void>;
  <T, L extends 3, R, E, A, B, C>(
    A: TC.Alt<T, L>,
    name: string,
    values: {
      ta: $<T, [R, E, A]>;
      tb: $<T, [R, E, A]>;
      tc: $<T, [R, E, A]>;
      fab: (a: A) => B;
      fbc: (b: B) => C;
    },
  ): Promise<void>;
  <T, L extends 4, S, R, E, A, B, C>(
    A: TC.Alt<T, L>,
    name: string,
    values: {
      ta: $<T, [S, R, E, A]>;
      tb: $<T, [S, R, E, A]>;
      tc: $<T, [S, R, E, A]>;
      fab: (a: A) => B;
      fbc: (b: B) => C;
    },
  ): Promise<void>;
};

export const assertAlt: AssertAlt = async <T, A, B, C>(
  A: TC.Alt<T>,
  name: string,
  { ta, tb, tc, fab, fbc }: {
    ta: $<T, [A]>;
    tb: $<T, [A]>;
    tc: $<T, [A]>;
    fab: (a: A) => B;
    fbc: (b: B) => C;
  },
): Promise<void> => {
  // Associativity: A.alt(A.alt(a, b), c) ≡ A.alt(a, A.alt(b, c))
  await assertRunEquals(
    A.alt(A.alt(ta, tb), tc),
    A.alt(ta, A.alt(tb, tc)),
    `${name} : Alt Associativity`,
  );

  // Distributivity: A.map(f, A.alt(a, b)) ≡ A.alt(A.map(f, a), A.map(f, b))
  await assertRunEquals(
    A.map(fab, A.alt(ta, tb)),
    A.alt(A.map(fab, ta), A.map(fab, tb)),
    `${name} : Alt Distributivity`,
  );

  // Assert Functor
  await assertFunctor(A, name, { ta, fab, fbc });
};

/***************************************************************************************************
 * @section Assert: Plus
 **************************************************************************************************/

type AssertPlus = {
  <T, L extends 1, A, B, C>(
    A: TC.Plus<T, L>,
    name: string,
    values: {
      ta: $<T, [A]>;
      tb: $<T, [A]>;
      tc: $<T, [A]>;
      fab: (a: A) => B;
      fbc: (b: B) => C;
    },
  ): Promise<void>;
  <T, L extends 2, E, A, B, C>(
    A: TC.Plus<T, L>,
    name: string,
    values: {
      ta: $<T, [E, A]>;
      tb: $<T, [E, A]>;
      tc: $<T, [E, A]>;
      fab: (a: A) => B;
      fbc: (b: B) => C;
    },
  ): Promise<void>;
  <T, L extends 3, R, E, A, B, C>(
    A: TC.Plus<T, L>,
    name: string,
    values: {
      ta: $<T, [R, E, A]>;
      tb: $<T, [R, E, A]>;
      tc: $<T, [R, E, A]>;
      fab: (a: A) => B;
      fbc: (b: B) => C;
    },
  ): Promise<void>;
  <T, L extends 4, S, R, E, A, B, C>(
    A: TC.Plus<T, L>,
    name: string,
    values: {
      ta: $<T, [S, R, E, A]>;
      tb: $<T, [S, R, E, A]>;
      tc: $<T, [S, R, E, A]>;
      fab: (a: A) => B;
      fbc: (b: B) => C;
    },
  ): Promise<void>;
};

export const assertPlus: AssertPlus = async <T, A, B, C>(
  P: TC.Plus<T>,
  name: string,
  { ta, tb, tc, fab, fbc }: {
    ta: $<T, [A]>;
    tb: $<T, [A]>;
    tc: $<T, [A]>;
    fab: (a: A) => B;
    fbc: (b: B) => C;
  },
): Promise<void> => {
  // Right identity: P.alt(a, P.zero()) ≡ a
  await assertRunEquals(
    P.alt(ta, P.zero()),
    ta,
    `${name} : Plus Right Identity`,
  );

  // Left identity: P.alt(P.zero(), a) ≡ a
  await assertRunEquals(
    P.alt(P.zero(), ta),
    ta,
    `${name} : Plus Left Identity`,
  );

  // Annihilation: P.map(f, P.zero()) ≡ P.zero()
  await assertRunEquals(
    P.map(fab, P.zero()),
    P.zero(),
    `${name} : Plus Annihilation`,
  );

  // Assert Alt
  await assertAlt(P, name, { ta, tb, tc, fab, fbc });
};

/***************************************************************************************************
 * @section Assert: Alternative
 **************************************************************************************************/

type AssertAlternative = {
  <T, L extends 1, A, B, C>(
    A: TC.Alternative<T, L>,
    name: string,
    values: {
      a: A;
      ta: $<T, [A]>;
      tb: $<T, [A]>;
      tc: $<T, [A]>;
      fab: (a: A) => B;
      fbc: (b: B) => C;
      tfab: $<T, [(a: A) => B]>;
      tfbc: $<T, [(b: B) => C]>;
    },
  ): Promise<void>;
  <T, L extends 2, E, A, B, C>(
    A: TC.Alternative<T, L>,
    name: string,
    values: {
      a: A;
      ta: $<T, [E, A]>;
      tb: $<T, [E, A]>;
      tc: $<T, [E, A]>;
      fab: (a: A) => B;
      fbc: (b: B) => C;
      tfab: $<T, [E, (a: A) => B]>;
      tfbc: $<T, [E, (b: B) => C]>;
    },
  ): Promise<void>;
  <T, L extends 3, R, E, A, B, C>(
    A: TC.Alternative<T, L>,
    name: string,
    values: {
      a: A;
      ta: $<T, [R, E, A]>;
      tb: $<T, [R, E, A]>;
      tc: $<T, [R, E, A]>;
      fab: (a: A) => B;
      fbc: (b: B) => C;
      tfab: $<T, [R, E, (a: A) => B]>;
      tfbc: $<T, [R, E, (b: B) => C]>;
    },
  ): Promise<void>;
  <T, L extends 4, S, R, E, A, B, C>(
    A: TC.Alternative<T, L>,
    name: string,
    values: {
      a: A;
      ta: $<T, [S, R, E, A]>;
      tb: $<T, [S, R, E, A]>;
      tc: $<T, [S, R, E, A]>;
      fab: (a: A) => B;
      fbc: (b: B) => C;
      tfab: $<T, [S, R, E, (a: A) => B]>;
      tfbc: $<T, [S, R, E, (b: B) => C]>;
    },
  ): Promise<void>;
};

export const assertAlternative: AssertAlternative = async <T, A, B, C>(
  A: TC.Alternative<T>,
  name: string,
  { a, ta, tb, tc, fab, fbc, tfab, tfbc }: {
    a: A;
    ta: $<T, [A]>;
    tb: $<T, [A]>;
    tc: $<T, [A]>;
    fab: (a: A) => B;
    fbc: (b: B) => C;
    tfab: $<T, [(a: A) => B]>;
    tfbc: $<T, [(b: B) => C]>;
  },
): Promise<void> => {
  // Distributivity: A.ap(A.alt(a, b), c) ≡ A.alt(A.ap(a, c), A.ap(b, c))
  await assertRunEquals(
    A.ap(A.alt(A.of(fab), tfab), ta),
    A.alt(A.ap(A.of(fab), ta), A.ap(tfab, ta)),
    `${name} : Alternative Distributivity`,
  );

  // Annihilation: A.ap(A.zero(), a) ≡ A.zero()
  await assertRunEquals(
    A.ap(A.zero<(a: A) => B>(), ta),
    A.zero(),
    `${name} : Alternative Annihilation`,
  );

  // Assert Applicative
  await assertApplicative(A, name, { a, ta, fab, fbc, tfab, tfbc });

  // Assert Plus
  await assertPlus(A, name, { ta, tb, tc, fab, fbc });
};

/***************************************************************************************************
 * @section Assert: Chain
 **************************************************************************************************/

type AssertChain = {
  <T, L extends 1, A, B, C>(
    A: TC.Chain<T, L>,
    name: string,
    values: {
      ta: $<T, [A]>;
      fab: (a: A) => B;
      fbc: (b: B) => C;
      tfab: $<T, [(a: A) => B]>;
      tfbc: $<T, [(a: B) => C]>;
      fatb: (a: A) => $<T, [B]>;
      fbtc: (a: B) => $<T, [C]>;
    },
  ): Promise<void>;
  <T, L extends 2, E, A, B, C>(
    A: TC.Chain<T, L>,
    name: string,
    values: {
      ta: $<T, [E, A]>;
      fab: (a: A) => B;
      fbc: (b: B) => C;
      tfab: $<T, [E, (a: A) => B]>;
      tfbc: $<T, [E, (a: B) => C]>;
      fatb: (a: A) => $<T, [E, B]>;
      fbtc: (a: B) => $<T, [E, C]>;
    },
  ): Promise<void>;
  <T, L extends 3, R, E, A, B, C>(
    A: TC.Chain<T, L>,
    name: string,
    values: {
      ta: $<T, [R, E, A]>;
      fab: (a: A) => B;
      fbc: (b: B) => C;
      tfab: $<T, [R, E, (a: A) => B]>;
      tfbc: $<T, [R, E, (a: B) => C]>;
      fatb: (a: A) => $<T, [R, E, B]>;
      fbtc: (a: B) => $<T, [R, E, C]>;
    },
  ): Promise<void>;
  <T, L extends 4, S, R, E, A, B, C>(
    A: TC.Chain<T, L>,
    name: string,
    values: {
      ta: $<T, [S, R, E, A]>;
      fab: (a: A) => B;
      fbc: (b: B) => C;
      tfab: $<T, [S, R, E, (a: A) => B]>;
      tfbc: $<T, [S, R, E, (a: B) => C]>;
      fatb: (a: A) => $<T, [S, R, E, B]>;
      fbtc: (a: B) => $<T, [S, R, E, C]>;
    },
  ): Promise<void>;
};

export const assertChain: AssertChain = async <T, A, B, C>(
  C: TC.Chain<T>,
  name: string,
  { ta, fab, fbc, tfab, tfbc, fatb, fbtc }: {
    ta: $<T, [A]>;
    fab: (a: A) => B;
    fbc: (b: B) => C;
    tfab: $<T, [(a: A) => B]>;
    tfbc: $<T, [(a: B) => C]>;
    fatb: (a: A) => $<T, [B]>;
    fbtc: (a: B) => $<T, [C]>;
  },
): Promise<void> => {
  // Associativity: M.chain(g, M.chain(f, u)) ≡ M.chain(x => M.chain(g, f(x)), u)
  await assertRunEquals(
    C.chain(fbtc, C.chain(fatb, ta)),
    C.chain((x) => C.chain(fbtc, fatb(x)), ta),
    `${name} : Chain Associativity`,
  );

  // Assert Apply
  await assertApply(C, name, { ta, fab, fbc, tfab, tfbc });
};

/***************************************************************************************************
 * @section Assert: ChainRec
 * @todo Implement?
 **************************************************************************************************/

/***************************************************************************************************
 * @section Assert: Monad
 **************************************************************************************************/

type AssertMonad = {
  <T, L extends 1, A, B, C>(
    A: TC.Monad<T, L>,
    name: string,
    values: {
      a: A;
      ta: $<T, [A]>;
      fab: (a: A) => B;
      fbc: (b: B) => C;
      fatb: (a: A) => $<T, [B]>;
      fbtc: (a: B) => $<T, [C]>;
      tfab: $<T, [(a: A) => B]>;
      tfbc: $<T, [(b: B) => C]>;
    },
  ): Promise<void>;
  <T, L extends 2, E, A, B, C>(
    A: TC.Monad<T, L>,
    name: string,
    values: {
      a: A;
      ta: $<T, [E, A]>;
      fab: (a: A) => B;
      fbc: (b: B) => C;
      fatb: (a: A) => $<T, [E, B]>;
      fbtc: (a: B) => $<T, [E, C]>;
      tfab: $<T, [E, (a: A) => B]>;
      tfbc: $<T, [E, (b: B) => C]>;
    },
  ): Promise<void>;
  <T, L extends 3, R, E, A, B, C>(
    A: TC.Monad<T, L>,
    name: string,
    values: {
      a: A;
      ta: $<T, [R, E, A]>;
      fab: (a: A) => B;
      fbc: (b: B) => C;
      fatb: (a: A) => $<T, [R, E, B]>;
      fbtc: (a: B) => $<T, [R, E, C]>;
      tfab: $<T, [R, E, (a: A) => B]>;
      tfbc: $<T, [R, E, (b: B) => C]>;
    },
  ): Promise<void>;
  <T, L extends 4, S, R, E, A, B, C>(
    A: TC.Monad<T, L>,
    name: string,
    values: {
      a: A;
      ta: $<T, [S, R, E, A]>;
      fab: (a: A) => B;
      fbc: (b: B) => C;
      fatb: (a: A) => $<T, [S, R, E, B]>;
      fbtc: (a: B) => $<T, [S, R, E, C]>;
      tfab: $<T, [S, R, E, (a: A) => B]>;
      tfbc: $<T, [S, R, E, (b: B) => C]>;
    },
  ): Promise<void>;
};

export const assertMonad: AssertMonad = async <T, A, B, C>(
  M: TC.Monad<T>,
  name: string,
  { a, ta, fab, fbc, fatb, fbtc, tfab, tfbc }: {
    a: A;
    ta: $<T, [A]>;
    fab: (a: A) => B;
    fbc: (b: B) => C;
    fatb: (a: A) => $<T, [B]>;
    fbtc: (a: B) => $<T, [C]>;
    tfab: $<T, [(a: A) => B]>;
    tfbc: $<T, [(b: B) => C]>;
  },
): Promise<void> => {
  // Left identity: M.chain(f, M.of(a)) ≡ f(a)
  await assertRunEquals(
    M.chain(fatb, M.of(a)),
    fatb(a),
    `${name} : Monad Left Identity`,
  );

  // Right identity: M.chain(M.of, u) ≡ u
  await assertRunEquals(
    M.chain(M.of, ta),
    ta,
    `${name} : Monad Right Identity`,
  );

  // Assert Applicative
  await assertApplicative(M, name, { a, ta, fab, fbc, tfab, tfbc });

  // Assert Chain
  await assertChain(M, name, { ta, fab, fbc, fatb, fbtc, tfab, tfbc });
};

/***************************************************************************************************
 * @section Assert: Foldable
 **************************************************************************************************/

type AssertFoldable = {
  <T, L extends 1, A, B>(
    A: TC.Foldable<T, L>,
    name: string,
    values: {
      a: A;
      tb: $<T, [B]>;
      faba: (a: A, b: B) => A;
    },
  ): Promise<void>;
  <T, L extends 2, E, A, B>(
    A: TC.Foldable<T, L>,
    name: string,
    values: {
      a: A;
      tb: $<T, [E, B]>;
      faba: (a: A, b: B) => A;
    },
  ): Promise<void>;
  <T, L extends 3, R, E, A, B>(
    A: TC.Foldable<T, L>,
    name: string,
    values: {
      a: A;
      tb: $<T, [R, E, B]>;
      faba: (a: A, b: B) => A;
    },
  ): Promise<void>;
  <T, L extends 4, S, R, E, A, B>(
    A: TC.Foldable<T, L>,
    name: string,
    values: {
      a: A;
      tb: $<T, [S, R, E, B]>;
      faba: (a: A, b: B) => A;
    },
  ): Promise<void>;
};

export const assertFoldable: AssertFoldable = async <T, A, B>(
  F: TC.Foldable<T>,
  name: string,
  { a, tb, faba }: {
    a: A;
    tb: $<T, [B]>;
    faba: (a: A, b: B) => A;
  },
): Promise<void> => {
  // F.reduce ≡ (f, x, u) => F.reduce((acc, y) => acc.concat([y]), [], u).reduce(f, x)
  await assertRunEquals(
    F.reduce((acc: B[], y: B) => acc.concat([y]), [], tb).reduce(faba, a),
    F.reduce(faba, a, tb),
    `${name} : Foldable Law?`,
  );
};

/***************************************************************************************************
 * @section Assert: Extend
 **************************************************************************************************/

type AssertExtend = {
  <T, L extends 1, A, B, C>(
    A: TC.Extend<T, L>,
    name: string,
    values: {
      ta: $<T, [A]>;
      fab: (a: A) => B;
      fbc: (b: B) => C;
      ftab: (ta: $<T, [A]>) => B;
      ftbc: (tb: $<T, [B]>) => C;
    },
  ): Promise<void>;
  <T, L extends 2, E, A, B, C>(
    A: TC.Extend<T, L>,
    name: string,
    values: {
      ta: $<T, [E, A]>;
      fab: (a: A) => B;
      fbc: (b: B) => C;
      ftab: (ta: $<T, [E, A]>) => B;
      ftbc: (tb: $<T, [E, B]>) => C;
    },
  ): Promise<void>;
  <T, L extends 3, R, E, A, B, C>(
    A: TC.Extend<T, L>,
    name: string,
    values: {
      ta: $<T, [R, E, A]>;
      fab: (a: A) => B;
      fbc: (b: B) => C;
      ftab: (ta: $<T, [R, E, A]>) => B;
      ftbc: (tb: $<T, [R, E, B]>) => C;
    },
  ): Promise<void>;
  <T, L extends 4, S, R, E, A, B, C>(
    A: TC.Extend<T, L>,
    name: string,
    values: {
      ta: $<T, [S, R, E, A]>;
      fab: (a: A) => B;
      fbc: (b: B) => C;
      ftab: (ta: $<T, [S, R, E, A]>) => B;
      ftbc: (tb: $<T, [S, R, E, B]>) => C;
    },
  ): Promise<void>;
};

export const assertExtend: AssertExtend = async <T, A, B, C>(
  E: TC.Extend<T>,
  name: string,
  { ta, fab, fbc, ftab, ftbc }: {
    ta: $<T, [A]>;
    fab: (a: A) => B;
    fbc: (b: B) => C;
    ftab: (ta: $<T, [A]>) => B;
    ftbc: (tb: $<T, [B]>) => C;
  },
): Promise<void> => {
  // Associativity: E.extend(f, E.extend(g, w)) ≡ E.extend(_w => f(E.extend(g, _w)), w)
  await assertRunEquals(
    E.extend(ftbc, E.extend(ftab, ta)),
    E.extend((a) => ftbc(E.extend(ftab, a)), ta),
    `${name} : Extend Associativity`,
  );

  // Assert Functor
  await assertFunctor(E, name, { ta, fab, fbc });
};

/***************************************************************************************************
 * @section Assert: Comonad
 **************************************************************************************************/

type AssertComonad = {
  <T, L extends 1, A, B, C>(
    A: TC.Comonad<T, L>,
    name: string,
    values: {
      ta: $<T, [A]>;
      fab: (a: A) => B;
      fbc: (b: B) => C;
      ftab: (ta: $<T, [A]>) => B;
      ftbc: (tb: $<T, [B]>) => C;
    },
  ): Promise<void>;
  <T, L extends 2, E, A, B, C>(
    A: TC.Comonad<T, L>,
    name: string,
    values: {
      ta: $<T, [E, A]>;
      fab: (a: A) => B;
      fbc: (b: B) => C;
      ftab: (ta: $<T, [E, A]>) => B;
      ftbc: (tb: $<T, [E, B]>) => C;
    },
  ): Promise<void>;
  <T, L extends 3, R, E, A, B, C>(
    A: TC.Comonad<T, L>,
    name: string,
    values: {
      ta: $<T, [R, E, A]>;
      fab: (a: A) => B;
      fbc: (b: B) => C;
      ftab: (ta: $<T, [R, E, A]>) => B;
      ftbc: (tb: $<T, [R, E, B]>) => C;
    },
  ): Promise<void>;
  <T, L extends 4, S, R, E, A, B, C>(
    A: TC.Comonad<T, L>,
    name: string,
    values: {
      ta: $<T, [S, R, E, A]>;
      fab: (a: A) => B;
      fbc: (b: B) => C;
      ftab: (ta: $<T, [S, R, E, A]>) => B;
      ftbc: (tb: $<T, [S, R, E, B]>) => C;
    },
  ): Promise<void>;
};

export const assertComonad: AssertComonad = async <T, A, B, C>(
  C: TC.Comonad<T>,
  name: string,
  { ta, fab, fbc, ftab, ftbc }: {
    ta: $<T, [A]>;
    fab: (a: A) => B;
    fbc: (b: B) => C;
    ftab: (ta: $<T, [A]>) => B;
    ftbc: (tb: $<T, [B]>) => C;
  },
): Promise<void> => {
  // Left identity: C.extend(C.extract, w) ≡ w
  await assertRunEquals(
    C.extend(C.extract, ta),
    ta,
    `${name} : Comonad Left Identity`,
  );

  // Right identity: C.extract(C.extend(f, w)) ≡ f(w)
  await assertRunEquals(
    C.extract(C.extend(ftab, ta)),
    ftab(ta),
    `${name} : Comonad Right Identity`,
  );

  // Assert Extend
  await assertExtend(C, name, { ta, fab, fbc, ftab, ftbc });
};

/***************************************************************************************************
 * @section Assert: Traversable
 * @todo Implement?
 **************************************************************************************************/
