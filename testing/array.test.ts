import { assertMonad } from "./assert.ts";

import * as A from "../array.ts";

const toString = (n: number): string => n.toString();
const toLength = (s: string): number => s.length;
const fromNumber = (n: number) => A.of(n.toString());
const fromString = (s: string) => A.of(s.length);

Deno.test({
  name: "Array Modules",
  async fn() {
    await assertMonad(
      A.Monad,
      "Array",
      {
        a: 1,
        ta: A.of(1),
        fab: toString,
        fbc: toLength,
        tfab: A.of(toString),
        tfbc: A.of(toLength),
        fatb: fromNumber,
        fbtc: fromString,
      },
    );
  },
});
