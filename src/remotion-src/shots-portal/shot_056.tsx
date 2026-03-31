import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantDef, VariantProps } from "../types";
import {
  C, seeded, accent, easeOutBack, drawBg, fadeInOut, stagger, staggerRaw,
  drawNode, drawNodeGradient, drawNodeDormant, drawEdge, drawEdgeGlow, drawEdgeFaint,
  drawHeader, drawCounter, drawPerson, drawNeuronShape, drawFlyOutline, drawPanel,
  drawCheck, drawXMark, drawSignalPulse, drawBarChart, drawThresholdLine, lerp,
} from "./portal-kit";

// Shot 056 — "But right now it's a brain in a jar. It says 'eat' and there's no mouth. It says 'run' and there are no legs."
// DUR=150. Brain without body.

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
    drawHeader(ctx, width, height, s, frame, DUR, "Brain in a Jar", "no body connected");
    const cx = width * 0.35, cy = height * 0.5;
    const rng = seeded(561);
    for (let i = 0; i < 12; i++) {
      const nx = cx + (rng() - 0.5) * 60 * s, ny = cy + (rng() - 0.5) * 50 * s;
      drawNode(ctx, nx, ny, 4 * s, i, fo * 0.7);
      if (i > 0) drawEdge(ctx, cx, cy, nx, ny, i, fo * 0.15, s);
    }
    const arrows = [{x: 0.65, y: 0.35, label: "EAT"}, {x: 0.65, y: 0.55, label: "RUN"}, {x: 0.65, y: 0.75, label: "TURN"}];
    for (let i = 0; i < arrows.length; i++) {
      const t = stagger(frame, i, 15, 15);
      const ax = width * arrows[i].x, ay = height * arrows[i].y;
      drawEdge(ctx, cx + 30 * s, cy, ax - 20 * s, ay, 1, fo * t * 0.3, s);
      ctx.fillStyle = `rgba(200,200,210,${fo * t * 0.5})`;
      ctx.font = `${9 * s}px system-ui`; ctx.textAlign = "left";
      ctx.fillText(arrows[i].label, ax, ay + 4 * s);
      ctx.strokeStyle = `rgba(200,200,210,${fo * t * 0.4})`;
      ctx.setLineDash([3 * s, 3 * s]);
      ctx.beginPath(); ctx.moveTo(ax + 30 * s, ay); ctx.lineTo(ax + 60 * s, ay); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = C.textDim; ctx.font = `${7 * s}px system-ui`;
      ctx.fillText("→ nothing", ax + 62 * s, ay + 3 * s);
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
    drawHeader(ctx, width, height, s, frame, DUR, "Glass Jar", "isolated brain");
    const cx = width * 0.5, cy = height * 0.48;
    ctx.strokeStyle = `rgba(180,180,200,${fo * 0.4})`;
    ctx.lineWidth = 2 * s;
    ctx.beginPath();
    ctx.ellipse(cx, cy, 50 * s, 65 * s, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = `rgba(180,180,200,${fo * 0.25})`;
    ctx.beginPath();
    ctx.moveTo(cx - 35 * s, cy - 65 * s);
    ctx.lineTo(cx + 35 * s, cy - 65 * s);
    ctx.stroke();
    const rng = seeded(562);
    for (let i = 0; i < 10; i++) {
      const t = stagger(frame, i, 4, 12);
      const nx = cx + (rng() - 0.5) * 50 * s, ny = cy + (rng() - 0.5) * 40 * s;
      drawNode(ctx, nx, ny, 4 * s * t, i, fo * t);
    }
    ctx.fillStyle = C.textDim; ctx.font = `${9 * s}px system-ui`; ctx.textAlign = "center";
    ctx.fillText("no mouth, no legs", cx, cy + 80 * s);
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
    drawHeader(ctx, width, height, s, frame, DUR, "EAT / RUN", "commands to nowhere");
    const items = [
      { label: "EAT", sub: "no mouth", y: 0.38 },
      { label: "RUN", sub: "no legs", y: 0.58 },
    ];
    for (let i = 0; i < items.length; i++) {
      const t = stagger(frame, i, 20, 15);
      const iy = height * items[i].y;
      ctx.fillStyle = `rgba(255,140,0,${fo * t})`;
      ctx.font = `600 ${16 * s}px system-ui`; ctx.textAlign = "center";
      ctx.fillText(items[i].label, width * 0.35, iy);
      drawXMark(ctx, width * 0.55, iy - 4 * s, 16 * s * t, 1, fo * t);
      ctx.fillStyle = C.textDim; ctx.font = `${8 * s}px system-ui`;
      ctx.fillText(items[i].sub, width * 0.7, iy);
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
    drawHeader(ctx, width, height, s, frame, DUR, "Speech Bubbles", "no body to respond");
    const cx = width * 0.3, cy = height * 0.5;
    drawNodeGradient(ctx, cx, cy, 14 * s, 0, fo);
    ctx.fillStyle = C.textDim; ctx.font = `${7 * s}px system-ui`; ctx.textAlign = "center";
    ctx.fillText("brain", cx, cy + 22 * s);
    const bubbles = [{text: "eat!", x: 0.55, y: 0.32}, {text: "run!", x: 0.58, y: 0.52}, {text: "turn!", x: 0.55, y: 0.72}];
    for (let i = 0; i < bubbles.length; i++) {
      const t = stagger(frame, i, 18, 15);
      const bx = width * bubbles[i].x, by = height * bubbles[i].y;
      drawPanel(ctx, bx - 20 * s, by - 10 * s, 40 * s, 18 * s, 0, fo * t * 0.5);
      ctx.fillStyle = `rgba(58,58,74,${fo * t * 0.6})`;
      ctx.font = `${8 * s}px system-ui`; ctx.textAlign = "center";
      ctx.fillText(bubbles[i].text, bx, by + 4 * s);
      drawXMark(ctx, bx + 30 * s, by, 8 * s * t, 1, fo * t * 0.5);
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
    drawHeader(ctx, width, height, s, frame, DUR, "Disconnected", "cables to nowhere");
    const cx = width * 0.3, cy = height * 0.5;
    const rng = seeded(565);
    for (let i = 0; i < 8; i++) {
      const nx = cx + (rng() - 0.5) * 50 * s, ny = cy + (rng() - 0.5) * 40 * s;
      drawNode(ctx, nx, ny, 4 * s, i, fo);
    }
    const cables = [0.35, 0.5, 0.65];
    for (let i = 0; i < 3; i++) {
      const t = stagger(frame, i, 12, 15);
      const y = height * cables[i];
      ctx.strokeStyle = `rgba(180,180,200,${fo * t * 0.4})`;
      ctx.setLineDash([5 * s, 4 * s]);
      ctx.lineWidth = 2 * s; ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(cx + 30 * s, y);
      ctx.lineTo(width * 0.7, y);
      ctx.stroke();
      ctx.setLineDash([]);
      drawNodeDormant(ctx, width * 0.72, y, 6 * s, fo * t * 0.4);
    }
    ctx.fillStyle = C.textDim; ctx.font = `${8 * s}px system-ui`; ctx.textAlign = "center";
    ctx.fillText("disconnected", width * 0.72, height * 0.85);
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
    drawHeader(ctx, width, height, s, frame, DUR, "No Body", "brain alone");
    const cx = width * 0.5, cy = height * 0.45;
    drawNodeGradient(ctx, cx, cy, 16 * s, 0, fo);
    ctx.fillStyle = C.text; ctx.font = `${9 * s}px system-ui`; ctx.textAlign = "center";
    ctx.fillText("brain", cx, cy + 26 * s);
    const flyT = stagger(frame, 4, 15, 20);
    ctx.strokeStyle = `rgba(180,180,200,${fo * flyT * 0.25})`;
    ctx.setLineDash([4 * s, 3 * s]);
    ctx.lineWidth = 1.5 * s;
    ctx.beginPath();
    ctx.ellipse(cx, cy + 60 * s, 25 * s, 35 * s, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = C.textDim; ctx.font = `${7 * s}px system-ui`;
    ctx.fillText("body (missing)", cx, cy + 105 * s);
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
    drawHeader(ctx, width, height, s, frame, DUR, "Trapped Brain", "outputs going nowhere");
    drawPanel(ctx, width * 0.1, height * 0.25, width * 0.35, height * 0.5, 0, fo);
    const rng = seeded(567);
    for (let i = 0; i < 10; i++) {
      const nx = width * (0.15 + rng() * 0.25), ny = height * (0.3 + rng() * 0.4);
      drawNode(ctx, nx, ny, 3 * s, i, fo * 0.6);
    }
    drawPanel(ctx, width * 0.55, height * 0.25, width * 0.35, height * 0.5, 1, fo * 0.3);
    ctx.fillStyle = C.textDim; ctx.font = `${10 * s}px system-ui`; ctx.textAlign = "center";
    ctx.fillText("?", width * 0.725, height * 0.5);
    ctx.strokeStyle = `rgba(180,180,200,${fo * 0.3})`;
    ctx.setLineDash([4 * s, 3 * s]);
    ctx.beginPath(); ctx.moveTo(width * 0.45, height * 0.5); ctx.lineTo(width * 0.55, height * 0.5); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = C.textDim; ctx.font = `${7 * s}px system-ui`;
    ctx.fillText("brain", width * 0.275, height * 0.82);
    ctx.fillText("body?", width * 0.725, height * 0.82);
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
    drawHeader(ctx, width, height, s, frame, DUR, "No Mouth, No Legs", "brain output wasted");
    const items = [
      {cmd: "'eat'", miss: "no mouth", y: 0.35},
      {cmd: "'run'", miss: "no legs", y: 0.55},
      {cmd: "'groom'", miss: "no limbs", y: 0.75},
    ];
    for (let i = 0; i < items.length; i++) {
      const t = stagger(frame, i, 15, 15);
      const iy = height * items[i].y;
      drawNodeGradient(ctx, width * 0.2, iy, 7 * s * t, 0, fo * t);
      ctx.fillStyle = `rgba(58,58,74,${fo * t})`;
      ctx.font = `${9 * s}px system-ui`; ctx.textAlign = "left";
      ctx.fillText(items[i].cmd, width * 0.3, iy + 4 * s);
      ctx.strokeStyle = `rgba(200,200,210,${fo * t * 0.4})`;
      ctx.setLineDash([3 * s, 3 * s]);
      ctx.beginPath(); ctx.moveTo(width * 0.48, iy); ctx.lineTo(width * 0.62, iy); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = C.textDim;
      ctx.fillText(items[i].miss, width * 0.65, iy + 4 * s);
      drawXMark(ctx, width * 0.82, iy, 10 * s * t, 1, fo * t);
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
    drawHeader(ctx, width, height, s, frame, DUR, "Brain in a Jar", "needs a body");
    const cx = width * 0.5, cy = height * 0.45;
    ctx.strokeStyle = `rgba(180,180,200,${fo * 0.35})`;
    ctx.lineWidth = 1.5 * s;
    ctx.beginPath();
    ctx.moveTo(cx - 30 * s, cy - 50 * s);
    ctx.quadraticCurveTo(cx - 45 * s, cy, cx - 30 * s, cy + 50 * s);
    ctx.lineTo(cx + 30 * s, cy + 50 * s);
    ctx.quadraticCurveTo(cx + 45 * s, cy, cx + 30 * s, cy - 50 * s);
    ctx.lineTo(cx - 30 * s, cy - 50 * s);
    ctx.stroke();
    const rng = seeded(569);
    for (let i = 0; i < 8; i++) {
      const t = stagger(frame, i, 4, 12);
      const nx = cx + (rng() - 0.5) * 40 * s, ny = cy + (rng() - 0.5) * 60 * s;
      drawNode(ctx, nx, ny, 4 * s * t, i, fo * t);
    }
    ctx.fillStyle = C.textDim; ctx.font = `${8 * s}px system-ui`; ctx.textAlign = "center";
    ctx.fillText("no body to control", cx, cy + 70 * s);
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

export const VARIANTS_SHOT_056: VariantDef[] = [
  { id: "shot_056_v1", label: "edges to void", component: V1 },
  { id: "shot_056_v2", label: "glass jar outline", component: V2 },
  { id: "shot_056_v3", label: "EAT RUN with X", component: V3 },
  { id: "shot_056_v4", label: "speech bubbles no body", component: V4 },
  { id: "shot_056_v5", label: "disconnected cables", component: V5 },
  { id: "shot_056_v6", label: "no body dashed", component: V6 },
  { id: "shot_056_v7", label: "trapped brain panel", component: V7 },
  { id: "shot_056_v8", label: "no mouth no legs", component: V8 },
  { id: "shot_056_v9", label: "jar outline nodes", component: V9 },
];
