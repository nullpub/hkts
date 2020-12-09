import { assertMonad } from "./assert.ts";

import * as T from "../tree.ts";

Deno.test({
  name: "Tree Modules",
  fn() {
    const toString = (n: number): string => n.toString();
    const toLength = (s: string): number => s.length;
    const fromNumber = (n: number) => T.of(n.toString());
    const fromString = (s: string) => T.of(s.length);

    assertMonad(
      T.Monad,
      {
        a: 1,
        ta: T.of(1),
        fab: toString,
        fbc: toLength,
        tfab: T.of(toString),
        tfbc: T.of(toLength),
        fatb: fromNumber,
        fbtc: fromString,
      },
    );
  },
});
