// Shot 019 — "Over 200 labs and hundreds of volunteers spent four years checking the AI's work by hand."
// Duration: 270 frames (9s at 30fps)
// CONCEPT: People (drawPersonBlob) swarm in, huddle around errors, fix them one by one.
// Building icons for labs. Counter climbs to "200+". Clearly about PEOPLE working.
// 9 genuinely different visual metaphors

import React, { useRef, useEffect } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantDef, VariantProps } from "../types";
import {
  FB, seeded, drawFBBg, drawFBNode, drawFBText, drawFBCounter,
  fadeInOut, drawFBColorEdge, drawPersonBlob, drawIconBuilding,
  drawIconCheckCircle, drawIconErrorCircle, drawIconWrench,
} from "./flatbold-kit";

const DUR = 270;

/** Draw a broken connection (two nodes + red zigzag) */
function drawBroken(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, sc: number, a: number, frame: number) {
  drawFBNode(ctx, x1, y1, 5 * sc, 4, a * 0.5, frame);
  drawFBNode(ctx, x2, y2, 5 * sc, 0, a * 0.5, frame);
  const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
  const pulse = 0.4 + Math.sin(frame * 0.15) * 0.2;
  ctx.globalAlpha = a * pulse * 0.5;
  ctx.strokeStyle = FB.red; ctx.lineWidth = 2 * sc; ctx.lineCap = "round";
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(mx, my - 5 * sc); ctx.lineTo(x2, y2); ctx.stroke();
  ctx.globalAlpha = 1;
}
/** Draw a fixed connection (green line + glow) */
function drawFixed(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, sc: number, a: number) {
  drawFBNode(ctx, x1, y1, 5 * sc, 3, a * 0.6, 0);
  drawFBNode(ctx, x2, y2, 5 * sc, 3, a * 0.6, 0);
  drawFBColorEdge(ctx, x1, y1, x2, y2, FB.green, sc, a * 0.5);
}

/* ── V1: Single huddle — one big error, 8 people gather, examine, fix ── */
const V1: React.FC<VariantProps> = ({ width: w, height: h }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  const sc = Math.min(w, h) / 360;
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, w, h, frame); const a = fadeInOut(frame, DUR);
    const cx = w / 2, cy = h / 2;
    // Broken → fixed
    const fixT = interpolate(frame, [160, 200], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (fixT < 1) drawBroken(ctx, cx - 50 * sc, cy, cx + 50 * sc, cy, sc, a * (1 - fixT), frame);
    if (fixT > 0) drawFixed(ctx, cx - 50 * sc, cy, cx + 50 * sc, cy, sc, a * fixT);
    // People arrive from edges and huddle
    const arrT = interpolate(frame, [20, 100], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const rng = seeded(1900);
    for (let i = 0; i < 8; i++) {
      const pt = Math.min(1, Math.max(0, (arrT - i * 0.08) * 3));
      const pE = pt * pt * (3 - 2 * pt);
      const angle = (i / 8) * Math.PI * 2 + rng() * 0.5;
      const edge = Math.floor(rng() * 4);
      const sx = edge === 0 ? -20 * sc : edge === 1 ? w + 20 * sc : rng() * w;
      const sy = edge === 2 ? -20 * sc : edge === 3 ? h + 20 * sc : rng() * h;
      const hx = cx + Math.cos(angle) * 45 * sc;
      const hy = cy + Math.sin(angle) * 35 * sc;
      const px = sx + (hx - sx) * pE, py = sy + (hy - sy) * pE;
      const bob = Math.sin(frame * 0.04 + i) * 2 * sc;
      drawPersonBlob(ctx, px, py + bob, 14 * sc, i, a * pt * 0.7);
    }
    // Building icons at corners
    const bT = interpolate(frame, [50, 80], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawIconBuilding(ctx, w * 0.1, h * 0.15, 18 * sc, FB.text.dim, a * bT * 0.4);
    drawIconBuilding(ctx, w * 0.9, h * 0.15, 18 * sc, FB.text.dim, a * bT * 0.4);
    // Counter
    const countT = interpolate(frame, [60, 200], [0, 200], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBCounter(ctx, Math.round(countT) + "+", cx, h * 0.06, 12 * sc, FB.teal, a * 0.6);
    // Check mark at end
    if (fixT > 0.8) drawIconCheckCircle(ctx, cx, h * 0.93, 14 * sc, FB.green, a * (fixT - 0.8) * 5);
  });
  return <canvas ref={ref} width={w} height={h} style={{ width: w, height: h }} />;
};

/* ── V2: Three teams — three error sites, each gets a team of people + building ── */
const V2: React.FC<VariantProps> = ({ width: w, height: h }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  const sc = Math.min(w, h) / 360;
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, w, h, frame); const a = fadeInOut(frame, DUR);
    const sites = [
      { cx: w * 0.2, cy: h * 0.35, fixStart: 120 },
      { cx: w * 0.55, cy: h * 0.55, fixStart: 160 },
      { cx: w * 0.82, cy: h * 0.3, fixStart: 200 },
    ];
    for (let s = 0; s < sites.length; s++) {
      const site = sites[s];
      const n1x = site.cx - 25 * sc, n2x = site.cx + 25 * sc;
      const fixT = interpolate(frame, [site.fixStart, site.fixStart + 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      if (fixT < 1) drawBroken(ctx, n1x, site.cy, n2x, site.cy, sc, a * (1 - fixT), frame);
      if (fixT > 0) drawFixed(ctx, n1x, site.cy, n2x, site.cy, sc, a * fixT);
      // Building above site
      drawIconBuilding(ctx, site.cx, site.cy - 35 * sc, 16 * sc, FB.text.dim, a * 0.4);
      // Team of people
      const teamT = interpolate(frame, [20 + s * 25, 80 + s * 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const rng = seeded(1910 + s * 100);
      for (let p = 0; p < 5; p++) {
        const pt = Math.min(1, Math.max(0, (teamT - p * 0.12) * 3));
        const angle = (p / 5) * Math.PI * 2 + s;
        const px = site.cx + Math.cos(angle) * 30 * sc;
        const py = site.cy + Math.sin(angle) * 22 * sc;
        const bob = Math.sin(frame * 0.04 + p + s * 2) * 2 * sc;
        drawPersonBlob(ctx, px, py + bob, 11 * sc, Math.floor(rng() * 8), a * pt * 0.55);
      }
    }
    const countT = interpolate(frame, [40, 220], [0, 200], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBCounter(ctx, Math.round(countT) + "+", w / 2, h * 0.93, 11 * sc, FB.teal, a * 0.5);
  });
  return <canvas ref={ref} width={w} height={h} style={{ width: w, height: h }} />;
};

/* ── V3: Wave sweep — crowd moves left to right fixing a row of errors ── */
const V3: React.FC<VariantProps> = ({ width: w, height: h }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  const sc = Math.min(w, h) / 360;
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, w, h, frame); const a = fadeInOut(frame, DUR);
    const cy = h * 0.35;
    const errCount = 8;
    const waveT = interpolate(frame, [30, 210], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const waveX = -w * 0.1 + waveT * w * 1.2;
    for (let i = 0; i < errCount; i++) {
      const ex = w * 0.06 + (i / (errCount - 1)) * w * 0.88;
      const n1x = ex - 15 * sc, n2x = ex + 15 * sc;
      const fixed = waveX > ex + 15 * sc;
      if (fixed) drawFixed(ctx, n1x, cy, n2x, cy, sc, a);
      else drawBroken(ctx, n1x, cy, n2x, cy, sc, a, frame);
    }
    // Wave of people
    const rng = seeded(1920);
    for (let i = 0; i < 30; i++) {
      const px = waveX - 30 * sc + rng() * 60 * sc;
      const py = h * 0.55 + rng() * h * 0.3;
      const bob = Math.sin(frame * 0.05 + i * 0.8) * 2 * sc;
      if (px > -20 * sc && px < w + 20 * sc) {
        drawPersonBlob(ctx, px, py + bob, (8 + rng() * 5) * sc, Math.floor(rng() * 8), a * 0.5);
      }
    }
    // Buildings along top
    for (let i = 0; i < 4; i++) {
      drawIconBuilding(ctx, w * (0.15 + i * 0.25), h * 0.08, 14 * sc, FB.text.dim, a * 0.3);
    }
    drawFBCounter(ctx, Math.round(waveT * 200) + "+", w / 2, h * 0.08, 11 * sc, FB.teal, a * 0.5);
  });
  return <canvas ref={ref} width={w} height={h} style={{ width: w, height: h }} />;
};

/* ── V4: Crowd grows — people accumulate in center over time, counter climbs ── */
const V4: React.FC<VariantProps> = ({ width: w, height: h }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  const sc = Math.min(w, h) / 360;
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, w, h, frame); const a = fadeInOut(frame, DUR);
    const cx = w / 2, cy = h * 0.55;
    // Errors being fixed at top
    const fixPhase = interpolate(frame, [80, 220], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const rng1 = seeded(1930);
    for (let i = 0; i < 5; i++) {
      const ex = w * 0.1 + rng1() * w * 0.8, ey = h * 0.2 + rng1() * h * 0.1;
      const ex2 = ex + (rng1() - 0.5) * 40 * sc;
      const fixed = (i + 1) / 5 <= fixPhase;
      if (fixed) drawFixed(ctx, ex, ey, ex2, ey, sc, a);
      else drawBroken(ctx, ex, ey, ex2, ey, sc, a * 0.6, frame);
    }
    // Growing crowd below
    const crowdT = interpolate(frame, [10, 200], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const rng2 = seeded(1931);
    const count = Math.floor(crowdT * 50);
    for (let i = 0; i < count; i++) {
      const px = cx + (rng2() - 0.5) * w * 0.8;
      const py = cy + (rng2() - 0.5) * h * 0.35;
      const size = (7 + rng2() * 5) * sc;
      const bob = Math.sin(frame * 0.03 + i * 0.5) * 1.5 * sc;
      drawPersonBlob(ctx, px, py + bob, size, Math.floor(rng2() * 8), a * 0.4);
    }
    // Buildings
    drawIconBuilding(ctx, w * 0.08, h * 0.08, 16 * sc, FB.text.dim, a * 0.4);
    drawIconBuilding(ctx, w * 0.92, h * 0.08, 16 * sc, FB.text.dim, a * 0.4);
    // Counter
    drawFBCounter(ctx, Math.round(crowdT * 200) + "+", cx, h * 0.06, 13 * sc, FB.teal, a * 0.6);
    drawFBText(ctx, "LABS & VOLUNTEERS", cx, h * 0.94, 9 * sc, a * 0.5, "center", FB.text.dim);
  });
  return <canvas ref={ref} width={w} height={h} style={{ width: w, height: h }} />;
};

/* ── V5: Queue and fix — people line up, take turns fixing errors ── */
const V5: React.FC<VariantProps> = ({ width: w, height: h }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  const sc = Math.min(w, h) / 360;
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, w, h, frame); const a = fadeInOut(frame, DUR);
    const cy = h * 0.4;
    // Row of 6 errors
    const errCount = 6;
    const totalT = interpolate(frame, [30, 230], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    for (let i = 0; i < errCount; i++) {
      const ex = w * 0.1 + (i / (errCount - 1)) * w * 0.8;
      const n1y = cy - 12 * sc, n2y = cy + 12 * sc;
      const fixPhase = Math.max(0, Math.min(1, (totalT - i / errCount) * errCount * 0.5));
      const fixed = fixPhase > 0.7;
      if (fixed) { drawFixed(ctx, ex, n1y, ex, n2y, sc, a); drawIconCheckCircle(ctx, ex, cy - 25 * sc, 10 * sc, FB.green, a * 0.6); }
      else drawBroken(ctx, ex, n1y, ex, n2y, sc, a, frame);
      // Active worker near current error
      const walkT = Math.max(0, Math.min(1, (totalT - i / errCount) * errCount * 0.3));
      if (walkT > 0 && !fixed) {
        const px = w * 0.5 + (ex - w * 0.5) * walkT;
        drawPersonBlob(ctx, px, cy + 35 * sc, 13 * sc, i * 2 + 1, a * walkT * 0.7);
        drawIconWrench(ctx, px + 10 * sc, cy + 25 * sc, 8 * sc, FB.gold, a * walkT * 0.5);
      }
    }
    // Queue of people waiting at left
    const queueCount = Math.max(0, 10 - Math.floor(totalT * 6));
    for (let q = 0; q < queueCount; q++) {
      drawPersonBlob(ctx, w * 0.03 + q * 12 * sc, h * 0.82, 9 * sc, q % 8, a * 0.3);
    }
    // Buildings
    drawIconBuilding(ctx, w * 0.05, h * 0.08, 14 * sc, FB.text.dim, a * 0.3);
    drawFBCounter(ctx, Math.round(totalT * 200) + "+", w / 2, h * 0.93, 10 * sc, FB.teal, a * 0.5);
  });
  return <canvas ref={ref} width={w} height={h} style={{ width: w, height: h }} />;
};

/* ── V6: Ring closes — people form a ring around errors, close in, fix ── */
const V6: React.FC<VariantProps> = ({ width: w, height: h }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  const sc = Math.min(w, h) / 360;
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, w, h, frame); const a = fadeInOut(frame, DUR);
    const cx = w / 2, cy = h / 2;
    // Central errors
    const rng = seeded(1960);
    const errCount = 5;
    for (let i = 0; i < errCount; i++) {
      const ex = cx + (rng() - 0.5) * 80 * sc, ey = cy + (rng() - 0.5) * 50 * sc;
      const ex2 = ex + (rng() - 0.5) * 30 * sc, ey2 = ey + (rng() - 0.5) * 25 * sc;
      const fixT = interpolate(frame, [140 + i * 15, 170 + i * 15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      if (fixT < 1) drawBroken(ctx, ex, ey, ex2, ey2, sc * 0.7, a * (1 - fixT) * 0.7, frame);
      if (fixT > 0) drawFixed(ctx, ex, ey, ex2, ey2, sc * 0.7, a * fixT * 0.7);
    }
    // Ring of people
    const ringT = interpolate(frame, [15, 80], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const closeT = interpolate(frame, [90, 150], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const ringR = interpolate(closeT, [0, 1], [110, 50]) * sc;
    const peopleCount = 20;
    for (let i = 0; i < peopleCount; i++) {
      const pt = Math.min(1, Math.max(0, (ringT - (i / peopleCount) * 0.6) * 3));
      const angle = (i / peopleCount) * Math.PI * 2 + frame * 0.002;
      const startR = 160 * sc;
      const currentR = startR + (ringR - startR) * pt;
      const px = cx + Math.cos(angle) * currentR;
      const py = cy + Math.sin(angle) * currentR * 0.65;
      const bob = Math.sin(frame * 0.03 + i) * 1.5 * sc;
      drawPersonBlob(ctx, px, py + bob, 10 * sc, i % 8, a * pt * 0.5);
    }
    // Buildings at corners
    drawIconBuilding(ctx, w * 0.05, h * 0.05, 14 * sc, FB.text.dim, a * ringT * 0.3);
    drawIconBuilding(ctx, w * 0.95, h * 0.05, 14 * sc, FB.text.dim, a * ringT * 0.3);
    drawIconBuilding(ctx, w * 0.05, h * 0.95, 14 * sc, FB.text.dim, a * ringT * 0.3);
    if (ringT > 0.3) drawFBCounter(ctx, Math.round(ringT * 200) + "+", cx, h * 0.05, 11 * sc, FB.teal, a * 0.5);
  });
  return <canvas ref={ref} width={w} height={h} style={{ width: w, height: h }} />;
};

/* ── V7: Building + person pairs — labs send workers who fix things ── */
const V7: React.FC<VariantProps> = ({ width: w, height: h }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  const sc = Math.min(w, h) / 360;
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, w, h, frame); const a = fadeInOut(frame, DUR);
    const cx = w / 2, cy = h / 2;
    // Central error zone
    const fixT = interpolate(frame, [170, 230], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (fixT < 1) drawBroken(ctx, cx - 40 * sc, cy, cx + 40 * sc, cy, sc, a * (1 - fixT), frame);
    if (fixT > 0) drawFixed(ctx, cx - 40 * sc, cy, cx + 40 * sc, cy, sc, a * fixT);
    // 5 labs around the perimeter, each sends 3 people
    const labs = [
      { x: w * 0.08, y: h * 0.15 }, { x: w * 0.92, y: h * 0.15 },
      { x: w * 0.08, y: h * 0.85 }, { x: w * 0.92, y: h * 0.85 },
      { x: w * 0.5, y: h * 0.92 },
    ];
    const sendT = interpolate(frame, [20, 140], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    for (let l = 0; l < labs.length; l++) {
      const lab = labs[l];
      const labT = Math.min(1, Math.max(0, (sendT - l * 0.15) * 3));
      drawIconBuilding(ctx, lab.x, lab.y, 18 * sc, FB.teal, a * labT * 0.5);
      for (let p = 0; p < 3; p++) {
        const pT = Math.min(1, Math.max(0, (labT - p * 0.2) * 2.5));
        const pE = pT * pT * (3 - 2 * pT);
        const angle = Math.atan2(cy - lab.y, cx - lab.x) + (p - 1) * 0.3;
        const dist = pE * Math.sqrt((cx - lab.x) ** 2 + (cy - lab.y) ** 2) * 0.6;
        const px = lab.x + Math.cos(angle) * dist;
        const py = lab.y + Math.sin(angle) * dist;
        const bob = Math.sin(frame * 0.04 + l * 2 + p) * 2 * sc;
        drawPersonBlob(ctx, px, py + bob, 10 * sc, (l * 3 + p) % 8, a * pT * 0.5);
      }
    }
    const countT = interpolate(frame, [40, 200], [0, 200], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBCounter(ctx, Math.round(countT) + "+", cx, h * 0.06, 12 * sc, FB.teal, a * 0.5);
  });
  return <canvas ref={ref} width={w} height={h} style={{ width: w, height: h }} />;
};

/* ── V8: Timeline — 4 year markers, each year adds more people fixing more errors ── */
const V8: React.FC<VariantProps> = ({ width: w, height: h }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  const sc = Math.min(w, h) / 360;
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, w, h, frame); const a = fadeInOut(frame, DUR);
    const cx = w / 2;
    // Timeline bar
    const barY = h * 0.12;
    const barLeft = w * 0.08, barRight = w * 0.92;
    const progT = interpolate(frame, [15, 240], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = a * 0.2;
    ctx.fillStyle = FB.text.dim;
    ctx.fillRect(barLeft, barY - 1 * sc, barRight - barLeft, 2 * sc);
    ctx.globalAlpha = a;
    ctx.fillStyle = FB.teal;
    ctx.fillRect(barLeft, barY - 1 * sc, (barRight - barLeft) * progT, 2 * sc);
    ctx.globalAlpha = 1;
    // Year markers
    for (let y = 0; y < 4; y++) {
      const yPos = barLeft + ((y + 1) / 4) * (barRight - barLeft);
      const yT = progT * 4 - y;
      if (yT > 0) {
        drawFBText(ctx, `Y${y + 1}`, yPos, barY + 12 * sc, 8 * sc, a * Math.min(1, yT), "center", FB.teal);
        // Dot on bar
        ctx.globalAlpha = a * Math.min(1, yT);
        ctx.fillStyle = FB.teal;
        ctx.beginPath(); ctx.arc(yPos, barY, 3 * sc, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = 1;
      }
    }
    // People in each year zone — more each year
    const rng = seeded(1980);
    for (let y = 0; y < 4; y++) {
      const yearStart = y / 4, yearEnd = (y + 1) / 4;
      if (progT < yearStart) continue;
      const yearProg = Math.min(1, (progT - yearStart) / 0.25);
      const peopleInYear = Math.floor(yearProg * (4 + y * 3));
      const zoneLeft = barLeft + yearStart * (barRight - barLeft);
      const zoneRight = barLeft + yearEnd * (barRight - barLeft);
      for (let p = 0; p < peopleInYear; p++) {
        const px = zoneLeft + rng() * (zoneRight - zoneLeft);
        const py = h * 0.3 + rng() * h * 0.55;
        drawPersonBlob(ctx, px, py, (7 + rng() * 4) * sc, Math.floor(rng() * 8), a * yearProg * 0.4);
      }
      // Building per year
      drawIconBuilding(ctx, (zoneLeft + zoneRight) / 2, h * 0.25, 12 * sc, FB.text.dim, a * yearProg * 0.3);
    }
    drawFBText(ctx, "4 YEARS", cx, h * 0.95, 10 * sc, a, "center", FB.text.dim);
  });
  return <canvas ref={ref} width={w} height={h} style={{ width: w, height: h }} />;
};

/* ── V9: Full narrative — error flashes → signal out → crowd arrives → huddle → fix → check ── */
const V9: React.FC<VariantProps> = ({ width: w, height: h }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  const sc = Math.min(w, h) / 360;
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, w, h, frame); const a = fadeInOut(frame, DUR);
    const cx = w / 2, cy = h / 2;
    // Phase timing
    const errorT = interpolate(frame, [5, 25], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const signalT = interpolate(frame, [25, 55], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const crowdT = interpolate(frame, [50, 150], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const fixT = interpolate(frame, [170, 220], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    // Connection
    if (fixT < 1) drawBroken(ctx, cx - 45 * sc, cy, cx + 45 * sc, cy, sc, a * errorT * (1 - fixT), frame);
    if (fixT > 0) drawFixed(ctx, cx - 45 * sc, cy, cx + 45 * sc, cy, sc, a * fixT);
    // Signal rings
    if (signalT > 0 && crowdT < 0.5) {
      for (let r = 0; r < 3; r++) {
        const rAge = signalT * 30 - r * 7;
        if (rAge < 0) continue;
        const ringR = Math.max(0, rAge * 3 * sc);
        ctx.globalAlpha = a * Math.max(0, 1 - rAge / 25) * 0.1;
        ctx.strokeStyle = FB.teal; ctx.lineWidth = 1.5 * sc;
        ctx.beginPath(); ctx.arc(cx, cy, ringR, 0, Math.PI * 2); ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }
    // Crowd arrives
    if (crowdT > 0) {
      const rng = seeded(1990);
      const count = Math.floor(crowdT * 35);
      for (let i = 0; i < count; i++) {
        const edge = Math.floor(rng() * 4);
        const sx = edge === 0 ? -15 * sc : edge === 1 ? w + 15 * sc : rng() * w;
        const sy = edge === 2 ? -15 * sc : edge === 3 ? h + 15 * sc : rng() * h;
        const angle = rng() * Math.PI * 2;
        const hR = 45 * sc + rng() * 30 * sc;
        const tx = cx + Math.cos(angle) * hR;
        const ty = cy + Math.sin(angle) * hR * 0.65;
        const delay = rng() * 0.5;
        const pt = Math.min(1, Math.max(0, (crowdT - delay) * 3));
        const pE = pt * pt * (3 - 2 * pt);
        const px = sx + (tx - sx) * pE;
        const py = sy + (ty - sy) * pE;
        const bob = Math.sin(frame * 0.03 + i * 0.7) * 2 * sc;
        drawPersonBlob(ctx, px, py + bob, (8 + rng() * 5) * sc, Math.floor(rng() * 8), a * pt * 0.4);
      }
    }
    // Buildings
    drawIconBuilding(ctx, w * 0.06, h * 0.06, 14 * sc, FB.text.dim, a * crowdT * 0.3);
    drawIconBuilding(ctx, w * 0.94, h * 0.06, 14 * sc, FB.text.dim, a * crowdT * 0.3);
    // Counter
    if (crowdT > 0.15) drawFBCounter(ctx, Math.round(crowdT * 200) + "+", cx, h * 0.06, 11 * sc, FB.teal, a * 0.5);
    // Final check
    if (fixT > 0.8) drawIconCheckCircle(ctx, cx, h * 0.93, 14 * sc, FB.green, a * (fixT - 0.8) * 5);
  });
  return <canvas ref={ref} width={w} height={h} style={{ width: w, height: h }} />;
};

export const VARIANTS_FB_019: VariantDef[] = [
  { id: "fb019-v1", label: "Single Huddle", component: V1 },
  { id: "fb019-v2", label: "Three Teams", component: V2 },
  { id: "fb019-v3", label: "Wave Sweep", component: V3 },
  { id: "fb019-v4", label: "Crowd Grows", component: V4 },
  { id: "fb019-v5", label: "Queue + Fix", component: V5 },
  { id: "fb019-v6", label: "Ring Closes In", component: V6 },
  { id: "fb019-v7", label: "Labs Send Workers", component: V7 },
  { id: "fb019-v8", label: "Timeline 4 Years", component: V8 },
  { id: "fb019-v9", label: "Full Narrative", component: V9 },
];
