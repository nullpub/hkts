import { assertMonad } from "./assert.ts";
import * as DE from "../datum_either.ts";

Deno.test({
  name: "DatumEither Modules",
  fn(): void {
    assertMonad(DE.Monad, "DatumEither");
  },
});
