import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantDef, VariantProps } from "../types";
import {
  C, seeded, accent, easeOutBack, drawBg, fadeInOut, stagger, staggerRaw,
  drawNode, drawNodeGradient, drawNodeDormant, drawEdge, drawEdgeGlow, drawEdgeFaint,
  drawHeader, drawCounter, drawPerson, drawNeuronShape, drawFlyOutline, drawPanel,
  drawCheck, drawXMark, drawSignalPulse, drawBarChart, drawThresholdLine, lerp,
} from "./portal-kit";

// Shot 040 — "One neuron doing this is a very simple thing."
// 9 variants — single lonely node in vast white space (DUR=120)

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
    const pulse = 1 + Math.sin(frame * 0.08) * 0.1;
    drawNode(ctx, width / 2, height / 2, 8 * s * pulse, 0, a);
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
    const appear = stagger(frame, 0, 5, 15);
    drawNodeGradient(ctx, cx, cy, 10 * s * appear, 0, a);
    const ta = staggerRaw(frame, 0, 35, 15);
    ctx.globalAlpha = a * ta;
    ctx.fillStyle = C.textDim; ctx.font = `${8 * s}px system-ui`; ctx.textAlign = "center";
    ctx.fillText("simple", cx, cy + 22 * s);
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
    const appear = staggerRaw(frame, 0, 10, 20);
    drawNode(ctx, cx, cy, 4 * s * appear, 0, a);
    for (let r = 1; r <= 3; r++) {
      const ringA = Math.max(0, appear - r * 0.2) * 0.1;
      ctx.strokeStyle = accent(0, a * ringA); ctx.lineWidth = 0.5 * s;
      ctx.beginPath(); ctx.arc(cx, cy, r * 30 * s, 0, Math.PI * 2); ctx.stroke();
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
    const breath = 1 + Math.sin(frame * 0.05) * 0.2;
    drawNodeGradient(ctx, cx, cy, 10 * s * breath, 0, a);
    const ta = staggerRaw(frame, 0, 20, 15);
    ctx.globalAlpha = a * ta;
    ctx.fillStyle = C.text; ctx.font = `700 ${20 * s}px system-ui`; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText("1", cx, cy - 30 * s);
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
    const zoom = interpolate(frame, [10, 90], [2, 10], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawNode(ctx, cx, cy, zoom * s, 0, a);
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={ref} width={width} height={height} /></div>;
};

const V6: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const dormants = useMemo(() => {
    const rng = seeded(4006);
    return Array.from({ length: 15 }, () => ({ x: (rng() - 0.5) * width * 0.8, y: (rng() - 0.5) * height * 0.8 }));
  }, [width, height]);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height, s);
    const a = fadeInOut(frame, DUR);
    ctx.globalAlpha = a;
    const cx = width / 2, cy = height / 2;
    const floatY = Math.sin(frame * 0.04) * 5 * s;
    drawNode(ctx, cx, cy + floatY, 8 * s, 0, a);
    for (const d of dormants) drawNodeDormant(ctx, cx + d.x, cy + d.y, 3 * s, a * 0.4);
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
    const appear = stagger(frame, 0, 5, 15);
    drawNodeGradient(ctx, cx, cy - 8 * s, 10 * s * appear, 0, a);
    const ta = staggerRaw(frame, 0, 40, 15);
    ctx.globalAlpha = a * ta;
    ctx.fillStyle = C.text; ctx.font = `600 ${10 * s}px system-ui`; ctx.textAlign = "center";
    ctx.fillText("a very simple thing", cx, cy + 20 * s);
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
    const t = (frame % 40) / 40;
    const beat = t < 0.15 ? easeOutBack(t / 0.15) * 1.4 : lerp(1.4, 1, Math.min(1, (t - 0.15) / 0.3));
    drawNode(ctx, cx, cy, 8 * s * beat, 0, a);
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
    const appear = staggerRaw(frame, 0, 5, 15);
    drawNode(ctx, cx, cy, 7 * s * appear, 0, a);
    const lineA = staggerRaw(frame, 0, 30, 30);
    if (lineA > 0) {
      const len = 60 * s * lineA;
      drawEdgeFaint(ctx, cx, cy, cx + len, cy, s);
      drawEdgeFaint(ctx, cx, cy, cx - len, cy, s);
      drawEdgeFaint(ctx, cx, cy, cx, cy + len, s);
      drawEdgeFaint(ctx, cx, cy, cx, cy - len, s);
    }
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={ref} width={width} height={height} /></div>;
};

export const VARIANTS_SHOT_040: VariantDef[] = [
  { id: "040-lonely-pulse", label: "Lonely pulsing dot", component: V1 },
  { id: "040-simple-label", label: "Node with simple label", component: V2 },
  { id: "040-concentric-rings", label: "Tiny node concentric rings", component: V3 },
  { id: "040-breathing-one", label: "Breathing pulse with 1", component: V4 },
  { id: "040-slow-zoom", label: "Slow zoom into node", component: V5 },
  { id: "040-dormant-contrast", label: "Active among dormant", component: V6 },
  { id: "040-simple-thing", label: "A very simple thing text", component: V7 },
  { id: "040-heartbeat", label: "Heartbeat pulse node", component: V8 },
  { id: "040-faint-grid", label: "Dot with extending grid lines", component: V9 },
];
