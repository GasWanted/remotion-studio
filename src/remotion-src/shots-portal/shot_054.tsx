import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantDef, VariantProps } from "../types";
import {
  C, seeded, accent, easeOutBack, drawBg, fadeInOut, stagger, staggerRaw,
  drawNode, drawNodeGradient, drawNodeDormant, drawEdge, drawEdgeGlow, drawEdgeFaint,
  drawHeader, drawCounter, drawPerson, drawNeuronShape, drawFlyOutline, drawPanel,
  drawCheck, drawXMark, drawSignalPulse, drawBarChart, drawThresholdLine, lerp,
} from "./portal-kit";

// Shot 054 — "Six for six. All from the wiring alone."
// DUR=90. Perfect score.

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
    drawHeader(ctx, width, height, s, frame, DUR, "Perfect Score", "six for six");
    const t = Math.min(1, frame / 30);
    ctx.fillStyle = `rgba(58,58,74,${fo * t})`;
    ctx.font = `700 ${50 * s}px system-ui`; ctx.textAlign = "center";
    ctx.fillText("6/6", width * 0.5, height * 0.52);
    for (let i = 0; i < 6; i++) {
      const ct = stagger(frame, i + 2, 6, 10);
      const cx = width * (0.22 + i * 0.11);
      drawCheck(ctx, cx, height * 0.72, 12 * s * ct, i, fo * ct);
    }
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
    drawHeader(ctx, width, height, s, frame, DUR, "100%", "all correct");
    const pct = Math.min(100, Math.floor(frame * 1.8));
    ctx.fillStyle = C.text; ctx.font = `700 ${40 * s}px system-ui`; ctx.textAlign = "center";
    ctx.fillText(`${pct}%`, width * 0.5, height * 0.52);
    const barW = width * 0.6, barH = 8 * s;
    const bx = width * 0.2, by = height * 0.62;
    ctx.fillStyle = C.panel;
    ctx.fillRect(bx, by, barW, barH);
    ctx.fillStyle = C.green;
    ctx.fillRect(bx, by, barW * (pct / 100), barH);
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
    drawHeader(ctx, width, height, s, frame, DUR, "All Pulsing", "six active nodes");
    for (let i = 0; i < 6; i++) {
      const col = i % 3, row = Math.floor(i / 3);
      const cx = width * (0.25 + col * 0.25), cy = height * (0.38 + row * 0.25);
      const t = stagger(frame, i, 5, 12);
      const pulse = 0.85 + Math.sin(frame * 0.12 + i) * 0.15;
      drawNodeGradient(ctx, cx, cy, 10 * s * t * pulse, i, fo * t);
      drawCheck(ctx, cx + 14 * s, cy - 8 * s, 6 * s * t, i, fo * t);
    }
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
    drawHeader(ctx, width, height, s, frame, DUR, "Star Rating", "perfect marks");
    for (let i = 0; i < 6; i++) {
      const t = stagger(frame, i, 6, 12);
      const sx = width * (0.18 + i * 0.12), sy = height * 0.5;
      drawNodeGradient(ctx, sx, sy, 8 * s * t, 1, fo * t);
      ctx.fillStyle = `rgba(255,140,0,${fo * t * 0.3})`;
      ctx.beginPath();
      for (let p = 0; p < 5; p++) {
        const ang = (p / 5) * Math.PI * 2 - Math.PI / 2;
        const r = (p % 2 === 0 ? 12 : 6) * s * t;
        const px = sx + Math.cos(ang) * r, py = sy + Math.sin(ang) * r;
        if (p === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.closePath(); ctx.fill();
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
    drawHeader(ctx, width, height, s, frame, DUR, "SIX FOR SIX", "wiring alone");
    const t = Math.min(1, frame / 25);
    ctx.fillStyle = `rgba(64,192,128,${fo * t})`;
    ctx.font = `700 ${30 * s}px system-ui`; ctx.textAlign = "center";
    ctx.fillText("SIX FOR SIX", width * 0.5, height * 0.5);
    ctx.fillStyle = C.textDim; ctx.font = `${9 * s}px system-ui`;
    ctx.fillText("all from the wiring alone", width * 0.5, height * 0.62);
    for (let i = 0; i < 6; i++) {
      const st = stagger(frame, i + 3, 4, 10);
      drawNode(ctx, width * (0.22 + i * 0.11), height * 0.74, 4 * s * st, i, fo * st);
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
    drawHeader(ctx, width, height, s, frame, DUR, "Checklist Complete", "all passed");
    const items = ["FEED", "IDLE", "WALK", "ESCAPE", "GROOM", "TURN"];
    for (let i = 0; i < items.length; i++) {
      const t = stagger(frame, i, 6, 10);
      const iy = height * (0.25 + i * 0.1);
      ctx.fillStyle = `rgba(58,58,74,${fo * t})`;
      ctx.font = `${9 * s}px system-ui`; ctx.textAlign = "left";
      ctx.fillText(items[i], width * 0.4, iy);
      drawCheck(ctx, width * 0.3, iy - 3 * s, 10 * s * t, i, fo * t);
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
    drawHeader(ctx, width, height, s, frame, DUR, "Ring of Success", "six green checks");
    const cx = width * 0.5, cy = height * 0.5;
    for (let i = 0; i < 6; i++) {
      const ang = (i / 6) * Math.PI * 2 - Math.PI / 2;
      const r = 55 * s;
      const nx = cx + Math.cos(ang) * r, ny = cy + Math.sin(ang) * r;
      const t = stagger(frame, i, 6, 12);
      drawNodeGradient(ctx, nx, ny, 7 * s * t, i, fo * t);
      drawCheck(ctx, nx, ny + 14 * s, 8 * s * t, i, fo * t);
    }
    drawCounter(ctx, width, height, s, "6/6", "correct");
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
    drawHeader(ctx, width, height, s, frame, DUR, "Wiring Alone", "no learning needed");
    const vals = [1, 1, 1, 1, 1, 1];
    const barT = Math.min(1, frame / 35);
    drawBarChart(ctx, width * 0.15, height * 0.3, width * 0.7, height * 0.35, vals.map(v => v * barT), 1, s);
    const labels = ["FEED", "IDLE", "WALK", "ESC", "GRM", "TURN"];
    for (let i = 0; i < 6; i++) {
      ctx.fillStyle = accent(i, fo); ctx.font = `${6 * s}px system-ui`; ctx.textAlign = "center";
      ctx.fillText(labels[i], width * 0.15 + (i + 0.35) * (width * 0.7 / 6), height * 0.72);
    }
    ctx.fillStyle = C.text; ctx.font = `600 ${10 * s}px system-ui`; ctx.textAlign = "center";
    ctx.fillText("all from wiring alone", width * 0.5, height * 0.85);
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
    drawHeader(ctx, width, height, s, frame, DUR, "6 / 6", "all correct");
    const count = Math.min(6, Math.floor(frame / 10));
    for (let i = 0; i < count; i++) {
      const dx = width * (0.22 + i * 0.11), dy = height * 0.45;
      const t = stagger(frame, i, 8, 10);
      drawNode(ctx, dx, dy, 7 * s * t, i, fo * t);
      drawCheck(ctx, dx, dy + 16 * s, 8 * s * t, 0, fo * t);
    }
    ctx.fillStyle = C.green; ctx.font = `700 ${28 * s}px system-ui`; ctx.textAlign = "center";
    ctx.fillText(`${count}/6`, width * 0.5, height * 0.72);
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

export const VARIANTS_SHOT_054: VariantDef[] = [
  { id: "shot_054_v1", label: "6/6 with checks", component: V1 },
  { id: "shot_054_v2", label: "progress to 100", component: V2 },
  { id: "shot_054_v3", label: "six pulsing nodes", component: V3 },
  { id: "shot_054_v4", label: "star rating", component: V4 },
  { id: "shot_054_v5", label: "SIX FOR SIX text", component: V5 },
  { id: "shot_054_v6", label: "checklist complete", component: V6 },
  { id: "shot_054_v7", label: "ring of success", component: V7 },
  { id: "shot_054_v8", label: "wiring alone bars", component: V8 },
  { id: "shot_054_v9", label: "counting checks", component: V9 },
];
