import { assertEquals } from "https://deno.land/std@0.77.0/testing/asserts.ts";

import * as S from "../state.ts";
import { assertMonad } from "./assert.ts";

Deno.test({
  name: "State Constructors",
  fn(): void {
    // await assertRunEquals(S.of(1) as any, [1, undefined], "State");
  },
});

Deno.test({
  name: "State Modules",
  fn() {
  },
});
