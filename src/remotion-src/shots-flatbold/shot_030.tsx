import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantDef, VariantProps } from "../types";
import { FB, seeded, drawFBBg, drawFBNode, drawFBEdge, drawFBText, drawFBCounter, fadeInOut, cellHSL, drawFBColorEdge, drawPersonBlob, drawIconPerson, drawIconBuilding } from "./flatbold-kit";

/* Shot 030 — "The wiring *is* the algorithm." — 60 frames (2s)
   Bold: WIRING = ALGORITHM equation. */

const DUR = 60;

/* V1: Equation reveal "WIRING = ALGORITHM" */
const V1: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame); const a = fadeInOut(frame, DUR);
    const sc = Math.min(W, H) / 360; const cx = W / 2, cy = H * 0.45;
    const w1 = interpolate(frame, [3, 15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "WIRING", cx * 0.52, cy, 18 * sc, a * w1, "center", FB.teal);
    const eqP = interpolate(frame, [15, 25], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "=", cx, cy, 24 * sc, a * eqP, "center", FB.gold);
    const w2 = interpolate(frame, [22, 35], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "ALGORITHM", cx * 1.52, cy, 18 * sc, a * w2, "center", FB.green);
    if (w2 > 0.5) {
      const pulse = 0.7 + Math.sin(frame * 0.15) * 0.3;
      ctx.globalAlpha = a * pulse * (w2 - 0.5) * 2; ctx.fillStyle = FB.gold;
      ctx.fillRect(W * 0.08, cy + 16 * sc, W * 0.84, 2 * sc); ctx.globalAlpha = 1;
    }
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

/* V2: Brain wiring morphs into code block */
const V2: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame); const a = fadeInOut(frame, DUR);
    const sc = Math.min(W, H) / 360; const cx = W / 2, cy = H * 0.45;
    const morph = interpolate(frame, [8, 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const rng = seeded(3002);
    for (let i = 0; i < 7; i++) {
      const startX = cx + (rng() - 0.5) * W * 0.6, startY = cy + (rng() - 0.5) * H * 0.5;
      const endX = W * 0.15, endY = H * 0.15 + i * H * 0.1;
      const x = startX + (endX - startX) * morph, y = startY + (endY - startY) * morph;
      if (morph < 0.7) drawFBNode(ctx, x, y, (6 - morph * 4) * sc, i % 8, a * 0.8);
      if (morph > 0.3) {
        const codeAlpha = (morph - 0.3) / 0.7;
        const lineW = (40 + rng() * 60) * sc;
        ctx.globalAlpha = a * codeAlpha * 0.5; ctx.fillStyle = FB.teal;
        ctx.fillRect(endX + 5 * sc, endY - 2 * sc, lineW * morph, 3 * sc); ctx.globalAlpha = 1;
      }
    }
    const labelP = interpolate(frame, [35, 50], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "THE WIRING IS THE CODE", cx, H * 0.88, 11 * sc, a * labelP, "center", FB.gold);
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

/* V3: Split brain|code that merges */
const V3: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame); const a = fadeInOut(frame, DUR);
    const sc = Math.min(W, H) / 360; const cx = W / 2, cy = H * 0.45;
    const mergeP = interpolate(frame, [20, 42], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const divX = cx + (W * 0.6) * mergeP;
    if (mergeP < 0.8) {
      drawFBText(ctx, "WIRING", W * 0.25, H * 0.1, 10 * sc, a * (1 - mergeP), "center", FB.teal);
      drawFBText(ctx, "ALGORITHM", W * 0.75, H * 0.1, 10 * sc, a * (1 - mergeP), "center", FB.green);
    }
    if (mergeP < 1) {
      ctx.globalAlpha = a * (1 - mergeP) * 0.3; ctx.strokeStyle = FB.text.dim; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(divX, H * 0.05); ctx.lineTo(divX, H * 0.85); ctx.stroke();
    }
    const rng = seeded(3003);
    for (let i = 0; i < 6; i++) {
      const nx = W * 0.12 + rng() * W * 0.25, ny = H * 0.2 + rng() * H * 0.5;
      drawFBNode(ctx, nx, ny, 4 * sc, i, a * 0.6);
    }
    for (let i = 0; i < 5; i++) {
      const ly = H * 0.22 + i * H * 0.12, lw = (25 + rng() * 55) * sc;
      ctx.globalAlpha = a * 0.4; ctx.fillStyle = FB.green; ctx.fillRect(W * 0.58, ly, lw, 3 * sc);
    }
    if (mergeP > 0.6) drawFBText(ctx, "SAME THING", cx, H * 0.88, 14 * sc, a * ((mergeP - 0.6) / 0.4), "center", FB.gold);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

/* V4: Giant "=" sign animation growing, network left, code right */
const V4: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame); const a = fadeInOut(frame, DUR);
    const sc = Math.min(W, H) / 360; const cx = W / 2, cy = H * 0.42;
    const eqScale = interpolate(frame, [5, 30], [0.1, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const barH = 5 * sc * eqScale, barW = W * 0.5 * eqScale, gap = 10 * sc * eqScale;
    ctx.globalAlpha = a; ctx.fillStyle = FB.gold;
    ctx.fillRect(cx - barW / 2, cy - gap, barW, barH);
    ctx.fillRect(cx - barW / 2, cy + gap - barH, barW, barH);
    const labP = interpolate(frame, [28, 45], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const rng = seeded(3004);
    for (let i = 0; i < 4; i++) drawFBNode(ctx, W * 0.08 + rng() * W * 0.12, cy - H * 0.1 + rng() * H * 0.2, 3 * sc, i, a * labP * 0.6);
    if (labP > 0) {
      ctx.globalAlpha = a * labP * 0.6; ctx.strokeStyle = FB.green; ctx.lineWidth = 2 * sc;
      ctx.beginPath(); ctx.moveTo(W * 0.82, cy - 15 * sc); ctx.lineTo(W * 0.78, cy - 15 * sc);
      ctx.lineTo(W * 0.78, cy + 15 * sc); ctx.lineTo(W * 0.82, cy + 15 * sc); ctx.stroke();
      for (let i = 0; i < 3; i++) {
        ctx.globalAlpha = a * labP * 0.4; ctx.fillStyle = FB.green;
        ctx.fillRect(W * 0.84, cy - 10 * sc + i * 10 * sc, (20 + i * 8) * sc, 2 * sc);
      }
    }
    drawFBText(ctx, "WIRING IS THE ALGORITHM", cx, H * 0.85, 11 * sc, a * labP, "center", FB.text.primary);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

/* V5: Network overlay on code text — they merge together */
const V5: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame); const a = fadeInOut(frame, DUR);
    const sc = Math.min(W, H) / 360; const cx = W / 2;
    const codeP = interpolate(frame, [3, 18], [0, 1], { extrapolateRight: "clamp" });
    ["if spike(n):", "  for w in syn:", "    post += w", "  if V > thr:", "    fire()"].forEach((line, i) => {
      drawFBText(ctx, line, W * 0.15, H * 0.15 + i * 14 * sc, 9 * sc, a * codeP * 0.3, "left", FB.green);
    });
    const netP = interpolate(frame, [12, 35], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const rng = seeded(3005); const nodes: { x: number; y: number }[] = [];
    for (let i = 0; i < 8; i++) {
      const nx = W * 0.15 + rng() * W * 0.7, ny = H * 0.12 + rng() * H * 0.6;
      nodes.push({ x: nx, y: ny }); drawFBNode(ctx, nx, ny, 5 * sc, i, a * netP * 0.7);
    }
    for (let i = 1; i < nodes.length; i++) drawFBEdge(ctx, nodes[i - 1].x, nodes[i - 1].y, nodes[i].x, nodes[i].y, sc, a * netP * 0.2, frame);
    const sameP = interpolate(frame, [35, 50], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "THEY ARE THE SAME", cx, H * 0.88, 13 * sc, a * sameP, "center", FB.gold);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

/* V6: Bold text slam word by word */
const V6: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame); const a = fadeInOut(frame, DUR);
    const sc = Math.min(W, H) / 360; const cx = W / 2;
    const words = [
      { text: "THE", y: H * 0.2, size: 14, color: FB.text.dim, start: 3 },
      { text: "WIRING", y: H * 0.35, size: 20, color: FB.teal, start: 8 },
      { text: "IS", y: H * 0.5, size: 26, color: FB.gold, start: 16 },
      { text: "THE", y: H * 0.62, size: 14, color: FB.text.dim, start: 22 },
      { text: "ALGORITHM", y: H * 0.78, size: 18, color: FB.green, start: 26 },
    ];
    words.forEach(w => {
      const p = interpolate(frame, [w.start, w.start + 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const scale = p > 0 ? 1 + Math.max(0, (1 - (frame - w.start - 4) / 6)) * 0.2 : 0;
      if (p > 0) drawFBText(ctx, w.text, cx, w.y, w.size * sc * Math.min(1.2, scale), a * p, "center", w.color);
    });
    const rng = seeded(3006);
    for (let i = 0; i < 10; i++) drawFBNode(ctx, rng() * W, rng() * H, 1.5 * sc, 7, a * 0.06);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

/* V7: Brain outline becoming curly braces */
const V7: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame); const a = fadeInOut(frame, DUR);
    const sc = Math.min(W, H) / 360; const cx = W / 2, cy = H * 0.45;
    const morph = interpolate(frame, [5, 35], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const brainW = W * 0.35 * (1 - morph * 0.4), brainH = H * 0.4;
    const r1 = 78, g1 = 205, b1 = 196, r2 = 110, g2 = 221, b2 = 138;
    ctx.globalAlpha = a * 0.8;
    ctx.strokeStyle = `rgb(${Math.round(r1 + (r2 - r1) * morph)},${Math.round(g1 + (g2 - g1) * morph)},${Math.round(b1 + (b2 - b1) * morph)})`;
    ctx.lineWidth = 2.5 * sc; ctx.lineCap = "round";
    const indent = morph * 8 * sc;
    ctx.beginPath(); ctx.moveTo(cx - 2 * sc, cy - brainH / 2);
    ctx.quadraticCurveTo(cx - brainW / 2 - indent, cy - brainH / 4, cx - brainW / 2, cy);
    ctx.quadraticCurveTo(cx - brainW / 2 - indent, cy + brainH / 4, cx - 2 * sc, cy + brainH / 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx + 2 * sc, cy - brainH / 2);
    ctx.quadraticCurveTo(cx + brainW / 2 + indent, cy - brainH / 4, cx + brainW / 2, cy);
    ctx.quadraticCurveTo(cx + brainW / 2 + indent, cy + brainH / 4, cx + 2 * sc, cy + brainH / 2); ctx.stroke();
    if (morph > 0.4) {
      const lineA = (morph - 0.4) / 0.6;
      for (let i = 0; i < 3; i++) {
        const ly = cy - 12 * sc + i * 12 * sc, lw = (15 + i * 10) * sc;
        ctx.globalAlpha = a * lineA * 0.4; ctx.fillStyle = FB.green;
        ctx.fillRect(cx - lw / 2, ly, lw, 2 * sc);
      }
    }
    const labP = interpolate(frame, [38, 52], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "WIRING = ALGORITHM", cx, H * 0.88, 12 * sc, a * labP, "center", FB.gold);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

/* V8: Circuit == algorithm comparison */
const V8: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame); const a = fadeInOut(frame, DUR);
    const sc = Math.min(W, H) / 360; const cx = W / 2, cy = H * 0.42;
    const circP = interpolate(frame, [3, 18], [0, 1], { extrapolateRight: "clamp" });
    const cNodes = [{ x: W * 0.12, y: cy - 15 * sc }, { x: W * 0.22, y: cy }, { x: W * 0.12, y: cy + 15 * sc }, { x: W * 0.28, y: cy - 10 * sc }];
    cNodes.forEach((n, i) => drawFBNode(ctx, n.x, n.y, 4 * sc, i, a * circP * 0.7));
    drawFBEdge(ctx, cNodes[0].x, cNodes[0].y, cNodes[1].x, cNodes[1].y, sc, a * circP * 0.3, frame);
    drawFBEdge(ctx, cNodes[2].x, cNodes[2].y, cNodes[1].x, cNodes[1].y, sc, a * circP * 0.3, frame);
    drawFBEdge(ctx, cNodes[1].x, cNodes[1].y, cNodes[3].x, cNodes[3].y, sc, a * circP * 0.3, frame);
    const eqP = interpolate(frame, [15, 28], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "==", cx, cy, 22 * sc, a * eqP, "center", FB.gold);
    const algP = interpolate(frame, [22, 38], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ["w*x + b", "if > thr", "spike()"].forEach((l, i) => {
      drawFBText(ctx, l, W * 0.78, cy - 12 * sc + i * 12 * sc, 8 * sc, a * algP * 0.6, "center", FB.green);
    });
    const resP = interpolate(frame, [38, 52], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "// TRUE", cx, H * 0.72, 12 * sc, a * resP, "center", FB.green);
    drawFBText(ctx, "NO SEPARATE PROGRAM", cx, H * 0.88, 9 * sc, a * resP, "center", FB.text.dim);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

/* V9: Tangled wire becoming structured flow */
const V9: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame); const a = fadeInOut(frame, DUR);
    const sc = Math.min(W, H) / 360; const cx = W / 2;
    const orderP = interpolate(frame, [5, 35], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const rng = seeded(3009);
    for (let i = 0; i < 4; i++) {
      const iy = H * 0.15 + i * H * 0.18;
      drawFBNode(ctx, W * 0.1, iy, 4 * sc, i, a * 0.7);
      const tangleAmp = (1 - orderP) * 30 * sc;
      ctx.globalAlpha = a * 0.3; ctx.strokeStyle = FB.colors[i % FB.colors.length]; ctx.lineWidth = 1.5 * sc;
      ctx.beginPath(); ctx.moveTo(W * 0.14, iy);
      for (let s = 1; s <= 20; s++) {
        const t = s / 20;
        ctx.lineTo(W * 0.14 + t * W * 0.72, iy + Math.sin(t * 8 + i * 2 + rng()) * tangleAmp);
      }
      ctx.stroke();
      drawFBNode(ctx, W * 0.9, iy, 4 * sc, i + 4, a * 0.7);
    }
    const labP = interpolate(frame, [32, 48], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "THE WIRES ARE THE PROGRAM", cx, H * 0.88, 11 * sc, a * labP, "center", FB.gold);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

export const VARIANTS_FB_030: VariantDef[] = [
  { id: "fb-030-v1", label: "Equation reveal WIRING = ALGORITHM", component: V1 },
  { id: "fb-030-v2", label: "Brain wiring morphs into code block", component: V2 },
  { id: "fb-030-v3", label: "Split brain|code that merges", component: V3 },
  { id: "fb-030-v4", label: "Giant equals sign animation", component: V4 },
  { id: "fb-030-v5", label: "Network overlay on code text", component: V5 },
  { id: "fb-030-v6", label: "Bold text slam word by word", component: V6 },
  { id: "fb-030-v7", label: "Brain outline becoming curly braces", component: V7 },
  { id: "fb-030-v8", label: "Circuit == algorithm comparison", component: V8 },
  { id: "fb-030-v9", label: "Tangled wire becoming structured flow", component: V9 },
];
