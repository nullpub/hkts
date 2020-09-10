import { assertEquals } from "https://deno.land/std/testing/asserts.ts";

import { compose, constant, flip, identity } from "./fns.ts";

const a = {};
const add = (a: number) => (b: number) => a + b;
const addOne = add(1);
const addTwo = add(2);

Deno.test("identity", () => {
  assertEquals(identity(a), a);
});

Deno.test("flip", () => {
  assertEquals(flip(add)(1)(2), flip(add)(2)(1));
});

Deno.test("compose", () => {
  assertEquals(compose(addOne)(addTwo)(0), 3);
});

Deno.test("constant", () => {
  assertEquals(constant(a)(), a);
});
