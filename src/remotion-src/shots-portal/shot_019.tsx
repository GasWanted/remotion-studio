import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantDef, VariantProps } from "../types";
import {
  C, seeded, accent, easeOutBack, drawBg, fadeInOut, stagger, staggerRaw,
  drawNode, drawNodeGradient, drawNodeDormant, drawEdge, drawEdgeGlow, drawEdgeFaint,
  drawHeader, drawCounter, drawPerson, drawNeuronShape, drawFlyOutline, drawPanel,
  drawCheck, drawXMark, drawSignalPulse, drawBarChart, drawThresholdLine, lerp,
} from "./portal-kit";

// Shot 019 — "Now you have twenty-one million flat images."
// 9 variants — massive image stack/grid (DUR=120)

const V1: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const DUR = 120;
    drawBg(ctx, width, height, s);
    const fo = fadeInOut(frame, DUR);
    ctx.globalAlpha = fo;
    drawHeader(ctx, width, height, s, frame, DUR, "21 Million Images");
    const cx = width / 2, cy = height / 2;
    // Tiling rectangles filling the screen
    const fill = interpolate(frame, [10, 90], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const cols = 16, rows = 10;
    const cellW = width * 0.85 / cols, cellH = height * 0.55 / rows;
    const ox = width * 0.075, oy = height * 0.2;
    const total = cols * rows;
    const filled = Math.floor(fill * total);
    const rng = seeded(1901);
    for (let i = 0; i < filled; i++) {
      const col = i % cols, row = Math.floor(i / cols);
      const x = ox + col * cellW, y = oy + row * cellH;
      ctx.fillStyle = accent(Math.floor(rng() * 2), fo * 0.1);
      ctx.fillRect(x + 0.5, y + 0.5, cellW - 1, cellH - 1);
    }
    drawCounter(ctx, width, height, s, Math.floor(fill * 21000000).toLocaleString(), "flat images");
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
    const DUR = 120;
    drawBg(ctx, width, height, s);
    const fo = fadeInOut(frame, DUR);
    ctx.globalAlpha = fo;
    const cx = width / 2, cy = height / 2;
    // Zoom out effect — one large image shrinking to reveal many
    const zoom = interpolate(frame, [10, 70], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const imgW = lerp(width * 0.7, 8 * s, zoom);
    const imgH = lerp(height * 0.5, 6 * s, zoom);
    if (zoom < 0.5) {
      // Single large image
      drawPanel(ctx, cx - imgW / 2, cy - imgH / 2, imgW, imgH, 0, fo);
      drawNode(ctx, cx, cy, 8 * s * (1 - zoom * 2), 0, fo * 0.5);
    } else {
      // Many small images
      const cols = 12, rows = 8;
      const cw = width * 0.8 / cols, ch = height * 0.6 / rows;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = width * 0.1 + c * cw;
          const y = height * 0.15 + r * ch;
          ctx.fillStyle = accent((r + c) % 2, fo * 0.1);
          ctx.fillRect(x + 0.5, y + 0.5, cw - 1, ch - 1);
        }
      }
    }
    // Label
    const la = interpolate(frame, [70, 85], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = fo * la;
    ctx.fillStyle = C.text;
    ctx.font = `600 ${10 * s}px system-ui`;
    ctx.textAlign = "center";
    ctx.fillText("21 million flat images", cx, height * 0.9);
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
    const DUR = 120;
    drawBg(ctx, width, height, s);
    const fo = fadeInOut(frame, DUR);
    ctx.globalAlpha = fo;
    const cx = width / 2, cy = height / 2;
    // Scrolling grid of images
    const scrollY = frame * 0.8 * s;
    const cols = 10, cellW = width * 0.8 / cols, cellH = cellW * 0.75;
    const ox = width * 0.1;
    for (let r = -2; r < 12; r++) {
      for (let c = 0; c < cols; c++) {
        const x = ox + c * cellW;
        const y = height * 0.1 + r * cellH - (scrollY % cellH);
        if (y > -cellH && y < height + cellH) {
          ctx.fillStyle = accent((r + c) % 2, fo * 0.08);
          ctx.fillRect(x + 0.5, y + 0.5, cellW - 1, cellH - 1);
          ctx.strokeStyle = `rgba(200,200,210,${fo * 0.15})`;
          ctx.lineWidth = 0.5 * s;
          ctx.strokeRect(x + 0.5, y + 0.5, cellW - 1, cellH - 1);
        }
      }
    }
    // Fade overlay at top and bottom
    const grad = ctx.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0, C.bg);
    grad.addColorStop(0.15, "rgba(246,246,248,0)");
    grad.addColorStop(0.85, "rgba(246,246,248,0)");
    grad.addColorStop(1, C.bg);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
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
    const DUR = 120;
    drawBg(ctx, width, height, s);
    const fo = fadeInOut(frame, DUR);
    ctx.globalAlpha = fo;
    const cx = width / 2, cy = height / 2;
    // Perspective receding stack of images
    const depth = interpolate(frame, [10, 60], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    for (let i = 0; i < 12; i++) {
      const sa = stagger(frame, i, 3, 10);
      const scale = 1 - i * 0.06;
      const offsetY = i * 4 * s;
      const offsetX = i * 2 * s;
      const w = 60 * s * scale, h = 45 * s * scale;
      ctx.fillStyle = accent(i % 2, fo * sa * 0.08 * scale);
      ctx.fillRect(cx - w / 2 + offsetX, cy - h / 2 - offsetY, w, h);
      ctx.strokeStyle = accent(i % 2, fo * sa * 0.2 * scale);
      ctx.lineWidth = 0.5 * s;
      ctx.strokeRect(cx - w / 2 + offsetX, cy - h / 2 - offsetY, w, h);
    }
    // "flat" emphasis
    const la = interpolate(frame, [60, 80], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = fo * la;
    ctx.fillStyle = C.text;
    ctx.font = `700 ${12 * s}px system-ui`;
    ctx.textAlign = "center";
    ctx.fillText("flat", cx, cy + 40 * s);
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
    const DUR = 120;
    drawBg(ctx, width, height, s);
    const fo = fadeInOut(frame, DUR);
    ctx.globalAlpha = fo;
    const cx = width / 2, cy = height / 2;
    // Mosaic — tiny colored squares forming a brain shape outline
    const fill = interpolate(frame, [5, 80], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const rng = seeded(1905);
    const total = Math.floor(fill * 80);
    for (let i = 0; i < total; i++) {
      const angle = rng() * Math.PI * 2;
      const dist = rng() * 45 * s;
      const rx = cx + Math.cos(angle) * dist;
      const ry = cy + Math.sin(angle) * dist * 0.8;
      const sz = (2 + rng() * 3) * s;
      ctx.fillStyle = accent(i % 2, fo * 0.15);
      ctx.fillRect(rx - sz / 2, ry - sz / 2, sz, sz);
    }
    // Brain outline in blue
    ctx.strokeStyle = accent(0, fo * 0.2);
    ctx.lineWidth = 1 * s;
    ctx.beginPath();
    ctx.ellipse(cx, cy, 45 * s, 36 * s, 0, 0, Math.PI * 2);
    ctx.stroke();
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
    const DUR = 120;
    drawBg(ctx, width, height, s);
    const fo = fadeInOut(frame, DUR);
    ctx.globalAlpha = fo;
    const cx = width / 2, cy = height / 2;
    // Horizontal cascade waterfall of image cards
    const cascade = interpolate(frame, [5, 90], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const rng = seeded(1906);
    const n = Math.floor(cascade * 30);
    for (let i = 0; i < n; i++) {
      const x = rng() * width * 0.8 + width * 0.1;
      const y = rng() * height * 0.6 + height * 0.15;
      const w = (8 + rng() * 12) * s;
      const h = w * 0.75;
      drawPanel(ctx, x - w / 2, y - h / 2, w, h, i % 2, fo * 0.4);
    }
    // Center label
    ctx.fillStyle = C.text;
    ctx.font = `700 ${14 * s}px system-ui`;
    ctx.textAlign = "center";
    ctx.fillText("21,000,000", cx, height * 0.88);
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
    const DUR = 120;
    drawBg(ctx, width, height, s);
    const fo = fadeInOut(frame, DUR);
    ctx.globalAlpha = fo;
    const cx = width / 2, cy = height / 2;
    // Single image frame that emphasizes "flat" — 2D only
    const grow = interpolate(frame, [10, 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const bounce = easeOutBack(Math.min(1, grow));
    const iw = 70 * s * bounce, ih = 55 * s * bounce;
    drawPanel(ctx, cx - iw / 2, cy - ih / 2, iw, ih, 0, fo);
    // Dense dots inside (tissue cross section)
    const rng = seeded(1907);
    const dotCount = Math.floor(grow * 30);
    for (let i = 0; i < dotCount; i++) {
      const dx = cx + (rng() - 0.5) * (iw - 10 * s);
      const dy = cy + (rng() - 0.5) * (ih - 10 * s);
      drawNode(ctx, dx, dy, (1.5 + rng()) * s, i % 2, fo * 0.4);
    }
    // "2D" label below
    const la = interpolate(frame, [45, 60], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = fo * la;
    ctx.fillStyle = C.textDim;
    ctx.font = `600 ${10 * s}px system-ui`;
    ctx.textAlign = "center";
    ctx.fillText("2D slices only", cx, cy + ih / 2 + 15 * s);
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
    const DUR = 120;
    drawBg(ctx, width, height, s);
    const fo = fadeInOut(frame, DUR);
    ctx.globalAlpha = fo;
    const cx = width / 2, cy = height / 2;
    // Spiral of images unwinding from center
    const unwind = interpolate(frame, [5, 80], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const maxA = unwind * Math.PI * 6;
    for (let a = 0; a < maxA; a += 0.5) {
      const r = (8 + a * 4) * s;
      if (r > 60 * s) break;
      const px = cx + Math.cos(a) * r;
      const py = cy + Math.sin(a) * r;
      ctx.fillStyle = accent(Math.floor(a / 0.5) % 2, fo * 0.1);
      ctx.fillRect(px - 3 * s, py - 2 * s, 6 * s, 4 * s);
    }
    drawCounter(ctx, width, height, s, "21M", "images");
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
    const DUR = 120;
    drawBg(ctx, width, height, s);
    const fo = fadeInOut(frame, DUR);
    ctx.globalAlpha = fo;
    const cx = width / 2, cy = height / 2;
    // Columns of rectangles falling like rain
    const cols = 12;
    const colW = width * 0.85 / cols;
    for (let c = 0; c < cols; c++) {
      const x = width * 0.075 + c * colW;
      const speed = 0.6 + (c % 3) * 0.3;
      const offset = frame * speed * s;
      for (let r = 0; r < 15; r++) {
        const y = (r * 12 * s - offset) % (height + 20 * s) - 10 * s;
        if (y > -10 * s && y < height) {
          ctx.fillStyle = accent(c % 2, fo * 0.1);
          ctx.fillRect(x + 1, y, colW - 2, 8 * s);
        }
      }
    }
    // Overlay text
    ctx.fillStyle = C.text;
    ctx.font = `700 ${16 * s}px system-ui`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("21,000,000", cx, cy);
    ctx.fillStyle = C.textDim;
    ctx.font = `500 ${8 * s}px system-ui`;
    ctx.fillText("flat images", cx, cy + 14 * s);
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

export const VARIANTS_SHOT_019: VariantDef[] = [
  { id: "019-tile-fill", label: "Tiling rectangles fill screen", component: V1 },
  { id: "019-zoom-out", label: "Zoom out from one to many", component: V2 },
  { id: "019-scroll-grid", label: "Scrolling image grid", component: V3 },
  { id: "019-perspective-stack", label: "Perspective receding stack", component: V4 },
  { id: "019-mosaic-brain", label: "Mosaic squares in brain shape", component: V5 },
  { id: "019-cascade-cards", label: "Cascade waterfall of cards", component: V6 },
  { id: "019-single-2d", label: "Single flat frame emphasized", component: V7 },
  { id: "019-spiral-unwind", label: "Spiral of images unwinding", component: V8 },
  { id: "019-rain-columns", label: "Columns of rectangles raining", component: V9 },
];
