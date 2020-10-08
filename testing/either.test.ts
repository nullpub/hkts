import { assertEquals } from "https://deno.land/std/testing/asserts.ts";

import * as E from "../either.ts";
import * as O from "../option.ts";
import { assertMonad } from "./assert.ts";

const add = (a: number, b: number) => a + b;
const addOne = (n: number): number => n + 1;
const addTwo = (n: number): number => n + 2;

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
  name: "Either Modules",
  async fn() {
    // Test Laws
    await assertMonad(E.Monad, "Either");

    // Foldable
    const { reduce } = E.Foldable;
    assertEquals(reduce(add, 0, E.right(1)), 1);
    assertEquals(reduce(add, 0, E.left(1)), 0);

    // Traversable
    const { traverse } = E.Traversable;
    assertEquals(
      traverse(O.Applicative, (a) => O.some(1), E.left(1)),
      O.some(E.left(1)),
    );
  },
});
