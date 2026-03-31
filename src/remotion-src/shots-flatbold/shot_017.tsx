// Shot 017 — "But AI makes mistakes."
// Duration: 60 frames (2s at 30fps)
// CONCEPT: Network connections flash RED. Error icons appear. Something went wrong.
// 9 genuinely different visual metaphors for "mistakes found"

import React, { useRef, useEffect } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantDef, VariantProps } from "../types";
import {
  FB, seeded, drawFBBg, drawFBNode, drawFBEdge, drawFBText,
  fadeInOut, cellHSL, drawFBColorEdge, drawIconBug, drawIconErrorCircle,
} from "./flatbold-kit";

const DUR = 60;

/* ── V1: Connections flash red one by one — healthy network turns hostile ── */
const V1: React.FC<VariantProps> = ({ width: w, height: h }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  const sc = Math.min(w, h) / 360;
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, w, h, frame); const a = fadeInOut(frame, DUR);
    const cx = w / 2, cy = h / 2;
    const rng = seeded(1700);
    const nodes: { x: number; y: number }[] = [];
    for (let i = 0; i < 8; i++) {
      const nx = cx + (rng() - 0.5) * w * 0.7;
      const ny = cy + (rng() - 0.5) * h * 0.6;
      nodes.push({ x: nx, y: ny });
    }
    // Edges turn red one by one
    const edges = [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7],[0,3],[2,5],[1,6]];
    for (let e = 0; e < edges.length; e++) {
      const [i, j] = edges[e];
      const turnRedAt = 8 + e * 4;
      const isRed = frame > turnRedAt;
      const flash = isRed ? 0.5 + Math.sin(frame * 0.2 + e) * 0.3 : 0;
      const color = isRed ? FB.red : `rgba(255,255,255,0.15)`;
      drawFBColorEdge(ctx, nodes[i].x, nodes[i].y, nodes[j].x, nodes[j].y, color, sc, a * (isRed ? flash : 0.3));
    }
    for (let i = 0; i < nodes.length; i++) {
      drawFBNode(ctx, nodes[i].x, nodes[i].y, 6 * sc, i, a * 0.7, frame);
    }
    const textA = interpolate(frame, [30, 45], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "MISTAKES", cx, h * 0.92, 14 * sc, a * textA, "center", FB.red);
  });
  return <canvas ref={ref} width={w} height={h} style={{ width: w, height: h }} />;
};

/* ── V2: Bug icons crawl in from edges — bugs infesting the network ── */
const V2: React.FC<VariantProps> = ({ width: w, height: h }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  const sc = Math.min(w, h) / 360;
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, w, h, frame); const a = fadeInOut(frame, DUR);
    const cx = w / 2, cy = h / 2;
    // Small network in center
    const rng = seeded(1710);
    for (let i = 0; i < 5; i++) {
      const nx = cx + (rng() - 0.5) * w * 0.3;
      const ny = cy + (rng() - 0.5) * h * 0.3;
      drawFBNode(ctx, nx, ny, 5 * sc, i + 3, a * 0.5, frame);
    }
    // Bugs crawling in from different edges
    const bugs = [
      { sx: -20 * sc, sy: h * 0.3 }, { sx: w + 20 * sc, sy: h * 0.6 },
      { sx: w * 0.3, sy: -20 * sc }, { sx: w * 0.7, sy: h + 20 * sc },
      { sx: -20 * sc, sy: h * 0.7 }, { sx: w + 20 * sc, sy: h * 0.2 },
      { sx: w * 0.5, sy: -20 * sc },
    ];
    for (let i = 0; i < bugs.length; i++) {
      const crawlT = interpolate(frame, [5 + i * 4, 35 + i * 3], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const ease = crawlT * crawlT * (3 - 2 * crawlT);
      const bx = bugs[i].sx + (cx - bugs[i].sx) * ease + Math.sin(frame * 0.1 + i * 2) * 8 * sc * ease;
      const by = bugs[i].sy + (cy - bugs[i].sy) * ease + Math.cos(frame * 0.12 + i * 1.5) * 6 * sc * ease;
      drawIconBug(ctx, bx, by, 14 * sc, FB.red, a * crawlT * 0.8);
    }
  });
  return <canvas ref={ref} width={w} height={h} style={{ width: w, height: h }} />;
};

/* ── V3: Red flash — entire screen pulses red, error circles appear ── */
const V3: React.FC<VariantProps> = ({ width: w, height: h }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  const sc = Math.min(w, h) / 360;
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, w, h, frame); const a = fadeInOut(frame, DUR);
    const cx = w / 2, cy = h / 2;
    // Network nodes first
    const rng = seeded(1720);
    for (let i = 0; i < 6; i++) {
      const nx = cx + (rng() - 0.5) * w * 0.5;
      const ny = cy + (rng() - 0.5) * h * 0.5;
      drawFBNode(ctx, nx, ny, 5 * sc, i + 2, a * 0.6, frame);
    }
    // Red flash pulses
    const flashT = interpolate(frame, [15, 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const flashFade = interpolate(frame, [20, 40], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (flashT > 0) {
      ctx.globalAlpha = a * flashT * flashFade * 0.25;
      ctx.fillStyle = FB.red;
      ctx.fillRect(0, 0, w, h);
      ctx.globalAlpha = 1;
    }
    // Error circles appear at staggered times
    const errors = [
      { x: w * 0.25, y: h * 0.3 }, { x: w * 0.7, y: h * 0.25 },
      { x: w * 0.5, y: h * 0.6 }, { x: w * 0.3, y: h * 0.7 },
    ];
    for (let i = 0; i < errors.length; i++) {
      const eT = interpolate(frame, [22 + i * 5, 30 + i * 5], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const bounce = eT < 0.7 ? eT / 0.7 : 1 + Math.sin((eT - 0.7) / 0.3 * Math.PI) * 0.15;
      drawIconErrorCircle(ctx, errors[i].x, errors[i].y, 18 * sc * bounce, FB.red, a * eT);
    }
  });
  return <canvas ref={ref} width={w} height={h} style={{ width: w, height: h }} />;
};

/* ── V4: Glitch effect — network nodes jitter and scramble ── */
const V4: React.FC<VariantProps> = ({ width: w, height: h }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  const sc = Math.min(w, h) / 360;
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, w, h, frame); const a = fadeInOut(frame, DUR);
    const cx = w / 2, cy = h / 2;
    const rng = seeded(1730);
    const glitchIntensity = interpolate(frame, [10, 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    // Horizontal glitch lines
    for (let i = 0; i < 6; i++) {
      const gy = rng() * h;
      const gw = (20 + rng() * 60) * sc * glitchIntensity;
      const gx = rng() * w;
      ctx.globalAlpha = a * glitchIntensity * (0.05 + rng() * 0.1);
      ctx.fillStyle = FB.red;
      ctx.fillRect(gx, gy, gw, (1 + rng() * 3) * sc);
    }
    ctx.globalAlpha = 1;
    // Network nodes with jitter
    const nodes: { x: number; y: number }[] = [];
    const rng2 = seeded(1731);
    for (let i = 0; i < 7; i++) {
      const baseX = cx + (rng2() - 0.5) * w * 0.6;
      const baseY = cy + (rng2() - 0.5) * h * 0.5;
      const jx = (Math.random() - 0.5) * 12 * sc * glitchIntensity;
      const jy = (Math.random() - 0.5) * 12 * sc * glitchIntensity;
      const nx = baseX + jx, ny = baseY + jy;
      nodes.push({ x: nx, y: ny });
      drawFBNode(ctx, nx, ny, 6 * sc, i, a * 0.7, frame);
    }
    // Edges flicker between red and normal
    for (let i = 0; i < nodes.length - 1; i++) {
      const isGlitched = Math.sin(frame * 0.3 + i * 2) > 0.2 - glitchIntensity;
      const color = isGlitched ? FB.red : `rgba(255,255,255,0.12)`;
      drawFBColorEdge(ctx, nodes[i].x, nodes[i].y, nodes[i + 1].x, nodes[i + 1].y, color, sc, a * 0.5);
    }
  });
  return <canvas ref={ref} width={w} height={h} style={{ width: w, height: h }} />;
};

/* ── V5: Error propagation — one bad node spreads red outward in rings ── */
const V5: React.FC<VariantProps> = ({ width: w, height: h }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  const sc = Math.min(w, h) / 360;
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, w, h, frame); const a = fadeInOut(frame, DUR);
    const cx = w / 2, cy = h / 2;
    // Central error node
    drawFBNode(ctx, cx, cy, 10 * sc, 0, a, frame);
    // Red propagation rings expanding outward
    const ringCount = 4;
    for (let r = 0; r < ringCount; r++) {
      const ringStart = 8 + r * 8;
      const ringT = interpolate(frame, [ringStart, ringStart + 25], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      if (ringT <= 0) continue;
      const radius = ringT * Math.min(w, h) * 0.45;
      const ringAlpha = (1 - ringT) * 0.4;
      ctx.globalAlpha = a * ringAlpha;
      ctx.strokeStyle = FB.red;
      ctx.lineWidth = 3 * sc * (1 - ringT);
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    // Surrounding nodes turn red as rings pass through
    const rng = seeded(1750);
    for (let i = 0; i < 10; i++) {
      const angle = rng() * Math.PI * 2;
      const dist = (30 + rng() * 100) * sc;
      const nx = cx + Math.cos(angle) * dist;
      const ny = cy + Math.sin(angle) * dist;
      const hitFrame = 8 + (dist / (Math.min(w, h) * 0.45)) * 25;
      const isHit = frame > hitFrame;
      drawFBNode(ctx, nx, ny, 5 * sc, isHit ? 0 : 4, a * 0.6, frame);
    }
  });
  return <canvas ref={ref} width={w} height={h} style={{ width: w, height: h }} />;
};

/* ── V6: X marks — connections get crossed out with animated X marks ── */
const V6: React.FC<VariantProps> = ({ width: w, height: h }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  const sc = Math.min(w, h) / 360;
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, w, h, frame); const a = fadeInOut(frame, DUR);
    const rng = seeded(1760);
    // Draw network connections with X marks on them
    const pairs: { x1: number; y1: number; x2: number; y2: number }[] = [];
    for (let i = 0; i < 7; i++) {
      const x1 = w * 0.1 + rng() * w * 0.35;
      const y1 = h * 0.15 + rng() * h * 0.7;
      const x2 = x1 + (30 + rng() * 60) * sc;
      const y2 = y1 + (rng() - 0.5) * 50 * sc;
      pairs.push({ x1, y1, x2, y2 });
      drawFBNode(ctx, x1, y1, 5 * sc, i, a * 0.6, frame);
      drawFBNode(ctx, x2, y2, 5 * sc, (i + 3) % 8, a * 0.6, frame);
      drawFBEdge(ctx, x1, y1, x2, y2, sc, a * 0.3, frame, 220, 220);
    }
    // X marks appear at midpoints
    for (let i = 0; i < pairs.length; i++) {
      const xT = interpolate(frame, [12 + i * 5, 20 + i * 5], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      if (xT <= 0) continue;
      const mx = (pairs[i].x1 + pairs[i].x2) / 2;
      const my = (pairs[i].y1 + pairs[i].y2) / 2;
      const sz = 6 * sc * xT;
      ctx.globalAlpha = a * xT * 0.9;
      ctx.strokeStyle = FB.red;
      ctx.lineWidth = 2.5 * sc;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(mx - sz, my - sz); ctx.lineTo(mx + sz, my + sz);
      ctx.moveTo(mx + sz, my - sz); ctx.lineTo(mx - sz, my + sz);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  });
  return <canvas ref={ref} width={w} height={h} style={{ width: w, height: h }} />;
};

/* ── V7: Misconnections — edges connect to wrong nodes, tangled mess ── */
const V7: React.FC<VariantProps> = ({ width: w, height: h }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  const sc = Math.min(w, h) / 360;
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, w, h, frame); const a = fadeInOut(frame, DUR);
    const cx = w / 2, cy = h / 2;
    // Correct layout: two rows of 4 nodes that should connect left-to-right
    const topRow: { x: number; y: number }[] = [];
    const botRow: { x: number; y: number }[] = [];
    for (let i = 0; i < 4; i++) {
      topRow.push({ x: w * (0.15 + i * 0.23), y: cy - 35 * sc });
      botRow.push({ x: w * (0.15 + i * 0.23), y: cy + 35 * sc });
    }
    // Draw nodes
    for (let i = 0; i < 4; i++) {
      drawFBNode(ctx, topRow[i].x, topRow[i].y, 6 * sc, i, a * 0.7, frame);
      drawFBNode(ctx, botRow[i].x, botRow[i].y, 6 * sc, i + 4, a * 0.7, frame);
    }
    // Tangled connections — edges go to WRONG targets
    const tangleT = interpolate(frame, [10, 35], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const wrongPairs = [[0,3],[1,0],[2,1],[3,2],[0,2],[3,0]];
    for (let e = 0; e < wrongPairs.length; e++) {
      const eT = Math.min(1, Math.max(0, (tangleT - e * 0.12) * 3));
      const [ti, bi] = wrongPairs[e];
      drawFBColorEdge(ctx, topRow[ti].x, topRow[ti].y, botRow[bi].x, botRow[bi].y, FB.red, sc, a * eT * 0.5);
    }
    // "?" question marks at crossing points
    if (tangleT > 0.5) {
      const qA = (tangleT - 0.5) * 2;
      drawFBText(ctx, "?", cx - 20 * sc, cy, 16 * sc, a * qA * 0.7, "center", FB.red);
      drawFBText(ctx, "?", cx + 25 * sc, cy + 5 * sc, 12 * sc, a * qA * 0.5, "center", FB.red);
    }
  });
  return <canvas ref={ref} width={w} height={h} style={{ width: w, height: h }} />;
};

/* ── V8: Broken bridge — a gap appears in a critical pathway ── */
const V8: React.FC<VariantProps> = ({ width: w, height: h }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  const sc = Math.min(w, h) / 360;
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, w, h, frame); const a = fadeInOut(frame, DUR);
    const cx = w / 2, cy = h / 2;
    // Chain of nodes left to right
    const count = 6;
    const nodes: { x: number; y: number }[] = [];
    for (let i = 0; i < count; i++) {
      const nx = w * (0.08 + (i / (count - 1)) * 0.84);
      const ny = cy + Math.sin(i * 0.8) * 15 * sc;
      nodes.push({ x: nx, y: ny });
      drawFBNode(ctx, nx, ny, 7 * sc, i + 1, a * 0.7, frame);
    }
    // Edges — all fine except the middle one breaks
    const breakT = interpolate(frame, [15, 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    for (let i = 0; i < count - 1; i++) {
      const isMidBreak = i === 2;
      if (isMidBreak) {
        // Gap widens
        const gapSize = breakT * 25 * sc;
        const mx = (nodes[i].x + nodes[i + 1].x) / 2;
        // Left stub
        drawFBColorEdge(ctx, nodes[i].x, nodes[i].y, mx - gapSize, cy, FB.red, sc, a * 0.5);
        // Right stub
        drawFBColorEdge(ctx, mx + gapSize, cy, nodes[i + 1].x, nodes[i + 1].y, FB.red, sc, a * 0.5);
        // Sparks at break point
        if (breakT > 0.3) {
          const sparkA = (breakT - 0.3) / 0.7;
          for (let s = 0; s < 5; s++) {
            const angle = (s / 5) * Math.PI * 2 + frame * 0.15;
            const dist = (5 + Math.sin(frame * 0.2 + s) * 4) * sc;
            ctx.globalAlpha = a * sparkA * 0.6;
            ctx.fillStyle = FB.red;
            ctx.beginPath();
            ctx.arc(mx + Math.cos(angle) * dist, cy + Math.sin(angle) * dist, 1.5 * sc, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.globalAlpha = 1;
        }
      } else {
        drawFBEdge(ctx, nodes[i].x, nodes[i].y, nodes[i + 1].x, nodes[i + 1].y, sc, a * 0.3, frame, 220, 220);
      }
    }
  });
  return <canvas ref={ref} width={w} height={h} style={{ width: w, height: h }} />;
};

/* ── V9: Warning overlay — network freezes, red "ERROR" stamps appear ── */
const V9: React.FC<VariantProps> = ({ width: w, height: h }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  const sc = Math.min(w, h) / 360;
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, w, h, frame); const a = fadeInOut(frame, DUR);
    const cx = w / 2, cy = h / 2;
    // Network (dim, frozen)
    const rng = seeded(1790);
    for (let i = 0; i < 8; i++) {
      const nx = cx + (rng() - 0.5) * w * 0.7;
      const ny = cy + (rng() - 0.5) * h * 0.6;
      drawFBNode(ctx, nx, ny, 5 * sc, 7, a * 0.3, frame);
      if (i > 0) {
        const px = cx + (rng() - 0.5) * w * 0.7;
        const py = cy + (rng() - 0.5) * h * 0.6;
        drawFBEdge(ctx, nx, ny, px, py, sc, a * 0.1, frame, 220, 220);
      } else { rng(); rng(); }
    }
    // Red warning border pulses in
    const borderT = interpolate(frame, [12, 22], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (borderT > 0) {
      const pulse = 0.6 + Math.sin(frame * 0.2) * 0.3;
      ctx.globalAlpha = a * borderT * pulse * 0.4;
      ctx.strokeStyle = FB.red;
      ctx.lineWidth = 4 * sc;
      ctx.strokeRect(8 * sc, 8 * sc, w - 16 * sc, h - 16 * sc);
      ctx.globalAlpha = 1;
    }
    // "ERROR" text slams in
    const errT = interpolate(frame, [25, 35], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (errT > 0) {
      const slamScale = errT < 0.5 ? errT * 2 * 1.3 : 1 + (1 - errT) * 0.2;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate((1 - errT) * -0.15);
      drawFBText(ctx, "ERROR", 0, 0, 28 * sc * slamScale, a * errT, "center", FB.red);
      ctx.restore();
    }
  });
  return <canvas ref={ref} width={w} height={h} style={{ width: w, height: h }} />;
};

export const VARIANTS_FB_017: VariantDef[] = [
  { id: "fb017-v1", label: "Connections Flash Red", component: V1 },
  { id: "fb017-v2", label: "Bug Icons Crawl In", component: V2 },
  { id: "fb017-v3", label: "Red Flash + Error Circles", component: V3 },
  { id: "fb017-v4", label: "Glitch Jitter", component: V4 },
  { id: "fb017-v5", label: "Error Propagation Rings", component: V5 },
  { id: "fb017-v6", label: "X Marks on Connections", component: V6 },
  { id: "fb017-v7", label: "Tangled Misconnections", component: V7 },
  { id: "fb017-v8", label: "Broken Bridge Gap", component: V8 },
  { id: "fb017-v9", label: "Warning Border + ERROR Stamp", component: V9 },
];
