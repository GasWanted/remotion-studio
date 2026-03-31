import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantDef, VariantProps } from "../types";
import { FB, seeded, drawFBBg, drawFBNode, drawFBEdge, drawFBText, drawFBCounter, fadeInOut, cellHSL, drawFBColorEdge, drawPersonBlob, drawIconPerson, drawIconBuilding } from "./flatbold-kit";

/* Shot 031 — "But the map doesn't give you a label for what the wires do."
   — 150 frames (5s)
   Network with "?" on every node, unknown. */

const DUR = 150;

/* V1: Full network, question marks on each node, labels fade in as "???" */
const V1: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame); const a = fadeInOut(frame, DUR);
    const sc = Math.min(W, H) / 360;
    const rng = seeded(3101);
    const nodes: { x: number; y: number }[] = [];
    for (let i = 0; i < 12; i++) {
      const nx = W * 0.1 + rng() * W * 0.8, ny = H * 0.1 + rng() * H * 0.65;
      nodes.push({ x: nx, y: ny });
      const nP = interpolate(frame, [5 + i * 5, 15 + i * 5], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      drawFBNode(ctx, nx, ny, 7 * sc, i % 8, a * nP, frame);
      // Question mark
      const qP = interpolate(frame, [30 + i * 6, 42 + i * 6], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      drawFBText(ctx, "?", nx, ny, 10 * sc, a * qP, "center", FB.gold);
    }
    // Edges
    for (let i = 0; i < nodes.length - 1; i++) {
      drawFBEdge(ctx, nodes[i].x, nodes[i].y, nodes[i + 1].x, nodes[i + 1].y, sc, a * 0.15, frame);
    }
    drawFBText(ctx, "NO LABELS", W / 2, H * 0.88, 14 * sc, a, "center", FB.gold);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* V2: Map metaphor — terrain of nodes, all labels replaced with "?" */
const V2: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame); const a = fadeInOut(frame, DUR);
    const sc = Math.min(W, H) / 360;
    drawFBText(ctx, "THE MAP", W / 2, H * 0.06, 10 * sc, a, "center", FB.teal);
    // Grid of nodes representing the "map"
    const cols = 5, rows = 4;
    const rng = seeded(3102);
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const nx = W * 0.12 + c * W * 0.19 + (rng() - 0.5) * 8 * sc;
        const ny = H * 0.15 + r * H * 0.17 + (rng() - 0.5) * 6 * sc;
        const idx = r * cols + c;
        const nP = interpolate(frame, [5 + idx * 2, 12 + idx * 2], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        drawFBNode(ctx, nx, ny, 6 * sc, idx % 8, a * nP * 0.5, frame);
        // Question mark fading in later
        const qP = interpolate(frame, [40 + idx * 3, 55 + idx * 3], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        drawFBText(ctx, "?", nx, ny, 8 * sc, a * qP * 0.8, "center", FB.gold);
        // Edges to neighbors
        if (c < cols - 1) {
          const nextNx = W * 0.12 + (c + 1) * W * 0.19 + (rng() - 0.5) * 8 * sc;
          drawFBEdge(ctx, nx, ny, nextNx, ny + (rng() - 0.5) * 10 * sc, sc, a * nP * 0.1, frame);
        } else { rng(); rng(); }
      }
    }
    drawFBText(ctx, "WIRES WITH NO NAMES", W / 2, H * 0.9, 10 * sc, a, "center", FB.gold);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* V3: Label tags falling off — nodes had names that dissolve into "?" */
const V3: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame); const a = fadeInOut(frame, DUR);
    const sc = Math.min(W, H) / 360;
    const labels = ["DNa01", "MN9", "GF", "aDN1", "P9", "MDN", "LPLC2"];
    const rng = seeded(3103);
    labels.forEach((lbl, i) => {
      const nx = W * 0.1 + rng() * W * 0.8, ny = H * 0.12 + rng() * H * 0.55;
      drawFBNode(ctx, nx, ny, 8 * sc, i, a, frame);
      // Label fading out
      const fadeOut = interpolate(frame, [20 + i * 10, 50 + i * 10], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      if (fadeOut > 0) {
        const dropY = ny + 12 * sc + (1 - fadeOut) * 15 * sc;
        drawFBText(ctx, lbl, nx, dropY, 6 * sc, a * fadeOut * 0.6, "center", FB.teal);
      }
      // "?" replacing it
      const qP = interpolate(frame, [55 + i * 8, 70 + i * 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      drawFBText(ctx, "?", nx, ny + 12 * sc, 10 * sc, a * qP, "center", FB.gold);
      if (i > 0) drawFBEdge(ctx, nx, ny, nx - 20 * sc, ny + 15 * sc, sc, a * 0.1, frame);
    });
    const labP = interpolate(frame, [100, 125], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "NAMES UNKNOWN", W / 2, H * 0.88, 12 * sc, a * labP, "center", FB.gold);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* V4: Big "?" center, network orbiting around it dimly */
const V4: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame); const a = fadeInOut(frame, DUR);
    const sc = Math.min(W, H) / 360;
    const cx = W / 2, cy = H * 0.42;
    // Orbiting nodes
    for (let i = 0; i < 10; i++) {
      const angle = (i / 10) * Math.PI * 2 + frame * 0.01;
      const dist = Math.min(W, H) * 0.3 + Math.sin(frame * 0.03 + i) * 10 * sc;
      const nx = cx + Math.cos(angle) * dist, ny = cy + Math.sin(angle) * dist;
      drawFBNode(ctx, nx, ny, 4 * sc, i, a * 0.3, frame);
      drawFBText(ctx, "?", nx, ny, 6 * sc, a * 0.4, "center", FB.gold);
    }
    // Giant central "?"
    const qP = interpolate(frame, [15, 45], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const qScale = qP > 0 ? Math.max(1, 1.5 - (frame - 35) * 0.02) : 0;
    drawFBText(ctx, "?", cx, cy, 50 * sc * Math.min(1.3, qScale), a * qP, "center", FB.gold);
    drawFBText(ctx, "WHAT DO THESE WIRES DO?", cx, H * 0.88, 9 * sc, a, "center", FB.text.dim);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* V5: Dense wiring diagram, tooltip boxes pop up empty */
const V5: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame); const a = fadeInOut(frame, DUR);
    const sc = Math.min(W, H) / 360;
    // Dense network
    const rng = seeded(3105);
    for (let i = 0; i < 20; i++) {
      const nx = W * 0.05 + rng() * W * 0.9, ny = H * 0.05 + rng() * H * 0.7;
      drawFBNode(ctx, nx, ny, 2 * sc + rng() * 3 * sc, i % 8, a * 0.25, frame);
      if (i > 0) drawFBEdge(ctx, nx, ny, W * 0.05 + rng() * W * 0.9, H * 0.05 + rng() * H * 0.7, sc, a * 0.06, frame);
      else { rng(); rng(); }
    }
    // Tooltip boxes with "?" appearing
    const tooltips = [[W * 0.2, H * 0.2], [W * 0.6, H * 0.15], [W * 0.4, H * 0.45], [W * 0.8, H * 0.35], [W * 0.3, H * 0.65]];
    tooltips.forEach(([tx, ty], i) => {
      const tP = interpolate(frame, [30 + i * 15, 50 + i * 15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      if (tP > 0) {
        ctx.globalAlpha = a * tP * 0.2; ctx.fillStyle = FB.text.dim;
        ctx.fillRect(tx - 15 * sc, ty - 8 * sc, 30 * sc, 16 * sc);
        ctx.globalAlpha = a * tP * 0.4; ctx.strokeStyle = FB.gold; ctx.lineWidth = 1;
        ctx.strokeRect(tx - 15 * sc, ty - 8 * sc, 30 * sc, 16 * sc);
        drawFBText(ctx, "???", tx, ty, 8 * sc, a * tP, "center", FB.gold);
      }
    });
    drawFBText(ctx, "NO LABELS ON THE MAP", W / 2, H * 0.9, 10 * sc, a, "center", FB.gold);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* V6: Zoom-out reveal — close on one node "?", camera pulls back showing many */
const V6: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame); const a = fadeInOut(frame, DUR);
    const sc = Math.min(W, H) / 360;
    const cx = W / 2, cy = H * 0.4;
    // Zoom scale: starts zoomed in, zooms out
    const zoom = interpolate(frame, [5, 80], [3, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.save(); ctx.translate(cx, cy); ctx.scale(zoom, zoom); ctx.translate(-cx, -cy);
    const rng = seeded(3106);
    for (let i = 0; i < 15; i++) {
      const nx = W * 0.1 + rng() * W * 0.8, ny = H * 0.1 + rng() * H * 0.6;
      drawFBNode(ctx, nx, ny, 5 * sc, i % 8, a * 0.5, frame);
      drawFBText(ctx, "?", nx, ny, 7 * sc, a * 0.6, "center", FB.gold);
      if (i > 0) drawFBEdge(ctx, nx, ny, W * 0.1 + rng() * W * 0.8, H * 0.1 + rng() * H * 0.6, sc, a * 0.1, frame);
      else { rng(); rng(); }
    }
    ctx.restore();
    const labP = interpolate(frame, [90, 120], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "WIRES WITHOUT NAMES", cx, H * 0.88, 11 * sc, a * labP, "center", FB.gold);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* V7: File cabinet — drawers opening to reveal blank labels */
const V7: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame); const a = fadeInOut(frame, DUR);
    const sc = Math.min(W, H) / 360;
    const cx = W / 2;
    drawFBText(ctx, "NEURON CATALOG", cx, H * 0.06, 10 * sc, a, "center", FB.teal);
    // Rows of "drawers"
    for (let i = 0; i < 6; i++) {
      const ry = H * 0.14 + i * H * 0.12;
      const openP = interpolate(frame, [10 + i * 12, 30 + i * 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      // Drawer
      ctx.globalAlpha = a * 0.15; ctx.fillStyle = FB.text.dim;
      ctx.fillRect(W * 0.15, ry, W * 0.7, H * 0.09);
      ctx.globalAlpha = a * 0.3; ctx.strokeStyle = FB.text.dim; ctx.lineWidth = 1;
      ctx.strokeRect(W * 0.15, ry, W * 0.7, H * 0.09);
      // Node icon
      drawFBNode(ctx, W * 0.22, ry + H * 0.045, 5 * sc, i, a * openP * 0.5, frame);
      // Blank label
      const qP = interpolate(frame, [25 + i * 12, 40 + i * 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      drawFBText(ctx, "???", W * 0.5, ry + H * 0.045, 10 * sc, a * qP, "center", FB.gold);
    }
    const labP = interpolate(frame, [100, 125], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "ALL BLANK", cx, H * 0.92, 12 * sc, a * labP, "center", FB.gold);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* V8: Search bar animation — cursor blinks, no results found */
const V8: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame); const a = fadeInOut(frame, DUR);
    const sc = Math.min(W, H) / 360;
    const cx = W / 2;
    // Search bar
    ctx.globalAlpha = a * 0.15; ctx.fillStyle = "#fff";
    ctx.fillRect(W * 0.15, H * 0.15, W * 0.7, H * 0.1);
    ctx.globalAlpha = a * 0.3; ctx.strokeStyle = FB.text.dim; ctx.lineWidth = 1;
    ctx.strokeRect(W * 0.15, H * 0.15, W * 0.7, H * 0.1);
    const query = "neuron #4829";
    const typed = Math.floor(interpolate(frame, [10, 50], [0, query.length], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
    drawFBText(ctx, query.slice(0, typed), W * 0.2, H * 0.2, 10 * sc, a * 0.7, "left", FB.text.primary);
    // Cursor blink
    if (Math.sin(frame * 0.3) > 0 && typed < query.length) {
      ctx.globalAlpha = a * 0.7; ctx.fillStyle = FB.text.primary;
      ctx.fillRect(W * 0.2 + typed * 4.5 * sc, H * 0.2 - 6 * sc, 2, 12 * sc);
    }
    // Results: all "?"
    const resP = interpolate(frame, [55, 85], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    for (let i = 0; i < 5; i++) {
      const ry = H * 0.32 + i * H * 0.1;
      const rP = interpolate(frame, [60 + i * 5, 75 + i * 5], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      drawFBNode(ctx, W * 0.2, ry, 4 * sc, i, a * rP * 0.5, frame);
      drawFBText(ctx, "function: ???", W * 0.3, ry, 8 * sc, a * rP, "left", FB.text.dim);
      drawFBText(ctx, "?", W * 0.75, ry, 10 * sc, a * rP, "center", FB.gold);
    }
    const labP = interpolate(frame, [100, 125], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "NO LABELS FOUND", cx, H * 0.9, 12 * sc, a * labP, "center", FB.gold);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* V9: Fog lifting — network visible but covered in question-mark fog */
const V9: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame); const a = fadeInOut(frame, DUR);
    const sc = Math.min(W, H) / 360;
    const cx = W / 2, cy = H * 0.42;
    // Network barely visible
    const rng = seeded(3109);
    for (let i = 0; i < 15; i++) {
      const nx = W * 0.05 + rng() * W * 0.9, ny = H * 0.05 + rng() * H * 0.7;
      drawFBNode(ctx, nx, ny, 4 * sc, i % 8, a * 0.15, frame);
      if (i > 0) drawFBEdge(ctx, nx, ny, W * 0.05 + rng() * W * 0.9, H * 0.05 + rng() * H * 0.7, sc, a * 0.05, frame);
      else { rng(); rng(); }
    }
    // Floating question marks
    const rng2 = seeded(3110);
    for (let i = 0; i < 12; i++) {
      const qx = rng2() * W, qy = rng2() * H * 0.8;
      const drift = Math.sin(frame * 0.02 + i * 1.5) * 8 * sc;
      const qP = interpolate(frame, [10 + i * 5, 25 + i * 5], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      drawFBText(ctx, "?", qx + drift, qy, (8 + rng2() * 8) * sc, a * qP * 0.5, "center", FB.gold);
    }
    drawFBText(ctx, "THE MAP HAS NO LEGEND", cx, H * 0.9, 10 * sc, a, "center", FB.gold);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

export const VARIANTS_FB_031: VariantDef[] = [
  { id: "fb-031-v1", label: "Network with ? on every node", component: V1 },
  { id: "fb-031-v2", label: "Map grid of nodes, all labeled ?", component: V2 },
  { id: "fb-031-v3", label: "Labels falling off, replaced by ?", component: V3 },
  { id: "fb-031-v4", label: "Giant ? center, network orbiting dim", component: V4 },
  { id: "fb-031-v5", label: "Dense wiring with empty tooltip boxes", component: V5 },
  { id: "fb-031-v6", label: "Zoom-out: close ? reveals many more", component: V6 },
  { id: "fb-031-v7", label: "File cabinet with blank label drawers", component: V7 },
  { id: "fb-031-v8", label: "Search bar: no labels found", component: V8 },
  { id: "fb-031-v9", label: "Fog of question marks over network", component: V9 },
];
