import { assertMonad } from "./assert.ts";

import * as I from "../identity.ts";

Deno.test({
  name: "Identity Modules",
  async fn() {
    // Test Laws
    await assertMonad(I.Monad, "Identity");
  },
});
