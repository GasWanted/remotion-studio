import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantDef, VariantProps } from "../types";
import { FB, seeded, drawFBBg, drawFBNode, drawFBEdge, drawFBText, drawFBCounter, fadeInOut, cellHSL, drawFBColorEdge, drawPersonBlob, drawIconPerson, drawIconBuilding } from "./flatbold-kit";

/* Shot 028 — "Six different behaviors—from grooming to escaping danger—emerged
   entirely from the structure of those connections." — 210 frames (7s)
   6 behavior icons pop from central network. */

const DUR = 210;

function accent(i: number) { return FB.colors[i % FB.colors.length]; }

const BEHAVIORS = [
  { label: "FEED", icon: "\u2764", color: FB.colors[0] },     // heart
  { label: "ESCAPE", icon: "\u26A1", color: FB.colors[1] },   // lightning
  { label: "GROOM", icon: "\u270B", color: FB.colors[2] },    // hand
  { label: "WALK", icon: "\u27A1", color: FB.colors[3] },     // arrow
  { label: "TURN", icon: "\u21BB", color: FB.colors[4] },     // rotate
  { label: "IDLE", icon: "\u23F8", color: FB.colors[5] },     // pause
];

/* V1: Central network, 6 icons pop out radially with stagger */
const V1: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame); const a = fadeInOut(frame, DUR);
    const sc = Math.min(W, H) / 360;
    const cx = W / 2, cy = H * 0.42;
    // Central network blob
    const netP = interpolate(frame, [5, 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const rng = seeded(2801);
    for (let i = 0; i < 8; i++) {
      const nx = cx + (rng() - 0.5) * W * 0.25, ny = cy + (rng() - 0.5) * H * 0.2;
      drawFBNode(ctx, nx, ny, 4 * sc, i, a * netP * 0.5, frame);
      if (i > 0) drawFBEdge(ctx, nx, ny, cx + (rng() - 0.5) * W * 0.25, cy + (rng() - 0.5) * H * 0.2, sc, a * netP * 0.15, frame);
      else { rng(); rng(); }
    }
    // 6 behaviors popping out
    BEHAVIORS.forEach((b, i) => {
      const angle = (i / 6) * Math.PI * 2 - Math.PI / 2;
      const dist = Math.min(W, H) * 0.33;
      const bP = interpolate(frame, [50 + i * 18, 70 + i * 18], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const bx = cx + Math.cos(angle) * dist * bP;
      const by = cy + Math.sin(angle) * dist * bP;
      if (bP > 0) {
        drawFBNode(ctx, bx, by, 10 * sc, i, a * bP, frame);
        drawFBText(ctx, b.label, bx, by + 15 * sc, 7 * sc, a * bP, "center", b.color);
        // Connection line back to center
        drawFBColorEdge(ctx, cx, cy, bx, by, b.color, sc, a * bP * 0.3);
      }
    });
    drawFBText(ctx, "6 BEHAVIORS", cx, H * 0.92, 10 * sc, a, "center", FB.gold);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* V2: Grid layout — 2x3 grid, each cell lights up with behavior name */
const V2: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame); const a = fadeInOut(frame, DUR);
    const sc = Math.min(W, H) / 360;
    drawFBText(ctx, "FROM WIRING ALONE:", W / 2, H * 0.06, 9 * sc, a, "center", FB.gold);
    const cols = 3, rows = 2;
    const cellW = W * 0.28, cellH = H * 0.35;
    const x0 = W / 2 - (cols * cellW) / 2, y0 = H * 0.14;
    BEHAVIORS.forEach((b, i) => {
      const col = i % cols, row = Math.floor(i / cols);
      const cx = x0 + col * cellW + cellW / 2, cy = y0 + row * cellH + cellH / 2;
      const bP = interpolate(frame, [20 + i * 20, 45 + i * 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      // Cell background
      ctx.globalAlpha = a * bP * 0.08; ctx.fillStyle = b.color;
      ctx.fillRect(x0 + col * cellW + 2, y0 + row * cellH + 2, cellW - 4, cellH - 4);
      ctx.globalAlpha = a * bP * 0.3; ctx.strokeStyle = b.color; ctx.lineWidth = 1 * sc;
      ctx.strokeRect(x0 + col * cellW + 2, y0 + row * cellH + 2, cellW - 4, cellH - 4);
      // Blob node
      drawFBNode(ctx, cx, cy - 8 * sc, 10 * sc, i, a * bP, frame);
      // Label
      drawFBText(ctx, b.label, cx, cy + 15 * sc, 10 * sc, a * bP, "center", b.color);
    });
    const allP = interpolate(frame, [160, 185], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "ALL FROM STRUCTURE", W / 2, H * 0.92, 10 * sc, a * allP, "center", FB.gold);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* V3: Ticker tape — behaviors scroll in from right one by one */
const V3: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame); const a = fadeInOut(frame, DUR);
    const sc = Math.min(W, H) / 360;
    // Central network always visible
    const rng = seeded(2803);
    for (let i = 0; i < 6; i++) {
      const nx = W * 0.35 + rng() * W * 0.3, ny = H * 0.3 + rng() * H * 0.4;
      drawFBNode(ctx, nx, ny, 4 * sc, i, a * 0.3, frame);
      if (i > 0) drawFBEdge(ctx, nx, ny, W * 0.35 + rng() * W * 0.3, H * 0.3 + rng() * H * 0.4, sc, a * 0.1, frame);
      else { rng(); rng(); }
    }
    // Each behavior slides in from right
    BEHAVIORS.forEach((b, i) => {
      const slideP = interpolate(frame, [20 + i * 25, 45 + i * 25], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const bx = interpolate(slideP, [0, 1], [W * 1.1, W * 0.82], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const by = H * 0.12 + i * H * 0.13;
      drawFBNode(ctx, bx - 12 * sc, by, 6 * sc, i, a * slideP, frame);
      drawFBText(ctx, b.label, bx, by, 10 * sc, a * slideP, "left", b.color);
    });
    drawFBText(ctx, "EMERGED FROM WIRING", W / 2, H * 0.94, 9 * sc, a, "center", FB.gold);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* V4: Flower bloom — central node, 6 petals grow out as behaviors */
const V4: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame); const a = fadeInOut(frame, DUR);
    const sc = Math.min(W, H) / 360;
    const cx = W / 2, cy = H * 0.45;
    drawFBNode(ctx, cx, cy, 15 * sc, 4, a, frame);
    BEHAVIORS.forEach((b, i) => {
      const angle = (i / 6) * Math.PI * 2 - Math.PI / 2;
      const growP = interpolate(frame, [30 + i * 15, 60 + i * 15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const dist = Math.min(W, H) * 0.3 * growP;
      const bx = cx + Math.cos(angle) * dist, by = cy + Math.sin(angle) * dist;
      // Petal path
      if (growP > 0) {
        ctx.globalAlpha = a * growP * 0.15;
        const [hue, sat, lit] = cellHSL(i);
        const petalGrad = ctx.createRadialGradient(bx, by, 0, bx, by, 18 * sc);
        petalGrad.addColorStop(0, `hsla(${hue},${sat}%,${lit}%,0.4)`);
        petalGrad.addColorStop(1, `hsla(${hue},${sat}%,${lit}%,0)`);
        ctx.fillStyle = petalGrad;
        ctx.beginPath(); ctx.arc(bx, by, 18 * sc, 0, Math.PI * 2); ctx.fill();
        drawFBNode(ctx, bx, by, 8 * sc, i, a * growP, frame);
        drawFBColorEdge(ctx, cx, cy, bx, by, b.color, sc, a * growP * 0.4);
        drawFBText(ctx, b.label, bx, by + 14 * sc, 7 * sc, a * growP, "center", b.color);
      }
    });
    drawFBText(ctx, "6 BEHAVIORS EMERGED", cx, H * 0.92, 9 * sc, a, "center", FB.gold);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* V5: Counter + icons — "1...2...3...4...5...6" with icons appearing */
const V5: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame); const a = fadeInOut(frame, DUR);
    const sc = Math.min(W, H) / 360;
    const cx = W / 2;
    // Counting number
    const count = Math.min(6, Math.floor(interpolate(frame, [20, 160], [0, 6.99], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })));
    drawFBCounter(ctx, count, cx, H * 0.2, 28 * sc, FB.gold, a);
    drawFBText(ctx, "BEHAVIORS", cx, H * 0.32, 10 * sc, a, "center", FB.text.dim);
    // Icons appearing below
    BEHAVIORS.forEach((b, i) => {
      if (i < count) {
        const bP = interpolate(frame, [25 + i * 23, 35 + i * 23], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        const bx = W * 0.1 + (i % 3) * W * 0.3 + W * 0.15;
        const by = i < 3 ? H * 0.5 : H * 0.72;
        drawFBNode(ctx, bx, by - 8 * sc, 8 * sc, i, a * bP, frame);
        drawFBText(ctx, b.label, bx, by + 10 * sc, 8 * sc, a * bP, "center", b.color);
      }
    });
    const doneP = interpolate(frame, [170, 195], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "ALL FROM CONNECTIONS", cx, H * 0.92, 9 * sc, a * doneP, "center", FB.gold);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* V6: Branching tree — single root splits into 6 leaf behaviors */
const V6: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame); const a = fadeInOut(frame, DUR);
    const sc = Math.min(W, H) / 360;
    const cx = W / 2;
    // Root
    const rootP = interpolate(frame, [5, 25], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBNode(ctx, cx, H * 0.12, 10 * sc, 4, a * rootP, frame);
    drawFBText(ctx, "STRUCTURE", cx, H * 0.05, 8 * sc, a * rootP, "center", FB.gold);
    // Branches
    BEHAVIORS.forEach((b, i) => {
      const brP = interpolate(frame, [30 + i * 18, 55 + i * 18], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const bx = W * 0.08 + i * W * 0.15 + W * 0.07;
      const by = H * 0.65;
      if (brP > 0) {
        drawFBColorEdge(ctx, cx, H * 0.18, bx, by - 10 * sc, b.color, sc, a * brP * 0.4);
        drawFBNode(ctx, bx, by, 8 * sc, i, a * brP, frame);
        drawFBText(ctx, b.label, bx, by + 14 * sc, 7 * sc, a * brP, "center", b.color);
      }
    });
    const doneP = interpolate(frame, [170, 195], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "EMERGED FROM WIRING ALONE", cx, H * 0.92, 9 * sc, a * doneP, "center", FB.gold);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* V7: Dominos — one activation cascades into 6 different paths */
const V7: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame); const a = fadeInOut(frame, DUR);
    const sc = Math.min(W, H) / 360;
    // Left: activation pulse
    const pulseP = interpolate(frame, [5, 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBNode(ctx, W * 0.08, H / 2, 12 * sc, 4, a * pulseP, frame);
    if (pulseP > 0.5) {
      ctx.globalAlpha = a * (pulseP - 0.5) * 0.3; ctx.fillStyle = FB.gold;
      ctx.beginPath(); ctx.arc(W * 0.08, H / 2, 20 * sc, 0, Math.PI * 2); ctx.fill();
    }
    // Right: 6 behavior end-points
    BEHAVIORS.forEach((b, i) => {
      const bP = interpolate(frame, [30 + i * 22, 55 + i * 22], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const by = H * 0.08 + i * H * 0.15;
      const bx = W * 0.85;
      // Traveling pulse
      const pulseDist = bP;
      const px = W * 0.08 + (bx - W * 0.08) * pulseDist;
      if (bP > 0 && bP < 1) {
        ctx.globalAlpha = a * 0.6; ctx.fillStyle = b.color;
        ctx.beginPath(); ctx.arc(px, H / 2 + (by - H / 2) * pulseDist, 3 * sc, 0, Math.PI * 2); ctx.fill();
      }
      drawFBColorEdge(ctx, W * 0.08, H / 2, bx, by, b.color, sc, a * bP * 0.2);
      if (bP >= 1) {
        drawFBNode(ctx, bx, by, 7 * sc, i, a, frame);
        drawFBText(ctx, b.label, bx - 20 * sc, by, 7 * sc, a, "right", b.color);
      }
    });
    drawFBText(ctx, "ONE STRUCTURE, SIX OUTPUTS", W / 2, H * 0.95, 8 * sc, a, "center", FB.gold);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* V8: Hexagonal arrangement — behaviors at vertices of a hexagon */
const V8: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame); const a = fadeInOut(frame, DUR);
    const sc = Math.min(W, H) / 360;
    const cx = W / 2, cy = H * 0.45;
    const radius = Math.min(W, H) * 0.32;
    // Central cluster
    const cP = interpolate(frame, [5, 25], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    for (let i = 0; i < 5; i++) drawFBNode(ctx, cx + (i - 2) * 8 * sc, cy + Math.sin(i) * 6 * sc, 3 * sc, 7, a * cP * 0.3);
    // Hexagon vertices
    BEHAVIORS.forEach((b, i) => {
      const angle = (i / 6) * Math.PI * 2 - Math.PI / 2;
      const bP = interpolate(frame, [35 + i * 20, 60 + i * 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const bx = cx + Math.cos(angle) * radius, by = cy + Math.sin(angle) * radius;
      if (bP > 0) {
        // Edge to center
        drawFBColorEdge(ctx, cx, cy, bx, by, b.color, sc, a * bP * 0.3);
        // Edge to neighbors
        const nextAngle = ((i + 1) % 6 / 6) * Math.PI * 2 - Math.PI / 2;
        drawFBColorEdge(ctx, bx, by, cx + Math.cos(nextAngle) * radius, cy + Math.sin(nextAngle) * radius, b.color, sc, a * bP * 0.15);
        drawFBNode(ctx, bx, by, 9 * sc, i, a * bP, frame);
        drawFBText(ctx, b.label, bx, by + (Math.sin(angle) > 0 ? 14 : -14) * sc, 7 * sc, a * bP, "center", b.color);
      }
    });
    drawFBText(ctx, "STRUCTURE \u2192 BEHAVIOR", cx, H * 0.93, 9 * sc, a, "center", FB.gold);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* V9: Stacked reveal — each behavior word drops in with its own accent glow */
const V9: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame); const a = fadeInOut(frame, DUR);
    const sc = Math.min(W, H) / 360;
    const cx = W / 2;
    drawFBText(ctx, "SIX BEHAVIORS", cx, H * 0.06, 10 * sc, a, "center", FB.gold);
    BEHAVIORS.forEach((b, i) => {
      const dropP = interpolate(frame, [20 + i * 22, 40 + i * 22], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const by = H * 0.16 + i * H * 0.12;
      const dropY = interpolate(dropP, [0, 1], [by - 20 * sc, by], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      if (dropP > 0) {
        // Glow bar
        const [hue, sat, lit] = cellHSL(i);
        ctx.globalAlpha = a * dropP * 0.1; ctx.fillStyle = b.color;
        ctx.fillRect(W * 0.1, dropY - 6 * sc, W * 0.8, 12 * sc);
        drawFBNode(ctx, W * 0.15, dropY, 6 * sc, i, a * dropP, frame);
        drawFBText(ctx, b.label, W * 0.25, dropY, 12 * sc, a * dropP, "left", b.color);
      }
    });
    const doneP = interpolate(frame, [165, 195], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "ALL FROM CONNECTIONS", cx, H * 0.93, 9 * sc, a * doneP, "center", FB.gold);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

export const VARIANTS_FB_028: VariantDef[] = [
  { id: "fb-028-v1", label: "Central network, 6 icons pop radially", component: V1 },
  { id: "fb-028-v2", label: "2x3 grid cells light up with behavior names", component: V2 },
  { id: "fb-028-v3", label: "Ticker tape: behaviors slide in from right", component: V3 },
  { id: "fb-028-v4", label: "Flower bloom: petals grow as behaviors", component: V4 },
  { id: "fb-028-v5", label: "Counter 1-6 with icons appearing", component: V5 },
  { id: "fb-028-v6", label: "Branching tree: root splits into 6 leaves", component: V6 },
  { id: "fb-028-v7", label: "Domino cascade into 6 different paths", component: V7 },
  { id: "fb-028-v8", label: "Hexagonal arrangement at vertices", component: V8 },
  { id: "fb-028-v9", label: "Stacked reveal: words drop in with glow", component: V9 },
];
