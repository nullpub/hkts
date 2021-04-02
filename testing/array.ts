import { assertEquals } from "https://deno.land/std/testing/asserts.ts";

import * as AS from "./assert.ts";

import * as A from "../array.ts";
import { pipe } from "../fns.ts";

/*******************************************************************************
 * Constructors
 ******************************************************************************/

Deno.test("Array zero", () => assertEquals(A.zero, []));

Deno.test("Array empty", () => assertEquals(A.empty(), []));

/*******************************************************************************
 * Modules
 ******************************************************************************/

Deno.test("Array Functor", () => {
  AS.assertFunctor(
    A.Functor,
    {
      ta: [1, 2, 3],
      fai: (n: number) => n + 1,
      fij: (n: number) => n + 2,
    },
  );
});

Deno.test("Array Apply", () => {
  AS.assertApply(A.Apply, {
    ta: A.of(1),
    fai: AS.add,
    fij: AS.multiply,
    tfai: [AS.add, AS.multiply],
    tfij: [AS.multiply, AS.add],
  });
});

Deno.test("Array Applicative", () => {
  AS.assertApplicative(A.Applicative, {
    a: 1,
    ta: A.of(1),
    fai: AS.add,
    fij: AS.multiply,
    tfai: [AS.add, AS.multiply],
    tfij: [AS.multiply, AS.add],
  });
});

Deno.test("Array Chain", () => {
  AS.assertChain(A.Chain, {
    a: 1,
    ta: A.of(1),
    fai: AS.add,
    fij: AS.multiply,
    tfai: [AS.add, AS.multiply],
    tfij: [AS.multiply, AS.add],
    fati: AS.wrapAdd(A.Applicative),
    fitj: AS.wrapMultiply(A.Applicative),
  });
});

Deno.test("Array Monad", () => {
  AS.assertMonad(A.Monad, {
    a: 1,
    ta: A.of(1),
    fai: AS.add,
    fij: AS.multiply,
    tfai: [AS.add, AS.multiply],
    tfij: [AS.multiply, AS.add],
    fati: AS.wrapAdd(A.Applicative),
    fitj: AS.wrapMultiply(A.Applicative),
  });
});

Deno.test("Array Alt", () => {
  AS.assertAlt(A.Alt, {
    ta: A.of(1),
    tb: [],
    tc: [1, 2, 3],
    fai: AS.add,
    fij: AS.multiply,
  });
})


