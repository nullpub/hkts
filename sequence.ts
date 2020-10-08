import type { $ } from "./types.ts";
import type { Apply, LS } from "./type_classes.ts";

import { _reduce } from "./array.ts";

/***************************************************************************************************
 * @section Ap Function Constructors
 **************************************************************************************************/

const _getTupleConstructor = (len: number): (a: unknown) => any => {
  const out = new Array(len);
  let i = 0;

  return function loop(value: any) {
    out[i] = value;
    i++;
    return i < len ? loop : out;
  };
};

const _getRecordConstructor = (
  keys: ReadonlyArray<string>,
): (a: unknown) => any => {
  const out: Record<string, any> = {};
  const len = keys.length;
  let i = 0;

  return function loop(value: any) {
    out[keys[i]] = value;
    i++;
    return i < len ? loop : out;
  };
};

/***************************************************************************************************
 * @section Sequence Tuple
 **************************************************************************************************/

type NonEmptyArray<T> = [T, ...T[]];

// deno-fmt-ignore
type SequenceTuple<T, R extends NonEmptyArray<$<T, any[]>>, L extends LS = 1> = {
  1: $<T, [{ [K in keyof R]: R[K] extends $<T, [infer A]> ? A : never }]>;
  2: $<T, [
    { [K in keyof R]: R[K] extends $<T, [infer E, infer A]> ? E : never }[number],
    { [K in keyof R]: R[K] extends $<T, [infer E, infer A]> ? A : never },
  ]>;
  3: $<T, [
    { [K in keyof R]: R[K] extends $<T, [infer R, infer E, infer A]> ? R : never }[number],
    { [K in keyof R]: R[K] extends $<T, [infer R, infer E, infer A]> ? E : never }[number],
    { [K in keyof R]: R[K] extends $<T, [infer R, infer E, infer A]> ? A : never },
  ]>;
  4: $<T, [
    { [K in keyof R]: R[K] extends $<T, [infer S, infer R, infer E, infer A]> ? S : never }[number],
    { [K in keyof R]: R[K] extends $<T, [infer S, infer R, infer E, infer A]> ? R : never }[number],
    { [K in keyof R]: R[K] extends $<T, [infer S, infer R, infer E, infer A]> ? E : never }[number],
    { [K in keyof R]: R[K] extends $<T, [infer S, infer R, infer E, infer A]> ? A : never },
  ]>;
}[L];

// deno-fmt-ignore
type CreateSequenceTuple = {
  <T, L extends 1>(A: Apply<T, L>):
    <R extends NonEmptyArray<$<T, [unknown]>>>(...r: R) =>
      SequenceTuple<T, R, L>;
  <T, L extends 2>(A: Apply<T, L>):
    <R extends NonEmptyArray<$<T, [unknown, unknown]>>>(...r: R) =>
      SequenceTuple<T, R, L>;
  <T, L extends 3>(A: Apply<T, L>):
    <R extends NonEmptyArray<$<T, [unknown, unknown, unknown]>>>(...r: R) =>
      SequenceTuple<T, R, L>;
};

/**
 * Create a sequence over tuple function from Apply
 */
export const createSequenceTuple: CreateSequenceTuple = <T>(A: Apply<T>) =>
  <R extends NonEmptyArray<$<T, [unknown]>>>(
    ...r: R
  ): SequenceTuple<T, R> => {
    const [head, ...tail] = r;
    return _reduce(tail, A.ap, A.map(_getTupleConstructor(r.length), head));
  };

/***************************************************************************************************
 * @section Sequence Struct
 **************************************************************************************************/

type NonEmptyRecord<R> = keyof R extends never ? never : R;

// deno-fmt-ignore
type SequenceStruct<T, R extends Record<string, $<T, any[]>>, L extends LS = 1> = {
  1: $<T, [{ [K in keyof R]: R[K] extends $<T, [infer A]> ? A : never }]>;
  2: $<T, [
    { [K in keyof R]: R[K] extends $<T, [infer E, infer A]> ? E : never }[keyof R],
    { [K in keyof R]: R[K] extends $<T, [infer E, infer A]> ? A : never },
  ]>;
  3: $<T, [
    { [K in keyof R]: R[K] extends $<T, [infer R, infer E, infer A]> ? R : never }[keyof R],
    { [K in keyof R]: R[K] extends $<T, [infer R, infer E, infer A]> ? E : never }[keyof R],
    { [K in keyof R]: R[K] extends $<T, [infer R, infer E, infer A]> ? A : never },
  ]>;
  4: $<T, [
    { [K in keyof R]: R[K] extends $<T, [infer S, infer R, infer E, infer A]> ? S : never }[keyof R],
    { [K in keyof R]: R[K] extends $<T, [infer S, infer R, infer E, infer A]> ? R : never }[keyof R],
    { [K in keyof R]: R[K] extends $<T, [infer S, infer R, infer E, infer A]> ? E : never }[keyof R],
    { [K in keyof R]: R[K] extends $<T, [infer S, infer R, infer E, infer A]> ? A : never },
  ]>;
}[L];

// deno-fmt-ignore
type CreateSequenceStruct = {
  <T, L extends 1>(A: Apply<T, L>):
    <R extends Record<string, $<T, [any]>>>(r: NonEmptyRecord<R>) =>
      SequenceStruct<T, R, L>;
  <T, L extends 2>(A: Apply<T, L>):
    <R extends Record<string, $<T, [any, any]>>>(r: NonEmptyRecord<R>) =>
      SequenceStruct<T, R, L>;
  <T, L extends 3>(A: Apply<T, L>):
    <R extends Record<string, $<T, [any, any, any]>>>(r: NonEmptyRecord<R>) =>
      SequenceStruct<T, R, L>;
};

export const createSequenceStruct: CreateSequenceStruct = <T>(A: Apply<T>) =>
  <R extends Record<string, $<T, any[]>>>(
    r: NonEmptyRecord<R>,
  ): SequenceStruct<T, R> => {
    const keys = Object.keys(r);
    const [head, ...tail] = keys;

    return _reduce(
      tail,
      (f, key) => A.ap(f, r[key]),
      A.map(_getRecordConstructor(keys), r[head]),
    );
  };
