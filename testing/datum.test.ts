import { assertEquals } from "https://deno.land/std/testing/asserts.ts";

import { assertMonad } from "./assert.ts";
import { constant } from "../fns.ts";
import * as D from "../datum.ts";

const add = (a: number, b: number) => a + b;
const addOne = (n: number): number => n + 1;
const one = constant(1);

Deno.test({
  name: "Datum Constructors",
  fn(): void {
    assertEquals(D.replete(1), { tag: "Replete", value: 1 });
    assertEquals(D.initial, { tag: "Initial" });
  },
});

Deno.test({
  name: "Datum Destructors",
  fn(): void {
    const fold = D.fold(one, one, addOne, addOne);

    assertEquals(fold(D.replete(1)), 2);
    assertEquals(fold(D.initial), 1);
  },
});

Deno.test({
  name: "Datum Guards",
  fn(): void {
    assertEquals(D.isSome(D.initial), false);
    assertEquals(D.isSome(D.replete(1)), true);
    assertEquals(D.isNone(D.initial), true);
    assertEquals(D.isNone(D.replete(1)), false);
  },
});

Deno.test({
  name: "Datum Instances",
  fn(): void {
    // Test Laws
    assertMonad(D.Monad, "Datum");

    // Monad Join
    const { join } = D.Monad;

    assertEquals(join(D.replete(D.replete(1))), D.replete(1));
    assertEquals(join(D.replete(D.initial)), D.initial);
    assertEquals(join(D.initial), D.initial);

    // Foldable
    const { reduce } = D.Foldable;
    assertEquals(reduce(add, 0, D.replete(1)), 1);
    assertEquals(reduce(add, 0, D.initial), 0);

    // Traversable
    const { traverse } = D.Traversable;
    assertEquals(
      traverse(D.Applicative, (_) => D.replete(1), D.initial),
      D.replete(D.initial),
    );
  },
});
