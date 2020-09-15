import { assertEquals } from "https://deno.land/std/testing/asserts.ts";

import type { _ } from "../hkts.ts";
import * as O from "../option.ts";
import * as S from "../type-classes.ts";

const addOne = (n: number): number => n + 1;

Deno.test("Type Classes createMonad", () => {
  const { join, map } = S.createMonad<O.Option<_>>(O.Monad);

  assertEquals(join(O.some(O.some(1))), O.some(1));
  assertEquals(join(O.some(O.none)), O.none);
  assertEquals(join(O.none), O.none);

  assertEquals(map(addOne, O.some(1)), O.some(2));
  assertEquals(map(addOne, O.none), O.none);
});
