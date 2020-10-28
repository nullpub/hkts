import { Semigroup } from "./type_classes.ts";
import * as FS from "./free_semigroup.ts";

/***************************************************************************************************
 * @section DecodeError
 * @from https://raw.githubusercontent.com/gcanti/io-ts/master/src/DecodeError.ts
 **************************************************************************************************/

/***************************************************************************************************
 * @section Types
 **************************************************************************************************/

export type Leaf<E> = {
  readonly tag: "Leaf";
  readonly actual: unknown;
  readonly error: E;
};

export const required = "required" as const;
export const optional = "optional" as const;

export type Kind = "required" | "optional";

export type Key<E> = {
  readonly tag: "Key";
  readonly key: string;
  readonly kind: Kind;
  readonly errors: FS.FreeSemigroup<DecodeError<E>>;
};

export type Index<E> = {
  readonly tag: "Index";
  readonly index: number;
  readonly kind: Kind;
  readonly errors: FS.FreeSemigroup<DecodeError<E>>;
};

export type Member<E> = {
  readonly tag: "Member";
  readonly index: number;
  readonly errors: FS.FreeSemigroup<DecodeError<E>>;
};

export type Lazy<E> = {
  readonly tag: "Lazy";
  readonly id: string;
  readonly errors: FS.FreeSemigroup<DecodeError<E>>;
};

export type Wrap<E> = {
  readonly tag: "Wrap";
  readonly error: E;
  readonly errors: FS.FreeSemigroup<DecodeError<E>>;
};

export type DecodeError<E> =
  | Leaf<E>
  | Key<E>
  | Index<E>
  | Member<E>
  | Lazy<E>
  | Wrap<E>;

/***************************************************************************************************
 * @section Constructors
 **************************************************************************************************/

export const leaf = <E>(actual: unknown, error: E): DecodeError<E> => ({
  tag: "Leaf",
  actual,
  error,
});

export const key = <E>(
  key: string,
  kind: Kind,
  errors: FS.FreeSemigroup<DecodeError<E>>,
): DecodeError<E> => ({
  tag: "Key",
  key,
  kind,
  errors,
});

export const index = <E>(
  index: number,
  kind: Kind,
  errors: FS.FreeSemigroup<DecodeError<E>>,
): DecodeError<E> => ({
  tag: "Index",
  index,
  kind,
  errors,
});

export const member = <E>(
  index: number,
  errors: FS.FreeSemigroup<DecodeError<E>>,
): DecodeError<E> => ({
  tag: "Member",
  index,
  errors,
});

export const lazy = <E>(
  id: string,
  errors: FS.FreeSemigroup<DecodeError<E>>,
): DecodeError<E> => ({
  tag: "Lazy",
  id,
  errors,
});

export const wrap = <E>(
  error: E,
  errors: FS.FreeSemigroup<DecodeError<E>>,
): DecodeError<E> => ({
  tag: "Wrap",
  error,
  errors,
});

/***************************************************************************************************
 * @section Destructors
 **************************************************************************************************/

export const fold = <E, R>(patterns: {
  Leaf: (input: unknown, error: E) => R;
  Key: (key: string, kind: Kind, errors: FS.FreeSemigroup<DecodeError<E>>) => R;
  Index: (
    index: number,
    kind: Kind,
    errors: FS.FreeSemigroup<DecodeError<E>>,
  ) => R;
  Member: (index: number, errors: FS.FreeSemigroup<DecodeError<E>>) => R;
  Lazy: (id: string, errors: FS.FreeSemigroup<DecodeError<E>>) => R;
  Wrap: (error: E, errors: FS.FreeSemigroup<DecodeError<E>>) => R;
}): ((e: DecodeError<E>) => R) => {
  const f = (e: DecodeError<E>): R => {
    switch (e.tag) {
      case "Leaf":
        return patterns.Leaf(e.actual, e.error);
      case "Key":
        return patterns.Key(e.key, e.kind, e.errors);
      case "Index":
        return patterns.Index(e.index, e.kind, e.errors);
      case "Member":
        return patterns.Member(e.index, e.errors);
      case "Lazy":
        return patterns.Lazy(e.id, e.errors);
      case "Wrap":
        return patterns.Wrap(e.error, e.errors);
    }
  };
  return f;
};

/***************************************************************************************************
 * @section Module Getters
 **************************************************************************************************/

export const getSemigroup = <E = never>(): Semigroup<
  FS.FreeSemigroup<DecodeError<E>>
> => FS.getSemigroup();
