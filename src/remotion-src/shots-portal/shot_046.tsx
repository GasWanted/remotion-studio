import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantDef, VariantProps } from "../types";
import {
  C, seeded, accent, easeOutBack, drawBg, fadeInOut, stagger, staggerRaw,
  drawNode, drawNodeGradient, drawNodeDormant, drawEdge, drawEdgeGlow, drawEdgeFaint,
  drawHeader, drawCounter, drawPerson, drawNeuronShape, drawFlyOutline, drawPanel,
  drawCheck, drawXMark, drawSignalPulse, drawBarChart, drawThresholdLine, lerp,
} from "./portal-kit";

// Shot 046 — "The same cells that fire when a fly's tongue touches something sweet."
// DUR=120. Fly tasting sugar.

const V1: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const DUR = 120;
    drawBg(ctx, width, height, s);
    const fo = fadeInOut(frame, DUR);
    ctx.globalAlpha = fo;
    drawHeader(ctx, width, height, s, frame, DUR, "Sugar Detection", "tongue → signal");
    const flyX = lerp(width * 0.25, width * 0.42, Math.min(1, frame / 60));
    drawFlyOutline(ctx, flyX, height * 0.55, 80 * s, fo);
    const sugarX = width * 0.65, sugarY = height * 0.55;
    ctx.fillStyle = `rgba(255,140,0,${fo * 0.25})`;
    ctx.beginPath(); ctx.arc(sugarX, sugarY, 18 * s, 0, Math.PI * 2); ctx.fill();
    drawNodeGradient(ctx, sugarX, sugarY, 12 * s, 1, fo);
    ctx.fillStyle = C.text; ctx.font = `${9 * s}px system-ui, sans-serif`; ctx.textAlign = "center";
    ctx.fillText("sugar", sugarX, sugarY + 22 * s);
    if (frame > 40) {
      const t = Math.min(1, (frame - 40) / 30);
      drawEdgeGlow(ctx, flyX + 30 * s, height * 0.5, sugarX - 14 * s, sugarY, 1, t * 0.6, s);
      drawSignalPulse(ctx, sugarX, sugarY, flyX + 30 * s, height * 0.5, 1 - t, 1, s);
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
    const DUR = 120;
    drawBg(ctx, width, height, s);
    const fo = fadeInOut(frame, DUR);
    ctx.globalAlpha = fo;
    drawHeader(ctx, width, height, s, frame, DUR, "Sweet Receptors", "GRN activation");
    drawFlyOutline(ctx, width * 0.3, height * 0.5, 90 * s, fo);
    const spark = Math.sin(frame * 0.15) * 0.3 + 0.7;
    if (frame > 25) {
      const cx = width * 0.3, cy = height * 0.5 - 30 * s;
      drawNodeGradient(ctx, cx, cy, 6 * s * spark, 1, fo * Math.min(1, (frame - 25) / 15));
      ctx.fillStyle = C.textDim; ctx.font = `${8 * s}px system-ui`; ctx.textAlign = "center";
      ctx.fillText("GRN fires", cx, cy + 14 * s);
    }
    for (let i = 0; i < 5; i++) {
      const t = stagger(frame, i, 8, 15);
      const nx = width * 0.55 + i * 18 * s, ny = height * 0.45 + (i % 2) * 20 * s;
      drawNode(ctx, nx, ny, 5 * s * t, i, fo * t);
      if (i > 0) drawEdge(ctx, nx - 18 * s, height * 0.45 + ((i - 1) % 2) * 20 * s, nx, ny, i, fo * t * 0.4, s);
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
    const DUR = 120;
    drawBg(ctx, width, height, s);
    const fo = fadeInOut(frame, DUR);
    ctx.globalAlpha = fo;
    drawHeader(ctx, width, height, s, frame, DUR, "Tongue Contact", "sweet molecule binds");
    const sugarR = lerp(0, 20 * s, Math.min(1, frame / 40));
    drawNodeGradient(ctx, width * 0.5, height * 0.4, sugarR, 1, fo);
    ctx.fillStyle = C.text; ctx.font = `600 ${11 * s}px system-ui`; ctx.textAlign = "center";
    ctx.fillText("SWEET", width * 0.5, height * 0.4 + 30 * s);
    if (frame > 30) {
      const rays = 8;
      for (let i = 0; i < rays; i++) {
        const ang = (i / rays) * Math.PI * 2 + frame * 0.02;
        const t = Math.min(1, (frame - 30) / 30);
        const ex = width * 0.5 + Math.cos(ang) * 60 * s * t;
        const ey = height * 0.4 + Math.sin(ang) * 60 * s * t;
        drawEdgeGlow(ctx, width * 0.5, height * 0.4, ex, ey, i, fo * t * 0.5, s);
        drawNode(ctx, ex, ey, 4 * s * t, i, fo * t);
      }
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
    const DUR = 120;
    drawBg(ctx, width, height, s);
    const fo = fadeInOut(frame, DUR);
    ctx.globalAlpha = fo;
    drawHeader(ctx, width, height, s, frame, DUR, "Taste → Signal", "sensory transduction");
    drawFlyOutline(ctx, width * 0.22, height * 0.55, 70 * s, fo);
    const chain = [{x: 0.38, y: 0.5}, {x: 0.5, y: 0.45}, {x: 0.62, y: 0.5}, {x: 0.74, y: 0.45}];
    for (let i = 0; i < chain.length; i++) {
      const t = stagger(frame, i, 12, 12);
      const cx = width * chain[i].x, cy = height * chain[i].y;
      drawNode(ctx, cx, cy, 6 * s * t, i, fo * t);
      if (i > 0) {
        const px = width * chain[i - 1].x, py = height * chain[i - 1].y;
        drawEdgeGlow(ctx, px, py, cx, cy, i, fo * t * 0.5, s);
      }
    }
    if (frame > 50) {
      const pt = Math.min(1, (frame - 50) / 25);
      drawSignalPulse(ctx, width * chain[0].x, height * chain[0].y, width * chain[3].x, height * chain[3].y, pt, 1, s);
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
    const DUR = 120;
    drawBg(ctx, width, height, s);
    const fo = fadeInOut(frame, DUR);
    ctx.globalAlpha = fo;
    drawHeader(ctx, width, height, s, frame, DUR, "Real Cells Fire", "biological fidelity");
    drawNeuronShape(ctx, width * 0.5, height * 0.5, 80 * s, fo, frame);
    const pulse = 0.8 + Math.sin(frame * 0.12) * 0.2;
    ctx.fillStyle = accent(1, fo * 0.3);
    ctx.beginPath(); ctx.arc(width * 0.25, height * 0.5, 15 * s * pulse, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = C.text; ctx.font = `${9 * s}px system-ui`; ctx.textAlign = "center";
    ctx.fillText("sugar input", width * 0.25, height * 0.5 + 24 * s);
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
    const DUR = 120;
    drawBg(ctx, width, height, s);
    const fo = fadeInOut(frame, DUR);
    ctx.globalAlpha = fo;
    drawHeader(ctx, width, height, s, frame, DUR, "Fly Tastes Sugar", "proboscis extension");
    const flyX = width * 0.35, flyY = height * 0.52;
    drawFlyOutline(ctx, flyX, flyY, 85 * s, fo);
    const sugarX = width * 0.68, sugarY = height * 0.52;
    ctx.fillStyle = `rgba(255,140,0,${fo * 0.15})`;
    ctx.beginPath(); ctx.arc(sugarX, sugarY, 22 * s, 0, Math.PI * 2); ctx.fill();
    drawNodeGradient(ctx, sugarX, sugarY, 10 * s, 1, fo);
    if (frame > 35) {
      const t = Math.min(1, (frame - 35) / 20);
      ctx.strokeStyle = accent(1, fo * t * 0.6);
      ctx.lineWidth = 2 * s;
      ctx.beginPath();
      ctx.moveTo(flyX + 10 * s, flyY - 30 * s);
      ctx.lineTo(lerp(flyX + 10 * s, sugarX - 22 * s, t), flyY - 30 * s);
      ctx.stroke();
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
    const DUR = 120;
    drawBg(ctx, width, height, s);
    const fo = fadeInOut(frame, DUR);
    ctx.globalAlpha = fo;
    drawHeader(ctx, width, height, s, frame, DUR, "Signal Spark", "gustatory receptor neuron");
    const cx = width * 0.5, cy = height * 0.48;
    const rng = seeded(46);
    for (let i = 0; i < 12; i++) {
      const ang = rng() * Math.PI * 2;
      const dist = 30 * s + rng() * 50 * s;
      const t = stagger(frame, i, 4, 12);
      const nx = cx + Math.cos(ang) * dist * t;
      const ny = cy + Math.sin(ang) * dist * t;
      drawNode(ctx, nx, ny, 4 * s * t, i, fo * t);
      drawEdge(ctx, cx, cy, nx, ny, i, fo * t * 0.3, s);
    }
    drawNodeGradient(ctx, cx, cy, 10 * s, 1, fo);
    ctx.fillStyle = C.text; ctx.font = `${8 * s}px system-ui`; ctx.textAlign = "center";
    ctx.fillText("GRN spike", cx, cy + 20 * s);
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
    const DUR = 120;
    drawBg(ctx, width, height, s);
    const fo = fadeInOut(frame, DUR);
    ctx.globalAlpha = fo;
    drawHeader(ctx, width, height, s, frame, DUR, "Split View", "fly → neural");
    ctx.strokeStyle = `rgba(180,180,200,${fo * 0.3})`;
    ctx.setLineDash([4 * s, 3 * s]);
    ctx.beginPath(); ctx.moveTo(width * 0.5, height * 0.2); ctx.lineTo(width * 0.5, height * 0.9); ctx.stroke();
    ctx.setLineDash([]);
    const flyT = stagger(frame, 0, 0, 20);
    drawFlyOutline(ctx, width * 0.25, height * 0.55, 70 * s * flyT, fo * flyT);
    const rng = seeded(468);
    for (let i = 0; i < 8; i++) {
      const t = stagger(frame, i, 6, 12);
      const nx = width * 0.6 + rng() * width * 0.3;
      const ny = height * 0.3 + rng() * height * 0.45;
      drawNode(ctx, nx, ny, 5 * s * t, i, fo * t);
    }
    ctx.fillStyle = C.textDim; ctx.font = `${8 * s}px system-ui`; ctx.textAlign = "center";
    ctx.fillText("biology", width * 0.25, height * 0.88);
    ctx.fillText("model", width * 0.75, height * 0.88);
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
    const DUR = 120;
    drawBg(ctx, width, height, s);
    const fo = fadeInOut(frame, DUR);
    ctx.globalAlpha = fo;
    drawHeader(ctx, width, height, s, frame, DUR, "Same Cells", "conserved circuit");
    const flyT = Math.min(1, frame / 30);
    drawFlyOutline(ctx, width * 0.3, height * 0.48, 75 * s * flyT, fo * flyT);
    const sugarT = stagger(frame, 3, 5, 15);
    drawNodeGradient(ctx, width * 0.62, height * 0.42, 14 * s * sugarT, 1, fo * sugarT);
    ctx.fillStyle = C.text; ctx.font = `600 ${10 * s}px system-ui`; ctx.textAlign = "center";
    ctx.fillText("sweet", width * 0.62, height * 0.42 + 24 * s);
    if (frame > 50) {
      const at = Math.min(1, (frame - 50) / 30);
      drawEdgeGlow(ctx, width * 0.42, height * 0.48, width * 0.55, height * 0.42, 1, fo * at * 0.6, s);
      const sparkR = 3 * s * (0.5 + Math.sin(frame * 0.2) * 0.5);
      drawNode(ctx, width * 0.48, height * 0.45, sparkR, 1, fo * at);
    }
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

export const VARIANTS_SHOT_046: VariantDef[] = [
  { id: "shot_046_v1", label: "fly approach sugar", component: V1 },
  { id: "shot_046_v2", label: "GRN activation chain", component: V2 },
  { id: "shot_046_v3", label: "sweet molecule burst", component: V3 },
  { id: "shot_046_v4", label: "taste signal chain", component: V4 },
  { id: "shot_046_v5", label: "neuron shape sugar", component: V5 },
  { id: "shot_046_v6", label: "proboscis extension", component: V6 },
  { id: "shot_046_v7", label: "signal spark GRN", component: V7 },
  { id: "shot_046_v8", label: "split fly neural", component: V8 },
  { id: "shot_046_v9", label: "same cells conserved", component: V9 },
];
