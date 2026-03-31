import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantDef, VariantProps } from "../types";
import {
  C, seeded, accent, easeOutBack, drawBg, fadeInOut, stagger, staggerRaw,
  drawNode, drawNodeGradient, drawNodeDormant, drawEdge, drawEdgeGlow, drawEdgeFaint,
  drawHeader, drawCounter, drawPerson, drawNeuronShape, drawFlyOutline, drawPanel,
  drawCheck, drawXMark, drawSignalPulse, drawBarChart, drawThresholdLine, lerp,
} from "./portal-kit";

// Shot 037 — "It adds them up."
// 9 variants — summation: drawBarChart +3,+2,-1=4 with threshold (DUR=120)

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
    const fill = interpolate(frame, [10, 80], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const vals = [3 * fill, 2 * fill, Math.max(0, fill - 0.3) * 1];
    const bx = width * 0.2, by = height * 0.2, bw = width * 0.5, bh = height * 0.55;
    drawBarChart(ctx, bx, by, bw, bh, vals, 5, s);
    drawThresholdLine(ctx, bx, by + bh * 0.4, bw, "threshold = 3", s);
    // Sum label
    const sum = Math.round(3 * fill + 2 * fill - 1 * Math.max(0, fill - 0.3));
    ctx.fillStyle = C.text; ctx.font = `700 ${14 * s}px system-ui`; ctx.textAlign = "center";
    ctx.fillText(`= ${sum}`, width * 0.8, height * 0.5);
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
    // +3, +2, -1 staggered text
    const items = [{ val: "+3", ci: 0 }, { val: "+2", ci: 0 }, { val: "-1", ci: 1 }];
    let yOff = cy - 30 * s;
    for (let i = 0; i < 3; i++) {
      const sa = stagger(frame, i, 10, 12);
      ctx.globalAlpha = a * sa;
      ctx.fillStyle = items[i].ci === 0 ? C.blue : C.orange;
      ctx.font = `700 ${16 * s}px system-ui`; ctx.textAlign = "center";
      ctx.fillText(items[i].val, cx - 30 * s, yOff);
      yOff += 22 * s;
    }
    // Equals line
    const eqA = staggerRaw(frame, 0, 50, 15);
    ctx.globalAlpha = a * eqA;
    ctx.strokeStyle = C.text; ctx.lineWidth = 2 * s;
    ctx.beginPath(); ctx.moveTo(cx - 55 * s, cy + 35 * s); ctx.lineTo(cx - 5 * s, cy + 35 * s); ctx.stroke();
    ctx.fillStyle = C.text; ctx.font = `700 ${20 * s}px system-ui`;
    ctx.fillText("= 4", cx + 20 * s, cy + 42 * s);
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
    // Container filling up
    const fillLevel = interpolate(frame, [15, 80], [0, 0.8], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const cw = 60 * s, ch = 100 * s;
    ctx.strokeStyle = accent(0, a * 0.4); ctx.lineWidth = 2 * s;
    ctx.strokeRect(cx - cw / 2, cy - ch / 2, cw, ch);
    const fillH = ch * fillLevel;
    ctx.fillStyle = accent(0, a * 0.3);
    ctx.fillRect(cx - cw / 2, cy + ch / 2 - fillH, cw, fillH);
    drawThresholdLine(ctx, cx - cw / 2 - 10 * s, cy - ch * 0.1, cw + 20 * s, "threshold", s);
    ctx.fillStyle = C.text; ctx.font = `700 ${12 * s}px system-ui`; ctx.textAlign = "center";
    ctx.fillText(Math.round(fillLevel * 5).toString(), cx, cy + ch / 2 - fillH - 8 * s);
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
    // Nodes merge into sum node
    const inputs = [{ x: cx - 60 * s, y: cy - 30 * s, v: 3 }, { x: cx - 60 * s, y: cy, v: 2 }, { x: cx - 60 * s, y: cy + 30 * s, v: -1 }];
    const merge = interpolate(frame, [20, 70], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    for (let i = 0; i < 3; i++) {
      const nx = lerp(inputs[i].x, cx + 20 * s, merge);
      const ny = lerp(inputs[i].y, cy, merge);
      drawNode(ctx, nx, ny, (5 - merge * 2) * s, inputs[i].v < 0 ? 1 : 0, a * (1 - merge * 0.5));
      if (merge < 0.5) {
        ctx.fillStyle = inputs[i].v < 0 ? C.orange : C.blue;
        ctx.font = `600 ${8 * s}px system-ui`; ctx.textAlign = "center";
        ctx.fillText(inputs[i].v > 0 ? `+${inputs[i].v}` : `${inputs[i].v}`, nx, ny - 10 * s);
      }
    }
    if (merge > 0.5) {
      const sumA = interpolate(merge, [0.5, 1], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      drawNodeGradient(ctx, cx + 20 * s, cy, 12 * s * sumA, 0, a);
      ctx.fillStyle = C.text; ctx.font = `700 ${14 * s}px system-ui`; ctx.textAlign = "center";
      ctx.globalAlpha = a * sumA;
      ctx.fillText("4", cx + 20 * s, cy + 25 * s);
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
    const fill = interpolate(frame, [10, 60], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawBarChart(ctx, width * 0.15, height * 0.25, width * 0.6, height * 0.5, [3 * fill, 2 * fill, 1 * fill], 5, s);
    const labels = ["+3", "+2", "-1"];
    const barW = (width * 0.6) / 3;
    ctx.font = `600 ${8 * s}px system-ui`; ctx.textAlign = "center";
    for (let i = 0; i < 3; i++) {
      ctx.fillStyle = i === 2 ? C.orange : C.blue;
      ctx.fillText(labels[i], width * 0.15 + i * barW + barW * 0.35, height * 0.82);
    }
    drawThresholdLine(ctx, width * 0.15, height * 0.25 + height * 0.5 * 0.4, width * 0.6, "T=3", s);
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
    // Counter animation 0 -> 4
    const count = interpolate(frame, [10, 80], [0, 4], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.fillStyle = C.text; ctx.font = `700 ${36 * s}px system-ui`; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText(Math.round(count).toString(), cx, cy);
    const sa = staggerRaw(frame, 0, 5, 15);
    ctx.globalAlpha = a * sa;
    ctx.fillStyle = C.textDim; ctx.font = `${10 * s}px system-ui`;
    ctx.fillText("3 + 2 - 1", cx, cy - 35 * s);
    ctx.globalAlpha = a;
    if (count >= 3) {
      const ringA = interpolate(count, [3, 3.5], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      ctx.strokeStyle = accent(0, a * ringA * 0.5); ctx.lineWidth = 2 * s;
      ctx.beginPath(); ctx.arc(cx, cy, 30 * s, 0, Math.PI * 2); ctx.stroke();
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
    drawHeader(ctx, width, height, s, frame, DUR, "Summation");
    const grow = stagger(frame, 0, 8, 15);
    ctx.fillStyle = accent(0, a * 0.6); ctx.font = `${40 * s * grow}px serif`; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText("\u03A3", cx, cy);
    const vals = ["+3", "+2", "-1"];
    for (let i = 0; i < 3; i++) {
      const ang = (frame * 0.02) + (i / 3) * Math.PI * 2;
      const ox = cx + Math.cos(ang) * 50 * s;
      const oy = cy + Math.sin(ang) * 50 * s;
      drawNode(ctx, ox, oy, 4 * s, i === 2 ? 1 : 0, a * 0.7);
      ctx.fillStyle = i === 2 ? C.orange : C.blue; ctx.font = `600 ${7 * s}px system-ui`; ctx.textAlign = "center";
      ctx.fillText(vals[i], ox, oy - 8 * s);
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
    // Stacking blocks
    const blocks = [{ h: 30, ci: 0, label: "+3" }, { h: 20, ci: 0, label: "+2" }, { h: -10, ci: 1, label: "-1" }];
    let stackY = cy + 40 * s;
    const bw = 50 * s;
    for (let i = 0; i < 3; i++) {
      const sa = stagger(frame, i, 12, 12);
      if (sa <= 0) continue;
      const bh = Math.abs(blocks[i].h) * s * sa;
      stackY -= bh;
      ctx.fillStyle = accent(blocks[i].ci, a * 0.4);
      ctx.fillRect(cx - bw / 2, stackY, bw, bh);
      ctx.strokeStyle = accent(blocks[i].ci, a * 0.6); ctx.lineWidth = 1;
      ctx.strokeRect(cx - bw / 2, stackY, bw, bh);
      ctx.fillStyle = blocks[i].ci === 0 ? C.blue : C.orange;
      ctx.font = `600 ${8 * s}px system-ui`; ctx.textAlign = "center";
      ctx.fillText(blocks[i].label, cx, stackY + bh / 2 + 3 * s);
    }
    drawThresholdLine(ctx, cx - bw / 2 - 15 * s, cy + 40 * s - 30 * s, bw + 30 * s, "T", s);
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
    const p = interpolate(frame, [5, 90], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    // Input nodes
    const inputs = [{ x: cx - 80 * s, y: cy - 20 * s, v: 3 }, { x: cx - 80 * s, y: cy + 20 * s, v: 2 }, { x: cx - 50 * s, y: cy + 20 * s, v: -1 }];
    for (let i = 0; i < 3; i++) {
      const sa = stagger(frame, i, 5, 10);
      drawNode(ctx, inputs[i].x, inputs[i].y, 4 * s * sa, inputs[i].v < 0 ? 1 : 0, a);
    }
    // Sigma box
    if (p > 0.3) {
      const boxA = interpolate(p, [0.3, 0.5], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      drawPanel(ctx, cx - 20 * s, cy - 20 * s, 40 * s, 40 * s, 0, a * boxA);
      ctx.globalAlpha = a * boxA;
      ctx.fillStyle = C.blue; ctx.font = `${18 * s}px serif`; ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText("\u03A3", cx, cy);
      ctx.globalAlpha = a;
    }
    // Output
    if (p > 0.6) {
      const outA = interpolate(p, [0.6, 0.9], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      drawEdge(ctx, cx + 20 * s, cy, cx + 60 * s, cy, 0, a * outA, s);
      drawNodeGradient(ctx, cx + 70 * s, cy, 8 * s * outA, 0, a);
      ctx.globalAlpha = a * outA;
      ctx.fillStyle = C.text; ctx.font = `700 ${12 * s}px system-ui`; ctx.textAlign = "center";
      ctx.fillText("4", cx + 70 * s, cy - 15 * s);
    }
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={ref} width={width} height={height} /></div>;
};

export const VARIANTS_SHOT_037: VariantDef[] = [
  { id: "037-bar-chart-fill", label: "Bar chart filling up", component: V1 },
  { id: "037-stacked-values", label: "Staggered +3 +2 -1 = 4", component: V2 },
  { id: "037-container-fill", label: "Container filling to threshold", component: V3 },
  { id: "037-merge-nodes", label: "Nodes merging into sum", component: V4 },
  { id: "037-full-bar-labels", label: "Bar chart with labels", component: V5 },
  { id: "037-counter-anim", label: "Counter 0 to 4", component: V6 },
  { id: "037-sigma-orbit", label: "Sigma with orbiting values", component: V7 },
  { id: "037-stacking-blocks", label: "Stacking blocks", component: V8 },
  { id: "037-pipeline", label: "Pipeline sigma output", component: V9 },
];
