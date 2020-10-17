import { assertMonad } from "./assert.ts";

import * as R from "../reader.ts";

const toString = (n: number): string => n.toString();
const toLength = (s: string): number => s.length;
const fromNumber = (n: number) => R.Monad.of(n.toString());
const fromString = (s: string) => R.Monad.of(s.length);

Deno.test({
  name: "Reader Modules",
  async fn() {
    await assertMonad(
      R.Monad,
      "Reader",
      {
        a: 1,
        ta: R.Monad.of(1),
        fab: toString,
        fbc: toLength,
        tfab: R.Monad.of(toString),
        tfbc: R.Monad.of(toLength),
        fatb: fromNumber,
        fbtc: fromString,
      },
    );
  },
});
