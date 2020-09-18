import type { $, _, _0, _1 } from "./hkts.ts";
import type { Apply, LS } from "./type_classes.ts";

/**
 * @todo Credit gcanti or reimplemment
 * Sequence is not yet in its final implementation.
 * These helpers might be made easier to reason about
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

function _getRecordConstructor(keys: ReadonlyArray<string>) {
  const len = keys.length;
  switch (len) {
    case 1:
      return (a: any) => ({ [keys[0]]: a });
    case 2:
      return (a: any) => (b: any) => ({ [keys[0]]: a, [keys[1]]: b });
    case 3:
      return (a: any) =>
        (b: any) =>
          (c: any) => ({
            [keys[0]]: a,
            [keys[1]]: b,
            [keys[2]]: c,
          });
    case 4:
      return (a: any) =>
        (b: any) =>
          (c: any) =>
            (d: any) => ({
              [keys[0]]: a,
              [keys[1]]: b,
              [keys[2]]: c,
              [keys[3]]: d,
            });
    case 5:
      return (a: any) =>
        (b: any) =>
          (c: any) =>
            (d: any) =>
              (e: any) => ({
                [keys[0]]: a,
                [keys[1]]: b,
                [keys[2]]: c,
                [keys[3]]: d,
                [keys[4]]: e,
              });
    default:
      return _curried(
        (...args: ReadonlyArray<unknown>) => {
          const r: Record<string, unknown> = {};
          for (let i = 0; i < len; i++) {
            r[keys[i]] = args[i];
          }
          return r;
        },
        len - 1,
        [],
      );
  }
}

type NonEmptyArray<T> = [T, ...T[]];
type EnforceNonEmptyRecord<R> = keyof R extends never ? never : R;

type SequenceTuple<
  T,
  R extends NonEmptyArray<$<T, any[]>>,
  L extends LS = 1,
> = {
  1: $<T, [[...{ [K in keyof R]: R[K] extends $<T, [infer A]> ? A : never }]]>;
  2: $<
    T,
    [
      [
        ...{
          [K in keyof R]: R[K] extends $<T, [infer e, infer A]> ? A : never;
        },
      ],
    ]
  >;
  3: $<
    T,
    [
      [
        ...{
          [K in keyof R]: R[K] extends $<T, [infer r, infer e, infer A]> ? A
            : never;
        },
      ],
    ]
  >;
}[L];

type CreateSequenceTuple = {
  <T, L extends 1>(A: Apply<T, L>): <R extends NonEmptyArray<$<T, [any]>>>(
    ...r: R
  ) => SequenceTuple<T, R, L>;
  <T, L extends 2>(A: Apply<T, L>): <R extends NonEmptyArray<$<T, [any, any]>>>(
    ...r: R
  ) => SequenceTuple<T, R, L>;
  <T, L extends 3>(A: Apply<T, L>): <
    R extends NonEmptyArray<$<T, [any, any, any]>>,
  >(
    ...r: R
  ) => SequenceTuple<T, R, L>;
};

/**
 * Create a sequence over tuple function from Apply
 */
export const createSequenceTuple: CreateSequenceTuple = <T>({
  map,
  ap,
}: Apply<T>) =>
  <R extends NonEmptyArray<$<T, [any]>>>(
    ...r: R
  ): SequenceTuple<T, R> => {
    const [head, ...tail] = r;
    return tail.reduce(ap, map(_getTupleConstructor(tail.length + 1), head));
  };

type SequenceStruct<
  T,
  R extends Record<string, $<T, any[]>>,
  L extends LS = 1,
> = {
  1: $<T, [{ [K in keyof R]: R[K] extends $<T, [infer A]> ? A : never }]>;
  2: $<
    T,
    [{ [K in keyof R]: R[K] extends $<T, [infer e, infer A]> ? A : never }]
  >;
  3: $<
    T,
    [
      {
        [K in keyof R]: R[K] extends $<T, [infer r, infer e, infer A]> ? A
          : never;
      },
    ]
  >;
}[L];

type CreateSequenceStruct = {
  <T, L extends 1>(A: Apply<T, L>): <R extends Record<string, $<T, [any]>>>(
    r: EnforceNonEmptyRecord<R>,
  ) => SequenceStruct<T, R, L>;
  <T, L extends 2>(A: Apply<T, L>): <
    R extends Record<string, $<T, [any, any]>>,
  >(
    r: EnforceNonEmptyRecord<R>,
  ) => SequenceStruct<T, R, L>;
  <T, L extends 3>(A: Apply<T, L>): <
    R extends Record<string, $<T, [any, any, any]>>,
  >(
    r: EnforceNonEmptyRecord<R>,
  ) => SequenceStruct<T, R, L>;
};

export const createSequenceStruct: CreateSequenceStruct = <T>({
  ap,
  map,
}: Apply<T>) =>
  <R extends Record<string, $<T, [any]>>>(
    r: EnforceNonEmptyRecord<R>,
  ): SequenceStruct<T, R> => {
    const keys = Object.keys(r);
    const [head, ...tail] = keys;
    return tail.reduce(
      (f, key) => ap(f, r[key]),
      map(_getRecordConstructor(keys), r[head]),
    );
  };
