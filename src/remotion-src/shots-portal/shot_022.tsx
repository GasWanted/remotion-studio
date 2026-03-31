import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantDef, VariantProps } from "../types";
import {
  C, seeded, accent, easeOutBack, drawBg, fadeInOut, stagger, staggerRaw,
  drawNode, drawNodeGradient, drawNodeDormant, drawEdge, drawEdgeGlow, drawEdgeFaint,
  drawHeader, drawCounter, drawPerson, drawNeuronShape, drawFlyOutline, drawPanel,
  drawCheck, drawXMark, drawSignalPulse, drawBarChart, drawThresholdLine, lerp,
} from "./portal-kit";

// Shot 022 — "A segmentation network — a type of AI — goes through every image, pixel by pixel,"
// 9 variants — AI scanning/segmentation (DUR=150)

const V1: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const DUR = 150;
    drawBg(ctx, width, height, s);
    const fo = fadeInOut(frame, DUR);
    ctx.globalAlpha = fo;
    drawHeader(ctx, width, height, s, frame, DUR, "Segmentation AI");
    const cx = width / 2, cy = height / 2;
    // Image rectangle
    const iw = 80 * s, ih = 60 * s;
    drawPanel(ctx, cx - iw / 2, cy - ih / 2, iw, ih, 0, fo * 0.4);
    // Scan line sweeping left to right
    const scanX = cx - iw / 2 + interpolate(frame, [15, 120], [0, iw], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.strokeStyle = accent(0, fo * 0.7);
    ctx.lineWidth = 2 * s;
    ctx.beginPath();
    ctx.moveTo(scanX, cy - ih / 2);
    ctx.lineTo(scanX, cy + ih / 2);
    ctx.stroke();
    // Glow on scan line
    const glowGrad = ctx.createLinearGradient(scanX - 10 * s, 0, scanX + 2 * s, 0);
    glowGrad.addColorStop(0, "rgba(64,144,255,0)");
    glowGrad.addColorStop(0.7, `rgba(64,144,255,${fo * 0.08})`);
    glowGrad.addColorStop(1, `rgba(64,144,255,${fo * 0.15})`);
    ctx.fillStyle = glowGrad;
    ctx.fillRect(scanX - 10 * s, cy - ih / 2, 12 * s, ih);
    // Classified pixels behind scan line (colored blobs appearing)
    const rng = seeded(2201);
    for (let i = 0; i < 20; i++) {
      const px = cx - iw / 2 + rng() * iw;
      const py = cy - ih / 2 + rng() * ih;
      if (px < scanX - 3 * s) {
        drawNode(ctx, px, py, (2 + rng() * 2) * s, i % 2, fo * 0.4);
      }
    }
    // Progress
    const progress = interpolate(frame, [15, 120], [0, 100], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawCounter(ctx, width, height, s, `${Math.floor(progress)}%`, "scanned");
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

const V2: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const DUR = 150;
    drawBg(ctx, width, height, s);
    const fo = fadeInOut(frame, DUR);
    ctx.globalAlpha = fo;
    const cx = width / 2, cy = height / 2;
    // Pixel grid being classified — small squares changing color
    const cols = 14, rows = 10;
    const cellW = width * 0.7 / cols, cellH = height * 0.5 / rows;
    const ox = width * 0.15, oy = height * 0.2;
    const scanProgress = interpolate(frame, [10, 120], [0, cols * rows], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const rng = seeded(2202);
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const idx = r * cols + c;
        const x = ox + c * cellW, y = oy + r * cellH;
        if (idx < scanProgress) {
          // Classified — colored
          ctx.fillStyle = accent(Math.floor(rng() * 2), fo * 0.2);
          ctx.fillRect(x + 0.5, y + 0.5, cellW - 1, cellH - 1);
        } else {
          // Not yet — gray outline
          ctx.strokeStyle = `rgba(200,200,210,${fo * 0.2})`;
          ctx.lineWidth = 0.5 * s;
          ctx.strokeRect(x + 0.5, y + 0.5, cellW - 1, cellH - 1);
        }
      }
    }
    // "AI" label
    const la = stagger(frame, 3, 1, 12);
    ctx.globalAlpha = fo * la;
    ctx.fillStyle = C.text;
    ctx.font = `600 ${10 * s}px system-ui`;
    ctx.textAlign = "center";
    ctx.fillText("pixel by pixel", cx, height * 0.82);
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

const V3: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const DUR = 150;
    drawBg(ctx, width, height, s);
    const fo = fadeInOut(frame, DUR);
    ctx.globalAlpha = fo;
    const cx = width / 2, cy = height / 2;
    // Neural network diagram scanning input image
    // Input image (left)
    const la = stagger(frame, 0, 1, 12);
    drawPanel(ctx, cx - 65 * s, cy - 20 * s * la, 30 * s, 40 * s * la, 0, fo * la * 0.5);
    ctx.globalAlpha = fo * la;
    ctx.fillStyle = C.textDim;
    ctx.font = `500 ${6 * s}px system-ui`;
    ctx.textAlign = "center";
    ctx.fillText("image", cx - 50 * s, cy + 28 * s);
    ctx.globalAlpha = fo;
    // Network layers (middle)
    for (let l = 0; l < 3; l++) {
      const lx = cx - 15 * s + l * 20 * s;
      const na = stagger(frame, l + 3, 5, 10);
      for (let n = 0; n < 4; n++) {
        const ny = cy - 18 * s + n * 12 * s;
        drawNode(ctx, lx, ny, 3 * s * na, l % 2, fo * 0.5 * na);
      }
      // Connections between layers
      if (l < 2) {
        for (let n = 0; n < 4; n++) {
          for (let m = 0; m < 4; m++) {
            drawEdgeFaint(ctx, lx + 3 * s, cy - 18 * s + n * 12 * s,
              lx + 17 * s, cy - 18 * s + m * 12 * s, s * na * 0.5);
          }
        }
      }
    }
    // Output (right) — segmented image
    const oa = stagger(frame, 12, 1, 12);
    drawPanel(ctx, cx + 35 * s, cy - 20 * s * oa, 30 * s, 40 * s * oa, 1, fo * oa * 0.5);
    ctx.globalAlpha = fo * oa;
    ctx.fillStyle = C.textDim;
    ctx.font = `500 ${6 * s}px system-ui`;
    ctx.fillText("segmented", cx + 50 * s, cy + 28 * s);
    // Signal pulse flowing through
    ctx.globalAlpha = fo;
    const pulseT = interpolate(frame, [20, 100], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawSignalPulse(ctx, cx - 35 * s, cy, cx + 35 * s, cy, pulseT, 0, s);
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

const V4: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const DUR = 150;
    drawBg(ctx, width, height, s);
    const fo = fadeInOut(frame, DUR);
    ctx.globalAlpha = fo;
    const cx = width / 2, cy = height / 2;
    // Raster scan pattern — zigzag line across image
    const iw = 80 * s, ih = 60 * s;
    drawPanel(ctx, cx - iw / 2, cy - ih / 2, iw, ih, 0, fo * 0.3);
    const scanProgress = interpolate(frame, [10, 130], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const rows = 12;
    const totalLen = rows * iw;
    const currentLen = scanProgress * totalLen;
    ctx.strokeStyle = accent(0, fo * 0.5);
    ctx.lineWidth = 1.5 * s;
    ctx.beginPath();
    let drawn = 0;
    for (let r = 0; r < rows && drawn < currentLen; r++) {
      const y = cy - ih / 2 + (r + 0.5) * (ih / rows);
      const startX = r % 2 === 0 ? cx - iw / 2 : cx + iw / 2;
      const endX = r % 2 === 0 ? cx + iw / 2 : cx - iw / 2;
      const rowLen = Math.min(iw, currentLen - drawn);
      const dir = r % 2 === 0 ? 1 : -1;
      if (drawn === 0 && r === 0) ctx.moveTo(startX, y);
      else if (r > 0) ctx.lineTo(startX, y);
      ctx.lineTo(startX + dir * rowLen, y);
      drawn += rowLen;
    }
    ctx.stroke();
    // Dot at scan head
    if (scanProgress > 0 && scanProgress < 1) {
      const curRow = Math.floor(scanProgress * rows);
      const rowProgress = (scanProgress * rows) % 1;
      const y = cy - ih / 2 + (curRow + 0.5) * (ih / rows);
      const x = curRow % 2 === 0
        ? cx - iw / 2 + rowProgress * iw
        : cx + iw / 2 - rowProgress * iw;
      drawNodeGradient(ctx, x, y, 3 * s, 0, fo);
    }
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

const V5: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const DUR = 150;
    drawBg(ctx, width, height, s);
    const fo = fadeInOut(frame, DUR);
    ctx.globalAlpha = fo;
    const cx = width / 2, cy = height / 2;
    // Before/after split — gray blobs becoming colored regions
    const split = interpolate(frame, [20, 90], [0, width * 0.7], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const iw = width * 0.7, ih = height * 0.5;
    const ox = (width - iw) / 2, oy = (height - ih) / 2;
    // Gray side (unprocessed)
    const rng = seeded(2205);
    for (let i = 0; i < 25; i++) {
      const bx = ox + rng() * iw;
      const by = oy + rng() * ih;
      if (bx > ox + split) {
        drawNodeDormant(ctx, bx, by, (3 + rng() * 3) * s, fo);
      } else {
        drawNode(ctx, bx, by, (3 + rng() * 3) * s, i % 2, fo * 0.6);
      }
    }
    // Divider line
    ctx.strokeStyle = accent(0, fo * 0.6);
    ctx.lineWidth = 1.5 * s;
    ctx.beginPath();
    ctx.moveTo(ox + split, oy);
    ctx.lineTo(ox + split, oy + ih);
    ctx.stroke();
    // Labels
    ctx.fillStyle = C.textDim;
    ctx.font = `500 ${7 * s}px system-ui`;
    ctx.textAlign = "center";
    if (split > iw * 0.1) ctx.fillText("classified", ox + split / 2, oy + ih + 12 * s);
    if (split < iw * 0.9) ctx.fillText("unprocessed", ox + split + (iw - split) / 2, oy + ih + 12 * s);
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

const V6: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const DUR = 150;
    drawBg(ctx, width, height, s);
    const fo = fadeInOut(frame, DUR);
    ctx.globalAlpha = fo;
    const cx = width / 2, cy = height / 2;
    // "AI" text with circuit-like decorations
    const appear = stagger(frame, 0, 1, 15);
    ctx.fillStyle = C.blue;
    ctx.font = `700 ${28 * s * appear}px system-ui`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("AI", cx, cy - 10 * s);
    // Circuit lines emanating
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      const sa = stagger(frame, i + 3, 3, 10);
      const r1 = 25 * s, r2 = 45 * s;
      drawEdge(ctx, cx + Math.cos(a) * r1, cy - 10 * s + Math.sin(a) * r1,
        cx + Math.cos(a) * r2, cy - 10 * s + Math.sin(a) * r2, i % 2, fo * sa * 0.3, s);
      drawNode(ctx, cx + Math.cos(a) * r2, cy - 10 * s + Math.sin(a) * r2, 2.5 * s * sa, i % 2, fo * 0.5 * sa);
    }
    // Subtitle
    const la = interpolate(frame, [40, 60], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = fo * la;
    ctx.fillStyle = C.textDim;
    ctx.font = `500 ${8 * s}px system-ui`;
    ctx.textBaseline = "alphabetic";
    ctx.fillText("segmentation network", cx, cy + 25 * s);
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

const V7: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const DUR = 150;
    drawBg(ctx, width, height, s);
    const fo = fadeInOut(frame, DUR);
    ctx.globalAlpha = fo;
    const cx = width / 2, cy = height / 2;
    // Progress bar with images being processed
    const progress = interpolate(frame, [10, 120], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    // Stack of pending images (right)
    for (let i = 0; i < 5; i++) {
      const sa = stagger(frame, i, 3, 8);
      const opacity = Math.max(0, 1 - progress * 1.5 + i * 0.2);
      drawPanel(ctx, cx + 20 * s + i * 3 * s, cy - 15 * s - i * 2 * s, 25 * s, 20 * s, 0, fo * sa * opacity * 0.4);
    }
    // Current image being scanned (center)
    drawPanel(ctx, cx - 20 * s, cy - 18 * s, 35 * s, 28 * s, 0, fo * 0.6);
    // Scan effect on current image
    const scanY = cy - 18 * s + interpolate(frame % 30, [0, 30], [0, 28 * s], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.strokeStyle = accent(0, fo * 0.5);
    ctx.lineWidth = 1 * s;
    ctx.beginPath();
    ctx.moveTo(cx - 20 * s, scanY);
    ctx.lineTo(cx + 15 * s, scanY);
    ctx.stroke();
    // Processed stack (left)
    const done = Math.floor(progress * 5);
    for (let i = 0; i < done; i++) {
      drawPanel(ctx, cx - 55 * s - i * 3 * s, cy - 15 * s - i * 2 * s, 25 * s, 20 * s, 0, fo * 0.3);
      drawCheck(ctx, cx - 42 * s - i * 3 * s, cy - 5 * s - i * 2 * s, 5 * s, 0, fo * 0.5);
    }
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

const V8: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const DUR = 150;
    drawBg(ctx, width, height, s);
    const fo = fadeInOut(frame, DUR);
    ctx.globalAlpha = fo;
    const cx = width / 2, cy = height / 2;
    // Magnifying glass scanning across image, revealing classified regions
    const scanX = interpolate(frame, [15, 120], [cx - 50 * s, cx + 50 * s], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    // Background image (gray blobs)
    const rng = seeded(2208);
    for (let i = 0; i < 20; i++) {
      const bx = cx + (rng() - 0.5) * 100 * s;
      const by = cy + (rng() - 0.5) * 60 * s;
      const dist = Math.sqrt((bx - scanX) ** 2 + (by - cy) ** 2);
      if (dist < 25 * s) {
        drawNode(ctx, bx, by, 4 * s, i % 2, fo * 0.6);
      } else {
        drawNodeDormant(ctx, bx, by, 4 * s, fo);
      }
    }
    // Magnifying glass circle
    ctx.strokeStyle = accent(0, fo * 0.5);
    ctx.lineWidth = 2 * s;
    ctx.beginPath();
    ctx.arc(scanX, cy, 25 * s, 0, Math.PI * 2);
    ctx.stroke();
    // Handle
    ctx.beginPath();
    ctx.moveTo(scanX + 18 * s, cy + 18 * s);
    ctx.lineTo(scanX + 28 * s, cy + 28 * s);
    ctx.stroke();
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

const V9: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const DUR = 150;
    drawBg(ctx, width, height, s);
    const fo = fadeInOut(frame, DUR);
    ctx.globalAlpha = fo;
    const cx = width / 2, cy = height / 2;
    // Concentric expanding scan rings
    const waves = 4;
    for (let w = 0; w < waves; w++) {
      const waveStart = 10 + w * 25;
      const waveEnd = waveStart + 50;
      const wt = interpolate(frame, [waveStart, waveEnd], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      if (wt > 0) {
        const r = wt * 55 * s;
        ctx.strokeStyle = accent(w % 2, fo * 0.3 * (1 - wt));
        ctx.lineWidth = 2 * s;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
    // Center "AI eye"
    drawNodeGradient(ctx, cx, cy, 8 * s, 0, fo);
    // Pixels being revealed by waves
    const rng = seeded(2209);
    const processed = interpolate(frame, [10, 120], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    for (let i = 0; i < 30; i++) {
      const a = rng() * Math.PI * 2;
      const d = rng() * 50 * s;
      if (d < processed * 55 * s) {
        drawNode(ctx, cx + Math.cos(a) * d, cy + Math.sin(a) * d, 2 * s, i % 2, fo * 0.4);
      }
    }
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

export const VARIANTS_SHOT_022: VariantDef[] = [
  { id: "022-scan-line", label: "Scan line sweeping across", component: V1 },
  { id: "022-pixel-grid", label: "Pixel grid being classified", component: V2 },
  { id: "022-network-flow", label: "Neural network input to output", component: V3 },
  { id: "022-raster-scan", label: "Raster zigzag scan pattern", component: V4 },
  { id: "022-before-after", label: "Before/after split reveal", component: V5 },
  { id: "022-ai-circuit", label: "AI text with circuit lines", component: V6 },
  { id: "022-batch-process", label: "Image batch processing queue", component: V7 },
  { id: "022-magnifying", label: "Magnifying glass scan", component: V8 },
  { id: "022-wave-scan", label: "Concentric scan wave rings", component: V9 },
];
