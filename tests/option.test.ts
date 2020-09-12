import { assertEquals } from "https://deno.land/std/testing/asserts.ts";
import { assertMonad } from "./_asserts.ts";

import * as O from "../option.ts";

const add = (a: number, b: number) => a + b;
const addOne = (n: number): number => n + 1;
const chainOne = (n: number): O.Option<number> =>
  n !== 1 ? O.some(n) : O.none;

Deno.test({
  name: "Option Constructors",
  fn(): void {
    assertEquals(O.some(1), { tag: "Some", value: 1 });
    assertEquals(O.none, { tag: "None" });
  },
});

Deno.test({
  name: "Option Destructors",
  fn(): void {
    const fold = O.fold(addOne, () => 0);
    assertEquals(fold(O.some(1)), 2);
    assertEquals(fold(O.none), 0);
  },
});

Deno.test({
  name: "Option Guards",
  fn(): void {
    assertEquals(O.isSome(O.none), false);
    assertEquals(O.isSome(O.some(1)), true);
    assertEquals(O.isNone(O.none), true);
    assertEquals(O.isNone(O.some(1)), false);
  },
});

Deno.test({
  name: "Option Instances",
  fn(): void {
    // Test Laws
    assertMonad(O.Monad, "Option");

    // Monad
    const { ap, chain, map, join, of } = O.Monad;

    // Left identity: M.chain(f, M.of(a)) ≡ f(a)
    assertEquals(chain(chainOne, of(1)), chainOne(1));
    // Right identity: M.chain(M.of, u) ≡ u
    assertEquals(chain(of, of(1)), of(1));

    assertEquals(of(1), O.some(1));

    assertEquals(ap(O.some(addOne), O.some(1)), O.some(2));
    assertEquals(ap(O.some(addOne), O.none), O.none);
    assertEquals(ap(O.none, O.some(1)), O.none);
    assertEquals(ap(O.none, O.none), O.none);

    assertEquals(chain(chainOne, O.none), O.none);
    assertEquals(chain(chainOne, O.some(1)), O.none);
    assertEquals(chain(chainOne, O.none), O.none);
    assertEquals(chain(chainOne, O.some(2)), O.some(2));

    assertEquals(map(addOne, O.none), O.none);
    assertEquals(map(addOne, O.some(1)), O.some(2));

    assertEquals(join(O.some(O.some(1))), O.some(1));
    assertEquals(join(O.some(O.none)), O.none);
    assertEquals(join(O.none), O.none);

    // Foldable
    const { reduce } = O.Foldable;
    assertEquals(reduce(add, 0, O.some(1)), 1);
    assertEquals(reduce(add, 0, O.none), 0);

    // Traversable
    const { traverse } = O.Traversable;
    assertEquals(
      traverse(O.Applicative, (a) => O.some(1), O.none),
      O.some(O.none)
    );
  },
});
