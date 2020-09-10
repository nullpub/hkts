import { assertEquals } from "https://deno.land/std/testing/asserts.ts";

import * as O from "./option.ts";

const addOne = (n: number) => n + 1;
const someAddOne = O.some(addOne);
const someNumber = O.some(2);
const someOtherNumber = O.some(3);
const onSome = addOne;
const onNone = () => 100;
