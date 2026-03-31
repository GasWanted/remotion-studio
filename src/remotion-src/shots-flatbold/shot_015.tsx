// Shot 015 — "This process produced twenty-one million images—a petabyte of raw data. But these
//   are just flat cross-sections. You can't tell which circle in one slice belongs to"
// Duration: 147 frames (~4.9s)
// STARTS from FB-014: chip powered up with teal glow
// Shows: overwhelming number of images produced, but they're just flat 2D slices
// 9 unique variations

import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantDef, VariantProps } from "../types";
import {
  FB, seeded, drawFBBg, drawFBNode, drawFBText, drawFBCounter,
  fadeInOut, cellHSL,
} from "./flatbold-kit";

const DUR = 147;

/** Draw a single EM-style image tile (colored pixel grid, small) */
function drawImageTile(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, sc: number, alpha: number, seed: number) {
  const rng = seeded(seed);
  const cells = 4;
  const cellSize = size / cells;
  for (let r = 0; r < cells; r++) {
    for (let c = 0; c < cells; c++) {
      const [ph, ps, pl] = cellHSL(Math.floor(rng() * 8));
      ctx.globalAlpha = alpha * 0.7;
      ctx.fillStyle = `hsla(${ph},${ps + 10}%,${Math.min(85, pl + 12)}%,0.8)`;
      ctx.fillRect(x + c * cellSize, y + r * cellSize, cellSize - 0.5, cellSize - 0.5);
    }
  }
  // Border
  ctx.globalAlpha = alpha * 0.3;
  ctx.strokeStyle = "rgba(255,255,255,0.2)"; ctx.lineWidth = 0.5 * sc;
  ctx.strokeRect(x, y, size, size);
  ctx.globalAlpha = 1;
}

/* ── V1: Image flood — tiles cascade in from top filling the screen, counter climbs to 21M ── */
const V1: React.FC<VariantProps> = ({ width: w, height: h }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  const sc = Math.min(w, h) / 360;
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, w, h, frame); const a = fadeInOut(frame, DUR);

    // Chip glow fading from FB-014
    const chipFade = interpolate(frame, [0, 20], [0.3, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (chipFade > 0) {
      ctx.globalAlpha = a * chipFade * 0.08;
      const gg = ctx.createRadialGradient(w/2, h/2, 0, w/2, h/2, 80*sc);
      gg.addColorStop(0, `rgba(78,205,196,0.4)`); gg.addColorStop(1, "transparent");
      ctx.fillStyle = gg; ctx.beginPath(); ctx.arc(w/2, h/2, 80*sc, 0, Math.PI*2); ctx.fill();
      ctx.globalAlpha = 1;
    }

    // Image tiles fill from top-left
    const tileSize = 22 * sc;
    const cols = Math.ceil(w / tileSize), rows = Math.ceil(h / tileSize);
    const total = cols * rows;
    const fillT = interpolate(frame, [10, 100], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const filled = Math.floor(fillT * total);

    for (let i = 0; i < Math.min(filled, total); i++) {
      const col = i % cols, row = Math.floor(i / cols);
      const tx = col * tileSize, ty = row * tileSize;
      const age = filled - i;
      const tileA = Math.min(1, age / 5);
      drawImageTile(ctx, tx, ty, tileSize, sc, a * tileA, 1500 + i * 7);
    }

    // Counter
    if (fillT > 0.05) {
      const count = Math.round(fillT * 21000000);
      // Dark bg behind counter for readability
      ctx.globalAlpha = a * 0.6;
      ctx.fillStyle = "rgba(20,15,30,0.7)";
      ctx.fillRect(w/2 - 80*sc, h*0.04, 160*sc, 28*sc);
      ctx.globalAlpha = 1;
      drawFBCounter(ctx, count.toLocaleString("en-US"), w/2, h*0.08, 14*sc, FB.teal, a * 0.8);
      drawFBText(ctx, "images", w/2, h*0.13, 8*sc, a * 0.4, "center", FB.text.dim);
    }
  });
  return <canvas ref={ref} width={w} height={h} style={{ width: w, height: h }} />;
};

/* ── V2: Stack growing — tiles stack like a growing tower, counter beside it ── */
const V2: React.FC<VariantProps> = ({ width: w, height: h }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  const sc = Math.min(w, h) / 360;
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, w, h, frame); const a = fadeInOut(frame, DUR);
    const cx = w * 0.4, cy = h / 2;

    const stackT = interpolate(frame, [8, 105], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const tileSize = 55 * sc;
    const maxTiles = 20; // visual tiles representing millions
    const shown = Math.floor(stackT * maxTiles);
    const stackBottom = cy + 70 * sc;

    for (let i = 0; i < shown; i++) {
      const ty = stackBottom - (i + 1) * 4 * sc;
      drawImageTile(ctx, cx - tileSize / 2, ty - tileSize, tileSize, sc, a * Math.min(1, (shown - i) / 3), 1520 + i * 13);
    }

    // Counter on the right
    if (stackT > 0.05) {
      const count = Math.round(stackT * 21000000);
      drawFBCounter(ctx, count.toLocaleString("en-US"), w * 0.75, cy - 15 * sc, 16 * sc, FB.teal, a * 0.7);
      drawFBText(ctx, "images", w * 0.75, cy + 8 * sc, 9 * sc, a * 0.4, "center", FB.text.dim);
      // "1 PETABYTE" appears later
      if (stackT > 0.5) {
        const pbA = (stackT - 0.5) * 2;
        drawFBText(ctx, "1 PETABYTE", w * 0.75, cy + 30 * sc, 12 * sc, a * pbA * 0.5, "center", FB.text.accent);
      }
    }
  });
  return <canvas ref={ref} width={w} height={h} style={{ width: w, height: h }} />;
};

/* ── V3: Grid mosaic — tiles fill a grid showing many different cross-sections ── */
const V3: React.FC<VariantProps> = ({ width: w, height: h }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  const sc = Math.min(w, h) / 360;
  const gridCols = 8, gridRows = 5;
  const total = gridCols * gridRows;
  const order = useMemo(() => {
    const rng = seeded(1530);
    const arr = Array.from({ length: total }, (_, i) => i);
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }, [total]);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, w, h, frame); const a = fadeInOut(frame, DUR);
    const cx = w / 2, cy = h / 2;

    const tileSize = Math.min((w * 0.85) / gridCols, (h * 0.7) / gridRows);
    const gridW = gridCols * tileSize, gridH = gridRows * tileSize;
    const startX = cx - gridW / 2, startY = cy - gridH / 2;

    const fillT = interpolate(frame, [5, 90], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const filled = Math.floor(fillT * total);

    for (let f = 0; f < filled; f++) {
      const idx = order[f];
      const col = idx % gridCols, row = Math.floor(idx / gridCols);
      const tx = startX + col * tileSize, ty = startY + row * tileSize;
      drawImageTile(ctx, tx + 1, ty + 1, tileSize - 2, sc, a * Math.min(1, (filled - f) / 3), 1540 + idx * 11);
    }

    // Counter
    if (fillT > 0.05) {
      ctx.globalAlpha = a * 0.6;
      ctx.fillStyle = "rgba(20,15,30,0.7)";
      ctx.fillRect(cx - 75 * sc, h * 0.03, 150 * sc, 25 * sc);
      ctx.globalAlpha = 1;
      drawFBCounter(ctx, Math.round(fillT * 21000000).toLocaleString("en-US"), cx, h * 0.065, 13 * sc, FB.teal, a * 0.7);
    }

    // "flat cross-sections" label
    if (fillT > 0.6) {
      const lA = (fillT - 0.6) / 0.4;
      drawFBText(ctx, "flat cross-sections", cx, h * 0.93, 10 * sc, a * lA * 0.4, "center", FB.text.dim);
    }
  });
  return <canvas ref={ref} width={w} height={h} style={{ width: w, height: h }} />;
};

/* ── V4: Film strip — tiles scroll horizontally like a film reel ── */
const V4: React.FC<VariantProps> = ({ width: w, height: h }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  const sc = Math.min(w, h) / 360;
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, w, h, frame); const a = fadeInOut(frame, DUR);
    const cy = h / 2;

    // Film strip scrolling left
    const tileSize = 60 * sc;
    const speed = 3;
    const stripY = cy - tileSize / 2;

    // Sprocket holes
    ctx.globalAlpha = a * 0.12;
    ctx.fillStyle = "rgba(255,255,255,0.3)";
    for (let i = 0; i < 20; i++) {
      const sx = ((i * tileSize * 0.8 - frame * speed) % (w + tileSize * 2)) - tileSize;
      ctx.fillRect(sx + tileSize * 0.35, stripY - 10 * sc, tileSize * 0.3, 6 * sc);
      ctx.fillRect(sx + tileSize * 0.35, stripY + tileSize + 4 * sc, tileSize * 0.3, 6 * sc);
    }
    ctx.globalAlpha = 1;

    // Image tiles on the strip
    for (let i = 0; i < 20; i++) {
      const tx = ((i * (tileSize + 4 * sc) - frame * speed) % (w + tileSize * 4)) - tileSize * 2;
      if (tx > w + tileSize || tx < -tileSize * 2) continue;
      drawImageTile(ctx, tx, stripY, tileSize, sc, a, 1550 + i * 17);
    }

    // Strip borders
    ctx.globalAlpha = a * 0.2;
    ctx.strokeStyle = "rgba(255,255,255,0.3)"; ctx.lineWidth = 1 * sc;
    ctx.beginPath(); ctx.moveTo(0, stripY - 2 * sc); ctx.lineTo(w, stripY - 2 * sc); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, stripY + tileSize + 2 * sc); ctx.lineTo(w, stripY + tileSize + 2 * sc); ctx.stroke();
    ctx.globalAlpha = 1;

    // Counter
    const countT = interpolate(frame, [5, 100], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBCounter(ctx, Math.round(countT * 21000000).toLocaleString("en-US"), w / 2, h * 0.1, 14 * sc, FB.teal, a * 0.6);
    if (countT > 0.4) drawFBText(ctx, "1 petabyte", w / 2, h * 0.88, 11 * sc, a * (countT - 0.4) / 0.6 * 0.4, "center", FB.text.accent);
  });
  return <canvas ref={ref} width={w} height={h} style={{ width: w, height: h }} />;
};

/* ── V5: Explosion — tiles burst outward from center like a data explosion ── */
const V5: React.FC<VariantProps> = ({ width: w, height: h }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  const sc = Math.min(w, h) / 360;
  const tiles = useMemo(() => { const rng = seeded(1560);
    return Array.from({ length: 50 }, () => ({
      angle: rng() * Math.PI * 2, speed: 0.5 + rng() * 2.5,
      size: (15 + rng() * 20) * sc, seed: Math.floor(rng() * 10000),
    }));
  }, [sc]);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, w, h, frame); const a = fadeInOut(frame, DUR);
    const cx = w / 2, cy = h / 2;

    const burstT = interpolate(frame, [10, 80], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

    // Flash at start
    if (frame >= 8 && frame <= 14) {
      ctx.globalAlpha = (1 - Math.abs(frame - 11) / 3) * 0.08;
      ctx.fillStyle = `rgba(78,205,196,0.3)`; ctx.fillRect(0, 0, w, h);
      ctx.globalAlpha = 1;
    }

    for (const t of tiles) {
      const dist = burstT * t.speed * 150 * sc;
      const tx = cx + Math.cos(t.angle) * dist - t.size / 2;
      const ty = cy + Math.sin(t.angle) * dist - t.size / 2;
      const tA = Math.max(0, 1 - burstT * 0.6);
      drawImageTile(ctx, tx, ty, t.size, sc, a * tA, t.seed);
    }

    if (burstT > 0.1) drawFBCounter(ctx, "21,000,000", cx, h * 0.08, 15 * sc, FB.teal, a * burstT * 0.7);
  });
  return <canvas ref={ref} width={w} height={h} style={{ width: w, height: h }} />;
};

/* ── V6: Waterfall — tiles cascade from top in columns ── */
const V6: React.FC<VariantProps> = ({ width: w, height: h }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  const sc = Math.min(w, h) / 360;
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, w, h, frame); const a = fadeInOut(frame, DUR);

    const tileSize = 20 * sc;
    const cols = Math.ceil(w / tileSize);
    const rng = seeded(1570);

    const fallT = interpolate(frame, [5, 100], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

    for (let col = 0; col < cols; col++) {
      const colDelay = rng() * 0.3;
      const colT = Math.max(0, fallT - colDelay) / (1 - colDelay);
      const fillRows = Math.floor(colT * Math.ceil(h / tileSize));
      for (let row = 0; row < fillRows; row++) {
        const tx = col * tileSize;
        const ty = row * tileSize;
        drawImageTile(ctx, tx, ty, tileSize, sc, a * Math.min(1, (fillRows - row) / 4), 1580 + col * 31 + row * 7);
      }
    }

    if (fallT > 0.05) {
      ctx.globalAlpha = a * 0.6; ctx.fillStyle = "rgba(20,15,30,0.7)";
      ctx.fillRect(w/2 - 80*sc, h*0.03, 160*sc, 28*sc); ctx.globalAlpha = 1;
      drawFBCounter(ctx, Math.round(fallT * 21000000).toLocaleString("en-US"), w/2, h*0.065, 14*sc, FB.teal, a * 0.7);
    }
  });
  return <canvas ref={ref} width={w} height={h} style={{ width: w, height: h }} />;
};

/* ── V7: Counter focus — big "21,000,000" with tiles swirling around it ── */
const V7: React.FC<VariantProps> = ({ width: w, height: h }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  const sc = Math.min(w, h) / 360;
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, w, h, frame); const a = fadeInOut(frame, DUR);
    const cx = w / 2, cy = h / 2;

    // Orbiting tiles
    const orbitT = interpolate(frame, [5, DUR - 15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    for (let i = 0; i < 16; i++) {
      const angle = (i / 16) * Math.PI * 2 + frame * 0.02;
      const dist = (60 + (i % 3) * 25) * sc;
      const tx = cx + Math.cos(angle) * dist - 12 * sc;
      const ty = cy + Math.sin(angle) * dist * 0.7 - 12 * sc;
      drawImageTile(ctx, tx, ty, 24 * sc, sc, a * orbitT * 0.5, 1590 + i * 19);
    }

    // Big counter
    const countT = interpolate(frame, [10, 80], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const count = Math.round(countT * countT * 21000000);
    drawFBCounter(ctx, count.toLocaleString("en-US"), cx, cy - 10 * sc, 20 * sc, FB.teal, a * 0.8);
    drawFBText(ctx, "images", cx, cy + 18 * sc, 10 * sc, a * 0.4, "center", FB.text.dim);

    if (countT > 0.5) drawFBText(ctx, "1 PETABYTE", cx, cy + 40 * sc, 13 * sc, a * (countT - 0.5) * 2 * 0.5, "center", FB.text.accent);
  });
  return <canvas ref={ref} width={w} height={h} style={{ width: w, height: h }} />;
};

/* ── V8: Hard drive stack — tiles pour into stacking hard drive icons ── */
const V8: React.FC<VariantProps> = ({ width: w, height: h }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  const sc = Math.min(w, h) / 360;
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, w, h, frame); const a = fadeInOut(frame, DUR);
    const cx = w / 2, cy = h / 2;

    // Tiles raining from top
    const rainT = interpolate(frame, [5, 70], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    for (let i = 0; i < 15; i++) {
      const phase = (i / 15 + frame * 0.012) % 1;
      const tx = w * 0.1 + (i * w * 0.055) % (w * 0.8);
      const ty = -20 * sc + phase * (h + 40 * sc);
      drawImageTile(ctx, tx, ty, 18 * sc, sc, a * rainT * 0.4, 1600 + i * 23);
    }

    // Drive stack growing at center
    const stackT = interpolate(frame, [20, 100], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const drives = Math.floor(stackT * 6);
    const driveW = 80 * sc, driveH = 16 * sc;
    for (let i = 0; i < drives; i++) {
      const dy = cy + 40 * sc - i * (driveH + 3 * sc);
      const [bh, bs, bl] = cellHSL(5);
      ctx.globalAlpha = a * 0.4;
      ctx.fillStyle = `hsla(${bh},${bs}%,${bl - 5}%,0.5)`;
      ctx.fillRect(cx - driveW / 2, dy, driveW, driveH);
      ctx.strokeStyle = `hsla(${bh},${bs}%,${bl + 15}%,0.4)`;
      ctx.lineWidth = 1 * sc; ctx.strokeRect(cx - driveW / 2, dy, driveW, driveH);
      // LED dot
      ctx.fillStyle = FB.teal;
      ctx.beginPath(); ctx.arc(cx + driveW / 2 - 8 * sc, dy + driveH / 2, 2 * sc, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = 1;
    }

    if (stackT > 0.1) drawFBCounter(ctx, "1 PB", cx, cy - 50 * sc, 16 * sc, FB.teal, a * stackT * 0.6);
  });
  return <canvas ref={ref} width={w} height={h} style={{ width: w, height: h }} />;
};

/* ── V9: Flat slices emphasized — tiles are clearly flat 2D, stacked edge-on showing they have no depth ── */
const V9: React.FC<VariantProps> = ({ width: w, height: h }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  const sc = Math.min(w, h) / 360;
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, w, h, frame); const a = fadeInOut(frame, DUR);
    const cx = w / 2, cy = h / 2;

    // One big tile face-on (showing it's flat, 2D)
    const tileT = interpolate(frame, [5, 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const bigSize = 140 * sc * tileT;
    if (bigSize > 3) drawImageTile(ctx, cx - bigSize / 2, cy - bigSize / 2, bigSize, sc, a * tileT, 1610);

    // Then rotates to edge-on showing it's paper thin
    const rotT = interpolate(frame, [40, 70], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (rotT > 0) {
      const scaleX = 1 - rotT * 0.97; // compress horizontally
      ctx.save(); ctx.translate(cx, cy); ctx.scale(scaleX, 1);
      drawImageTile(ctx, -bigSize / 2, -bigSize / 2, bigSize, sc, a * (1 - rotT * 0.3), 1610);
      ctx.restore();
    }

    // Multiple edge-on slices stack
    if (rotT > 0.5) {
      const stackA = (rotT - 0.5) * 2;
      const sliceCount = Math.floor(stackA * 15);
      for (let i = 0; i < sliceCount; i++) {
        const sx = cx - 40 * sc + i * 5.5 * sc;
        const [rh, rs, rl] = cellHSL((i * 3) % 8);
        ctx.globalAlpha = a * stackA * 0.5;
        ctx.fillStyle = `hsla(${rh},${rs + 10}%,${Math.min(85, rl + 12)}%,0.6)`;
        ctx.fillRect(sx, cy - bigSize / 2, 2 * sc, bigSize);
        ctx.globalAlpha = 1;
      }
    }

    // Counter + "flat" label
    const countT = interpolate(frame, [10, 80], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (countT > 0.1) drawFBCounter(ctx, Math.round(countT * 21000000).toLocaleString("en-US"), cx, h * 0.07, 13 * sc, FB.teal, a * 0.6);
    if (rotT > 0.3) drawFBText(ctx, "just flat cross-sections", cx, h * 0.92, 10 * sc, a * (rotT - 0.3) / 0.7 * 0.4, "center", FB.text.dim);
  });
  return <canvas ref={ref} width={w} height={h} style={{ width: w, height: h }} />;
};

export const FB015_Final = V6;

export const VARIANTS_FB_015: VariantDef[] = [
  { id: "fb015-v1", label: "Tile Flood", component: V1 },
  { id: "fb015-v2", label: "Growing Stack", component: V2 },
  { id: "fb015-v3", label: "Grid Mosaic", component: V3 },
  { id: "fb015-v4", label: "Film Strip", component: V4 },
  { id: "fb015-v5", label: "Data Explosion", component: V5 },
  { id: "fb015-v6", label: "Column Waterfall", component: V6 },
  { id: "fb015-v7", label: "Counter + Orbit", component: V7 },
  { id: "fb015-v8", label: "Drive Stack", component: V8 },
  { id: "fb015-v9", label: "Flat Edge-On", component: V9 },
];
