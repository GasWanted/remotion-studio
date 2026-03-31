import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantDef, VariantProps } from "../types";
import { seeded, drawBg, makeParticles, drawParticles, PALETTE, fadeInOut } from "../scenes/theme";
import { drawNeuron } from "../icons";

// Shot 40 — "One neuron doing this is a very simple thing."
// 120 frames (4s). Single neuron, alone, simple. Calm beat.

const V1: React.FC<VariantProps> = ({ width, height }) => {
  // Single small neuron in vast empty space, gentle pulse
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(6, width, height, s, 40001), [width, height, s]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, parts, frame, s);
    const alpha = fadeInOut(frame, 120);
    ctx.globalAlpha = alpha;
    const cx = width / 2, cy = height / 2;
    // Gentle pulse glow
    const pulse = 0.5 + 0.5 * Math.sin(frame * 0.06);
    const gr = 18 * s + pulse * 8 * s;
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, gr);
    g.addColorStop(0, `hsla(220, 55%, 65%, ${pulse * 0.25})`);
    g.addColorStop(1, `hsla(220, 55%, 65%, 0)`);
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(cx, cy, gr, 0, Math.PI * 2); ctx.fill();
    drawNeuron(ctx, cx, cy, 18 * s, `hsla(220, 55%, 62%, 0.85)`, frame);
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V2: React.FC<VariantProps> = ({ width, height }) => {
  // Neuron with a soft glow halo, text "simple" fading in
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(6, width, height, s, 40002), [width, height, s]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, parts, frame, s);
    const alpha = fadeInOut(frame, 120);
    ctx.globalAlpha = alpha;
    const cx = width / 2, cy = height * 0.42;
    // Halo
    const haloR = 35 * s;
    const g = ctx.createRadialGradient(cx, cy, 8 * s, cx, cy, haloR);
    g.addColorStop(0, `hsla(280, 45%, 62%, 0.2)`);
    g.addColorStop(0.6, `hsla(280, 45%, 62%, 0.08)`);
    g.addColorStop(1, `hsla(280, 45%, 62%, 0)`);
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(cx, cy, haloR, 0, Math.PI * 2); ctx.fill();
    drawNeuron(ctx, cx, cy, 20 * s, `hsla(280, 45%, 62%, 0.85)`, frame);
    // "simple" text
    const textT = interpolate(frame, [50, 80], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = alpha * textT;
    ctx.fillStyle = PALETTE.text.dim;
    ctx.font = `italic ${14 * s}px system-ui`;
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText("simple", cx, cy + 50 * s);
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V3: React.FC<VariantProps> = ({ width, height }) => {
  // One tiny dot in center of screen, barely pulsing
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(4, width, height, s, 40003), [width, height, s]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, parts, frame, s);
    const alpha = fadeInOut(frame, 120);
    ctx.globalAlpha = alpha;
    const cx = width / 2, cy = height / 2;
    const pulse = 0.7 + 0.3 * Math.sin(frame * 0.04);
    const r = 4 * s * pulse;
    // Tiny glow
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r * 4);
    g.addColorStop(0, `hsla(55, 60%, 70%, ${pulse * 0.15})`);
    g.addColorStop(1, `hsla(55, 60%, 70%, 0)`);
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(cx, cy, r * 4, 0, Math.PI * 2); ctx.fill();
    // Dot
    ctx.fillStyle = `hsla(55, 60%, 70%, ${pulse * 0.8})`;
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V4: React.FC<VariantProps> = ({ width, height }) => {
  // Neuron drawn with single line, minimalist
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(5, width, height, s, 40004), [width, height, s]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, parts, frame, s);
    const alpha = fadeInOut(frame, 120);
    ctx.globalAlpha = alpha;
    const cx = width / 2, cy = height / 2;
    const drawT = interpolate(frame, [10, 60], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.strokeStyle = `hsla(140, 50%, 55%, ${0.6 * alpha})`;
    ctx.lineWidth = 1.5 * s;
    ctx.lineCap = "round";
    // Simple line neuron — draw progressively
    const totalLen = 8;
    const pts = [
      { x: cx - 35 * s, y: cy - 12 * s }, // dendrite 1
      { x: cx - 15 * s, y: cy },           // merge
      { x: cx - 35 * s, y: cy + 12 * s }, // dendrite 2
      { x: cx - 15 * s, y: cy },           // merge again
      { x: cx, y: cy },                    // cell body
      { x: cx + 15 * s, y: cy },           // axon start
      { x: cx + 35 * s, y: cy + 2 * s },   // axon mid
      { x: cx + 50 * s, y: cy },           // axon end
    ];
    const visCount = Math.floor(drawT * totalLen);
    for (let i = 0; i < visCount && i < pts.length - 1; i++) {
      ctx.beginPath();
      ctx.moveTo(pts[i].x, pts[i].y);
      ctx.lineTo(pts[i + 1].x, pts[i + 1].y);
      ctx.stroke();
    }
    // Cell body circle
    if (drawT > 0.5) {
      ctx.beginPath(); ctx.arc(cx, cy, 5 * s, 0, Math.PI * 2); ctx.stroke();
    }
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V5: React.FC<VariantProps> = ({ width, height }) => {
  // Lonely neuron with vast dark space around it, occasional soft pulse
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    const alpha = fadeInOut(frame, 120);
    ctx.globalAlpha = alpha;
    const cx = width / 2, cy = height / 2;
    // Rare pulse every ~40 frames
    const pulsePhase = (frame % 40) / 40;
    const pulseActive = pulsePhase < 0.15;
    const pulseAlpha = pulseActive ? Math.sin(pulsePhase / 0.15 * Math.PI) * 0.4 : 0;
    if (pulseAlpha > 0) {
      const pr = 30 * s * (pulsePhase / 0.15);
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, pr);
      g.addColorStop(0, `hsla(220, 55%, 70%, ${pulseAlpha})`);
      g.addColorStop(1, `hsla(220, 55%, 70%, 0)`);
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(cx, cy, pr, 0, Math.PI * 2); ctx.fill();
    }
    drawNeuron(ctx, cx, cy, 16 * s, `hsla(220, 50%, 58%, 0.75)`, frame);
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V6: React.FC<VariantProps> = ({ width, height }) => {
  // Neuron as a single cell organism, floating
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(5, width, height, s, 40006), [width, height, s]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, parts, frame, s);
    const alpha = fadeInOut(frame, 120);
    ctx.globalAlpha = alpha;
    // Floating motion
    const cx = width / 2 + Math.sin(frame * 0.025) * 12 * s;
    const cy = height / 2 + Math.cos(frame * 0.02) * 8 * s;
    // Membrane
    const r = 22 * s;
    ctx.strokeStyle = `hsla(180, 50%, 55%, 0.3)`;
    ctx.lineWidth = 1.5 * s;
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
    // Inner organelle-like glow
    const g = ctx.createRadialGradient(cx - 3 * s, cy - 3 * s, 0, cx, cy, r);
    g.addColorStop(0, `hsla(180, 55%, 65%, 0.15)`);
    g.addColorStop(1, `hsla(180, 55%, 65%, 0)`);
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
    drawNeuron(ctx, cx, cy, 16 * s, `hsla(180, 55%, 58%, 0.8)`, frame);
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V7: React.FC<VariantProps> = ({ width, height }) => {
  // Text "1" large, neuron tiny below it
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(6, width, height, s, 40007), [width, height, s]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, parts, frame, s);
    const alpha = fadeInOut(frame, 120);
    ctx.globalAlpha = alpha;
    const cx = width / 2;
    // Large "1"
    const numT = interpolate(frame, [5, 25], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = alpha * numT;
    ctx.fillStyle = PALETTE.text.primary;
    ctx.font = `bold ${60 * s}px system-ui`;
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText("1", cx, height * 0.35);
    ctx.globalAlpha = alpha;
    // Tiny neuron below
    const neuronT = interpolate(frame, [30, 50], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = alpha * neuronT;
    drawNeuron(ctx, cx, height * 0.65, 12 * s, `hsla(220, 50%, 58%, 0.7)`, frame);
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V8: React.FC<VariantProps> = ({ width, height }) => {
  // Neuron heartbeat: slow, rhythmic pulse like a calm heartbeat
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(5, width, height, s, 40008), [width, height, s]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, parts, frame, s);
    const alpha = fadeInOut(frame, 120);
    ctx.globalAlpha = alpha;
    const cx = width / 2, cy = height * 0.42;
    // Heartbeat rhythm: double-beat then pause
    const beatCycle = frame % 40;
    const beat1 = beatCycle < 4 ? Math.sin(beatCycle / 4 * Math.PI) : 0;
    const beat2 = (beatCycle >= 8 && beatCycle < 12) ? Math.sin((beatCycle - 8) / 4 * Math.PI) * 0.7 : 0;
    const beat = Math.max(beat1, beat2);
    // Pulse rings
    if (beat > 0.1) {
      const pr = 20 * s + beat * 20 * s;
      ctx.strokeStyle = `hsla(350, 55%, 62%, ${beat * 0.3})`;
      ctx.lineWidth = 2 * s;
      ctx.beginPath(); ctx.arc(cx, cy, pr, 0, Math.PI * 2); ctx.stroke();
    }
    drawNeuron(ctx, cx, cy, (16 + beat * 4) * s, `hsla(350, 55%, ${58 + beat * 20}%, 0.85)`, frame);
    // EKG-style line at bottom
    const lineY = height * 0.75;
    ctx.strokeStyle = `hsla(350, 55%, 62%, 0.4)`;
    ctx.lineWidth = 1.5 * s;
    ctx.beginPath();
    for (let x = 0; x < width; x += 2) {
      const t = ((x / width) * 40 + beatCycle) % 40;
      const b1 = t < 4 ? Math.sin(t / 4 * Math.PI) * 12 * s : 0;
      const b2 = (t >= 8 && t < 12) ? Math.sin((t - 8) / 4 * Math.PI) * 8 * s : 0;
      const yOff = -(b1 + b2);
      x === 0 ? ctx.moveTo(x, lineY + yOff) : ctx.lineTo(x, lineY + yOff);
    }
    ctx.stroke();
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V9: React.FC<VariantProps> = ({ width, height }) => {
  // Small neuron with speech bubble "just doing my job"
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(6, width, height, s, 40009), [width, height, s]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, parts, frame, s);
    const alpha = fadeInOut(frame, 120);
    ctx.globalAlpha = alpha;
    const cx = width * 0.4, cy = height * 0.58;
    drawNeuron(ctx, cx, cy, 18 * s, `hsla(220, 55%, 60%, 0.85)`, frame);
    // Speech bubble
    const bubbleT = interpolate(frame, [30, 55], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (bubbleT > 0) {
      ctx.globalAlpha = alpha * bubbleT;
      const bx = cx + 25 * s, by = cy - 35 * s;
      const bw = 85 * s, bh = 22 * s;
      // Bubble
      ctx.fillStyle = `hsla(220, 25%, 22%, 0.85)`;
      ctx.strokeStyle = `hsla(220, 40%, 50%, 0.5)`;
      ctx.lineWidth = 1.5 * s;
      const br = 6 * s;
      ctx.beginPath();
      ctx.moveTo(bx + br, by - bh / 2);
      ctx.lineTo(bx + bw - br, by - bh / 2);
      ctx.quadraticCurveTo(bx + bw, by - bh / 2, bx + bw, by - bh / 2 + br);
      ctx.lineTo(bx + bw, by + bh / 2 - br);
      ctx.quadraticCurveTo(bx + bw, by + bh / 2, bx + bw - br, by + bh / 2);
      ctx.lineTo(bx + br, by + bh / 2);
      ctx.quadraticCurveTo(bx, by + bh / 2, bx, by + bh / 2 - br);
      ctx.lineTo(bx, by - bh / 2 + br);
      ctx.quadraticCurveTo(bx, by - bh / 2, bx + br, by - bh / 2);
      ctx.closePath();
      ctx.fill(); ctx.stroke();
      // Tail
      ctx.fillStyle = `hsla(220, 25%, 22%, 0.85)`;
      ctx.beginPath();
      ctx.moveTo(bx + 8 * s, by + bh / 2);
      ctx.lineTo(cx + 5 * s, cy - 10 * s);
      ctx.lineTo(bx + 18 * s, by + bh / 2);
      ctx.fill();
      // Text
      ctx.fillStyle = PALETTE.text.dim;
      ctx.font = `italic ${8 * s}px system-ui`;
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText("just doing my job", bx + bw / 2, by);
      ctx.globalAlpha = alpha;
    }
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

export const VARIANTS_SHOT_040: VariantDef[] = [
  { id: "vast-empty-pulse", label: "Vast Empty Pulse", component: V1 },
  { id: "halo-simple-text", label: "Halo Simple Text", component: V2 },
  { id: "tiny-dot", label: "Tiny Dot", component: V3 },
  { id: "single-line", label: "Single Line", component: V4 },
  { id: "lonely-pulse", label: "Lonely Pulse", component: V5 },
  { id: "cell-organism", label: "Cell Organism", component: V6 },
  { id: "number-one", label: "Number One", component: V7 },
  { id: "heartbeat", label: "Heartbeat", component: V8 },
  { id: "speech-bubble", label: "Speech Bubble", component: V9 },
];
