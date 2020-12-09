// deno-lint-ignore-file no-explicit-any

import { assertEquals } from "https://deno.land/std@0.77.0/testing/asserts.ts";

import type * as TC from "../type_classes.ts";
import type { $, Predicate } from "../types.ts";
import { flow, identity, pipe } from "../fns.ts";

/***************************************************************************************************
 * @section Assert: Setoid
 **************************************************************************************************/

/**
 * Values a, b, and c must be equal, z must not be equal
 */
export const assertSetoid = <T>(
  S: TC.Setoid<T>,
  { a, b, c, z }: Record<"a" | "b" | "c" | "z", T>,
): void => {
  // DNE
  assertEquals(
    S.equals(a, z),
    false,
  );

  // Reflexivity: S.equals(a, a) === true
  assertEquals(
    S.equals(a, a),
    true,
  );

  // Symmetry: S.equals(a, b) === S.equals(b, a)
  assertEquals(
    S.equals(a, b),
    S.equals(b, a),
  );

  // Transitivity: if S.equals(a, b) and S.equals(b, c), then S.equals(a, c)
  assertEquals(
    S.equals(a, b) &&
      S.equals(b, c),
    S.equals(a, c),
  );
};

/***************************************************************************************************
 * @section Assert: Ord
 **************************************************************************************************/

/**
 * Values must have a < b or b < a
 */
export const assertOrd = <T>(
  S: TC.Ord<T>,
  { a, b }: Record<"a" | "b", T>,
): void => {
  // Totality: S.lte(a, b) or S.lte(b, a)
  assertEquals(
    S.lte(a, b) || S.lte(b, a),
    true,
  );

  // Assert Setoid
  assertSetoid(S, { a, b: a, c: a, z: b });
};

/***************************************************************************************************
 * @section Assert: Semigroup
 **************************************************************************************************/

export const assertSemigroup = <T>(
  S: TC.Semigroup<T>,
  { a, b, c }: Record<"a" | "b" | "c", T>,
): void => {
  // Associativity: S.concat(S.concat(a, b), c) ≡ S.concat(a, S.concat(b, c))
  assertEquals(
    S.concat(S.concat(a, b), c),
    S.concat(a, S.concat(b, c)),
  );
};

/***************************************************************************************************
 * @section Assert: Monoid
 **************************************************************************************************/

export const assertMonoid = <T>(
  M: TC.Monoid<T>,
  { a, b, c }: Record<"a" | "b" | "c", T>,
): void => {
  // Right identity: M.concat(a, M.empty()) ≡ a
  assertEquals(
    M.concat(a, M.empty()),
    a,
  );

  // Left identity: M.concat(M.empty(), a) ≡ a
  assertEquals(
    M.concat(M.empty(), a),
    a,
  );

  // Assert Semigroup
  assertSemigroup(M, { a, b, c });
};

/***************************************************************************************************
 * @section Assert: Group
 **************************************************************************************************/

export const assertGroup = <T>(
  G: TC.Group<T>,
  { a, b, c }: Record<"a" | "b" | "c", T>,
): void => {
  // Right inverse: G.concat(a, G.invert(a)) ≡ G.empty()
  assertEquals(
    G.concat(a, G.invert(a)),
    G.empty(),
  );

  // Left inverse: G.concat(G.invert(a), a) ≡ G.empty()
  assertEquals(
    G.concat(G.invert(a), a),
    G.empty(),
  );

  // Assert Monoid Laws
  assertMonoid(G, { a, b, c });
};

/***************************************************************************************************
 * @section Assert: Semigroupoid
 * @todo Extend Types
 **************************************************************************************************/

export const assertSemigroupoid = <T>(
  S: TC.Semigroupoid<T>,
  { a, b, c }: Record<"a" | "b" | "c", $<T, [any, any]>>,
): void => {
  // Associativity: S.compose(S.compose(a, b), c) ≡ S.compose(a, S.compose(b, c))
  assertEquals(
    S.compose(c)(S.compose(b)(a)),
    S.compose(S.compose(c)(b))(a),
  );
};

/***************************************************************************************************
 * @section Assert: Category
 * @todo Extend Types
 **************************************************************************************************/

export const assertCategory = <T>(
  C: TC.Category<T>,
  { a, b, c }: Record<"a" | "b" | "c", $<T, [any, any]>>,
): void => {
  // Right identity: M.compose(a, M.id()) ≡ a
  assertEquals(
    C.compose(C.id())(a),
    a,
  );

  // Left identity: M.compose(M.id(), a) ≡ a
  assertEquals(
    C.compose(a)(C.id()),
    a,
  );

  // Assert Semigroupoid
  assertSemigroupoid(C, { a, b, c });
};

/***************************************************************************************************
 * @section Assert: Filterable
 **************************************************************************************************/

type AssertFilterable = {
  <A, T, L extends TC.LS = 1>(
    M: TC.Filterable<T, L>,
    values: {
      a: $<T, [A]>;
      b: $<T, [A]>;
      f: Predicate<A>;
      g: Predicate<A>;
    },
  ): void;
  <E, A, T, L extends TC.LS = 2>(
    M: TC.Filterable<T, L>,
    values: {
      a: $<T, [E, A]>;
      b: $<T, [E, A]>;
      f: Predicate<A>;
      g: Predicate<A>;
    },
  ): void;
  <R, E, A, T, L extends TC.LS = 3>(
    M: TC.Filterable<T, L>,
    values: {
      a: $<T, [R, E, A]>;
      b: $<T, [R, E, A]>;
      f: Predicate<A>;
      g: Predicate<A>;
    },
  ): void;
  <S, R, E, A, T, L extends TC.LS = 4>(
    M: TC.Filterable<T, L>,
    values: {
      a: $<T, [S, R, E, A]>;
      b: $<T, [S, R, E, A]>;
      f: Predicate<A>;
      g: Predicate<A>;
    },
  ): void;
};

export const assertFilterable: AssertFilterable = <T, A>(
  F: TC.Filterable<T>,
  { a, b, f, g }: {
    a: $<T, [A]>;
    b: $<T, [A]>;
    f: Predicate<A>;
    g: Predicate<A>;
  },
): void => {
  // Distributivity: F.filter(x => f(x) && g(x), a) ≡ F.filter(g, F.filter(f, a))
  assertEquals(
    pipe(a, F.filter((n: A) => f(n) && g(n))),
    pipe(a, F.filter(f), F.filter(g)),
  );

  // Identity: F.filter(x => true, a) ≡ a
  assertEquals(
    F.filter((n) => true)(a),
    a,
  );

  // Annihilation: F.filter(x => false, a) ≡ F.filter(x => false, b)
  assertEquals(
    F.filter((n) => false)(a),
    F.filter((n) => false)(b),
  );
};

/***************************************************************************************************
 * @section Assert: Functor
 **************************************************************************************************/

type AssertFunctor = {
  <A, B, C, T, L extends TC.LS = 1>(
    M: TC.Functor<T, L>,
    values: {
      ta: $<T, [A]>;
      fab: (a: A) => B;
      fbc: (b: B) => C;
    },
  ): void;
  <E, A, B, C, T, L extends TC.LS = 2>(
    M: TC.Functor<T, L>,
    values: {
      ta: $<T, [E, A]>;
      fab: (a: A) => B;
      fbc: (b: B) => C;
    },
  ): void;
  <R, E, A, B, C, T, L extends TC.LS = 3>(
    M: TC.Functor<T, L>,
    values: {
      ta: $<T, [R, E, A]>;
      fab: (a: A) => B;
      fbc: (b: B) => C;
    },
  ): void;
  <S, R, E, A, B, C, T, L extends TC.LS = 4>(
    M: TC.Functor<T, L>,
    values: {
      ta: $<T, [S, R, E, A]>;
      fab: (a: A) => B;
      fbc: (b: B) => C;
    },
  ): void;
};

export const assertFunctor: AssertFunctor = <T, A, B, C>(
  F: TC.Functor<T>,
  { ta, fab, fbc }: {
    ta: $<T, [A]>;
    fab: (a: A) => B;
    fbc: (b: B) => C;
  },
): void => {
  // Identity: F.map(x => x, a) ≡ a
  assertEquals(
    F.map((x) => x)(ta),
    ta,
  );

  // Composition: F.map(x => f(g(x)), a) ≡ F.map(f, F.map(g, a))
  assertEquals(
    pipe(ta, F.map((a) => fbc(fab(a)))),
    pipe(ta, F.map(fab), F.map(fbc)),
  );
};

/***************************************************************************************************
 * @section Assert: Bifunctor
 **************************************************************************************************/

type AssertBifunctor = {
  <A, B, C, X, Y, Z, T, L extends TC.LS = 1>(
    M: TC.Bifunctor<T, L>,
    values: {
      tax: $<T, [A, X]>;
      fab: (a: A) => B;
      fbc: (b: B) => C;
      fxy: (x: X) => Y;
      fyz: (y: Y) => Z;
    },
  ): void;
  <A, B, C, X, Y, Z, T, L extends TC.LS = 2>(
    M: TC.Bifunctor<T, L>,
    values: {
      tax: $<T, [A, X]>;
      fab: (a: A) => B;
      fbc: (b: B) => C;
      fxy: (x: X) => Y;
      fyz: (y: Y) => Z;
    },
  ): void;
  <R, A, B, C, X, Y, Z, T, L extends TC.LS = 3>(
    M: TC.Bifunctor<T, L>,
    values: {
      tax: $<T, [R, A, X]>;
      fab: (a: A) => B;
      fbc: (b: B) => C;
      fxy: (x: X) => Y;
      fyz: (y: Y) => Z;
    },
  ): void;
  <S, R, A, B, C, X, Y, Z, T, L extends TC.LS = 4>(
    M: TC.Bifunctor<T, L>,
    values: {
      tax: $<T, [S, R, A, X]>;
      fab: (a: A) => B;
      fbc: (b: B) => C;
      fxy: (x: X) => Y;
      fyz: (y: Y) => Z;
    },
  ): void;
};

export const assertBifunctor: AssertBifunctor = <T, A, B, C, X, Y, Z>(
  B: TC.Bifunctor<T>,
  { tax, fab, fbc, fxy, fyz }: {
    tax: $<T, [A, X]>;
    fab: (a: A) => B;
    fbc: (b: B) => C;
    fxy: (x: X) => Y;
    fyz: (y: Y) => Z;
  },
): void => {
  // Identity: B.bimap(x => x, x => x, a) ≡ a
  assertEquals(
    B.bimap((x) => x, (x) => x)(tax),
    tax,
  );

  // Composition: B.bimap(x => f(g(x)), x => h(i(x)), a) ≡ B.bimap(f, h, B.bimap(g, i, a))
  assertEquals(
    pipe(
      tax,
      B.bimap(
        (a) => fbc(fab(a)),
        (x) => fyz(fxy(x)),
      ),
    ),
    pipe(tax, B.bimap(fab, fxy), B.bimap(fbc, fyz)),
  );
};

/***************************************************************************************************
 * @section Assert: Contravariant
 **************************************************************************************************/

type AssertContravariant = {
  <A, B, C, T, L extends TC.LS = 1>(
    M: TC.Contravariant<T, L>,
    values: {
      tc: $<T, [C]>;
      fab: (a: A) => B;
      fbc: (b: B) => C;
    },
  ): void;
  <E, A, B, C, T, L extends TC.LS = 2>(
    M: TC.Contravariant<T, L>,
    values: {
      tc: $<T, [E, C]>;
      fab: (a: A) => B;
      fbc: (b: B) => C;
    },
  ): void;
  <R, E, A, B, C, T, L extends TC.LS = 3>(
    M: TC.Contravariant<T, L>,
    values: {
      tc: $<T, [R, E, C]>;
      fab: (a: A) => B;
      fbc: (b: B) => C;
    },
  ): void;
  <S, R, E, A, B, C, T, L extends TC.LS = 4>(
    M: TC.Contravariant<T, L>,
    values: {
      tc: $<T, [S, R, E, C]>;
      fab: (a: A) => B;
      fbc: (b: B) => C;
    },
  ): void;
};

export const assertContravariant: AssertContravariant = <T, A, B, C>(
  C: TC.Contravariant<T>,
  { tc, fab, fbc }: {
    tc: $<T, [C]>;
    fab: (a: A) => B;
    fbc: (b: B) => C;
  },
): void => {
  // Identity: F.contramap(x => x, a) ≡ a
  assertEquals(
    C.contramap((x) => x)(tc),
    tc,
  );

  // Composition: F.contramap(x => f(g(x)), a) ≡ F.contramap(g, F.contramap(f, a))
  assertEquals(
    pipe(tc, C.contramap((a: A) => fbc(fab(a)))),
    pipe(tc, C.contramap(fbc), C.contramap(fab)),
  );
};

/***************************************************************************************************
 * @section Assert: Profunctor
 **************************************************************************************************/

type AssertProfunctor = {
  <A, B, C, X, Y, Z, T, L extends TC.LS = 1>(
    M: TC.Profunctor<T, L>,
    values: {
      tcx: $<T, [C, X]>;
      fab: (a: A) => B;
      fbc: (b: B) => C;
      fxy: (x: X) => Y;
      fyz: (y: Y) => Z;
    },
  ): void;
  <A, B, C, X, Y, Z, T, L extends TC.LS = 2>(
    M: TC.Profunctor<T, L>,
    values: {
      tcx: $<T, [C, X]>;
      fab: (a: A) => B;
      fbc: (b: B) => C;
      fxy: (x: X) => Y;
      fyz: (y: Y) => Z;
    },
  ): void;
  <R, A, B, C, X, Y, Z, T, L extends TC.LS = 3>(
    M: TC.Profunctor<T, L>,
    values: {
      tcx: $<T, [R, C, X]>;
      fab: (a: A) => B;
      fbc: (b: B) => C;
      fxy: (x: X) => Y;
      fyz: (y: Y) => Z;
    },
  ): void;
  <S, R, A, B, C, X, Y, Z, T, L extends TC.LS = 4>(
    M: TC.Profunctor<T, L>,
    values: {
      tcx: $<T, [S, R, C, X]>;
      fab: (a: A) => B;
      fbc: (b: B) => C;
      fxy: (x: X) => Y;
      fyz: (y: Y) => Z;
    },
  ): void;
};

export const assertProfunctor: AssertProfunctor = <T, A, B, C, X, Y, Z>(
  P: TC.Profunctor<T>,
  { tcx, fab, fbc, fxy, fyz }: {
    tcx: $<T, [C, X]>;
    fab: (a: A) => B;
    fbc: (b: B) => C;
    fxy: (x: X) => Y;
    fyz: (y: Y) => Z;
  },
): void => {
  // Identity: P.promap(x => x, x => x, a) ≡ a
  assertEquals(
    pipe(tcx, P.promap((x) => x, (x) => x)),
    tcx,
  );

  // Composition: P.promap(x => f(g(x)), x => h(i(x)), a) ≡ P.promap(g, h, P.promap(f, i, a))
  assertEquals(
    pipe(
      tcx,
      P.promap(
        (a: A) => fbc(fab(a)),
        (x) => fyz(fxy(x)),
      ),
    ),
    pipe(tcx, P.promap(fbc, fxy), P.promap(fab, fyz)),
  );
};

/***************************************************************************************************
 * @section Assert: Apply
 **************************************************************************************************/

type AssertApply = {
  <A, B, C, T, L extends TC.LS = 1>(
    M: TC.Apply<T, L>,
    values: {
      ta: $<T, [A]>;
      fab: (a: A) => B;
      fbc: (b: B) => C;
      tfab: $<T, [(a: A) => B]>;
      tfbc: $<T, [(b: B) => C]>;
    },
  ): void;
  <E, A, B, C, T, L extends TC.LS = 2>(
    M: TC.Apply<T, L>,
    values: {
      ta: $<T, [E, A]>;
      fab: (a: A) => B;
      fbc: (b: B) => C;
      tfab: $<T, [E, (a: A) => B]>;
      tfbc: $<T, [E, (b: B) => C]>;
    },
  ): void;
  <R, E, A, B, C, T, L extends TC.LS = 3>(
    M: TC.Apply<T, L>,
    values: {
      ta: $<T, [R, E, A]>;
      fab: (a: A) => B;
      fbc: (b: B) => C;
      tfab: $<T, [R, E, (a: A) => B]>;
      tfbc: $<T, [R, E, (b: B) => C]>;
    },
  ): void;
  <S, R, E, A, B, C, T, L extends TC.LS = 4>(
    M: TC.Apply<T, L>,
    values: {
      ta: $<T, [S, R, E, A]>;
      fab: (a: A) => B;
      fbc: (b: B) => C;
      tfab: $<T, [S, R, E, (a: A) => B]>;
      tfbc: $<T, [S, R, E, (b: B) => C]>;
    },
  ): void;
};

export const assertApply: AssertApply = <T, A, B, C>(
  A: TC.Apply<T>,
  { ta, fab, fbc, tfab, tfbc }: {
    ta: $<T, [A]>;
    fab: (a: A) => B;
    fbc: (b: B) => C;
    tfab: $<T, [(a: A) => B]>;
    tfbc: $<T, [(b: B) => C]>;
  },
): void => {
  // Composition: A.ap(A.ap(A.map(f => g => x => f(g(x)), a), u), v) ≡ A.ap(a, A.ap(u, v))
  assertEquals(
    pipe(
      ta,
      A.ap(
        pipe(
          tfab,
          A.ap(
            pipe(
              tfbc,
              A.map((f: (b: B) => C) => (g: (a: A) => B) => (x: A) => f(g(x))),
            ),
          ),
        ),
      ),
    ),
    pipe(ta, A.ap(tfab), A.ap(tfbc)),
  );

  // Assert Functor
  assertFunctor(A, { ta, fab, fbc });
};

/***************************************************************************************************
 * @section Assert: Applicative
 **************************************************************************************************/

type AssertApplicative = {
  <A, B, C, T, L extends TC.LS = 1>(
    A: TC.Applicative<T, L>,
    values: {
      a: A;
      ta: $<T, [A]>;
      fab: (a: A) => B;
      fbc: (b: B) => C;
      tfab: $<T, [(a: A) => B]>;
      tfbc: $<T, [(b: B) => C]>;
    },
  ): void;
  <E, A, B, C, T, L extends TC.LS = 2>(
    A: TC.Applicative<T, L>,
    values: {
      a: A;
      ta: $<T, [E, A]>;
      fab: (a: A) => B;
      fbc: (b: B) => C;
      tfab: $<T, [E, (a: A) => B]>;
      tfbc: $<T, [E, (b: B) => C]>;
    },
  ): void;
  <R, E, A, B, C, T, L extends TC.LS = 3>(
    A: TC.Applicative<T, L>,
    values: {
      a: A;
      ta: $<T, [R, E, A]>;
      fab: (a: A) => B;
      fbc: (b: B) => C;
      tfab: $<T, [R, E, (a: A) => B]>;
      tfbc: $<T, [R, E, (b: B) => C]>;
    },
  ): void;
  <S, R, E, A, B, C, T, L extends TC.LS = 4>(
    A: TC.Applicative<T, L>,
    values: {
      a: A;
      ta: $<T, [S, R, E, A]>;
      fab: (a: A) => B;
      fbc: (b: B) => C;
      tfab: $<T, [S, R, E, (a: A) => B]>;
      tfbc: $<T, [S, R, E, (b: B) => C]>;
    },
  ): void;
};

export const assertApplicative: AssertApplicative = <T, A, B, C>(
  A: TC.Applicative<T>,
  { a, ta, fab, fbc, tfab, tfbc }: {
    a: A;
    ta: $<T, [A]>;
    fab: (a: A) => B;
    fbc: (b: B) => C;
    tfab: $<T, [(a: A) => B]>;
    tfbc: $<T, [(b: B) => C]>;
  },
): void => {
  // Identity: A.ap(A.of(x => x), v) ≡ v
  assertEquals(
    pipe(ta, A.ap(A.of((x) => x))),
    ta,
  );

  // Homomorphism: A.ap(A.of(f), A.of(x)) ≡ A.of(f(x))
  assertEquals(
    pipe(A.of(a), A.ap(A.of(fab))),
    A.of(fab(a)),
  );

  // Interchange: A.ap(u, A.of(y)) ≡ A.ap(A.of(f => f(y)), u)
  assertEquals(
    pipe(A.of(a), A.ap(tfab)),
    pipe(tfab, A.ap(A.of((f) => f(a)))),
  );

  // Assert Apply
  assertApply(A, { ta, fab, fbc, tfab, tfbc });
};

/***************************************************************************************************
 * @section Assert: Alt
 **************************************************************************************************/

type AssertAlt = {
  <A, B, C, T, L extends TC.LS = 1>(
    A: TC.Alt<T, L>,
    values: {
      ta: $<T, [A]>;
      tb: $<T, [A]>;
      tc: $<T, [A]>;
      fab: (a: A) => B;
      fbc: (b: B) => C;
    },
  ): void;
  <E, A, B, C, T, L extends TC.LS = 2>(
    A: TC.Alt<T, L>,
    values: {
      ta: $<T, [E, A]>;
      tb: $<T, [E, A]>;
      tc: $<T, [E, A]>;
      fab: (a: A) => B;
      fbc: (b: B) => C;
    },
  ): void;
  <R, E, A, B, C, T, L extends TC.LS = 3>(
    A: TC.Alt<T, L>,
    values: {
      ta: $<T, [R, E, A]>;
      tb: $<T, [R, E, A]>;
      tc: $<T, [R, E, A]>;
      fab: (a: A) => B;
      fbc: (b: B) => C;
    },
  ): void;
  <S, R, E, A, B, C, T, L extends TC.LS = 4>(
    A: TC.Alt<T, L>,
    values: {
      ta: $<T, [S, R, E, A]>;
      tb: $<T, [S, R, E, A]>;
      tc: $<T, [S, R, E, A]>;
      fab: (a: A) => B;
      fbc: (b: B) => C;
    },
  ): void;
};

export const assertAlt: AssertAlt = <T, A, B, C>(
  A: TC.Alt<T>,
  { ta, tb, tc, fab, fbc }: {
    ta: $<T, [A]>;
    tb: $<T, [A]>;
    tc: $<T, [A]>;
    fab: (a: A) => B;
    fbc: (b: B) => C;
  },
): void => {
  // Associativity: A.alt(A.alt(a, b), c) ≡ A.alt(a, A.alt(b, c))
  assertEquals(
    A.alt(A.alt(tc)(tb))(ta),
    pipe(ta, A.alt(tb), A.alt(tc)),
  );

  // Distributivity: A.map(f, A.alt(a, b)) ≡ A.alt(A.map(f, a), A.map(f, b))
  assertEquals(
    pipe(ta, A.alt(tb), A.map(fab)),
    pipe(ta, A.map(fab), A.alt(pipe(tb, A.map(fab)))),
  );

  // Assert Functor
  assertFunctor(A, { ta, fab, fbc });
};

/***************************************************************************************************
 * @section Assert: Plus
 **************************************************************************************************/

type AssertPlus = {
  <A, B, C, T, L extends TC.LS = 1>(
    A: TC.Plus<T, L>,
    values: {
      ta: $<T, [A]>;
      tb: $<T, [A]>;
      tc: $<T, [A]>;
      fab: (a: A) => B;
      fbc: (b: B) => C;
    },
  ): void;
  <E, A, B, C, T, L extends TC.LS = 2>(
    A: TC.Plus<T, L>,
    values: {
      ta: $<T, [E, A]>;
      tb: $<T, [E, A]>;
      tc: $<T, [E, A]>;
      fab: (a: A) => B;
      fbc: (b: B) => C;
    },
  ): void;
  <R, E, A, B, C, T, L extends TC.LS = 3>(
    A: TC.Plus<T, L>,
    values: {
      ta: $<T, [R, E, A]>;
      tb: $<T, [R, E, A]>;
      tc: $<T, [R, E, A]>;
      fab: (a: A) => B;
      fbc: (b: B) => C;
    },
  ): void;
  <S, R, E, A, B, C, T, L extends TC.LS = 4>(
    A: TC.Plus<T, L>,
    values: {
      ta: $<T, [S, R, E, A]>;
      tb: $<T, [S, R, E, A]>;
      tc: $<T, [S, R, E, A]>;
      fab: (a: A) => B;
      fbc: (b: B) => C;
    },
  ): void;
};

export const assertPlus: AssertPlus = <T, A, B, C>(
  P: TC.Plus<T>,
  { ta, tb, tc, fab, fbc }: {
    ta: $<T, [A]>;
    tb: $<T, [A]>;
    tc: $<T, [A]>;
    fab: (a: A) => B;
    fbc: (b: B) => C;
  },
): void => {
  const zero = P.zero<A>();

  // Right identity: P.alt(a, P.zero()) ≡ a
  assertEquals(
    pipe(ta, P.alt(zero)),
    ta,
  );

  // Left identity: P.alt(zero, a) ≡ a
  assertEquals(
    pipe(zero, P.alt(ta)),
    ta,
  );

  // Annihilation: P.map(f, zero) ≡ zero
  assertEquals(
    pipe(zero, P.map(fab)),
    zero,
  );

  // Assert Alt
  assertAlt(P, { ta, tb, tc, fab, fbc });
};

/***************************************************************************************************
 * @section Assert: Alternative
 **************************************************************************************************/

type AssertAlternative = {
  <A, B, C, T, L extends TC.LS = 1>(
    A: TC.Alternative<T, L>,
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
  ): void;
  <E, A, B, C, T, L extends TC.LS = 2>(
    A: TC.Alternative<T, L>,
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
  ): void;
  <R, E, A, B, C, T, L extends TC.LS = 3>(
    A: TC.Alternative<T, L>,
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
  ): void;
  <S, R, E, A, B, C, T, L extends TC.LS = 4>(
    A: TC.Alternative<T, L>,
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
  ): void;
};

export const assertAlternative: AssertAlternative = <T, A, B, C>(
  A: TC.Alternative<T>,
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
): void => {
  // Distributivity: A.ap(A.alt(a, b), c) ≡ A.alt(A.ap(a, c), A.ap(b, c))
  assertEquals(
    pipe(ta, A.ap(pipe(tfab, A.alt(A.of(fab))))),
    pipe(ta, A.ap(tfab), A.alt(pipe(ta, A.ap(A.of(fab))))),
  );

  // Annihilation: A.ap(A.zero(), a) ≡ A.zero()
  assertEquals(
    pipe(ta, A.ap(A.zero<(a: A) => B>())),
    A.zero(),
  );

  // Assert Applicative
  assertApplicative(A, { a, ta, fab, fbc, tfab, tfbc });

  // Assert Plus
  assertPlus(A, { ta, tb, tc, fab, fbc });
};

/***************************************************************************************************
 * @section Assert: Chain
 **************************************************************************************************/

type AssertChain = {
  <A, B, C, T, L extends TC.LS = 1>(
    A: TC.Chain<T, L>,
    values: {
      ta: $<T, [A]>;
      fab: (a: A) => B;
      fbc: (b: B) => C;
      tfab: $<T, [(a: A) => B]>;
      tfbc: $<T, [(a: B) => C]>;
      fatb: (a: A) => $<T, [B]>;
      fbtc: (a: B) => $<T, [C]>;
    },
  ): void;
  <E, A, B, C, T, L extends TC.LS = 2>(
    A: TC.Chain<T, L>,
    values: {
      ta: $<T, [E, A]>;
      fab: (a: A) => B;
      fbc: (b: B) => C;
      tfab: $<T, [E, (a: A) => B]>;
      tfbc: $<T, [E, (a: B) => C]>;
      fatb: (a: A) => $<T, [E, B]>;
      fbtc: (a: B) => $<T, [E, C]>;
    },
  ): void;
  <R, E, A, B, C, T, L extends TC.LS = 3>(
    A: TC.Chain<T, L>,
    values: {
      ta: $<T, [R, E, A]>;
      fab: (a: A) => B;
      fbc: (b: B) => C;
      tfab: $<T, [R, E, (a: A) => B]>;
      tfbc: $<T, [R, E, (a: B) => C]>;
      fatb: (a: A) => $<T, [R, E, B]>;
      fbtc: (a: B) => $<T, [R, E, C]>;
    },
  ): void;
  <S, R, E, A, B, C, T, L extends TC.LS = 4>(
    A: TC.Chain<T, L>,
    values: {
      ta: $<T, [S, R, E, A]>;
      fab: (a: A) => B;
      fbc: (b: B) => C;
      tfab: $<T, [S, R, E, (a: A) => B]>;
      tfbc: $<T, [S, R, E, (a: B) => C]>;
      fatb: (a: A) => $<T, [S, R, E, B]>;
      fbtc: (a: B) => $<T, [S, R, E, C]>;
    },
  ): void;
};

export const assertChain: AssertChain = <T, A, B, C>(
  C: TC.Chain<T>,
  { ta, fab, fbc, tfab, tfbc, fatb, fbtc }: {
    ta: $<T, [A]>;
    fab: (a: A) => B;
    fbc: (b: B) => C;
    tfab: $<T, [(a: A) => B]>;
    tfbc: $<T, [(a: B) => C]>;
    fatb: (a: A) => $<T, [B]>;
    fbtc: (a: B) => $<T, [C]>;
  },
): void => {
  // Associativity: M.chain(g, M.chain(f, u)) === M.chain(x => M.chain(g, f(x)), u)
  assertEquals(
    pipe(ta, C.chain(fatb), C.chain(fbtc)),
    pipe(ta, C.chain(flow(fatb, C.chain(fbtc)))),
  );

  // Assert Apply
  assertApply(C, { ta, fab, fbc, tfab, tfbc });
};

/***************************************************************************************************
 * @section Assert: ChainRec
 * @todo Implement?
 **************************************************************************************************/

/***************************************************************************************************
 * @section Assert: Monad
 **************************************************************************************************/

type AssertMonad = {
  <A, B, C, T, L extends TC.LS = 1>(
    A: TC.Monad<T, L>,
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
  ): void;
  <E, A, B, C, T, L extends TC.LS = 2>(
    A: TC.Monad<T, L>,
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
  ): void;
  <R, E, A, B, C, T, L extends TC.LS = 3>(
    A: TC.Monad<T, L>,
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
  ): void;
  <S, R, E, A, B, C, T, L extends TC.LS = 4>(
    A: TC.Monad<T, L>,
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
  ): void;
};

export const assertMonad: AssertMonad = <A, B, C, T>(
  M: TC.Monad<T>,
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
): void => {
  // Left identity: M.chain(f, M.of(a)) ≡ f(a)
  assertEquals(
    pipe(M.of(a), M.chain(fatb)),
    fatb(a),
  );

  // Right identity: M.chain(M.of, u) ≡ u
  assertEquals(
    pipe(ta, M.chain(M.of)),
    ta,
  );

  // Assert Applicative
  assertApplicative(M, { a, ta, fab, fbc, tfab, tfbc });

  // Assert Chain
  assertChain(M, { ta, fab, fbc, fatb, fbtc, tfab, tfbc });
};

/***************************************************************************************************
 * @section Assert: Foldable
 **************************************************************************************************/

type AssertFoldable = {
  <A, B, T, L extends TC.LS = 1>(
    A: TC.Foldable<T, L>,
    values: {
      a: A;
      tb: $<T, [B]>;
      faba: (a: A, b: B) => A;
    },
  ): void;
  <E, A, B, T, L extends TC.LS = 2>(
    A: TC.Foldable<T, L>,
    values: {
      a: A;
      tb: $<T, [E, B]>;
      faba: (a: A, b: B) => A;
    },
  ): void;
  <R, E, A, B, T, L extends TC.LS = 3>(
    A: TC.Foldable<T, L>,
    values: {
      a: A;
      tb: $<T, [R, E, B]>;
      faba: (a: A, b: B) => A;
    },
  ): void;
  <S, R, E, A, B, T, L extends TC.LS = 4>(
    A: TC.Foldable<T, L>,
    values: {
      a: A;
      tb: $<T, [S, R, E, B]>;
      faba: (a: A, b: B) => A;
    },
  ): void;
};

export const assertFoldable: AssertFoldable = <T, A, B>(
  F: TC.Foldable<T>,
  { a, tb, faba }: {
    a: A;
    tb: $<T, [B]>;
    faba: (a: A, b: B) => A;
  },
): void => {
  // F.reduce ≡ (f, x, u) => F.reduce((acc, y) => acc.concat([y]), [], u).reduce(f, x)
  assertEquals(
    F.reduce((acc: B[], y: B) => acc.concat([y]), [])(tb).reduce(faba, a),
    pipe(tb, F.reduce(faba, a)),
  );
};

/***************************************************************************************************
 * @section Assert: Extend
 **************************************************************************************************/

type AssertExtend = {
  <A, B, C, T, L extends TC.LS = 1>(
    A: TC.Extend<T, L>,
    values: {
      ta: $<T, [A]>;
      fab: (a: A) => B;
      fbc: (b: B) => C;
      ftab: (ta: $<T, [A]>) => B;
      ftbc: (tb: $<T, [B]>) => C;
    },
  ): void;
  <E, A, B, C, T, L extends TC.LS = 2>(
    A: TC.Extend<T, L>,
    values: {
      ta: $<T, [E, A]>;
      fab: (a: A) => B;
      fbc: (b: B) => C;
      ftab: (ta: $<T, [E, A]>) => B;
      ftbc: (tb: $<T, [E, B]>) => C;
    },
  ): void;
  <R, E, A, B, C, T, L extends TC.LS = 3>(
    A: TC.Extend<T, L>,
    values: {
      ta: $<T, [R, E, A]>;
      fab: (a: A) => B;
      fbc: (b: B) => C;
      ftab: (ta: $<T, [R, E, A]>) => B;
      ftbc: (tb: $<T, [R, E, B]>) => C;
    },
  ): void;
  <S, R, E, A, B, C, T, L extends TC.LS = 4>(
    A: TC.Extend<T, L>,
    values: {
      ta: $<T, [S, R, E, A]>;
      fab: (a: A) => B;
      fbc: (b: B) => C;
      ftab: (ta: $<T, [S, R, E, A]>) => B;
      ftbc: (tb: $<T, [S, R, E, B]>) => C;
    },
  ): void;
};

export const assertExtend: AssertExtend = <T, A, B, C>(
  E: TC.Extend<T>,
  { ta, fab, fbc, ftab, ftbc }: {
    ta: $<T, [A]>;
    fab: (a: A) => B;
    fbc: (b: B) => C;
    ftab: (ta: $<T, [A]>) => B;
    ftbc: (tb: $<T, [B]>) => C;
  },
): void => {
  // Associativity: E.extend(f, E.extend(g, w)) ≡ E.extend(_w => f(E.extend(g, _w)), w)
  assertEquals(
    pipe(ta, E.extend(ftab), E.extend(ftbc)),
    pipe(ta, E.extend((a) => ftbc(pipe(a, E.extend(ftab))))),
  );

  // Assert Functor
  assertFunctor(E, { ta, fab, fbc });
};

/***************************************************************************************************
 * @section Assert: Comonad
 **************************************************************************************************/

type AssertComonad = {
  <A, B, C, T, L extends TC.LS = 1>(
    A: TC.Comonad<T, L>,
    values: {
      ta: $<T, [A]>;
      fab: (a: A) => B;
      fbc: (b: B) => C;
      ftab: (ta: $<T, [A]>) => B;
      ftbc: (tb: $<T, [B]>) => C;
    },
  ): void;
  <E, A, B, C, T, L extends TC.LS = 2>(
    A: TC.Comonad<T, L>,
    values: {
      ta: $<T, [E, A]>;
      fab: (a: A) => B;
      fbc: (b: B) => C;
      ftab: (ta: $<T, [E, A]>) => B;
      ftbc: (tb: $<T, [E, B]>) => C;
    },
  ): void;
  <R, E, A, B, C, T, L extends TC.LS = 3>(
    A: TC.Comonad<T, L>,
    values: {
      ta: $<T, [R, E, A]>;
      fab: (a: A) => B;
      fbc: (b: B) => C;
      ftab: (ta: $<T, [R, E, A]>) => B;
      ftbc: (tb: $<T, [R, E, B]>) => C;
    },
  ): void;
  <S, R, E, A, B, C, T, L extends TC.LS = 4>(
    A: TC.Comonad<T, L>,
    values: {
      ta: $<T, [S, R, E, A]>;
      fab: (a: A) => B;
      fbc: (b: B) => C;
      ftab: (ta: $<T, [S, R, E, A]>) => B;
      ftbc: (tb: $<T, [S, R, E, B]>) => C;
    },
  ): void;
};

export const assertComonad: AssertComonad = <T, A, B, C>(
  C: TC.Comonad<T>,
  { ta, fab, fbc, ftab, ftbc }: {
    ta: $<T, [A]>;
    fab: (a: A) => B;
    fbc: (b: B) => C;
    ftab: (ta: $<T, [A]>) => B;
    ftbc: (tb: $<T, [B]>) => C;
  },
): void => {
  // Left identity: C.extend(C.extract, w) ≡ w
  assertEquals(
    pipe(ta, C.extend(C.extract)),
    ta,
  );

  // Right identity: C.extract(C.extend(f, w)) ≡ f(w)
  assertEquals(
    C.extract(pipe(ta, C.extend(ftab))),
    ftab(ta),
  );

  // Assert Extend
  assertExtend(C, { ta, fab, fbc, ftab, ftbc });
};

/***************************************************************************************************
 * @section Assert: Traversable
 * @todo Implement?
 **************************************************************************************************/
