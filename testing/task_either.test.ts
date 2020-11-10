import { assertEquals } from "https://deno.land/std@0.77.0/testing/asserts.ts";

import * as TE from "../task_either.ts";
import * as E from "../either.ts";
import { assertMonad } from "./assert.ts";

Deno.test({
  name: "TaskEither Constructors",
  async fn(): Promise<void> {
    assertEquals(await TE.of(1)(), E.right(1));
  },
});

const toString = (n: number): string => n.toString();
const toLength = (s: string): number => s.length;
const fromNumber = (n: number) => TE.of(n.toString());
const fromString = (s: string) => TE.of(s.length);

Deno.test({
  name: "TaskEither Modules",
  async fn() {
    await assertMonad(
      TE.Monad,
      "TaskEither",
      {
        a: 1,
        ta: TE.of(1),
        fab: toString,
        fbc: toLength,
        tfab: TE.of(toString),
        tfbc: TE.of(toLength),
        fatb: fromNumber,
        fbtc: fromString,
      },
    );
  },
});
