import { assertMonad } from "./assert.ts";

import * as A from "../array.ts";

Deno.test({
  name: "Array Modules",
  async fn() {
    // Test Laws
    await assertMonad(A.Monad, "Array");
  },
});
