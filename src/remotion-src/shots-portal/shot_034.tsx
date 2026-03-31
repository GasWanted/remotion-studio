import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantDef, VariantProps } from "../types";
import {
  C, seeded, accent, easeOutBack, drawBg, fadeInOut, stagger, staggerRaw,
  drawNode, drawNodeGradient, drawNodeDormant, drawEdge, drawEdgeGlow, drawEdgeFaint,
  drawHeader, drawCounter, drawPerson, drawNeuronShape, drawFlyOutline, drawPanel,
  drawCheck, drawXMark, drawSignalPulse, drawBarChart, drawThresholdLine, lerp,
} from "./portal-kit";

// Shot 034 — "To answer that, you need to understand what neurons actually do."
// 9 variants — single neuron schematic using drawNeuronShape (DUR=120)

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
    const grow = interpolate(frame, [8, 60], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawNeuronShape(ctx, width / 2, height / 2, 80 * s * grow, a, frame);
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
    drawNeuronShape(ctx, cx, cy, 70 * s, a, frame);
    const la = staggerRaw(frame, 0, 35, 15);
    ctx.globalAlpha = a * la;
    ctx.fillStyle = C.textDim; ctx.font = `500 ${8 * s}px system-ui`; ctx.textAlign = "center";
    ctx.fillText("dendrites", cx - 40 * s, cy - 30 * s);
    ctx.fillText("soma", cx, cy + 25 * s);
    ctx.fillStyle = C.orangeMid;
    ctx.fillText("axon", cx + 55 * s, cy - 10 * s);
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
    // Question mark outline
    ctx.strokeStyle = `rgba(64,144,255,${a * 0.25})`; ctx.lineWidth = 3 * s; ctx.lineCap = "round";
    ctx.beginPath();
    ctx.arc(cx, cy - 15 * s, 40 * s, Math.PI * 1.2, Math.PI * 0.1, false);
    ctx.lineTo(cx, cy + 15 * s); ctx.stroke();
    ctx.fillStyle = `rgba(64,144,255,${a * 0.25})`;
    ctx.beginPath(); ctx.arc(cx, cy + 30 * s, 3 * s, 0, Math.PI * 2); ctx.fill();
    // Neuron inside
    const grow = interpolate(frame, [10, 55], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawNeuronShape(ctx, cx, cy - 10 * s, 45 * s * grow, a, frame);
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={ref} width={width} height={height} /></div>;
};

const V4: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const dots = useMemo(() => {
    const rng = seeded(3404);
    return Array.from({ length: 30 }, () => ({ x: rng() * width, y: rng() * height }));
  }, [width, height]);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height, s);
    const a = fadeInOut(frame, DUR);
    ctx.globalAlpha = a;
    const appear = staggerRaw(frame, 0, 5, 20);
    for (const d of dots) drawNodeDormant(ctx, d.x, d.y, 5 * s, a * appear);
    const cx = width / 2, cy = height / 2;
    const pulse = 1 + Math.sin(frame * 0.15) * 0.15;
    drawNodeGradient(ctx, cx, cy, 12 * s * pulse * appear, 0, a);
    const la = staggerRaw(frame, 0, 30, 15);
    ctx.globalAlpha = a * la;
    ctx.fillStyle = C.text; ctx.font = `600 ${9 * s}px system-ui`; ctx.textAlign = "center";
    ctx.fillText("this one", cx, cy + 22 * s);
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={ref} width={width} height={height} /></div>;
};

const V5: React.FC<VariantProps> = ({ width, height }) => {
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
    const draw = interpolate(frame, [5, 50], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    // Circuit triangle symbol
    ctx.strokeStyle = accent(0, a * 0.8); ctx.lineWidth = 2 * s; ctx.lineCap = "round";
    const ts = 25 * s * draw;
    ctx.beginPath();
    ctx.moveTo(cx - ts, cy - ts); ctx.lineTo(cx + ts * 1.2, cy); ctx.lineTo(cx - ts, cy + ts); ctx.closePath();
    ctx.stroke();
    // Input lines
    for (let i = -1; i <= 1; i++) {
      const iy = cy + i * 15 * s;
      ctx.beginPath(); ctx.moveTo(cx - ts - 30 * s * draw, iy); ctx.lineTo(cx - ts, iy); ctx.stroke();
      drawNode(ctx, cx - ts - 30 * s * draw, iy, 3 * s, 0, a * draw);
    }
    // Output axon
    ctx.strokeStyle = accent(1, a * 0.8);
    ctx.beginPath(); ctx.moveTo(cx + ts * 1.2, cy); ctx.lineTo(cx + ts * 1.2 + 30 * s * draw, cy); ctx.stroke();
    drawNode(ctx, cx + ts * 1.2 + 30 * s * draw, cy, 3 * s, 1, a * draw);
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
    const pulse = 1 + Math.sin(frame * 0.12) * 0.2;
    const appear = staggerRaw(frame, 0, 5, 20);
    drawNodeGradient(ctx, cx, cy, 16 * s * pulse * appear, 0, a);
    const la = staggerRaw(frame, 0, 25, 15);
    ctx.globalAlpha = a * la;
    ctx.fillStyle = C.textDim; ctx.font = `500 ${8 * s}px system-ui`; ctx.textAlign = "center";
    ctx.fillText("what does it do?", cx, cy + 35 * s);
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={ref} width={width} height={height} /></div>;
};

const V7: React.FC<VariantProps> = ({ width, height }) => {
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
    const grow = interpolate(frame, [5, 70], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    // Vertical trunk
    ctx.strokeStyle = accent(0, a * 0.7); ctx.lineWidth = 3 * s; ctx.lineCap = "round";
    const trunkH = 60 * s * grow;
    ctx.beginPath(); ctx.moveTo(cx, cy + 30 * s); ctx.lineTo(cx, cy + 30 * s - trunkH); ctx.stroke();
    // Roots (dendrites)
    if (grow > 0.2) {
      const rg = interpolate(grow, [0.2, 0.6], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      for (let i = 0; i < 5; i++) {
        const ang = Math.PI * 0.35 + (i / 4) * Math.PI * 0.3;
        drawEdge(ctx, cx, cy + 30 * s, cx + Math.cos(ang) * (15 + i * 5) * s * rg, cy + 30 * s + Math.sin(ang) * (15 + i * 5) * s * rg, 0, a * 0.5, s);
      }
    }
    // Branches (axon terminals)
    if (grow > 0.5) {
      const bg = interpolate(grow, [0.5, 1], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const topY = cy + 30 * s - trunkH;
      for (let i = 0; i < 5; i++) {
        const ang = -Math.PI * 0.35 - (i / 4) * Math.PI * 0.3;
        const ex = cx + Math.cos(ang) * (15 + i * 6) * s * bg;
        const ey = topY + Math.sin(ang) * (15 + i * 6) * s * bg;
        drawEdge(ctx, cx, topY, ex, ey, 1, a * 0.5, s);
        drawNode(ctx, ex, ey, 2 * s, 1, a * bg);
      }
    }
    drawNodeGradient(ctx, cx, cy, 6 * s * Math.min(1, grow * 3), 0, a);
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
    const px = Math.sin(frame * 0.04) * 15 * s;
    const py = Math.cos(frame * 0.03) * 8 * s;
    const appear = staggerRaw(frame, 0, 5, 20);
    // Background dendrites (slow parallax)
    for (let i = 0; i < 4; i++) {
      const ang = Math.PI * 0.7 + i * Math.PI * 0.25;
      const len = 45 * s * appear;
      drawEdgeFaint(ctx, cx + px * 0.3, cy + py * 0.3, cx + px * 0.3 + Math.cos(ang) * len, cy + py * 0.3 + Math.sin(ang) * len, s);
    }
    // Foreground neuron
    drawNodeGradient(ctx, cx + px, cy + py, 14 * s * appear, 0, a);
    // Axon
    drawEdgeGlow(ctx, cx + px * 0.7, cy + py * 0.7, cx + px * 0.7 + 50 * s * appear, cy + py * 0.7, 1, a * 0.6, s);
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
    const cx = width / 2, cy = height / 2;
    const t = interpolate(frame, [5, 90], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    // Progressive sketch: dendrites then soma then axon
    const segs = [
      { ang: Math.PI * 0.8, l: 35, t0: 0, t1: 0.25 },
      { ang: Math.PI * 0.95, l: 30, t0: 0.05, t1: 0.3 },
      { ang: Math.PI * 1.1, l: 38, t0: 0.1, t1: 0.35 },
    ];
    for (const sg of segs) {
      const p = interpolate(t, [sg.t0, sg.t1], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      if (p > 0) drawEdge(ctx, cx, cy, cx + Math.cos(sg.ang) * sg.l * s * p, cy + Math.sin(sg.ang) * sg.l * s * p, 0, a * 0.7, s);
    }
    const bodyP = interpolate(t, [0.3, 0.5], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (bodyP > 0) drawNodeGradient(ctx, cx, cy, 12 * s * bodyP, 0, a);
    const axP = interpolate(t, [0.5, 0.8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (axP > 0) drawEdgeGlow(ctx, cx, cy, cx + 60 * s * axP, cy, 1, a * 0.7, s);
    const tdP = interpolate(t, [0.8, 1], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (tdP > 0) {
      for (let i = -1; i <= 1; i++) drawNode(ctx, cx + 60 * s + 10 * s * tdP, cy + i * 10 * s, 2.5 * s * tdP, 1, a);
    }
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={ref} width={width} height={height} /></div>;
};

export const VARIANTS_SHOT_034: VariantDef[] = [
  { id: "034-neuron-grow", label: "Growing neuron schematic", component: V1 },
  { id: "034-labeled-parts", label: "Labeled neuron parts", component: V2 },
  { id: "034-question-mark", label: "Neuron in question mark", component: V3 },
  { id: "034-highlight-one", label: "One dot highlighted", component: V4 },
  { id: "034-circuit-symbol", label: "Circuit symbol neuron", component: V5 },
  { id: "034-pulsing-question", label: "Pulsing what does it do", component: V6 },
  { id: "034-tree-metaphor", label: "Tree roots and branches", component: V7 },
  { id: "034-parallax-depth", label: "Parallax depth shift", component: V8 },
  { id: "034-sketch-progressive", label: "Progressive sketch drawing", component: V9 },
];
