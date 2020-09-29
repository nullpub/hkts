import { assertMonad } from "./assert.ts";

import * as I from "../identity.ts";

Deno.test({
  name: "Identity Modules",
  fn(): void {
    // Test Laws
    assertMonad(I.Monad, "Identity");
  },
});
