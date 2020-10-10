import { assertMonad } from "./assert.ts";
import * as DE from "../datum_either.ts";

const toString = (n: number): string => n.toString();
const toLength = (s: string): number => s.length;
const fromNumber = (n: number) =>
  n % 2 === 0 ? DE.of(n.toString()) : DE.failure("Number Mod 2");
const fromString = (s: string) =>
  s.length === 0 ? DE.failure("Empty string") : DE.of(s.length);

Deno.test({
  name: "DatumEither Modules",
  async fn() {
    await assertMonad(
      DE.Monad,
      "DatumEither",
      {
        a: 1,
        ta: DE.of(1),
        fab: toString,
        fbc: toLength,
        tfab: DE.of(toString),
        tfbc: DE.of(toLength),
        fatb: fromNumber,
        fbtc: fromString,
      },
    );
  },
});
