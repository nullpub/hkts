import { Monad, Monad2 } from "./type-classes.ts";
import { _ } from "./hkts.ts";
import * as O from "./option.ts";
import * as C from "./composition.ts";

export const getOptionM = <T>(
  M: Monad<T>
): C.MonadComposition<T, O.Option<_>> => {
  const { of, ap, map } = C.getApplicativeComposition(M, O.Applicative);

  const chain: C.MonadComposition<T, O.Option<_>>["chain"] = (fatob, toa) =>
    M.chain((oa) => (O.isNone(oa) ? M.of(O.none) : fatob(oa.value)), toa);

  return {
    of,
    ap,
    map,
    chain,
    join: (FGFGa) => chain((x) => x, FGFGa),
  };
};

export const getOptionM2 = <T>(
  M: Monad2<T>
): C.MonadComposition2<T, O.Option<_>> => {
  const { of, ap, map } = C.getApplicative2Composition(M, O.Applicative);
  const chain: C.MonadComposition2<T, O.Option<_>>["chain"] = (fatob, toa) =>
    M.chain((oa) => (O.isNone(oa) ? M.of(O.none) : fatob(oa.value)), toa);

  return {
    of,
    ap,
    map,
    chain,
    join: (FGFGa) => chain((x) => x, FGFGa),
  };
};
