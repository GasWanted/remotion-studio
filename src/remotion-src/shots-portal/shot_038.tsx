import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantDef, VariantProps } from "../types";
import {
  C, seeded, accent, easeOutBack, drawBg, fadeInOut, stagger, staggerRaw,
  drawNode, drawNodeGradient, drawNodeDormant, drawEdge, drawEdgeGlow, drawEdgeFaint,
  drawHeader, drawCounter, drawPerson, drawNeuronShape, drawFlyOutline, drawPanel,
  drawCheck, drawXMark, drawSignalPulse, drawBarChart, drawThresholdLine, lerp,
} from "./portal-kit";

// Shot 038 — "If the total crosses a threshold — it fires, and sends its own signal out..."
// 9 variants — central node fires, signals split to 3 output nodes (DUR=120)

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
    const fireFrame = 40;
    const fired = frame >= fireFrame;
    const flash = fired ? Math.max(0, 1 - (frame - fireFrame) / 15) : 0;
    drawNodeGradient(ctx, cx, cy, (10 + flash * 8) * s, 0, a);
    const outputs = [{ x: cx + 80 * s, y: cy - 40 * s }, { x: cx + 80 * s, y: cy }, { x: cx + 80 * s, y: cy + 40 * s }];
    for (let i = 0; i < 3; i++) {
      drawEdge(ctx, cx, cy, outputs[i].x, outputs[i].y, 1, a * 0.2, s);
      drawNode(ctx, outputs[i].x, outputs[i].y, 6 * s, 1, a);
      if (fired) {
        const pulseT = interpolate(frame - fireFrame - i * 5, [0, 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        if (pulseT > 0 && pulseT < 1) drawSignalPulse(ctx, cx, cy, outputs[i].x, outputs[i].y, pulseT, 1, s);
      }
    }
    if (fired) {
      ctx.globalAlpha = a * Math.min(1, (frame - fireFrame) / 10);
      ctx.fillStyle = C.orange; ctx.font = `700 ${12 * s}px system-ui`; ctx.textAlign = "center";
      ctx.fillText("FIRE", cx, cy - 20 * s);
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
    const fill = interpolate(frame, [5, 35], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const cw = 30 * s, ch = 50 * s;
    ctx.strokeStyle = accent(0, a * 0.4); ctx.lineWidth = 1.5 * s;
    ctx.strokeRect(cx - cw / 2, cy - ch / 2, cw, ch);
    ctx.fillStyle = accent(0, a * 0.3);
    ctx.fillRect(cx - cw / 2, cy + ch / 2 - ch * fill, cw, ch * fill);
    drawThresholdLine(ctx, cx - cw / 2 - 5 * s, cy - ch * 0.1, cw + 10 * s, "T", s);
    const fired = fill >= 0.6;
    if (fired) {
      const flash = Math.max(0, 1 - (frame - 25) / 12);
      drawNodeGradient(ctx, cx, cy, (8 + flash * 6) * s, 0, a);
      const outputs = [{ x: cx + 70 * s, y: cy - 30 * s }, { x: cx + 70 * s, y: cy }, { x: cx + 70 * s, y: cy + 30 * s }];
      for (let i = 0; i < 3; i++) {
        drawEdge(ctx, cx, cy, outputs[i].x, outputs[i].y, 1, a * 0.2, s);
        drawNode(ctx, outputs[i].x, outputs[i].y, 5 * s, 1, a);
        const pt = interpolate(frame - 30 - i * 6, [0, 25], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        if (pt > 0 && pt < 1) drawSignalPulse(ctx, cx, cy, outputs[i].x, outputs[i].y, pt, 1, s);
      }
    }
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
    const cx = width / 2 - 10 * s, cy = height / 2;
    drawNeuronShape(ctx, cx, cy, 55 * s, a, frame);
    const fired = frame > 35;
    if (fired) {
      for (let i = -2; i <= 2; i++) {
        const tx = cx + 55 * s * 0.8 + 55 * s * 0.2;
        const ty = cy + i * 55 * s * 0.15;
        const ex = tx + 40 * s, ey = ty;
        const pt = interpolate(frame - 35 - Math.abs(i) * 5, [0, 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        if (pt > 0 && pt < 1) drawSignalPulse(ctx, tx, ty, ex, ey, pt, 1, s);
      }
    }
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
    const fireFrame = 35;
    const fired = frame >= fireFrame;
    if (fired) {
      const burst = interpolate(frame - fireFrame, [0, 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      ctx.strokeStyle = accent(1, a * (1 - burst) * 0.4); ctx.lineWidth = 2 * s;
      ctx.beginPath(); ctx.arc(cx, cy, burst * 60 * s, 0, Math.PI * 2); ctx.stroke();
    }
    drawNodeGradient(ctx, cx, cy, (10 + (fired ? Math.max(0, 1 - (frame - fireFrame) / 12) * 8 : 0)) * s, 0, a);
    const angles = [0, Math.PI * 0.25, -Math.PI * 0.25, Math.PI * 0.1];
    for (let i = 0; i < 4; i++) {
      const ox = cx + Math.cos(angles[i]) * 80 * s;
      const oy = cy + Math.sin(angles[i]) * 80 * s;
      drawEdge(ctx, cx, cy, ox, oy, 1, a * 0.15, s);
      drawNode(ctx, ox, oy, 5 * s, 1, a);
      if (fired) {
        const pt = interpolate(frame - fireFrame - i * 4, [0, 25], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        if (pt > 0 && pt < 1) drawSignalPulse(ctx, cx, cy, ox, oy, pt, 1, s);
      }
    }
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
    drawHeader(ctx, width, height, s, frame, DUR, "Threshold Crossed");
    const fireFrame = 40;
    const fired = frame >= fireFrame;
    const outputs = [{ x: cx + 70 * s, y: cy - 35 * s }, { x: cx + 70 * s, y: cy }, { x: cx + 70 * s, y: cy + 35 * s }];
    for (let i = 0; i < 3; i++) {
      if (fired) drawEdgeGlow(ctx, cx, cy, outputs[i].x, outputs[i].y, 1, a * 0.4, s);
      else drawEdgeFaint(ctx, cx, cy, outputs[i].x, outputs[i].y, s);
      drawNode(ctx, outputs[i].x, outputs[i].y, 5 * s, 1, a);
      if (fired) {
        const pt = ((frame - fireFrame - i * 8) % 40) / 40;
        if (pt > 0) drawSignalPulse(ctx, cx, cy, outputs[i].x, outputs[i].y, pt, 1, s);
      }
    }
    drawNodeGradient(ctx, cx, cy, (10 + (fired ? 4 * Math.sin(frame * 0.15) : 0)) * s, fired ? 1 : 0, a);
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
    const fireFrame = 45;
    const fired = frame >= fireFrame;
    if (!fired) {
      drawNodeDormant(ctx, cx, cy, 14 * s, a);
      ctx.fillStyle = C.textDim; ctx.font = `${8 * s}px system-ui`; ctx.textAlign = "center";
      ctx.fillText("below threshold", cx, cy + 20 * s);
    } else {
      const flash = Math.max(0, 1 - (frame - fireFrame) / 12);
      drawNodeGradient(ctx, cx, cy, (12 + flash * 8) * s, 1, a);
      const outputs = [{ x: cx + 75 * s, y: cy - 30 * s }, { x: cx + 75 * s, y: cy }, { x: cx + 75 * s, y: cy + 30 * s }];
      for (let i = 0; i < 3; i++) {
        drawEdgeGlow(ctx, cx, cy, outputs[i].x, outputs[i].y, 1, a * 0.3, s);
        drawNode(ctx, outputs[i].x, outputs[i].y, 5 * s, 1, a);
        const pt = interpolate(frame - fireFrame - i * 6, [0, 25], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        if (pt > 0 && pt < 1) drawSignalPulse(ctx, cx, cy, outputs[i].x, outputs[i].y, pt, 1, s);
      }
    }
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
    drawPanel(ctx, cx - 50 * s, cy - 50 * s, 100 * s, 100 * s, 0, a * 0.3);
    const fill = interpolate(frame, [5, 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const meterH = 80 * s * fill;
    ctx.fillStyle = accent(0, a * 0.35);
    ctx.fillRect(cx - 12 * s, cy + 40 * s - meterH, 24 * s, meterH);
    drawThresholdLine(ctx, cx - 45 * s, cy - 10 * s, 90 * s, "T", s);
    if (fill > 0.6) {
      const flash = Math.max(0, 1 - (frame - 28) / 10);
      drawNodeGradient(ctx, cx, cy, (6 + flash * 4) * s, 1, a);
      for (let i = -1; i <= 1; i++) {
        const ox = cx + 80 * s, oy = cy + i * 30 * s;
        drawEdge(ctx, cx + 50 * s, cy, ox, oy, 1, a * 0.3, s);
        drawNode(ctx, ox, oy, 4 * s, 1, a);
      }
    }
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
    const cycle = (frame % 60);
    const fired = cycle > 20;
    const flash = fired ? Math.max(0, 1 - (cycle - 20) / 10) : 0;
    drawNodeGradient(ctx, cx, cy, (10 + flash * 8) * s, fired ? 1 : 0, a);
    for (let i = 0; i < 5; i++) {
      const ang = (i / 5) * Math.PI * 2 - Math.PI / 2;
      const ox = cx + Math.cos(ang) * 70 * s;
      const oy = cy + Math.sin(ang) * 70 * s;
      drawEdge(ctx, cx, cy, ox, oy, 1, a * 0.15, s);
      drawNode(ctx, ox, oy, 4 * s, 1, a);
      if (fired) {
        const pt = interpolate(cycle - 20 - i * 3, [0, 25], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        if (pt > 0 && pt < 1) drawSignalPulse(ctx, cx, cy, ox, oy, pt, 1, s);
      }
    }
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
    const inputs = [{ x: cx - 80 * s, y: cy - 25 * s }, { x: cx - 80 * s, y: cy + 25 * s }];
    for (let i = 0; i < 2; i++) {
      drawNode(ctx, inputs[i].x, inputs[i].y, 4 * s, 0, a);
      drawEdge(ctx, inputs[i].x, inputs[i].y, cx, cy, 0, a * 0.15, s);
      const pt = ((frame - 5 - i * 10) % 35) / 35;
      if (frame > 5 + i * 10) drawSignalPulse(ctx, inputs[i].x, inputs[i].y, cx, cy, pt, 0, s);
    }
    const fireFrame = 40;
    const fired = frame >= fireFrame;
    drawNodeGradient(ctx, cx, cy, (8 + (fired ? Math.max(0, 1 - (frame - fireFrame) / 10) * 6 : 0)) * s, 0, a);
    const outputs = [{ x: cx + 80 * s, y: cy - 25 * s }, { x: cx + 80 * s, y: cy }, { x: cx + 80 * s, y: cy + 25 * s }];
    for (let i = 0; i < 3; i++) {
      drawEdge(ctx, cx, cy, outputs[i].x, outputs[i].y, 1, a * 0.15, s);
      drawNode(ctx, outputs[i].x, outputs[i].y, 4 * s, 1, a);
      if (fired) {
        const pt = interpolate(frame - fireFrame - i * 5, [0, 25], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        if (pt > 0 && pt < 1) drawSignalPulse(ctx, cx, cy, outputs[i].x, outputs[i].y, pt, 1, s);
      }
    }
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={ref} width={width} height={height} /></div>;
};

export const VARIANTS_SHOT_038: VariantDef[] = [
  { id: "038-fire-split", label: "Central fires to 3 outputs", component: V1 },
  { id: "038-threshold-fill", label: "Threshold fill then fire", component: V2 },
  { id: "038-neuron-fires", label: "NeuronShape axon pulses", component: V3 },
  { id: "038-radial-burst", label: "Radial burst to 4 outputs", component: V4 },
  { id: "038-glow-edges", label: "Glowing edge propagation", component: V5 },
  { id: "038-dormant-active", label: "Dormant to active transition", component: V6 },
  { id: "038-panel-meter", label: "Panel with threshold meter", component: V7 },
  { id: "038-cycle-fire", label: "Repeating fire cycle", component: V8 },
  { id: "038-full-chain", label: "Input to output full chain", component: V9 },
];
