import { assertEquals } from "https://deno.land/std/testing/asserts.ts";

import * as D from "../../schemable/decode_error.ts";
import { Free } from "../../semigroup.ts";

const { leaf, key, index, member, lazy, wrap } = D.make;

Deno.test("DecodeError leaf", () => {
  assertEquals(D.leaf(1, 1), { tag: "Leaf", actual: 1, error: 1 });
});

