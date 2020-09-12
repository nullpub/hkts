import { assertEquals } from "https://deno.land/std/testing/asserts.ts";

import * as TC from "../type-classes.ts";

/**
 * Applicative Functor Laws Tests
 * * Includes Applicative Laws
 * * Includes Functor Laws
 * * Includes Apply Laws
 */
export function assertApplicative<T>(M: TC.Applicative<T>, name: string): void {
  const fab = (n: number) => n + 1;
  const fbc = (n: number): string => n.toString();
  const fgab = (f: typeof fbc) => (g: typeof fab) => (n: number) => f(g(n));

  // Apply Composition: A.ap(A.ap(A.map(f => g => x => f(g(x)), a), u), v) ≡ A.ap(a, A.ap(u, v))
  assertEquals(
    M.ap(M.ap(M.map(fgab, M.of(fbc)), M.of(fab)), M.of(1)),
    M.ap(M.of(fbc), M.ap(M.of(fab), M.of(1))),
    `${name} : Apply Composition`
  );

  // Functor Identity: F.map(x => x, a) ≡ a
  assertEquals(
    M.map((n: number) => n, M.of(1)),
    M.of(1),
    `${name} : Functor Identity`
  );

  // Functor Composition: F.map(x => f(g(x)), a) ≡ F.map(f, F.map(g, a))
  assertEquals(
    M.map((x: number) => fbc(fab(x)), M.of(1)),
    M.map(fbc, M.map(fab, M.of(1))),
    `${name} : Functor Composition`
  );

  // Applicative Identity: A.ap(A.of(x => x), v) ≡ v
  assertEquals(
    M.ap(
      M.of((n: number) => n),
      M.of(1)
    ),
    M.of(1),
    `${name} : Applicative Identity`
  );

  // Applicative Homomorphism: M.ap(A.of(f), A.of(x)) ≡ A.of(f(x))
  assertEquals(
    M.ap(M.of(fab), M.of(1)),
    M.of(fab(1)),
    `${name} : Applicative Homomorphism`
  );

  // Applicative Interchange: A.ap(u, A.of(y)) ≡ A.ap(A.of(f => f(y)), u)
  assertEquals(
    M.ap(M.of(fab), M.of(2)),
    M.ap(
      M.of((f: typeof fab) => f(2)),
      M.of(fab)
    ),
    `${name} : Applicative Interchange`
  );
}

/**
 * Chain Laws Tests
 * * Requires Applicative instance for of
 */
export function assertChain<T>(
  M: TC.Applicative<T> & TC.Chain<T>,
  name: string
): void {
  const fatb = (n: number) => M.of(n + 1);
  const fbtc = (n: number) => M.of(n.toString());

  // Chain Associativity: M.chain(g, M.chain(f, u)) ≡ M.chain(x => M.chain(g, f(x)), u)
  assertEquals(
    M.chain(fbtc, M.chain(fatb, M.of(1))),
    M.chain((x) => M.chain(fbtc, fatb(x)), M.of(1)),
    `${name} : Chain Associativity`
  );
}

/**
 * Monad Laws Tests
 */
export function assertMonad<T>(M: TC.Monad<T>, name: string): void {
  const famb = (n: number) => (n < 0 ? M.of(0) : M.of(n));
  const fbmc = (n: number) => M.of(n.toString());

  // Monad Left Identity: M.chain(f, M.of(a)) ≡ f(a)
  assertEquals(
    M.chain(famb, M.of(1)),
    famb(1),
    `${name} : Monad Left Identity`
  );

  // Monad Right Identity: M.chain(M.of, u) ≡ u
  assertEquals(
    M.chain(M.of, M.of(1)),
    M.of(1),
    `${name} : Monad Right Identity`
  );

  // Monad Associativity: M.chain(b => Mc, M.chain(a => Mb, Ma)) === M.chain(a => M.chain(b => Mc, (a => Mb)(a)), Ma)
  assertEquals(
    M.chain(fbmc, M.chain(famb, M.of(1))),
    M.chain((a) => M.chain(fbmc, famb(a)), M.of(1)),
    `${name} : Monad Associativity 1`
  );

  assertEquals(
    M.chain(fbmc, M.chain(famb, M.of(-1))),
    M.chain((a) => M.chain(fbmc, famb(a)), M.of(-1)),
    `${name} : Monad Associativity 2`
  );

  // Monads must support Applicative
  assertApplicative(M as any, name);

  // Monads must support Chain
  assertChain(M as any, name);
}
export function assertMonad2<T>(M: TC.Monad2<T>, name: string): void {
  assertMonad(M as any, name);
}
