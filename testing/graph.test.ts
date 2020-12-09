import { assertEquals } from "https://deno.land/std@0.77.0/testing/asserts.ts";

import * as Test from "./assert.ts";
import * as G from "../graph.ts";

Deno.test({
  name: "Graph Constructors",
  fn(): void {
    // zero
    assertEquals(G.zero, { tag: "Empty" });

    // empty
    assertEquals(G.empty(), { tag: "Empty" });

    // vertex
    assertEquals(G.vertex(1), { tag: "Vertex", value: 1 });

    // vertices
    assertEquals(
      G.vertices([1, 2]),
      {
        tag: "Overlay",
        left: {
          tag: "Overlay",
          left: { tag: "Empty" },
          right: { tag: "Vertex", value: 1 },
        },
        right: { tag: "Vertex", value: 2 },
      },
    );

    // overlay
    assertEquals(
      G.overlay(G.zero, G.vertex(1)),
      {
        tag: "Overlay",
        left: { tag: "Empty" },
        right: { tag: "Vertex", value: 1 },
      },
    );

    // overlays
    assertEquals(
      G.overlays([G.vertex(1), G.vertex(2)]),
      {
        tag: "Overlay",
        left: {
          tag: "Overlay",
          left: { tag: "Empty" },
          right: { tag: "Vertex", value: 1 },
        },
        right: { tag: "Vertex", value: 2 },
      },
    );

    // connect
    assertEquals(
      G.connect(G.zero, G.vertex(1)),
      {
        tag: "Connect",
        from: { tag: "Empty" },
        to: { tag: "Vertex", value: 1 },
      },
    );

    // connects
    assertEquals(
      G.connects([G.vertex(1), G.vertex(2)]),
      {
        tag: "Connect",
        from: {
          tag: "Connect",
          from: { tag: "Empty" },
          to: { tag: "Vertex", value: 1 },
        },
        to: { tag: "Vertex", value: 2 },
      },
    );

    // edge
    assertEquals(
      G.edge(1, 2),
      {
        tag: "Connect",
        from: { tag: "Vertex", value: 1 },
        to: { tag: "Vertex", value: 2 },
      },
    );

    // edges
    assertEquals(
      G.edges([[1, 2], [2, 3]]),
      {
        tag: "Overlay",
        left: {
          tag: "Overlay",
          left: { tag: "Empty" },
          right: {
            tag: "Connect",
            from: { tag: "Vertex", value: 1 },
            to: { tag: "Vertex", value: 2 },
          },
        },
        right: {
          tag: "Connect",
          from: { tag: "Vertex", value: 2 },
          to: { tag: "Vertex", value: 3 },
        },
      },
    );

    // clique
    assertEquals(
      G.clique([1, 2]),
      {
        tag: "Connect",
        from: {
          tag: "Connect",
          from: { tag: "Empty" },
          to: { tag: "Vertex", value: 1 },
        },
        to: { tag: "Vertex", value: 2 },
      },
    );
  },
});

Deno.test({
  name: "Graph Destructors",
  fn(): void {
    // fold
    const graph = G.edges([[1, 2], [2, 1], [3, 4], [4, 5]]);
    const fold = G.fold(
      () => 0,
      (value: number) => value,
      (left, right) => left + right,
      (from, to) => from * to,
    );
    assertEquals(fold(graph), 36);
  },
});

Deno.test({
  name: "Graph Module Getters",
  fn() {
  },
});

Deno.test({
  name: "Graph Modules",
  fn() {
    // Monad
    Test.assertMonad(
      G.Monad,
      {
        a: 1,
        ta: G.of(1),
        fab: (n: number) => n.toString(),
        fbc: (s: string) => s.length,
        fatb: (n: number) => G.of(n.toString()),
        fbtc: (s: string) => G.of(s.length),
        tfab: G.of((n: number) => n.toString()),
        tfbc: G.of((s: string) => s.length),
      },
    );
  },
});

Deno.test({
  name: "Graph Pipeables",
  fn() {
  },
});
