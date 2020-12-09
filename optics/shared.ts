import type * as TC from "../type_classes.ts";
import { $ } from "../types.ts";
import type { Traversal } from "./traversal.ts";

/**
 * Derive Traversal from Traversable
 */

// deno-fmt-ignore
type FromTraversableFn = {
<T, L extends 1>(T: TC.Traversable<T, L>): <A>() => Traversal<$<T, [A]>, A>;
<T, L extends 2>(T: TC.Traversable<T, L>): <E, A>() => Traversal<$<T, [E, A]>, A>;
<T, L extends 3>(T: TC.Traversable<T, L>): <R, E, A>() => Traversal<$<T, [R, E, A]>, A>;
<T, L extends 4>(T: TC.Traversable<T, L>): <S, R, E, A>() => Traversal<$<T, [S, R, E, A]>, A>;
};

export const createTraversal: FromTraversableFn = <T>(T: TC.Traversable<T>) =>
  <A>(): Traversal<$<T, [A]>, A> => ({
    getModify: T.traverse,
  });
