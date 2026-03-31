import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantDef, VariantProps } from "../types";
import {
  C, seeded, accent, easeOutBack, drawBg, fadeInOut, stagger, staggerRaw,
  drawNode, drawNodeGradient, drawNodeDormant, drawEdge, drawEdgeGlow, drawEdgeFaint,
  drawHeader, drawCounter, drawPerson, drawNeuronShape, drawFlyOutline, drawPanel,
  drawCheck, drawXMark, drawSignalPulse, drawBarChart, drawThresholdLine, lerp,
} from "./portal-kit";

// Shot 036 — "A neuron receives electrical signals from other neurons it's connected to."
// 9 variants — 3 input nodes sending signal pulses to central node (DUR=150)

const DUR = 150;

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
    const inputs = [{ x: cx - 80 * s, y: cy - 40 * s }, { x: cx - 80 * s, y: cy }, { x: cx - 80 * s, y: cy + 40 * s }];
    for (let i = 0; i < 3; i++) {
      const sa = stagger(frame, i, 8, 12);
      drawNode(ctx, inputs[i].x, inputs[i].y, 6 * s * sa, 0, a);
      drawEdge(ctx, inputs[i].x, inputs[i].y, cx, cy, 0, a * 0.2, s);
      const pulseT = ((frame - 30 - i * 15) % 60) / 60;
      if (pulseT > 0 && pulseT < 1 && frame > 30 + i * 15) drawSignalPulse(ctx, inputs[i].x, inputs[i].y, cx, cy, pulseT, 0, s);
    }
    const recv = Math.sin(frame * 0.08) * 0.15 + 1;
    drawNodeGradient(ctx, cx, cy, 10 * s * recv, 0, a);
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
    const cx = width / 2 + 20 * s, cy = height / 2;
    const inputs = [{ x: cx - 100 * s, y: cy - 45 * s }, { x: cx - 100 * s, y: cy }, { x: cx - 100 * s, y: cy + 45 * s }];
    drawHeader(ctx, width, height, s, frame, DUR, "Signal Reception");
    for (let i = 0; i < 3; i++) {
      const sa = stagger(frame, i, 6, 10);
      drawNode(ctx, inputs[i].x, inputs[i].y, 5 * s * sa, 0, a);
      drawEdgeGlow(ctx, inputs[i].x, inputs[i].y, cx, cy, 0, a * 0.25, s);
      const pulseT = ((frame - 25 - i * 20) % 50) / 50;
      if (pulseT > 0 && pulseT < 1 && frame > 25) drawSignalPulse(ctx, inputs[i].x, inputs[i].y, cx, cy, pulseT, 0, s);
    }
    drawNodeGradient(ctx, cx, cy, 12 * s, 0, a);
    ctx.fillStyle = C.textDim; ctx.font = `${7 * s}px system-ui`; ctx.textAlign = "center";
    ctx.fillText("receiver", cx, cy + 22 * s);
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
    // Fan arrangement — inputs in arc
    const angles = [-Math.PI * 0.7, -Math.PI * 0.5, -Math.PI * 0.3];
    const dist = 70 * s;
    for (let i = 0; i < 3; i++) {
      const ix = cx + Math.cos(angles[i] + Math.PI) * dist;
      const iy = cy + Math.sin(angles[i] + Math.PI) * dist;
      const sa = stagger(frame, i, 5, 10);
      drawNode(ctx, ix, iy, 5 * s * sa, 0, a);
      drawEdge(ctx, ix, iy, cx, cy, 0, a * 0.2, s);
      const pulseT = interpolate((frame - 20 - i * 12) % 45, [0, 45], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      if (frame > 20 + i * 12) drawSignalPulse(ctx, ix, iy, cx, cy, pulseT, 0, s);
    }
    const glow = frame > 50 ? 1 + Math.sin(frame * 0.1) * 0.2 : 1;
    drawNodeGradient(ctx, cx, cy, 10 * s * glow, 0, a);
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
    // Staggered appearance with labels
    const labels = ["+3", "+2", "-1"];
    const inputs = [{ x: cx - 90 * s, y: cy - 35 * s }, { x: cx - 90 * s, y: cy }, { x: cx - 90 * s, y: cy + 35 * s }];
    for (let i = 0; i < 3; i++) {
      const sa = stagger(frame, i, 10, 12);
      drawNode(ctx, inputs[i].x, inputs[i].y, 6 * s * sa, i === 2 ? 1 : 0, a);
      drawEdge(ctx, inputs[i].x, inputs[i].y, cx, cy, i === 2 ? 1 : 0, a * 0.2, s);
      ctx.globalAlpha = a * sa;
      ctx.fillStyle = i === 2 ? C.orange : C.blue; ctx.font = `600 ${8 * s}px system-ui`; ctx.textAlign = "center";
      ctx.fillText(labels[i], inputs[i].x, inputs[i].y - 12 * s);
      ctx.globalAlpha = a;
      const pulseT = ((frame - 40 - i * 18) % 55) / 55;
      if (frame > 40 + i * 18) drawSignalPulse(ctx, inputs[i].x, inputs[i].y, cx, cy, pulseT, i === 2 ? 1 : 0, s);
    }
    drawNodeGradient(ctx, cx, cy, 10 * s, 0, a);
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
    // NeuronShape with incoming signals
    const grow = interpolate(frame, [5, 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawNeuronShape(ctx, cx + 10 * s, cy, 60 * s * grow, a, frame);
    // Signal pulses aimed at dendrite region
    const dendX = cx - 50 * s, dendY = cy;
    for (let i = 0; i < 3; i++) {
      const sx = cx - 120 * s, sy = cy + (i - 1) * 30 * s;
      const pulseT = ((frame - 45 - i * 15) % 50) / 50;
      if (frame > 45 + i * 15) {
        drawEdgeFaint(ctx, sx, sy, dendX, dendY, s);
        drawSignalPulse(ctx, sx, sy, dendX, dendY, pulseT, 0, s);
      }
    }
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
    const cx = width / 2 + 10 * s, cy = height / 2;
    // Panel-framed diagram
    drawPanel(ctx, width * 0.1, height * 0.15, width * 0.8, height * 0.7, 0, a * 0.5);
    const inputs = [{ x: cx - 70 * s, y: cy - 30 * s }, { x: cx - 70 * s, y: cy }, { x: cx - 70 * s, y: cy + 30 * s }];
    for (let i = 0; i < 3; i++) {
      const sa = stagger(frame, i, 6, 10);
      drawNode(ctx, inputs[i].x, inputs[i].y, 5 * s * sa, 0, a);
      drawEdgeGlow(ctx, inputs[i].x, inputs[i].y, cx, cy, 0, a * 0.2, s);
      const pulseT = ((frame - 35 - i * 12) % 40) / 40;
      if (frame > 35 + i * 12) drawSignalPulse(ctx, inputs[i].x, inputs[i].y, cx, cy, pulseT, 0, s);
    }
    drawNodeGradient(ctx, cx, cy, 10 * s, 0, a);
    ctx.fillStyle = C.textDim; ctx.font = `${7 * s}px system-ui`; ctx.textAlign = "left";
    ctx.fillText("electrical signals", cx - 70 * s, height * 0.88);
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
    // Sequential wave: signals arrive one by one, node brightens each time
    const inputs = [{ x: cx - 85 * s, y: cy - 40 * s }, { x: cx - 85 * s, y: cy }, { x: cx - 85 * s, y: cy + 40 * s }];
    let brightness = 0;
    for (let i = 0; i < 3; i++) {
      drawNode(ctx, inputs[i].x, inputs[i].y, 5 * s, 0, a);
      drawEdge(ctx, inputs[i].x, inputs[i].y, cx, cy, 0, a * 0.15, s);
      const arriveFrame = 25 + i * 30;
      const pulseT = interpolate(frame, [arriveFrame, arriveFrame + 25], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      if (frame >= arriveFrame) drawSignalPulse(ctx, inputs[i].x, inputs[i].y, cx, cy, pulseT, 0, s);
      if (pulseT >= 1) brightness += 0.33;
    }
    drawNodeGradient(ctx, cx, cy, (8 + brightness * 6) * s, 0, a * (0.4 + brightness * 0.6));
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
    // 5 inputs in semicircle
    for (let i = 0; i < 5; i++) {
      const ang = Math.PI * 0.6 + (i / 4) * Math.PI * 0.8;
      const ix = cx + Math.cos(ang) * 80 * s;
      const iy = cy + Math.sin(ang) * 80 * s;
      const sa = stagger(frame, i, 4, 10);
      drawNode(ctx, ix, iy, 4 * s * sa, 0, a);
      drawEdgeFaint(ctx, ix, iy, cx, cy, s);
      const pulseT = ((frame - 20 - i * 10) % 40) / 40;
      if (frame > 20 + i * 10) drawSignalPulse(ctx, ix, iy, cx, cy, pulseT, 0, s);
    }
    drawNodeGradient(ctx, cx, cy, 12 * s, 0, a);
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
    // Continuous stream: many small pulses
    const inputs = [{ x: cx - 90 * s, y: cy - 35 * s }, { x: cx - 90 * s, y: cy }, { x: cx - 90 * s, y: cy + 35 * s }];
    for (let i = 0; i < 3; i++) {
      drawNode(ctx, inputs[i].x, inputs[i].y, 5 * s, 0, a);
      drawEdge(ctx, inputs[i].x, inputs[i].y, cx, cy, 0, a * 0.15, s);
      // Multiple pulses per edge
      for (let p = 0; p < 3; p++) {
        const pulseT = ((frame - 15 - i * 8 - p * 18) % 45) / 45;
        if (pulseT > 0 && pulseT < 1 && frame > 15 + i * 8 + p * 18) drawSignalPulse(ctx, inputs[i].x, inputs[i].y, cx, cy, pulseT, 0, s);
      }
    }
    const glow = 1 + Math.sin(frame * 0.15) * 0.15;
    drawNodeGradient(ctx, cx, cy, 10 * s * glow, 0, a);
    drawCounter(ctx, width, height, s, "3 inputs", "connected");
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={ref} width={width} height={height} /></div>;
};

export const VARIANTS_SHOT_036: VariantDef[] = [
  { id: "036-basic-pulses", label: "3 inputs pulsing to center", component: V1 },
  { id: "036-labeled-header", label: "Header with receiver label", component: V2 },
  { id: "036-fan-arc", label: "Fan arc arrangement", component: V3 },
  { id: "036-weighted-signals", label: "Labeled +3 +2 -1 signals", component: V4 },
  { id: "036-neuron-shape", label: "Full neuron shape with pulses", component: V5 },
  { id: "036-panel-framed", label: "Panel framed diagram", component: V6 },
  { id: "036-sequential-wave", label: "Sequential brightening", component: V7 },
  { id: "036-semicircle-5", label: "5 inputs in semicircle", component: V8 },
  { id: "036-continuous-stream", label: "Continuous pulse stream", component: V9 },
];
