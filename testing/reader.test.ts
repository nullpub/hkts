import { assertMonad } from "./assert.ts";

import * as R from "../reader.ts";

const toString = (n: number): string => n.toString();
const toLength = (s: string): number => s.length;
const fromNumber = (n: number) => R.of(n.toString());
const fromString = (s: string) => R.of(s.length);

Deno.test({
  name: "Reader Modules",
  async fn() {
    await assertMonad(
      R.Monad,
      "Reader",
      {
        a: 1,
        ta: R.of(1),
        fab: toString,
        fbc: toLength,
        tfab: R.of(toString),
        tfbc: R.of(toLength),
        fatb: fromNumber,
        fbtc: fromString,
      },
    );
  },
});
