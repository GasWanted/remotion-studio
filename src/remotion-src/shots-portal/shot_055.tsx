import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantDef, VariantProps } from "../types";
import {
  C, seeded, accent, easeOutBack, drawBg, fadeInOut, stagger, staggerRaw,
  drawNode, drawNodeGradient, drawNodeDormant, drawEdge, drawEdgeGlow, drawEdgeFaint,
  drawHeader, drawCounter, drawPerson, drawNeuronShape, drawFlyOutline, drawPanel,
  drawCheck, drawXMark, drawSignalPulse, drawBarChart, drawThresholdLine, lerp,
} from "./portal-kit";

// Shot 055 — "The brain works."
// DUR=90. Triumph — network alive.

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
    drawHeader(ctx, width, height, s, frame, DUR, "IT WORKS", "the brain is alive");
    const rng = seeded(551);
    for (let i = 0; i < 30; i++) {
      const t = stagger(frame, i, 1.5, 12);
      const nx = width * (0.1 + rng() * 0.8), ny = height * (0.2 + rng() * 0.55);
      const pulse = 0.8 + Math.sin(frame * 0.1 + i) * 0.2;
      drawNode(ctx, nx, ny, 4 * s * t * pulse, i, fo * t);
      if (i > 0) {
        const px = width * (0.1 + rng() * 0.8), py = height * (0.2 + rng() * 0.55);
        drawEdge(ctx, px, py, nx, ny, i, fo * t * 0.15, s);
      }
    }
    ctx.fillStyle = C.text; ctx.font = `700 ${18 * s}px system-ui`; ctx.textAlign = "center";
    ctx.fillText("IT WORKS", width * 0.5, height * 0.88);
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
    drawHeader(ctx, width, height, s, frame, DUR, "Brain Works", "confirmed");
    const cx = width * 0.5, cy = height * 0.45;
    const pulse = 0.9 + Math.sin(frame * 0.1) * 0.1;
    drawNodeGradient(ctx, cx, cy, 22 * s * pulse, 0, fo);
    const ct = stagger(frame, 3, 10, 12);
    drawCheck(ctx, cx, cy, 20 * s * ct, 0, fo * ct);
    ctx.fillStyle = C.text; ctx.font = `600 ${14 * s}px system-ui`; ctx.textAlign = "center";
    ctx.fillText("The brain works.", cx, cy + 40 * s);
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
    drawHeader(ctx, width, height, s, frame, DUR, "Power On", "system active");
    const cx = width * 0.5, cy = height * 0.48;
    const t = Math.min(1, frame / 30);
    ctx.fillStyle = `rgba(64,192,128,${fo * t})`;
    ctx.beginPath(); ctx.arc(cx, cy, 30 * s, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = C.white; ctx.font = `700 ${24 * s}px system-ui`; ctx.textAlign = "center";
    ctx.fillText("ON", cx, cy + 8 * s);
    const rng = seeded(553);
    for (let i = 0; i < 12; i++) {
      const st = stagger(frame, i + 2, 3, 12);
      const ang = rng() * Math.PI * 2;
      const dist = 55 * s + rng() * 30 * s;
      drawNode(ctx, cx + Math.cos(ang) * dist, cy + Math.sin(ang) * dist, 3 * s * st, i, fo * st);
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
    drawHeader(ctx, width, height, s, frame, DUR, "Particle Burst", "celebration");
    const cx = width * 0.5, cy = height * 0.48;
    const rng = seeded(554);
    for (let i = 0; i < 25; i++) {
      const ang = rng() * Math.PI * 2;
      const speed = 40 * s + rng() * 80 * s;
      const t = Math.min(1, frame / 50);
      const nx = cx + Math.cos(ang) * speed * t;
      const ny = cy + Math.sin(ang) * speed * t;
      const fade = Math.max(0, 1 - t * 0.5);
      drawNode(ctx, nx, ny, lerp(5, 2, t) * s, i, fo * fade);
    }
    drawNodeGradient(ctx, cx, cy, 14 * s, 0, fo);
    ctx.fillStyle = C.text; ctx.font = `600 ${12 * s}px system-ui`; ctx.textAlign = "center";
    ctx.fillText("WORKS", cx, cy + 28 * s);
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
    drawHeader(ctx, width, height, s, frame, DUR, "Network Alive", "138k neurons active");
    const rng = seeded(555);
    for (let i = 0; i < 40; i++) {
      const t = stagger(frame, i, 1, 15);
      const nx = width * (0.08 + rng() * 0.84), ny = height * (0.18 + rng() * 0.6);
      const pulse = 0.8 + Math.sin(frame * 0.08 + i * 0.5) * 0.2;
      drawNode(ctx, nx, ny, 3 * s * t * pulse, i, fo * t);
    }
    drawCounter(ctx, width, height, s, "138,639", "neurons");
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
    drawHeader(ctx, width, height, s, frame, DUR, "Triumph", "brain validated");
    const t = Math.min(1, frame / 25);
    ctx.fillStyle = `rgba(58,58,74,${fo * t})`;
    ctx.font = `700 ${42 * s}px system-ui`; ctx.textAlign = "center";
    ctx.fillText("WORKS", width * 0.5, height * 0.52);
    for (let i = 0; i < 3; i++) {
      const rt = stagger(frame, i + 3, 8, 12);
      const r = (30 + i * 20) * s * rt;
      ctx.strokeStyle = accent(i, fo * rt * 0.12);
      ctx.lineWidth = 2 * s;
      ctx.beginPath(); ctx.arc(width * 0.5, height * 0.48, r, 0, Math.PI * 2); ctx.stroke();
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
    drawHeader(ctx, width, height, s, frame, DUR, "Verified", "all behaviors match");
    drawPanel(ctx, width * 0.15, height * 0.25, width * 0.7, height * 0.5, 0, fo);
    const behaviors = ["FEED", "IDLE", "WALK", "ESCAPE", "GROOM", "TURN"];
    for (let i = 0; i < 6; i++) {
      const col = i % 3, row = Math.floor(i / 3);
      const bx = width * (0.25 + col * 0.2), by = height * (0.38 + row * 0.2);
      const t = stagger(frame, i, 5, 10);
      ctx.fillStyle = accent(i, fo * t);
      ctx.font = `${8 * s}px system-ui`; ctx.textAlign = "center";
      ctx.fillText(behaviors[i], bx, by);
      drawCheck(ctx, bx, by + 10 * s, 8 * s * t, 0, fo * t);
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
    drawHeader(ctx, width, height, s, frame, DUR, "Pulsing Brain", "alive and working");
    const cx = width * 0.5, cy = height * 0.48;
    drawNeuronShape(ctx, cx, cy, 70 * s, fo, frame);
    const pulse = 0.85 + Math.sin(frame * 0.12) * 0.15;
    drawNodeGradient(ctx, cx, cy, 14 * s * pulse, 0, fo);
    ctx.fillStyle = C.green; ctx.font = `600 ${12 * s}px system-ui`; ctx.textAlign = "center";
    ctx.fillText("ACTIVE", cx, height * 0.85);
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
    drawHeader(ctx, width, height, s, frame, DUR, "The Brain Works", "proven");
    const t = Math.min(1, frame / 20);
    ctx.fillStyle = `rgba(58,58,74,${fo * t})`;
    ctx.font = `700 ${24 * s}px system-ui`; ctx.textAlign = "center";
    ctx.fillText("The brain works.", width * 0.5, height * 0.5);
    const ct = stagger(frame, 4, 8, 12);
    drawCheck(ctx, width * 0.5, height * 0.62, 18 * s * ct, 0, fo * ct);
    for (let i = 0; i < 8; i++) {
      const ang = (i / 8) * Math.PI * 2;
      const r = 70 * s * ct;
      drawNode(ctx, width * 0.5 + Math.cos(ang) * r, height * 0.5 + Math.sin(ang) * r, 2 * s, i, fo * ct * 0.3);
    }
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

export const VARIANTS_SHOT_055: VariantDef[] = [
  { id: "shot_055_v1", label: "dense net IT WORKS", component: V1 },
  { id: "shot_055_v2", label: "brain check overlay", component: V2 },
  { id: "shot_055_v3", label: "power on green", component: V3 },
  { id: "shot_055_v4", label: "particle burst", component: V4 },
  { id: "shot_055_v5", label: "network alive 138k", component: V5 },
  { id: "shot_055_v6", label: "triumph rings", component: V6 },
  { id: "shot_055_v7", label: "verified panel", component: V7 },
  { id: "shot_055_v8", label: "pulsing brain neuron", component: V8 },
  { id: "shot_055_v9", label: "the brain works text", component: V9 },
];
