import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantDef, VariantProps } from "../types";
import {
  C, seeded, accent, easeOutBack, drawBg, fadeInOut, stagger, staggerRaw,
  drawNode, drawNodeGradient, drawNodeDormant, drawEdge, drawEdgeGlow, drawEdgeFaint,
  drawHeader, drawCounter, drawPerson, drawNeuronShape, drawFlyOutline, drawPanel,
  drawCheck, drawXMark, drawSignalPulse, drawBarChart, drawThresholdLine, lerp,
} from "./portal-kit";

// Shot 024 — "It traces each neuron's full 3D shape through the stack."
// 120 frames. 9 variants: 2D blobs assembling into 3D neuron shape.

const DUR = 120;

// V1: Flat circles stacking vertically, converging into a neuron shape at center
const V1: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const slices = useMemo(() => {
    const rng = seeded(2401);
    return Array.from({ length: 12 }, (_, i) => ({
      y: -100 + i * 18, rx: 8 + rng() * 14, i,
    }));
  }, []);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height, s);
    const fo = fadeInOut(frame, DUR);
    ctx.globalAlpha = fo;
    drawHeader(ctx, width, height, s, frame, DUR, "Tracing Shape", "layer by layer");
    const cx = width / 2, cy = height / 2;
    const merge = interpolate(frame, [40, 100], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    for (const sl of slices) {
      const t = stagger(frame, sl.i, 2, 10);
      if (t <= 0) continue;
      const spreadY = lerp(sl.y, sl.y * 0.3, merge);
      const ny = cy + spreadY * s;
      const rx = sl.rx * s * t;
      ctx.strokeStyle = accent(sl.i, fo * 0.5 * t);
      ctx.lineWidth = 1.5 * s;
      ctx.beginPath();
      ctx.ellipse(cx, ny, rx, 3 * s, 0, 0, Math.PI * 2);
      ctx.stroke();
      drawNode(ctx, cx - rx, ny, 2 * s * t, sl.i % 2, fo * t);
      drawNode(ctx, cx + rx, ny, 2 * s * t, sl.i % 2, fo * t);
    }
    if (merge > 0.5) {
      const na = (merge - 0.5) * 2;
      drawNeuronShape(ctx, cx, cy, 60 * s, fo * na, frame);
    }
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

// V2: Scattered blobs drifting toward center and assembling into wireframe
const V2: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const blobs = useMemo(() => {
    const rng = seeded(2402);
    return Array.from({ length: 30 }, (_, i) => ({
      sx: (rng() - 0.5) * 300, sy: (rng() - 0.5) * 260,
      tx: (rng() - 0.5) * 60, ty: (rng() - 0.5) * 80, i,
    }));
  }, []);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height, s);
    const fo = fadeInOut(frame, DUR);
    ctx.globalAlpha = fo;
    drawHeader(ctx, width, height, s, frame, DUR, "Assembly", "blobs to shape");
    const cx = width / 2, cy = height / 2;
    const prog = interpolate(frame, [10, 90], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    for (const b of blobs) {
      const t = stagger(frame, b.i, 1.5, 8);
      const bx = cx + lerp(b.sx, b.tx, prog) * s;
      const by = cy + lerp(b.sy, b.ty, prog) * s;
      drawNode(ctx, bx, by, (3 + (1 - prog) * 2) * s * t, b.i % 2, fo * t);
    }
    if (prog > 0.7) {
      const wa = (prog - 0.7) / 0.3;
      drawNeuronShape(ctx, cx, cy, 50 * s, fo * wa, frame);
    }
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

// V3: Z-stack: horizontal scan lines descending with dots appearing on each
const V3: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height, s);
    const fo = fadeInOut(frame, DUR);
    ctx.globalAlpha = fo;
    drawHeader(ctx, width, height, s, frame, DUR, "Z-Stack Scan", "tracing depth");
    const cx = width / 2, cy = height / 2;
    const layers = 16;
    const rng = seeded(2403);
    for (let i = 0; i < layers; i++) {
      const t = stagger(frame, i, 4, 12);
      if (t <= 0) continue;
      const ly = cy - 100 * s + i * (200 / layers) * s;
      ctx.strokeStyle = `rgba(200,200,215,${fo * t * 0.2})`;
      ctx.lineWidth = 0.5 * s;
      ctx.beginPath(); ctx.moveTo(cx - 80 * s, ly); ctx.lineTo(cx + 80 * s, ly); ctx.stroke();
      const pts = 3 + Math.floor(rng() * 4);
      for (let p = 0; p < pts; p++) {
        const px = cx + (rng() - 0.5) * 120 * s;
        drawNode(ctx, px, ly, 2.5 * s * t, i % 2, fo * t);
      }
    }
    drawCounter(ctx, width, height, s, `${Math.min(layers, Math.floor(frame / 5))}`, "layers");
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

// V4: Perspective cube with neuron blob slices inside, rotating
const V4: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height, s);
    const fo = fadeInOut(frame, DUR);
    ctx.globalAlpha = fo;
    drawHeader(ctx, width, height, s, frame, DUR, "3D Trace", "through the stack");
    const cx = width / 2, cy = height / 2;
    const boxW = 100 * s, boxH = 120 * s;
    drawPanel(ctx, cx - boxW / 2, cy - boxH / 2, boxW, boxH, 0, fo * 0.5);
    const rng = seeded(2404);
    const sliceCount = 10;
    for (let i = 0; i < sliceCount; i++) {
      const t = stagger(frame, i, 3, 10);
      if (t <= 0) continue;
      const sy = cy - boxH * 0.4 + i * (boxH * 0.8 / sliceCount);
      const depth = i / sliceCount;
      const offset = depth * 15 * s;
      for (let p = 0; p < 4; p++) {
        const px = cx + (rng() - 0.5) * 50 * s + offset;
        drawNode(ctx, px, sy, (2 + depth * 2) * s * t, i % 2, fo * t * (0.5 + depth * 0.5));
      }
      if (i > 0) {
        const prevY = cy - boxH * 0.4 + (i - 1) * (boxH * 0.8 / sliceCount);
        drawEdgeFaint(ctx, cx + offset, prevY, cx + offset, sy, s);
      }
    }
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

// V5: Cross-section morphing: circle outlines of decreasing size forming dendrite tree
const V5: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height, s);
    const fo = fadeInOut(frame, DUR);
    ctx.globalAlpha = fo;
    drawHeader(ctx, width, height, s, frame, DUR, "Cross Sections", "tracing form");
    const cx = width / 2, cy = height / 2;
    for (let i = 0; i < 8; i++) {
      const t = stagger(frame, i, 4, 10);
      if (t <= 0) continue;
      const r = (30 - i * 3) * s * t;
      const offsetX = i * 8 * s;
      ctx.strokeStyle = accent(i, fo * t * 0.6);
      ctx.lineWidth = 1.5 * s;
      ctx.beginPath(); ctx.arc(cx + offsetX - 28 * s, cy, r, 0, Math.PI * 2); ctx.stroke();
      drawNode(ctx, cx + offsetX - 28 * s, cy, 3 * s * t, i % 2, fo * t);
    }
    const prog = interpolate(frame, [60, 110], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (prog > 0) {
      ctx.strokeStyle = accent(0, fo * prog * 0.4);
      ctx.lineWidth = 1 * s;
      ctx.beginPath(); ctx.moveTo(cx - 28 * s, cy);
      ctx.bezierCurveTo(cx + 20 * s, cy - 40 * s, cx + 40 * s, cy + 20 * s, cx + 50 * s, cy);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

// V6: Particle cloud coalescing into soma with branching dendrites
const V6: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const pts = useMemo(() => {
    const rng = seeded(2406);
    return Array.from({ length: 50 }, (_, i) => ({
      sx: (rng() - 0.5) * 320, sy: (rng() - 0.5) * 280,
      tx: (rng() - 0.5) * 30, ty: (rng() - 0.5) * 30, i,
    }));
  }, []);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height, s);
    const fo = fadeInOut(frame, DUR);
    ctx.globalAlpha = fo;
    drawHeader(ctx, width, height, s, frame, DUR, "Coalescing", "particles to neuron");
    const cx = width / 2, cy = height / 2;
    const prog = interpolate(frame, [5, 80], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    for (const p of pts) {
      const px = cx + lerp(p.sx, p.tx, prog) * s;
      const py = cy + lerp(p.sy, p.ty, prog) * s;
      const r = lerp(1.5, 2.5, prog) * s;
      drawNode(ctx, px, py, r, p.i % 2, fo * (0.3 + prog * 0.7));
    }
    if (prog > 0.8) {
      const na = (prog - 0.8) / 0.2;
      drawNodeGradient(ctx, cx, cy, 12 * s * na, 0, fo * na);
    }
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

// V7: Extrusion: flat shape being "pulled up" into 3D with layered outlines
const V7: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height, s);
    const fo = fadeInOut(frame, DUR);
    ctx.globalAlpha = fo;
    drawHeader(ctx, width, height, s, frame, DUR, "Extrusion", "2D to 3D");
    const cx = width / 2, cy = height / 2;
    const pull = interpolate(frame, [15, 90], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const layers = 8;
    for (let i = 0; i < layers; i++) {
      const t = stagger(frame, i, 3, 8);
      if (t <= 0) continue;
      const depth = (i / layers) * pull;
      const ox = depth * 30 * s;
      const oy = -depth * 20 * s;
      const alpha = fo * t * (0.3 + (1 - depth) * 0.7);
      ctx.strokeStyle = accent(i, alpha * 0.5);
      ctx.lineWidth = 1.2 * s;
      ctx.beginPath();
      ctx.ellipse(cx + ox, cy + oy, 20 * s, 30 * s, 0, 0, Math.PI * 2);
      ctx.stroke();
      drawNode(ctx, cx + ox, cy + oy - 30 * s, 2 * s * t, i % 2, alpha);
      drawNode(ctx, cx + ox, cy + oy + 30 * s, 2 * s * t, (i + 1) % 2, alpha);
    }
    if (pull > 0.5) {
      for (let i = 0; i < layers - 1; i++) {
        const d1 = (i / layers) * pull, d2 = ((i + 1) / layers) * pull;
        drawEdgeFaint(ctx, cx + d1 * 30 * s, cy - d1 * 20 * s, cx + d2 * 30 * s, cy - d2 * 20 * s, s);
      }
    }
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

// V8: Layer peeling: stacked transparent planes peeling apart to reveal depth
const V8: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height, s);
    const fo = fadeInOut(frame, DUR);
    ctx.globalAlpha = fo;
    drawHeader(ctx, width, height, s, frame, DUR, "Layer Peel", "revealing depth");
    const cx = width / 2, cy = height / 2;
    const spread = interpolate(frame, [10, 80], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const rng = seeded(2408);
    for (let i = 0; i < 6; i++) {
      const t = stagger(frame, i, 3, 10);
      if (t <= 0) continue;
      const offsetY = (i - 2.5) * 30 * spread * s;
      const pw = 80 * s, ph = 20 * s;
      drawPanel(ctx, cx - pw / 2, cy + offsetY - ph / 2, pw, ph, i % 2, fo * t * 0.4);
      for (let p = 0; p < 5; p++) {
        const px = cx + (rng() - 0.5) * 70 * s;
        drawNode(ctx, px, cy + offsetY, 2 * s * t, i % 2, fo * t);
      }
    }
    drawCounter(ctx, width, height, s, `${6}`, "layers");
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

// V9: Hologram: wireframe neuron rotating with scan lines
const V9: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height, s);
    const fo = fadeInOut(frame, DUR);
    ctx.globalAlpha = fo;
    drawHeader(ctx, width, height, s, frame, DUR, "Hologram", "full 3D shape");
    const cx = width / 2, cy = height / 2;
    const appear = interpolate(frame, [8, 50], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    // Scan line sweeping down
    const scanY = cy - 80 * s + (frame / DUR) * 160 * s;
    ctx.strokeStyle = accent(0, fo * 0.3);
    ctx.lineWidth = 0.5 * s;
    ctx.beginPath(); ctx.moveTo(cx - 90 * s, scanY); ctx.lineTo(cx + 90 * s, scanY); ctx.stroke();
    // Neuron shape revealed
    if (appear > 0.2) {
      drawNeuronShape(ctx, cx, cy, 55 * s * appear, fo * appear, frame);
    }
    // Corner markers
    const corners = [[-1, -1], [1, -1], [1, 1], [-1, 1]];
    for (const [dx, dy] of corners) {
      const mx = cx + dx * 85 * s, my = cy + dy * 75 * s;
      ctx.strokeStyle = accent(0, fo * 0.3);
      ctx.lineWidth = 1 * s;
      ctx.beginPath(); ctx.moveTo(mx, my + dy * -8 * s); ctx.lineTo(mx, my); ctx.lineTo(mx + dx * -8 * s, my); ctx.stroke();
    }
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

export const VARIANTS_SHOT_024: VariantDef[] = [
  { id: "024-layer-stack", label: "Layer stack converging", component: V1 },
  { id: "024-blob-assemble", label: "Blobs assembling", component: V2 },
  { id: "024-z-stack-scan", label: "Z-stack scan lines", component: V3 },
  { id: "024-perspective-box", label: "Perspective depth box", component: V4 },
  { id: "024-cross-sections", label: "Cross section morphing", component: V5 },
  { id: "024-coalesce", label: "Particle coalescence", component: V6 },
  { id: "024-extrusion", label: "2D to 3D extrusion", component: V7 },
  { id: "024-layer-peel", label: "Layer peel reveal", component: V8 },
  { id: "024-hologram", label: "Wireframe hologram", component: V9 },
];
