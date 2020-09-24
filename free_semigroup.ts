import type { Semigroup } from "./type_classes.ts";

/***************************************************************************************************
 * @section Free Semigroup
 * @from https://raw.githubusercontent.com/gcanti/io-ts/master/src/FreeSemigroup.ts
 **************************************************************************************************/

export type Of<A> = {
  readonly tag: "Of";
  readonly value: A;
};

export type Concat<A> = {
  readonly tag: "Concat";
  readonly left: FreeSemigroup<A>;
  readonly right: FreeSemigroup<A>;
};

export type FreeSemigroup<A> = Of<A> | Concat<A>;

/***************************************************************************************************
 * @section Constructors
 **************************************************************************************************/

export const of = <A>(a: A): FreeSemigroup<A> => ({ tag: "Of", value: a });

export const concat = <A>(
  left: FreeSemigroup<A>,
  right: FreeSemigroup<A>,
): FreeSemigroup<A> => ({
  tag: "Concat",
  left,
  right,
});

/***************************************************************************************************
 * @section Destructors
 **************************************************************************************************/

export const fold = <A, R>(
  onOf: (value: A) => R,
  onConcat: (left: FreeSemigroup<A>, right: FreeSemigroup<A>) => R,
) =>
  (
    f: FreeSemigroup<A>,
  ): R => {
    switch (f.tag) {
      case "Of":
        return onOf(f.value);
      case "Concat":
        return onConcat(f.left, f.right);
    }
  };

/***************************************************************************************************
 * @section Module Getters
 **************************************************************************************************/

export const getSemigroup = <A = never>(): Semigroup<FreeSemigroup<A>> => ({
  concat,
});
