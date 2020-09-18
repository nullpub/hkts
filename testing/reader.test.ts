import { assertEquals } from "https://deno.land/std/testing/asserts.ts";

import * as R from "../reader.ts";

const fab = (n: number) => n + 1;
const fbc = (n: number): string => n.toString();
const fgab = (f: typeof fbc) => (g: typeof fab) => (n: number) => f(g(n));

Deno.test({
  name: "Reader Instances",
  fn(): void {
    const M = R.Monad;

    const fatb = (n: number) => M.of<number, number>(n + 1);
    const fbtc = (n: number) => M.of<number, string>(n.toString());

    const famb = (n: number) => (n < 0 ? M.of(0) : M.of<number, number>(n));
    const fbmc = (n: number) => M.of<number, string>(n.toString());

    // Test Laws
    // Apply Composition: A.ap(A.ap(A.map(f => g => x => f(g(x)), a), u), v) ≡ A.ap(a, A.ap(u, v))
    assertEquals(
      M.ap(M.ap(M.map(fgab, M.of(fbc)), M.of(fab)), M.of(1))(1),
      M.ap(M.of(fbc), M.ap(M.of(fab), M.of(1)))(1),
      `Reader : Apply Composition`,
    );

    // Functor Identity: F.map(x => x, a) ≡ a
    assertEquals(
      M.map((n: number) => n, M.of(1))(1),
      M.of(1)(1),
      `Reader : Functor Identity`,
    );

    // Functor Composition: F.map(x => f(g(x)), a) ≡ F.map(f, F.map(g, a))
    assertEquals(
      M.map((x: number) => fbc(fab(x)), M.of(1))(1),
      M.map(fbc, M.map(fab, M.of(1)))(1),
      `Reader : Functor Composition`,
    );

    // Applicative Identity: A.ap(A.of(x => x), v) ≡ v
    assertEquals(
      M.ap(
        M.of((n: number) => n),
        M.of(1),
      )(1),
      M.of(1)(1),
      `Reader : Applicative Identity`,
    );

    // Applicative Homomorphism: M.ap(A.of(f), A.of(x)) ≡ A.of(f(x))
    assertEquals(
      M.ap(M.of(fab), M.of(1))(1),
      M.of(fab(1))(1),
      `Reader : Applicative Homomorphism`,
    );

    // Applicative Interchange: A.ap(u, A.of(y)) ≡ A.ap(A.of(f => f(y)), u)
    assertEquals(
      M.ap(M.of(fab), M.of(2))(1),
      M.ap(
        M.of((f: typeof fab) => f(2)),
        M.of(fab),
      )(1),
      `Reader : Applicative Interchange`,
    );

    // Chain Associativity: M.chain(g, M.chain(f, u)) ≡ M.chain(x => M.chain(g, f(x)), u)
    assertEquals(
      M.chain(fbtc, M.chain(fatb, M.of(1)))(1),
      M.chain((x) => M.chain(fbtc, fatb(x)), M.of<number, number>(1))(1),
      `Reader : Chain Associativity`,
    );

    // Monad Left Identity: M.chain(f, M.of(a)) ≡ f(a)
    assertEquals(
      M.chain(famb, M.of(1))(1),
      famb(1)(1),
      `Reader : Monad Left Identity`,
    );

    // Monad Right Identity: M.chain(M.of, u) ≡ u
    assertEquals(
      M.chain(M.of, M.of<number, number>(1))(1),
      M.of(1)(1),
      `Reader : Monad Right Identity`,
    );

    // Monad Associativity: M.chain(b => Mc, M.chain(a => Mb, Ma)) === M.chain(a => M.chain(b => Mc, (a => Mb)(a)), Ma)
    assertEquals(
      M.chain(fbmc, M.chain(famb, M.of(1)))(1),
      M.chain((a) => M.chain(fbmc, famb(a)), M.of<number, number>(1))(1),
      `Reader : Monad Associativity 1`,
    );

    assertEquals(
      M.chain(fbmc, M.chain(famb, M.of(-1)))(1),
      M.chain((a) => M.chain(fbmc, famb(a)), M.of<number, number>(-1))(1),
      `Reader : Monad Associativity 2`,
    );
  },
});
