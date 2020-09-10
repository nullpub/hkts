import { assertEquals } from "https://deno.land/std/testing/asserts.ts";

import * as E from "./either.ts";
import { identity } from "./fns.ts";
import { Fixed, _ } from "./hkts.ts";
import * as M from "./maybe.ts";
import * as S from "./type-classes.ts";

const addOne = (n: number): number => n + 1;

Deno.test("createMonad", () => {
  const { join, map } = S.createMonad<M.Maybe<_>>(M.Monad);

  assertEquals(join(M.some(M.some(1))), M.some(1));
  assertEquals(join(M.some(M.none)), M.none);
  assertEquals(join(M.none), M.none);

  assertEquals(map(addOne, M.some(1)), M.some(2));
  assertEquals(map(addOne, M.none), M.none);
});
