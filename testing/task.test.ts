import { assertEquals } from "https://deno.land/std@0.77.0/testing/asserts.ts";

import * as T from "../task.ts";

Deno.test({
  name: "Task Constructors",
  async fn(): Promise<void> {
    assertEquals(await T.of(1)(), 1);
  },
});

const toString = (n: number): string => n.toString();
const toLength = (s: string): number => s.length;
const fromNumber = (n: number) => T.of(n.toString());
const fromString = (s: string) => T.of(s.length);

Deno.test({
  name: "Task Modules",
  fn() {
  },
});
