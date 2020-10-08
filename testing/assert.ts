import { assertEquals } from "https://deno.land/std/testing/asserts.ts";

import type * as TC from "../type_classes.ts";
import type { $ } from "../types.ts";

type Return<T> = T extends (...as: any[]) => infer R ? R : never;

/***************************************************************************************************
 * @section Assert: Applicative, Apply, Functor
 **************************************************************************************************/

type AssertApplicative = {
  <T, L extends 1>(
    M: TC.Applicative<T, L>,
    name: string,
    run?: (ta: Return<TC.ApplicativeFn<T, L>>) => Promise<any>,
  ): Promise<void>;
  <T, L extends 2>(
    M: TC.Applicative<T, L>,
    name: string,
    run?: (ta: Return<TC.ApplicativeFn<T, L>>) => Promise<any>,
  ): Promise<void>;
  <T, L extends 3>(
    M: TC.Applicative<T, L>,
    name: string,
    run?: (ta: Return<TC.ApplicativeFn<T, L>>) => Promise<any>,
  ): Promise<void>;
  <T, L extends 4>(
    M: TC.Applicative<T, L>,
    name: string,
    run?: (ta: Return<TC.ApplicativeFn<T, L>>) => Promise<any>,
  ): Promise<void>;
};

export const assertApplicative: AssertApplicative = async <T>(
  M: TC.Applicative<T>,
  name: string,
  run: (ta: Return<TC.ApplicativeFn<T, 1>>) => Promise<any> = (ta) =>
    Promise.resolve(ta),
): Promise<void> => {
  const fab = (n: number) => n + 1;
  const fbc = (n: number): string => n.toString();
  const fgab = (f: typeof fbc) => (g: typeof fab) => (n: number) => f(g(n));

  // Apply Composition: A.ap(A.ap(A.map(f => g => x => f(g(x)), a), u), v) ≡ A.ap(a, A.ap(u, v))
  assertEquals(
    await run(M.ap(M.ap(M.map(fgab, M.of(fbc)), M.of(fab)), M.of(1))),
    await run(M.ap(M.of(fbc), M.ap(M.of(fab), M.of(1)))),
    `${name} : Apply Composition`,
  );

  // Functor Identity: F.map(x => x, a) ≡ a
  assertEquals(
    await run(M.map((n: number) => n, M.of(1))),
    await run(M.of(1)),
    `${name} : Functor Identity`,
  );

  // Functor Composition: F.map(x => f(g(x)), a) ≡ F.map(f, F.map(g, a))
  assertEquals(
    await run(M.map((x: number) => fbc(fab(x)), M.of(1))),
    await run(M.map(fbc, M.map(fab, M.of(1)))),
    `${name} : Functor Composition`,
  );

  // Applicative Identity: A.ap(A.of(x => x), v) ≡ v
  assertEquals(
    await run(M.ap(
      M.of((n: number) => n),
      M.of(1),
    )),
    await run(M.of(1)),
    `${name} : Applicative Identity`,
  );

  // Applicative Homomorphism: M.ap(A.of(f), A.of(x)) ≡ A.of(f(x))
  assertEquals(
    await run(M.ap(M.of(fab), M.of(1))),
    await run(M.of(fab(1))),
    `${name} : Applicative Homomorphism`,
  );

  // Applicative Interchange: A.ap(u, A.of(y)) ≡ A.ap(A.of(f => f(y)), u)
  assertEquals(
    await run(M.ap(M.of(fab), M.of(2))),
    await run(M.ap(
      M.of((f: typeof fab) => f(2)),
      M.of(fab),
    )),
    `${name} : Applicative Interchange`,
  );
};

/***************************************************************************************************
 * @section Assert: Chain
 **************************************************************************************************/

type AssertChain = {
  <T, L extends 1>(
    M: TC.Applicative<T, L> & TC.Chain<T, L>,
    name: string,
    run?: (ta: Return<TC.ApplicativeFn<T, L>>) => Promise<any>,
  ): Promise<void>;
  <T, L extends 2>(
    M: TC.Applicative<T, L> & TC.Chain<T, L>,
    name: string,
    run?: (ta: Return<TC.ApplicativeFn<T, L>>) => Promise<any>,
  ): Promise<void>;
  <T, L extends 3>(
    M: TC.Applicative<T, L> & TC.Chain<T, L>,
    name: string,
    run?: (ta: Return<TC.ApplicativeFn<T, L>>) => Promise<any>,
  ): Promise<void>;
  <T, L extends 4>(
    M: TC.Applicative<T, L> & TC.Chain<T, L>,
    name: string,
    run?: (ta: Return<TC.ApplicativeFn<T, L>>) => Promise<any>,
  ): Promise<void>;
};

export const assertChain: AssertChain = async <T>(
  M: TC.Applicative<T> & TC.Chain<T>,
  name: string,
  run: (ta: Return<TC.ApplicativeFn<T, 1>>) => Promise<any> = (ta) =>
    Promise.resolve(ta),
): Promise<void> => {
  const fatb = (n: number) => M.of(n + 1);
  const fbtc = (n: number) => M.of(n.toString());

  // Chain Associativity: M.chain(g, M.chain(f, u)) ≡ M.chain(x => M.chain(g, f(x)), u)
  assertEquals(
    await run(M.chain(fbtc, M.chain(fatb, M.of(1)))),
    await run(M.chain((x) => M.chain(fbtc, fatb(x)), M.of(1))),
    `${name} : Chain Associativity`,
  );
};

/***************************************************************************************************
 * @section Assert: Monad
 **************************************************************************************************/

type AssertMonad = {
  <T, L extends 1>(
    M: TC.Monad<T, L>,
    name: string,
    run?: (ta: Return<TC.ApplicativeFn<T, L>>) => Promise<any>,
  ): Promise<void>;
  <T, L extends 2>(
    M: TC.Monad<T, L>,
    name: string,
    run?: (ta: Return<TC.ApplicativeFn<T, L>>) => Promise<any>,
  ): Promise<void>;
  <T, L extends 3>(
    M: TC.Monad<T, L>,
    name: string,
    run?: (ta: Return<TC.ApplicativeFn<T, L>>) => Promise<any>,
  ): Promise<void>;
  <T, L extends 4>(
    M: TC.Monad<T, L>,
    name: string,
    run?: (ta: Return<TC.ApplicativeFn<T, L>>) => Promise<any>,
  ): Promise<void>;
};

export const assertMonad: AssertMonad = async <T>(
  M: TC.Monad<T>,
  name: string,
  run: (ta: Return<TC.ApplicativeFn<T, 1>>) => Promise<any> = (ta) =>
    Promise.resolve(ta),
): Promise<void> => {
  const famb = (n: number) => (n < 0 ? M.of(0) : M.of(n));
  const fbmc = (n: number) => M.of(n.toString());

  // Monad Left Identity: M.chain(f, M.of(a)) ≡ f(a)
  assertEquals(
    await run(M.chain(famb, M.of(1))),
    await run(famb(1)),
    `${name} : Monad Left Identity`,
  );

  // Monad Right Identity: M.chain(M.of, u) ≡ u
  assertEquals(
    await run(M.chain(M.of, M.of(1))),
    await run(M.of(1)),
    `${name} : Monad Right Identity`,
  );

  // Monad Associativity: M.chain(b => Mc, M.chain(a => Mb, Ma)) === M.chain(a => M.chain(b => Mc, (a => Mb)(a)), Ma)
  assertEquals(
    await run(M.chain(fbmc, M.chain(famb, M.of(1)))),
    await run(M.chain((a) => M.chain(fbmc, famb(a)), M.of(1))),
    `${name} : Monad Associativity 1`,
  );

  assertEquals(
    await run(M.chain(fbmc, M.chain(famb, M.of(-1)))),
    await run(M.chain((a) => M.chain(fbmc, famb(a)), M.of(-1))),
    `${name} : Monad Associativity 2`,
  );

  // Monads must support Applicative, Apply, and Functor
  await assertApplicative(M as TC.Applicative<T>, name, run as any);

  // Monads must support Chain
  await assertChain(M as TC.Applicative<T> & TC.Chain<T>, name, run as any);
};

/***************************************************************************************************
 * @section Assert: Setoid
 **************************************************************************************************/

export const assertSetoid = <T>(
  S: TC.Setoid<T>,
  { a, b, c, z }: Record<"a" | "b" | "c" | "z", T>,
  name: string,
): void => {
  // DNE
  assertEquals(
    S.equals(a, z),
    true,
    `${name} : Setoid Unequaal`,
  );

  // Reflexivity: S.equals(a, a) === true
  assertEquals(
    S.equals(a, a),
    true,
    `${name} : Setoid Reflexivity`,
  );

  // Symmetry: S.equals(a, b) === S.equals(b, a)
  assertEquals(
    S.equals(a, b),
    S.equals(b, a),
    `${name} : Setoid Symmetry`,
  );

  // Transitivity: if S.equals(a, b) and S.equals(b, c), then S.equals(a, c)
  assertEquals(
    S.equals(a, b) &&
      S.equals(b, c),
    S.equals(a, c),
    `${name} : Setoid Transitivity`,
  );
};

/***************************************************************************************************
 * @section Assert: Ord
 **************************************************************************************************/

export const assertOrd = <T>(
  S: TC.Ord<T>,
  { a, b, c, z }: Record<"a" | "b" | "c" | "z", T>,
  name: string,
): void => {
  // Totality: S.lte(a, b) or S.lte(b, a)
  assertEquals(
    S.lte(a, b) || S.lte(b, a),
    true,
    `${name} : Ord Totality`,
  );

  // Assert Setoid
  assertSetoid(S, { a, b, c, z }, name);
};

/***************************************************************************************************
 * @section Assert: Semigroup
 **************************************************************************************************/

export const assertSemigroup = <T>(
  S: TC.Semigroup<T>,
  { a, b, c }: Record<"a" | "b" | "c", T>,
  name: string,
): void => {
  // Associativity: S.concat(S.concat(a, b), c) ≡ S.concat(a, S.concat(b, c))
  assertEquals(
    S.concat(S.concat(a, b), c),
    S.concat(a, S.concat(b, c)),
    `${name} : Semigroup Associativity`,
  );
};

/***************************************************************************************************
 * @section Assert: Monoid
 **************************************************************************************************/

export const assertMonoid = <T>(
  M: TC.Monoid<T>,
  { a, b, c }: Record<"a" | "b" | "c", T>,
  name: string,
): void => {
  // Right identity: M.concat(a, M.empty()) ≡ a
  assertEquals(
    M.concat(a, M.empty()),
    a,
    `${name} : Monoid Right Identity`,
  );

  // Left identity: M.concat(M.empty(), a) ≡ a
  assertEquals(
    M.concat(M.empty(), a),
    a,
    `${name} : Monoid Left Identity`,
  );

  // Assert Semigroup
  assertSemigroup(M, { a, b, c }, name);
};

/***************************************************************************************************
 * @section Assert: Group
 **************************************************************************************************/

export const assertGroup = <T>(
  G: TC.Group<T>,
  { a, b, c }: Record<"a" | "b" | "c", T>,
  name: string,
): void => {
  // Right inverse: G.concat(a, G.invert(a)) ≡ G.empty()
  assertEquals(
    G.concat(a, G.invert(a)),
    G.empty(),
    `${name} : Group Right Inverse`,
  );

  // Left inverse: G.concat(G.invert(a), a) ≡ G.empty()
  assertEquals(
    G.concat(G.invert(a), a),
    G.empty(),
    `${name} : Group Left Inverse`,
  );

  // Assert Monoid Laws
  assertMonoid(G, { a, b, c }, name);
};

/***************************************************************************************************
 * @section Assert: Semigroupoid
 **************************************************************************************************/

export const assertSemigroupoid = <T>(
  S: TC.Semigroupoid<T>,
  { a, b, c }: Record<"a" | "b" | "c", $<T, [any, any]>>,
  name: string,
): void => {
  // Associativity: S.compose(S.compose(a, b), c) ≡ S.compose(a, S.compose(b, c))
  assertEquals(
    S.compose(S.compose(a, b), c),
    S.compose(a, S.compose(b, c)),
    `${name} : Semigroupoid Associativity`,
  );
};

/***************************************************************************************************
 * @section Assert: Category
 **************************************************************************************************/

export const assertCategory = <T>(
  C: TC.Category<T>,
  { a, b, c }: Record<"a" | "b" | "c", $<T, [any, any]>>,
  name: string,
): void => {
  // Right identity: M.compose(a, M.id()) ≡ a
  assertEquals(
    C.compose(a, C.id()),
    a,
    `${name} : Category Right Identity`,
  );

  // Left identity: M.compose(M.id(), a) ≡ a
  assertEquals(
    C.compose(C.id(), a),
    a,
    `${name} : Category Left Identity`,
  );

  // Assert Semigroupoid
  assertSemigroupoid(C, { a, b, c }, name);
};

/***************************************************************************************************
 * @section Assert: Filterable
 **************************************************************************************************/

type AssertFilterable = {
  <T, L extends 1>(
    M: TC.Filterable<T, L>,
    of: TC.ApplicativeFn<T, L>,
    name: string,
    run?: (ta: Return<TC.ApplicativeFn<T, L>>) => Promise<any>,
  ): Promise<void>;
  <T, L extends 2>(
    M: TC.Filterable<T, L>,
    of: TC.ApplicativeFn<T, L>,
    name: string,
    run?: (ta: Return<TC.ApplicativeFn<T, L>>) => Promise<any>,
  ): Promise<void>;
  <T, L extends 3>(
    M: TC.Filterable<T, L>,
    of: TC.ApplicativeFn<T, L>,
    name: string,
    run?: (ta: Return<TC.ApplicativeFn<T, L>>) => Promise<any>,
  ): Promise<void>;
  <T, L extends 4>(
    M: TC.Filterable<T, L>,
    of: TC.ApplicativeFn<T, L>,
    name: string,
    run?: (ta: Return<TC.ApplicativeFn<T, L>>) => Promise<any>,
  ): Promise<void>;
};

export const assertFilterable: AssertFilterable = async <T>(
  F: TC.Filterable<T>,
  of: TC.ApplicativeFn<T, 1>,
  name: string,
  run: (ta: Return<TC.ApplicativeFn<T, 1>>) => Promise<any> = (ta) =>
    Promise.resolve(ta),
): Promise<void> => {
  const isNumber = (n: unknown): n is number => typeof n === "number";
  const isPositive = (n: number) => n > 0;

  // Distributivity: F.filter(x => f(x) && g(x), a) ≡ F.filter(g, F.filter(f, a))
  assertEquals(
    await run(F.filter((n) => isNumber(n) && isPositive(n), of(1))),
    await run(F.filter(isPositive, F.filter(isNumber, of(1)))),
    `${name} : Filterable Distributivity`,
  );

  // Identity: F.filter(x => true, a) ≡ a
  assertEquals(
    await run(F.filter((n) => true, of(1))),
    await run(of(1)),
    `${name} : Filterable Identity`,
  );

  // Annihilation: F.filter(x => false, a) ≡ F.filter(x => false, b)
  assertEquals(
    await run(F.filter((n) => false, of(1))),
    await run(F.filter((n) => false, of(2))),
    `${name} : Filterable Annihilation`,
  );
};

/***************************************************************************************************
 * @section Assert: Bifunctor
 **************************************************************************************************/

type AssertBifunctor = {
  <T, L extends 1>(
    M: TC.Bifunctor<T, L>,
    of: TC.ApplicativeFn<T, L>,
    name: string,
    run?: (ta: Return<TC.ApplicativeFn<T, L>>) => Promise<any>,
  ): Promise<void>;
  <T, L extends 2>(
    M: TC.Bifunctor<T, L>,
    of: TC.ApplicativeFn<T, L>,
    name: string,
    run?: (ta: Return<TC.ApplicativeFn<T, L>>) => Promise<any>,
  ): Promise<void>;
  <T, L extends 3>(
    M: TC.Bifunctor<T, L>,
    of: TC.ApplicativeFn<T, L>,
    name: string,
    run?: (ta: Return<TC.ApplicativeFn<T, L>>) => Promise<any>,
  ): Promise<void>;
  <T, L extends 4>(
    M: TC.Bifunctor<T, L>,
    of: TC.ApplicativeFn<T, L>,
    name: string,
    run?: (ta: Return<TC.ApplicativeFn<T, L>>) => Promise<any>,
  ): Promise<void>;
};

export const assertBifunctor: AssertBifunctor = async <T>(
  B: TC.Bifunctor<T>,
  of: TC.ApplicativeFn<T, 2>,
  name: string,
  run: (ta: Return<TC.ApplicativeFn<T, 2>>) => Promise<any> = (ta) =>
    Promise.resolve(ta),
): Promise<void> => {
  const plusOne = (n: number): number => n + 1;
  const toString = (n: number): string => n.toString();

  // Identity: B.bimap(x => x, x => x, a) ≡ a
  assertEquals(
    await run(B.bimap((x) => x, (x) => x, of(1))),
    await run(of(1)),
    `${name} : Bifunctor Identity`,
  );

  // Composition: B.bimap(x => f(g(x)), x => h(i(x)), a) ≡ B.bimap(f, h, B.bimap(g, i, a))
  assertEquals(
    await run(
      B.bimap(
        (x: number) => toString(plusOne(x)),
        (x: number) => toString(plusOne(x)),
        of(1),
      ),
    ),
    await run(B.bimap(toString, toString, B.bimap(plusOne, plusOne, of(1)))),
    `${name} : Bifunctor Composition`,
  );
};
