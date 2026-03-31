import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantDef, VariantProps } from "../types";
import {
  C, seeded, accent, easeOutBack, drawBg, fadeInOut, stagger, staggerRaw,
  drawNode, drawNodeGradient, drawNodeDormant, drawEdge, drawEdgeGlow, drawEdgeFaint,
  drawHeader, drawCounter, drawPerson, drawNeuronShape, drawFlyOutline, drawPanel,
  drawCheck, drawXMark, drawSignalPulse, drawBarChart, drawThresholdLine, lerp,
} from "./portal-kit";

// Shot 048 — "And on the other side, one specific neuron — the one that controls feeding in a real fly — starts firing."
// DUR=120. One output node lights up (MN9 = FEED).

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
    drawHeader(ctx, width, height, s, frame, DUR, "One Neuron Fires", "MN9 — feeding motor");
    const rng = seeded(481);
    for (let i = 0; i < 30; i++) {
      const nx = width * (0.08 + rng() * 0.6), ny = height * (0.2 + rng() * 0.65);
      drawNodeDormant(ctx, nx, ny, 5 * s, fo * 0.5);
    }
    const outX = width * 0.82, outY = height * 0.5;
    const pulse = 0.85 + Math.sin(frame * 0.15) * 0.15;
    const t = Math.min(1, frame / 40);
    drawNodeGradient(ctx, outX, outY, 14 * s * pulse * t, 1, fo);
    ctx.fillStyle = C.orange; ctx.font = `600 ${11 * s}px system-ui`; ctx.textAlign = "center";
    ctx.fillText("FEED", outX, outY + 24 * s);
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
    drawHeader(ctx, width, height, s, frame, DUR, "Spike Raster", "MN9 highlighted");
    const rng = seeded(482);
    const rows = 8;
    for (let r = 0; r < rows; r++) {
      const isMN9 = r === 6;
      const ny = height * (0.2 + r * 0.085);
      if (isMN9) {
        ctx.fillStyle = accent(1, fo * 0.06);
        ctx.fillRect(width * 0.1, ny - 4 * s, width * 0.8, 8 * s);
      }
      for (let t = 0; t < 20; t++) {
        const nx = width * (0.12 + t * 0.038);
        if (nx / width < frame / DUR) {
          const fires = isMN9 ? rng() > 0.2 : rng() > 0.6;
          if (fires) {
            ctx.fillStyle = isMN9 ? C.orange : C.grayDark;
            ctx.fillRect(nx, ny - 3 * s, 1.5 * s, 6 * s);
          }
        }
      }
      ctx.fillStyle = isMN9 ? C.orange : C.textDim;
      ctx.font = `${7 * s}px monospace`; ctx.textAlign = "right";
      ctx.fillText(isMN9 ? "MN9" : `n${r}`, width * 0.08, ny + 3 * s);
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
    drawHeader(ctx, width, height, s, frame, DUR, "Spotlight", "the feeding neuron");
    const cx = width * 0.5, cy = height * 0.5;
    const rng = seeded(483);
    for (let i = 0; i < 40; i++) {
      const nx = cx + (rng() - 0.5) * width * 0.7;
      const ny = cy + (rng() - 0.5) * height * 0.5;
      const dist = Math.sqrt((nx - cx) ** 2 + (ny - cy) ** 2);
      drawNodeDormant(ctx, nx, ny, 4 * s, fo * Math.max(0.15, 1 - dist / (120 * s)));
    }
    const spotR = lerp(0, 60 * s, Math.min(1, frame / 50));
    ctx.save();
    ctx.beginPath(); ctx.arc(cx, cy, spotR, 0, Math.PI * 2); ctx.clip();
    drawNodeGradient(ctx, cx, cy, 12 * s, 1, fo);
    ctx.restore();
    ctx.fillStyle = C.text; ctx.font = `600 ${10 * s}px system-ui`; ctx.textAlign = "center";
    ctx.fillText("MN9", cx, cy + 22 * s);
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
    drawHeader(ctx, width, height, s, frame, DUR, "Network to One", "many → MN9");
    const rng = seeded(484);
    const outX = width * 0.8, outY = height * 0.5;
    for (let i = 0; i < 20; i++) {
      const nx = width * (0.1 + rng() * 0.45), ny = height * (0.2 + rng() * 0.6);
      drawNodeDormant(ctx, nx, ny, 4 * s, fo * 0.5);
      drawEdgeFaint(ctx, nx, ny, outX, outY, s);
    }
    const pulse = 0.85 + Math.sin(frame * 0.15) * 0.15;
    drawNodeGradient(ctx, outX, outY, 16 * s * pulse, 1, fo);
    ctx.fillStyle = C.orange; ctx.font = `600 ${12 * s}px system-ui`; ctx.textAlign = "center";
    ctx.fillText("FEED", outX, outY + 28 * s);
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
    drawHeader(ctx, width, height, s, frame, DUR, "Signal Converges", "cascade → output");
    const chain = [
      { x: 0.15, y: 0.5 }, { x: 0.3, y: 0.35 }, { x: 0.3, y: 0.65 },
      { x: 0.5, y: 0.45 }, { x: 0.5, y: 0.55 }, { x: 0.7, y: 0.5 },
    ];
    for (let i = 0; i < chain.length; i++) {
      const cx = width * chain[i].x, cy = height * chain[i].y;
      const t = stagger(frame, i, 8, 12);
      const isOut = i === chain.length - 1;
      if (isOut) drawNodeGradient(ctx, cx, cy, 10 * s * t, 1, fo * t);
      else drawNode(ctx, cx, cy, 5 * s * t, i, fo * t);
      if (i > 0) {
        const src = i < 3 ? 0 : i < 5 ? (i === 3 ? 1 : 2) : 3;
        drawEdgeGlow(ctx, width * chain[src].x, height * chain[src].y, cx, cy, i, fo * t * 0.4, s);
      }
    }
    ctx.fillStyle = C.orange; ctx.font = `600 ${10 * s}px system-ui`; ctx.textAlign = "center";
    ctx.fillText("FEED", width * 0.7, height * 0.5 + 20 * s);
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
    drawHeader(ctx, width, height, s, frame, DUR, "61 Hz", "MN9 firing rate");
    const outX = width * 0.5, outY = height * 0.42;
    const pulse = 0.85 + Math.sin(frame * 0.15) * 0.15;
    drawNodeGradient(ctx, outX, outY, 18 * s * pulse, 1, fo);
    ctx.fillStyle = C.text; ctx.font = `600 ${22 * s}px system-ui`; ctx.textAlign = "center";
    const hzVal = Math.min(61, Math.floor(frame * 0.8));
    ctx.fillText(`${hzVal} Hz`, outX, outY + 40 * s);
    ctx.fillStyle = C.textDim; ctx.font = `${9 * s}px system-ui`;
    ctx.fillText("MN9 — feeding motor neuron", outX, outY + 55 * s);
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
    drawHeader(ctx, width, height, s, frame, DUR, "Output Emerges", "specific neuron identity");
    const rng = seeded(487);
    for (let i = 0; i < 25; i++) {
      const nx = width * (0.1 + rng() * 0.55), ny = height * (0.2 + rng() * 0.6);
      drawNodeDormant(ctx, nx, ny, 4 * s, fo * 0.4);
    }
    const outX = width * 0.78, outY = height * 0.48;
    if (frame > 30) {
      const t = Math.min(1, (frame - 30) / 25);
      for (let i = 0; i < 6; i++) {
        const ang = (i / 6) * Math.PI * 2 + frame * 0.03;
        const rx = outX + Math.cos(ang) * 30 * s * t;
        const ry = outY + Math.sin(ang) * 30 * s * t;
        drawEdgeGlow(ctx, rx, ry, outX, outY, 1, fo * t * 0.3, s);
      }
    }
    const pulse = 0.8 + Math.sin(frame * 0.12) * 0.2;
    drawNodeGradient(ctx, outX, outY, 14 * s * pulse, 1, fo);
    ctx.fillStyle = C.orange; ctx.font = `600 ${10 * s}px system-ui`; ctx.textAlign = "center";
    ctx.fillText("FEED", outX, outY + 24 * s);
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
    drawHeader(ctx, width, height, s, frame, DUR, "Starts Firing", "threshold crossed");
    const cx = width * 0.5, chartY = height * 0.35, chartH = height * 0.35, chartW = width * 0.7;
    const x0 = cx - chartW / 2;
    drawThresholdLine(ctx, x0, chartY + chartH * 0.3, chartW, "threshold", s);
    ctx.strokeStyle = C.orange; ctx.lineWidth = 2 * s; ctx.lineCap = "round";
    ctx.beginPath();
    const steps = Math.min(40, Math.floor(frame * 0.5));
    for (let i = 0; i <= steps; i++) {
      const px = x0 + (i / 40) * chartW;
      const ramp = i > 15 ? Math.min(1, (i - 15) / 10) : 0;
      const py = chartY + chartH * (1 - ramp * 0.8);
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.stroke();
    drawNodeGradient(ctx, cx, height * 0.82, 10 * s, 1, fo);
    ctx.fillStyle = C.text; ctx.font = `${9 * s}px system-ui`; ctx.textAlign = "center";
    ctx.fillText("MN9", cx, height * 0.92);
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
    drawHeader(ctx, width, height, s, frame, DUR, "The One", "controls feeding");
    const rng = seeded(489);
    for (let i = 0; i < 35; i++) {
      const nx = width * (0.08 + rng() * 0.84), ny = height * (0.18 + rng() * 0.65);
      drawNodeDormant(ctx, nx, ny, 3 * s, fo * 0.3);
    }
    const outX = width * 0.5, outY = height * 0.5;
    const ringR = lerp(0, 40 * s, Math.min(1, frame / 50));
    ctx.strokeStyle = accent(1, fo * 0.15);
    ctx.lineWidth = 2 * s;
    ctx.beginPath(); ctx.arc(outX, outY, ringR, 0, Math.PI * 2); ctx.stroke();
    const pulse = 0.85 + Math.sin(frame * 0.15) * 0.15;
    drawNodeGradient(ctx, outX, outY, 16 * s * pulse, 1, fo);
    ctx.fillStyle = C.orange; ctx.font = `600 ${13 * s}px system-ui`; ctx.textAlign = "center";
    ctx.fillText("FEED", outX, outY + 30 * s);
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

export const VARIANTS_SHOT_048: VariantDef[] = [
  { id: "shot_048_v1", label: "dim net one lights", component: V1 },
  { id: "shot_048_v2", label: "spike raster MN9", component: V2 },
  { id: "shot_048_v3", label: "spotlight feeding", component: V3 },
  { id: "shot_048_v4", label: "network to one", component: V4 },
  { id: "shot_048_v5", label: "cascade converge", component: V5 },
  { id: "shot_048_v6", label: "61Hz counter", component: V6 },
  { id: "shot_048_v7", label: "output emerges", component: V7 },
  { id: "shot_048_v8", label: "threshold crossed", component: V8 },
  { id: "shot_048_v9", label: "the one feed", component: V9 },
];
