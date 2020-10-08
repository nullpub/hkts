import { assertEquals } from "https://deno.land/std/testing/asserts.ts";
import { assertMonad } from "./assert.ts";

import * as R from "../reader.ts";

Deno.test({
  name: "Reader Modules",
  async fn() {
    await assertMonad(R.Monad, "Reader", (r: any) => r(1));
  },
});
