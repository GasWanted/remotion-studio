import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantDef, VariantProps } from "../types";
import { FB, seeded, drawFBBg, drawFBNode, drawFBEdge, drawFBText, drawFBCounter, fadeInOut, cellHSL, drawFBColorEdge } from "./flatbold-kit";

/* Shot 61 — "This is where it got difficult. I tried scrambling random
   connections at first, but the brain exploded." — 180 frames (6s) */

// ---------- V1: random edits scatter across network, then nodes flash red and die ----------
const V1: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 180);
    const s = Math.min(W, H) / 360;
    const rng = seeded(6100);
    // Network nodes
    const nodes: [number, number][] = [];
    for (let i = 0; i < 10; i++) nodes.push([W * 0.1 + rng() * W * 0.8, H * 0.15 + rng() * H * 0.5]);
    // Phase 1: calm network (0-50)
    const calmP = interpolate(frame, [5, 30], [0, 1], { extrapolateRight: "clamp" });
    // Phase 2: random edits appear (50-90)
    const editP = interpolate(frame, [50, 90], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    // Phase 3: explosion (90-140)
    const boomP = interpolate(frame, [90, 130], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    // Edges
    const rng2 = seeded(6101);
    for (let i = 0; i < 15; i++) {
      const fi = Math.floor(rng2() * 10), ti = Math.floor(rng2() * 10);
      if (fi === ti) continue;
      const shake = boomP * (rng2() - 0.5) * 20 * s;
      const col = editP > 0 && rng2() > 0.5 ? FB.red : FB.text.dim;
      drawFBColorEdge(ctx, nodes[fi][0] + shake, nodes[fi][1] + shake, nodes[ti][0] - shake, nodes[ti][1] - shake, col, s * 0.5, a * calmP * (1 - boomP * 0.7));
    }
    // Nodes shake and turn red during explosion
    nodes.forEach(([x, y], i) => {
      const shake = boomP * Math.sin(frame * 0.5 + i) * 8 * s;
      const nodeAlpha = 1 - boomP * 0.6;
      drawFBNode(ctx, x + shake, y + shake, 6 * s, boomP > 0.3 ? 0 : i % 8, a * calmP * nodeAlpha, frame);
    });
    // "SCRAMBLE" text during edit phase
    if (editP > 0 && boomP < 0.5) {
      drawFBText(ctx, "SCRAMBLING...", W / 2, H * 0.78, 10 * s, a * editP, "center", FB.gold);
    }
    // Explosion flash
    if (boomP > 0.2 && boomP < 0.8) {
      ctx.globalAlpha = a * (1 - Math.abs(boomP - 0.5) * 3) * 0.3;
      ctx.fillStyle = FB.red;
      ctx.fillRect(0, 0, W, H);
    }
    // "EXPLODED" text
    const explP = interpolate(frame, [130, 155], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "BRAIN EXPLODED", W / 2, H * 0.85, 14 * s, a * explP, "center", FB.red);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V2: weight values scrambling into garbage, activity spikes off chart ----------
const V2: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 180);
    const s = Math.min(W, H) / 360;
    const rng = seeded(6120);
    // Activity chart baseline
    const chartY = H * 0.35, chartH = H * 0.3;
    ctx.globalAlpha = a * 0.2; ctx.strokeStyle = FB.text.dim; ctx.lineWidth = 1 * s;
    ctx.beginPath(); ctx.moveTo(W * 0.05, chartY + chartH); ctx.lineTo(W * 0.95, chartY + chartH); ctx.stroke();
    drawFBText(ctx, "NEURAL ACTIVITY", W / 2, chartY - 10 * s, 8 * s, a, "center", FB.text.dim);
    // Draw activity line — calm then exploding
    const scrambleStart = 60;
    ctx.beginPath();
    ctx.moveTo(W * 0.05, chartY + chartH * 0.5);
    for (let x = 0; x < 50; x++) {
      const px = W * 0.05 + (x / 50) * W * 0.9;
      const frameAtX = (x / 50) * 180;
      const revealP = interpolate(frame, [frameAtX - 5, frameAtX + 5], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      if (revealP <= 0) break;
      const calm = Math.sin(x * 0.5) * 0.1;
      const chaos = frameAtX > scrambleStart ? Math.sin(x * 3 + frame * 0.2) * Math.min(1, (frameAtX - scrambleStart) / 40) : 0;
      const val = calm + chaos;
      const py = chartY + chartH * (0.5 - val * 0.45);
      ctx.lineTo(px, Math.max(chartY, Math.min(chartY + chartH, py)));
    }
    ctx.globalAlpha = a; ctx.strokeStyle = frame > 90 ? FB.red : FB.teal; ctx.lineWidth = 2 * s;
    ctx.stroke();
    // "SCRAMBLE" marker
    const scrP = interpolate(frame, [55, 70], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "RANDOM EDITS", W * 0.3, chartY + chartH + 15 * s, 7 * s, a * scrP, "center", FB.gold);
    // Explosion label
    const boomP = interpolate(frame, [110, 140], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "OFF THE CHARTS", W * 0.7, chartY - 5 * s, 9 * s, a * boomP, "center", FB.red);
    drawFBText(ctx, "BRAIN EXPLODED", W / 2, H * 0.85, 13 * s, a * boomP, "center", FB.red);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V3: dice rolling onto network = random, then shatter ----------
const V3: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 180);
    const s = Math.min(W, H) / 360;
    const cx = W / 2, cy = H * 0.35;
    // Brain node
    drawFBNode(ctx, cx, cy, 22 * s, 6, a, frame);
    drawFBText(ctx, "BRAIN", cx, cy, 8 * s, a * 0.7, "center", FB.bg);
    // Random dice falling in
    const diceP = interpolate(frame, [20, 60], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const rng = seeded(613);
    for (let i = 0; i < 5; i++) {
      const dx = cx + (rng() - 0.5) * 60 * s;
      const dy = cy - 40 * s + diceP * 35 * s + rng() * 10 * s;
      const dSize = 8 * s;
      const rot = frame * 0.05 + i * 1.2;
      ctx.save(); ctx.translate(dx, dy); ctx.rotate(rot);
      ctx.globalAlpha = a * diceP; ctx.strokeStyle = FB.gold; ctx.lineWidth = 1.5 * s;
      ctx.strokeRect(-dSize / 2, -dSize / 2, dSize, dSize);
      // Dots
      ctx.fillStyle = FB.gold;
      ctx.beginPath(); ctx.arc(0, 0, 1.5 * s, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }
    if (diceP > 0.3) drawFBText(ctx, "RANDOM EDITS", cx, cy - 30 * s, 8 * s, a * diceP, "center", FB.gold);
    // Shatter phase
    const shatterP = interpolate(frame, [80, 130], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (shatterP > 0) {
      const rng3 = seeded(6133);
      for (let i = 0; i < 12; i++) {
        const angle = rng3() * Math.PI * 2;
        const dist = shatterP * 60 * s;
        const fx = cx + Math.cos(angle) * dist;
        const fy = cy + Math.sin(angle) * dist;
        drawFBNode(ctx, fx, fy, 3 * s, 0, a * (1 - shatterP) * 0.6, frame);
      }
    }
    const labelP = interpolate(frame, [130, 160], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "BRAIN EXPLODED", cx, H * 0.82, 14 * s, a * labelP, "center", FB.red);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V4: weights spinning to random values, "NaN" errors appear ----------
const V4: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 180);
    const s = Math.min(W, H) / 360;
    const rng = seeded(6140);
    // Spinning weight counters
    const nWeights = 6;
    for (let i = 0; i < nWeights; i++) {
      const x = W * 0.12 + (i % 3) * W * 0.3;
      const y = H * 0.2 + Math.floor(i / 3) * H * 0.22;
      const scrambleP = interpolate(frame, [30, 80], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const nanP = interpolate(frame, [100, 120], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      if (nanP > 0.5) {
        drawFBText(ctx, "NaN", x, y, 12 * s, a * nanP, "center", FB.red);
      } else {
        const base = Math.round((rng() - 0.5) * 500);
        const spinVal = base + Math.round(Math.sin(frame * 0.3 + i * 2) * scrambleP * 9999);
        drawFBCounter(ctx, spinVal, x, y, 10 * s, scrambleP > 0.5 ? FB.red : FB.teal, a);
      }
    }
    // Error messages
    const errP = interpolate(frame, [110, 140], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "RuntimeError: NaN detected", W / 2, H * 0.7, 8 * s, a * errP, "center", FB.red);
    drawFBText(ctx, "BRAIN EXPLODED", W / 2, H * 0.85, 14 * s, a * errP, "center", FB.red);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V5: calm network, hand reaches in and scrambles, everything breaks ----------
const V5: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 180);
    const s = Math.min(W, H) / 360;
    const rng = seeded(615);
    // 8 calm nodes
    const nodes: [number, number][] = [];
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      nodes.push([W / 2 + Math.cos(angle) * 40 * s, H * 0.38 + Math.sin(angle) * 35 * s]);
    }
    const boomP = interpolate(frame, [80, 120], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    // Edges
    for (let i = 0; i < 8; i++) {
      const ni = (i + 1) % 8;
      const shake = boomP * Math.sin(frame * 0.6 + i) * 12 * s;
      drawFBColorEdge(ctx, nodes[i][0] + shake, nodes[i][1], nodes[ni][0], nodes[ni][1] + shake, boomP > 0.3 ? FB.red : FB.teal, s * 0.5, a * (1 - boomP * 0.5));
    }
    nodes.forEach(([x, y], i) => {
      const shake = boomP * Math.sin(frame * 0.4 + i * 0.8) * 10 * s;
      drawFBNode(ctx, x + shake, y + shake, 7 * s, boomP > 0.4 ? 0 : (i + 2) % 8, a * (1 - boomP * 0.4), frame);
    });
    // Cursor reaching in
    const cursorP = interpolate(frame, [30, 55], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (cursorP > 0 && boomP < 0.5) {
      const curX = W * 0.85 - cursorP * W * 0.35;
      const curY = H * 0.15 + cursorP * H * 0.2;
      ctx.globalAlpha = a * cursorP;
      ctx.fillStyle = FB.gold;
      ctx.beginPath();
      ctx.moveTo(curX, curY); ctx.lineTo(curX + 4 * s, curY + 12 * s);
      ctx.lineTo(curX - 2 * s, curY + 9 * s); ctx.closePath(); ctx.fill();
    }
    // Labels
    if (cursorP > 0.3 && boomP < 0.3) drawFBText(ctx, "SCRAMBLING...", W / 2, H * 0.72, 9 * s, a * cursorP, "center", FB.gold);
    const endP = interpolate(frame, [130, 155], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "EXPLODED", W / 2, H * 0.85, 16 * s, a * endP, "center", FB.red);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V6: progress bar "editing connections..." then ERROR ----------
const V6: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 180);
    const s = Math.min(W, H) / 360;
    const cx = W / 2, barY = H * 0.35;
    const barW = W * 0.7, barH = 10 * s;
    const barX = cx - barW / 2;
    // Progress bar
    const progP = interpolate(frame, [10, 80], [0, 0.72], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = a * 0.15; ctx.fillStyle = FB.text.dim;
    ctx.fillRect(barX, barY, barW, barH);
    ctx.globalAlpha = a; ctx.fillStyle = progP < 0.6 ? FB.teal : FB.gold;
    ctx.fillRect(barX, barY, barW * progP, barH);
    drawFBText(ctx, "Editing random connections...", cx, barY - 12 * s, 8 * s, a, "center", FB.text.dim);
    drawFBText(ctx, Math.round(progP * 100) + "%", cx, barY + barH + 10 * s, 8 * s, a, "center", FB.text.primary);
    // Error at ~72%
    const errP = interpolate(frame, [85, 100], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (errP > 0) {
      ctx.globalAlpha = a * errP * 0.08;
      ctx.fillStyle = FB.red;
      ctx.fillRect(0, 0, W, H);
      drawFBText(ctx, "ERROR", cx, H * 0.55, 20 * s, a * errP, "center", FB.red);
      drawFBText(ctx, "RuntimeError: values diverged to inf", cx, H * 0.65, 7 * s, a * errP, "center", FB.red);
    }
    const endP = interpolate(frame, [120, 150], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "BRAIN EXPLODED", cx, H * 0.82, 14 * s, a * endP, "center", FB.red);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V7: all-neurons-firing heatmap going from sparse to saturated red ----------
const V7: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 180);
    const s = Math.min(W, H) / 360;
    const rng = seeded(6170);
    const gridCols = 12, gridRows = 8;
    const cellW = W * 0.065, cellH = H * 0.065;
    const startX = W * 0.1, startY = H * 0.1;
    const saturation = interpolate(frame, [20, 100], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "FIRING RATE", W / 2, H * 0.05, 8 * s, a, "center", FB.text.dim);
    for (let r = 0; r < gridRows; r++) {
      for (let c = 0; c < gridCols; c++) {
        const baseRate = rng() * 0.3;
        const rate = Math.min(1, baseRate + saturation * (0.5 + rng() * 0.5));
        const x = startX + c * cellW, y = startY + r * cellH;
        ctx.globalAlpha = a * (0.2 + rate * 0.8);
        ctx.fillStyle = rate > 0.7 ? FB.red : rate > 0.4 ? FB.gold : FB.teal;
        ctx.fillRect(x + 1, y + 1, cellW - 2, cellH - 2);
      }
    }
    const labelP = interpolate(frame, [110, 140], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "ALL NEURONS MAXED OUT", W / 2, H * 0.72, 10 * s, a * labelP, "center", FB.red);
    drawFBText(ctx, "BRAIN EXPLODED", W / 2, H * 0.85, 14 * s, a * labelP, "center", FB.red);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V8: domino chain — one bad edit topples the whole network ----------
const V8: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 180);
    const s = Math.min(W, H) / 360;
    const nDom = 8;
    const cy = H * 0.45;
    for (let i = 0; i < nDom; i++) {
      const x = W * 0.08 + i * W * 0.11;
      const fallFrame = 40 + i * 12;
      const fallP = interpolate(frame, [fallFrame, fallFrame + 15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const angle = fallP * Math.PI / 2.5;
      ctx.save();
      ctx.translate(x, cy + 20 * s);
      ctx.rotate(angle);
      ctx.globalAlpha = a;
      ctx.fillStyle = i === 0 ? FB.gold : (fallP > 0.5 ? FB.red : FB.teal);
      ctx.fillRect(-3 * s, -25 * s, 6 * s, 25 * s);
      ctx.restore();
    }
    // "ONE BAD EDIT" pointing to first domino
    const editP = interpolate(frame, [15, 35], [0, 1], { extrapolateRight: "clamp" });
    drawFBText(ctx, "ONE BAD EDIT", W * 0.08, cy - 25 * s, 7 * s, a * editP, "center", FB.gold);
    const endP = interpolate(frame, [140, 165], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "CHAIN REACTION", W / 2, H * 0.75, 11 * s, a * endP, "center", FB.red);
    drawFBText(ctx, "BRAIN EXPLODED", W / 2, H * 0.88, 13 * s, a * endP, "center", FB.red);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V9: attempt counter ticking up, each attempt = red X ----------
const V9: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 180);
    const s = Math.min(W, H) / 360;
    drawFBText(ctx, "RANDOM SCRAMBLE ATTEMPTS", W / 2, H * 0.08, 9 * s, a, "center", FB.text.dim);
    const maxAttempts = 6;
    for (let i = 0; i < maxAttempts; i++) {
      const t = interpolate(frame, [15 + i * 18, 30 + i * 18], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const x = W * 0.15 + (i % 3) * W * 0.3;
      const y = H * 0.22 + Math.floor(i / 3) * H * 0.25;
      // Attempt label
      drawFBText(ctx, `#${i + 1}`, x, y - 12 * s, 8 * s, a * t, "center", FB.text.dim);
      // Red X
      const xP = interpolate(frame, [25 + i * 18, 32 + i * 18], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      ctx.globalAlpha = a * xP; ctx.strokeStyle = FB.red; ctx.lineWidth = 2.5 * s; ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(x - 6 * s, y - 6 * s); ctx.lineTo(x + 6 * s, y + 6 * s); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x + 6 * s, y - 6 * s); ctx.lineTo(x - 6 * s, y + 6 * s); ctx.stroke();
      drawFBText(ctx, "EXPLODED", x, y + 12 * s, 6 * s, a * xP, "center", FB.red);
    }
    const endP = interpolate(frame, [140, 165], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "RANDOM DOESN'T WORK", W / 2, H * 0.85, 13 * s, a * endP, "center", FB.red);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

export const VARIANTS_FB_061: VariantDef[] = [
  { id: "fb-061-v1", label: "Network scrambled then nodes die", component: V1 },
  { id: "fb-061-v2", label: "Activity chart spikes off the rails", component: V2 },
  { id: "fb-061-v3", label: "Dice roll into brain then shatter", component: V3 },
  { id: "fb-061-v4", label: "Spinning weights go NaN", component: V4 },
  { id: "fb-061-v5", label: "Cursor scrambles calm ring network", component: V5 },
  { id: "fb-061-v6", label: "Progress bar hits ERROR at 72%", component: V6 },
  { id: "fb-061-v7", label: "Heatmap saturates to all red", component: V7 },
  { id: "fb-061-v8", label: "Domino chain from one bad edit", component: V8 },
  { id: "fb-061-v9", label: "Attempt counter all red X marks", component: V9 },
];
