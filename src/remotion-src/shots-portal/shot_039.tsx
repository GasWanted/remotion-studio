import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantDef, VariantProps } from "../types";
import {
  C, seeded, accent, easeOutBack, drawBg, fadeInOut, stagger, staggerRaw,
  drawNode, drawNodeGradient, drawNodeDormant, drawEdge, drawEdgeGlow, drawEdgeFaint,
  drawHeader, drawCounter, drawPerson, drawNeuronShape, drawFlyOutline, drawPanel,
  drawCheck, drawXMark, drawSignalPulse, drawBarChart, drawThresholdLine, lerp,
} from "./portal-kit";

// Shot 039 — "That's it. Receive, add up, fire or don't."
// 9 variants — cycling RECEIVE -> SUM -> FIRE loop (DUR=90)

const DUR = 90;

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
    const steps = ["RECEIVE", "SUM", "FIRE"];
    const positions = [{ x: cx - 60 * s, y: cy }, { x: cx, y: cy }, { x: cx + 60 * s, y: cy }];
    const activeIdx = Math.floor(interpolate(frame, [10, 70], [0, 3], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })) % 3;
    for (let i = 0; i < 3; i++) {
      drawPanel(ctx, positions[i].x - 28 * s, positions[i].y - 15 * s, 56 * s, 30 * s, i === activeIdx ? 0 : 0, a * (i === activeIdx ? 0.8 : 0.3));
      ctx.fillStyle = i === activeIdx ? C.blue : C.textDim;
      ctx.font = `600 ${7 * s}px system-ui`; ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText(steps[i], positions[i].x, positions[i].y);
      if (i < 2) drawEdge(ctx, positions[i].x + 28 * s, positions[i].y, positions[i + 1].x - 28 * s, positions[i + 1].y, 0, a * 0.2, s);
    }
    const ta = staggerRaw(frame, 0, 60, 15);
    ctx.globalAlpha = a * ta;
    ctx.fillStyle = C.text; ctx.font = `700 ${14 * s}px system-ui`; ctx.textAlign = "center";
    ctx.fillText("That's it.", cx, cy + 45 * s);
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
    const labels = ["RECEIVE", "SUM", "FIRE"];
    const angles = [-Math.PI / 2, Math.PI / 6, Math.PI * 5 / 6];
    const r = 50 * s;
    const activeIdx = Math.floor((frame / 25) % 3);
    for (let i = 0; i < 3; i++) {
      const nx = cx + Math.cos(angles[i]) * r;
      const ny = cy + Math.sin(angles[i]) * r;
      drawNode(ctx, nx, ny, (i === activeIdx ? 8 : 5) * s, 0, a);
      ctx.fillStyle = i === activeIdx ? C.blue : C.textDim;
      ctx.font = `600 ${7 * s}px system-ui`; ctx.textAlign = "center";
      ctx.fillText(labels[i], nx, ny + 15 * s);
      const ni = (i + 1) % 3;
      const nx2 = cx + Math.cos(angles[ni]) * r;
      const ny2 = cy + Math.sin(angles[ni]) * r;
      drawEdge(ctx, nx, ny, nx2, ny2, 0, a * 0.15, s);
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
    const cx = width / 2, cy = height / 2;
    const ta = stagger(frame, 0, 5, 18);
    ctx.fillStyle = C.text; ctx.font = `700 ${22 * s * ta}px system-ui`; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText("That's it.", cx, cy);
    const sub = staggerRaw(frame, 0, 35, 15);
    ctx.globalAlpha = a * sub;
    ctx.fillStyle = C.textDim; ctx.font = `${8 * s}px system-ui`;
    ctx.fillText("receive  \u2192  sum  \u2192  fire", cx, cy + 25 * s);
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
    const icons = [
      { x: cx - 60 * s, label: "RECEIVE" },
      { x: cx, label: "SUM" },
      { x: cx + 60 * s, label: "FIRE" },
    ];
    for (let i = 0; i < 3; i++) {
      const sa = stagger(frame, i, 8, 12);
      drawNode(ctx, icons[i].x, cy - 5 * s, 8 * s * sa, i === 2 ? 1 : 0, a);
      ctx.globalAlpha = a * sa;
      ctx.fillStyle = C.textDim; ctx.font = `600 ${7 * s}px system-ui`; ctx.textAlign = "center";
      ctx.fillText(icons[i].label, icons[i].x, cy + 18 * s);
      ctx.globalAlpha = a;
      if (i < 2) {
        ctx.strokeStyle = accent(0, a * 0.3); ctx.lineWidth = 1.5 * s; ctx.lineCap = "round";
        ctx.beginPath(); ctx.moveTo(icons[i].x + 12 * s, cy - 5 * s); ctx.lineTo(icons[i + 1].x - 12 * s, cy - 5 * s); ctx.stroke();
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
    const cycle = (frame % 60);
    const state = cycle < 20 ? 0 : cycle < 40 ? 1 : 2;
    const labels = ["receive", "sum", "fire"];
    const colors = [0, 0, 1];
    const sizes = [8, 10, 14];
    drawNodeGradient(ctx, cx, cy, sizes[state] * s, colors[state], a);
    ctx.fillStyle = state === 2 ? C.orange : C.blue; ctx.font = `600 ${9 * s}px system-ui`; ctx.textAlign = "center";
    ctx.fillText(labels[state], cx, cy + 25 * s);
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
    const steps = ["1. Receive signals", "2. Add them up", "3. Fire or don't"];
    for (let i = 0; i < 3; i++) {
      const sa = stagger(frame, i, 10, 12);
      const py = cy - 35 * s + i * 30 * s;
      drawPanel(ctx, cx - 65 * s, py - 10 * s, 130 * s, 22 * s, i === 2 ? 1 : 0, a * sa);
      ctx.globalAlpha = a * sa;
      ctx.fillStyle = C.text; ctx.font = `500 ${8 * s}px system-ui`; ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText(steps[i], cx, py);
      ctx.globalAlpha = a;
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
    const nodes = [{ x: cx - 60 * s, y: cy }, { x: cx, y: cy }, { x: cx + 60 * s, y: cy }];
    for (let i = 0; i < 3; i++) {
      drawNode(ctx, nodes[i].x, nodes[i].y, 6 * s, i === 2 ? 1 : 0, a);
      if (i < 2) drawEdge(ctx, nodes[i].x, nodes[i].y, nodes[i + 1].x, nodes[i + 1].y, 0, a * 0.2, s);
    }
    const pulsePos = interpolate(frame % 50, [0, 50], [0, 2], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const segIdx = Math.min(1, Math.floor(pulsePos));
    const segT = pulsePos - segIdx;
    if (segIdx < 2) drawSignalPulse(ctx, nodes[segIdx].x, nodes[segIdx].y, nodes[segIdx + 1].x, nodes[segIdx + 1].y, segT, 0, s);
    const labels = ["IN", "\u03A3", "OUT"];
    for (let i = 0; i < 3; i++) {
      ctx.fillStyle = C.textDim; ctx.font = `${7 * s}px system-ui`; ctx.textAlign = "center";
      ctx.fillText(labels[i], nodes[i].x, nodes[i].y + 15 * s);
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
    const appear = stagger(frame, 0, 5, 15);
    drawNode(ctx, cx, cy - 10 * s, 8 * s * appear, 0, a);
    const ta = staggerRaw(frame, 0, 30, 15);
    ctx.globalAlpha = a * ta;
    ctx.fillStyle = C.text; ctx.font = `700 ${16 * s}px system-ui`; ctx.textAlign = "center";
    ctx.fillText("That's it.", cx, cy + 20 * s);
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
    const items = ["Receive", "Add up", "Fire or don't"];
    for (let i = 0; i < 3; i++) {
      const sa = stagger(frame, i, 10, 12);
      const iy = cy - 25 * s + i * 25 * s;
      ctx.globalAlpha = a * sa;
      ctx.fillStyle = C.text; ctx.font = `500 ${9 * s}px system-ui`; ctx.textAlign = "left";
      ctx.fillText(items[i], cx - 30 * s, iy + 3 * s);
      drawCheck(ctx, cx - 45 * s, iy, 8 * s, 0, a * sa);
      ctx.globalAlpha = a;
    }
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={ref} width={width} height={height} /></div>;
};

export const VARIANTS_SHOT_039: VariantDef[] = [
  { id: "039-panel-cycle", label: "Panel boxes cycling active", component: V1 },
  { id: "039-circular-flow", label: "Circular flow diagram", component: V2 },
  { id: "039-thats-it-text", label: "Big That's it text", component: V3 },
  { id: "039-three-icons", label: "Three icons in row", component: V4 },
  { id: "039-state-cycle", label: "Single node cycling states", component: V5 },
  { id: "039-vertical-stack", label: "Vertical panel stack", component: V6 },
  { id: "039-chain-pulse", label: "3-node chain with pulse", component: V7 },
  { id: "039-minimal-dot", label: "Minimal dot that is it", component: V8 },
  { id: "039-checklist", label: "Checklist all checked", component: V9 },
];
