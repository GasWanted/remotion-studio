import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantDef, VariantProps } from "../types";
import { seeded, drawBg, makeParticles, drawParticles, PALETTE, fadeInOut } from "../scenes/theme";
import { drawNeuron, drawPerson, drawBarChart } from "../icons";

// Shot 035 — "It's simpler than you'd think."
// 9 ways to show simplicity / "1 simple rule"

const V1: React.FC<VariantProps> = ({ width, height }) => {
  // Big centered text "1 SIMPLE RULE" fading in, neuron gently pulsing below
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(18, width, height, s, 3501), [width, height, s]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, parts, frame, s);
    const fo = fadeInOut(frame, 90);
    ctx.globalAlpha = fo;
    const cx = width / 2, cy = height * 0.38;
    // Text fade in
    const tT = interpolate(frame, [8, 35], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = fo * tT;
    ctx.fillStyle = PALETTE.text.accent; ctx.font = `bold ${28 * s}px system-ui`; ctx.textAlign = "center";
    ctx.fillText("1", cx - 38 * s, cy);
    ctx.fillStyle = PALETTE.text.primary; ctx.font = `${20 * s}px system-ui`;
    ctx.fillText("SIMPLE RULE", cx + 15 * s, cy);
    // Neuron pulsing below
    ctx.globalAlpha = fo;
    const pulse = Math.sin(frame * 0.1) * 0.15 + 0.85;
    const nY = height * 0.65;
    const glowR = 35 * s * pulse;
    const glow = ctx.createRadialGradient(cx, nY, 0, cx, nY, glowR * 2);
    glow.addColorStop(0, `hsla(280, 55%, 65%, ${fo * 0.12 * pulse})`);
    glow.addColorStop(1, "transparent");
    ctx.fillStyle = glow;
    ctx.beginPath(); ctx.arc(cx, nY, glowR * 2, 0, Math.PI * 2); ctx.fill();
    drawNeuron(ctx, cx, nY, 40 * s, `hsla(280, 55%, 65%, ${fo * pulse})`, frame);
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V2: React.FC<VariantProps> = ({ width, height }) => {
  // Complex equations crossing out, leaving one simple formula
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(15, width, height, s, 3502), [width, height, s]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, parts, frame, s);
    const fo = fadeInOut(frame, 90);
    ctx.globalAlpha = fo;
    const cx = width / 2;
    const eqs = [
      "\u2207\u00B2\u03C8 + V\u03C8 = E\u03C8",
      "\u2202F/\u2202t = \u03B1\u2207\u00B2F",
      "\u222B\u03A3 dA = Q/\u03B5\u2080",
      "d\u03C9/dt = I\u207B\u00B9\u03C4",
    ];
    const simple = "if sum > threshold \u2192 fire";
    // Show equations then cross out
    const showT = interpolate(frame, [5, 25], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const crossT = interpolate(frame, [30, 55], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.font = `${11 * s}px monospace`; ctx.textAlign = "center";
    for (let i = 0; i < eqs.length; i++) {
      const y = height * 0.2 + i * 18 * s;
      const eqAlpha = Math.min(showT * 3, 1) * (1 - crossT * 0.7);
      ctx.fillStyle = `hsla(220, 40%, 60%, ${fo * eqAlpha})`;
      ctx.fillText(eqs[i], cx, y);
      // Strikethrough
      if (crossT > i / eqs.length) {
        const lineT = Math.min(1, (crossT - i / eqs.length) * eqs.length);
        ctx.strokeStyle = `hsla(350, 60%, 55%, ${fo * lineT * 0.8})`;
        ctx.lineWidth = 2 * s;
        ctx.beginPath();
        ctx.moveTo(cx - 60 * s, y - 3 * s);
        ctx.lineTo(cx - 60 * s + 120 * s * lineT, y - 3 * s);
        ctx.stroke();
      }
    }
    // Simple formula appears
    const simpleT = interpolate(frame, [55, 75], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (simpleT > 0) {
      ctx.globalAlpha = fo * simpleT;
      ctx.fillStyle = PALETTE.text.accent; ctx.font = `${14 * s}px system-ui`;
      ctx.fillText(simple, cx, height * 0.75);
    }
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V3: React.FC<VariantProps> = ({ width, height }) => {
  // Neuron with a single arrow: IN -> OUT
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(15, width, height, s, 3503), [width, height, s]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, parts, frame, s);
    const fo = fadeInOut(frame, 90);
    ctx.globalAlpha = fo;
    const cx = width / 2, cy = height / 2;
    const t = interpolate(frame, [8, 50], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    // "IN" label left
    const inT = interpolate(t, [0, 0.3], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = fo * inT;
    ctx.fillStyle = PALETTE.accent.blue; ctx.font = `bold ${16 * s}px system-ui`; ctx.textAlign = "center";
    ctx.fillText("IN", cx - 65 * s, cy + 5 * s);
    // Arrow
    const arrowT = interpolate(t, [0.2, 0.6], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = fo * arrowT;
    ctx.strokeStyle = PALETTE.text.dim; ctx.lineWidth = 2.5 * s; ctx.lineCap = "round";
    const arrowStart = cx - 45 * s, arrowEnd = cx + 45 * s;
    const arrowCur = arrowStart + (arrowEnd - arrowStart) * arrowT;
    ctx.beginPath(); ctx.moveTo(arrowStart, cy); ctx.lineTo(arrowCur, cy); ctx.stroke();
    // Arrowhead
    if (arrowT > 0.8) {
      ctx.beginPath(); ctx.moveTo(arrowEnd - 8 * s, cy - 6 * s);
      ctx.lineTo(arrowEnd, cy); ctx.lineTo(arrowEnd - 8 * s, cy + 6 * s); ctx.stroke();
    }
    // Neuron at center
    ctx.globalAlpha = fo;
    drawNeuron(ctx, cx, cy - 25 * s, 25 * s, `hsla(280, 50%, 60%, ${fo * 0.5})`, frame);
    // "OUT" label right
    const outT = interpolate(t, [0.6, 1], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = fo * outT;
    ctx.fillStyle = PALETTE.accent.gold; ctx.font = `bold ${16 * s}px system-ui`;
    ctx.fillText("OUT", cx + 65 * s, cy + 5 * s);
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V4: React.FC<VariantProps> = ({ width, height }) => {
  // Text "Simple." appearing letter by letter
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(18, width, height, s, 3504), [width, height, s]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, parts, frame, s);
    const fo = fadeInOut(frame, 90);
    ctx.globalAlpha = fo;
    const cx = width / 2, cy = height / 2;
    const text = "Simple.";
    const charCount = interpolate(frame, [15, 55], [0, text.length], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const shown = text.slice(0, Math.floor(charCount));
    ctx.fillStyle = PALETTE.text.primary; ctx.font = `bold ${36 * s}px system-ui`; ctx.textAlign = "center";
    ctx.fillText(shown, cx, cy);
    // Blinking cursor
    if (Math.floor(charCount) < text.length || Math.sin(frame * 0.15) > 0) {
      const measured = ctx.measureText(shown);
      const cursorX = cx + measured.width / 2 + 3 * s;
      ctx.fillStyle = PALETTE.text.accent;
      ctx.fillRect(cursorX, cy - 20 * s, 2.5 * s, 28 * s);
    }
    // Subtle neuron watermark behind
    ctx.globalAlpha = fo * 0.1;
    drawNeuron(ctx, cx, cy, 80 * s, `hsla(220, 40%, 50%, 0.3)`, frame);
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V5: React.FC<VariantProps> = ({ width, height }) => {
  // Chaos of connections simplifying to one clean neuron
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(15, width, height, s, 3505), [width, height, s]);
  const data = useMemo(() => {
    const r = seeded(3505);
    const lines: { x1: number; y1: number; x2: number; y2: number; hue: number }[] = [];
    for (let i = 0; i < 40; i++) {
      lines.push({ x1: r() * width, y1: r() * height, x2: r() * width, y2: r() * height, hue: PALETTE.cellColors[Math.floor(r() * 8)][0] });
    }
    return { lines };
  }, [width, height, s]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, parts, frame, s);
    const fo = fadeInOut(frame, 90);
    ctx.globalAlpha = fo;
    // Chaos fading out
    const chaos = 1 - interpolate(frame, [10, 50], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.lineCap = "round";
    for (const line of data.lines) {
      ctx.strokeStyle = `hsla(${line.hue}, 40%, 50%, ${fo * chaos * 0.3})`;
      ctx.lineWidth = 1.5 * s;
      ctx.beginPath(); ctx.moveTo(line.x1, line.y1); ctx.lineTo(line.x2, line.y2); ctx.stroke();
    }
    // Clean neuron emerging
    const clean = interpolate(frame, [30, 60], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (clean > 0) {
      ctx.globalAlpha = fo * clean;
      drawNeuron(ctx, width / 2, height / 2, 50 * s, `hsla(280, 55%, 65%, 1)`, frame);
      // "1 rule" text
      if (clean > 0.5) {
        ctx.fillStyle = PALETTE.text.accent; ctx.font = `${14 * s}px system-ui`; ctx.textAlign = "center";
        ctx.fillText("1 rule", width / 2, height * 0.82);
      }
    }
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V6: React.FC<VariantProps> = ({ width, height }) => {
  // Counter counting down: 1000 rules -> 100 -> 10 -> 1
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(18, width, height, s, 3506), [width, height, s]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, parts, frame, s);
    const fo = fadeInOut(frame, 90);
    ctx.globalAlpha = fo;
    const cx = width / 2, cy = height * 0.42;
    const steps = [1000, 100, 10, 1];
    const stepFrames = [10, 28, 46, 60];
    let current = 1000;
    for (let i = 0; i < steps.length; i++) {
      if (frame >= stepFrames[i]) current = steps[i];
    }
    // Number display
    const isOne = current === 1;
    ctx.fillStyle = isOne ? PALETTE.text.accent : PALETTE.text.primary;
    ctx.font = `bold ${(isOne ? 48 : 36) * s}px system-ui`; ctx.textAlign = "center";
    ctx.fillText(String(current), cx, cy);
    // "rules" label
    ctx.fillStyle = PALETTE.text.dim; ctx.font = `${14 * s}px system-ui`;
    ctx.fillText(current === 1 ? "rule" : "rules", cx, cy + 22 * s);
    // Animated strike lines for larger numbers
    if (!isOne) {
      ctx.strokeStyle = `hsla(350, 50%, 55%, ${fo * 0.5})`; ctx.lineWidth = 2 * s;
      ctx.beginPath();
      ctx.moveTo(cx - 35 * s, cy - 8 * s);
      ctx.lineTo(cx + 35 * s, cy - 8 * s);
      ctx.stroke();
    }
    // Glow on "1"
    if (isOne) {
      const pulse = Math.sin(frame * 0.12) * 0.3 + 0.7;
      const glow = ctx.createRadialGradient(cx, cy - 10 * s, 0, cx, cy - 10 * s, 50 * s);
      glow.addColorStop(0, `hsla(50, 60%, 65%, ${fo * 0.12 * pulse})`);
      glow.addColorStop(1, "transparent");
      ctx.fillStyle = glow;
      ctx.beginPath(); ctx.arc(cx, cy - 10 * s, 50 * s, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V7: React.FC<VariantProps> = ({ width, height }) => {
  // Neuron with speech bubble "just one rule"
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(18, width, height, s, 3507), [width, height, s]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, parts, frame, s);
    const fo = fadeInOut(frame, 90);
    ctx.globalAlpha = fo;
    const cx = width / 2, cy = height * 0.55;
    // Neuron
    drawNeuron(ctx, cx, cy, 45 * s, `hsla(280, 55%, 65%, ${fo})`, frame);
    // Speech bubble appears
    const bubT = interpolate(frame, [20, 45], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (bubT > 0) {
      ctx.globalAlpha = fo * bubT;
      const bx = cx + 20 * s, by = cy - 45 * s;
      const bw = 80 * s, bh = 28 * s, br = 8 * s;
      // Bubble background
      ctx.fillStyle = `hsla(220, 30%, 25%, 0.8)`;
      ctx.beginPath();
      ctx.moveTo(bx - bw / 2 + br, by - bh / 2);
      ctx.lineTo(bx + bw / 2 - br, by - bh / 2);
      ctx.quadraticCurveTo(bx + bw / 2, by - bh / 2, bx + bw / 2, by - bh / 2 + br);
      ctx.lineTo(bx + bw / 2, by + bh / 2 - br);
      ctx.quadraticCurveTo(bx + bw / 2, by + bh / 2, bx + bw / 2 - br, by + bh / 2);
      ctx.lineTo(bx - bw / 2 + br, by + bh / 2);
      ctx.quadraticCurveTo(bx - bw / 2, by + bh / 2, bx - bw / 2, by + bh / 2 - br);
      ctx.lineTo(bx - bw / 2, by - bh / 2 + br);
      ctx.quadraticCurveTo(bx - bw / 2, by - bh / 2, bx - bw / 2 + br, by - bh / 2);
      ctx.fill();
      // Tail
      ctx.beginPath();
      ctx.moveTo(bx - 8 * s, by + bh / 2);
      ctx.lineTo(bx - 15 * s, by + bh / 2 + 10 * s);
      ctx.lineTo(bx, by + bh / 2);
      ctx.fill();
      // Text
      ctx.fillStyle = PALETTE.text.accent; ctx.font = `${10 * s}px system-ui`; ctx.textAlign = "center";
      ctx.fillText("just one rule", bx, by + 4 * s);
    }
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V8: React.FC<VariantProps> = ({ width, height }) => {
  // Clean minimal neuron with a single pulse wave
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(15, width, height, s, 3508), [width, height, s]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, parts, frame, s);
    const fo = fadeInOut(frame, 90);
    ctx.globalAlpha = fo;
    const cx = width / 2, cy = height * 0.42;
    // Minimal neuron: just a circle + one line
    const bodyR = 10 * s;
    ctx.fillStyle = `hsla(280, 55%, 65%, ${fo})`;
    ctx.beginPath(); ctx.arc(cx, cy, bodyR, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = `hsla(280, 45%, 55%, ${fo * 0.7})`; ctx.lineWidth = 2 * s; ctx.lineCap = "round";
    ctx.beginPath(); ctx.moveTo(cx + bodyR, cy); ctx.lineTo(cx + 60 * s, cy); ctx.stroke();
    // Single pulse traveling along axon
    const pulseT = (frame * 0.03) % 1;
    const pulseX = cx + bodyR + pulseT * (60 * s - bodyR);
    ctx.fillStyle = `hsla(50, 60%, 70%, ${fo * 0.9})`;
    ctx.beginPath(); ctx.arc(pulseX, cy, 4 * s, 0, Math.PI * 2); ctx.fill();
    // Pulse glow
    const pglow = ctx.createRadialGradient(pulseX, cy, 0, pulseX, cy, 12 * s);
    pglow.addColorStop(0, `hsla(50, 60%, 70%, ${fo * 0.3})`);
    pglow.addColorStop(1, "transparent");
    ctx.fillStyle = pglow;
    ctx.beginPath(); ctx.arc(pulseX, cy, 12 * s, 0, Math.PI * 2); ctx.fill();
    // "simple" text
    const tT = interpolate(frame, [20, 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = fo * tT;
    ctx.fillStyle = PALETTE.text.dim; ctx.font = `${13 * s}px system-ui`; ctx.textAlign = "center";
    ctx.fillText("simple", cx, height * 0.72);
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V9: React.FC<VariantProps> = ({ width, height }) => {
  // Text morphing: "complicated" crossed out -> "simple"
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(18, width, height, s, 3509), [width, height, s]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, parts, frame, s);
    const fo = fadeInOut(frame, 90);
    ctx.globalAlpha = fo;
    const cx = width / 2, cy = height / 2;
    // "complicated" appears
    const showT = interpolate(frame, [5, 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const crossT = interpolate(frame, [30, 45], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const fadeOld = 1 - interpolate(frame, [45, 55], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (fadeOld > 0) {
      ctx.globalAlpha = fo * showT * fadeOld;
      ctx.fillStyle = PALETTE.text.primary; ctx.font = `${22 * s}px system-ui`; ctx.textAlign = "center";
      ctx.fillText("complicated", cx, cy);
      // Strikethrough
      if (crossT > 0) {
        ctx.strokeStyle = PALETTE.accent.red; ctx.lineWidth = 3 * s;
        const textW = ctx.measureText("complicated").width;
        ctx.beginPath();
        ctx.moveTo(cx - textW / 2, cy - 3 * s);
        ctx.lineTo(cx - textW / 2 + textW * crossT, cy - 3 * s);
        ctx.stroke();
      }
    }
    // "simple" appears
    const simpleT = interpolate(frame, [50, 70], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (simpleT > 0) {
      ctx.globalAlpha = fo * simpleT;
      ctx.fillStyle = PALETTE.text.accent; ctx.font = `bold ${26 * s}px system-ui`; ctx.textAlign = "center";
      ctx.fillText("simple", cx, cy);
    }
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

export const VARIANTS_SHOT_035: VariantDef[] = [
  { id: "one-rule", label: "1 Simple Rule", component: V1 },
  { id: "cross-equations", label: "Cross Out Equations", component: V2 },
  { id: "in-out", label: "IN -> OUT Arrow", component: V3 },
  { id: "typewriter", label: "Letter by Letter", component: V4 },
  { id: "chaos-to-clean", label: "Chaos to Clean", component: V5 },
  { id: "countdown", label: "Rule Countdown", component: V6 },
  { id: "speech-bubble", label: "Speech Bubble", component: V7 },
  { id: "minimal-pulse", label: "Minimal Pulse", component: V8 },
  { id: "text-morph", label: "Text Morph", component: V9 },
];
