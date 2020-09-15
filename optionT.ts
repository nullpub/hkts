import type { Monad, Monad2 } from "./type-classes.ts";
import type { _ } from "./hkts.ts";

import * as O from "./option.ts";
import * as C from "./composition.ts";

export const getOptionM: {
  <T>(M: Monad<T>): C.MonadComposition<T, O.Option<_>>;
  <T>(M: Monad2<T>): C.MonadComposition2<T, O.Option<_>>;
} = <T>(M: Monad<T>): C.MonadComposition<T, O.Option<_>> => {
  const { of, ap, map } = C.getApplicativeComposition(M, O.Applicative);

  return {
    of,
    ap,
    map,
    chain: (fatob, toa) =>
      M.chain((oa) => (O.isNone(oa) ? M.of(O.none) : fatob(oa.value)), toa),
    join: (FGFGa) =>
      M.chain((GFGa) => (O.isNone(GFGa) ? M.of(O.none) : GFGa.value), FGFGa),
  };
};
