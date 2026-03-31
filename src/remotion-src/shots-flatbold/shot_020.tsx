// Shot 020 — "That proofreading alone would have taken one person 33 years of full-time work."
// Duration: 120 frames (4s at 30fps)
// CONCEPT: Show the scale — one person vs 33 years. Make the NUMBER feel massive.
// 9 genuinely different visual metaphors

import React, { useRef, useEffect } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantDef, VariantProps } from "../types";
import {
  FB, seeded, drawFBBg, drawFBText, drawFBCounter,
  fadeInOut, drawPersonBlob, drawIconPerson, drawFBBar,
} from "./flatbold-kit";

const DUR = 120;

/* ── V1: Lone person + "33 YEARS" text that grows absurdly large ── */
const V1: React.FC<VariantProps> = ({ width: w, height: h }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  const sc = Math.min(w, h) / 360;
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, w, h, frame); const a = fadeInOut(frame, DUR);
    const cx = w / 2;
    // Small lone person at bottom left
    const personT = interpolate(frame, [5, 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawPersonBlob(ctx, w * 0.15, h * 0.75, 16 * sc, 5, a * personT);
    // "33 YEARS" grows from small to dominating
    const growT = interpolate(frame, [20, 80], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const fontSize = (12 + growT * 40) * sc;
    const textY = h * 0.4 - growT * h * 0.05;
    drawFBText(ctx, "33", cx + w * 0.1, textY, fontSize * 1.5, a * growT, "center", FB.red);
    const yearsT = interpolate(frame, [40, 60], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "YEARS", cx + w * 0.1, textY + fontSize * 0.9, fontSize * 0.4, a * yearsT, "center", FB.text.dim);
    // Tiny "1 person" label
    drawFBText(ctx, "1 person", w * 0.15, h * 0.88, 8 * sc, a * personT * 0.6, "center", FB.text.dim);
  });
  return <canvas ref={ref} width={w} height={h} style={{ width: w, height: h }} />;
};

/* ── V2: Counter spinning up from 0 to 33 — numbers whipping by ── */
const V2: React.FC<VariantProps> = ({ width: w, height: h }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  const sc = Math.min(w, h) / 360;
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, w, h, frame); const a = fadeInOut(frame, DUR);
    const cx = w / 2, cy = h * 0.4;
    // Lone person
    drawPersonBlob(ctx, cx, h * 0.15, 14 * sc, 5, a * 0.7);
    // Counter spinning up
    const countT = interpolate(frame, [15, 85], [0, 33], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const displayVal = Math.floor(countT);
    const isFinal = displayVal >= 33;
    const fontSize = isFinal ? 40 * sc : 32 * sc;
    const color = isFinal ? FB.red : FB.gold;
    drawFBCounter(ctx, displayVal, cx, cy, fontSize, color, a);
    drawFBText(ctx, "YEARS", cx, cy + fontSize * 0.6, 12 * sc, a * 0.7, "center", FB.text.dim);
    // Trailing blur effect for spinning numbers
    if (!isFinal && frame > 15) {
      for (let trail = 1; trail <= 3; trail++) {
        const trailVal = Math.max(0, displayVal - trail);
        const trailA = 0.15 / trail;
        drawFBCounter(ctx, trailVal, cx, cy + trail * 4 * sc, 28 * sc, FB.text.dim, a * trailA);
      }
    }
    // "FULL-TIME" label at bottom
    if (isFinal) {
      const finalT = interpolate(frame, [85, 100], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      drawFBText(ctx, "FULL-TIME WORK", cx, h * 0.88, 10 * sc, a * finalT, "center", FB.red);
    }
  });
  return <canvas ref={ref} width={w} height={h} style={{ width: w, height: h }} />;
};

/* ── V3: Hourglass draining — sand falls for 33 "years" ── */
const V3: React.FC<VariantProps> = ({ width: w, height: h }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  const sc = Math.min(w, h) / 360;
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, w, h, frame); const a = fadeInOut(frame, DUR);
    const cx = w / 2, cy = h / 2;
    const glassW = 35 * sc, glassH = 80 * sc;
    const top = cy - glassH / 2, bot = cy + glassH / 2;
    const drainT = interpolate(frame, [15, 95], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    // Hourglass outline
    ctx.globalAlpha = a * 0.5;
    ctx.strokeStyle = FB.gold; ctx.lineWidth = 2 * sc; ctx.lineCap = "round";
    ctx.beginPath();
    // Top triangle
    ctx.moveTo(cx - glassW, top); ctx.lineTo(cx + glassW, top);
    ctx.lineTo(cx, cy); ctx.lineTo(cx - glassW, top);
    ctx.moveTo(cx - glassW, bot); ctx.lineTo(cx + glassW, bot);
    ctx.lineTo(cx, cy); ctx.lineTo(cx - glassW, bot);
    ctx.stroke();
    ctx.globalAlpha = 1;
    // Top sand (shrinks)
    const topSandH = glassH * 0.4 * (1 - drainT);
    if (topSandH > 0) {
      ctx.globalAlpha = a * 0.4;
      ctx.fillStyle = FB.gold;
      const topSandW = glassW * (1 - drainT) * 0.8;
      ctx.beginPath();
      ctx.moveTo(cx - topSandW, top + 5 * sc);
      ctx.lineTo(cx + topSandW, top + 5 * sc);
      ctx.lineTo(cx, top + 5 * sc + topSandH);
      ctx.closePath(); ctx.fill();
    }
    // Bottom sand (grows)
    const botSandH = glassH * 0.4 * drainT;
    if (botSandH > 0) {
      ctx.globalAlpha = a * 0.4;
      ctx.fillStyle = FB.gold;
      const botSandW = glassW * drainT * 0.8;
      ctx.beginPath();
      ctx.moveTo(cx, bot - botSandH);
      ctx.lineTo(cx - botSandW, bot - 3 * sc);
      ctx.lineTo(cx + botSandW, bot - 3 * sc);
      ctx.closePath(); ctx.fill();
    }
    // Falling stream in middle
    if (drainT > 0 && drainT < 1) {
      ctx.globalAlpha = a * 0.3;
      ctx.fillStyle = FB.gold;
      ctx.fillRect(cx - 1 * sc, cy - 3 * sc, 2 * sc, 6 * sc);
    }
    ctx.globalAlpha = 1;
    // Counter
    const years = Math.floor(drainT * 33);
    drawFBCounter(ctx, years, cx, h * 0.12, 16 * sc, years >= 33 ? FB.red : FB.gold, a);
    drawFBText(ctx, "YEARS", cx, h * 0.2, 9 * sc, a * 0.6, "center", FB.text.dim);
    // Lone person
    drawPersonBlob(ctx, w * 0.85, h * 0.85, 12 * sc, 5, a * 0.5);
  });
  return <canvas ref={ref} width={w} height={h} style={{ width: w, height: h }} />;
};

/* ── V4: Timeline bar absurdly long — extends way past the screen ── */
const V4: React.FC<VariantProps> = ({ width: w, height: h }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  const sc = Math.min(w, h) / 360;
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, w, h, frame); const a = fadeInOut(frame, DUR);
    const cx = w / 2, barY = h * 0.5;
    // Person at left
    drawPersonBlob(ctx, w * 0.05, barY - 25 * sc, 12 * sc, 5, a * 0.7);
    // Bar extends rightward
    const barT = interpolate(frame, [15, 90], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const barW = barT * w * 3; // Way past screen edge
    ctx.globalAlpha = a * 0.2;
    ctx.fillStyle = FB.text.dim;
    ctx.fillRect(w * 0.05, barY - 4 * sc, Math.min(barW, w * 0.95), 8 * sc);
    ctx.globalAlpha = a;
    ctx.fillStyle = FB.red;
    ctx.fillRect(w * 0.05, barY - 4 * sc, Math.min(barW, w * 0.95), 8 * sc);
    ctx.globalAlpha = 1;
    // Year tick marks
    for (let y = 0; y <= 33; y += 5) {
      const xPos = w * 0.05 + (y / 33) * barW;
      if (xPos > w + 10) break;
      if (xPos < 0) continue;
      const tickA = xPos < w ? 1 : 0;
      drawFBText(ctx, `${y}`, xPos, barY + 14 * sc, 7 * sc, a * tickA * 0.5, "center", FB.text.dim);
      ctx.globalAlpha = a * tickA * 0.3;
      ctx.fillStyle = FB.text.dim;
      ctx.fillRect(xPos, barY - 6 * sc, 1 * sc, 12 * sc);
      ctx.globalAlpha = 1;
    }
    // Arrow indicating "continues off-screen"
    if (barW > w * 0.9) {
      ctx.globalAlpha = a * 0.6;
      ctx.fillStyle = FB.red;
      ctx.beginPath();
      ctx.moveTo(w - 5 * sc, barY - 10 * sc);
      ctx.lineTo(w + 5 * sc, barY);
      ctx.lineTo(w - 5 * sc, barY + 10 * sc);
      ctx.closePath(); ctx.fill();
      ctx.globalAlpha = 1;
    }
    drawFBCounter(ctx, "33 YEARS", cx, h * 0.15, 16 * sc, FB.red, a * barT);
  });
  return <canvas ref={ref} width={w} height={h} style={{ width: w, height: h }} />;
};

/* ── V5: Calendar pages flying — pages peel off rapidly, year counter increments ── */
const V5: React.FC<VariantProps> = ({ width: w, height: h }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  const sc = Math.min(w, h) / 360;
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, w, h, frame); const a = fadeInOut(frame, DUR);
    const cx = w / 2, cy = h * 0.45;
    // Lone person watching
    drawPersonBlob(ctx, w * 0.12, h * 0.8, 14 * sc, 5, a * 0.6);
    // Calendar pages fly off
    const flyT = interpolate(frame, [15, 90], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const pageCount = 12;
    const visiblePages = Math.floor(flyT * pageCount);
    for (let i = Math.max(0, visiblePages - 5); i <= visiblePages && i < pageCount; i++) {
      const pageAge = visiblePages - i;
      const flyOff = pageAge * 10 * sc;
      const fadeOut = Math.max(0, 1 - pageAge * 0.2);
      const px = cx - 22 * sc + flyOff * 0.3;
      const py = cy - 20 * sc - flyOff;
      const pw = 44 * sc, ph = 35 * sc;
      if (py < -ph || fadeOut <= 0) continue;
      ctx.globalAlpha = a * fadeOut * 0.3;
      ctx.fillStyle = FB.bg;
      ctx.fillRect(px, py, pw, ph);
      ctx.globalAlpha = a * fadeOut * 0.6;
      ctx.strokeStyle = FB.text.dim; ctx.lineWidth = 1 * sc;
      ctx.strokeRect(px, py, pw, ph);
      const year = 2024 + Math.floor(i * 33 / pageCount);
      drawFBText(ctx, `${year}`, px + pw / 2, py + ph / 2, 9 * sc, a * fadeOut * 0.5, "center", FB.text.primary);
    }
    // Year counter
    const yearCount = interpolate(frame, [15, 90], [0, 33], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBCounter(ctx, Math.floor(yearCount), cx, h * 0.82, 20 * sc, yearCount >= 33 ? FB.red : FB.gold, a);
    drawFBText(ctx, "YEARS", cx, h * 0.92, 10 * sc, a * 0.6, "center", FB.text.dim);
  });
  return <canvas ref={ref} width={w} height={h} style={{ width: w, height: h }} />;
};

/* ── V6: Person aging — silhouette with growing number, hair graying metaphor ── */
const V6: React.FC<VariantProps> = ({ width: w, height: h }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  const sc = Math.min(w, h) / 360;
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, w, h, frame); const a = fadeInOut(frame, DUR);
    const cx = w / 2, cy = h * 0.5;
    // Person in center, slightly larger
    drawPersonBlob(ctx, cx, cy, 28 * sc, 5, a * 0.7);
    // Age counter above
    const ageT = interpolate(frame, [10, 85], [0, 33], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const displayAge = Math.floor(ageT);
    const isFinal = displayAge >= 33;
    // Years accumulating as concentric rings around the person
    for (let y = 0; y < displayAge; y++) {
      const ringR = (35 + y * 3.5) * sc;
      const ringAlpha = 0.04 + (y / 33) * 0.06;
      ctx.globalAlpha = a * ringAlpha;
      ctx.strokeStyle = y > 25 ? FB.red : FB.gold;
      ctx.lineWidth = 1 * sc;
      ctx.beginPath(); ctx.arc(cx, cy, ringR, 0, Math.PI * 2); ctx.stroke();
    }
    ctx.globalAlpha = 1;
    drawFBCounter(ctx, displayAge, cx, h * 0.12, 22 * sc, isFinal ? FB.red : FB.gold, a);
    drawFBText(ctx, "YEARS", cx, h * 0.22, 10 * sc, a * 0.6, "center", FB.text.dim);
    if (isFinal) {
      const finalT = interpolate(frame, [85, 100], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      drawFBText(ctx, "ONE PERSON", cx, h * 0.9, 11 * sc, a * finalT, "center", FB.red);
    }
  });
  return <canvas ref={ref} width={w} height={h} style={{ width: w, height: h }} />;
};

/* ── V7: Scale comparison — tiny person icon vs massive "33" filling the screen ── */
const V7: React.FC<VariantProps> = ({ width: w, height: h }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  const sc = Math.min(w, h) / 360;
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, w, h, frame); const a = fadeInOut(frame, DUR);
    // Tiny person at bottom left
    const personT = interpolate(frame, [5, 15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawPersonBlob(ctx, w * 0.08, h * 0.85, 10 * sc, 5, a * personT);
    // "=" sign
    const eqT = interpolate(frame, [15, 25], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "=", w * 0.16, h * 0.85, 14 * sc, a * eqT, "center", FB.text.dim);
    // "33" grows to fill most of the canvas
    const numT = interpolate(frame, [25, 75], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const numSize = (20 + numT * 80) * sc;
    const numY = h * 0.5 - numT * h * 0.05;
    ctx.globalAlpha = a * numT * 0.08;
    ctx.fillStyle = FB.red;
    ctx.font = `bold ${numSize * 1.2}px 'Courier New', monospace`;
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText("33", w / 2, numY);
    ctx.globalAlpha = 1;
    drawFBText(ctx, "33", w / 2, numY, numSize, a * numT, "center", FB.red);
    // "YEARS" after number settles
    if (numT > 0.7) {
      const yT = (numT - 0.7) / 0.3;
      drawFBText(ctx, "YEARS", w / 2, numY + numSize * 0.5, numSize * 0.2, a * yT, "center", FB.text.dim);
    }
  });
  return <canvas ref={ref} width={w} height={h} style={{ width: w, height: h }} />;
};

/* ── V8: Stacked blocks — 33 blocks pile up, each labeled "1 YEAR", tower gets absurdly tall ── */
const V8: React.FC<VariantProps> = ({ width: w, height: h }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  const sc = Math.min(w, h) / 360;
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, w, h, frame); const a = fadeInOut(frame, DUR);
    const cx = w / 2;
    // Person at bottom right
    drawPersonBlob(ctx, w * 0.82, h * 0.85, 14 * sc, 5, a * 0.6);
    // Blocks stacking
    const stackT = interpolate(frame, [10, 90], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const totalBlocks = Math.floor(stackT * 33);
    const blockH = 6 * sc;
    const blockW = 40 * sc;
    const baseY = h * 0.88;
    // Scroll offset so the stack stays partially visible
    const scrollOffset = Math.max(0, totalBlocks * blockH - h * 0.75);
    for (let b = 0; b < totalBlocks; b++) {
      const by = baseY - (b + 1) * blockH + scrollOffset;
      if (by < -blockH || by > h) continue;
      const [hue] = [350 + (b / 33) * 30]; // red-shifting
      ctx.globalAlpha = a * 0.6;
      ctx.fillStyle = `hsla(${350 - b * 2}, 60%, ${55 - b * 0.5}%, 0.6)`;
      ctx.fillRect(cx - blockW / 2, by, blockW, blockH - 1 * sc);
      if (b % 5 === 0) {
        drawFBText(ctx, `${b + 1}`, cx, by + blockH / 2, 5 * sc, a * 0.4, "center", FB.text.primary);
      }
    }
    ctx.globalAlpha = 1;
    drawFBCounter(ctx, totalBlocks, cx, h * 0.06, 16 * sc, totalBlocks >= 33 ? FB.red : FB.gold, a);
    drawFBText(ctx, "YEARS", cx, h * 0.14, 9 * sc, a * 0.6, "center", FB.text.dim);
  });
  return <canvas ref={ref} width={w} height={h} style={{ width: w, height: h }} />;
};

/* ── V9: Weight of time — person beneath a crushing "33" that presses down ── */
const V9: React.FC<VariantProps> = ({ width: w, height: h }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  const sc = Math.min(w, h) / 360;
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, w, h, frame); const a = fadeInOut(frame, DUR);
    const cx = w / 2;
    // Person at bottom center
    const personY = h * 0.78;
    drawPersonBlob(ctx, cx, personY, 16 * sc, 5, a * 0.7);
    // "33 YEARS" descends from above
    const dropT = interpolate(frame, [10, 50], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const dropEase = dropT < 0.8 ? (dropT / 0.8) * (dropT / 0.8) : 1 - Math.sin((dropT - 0.8) / 0.2 * Math.PI * 2) * 0.05;
    const numY = -30 * sc + dropEase * (personY - 55 * sc + 30 * sc);
    // Shadow beneath number gets darker as it descends
    ctx.globalAlpha = a * dropT * 0.1;
    ctx.fillStyle = FB.red;
    ctx.beginPath();
    ctx.ellipse(cx, personY - 15 * sc, 50 * sc, 8 * sc * dropT, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
    drawFBText(ctx, "33", cx, numY, 36 * sc, a * dropT, "center", FB.red);
    drawFBText(ctx, "YEARS", cx, numY + 22 * sc, 12 * sc, a * dropT * 0.7, "center", FB.text.dim);
    // Stress lines radiating from person
    if (dropT > 0.8) {
      const stressA = (dropT - 0.8) / 0.2;
      for (let i = 0; i < 6; i++) {
        const angle = -Math.PI / 2 + (i - 2.5) * 0.3;
        const len = (5 + stressA * 8) * sc;
        const sx = cx + Math.cos(angle) * 20 * sc;
        const sy = personY + Math.sin(angle) * 15 * sc;
        ctx.globalAlpha = a * stressA * 0.3;
        ctx.strokeStyle = FB.red; ctx.lineWidth = 1 * sc; ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(sx + Math.cos(angle) * len, sy + Math.sin(angle) * len);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }
  });
  return <canvas ref={ref} width={w} height={h} style={{ width: w, height: h }} />;
};

export const VARIANTS_FB_020: VariantDef[] = [
  { id: "fb020-v1", label: "Lone Person + Growing 33", component: V1 },
  { id: "fb020-v2", label: "Counter Spins to 33", component: V2 },
  { id: "fb020-v3", label: "Hourglass Draining", component: V3 },
  { id: "fb020-v4", label: "Absurdly Long Timeline", component: V4 },
  { id: "fb020-v5", label: "Calendar Pages Flying", component: V5 },
  { id: "fb020-v6", label: "Person Aging Rings", component: V6 },
  { id: "fb020-v7", label: "Tiny Person vs Giant 33", component: V7 },
  { id: "fb020-v8", label: "Year Blocks Stacking", component: V8 },
  { id: "fb020-v9", label: "Crushing Weight of Time", component: V9 },
];
