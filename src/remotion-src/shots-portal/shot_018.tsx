import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantDef, VariantProps } from "../types";
import {
  C, seeded, accent, easeOutBack, drawBg, fadeInOut, stagger, staggerRaw,
  drawNode, drawNodeGradient, drawNodeDormant, drawEdge, drawEdgeGlow, drawEdgeFaint,
  drawHeader, drawCounter, drawPerson, drawNeuronShape, drawFlyOutline, drawPanel,
  drawCheck, drawXMark, drawSignalPulse, drawBarChart, drawThresholdLine, lerp,
} from "./portal-kit";

// Shot 018 — "Seven thousand sections. Twenty-one million photographs."
// 9 variants — big number reveal (DUR=90)

const V1: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const DUR = 90;
    drawBg(ctx, width, height, s);
    const fo = fadeInOut(frame, DUR);
    ctx.globalAlpha = fo;
    const cx = width / 2, cy = height / 2;
    // Counter: 7,050 sections
    const c1 = Math.floor(interpolate(frame, [5, 35], [0, 7050], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
    const a1 = interpolate(frame, [3, 15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = fo * a1;
    ctx.fillStyle = C.blue;
    ctx.font = `700 ${20 * s}px monospace`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(c1.toLocaleString(), cx, cy - 15 * s);
    ctx.fillStyle = C.textDim;
    ctx.font = `500 ${8 * s}px system-ui`;
    ctx.fillText("sections", cx, cy - 1 * s);
    // Counter: 21,000,000 photos
    const c2 = Math.floor(interpolate(frame, [35, 65], [0, 21000000], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
    const a2 = interpolate(frame, [33, 45], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = fo * a2;
    ctx.fillStyle = C.orange;
    ctx.font = `700 ${20 * s}px monospace`;
    ctx.fillText(c2.toLocaleString(), cx, cy + 20 * s);
    ctx.fillStyle = C.textDim;
    ctx.font = `500 ${8 * s}px system-ui`;
    ctx.fillText("photographs", cx, cy + 34 * s);
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
    const DUR = 90;
    drawBg(ctx, width, height, s);
    const fo = fadeInOut(frame, DUR);
    ctx.globalAlpha = fo;
    const cx = width / 2, cy = height / 2;
    // Grid filling with tiny rectangles to represent images
    const fill = interpolate(frame, [5, 70], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const cols = 20, rows = 14;
    const cellW = (width * 0.8) / cols, cellH = (height * 0.6) / rows;
    const ox = width * 0.1, oy = height * 0.15;
    const total = cols * rows;
    const filled = Math.floor(fill * total);
    for (let i = 0; i < filled; i++) {
      const col = i % cols, row = Math.floor(i / cols);
      const x = ox + col * cellW, y = oy + row * cellH;
      ctx.fillStyle = accent(i % 3 === 0 ? 1 : 0, fo * 0.15);
      ctx.fillRect(x + 0.5, y + 0.5, cellW - 1, cellH - 1);
    }
    // Counter overlay
    ctx.fillStyle = C.text;
    ctx.font = `700 ${14 * s}px monospace`;
    ctx.textAlign = "center";
    ctx.fillText(`${Math.floor(fill * 21000000).toLocaleString()}`, cx, height * 0.88);
    ctx.fillStyle = C.textDim;
    ctx.font = `500 ${7 * s}px system-ui`;
    ctx.fillText("images", cx, height * 0.93);
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
    const DUR = 90;
    drawBg(ctx, width, height, s);
    const fo = fadeInOut(frame, DUR);
    ctx.globalAlpha = fo;
    const cx = width / 2, cy = height / 2;
    // Two stacked panels with counters
    const s1 = stagger(frame, 0, 1, 15);
    drawPanel(ctx, cx - 55 * s, cy - 30 * s, 110 * s, 25 * s, 0, fo * s1);
    ctx.globalAlpha = fo * s1;
    ctx.fillStyle = C.blue;
    ctx.font = `700 ${12 * s}px monospace`;
    ctx.textAlign = "center";
    ctx.fillText("7,050", cx - 15 * s, cy - 14 * s);
    ctx.fillStyle = C.textDim;
    ctx.font = `500 ${8 * s}px system-ui`;
    ctx.fillText("sections", cx + 30 * s, cy - 14 * s);
    const s2 = stagger(frame, 10, 1, 15);
    ctx.globalAlpha = fo;
    drawPanel(ctx, cx - 55 * s, cy + 5 * s, 110 * s, 25 * s, 1, fo * s2);
    ctx.globalAlpha = fo * s2;
    ctx.fillStyle = C.orange;
    ctx.font = `700 ${12 * s}px monospace`;
    ctx.fillText("21,000,000", cx - 5 * s, cy + 21 * s);
    ctx.fillStyle = C.textDim;
    ctx.font = `500 ${8 * s}px system-ui`;
    ctx.fillText("photos", cx + 45 * s, cy + 21 * s);
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
    const DUR = 90;
    drawBg(ctx, width, height, s);
    const fo = fadeInOut(frame, DUR);
    ctx.globalAlpha = fo;
    const cx = width / 2, cy = height / 2;
    // Bar chart — 2 bars for 7K and 21M (log scale conceptually)
    const grow = interpolate(frame, [10, 50], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    // Bar 1: sections
    const b1h = 30 * s * grow;
    ctx.fillStyle = accent(0, fo * 0.6);
    ctx.fillRect(cx - 30 * s, cy + 20 * s - b1h, 22 * s, b1h);
    ctx.fillStyle = C.textDim;
    ctx.font = `500 ${7 * s}px system-ui`;
    ctx.textAlign = "center";
    ctx.fillText("7K", cx - 19 * s, cy + 32 * s);
    // Bar 2: photos (much taller)
    const b2h = 60 * s * grow;
    ctx.fillStyle = accent(1, fo * 0.6);
    ctx.fillRect(cx + 8 * s, cy + 20 * s - b2h, 22 * s, b2h);
    ctx.fillText("21M", cx + 19 * s, cy + 32 * s);
    // Axis
    ctx.strokeStyle = `rgba(180,180,200,${fo * 0.3})`;
    ctx.lineWidth = 1 * s;
    ctx.beginPath();
    ctx.moveTo(cx - 40 * s, cy + 20 * s);
    ctx.lineTo(cx + 40 * s, cy + 20 * s);
    ctx.stroke();
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
    const DUR = 90;
    drawBg(ctx, width, height, s);
    const fo = fadeInOut(frame, DUR);
    ctx.globalAlpha = fo;
    const cx = width / 2, cy = height / 2;
    // Stack of images growing taller
    const stackH = interpolate(frame, [10, 60], [0, 60 * s], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const nLayers = Math.floor(stackH / (3 * s));
    for (let i = 0; i < nLayers; i++) {
      const ly = cy + 30 * s - i * 3 * s;
      const depth = 1 - i * 0.01;
      ctx.fillStyle = accent(i % 2, fo * 0.08 * depth);
      ctx.fillRect(cx - 25 * s * depth - i * 0.3 * s, ly, 50 * s * depth, 2 * s);
    }
    // "21 million" text appears on top
    const la = interpolate(frame, [55, 72], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = fo * la;
    ctx.fillStyle = C.text;
    ctx.font = `700 ${16 * s}px system-ui`;
    ctx.textAlign = "center";
    ctx.fillText("21,000,000", cx, cy - 35 * s);
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
    const DUR = 90;
    drawBg(ctx, width, height, s);
    const fo = fadeInOut(frame, DUR);
    ctx.globalAlpha = fo;
    const cx = width / 2, cy = height / 2;
    // Dots representing scale — few dots then many
    // Phase 1: 7 dots for 7K sections
    const p1 = interpolate(frame, [5, 25], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    for (let i = 0; i < 7; i++) {
      const dx = cx - 30 * s + i * 10 * s;
      const sa = stagger(frame, i, 2, 8);
      drawNode(ctx, dx, cy - 15 * s, 4 * s * sa, 0, fo * 0.7);
    }
    ctx.globalAlpha = fo * p1;
    ctx.fillStyle = C.textDim;
    ctx.font = `500 ${7 * s}px system-ui`;
    ctx.textAlign = "center";
    ctx.fillText("7,050 sections", cx, cy - 3 * s);
    // Phase 2: flood of tiny dots for 21M
    const p2 = interpolate(frame, [30, 60], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = fo;
    const rng = seeded(1806);
    const dotCount = Math.floor(p2 * 100);
    for (let i = 0; i < dotCount; i++) {
      const dx = cx + (rng() - 0.5) * width * 0.7;
      const dy = cy + 15 * s + rng() * 30 * s;
      ctx.fillStyle = accent(i % 2, fo * 0.2);
      ctx.beginPath();
      ctx.arc(dx, dy, 1.2 * s, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = fo * p2;
    ctx.fillStyle = C.text;
    ctx.font = `600 ${9 * s}px system-ui`;
    ctx.fillText("21,000,000 photographs", cx, cy + 52 * s);
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
    const DUR = 90;
    drawBg(ctx, width, height, s);
    const fo = fadeInOut(frame, DUR);
    ctx.globalAlpha = fo;
    const cx = width / 2, cy = height / 2;
    // Big impact number — "7,050" then "21M" zoom in
    const phase = frame < 40 ? 0 : 1;
    const t = phase === 0
      ? interpolate(frame, [5, 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
      : interpolate(frame, [40, 65], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const bounce = easeOutBack(Math.min(1, t));
    ctx.fillStyle = phase === 0 ? C.blue : C.orange;
    ctx.font = `700 ${(phase === 0 ? 28 : 24) * s * bounce}px system-ui`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(phase === 0 ? "7,050" : "21,000,000", cx, cy - 5 * s);
    ctx.fillStyle = C.textDim;
    ctx.font = `500 ${9 * s}px system-ui`;
    ctx.fillText(phase === 0 ? "sections" : "photographs", cx, cy + 18 * s);
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
    const DUR = 90;
    drawBg(ctx, width, height, s);
    const fo = fadeInOut(frame, DUR);
    ctx.globalAlpha = fo;
    const cx = width / 2, cy = height / 2;
    // Arrow from "7,050 sections" pointing to "21M photos" with multiplication
    const s1 = stagger(frame, 0, 1, 12);
    drawNode(ctx, cx - 45 * s, cy, 8 * s * s1, 0, fo);
    ctx.globalAlpha = fo * s1;
    ctx.fillStyle = C.textDim;
    ctx.font = `500 ${7 * s}px system-ui`;
    ctx.textAlign = "center";
    ctx.fillText("7,050", cx - 45 * s, cy + 16 * s);
    // Multiply sign
    const s2 = stagger(frame, 8, 1, 10);
    ctx.globalAlpha = fo * s2;
    ctx.fillStyle = C.text;
    ctx.font = `600 ${12 * s}px system-ui`;
    ctx.fillText("\u00d7", cx, cy + 3 * s);
    ctx.fillStyle = C.textDim;
    ctx.font = `500 ${7 * s}px system-ui`;
    ctx.fillText("~3000", cx, cy + 16 * s);
    // Result
    const s3 = stagger(frame, 16, 1, 12);
    drawNode(ctx, cx + 45 * s, cy, 10 * s * s3, 1, fo);
    ctx.globalAlpha = fo * s3;
    ctx.fillStyle = C.textDim;
    ctx.font = `500 ${7 * s}px system-ui`;
    ctx.fillText("21M", cx + 45 * s, cy + 16 * s);
    ctx.globalAlpha = fo;
    // Arrows
    drawEdge(ctx, cx - 32 * s, cy, cx - 12 * s, cy, 0, fo * s2 * 0.4, s);
    drawEdge(ctx, cx + 12 * s, cy, cx + 32 * s, cy, 1, fo * s3 * 0.4, s);
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
    const DUR = 90;
    drawBg(ctx, width, height, s);
    const fo = fadeInOut(frame, DUR);
    ctx.globalAlpha = fo;
    const cx = width / 2, cy = height / 2;
    // Radial burst of rectangles emanating from center
    const burst = interpolate(frame, [10, 60], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const rng = seeded(1809);
    const count = Math.floor(burst * 40);
    for (let i = 0; i < count; i++) {
      const angle = rng() * Math.PI * 2;
      const dist = (10 + rng() * 50) * s * burst;
      const rx = cx + Math.cos(angle) * dist;
      const ry = cy + Math.sin(angle) * dist;
      ctx.fillStyle = accent(i % 2, fo * 0.12);
      ctx.fillRect(rx - 3 * s, ry - 2 * s, 6 * s, 4 * s);
    }
    // Center counter
    ctx.fillStyle = C.text;
    ctx.font = `700 ${16 * s}px monospace`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("21M", cx, cy);
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

export const VARIANTS_SHOT_018: VariantDef[] = [
  { id: "018-dual-counter", label: "Dual counter 7K and 21M", component: V1 },
  { id: "018-grid-fill", label: "Grid filling with images", component: V2 },
  { id: "018-stacked-panels", label: "Stacked info panels", component: V3 },
  { id: "018-bar-chart", label: "Bar chart comparison", component: V4 },
  { id: "018-image-stack", label: "Growing image stack", component: V5 },
  { id: "018-dot-flood", label: "Few dots then dot flood", component: V6 },
  { id: "018-impact-number", label: "Impact number zoom", component: V7 },
  { id: "018-multiply-flow", label: "Multiplication arrow flow", component: V8 },
  { id: "018-radial-burst", label: "Radial burst of rectangles", component: V9 },
];
