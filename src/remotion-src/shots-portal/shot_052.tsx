import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantDef, VariantProps } from "../types";
import {
  C, seeded, accent, easeOutBack, drawBg, fadeInOut, stagger, staggerRaw,
  drawNode, drawNodeGradient, drawNodeDormant, drawEdge, drawEdgeGlow, drawEdgeFaint,
  drawHeader, drawCounter, drawPerson, drawNeuronShape, drawFlyOutline, drawPanel,
  drawCheck, drawXMark, drawSignalPulse, drawBarChart, drawThresholdLine, lerp,
} from "./portal-kit";

// Shot 052 — "A shadow rushing toward it — the escape circuit fired."
// DUR=90. Looming shadow → escape.

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
    drawHeader(ctx, width, height, s, frame, DUR, "Looming Shadow", "expanding threat");
    const cx = width * 0.5, cy = height * 0.48;
    const r = lerp(5, 100, Math.min(1, frame / 50)) * s;
    ctx.fillStyle = `rgba(40,40,55,${fo * 0.3})`;
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = `rgba(40,40,55,${fo * 0.6})`;
    ctx.beginPath(); ctx.arc(cx, cy, r * 0.3, 0, Math.PI * 2); ctx.fill();
    if (frame > 40) {
      const t = Math.min(1, (frame - 40) / 20);
      ctx.fillStyle = `rgba(224,80,80,${fo * t})`;
      ctx.font = `600 ${14 * s}px system-ui`; ctx.textAlign = "center";
      ctx.fillText("ESCAPE", cx, cy + r + 20 * s);
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
    drawHeader(ctx, width, height, s, frame, DUR, "LC4 → GF → Escape", "neural pathway");
    const chain = [
      { x: 0.2, y: 0.5, label: "LC4" },
      { x: 0.5, y: 0.5, label: "Giant Fiber" },
      { x: 0.8, y: 0.5, label: "ESCAPE" },
    ];
    for (let i = 0; i < chain.length; i++) {
      const t = stagger(frame, i, 12, 12);
      const cx = width * chain[i].x, cy = height * chain[i].y;
      drawNodeGradient(ctx, cx, cy, (i === 1 ? 12 : 8) * s * t, i === 2 ? 1 : 0, fo * t);
      ctx.fillStyle = C.text; ctx.font = `${8 * s}px system-ui`; ctx.textAlign = "center";
      ctx.fillText(chain[i].label, cx, cy + 20 * s);
      if (i > 0) drawEdgeGlow(ctx, width * chain[i - 1].x, cy, cx, cy, 0, fo * t * 0.5, s);
    }
    if (frame > 40) {
      const pt = ((frame - 40) % 25) / 25;
      drawSignalPulse(ctx, width * 0.2, height * 0.5, width * 0.8, height * 0.5, pt, 0, s);
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
    drawHeader(ctx, width, height, s, frame, DUR, "Spike Raster", "GF burst");
    const rng = seeded(523);
    const rows = 6;
    for (let r = 0; r < rows; r++) {
      const isGF = r === 4;
      const ny = height * (0.25 + r * 0.1);
      if (isGF) {
        ctx.fillStyle = accent(0, fo * 0.06);
        ctx.fillRect(width * 0.1, ny - 4 * s, width * 0.8, 8 * s);
      }
      for (let t = 0; t < 25; t++) {
        const nx = width * (0.12 + t * 0.032);
        if (nx / width < frame / DUR) {
          const fires = isGF ? rng() > 0.1 : rng() > 0.7;
          if (fires) {
            ctx.fillStyle = isGF ? C.blue : C.grayDark;
            ctx.fillRect(nx, ny - 3 * s, 1.5 * s, 6 * s);
          }
        }
      }
      ctx.fillStyle = isGF ? C.blue : C.textDim;
      ctx.font = `${7 * s}px monospace`; ctx.textAlign = "right";
      ctx.fillText(isGF ? "GF" : `n${r}`, width * 0.08, ny + 3 * s);
    }
    ctx.fillStyle = C.text; ctx.font = `${8 * s}px system-ui`; ctx.textAlign = "center";
    ctx.fillText("86 Hz — escape firing", width * 0.5, height * 0.9);
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
    drawHeader(ctx, width, height, s, frame, DUR, "Fly Flees", "motion escape");
    drawFlyOutline(ctx, width * 0.35, height * 0.5, 70 * s, fo);
    if (frame > 25) {
      const t = Math.min(1, (frame - 25) / 20);
      for (let i = 0; i < 4; i++) {
        const lx = width * 0.55 + i * 12 * s * t;
        ctx.strokeStyle = accent(0, fo * t * (1 - i * 0.2));
        ctx.lineWidth = 2 * s; ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(lx, height * 0.42); ctx.lineTo(lx + 8 * s, height * 0.42);
        ctx.moveTo(lx, height * 0.5); ctx.lineTo(lx + 10 * s, height * 0.5);
        ctx.moveTo(lx, height * 0.58); ctx.lineTo(lx + 8 * s, height * 0.58);
        ctx.stroke();
      }
    }
    ctx.fillStyle = C.red; ctx.font = `600 ${12 * s}px system-ui`; ctx.textAlign = "center";
    ctx.fillText("ESCAPE", width * 0.75, height * 0.82);
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
    drawHeader(ctx, width, height, s, frame, DUR, "Shadow → Escape", "split view");
    ctx.strokeStyle = `rgba(180,180,200,${fo * 0.3})`;
    ctx.setLineDash([4 * s, 3 * s]);
    ctx.beginPath(); ctx.moveTo(width * 0.5, height * 0.2); ctx.lineTo(width * 0.5, height * 0.85); ctx.stroke();
    ctx.setLineDash([]);
    const shadowR = lerp(8, 50, Math.min(1, frame / 40)) * s;
    ctx.fillStyle = `rgba(40,40,55,${fo * 0.4})`;
    ctx.beginPath(); ctx.arc(width * 0.25, height * 0.5, shadowR, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = C.textDim; ctx.font = `${8 * s}px system-ui`; ctx.textAlign = "center";
    ctx.fillText("shadow", width * 0.25, height * 0.78);
    if (frame > 30) {
      const t = Math.min(1, (frame - 30) / 20);
      drawNodeGradient(ctx, width * 0.75, height * 0.45, 10 * s * t, 0, fo * t);
      ctx.fillStyle = C.blue; ctx.font = `600 ${10 * s}px system-ui`;
      ctx.fillText("ESCAPE", width * 0.75, height * 0.6);
      drawFlyOutline(ctx, width * 0.75, height * 0.45, 40 * s * t, fo * t);
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
    drawHeader(ctx, width, height, s, frame, DUR, "Threat Detection", "visual looming");
    const rings = 5;
    const cx = width * 0.4, cy = height * 0.5;
    for (let i = 0; i < rings; i++) {
      const r = lerp(10, 30 + i * 15, Math.min(1, frame / (30 + i * 8))) * s;
      ctx.strokeStyle = `rgba(40,40,55,${fo * (0.3 - i * 0.05)})`;
      ctx.lineWidth = 2 * s;
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
    }
    if (frame > 35) {
      const t = Math.min(1, (frame - 35) / 20);
      drawEdgeGlow(ctx, cx, cy, width * 0.75, cy, 0, fo * t * 0.5, s);
      drawNodeGradient(ctx, width * 0.75, cy, 10 * s * t, 0, fo * t);
      ctx.fillStyle = C.text; ctx.font = `600 ${9 * s}px system-ui`; ctx.textAlign = "center";
      ctx.fillText("GF fires", width * 0.75, cy + 20 * s);
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
    drawHeader(ctx, width, height, s, frame, DUR, "Escape Circuit", "fastest reflex");
    drawPanel(ctx, width * 0.1, height * 0.25, width * 0.8, height * 0.5, 0, fo);
    const steps = ["LC4", "LPLC2", "GF", "motor", "ESCAPE"];
    for (let i = 0; i < steps.length; i++) {
      const t = stagger(frame, i, 8, 10);
      const sx = width * (0.18 + i * 0.15), sy = height * 0.5;
      drawNode(ctx, sx, sy, 5 * s * t, i, fo * t);
      ctx.fillStyle = C.text; ctx.font = `${7 * s}px system-ui`; ctx.textAlign = "center";
      ctx.fillText(steps[i], sx, sy + 14 * s);
      if (i > 0) drawEdge(ctx, sx - width * 0.15, sy, sx, sy, i, fo * t * 0.4, s);
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
    drawHeader(ctx, width, height, s, frame, DUR, "Giant Fiber", "86 Hz burst");
    const cx = width * 0.5, cy = height * 0.45;
    const pulse = 0.85 + Math.sin(frame * 0.2) * 0.15;
    drawNodeGradient(ctx, cx, cy, 18 * s * pulse, 0, fo);
    ctx.fillStyle = C.text; ctx.font = `600 ${18 * s}px system-ui`; ctx.textAlign = "center";
    const hz = Math.min(86, Math.floor(frame * 1.2));
    ctx.fillText(`${hz} Hz`, cx, cy + 35 * s);
    ctx.fillStyle = C.textDim; ctx.font = `${8 * s}px system-ui`;
    ctx.fillText("Giant Fiber neuron", cx, cy + 48 * s);
    for (let i = 0; i < 5; i++) {
      const ang = (i / 5) * Math.PI * 2 + frame * 0.04;
      const rx = cx + Math.cos(ang) * 50 * s;
      const ry = cy + Math.sin(ang) * 40 * s;
      drawEdge(ctx, cx, cy, rx, ry, 0, fo * 0.15, s);
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
    drawHeader(ctx, width, height, s, frame, DUR, "Shadow Rush", "looming detector");
    const cx = width * 0.5, cy = height * 0.45;
    const loopR = lerp(3, 80, Math.min(1, frame / 60)) * s;
    for (let i = 3; i >= 0; i--) {
      const r = loopR * (1 - i * 0.2);
      if (r > 0) {
        ctx.fillStyle = `rgba(40,40,55,${fo * (0.15 + i * 0.05)})`;
        ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
      }
    }
    if (frame > 45) {
      const t = Math.min(1, (frame - 45) / 15);
      ctx.fillStyle = `rgba(64,144,255,${fo * t})`;
      ctx.font = `600 ${14 * s}px system-ui`; ctx.textAlign = "center";
      ctx.fillText("ESCAPE", cx, height * 0.85);
      drawNode(ctx, cx, height * 0.78, 5 * s * t, 0, fo * t);
    }
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

export const VARIANTS_SHOT_052: VariantDef[] = [
  { id: "shot_052_v1", label: "expanding shadow", component: V1 },
  { id: "shot_052_v2", label: "LC4 GF chain", component: V2 },
  { id: "shot_052_v3", label: "spike raster GF", component: V3 },
  { id: "shot_052_v4", label: "fly fleeing", component: V4 },
  { id: "shot_052_v5", label: "split shadow escape", component: V5 },
  { id: "shot_052_v6", label: "threat detection rings", component: V6 },
  { id: "shot_052_v7", label: "escape circuit panel", component: V7 },
  { id: "shot_052_v8", label: "giant fiber Hz", component: V8 },
  { id: "shot_052_v9", label: "shadow rush loom", component: V9 },
];
