import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantDef, VariantProps } from "../types";
import {
  C, seeded, accent, easeOutBack, drawBg, fadeInOut, stagger, staggerRaw,
  drawNode, drawNodeGradient, drawNodeDormant, drawEdge, drawEdgeGlow, drawEdgeFaint,
  drawHeader, drawCounter, drawPerson, drawNeuronShape, drawFlyOutline, drawPanel,
  drawCheck, drawXMark, drawSignalPulse, drawBarChart, drawThresholdLine, lerp,
} from "./portal-kit";

// Shot 053 — "A touch on the antenna — grooming kicked in."
// DUR=90. Antenna touch → grooming.

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
    drawHeader(ctx, width, height, s, frame, DUR, "Antenna Touch", "mechanosensory input");
    drawFlyOutline(ctx, width * 0.4, height * 0.52, 80 * s, fo);
    const antX = width * 0.4, antY = height * 0.52 - 30 * s;
    if (frame > 15) {
      const t = Math.min(1, (frame - 15) / 10);
      drawNode(ctx, antX + 8 * s, antY - 12 * s, 5 * s * t, 1, fo * t);
      ctx.fillStyle = C.textDim; ctx.font = `${7 * s}px system-ui`; ctx.textAlign = "left";
      ctx.fillText("touch", antX + 16 * s, antY - 10 * s);
    }
    if (frame > 40) {
      const t = Math.min(1, (frame - 40) / 20);
      ctx.fillStyle = `rgba(64,144,255,${fo * t})`;
      ctx.font = `600 ${12 * s}px system-ui`; ctx.textAlign = "center";
      ctx.fillText("GROOM", width * 0.75, height * 0.52);
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
    drawHeader(ctx, width, height, s, frame, DUR, "JO-CE → aDN1", "grooming pathway");
    const chain = [
      { x: 0.2, y: 0.5, label: "JO-CE" },
      { x: 0.45, y: 0.45, label: "interneuron" },
      { x: 0.7, y: 0.5, label: "aDN1" },
    ];
    for (let i = 0; i < chain.length; i++) {
      const t = stagger(frame, i, 12, 12);
      const cx = width * chain[i].x, cy = height * chain[i].y;
      drawNodeGradient(ctx, cx, cy, 8 * s * t, i, fo * t);
      ctx.fillStyle = C.text; ctx.font = `${8 * s}px system-ui`; ctx.textAlign = "center";
      ctx.fillText(chain[i].label, cx, cy + 18 * s);
      if (i > 0) drawEdgeGlow(ctx, width * chain[i - 1].x, height * chain[i - 1].y, cx, cy, i, fo * t * 0.5, s);
    }
    if (frame > 40) {
      const pt = ((frame - 40) % 25) / 25;
      drawSignalPulse(ctx, width * 0.2, height * 0.5, width * 0.7, height * 0.5, pt, 0, s);
    }
    ctx.fillStyle = C.blue; ctx.font = `600 ${10 * s}px system-ui`; ctx.textAlign = "center";
    ctx.fillText("GROOM", width * 0.7, height * 0.5 + 30 * s);
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
    drawHeader(ctx, width, height, s, frame, DUR, "Input → Output", "touch → groom");
    drawPanel(ctx, width * 0.08, height * 0.3, width * 0.36, height * 0.35, 1, fo);
    drawPanel(ctx, width * 0.56, height * 0.3, width * 0.36, height * 0.35, 0, fo);
    ctx.fillStyle = C.text; ctx.font = `600 ${10 * s}px system-ui`; ctx.textAlign = "center";
    ctx.fillText("INPUT", width * 0.26, height * 0.35);
    ctx.fillText("OUTPUT", width * 0.74, height * 0.35);
    const t1 = stagger(frame, 1, 10, 12);
    drawNode(ctx, width * 0.26, height * 0.48, 8 * s * t1, 1, fo * t1);
    ctx.fillStyle = C.textDim; ctx.font = `${8 * s}px system-ui`;
    ctx.fillText("antenna touch", width * 0.26, height * 0.58);
    const t2 = stagger(frame, 3, 10, 12);
    drawNodeGradient(ctx, width * 0.74, height * 0.48, 8 * s * t2, 0, fo * t2);
    ctx.fillText("grooming", width * 0.74, height * 0.58);
    drawEdgeGlow(ctx, width * 0.44, height * 0.48, width * 0.56, height * 0.48, 0, fo * t2 * 0.5, s);
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
    drawHeader(ctx, width, height, s, frame, DUR, "GROOM", "behavior label");
    const t = Math.min(1, frame / 25);
    ctx.fillStyle = `rgba(64,144,255,${fo * t})`;
    ctx.font = `700 ${36 * s}px system-ui`; ctx.textAlign = "center";
    ctx.fillText("GROOM", width * 0.5, height * 0.52);
    drawNodeGradient(ctx, width * 0.5, height * 0.68, 6 * s, 0, fo * t);
    ctx.fillStyle = C.textDim; ctx.font = `${8 * s}px system-ui`;
    ctx.fillText("antenna touch → grooming", width * 0.5, height * 0.78);
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
    drawHeader(ctx, width, height, s, frame, DUR, "Spike Raster", "JO-CE → aDN1");
    const rng = seeded(535);
    const rows = 6;
    for (let r = 0; r < rows; r++) {
      const isADN = r === 4;
      const ny = height * (0.25 + r * 0.1);
      if (isADN) {
        ctx.fillStyle = accent(0, fo * 0.06);
        ctx.fillRect(width * 0.1, ny - 4 * s, width * 0.8, 8 * s);
      }
      for (let t = 0; t < 22; t++) {
        const nx = width * (0.12 + t * 0.035);
        if (nx / width < frame / DUR) {
          const fires = isADN ? rng() > 0.3 : rng() > 0.65;
          if (fires) {
            ctx.fillStyle = isADN ? C.blue : C.grayDark;
            ctx.fillRect(nx, ny - 3 * s, 1.5 * s, 6 * s);
          }
        }
      }
      ctx.fillStyle = isADN ? C.blue : C.textDim;
      ctx.font = `${7 * s}px monospace`; ctx.textAlign = "right";
      ctx.fillText(isADN ? "aDN1" : r === 0 ? "JO-CE" : `n${r}`, width * 0.08, ny + 3 * s);
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
    drawHeader(ctx, width, height, s, frame, DUR, "Antenna Highlight", "sensory zone");
    drawFlyOutline(ctx, width * 0.5, height * 0.55, 90 * s, fo);
    const antX = width * 0.5, antY = height * 0.55 - 35 * s;
    const pulse = Math.sin(frame * 0.15) * 0.3 + 0.7;
    if (frame > 10) {
      ctx.strokeStyle = accent(1, fo * pulse);
      ctx.lineWidth = 3 * s; ctx.lineCap = "round";
      ctx.beginPath();
      ctx.arc(antX, antY, 12 * s, 0, Math.PI * 2);
      ctx.stroke();
      drawNode(ctx, antX, antY, 4 * s, 1, fo * pulse);
    }
    ctx.fillStyle = C.textDim; ctx.font = `${8 * s}px system-ui`; ctx.textAlign = "center";
    ctx.fillText("Johnston's organ", antX, antY - 18 * s);
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
    drawHeader(ctx, width, height, s, frame, DUR, "Grooming Network", "aDN1 at 10 Hz");
    const rng = seeded(537);
    for (let i = 0; i < 15; i++) {
      const t = stagger(frame, i, 3, 12);
      const nx = width * (0.15 + rng() * 0.7), ny = height * (0.25 + rng() * 0.5);
      drawNode(ctx, nx, ny, 4 * s * t, i, fo * t);
    }
    const outX = width * 0.5, outY = height * 0.82;
    drawNodeGradient(ctx, outX, outY, 8 * s, 0, fo);
    ctx.fillStyle = C.text; ctx.font = `${9 * s}px system-ui`; ctx.textAlign = "center";
    ctx.fillText("aDN1 — 10 Hz", outX, outY + 16 * s);
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
    drawHeader(ctx, width, height, s, frame, DUR, "Touch Signal", "mechanoreceptor → brain");
    const touchX = width * 0.2, touchY = height * 0.5;
    const brainX = width * 0.8, brainY = height * 0.5;
    drawNode(ctx, touchX, touchY, 8 * s, 1, fo);
    ctx.fillStyle = C.text; ctx.font = `${8 * s}px system-ui`; ctx.textAlign = "center";
    ctx.fillText("touch", touchX, touchY + 18 * s);
    drawNodeGradient(ctx, brainX, brainY, 10 * s, 0, fo);
    ctx.fillText("groom", brainX, brainY + 18 * s);
    if (frame > 15) {
      const t = ((frame - 15) % 35) / 35;
      drawEdgeGlow(ctx, touchX, touchY, brainX, brainY, 0, fo * 0.3, s);
      drawSignalPulse(ctx, touchX, touchY, brainX, brainY, t, 0, s);
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
    drawHeader(ctx, width, height, s, frame, DUR, "Kicked In", "instant reflex");
    const t1 = stagger(frame, 0, 0, 15);
    ctx.fillStyle = `rgba(58,58,74,${fo * t1})`;
    ctx.font = `${10 * s}px system-ui`; ctx.textAlign = "center";
    ctx.fillText("touch on the antenna", width * 0.5, height * 0.38);
    const arrowT = stagger(frame, 2, 10, 12);
    ctx.strokeStyle = accent(0, fo * arrowT);
    ctx.lineWidth = 2 * s; ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(width * 0.5, height * 0.45);
    ctx.lineTo(width * 0.5, height * 0.55);
    ctx.lineTo(width * 0.48, height * 0.52);
    ctx.moveTo(width * 0.5, height * 0.55);
    ctx.lineTo(width * 0.52, height * 0.52);
    ctx.stroke();
    const t2 = stagger(frame, 4, 10, 12);
    ctx.fillStyle = `rgba(64,144,255,${fo * t2})`;
    ctx.font = `600 ${16 * s}px system-ui`;
    ctx.fillText("GROOMING", width * 0.5, height * 0.67);
    drawNodeGradient(ctx, width * 0.5, height * 0.76, 6 * s * t2, 0, fo * t2);
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

export const VARIANTS_SHOT_053: VariantDef[] = [
  { id: "shot_053_v1", label: "fly antenna touch", component: V1 },
  { id: "shot_053_v2", label: "JO-CE aDN1 chain", component: V2 },
  { id: "shot_053_v3", label: "input output panel", component: V3 },
  { id: "shot_053_v4", label: "GROOM label", component: V4 },
  { id: "shot_053_v5", label: "spike raster aDN1", component: V5 },
  { id: "shot_053_v6", label: "antenna highlight", component: V6 },
  { id: "shot_053_v7", label: "grooming network", component: V7 },
  { id: "shot_053_v8", label: "touch signal pulse", component: V8 },
  { id: "shot_053_v9", label: "kicked in reflex", component: V9 },
];
