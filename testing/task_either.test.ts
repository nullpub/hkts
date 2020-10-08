import { assertEquals } from "https://deno.land/std/testing/asserts.ts";

import * as T from "../task_either.ts";
import * as E from "../either.ts";
import { assertMonad } from "./assert.ts";

Deno.test({
  name: "TaskEither Constructors",
  async fn(): Promise<void> {
    assertEquals(await T.of(1)(), E.right(1));
  },
});

Deno.test({
  name: "TaskEither Instances",
  async fn(): Promise<void> {
    await assertMonad(T.Monad, "TaskEither", (te) => te());
  },
});
