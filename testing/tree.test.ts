import { assertMonad } from "./assert.ts";

import * as T from "../tree.ts";

Deno.test({
  name: "Tree Modules",
  async fn() {
    // Test Laws
    await assertMonad(T.Monad, "Tree");
  },
});
