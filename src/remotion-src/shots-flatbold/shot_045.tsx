import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantDef, VariantProps } from "../types";
import { FB, seeded, drawFBBg, drawFBNode, drawFBEdge, drawFBText, drawFBCounter, fadeInOut, cellHSL, drawFBColorEdge, drawPersonBlob } from "./flatbold-kit";

/* Shot 045 — "But a brain without a body is just numbers. It can signal 'eat,'
   but there's no mouth to move." — 150 frames (5s).
   Brain alone, signal goes nowhere. */

const DUR = 150;

function stagger(frame: number, idx: number, delay: number, dur: number) {
  const s = idx * delay; if (frame < s) return 0; if (frame > s + dur) return 1; return (frame - s) / dur;
}

/* ── V1: Brain sends "EAT" signal → arrow goes right → hits void/nothing ── */
const V1: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, DUR);
    const cx = W * 0.25, cy = H * 0.42;
    // Brain cluster
    const rng = seeded(4501);
    for (let i = 0; i < 6; i++) {
      const nx = cx - 15 + rng() * 30, ny = cy - 12 + rng() * 24;
      drawFBNode(ctx, nx, ny, 4 + rng() * 3, i, a, frame);
    }
    drawFBText(ctx, "BRAIN", cx, cy + 25, 8, a, "center", FB.text.primary);
    // Signal "EAT"
    const sigP = interpolate(frame, [30, 70], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const sigX = cx + 25 + sigP * W * 0.4;
    if (sigP > 0 && sigP < 1) {
      ctx.globalAlpha = a * 0.7; ctx.fillStyle = FB.gold;
      ctx.beginPath(); ctx.arc(sigX, cy, 4, 0, Math.PI * 2); ctx.fill();
      drawFBText(ctx, "EAT", sigX, cy - 10, 8, a * 0.8, "center", FB.gold);
    }
    // Arrow trail
    ctx.globalAlpha = a * sigP * 0.3; ctx.strokeStyle = FB.gold; ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]); ctx.beginPath();
    ctx.moveTo(cx + 20, cy); ctx.lineTo(sigX, cy);
    ctx.stroke(); ctx.setLineDash([]);
    // Nothing on right — question mark
    if (sigP >= 1) {
      const fadeP = interpolate(frame, [70, 100], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      drawFBText(ctx, "?", W * 0.78, cy, 20, a * fadeP, "center", FB.text.dim);
      drawFBText(ctx, "NO BODY", W * 0.78, cy + 22, 8, a * fadeP, "center", FB.text.dim);
      // Signal fizzles
      ctx.globalAlpha = a * (1 - fadeP) * 0.5; ctx.fillStyle = FB.gold;
      ctx.beginPath(); ctx.arc(W * 0.68, cy, 3 * (1 - fadeP), 0, Math.PI * 2); ctx.fill();
    }
    drawFBText(ctx, "JUST NUMBERS", W / 2, H * 0.88, 10, a, "center", FB.text.dim);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* ── V2: Brain on one side, dashed outline of fly body (ghost) on other ── */
const V2: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, DUR);
    // Brain on left
    drawFBNode(ctx, W * 0.25, H * 0.42, 16, 4, a, frame);
    drawFBText(ctx, "BRAIN", W * 0.25, H * 0.58, 8, a, "center", FB.text.primary);
    // Ghost body outline on right (dashed)
    ctx.globalAlpha = a * 0.2; ctx.strokeStyle = FB.text.dim; ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.beginPath(); ctx.ellipse(W * 0.72, H * 0.42, W * 0.12, H * 0.22, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.setLineDash([]);
    drawFBText(ctx, "MISSING", W * 0.72, H * 0.42, 9, a * 0.3, "center", FB.text.dim);
    drawFBText(ctx, "BODY", W * 0.72, H * 0.58, 8, a * 0.3, "center", FB.text.dim);
    // Signal that goes nowhere
    const sigP = interpolate(frame, [40, 80], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = a * sigP * 0.4; ctx.strokeStyle = FB.gold; ctx.lineWidth = 1.5;
    ctx.setLineDash([3, 3]); ctx.beginPath();
    ctx.moveTo(W * 0.35, H * 0.42); ctx.lineTo(W * 0.35 + sigP * W * 0.2, H * 0.42);
    ctx.stroke(); ctx.setLineDash([]);
    if (sigP > 0.5) {
      drawFBText(ctx, "'eat'", W * 0.48, H * 0.35, 8, a * (sigP - 0.5) * 2, "center", FB.gold);
    }
    // X mark where signal ends
    if (sigP >= 1) {
      const xP = interpolate(frame, [80, 100], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      ctx.globalAlpha = a * xP * 0.5; ctx.strokeStyle = FB.red; ctx.lineWidth = 2;
      const mx = W * 0.57, my = H * 0.42;
      ctx.beginPath(); ctx.moveTo(mx - 6, my - 6); ctx.lineTo(mx + 6, my + 6); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(mx + 6, my - 6); ctx.lineTo(mx - 6, my + 6); ctx.stroke();
    }
    drawFBText(ctx, "NO MOUTH TO MOVE", W / 2, H * 0.88, 9, a, "center", FB.text.dim);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* ── V3: Numbers floating in void — just raw data, no form ── */
const V3: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, DUR);
    const cx = W / 2, cy = H * 0.42;
    // Floating numbers
    const rng = seeded(4503);
    const nums = ["0.73", "-1.2", "0.44", "2.1", "-0.8", "1.7", "0.3", "-0.5", "1.9", "0.6"];
    nums.forEach((n, i) => {
      const baseX = cx - W * 0.3 + rng() * W * 0.6;
      const baseY = cy - H * 0.2 + rng() * H * 0.4;
      const drift = Math.sin(frame * 0.02 + i) * 5;
      ctx.globalAlpha = a * 0.4; ctx.fillStyle = FB.teal;
      ctx.font = "bold 7px 'Courier New', monospace"; ctx.textAlign = "center";
      ctx.fillText(n, baseX + drift, baseY + Math.cos(frame * 0.015 + i * 0.7) * 3);
    });
    drawFBText(ctx, "JUST NUMBERS", cx, H * 0.12, 10, a, "center", FB.text.dim);
    // "EAT" signal that fizzles
    const sigP = interpolate(frame, [60, 100], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (sigP > 0) {
      drawFBText(ctx, "'eat'", cx, H * 0.72, 10, a * sigP * (1 - sigP), "center", FB.gold);
      // Dissolving particles
      for (let p = 0; p < 5; p++) {
        const px = cx - 10 + rng() * 20;
        const py = H * 0.72 + sigP * 15 + rng() * 10;
        ctx.globalAlpha = a * (1 - sigP) * 0.3; ctx.fillStyle = FB.gold;
        ctx.beginPath(); ctx.arc(px, py, 1.5, 0, Math.PI * 2); ctx.fill();
      }
    }
    drawFBText(ctx, "NO BODY TO ACT", cx, H * 0.88, 9, a, "center", FB.text.dim);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* ── V4: Brain node sending signals that bounce back — no receiver ── */
const V4: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, DUR);
    const cx = W * 0.3, cy = H * 0.42;
    drawFBNode(ctx, cx, cy, 14, 4, a, frame);
    drawFBText(ctx, "BRAIN", cx, cy + 22, 8, a, "center", FB.text.primary);
    // Multiple signals that go out and fizzle
    const signals = [
      { label: "EAT", delay: 20, ang: -0.3, color: FB.gold },
      { label: "WALK", delay: 50, ang: 0, color: FB.green },
      { label: "JUMP", delay: 80, ang: 0.3, color: FB.red },
    ];
    signals.forEach((sig) => {
      const sigP = interpolate(frame, [sig.delay, sig.delay + 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      if (sigP <= 0) return;
      const dist = sigP * W * 0.4;
      const sx = cx + 18 + dist * Math.cos(sig.ang);
      const sy = cy + dist * Math.sin(sig.ang);
      // Fading signal
      const fadeA = Math.max(0, 1 - sigP * 1.5);
      ctx.globalAlpha = a * fadeA * 0.5; ctx.fillStyle = sig.color;
      ctx.beginPath(); ctx.arc(sx, sy, 3 * fadeA, 0, Math.PI * 2); ctx.fill();
      drawFBText(ctx, sig.label, sx, sy - 8, 7, a * fadeA * 0.7, "center", sig.color);
    });
    // Wall / void on right
    ctx.globalAlpha = a * 0.15; ctx.strokeStyle = FB.text.dim; ctx.lineWidth = 1;
    ctx.setLineDash([3, 5]); ctx.beginPath();
    ctx.moveTo(W * 0.75, H * 0.15); ctx.lineTo(W * 0.75, H * 0.75);
    ctx.stroke(); ctx.setLineDash([]);
    drawFBText(ctx, "NOTHING", W * 0.82, cy, 9, a * 0.4, "center", FB.text.dim);
    drawFBText(ctx, "SIGNALS GO NOWHERE", W / 2, H * 0.88, 9, a, "center", FB.text.dim);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* ── V5: Speaker with no sound — brain "speaks" but nothing happens ── */
const V5: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, DUR);
    const cx = W / 2, cy = H * 0.38;
    // Brain "speaking"
    drawFBNode(ctx, cx, cy, 16, 4, a, frame);
    // Speech bubble attempt
    const talkP = interpolate(frame, [30, 60], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (talkP > 0) {
      // Bubble outline (dashed = weak)
      ctx.globalAlpha = a * talkP * 0.3; ctx.strokeStyle = FB.gold; ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.ellipse(cx + 30, cy - 20, 20, 12, 0, 0, Math.PI * 2);
      ctx.stroke(); ctx.setLineDash([]);
      drawFBText(ctx, "eat", cx + 30, cy - 20, 8, a * talkP * 0.5, "center", FB.gold);
    }
    // Muted / crossed out
    const muteP = interpolate(frame, [70, 90], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (muteP > 0) {
      ctx.globalAlpha = a * muteP * 0.5; ctx.strokeStyle = FB.red; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(cx + 12, cy - 30); ctx.lineTo(cx + 48, cy - 10); ctx.stroke();
    }
    drawFBText(ctx, "BRAIN SIGNALS", cx, H * 0.62, 9, a, "center", FB.text.primary);
    drawFBText(ctx, "BUT NO BODY TO RESPOND", cx, H * 0.72, 8, a * muteP, "center", FB.text.dim);
    drawFBText(ctx, "JUST NUMBERS", cx, H * 0.88, 10, a, "center", FB.text.dim);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* ── V6: Equation: Brain - Body = 0 (numbers only) ── */
const V6: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, DUR);
    const cy = H * 0.42;
    const p1 = interpolate(frame, [10, 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const p2 = interpolate(frame, [35, 55], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const p3 = interpolate(frame, [60, 80], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    // Brain
    drawFBNode(ctx, W * 0.15, cy, 12, 4, a * p1, frame);
    drawFBText(ctx, "BRAIN", W * 0.15, cy + 20, 8, a * p1, "center", FB.text.primary);
    // Minus
    drawFBText(ctx, "\u2013", W * 0.32, cy, 16, a * p2, "center", FB.red);
    // Body (crossed out)
    ctx.globalAlpha = a * p2 * 0.3; ctx.strokeStyle = FB.text.dim; ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]); ctx.beginPath();
    ctx.ellipse(W * 0.48, cy, 12, 16, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.setLineDash([]);
    ctx.globalAlpha = a * p2 * 0.5; ctx.strokeStyle = FB.red; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(W * 0.48 - 10, cy - 14); ctx.lineTo(W * 0.48 + 10, cy + 14); ctx.stroke();
    drawFBText(ctx, "BODY", W * 0.48, cy + 22, 7, a * p2 * 0.4, "center", FB.text.dim);
    // Equals
    drawFBText(ctx, "=", W * 0.62, cy, 16, a * p3, "center", FB.text.dim);
    // Result: just numbers
    drawFBText(ctx, "0.73  -1.2", W * 0.8, cy - 6, 8, a * p3, "center", FB.teal);
    drawFBText(ctx, "0.44   2.1", W * 0.8, cy + 6, 8, a * p3, "center", FB.teal);
    drawFBText(ctx, "JUST NUMBERS", W / 2, H * 0.82, 10, a * p3, "center", FB.text.dim);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* ── V7: Disconnected plug — brain connector with no socket ── */
const V7: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, DUR);
    const cy = H * 0.42;
    // Brain with plug
    drawFBNode(ctx, W * 0.3, cy, 14, 4, a, frame);
    // Plug prongs
    const plugP = interpolate(frame, [20, 45], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = a * plugP * 0.7; ctx.strokeStyle = FB.gold; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(W * 0.38, cy - 5); ctx.lineTo(W * 0.48, cy - 5); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(W * 0.38, cy + 5); ctx.lineTo(W * 0.48, cy + 5); ctx.stroke();
    // No socket — empty space
    const gapP = interpolate(frame, [50, 80], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = a * gapP * 0.2; ctx.strokeStyle = FB.text.dim; ctx.lineWidth = 1;
    ctx.setLineDash([3, 5]);
    ctx.strokeRect(W * 0.58, cy - 12, W * 0.15, 24);
    ctx.setLineDash([]);
    drawFBText(ctx, "NO SOCKET", W * 0.65, cy + 22, 7, a * gapP, "center", FB.text.dim);
    // "eat" label on signal
    drawFBText(ctx, "'eat'", W * 0.43, cy - 15, 7, a * plugP, "center", FB.gold);
    drawFBText(ctx, "DISCONNECTED", W / 2, H * 0.82, 10, a * gapP, "center", FB.text.dim);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* ── V8: Matrix of numbers with "EAT" that dissolves ── */
const V8: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, DUR);
    const cx = W / 2;
    // Number matrix background
    const rng = seeded(4508);
    ctx.font = "bold 6px 'Courier New', monospace"; ctx.textAlign = "center";
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 10; c++) {
        const nx = W * 0.08 + c * W * 0.09;
        const ny = H * 0.12 + r * H * 0.08;
        const val = (rng() * 4 - 2).toFixed(1);
        ctx.globalAlpha = a * 0.2; ctx.fillStyle = FB.teal;
        ctx.fillText(val, nx, ny);
      }
    }
    // "EAT" appearing then dissolving
    const eatAppear = interpolate(frame, [40, 55], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const eatDissolve = interpolate(frame, [70, 100], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "EAT", cx, H * 0.5, 16, a * eatAppear * eatDissolve, "center", FB.gold);
    if (eatDissolve < 1 && eatDissolve > 0) {
      // Dissolving into numbers
      for (let p = 0; p < 8; p++) {
        const px = cx - 20 + rng() * 40;
        const py = H * 0.5 - 10 + rng() * 20 + (1 - eatDissolve) * 20;
        ctx.globalAlpha = a * eatDissolve * 0.4; ctx.fillStyle = FB.gold;
        ctx.font = "bold 6px 'Courier New', monospace";
        ctx.fillText((rng() * 2).toFixed(1), px, py);
      }
    }
    drawFBText(ctx, "WITHOUT A BODY", cx, H * 0.78, 9, a, "center", FB.text.dim);
    drawFBText(ctx, "JUST NUMBERS", cx, H * 0.88, 10, a, "center", FB.text.dim);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* ── V9: Brain cell alone in empty space, small with vast empty surroundings ── */
const V9: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, DUR);
    const cx = W / 2, cy = H * 0.42;
    // Tiny brain cell in vast emptiness
    drawFBNode(ctx, cx, cy, 8, 4, a, frame);
    // Thought bubble with "eat"
    const thinkP = interpolate(frame, [30, 60], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    // Small dots leading to thought
    for (let d = 0; d < 3; d++) {
      const dx = cx + 8 + d * 5, dy = cy - 8 - d * 5;
      ctx.globalAlpha = a * thinkP * 0.4; ctx.fillStyle = FB.text.dim;
      ctx.beginPath(); ctx.arc(dx, dy, 1.5 - d * 0.3, 0, Math.PI * 2); ctx.fill();
    }
    // Thought bubble
    if (thinkP > 0.3) {
      ctx.globalAlpha = a * (thinkP - 0.3) * 1.4 * 0.3; ctx.strokeStyle = FB.gold; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.ellipse(cx + 25, cy - 25, 15, 10, 0, 0, Math.PI * 2); ctx.stroke();
      drawFBText(ctx, "eat", cx + 25, cy - 25, 7, a * (thinkP - 0.3) * 1.4, "center", FB.gold);
    }
    // "..." waiting for body that doesn't exist
    const waitP = interpolate(frame, [80, 120], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const dots = ".".repeat(1 + Math.floor(waitP * 3) % 4);
    drawFBText(ctx, dots, cx, cy + 18, 10, a * waitP, "center", FB.text.dim);
    drawFBText(ctx, "NO BODY", cx, H * 0.75, 10, a * waitP, "center", FB.text.dim);
    drawFBText(ctx, "NO MOUTH TO MOVE", cx, H * 0.85, 8, a * waitP, "center", FB.text.dim);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

export const VARIANTS_FB_045: VariantDef[] = [
  { id: "fb-045-v1", label: "Brain sends EAT signal into void", component: V1 },
  { id: "fb-045-v2", label: "Brain with ghost body outline", component: V2 },
  { id: "fb-045-v3", label: "Floating numbers in empty space", component: V3 },
  { id: "fb-045-v4", label: "Signals bounce back, no receiver", component: V4 },
  { id: "fb-045-v5", label: "Brain speaks but muted, no body", component: V5 },
  { id: "fb-045-v6", label: "Brain minus body equals numbers", component: V6 },
  { id: "fb-045-v7", label: "Disconnected plug, no socket", component: V7 },
  { id: "fb-045-v8", label: "EAT dissolves back into numbers", component: V8 },
  { id: "fb-045-v9", label: "Tiny brain alone in vast emptiness", component: V9 },
];
