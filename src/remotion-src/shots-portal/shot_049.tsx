import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantDef, VariantProps } from "../types";
import {
  C, seeded, accent, easeOutBack, drawBg, fadeInOut, stagger, staggerRaw,
  drawNode, drawNodeGradient, drawNodeDormant, drawEdge, drawEdgeGlow, drawEdgeFaint,
  drawHeader, drawCounter, drawPerson, drawNeuronShape, drawFlyOutline, drawPanel,
  drawCheck, drawXMark, drawSignalPulse, drawBarChart, drawThresholdLine, lerp,
} from "./portal-kit";

// Shot 049 — "The brain wants to eat."
// DUR=90. Feeding behavior.

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
    drawHeader(ctx, width, height, s, frame, DUR, "Wants to Eat", "feeding behavior");
    drawFlyOutline(ctx, width * 0.35, height * 0.52, 80 * s, fo);
    const ext = Math.min(1, Math.max(0, (frame - 20) / 20));
    ctx.strokeStyle = accent(1, fo * ext);
    ctx.lineWidth = 2 * s; ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(width * 0.35, height * 0.52 - 30 * s);
    ctx.lineTo(width * 0.35 + 25 * s * ext, height * 0.52 - 35 * s);
    ctx.stroke();
    ctx.fillStyle = C.text; ctx.font = `600 ${14 * s}px system-ui`; ctx.textAlign = "center";
    ctx.fillText("EAT", width * 0.7, height * 0.52);
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
    drawHeader(ctx, width, height, s, frame, DUR, "EAT", "brain output");
    const t = Math.min(1, frame / 30);
    ctx.fillStyle = `rgba(255,140,0,${fo * t})`;
    ctx.font = `700 ${48 * s}px system-ui`; ctx.textAlign = "center";
    ctx.fillText("EAT", width * 0.5, height * 0.55);
    const pulse = Math.sin(frame * 0.12) * 0.1 + 0.9;
    drawNodeGradient(ctx, width * 0.5, height * 0.72, 8 * s * pulse, 1, fo * t);
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
    drawHeader(ctx, width, height, s, frame, DUR, "Brain → Food", "motor command");
    const nodes = [
      { x: 0.2, y: 0.5, label: "brain" }, { x: 0.45, y: 0.5, label: "MN9" }, { x: 0.7, y: 0.5, label: "food" },
    ];
    for (let i = 0; i < nodes.length; i++) {
      const t = stagger(frame, i, 10, 12);
      drawNodeGradient(ctx, width * nodes[i].x, height * nodes[i].y, 10 * s * t, i, fo * t);
      ctx.fillStyle = C.text; ctx.font = `${9 * s}px system-ui`; ctx.textAlign = "center";
      ctx.fillText(nodes[i].label, width * nodes[i].x, height * nodes[i].y + 20 * s);
      if (i > 0) drawEdgeGlow(ctx, width * nodes[i - 1].x, height * 0.5, width * nodes[i].x, height * 0.5, i, fo * t * 0.5, s);
    }
    if (frame > 30) {
      const pt = ((frame - 30) % 30) / 30;
      drawSignalPulse(ctx, width * 0.2, height * 0.5, width * 0.7, height * 0.5, pt, 1, s);
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
    drawHeader(ctx, width, height, s, frame, DUR, "FEED Bar", "behavior output");
    const labels = ["IDLE", "WALK", "FEED", "ESC", "GROOM", "TURN"];
    const vals = [0.1, 0.15, 0.9, 0.05, 0.08, 0.12];
    const barT = Math.min(1, frame / 40);
    drawBarChart(ctx, width * 0.15, height * 0.25, width * 0.7, height * 0.4, vals.map(v => v * barT), 1, s);
    for (let i = 0; i < labels.length; i++) {
      ctx.fillStyle = i === 2 ? C.orange : C.textDim;
      ctx.font = `${7 * s}px system-ui`; ctx.textAlign = "center";
      ctx.fillText(labels[i], width * 0.15 + (i + 0.35) * (width * 0.7 / 6), height * 0.72);
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
    drawHeader(ctx, width, height, s, frame, DUR, "Behavior Label", "FEED active");
    drawPanel(ctx, width * 0.2, height * 0.35, width * 0.6, height * 0.3, 1, fo);
    const t = Math.min(1, frame / 25);
    ctx.fillStyle = `rgba(255,140,0,${fo * t})`;
    ctx.font = `700 ${28 * s}px system-ui`; ctx.textAlign = "center";
    ctx.fillText("FEED", width * 0.5, height * 0.55);
    const pulse = 0.85 + Math.sin(frame * 0.15) * 0.15;
    drawNodeGradient(ctx, width * 0.5, height * 0.72, 6 * s * pulse, 1, fo * t);
    ctx.fillStyle = C.textDim; ctx.font = `${8 * s}px system-ui`;
    ctx.fillText("proboscis extension", width * 0.5, height * 0.8);
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
    drawHeader(ctx, width, height, s, frame, DUR, "Drive", "hunger signal");
    const cx = width * 0.5, cy = height * 0.48;
    const rings = 4;
    for (let i = rings - 1; i >= 0; i--) {
      const r = (i + 1) * 18 * s;
      ctx.fillStyle = accent(1, fo * 0.04 * (rings - i));
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
    }
    drawNodeGradient(ctx, cx, cy, 10 * s, 1, fo);
    ctx.fillStyle = C.orange; ctx.font = `600 ${12 * s}px system-ui`; ctx.textAlign = "center";
    ctx.fillText("EAT", cx, cy + 30 * s);
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
    drawHeader(ctx, width, height, s, frame, DUR, "Feeding Fly", "proboscis");
    drawFlyOutline(ctx, width * 0.5, height * 0.5, 90 * s, fo);
    if (frame > 20) {
      const ext = Math.min(1, (frame - 20) / 20);
      ctx.strokeStyle = accent(1, fo * 0.7);
      ctx.lineWidth = 2.5 * s; ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(width * 0.5, height * 0.5 - 25 * s);
      ctx.quadraticCurveTo(width * 0.5 + 15 * s * ext, height * 0.5 - 40 * s, width * 0.5 + 25 * s * ext, height * 0.5 - 45 * s * ext);
      ctx.stroke();
      drawNode(ctx, width * 0.5 + 25 * s * ext, height * 0.5 - 45 * s * ext, 3 * s, 1, fo * ext);
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
    const DUR = 90;
    drawBg(ctx, width, height, s);
    const fo = fadeInOut(frame, DUR);
    ctx.globalAlpha = fo;
    drawHeader(ctx, width, height, s, frame, DUR, "Motor Output", "descending command");
    drawNeuronShape(ctx, width * 0.4, height * 0.5, 60 * s, fo, frame);
    const t = stagger(frame, 4, 8, 12);
    ctx.fillStyle = `rgba(255,140,0,${fo * t})`;
    ctx.font = `600 ${16 * s}px system-ui`; ctx.textAlign = "left";
    ctx.fillText("EAT", width * 0.72, height * 0.52);
    drawEdgeGlow(ctx, width * 0.55, height * 0.5, width * 0.7, height * 0.5, 1, fo * t * 0.5, s);
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
    drawHeader(ctx, width, height, s, frame, DUR, "The Brain Wants", "to eat");
    const cx = width * 0.5, cy = height * 0.45;
    const pulse = 0.9 + Math.sin(frame * 0.1) * 0.1;
    drawNodeGradient(ctx, cx, cy, 22 * s * pulse, 1, fo);
    const t = stagger(frame, 3, 8, 15);
    ctx.fillStyle = `rgba(255,140,0,${fo * t})`;
    ctx.font = `700 ${20 * s}px system-ui`; ctx.textAlign = "center";
    ctx.fillText("EAT", cx, cy + 42 * s);
    for (let i = 0; i < 6; i++) {
      const ang = (i / 6) * Math.PI * 2 + frame * 0.02;
      const rx = cx + Math.cos(ang) * 50 * s;
      const ry = cy + Math.sin(ang) * 50 * s;
      drawEdge(ctx, cx, cy, rx, ry, 1, fo * 0.15, s);
      drawNode(ctx, rx, ry, 3 * s, 1, fo * 0.4);
    }
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

export const VARIANTS_SHOT_049: VariantDef[] = [
  { id: "shot_049_v1", label: "fly proboscis", component: V1 },
  { id: "shot_049_v2", label: "big EAT text", component: V2 },
  { id: "shot_049_v3", label: "brain food chain", component: V3 },
  { id: "shot_049_v4", label: "FEED bar chart", component: V4 },
  { id: "shot_049_v5", label: "behavior label", component: V5 },
  { id: "shot_049_v6", label: "hunger drive rings", component: V6 },
  { id: "shot_049_v7", label: "feeding fly", component: V7 },
  { id: "shot_049_v8", label: "motor output", component: V8 },
  { id: "shot_049_v9", label: "brain wants eat", component: V9 },
];
