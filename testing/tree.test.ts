import { assertMonad } from "./assert.ts";

import * as T from "../tree.ts";

Deno.test({
  name: "Tree Modules",
  fn(): void {
    // Test Laws
    assertMonad(T.Monad, "Tree");
  },
});
