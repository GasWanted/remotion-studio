import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantDef, VariantProps } from "../types";
import { FB, seeded, drawFBBg, drawFBNode, drawFBEdge, drawFBText, drawFBCounter, fadeInOut, cellHSL, drawFBColorEdge } from "./flatbold-kit";

/* Shot 54 — "Walking in a straight line is something a Roomba can do. I wanted to know if it could think." — 120 frames */

// ---------- V1: Boring straight line, then "THINK?" explodes ----------
const V1: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 120);
    // Boring straight line — dot moves across
    const lineP = interpolate(frame, [5, 50], [0, 1], { extrapolateRight: "clamp" });
    ctx.globalAlpha = a * 0.15; ctx.strokeStyle = FB.text.dim; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(W * 0.1, H * 0.38); ctx.lineTo(W * 0.9, H * 0.38); ctx.stroke();
    const dotX = W * 0.1 + lineP * W * 0.8;
    drawFBNode(ctx, dotX, H * 0.38, 6, 5, a * 0.5, frame);
    // "straight line..." label
    const boringP = interpolate(frame, [15, 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "straight line...", W / 2, H * 0.25, 10, a * boringP * 0.5, "center", FB.text.dim);
    // "THINK?" appears dramatically
    const thinkP = interpolate(frame, [60, 80], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const thinkSize = 18 + (1 - thinkP) * 10;
    drawFBText(ctx, "can it THINK?", W / 2, H * 0.65, thinkSize, a * thinkP, "center", FB.gold);
    // Burst behind text
    if (thinkP > 0 && thinkP < 0.8) {
      ctx.globalAlpha = a * (1 - thinkP) * 0.2; ctx.fillStyle = FB.gold;
      ctx.beginPath(); ctx.arc(W / 2, H * 0.65, 30 + thinkP * 40, 0, Math.PI * 2); ctx.fill();
    }
    // Neurons hinting at complexity
    const neurP = interpolate(frame, [85, 110], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const rng = seeded(5400);
    for (let i = 0; i < 6; i++) {
      const nx = W * 0.15 + rng() * W * 0.7;
      const ny = H * 0.45 + rng() * H * 0.35;
      drawFBNode(ctx, nx, ny, 3, i, a * neurP * 0.3, frame);
    }
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V2: Roomba circle icon with boring arrow, vs brain icon ----------
const V2: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 120);
    // Roomba — simple circle on left
    const rmbP = interpolate(frame, [5, 25], [0, 1], { extrapolateRight: "clamp" });
    ctx.globalAlpha = a * rmbP * 0.3; ctx.strokeStyle = FB.text.dim; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(W * 0.25, H * 0.38, 18, 0, Math.PI * 2); ctx.stroke();
    drawFBText(ctx, "ROOMBA", W * 0.25, H * 0.55, 8, a * rmbP, "center", FB.text.dim);
    // Straight arrow from roomba
    ctx.globalAlpha = a * rmbP * 0.2; ctx.strokeStyle = FB.text.dim; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(W * 0.25 + 20, H * 0.38); ctx.lineTo(W * 0.42, H * 0.38); ctx.stroke();
    drawFBText(ctx, "straight", W * 0.35, H * 0.32, 7, a * rmbP * 0.4, "center", FB.text.dim);
    // "vs"
    const vsP = interpolate(frame, [30, 45], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "vs", W / 2, H * 0.38, 12, a * vsP * 0.4, "center", FB.text.dim);
    // Brain node on right
    const brainP = interpolate(frame, [40, 60], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBNode(ctx, W * 0.75, H * 0.38, 18, 6, a * brainP, frame);
    drawFBText(ctx, "BRAIN", W * 0.75, H * 0.55, 8, a * brainP, "center", FB.purple);
    // "can it THINK?"
    const thinkP = interpolate(frame, [65, 90], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "can it THINK?", W / 2, H * 0.78, 14, a * thinkP, "center", FB.gold);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V3: Straight line crossed out, question mark appears ----------
const V3: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 120);
    // Straight line
    const lineP = interpolate(frame, [5, 30], [0, 1], { extrapolateRight: "clamp" });
    ctx.globalAlpha = a * lineP * 0.3; ctx.strokeStyle = FB.text.dim; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(W * 0.15, H * 0.32); ctx.lineTo(W * 0.85, H * 0.32); ctx.stroke();
    drawFBText(ctx, "walking straight", W / 2, H * 0.22, 10, a * lineP, "center", FB.text.dim);
    // Strikethrough
    const strikeP = interpolate(frame, [35, 50], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = a * strikeP * 0.5; ctx.strokeStyle = FB.red; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(W * 0.15, H * 0.32); ctx.lineTo(W * 0.15 + strikeP * W * 0.7, H * 0.32); ctx.stroke();
    drawFBText(ctx, "boring", W / 2, H * 0.4, 8, a * strikeP, "center", FB.red);
    // Big question mark
    const qP = interpolate(frame, [55, 80], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const qSize = 30 + (1 - qP) * 15;
    drawFBText(ctx, "?", W / 2, H * 0.62, qSize, a * qP, "center", FB.gold);
    drawFBText(ctx, "can it THINK?", W / 2, H * 0.82, 12, a * qP, "center", FB.gold);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V4: Escalation — straight line, then branching paths appear ----------
const V4: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 120);
    // Simple straight line
    const lineP = interpolate(frame, [5, 30], [0, 1], { extrapolateRight: "clamp" });
    ctx.globalAlpha = a * lineP * 0.2; ctx.strokeStyle = FB.text.dim; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(W * 0.1, H * 0.25); ctx.lineTo(W * 0.9, H * 0.25); ctx.stroke();
    drawFBText(ctx, "easy", W * 0.5, H * 0.2, 8, a * lineP * 0.5, "center", FB.text.dim);
    // Fork appears
    const forkP = interpolate(frame, [35, 60], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (forkP > 0) {
      ctx.globalAlpha = a * forkP * 0.3; ctx.strokeStyle = FB.gold; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(W * 0.3, H * 0.5); ctx.lineTo(W / 2, H * 0.45);
      ctx.lineTo(W * 0.7, H * 0.38); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(W / 2, H * 0.45); ctx.lineTo(W * 0.7, H * 0.55); ctx.stroke();
      drawFBNode(ctx, W * 0.7, H * 0.38, 5, 3, a * forkP, frame);
      drawFBNode(ctx, W * 0.7, H * 0.55, 5, 0, a * forkP, frame);
      drawFBText(ctx, "choice", W / 2, H * 0.58, 8, a * forkP, "center", FB.gold);
    }
    // "THINK?" big
    const thinkP = interpolate(frame, [65, 90], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "can it THINK?", W / 2, H * 0.78, 16, a * thinkP, "center", FB.gold);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V5: "Walking" small and dim, "THINKING" large and bright ----------
const V5: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 120);
    // "walking" small
    const walkP = interpolate(frame, [5, 25], [0, 1], { extrapolateRight: "clamp" });
    drawFBText(ctx, "walking", W / 2, H * 0.25, 9, a * walkP * 0.4, "center", FB.text.dim);
    drawFBText(ctx, "a Roomba can do that", W / 2, H * 0.34, 7, a * walkP * 0.3, "center", FB.text.dim);
    // "THINKING" grows from center
    const thinkP = interpolate(frame, [40, 70], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const size = 8 + thinkP * 18;
    drawFBText(ctx, "THINKING", W / 2, H * 0.58, size, a * thinkP, "center", FB.gold);
    // Radiating lines
    if (thinkP > 0.5) {
      const radP = (thinkP - 0.5) * 2;
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        ctx.globalAlpha = a * radP * 0.15; ctx.strokeStyle = FB.gold; ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(W / 2 + Math.cos(angle) * 25, H * 0.58 + Math.sin(angle) * 18);
        ctx.lineTo(W / 2 + Math.cos(angle) * (25 + radP * 20), H * 0.58 + Math.sin(angle) * (18 + radP * 15));
        ctx.stroke();
      }
    }
    // "?"
    const qP = interpolate(frame, [75, 100], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "?", W * 0.75, H * 0.55, 22, a * qP * 0.6, "center", FB.gold);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V6: Yawn emoji metaphor — boring, then snap to attention ----------
const V6: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 120);
    // Boring cell with droopy eyes
    const boringP = interpolate(frame, [5, 55], [1, 1], { extrapolateRight: "clamp" });
    const snap = frame > 55;
    const cx = W / 2, cy = H * 0.38;
    drawFBNode(ctx, cx, cy, 20, snap ? 1 : 5, a * boringP, frame);
    // Override eyes for boring — half-closed
    if (!snap) {
      ctx.globalAlpha = a * 0.6; ctx.fillStyle = FB.text.dim;
      ctx.fillRect(cx - 8, cy - 4, 5, 2);
      ctx.fillRect(cx + 3, cy - 4, 5, 2);
    }
    drawFBText(ctx, snap ? "" : "zzz...", cx + 25, cy - 15, 8, a * 0.3, "left", FB.text.dim);
    // Label
    const boringLabel = interpolate(frame, [10, 30, 50, 55], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "straight line walking", cx, H * 0.58, 9, a * boringLabel, "center", FB.text.dim);
    // After snap
    if (snap) {
      const thinkP = interpolate(frame, [55, 80], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      drawFBText(ctx, "can it THINK?", cx, H * 0.68, 16, a * thinkP, "center", FB.gold);
      // Spark lines around cell
      for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2 + frame * 0.05;
        ctx.globalAlpha = a * thinkP * 0.2; ctx.strokeStyle = FB.gold; ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(angle) * 25, cy + Math.sin(angle) * 25);
        ctx.lineTo(cx + Math.cos(angle) * 32, cy + Math.sin(angle) * 32);
        ctx.stroke();
      }
    }
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V7: Progress bar labeled "difficulty" jumps from 0% to 100% ----------
const V7: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 120);
    // "Walking" row — easy
    const walkP = interpolate(frame, [5, 25], [0, 1], { extrapolateRight: "clamp" });
    drawFBText(ctx, "walking", W * 0.08, H * 0.3, 9, a * walkP, "left", FB.text.dim);
    ctx.globalAlpha = a * walkP * 0.1; ctx.fillStyle = "rgba(255,255,255,0.05)";
    ctx.fillRect(W * 0.3, H * 0.26, W * 0.6, H * 0.06);
    ctx.globalAlpha = a * walkP * 0.4; ctx.fillStyle = FB.text.dim;
    ctx.fillRect(W * 0.3, H * 0.26, W * 0.08, H * 0.06);
    drawFBText(ctx, "easy", W * 0.92, H * 0.29, 7, a * walkP * 0.5, "left", FB.text.dim);
    // "Thinking" row — hard
    const thinkP = interpolate(frame, [40, 65], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "thinking", W * 0.08, H * 0.52, 9, a * thinkP, "left", FB.gold);
    ctx.globalAlpha = a * thinkP * 0.1; ctx.fillStyle = "rgba(255,255,255,0.05)";
    ctx.fillRect(W * 0.3, H * 0.48, W * 0.6, H * 0.06);
    ctx.globalAlpha = a * thinkP * 0.6; ctx.fillStyle = FB.gold;
    ctx.fillRect(W * 0.3, H * 0.48, W * 0.55 * thinkP, H * 0.06);
    drawFBText(ctx, "hard", W * 0.92, H * 0.51, 7, a * thinkP, "left", FB.gold);
    // "?" at bottom
    const qP = interpolate(frame, [70, 95], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "can it THINK?", W / 2, H * 0.78, 14, a * qP, "center", FB.gold);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V8: Dotted path bends into a maze shape ----------
const V8: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 120);
    // Straight dotted line first
    const straightP = interpolate(frame, [5, 30], [0, 1], { extrapolateRight: "clamp" });
    ctx.globalAlpha = a * straightP * 0.2; ctx.strokeStyle = FB.text.dim; ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    ctx.beginPath(); ctx.moveTo(W * 0.1, H * 0.2); ctx.lineTo(W * 0.9, H * 0.2); ctx.stroke();
    ctx.setLineDash([]);
    drawFBText(ctx, "straight = easy", W / 2, H * 0.14, 8, a * straightP * 0.5, "center", FB.text.dim);
    // Maze path forms below
    const mazeP = interpolate(frame, [35, 75], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (mazeP > 0) {
      ctx.globalAlpha = a * mazeP * 0.25; ctx.strokeStyle = FB.gold; ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(W * 0.1, H * 0.45);
      ctx.lineTo(W * 0.3, H * 0.45);
      ctx.lineTo(W * 0.3, H * 0.55);
      ctx.lineTo(W * 0.5, H * 0.55);
      ctx.lineTo(W * 0.5, H * 0.4);
      ctx.lineTo(W * 0.65, H * 0.4);
      ctx.lineTo(W * 0.65, H * 0.6);
      ctx.lineTo(W * 0.85, H * 0.6);
      ctx.stroke();
      // Fork markers
      drawFBNode(ctx, W * 0.3, H * 0.5, 4, 3, a * mazeP, frame);
      drawFBNode(ctx, W * 0.5, H * 0.48, 4, 0, a * mazeP, frame);
      drawFBNode(ctx, W * 0.65, H * 0.5, 4, 1, a * mazeP, frame);
    }
    // "can it THINK?"
    const qP = interpolate(frame, [78, 105], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "can it THINK?", W / 2, H * 0.82, 14, a * qP, "center", FB.gold);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V9: Two words side by side — "WALK" dim, "THINK" pulses ----------
const V9: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 120);
    // "WALK" appears first, dim
    const walkP = interpolate(frame, [5, 25], [0, 1], { extrapolateRight: "clamp" });
    drawFBText(ctx, "WALK", W * 0.3, H * 0.42, 18, a * walkP * 0.3, "center", FB.text.dim);
    // Strikethrough on walk
    const crossP = interpolate(frame, [30, 45], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = a * crossP * 0.4; ctx.strokeStyle = FB.red; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(W * 0.18, H * 0.42); ctx.lineTo(W * 0.18 + crossP * W * 0.24, H * 0.42); ctx.stroke();
    // "THINK" appears, pulsing
    const thinkP = interpolate(frame, [45, 70], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const pulse = 1 + Math.sin(frame * 0.1) * 0.05 * thinkP;
    drawFBText(ctx, "THINK", W * 0.7, H * 0.42, 18 * pulse, a * thinkP, "center", FB.gold);
    // "?" floating
    const qP = interpolate(frame, [70, 90], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const qY = H * 0.42 - 25 - Math.sin(frame * 0.05) * 5;
    drawFBText(ctx, "?", W * 0.82, qY, 16, a * qP, "center", FB.gold);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

export const VARIANTS_FB_054: VariantDef[] = [
  { id: "fb-054-v1", label: "Boring line then THINK explodes", component: V1 },
  { id: "fb-054-v2", label: "Roomba circle vs brain node", component: V2 },
  { id: "fb-054-v3", label: "Straight line crossed out, question mark", component: V3 },
  { id: "fb-054-v4", label: "Simple line then forking choice paths", component: V4 },
  { id: "fb-054-v5", label: "Walking small, THINKING grows large", component: V5 },
  { id: "fb-054-v6", label: "Boring cell snaps awake", component: V6 },
  { id: "fb-054-v7", label: "Difficulty bars — easy walk vs hard think", component: V7 },
  { id: "fb-054-v8", label: "Straight path bends into maze", component: V8 },
  { id: "fb-054-v9", label: "WALK dim and crossed, THINK pulses", component: V9 },
];
