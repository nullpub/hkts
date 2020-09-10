import { assertEquals } from "https://deno.land/std/testing/asserts.ts";

import { curry2 } from "./fns.ts";
import { map, some } from "./maybe.ts";
import { pipe } from "./pipe.ts";

const addOne = (n: number) => n + 1;
const addOneMap = curry2(map)(addOne);

Deno.test("pipe1", () => {
  const result = pipe(some(1));
  assertEquals(result, some(1));
});

Deno.test("pipe2", () => {
  const result = pipe(some(1), addOneMap);
  assertEquals(result, some(2));
});

Deno.test("pipe3", () => {
  const result = pipe(some(1), addOneMap, addOneMap);
  assertEquals(result, some(3));
});

Deno.test("pipe4", () => {
  const result = pipe(some(1), addOneMap, addOneMap, addOneMap);
  assertEquals(result, some(4));
});

Deno.test("pipe5", () => {
  const result = pipe(some(1), addOneMap, addOneMap, addOneMap, addOneMap);
  assertEquals(result, some(5));
});

Deno.test("pipe6", () => {
  const result = pipe(
    some(1),
    addOneMap,
    addOneMap,
    addOneMap,
    addOneMap,
    addOneMap
  );
  assertEquals(result, some(6));
});

Deno.test("pipe7", () => {
  const result = pipe(
    some(1),
    addOneMap,
    addOneMap,
    addOneMap,
    addOneMap,
    addOneMap,
    addOneMap
  );
  assertEquals(result, some(7));
});

Deno.test("pipe8", () => {
  const result = pipe(
    some(1),
    addOneMap,
    addOneMap,
    addOneMap,
    addOneMap,
    addOneMap,
    addOneMap,
    addOneMap
  );
  assertEquals(result, some(8));
});

Deno.test("pipe9", () => {
  const result = pipe(
    some(1),
    addOneMap,
    addOneMap,
    addOneMap,
    addOneMap,
    addOneMap,
    addOneMap,
    addOneMap,
    addOneMap
  );
  assertEquals(result, some(9));
});

Deno.test("pipe10", () => {
  const result = pipe(
    some(1),
    addOneMap,
    addOneMap,
    addOneMap,
    addOneMap,
    addOneMap,
    addOneMap,
    addOneMap,
    addOneMap,
    addOneMap
  );
  assertEquals(result, some(10));
});
