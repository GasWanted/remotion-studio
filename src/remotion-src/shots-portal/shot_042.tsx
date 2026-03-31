import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantDef, VariantProps } from "../types";
import {
  C, seeded, accent, easeOutBack, drawBg, fadeInOut, stagger, staggerRaw,
  drawNode, drawNodeGradient, drawNodeDormant, drawEdge, drawEdgeGlow, drawEdgeFaint,
  drawHeader, drawCounter, drawPerson, drawNeuronShape, drawFlyOutline, drawPanel,
  drawCheck, drawXMark, drawSignalPulse, drawBarChart, drawThresholdLine, lerp,
} from "./portal-kit";

// Shot 042 — "A company called Eon Systems built a simulation — every connection weighted exactly as measured."
// 9 variants — synapse weights, edge thickness varies (DUR=120)

const DUR = 120;

const V1: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height, s);
    const a = fadeInOut(frame, DUR);
    ctx.globalAlpha = a;
    const cx = width / 2, cy = height / 2;
    const weights = [1.2, 0.3, 2.5, 0.8, 1.8];
    for (let i = 0; i < 5; i++) {
      const y = cy - 50 * s + i * 25 * s;
      const sa = stagger(frame, i, 5, 10);
      ctx.strokeStyle = accent(i, a * 0.5); ctx.lineWidth = weights[i] * 2.5 * s * sa; ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(cx - 50 * s, y); ctx.lineTo(cx + 50 * s, y); ctx.stroke();
      drawNode(ctx, cx - 50 * s, y, 4 * s * sa, 0, a);
      drawNode(ctx, cx + 50 * s, y, 4 * s * sa, 1, a);
      ctx.globalAlpha = a * sa;
      ctx.fillStyle = C.textDim; ctx.font = `600 ${7 * s}px system-ui`; ctx.textAlign = "center";
      ctx.fillText(weights[i].toFixed(1), cx, y - 5 * s);
      ctx.globalAlpha = a;
    }
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={ref} width={width} height={height} /></div>;
};

const V2: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height, s);
    const a = fadeInOut(frame, DUR);
    ctx.globalAlpha = a;
    const cx = width / 2, cy = height / 2;
    drawHeader(ctx, width, height, s, frame, DUR, "Weighted Connections");
    const targets = [
      { x: cx - 65 * s, y: cy - 30 * s, w: 3.2 },
      { x: cx - 65 * s, y: cy + 30 * s, w: 0.5 },
      { x: cx + 65 * s, y: cy - 30 * s, w: 1.8 },
      { x: cx + 65 * s, y: cy + 30 * s, w: 2.1 },
    ];
    for (let i = 0; i < 4; i++) {
      const sa = stagger(frame, i, 6, 10);
      ctx.strokeStyle = accent(i, a * 0.4); ctx.lineWidth = targets[i].w * 1.5 * s * sa; ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(targets[i].x, targets[i].y); ctx.stroke();
      drawNode(ctx, targets[i].x, targets[i].y, 5 * s * sa, i % 2, a);
      ctx.globalAlpha = a * sa;
      ctx.fillStyle = C.text; ctx.font = `600 ${7 * s}px monospace`; ctx.textAlign = "center";
      ctx.fillText(`w=${targets[i].w}`, (cx + targets[i].x) / 2, (cy + targets[i].y) / 2 - 6 * s);
      ctx.globalAlpha = a;
    }
    drawNodeGradient(ctx, cx, cy, 8 * s, 0, a);
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={ref} width={width} height={height} /></div>;
};

const V3: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height, s);
    const a = fadeInOut(frame, DUR);
    ctx.globalAlpha = a;
    const cx = width / 2, cy = height / 2;
    const left = [{ y: cy - 30 * s, w: 3, ci: 0 }, { y: cy, w: 1.5, ci: 0 }, { y: cy + 30 * s, w: 0.8, ci: 1 }];
    for (let i = 0; i < 3; i++) {
      const sa = stagger(frame, i, 8, 12);
      const lx = cx - 70 * s;
      ctx.strokeStyle = accent(left[i].ci, a * 0.5); ctx.lineWidth = left[i].w * 2 * s * sa; ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(lx, left[i].y); ctx.lineTo(cx, cy); ctx.stroke();
      drawNode(ctx, lx, left[i].y, 5 * s * sa, left[i].ci, a);
    }
    drawNodeGradient(ctx, cx, cy, 10 * s, 0, a);
    const la = staggerRaw(frame, 0, 50, 15);
    ctx.globalAlpha = a * la;
    ctx.fillStyle = C.blue; ctx.font = `${7 * s}px system-ui`; ctx.textAlign = "left";
    ctx.fillText("thick = strong", cx + 25 * s, cy - 10 * s);
    ctx.fillStyle = C.orange;
    ctx.fillText("thin = weak", cx + 25 * s, cy + 5 * s);
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={ref} width={width} height={height} /></div>;
};

const V4: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height, s);
    const a = fadeInOut(frame, DUR);
    ctx.globalAlpha = a;
    const cx = width / 2, cy = height / 2;
    const wobble = Math.sin(frame * 0.08);
    const weights = [2.3 + wobble * 0.3, 1.1, 0.7 - wobble * 0.1];
    const nodeY = [cy - 30 * s, cy, cy + 30 * s];
    for (let i = 0; i < 3; i++) {
      drawEdge(ctx, cx - 50 * s, nodeY[i], cx + 50 * s, nodeY[i], i % 2, a * 0.3, s);
      drawNode(ctx, cx - 50 * s, nodeY[i], 5 * s, 0, a);
      drawNode(ctx, cx + 50 * s, nodeY[i], 5 * s, 1, a);
      ctx.fillStyle = C.text; ctx.font = `600 ${9 * s}px monospace`; ctx.textAlign = "center";
      ctx.fillText(weights[i].toFixed(1), cx, nodeY[i] - 8 * s);
    }
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={ref} width={width} height={height} /></div>;
};

const V5: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const edges = useMemo(() => {
    const rng = seeded(4255);
    return Array.from({ length: 20 }, () => ({
      x1: rng() * width * 0.3 + width * 0.1,
      y1: rng() * height * 0.8 + height * 0.1,
      x2: rng() * width * 0.3 + width * 0.6,
      y2: rng() * height * 0.8 + height * 0.1,
      w: rng() * 3 + 0.3,
    }));
  }, [width, height]);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height, s);
    const a = fadeInOut(frame, DUR);
    ctx.globalAlpha = a;
    const appear = interpolate(frame, [5, 50], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const count = Math.floor(appear * 20);
    for (let i = 0; i < count; i++) {
      const e = edges[i];
      ctx.strokeStyle = accent(i, a * 0.35); ctx.lineWidth = e.w * 1.5 * s; ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(e.x1, e.y1); ctx.lineTo(e.x2, e.y2); ctx.stroke();
      drawNode(ctx, e.x1, e.y1, 3 * s, 0, a * 0.6);
      drawNode(ctx, e.x2, e.y2, 3 * s, 1, a * 0.6);
    }
    drawCounter(ctx, width, height, s, `${count} connections`, "weighted");
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={ref} width={width} height={height} /></div>;
};

const V6: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height, s);
    const a = fadeInOut(frame, DUR);
    ctx.globalAlpha = a;
    const cx = width / 2, cy = height / 2;
    drawPanel(ctx, width * 0.1, height * 0.2, width * 0.8, height * 0.6, 0, a * 0.4);
    const pairs = [
      { x1: cx - 55 * s, y1: cy - 25 * s, x2: cx + 55 * s, y2: cy - 25 * s, w: 1897, ci: 0 },
      { x1: cx - 55 * s, y1: cy, x2: cx + 55 * s, y2: cy, w: 523, ci: 0 },
      { x1: cx - 55 * s, y1: cy + 25 * s, x2: cx + 55 * s, y2: cy + 25 * s, w: -2405, ci: 1 },
    ];
    for (let i = 0; i < 3; i++) {
      const sa = stagger(frame, i, 8, 12);
      const p = pairs[i];
      const thick = Math.abs(p.w) / 1000;
      ctx.strokeStyle = accent(p.ci, a * 0.4); ctx.lineWidth = thick * 2 * s * sa; ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(p.x1, p.y1); ctx.lineTo(p.x2, p.y2); ctx.stroke();
      drawNode(ctx, p.x1, p.y1, 4 * s * sa, 0, a);
      drawNode(ctx, p.x2, p.y2, 4 * s * sa, p.ci, a);
      ctx.globalAlpha = a * sa;
      ctx.fillStyle = C.text; ctx.font = `600 ${7 * s}px monospace`; ctx.textAlign = "center";
      ctx.fillText(String(p.w), cx, p.y1 - 7 * s);
      ctx.globalAlpha = a;
    }
    ctx.fillStyle = C.textDim; ctx.font = `${7 * s}px system-ui`; ctx.textAlign = "center";
    ctx.fillText("exactly as measured", cx, height * 0.85);
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={ref} width={width} height={height} /></div>;
};

const V7: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const cells = useMemo(() => {
    const rng = seeded(4277);
    const gridSize = 6;
    return Array.from({ length: gridSize * gridSize }, () => rng() * 2 - 0.5);
  }, []);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height, s);
    const a = fadeInOut(frame, DUR);
    ctx.globalAlpha = a;
    const cx = width / 2, cy = height / 2;
    const gridSize = 6;
    const cellW = 14 * s, cellH = 14 * s;
    const startX = cx - (gridSize * cellW) / 2;
    const startY = cy - (gridSize * cellH) / 2;
    const appear = interpolate(frame, [5, 50], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        const idx = r * gridSize + c;
        const w = cells[idx];
        const cellA = idx < gridSize * gridSize * appear ? 1 : 0;
        if (cellA > 0) {
          ctx.fillStyle = w > 0 ? accent(0, a * w * 0.5 * cellA) : accent(1, a * Math.abs(w) * 0.5 * cellA);
          ctx.fillRect(startX + c * cellW, startY + r * cellH, cellW - 1, cellH - 1);
        }
      }
    }
    ctx.fillStyle = C.textDim; ctx.font = `${7 * s}px system-ui`; ctx.textAlign = "center";
    ctx.fillText("weight matrix", cx, startY + gridSize * cellH + 12 * s);
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={ref} width={width} height={height} /></div>;
};

const V8: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height, s);
    const a = fadeInOut(frame, DUR);
    ctx.globalAlpha = a;
    const cx = width / 2, cy = height / 2;
    const weights = [3, 1, 0.5];
    const inputs = [{ x: cx - 80 * s, y: cy - 30 * s }, { x: cx - 80 * s, y: cy }, { x: cx - 80 * s, y: cy + 30 * s }];
    for (let i = 0; i < 3; i++) {
      ctx.strokeStyle = accent(0, a * 0.3); ctx.lineWidth = weights[i] * 1.5 * s; ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(inputs[i].x, inputs[i].y); ctx.lineTo(cx, cy); ctx.stroke();
      drawNode(ctx, inputs[i].x, inputs[i].y, 5 * s, 0, a);
      const pt = ((frame - 15 - i * 12) % 45) / 45;
      if (frame > 15 + i * 12) drawSignalPulse(ctx, inputs[i].x, inputs[i].y, cx, cy, pt, 0, s);
    }
    drawNodeGradient(ctx, cx, cy, 10 * s, 0, a);
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={ref} width={width} height={height} /></div>;
};

const V9: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height, s);
    const a = fadeInOut(frame, DUR);
    ctx.globalAlpha = a;
    const appear = interpolate(frame, [10, 50], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const vals = [1897 * appear, 523 * appear, 2405 * appear, 1100 * appear];
    drawBarChart(ctx, width * 0.15, height * 0.2, width * 0.7, height * 0.5, vals, 2500, s);
    ctx.fillStyle = C.textDim; ctx.font = `${7 * s}px system-ui`; ctx.textAlign = "center";
    ctx.fillText("synapse weight distribution", width / 2, height * 0.82);
    drawHeader(ctx, width, height, s, frame, DUR, "Every Connection Weighted");
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={ref} width={width} height={height} /></div>;
};

export const VARIANTS_SHOT_042: VariantDef[] = [
  { id: "042-thick-edges", label: "Varying thickness edges", component: V1 },
  { id: "042-weighted-header", label: "Central weighted connections", component: V2 },
  { id: "042-thick-thin-legend", label: "Thick blue thin orange legend", component: V3 },
  { id: "042-wobble-weights", label: "Animated weight numbers", component: V4 },
  { id: "042-random-weighted", label: "Random weighted network", component: V5 },
  { id: "042-exact-measured", label: "Exact weights panel", component: V6 },
  { id: "042-heatmap", label: "Weight matrix heatmap", component: V7 },
  { id: "042-signal-weight", label: "Signal proportional to weight", component: V8 },
  { id: "042-bar-weights", label: "Weight bar chart", component: V9 },
];
