import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantDef, VariantProps } from "../types";
import {
  C, seeded, accent, easeOutBack, drawBg, fadeInOut, stagger, staggerRaw,
  drawNode, drawNodeGradient, drawNodeDormant, drawEdge, drawEdgeGlow, drawEdgeFaint,
  drawHeader, drawCounter, drawPerson, drawNeuronShape, drawFlyOutline, drawPanel,
  drawCheck, drawXMark, drawSignalPulse, drawBarChart, drawThresholdLine, lerp,
} from "./portal-kit";

// Shot 030 — "A hundred and thirty-eight thousand neurons. Fifteen million connections."
// 120 frames. 9 variants: big number reveal.

const DUR = 120;

// V1: Two massive numbers appearing side by side with counter roll
const V1: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height, s);
    const fo = fadeInOut(frame, DUR);
    ctx.globalAlpha = fo;
    const cx = width / 2, cy = height / 2;
    const n1 = Math.floor(interpolate(frame, [10, 60], [0, 138639], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
    const n2 = Math.floor(interpolate(frame, [40, 95], [0, 15091983], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
    // Neuron count
    ctx.fillStyle = C.blue;
    ctx.font = `700 ${28 * s}px monospace`;
    ctx.textAlign = "center";
    ctx.fillText(n1.toLocaleString(), cx, cy - 15 * s);
    ctx.fillStyle = C.textDim;
    ctx.font = `${9 * s}px system-ui`;
    ctx.fillText("neurons", cx, cy + 2 * s);
    // Connection count
    ctx.fillStyle = C.orange;
    ctx.font = `700 ${22 * s}px monospace`;
    ctx.fillText(n2.toLocaleString(), cx, cy + 30 * s);
    ctx.fillStyle = C.textDim;
    ctx.font = `${9 * s}px system-ui`;
    ctx.fillText("connections", cx, cy + 44 * s);
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

// V2: Dense node field representing scale — tiny nodes filling the view
const V2: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const nodes = useMemo(() => {
    const rng = seeded(3002);
    return Array.from({ length: 500 }, (_, i) => ({
      x: rng() * 300 - 150, y: rng() * 250 - 125, i,
    }));
  }, []);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height, s);
    const fo = fadeInOut(frame, DUR);
    ctx.globalAlpha = fo;
    drawHeader(ctx, width, height, s, frame, DUR, "Scale", "138,639 neurons");
    const cx = width / 2, cy = height / 2;
    const shown = Math.floor(interpolate(frame, [5, 80], [0, 500], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
    for (let i = 0; i < shown; i++) {
      drawNode(ctx, cx + nodes[i].x * s, cy + nodes[i].y * s, 1 * s, nodes[i].i % 2, fo * 0.6);
    }
    drawCounter(ctx, width, height, s, "138,639", "neurons");
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

// V3: Two bar towers growing — one for neurons, one for connections
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
    drawHeader(ctx, width, height, s, frame, DUR, "By the Numbers", "neurons & connections");
    const prog = interpolate(frame, [15, 80], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const barW = 40 * s, maxH = height * 0.5;
    // Neurons bar (left)
    const nH = maxH * 0.3 * prog; // shorter bar
    const nx = width * 0.35;
    ctx.fillStyle = accent(0, fo * 0.7);
    ctx.fillRect(nx - barW / 2, height * 0.75 - nH, barW, nH);
    ctx.fillStyle = "rgba(255,255,255,0.15)";
    ctx.fillRect(nx - barW / 2, height * 0.75 - nH, barW * 0.3, nH);
    // Connections bar (right) — much taller
    const cH = maxH * prog;
    const cx = width * 0.65;
    ctx.fillStyle = accent(1, fo * 0.7);
    ctx.fillRect(cx - barW / 2, height * 0.75 - cH, barW, cH);
    ctx.fillStyle = "rgba(255,255,255,0.15)";
    ctx.fillRect(cx - barW / 2, height * 0.75 - cH, barW * 0.3, cH);
    // Labels
    ctx.fillStyle = C.text; ctx.font = `600 ${10 * s}px monospace`; ctx.textAlign = "center";
    ctx.fillText("138K", nx, height * 0.8);
    ctx.fillText("15M", cx, height * 0.8);
    ctx.fillStyle = C.textDim; ctx.font = `${8 * s}px system-ui`;
    ctx.fillText("neurons", nx, height * 0.85);
    ctx.fillText("connections", cx, height * 0.85);
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

// V4: Expanding circles — each ring represents an order of magnitude
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
    drawHeader(ctx, width, height, s, frame, DUR, "Orders of Magnitude", "scale revealed");
    const cx = width / 2, cy = height / 2;
    const magnitudes = ["1", "10", "100", "1K", "10K", "138K"];
    for (let i = 0; i < magnitudes.length; i++) {
      const t = stagger(frame, i * 8, 1, 12);
      if (t <= 0) continue;
      const r = (15 + i * 18) * s * t;
      ctx.strokeStyle = accent(i, fo * t * 0.4);
      ctx.lineWidth = 1.5 * s;
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = accent(i, fo * t * 0.7);
      ctx.font = `${7 * s}px monospace`;
      ctx.textAlign = "left";
      ctx.fillText(magnitudes[i], cx + r + 3 * s, cy + 3 * s);
    }
    drawNodeGradient(ctx, cx, cy, 5 * s, 0, fo);
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

// V5: Number cascade — digits falling and assembling into the two numbers
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
    const cx = width / 2;
    // First number assembles
    const digits1 = "138,639".split("");
    const y1 = height * 0.38;
    const startX1 = cx - (digits1.length * 14 * s) / 2;
    for (let i = 0; i < digits1.length; i++) {
      const t = stagger(frame, i * 3, 1, 10);
      if (t <= 0) continue;
      const dropY = lerp(-20 * s, 0, Math.min(1, t));
      ctx.fillStyle = C.blue;
      ctx.font = `700 ${24 * s}px monospace`;
      ctx.textAlign = "left";
      ctx.fillText(digits1[i], startX1 + i * 14 * s, y1 + dropY);
    }
    ctx.fillStyle = C.textDim; ctx.font = `${9 * s}px system-ui`; ctx.textAlign = "center";
    if (frame > 35) ctx.fillText("neurons", cx, y1 + 16 * s);
    // Second number
    const digits2 = "15,091,983".split("");
    const y2 = height * 0.62;
    const startX2 = cx - (digits2.length * 11 * s) / 2;
    for (let i = 0; i < digits2.length; i++) {
      const t = stagger(frame - 40, i * 2, 1, 10);
      if (t <= 0) continue;
      const dropY = lerp(-20 * s, 0, Math.min(1, t));
      ctx.fillStyle = C.orange;
      ctx.font = `700 ${18 * s}px monospace`;
      ctx.textAlign = "left";
      ctx.fillText(digits2[i], startX2 + i * 11 * s, y2 + dropY);
    }
    if (frame > 70) {
      ctx.fillStyle = C.textDim; ctx.font = `${9 * s}px system-ui`; ctx.textAlign = "center";
      ctx.fillText("connections", cx, y2 + 14 * s);
    }
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

// V6: Split screen: left shows 138K nodes, right shows 15M edges as lines
const V6: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height, s);
    const fo = fadeInOut(frame, DUR);
    ctx.globalAlpha = fo;
    drawHeader(ctx, width, height, s, frame, DUR, "Neurons & Connections", "two scales");
    // Divider
    ctx.strokeStyle = `rgba(200,200,215,${fo * 0.2})`;
    ctx.lineWidth = 1 * s;
    ctx.beginPath(); ctx.moveTo(width / 2, height * 0.18); ctx.lineTo(width / 2, height * 0.88); ctx.stroke();
    const rng = seeded(3006);
    const prog = interpolate(frame, [8, 80], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    // Left: nodes
    const nodeCount = Math.floor(prog * 80);
    for (let i = 0; i < nodeCount; i++) {
      drawNode(ctx, width * 0.05 + rng() * width * 0.4, height * 0.22 + rng() * height * 0.6, 1.5 * s, 0, fo * 0.6);
    }
    // Right: edges
    const edgeCount = Math.floor(prog * 60);
    for (let i = 0; i < edgeCount; i++) {
      const x1 = width * 0.55 + rng() * width * 0.4, y1 = height * 0.22 + rng() * height * 0.6;
      const x2 = width * 0.55 + rng() * width * 0.4, y2 = height * 0.22 + rng() * height * 0.6;
      drawEdgeFaint(ctx, x1, y1, x2, y2, s);
    }
    ctx.fillStyle = C.text; ctx.font = `600 ${11 * s}px monospace`; ctx.textAlign = "center";
    ctx.fillText("138,639", width * 0.25, height * 0.88);
    ctx.fillText("15,091,983", width * 0.75, height * 0.88);
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

// V7: Stacked counters — neuron count above connection count, ticking fast
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
    const cx = width / 2;
    // Panel backgrounds
    drawPanel(ctx, width * 0.15, height * 0.22, width * 0.7, height * 0.22, 0, fo * 0.4);
    drawPanel(ctx, width * 0.15, height * 0.52, width * 0.7, height * 0.22, 1, fo * 0.4);
    // Neuron counter
    const n1 = Math.floor(interpolate(frame, [8, 55], [0, 138639], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
    ctx.fillStyle = C.blue; ctx.font = `700 ${26 * s}px monospace`; ctx.textAlign = "center";
    ctx.fillText(n1.toLocaleString(), cx, height * 0.36);
    ctx.fillStyle = C.textDim; ctx.font = `${9 * s}px system-ui`;
    ctx.fillText("neurons", cx, height * 0.42);
    // Connection counter
    const n2 = Math.floor(interpolate(frame, [35, 90], [0, 15091983], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
    ctx.fillStyle = C.orange; ctx.font = `700 ${26 * s}px monospace`; ctx.textAlign = "center";
    ctx.fillText(n2.toLocaleString(), cx, height * 0.66);
    ctx.fillStyle = C.textDim; ctx.font = `${9 * s}px system-ui`;
    ctx.fillText("connections", cx, height * 0.72);
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

// V8: Explosion of tiny dots from center — sheer volume
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
    drawHeader(ctx, width, height, s, frame, DUR, "Sheer Scale", "every single one");
    const cx = width / 2, cy = height / 2;
    const rng = seeded(3008);
    const expand = interpolate(frame, [5, 70], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    for (let i = 0; i < 400; i++) {
      const a = rng() * Math.PI * 2;
      const maxR = 20 + rng() * 130;
      const r = maxR * expand * s;
      drawNode(ctx, cx + Math.cos(a) * r, cy + Math.sin(a) * r, 0.8 * s, i % 2, fo * 0.5);
    }
    // Numbers overlaid
    if (expand > 0.5) {
      ctx.fillStyle = C.text; ctx.font = `700 ${16 * s}px monospace`; ctx.textAlign = "center";
      ctx.fillText("138,639", cx, cy - 5 * s);
      ctx.fillStyle = C.textDim; ctx.font = `${10 * s}px monospace`;
      ctx.fillText("15,091,983", cx, cy + 12 * s);
    }
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

// V9: Comparison icons — small circle (neuron) vs massive web (connections)
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
    drawHeader(ctx, width, height, s, frame, DUR, "Scale Comparison", "neurons vs connections");
    const ly = height / 2;
    // Single neuron (left)
    const t1 = stagger(frame, 0, 1, 15);
    drawNodeGradient(ctx, width * 0.25, ly, 15 * s * t1, 0, fo * t1);
    ctx.fillStyle = C.text; ctx.font = `${9 * s}px monospace`; ctx.textAlign = "center";
    if (t1 > 0.5) ctx.fillText("138,639", width * 0.25, ly + 25 * s);
    // Massive web (right)
    const t2 = stagger(frame, 20, 1, 15);
    if (t2 > 0) {
      const rcx = width * 0.7, rcy = ly;
      const rng = seeded(3009);
      for (let i = 0; i < 40; i++) {
        const a = rng() * Math.PI * 2, r = rng() * 50 * s * t2;
        const nx = rcx + Math.cos(a) * r, ny = rcy + Math.sin(a) * r;
        drawNode(ctx, nx, ny, 1.5 * s, 1, fo * t2 * 0.5);
        if (i > 0) {
          const pa = rng() * Math.PI * 2, pr = rng() * 50 * s * t2;
          drawEdgeFaint(ctx, nx, ny, rcx + Math.cos(pa) * pr, rcy + Math.sin(pa) * pr, s);
        }
      }
      ctx.fillStyle = C.text; ctx.font = `${9 * s}px monospace`; ctx.textAlign = "center";
      if (t2 > 0.5) ctx.fillText("15,091,983", rcx, ly + 60 * s);
    }
    // "vs" label
    if (frame > 30) {
      ctx.fillStyle = C.textDim; ctx.font = `${8 * s}px system-ui`; ctx.textAlign = "center";
      ctx.fillText("vs", width * 0.47, ly + 3 * s);
    }
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

export const VARIANTS_SHOT_030: VariantDef[] = [
  { id: "030-dual-counter", label: "Two numbers rolling up", component: V1 },
  { id: "030-dense-field", label: "Dense node field", component: V2 },
  { id: "030-bar-towers", label: "Two bar towers", component: V3 },
  { id: "030-magnitude", label: "Orders of magnitude rings", component: V4 },
  { id: "030-digit-fall", label: "Digits falling into place", component: V5 },
  { id: "030-split-scale", label: "Split screen nodes vs edges", component: V6 },
  { id: "030-panel-counters", label: "Stacked panel counters", component: V7 },
  { id: "030-explosion", label: "Dot explosion from center", component: V8 },
  { id: "030-comparison", label: "Scale comparison icons", component: V9 },
];
