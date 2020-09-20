import { assertEquals } from "https://deno.land/std/testing/asserts.ts";

import * as T from "../task_either.ts";
import * as E from "../either.ts";

Deno.test({
  name: "TaskEither Constructors",
  async fn(): Promise<void> {
    assertEquals(await T.of(1)(), E.right(1));
  },
});

Deno.test({
  name: "TaskEither Instances",
  async fn(): Promise<void> {
    // Test Laws
    const famb = (
      n: number,
    ) => (n < 0
      ? T.Monad.of<number, number>(0)
      : T.Monad.of<number, number>(n));
    const fbmc = (n: number) => T.Monad.of<number, string>(n.toString());

    // Monad Left Identity: M.chain(f, M.of(a)) ≡ f(a)
    assertEquals(
      await T.Monad.chain(famb, T.Monad.of(1))(),
      await famb(1)(),
      `TaskEither : Monad Left Identity`,
    );

    // Monad Right Identity: M.chain(M.of, u) ≡ u
    assertEquals(
      await T.Monad.chain<number, number, number>(T.Monad.of, T.Monad.of(1))(),
      await T.Monad.of(1)(),
      `TaskEither : Monad Right Identity`,
    );

    // Monad Associativity: M.chain(b => Mc, M.chain(a => Mb, Ma)) === M.chain(a => M.chain(b => Mc, (a => Mb)(a)), Ma)
    assertEquals(
      await T.Monad.chain<number, number, string>(
        fbmc,
        T.Monad.chain<number, number, number>(famb, T.Monad.of(1)),
      )(),
      await T.Monad.chain<number, number, string>(
        (a) => T.Monad.chain<number, number, string>(fbmc, famb(a)),
        T.Monad.of(1),
      )(),
      `TaskEither : Monad Associativity 1`,
    );

    assertEquals(
      T.Monad.chain(
        fbmc,
        T.Monad.chain<number, number, number>(famb, T.Monad.of(-1)),
      )(),
      T.Monad.chain<number, number, string>(
        (a) => T.Monad.chain<number, number, string>(fbmc, famb(a)),
        T.Monad.of(-1),
      )(),
      `TaskEither : Monad Associativity 2`,
    );

    const fatb = (n: number) => T.Monad.of<number, number>(n + 1);
    const fbtc = (n: number) => T.Monad.of<number, string>(n.toString());

    // Chain Associativity: M.chain(g, M.chain(f, u)) ≡ M.chain(x => M.chain(g, f(x)), u)
    assertEquals(
      await T.Monad.chain(
        fbtc,
        T.Monad.chain<number, number, number>(fatb, T.Monad.of(1)),
      )(),
      await T.Monad.chain<number, number, string>(
        (x) => T.Monad.chain<number, number, string>(fbtc, fatb(x)),
        T.Monad.of(1),
      )(),
      `TaskEither : Chain Associativity`,
    );

    const fab = (n: number) => n + 1;
    const fbc = (n: number): string => n.toString();
    const fgab = (f: typeof fbc) => (g: typeof fab) => (n: number) => f(g(n));

    // Apply Composition: A.ap(A.ap(A.map(f => g => x => f(g(x)), a), u), v) ≡ A.ap(a, A.ap(u, v))
    assertEquals(
      await T.Apply.ap(
        T.Monad.ap<any, any, any>(
          T.Monad.map(fgab, T.Monad.of(fbc)),
          T.Monad.of(fab),
        ),
        T.Monad.of(1),
      )(),
      await T.Monad.ap<number, number, string>(
        T.Monad.of(fbc),
        T.Monad.ap(T.Monad.of<any, any>(fab), T.Monad.of(1)),
      )(),
      `TaskEither : Apply Composition`,
    );

    // Functor Identity: F.map(x => x, a) ≡ a
    assertEquals(
      await T.Applicative.map((n: number) => n, T.Applicative.of(1))(),
      await T.Applicative.of(1)(),
      `TaskEither : Functor Identity`,
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
      `TaskEither : Functor Composition`,
    );

    // Applicative Identity: A.ap(A.of(x => x), v) ≡ v
    assertEquals(
      await T.Applicative.ap<number, number, number>(
        T.Applicative.of((n: number): number => n),
        T.Applicative.of(1),
      )(),
      await T.Applicative.of(1)(),
      `TaskEither : Applicative Identity`,
    );

    // Applicative Homomorphism: M.ap(A.of(f), A.of(x)) ≡ A.of(f(x))
    assertEquals(
      await T.Applicative.ap<number, number, number>(
        T.Applicative.of(fab),
        T.Applicative.of(1),
      )(),
      await T.Applicative.of(fab(1))(),
      `TaskEither : Applicative Homomorphism`,
    );

    // Applicative Interchange: A.ap(u, A.of(y)) ≡ A.ap(A.of(f => f(y)), u)
    assertEquals(
      await T.Applicative.ap<number, number, number>(
        T.Applicative.of(fab),
        T.Applicative.of(2),
      )(),
      await T.Applicative.ap<number, number, number>(
        T.Applicative.of<any, any>((f: typeof fab) => f(2)),
        T.Applicative.of<any, any>(fab),
      )(),
      `TaskEither : Applicative Interchange`,
    );
  },
});
