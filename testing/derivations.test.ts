import { assertEquals } from "https://deno.land/std@0.77.0/testing/asserts.ts";

import type { _ } from "../types.ts";

import * as O from "../option.ts";
import { pipe } from "../fns.ts";
import { createMonad } from "../derivations.ts";

const addOne = (n: number): number => n + 1;

Deno.test("Derivation createMonad", () => {
  const { of, chain } = O.Monad;
  const { join, map, ap } = createMonad<O.Option<_>>({ of, chain });

  assertEquals(join(O.some(O.some(1))), O.some(1));
  assertEquals(join(O.some(O.none)), O.none);
  assertEquals(join(O.none), O.none);

  assertEquals(map(addOne)(O.some(1)), O.some(2));
  assertEquals(map(addOne)(O.none), O.none);

  assertEquals(pipe(O.none, ap(O.none)), O.none);
  assertEquals(pipe(O.some(1), ap(O.none)), O.none);
  assertEquals(pipe(O.none, ap(O.some(addOne))), O.none);
  assertEquals(pipe(O.some(1), ap(O.some(addOne))), O.some(2));
});
