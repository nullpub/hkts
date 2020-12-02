// deno-lint-ignore-file no-explicit-any

import * as S from "../state.ts";
import { assertMonad, assertRunEquals } from "./assert.ts";

Deno.test({
  name: "State Constructors",
  async fn(): Promise<void> {
    await assertRunEquals(S.of(1) as any, [1, undefined], "State");
  },
});

const toString = (n: number): string => n.toString();
const toLength = (s: string): number => s.length;
const fromNumber = (n: number) => S.of(n.toString());
const fromString = (s: string) => S.of(s.length);

Deno.test({
  name: "State Modules",
  async fn() {
    await assertMonad(S.Monad as any, "State", {
      a: 1,
      ta: S.of(1),
      fab: toString,
      fbc: toLength,
      tfab: S.of(toString),
      tfbc: S.of(toLength),
      fatb: fromNumber,
      fbtc: fromString,
    } as any);
  },
});
