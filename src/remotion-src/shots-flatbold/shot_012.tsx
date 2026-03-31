// Shot 012 — "then hit with an electron beam, capturing every detail down to four nanometers. By"
// Duration: 135 frames (~4.5s)
// STARTS from FB-011: bar comparison (thin slice bar vs big hair bar)
// Transition: one of those thin slices gets hit by an electron beam scan, revealing detail at 4nm
// 9 unique variations

import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantDef, VariantProps } from "../types";
import {
  FB, seeded, drawFBBg, drawFBNode, drawFBText, drawFBCounter,
  fadeInOut, cellHSL,
} from "./flatbold-kit";

const DUR = 135;

/** Draw a single amber slice (flat rectangle) */
function drawSlice(ctx: CanvasRenderingContext2D, cx: number, cy: number, w2: number, h2: number, sc: number, alpha: number) {
  const [rh, rs, rl] = cellHSL(2);
  ctx.globalAlpha = alpha * 0.45;
  ctx.fillStyle = `hsla(${rh},${rs+5}%,${rl+5}%,0.4)`;
  ctx.fillRect(cx - w2/2, cy - h2/2, w2, h2);
  ctx.strokeStyle = `hsla(${rh},${rs}%,${rl+18}%,${alpha*0.4})`;
  ctx.lineWidth = Math.max(1, 1.5*sc);
  ctx.strokeRect(cx - w2/2, cy - h2/2, w2, h2);
  ctx.globalAlpha = 1;
}

/** Draw revealed detail — tiny neuron cross-sections appearing behind the scan line */
function drawRevealedDetail(ctx: CanvasRenderingContext2D, cx: number, cy: number, w2: number, h2: number, sc: number, frame: number, alpha: number, revealX: number) {
  const rng = seeded(1200);
  const count = 30;
  for (let i = 0; i < count; i++) {
    const nx = cx - w2/2 + rng() * w2;
    const ny = cy - h2/2 + rng() * h2;
    if (nx > revealX) continue; // only show behind scan line
    const nr = (1.5 + rng() * 3) * sc;
    const c = Math.floor(rng() * 8);
    drawFBNode(ctx, nx, ny, nr, c, alpha * 0.6, frame);
  }
  // Connections between revealed nodes
  const rng2 = seeded(1201);
  for (let i = 0; i < 20; i++) {
    const x1 = cx - w2/2 + rng2() * w2, y1 = cy - h2/2 + rng2() * h2;
    const x2 = cx - w2/2 + rng2() * w2, y2 = cy - h2/2 + rng2() * h2;
    if (x1 > revealX || x2 > revealX) continue;
    ctx.globalAlpha = alpha * 0.12;
    const [h] = cellHSL(Math.floor(rng2() * 8));
    ctx.strokeStyle = `hsla(${h},40%,55%,0.3)`; ctx.lineWidth = 0.5 * sc; ctx.lineCap = "round";
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

/* ── V1: Slice zooms to center, teal scan line sweeps left to right revealing neural detail ── */
const V1: React.FC<VariantProps> = ({ width: w, height: h }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  const sc = Math.min(w, h) / 360;
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, w, h, frame); const a = fadeInOut(frame, DUR);
    const cx = w/2, cy = h/2;

    // Slice grows to fill most of the frame
    const sliceT = interpolate(frame, [5, 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const sliceW = 240 * sc * sliceT, sliceH = 160 * sc * sliceT;
    drawSlice(ctx, cx, cy, sliceW, sliceH, sc, a * sliceT);

    // Scan line sweeps left to right
    const scanT = interpolate(frame, [30, 100], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (scanT > 0) {
      const scanX = cx - sliceW/2 + scanT * sliceW;
      // Revealed detail behind scan line
      drawRevealedDetail(ctx, cx, cy, sliceW, sliceH, sc, frame, a * scanT, scanX);
      // Scan line itself
      ctx.globalAlpha = a * 0.7;
      ctx.strokeStyle = `rgba(78,205,196,0.8)`; ctx.lineWidth = 2 * sc;
      ctx.beginPath(); ctx.moveTo(scanX, cy - sliceH/2 - 5*sc); ctx.lineTo(scanX, cy + sliceH/2 + 5*sc); ctx.stroke();
      // Glow around scan line
      ctx.globalAlpha = a * 0.1;
      ctx.fillStyle = `rgba(78,205,196,0.3)`;
      ctx.fillRect(scanX - 6*sc, cy - sliceH/2, 12*sc, sliceH);
      ctx.globalAlpha = 1;
    }

    // "4nm" resolution label
    if (scanT > 0.3) {
      const lA = (scanT - 0.3) / 0.7;
      drawFBCounter(ctx, "4nm", cx, h * 0.07, 16 * sc, FB.teal, a * lA * 0.6);
      drawFBText(ctx, "resolution", cx, h * 0.12, 8 * sc, a * lA * 0.3, "center", FB.text.dim);
    }
  });
  return <canvas ref={ref} width={w} height={h} style={{ width: w, height: h }} />;
};

/* ── V2: Beam source at top, fires down onto slice, raster-scans back and forth ── */
const V2: React.FC<VariantProps> = ({ width: w, height: h }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  const sc = Math.min(w, h) / 360;
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, w, h, frame); const a = fadeInOut(frame, DUR);
    const cx = w/2, cy = h*0.55;
    const sliceW = 220*sc, sliceH = 140*sc;

    // Slice
    const sliceT = interpolate(frame, [3, 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawSlice(ctx, cx, cy, sliceW * sliceT, sliceH * sliceT, sc, a * sliceT);

    // Beam source dot at top
    const beamT = interpolate(frame, [15, 25], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (beamT > 0) {
      ctx.globalAlpha = a * beamT * 0.7;
      ctx.fillStyle = FB.teal;
      ctx.beginPath(); ctx.arc(cx, 15*sc, 5*sc, 0, Math.PI*2); ctx.fill();
      ctx.globalAlpha = 1;
    }

    // Raster scan: beam sweeps left-right, advancing down
    const scanT = interpolate(frame, [25, 105], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (scanT > 0) {
      const scanRow = scanT * sliceH;
      const scanPhase = (frame * 0.15) % 1;
      const scanX = cx - sliceW/2 + (scanPhase < 0.5 ? scanPhase * 2 : 2 - scanPhase * 2) * sliceW;
      const scanY = cy - sliceH/2 + scanRow;

      // Beam line from source to scan point
      ctx.globalAlpha = a * 0.5;
      ctx.strokeStyle = `rgba(78,205,196,0.6)`; ctx.lineWidth = 1*sc; ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(cx, 15*sc); ctx.lineTo(scanX, Math.min(scanY, cy + sliceH/2)); ctx.stroke();
      // Glow at scan point
      const sg = ctx.createRadialGradient(scanX, Math.min(scanY, cy+sliceH/2), 0, scanX, Math.min(scanY, cy+sliceH/2), 8*sc);
      sg.addColorStop(0, `rgba(78,205,196,${a*0.3})`); sg.addColorStop(1, "transparent");
      ctx.fillStyle = sg; ctx.beginPath(); ctx.arc(scanX, Math.min(scanY, cy+sliceH/2), 8*sc, 0, Math.PI*2); ctx.fill();
      ctx.globalAlpha = 1;

      // Revealed area (everything above scanRow)
      ctx.save();
      ctx.beginPath(); ctx.rect(cx-sliceW/2, cy-sliceH/2, sliceW, scanRow); ctx.clip();
      drawRevealedDetail(ctx, cx, cy, sliceW, sliceH, sc, frame, a * scanT, cx + sliceW);
      ctx.restore();
    }

    if (scanT > 0.2) drawFBCounter(ctx, "4nm", w*0.9, h*0.08, 14*sc, FB.teal, a*0.5);
  });
  return <canvas ref={ref} width={w} height={h} style={{ width: w, height: h }} />;
};

/* ── V3: Before/after wipe — left: blank amber slice, wipe reveals right: detailed scan ── */
const V3: React.FC<VariantProps> = ({ width: w, height: h }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  const sc = Math.min(w, h) / 360;
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, w, h, frame); const a = fadeInOut(frame, DUR);
    const cx = w/2, cy = h/2;
    const sliceW = 240*sc, sliceH = 160*sc;

    // Full slice background
    drawSlice(ctx, cx, cy, sliceW, sliceH, sc, a);

    // Wipe reveals scanned detail
    const wipeT = interpolate(frame, [20, 95], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const wipeX = cx - sliceW/2 + wipeT * sliceW;

    // Scanned side (left of wipe)
    ctx.save();
    ctx.beginPath(); ctx.rect(cx - sliceW/2, cy - sliceH/2, wipeT * sliceW, sliceH); ctx.clip();
    drawRevealedDetail(ctx, cx, cy, sliceW, sliceH, sc, frame, a, wipeX);
    ctx.restore();

    // Wipe line
    if (wipeT > 0 && wipeT < 1) {
      ctx.globalAlpha = a * 0.6;
      ctx.strokeStyle = `rgba(78,205,196,0.8)`; ctx.lineWidth = 2*sc;
      ctx.beginPath(); ctx.moveTo(wipeX, cy - sliceH/2 - 5*sc); ctx.lineTo(wipeX, cy + sliceH/2 + 5*sc); ctx.stroke();
      ctx.globalAlpha = 1;
    }

    if (wipeT > 0.2) drawFBCounter(ctx, "4nm", cx, h*0.07, 15*sc, FB.teal, a*0.5);
  });
  return <canvas ref={ref} width={w} height={h} style={{ width: w, height: h }} />;
};

/* ── V4: Pixel grid — blank grid fills in pixel by pixel as beam scans, each pixel = 4nm ── */
const V4: React.FC<VariantProps> = ({ width: w, height: h }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  const sc = Math.min(w, h) / 360;
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, w, h, frame); const a = fadeInOut(frame, DUR);
    const cx = w/2, cy = h/2;

    const gridW = 220*sc, gridH = 150*sc;
    const cellSize = 8*sc;
    const cols = Math.floor(gridW / cellSize), rows = Math.floor(gridH / cellSize);

    // Fill progress
    const fillT = interpolate(frame, [10, 105], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const totalCells = cols * rows;
    const filledCells = Math.floor(fillT * totalCells);

    const rng = seeded(1240);
    for (let i = 0; i < totalCells; i++) {
      const col = i % cols, row = Math.floor(i / cols);
      const px = cx - gridW/2 + col * cellSize;
      const py = cy - gridH/2 + row * cellSize;

      if (i < filledCells) {
        // Filled: colored based on "brain tissue"
        const c = Math.floor(rng() * 8);
        const [ph, ps, pl] = cellHSL(c);
        ctx.globalAlpha = a * 0.85;
        ctx.fillStyle = `hsla(${ph},${ps + 10}%,${Math.min(85, pl + 12)}%,0.85)`;
        ctx.fillRect(px + 0.5, py + 0.5, cellSize - 1, cellSize - 1);
      } else {
        // Empty: faint grid cell
        rng(); // consume random
        ctx.globalAlpha = a * 0.04;
        ctx.strokeStyle = "rgba(255,255,255,0.2)";
        ctx.lineWidth = 0.5;
        ctx.strokeRect(px, py, cellSize, cellSize);
      }
    }
    ctx.globalAlpha = 1;

    // Scan cursor at the fill edge
    if (filledCells < totalCells && filledCells > 0) {
      const curCol = filledCells % cols, curRow = Math.floor(filledCells / cols);
      const curX = cx - gridW/2 + curCol * cellSize + cellSize/2;
      const curY = cy - gridH/2 + curRow * cellSize + cellSize/2;
      ctx.globalAlpha = a * 0.5;
      const cg = ctx.createRadialGradient(curX, curY, 0, curX, curY, cellSize*2);
      cg.addColorStop(0, `rgba(78,205,196,0.4)`); cg.addColorStop(1, "transparent");
      ctx.fillStyle = cg; ctx.beginPath(); ctx.arc(curX, curY, cellSize*2, 0, Math.PI*2); ctx.fill();
      ctx.globalAlpha = 1;
    }

    if (fillT > 0.1) drawFBCounter(ctx, "4nm per pixel", cx, h*0.07, 11*sc, FB.teal, a*0.5);
  });
  return <canvas ref={ref} width={w} height={h} style={{ width: w, height: h }} />;
};

/* ── V5: Multiple slices — 3 slices side by side each getting scanned simultaneously ── */
const V5: React.FC<VariantProps> = ({ width: w, height: h }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  const sc = Math.min(w, h) / 360;
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, w, h, frame); const a = fadeInOut(frame, DUR);
    const cy = h/2;

    const slices = [w*0.2, w*0.5, w*0.8];
    const sliceW = 80*sc, sliceH = 130*sc;

    for (let s = 0; s < slices.length; s++) {
      const sx = slices[s];
      const revT = interpolate(frame, [5 + s*10, 20 + s*10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      drawSlice(ctx, sx, cy, sliceW * revT, sliceH * revT, sc, a * revT);

      // Scan line for each
      const scanT = interpolate(frame, [25 + s*15, 100 + s*5], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      if (scanT > 0) {
        const scanX = sx - sliceW/2 + scanT * sliceW;
        ctx.save();
        ctx.beginPath(); ctx.rect(sx - sliceW/2, cy - sliceH/2, scanT * sliceW, sliceH); ctx.clip();
        const rng = seeded(1250 + s * 100);
        for (let i = 0; i < 15; i++) {
          const nx = sx - sliceW/2 + rng() * sliceW;
          const ny = cy - sliceH/2 + rng() * sliceH;
          drawFBNode(ctx, nx, ny, (1.5 + rng()*2)*sc, Math.floor(rng()*8), a*scanT*0.5, frame);
        }
        ctx.restore();
        // Scan line
        ctx.globalAlpha = a*0.5; ctx.strokeStyle = `rgba(78,205,196,0.7)`; ctx.lineWidth = 1.5*sc;
        ctx.beginPath(); ctx.moveTo(scanX, cy-sliceH/2); ctx.lineTo(scanX, cy+sliceH/2); ctx.stroke();
        ctx.globalAlpha = 1;
      }
    }

    if (frame > 40) drawFBCounter(ctx, "4nm", w/2, h*0.07, 14*sc, FB.teal, a*0.5);
  });
  return <canvas ref={ref} width={w} height={h} style={{ width: w, height: h }} />;
};

/* ── V6: Zoom into slice surface — goes from blank amber to detailed neural cross-sections ── */
const V6: React.FC<VariantProps> = ({ width: w, height: h }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  const sc = Math.min(w, h) / 360;
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, w, h, frame); const a = fadeInOut(frame, DUR);
    const cx = w/2, cy = h/2;

    // Zoom into slice: starts as a flat amber surface, zooms until we see neural detail
    const zoomT = interpolate(frame, [5, 70], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const zoomE = zoomT * zoomT * (3 - 2 * zoomT);

    // Amber background fading as detail appears
    const [rh, rs, rl] = cellHSL(2);
    ctx.globalAlpha = a * (1 - zoomE * 0.7) * 0.3;
    ctx.fillStyle = `hsla(${rh},${rs}%,${rl}%,0.3)`;
    ctx.fillRect(cx - 130*sc, cy - 90*sc, 260*sc, 180*sc);
    ctx.globalAlpha = 1;

    // Detail reveals progressively
    if (zoomE > 0.2) {
      const detailA = (zoomE - 0.2) / 0.8;
      const rng = seeded(1260);
      const count = Math.floor(detailA * 40);
      for (let i = 0; i < count; i++) {
        const nx = cx - 120*sc + rng() * 240*sc;
        const ny = cy - 80*sc + rng() * 160*sc;
        const nr = (2 + rng()*4) * sc * detailA;
        drawFBNode(ctx, nx, ny, nr, Math.floor(rng()*8), a * detailA * 0.7, frame);
      }
      // Connections
      const rng2 = seeded(1261);
      for (let i = 0; i < count * 0.5; i++) {
        const x1 = cx - 120*sc + rng2()*240*sc, y1 = cy - 80*sc + rng2()*160*sc;
        const x2 = cx - 120*sc + rng2()*240*sc, y2 = cy - 80*sc + rng2()*160*sc;
        ctx.globalAlpha = a * detailA * 0.1;
        ctx.strokeStyle = `hsla(${cellHSL(Math.floor(rng2()*8))[0]},40%,55%,0.3)`;
        ctx.lineWidth = 0.5*sc; ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }

    // Teal tint as electron scanning
    if (zoomE > 0.1) {
      ctx.globalAlpha = a * zoomE * 0.04;
      ctx.fillStyle = "rgba(78,205,196,0.2)"; ctx.fillRect(0,0,w,h);
      ctx.globalAlpha = 1;
    }

    if (zoomE > 0.3) drawFBCounter(ctx, "4nm", cx, h*0.07, 15*sc, FB.teal, a*0.5);
  });
  return <canvas ref={ref} width={w} height={h} style={{ width: w, height: h }} />;
};

/* ── V7: Beam raster — visible raster pattern builds up the image line by line ── */
const V7: React.FC<VariantProps> = ({ width: w, height: h }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  const sc = Math.min(w, h) / 360;
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, w, h, frame); const a = fadeInOut(frame, DUR);
    const cx = w/2, cy = h/2;
    const imgW = 230*sc, imgH = 155*sc;

    // Raster lines fill top to bottom
    const rasterT = interpolate(frame, [10, 105], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const lineH = 3*sc;
    const totalLines = Math.floor(imgH / lineH);
    const filledLines = Math.floor(rasterT * totalLines);

    const rng = seeded(1270);
    for (let line = 0; line < filledLines; line++) {
      const ly = cy - imgH/2 + line * lineH;
      // Each line has varying colors representing brain tissue
      const segments = 20;
      for (let seg = 0; seg < segments; seg++) {
        const sx = cx - imgW/2 + (seg/segments) * imgW;
        const segW = imgW / segments;
        const c = Math.floor(rng() * 8);
        const [ph, ps, pl] = cellHSL(c);
        ctx.globalAlpha = a * 0.4;
        ctx.fillStyle = `hsla(${ph},${ps}%,${pl}%,0.45)`;
        ctx.fillRect(sx, ly, segW, lineH);
      }
    }
    ctx.globalAlpha = 1;

    // Active scan line (bright teal)
    if (filledLines < totalLines && rasterT > 0) {
      const activeY = cy - imgH/2 + filledLines * lineH;
      ctx.globalAlpha = a * 0.6;
      ctx.fillStyle = `rgba(78,205,196,0.5)`;
      ctx.fillRect(cx - imgW/2, activeY, imgW, lineH * 2);
      ctx.globalAlpha = 1;
    }

    // Frame border
    ctx.globalAlpha = a * 0.25;
    ctx.strokeStyle = "rgba(255,255,255,0.3)"; ctx.lineWidth = 1*sc;
    ctx.strokeRect(cx - imgW/2, cy - imgH/2, imgW, imgH);
    ctx.globalAlpha = 1;

    if (rasterT > 0.1) drawFBCounter(ctx, "4nm", cx, h*0.07, 14*sc, FB.teal, a*0.5);
  });
  return <canvas ref={ref} width={w} height={h} style={{ width: w, height: h }} />;
};

/* ── V8: Circular scan — beam spirals inward revealing detail from edges to center ── */
const V8: React.FC<VariantProps> = ({ width: w, height: h }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  const sc = Math.min(w, h) / 360;
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, w, h, frame); const a = fadeInOut(frame, DUR);
    const cx = w/2, cy = h/2;
    const imgR = 90*sc;

    // Slice as circle
    drawSlice(ctx, cx, cy, imgR*2, imgR*2, sc, a * 0.3);

    // Spiral reveal
    const scanT = interpolate(frame, [15, 100], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (scanT > 0) {
      // Reveal from outside in
      const revealR = imgR * (1 - scanT * 0.05); // almost full reveal
      ctx.save();
      ctx.beginPath(); ctx.arc(cx, cy, Math.max(1, imgR), 0, Math.PI*2); ctx.clip();
      // Detail nodes
      const rng = seeded(1280);
      const count = Math.floor(scanT * 35);
      for (let i = 0; i < count; i++) {
        const a2 = rng()*Math.PI*2, d = Math.pow(rng(),0.5) * imgR * 0.9;
        const nx = cx + Math.cos(a2)*d, ny = cy + Math.sin(a2)*d*0.85;
        drawFBNode(ctx, nx, ny, (1.5+rng()*3)*sc, Math.floor(rng()*8), a*scanT*0.6, frame);
      }
      ctx.restore();

      // Spiral scan line
      const spiralAngle = scanT * Math.PI * 8;
      const spiralR = imgR * (1 - scanT * 0.8);
      const sx = cx + Math.cos(spiralAngle) * spiralR;
      const sy = cy + Math.sin(spiralAngle) * spiralR * 0.85;
      ctx.globalAlpha = a * 0.5;
      const sg = ctx.createRadialGradient(sx, sy, 0, sx, sy, 10*sc);
      sg.addColorStop(0, `rgba(78,205,196,0.5)`); sg.addColorStop(1, "transparent");
      ctx.fillStyle = sg; ctx.beginPath(); ctx.arc(sx, sy, 10*sc, 0, Math.PI*2); ctx.fill();
      ctx.globalAlpha = 1;
    }

    if (scanT > 0.2) drawFBCounter(ctx, "4nm", cx, h*0.07, 14*sc, FB.teal, a*0.5);
  });
  return <canvas ref={ref} width={w} height={h} style={{ width: w, height: h }} />;
};

/* ── V9: Flash capture — beam hits slice, bright flash, entire detail revealed at once ── */
const V9: React.FC<VariantProps> = ({ width: w, height: h }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  const sc = Math.min(w, h) / 360;
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, w, h, frame); const a = fadeInOut(frame, DUR);
    const cx = w/2, cy = h/2;
    const sliceW = 230*sc, sliceH = 155*sc;

    const flashFrame = 40;
    const preFlash = frame < flashFrame;
    const postFlash = frame >= flashFrame;

    // Before flash: blank amber slice + beam approaching
    if (preFlash) {
      drawSlice(ctx, cx, cy, sliceW, sliceH, sc, a);
      // Beam from top approaching
      const beamT = interpolate(frame, [10, flashFrame], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const beamY = -10*sc + beamT * (cy - sliceH/2 + 10*sc);
      ctx.globalAlpha = a * 0.6;
      ctx.strokeStyle = `rgba(78,205,196,0.8)`; ctx.lineWidth = 2*sc; ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(cx, -10*sc); ctx.lineTo(cx, beamY); ctx.stroke();
      // Source
      ctx.fillStyle = FB.teal; ctx.beginPath(); ctx.arc(cx, -5*sc, 5*sc, 0, Math.PI*2); ctx.fill();
      ctx.globalAlpha = 1;
    }

    // Flash
    if (frame >= flashFrame - 1 && frame <= flashFrame + 4) {
      ctx.globalAlpha = (1 - Math.abs(frame - flashFrame) / 4) * 0.12;
      ctx.fillStyle = `rgba(78,205,196,0.4)`; ctx.fillRect(0,0,w,h);
      ctx.globalAlpha = 1;
    }

    // After flash: full detail visible
    if (postFlash) {
      const revealT = interpolate(frame, [flashFrame, flashFrame + 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      // Faint slice background
      drawSlice(ctx, cx, cy, sliceW, sliceH, sc, a * (1 - revealT * 0.5));
      // Full detail
      drawRevealedDetail(ctx, cx, cy, sliceW, sliceH, sc, frame, a * revealT, cx + sliceW);
    }

    if (postFlash) drawFBCounter(ctx, "4nm", cx, h*0.07, 15*sc, FB.teal, a*0.6);
  });
  return <canvas ref={ref} width={w} height={h} style={{ width: w, height: h }} />;
};

export const FB012_Final = V4;

export const VARIANTS_FB_012: VariantDef[] = [
  { id: "fb012-v1", label: "Scan Line Sweep", component: V1 },
  { id: "fb012-v2", label: "Beam Raster", component: V2 },
  { id: "fb012-v3", label: "Before/After Wipe", component: V3 },
  { id: "fb012-v4", label: "Pixel Fill", component: V4 },
  { id: "fb012-v5", label: "Triple Slice Scan", component: V5 },
  { id: "fb012-v6", label: "Zoom Into Surface", component: V6 },
  { id: "fb012-v7", label: "Line by Line", component: V7 },
  { id: "fb012-v8", label: "Spiral Reveal", component: V8 },
  { id: "fb012-v9", label: "Flash Capture", component: V9 },
];
