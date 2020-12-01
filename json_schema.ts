import type * as TC from "./type_classes.ts";
import type { _ } from "./types.ts";
import type { State } from "./state.ts";
import type {
  Schemable as SchemableT,
  TupleSchemable,
  Literal,
} from "./schemable.ts";

import * as S from "./state.ts";
import { constant, pipe } from "./fns.ts";

/***************************************************************************************************
 * @section Json Types
 **************************************************************************************************/

type NonEmptyArray<T> = readonly [T, ...T[]];

export type JsonType = { definitions?: JsonDefinitions } & (
  | JsonString
  | JsonNumber
  | JsonObject
  | JsonArray
  | JsonBoolean
  | JsonNull
  | JsonEnum
  | JsonAllOf
  | JsonAnyOf
  | JsonRef
);

export type JsonString = {
  type: "string";
  enum?: NonEmptyArray<string>;
  minLength?: number;
  maxLength?: number;
};

export type JsonNumber =
  | { type: "integer"; enum?: NonEmptyArray<number> } // Integer
  | { type: "number"; enum?: NonEmptyArray<number> }; // Float

// deno-lint-ignore ban-types
export type JsonObject<P extends Record<string, JsonType> = {}> = {
  type: "object";
  properties: P;
  required?: NonEmptyArray<keyof P>;
  additionalProperties?: false | JsonType;
};

export type JsonArray = {
  type: "array";
  items: JsonType | NonEmptyArray<JsonType>;
  additionalItems?: JsonType;
};

export type JsonBoolean = { type: "boolean" };

export type JsonNull = { type: "null" };

export type JsonEnum = { enum: NonEmptyArray<Literal> };

export type JsonAllOf = { allOf: NonEmptyArray<JsonType> };

export type JsonAnyOf = { anyOf: NonEmptyArray<JsonType> };

export type JsonRef = { $ref: string };

export type JsonDefinitions = Record<string, JsonType>;

/***************************************************************************************************
 * @section Types
 **************************************************************************************************/

export type JsonSchema<A> = State<JsonDefinitions, JsonType>;

export type TypeOf<T> = T extends JsonSchema<infer A> ? A : never;

/***************************************************************************************************
 * @section Utilities
 **************************************************************************************************/

const { concat }: TC.Semigroup<JsonDefinitions> = {
  concat: (a, b) => Object.assign({}, a, b),
};

/***************************************************************************************************
 * @section Constructors
 **************************************************************************************************/

export const createJsonString = (
  props: Omit<JsonString, "type"> = {}
): JsonString => ({
  ...props,
  type: "string",
});

export const createJsonNumber = (
  props: Omit<JsonNumber, "type"> = {}
): JsonNumber => ({
  ...props,
  type: "number",
});

export const createJsonInteger = (
  props: Omit<JsonNumber, "type"> = {}
): JsonNumber => ({
  ...props,
  type: "integer",
});

export const createJsonObject = (
  props: Omit<JsonObject, "type">
): JsonObject => ({
  ...props,
  type: "object",
});

export const createJsonArray = (props: Omit<JsonArray, "type">): JsonArray => ({
  ...props,
  type: "array",
});

export const createJsonBoolean = (
  props: Omit<JsonBoolean, "type"> = {}
): JsonBoolean => ({ ...props, type: "boolean" });

export const createJsonNull = (
  props: Omit<JsonNull, "type"> = {}
): JsonNull => ({
  ...props,
  type: "null",
});

export const createJsonEnum = (schemas: NonEmptyArray<Literal>): JsonEnum => ({
  enum: schemas,
});

export const createJsonAllOf = (allOf: NonEmptyArray<JsonType>): JsonAllOf => ({
  allOf,
});

export const createJsonAnyOf = (anyOf: NonEmptyArray<JsonType>): JsonAnyOf => ({
  anyOf,
});

export const createJsonRef = (id: string): JsonRef => ({
  $ref: `#/definitions/${id}`,
});

/***************************************************************************************************
 * @section Combinators
 **************************************************************************************************/

export const nullable = <A>(or: JsonSchema<A>): JsonSchema<null | A> =>
  pipe(
    or,
    S.map((a) => createJsonAnyOf([createJsonNull(), a]))
  );

/***************************************************************************************************
 * @section Schemables
 **************************************************************************************************/

export const literal = <A extends readonly [Literal, ...Literal[]]>(
  ...values: A
): JsonSchema<A[number]> => S.of(createJsonEnum(values));

export const string: JsonSchema<string> = S.of(createJsonString());

export const number: JsonSchema<number> = S.of(createJsonNumber());

export const boolean: JsonSchema<boolean> = S.of(createJsonBoolean());

export const type = <P extends Record<string, JsonSchema<unknown>>>(
  properties: P
): JsonSchema<{ [K in keyof P]: TypeOf<P[K]> }> =>
  pipe(
    S.sequenceStruct(properties as Record<string, JsonSchema<P[keyof P]>>),
    S.map((properties) =>
      // deno-lint-ignore no-explicit-any
      createJsonObject({ properties, required: Object.keys(properties) as any })
    )
  );

export const partial = <P extends Record<string, JsonSchema<unknown>>>(
  properties: P
): JsonSchema<Partial<{ [K in keyof P]: TypeOf<P[K]> }>> =>
  pipe(
    S.sequenceStruct(properties as Record<string, JsonSchema<P[keyof P]>>),
    S.map((properties) => createJsonObject({ properties }))
  );

export const array = <A>(item: JsonSchema<A>): JsonSchema<readonly A[]> =>
  pipe(
    item,
    S.map((items) => createJsonArray({ items }))
  );

export const record = <A>(
  schema: JsonSchema<A>
): JsonSchema<Record<string, A>> =>
  pipe(
    schema,
    S.map((additionalProperties) =>
      createJsonObject({ properties: {}, additionalProperties })
    )
  );

export const tuple = <A extends NonEmptyArray<unknown>>(
  ...components: { [K in keyof A]: JsonSchema<A[K]> }
): JsonSchema<A> =>
  pipe(
    S.sequenceTuple(...(components as NonEmptyArray<JsonSchema<keyof A>>)),
    S.map((items) => createJsonArray({ items }))
  );

export const union = <MS extends NonEmptyArray<JsonSchema<unknown>>>(
  ...members: MS
): JsonSchema<TypeOf<MS[keyof MS]>> =>
  pipe(
    S.sequenceTuple(...(members as NonEmptyArray<JsonSchema<MS[keyof MS]>>)),
    S.map((items) => createJsonAnyOf(items))
  );

export const intersect = <A, B>(
  left: JsonSchema<A>,
  right: JsonSchema<B>
): JsonSchema<A & B> =>
  pipe(
    S.sequenceTuple(left, right),
    S.map((items) => createJsonAllOf(items))
  );

export const sum = <T extends string, A>(
  tag: T,
  members: { [K in keyof A]: JsonSchema<A[K]> }
): JsonSchema<A[keyof A]> =>
  pipe(
    S.sequenceTuple(
      ...((Object.values(members) as unknown) as NonEmptyArray<
        JsonSchema<A[keyof A]>
      >)
    ),
    S.map((items) => createJsonAnyOf(items))
  );

export const lazy = <A>(id: string, f: () => JsonSchema<A>): JsonSchema<A> => {
  let returnRef = false;
  const ref = createJsonRef(id);

  return (s) => {
    if (returnRef) {
      return [ref, s];
    }
    returnRef = true;
    const [schema, defs] = f()(s);
    const definitions = [{ [id]: schema }, defs, s].reduce(concat);
    return [ref, definitions];
  };
};

/***************************************************************************************************
 * @section Utilities
 **************************************************************************************************/

export const print = <A>(schema: JsonSchema<A>): JsonType => {
  const result = schema({});
  return {
    definitions: result[1],
    ...result[0],
  };
};

/***************************************************************************************************
 * @section Modules
 **************************************************************************************************/

export const Schemable: SchemableT<JsonSchema<_>> = {
  literal,
  string: constant(string),
  number: constant(number),
  boolean: constant(boolean),
  nullable: nullable,
  type,
  partial,
  record,
  array,
  tuple: tuple as TupleSchemable<JsonSchema<_>, 1>,
  intersect,
  sum,
  lazy,
};
