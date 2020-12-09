import { assertEquals } from "https://deno.land/std@0.77.0/testing/asserts.ts";

import * as TE from "../task_either.ts";
import * as E from "../either.ts";

Deno.test({
  name: "TaskEither Constructors",
  async fn(): Promise<void> {
    assertEquals(await TE.of(1)(), E.right(1));
  },
});

Deno.test({
  name: "TaskEither Modules",
  fn() {
  },
});
