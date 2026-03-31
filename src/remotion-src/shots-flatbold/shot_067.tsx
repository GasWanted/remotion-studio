import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantDef, VariantProps } from "../types";
import { FB, seeded, drawFBBg, drawFBNode, drawFBEdge, drawFBText, drawFBCounter, fadeInOut, cellHSL, drawFBColorEdge } from "./flatbold-kit";

/* Shot 67 — "Red light on a specific motor neuron called MN9 makes the
   mouth extend to eat." — 120 frames (4s) */

// ---------- V1: red flash → MN9 neuron → mouth extends ----------
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
    // Red light
    const lightP = interpolate(frame, [5, 18], [0, 1], { extrapolateRight: "clamp" });
    ctx.globalAlpha = a * lightP * 0.12; ctx.fillStyle = FB.red; ctx.fillRect(0, 0, W, H * 0.15);
    drawFBText(ctx, "RED LIGHT", cx, H * 0.05, 8 * s, a * lightP, "center", FB.red);
    // MN9 neuron
    const mn9P = interpolate(frame, [20, 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const pulse = 0.6 + 0.4 * Math.sin(frame * 0.15);
    drawFBNode(ctx, cx, H * 0.32, 16 * s, 2, a * mn9P * pulse, frame);
    ctx.globalAlpha = a * mn9P * pulse * 0.2; ctx.fillStyle = FB.gold;
    ctx.beginPath(); ctx.arc(cx, H * 0.32, 24 * s, 0, Math.PI * 2); ctx.fill();
    drawFBText(ctx, "MN9", cx, H * 0.32, 10 * s, a * mn9P * 0.8, "center", FB.bg);
    drawFBText(ctx, "61 Hz", cx, H * 0.32 + 22 * s, 7 * s, a * mn9P, "center", FB.gold);
    // Mouth extension animation
    const mouthP = interpolate(frame, [50, 75], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const mouthY = H * 0.62;
    // Head blob
    ctx.globalAlpha = a * mouthP; ctx.fillStyle = FB.teal;
    ctx.beginPath(); ctx.ellipse(cx, mouthY, 16 * s, 12 * s, 0, 0, Math.PI * 2); ctx.fill();
    // Proboscis extending
    const extLen = mouthP * 18 * s;
    ctx.strokeStyle = FB.gold; ctx.lineWidth = 3 * s; ctx.lineCap = "round";
    ctx.beginPath(); ctx.moveTo(cx, mouthY + 12 * s); ctx.lineTo(cx, mouthY + 12 * s + extLen); ctx.stroke();
    drawFBText(ctx, "MOUTH EXTENDS", cx, mouthY + 14 * s + extLen + 8 * s, 8 * s, a * mouthP, "center", FB.gold);
    const endP = interpolate(frame, [85, 108], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "FEEDING", cx, H * 0.92, 14 * s, a * endP, "center", FB.gold);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V2: circuit: red → MN9 → proboscis motor → eat ----------
const V2: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 120);
    const s = Math.min(W, H) / 360;
    const cy = H * 0.4;
    const stages = [
      { x: W * 0.1, label: "RED\nLIGHT", color: FB.red },
      { x: W * 0.38, label: "MN9", color: FB.gold },
      { x: W * 0.65, label: "MOUTH\nMOTOR", color: FB.teal },
      { x: W * 0.9, label: "EAT", color: FB.gold },
    ];
    stages.forEach((st, i) => {
      const t = interpolate(frame, [8 + i * 16, 22 + i * 16], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      drawFBNode(ctx, st.x, cy, i === 1 ? 14 * s : 10 * s, i === 0 ? 0 : i === 1 ? 2 : i === 2 ? 4 : 2, a * t, frame);
      const lines = st.label.split("\n");
      lines.forEach((ln, li) => drawFBText(ctx, ln, st.x, cy + 18 * s + li * 10 * s, 7 * s, a * t, "center", st.color));
      if (i < 3) {
        const arrP = interpolate(frame, [18 + i * 16, 26 + i * 16], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        ctx.globalAlpha = a * arrP; ctx.strokeStyle = st.color; ctx.lineWidth = 2 * s;
        ctx.beginPath(); ctx.moveTo(st.x + 14 * s, cy); ctx.lineTo(stages[i + 1].x - 14 * s, cy); ctx.stroke();
      }
    });
    const endP = interpolate(frame, [85, 108], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "VERIFIED FEEDING CIRCUIT", W / 2, H * 0.82, 10 * s, a * endP, "center", FB.gold);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V3: MN9 as a labeled cell with "FEED" glow ----------
const V3: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 120);
    const s = Math.min(W, H) / 360;
    const cx = W / 2, cy = H * 0.38;
    // Big MN9 cell
    const cellP = interpolate(frame, [10, 30], [0, 1], { extrapolateRight: "clamp" });
    drawFBNode(ctx, cx, cy, 24 * s, 2, a * cellP, frame);
    drawFBText(ctx, "MN9", cx, cy - 3 * s, 14 * s, a * cellP * 0.9, "center", FB.bg);
    drawFBText(ctx, "motor neuron", cx, cy + 10 * s, 6 * s, a * cellP * 0.6, "center", FB.bg);
    // Red light indicator
    const redP = interpolate(frame, [5, 20], [0, 1], { extrapolateRight: "clamp" });
    ctx.globalAlpha = a * redP * 0.5; ctx.fillStyle = FB.red;
    ctx.beginPath(); ctx.arc(cx, cy - 30 * s, 5 * s, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = a * redP; ctx.strokeStyle = FB.red; ctx.lineWidth = 1 * s;
    ctx.beginPath(); ctx.moveTo(cx, cy - 25 * s); ctx.lineTo(cx, cy - 18 * s); ctx.stroke();
    // Gold glow expanding when active
    const glowP = interpolate(frame, [35, 55], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const glowR = 28 * s + glowP * 15 * s;
    ctx.globalAlpha = a * glowP * 0.15; ctx.fillStyle = FB.gold;
    ctx.beginPath(); ctx.arc(cx, cy, glowR, 0, Math.PI * 2); ctx.fill();
    // "MOUTH EXTENDS" below
    const extP = interpolate(frame, [55, 78], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "MOUTH EXTENDS", cx, H * 0.68, 12 * s, a * extP, "center", FB.gold);
    // Proboscis line
    const probLen = extP * 16 * s;
    ctx.globalAlpha = a * extP; ctx.strokeStyle = FB.gold; ctx.lineWidth = 3 * s; ctx.lineCap = "round";
    ctx.beginPath(); ctx.moveTo(cx, H * 0.74); ctx.lineTo(cx, H * 0.74 + probLen); ctx.stroke();
    const endP = interpolate(frame, [85, 108], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "FEEDING BEHAVIOR", cx, H * 0.92, 10 * s, a * endP, "center", FB.gold);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V4: oscilloscope — MN9 at 61 Hz spiking ----------
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
    drawFBText(ctx, "MN9 RESPONSE TO RED LIGHT", cx, H * 0.06, 8 * s, a, "center", FB.text.dim);
    // Red on indicator
    const onP = interpolate(frame, [10, 20], [0, 1], { extrapolateRight: "clamp" });
    ctx.globalAlpha = a * onP; ctx.fillStyle = FB.red;
    ctx.beginPath(); ctx.arc(W * 0.08, H * 0.06, 4 * s, 0, Math.PI * 2); ctx.fill();
    // Trace
    const traceY = H * 0.2, traceH = H * 0.35;
    ctx.globalAlpha = a * 0.12; ctx.strokeStyle = FB.text.dim; ctx.lineWidth = 1 * s;
    ctx.strokeRect(W * 0.06, traceY, W * 0.88, traceH);
    const fireP = interpolate(frame, [20, 35], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.beginPath(); ctx.moveTo(W * 0.08, traceY + traceH * 0.8);
    for (let x = 0; x < 50; x++) {
      const px = W * 0.08 + (x / 50) * W * 0.84;
      const frac = x / 50;
      const spike = frac > 0.12 && fireP > 0 ? Math.max(0, Math.sin((frac - 0.12) * 50) * 0.55) : 0;
      const revP = interpolate(frame, [20 + frac * 50, 28 + frac * 50], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      ctx.lineTo(px, traceY + traceH * (0.8 - spike * revP));
    }
    ctx.globalAlpha = a; ctx.strokeStyle = FB.gold; ctx.lineWidth = 2 * s; ctx.stroke();
    drawFBCounter(ctx, "61 Hz", cx, traceY + traceH + 14 * s, 14 * s, FB.gold, a * fireP);
    // "Mouth extends" label
    const extP = interpolate(frame, [70, 95], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "MOUTH EXTENDS TO EAT", cx, H * 0.82, 11 * s, a * extP, "center", FB.gold);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V5: fly head close-up — proboscis sliding out ----------
const V5: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 120);
    const s = Math.min(W, H) / 360;
    const cx = W / 2, cy = H * 0.35;
    // Head shape
    const headP = interpolate(frame, [5, 25], [0, 1], { extrapolateRight: "clamp" });
    ctx.globalAlpha = a * headP; ctx.fillStyle = `hsla(180, 55%, 55%, 0.8)`;
    ctx.beginPath(); ctx.ellipse(cx, cy, 30 * s, 22 * s, 0, 0, Math.PI * 2); ctx.fill();
    // Eyes
    ctx.fillStyle = "rgba(255,255,255,0.9)";
    ctx.beginPath(); ctx.arc(cx - 12 * s, cy - 5 * s, 6 * s, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(cx + 12 * s, cy - 5 * s, 6 * s, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "rgba(30,20,40,0.85)";
    ctx.beginPath(); ctx.arc(cx - 12 * s, cy - 5 * s, 4 * s, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(cx + 12 * s, cy - 5 * s, 4 * s, 0, Math.PI * 2); ctx.fill();
    // Proboscis extending
    const extP = interpolate(frame, [35, 70], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const probLen = extP * 30 * s;
    ctx.strokeStyle = FB.gold; ctx.lineWidth = 4 * s; ctx.lineCap = "round";
    ctx.beginPath(); ctx.moveTo(cx, cy + 22 * s); ctx.lineTo(cx, cy + 22 * s + probLen); ctx.stroke();
    // Small gold tip
    if (extP > 0.5) {
      ctx.fillStyle = FB.gold; ctx.beginPath();
      ctx.arc(cx, cy + 22 * s + probLen, 3 * s, 0, Math.PI * 2); ctx.fill();
    }
    // MN9 label
    const mn9P = interpolate(frame, [15, 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "MN9 ACTIVE", cx, H * 0.08, 9 * s, a * mn9P, "center", FB.gold);
    // Red light
    ctx.globalAlpha = a * mn9P * 0.3; ctx.fillStyle = FB.red;
    ctx.beginPath(); ctx.arc(W * 0.12, H * 0.08, 4 * s, 0, Math.PI * 2); ctx.fill();
    const endP = interpolate(frame, [80, 105], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "MOUTH EXTENDS TO EAT", cx, H * 0.88, 11 * s, a * endP, "center", FB.gold);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V6: before/after — light off mouth closed, light on mouth open ----------
const V6: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 120);
    const s = Math.min(W, H) / 360;
    // Divider
    ctx.globalAlpha = a * 0.2; ctx.fillStyle = FB.text.dim; ctx.fillRect(W / 2 - 1, H * 0.1, 2, H * 0.6);
    // Left: off
    const offP = interpolate(frame, [10, 28], [0, 1], { extrapolateRight: "clamp" });
    drawFBText(ctx, "LIGHT OFF", W * 0.25, H * 0.1, 9 * s, a * offP, "center", FB.text.dim);
    drawFBNode(ctx, W * 0.25, H * 0.32, 12 * s, 7, a * offP * 0.3, 0);
    drawFBText(ctx, "MN9: silent", W * 0.25, H * 0.48, 7 * s, a * offP, "center", FB.text.dim);
    drawFBText(ctx, "Mouth closed", W * 0.25, H * 0.56, 7 * s, a * offP, "center", FB.text.dim);
    // Right: on
    const onP = interpolate(frame, [35, 55], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "RED LIGHT ON", W * 0.75, H * 0.1, 9 * s, a * onP, "center", FB.red);
    ctx.globalAlpha = a * onP * 0.15; ctx.fillStyle = FB.gold;
    ctx.beginPath(); ctx.arc(W * 0.75, H * 0.32, 20 * s, 0, Math.PI * 2); ctx.fill();
    drawFBNode(ctx, W * 0.75, H * 0.32, 12 * s, 2, a * onP, frame);
    drawFBText(ctx, "MN9: 61 Hz", W * 0.75, H * 0.48, 7 * s, a * onP, "center", FB.gold);
    // Proboscis line
    const probP = interpolate(frame, [50, 68], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = a * probP; ctx.strokeStyle = FB.gold; ctx.lineWidth = 3 * s; ctx.lineCap = "round";
    ctx.beginPath(); ctx.moveTo(W * 0.75, H * 0.56); ctx.lineTo(W * 0.75, H * 0.56 + probP * 12 * s); ctx.stroke();
    drawFBText(ctx, "Mouth extends", W * 0.75, H * 0.58 + probP * 12 * s + 6 * s, 7 * s, a * probP, "center", FB.gold);
    const endP = interpolate(frame, [78, 105], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "MN9 = FEEDING TRIGGER", W / 2, H * 0.85, 11 * s, a * endP, "center", FB.gold);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V7: "MN9" big label with radiating gold rings ----------
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
    // Radiating rings
    const ringP = interpolate(frame, [20, 50], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    for (let i = 0; i < 4; i++) {
      const r = (20 + i * 12 + frame * 0.3) * s;
      const ringA = Math.max(0, 0.2 - i * 0.05) * ringP;
      ctx.globalAlpha = a * ringA; ctx.strokeStyle = FB.gold; ctx.lineWidth = 1.5 * s;
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
    }
    // MN9 text
    const txtP = interpolate(frame, [10, 28], [0, 1], { extrapolateRight: "clamp" });
    drawFBText(ctx, "MN9", cx, cy, 22 * s, a * txtP, "center", FB.gold);
    // Red light indicator
    ctx.globalAlpha = a * txtP * 0.5; ctx.fillStyle = FB.red;
    ctx.beginPath(); ctx.arc(cx, cy - 22 * s, 4 * s, 0, Math.PI * 2); ctx.fill();
    // Description
    const descP = interpolate(frame, [50, 70], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "motor neuron 9", cx, H * 0.55, 9 * s, a * descP, "center", FB.text.dim);
    drawFBText(ctx, "controls proboscis", cx, H * 0.62, 9 * s, a * descP, "center", FB.text.dim);
    const endP = interpolate(frame, [78, 105], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "MOUTH EXTENDS TO EAT", cx, H * 0.78, 12 * s, a * endP, "center", FB.gold);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V8: network dim, MN9 bright, downstream mouth effector ----------
const V8: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 120);
    const s = Math.min(W, H) / 360;
    const rng = seeded(678);
    // Background network
    const nodes: [number, number][] = [];
    for (let i = 0; i < 10; i++) nodes.push([W * 0.08 + rng() * W * 0.84, H * 0.08 + rng() * H * 0.48]);
    // MN9 is node 0
    nodes[0] = [W / 2, H * 0.3];
    for (let i = 0; i < 14; i++) {
      const fi = Math.floor(rng() * 10), ti = Math.floor(rng() * 10);
      if (fi !== ti) drawFBColorEdge(ctx, nodes[fi][0], nodes[fi][1], nodes[ti][0], nodes[ti][1], FB.text.dim, s * 0.3, a * 0.1);
    }
    nodes.forEach(([x, y], i) => {
      if (i === 0) return;
      drawFBNode(ctx, x, y, 4 * s, (i + 3) % 8, a * 0.15, frame);
    });
    // MN9 bright
    const mn9P = interpolate(frame, [15, 35], [0, 1], { extrapolateRight: "clamp" });
    drawFBNode(ctx, nodes[0][0], nodes[0][1], 14 * s, 2, a * mn9P, frame);
    ctx.globalAlpha = a * mn9P * 0.2; ctx.fillStyle = FB.gold;
    ctx.beginPath(); ctx.arc(nodes[0][0], nodes[0][1], 22 * s, 0, Math.PI * 2); ctx.fill();
    drawFBText(ctx, "MN9", nodes[0][0], nodes[0][1] + 20 * s, 9 * s, a * mn9P, "center", FB.gold);
    // Arrow to mouth
    const arrP = interpolate(frame, [45, 62], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = a * arrP; ctx.strokeStyle = FB.gold; ctx.lineWidth = 2 * s;
    ctx.beginPath(); ctx.moveTo(W / 2, H * 0.42); ctx.lineTo(W / 2, H * 0.6); ctx.stroke();
    // Mouth effector
    drawFBNode(ctx, W / 2, H * 0.65, 10 * s, 1, a * arrP, frame);
    drawFBText(ctx, "MOUTH", W / 2, H * 0.65 + 14 * s, 8 * s, a * arrP, "center", FB.gold);
    const endP = interpolate(frame, [72, 100], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "EXTENDS TO EAT", W / 2, H * 0.88, 12 * s, a * endP, "center", FB.gold);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V9: red light → "MN9" counter → mouth icon opening ----------
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
    // Red light pulse
    const lightP = interpolate(frame, [5, 18], [0, 1], { extrapolateRight: "clamp" });
    const lightGlow = 0.5 + 0.5 * Math.sin(frame * 0.2);
    ctx.globalAlpha = a * lightP * lightGlow * 0.3; ctx.fillStyle = FB.red;
    ctx.beginPath(); ctx.arc(cx, H * 0.1, 8 * s, 0, Math.PI * 2); ctx.fill();
    drawFBText(ctx, "RED LIGHT", cx, H * 0.1 + 12 * s, 7 * s, a * lightP, "center", FB.red);
    // MN9 label
    const mn9P = interpolate(frame, [22, 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "MN9", cx, H * 0.32, 18 * s, a * mn9P, "center", FB.gold);
    drawFBText(ctx, "MOTOR NEURON 9", cx, H * 0.42, 7 * s, a * mn9P, "center", FB.text.dim);
    // Mouth opening animation
    const openP = interpolate(frame, [50, 78], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const mouthY = H * 0.6;
    // Top lip
    ctx.globalAlpha = a * openP; ctx.fillStyle = FB.teal;
    ctx.beginPath(); ctx.ellipse(cx, mouthY - openP * 5 * s, 14 * s, 5 * s, 0, Math.PI, Math.PI * 2); ctx.fill();
    // Bottom lip
    ctx.beginPath(); ctx.ellipse(cx, mouthY + openP * 5 * s, 14 * s, 5 * s, 0, 0, Math.PI); ctx.fill();
    // Proboscis
    if (openP > 0.4) {
      ctx.strokeStyle = FB.gold; ctx.lineWidth = 3 * s; ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(cx, mouthY + openP * 5 * s + 5 * s);
      ctx.lineTo(cx, mouthY + openP * 5 * s + 5 * s + (openP - 0.4) * 25 * s); ctx.stroke();
    }
    const endP = interpolate(frame, [82, 108], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "FEEDING", cx, H * 0.9, 14 * s, a * endP, "center", FB.gold);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

export const VARIANTS_FB_067: VariantDef[] = [
  { id: "fb-067-v1", label: "Red flash MN9 lights up mouth extends", component: V1 },
  { id: "fb-067-v2", label: "Circuit red to MN9 to eat", component: V2 },
  { id: "fb-067-v3", label: "MN9 cell with FEED glow", component: V3 },
  { id: "fb-067-v4", label: "Oscilloscope MN9 at 61 Hz", component: V4 },
  { id: "fb-067-v5", label: "Fly head proboscis extending", component: V5 },
  { id: "fb-067-v6", label: "Before/after light off vs on", component: V6 },
  { id: "fb-067-v7", label: "MN9 big label radiating gold rings", component: V7 },
  { id: "fb-067-v8", label: "Network dim MN9 bright to mouth", component: V8 },
  { id: "fb-067-v9", label: "Red pulse MN9 counter mouth opens", component: V9 },
];
