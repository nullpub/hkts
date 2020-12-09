import { assertMonad } from "./assert.ts";

import * as I from "../identity.ts";

const toString = (n: number): string => n.toString();
const toLength = (s: string): number => s.length;
const fromNumber = (n: number) =>
  n % 2 === 0 ? I.of(n.toString()) : I.of("Number Mod 2");
const fromString = (s: string) => I.of(s.length);

Deno.test({
  name: "Identity Modules",
  fn() {
    assertMonad(
      I.Monad,
      {
        a: 1,
        ta: I.of(1),
        fab: toString,
        fbc: toLength,
        tfab: I.of(toString),
        tfbc: I.of(toLength),
        fatb: fromNumber,
        fbtc: fromString,
      },
    );
  },
});
