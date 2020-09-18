import { assertEquals } from "https://deno.land/std/testing/asserts.ts";

import * as T from "../task.ts";

Deno.test({
  name: "Task Constructors",
  async fn(): Promise<void> {
    assertEquals(await T.of(1)(), 1);
  },
});

Deno.test({
  name: "Task Instances",
  async fn(): Promise<void> {
    // Test Laws
    const famb = (n: number) => (n < 0 ? T.Monad.of(0) : T.Monad.of(n));
    const fbmc = (n: number) => T.Monad.of(n.toString());

    // Monad Left Identity: M.chain(f, M.of(a)) ≡ f(a)
    assertEquals(
      await T.Monad.chain(famb, T.Monad.of(1))(),
      await famb(1)(),
      `Task : Monad Left Identity`,
    );

    // Monad Right Identity: M.chain(M.of, u) ≡ u
    assertEquals(
      await T.Monad.chain<number, number>(T.Monad.of, T.Monad.of(1))(),
      await T.Monad.of(1)(),
      `Task : Monad Right Identity`,
    );

    // Monad Associativity: M.chain(b => Mc, M.chain(a => Mb, Ma)) === M.chain(a => M.chain(b => Mc, (a => Mb)(a)), Ma)
    assertEquals(
      await T.Monad.chain<number, string>(
        fbmc,
        T.Monad.chain<number, number>(famb, T.Monad.of(1)),
      )(),
      await T.Monad.chain<number, string>(
        (a) => T.Monad.chain<number, string>(fbmc, famb(a)),
        T.Monad.of(1),
      )(),
      `Task : Monad Associativity 1`,
    );

    assertEquals(
      T.Monad.chain(
        fbmc,
        T.Monad.chain<number, number>(famb, T.Monad.of(-1)),
      )(),
      T.Monad.chain<number, string>(
        (a) => T.Monad.chain<number, string>(fbmc, famb(a)),
        T.Monad.of(-1),
      )(),
      `Task : Monad Associativity 2`,
    );

    const fatb = (n: number) => T.Monad.of(n + 1);
    const fbtc = (n: number) => T.Monad.of(n.toString());

    // Chain Associativity: M.chain(g, M.chain(f, u)) ≡ M.chain(x => M.chain(g, f(x)), u)
    assertEquals(
      await T.Monad.chain(
        fbtc,
        T.Monad.chain<number, number>(fatb, T.Monad.of(1)),
      )(),
      await T.Monad.chain<number, string>(
        (x) => T.Monad.chain<number, string>(fbtc, fatb(x)),
        T.Monad.of(1),
      )(),
      `Task : Chain Associativity`,
    );

    const fab = (n: number) => n + 1;
    const fbc = (n: number): string => n.toString();
    const fgab = (f: typeof fbc) => (g: typeof fab) => (n: number) => f(g(n));

    // Apply Composition: A.ap(A.ap(A.map(f => g => x => f(g(x)), a), u), v) ≡ A.ap(a, A.ap(u, v))
    assertEquals(
      await T.Apply.ap(
        T.Monad.ap<any, any>(
          T.Monad.map(fgab, T.Monad.of(fbc)),
          T.Monad.of(fab),
        ),
        T.Monad.of(1),
      )(),
      await T.Monad.ap<any, any>(
        T.Monad.of(fbc),
        T.Monad.ap(T.Monad.of<any>(fab), T.Monad.of(1)),
      )(),
      `Task : Apply Composition`,
    );

    // Functor Identity: F.map(x => x, a) ≡ a
    assertEquals(
      await T.Applicative.map((n: number) => n, T.Applicative.of(1))(),
      await T.Applicative.of(1)(),
      `Task : Functor Identity`,
    );

    // Functor Composition: F.map(x => f(g(x)), a) ≡ F.map(f, F.map(g, a))
    assertEquals(
      await T.Applicative.map(
        (x: number) => fbc(fab(x)),
        T.Applicative.of(1),
      )(),
      await T.Applicative.map(
        fbc,
        T.Applicative.map(fab, T.Applicative.of(1)),
      )(),
      `Task : Functor Composition`,
    );

    // Applicative Identity: A.ap(A.of(x => x), v) ≡ v
    assertEquals(
      await T.Applicative.ap<number, number>(
        T.Applicative.of((n: number): number => n),
        T.Applicative.of(1),
      )(),
      await T.Applicative.of(1)(),
      `Task : Applicative Identity`,
    );

    // Applicative Homomorphism: M.ap(A.of(f), A.of(x)) ≡ A.of(f(x))
    assertEquals(
      await T.Applicative.ap<number, number>(
        T.Applicative.of(fab),
        T.Applicative.of(1),
      )(),
      await T.Applicative.of(fab(1))(),
      `Task : Applicative Homomorphism`,
    );

    // Applicative Interchange: A.ap(u, A.of(y)) ≡ A.ap(A.of(f => f(y)), u)
    assertEquals(
      await T.Applicative.ap<number, number>(
        T.Applicative.of(fab),
        T.Applicative.of(2),
      )(),
      await T.Applicative.ap<number, number>(
        T.Applicative.of<any>((f: typeof fab) => f(2)),
        T.Applicative.of<any>(fab),
      )(),
      `Task : Applicative Interchange`,
    );
  },
});
