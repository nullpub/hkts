import { assertEquals } from "https://deno.land/std/testing/asserts.ts";

import * as E from "../either.ts";
import * as O from "../option.ts";
import * as TC from "../type-classes.ts";
import { assertMonad2 } from "./_asserts.ts";

const add = (a: number, b: number) => a + b;
const addOne = (n: number): number => n + 1;
const addTwo = (n: number): number => n + 2;
const chainOne = (n: number): E.Either<number, number> =>
  n !== 1 ? E.right(n) : E.left(1);

Deno.test({
  name: "Either Constructors",
  fn(): void {
    assertEquals(E.left(1), { tag: "Left", left: 1 });
    assertEquals(E.right(1), { tag: "Right", right: 1 });
  },
});

Deno.test({
  name: "Either Destructors",
  fn(): void {
    const fold = E.fold(addOne, addTwo);
    assertEquals(fold(E.left(1)), 2);
    assertEquals(fold(E.right(1)), 3);
  },
});

Deno.test({
  name: "Either Guards",
  fn(): void {
    assertEquals(E.isLeft(E.left(1)), true);
    assertEquals(E.isLeft(E.right(1)), false);
    assertEquals(E.isRight(E.left(1)), false);
    assertEquals(E.isRight(E.right(1)), true);
  },
});

Deno.test({
  name: "Either Instances",
  fn(): void {
    // Test Laws
    assertMonad2(E.Monad, "Either");

    // Monad
    const { ap, chain, map, join, of } = E.Monad;

    // Left identity: M.chain(f, M.of(a)) ≡ f(a)
    assertEquals(chain(chainOne, of(1)), chainOne(1));
    // Right identity: M.chain(M.of, u) ≡ u
    assertEquals(chain(of, of(1)), of(1));

    assertEquals(of(1), E.right(1));

    assertEquals(ap(E.right(addOne), E.right(1)), E.right(2));
    assertEquals(ap(E.right(addOne), E.left(1)), E.left(1));
    assertEquals(ap(E.left(1), E.right(1)), E.left(1));
    assertEquals(ap(E.left(1), E.left(1)), E.left(1));

    assertEquals(chain(chainOne, E.left(1)), E.left(1));
    assertEquals(chain(chainOne, E.right(1)), E.left(1));
    assertEquals(chain(chainOne, E.left(2)), E.left(2));
    assertEquals(chain(chainOne, E.right(2)), E.right(2));

    assertEquals(map(addOne, E.left(1)), E.left(1));
    assertEquals(map(addOne, E.right(1)), E.right(2));

    assertEquals(join(E.right(E.right(1))), E.right(1));
    assertEquals(join(E.right(E.left(1))), E.left(1));
    assertEquals(join(E.left(E.right(1))), E.left(E.right(1)));
    assertEquals(join(E.left(E.left(1))), E.left(E.left(1)));

    // Foldable
    const { reduce } = E.Foldable;
    assertEquals(reduce(add, 0, E.right(1)), 1);
    assertEquals(reduce(add, 0, E.left(1)), 0);

    // Traversable
    const { traverse } = E.Traversable;
    assertEquals(
      traverse(O.Applicative, (a) => O.some(1), E.left(1)),
      O.some(E.left(1))
    );
  },
});
