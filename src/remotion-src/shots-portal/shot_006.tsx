import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantDef, VariantProps } from "../types";
import {
  C, seeded, accent, easeOutBack, drawBg, fadeInOut, stagger, staggerRaw,
  drawNode, drawNodeGradient, drawNodeDormant, drawEdge, drawEdgeGlow, drawEdgeFaint,
  drawHeader, drawCounter, drawPerson, drawNeuronShape, drawFlyOutline, drawPanel,
  drawCheck, drawXMark, drawSignalPulse, drawBarChart, drawThresholdLine, lerp,
} from "./portal-kit";

// Shot 006 — "Not a human brain. A fruit fly brain."
// 90 frames. 9 variants showing scale comparison.

// V1: Large brain outline (human, labeled) shrinks, tiny fly brain dot appears beside it
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
    // Human brain shrinks
    const shrink = interpolate(frame, [5, 50], [1, 0.35], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const humanX = lerp(cx, cx - 55 * s, interpolate(frame, [5, 50], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
    ctx.strokeStyle = `rgba(200,200,215,${fo * 0.5})`;
    ctx.lineWidth = 2 * s;
    ctx.beginPath();
    ctx.ellipse(humanX, cy, 80 * s * shrink, 60 * s * shrink, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = C.textDim;
    ctx.font = `${8 * s}px system-ui`;
    ctx.textAlign = "center";
    ctx.fillText("human", humanX, cy + 70 * s * shrink + 10 * s);
    // Fly brain appears
    const flyT = interpolate(frame, [40, 60], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (flyT > 0) {
      const flyX = cx + 55 * s;
      const flyR = 4 * s * easeOutBack(Math.min(1, flyT));
      drawNodeGradient(ctx, flyX, cy, flyR, 0, fo * flyT);
      drawFlyOutline(ctx, flyX, cy + 30 * s, 25 * s * flyT, fo * flyT);
      ctx.fillStyle = C.blue;
      ctx.font = `600 ${8 * s}px system-ui`;
      ctx.fillText("fruit fly", flyX, cy - 15 * s);
    }
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

// V2: Split screen: huge network left = human, tiny cluster right = fly
const V2: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const humanNet = useMemo(() => {
    const rng = seeded(602);
    return Array.from({ length: 80 }, (_, i) => ({
      x: rng() * width * 0.4 + width * 0.05,
      y: rng() * height * 0.6 + height * 0.2,
      i,
    }));
  }, [width, height]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const DUR = 90;
    drawBg(ctx, width, height, s);
    const fo = fadeInOut(frame, DUR);
    ctx.globalAlpha = fo;
    // Divider
    ctx.strokeStyle = `rgba(200,200,215,${fo * 0.3})`;
    ctx.lineWidth = 1 * s;
    ctx.beginPath();
    ctx.moveTo(width / 2, height * 0.15);
    ctx.lineTo(width / 2, height * 0.85);
    ctx.stroke();
    // Human side
    const ht = staggerRaw(frame, 0, 1, 25);
    for (const n of humanNet) {
      drawNodeDormant(ctx, n.x, n.y, 2 * s, fo * ht * 0.6);
    }
    ctx.fillStyle = C.textDim;
    ctx.font = `${9 * s}px system-ui`;
    ctx.textAlign = "center";
    ctx.fillText("human", width * 0.25, height * 0.12);
    // Fly side — tiny cluster
    const ft = stagger(frame, 15, 1, 12);
    if (ft > 0) {
      const fcx = width * 0.75, fcy = height / 2;
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        drawNode(ctx, fcx + Math.cos(a) * 10 * s * ft, fcy + Math.sin(a) * 10 * s * ft, 2 * s * ft, i % 2, fo * ft);
      }
      drawNodeGradient(ctx, fcx, fcy, 3 * s * ft, 0, fo * ft);
      ctx.fillStyle = C.blue;
      ctx.font = `600 ${9 * s}px system-ui`;
      ctx.fillText("fruit fly", fcx, height * 0.12);
    }
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

// V3: Size comparison: human brain circle vs fly brain dot (to scale)
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
    // Human brain — large circle
    const ht = staggerRaw(frame, 0, 1, 20);
    ctx.strokeStyle = `rgba(200,200,215,${fo * ht * 0.4})`;
    ctx.lineWidth = 2 * s;
    ctx.beginPath();
    ctx.arc(cx - 30 * s, cy, 80 * s * ht, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = C.textDim;
    ctx.font = `${8 * s}px system-ui`;
    ctx.textAlign = "center";
    ctx.fillText("human brain", cx - 30 * s, cy + 90 * s);
    // Fly brain — tiny dot (to scale: ~800x smaller volume, ~9x linear)
    const ft = stagger(frame, 25, 1, 10);
    if (ft > 0) {
      drawNodeGradient(ctx, cx + 90 * s, cy, 2 * s * ft, 0, fo * ft);
      ctx.fillStyle = C.blue;
      ctx.font = `600 ${7 * s}px system-ui`;
      ctx.fillText("fly brain", cx + 90 * s, cy + 14 * s);
      // Arrow pointing to dot
      ctx.strokeStyle = accent(0, fo * ft * 0.4);
      ctx.lineWidth = 1 * s;
      ctx.beginPath();
      ctx.moveTo(cx + 90 * s, cy - 12 * s);
      ctx.lineTo(cx + 90 * s, cy - 5 * s);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

// V4: Text "human brain" fading out, "fruit fly brain" fading in with fly outline
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
    const cx = width / 2, cy = height / 2;
    // "human brain" fading out
    const humanA = interpolate(frame, [5, 20, 35, 50], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = fo * humanA;
    ctx.fillStyle = C.textDim;
    ctx.font = `${16 * s}px system-ui`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("human brain", cx, cy);
    // Strikethrough
    if (frame > 30) {
      const st = interpolate(frame, [30, 45], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      ctx.strokeStyle = C.red;
      ctx.lineWidth = 2 * s;
      const tw = ctx.measureText("human brain").width;
      ctx.beginPath();
      ctx.moveTo(cx - tw / 2, cy);
      ctx.lineTo(cx - tw / 2 + tw * st, cy);
      ctx.stroke();
    }
    // "fruit fly brain" fading in
    const flyA = interpolate(frame, [45, 60], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = fo * flyA;
    ctx.fillStyle = C.blue;
    ctx.font = `600 ${16 * s}px system-ui`;
    ctx.fillText("fruit fly brain", cx, cy);
    // Fly outline below
    if (flyA > 0.3) {
      drawFlyOutline(ctx, cx, cy + 45 * s, 30 * s * flyA, fo * flyA);
    }
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

// V5: Zoom: starting at human brain scale, zooming way in to tiny fly brain
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
    const zoom = interpolate(frame, [5, 65], [1, 12], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    // Human brain gets huge and fades away
    const humanR = 80 * s * zoom;
    const humanA = interpolate(frame, [5, 40], [0.4, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (humanA > 0) {
      ctx.strokeStyle = `rgba(200,200,215,${fo * humanA})`;
      ctx.lineWidth = 2 * s;
      ctx.beginPath();
      ctx.arc(cx, cy, humanR, 0, Math.PI * 2);
      ctx.stroke();
    }
    // Fly brain stays small and centered
    const flyA = interpolate(frame, [30, 55], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (flyA > 0) {
      drawNodeGradient(ctx, cx, cy, 6 * s * easeOutBack(Math.min(1, flyA)), 0, fo * flyA);
      ctx.fillStyle = C.blue;
      ctx.font = `600 ${9 * s}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText("fruit fly brain", cx, cy + 18 * s);
    }
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

// V6: Bar chart: human brain bar vs fly brain bar (vastly different heights)
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
    drawHeader(ctx, width, height, s, frame, DUR, "Neuron count", "scale comparison");
    const chartX = width * 0.2, chartY = height * 0.2;
    const chartW = width * 0.6, chartH = height * 0.6;
    // Human bar (86 billion -> full height)
    const ht = staggerRaw(frame, 5, 1, 25);
    const barW = chartW * 0.3;
    const humanBarH = chartH * ht;
    drawBarChart(ctx, chartX, chartY + chartH - humanBarH, barW, humanBarH, [1], 1, s);
    ctx.fillStyle = C.textDim;
    ctx.font = `${7 * s}px system-ui`;
    ctx.textAlign = "center";
    ctx.fillText("human", chartX + barW / 2, chartY + chartH + 14 * s);
    ctx.fillText("86 billion", chartX + barW / 2, chartY + chartH + 24 * s);
    // Fly bar (138K -> almost invisible compared to human)
    const ft = stagger(frame, 30, 1, 10);
    if (ft > 0) {
      const flyBarH = chartH * 0.0016 * ft; // 138K/86B ratio
      const flyX = chartX + chartW * 0.6;
      // Draw a visible minimum bar
      const visibleH = Math.max(flyBarH, 3 * s);
      drawBarChart(ctx, flyX, chartY + chartH - visibleH, barW, visibleH, [1], 1, s);
      ctx.fillStyle = C.blue;
      ctx.font = `600 ${7 * s}px system-ui`;
      ctx.fillText("fruit fly", flyX + barW / 2, chartY + chartH + 14 * s);
      ctx.fillText("138,639", flyX + barW / 2, chartY + chartH + 24 * s);
      // Arrow pointing to tiny bar
      ctx.strokeStyle = accent(0, fo * ft * 0.5);
      ctx.lineWidth = 1 * s;
      ctx.beginPath();
      ctx.moveTo(flyX + barW / 2, chartY + chartH - visibleH - 15 * s);
      ctx.lineTo(flyX + barW / 2, chartY + chartH - visibleH - 3 * s);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

// V7: Person silhouette with brain vs fly outline with tiny brain dot
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
    // Human person with brain
    const ht = staggerRaw(frame, 0, 1, 20);
    const hx = width * 0.3, hy = height * 0.55;
    drawPerson(ctx, hx, hy, 35 * s * ht, `rgba(200,200,215,${fo * ht * 0.5})`);
    // Brain circle in head
    if (ht > 0.5) {
      ctx.strokeStyle = `rgba(200,200,215,${fo * 0.5})`;
      ctx.lineWidth = 1.5 * s;
      ctx.beginPath();
      ctx.arc(hx, hy - 35 * s * 0.55, 12 * s, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.fillStyle = C.textDim;
    ctx.font = `${8 * s}px system-ui`;
    ctx.textAlign = "center";
    ctx.fillText("human", hx, height * 0.85);
    // Fly with tiny brain
    const ft = stagger(frame, 18, 1, 12);
    if (ft > 0) {
      const fx = width * 0.7, fy = height * 0.5;
      drawFlyOutline(ctx, fx, fy, 35 * s * ft, fo * ft);
      // Tiny brain dot in head
      drawNodeGradient(ctx, fx, fy - 35 * s * ft * 0.32, 2 * s * ft, 0, fo * ft);
      ctx.fillStyle = C.blue;
      ctx.font = `600 ${8 * s}px system-ui`;
      ctx.fillText("fruit fly", fx, height * 0.85);
    }
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

// V8: Counter: "86 billion" crossing out -> "138,639" appearing
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
    const cx = width / 2, cy = height / 2;
    // "86,000,000,000"
    const bigA = interpolate(frame, [5, 15, 30, 45], [0, 1, 1, 0.3], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = fo * bigA;
    ctx.fillStyle = C.textDim;
    ctx.font = `${18 * s}px monospace`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("86,000,000,000", cx, cy - 12 * s);
    // Strikethrough
    if (frame > 25) {
      const st = interpolate(frame, [25, 38], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      ctx.strokeStyle = C.red;
      ctx.lineWidth = 2 * s;
      const tw = ctx.measureText("86,000,000,000").width;
      ctx.beginPath();
      ctx.moveTo(cx - tw / 2, cy - 12 * s);
      ctx.lineTo(cx - tw / 2 + tw * st, cy - 12 * s);
      ctx.stroke();
    }
    // "138,639"
    const smallA = interpolate(frame, [40, 55], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = fo * smallA;
    ctx.fillStyle = C.blue;
    ctx.font = `700 ${22 * s}px monospace`;
    ctx.fillText("138,639", cx, cy + 18 * s);
    ctx.fillStyle = C.textDim;
    ctx.font = `${7 * s}px system-ui`;
    ctx.fillText("neurons", cx, cy + 32 * s);
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

// V9: Two panels: left panel big network, right panel tiny network with fly icon
const V9: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const bigNet = useMemo(() => {
    const rng = seeded(609);
    return Array.from({ length: 50 }, (_, i) => ({
      x: rng() * width * 0.35 + width * 0.05,
      y: rng() * height * 0.55 + height * 0.22,
      i,
    }));
  }, [width, height]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const DUR = 90;
    drawBg(ctx, width, height, s);
    const fo = fadeInOut(frame, DUR);
    ctx.globalAlpha = fo;
    // Left panel: human brain network
    const lt = staggerRaw(frame, 0, 1, 20);
    drawPanel(ctx, width * 0.03, height * 0.15, width * 0.44, height * 0.7, 1, fo * lt);
    for (const n of bigNet) {
      drawNodeDormant(ctx, n.x, n.y, 2 * s, fo * lt * 0.5);
    }
    ctx.fillStyle = C.textDim;
    ctx.font = `${8 * s}px system-ui`;
    ctx.textAlign = "center";
    ctx.fillText("human", width * 0.25, height * 0.1);
    // Right panel: fly brain network
    const rt = stagger(frame, 15, 1, 12);
    if (rt > 0) {
      drawPanel(ctx, width * 0.53, height * 0.15, width * 0.44, height * 0.7, 0, fo * rt);
      const fcx = width * 0.75, fcy = height / 2;
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        drawNode(ctx, fcx + Math.cos(a) * 12 * s * rt, fcy + Math.sin(a) * 12 * s * rt, 2.5 * s * rt, i % 2, fo * rt);
      }
      drawNodeGradient(ctx, fcx, fcy, 4 * s * rt, 0, fo * rt);
      drawFlyOutline(ctx, fcx, fcy + 35 * s, 20 * s * rt, fo * rt * 0.6);
      ctx.fillStyle = C.blue;
      ctx.font = `600 ${8 * s}px system-ui`;
      ctx.fillText("fruit fly", width * 0.75, height * 0.1);
    }
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

export const VARIANTS_SHOT_006: VariantDef[] = [
  { id: "006-shrink-compare", label: "Human shrinks, fly appears", component: V1 },
  { id: "006-split-networks", label: "Split screen networks", component: V2 },
  { id: "006-to-scale", label: "Size to scale", component: V3 },
  { id: "006-text-swap", label: "Text swap with strikethrough", component: V4 },
  { id: "006-zoom-in", label: "Zoom from human to fly", component: V5 },
  { id: "006-bar-chart", label: "Neuron count bar chart", component: V6 },
  { id: "006-silhouettes", label: "Person vs fly silhouettes", component: V7 },
  { id: "006-counter-swap", label: "86B crossed out to 138K", component: V8 },
  { id: "006-two-panels", label: "Two panel comparison", component: V9 },
];
