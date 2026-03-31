import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantDef, VariantProps } from "../types";
import {
  C, seeded, accent, easeOutBack, drawBg, fadeInOut, stagger, staggerRaw,
  drawNode, drawNodeGradient, drawNodeDormant, drawEdge, drawEdgeGlow, drawEdgeFaint,
  drawHeader, drawCounter, drawPerson, drawNeuronShape, drawFlyOutline, drawPanel,
  drawCheck, drawXMark, drawSignalPulse, drawBarChart, drawThresholdLine, lerp,
} from "./portal-kit";

// Shot 051 — "They tested six different inputs."
// DUR=90. Six tests appearing.

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
    drawHeader(ctx, width, height, s, frame, DUR, "Six Inputs", "systematic testing");
    const labels = ["Sugar", "Sugar+Bitter", "P9 walk", "LC4 loom", "JO-CE touch", "Or56a smell"];
    for (let i = 0; i < 6; i++) {
      const col = i % 3, row = Math.floor(i / 3);
      const cx = width * (0.2 + col * 0.3), cy = height * (0.38 + row * 0.28);
      const t = stagger(frame, i, 6, 12);
      drawNode(ctx, cx, cy, 8 * s * t, i, fo * t);
      ctx.fillStyle = C.text; ctx.font = `${7 * s}px system-ui`; ctx.textAlign = "center";
      ctx.fillText(labels[i], cx, cy + 16 * s);
    }
    drawCounter(ctx, width, height, s, `${Math.min(6, Math.floor(frame / 10))}`, "inputs");
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
    drawHeader(ctx, width, height, s, frame, DUR, "Test Cards", "six scenarios");
    const labels = ["SUGAR", "BITTER", "WALK", "LOOM", "TOUCH", "SMELL"];
    for (let i = 0; i < 6; i++) {
      const col = i % 3, row = Math.floor(i / 3);
      const px = width * (0.08 + col * 0.3), py = height * (0.25 + row * 0.3);
      const t = stagger(frame, i, 6, 12);
      drawPanel(ctx, px, py, width * 0.26, height * 0.22, i, fo * t);
      ctx.fillStyle = accent(i, fo * t);
      ctx.font = `600 ${9 * s}px system-ui`; ctx.textAlign = "center";
      ctx.fillText(labels[i], px + width * 0.13, py + height * 0.12);
    }
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
    drawHeader(ctx, width, height, s, frame, DUR, "Timeline", "six experiments");
    for (let i = 0; i < 6; i++) {
      const t = stagger(frame, i, 8, 12);
      const dx = width * (0.12 + i * 0.135);
      drawEdgeFaint(ctx, dx, height * 0.45, dx, height * 0.65, s);
      drawNode(ctx, dx, height * 0.45, 6 * s * t, i, fo * t);
      ctx.fillStyle = C.text; ctx.font = `${7 * s}px system-ui`; ctx.textAlign = "center";
      ctx.fillText(`test ${i + 1}`, dx, height * 0.72);
    }
    ctx.strokeStyle = accent(0, fo * 0.3);
    ctx.lineWidth = 1.5 * s; ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(width * 0.12, height * 0.45);
    ctx.lineTo(width * (0.12 + 5 * 0.135), height * 0.45);
    ctx.stroke();
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
    drawHeader(ctx, width, height, s, frame, DUR, "Counter", "counting tests");
    const count = Math.min(6, Math.floor(frame / 12));
    ctx.fillStyle = C.text; ctx.font = `700 ${60 * s}px system-ui`; ctx.textAlign = "center";
    ctx.fillText(`${count}`, width * 0.5, height * 0.55);
    ctx.fillStyle = C.textDim; ctx.font = `${10 * s}px system-ui`;
    ctx.fillText("different inputs", width * 0.5, height * 0.68);
    for (let i = 0; i < count; i++) {
      const dx = width * (0.28 + i * 0.08);
      drawNode(ctx, dx, height * 0.78, 4 * s, i, fo);
    }
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
    drawHeader(ctx, width, height, s, frame, DUR, "Checklist", "six inputs tested");
    const items = ["sugar", "sugar+bitter", "forward walk", "looming shadow", "antenna touch", "odor"];
    for (let i = 0; i < items.length; i++) {
      const t = stagger(frame, i, 8, 10);
      const iy = height * (0.25 + i * 0.1);
      ctx.fillStyle = `rgba(58,58,74,${fo * t})`;
      ctx.font = `${8 * s}px system-ui`; ctx.textAlign = "left";
      ctx.fillText(items[i], width * 0.35, iy);
      drawNode(ctx, width * 0.25, iy - 3 * s, 4 * s * t, i, fo * t);
    }
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
    drawHeader(ctx, width, height, s, frame, DUR, "Input Array", "sensory channels");
    for (let i = 0; i < 6; i++) {
      const t = stagger(frame, i, 7, 12);
      const cx = width * (0.15 + i * 0.13), cy = height * 0.5;
      drawNodeGradient(ctx, cx, cy, 10 * s * t, i, fo * t);
      drawEdge(ctx, cx, cy, cx, cy + 25 * s, i, fo * t * 0.4, s);
      ctx.fillStyle = C.textDim; ctx.font = `${6 * s}px system-ui`; ctx.textAlign = "center";
      ctx.fillText(`#${i + 1}`, cx, cy + 35 * s);
    }
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
    drawHeader(ctx, width, height, s, frame, DUR, "Six Inputs", "feeding to each");
    const cx = width * 0.5, cy = height * 0.5;
    drawNodeGradient(ctx, cx, cy, 12 * s, 0, fo);
    for (let i = 0; i < 6; i++) {
      const ang = (i / 6) * Math.PI * 2 - Math.PI / 2;
      const r = 55 * s;
      const nx = cx + Math.cos(ang) * r, ny = cy + Math.sin(ang) * r;
      const t = stagger(frame, i, 6, 12);
      drawEdge(ctx, cx, cy, nx, ny, i, fo * t * 0.4, s);
      drawNode(ctx, nx, ny, 6 * s * t, i, fo * t);
    }
    ctx.fillStyle = C.textDim; ctx.font = `${8 * s}px system-ui`; ctx.textAlign = "center";
    ctx.fillText("brain", cx, cy + 20 * s);
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
    drawHeader(ctx, width, height, s, frame, DUR, "Experiment Grid", "systematic protocol");
    for (let i = 0; i < 6; i++) {
      const col = i % 2, row = Math.floor(i / 2);
      const t = stagger(frame, i, 6, 12);
      const px = width * (0.15 + col * 0.4), py = height * (0.24 + row * 0.2);
      drawPanel(ctx, px, py, width * 0.3, height * 0.14, i, fo * t);
      drawNode(ctx, px + 12 * s, py + height * 0.07, 5 * s * t, i, fo * t);
      ctx.fillStyle = C.text; ctx.font = `${7 * s}px system-ui`; ctx.textAlign = "left";
      ctx.fillText(`Test ${i + 1}`, px + 24 * s, py + height * 0.075);
    }
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
    drawHeader(ctx, width, height, s, frame, DUR, "Six Different", "input diversity");
    ctx.fillStyle = C.text; ctx.font = `700 ${50 * s}px system-ui`; ctx.textAlign = "center";
    const t = Math.min(1, frame / 25);
    ctx.globalAlpha = fo * t;
    ctx.fillText("6", width * 0.5, height * 0.52);
    ctx.font = `${12 * s}px system-ui`; ctx.fillStyle = C.textDim;
    ctx.fillText("different inputs", width * 0.5, height * 0.65);
    for (let i = 0; i < 6; i++) {
      const st = stagger(frame, i + 3, 5, 10);
      drawNode(ctx, width * (0.25 + i * 0.1), height * 0.78, 4 * s * st, i, fo * st);
    }
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

export const VARIANTS_SHOT_051: VariantDef[] = [
  { id: "shot_051_v1", label: "2x3 grid labeled", component: V1 },
  { id: "shot_051_v2", label: "six panel cards", component: V2 },
  { id: "shot_051_v3", label: "timeline six dots", component: V3 },
  { id: "shot_051_v4", label: "counter to six", component: V4 },
  { id: "shot_051_v5", label: "checklist items", component: V5 },
  { id: "shot_051_v6", label: "input array", component: V6 },
  { id: "shot_051_v7", label: "hub and spokes", component: V7 },
  { id: "shot_051_v8", label: "experiment grid", component: V8 },
  { id: "shot_051_v9", label: "six big number", component: V9 },
];
