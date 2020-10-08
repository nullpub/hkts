import * as T from "./assert.ts";

import * as A from "../array.ts";

Deno.test({
  name: "Array Modules",
  async fn() {
    await T.assertMonad(A.Monad, "Array");
    T.assertFilterable(A.Filterable, A.of, "Array");
  },
});
