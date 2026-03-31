import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantDef, VariantProps } from "../types";
import { FB, seeded, drawFBBg, drawFBNode, drawFBEdge, drawFBText, drawFBCounter, fadeInOut, cellHSL, drawFBColorEdge } from "./flatbold-kit";

/* Shot 65 — "Red light on the Giant Fiber triggers an escape."
   120 frames (4s) */

// ---------- V1: red flash → Giant Fiber neuron lights up → "ESCAPE" ----------
const V1: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 120);
    const s = Math.min(W, H) / 360;
    const cx = W / 2;
    // Red flash pulse
    const flashP = interpolate(frame, [10, 25], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const flashFade = interpolate(frame, [25, 45], [1, 0.2], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = a * flashP * flashFade * 0.15;
    ctx.fillStyle = FB.red;
    ctx.fillRect(0, 0, W, H);
    // Red light source
    ctx.globalAlpha = a * flashP * 0.4;
    const flashGrad = ctx.createRadialGradient(cx, H * 0.12, 0, cx, H * 0.12, 30 * s);
    flashGrad.addColorStop(0, FB.red); flashGrad.addColorStop(1, "transparent");
    ctx.fillStyle = flashGrad;
    ctx.fillRect(cx - 30 * s, 0, 60 * s, H * 0.25);
    drawFBText(ctx, "RED LIGHT", cx, H * 0.05, 8 * s, a * flashP, "center", FB.red);
    // Giant Fiber neuron
    const gfP = interpolate(frame, [30, 50], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const gfGlow = 0.5 + 0.5 * Math.sin(frame * 0.15);
    drawFBNode(ctx, cx, H * 0.4, 18 * s, 0, a * gfP, frame);
    // Glow around GF
    ctx.globalAlpha = a * gfP * gfGlow * 0.25;
    ctx.fillStyle = FB.red;
    ctx.beginPath(); ctx.arc(cx, H * 0.4, 28 * s, 0, Math.PI * 2); ctx.fill();
    drawFBText(ctx, "GIANT FIBER", cx, H * 0.4 + 24 * s, 9 * s, a * gfP, "center", FB.red);
    drawFBText(ctx, "86 Hz", cx, H * 0.4 + 34 * s, 7 * s, a * gfP, "center", FB.text.dim);
    // Arrow down to ESCAPE
    const escP = interpolate(frame, [55, 80], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = a * escP; ctx.strokeStyle = FB.red; ctx.lineWidth = 2 * s;
    ctx.beginPath(); ctx.moveTo(cx, H * 0.55); ctx.lineTo(cx, H * 0.7); ctx.stroke();
    ctx.fillStyle = FB.red; ctx.beginPath();
    ctx.moveTo(cx, H * 0.72); ctx.lineTo(cx - 4 * s, H * 0.68); ctx.lineTo(cx + 4 * s, H * 0.68); ctx.closePath(); ctx.fill();
    drawFBText(ctx, "ESCAPE", cx, H * 0.82, 16 * s, a * escP, "center", FB.red);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V2: circuit diagram — red photon → GF → motor neurons → legs ----------
const V2: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 120);
    const s = Math.min(W, H) / 360;
    const stages = [
      { x: W * 0.1, label: "RED\nLIGHT", color: FB.red },
      { x: W * 0.35, label: "GIANT\nFIBER", color: FB.red },
      { x: W * 0.6, label: "MOTOR\nNEURONS", color: FB.gold },
      { x: W * 0.85, label: "ESCAPE", color: FB.green },
    ];
    const cy = H * 0.4;
    stages.forEach((st, i) => {
      const t = interpolate(frame, [10 + i * 18, 25 + i * 18], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      drawFBNode(ctx, st.x, cy, 12 * s, i === 0 ? 0 : i === 1 ? 0 : i === 2 ? 2 : 3, a * t, frame);
      const lines = st.label.split("\n");
      lines.forEach((ln, li) => drawFBText(ctx, ln, st.x, cy + 18 * s + li * 10 * s, 7 * s, a * t, "center", st.color));
      // Arrow to next
      if (i < 3) {
        const arrP = interpolate(frame, [20 + i * 18, 30 + i * 18], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        ctx.globalAlpha = a * arrP; ctx.strokeStyle = st.color; ctx.lineWidth = 2 * s;
        ctx.beginPath(); ctx.moveTo(st.x + 14 * s, cy); ctx.lineTo(stages[i + 1].x - 14 * s, cy); ctx.stroke();
        ctx.fillStyle = st.color; ctx.beginPath();
        ctx.moveTo(stages[i + 1].x - 14 * s, cy);
        ctx.lineTo(stages[i + 1].x - 18 * s, cy - 3 * s);
        ctx.lineTo(stages[i + 1].x - 18 * s, cy + 3 * s); ctx.closePath(); ctx.fill();
      }
    });
    const endP = interpolate(frame, [90, 110], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "VERIFIED ESCAPE CIRCUIT", W / 2, H * 0.82, 10 * s, a * endP, "center", FB.text.primary);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V3: red beam hitting a large GF neuron, sparks fly ----------
const V3: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 120);
    const s = Math.min(W, H) / 360;
    const cx = W / 2, cy = H * 0.4;
    // Red beam from left
    const beamP = interpolate(frame, [5, 30], [0, 1], { extrapolateRight: "clamp" });
    ctx.globalAlpha = a * beamP * 0.5;
    const beamGrad = ctx.createLinearGradient(0, cy, cx - 20 * s, cy);
    beamGrad.addColorStop(0, FB.red); beamGrad.addColorStop(1, "transparent");
    ctx.fillStyle = beamGrad;
    ctx.fillRect(0, cy - 4 * s, cx - 20 * s, 8 * s);
    // GF neuron
    const gfP = interpolate(frame, [25, 45], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBNode(ctx, cx, cy, 20 * s, 0, a * gfP, frame);
    drawFBText(ctx, "GF", cx, cy, 10 * s, a * gfP * 0.8, "center", FB.bg);
    // Sparks
    const sparkP = interpolate(frame, [35, 55], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (sparkP > 0) {
      const rng = seeded(6530);
      for (let i = 0; i < 8; i++) {
        const angle = rng() * Math.PI * 2;
        const dist = (20 + sparkP * 25) * s;
        const sx = cx + Math.cos(angle) * dist;
        const sy = cy + Math.sin(angle) * dist;
        ctx.globalAlpha = a * sparkP * (1 - sparkP) * 0.8;
        ctx.fillStyle = FB.red;
        ctx.beginPath(); ctx.arc(sx, sy, 2 * s, 0, Math.PI * 2); ctx.fill();
      }
    }
    // ESCAPE text
    const escP = interpolate(frame, [60, 85], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "ESCAPE TRIGGERED", cx, H * 0.72, 14 * s, a * escP, "center", FB.red);
    // Speed lines going right
    if (escP > 0.5) {
      for (let i = 0; i < 4; i++) {
        const ly = H * 0.8 + i * 4 * s;
        ctx.globalAlpha = a * (escP - 0.5) * 0.3;
        ctx.strokeStyle = FB.red; ctx.lineWidth = 1 * s;
        ctx.beginPath(); ctx.moveTo(W * 0.3, ly); ctx.lineTo(W * 0.8, ly); ctx.stroke();
      }
    }
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V4: oscilloscope trace — GF firing at 86 Hz ----------
const V4: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 120);
    const s = Math.min(W, H) / 360;
    const cx = W / 2;
    drawFBText(ctx, "GIANT FIBER RESPONSE", cx, H * 0.06, 8 * s, a, "center", FB.text.dim);
    // Red light indicator
    const lightP = interpolate(frame, [10, 20], [0, 1], { extrapolateRight: "clamp" });
    ctx.globalAlpha = a * lightP; ctx.fillStyle = FB.red;
    ctx.beginPath(); ctx.arc(W * 0.08, H * 0.06, 4 * s, 0, Math.PI * 2); ctx.fill();
    drawFBText(ctx, "ON", W * 0.08, H * 0.06 + 8 * s, 5 * s, a * lightP, "center", FB.red);
    // Spike trace
    const traceY = H * 0.35, traceH = H * 0.3;
    ctx.globalAlpha = a * 0.15; ctx.strokeStyle = FB.text.dim; ctx.lineWidth = 1 * s;
    ctx.strokeRect(W * 0.08, traceY, W * 0.84, traceH);
    const fireP = interpolate(frame, [25, 35], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.beginPath(); ctx.moveTo(W * 0.1, traceY + traceH * 0.8);
    for (let x = 0; x < 50; x++) {
      const px = W * 0.1 + (x / 50) * W * 0.8;
      const frac = x / 50;
      const spike = frac > 0.15 && fireP > 0 ? Math.max(0, Math.sin((frac - 0.15) * 60) * 0.6) : 0;
      const revP = interpolate(frame, [25 + frac * 60, 30 + frac * 60], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      ctx.lineTo(px, traceY + traceH * (0.8 - spike * revP));
    }
    ctx.globalAlpha = a; ctx.strokeStyle = FB.red; ctx.lineWidth = 2 * s; ctx.stroke();
    drawFBCounter(ctx, "86 Hz", cx, traceY + traceH + 14 * s, 12 * s, FB.red, a * fireP);
    const escP = interpolate(frame, [80, 105], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "ESCAPE", cx, H * 0.88, 16 * s, a * escP, "center", FB.red);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V5: before/after — light off = silent, light on = firing ----------
const V5: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 120);
    const s = Math.min(W, H) / 360;
    // Left: light off
    const offP = interpolate(frame, [10, 30], [0, 1], { extrapolateRight: "clamp" });
    drawFBText(ctx, "LIGHT OFF", W * 0.25, H * 0.1, 9 * s, a * offP, "center", FB.text.dim);
    drawFBNode(ctx, W * 0.25, H * 0.35, 14 * s, 7, a * offP * 0.3, 0);
    drawFBText(ctx, "GF: silent", W * 0.25, H * 0.52, 8 * s, a * offP, "center", FB.text.dim);
    drawFBText(ctx, "0 Hz", W * 0.25, H * 0.6, 10 * s, a * offP, "center", FB.text.dim);
    // Divider
    ctx.globalAlpha = a * 0.2; ctx.fillStyle = FB.text.dim; ctx.fillRect(W / 2 - 1, H * 0.08, 2, H * 0.6);
    // Right: light on
    const onP = interpolate(frame, [40, 60], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "RED LIGHT ON", W * 0.75, H * 0.1, 9 * s, a * onP, "center", FB.red);
    // Red glow
    ctx.globalAlpha = a * onP * 0.15;
    ctx.fillStyle = FB.red;
    ctx.beginPath(); ctx.arc(W * 0.75, H * 0.35, 25 * s, 0, Math.PI * 2); ctx.fill();
    drawFBNode(ctx, W * 0.75, H * 0.35, 14 * s, 0, a * onP, frame);
    drawFBText(ctx, "GF: FIRING", W * 0.75, H * 0.52, 8 * s, a * onP, "center", FB.red);
    drawFBText(ctx, "86 Hz", W * 0.75, H * 0.6, 10 * s, a * onP, "center", FB.red);
    const endP = interpolate(frame, [75, 105], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "TRIGGERS ESCAPE", W / 2, H * 0.82, 14 * s, a * endP, "center", FB.red);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V6: red light source → wavy line → GF → arrow → running fly ----------
const V6: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 120);
    const s = Math.min(W, H) / 360;
    const cy = H * 0.4;
    // Red light source
    const lP = interpolate(frame, [5, 18], [0, 1], { extrapolateRight: "clamp" });
    ctx.globalAlpha = a * lP * 0.5; ctx.fillStyle = FB.red;
    ctx.beginPath(); ctx.arc(W * 0.08, cy, 8 * s, 0, Math.PI * 2); ctx.fill();
    // Wavy photon line
    const waveP = interpolate(frame, [15, 35], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.beginPath(); ctx.moveTo(W * 0.14, cy);
    for (let i = 0; i < 10; i++) {
      const px = W * 0.14 + (i / 10) * W * 0.2;
      const py = cy + Math.sin(i * 1.5 + frame * 0.1) * 4 * s;
      ctx.lineTo(px, py);
    }
    ctx.globalAlpha = a * waveP; ctx.strokeStyle = FB.red; ctx.lineWidth = 2 * s; ctx.stroke();
    // GF neuron
    const gfP = interpolate(frame, [30, 48], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBNode(ctx, W * 0.42, cy, 14 * s, 0, a * gfP, frame);
    drawFBText(ctx, "GF", W * 0.42, cy, 8 * s, a * gfP * 0.7, "center", FB.bg);
    // Arrow to escape
    const arrP = interpolate(frame, [48, 65], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = a * arrP; ctx.strokeStyle = FB.red; ctx.lineWidth = 2 * s;
    ctx.beginPath(); ctx.moveTo(W * 0.55, cy); ctx.lineTo(W * 0.72, cy); ctx.stroke();
    ctx.fillStyle = FB.red; ctx.beginPath();
    ctx.moveTo(W * 0.74, cy); ctx.lineTo(W * 0.71, cy - 3 * s); ctx.lineTo(W * 0.71, cy + 3 * s); ctx.closePath(); ctx.fill();
    // Running fly blob
    const runP = interpolate(frame, [60, 80], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const runX = W * 0.82 + runP * W * 0.1;
    drawFBNode(ctx, runX, cy, 10 * s, 4, a * runP, frame);
    // Speed lines
    for (let i = 0; i < 3; i++) {
      ctx.globalAlpha = a * runP * 0.3; ctx.strokeStyle = FB.text.dim; ctx.lineWidth = 1 * s;
      ctx.beginPath(); ctx.moveTo(runX - 12 * s, cy - 3 * s + i * 3 * s); ctx.lineTo(runX - 25 * s, cy - 3 * s + i * 3 * s); ctx.stroke();
    }
    drawFBText(ctx, "ESCAPE!", W / 2, H * 0.72, 14 * s, a * runP, "center", FB.red);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V7: GF as a big alarm button being pressed ----------
const V7: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 120);
    const s = Math.min(W, H) / 360;
    const cx = W / 2, cy = H * 0.35;
    // Button body
    const pressP = interpolate(frame, [25, 45], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const depress = pressP * 4 * s;
    ctx.globalAlpha = a; ctx.fillStyle = FB.red;
    ctx.beginPath(); ctx.arc(cx, cy + depress, 22 * s, 0, Math.PI * 2); ctx.fill();
    // Button rim
    ctx.strokeStyle = "rgba(255,255,255,0.2)"; ctx.lineWidth = 2 * s;
    ctx.beginPath(); ctx.arc(cx, cy + depress, 22 * s, 0, Math.PI * 2); ctx.stroke();
    drawFBText(ctx, "GF", cx, cy + depress, 12 * s, a * 0.9, "center", FB.bg);
    // Red light label
    const lightP = interpolate(frame, [5, 20], [0, 1], { extrapolateRight: "clamp" });
    drawFBText(ctx, "RED LIGHT", cx, H * 0.08, 9 * s, a * lightP, "center", FB.red);
    // Arrow down
    ctx.globalAlpha = a * lightP * 0.5; ctx.strokeStyle = FB.red; ctx.lineWidth = 1.5 * s;
    ctx.beginPath(); ctx.moveTo(cx, H * 0.14); ctx.lineTo(cx, cy - 24 * s); ctx.stroke();
    // Alarm waves
    if (pressP > 0.5) {
      for (let i = 0; i < 3; i++) {
        const waveR = (25 + i * 10 + (frame - 40) * 0.5) * s;
        ctx.globalAlpha = a * (1 - i * 0.3) * 0.15;
        ctx.strokeStyle = FB.red; ctx.lineWidth = 1 * s;
        ctx.beginPath(); ctx.arc(cx, cy, waveR, 0, Math.PI * 2); ctx.stroke();
      }
    }
    const escP = interpolate(frame, [60, 90], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "ESCAPE", cx, H * 0.72, 18 * s, a * escP, "center", FB.red);
    drawFBText(ctx, "GIANT FIBER = PANIC BUTTON", cx, H * 0.88, 8 * s, a * escP, "center", FB.text.dim);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V8: network with GF highlighted, rest dim ----------
const V8: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 120);
    const s = Math.min(W, H) / 360;
    const rng = seeded(658);
    const nodes: [number, number][] = [];
    for (let i = 0; i < 12; i++) nodes.push([W * 0.08 + rng() * W * 0.84, H * 0.08 + rng() * H * 0.55]);
    // GF is node 0, centered
    nodes[0] = [W / 2, H * 0.35];
    // Background connections
    for (let i = 0; i < 16; i++) {
      const fi = Math.floor(rng() * 12), ti = Math.floor(rng() * 12);
      if (fi !== ti) drawFBColorEdge(ctx, nodes[fi][0], nodes[fi][1], nodes[ti][0], nodes[ti][1], FB.text.dim, s * 0.3, a * 0.15);
    }
    // Dim background nodes
    nodes.forEach(([x, y], i) => {
      if (i === 0) return;
      drawFBNode(ctx, x, y, 4 * s, (i + 2) % 8, a * 0.2, frame);
    });
    // GF bright and pulsing
    const gfP = interpolate(frame, [15, 35], [0, 1], { extrapolateRight: "clamp" });
    const pulse = 0.7 + 0.3 * Math.sin(frame * 0.12);
    drawFBNode(ctx, nodes[0][0], nodes[0][1], 16 * s, 0, a * gfP * pulse, frame);
    drawFBText(ctx, "GIANT FIBER", nodes[0][0], nodes[0][1] + 22 * s, 8 * s, a * gfP, "center", FB.red);
    // Red light indicator
    ctx.globalAlpha = a * gfP * 0.3; ctx.fillStyle = FB.red;
    ctx.beginPath(); ctx.arc(nodes[0][0], nodes[0][1], 24 * s, 0, Math.PI * 2); ctx.fill();
    const escP = interpolate(frame, [60, 90], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "RED LIGHT -> ESCAPE", W / 2, H * 0.82, 12 * s, a * escP, "center", FB.red);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V9: countdown 3-2-1 then red flash then ESCAPE ----------
const V9: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 120);
    const s = Math.min(W, H) / 360;
    const cx = W / 2;
    // Countdown
    const count3 = interpolate(frame, [10, 25], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const count2 = interpolate(frame, [25, 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const count1 = interpolate(frame, [40, 55], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (frame < 25) drawFBCounter(ctx, "3", cx, H * 0.3, 30 * s, FB.text.dim, a * count3);
    else if (frame < 40) drawFBCounter(ctx, "2", cx, H * 0.3, 30 * s, FB.text.dim, a * count2);
    else if (frame < 55) drawFBCounter(ctx, "1", cx, H * 0.3, 30 * s, FB.gold, a * count1);
    // Red flash
    const flashP = interpolate(frame, [55, 65], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const flashFade = interpolate(frame, [65, 80], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (flashP > 0) {
      ctx.globalAlpha = a * flashP * flashFade * 0.2;
      ctx.fillStyle = FB.red; ctx.fillRect(0, 0, W, H);
    }
    // GF neuron appears
    if (frame > 55) {
      const gfP = interpolate(frame, [55, 70], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      drawFBNode(ctx, cx, H * 0.35, 16 * s, 0, a * gfP, frame);
      drawFBText(ctx, "GF", cx, H * 0.35, 9 * s, a * gfP * 0.8, "center", FB.bg);
    }
    // ESCAPE
    const escP = interpolate(frame, [75, 100], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "ESCAPE", cx, H * 0.65, 20 * s, a * escP, "center", FB.red);
    drawFBText(ctx, "Giant Fiber triggered", cx, H * 0.78, 8 * s, a * escP, "center", FB.text.dim);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

export const VARIANTS_FB_065: VariantDef[] = [
  { id: "fb-065-v1", label: "Red flash GF lights up ESCAPE", component: V1 },
  { id: "fb-065-v2", label: "Circuit diagram red to GF to escape", component: V2 },
  { id: "fb-065-v3", label: "Red beam hits GF sparks fly", component: V3 },
  { id: "fb-065-v4", label: "Oscilloscope trace 86 Hz spikes", component: V4 },
  { id: "fb-065-v5", label: "Split light off vs light on", component: V5 },
  { id: "fb-065-v6", label: "Red light wavy line GF running fly", component: V6 },
  { id: "fb-065-v7", label: "GF as alarm button pressed", component: V7 },
  { id: "fb-065-v8", label: "Network with GF highlighted bright", component: V8 },
  { id: "fb-065-v9", label: "Countdown 3-2-1 flash ESCAPE", component: V9 },
];
