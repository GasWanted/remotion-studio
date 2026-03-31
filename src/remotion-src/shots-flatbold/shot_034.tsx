import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantDef, VariantProps } from "../types";
import { FB, seeded, drawFBBg, drawFBNode, drawFBEdge, drawFBText, drawFBCounter, fadeInOut, cellHSL, drawFBColorEdge, drawPersonBlob, drawIconPerson, drawIconBuilding } from "./flatbold-kit";

/* Shot 034 — "They identified over eight thousand cell types—half of them
   for the first time." — 120 frames (4s)
   "8,000" counter, catalog, "HALF NEW". */

const DUR = 120;

function accent(i: number) { return FB.colors[i % FB.colors.length]; }

/* V1: Big "8,000" counter ticks up, "HALF NEW" stamp appears */
const V1: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame); const a = fadeInOut(frame, DUR);
    const sc = Math.min(W, H) / 360;
    const cx = W / 2;
    // Counter
    const count = Math.floor(interpolate(frame, [5, 70], [0, 8000], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
    drawFBCounter(ctx, count.toLocaleString("en-US"), cx, H * 0.28, 28 * sc, FB.green, a);
    drawFBText(ctx, "CELL TYPES", cx, H * 0.4, 10 * sc, a, "center", FB.text.dim);
    // Progress bar
    const fill = count / 8000;
    const barW = W * 0.6, barH = 8 * sc;
    ctx.globalAlpha = a * 0.15; ctx.fillStyle = "#fff"; ctx.fillRect(cx - barW / 2, H * 0.5, barW, barH);
    ctx.globalAlpha = a * 0.7; ctx.fillStyle = FB.green;
    ctx.fillRect(cx - barW / 2, H * 0.5, barW * fill, barH);
    // "HALF NEW" stamp
    const stampP = interpolate(frame, [75, 100], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (stampP > 0) {
      ctx.save(); ctx.translate(cx, H * 0.68); ctx.rotate(-0.08);
      ctx.globalAlpha = a * stampP * 0.15; ctx.fillStyle = FB.gold;
      ctx.fillRect(-W * 0.18, -10 * sc, W * 0.36, 20 * sc);
      ctx.globalAlpha = a * stampP; ctx.strokeStyle = FB.gold; ctx.lineWidth = 2.5 * sc;
      ctx.strokeRect(-W * 0.18, -10 * sc, W * 0.36, 20 * sc);
      drawFBText(ctx, "HALF NEW", 0, 0, 16 * sc, a * stampP, "center", FB.gold);
      ctx.restore();
    }
    drawFBText(ctx, "discovered for the first time", cx, H * 0.85, 8 * sc, a * stampP, "center", FB.text.dim);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* V2: Catalog grid — tiny colored cells appear filling a grid, half gold "NEW" */
const V2: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame); const a = fadeInOut(frame, DUR);
    const sc = Math.min(W, H) / 360;
    drawFBText(ctx, "CELL TYPE CATALOG", W / 2, H * 0.05, 9 * sc, a, "center", FB.gold);
    const cols = 12, rows = 8;
    const dotR = 2.5 * sc, gapX = W * 0.07, gapY = H * 0.08;
    const x0 = W / 2 - (cols * gapX) / 2, y0 = H * 0.13;
    const total = cols * rows;
    const revealed = Math.floor(interpolate(frame, [5, 80], [0, total], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
    const rng = seeded(3401);
    for (let i = 0; i < total; i++) {
      if (i < revealed) {
        const col = i % cols, row = Math.floor(i / cols);
        const dx = x0 + col * gapX, dy = y0 + row * gapY;
        const isNew = rng() < 0.5;
        ctx.globalAlpha = a * 0.7; ctx.fillStyle = isNew ? FB.gold : FB.green;
        ctx.beginPath(); ctx.arc(dx, dy, dotR, 0, Math.PI * 2); ctx.fill();
      } else { rng(); }
    }
    // Legend
    const legP = interpolate(frame, [65, 85], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = a * legP * 0.7; ctx.fillStyle = FB.green;
    ctx.beginPath(); ctx.arc(W * 0.3, H * 0.85, 4 * sc, 0, Math.PI * 2); ctx.fill();
    drawFBText(ctx, "KNOWN", W * 0.3 + 10 * sc, H * 0.85, 7 * sc, a * legP, "left", FB.green);
    ctx.globalAlpha = a * legP * 0.7; ctx.fillStyle = FB.gold;
    ctx.beginPath(); ctx.arc(W * 0.6, H * 0.85, 4 * sc, 0, Math.PI * 2); ctx.fill();
    drawFBText(ctx, "NEW", W * 0.6 + 10 * sc, H * 0.85, 7 * sc, a * legP, "left", FB.gold);
    drawFBCounter(ctx, "8,000+", W / 2, H * 0.94, 12 * sc, FB.green, a * legP);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* V3: Pie chart — half green "known", half gold "NEW" */
const V3: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame); const a = fadeInOut(frame, DUR);
    const sc = Math.min(W, H) / 360;
    const cx = W / 2, cy = H * 0.4;
    const r = Math.min(W, H) * 0.25;
    // Known half (green)
    const knownP = interpolate(frame, [10, 50], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = a * knownP * 0.5; ctx.fillStyle = FB.green;
    ctx.beginPath(); ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * knownP); ctx.closePath(); ctx.fill();
    // New half (gold)
    const newP = interpolate(frame, [50, 85], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = a * newP * 0.5; ctx.fillStyle = FB.gold;
    ctx.beginPath(); ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, r, -Math.PI / 2 + Math.PI, -Math.PI / 2 + Math.PI + Math.PI * newP); ctx.closePath(); ctx.fill();
    // Labels
    drawFBText(ctx, "KNOWN", cx - r * 0.4, cy - r * 0.2, 9 * sc, a * knownP, "center", FB.green);
    drawFBText(ctx, "50%", cx - r * 0.4, cy + r * 0.1, 12 * sc, a * knownP, "center", FB.green);
    drawFBText(ctx, "NEW!", cx + r * 0.4, cy + r * 0.2, 9 * sc, a * newP, "center", FB.gold);
    drawFBText(ctx, "50%", cx + r * 0.4, cy - r * 0.1, 12 * sc, a * newP, "center", FB.gold);
    // Counter
    drawFBCounter(ctx, "8,000", cx, H * 0.78, 20 * sc, FB.green, a);
    drawFBText(ctx, "CELL TYPES", cx, H * 0.87, 9 * sc, a, "center", FB.text.dim);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* V4: Number slam — "8,000" drops in huge, then "HALF NEW" wipes across */
const V4: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame); const a = fadeInOut(frame, DUR);
    const sc = Math.min(W, H) / 360;
    const cx = W / 2;
    // "8,000" slam
    const slamP = interpolate(frame, [5, 25], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const scale = slamP > 0 ? Math.max(1, 2 - slamP) : 0;
    ctx.save(); ctx.translate(cx, H * 0.3); ctx.scale(scale, scale);
    drawFBCounter(ctx, "8,000", 0, 0, 30 * sc, FB.green, a * slamP);
    ctx.restore();
    drawFBText(ctx, "CELL TYPES", cx, H * 0.45, 10 * sc, a * slamP, "center", FB.text.dim);
    // "HALF NEW" wipe
    const wipeP = interpolate(frame, [50, 80], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const wipeX = interpolate(wipeP, [0, 1], [-W * 0.3, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (wipeP > 0) {
      ctx.save(); ctx.translate(wipeX, 0);
      drawFBText(ctx, "HALF", cx - 20 * sc, H * 0.62, 18 * sc, a * wipeP, "center", FB.gold);
      drawFBText(ctx, "NEW", cx + 30 * sc, H * 0.62, 18 * sc, a * wipeP, "center", FB.gold);
      ctx.restore();
    }
    // Subtitle
    const subP = interpolate(frame, [85, 105], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "discovered for the first time", cx, H * 0.78, 8 * sc, a * subP, "center", FB.text.dim);
    // Decorative nodes
    const rng = seeded(3404);
    for (let i = 0; i < 8; i++) {
      drawFBNode(ctx, rng() * W, H * 0.85 + rng() * H * 0.1, 2 * sc, i, a * 0.1, frame);
    }
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* V5: Scrolling list — cell type names scroll up, new ones highlighted gold */
const V5: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame); const a = fadeInOut(frame, DUR);
    const sc = Math.min(W, H) / 360;
    const cx = W / 2;
    drawFBText(ctx, "CELL TYPE CATALOG", cx, H * 0.05, 9 * sc, a, "center", FB.gold);
    // Scrolling names
    const names = ["DNa01", "MN9*", "GF", "aDN1*", "P9", "LPLC2*", "MDN", "ocellar*", "JON-A", "hDN*", "DNb02*", "vPN", "LC4*", "DNg11"];
    const scrollY = frame * 1.2;
    names.forEach((name, i) => {
      const ny = H * 0.12 + i * H * 0.06 - scrollY;
      if (ny > H * 0.08 && ny < H * 0.75) {
        const isNew = name.endsWith("*");
        const displayName = name.replace("*", "");
        const color = isNew ? FB.gold : FB.green;
        drawFBText(ctx, displayName, cx - 10 * sc, ny, 8 * sc, a * 0.7, "center", color);
        if (isNew) drawFBText(ctx, "NEW", cx + 40 * sc, ny, 6 * sc, a * 0.6, "left", FB.gold);
      }
    });
    // Gradient fade at top/bottom
    const fadeGrad = ctx.createLinearGradient(0, H * 0.08, 0, H * 0.15);
    fadeGrad.addColorStop(0, "rgba(42,31,53,1)"); fadeGrad.addColorStop(1, "rgba(42,31,53,0)");
    ctx.globalAlpha = 1; ctx.fillStyle = fadeGrad; ctx.fillRect(0, H * 0.08, W, H * 0.07);
    // Counter
    const cP = interpolate(frame, [50, 80], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBCounter(ctx, "8,000+", cx, H * 0.82, 18 * sc, FB.green, a * cP);
    drawFBText(ctx, "HALF NEVER SEEN BEFORE", cx, H * 0.92, 9 * sc, a * cP, "center", FB.gold);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* V6: Split bar — 4000 known (green) + 4000 new (gold) stacking up */
const V6: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame); const a = fadeInOut(frame, DUR);
    const sc = Math.min(W, H) / 360;
    const cx = W / 2;
    const barW = W * 0.3, maxH = H * 0.55;
    // Known bar (green) grows up
    const knownP = interpolate(frame, [10, 50], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const knownH = maxH * 0.5 * knownP;
    ctx.globalAlpha = a * 0.5; ctx.fillStyle = FB.green;
    ctx.fillRect(cx - barW / 2, H * 0.75 - knownH, barW, knownH);
    drawFBText(ctx, "4,000", cx, H * 0.75 - knownH - 10 * sc, 10 * sc, a * knownP, "center", FB.green);
    drawFBText(ctx, "KNOWN", cx, H * 0.75 - knownH / 2, 8 * sc, a * knownP, "center", FB.text.primary);
    // New bar (gold) stacks on top
    const newP = interpolate(frame, [55, 90], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const newH = maxH * 0.5 * newP;
    ctx.globalAlpha = a * 0.5; ctx.fillStyle = FB.gold;
    ctx.fillRect(cx - barW / 2, H * 0.75 - knownH - newH, barW, newH);
    if (newP > 0) {
      drawFBText(ctx, "4,000", cx, H * 0.75 - knownH - newH - 10 * sc, 10 * sc, a * newP, "center", FB.gold);
      drawFBText(ctx, "NEW!", cx, H * 0.75 - knownH - newH / 2, 8 * sc, a * newP, "center", FB.text.primary);
    }
    // Total
    const totalP = interpolate(frame, [90, 110], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "= 8,000+ TYPES", cx, H * 0.82, 12 * sc, a * totalP, "center", FB.text.primary);
    drawFBText(ctx, "HALF DISCOVERED FOR FIRST TIME", cx, H * 0.92, 8 * sc, a * totalP, "center", FB.gold);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* V7: Mosaic — tiny cell blobs fill screen, half are gold-edged "NEW" */
const V7: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame); const a = fadeInOut(frame, DUR);
    const sc = Math.min(W, H) / 360;
    const rng = seeded(3407);
    const total = 60;
    const revealed = Math.floor(interpolate(frame, [5, 80], [0, total], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
    for (let i = 0; i < total; i++) {
      if (i < revealed) {
        const bx = rng() * W * 0.9 + W * 0.05;
        const by = rng() * H * 0.65 + H * 0.08;
        const isNew = rng() < 0.5;
        drawFBNode(ctx, bx, by, 3 * sc, isNew ? 2 : (i % 6), a * 0.5, frame);
        if (isNew) {
          ctx.globalAlpha = a * 0.3; ctx.strokeStyle = FB.gold; ctx.lineWidth = 1;
          ctx.beginPath(); ctx.arc(bx, by, 5 * sc, 0, Math.PI * 2); ctx.stroke();
        }
      } else { rng(); rng(); rng(); }
    }
    const labP = interpolate(frame, [70, 95], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBCounter(ctx, "8,000", W / 2, H * 0.82, 20 * sc, FB.green, a * labP);
    drawFBText(ctx, "HALF NEW", W / 2, H * 0.92, 12 * sc, a * labP, "center", FB.gold);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* V8: Two-line headline — "8,000 CELL TYPES" then "HALF NEW" punches in */
const V8: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame); const a = fadeInOut(frame, DUR);
    const sc = Math.min(W, H) / 360;
    const cx = W / 2;
    // Line 1
    const l1 = interpolate(frame, [5, 25], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const l1Scale = l1 > 0 ? Math.max(1, 1.5 - (frame - 15) * 0.04) : 0;
    drawFBText(ctx, "8,000", cx, H * 0.25, 28 * sc * Math.min(1.3, l1Scale), a * l1, "center", FB.green);
    const l1b = interpolate(frame, [15, 35], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "CELL TYPES", cx, H * 0.38, 12 * sc, a * l1b, "center", FB.text.dim);
    // Line 2
    const l2 = interpolate(frame, [50, 75], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const l2Scale = l2 > 0 ? Math.max(1, 1.5 - (frame - 65) * 0.04) : 0;
    drawFBText(ctx, "HALF", cx - 20 * sc, H * 0.58, 20 * sc * Math.min(1.3, l2Scale), a * l2, "center", FB.gold);
    drawFBText(ctx, "NEW", cx + 30 * sc, H * 0.58, 20 * sc * Math.min(1.3, l2Scale), a * l2, "center", FB.gold);
    const l2b = interpolate(frame, [70, 90], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "discovered for the first time", cx, H * 0.7, 8 * sc, a * l2b, "center", FB.text.dim);
    // Sparkle dots
    const rng = seeded(3408);
    for (let i = 0; i < 10; i++) {
      drawFBNode(ctx, rng() * W, rng() * H, 1.5 * sc, i % 8, a * 0.08, frame);
    }
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* V9: Flipping counter slots — odometer style 0000 -> 8000, "HALF NEW" badge */
const V9: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame); const a = fadeInOut(frame, DUR);
    const sc = Math.min(W, H) / 360;
    const cx = W / 2, cy = H * 0.32;
    const count = Math.floor(interpolate(frame, [5, 60], [0, 8000], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
    const digits = count.toString().padStart(4, "0").split("");
    // Odometer slots
    const slotW = 18 * sc, slotH = 24 * sc, gap = 4 * sc;
    const totalW = digits.length * (slotW + gap) - gap;
    digits.forEach((d, i) => {
      const dx = cx - totalW / 2 + i * (slotW + gap) + slotW / 2;
      // Slot bg
      ctx.globalAlpha = a * 0.15; ctx.fillStyle = "#fff";
      ctx.fillRect(dx - slotW / 2, cy - slotH / 2, slotW, slotH);
      ctx.globalAlpha = a * 0.3; ctx.strokeStyle = FB.teal; ctx.lineWidth = 1;
      ctx.strokeRect(dx - slotW / 2, cy - slotH / 2, slotW, slotH);
      // Digit
      drawFBCounter(ctx, d, dx, cy, 18 * sc, FB.green, a);
    });
    drawFBText(ctx, "CELL TYPES IDENTIFIED", cx, cy + slotH / 2 + 12 * sc, 9 * sc, a, "center", FB.text.dim);
    // "HALF NEW" badge
    const badgeP = interpolate(frame, [70, 95], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (badgeP > 0) {
      ctx.save(); ctx.translate(cx, H * 0.65); ctx.rotate(-0.05);
      ctx.globalAlpha = a * badgeP * 0.15; ctx.fillStyle = FB.gold;
      ctx.fillRect(-W * 0.15, -10 * sc, W * 0.3, 20 * sc);
      ctx.globalAlpha = a * badgeP; ctx.strokeStyle = FB.gold; ctx.lineWidth = 2 * sc;
      ctx.strokeRect(-W * 0.15, -10 * sc, W * 0.3, 20 * sc);
      drawFBText(ctx, "HALF NEW", 0, 0, 14 * sc, a * badgeP, "center", FB.gold);
      ctx.restore();
    }
    drawFBText(ctx, "first time ever cataloged", cx, H * 0.82, 8 * sc, a * badgeP, "center", FB.text.dim);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

export const VARIANTS_FB_034: VariantDef[] = [
  { id: "fb-034-v1", label: "Counter to 8000, progress bar, HALF NEW stamp", component: V1 },
  { id: "fb-034-v2", label: "Catalog grid: colored cells, half gold NEW", component: V2 },
  { id: "fb-034-v3", label: "Pie chart: half known green, half new gold", component: V3 },
  { id: "fb-034-v4", label: "Number slam 8000, HALF NEW wipes in", component: V4 },
  { id: "fb-034-v5", label: "Scrolling name list, new ones gold", component: V5 },
  { id: "fb-034-v6", label: "Split stacked bar: 4000 known + 4000 new", component: V6 },
  { id: "fb-034-v7", label: "Mosaic of cell blobs, half gold-edged", component: V7 },
  { id: "fb-034-v8", label: "Two-line headline: 8000 then HALF NEW", component: V8 },
  { id: "fb-034-v9", label: "Odometer counter with HALF NEW badge", component: V9 },
];
