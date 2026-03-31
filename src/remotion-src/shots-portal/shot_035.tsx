import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantDef, VariantProps } from "../types";
import {
  C, seeded, accent, easeOutBack, drawBg, fadeInOut, stagger, staggerRaw,
  drawNode, drawNodeGradient, drawNodeDormant, drawEdge, drawEdgeGlow, drawEdgeFaint,
  drawHeader, drawCounter, drawPerson, drawNeuronShape, drawFlyOutline, drawPanel,
  drawCheck, drawXMark, drawSignalPulse, drawBarChart, drawThresholdLine, lerp,
} from "./portal-kit";

// Shot 035 — "It's simpler than you'd think." (DUR=90)
// 9 variants — simplicity emphasis

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
    const ta = stagger(frame, 0, 5, 20);
    ctx.fillStyle = C.text; ctx.font = `700 ${20 * s * ta}px system-ui`; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText("1 SIMPLE RULE", cx, cy - 10 * s);
    const pulse = 1 + Math.sin(frame * 0.2) * 0.15;
    const da = staggerRaw(frame, 0, 25, 12);
    drawNode(ctx, cx, cy + 25 * s, 6 * s * pulse * da, 0, a);
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={ref} width={width} height={height} /></div>;
};

const V2: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const scribbles = useMemo(() => {
    const rng = seeded(3521);
    return Array.from({ length: 12 }, () => Array.from({ length: 6 }, () => ({ x: rng() * width * 0.8 + width * 0.1, y: rng() * height * 0.6 + height * 0.2 })));
  }, [width, height]);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height, s);
    const a = fadeInOut(frame, DUR);
    ctx.globalAlpha = a;
    const cx = width / 2, cy = height / 2;
    const fadeScribble = interpolate(frame, [10, 40], [0.5, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.strokeStyle = `rgba(180,180,200,${a * fadeScribble})`; ctx.lineWidth = 1.2 * s;
    for (const pts of scribbles) {
      ctx.beginPath(); ctx.moveTo(pts[0].x, pts[0].y);
      for (let j = 1; j < pts.length; j++) ctx.lineTo(pts[j].x, pts[j].y);
      ctx.stroke();
    }
    const clean = staggerRaw(frame, 0, 30, 20);
    ctx.globalAlpha = a * clean;
    ctx.fillStyle = C.blue; ctx.font = `600 ${14 * s}px system-ui`; ctx.textAlign = "center";
    ctx.fillText("if (sum > threshold) fire()", cx, cy);
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
    const appear = staggerRaw(frame, 0, 5, 25);
    // IN label + arrow
    ctx.fillStyle = C.textDim; ctx.font = `500 ${10 * s}px system-ui`; ctx.textAlign = "center";
    ctx.globalAlpha = a * Math.min(1, appear * 3);
    ctx.fillText("IN", cx - 60 * s, cy + 4 * s);
    drawEdge(ctx, cx - 45 * s, cy, cx - 15 * s, cy, 0, a * appear, s);
    ctx.globalAlpha = a;
    drawNodeGradient(ctx, cx, cy, 10 * s * appear, 0, a);
    // OUT arrow
    const outA = interpolate(appear, [0.5, 1], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawEdge(ctx, cx + 15 * s, cy, cx + 45 * s, cy, 1, a * outA, s);
    ctx.globalAlpha = a * outA;
    ctx.fillStyle = C.textDim; ctx.fillText("OUT", cx + 60 * s, cy + 4 * s);
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
    const text = "Simple.";
    const lettersShown = Math.floor(interpolate(frame, [10, 55], [0, text.length], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
    ctx.fillStyle = C.text; ctx.font = `700 ${24 * s}px system-ui`; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    const partial = text.slice(0, lettersShown);
    ctx.fillText(partial, cx, cy);
    if (lettersShown < text.length && Math.floor(frame / 8) % 2 === 0) {
      const tw = ctx.measureText(partial).width;
      ctx.fillStyle = C.blue;
      ctx.fillRect(cx + tw / 2 + 2 * s, cy - 12 * s, 2 * s, 24 * s);
    }
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={ref} width={width} height={height} /></div>;
};

const V5: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const lines = useMemo(() => {
    const rng = seeded(3555);
    return Array.from({ length: 15 }, () => ({ x1: rng() * width, y1: rng() * height, x2: rng() * width, y2: rng() * height }));
  }, [width, height]);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height, s);
    const a = fadeInOut(frame, DUR);
    ctx.globalAlpha = a;
    const cx = width / 2, cy = height / 2;
    const simplify = interpolate(frame, [10, 50], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    for (const l of lines) {
      const mx = lerp(l.x1, cx - 30 * s, simplify);
      const my = lerp(l.y1, cy, simplify);
      const mx2 = lerp(l.x2, cx + 30 * s, simplify);
      const my2 = lerp(l.y2, cy, simplify);
      drawEdgeFaint(ctx, mx, my, mx2, my2, s);
    }
    if (simplify > 0.6) {
      const ca = interpolate(simplify, [0.6, 1], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      drawEdgeGlow(ctx, cx - 40 * s, cy, cx + 40 * s, cy, 0, a * ca, s);
      drawNode(ctx, cx - 40 * s, cy, 4 * s * ca, 0, a);
      drawNode(ctx, cx + 40 * s, cy, 4 * s * ca, 1, a);
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
    const cx = width / 2, cy = height / 2;
    const phase = interpolate(frame, [5, 65], [0, 3], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const vals = [1000, 100, 10, 1];
    const idx = Math.min(3, Math.floor(phase));
    const val = vals[idx];
    ctx.fillStyle = val === 1 ? C.blue : C.text;
    ctx.font = `700 ${(val === 1 ? 28 : 18) * s}px system-ui`; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText(String(val), cx, cy - 10 * s);
    if (val === 1) drawNodeGradient(ctx, cx, cy + 25 * s, 5 * s, 0, a);
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
    const pulse = 1 + Math.sin(frame * 0.15) * 0.12;
    const appear = staggerRaw(frame, 0, 5, 20);
    drawNodeGradient(ctx, cx, cy - 5 * s, 12 * s * appear * pulse, 0, a);
    const la = staggerRaw(frame, 0, 25, 12);
    ctx.globalAlpha = a * la;
    ctx.fillStyle = C.textDim; ctx.font = `500 ${9 * s}px system-ui`; ctx.textAlign = "center";
    ctx.fillText("one rule", cx, cy + 20 * s);
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
    const appear = staggerRaw(frame, 0, 5, 10);
    drawNode(ctx, cx, cy, 10 * s * appear, 0, a);
    // Pulse wave
    const waveT = interpolate(frame, [20, 70], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (waveT > 0) {
      const waveX = cx - 80 * s + waveT * 160 * s;
      const waveA = a * 0.5 * (1 - Math.abs(waveT - 0.5) * 2);
      ctx.strokeStyle = accent(0, waveA); ctx.lineWidth = 2 * s; ctx.lineCap = "round";
      ctx.beginPath();
      for (let i = -20; i <= 20; i++) {
        const px = waveX + i * 2 * s;
        const py = cy + Math.sin(i * 0.5) * 8 * s * Math.exp(-i * i * 0.01);
        if (i === -20) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.stroke();
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
    // "complicated" crossed out
    ctx.fillStyle = `rgba(180,180,200,${a * 0.5})`; ctx.font = `500 ${14 * s}px system-ui`; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText("complicated", cx, cy - 15 * s);
    const crossA = staggerRaw(frame, 0, 5, 20);
    if (crossA > 0) {
      const tw = ctx.measureText("complicated").width;
      drawEdge(ctx, cx - tw / 2, cy - 15 * s, cx - tw / 2 + tw * crossA, cy - 15 * s, 1, a * 0.8, s);
    }
    const simA = staggerRaw(frame, 0, 30, 15);
    ctx.globalAlpha = a * simA;
    ctx.fillStyle = C.blue; ctx.font = `700 ${18 * s}px system-ui`;
    ctx.fillText("simple", cx, cy + 15 * s);
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={ref} width={width} height={height} /></div>;
};

export const VARIANTS_SHOT_035: VariantDef[] = [
  { id: "035-one-simple-rule", label: "Big text 1 SIMPLE RULE", component: V1 },
  { id: "035-equation-simplify", label: "Complex to clean formula", component: V2 },
  { id: "035-in-out-arrow", label: "IN arrow dot OUT", component: V3 },
  { id: "035-typewriter-simple", label: "Simple letter by letter", component: V4 },
  { id: "035-lines-simplify", label: "Messy lines to one clean", component: V5 },
  { id: "035-counter-dots", label: "Counter 1000 to 1", component: V6 },
  { id: "035-one-rule-dot", label: "Blue dot one rule", component: V7 },
  { id: "035-pulse-wave", label: "Single dot pulse wave", component: V8 },
  { id: "035-crossed-out", label: "Complicated crossed simple", component: V9 },
];
