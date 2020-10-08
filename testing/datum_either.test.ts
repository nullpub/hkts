import { assertMonad } from "./assert.ts";
import * as DE from "../datum_either.ts";

Deno.test({
  name: "DatumEither Modules",
  async fn() {
    await assertMonad(DE.Monad, "DatumEither");
  },
});
