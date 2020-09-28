import { assertMonad } from "./assert.ts";

import * as A from "../array.ts";

Deno.test({
  name: "Array Modules",
  fn(): void {
    // Test Laws
    assertMonad(A.Monad, "Array");
  },
});
