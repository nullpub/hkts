import { assertEquals } from "https://deno.land/std/testing/asserts.ts";

import type * as TC from "../type_classes.ts";

type Return<T> = T extends (...as: any[]) => infer R ? R : never;

/**
 * Applicative Functor Laws Tests
 * * Includes Applicative Laws
 * * Includes Functor Laws
 * * Includes Apply Laws
 */
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

/**
 * Chain Laws Tests
 * * Requires Applicative instance for of
 */
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

/**
 * Monad Laws Tests
 */
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

  // Monads must support Applicative
  await assertApplicative(M as TC.Applicative<T>, name, run as any);

  // Monads must support Chain
  await assertChain(M as TC.Applicative<T> & TC.Chain<T>, name, run as any);
};
