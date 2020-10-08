import { assertEquals } from "https://deno.land/std/testing/asserts.ts";

import * as T from "../these.ts";
import * as O from "../option.ts";
import { assertMonad } from "./assert.ts";

const add = (a: number, b: number) => a + b;
const addOne = (n: number): number => n + 1;
const addTwo = (n: number): number => n + 2;

Deno.test({
  name: "These Constructors",
  fn(): void {
    assertEquals(T.left(1), { tag: "Left", left: 1 });
    assertEquals(T.right(1), { tag: "Right", right: 1 });
  },
});

Deno.test({
  name: "These Destructors",
  fn(): void {
    const fold = T.fold(addOne, addTwo, add);
    assertEquals(fold(T.left(1)), 2);
    assertEquals(fold(T.right(1)), 3);
    assertEquals(fold(T.both(1, 2)), 3);
  },
});

Deno.test({
  name: "These Guards",
  fn(): void {
    assertEquals(T.isLeft(T.left(1)), true);
    assertEquals(T.isLeft(T.right(1)), false);
    assertEquals(T.isLeft(T.both(1, 2)), false);
    assertEquals(T.isRight(T.left(1)), false);
    assertEquals(T.isRight(T.right(1)), true);
    assertEquals(T.isRight(T.both(1, 2)), false);
    assertEquals(T.isBoth(T.left(1)), false);
    assertEquals(T.isBoth(T.right(1)), false);
    assertEquals(T.isBoth(T.both(1, 2)), true);
  },
});

Deno.test({
  name: "These Module",
  async fn() {
    const Monad = T.getRightMonad({ concat: add });

    // Test Laws
    await assertMonad(Monad, "These");

    // Foldable
    const { reduce } = T.Foldable;
    assertEquals(reduce(add, 0, T.right(1)), 1);
    assertEquals(reduce(add, 0, T.left(1)), 0);
    assertEquals(reduce(add, 0, T.both(1, 2)), 2);

    // Traversable
    const { traverse } = T.Traversable;
    assertEquals(
      traverse(O.Applicative, (a) => O.some(1), T.left(1)),
      O.some(T.left(1)),
    );
  },
});
