import { assertEquals } from "https://deno.land/std/testing/asserts.ts";

import * as T from "../task.ts";
import { assertMonad } from "./assert.ts";

Deno.test({
  name: "Task Constructors",
  async fn(): Promise<void> {
    assertEquals(await T.of(1)(), 1);
  },
});

Deno.test({
  name: "Task Instances",
  async fn(): Promise<void> {
    await assertMonad(T.Monad, "Task", (ta) => ta());
  },
});
