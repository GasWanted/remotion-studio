import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantDef, VariantProps } from "../types";
import { seeded, drawBg, makeParticles, drawParticles, PALETTE, fadeInOut } from "../scenes/theme";
import { drawNeuron, drawCheck } from "../icons";

// Shot 54 — "Six for six. All from the wiring alone."

const V1: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(25, width, height, s), [width, height, s]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height); drawParticles(ctx, parts, frame, s);
    const fo = fadeInOut(frame, 90); ctx.globalAlpha = fo;
    const t = interpolate(frame, [10, 70], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    // Large 6/6
    ctx.fillStyle = PALETTE.text.accent; ctx.font = `bold ${40 * s}px system-ui`; ctx.textAlign = "center";
    ctx.fillText("6/6", width / 2, height * 0.4);
    // Six checkmarks appearing
    const visChecks = Math.floor(t * 6);
    for (let i = 0; i < 6; i++) {
      const cx = width * (0.15 + i * 0.12);
      if (i < visChecks) {
        drawCheck(ctx, cx, height * 0.62, 14 * s, PALETTE.accent.green);
      } else {
        ctx.fillStyle = "rgba(255,255,255,0.1)";
        ctx.beginPath(); ctx.arc(cx, height * 0.62, 7 * s, 0, Math.PI * 2); ctx.fill();
      }
    }
    ctx.fillStyle = PALETTE.text.dim; ctx.font = `${10 * s}px system-ui`;
    ctx.fillText("all from the wiring alone", width / 2, height * 0.82);
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
    const t = interpolate(frame, [8, 72], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    // Six test cards flipping to green checks
    const labels = ["FEED", "IDLE", "WALK", "ESCAPE", "GROOM", "TURN"];
    for (let i = 0; i < 6; i++) {
      const col = i % 3, row = Math.floor(i / 3);
      const cx = width * (0.22 + col * 0.28);
      const cy = height * (0.32 + row * 0.3);
      const revealed = t > (i + 1) / 7;
      ctx.fillStyle = revealed ? "rgba(80,200,120,0.15)" : "rgba(255,255,255,0.06)";
      ctx.fillRect(cx - 20 * s, cy - 14 * s, 40 * s, 28 * s);
      if (revealed) {
        drawCheck(ctx, cx, cy - 2 * s, 12 * s, PALETTE.accent.green);
        ctx.fillStyle = PALETTE.text.primary; ctx.font = `${7 * s}px monospace`; ctx.textAlign = "center";
        ctx.fillText(labels[i], cx, cy + 16 * s);
      } else {
        ctx.fillStyle = PALETTE.text.dim; ctx.font = `${12 * s}px system-ui`; ctx.textAlign = "center";
        ctx.fillText("?", cx, cy + 5 * s);
      }
    }
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
    const t = interpolate(frame, [10, 70], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    // Progress bar filling to 100%
    const barW = width * 0.65, barH = 16 * s;
    const bx = (width - barW) / 2, by = height * 0.45;
    ctx.strokeStyle = "rgba(255,255,255,0.2)"; ctx.lineWidth = 1.5;
    ctx.strokeRect(bx, by, barW, barH);
    const fillW = t * barW;
    const grad = ctx.createLinearGradient(bx, 0, bx + barW, 0);
    grad.addColorStop(0, PALETTE.accent.green); grad.addColorStop(1, PALETTE.accent.gold);
    ctx.fillStyle = grad; ctx.fillRect(bx, by, fillW, barH);
    // Percentage text
    const pct = Math.round(t * 100);
    ctx.fillStyle = PALETTE.text.primary; ctx.font = `bold ${18 * s}px system-ui`; ctx.textAlign = "center";
    ctx.fillText(`${pct}%`, width / 2, by - 12 * s);
    // Label
    ctx.fillStyle = PALETTE.text.accent; ctx.font = `bold ${14 * s}px system-ui`;
    ctx.fillText("6 for 6", width / 2, height * 0.72);
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
    const t = interpolate(frame, [8, 72], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    // Grid of 6 items, each getting a gold checkmark
    const labels = ["sugar", "bitter+sugar", "P9", "looming", "antenna", "smell"];
    for (let i = 0; i < 6; i++) {
      const col = i % 3, row = Math.floor(i / 3);
      const cx = width * (0.2 + col * 0.3);
      const cy = height * (0.3 + row * 0.32);
      const shown = t > (i + 0.5) / 7;
      ctx.fillStyle = "rgba(255,255,255,0.06)";
      ctx.beginPath(); ctx.arc(cx, cy, 18 * s, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = PALETTE.text.dim; ctx.font = `${7 * s}px monospace`; ctx.textAlign = "center";
      ctx.fillText(labels[i], cx, cy + 28 * s);
      if (shown) drawCheck(ctx, cx, cy, 14 * s, PALETTE.accent.gold);
    }
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
    const t = interpolate(frame, [8, 72], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    // Scoreboard: 6 slots
    ctx.fillStyle = PALETTE.text.accent; ctx.font = `bold ${12 * s}px system-ui`; ctx.textAlign = "center";
    ctx.fillText("SCOREBOARD", width / 2, height * 0.15);
    for (let i = 0; i < 6; i++) {
      const cx = width * (0.12 + i * 0.135);
      const cy = height * 0.45;
      const hit = t > (i + 0.5) / 7;
      ctx.strokeStyle = "rgba(255,255,255,0.15)"; ctx.lineWidth = 1.5;
      ctx.strokeRect(cx - 10 * s, cy - 14 * s, 20 * s, 28 * s);
      if (hit) {
        ctx.fillStyle = PALETTE.accent.green; ctx.font = `bold ${16 * s}px system-ui`;
        ctx.fillText("\u2713", cx, cy + 6 * s);
      }
    }
    // Score total
    const hits = Math.min(6, Math.floor(t * 7));
    ctx.fillStyle = PALETTE.text.primary; ctx.font = `bold ${20 * s}px system-ui`;
    ctx.fillText(`${hits} / 6`, width / 2, height * 0.78);
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
    const t = interpolate(frame, [8, 72], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    // Six gold stars lighting up
    for (let i = 0; i < 6; i++) {
      const cx = width * (0.12 + i * 0.135);
      const cy = height * 0.45;
      const lit = t > (i + 0.5) / 7;
      ctx.fillStyle = lit ? PALETTE.accent.gold : "rgba(255,255,255,0.08)";
      // 5-point star
      ctx.beginPath();
      for (let p = 0; p < 10; p++) {
        const a = (p * Math.PI) / 5 - Math.PI / 2;
        const r = p % 2 === 0 ? 12 * s : 5 * s;
        const sx = cx + Math.cos(a) * r, sy = cy + Math.sin(a) * r;
        p === 0 ? ctx.moveTo(sx, sy) : ctx.lineTo(sx, sy);
      }
      ctx.closePath(); ctx.fill();
    }
    ctx.fillStyle = PALETTE.text.primary; ctx.font = `bold ${14 * s}px system-ui`; ctx.textAlign = "center";
    ctx.fillText("6 for 6", width / 2, height * 0.72);
    ctx.fillStyle = PALETTE.text.dim; ctx.font = `${9 * s}px system-ui`;
    ctx.fillText("all from the wiring alone", width / 2, height * 0.82);
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
    const t = interpolate(frame, [10, 65], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.textAlign = "center";
    // "SIX FOR SIX" with each word appearing
    const words = ["SIX", "FOR", "SIX"];
    for (let i = 0; i < words.length; i++) {
      const appear = t > (i + 0.5) / 4;
      if (appear) {
        const wordAlpha = interpolate(t, [(i + 0.5) / 4, (i + 1.5) / 4], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        ctx.fillStyle = i === 1 ? `rgba(255,255,255,${wordAlpha * 0.5})` : `rgba(232,193,112,${wordAlpha})`;
        ctx.font = `bold ${i === 1 ? 18 * s : 28 * s}px system-ui`;
        ctx.fillText(words[i], width / 2, height * (0.35 + i * 0.15));
      }
    }
    if (t > 0.85) {
      ctx.fillStyle = PALETTE.text.dim; ctx.font = `${10 * s}px system-ui`;
      ctx.fillText("all from the wiring alone", width / 2, height * 0.85);
    }
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V8: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(25, width, height, s), [width, height, s]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height); drawParticles(ctx, parts, frame, s);
    const fo = fadeInOut(frame, 90); ctx.globalAlpha = fo;
    const t = interpolate(frame, [8, 65], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    // Counter 0% → 100%
    const pct = Math.round(t * 100);
    ctx.fillStyle = PALETTE.text.accent; ctx.font = `bold ${36 * s}px system-ui`; ctx.textAlign = "center";
    ctx.fillText(`${pct}%`, width / 2, height * 0.45);
    // Subtitle
    if (t > 0.7) {
      const subAlpha = interpolate(t, [0.7, 1], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      ctx.fillStyle = `rgba(255,255,255,${subAlpha * 0.5})`; ctx.font = `${10 * s}px system-ui`;
      ctx.fillText("all from wiring alone", width / 2, height * 0.62);
    }
    // Ring
    ctx.strokeStyle = "rgba(255,255,255,0.1)"; ctx.lineWidth = 3 * s;
    ctx.beginPath(); ctx.arc(width / 2, height * 0.4, 50 * s, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = PALETTE.accent.green; ctx.lineWidth = 3 * s;
    ctx.beginPath(); ctx.arc(width / 2, height * 0.4, 50 * s, -Math.PI / 2, -Math.PI / 2 + t * Math.PI * 2); ctx.stroke();
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
    const t = interpolate(frame, [8, 72], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    // Six neurons in a row, each pulsing green = pass
    for (let i = 0; i < 6; i++) {
      const cx = width * (0.1 + i * 0.14);
      const cy = height * 0.45;
      const lit = t > (i + 0.5) / 7;
      const col = lit ? `hsla(140, 50%, 55%, 0.8)` : "rgba(255,255,255,0.15)";
      drawNeuron(ctx, cx, cy, 16 * s, col, frame);
      if (lit) {
        // Green pulse ring
        const pulseR = 18 * s + Math.sin(frame * 0.12 + i) * 3 * s;
        ctx.strokeStyle = `hsla(140, 50%, 55%, 0.25)`; ctx.lineWidth = 1.5 * s;
        ctx.beginPath(); ctx.arc(cx, cy, pulseR, 0, Math.PI * 2); ctx.stroke();
      }
    }
    ctx.fillStyle = PALETTE.text.accent; ctx.font = `bold ${14 * s}px system-ui`; ctx.textAlign = "center";
    ctx.fillText("all pass", width / 2, height * 0.76);
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

export const VARIANTS_SHOT_054: VariantDef[] = [
  { id: "big-score", label: "Big Score", component: V1 },
  { id: "test-cards", label: "Test Cards", component: V2 },
  { id: "progress-bar", label: "Progress Bar", component: V3 },
  { id: "gold-checks", label: "Gold Checks", component: V4 },
  { id: "scoreboard", label: "Scoreboard", component: V5 },
  { id: "star-rating", label: "Star Rating", component: V6 },
  { id: "dramatic-text", label: "Dramatic Text", component: V7 },
  { id: "pct-counter", label: "Pct Counter", component: V8 },
  { id: "neuron-pass", label: "Neuron Pass", component: V9 },
];
