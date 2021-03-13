import { assertEquals } from "https://deno.land/std/testing/asserts.ts";

import * as A from "../array.ts";
import { pipe } from "../fns.ts";

/*******************************************************************************
 * Constructors
 ******************************************************************************/

Deno.test("Array zero", () => assertEquals(A.zero, []));

Deno.test("Array empty", () => assertEquals(A.empty(), []));

/*******************************************************************************
 * Module Getters
 ******************************************************************************/
