import type { $, _, _0, _1 } from "./hkts.ts";
import type { Apply, Apply2 } from "./type-classes.ts";

/**
 * @todo Credit gcanti or reimplemment
 * Sequence is not yet in its final implementation
 */

function _tuple<T extends ReadonlyArray<any>>(...t: T): T {
  return t;
}

function _curried(f: Function, n: number, acc: ReadonlyArray<unknown>) {
  return function (x: unknown) {
    const combined = Array(acc.length + 1);
    for (let i = 0; i < acc.length; i++) {
      combined[i] = acc[i];
    }
    combined[acc.length] = x;
    return n === 0 ? f.apply(null, combined) : _curried(f, n - 1, combined);
  };
}

const _tupleConstructors: Record<number, (a: unknown) => any> = {
  1: (a) => [a],
  2: (a) => (b: any) => [a, b],
  3: (a) => (b: any) => (c: any) => [a, b, c],
  4: (a) => (b: any) => (c: any) => (d: any) => [a, b, c, d],
  5: (a) => (b: any) => (c: any) => (d: any) => (e: any) => [a, b, c, d, e],
};

function _getTupleConstructor(len: number): (a: unknown) => any {
  if (!_tupleConstructors.hasOwnProperty(len)) {
    _tupleConstructors[len] = _curried(_tuple, len - 1, []);
  }
  return _tupleConstructors[len];
}

export function _sequenceTuple<T>({ map, ap }: Apply<T>) {
  return <A, M extends $<T, [any]>[]>(
    head: $<T, [A]>,
    ...tail: M
  ): $<
    T,
    [[A, ...{ [K in keyof M]: M[K] extends $<T, [infer U]> ? U : never }]]
  > => tail.reduce(ap, map(_getTupleConstructor(tail.length + 1), head));
}

export function _sequenceTuple2<T>({ map, ap }: Apply2<T>) {
  return <E, R, M extends $<T, [E, any]>[]>(
    head: $<T, [E, R]>,
    ...tail: M
  ): $<
    T,
    [E, [R, ...{ [K in keyof M]: M[K] extends $<T, [E, infer A]> ? A : never }]]
  > => tail.reduce(ap, map(_getTupleConstructor(tail.length + 1), head));
}
