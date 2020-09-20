# hkts ![Deno](https://github.com/nullpub/hkts/workflows/Deno/badge.svg?branch=master)

Higher kinded types for [Deno](https://deno.land). As an avid user of [fp-ts](https://github.com/gcanti/fp-ts) I wanted to have a similarly full featured environment in Deno. Unfortunately, the fp-ts port to Deno is clunky to use with other functional libraries like [@nll/datum](https://github.com/nullpub/datum), [io-ts](https://github.com/gcanti/io-ts), and [monocle-ts](https://github.com/gcanti/monocle-ts). While I could have ported fp-ts directly, I've come to like the exploratory work done by pelotom in the original [hkts](http://github.com/pelotom/hkts). Thus, I've decided to port the functionality of fp-ts, io-ts, and monocle-ts to Deno using the HKT substitution developed by pelotom.

This library is primarily an exercise, but I intend to maintain 100% test coverage. Instead of breaking out the clones of io-ts, monocle-ts, and datum into other Deno modules they will all be landed here. There will be no barrel exports as importing in Deno is much cleaner without them. Contributions are welcome.

## Installation

This library is meant to be used with Deno, thus it follows the [Deno imports](https://deno.land/manual/examples/import_export) syntax.

```ts
import * as O from "https://deno.land/x/hkts/option.ts";
import { pipe } from "https://deno.land/x/hkts/fns.ts";

const result = pipe(
    O.some(1),
    O.map(n => n + 1),
    O.chain(n => n % 2 === 0 ? O.none, O.some(n))
);
// result = O.none.
```

## Conventions

This library focuses first on implementing [static-land](https://github.com/fantasyland/static-land) type classes for a given Algebraic Data Type (ie. Either or Option). These type class modules are then exported from the ADT's namespace (eg. `import { Monad } from 'https://deno.land/x/hkts/option.ts'`).

With the exception of instance constructors (ie. getShow or getSemigroup) other ADT functions should all be pipeable. For functions that derive from type class modules, like `chain` or `map`, there are helpers in `derivations.ts` that will generate the pipeable versions for you.

For good examples of the above conventions look at the `either.ts` or `option.ts`.

# Documentation

For the foreseeable future this library will not focus on documentation. Questions are welcome via [github issues](https://github.com/nullpub/hkts/issues) but I can't guaruntee speedy responses. Once a decent collection of ADTs and other utilities are ported and all the pre-1.0.0 todo items in `TODO.md` are complete I'll shift to documentation. Even then it's likely that I'll auto-generate the raw docs from exported function and statement types and will devote any time to building an example library that doubles as extra tests.
