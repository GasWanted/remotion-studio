import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantDef, VariantProps } from "../types";
import {
  C, seeded, accent, easeOutBack, drawBg, fadeInOut, stagger, staggerRaw,
  drawNode, drawNodeGradient, drawNodeDormant, drawEdge, drawEdgeGlow, drawEdgeFaint,
  drawHeader, drawCounter, drawPerson, drawNeuronShape, drawFlyOutline, drawPanel,
  drawCheck, drawXMark, drawSignalPulse, drawBarChart, drawThresholdLine, lerp,
} from "./portal-kit";

// Shot 031 — "Every single one mapped. They called it FlyWire."
// 90 frames. 9 variants: FlyWire name reveal.

const DUR = 90;

// V1: Text "FlyWire" appearing letter by letter with glow, network behind
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
    // Background network
    const rng = seeded(3101);
    for (let i = 0; i < 40; i++) {
      const a = rng() * Math.PI * 2, r = rng() * 120 * s;
      drawNodeDormant(ctx, cx + Math.cos(a) * r, cy + Math.sin(a) * r, 2 * s, fo * 0.3);
    }
    // "FlyWire" text
    const letters = "FlyWire".split("");
    const totalW = letters.length * 22 * s;
    const startX = cx - totalW / 2;
    for (let i = 0; i < letters.length; i++) {
      const t = stagger(frame, i * 4, 1, 10);
      if (t <= 0) continue;
      ctx.fillStyle = i < 3 ? C.blue : C.orange;
      ctx.font = `700 ${32 * s}px system-ui, sans-serif`;
      ctx.textAlign = "left";
      ctx.globalAlpha = fo * t;
      ctx.fillText(letters[i], startX + i * 22 * s, cy + 10 * s);
    }
    ctx.globalAlpha = fo;
    // Underline glow
    const lineT = interpolate(frame, [40, 60], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (lineT > 0) {
      ctx.strokeStyle = accent(0, fo * lineT * 0.5);
      ctx.lineWidth = 2 * s;
      ctx.beginPath(); ctx.moveTo(startX, cy + 16 * s); ctx.lineTo(startX + totalW * lineT, cy + 16 * s); ctx.stroke();
    }
    // Checkmark
    if (frame > 55) drawCheck(ctx, cx, cy + 35 * s, 8 * s, 0, fo * 0.7);
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

// V2: Network forming the word "FlyWire" with connected nodes
const V2: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height, s);
    const fo = fadeInOut(frame, DUR);
    ctx.globalAlpha = fo;
    drawHeader(ctx, width, height, s, frame, DUR, "Named", "the complete map");
    const cx = width / 2, cy = height / 2;
    // Big centered text
    const appear = interpolate(frame, [10, 45], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.fillStyle = C.blue;
    ctx.font = `700 ${36 * s}px system-ui`;
    ctx.textAlign = "center";
    ctx.globalAlpha = fo * appear;
    ctx.fillText("Fly", cx - 30 * s, cy + 8 * s);
    ctx.fillStyle = C.orange;
    ctx.fillText("Wire", cx + 35 * s, cy + 8 * s);
    ctx.globalAlpha = fo;
    // Radiating nodes from text
    if (appear > 0.5) {
      const rng = seeded(3102);
      for (let i = 0; i < 30; i++) {
        const t = stagger(frame - 30, i, 1, 8);
        if (t <= 0) continue;
        const a = rng() * Math.PI * 2;
        const r = (50 + rng() * 70) * s * t;
        drawNode(ctx, cx + Math.cos(a) * r, cy + Math.sin(a) * r, 1.5 * s * t, i % 2, fo * t * 0.5);
      }
    }
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

// V3: Complete map glow-up then title fading in over it
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
    const cx = width / 2, cy = height / 2;
    // Dense network background
    const rng = seeded(3103);
    for (let i = 0; i < 80; i++) {
      const x = cx + (rng() - 0.5) * 280 * s, y = cy + (rng() - 0.5) * 220 * s;
      drawNode(ctx, x, y, 1 * s, i % 2, fo * 0.35);
      if (i > 0 && i % 2 === 0) {
        const px = cx + (rng() - 0.5) * 280 * s;
        drawEdgeFaint(ctx, x, y, px, cy + (rng() - 0.5) * 220 * s, s);
      }
    }
    // Title over network
    const titleT = interpolate(frame, [25, 55], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (titleT > 0) {
      // Backing panel
      const pw = 140 * s, ph = 40 * s;
      ctx.fillStyle = `rgba(246,246,248,${titleT * 0.85})`;
      ctx.fillRect(cx - pw / 2, cy - ph / 2, pw, ph);
      ctx.fillStyle = C.blue; ctx.font = `700 ${28 * s}px system-ui`; ctx.textAlign = "center";
      ctx.globalAlpha = fo * titleT;
      ctx.fillText("FlyWire", cx, cy + 9 * s);
      ctx.globalAlpha = fo;
    }
    if (frame > 60) drawCheck(ctx, cx + 60 * s, cy, 7 * s, 0, fo * 0.7);
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

// V4: Fly outline with "FlyWire" text inside the head
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
    const cx = width / 2, cy = height / 2;
    const appear = interpolate(frame, [5, 35], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFlyOutline(ctx, cx, cy, 100 * s * appear, fo * appear);
    // Name inside
    const textT = interpolate(frame, [35, 60], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (textT > 0) {
      ctx.fillStyle = C.blue; ctx.font = `700 ${14 * s}px system-ui`; ctx.textAlign = "center";
      ctx.globalAlpha = fo * textT;
      ctx.fillText("FlyWire", cx, cy - 28 * s);
      ctx.globalAlpha = fo;
    }
    if (frame > 55) drawCheck(ctx, cx, cy + 55 * s, 8 * s, 0, fo);
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

// V5: Badge/emblem design with text centered
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
    const cx = width / 2, cy = height / 2;
    const grow = interpolate(frame, [8, 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    // Outer ring
    ctx.strokeStyle = accent(0, fo * grow * 0.5);
    ctx.lineWidth = 3 * s;
    ctx.beginPath(); ctx.arc(cx, cy, 70 * s * grow, 0, Math.PI * 2); ctx.stroke();
    // Inner ring
    ctx.strokeStyle = accent(1, fo * grow * 0.3);
    ctx.lineWidth = 1.5 * s;
    ctx.beginPath(); ctx.arc(cx, cy, 55 * s * grow, 0, Math.PI * 2); ctx.stroke();
    // Stars/nodes around ring
    for (let i = 0; i < 12; i++) {
      const t = stagger(frame, i * 3, 1, 6);
      if (t <= 0) continue;
      const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
      drawNode(ctx, cx + Math.cos(a) * 70 * s, cy + Math.sin(a) * 70 * s, 2.5 * s * t, i % 2, fo * t);
    }
    // Central text
    if (grow > 0.6) {
      ctx.fillStyle = C.text; ctx.font = `700 ${22 * s}px system-ui`; ctx.textAlign = "center";
      ctx.fillText("FlyWire", cx, cy + 7 * s);
      ctx.fillStyle = C.textDim; ctx.font = `${7 * s}px system-ui`;
      ctx.fillText("EVERY NEURON MAPPED", cx, cy + 20 * s);
    }
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

// V6: Typewriter effect: "FlyWire" typed out with blinking cursor
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
    const cx = width / 2, cy = height / 2;
    const text = "FlyWire";
    const charIdx = Math.min(text.length, Math.floor(interpolate(frame, [15, 55], [0, text.length + 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })));
    const shown = text.substring(0, charIdx);
    ctx.fillStyle = C.text; ctx.font = `700 ${36 * s}px monospace`; ctx.textAlign = "center";
    ctx.fillText(shown, cx, cy + 12 * s);
    // Cursor
    if (charIdx < text.length && Math.floor(frame / 8) % 2 === 0) {
      const metrics = ctx.measureText(shown);
      const cursorX = cx + metrics.width / 2 + 3 * s;
      ctx.fillStyle = C.blue;
      ctx.fillRect(cursorX, cy - 18 * s, 2 * s, 32 * s);
    }
    // Subtitle after typing
    if (charIdx >= text.length) {
      ctx.fillStyle = C.textDim; ctx.font = `${9 * s}px system-ui`; ctx.textAlign = "center";
      ctx.fillText("every single one mapped", cx, cy + 28 * s);
    }
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

// V7: Checkmarks cascading down then "FlyWire" at bottom
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
    drawHeader(ctx, width, height, s, frame, DUR, "All Mapped", "every one");
    const cx = width / 2;
    // Cascade of checkmarks
    for (let i = 0; i < 8; i++) {
      const t = stagger(frame, i * 4, 1, 8);
      if (t <= 0) continue;
      const iy = height * 0.2 + i * height * 0.065;
      drawCheck(ctx, cx - 30 * s, iy, 5 * s, 0, fo * t);
      ctx.fillStyle = accent(0, fo * t * 0.15);
      ctx.fillRect(cx - 15 * s, iy - 2 * s, 80 * s * t, 3 * s);
    }
    // Name reveal
    const nameT = interpolate(frame, [50, 70], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (nameT > 0) {
      ctx.fillStyle = C.text; ctx.font = `700 ${24 * s}px system-ui`; ctx.textAlign = "center";
      ctx.globalAlpha = fo * nameT;
      ctx.fillText("FlyWire", cx, height * 0.82);
      ctx.globalAlpha = fo;
    }
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

// V8: Wire connections forming letters of "FlyWire"
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
    const cx = width / 2, cy = height / 2;
    // Wire connections radiating
    const rng = seeded(3108);
    const prog = interpolate(frame, [5, 50], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    for (let i = 0; i < 25; i++) {
      const t = stagger(frame, i, 1, 8);
      if (t <= 0) continue;
      const x1 = cx + (rng() - 0.5) * 200 * s, y1 = cy + (rng() - 0.5) * 100 * s;
      const x2 = cx + (rng() - 0.5) * 200 * s, y2 = cy + (rng() - 0.5) * 100 * s;
      drawEdge(ctx, x1, y1, x2, y2, i % 2, fo * t * 0.2, s);
      drawNode(ctx, x1, y1, 1.5 * s * t, i % 2, fo * t * 0.5);
    }
    // Title over wires
    if (prog > 0.5) {
      const ta = (prog - 0.5) * 2;
      ctx.fillStyle = C.text; ctx.font = `700 ${30 * s}px system-ui`; ctx.textAlign = "center";
      ctx.globalAlpha = fo * ta;
      ctx.fillText("FlyWire", cx, cy + 10 * s);
      ctx.globalAlpha = fo;
    }
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

// V9: Globe with check overlay then title
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
    const cx = width / 2, cy = height * 0.42;
    const r = 50 * s;
    const appear = interpolate(frame, [5, 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    // Globe circle
    ctx.strokeStyle = accent(0, fo * appear * 0.4);
    ctx.lineWidth = 1.5 * s;
    ctx.beginPath(); ctx.arc(cx, cy, r * appear, 0, Math.PI * 2); ctx.stroke();
    // Latitude lines
    for (let i = -2; i <= 2; i++) {
      const ly = cy + i * r * 0.3 * appear;
      const lw = Math.sqrt(1 - (i * 0.3) ** 2) * r * appear;
      ctx.strokeStyle = accent(0, fo * appear * 0.15);
      ctx.beginPath(); ctx.ellipse(cx, ly, lw, 3 * s, 0, 0, Math.PI * 2); ctx.stroke();
    }
    // Nodes on globe
    const rng = seeded(3109);
    for (let i = 0; i < 20; i++) {
      const t = stagger(frame, i * 2, 1, 6);
      if (t <= 0) continue;
      const a = rng() * Math.PI * 2, gr = rng() * r * 0.9 * appear;
      drawNode(ctx, cx + Math.cos(a) * gr, cy + Math.sin(a) * gr * 0.7, 1.5 * s * t, i % 2, fo * t * 0.5);
    }
    // Check and title
    if (appear > 0.8) drawCheck(ctx, cx, cy, 15 * s, 0, fo * 0.4);
    const titleT = interpolate(frame, [40, 60], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (titleT > 0) {
      ctx.fillStyle = C.text; ctx.font = `700 ${22 * s}px system-ui`; ctx.textAlign = "center";
      ctx.globalAlpha = fo * titleT;
      ctx.fillText("FlyWire", cx, cy + r + 25 * s);
      ctx.globalAlpha = fo;
    }
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

export const VARIANTS_SHOT_031: VariantDef[] = [
  { id: "031-letter-glow", label: "Letters appearing with glow", component: V1 },
  { id: "031-name-radiate", label: "Name with radiating nodes", component: V2 },
  { id: "031-map-title", label: "Map glow-up with title", component: V3 },
  { id: "031-fly-name", label: "Fly outline with name", component: V4 },
  { id: "031-badge", label: "Badge emblem design", component: V5 },
  { id: "031-typewriter", label: "Typewriter effect", component: V6 },
  { id: "031-check-cascade", label: "Checkmark cascade", component: V7 },
  { id: "031-wire-text", label: "Wire connections forming text", component: V8 },
  { id: "031-globe-check", label: "Globe with check and title", component: V9 },
];
