import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantDef, VariantProps } from "../types";
import { FB, seeded, drawFBBg, drawFBNode, drawFBEdge, drawFBText, drawFBCounter, fadeInOut, cellHSL, drawFBColorEdge, drawPersonBlob } from "./flatbold-kit";

/* Shot 037 — "Red light on the 'Giant Fiber' makes the fly jump."
   90 frames (3s). Red flash → fly jumps. Quick cause-and-effect. */

const DUR = 90;

/* ── V1: Red flash hits Giant Fiber cell, fly blob launches upward ── */
const V1: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, DUR);
    const cx = W / 2;
    const flashP = interpolate(frame, [5, 15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const flashFade = interpolate(frame, [15, 30], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (flashP > 0) {
      ctx.globalAlpha = a * flashP * flashFade * 0.3; ctx.fillStyle = FB.red; ctx.fillRect(0, 0, W, H);
    }
    drawFBNode(ctx, cx, H * 0.35, 12, 0, a, frame);
    drawFBText(ctx, "GIANT FIBER", cx, H * 0.35 + 20, 8, a, "center", FB.red);
    const spikeP = interpolate(frame, [20, 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (spikeP > 0) {
      for (let s = 0; s < 5; s++) {
        const ang = (s / 5) * Math.PI * 2;
        ctx.globalAlpha = a * spikeP * 0.5; ctx.strokeStyle = FB.red; ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(ang) * 14, H * 0.35 + Math.sin(ang) * 14);
        ctx.lineTo(cx + Math.cos(ang) * (14 + spikeP * 15), H * 0.35 + Math.sin(ang) * (14 + spikeP * 15));
        ctx.stroke();
      }
    }
    const jumpP = interpolate(frame, [40, 60], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const flyY = H * 0.72 - jumpP * H * 0.35;
    drawFBNode(ctx, cx, flyY, 8, 3, a, frame);
    drawFBText(ctx, "JUMP!", cx, flyY - 16, 10, a * jumpP, "center", FB.gold);
    if (jumpP > 0.2) {
      ctx.globalAlpha = a * jumpP * 0.3; ctx.strokeStyle = FB.text.dim; ctx.lineWidth = 1;
      for (let l = 0; l < 3; l++) {
        const lx = cx - 10 + l * 10;
        ctx.beginPath(); ctx.moveTo(lx, flyY + 12); ctx.lineTo(lx, flyY + 12 + jumpP * 20); ctx.stroke();
      }
    }
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* ── V2: Arrow chain: RED LIGHT → GIANT FIBER → JUMP ── */
const V2: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, DUR);
    const cy = H * 0.45;
    const p1 = interpolate(frame, [5, 25], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const p2 = interpolate(frame, [25, 50], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const p3 = interpolate(frame, [50, 75], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = a * p1 * 0.4;
    const g = ctx.createRadialGradient(W * 0.15, cy, 0, W * 0.15, cy, 15);
    g.addColorStop(0, FB.red); g.addColorStop(1, "rgba(232,80,80,0)");
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(W * 0.15, cy, 15, 0, Math.PI * 2); ctx.fill();
    drawFBText(ctx, "RED LIGHT", W * 0.15, cy + 20, 8, a * p1, "center", FB.red);
    ctx.globalAlpha = a * p2 * 0.5; ctx.strokeStyle = FB.red; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(W * 0.27, cy); ctx.lineTo(W * 0.38, cy); ctx.stroke();
    ctx.fillStyle = FB.red; ctx.beginPath();
    ctx.moveTo(W * 0.38, cy); ctx.lineTo(W * 0.35, cy - 4); ctx.lineTo(W * 0.35, cy + 4); ctx.closePath(); ctx.fill();
    drawFBNode(ctx, W * 0.5, cy, 12, 0, a * p2, frame);
    drawFBText(ctx, "GIANT FIBER", W * 0.5, cy + 20, 8, a * p2, "center", FB.red);
    ctx.globalAlpha = a * p3 * 0.5; ctx.strokeStyle = FB.gold; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(W * 0.62, cy); ctx.lineTo(W * 0.73, cy); ctx.stroke();
    ctx.fillStyle = FB.gold; ctx.beginPath();
    ctx.moveTo(W * 0.73, cy); ctx.lineTo(W * 0.7, cy - 4); ctx.lineTo(W * 0.7, cy + 4); ctx.closePath(); ctx.fill();
    const jumpBounce = p3 > 0 ? Math.abs(Math.sin(frame * 0.15)) * 8 : 0;
    drawFBNode(ctx, W * 0.85, cy - jumpBounce, 10, 3, a * p3, frame);
    drawFBText(ctx, "JUMP!", W * 0.85, cy - jumpBounce - 16, 10, a * p3, "center", FB.gold);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* ── V3: Red beam from above → neuron → shockwave down to legs ── */
const V3: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, DUR);
    const cx = W / 2, neuronY = H * 0.35;
    const beamP = interpolate(frame, [5, 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = a * beamP * 0.4; ctx.fillStyle = FB.red;
    ctx.beginPath();
    ctx.moveTo(cx - 15, 0); ctx.lineTo(cx - 6, neuronY - 14);
    ctx.lineTo(cx + 6, neuronY - 14); ctx.lineTo(cx + 15, 0);
    ctx.closePath(); ctx.fill();
    drawFBNode(ctx, cx, neuronY, 12, 0, a, frame);
    drawFBText(ctx, "GIANT FIBER", cx, neuronY - 20, 7, a, "center", FB.red);
    const cascP = interpolate(frame, [25, 50], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const signalY = neuronY + cascP * (H * 0.4);
    ctx.globalAlpha = a * cascP * 0.6; ctx.strokeStyle = FB.red; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(cx, neuronY + 14); ctx.lineTo(cx, signalY); ctx.stroke();
    ctx.fillStyle = FB.red; ctx.beginPath(); ctx.arc(cx, signalY, 3, 0, Math.PI * 2); ctx.fill();
    const jumpP = interpolate(frame, [55, 75], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const flyY = H * 0.82 - jumpP * H * 0.2;
    drawFBNode(ctx, cx, flyY, 8, 3, a * (cascP > 0.8 ? 1 : cascP), frame);
    if (jumpP > 0) drawFBText(ctx, "JUMP!", cx, flyY - 14, 10, a * jumpP, "center", FB.gold);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* ── V4: Oscilloscope spike trace — flat line, red flash, spike ── */
const V4: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, DUR);
    const traceY = H * 0.5, spikeFrame = 35;
    ctx.globalAlpha = a * 0.8; ctx.strokeStyle = FB.teal; ctx.lineWidth = 2;
    ctx.beginPath();
    const traceP = interpolate(frame, [5, DUR - 5], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    for (let x = 0; x < W; x += 2) {
      const t = (x / W) * DUR;
      if (t / DUR > traceP) break;
      let y = traceY;
      if (Math.abs(t - spikeFrame) < 3) y = traceY - 40 * Math.max(0, 1 - Math.abs(t - spikeFrame) / 3);
      if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();
    const flashX = (spikeFrame / DUR) * W;
    const flashP = interpolate(frame, [spikeFrame - 5, spikeFrame], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (flashP > 0) {
      ctx.globalAlpha = a * flashP * 0.2; ctx.fillStyle = FB.red; ctx.fillRect(flashX - 10, 0, 20, H);
    }
    drawFBText(ctx, "GIANT FIBER", W / 2, H * 0.12, 9, a, "center", FB.red);
    drawFBText(ctx, "SPIKE = JUMP", W / 2, H * 0.88, 10, a, "center", FB.gold);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* ── V5: Red button press → neuron → fly springs up ── */
const V5: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, DUR);
    const pressP = interpolate(frame, [10, 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const btnY = H * 0.45 + pressP * 3;
    ctx.globalAlpha = a; ctx.fillStyle = FB.red;
    ctx.beginPath(); ctx.arc(W * 0.15, btnY, 12, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "rgba(255,150,150,0.4)";
    ctx.beginPath(); ctx.arc(W * 0.15, btnY - 3, 5, 0, Math.PI * 2); ctx.fill();
    drawFBText(ctx, "RED LIGHT", W * 0.15, btnY + 20, 7, a, "center", FB.red);
    const sigP = interpolate(frame, [20, 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const sigX = W * 0.25 + sigP * W * 0.25;
    if (sigP > 0 && sigP < 1) {
      ctx.globalAlpha = a * 0.6; ctx.fillStyle = FB.red;
      ctx.beginPath(); ctx.arc(sigX, H * 0.45, 3, 0, Math.PI * 2); ctx.fill();
    }
    drawFBNode(ctx, W / 2, H * 0.45, 10 + (sigP >= 1 ? 3 : 0), 0, a, frame);
    drawFBText(ctx, "GIANT FIBER", W / 2, H * 0.45 + 18, 7, a, "center", FB.red);
    const jumpP = interpolate(frame, [45, 70], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const flyY = H * 0.7 - jumpP * H * 0.35;
    drawFBNode(ctx, W * 0.82, flyY, 9, 3, a * (sigP > 0.5 ? 1 : sigP * 2), frame);
    if (jumpP > 0) {
      drawFBText(ctx, "JUMP!", W * 0.82, flyY - 16, 10, a * jumpP, "center", FB.gold);
      ctx.globalAlpha = a * jumpP * 0.2; ctx.strokeStyle = FB.text.dim; ctx.lineWidth = 1;
      for (let l = 0; l < 3; l++) {
        ctx.beginPath(); ctx.moveTo(W * 0.8 + l * 4, flyY + 12); ctx.lineTo(W * 0.8 + l * 4, flyY + 12 + jumpP * 15); ctx.stroke();
      }
    }
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* ── V6: Stacked text: "RED LIGHT" → "GIANT FIBER" → "JUMP" bouncing ── */
const V6: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, DUR);
    const cx = W / 2;
    const p1 = interpolate(frame, [5, 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = a * p1 * 0.15;
    const g = ctx.createRadialGradient(cx, H * 0.2, 0, cx, H * 0.2, W * 0.3);
    g.addColorStop(0, FB.red); g.addColorStop(1, "rgba(232,80,80,0)");
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, H * 0.2, W * 0.3, 0, Math.PI * 2); ctx.fill();
    drawFBText(ctx, "RED LIGHT", cx, H * 0.2, 13, a * p1, "center", FB.red);
    const p2 = interpolate(frame, [20, 35], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = a * p2 * 0.5; ctx.strokeStyle = FB.red; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(cx, H * 0.28); ctx.lineTo(cx, H * 0.36); ctx.stroke();
    drawFBText(ctx, "GIANT FIBER", cx, H * 0.45, 11, a * p2, "center", FB.text.primary);
    if (p2 >= 1) {
      for (let s = 0; s < 4; s++) {
        const ang = (s / 4) * Math.PI * 2 + Math.PI / 4;
        ctx.globalAlpha = a * 0.3; ctx.strokeStyle = FB.red; ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(ang) * 30, H * 0.45 + Math.sin(ang) * 10);
        ctx.lineTo(cx + Math.cos(ang) * 40, H * 0.45 + Math.sin(ang) * 14);
        ctx.stroke();
      }
    }
    const p3 = interpolate(frame, [40, 55], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = a * p3 * 0.5; ctx.strokeStyle = FB.gold; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(cx, H * 0.53); ctx.lineTo(cx, H * 0.62); ctx.stroke();
    const bounce = p3 >= 1 ? Math.abs(Math.sin(frame * 0.12)) * 8 : 0;
    drawFBText(ctx, "JUMP", cx, H * 0.72 - bounce, 16, a * p3, "center", FB.gold);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* ── V7: Spring mechanism — light compresses, neuron releases ── */
const V7: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, DUR);
    const cx = W / 2;
    const compressP = interpolate(frame, [5, 35], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const releaseP = interpolate(frame, [40, 55], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const springTop = H * 0.3 + compressP * H * 0.15 - releaseP * H * 0.25;
    const springBot = H * 0.65;
    ctx.globalAlpha = a * 0.6; ctx.strokeStyle = FB.red; ctx.lineWidth = 2;
    ctx.beginPath();
    const segments = 8;
    const segH = (springBot - springTop) / segments;
    for (let i = 0; i <= segments; i++) {
      const sx = cx + (i % 2 === 0 ? -10 : 10);
      const sy = springTop + i * segH;
      if (i === 0) ctx.moveTo(cx, sy); else ctx.lineTo(sx, sy);
    }
    ctx.stroke();
    drawFBText(ctx, "RED LIGHT", cx, H * 0.15, 9, a * compressP, "center", FB.red);
    const flyY = Math.min(springTop - 10, H * 0.7);
    drawFBNode(ctx, cx, flyY, 10, 3, a, frame);
    drawFBNode(ctx, cx, springBot + 12, 6, 0, a, frame);
    drawFBText(ctx, "GIANT FIBER", cx, springBot + 26, 7, a, "center", FB.red);
    if (releaseP > 0) drawFBText(ctx, "JUMP!", cx, flyY - 18, 12, a * releaseP, "center", FB.gold);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* ── V8: Split: red wavelength left, neuron spike right ── */
const V8: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, DUR);
    ctx.globalAlpha = a * 0.7; ctx.strokeStyle = FB.red; ctx.lineWidth = 2;
    const waveP = interpolate(frame, [5, 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.beginPath();
    for (let x = W * 0.02; x < W * 0.45; x += 2) {
      const y = H * 0.45 + Math.sin((x - frame * 3) * 0.08) * 15 * waveP;
      if (x <= W * 0.04) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();
    drawFBText(ctx, "625nm RED", W * 0.23, H * 0.15, 8, a, "center", FB.red);
    ctx.globalAlpha = a * 0.2; ctx.strokeStyle = FB.text.dim; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(W / 2, H * 0.05); ctx.lineTo(W / 2, H * 0.95); ctx.stroke();
    const spikeP = interpolate(frame, [35, 55], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBNode(ctx, W * 0.72, H * 0.35, 10, 0, a * spikeP, frame);
    drawFBText(ctx, "GIANT FIBER", W * 0.72, H * 0.52, 7, a * spikeP, "center", FB.red);
    if (spikeP > 0.5) {
      for (let s = 0; s < 5; s++) {
        const ang = (s / 5) * Math.PI * 2;
        ctx.globalAlpha = a * (spikeP - 0.5) * 2 * 0.5; ctx.strokeStyle = FB.red; ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(W * 0.72 + Math.cos(ang) * 12, H * 0.35 + Math.sin(ang) * 12);
        ctx.lineTo(W * 0.72 + Math.cos(ang) * 25, H * 0.35 + Math.sin(ang) * 25);
        ctx.stroke();
      }
    }
    const jumpP = interpolate(frame, [60, 78], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const bounce = jumpP > 0 ? Math.abs(Math.sin(frame * 0.15)) * 6 : 0;
    drawFBText(ctx, "JUMP!", W * 0.72, H * 0.72 - bounce, 12, a * jumpP, "center", FB.gold);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* ── V9: Red photon rain — one hits Giant Fiber, fly leaps ── */
const V9: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, DUR);
    const cx = W / 2, neuronY = H * 0.5;
    const rng = seeded(3709);
    for (let i = 0; i < 15; i++) {
      const px = rng() * W;
      const fallSpeed = 0.8 + rng() * 1.2;
      const py = ((frame * fallSpeed + rng() * 80) % (H * 0.8));
      ctx.globalAlpha = a * 0.4; ctx.fillStyle = FB.red;
      ctx.beginPath(); ctx.arc(px, py, 2, 0, Math.PI * 2); ctx.fill();
    }
    drawFBNode(ctx, cx, neuronY, 10, 0, a, frame);
    drawFBText(ctx, "GIANT FIBER", cx, neuronY + 16, 7, a, "center", FB.red);
    const hitP = interpolate(frame, [35, 50], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (hitP > 0) {
      ctx.globalAlpha = a * (1 - hitP) * 0.4; ctx.strokeStyle = FB.red; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(cx, neuronY, hitP * 25, 0, Math.PI * 2); ctx.stroke();
    }
    const jumpP = interpolate(frame, [50, 72], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const flyY = H * 0.8 - jumpP * H * 0.35;
    drawFBNode(ctx, cx, flyY, 8, 3, a * (hitP > 0 ? 1 : 0), frame);
    if (jumpP > 0) drawFBText(ctx, "JUMP!", cx, flyY - 14, 11, a * jumpP, "center", FB.gold);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

export const VARIANTS_FB_037: VariantDef[] = [
  { id: "fb-037-v1", label: "Red flash hits Giant Fiber, fly launches", component: V1 },
  { id: "fb-037-v2", label: "Arrow chain: light, fiber, jump", component: V2 },
  { id: "fb-037-v3", label: "Red beam cascades down to legs", component: V3 },
  { id: "fb-037-v4", label: "Oscilloscope spike trace", component: V4 },
  { id: "fb-037-v5", label: "Red button press triggers jump", component: V5 },
  { id: "fb-037-v6", label: "Stacked text with bouncing JUMP", component: V6 },
  { id: "fb-037-v7", label: "Spring compression and release", component: V7 },
  { id: "fb-037-v8", label: "Split: wavelength vs spike", component: V8 },
  { id: "fb-037-v9", label: "Red photon rain hits Giant Fiber", component: V9 },
];
