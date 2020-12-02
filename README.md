# hkts ![Deno](https://github.com/nullpub/hkts/workflows/Deno/badge.svg?branch=master)

Higher kinded types for [Deno](https://deno.land). As an avid user of [fp-ts](https://github.com/gcanti/fp-ts) I wanted to have a similarly full featured environment in Deno. Unfortunately, the fp-ts port to Deno is clunky to use with other functional libraries like [@nll/datum](https://github.com/nullpub/datum), [io-ts](https://github.com/gcanti/io-ts), and [monocle-ts](https://github.com/gcanti/monocle-ts). While I could have ported fp-ts directly, I've come to like the exploratory work done by pelotom in the original [hkts](http://github.com/pelotom/hkts). Thus, I've decided to port the functionality of fp-ts, io-ts, and monocle-ts to Deno using the HKT substitution developed by pelotom.

This library is primarily an exercise, but I intend to maintain 100% test coverage. Instead of breaking out the clones of io-ts, monocle-ts, and datum into other Deno modules they will all be landed here. There will be no barrel exports as importing in Deno is much cleaner without them. Contributions are welcome.

## Installation

This library is meant to be used with Deno, thus it follows the [Deno imports](https://deno.land/manual/examples/import_export) syntax.

## Examples

Many common algebraic datatypes with pipeable utility functions:

```ts
import * as O from "https://deno.land/x/hkts/option.ts";
import { pipe } from "https://deno.land/x/hkts/fns.ts";

const result = pipe(
  O.sequenceTuple(O.some(1), O.fromNullable([1, 2, 3][2]), O.some(-1)),
  O.map(([a, b, c]) => a + b + c),
  O.chain((n) => (n % 2 === 0 ? O.none : O.some(n)))
);
// result === O.some(3)
```

A full featured pipeable optics library:

```ts
import * as A from "https://deno.land/x/hkts/array.ts";
import * as L from "https://deno.land/x/hkts/lens.ts";
import * as T from "https://deno.land/x/hkts/traversal.ts";
import * as O from "https://deno.land/x/hkts/option.ts";
import { flow, pipe } from "https://deno.land/x/hkts/fns.ts";

const capitalizeWord = (str: string) =>
  str.substr(0, 1).toUpperCase() + str.substr(1);

const split = (char: string) => (str: string) => str.split(char);

const join = (char: string) => (arr: readonly string[]) => arr.join(char);

const capitalizeWords = flow(split(" "), A.map(capitalizeWord), join(" "));

type User = {
  name: string;
  addresses: {
    street: string;
    city: string;
    state: string;
    zip: string;
  }[];
};

type Users = readonly O.Option<User>[];

const capitalizeCities = pipe(
  L.id<Users>(), // Focus on the Users type
  L.traverse(A.Traversable), // Focus on each Option in the array
  T.traverse(O.Traversable), // Focus on each Some in the array
  T.prop("addresses"), // Focus on the addresses property
  T.traverse(A.Traversable), // Focus on each address inside the array
  T.prop("city"), // Focus on the city in each address
  T.modify(capitalizeWords) // Modify each focal point with the capitalizeWords function
);

const users: Users = [
  O.some({
    name: "breonna",
    addresses: [
      {
        street: "123 Main St",
        city: "davis",
        state: "California",
        zip: "00000",
      },
      {
        street: "777 Jones Ave",
        city: "sacramento",
        state: "California",
        zip: "00000",
      },
      { street: "881 Second St", city: "austin", state: "Texas", zip: "00000" },
    ],
  }),
  O.none,
  O.some({
    name: "george",
    addresses: [
      {
        street: "123 Main St",
        city: "los angeles",
        state: "California",
        zip: "00000",
      },
      {
        street: "777 Jones Ave",
        city: "jonesborough",
        state: "Tennessee",
        zip: "00000",
      },
      {
        street: "881 Second St",
        city: "san francisco",
        state: "California",
        zip: "00000",
      },
    ],
  }),
];

const capitalizedUserCities = capitalizeCities(users); // All city entries will be capitalized
```

A fairly cohesive validation, parsing, and schema generating library.

```ts
import * as J from "https://deno.land/x/hkts/json_schema.ts";
import * as D from "https://deno.land/x/hkts/decoder.ts";
import * as G from "https://deno.land/x/hkts/guard.ts";

import * as S from "https://deno.land/x/hkts/schemable.ts";

/**
 * Define the Schemables
 */

const Bar = S.make((s) =>
  s.type({
    count: s.number(),
  })
);
type Bar = S.TypeOf<typeof Bar>; // Derive type from implementation

// Type definition is necessary for recursive types
type Foo = {
  foo: Foo[];
  bar: Bar;
};

// This is the current *hack* to handle recursive types
const Test: S.Schema<Foo> = S.make((s) => {
  const Foo: any = s.lazy("Foo", () =>
    s.type({
      foo: s.array(Foo),
      bar: s.lazy("Bar", () => Bar(s)),
    })
  );

  return Foo;
});

/**
 * Generate schema, decoder, and guards
 */
const schema = Test(J.Schemable);
const decoder = Test(D.Schemable);
const guard = Test(G.Schemable);

/**
 * Try running on good data
 */
const data: Foo = {
  foo: [{ foo: [], bar: { count: 1 } }],
  bar: { count: 2 },
};
const printableSchema = J.print(schema); // JsonType
const decoded = decoder(data); // Right<Foo>
const guarded = guard(data); // true

console.log({
  printableSchema,
  decoded,
  guarded,
});
```

## Conventions

This library focuses first on implementing [static-land](https://github.com/fantasyland/static-land) type classes for a given Algebraic Data Type (ie. Either or Option). These type class modules are then exported from the ADT's namespace (eg. `import { Monad } from 'https://deno.land/x/hkts/option.ts'`).

With the exception of instance constructors (ie. getShow or getSemigroup) other ADT functions should all be pipeable. For functions that derive from type class modules, like `chain` or `map`, there are helpers in `derivations.ts` that will generate the pipeable versions for you.

For good examples of the above conventions look at the `either.ts` or `option.ts`.

# Documentation

For the foreseeable future this library will not focus on documentation. Questions are welcome via [github issues](https://github.com/nullpub/hkts/issues) but I can't guaruntee speedy responses. Once a decent collection of ADTs and other utilities are ported and all the pre-1.0.0 todo items in `TODO.md` are complete I'll shift to documentation. Even then it's likely that I'll auto-generate the raw docs from exported function and statement types and will devote any time to building an example library that doubles as extra tests.
