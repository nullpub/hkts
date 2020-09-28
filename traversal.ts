import type * as TC from "./type_classes.ts";
import type { $, _ } from "./hkts.ts";

/***************************************************************************************************
 * @section Constructors
 **************************************************************************************************/

export type Traversal<S, A> = {
  readonly getModify: <T>(
    A: TC.Applicative<T>,
  ) => (f: (a: A) => $<T, [A]>) => (s: S) => $<T, [S]>;
};
