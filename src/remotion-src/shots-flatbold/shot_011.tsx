// Shot 011 — "Each slice was forty nanometers thick. If you stacked a thousand of these on top
//   of each other, the pile would still be thinner than a human hair. Each slice was"
// Duration: 136 frames (~4.5s)
// STARTS from FB-010: neat stack of amber slices on the right
// Shows: how thin 40nm is — zoom into one slice, compare 1000 stacked vs a hair
// 9 unique variations

import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantDef, VariantProps } from "../types";
import {
  FB, seeded, drawFBBg, drawFBNode, drawFBText, drawFBCounter,
  fadeInOut, cellHSL,
} from "./flatbold-kit";

const DUR = 136;

/** Draw a stack of amber slices */
function drawSliceStack(ctx: CanvasRenderingContext2D, cx: number, cy: number, stackW: number, sliceH: number, count: number, totalH: number, sc: number, alpha: number) {
  const [rh, rs, rl] = cellHSL(2);
  const gap = Math.max(0.5, (totalH - count * sliceH) / Math.max(1, count - 1));
  const startY = cy - totalH / 2;
  for (let i = 0; i < count; i++) {
    const y = startY + i * (sliceH + gap);
    ctx.globalAlpha = alpha * 0.4;
    ctx.fillStyle = `hsla(${rh},${rs + 5}%,${rl + (i % 2) * 4}%,0.35)`;
    ctx.fillRect(cx - stackW / 2, y, stackW, sliceH);
    ctx.strokeStyle = `hsla(${rh},${rs}%,${rl + 18}%,${alpha * 0.3})`;
    ctx.lineWidth = Math.max(0.3, 0.5 * sc);
    ctx.strokeRect(cx - stackW / 2, y, stackW, sliceH);
  }
  ctx.globalAlpha = 1;
}

/** Draw a hair cross-section for scale comparison */
function drawHair(ctx: CanvasRenderingContext2D, cx: number, cy: number, radius: number, sc: number, alpha: number) {
  ctx.globalAlpha = alpha;
  const g = ctx.createRadialGradient(cx - radius * 0.15, cy - radius * 0.15, 0, cx, cy, radius);
  g.addColorStop(0, `rgba(180, 150, 100, ${alpha * 0.7})`);
  g.addColorStop(0.6, `rgba(140, 110, 70, ${alpha * 0.6})`);
  g.addColorStop(1, `rgba(100, 75, 45, ${alpha * 0.4})`);
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(cx, cy, radius, 0, Math.PI * 2); ctx.fill();
  // Highlight
  ctx.fillStyle = `rgba(255,255,255,${alpha * 0.1})`;
  ctx.beginPath(); ctx.arc(cx - radius * 0.25, cy - radius * 0.25, radius * 0.3, 0, Math.PI * 2); ctx.fill();
  ctx.globalAlpha = 1;
}

/* ── V1: Zoom into one slice — shows "40nm" label, then 1000 stacked vs hair circle ── */
const V1: React.FC<VariantProps> = ({ width: w, height: h }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  const sc = Math.min(w, h) / 360;
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, w, h, frame); const a = fadeInOut(frame, DUR);
    const cx = w / 2, cy = h / 2;

    // Stack fades from FB-010 ending
    const stackFade = interpolate(frame, [0, 25], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (stackFade > 0) drawSliceStack(ctx, w * 0.72, cy, 100 * sc, 3 * sc, 15, 120 * sc, sc, a * stackFade);

    // Single slice zooms to center and grows
    const zoomT = interpolate(frame, [10, 45], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const zoomE = zoomT * zoomT * (3 - 2 * zoomT);
    if (zoomT > 0) {
      const sliceW = interpolate(zoomE, [0, 1], [30, 200]) * sc;
      const sliceH = interpolate(zoomE, [0, 1], [3, 8]) * sc;
      const [rh, rs, rl] = cellHSL(2);
      ctx.globalAlpha = a * zoomE * 0.5;
      ctx.fillStyle = `hsla(${rh},${rs + 5}%,${rl + 5}%,0.4)`;
      ctx.fillRect(cx - sliceW / 2, cy - sliceH / 2, sliceW, sliceH);
      ctx.strokeStyle = `hsla(${rh},${rs}%,${rl + 18}%,${a * zoomE * 0.5})`;
      ctx.lineWidth = Math.max(1, 1.5 * sc);
      ctx.strokeRect(cx - sliceW / 2, cy - sliceH / 2, sliceW, sliceH);
      ctx.globalAlpha = 1;
    }

    // Comparison: left = 1000 slices stacked, right = hair cross-section
    const compT = interpolate(frame, [50, 80], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (compT > 0) {
      const compE = compT * compT * (3 - 2 * compT);
      // Left: tiny stack of 1000 (represented as a thin bar)
      const stackTotalH = 25 * sc; // 1000 × 40nm = 40μm, drawn as small bar
      ctx.globalAlpha = a * compE * 0.5;
      const [rh, rs, rl] = cellHSL(2);
      ctx.fillStyle = `hsla(${rh},${rs + 5}%,${rl}%,0.4)`;
      ctx.fillRect(w * 0.3 - 40 * sc, cy - stackTotalH / 2, 80 * sc, stackTotalH);
      ctx.strokeStyle = `hsla(${rh},${rs}%,${rl + 15}%,${a * compE * 0.4})`;
      ctx.lineWidth = 1 * sc;
      ctx.strokeRect(w * 0.3 - 40 * sc, cy - stackTotalH / 2, 80 * sc, stackTotalH);
      ctx.globalAlpha = 1;

      // Right: hair cross-section (much bigger!)
      const hairR = 55 * sc * compE;
      drawHair(ctx, w * 0.7, cy, hairR, sc, a * compE);

      // Labels
      if (compE > 0.5) {
        const lA = (compE - 0.5) * 2;
        drawFBText(ctx, "1,000 slices", w * 0.3, cy + stackTotalH / 2 + 16 * sc, 9 * sc, a * lA * 0.5, "center", FB.teal);
        drawFBText(ctx, "human hair", w * 0.7, cy + hairR + 16 * sc, 9 * sc, a * lA * 0.5, "center", FB.text.dim);
        // "< smaller" arrow
        drawFBText(ctx, "<", w * 0.5, cy, 20 * sc, a * lA * 0.4, "center", FB.teal);
      }
    }
  });
  return <canvas ref={ref} width={w} height={h} style={{ width: w, height: h }} />;
};

/* ── V2: Bar comparison — two vertical bars side by side, 1000 slices bar barely visible vs hair bar ── */
const V2: React.FC<VariantProps> = ({ width: w, height: h }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  const sc = Math.min(w, h) / 360;
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, w, h, frame); const a = fadeInOut(frame, DUR);
    const cx = w / 2, cy = h / 2;

    const revT = interpolate(frame, [10, 50], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const revE = revT * revT * (3 - 2 * revT);

    // Hair bar (big, brown) on right
    const hairH = 140 * sc * revE;
    const barW = 50 * sc;
    if (hairH > 1) {
      const g = ctx.createLinearGradient(w * 0.65, cy - hairH / 2, w * 0.65, cy + hairH / 2);
      g.addColorStop(0, `rgba(180,150,100,${a * 0.5})`);
      g.addColorStop(1, `rgba(120,90,55,${a * 0.4})`);
      ctx.fillStyle = g;
      ctx.fillRect(w * 0.65 - barW / 2, cy - hairH / 2, barW, hairH);
      ctx.strokeStyle = `rgba(160,130,85,${a * 0.3})`;
      ctx.lineWidth = 1.5 * sc;
      ctx.strokeRect(w * 0.65 - barW / 2, cy - hairH / 2, barW, hairH);
    }

    // 1000 slices bar (tiny! ~70μm vs ~75μm hair) on left
    const sliceBarH = Math.max(2, 6 * sc * revE); // intentionally tiny
    const [rh, rs, rl] = cellHSL(2);
    if (revE > 0) {
      ctx.globalAlpha = a * revE * 0.5;
      ctx.fillStyle = `hsla(${rh},${rs + 5}%,${rl}%,0.5)`;
      ctx.fillRect(w * 0.35 - barW / 2, cy - sliceBarH / 2, barW, sliceBarH);
      ctx.strokeStyle = `hsla(${rh},${rs}%,${rl + 15}%,${a * revE * 0.4})`;
      ctx.lineWidth = 1 * sc;
      ctx.strokeRect(w * 0.35 - barW / 2, cy - sliceBarH / 2, barW, sliceBarH);
      ctx.globalAlpha = 1;
    }

    // Labels
    if (revE > 0.5) {
      const lA = (revE - 0.5) * 2;
      drawFBText(ctx, "1,000 slices", w * 0.35, cy + 25 * sc, 9 * sc, a * lA * 0.5, "center", FB.teal);
      drawFBText(ctx, "40nm each", w * 0.35, cy + 38 * sc, 7 * sc, a * lA * 0.3, "center", FB.text.dim);
      drawFBText(ctx, "human hair", w * 0.65, cy + hairH / 2 + 16 * sc, 9 * sc, a * lA * 0.5, "center", FB.text.dim);
      drawFBText(ctx, "~75,000nm", w * 0.65, cy + hairH / 2 + 29 * sc, 7 * sc, a * lA * 0.3, "center", FB.text.dim);
    }

    // Bracket showing the absurd scale difference
    if (revE > 0.7) {
      const bA = (revE - 0.7) / 0.3;
      ctx.globalAlpha = a * bA * 0.3;
      ctx.strokeStyle = FB.teal; ctx.lineWidth = 1 * sc;
      ctx.setLineDash([3 * sc, 2 * sc]);
      ctx.beginPath();
      ctx.moveTo(w * 0.35 + barW / 2 + 5 * sc, cy);
      ctx.lineTo(w * 0.65 - barW / 2 - 5 * sc, cy);
      ctx.stroke();
      ctx.setLineDash([]); ctx.globalAlpha = 1;
    }
  });
  return <canvas ref={ref} width={w} height={h} style={{ width: w, height: h }} />;
};

/* ── V3: Stacking animation — slices stack one by one, counter climbs to 1000, hair appears for comparison ── */
const V3: React.FC<VariantProps> = ({ width: w, height: h }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  const sc = Math.min(w, h) / 360;
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, w, h, frame); const a = fadeInOut(frame, DUR);
    const cx = w * 0.4, cy = h / 2;

    // Slices stacking (accelerating)
    const stackT = interpolate(frame, [5, 85], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const count = Math.floor(stackT * stackT * 30); // accelerating count (represents 1000)
    const displayCount = Math.round(stackT * stackT * 1000);
    const stackH = 30 * sc; // total visual height of the stack (stays small = the point!)

    if (count > 0) {
      const sliceH = Math.max(0.5, stackH / count);
      drawSliceStack(ctx, cx, cy, 120 * sc, sliceH, Math.min(count, 50), stackH, sc, a);
    }

    // Counter
    if (stackT > 0.05) {
      drawFBCounter(ctx, displayCount.toLocaleString("en-US"), cx, cy - stackH / 2 - 20 * sc, 14 * sc, FB.teal, a * 0.7);
      drawFBText(ctx, "slices stacked", cx, cy - stackH / 2 - 6 * sc, 7 * sc, a * 0.3, "center", FB.text.dim);
    }

    // Hair appears for comparison
    const hairT = interpolate(frame, [70, 95], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (hairT > 0) {
      const hairR = 50 * sc * hairT;
      drawHair(ctx, w * 0.75, cy, hairR, sc, a * hairT);
      if (hairT > 0.5) {
        drawFBText(ctx, "still thinner", cx + 60 * sc, cy + stackH / 2 + 18 * sc, 10 * sc, a * (hairT - 0.5) * 2 * 0.5, "center", FB.teal);
        drawFBText(ctx, "than this hair", cx + 60 * sc, cy + stackH / 2 + 32 * sc, 10 * sc, a * (hairT - 0.5) * 2 * 0.5, "center", FB.teal);
      }
    }
  });
  return <canvas ref={ref} width={w} height={h} style={{ width: w, height: h }} />;
};

/* ── V4: Hair with slices inside — cross-section of hair, 1000 slices stacked inside it with room to spare ── */
const V4: React.FC<VariantProps> = ({ width: w, height: h }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  const sc = Math.min(w, h) / 360;
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, w, h, frame); const a = fadeInOut(frame, DUR);
    const cx = w / 2, cy = h / 2;

    // Big hair cross-section
    const hairT = interpolate(frame, [5, 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const hairR = 90 * sc * hairT;
    drawHair(ctx, cx, cy, hairR, sc, a * hairT);

    // Slices fill inside the hair (but only take up a fraction)
    const fillT = interpolate(frame, [30, 90], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (fillT > 0) {
      const sliceCount = Math.floor(fillT * 25); // visual slices representing 1000
      const totalSliceH = hairR * 0.5; // they only take up ~half the hair diameter!
      const sliceH2 = totalSliceH / 25;
      const startY = cy - totalSliceH / 2;
      const [rh, rs, rl] = cellHSL(2);

      ctx.save();
      ctx.beginPath(); ctx.arc(cx, cy, Math.max(1, hairR - 3 * sc), 0, Math.PI * 2); ctx.clip();
      for (let i = 0; i < sliceCount; i++) {
        const y = startY + i * sliceH2;
        ctx.globalAlpha = a * fillT * 0.5;
        ctx.fillStyle = `hsla(${rh},${rs + 5}%,${rl + 5}%,0.4)`;
        ctx.fillRect(cx - hairR * 0.7, y, hairR * 1.4, sliceH2 * 0.8);
      }
      ctx.restore();
      ctx.globalAlpha = 1;

      // Counter inside
      if (fillT > 0.3) {
        const cA = (fillT - 0.3) / 0.7;
        drawFBCounter(ctx, Math.round(fillT * 1000).toLocaleString("en-US"), cx, cy + hairR + 20 * sc, 13 * sc, FB.teal, a * cA * 0.6);
        drawFBText(ctx, "slices fit inside one hair", cx, cy + hairR + 35 * sc, 8 * sc, a * cA * 0.3, "center", FB.text.dim);
      }
    }
  });
  return <canvas ref={ref} width={w} height={h} style={{ width: w, height: h }} />;
};

/* ── V5: Split — top: stack growing, bottom: hair for comparison, both at same scale ── */
const V5: React.FC<VariantProps> = ({ width: w, height: h }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  const sc = Math.min(w, h) / 360;
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, w, h, frame); const a = fadeInOut(frame, DUR);
    const cx = w / 2;

    // Divider
    ctx.globalAlpha = a * 0.15; ctx.strokeStyle = "rgba(255,255,255,0.3)"; ctx.lineWidth = 1 * sc;
    ctx.beginPath(); ctx.moveTo(w * 0.05, h / 2); ctx.lineTo(w * 0.95, h / 2); ctx.stroke(); ctx.globalAlpha = 1;

    // TOP: slice stack growing
    const stackT = interpolate(frame, [5, 80], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const topCy = h * 0.28;
    const stackH = 20 * sc; // tiny!
    const count = Math.floor(stackT * 20);
    if (count > 0) drawSliceStack(ctx, cx, topCy, 150 * sc, Math.max(0.5, stackH / count), count, stackH, sc, a);
    drawFBCounter(ctx, Math.round(stackT * 1000).toLocaleString("en-US"), cx, topCy - stackH / 2 - 18 * sc, 13 * sc, FB.teal, a * 0.6);

    // BOTTOM: hair at same visual scale
    const hairT = interpolate(frame, [30, 55], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const botCy = h * 0.72;
    const hairR = 60 * sc * hairT;
    drawHair(ctx, cx, botCy, hairR, sc, a * hairT);
    if (hairT > 0.5) drawFBText(ctx, "human hair", cx, botCy + hairR + 14 * sc, 9 * sc, a * (hairT - 0.5) * 2 * 0.4, "center", FB.text.dim);
  });
  return <canvas ref={ref} width={w} height={h} style={{ width: w, height: h }} />;
};

/* ── V6: Ruler — visual ruler showing 40nm marks, hair width marked for comparison ── */
const V6: React.FC<VariantProps> = ({ width: w, height: h }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  const sc = Math.min(w, h) / 360;
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, w, h, frame); const a = fadeInOut(frame, DUR);
    const cx = w / 2, cy = h / 2;

    // Ruler line
    const rulerT = interpolate(frame, [5, 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const rulerW = w * 0.8 * rulerT;
    ctx.globalAlpha = a * rulerT * 0.4;
    ctx.strokeStyle = "rgba(255,255,255,0.5)"; ctx.lineWidth = 1.5 * sc;
    ctx.beginPath(); ctx.moveTo(cx - rulerW / 2, cy); ctx.lineTo(cx + rulerW / 2, cy); ctx.stroke();
    ctx.globalAlpha = 1;

    // Slice mark (tiny)
    const sliceMarkT = interpolate(frame, [25, 45], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (sliceMarkT > 0) {
      const sliceMarkW = 2 * sc; // barely visible
      const [rh, rs, rl] = cellHSL(2);
      ctx.globalAlpha = a * sliceMarkT * 0.6;
      ctx.fillStyle = `hsla(${rh},${rs + 5}%,${rl + 5}%,0.5)`;
      ctx.fillRect(cx - rulerW / 2 + 10 * sc, cy - 20 * sc, sliceMarkW, 40 * sc);
      ctx.globalAlpha = 1;
      drawFBText(ctx, "40nm", cx - rulerW / 2 + 10 * sc, cy - 28 * sc, 8 * sc, a * sliceMarkT * 0.5, "center", FB.teal);
    }

    // Hair mark (large)
    const hairMarkT = interpolate(frame, [45, 70], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (hairMarkT > 0) {
      const hairMarkW = 100 * sc * hairMarkT;
      ctx.globalAlpha = a * hairMarkT * 0.3;
      ctx.fillStyle = "rgba(180,150,100,0.3)";
      ctx.fillRect(cx + rulerW * 0.1, cy - 25 * sc, hairMarkW, 50 * sc);
      ctx.strokeStyle = "rgba(160,130,85,0.4)"; ctx.lineWidth = 1 * sc;
      ctx.strokeRect(cx + rulerW * 0.1, cy - 25 * sc, hairMarkW, 50 * sc);
      ctx.globalAlpha = 1;
      drawFBText(ctx, "hair: ~75,000nm", cx + rulerW * 0.1 + hairMarkW / 2, cy + 35 * sc, 8 * sc, a * hairMarkT * 0.4, "center", FB.text.dim);
    }
  });
  return <canvas ref={ref} width={w} height={h} style={{ width: w, height: h }} />;
};

/* ── V7: Zoom progression — shows slice, then 10 stacked, 100, 1000, all still smaller than hair ── */
const V7: React.FC<VariantProps> = ({ width: w, height: h }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  const sc = Math.min(w, h) / 360;
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, w, h, frame); const a = fadeInOut(frame, DUR);
    const cy = h / 2;

    // 4 stages across the screen
    const stages = [
      { label: "1", count: 1, x: w * 0.15, start: 5 },
      { label: "10", count: 3, x: w * 0.35, start: 25 },
      { label: "100", count: 8, x: w * 0.55, start: 45 },
      { label: "1,000", count: 18, x: w * 0.75, start: 65 },
    ];

    const hairR = 50 * sc;
    // Hair reference circle at right edge
    const hairT = interpolate(frame, [60, 80], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (hairT > 0) {
      drawHair(ctx, w * 0.92, cy, hairR * hairT, sc, a * hairT * 0.5);
      if (hairT > 0.5) drawFBText(ctx, "hair", w * 0.92, cy + hairR * hairT + 12 * sc, 7 * sc, a * (hairT - 0.5) * 2 * 0.3, "center", FB.text.dim);
    }

    for (const stage of stages) {
      const t = interpolate(frame, [stage.start, stage.start + 18], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      if (t <= 0) continue;
      const tE = t * t * (3 - 2 * t);
      const stackH = stage.count * 2 * sc * tE;
      drawSliceStack(ctx, stage.x, cy, 40 * sc, Math.max(0.5, 2 * sc), stage.count, Math.max(1, stackH), sc, a * tE);
      drawFBText(ctx, stage.label, stage.x, cy + Math.max(stackH / 2, 5 * sc) + 14 * sc, 9 * sc, a * tE * 0.5, "center", FB.teal);
    }
  });
  return <canvas ref={ref} width={w} height={h} style={{ width: w, height: h }} />;
};

/* ── V8: Slice rain — slices fall and stack, pile barely grows, hair looms large in background ── */
const V8: React.FC<VariantProps> = ({ width: w, height: h }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  const sc = Math.min(w, h) / 360;
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, w, h, frame); const a = fadeInOut(frame, DUR);
    const cx = w * 0.4, cy = h / 2;

    // Hair in background (big, faded)
    drawHair(ctx, w * 0.72, cy, 70 * sc, sc, a * 0.25);
    drawFBText(ctx, "hair", w * 0.72, cy + 75 * sc, 8 * sc, a * 0.2, "center", FB.text.dim);

    // Slices rain from top and stack
    const rainT = interpolate(frame, [5, 110], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const stackH = 20 * sc; // barely grows — the point!
    const pileY = cy + 20 * sc;

    // Falling slices
    const sliceCount = Math.floor(rainT * 25);
    for (let i = 0; i < 5; i++) {
      const phase = (i / 5 + frame * 0.015) % 1;
      const fy = -10 * sc + phase * (pileY + 10 * sc);
      const [rh, rs, rl] = cellHSL(2);
      ctx.globalAlpha = a * 0.3;
      ctx.fillStyle = `hsla(${rh},${rs + 5}%,${rl + 5}%,0.35)`;
      ctx.fillRect(cx - 50 * sc, fy, 100 * sc, 2 * sc);
      ctx.globalAlpha = 1;
    }

    // Accumulated pile
    if (sliceCount > 0) {
      drawSliceStack(ctx, cx, pileY - stackH / 2, 100 * sc, Math.max(0.5, stackH / Math.min(sliceCount, 20)), Math.min(sliceCount, 20), stackH, sc, a);
    }

    drawFBCounter(ctx, Math.round(rainT * 1000).toLocaleString("en-US"), cx, pileY + stackH / 2 + 18 * sc, 12 * sc, FB.teal, a * 0.6);
  });
  return <canvas ref={ref} width={w} height={h} style={{ width: w, height: h }} />;
};

/* ── V9: Dramatic reveal — big "40nm" number, slices compress into nothing, hair dwarfs them ── */
const V9: React.FC<VariantProps> = ({ width: w, height: h }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  const sc = Math.min(w, h) / 360;
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, w, h, frame); const a = fadeInOut(frame, DUR);
    const cx = w / 2, cy = h / 2;

    // "40nm" appears big then shrinks
    const numT = interpolate(frame, [5, 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const numShrink = interpolate(frame, [35, 60], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (numT > 0) {
      const fontSize = interpolate(numShrink, [0, 1], [40, 12]) * sc;
      const numY = interpolate(numShrink, [0, 1], [cy, h * 0.12]);
      drawFBCounter(ctx, "40nm", cx, numY, fontSize, FB.teal, a * numT * 0.7);
    }

    // Stack of 1000 (represented as compressed thin bar)
    const stackT = interpolate(frame, [40, 75], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (stackT > 0) {
      const stackW = 120 * sc * stackT;
      const stackH2 = 15 * sc * stackT; // tiny
      const [rh, rs, rl] = cellHSL(2);
      ctx.globalAlpha = a * stackT * 0.5;
      ctx.fillStyle = `hsla(${rh},${rs+5}%,${rl}%,0.4)`;
      ctx.fillRect(cx - stackW / 2, cy - stackH2 / 2, stackW, stackH2);
      ctx.strokeStyle = `hsla(${rh},${rs}%,${rl+15}%,${a * stackT * 0.4})`;
      ctx.lineWidth = 1 * sc;
      ctx.strokeRect(cx - stackW / 2, cy - stackH2 / 2, stackW, stackH2);
      ctx.globalAlpha = 1;
      drawFBText(ctx, "× 1,000", cx, cy - stackH2 / 2 - 10 * sc, 9 * sc, a * stackT * 0.4, "center", FB.text.dim);
    }

    // Hair appears HUGE in comparison
    const hairT = interpolate(frame, [70, 100], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (hairT > 0) {
      const hairR = 80 * sc * hairT;
      drawHair(ctx, cx, cy + 60 * sc, hairR, sc, a * hairT);
      if (hairT > 0.5) {
        drawFBText(ctx, "still thinner than a hair", cx, cy + 60 * sc + hairR + 16 * sc, 11 * sc, a * (hairT - 0.5) * 2 * 0.5, "center", FB.text.accent);
      }
    }
  });
  return <canvas ref={ref} width={w} height={h} style={{ width: w, height: h }} />;
};

export const FB011_Final = V2;

export const VARIANTS_FB_011: VariantDef[] = [
  { id: "fb011-v1", label: "Zoom + Compare", component: V1 },
  { id: "fb011-v2", label: "Bar Comparison", component: V2 },
  { id: "fb011-v3", label: "Stack Counter", component: V3 },
  { id: "fb011-v4", label: "Slices Inside Hair", component: V4 },
  { id: "fb011-v5", label: "Split Top/Bottom", component: V5 },
  { id: "fb011-v6", label: "Ruler Scale", component: V6 },
  { id: "fb011-v7", label: "1→10→100→1000", component: V7 },
  { id: "fb011-v8", label: "Rain + Hair BG", component: V8 },
  { id: "fb011-v9", label: "40nm Dramatic", component: V9 },
];
