import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantDef, VariantProps } from "../types";
import { seeded, drawBg, makeParticles, drawParticles, PALETTE, fadeInOut } from "../scenes/theme";
import { drawNeuron, drawCheck } from "../icons";

// Shot 55 — "The brain works."

const V1: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(40, width, height, s, 55), [width, height, s]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height); drawParticles(ctx, parts, frame, s);
    const fo = fadeInOut(frame, 90); ctx.globalAlpha = fo;
    const t = interpolate(frame, [5, 50], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    // Dense neural network pulsing
    const rand = seeded(42);
    for (let i = 0; i < 12; i++) {
      const nx = width * (0.15 + rand() * 0.7);
      const ny = height * (0.2 + rand() * 0.45);
      const pulse = 0.3 + 0.7 * Math.abs(Math.sin(frame * 0.06 + i * 1.1));
      const hue = PALETTE.cellColors[i % 8][0];
      drawNeuron(ctx, nx, ny, (10 + rand() * 12) * s, `hsla(${hue}, 50%, 55%, ${pulse * t * 0.6})`, frame);
    }
    // Text fading in
    if (t > 0.5) {
      const textA = interpolate(t, [0.5, 0.85], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      ctx.fillStyle = `rgba(232,193,112,${textA})`; ctx.font = `bold ${22 * s}px system-ui`; ctx.textAlign = "center";
      ctx.fillText("IT WORKS", width / 2, height * 0.82);
    }
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V2: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(25, width, height, s), [width, height, s]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height); drawParticles(ctx, parts, frame, s);
    const fo = fadeInOut(frame, 90); ctx.globalAlpha = fo;
    const t = interpolate(frame, [5, 55], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    // Brain shape made of neurons (circular cluster)
    const glow = 0.3 + t * 0.7;
    const rand = seeded(77);
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      const r = 35 * s;
      const nx = width / 2 + Math.cos(a) * r;
      const ny = height * 0.43 + Math.sin(a) * r * 0.8;
      drawNeuron(ctx, nx, ny, 12 * s, `hsla(280, 45%, 60%, ${glow * 0.6})`, frame);
    }
    // Central glow
    const cg = ctx.createRadialGradient(width / 2, height * 0.43, 0, width / 2, height * 0.43, 45 * s);
    cg.addColorStop(0, `rgba(150,130,200,${t * 0.3})`); cg.addColorStop(1, "rgba(150,130,200,0)");
    ctx.fillStyle = cg; ctx.beginPath(); ctx.arc(width / 2, height * 0.43, 45 * s, 0, Math.PI * 2); ctx.fill();
    // Checkmark overlay
    if (t > 0.6) drawCheck(ctx, width / 2, height * 0.43, 30 * s, PALETTE.accent.green);
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V3: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(25, width, height, s), [width, height, s]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height); drawParticles(ctx, parts, frame, s);
    const fo = fadeInOut(frame, 90); ctx.globalAlpha = fo;
    const t = interpolate(frame, [15, 50], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    // Bold text with golden glow
    ctx.textAlign = "center";
    if (t > 0) {
      // Glow behind text
      const glowR = 60 * s * t;
      const glow = ctx.createRadialGradient(width / 2, height * 0.46, 0, width / 2, height * 0.46, glowR);
      glow.addColorStop(0, `rgba(232,193,112,${t * 0.2})`); glow.addColorStop(1, "rgba(232,193,112,0)");
      ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(width / 2, height * 0.46, glowR, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = `rgba(232,193,112,${t})`; ctx.font = `bold ${24 * s}px system-ui`;
      ctx.fillText("The brain works.", width / 2, height * 0.5);
    }
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V4: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(25, width, height, s), [width, height, s]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height); drawParticles(ctx, parts, frame, s);
    const fo = fadeInOut(frame, 90); ctx.globalAlpha = fo;
    const t = interpolate(frame, [10, 50], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    // Power indicator: red → green
    const cx = width / 2, cy = height * 0.42;
    const hue = interpolate(t, [0, 0.7], [0, 140], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.fillStyle = `hsla(${hue}, 55%, 50%, 0.3)`;
    ctx.beginPath(); ctx.arc(cx, cy, 35 * s, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = `hsla(${hue}, 60%, 55%, 0.8)`;
    ctx.beginPath(); ctx.arc(cx, cy, 18 * s, 0, Math.PI * 2); ctx.fill();
    // Label
    ctx.fillStyle = t > 0.7 ? PALETTE.accent.green : PALETTE.accent.red;
    ctx.font = `bold ${14 * s}px monospace`; ctx.textAlign = "center";
    ctx.fillText(t > 0.7 ? "ONLINE" : "BOOTING...", cx, height * 0.68);
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V5: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(25, width, height, s), [width, height, s]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height); drawParticles(ctx, parts, frame, s);
    const fo = fadeInOut(frame, 90); ctx.globalAlpha = fo;
    // EKG-style neural activity line
    ctx.strokeStyle = PALETTE.accent.green; ctx.lineWidth = 2 * s; ctx.lineCap = "round";
    const lineY = height * 0.45;
    ctx.beginPath();
    const progress = interpolate(frame, [0, 90], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const endX = width * 0.1 + progress * width * 0.8;
    for (let x = width * 0.1; x < endX; x += 2) {
      const rel = (x - width * 0.1) / (width * 0.8);
      const spike = Math.sin(rel * Math.PI * 12) * Math.exp(-((rel * 12 % 1 - 0.5) ** 2) * 8);
      const y = lineY - spike * 30 * s;
      x === width * 0.1 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();
    // Label
    ctx.fillStyle = PALETTE.text.primary; ctx.font = `${11 * s}px system-ui`; ctx.textAlign = "center";
    ctx.fillText("alive and firing", width / 2, height * 0.75);
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V6: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(25, width, height, s), [width, height, s]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height); drawParticles(ctx, parts, frame, s);
    const fo = fadeInOut(frame, 90); ctx.globalAlpha = fo;
    const t = interpolate(frame, [5, 50], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    // Brain neuron icon with radiating success rings
    drawNeuron(ctx, width / 2, height * 0.42, 25 * s, `hsla(280, 45%, 60%, 0.8)`, frame);
    // Radiating rings
    for (let i = 0; i < 3; i++) {
      const ringT = (t + i * 0.15) % 1;
      const r = 30 * s + ringT * 60 * s;
      const alpha = (1 - ringT) * 0.3;
      ctx.strokeStyle = `hsla(140, 50%, 55%, ${alpha})`; ctx.lineWidth = 2 * s;
      ctx.beginPath(); ctx.arc(width / 2, height * 0.42, r, 0, Math.PI * 2); ctx.stroke();
    }
    ctx.fillStyle = PALETTE.text.accent; ctx.font = `bold ${14 * s}px system-ui`; ctx.textAlign = "center";
    ctx.fillText("the brain works", width / 2, height * 0.78);
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V7: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(25, width, height, s), [width, height, s]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height); drawParticles(ctx, parts, frame, s);
    const fo = fadeInOut(frame, 90); ctx.globalAlpha = fo;
    const t = interpolate(frame, [10, 60], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    // Terminal output
    ctx.fillStyle = "rgba(0,0,0,0.3)";
    ctx.fillRect(width * 0.12, height * 0.2, width * 0.76, height * 0.55);
    ctx.font = `${10 * s}px monospace`; ctx.textAlign = "left";
    const lines = [
      { text: "> running tests...", t: 0.05, col: PALETTE.text.dim },
      { text: "  sugar    → FEED      PASS", t: 0.15, col: PALETTE.accent.green },
      { text: "  bitter   → IDLE      PASS", t: 0.3, col: PALETTE.accent.green },
      { text: "  P9       → WALK      PASS", t: 0.45, col: PALETTE.accent.green },
      { text: "  looming  → ESCAPE    PASS", t: 0.6, col: PALETTE.accent.green },
      { text: "  touch    → GROOM     PASS", t: 0.7, col: PALETTE.accent.green },
      { text: "  smell    → TURN      PASS", t: 0.8, col: PALETTE.accent.green },
      { text: "status: WORKING", t: 0.9, col: PALETTE.text.accent },
    ];
    for (const l of lines) {
      if (t > l.t) {
        const li = lines.indexOf(l);
        ctx.fillStyle = l.col;
        ctx.fillText(l.text, width * 0.16, height * 0.3 + li * 14 * s);
      }
    }
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V8: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(50, width, height, s, 88), [width, height, s]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height); drawParticles(ctx, parts, frame, s);
    const fo = fadeInOut(frame, 90); ctx.globalAlpha = fo;
    const t = interpolate(frame, [15, 45], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    // Network with particle burst on success
    const rand = seeded(33);
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      const nx = width / 2 + Math.cos(a) * 40 * s;
      const ny = height * 0.42 + Math.sin(a) * 35 * s;
      drawNeuron(ctx, nx, ny, 10 * s, `hsla(${rand() * 360}, 45%, 55%, 0.6)`, frame);
    }
    // Burst
    if (t > 0.6) {
      const burstT = interpolate(t, [0.6, 1], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      for (let i = 0; i < 16; i++) {
        const a = (i / 16) * Math.PI * 2;
        const r = burstT * 70 * s;
        const alpha = (1 - burstT) * 0.5;
        ctx.fillStyle = `hsla(${45 + i * 15}, 60%, 65%, ${alpha})`;
        ctx.beginPath(); ctx.arc(width / 2 + Math.cos(a) * r, height * 0.42 + Math.sin(a) * r, 2 * s, 0, Math.PI * 2); ctx.fill();
      }
    }
    ctx.fillStyle = PALETTE.text.accent; ctx.font = `bold ${14 * s}px system-ui`; ctx.textAlign = "center";
    if (t > 0.5) ctx.fillText("it works!", width / 2, height * 0.8);
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V9: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(25, width, height, s), [width, height, s]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height); drawParticles(ctx, parts, frame, s);
    const fo = fadeInOut(frame, 90); ctx.globalAlpha = fo;
    const t = interpolate(frame, [5, 55], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    // Before/after: dim network → bright vibrant network
    const rand = seeded(99);
    for (let i = 0; i < 8; i++) {
      const nx = width * (0.15 + rand() * 0.7);
      const ny = height * (0.2 + rand() * 0.5);
      const brightness = interpolate(t, [0, 0.7], [0.1, 0.8], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const hue = PALETTE.cellColors[i % 8][0];
      drawNeuron(ctx, nx, ny, 12 * s, `hsla(${hue}, ${30 + t * 30}%, ${30 + t * 30}%, ${brightness})`, frame);
    }
    // Connections brightening
    const rand2 = seeded(99);
    for (let i = 0; i < 8; i++) {
      const ax = width * (0.15 + rand2() * 0.7), ay = height * (0.2 + rand2() * 0.5);
      if (i < 7) {
        const rand3 = seeded(99 + i + 1);
        for (let j = 0; j < i + 1; j++) { rand3(); rand3(); }
        ctx.strokeStyle = `rgba(255,255,255,${t * 0.15})`; ctx.lineWidth = 1 * s;
        ctx.beginPath(); ctx.moveTo(ax, ay);
        ctx.lineTo(ax + (rand2() - 0.5) * 60 * s, ay + (rand2() - 0.5) * 40 * s); ctx.stroke();
      }
    }
    ctx.fillStyle = t > 0.5 ? PALETTE.text.accent : PALETTE.text.dim;
    ctx.font = `bold ${12 * s}px system-ui`; ctx.textAlign = "center";
    ctx.fillText(t > 0.5 ? "the brain works" : "initializing...", width / 2, height * 0.85);
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

export const VARIANTS_SHOT_055: VariantDef[] = [
  { id: "dense-network", label: "Dense Network", component: V1 },
  { id: "brain-check", label: "Brain + Check", component: V2 },
  { id: "bold-text", label: "Bold Text", component: V3 },
  { id: "power-on", label: "Power On", component: V4 },
  { id: "ekg-line", label: "EKG Line", component: V5 },
  { id: "radiate-rings", label: "Radiate Rings", component: V6 },
  { id: "terminal", label: "Terminal", component: V7 },
  { id: "particle-burst", label: "Particle Burst", component: V8 },
  { id: "dim-to-bright", label: "Dim to Bright", component: V9 },
];
