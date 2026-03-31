import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantDef, VariantProps } from "../types";
import {
  C, seeded, accent, easeOutBack, drawBg, fadeInOut, stagger, staggerRaw,
  drawNode, drawNodeGradient, drawNodeDormant, drawEdge, drawEdgeGlow, drawEdgeFaint,
  drawHeader, drawCounter, drawPerson, drawNeuronShape, drawFlyOutline, drawPanel,
  drawCheck, drawXMark, drawSignalPulse, drawBarChart, drawThresholdLine, lerp,
} from "./portal-kit";

// Shot 057 — "There's no body, no world, no consequences. To really know if this thing works, you have to give it something to control."
// DUR=150. Need for body.

const V1: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const DUR = 150;
    drawBg(ctx, width, height, s);
    const fo = fadeInOut(frame, DUR);
    ctx.globalAlpha = fo;
    drawHeader(ctx, width, height, s, frame, DUR, "No Body, No World", "no consequences");
    const lines = ["no body", "no world", "no consequences"];
    for (let i = 0; i < lines.length; i++) {
      const t = stagger(frame, i, 18, 15);
      ctx.fillStyle = `rgba(58,58,74,${fo * t})`;
      ctx.font = `600 ${14 * s}px system-ui`; ctx.textAlign = "center";
      ctx.fillText(lines[i], width * 0.5, height * (0.35 + i * 0.15));
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
    const DUR = 150;
    drawBg(ctx, width, height, s);
    const fo = fadeInOut(frame, DUR);
    ctx.globalAlpha = fo;
    drawHeader(ctx, width, height, s, frame, DUR, "Empty Plug", "brain needs a body");
    const cx = width * 0.35, cy = height * 0.5;
    drawNodeGradient(ctx, cx, cy, 14 * s, 0, fo);
    ctx.fillStyle = C.textDim; ctx.font = `${8 * s}px system-ui`; ctx.textAlign = "center";
    ctx.fillText("brain", cx, cy + 24 * s);
    ctx.strokeStyle = `rgba(180,180,200,${fo * 0.4})`;
    ctx.lineWidth = 2 * s; ctx.lineCap = "round";
    ctx.beginPath(); ctx.moveTo(cx + 18 * s, cy); ctx.lineTo(width * 0.55, cy); ctx.stroke();
    const plugX = width * 0.6, plugY = cy;
    ctx.strokeStyle = `rgba(180,180,200,${fo * 0.5})`;
    ctx.lineWidth = 2 * s;
    ctx.beginPath();
    ctx.arc(plugX, plugY, 8 * s, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = C.textDim; ctx.font = `${8 * s}px system-ui`;
    ctx.fillText("?", plugX, plugY + 4 * s);
    ctx.strokeStyle = `rgba(180,180,200,${fo * 0.25})`;
    ctx.setLineDash([3 * s, 3 * s]);
    ctx.beginPath(); ctx.moveTo(plugX + 10 * s, plugY); ctx.lineTo(width * 0.85, plugY); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = C.textDim;
    ctx.fillText("something to control", width * 0.75, plugY + 20 * s);
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
    const DUR = 150;
    drawBg(ctx, width, height, s);
    const fo = fadeInOut(frame, DUR);
    ctx.globalAlpha = fo;
    drawHeader(ctx, width, height, s, frame, DUR, "Phantom Fly", "body forming");
    const t = Math.min(1, Math.max(0, (frame - 50) / 60));
    ctx.save();
    ctx.globalAlpha = fo * t * 0.4;
    drawFlyOutline(ctx, width * 0.5, height * 0.52, 90 * s, 1);
    ctx.restore();
    ctx.globalAlpha = fo;
    if (t < 0.01) {
      ctx.fillStyle = C.textDim; ctx.font = `${10 * s}px system-ui`; ctx.textAlign = "center";
      ctx.fillText("no body yet", width * 0.5, height * 0.5);
    }
    if (frame > 80) {
      ctx.fillStyle = `rgba(64,144,255,${fo * Math.min(1, (frame - 80) / 20)})`;
      ctx.font = `${9 * s}px system-ui`; ctx.textAlign = "center";
      ctx.fillText("give it something to control", width * 0.5, height * 0.88);
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
    const DUR = 150;
    drawBg(ctx, width, height, s);
    const fo = fadeInOut(frame, DUR);
    ctx.globalAlpha = fo;
    drawHeader(ctx, width, height, s, frame, DUR, "Checklist", "what's missing");
    const items = [
      { label: "brain", done: true },
      { label: "body", done: false },
      { label: "world", done: false },
    ];
    for (let i = 0; i < items.length; i++) {
      const t = stagger(frame, i, 15, 12);
      const iy = height * (0.35 + i * 0.15);
      ctx.fillStyle = `rgba(58,58,74,${fo * t})`;
      ctx.font = `${11 * s}px system-ui`; ctx.textAlign = "left";
      ctx.fillText(items[i].label, width * 0.4, iy);
      if (items[i].done) {
        drawCheck(ctx, width * 0.3, iy - 4 * s, 12 * s * t, 0, fo * t);
      } else {
        drawXMark(ctx, width * 0.3, iy - 4 * s, 12 * s * t, 1, fo * t);
      }
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
    const DUR = 150;
    drawBg(ctx, width, height, s);
    const fo = fadeInOut(frame, DUR);
    ctx.globalAlpha = fo;
    drawHeader(ctx, width, height, s, frame, DUR, "Dashed Outline", "body needed");
    const cx = width * 0.5, cy = height * 0.52;
    const t = Math.min(1, frame / 60);
    ctx.strokeStyle = `rgba(64,144,255,${fo * t * 0.3})`;
    ctx.setLineDash([6 * s, 4 * s]);
    ctx.lineWidth = 2 * s;
    ctx.beginPath();
    ctx.ellipse(cx, cy + 10 * s, 20 * s * t, 30 * s * t, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(cx, cy - 15 * s, 15 * s * t, 18 * s * t, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx, cy - 35 * s, 10 * s * t, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = C.textDim; ctx.font = `${9 * s}px system-ui`; ctx.textAlign = "center";
    ctx.fillText("body outline — not yet real", cx, cy + 55 * s);
    if (frame > 80) {
      const at = Math.min(1, (frame - 80) / 25);
      ctx.fillStyle = `rgba(64,144,255,${fo * at})`;
      ctx.font = `${9 * s}px system-ui`;
      ctx.fillText("give it something to control", cx, cy + 70 * s);
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
    const DUR = 150;
    drawBg(ctx, width, height, s);
    const fo = fadeInOut(frame, DUR);
    ctx.globalAlpha = fo;
    drawHeader(ctx, width, height, s, frame, DUR, "Missing Pieces", "body + world");
    drawPanel(ctx, width * 0.05, height * 0.25, width * 0.28, height * 0.45, 0, fo);
    drawPanel(ctx, width * 0.37, height * 0.25, width * 0.28, height * 0.45, 1, fo * 0.3);
    drawPanel(ctx, width * 0.69, height * 0.25, width * 0.28, height * 0.45, 1, fo * 0.3);
    const rng = seeded(576);
    for (let i = 0; i < 6; i++) {
      const nx = width * (0.1 + rng() * 0.18), ny = height * (0.3 + rng() * 0.35);
      drawNode(ctx, nx, ny, 3 * s, i, fo);
    }
    ctx.fillStyle = C.text; ctx.font = `${9 * s}px system-ui`; ctx.textAlign = "center";
    ctx.fillText("brain", width * 0.19, height * 0.75);
    ctx.fillStyle = C.textDim;
    ctx.fillText("body ?", width * 0.51, height * 0.75);
    ctx.fillText("world ?", width * 0.83, height * 0.75);
    drawCheck(ctx, width * 0.19, height * 0.8, 8 * s, 0, fo);
    drawXMark(ctx, width * 0.51, height * 0.8, 8 * s, 1, fo);
    drawXMark(ctx, width * 0.83, height * 0.8, 8 * s, 1, fo);
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
    const DUR = 150;
    drawBg(ctx, width, height, s);
    const fo = fadeInOut(frame, DUR);
    ctx.globalAlpha = fo;
    drawHeader(ctx, width, height, s, frame, DUR, "Need for Embodiment", "brain → body → world");
    const nodes = [
      { x: 0.2, y: 0.5, label: "brain", active: true },
      { x: 0.5, y: 0.5, label: "body", active: false },
      { x: 0.8, y: 0.5, label: "world", active: false },
    ];
    for (let i = 0; i < nodes.length; i++) {
      const t = stagger(frame, i, 15, 12);
      const nx = width * nodes[i].x, ny = height * nodes[i].y;
      if (nodes[i].active) {
        drawNodeGradient(ctx, nx, ny, 12 * s * t, 0, fo * t);
      } else {
        drawNodeDormant(ctx, nx, ny, 14 * s * t, fo * t);
      }
      ctx.fillStyle = nodes[i].active ? C.text : C.textDim;
      ctx.font = `${9 * s}px system-ui`; ctx.textAlign = "center";
      ctx.fillText(nodes[i].label, nx, ny + 22 * s);
      if (i > 0) {
        ctx.strokeStyle = `rgba(180,180,200,${fo * t * 0.3})`;
        ctx.setLineDash([4 * s, 3 * s]);
        ctx.lineWidth = 1.5 * s;
        ctx.beginPath();
        ctx.moveTo(width * nodes[i - 1].x + 14 * s, ny);
        ctx.lineTo(nx - 14 * s, ny);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }
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
    const DUR = 150;
    drawBg(ctx, width, height, s);
    const fo = fadeInOut(frame, DUR);
    ctx.globalAlpha = fo;
    drawHeader(ctx, width, height, s, frame, DUR, "Something to Control", "the next step");
    const cx = width * 0.5, cy = height * 0.45;
    drawNodeGradient(ctx, cx - 60 * s, cy, 10 * s, 0, fo);
    ctx.fillStyle = C.text; ctx.font = `${8 * s}px system-ui`; ctx.textAlign = "center";
    ctx.fillText("brain", cx - 60 * s, cy + 20 * s);
    const t = Math.min(1, Math.max(0, (frame - 40) / 40));
    ctx.strokeStyle = accent(0, fo * t * 0.4);
    ctx.lineWidth = 2 * s; ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(cx - 45 * s, cy);
    ctx.lineTo(lerp(cx - 45 * s, cx + 30 * s, t), cy);
    ctx.stroke();
    if (frame > 70) {
      const ft = Math.min(1, (frame - 70) / 30);
      ctx.save();
      ctx.globalAlpha = fo * ft * 0.4;
      drawFlyOutline(ctx, cx + 60 * s, cy, 70 * s, 1);
      ctx.restore();
      ctx.globalAlpha = fo;
      ctx.fillStyle = C.textDim; ctx.font = `${8 * s}px system-ui`;
      ctx.fillText("body?", cx + 60 * s, cy + 55 * s);
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
    const DUR = 150;
    drawBg(ctx, width, height, s);
    const fo = fadeInOut(frame, DUR);
    ctx.globalAlpha = fo;
    drawHeader(ctx, width, height, s, frame, DUR, "To Really Know", "give it a body");
    const t1 = stagger(frame, 0, 0, 15);
    ctx.fillStyle = `rgba(58,58,74,${fo * t1})`;
    ctx.font = `${10 * s}px system-ui`; ctx.textAlign = "center";
    ctx.fillText("to really know if this thing works...", width * 0.5, height * 0.38);
    const t2 = stagger(frame, 4, 12, 15);
    ctx.fillStyle = `rgba(64,144,255,${fo * t2})`;
    ctx.font = `600 ${13 * s}px system-ui`;
    ctx.fillText("give it something to control", width * 0.5, height * 0.55);
    if (frame > 60) {
      const ft = Math.min(1, (frame - 60) / 40);
      ctx.save();
      ctx.globalAlpha = fo * ft * 0.35;
      drawFlyOutline(ctx, width * 0.5, height * 0.75, 60 * s, 1);
      ctx.restore();
      ctx.globalAlpha = fo;
      drawNodeGradient(ctx, width * 0.5, height * 0.75, 5 * s * ft, 0, fo * ft);
    }
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

export const VARIANTS_SHOT_057: VariantDef[] = [
  { id: "shot_057_v1", label: "no body no world text", component: V1 },
  { id: "shot_057_v2", label: "brain empty plug", component: V2 },
  { id: "shot_057_v3", label: "phantom fly forming", component: V3 },
  { id: "shot_057_v4", label: "checklist brain body world", component: V4 },
  { id: "shot_057_v5", label: "dashed outline appearing", component: V5 },
  { id: "shot_057_v6", label: "missing pieces panels", component: V6 },
  { id: "shot_057_v7", label: "brain body world chain", component: V7 },
  { id: "shot_057_v8", label: "something to control", component: V8 },
  { id: "shot_057_v9", label: "to really know", component: V9 },
];
