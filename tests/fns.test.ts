import { assertEquals } from "https://deno.land/std/testing/asserts.ts";

import { compose, constant, curry2, flip, identity, pipe } from "../fns.ts";
import * as O from "../option.ts";

const a = {};
const add = (a: number) => (b: number) => a + b;
const addOne = add(1);
const addTwo = add(2);
const addOneMap = curry2(O.Monad.map)(addOne);

Deno.test("Fn identity", () => {
  assertEquals(identity(a), a);
});

Deno.test("Fn flip", () => {
  assertEquals(flip(add)(1)(2), flip(add)(2)(1));
});

Deno.test("Fn compose", () => {
  assertEquals(compose(addOne)(addTwo)(0), 3);
});

Deno.test("Fn constant", () => {
  assertEquals(constant(a)(), a);
});

Deno.test("Fn pipe", () => {
  assertEquals(pipe(O.some(1)), O.some(1), "Pipe 1 Function");

  assertEquals(pipe(O.some(1), addOneMap), O.some(2), "Pipe 2 Functions");

  assertEquals(
    pipe(O.some(1), addOneMap, addOneMap),
    O.some(3),
    "Pipe 3 Functions"
  );

  assertEquals(
    pipe(O.some(1), addOneMap, addOneMap, addOneMap),
    O.some(4),
    "Pipe 4 Functions"
  );

  assertEquals(
    pipe(O.some(1), addOneMap, addOneMap, addOneMap, addOneMap),
    O.some(5),
    "Pipe 5 Functions"
  );

  assertEquals(
    pipe(O.some(1), addOneMap, addOneMap, addOneMap, addOneMap, addOneMap),
    O.some(6),
    "Pipe 6 Functions"
  );

  assertEquals(
    pipe(
      O.some(1),
      addOneMap,
      addOneMap,
      addOneMap,
      addOneMap,
      addOneMap,
      addOneMap
    ),
    O.some(7),
    "Pipe 7 Functions"
  );

  assertEquals(
    pipe(
      O.some(1),
      addOneMap,
      addOneMap,
      addOneMap,
      addOneMap,
      addOneMap,
      addOneMap,
      addOneMap
    ),
    O.some(8),
    "Pipe 8 Functions"
  );

  assertEquals(
    pipe(
      O.some(1),
      addOneMap,
      addOneMap,
      addOneMap,
      addOneMap,
      addOneMap,
      addOneMap,
      addOneMap,
      addOneMap
    ),
    O.some(9),
    "Pipe 9 Functions"
  );
});
