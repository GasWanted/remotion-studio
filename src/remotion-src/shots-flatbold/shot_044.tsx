import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantDef, VariantProps } from "../types";
import { FB, seeded, drawFBBg, drawFBNode, drawFBEdge, drawFBText, drawFBCounter, fadeInOut, cellHSL, drawFBColorEdge, drawPersonBlob } from "./flatbold-kit";

/* Shot 044 — "I wanted to see if I could hack it."
   30 frames (1s). "HACK IT" slam. Fast punchy impact. */

const DUR = 30;

/* ── V1: "HACK IT" slams in large with screen-shake effect ── */
const V1: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    const shakeX = frame < 8 ? (Math.sin(frame * 2.5) * 3) : 0;
    const shakeY = frame < 8 ? (Math.cos(frame * 3) * 2) : 0;
    ctx.save(); ctx.translate(shakeX, shakeY);
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, DUR, 3, 5);
    const slamP = interpolate(frame, [2, 6], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const scale = 1 + (1 - slamP) * 0.8;
    ctx.save(); ctx.translate(W / 2, H * 0.45); ctx.scale(scale, scale);
    drawFBText(ctx, "HACK IT", 0, 0, 18, a * slamP, "center", FB.red);
    ctx.restore();
    // Impact flash
    if (frame < 6) {
      ctx.globalAlpha = a * (1 - frame / 6) * 0.15; ctx.fillStyle = FB.red; ctx.fillRect(0, 0, W, H);
    }
    ctx.restore();
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* ── V2: Cursor blinking, then types "HACK IT" fast ── */
const V2: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, DUR, 3, 5);
    const text = "HACK IT";
    const chars = Math.min(text.length, Math.floor(frame / 2));
    const typed = text.substring(0, chars);
    drawFBText(ctx, typed, W / 2, H * 0.45, 16, a, "center", FB.red);
    // Cursor blink
    if (chars < text.length) {
      const cursorOn = Math.floor(frame * 2) % 2 === 0;
      if (cursorOn) {
        ctx.globalAlpha = a * 0.7;
        const metrics = ctx.measureText(typed);
        ctx.fillStyle = FB.red;
        ctx.fillRect(W / 2 + metrics.width / 2 + 2, H * 0.45 - 8, 2, 16);
      }
    }
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* ── V3: Glitch effect — text appears with horizontal offset slices ── */
const V3: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, DUR, 3, 5);
    const glitchP = frame < 10 ? 1 - frame / 10 : 0;
    // Draw text multiple times with offsets for glitch
    for (let s = 0; s < 3; s++) {
      const offX = glitchP * (s - 1) * 8;
      const color = s === 0 ? "rgba(232,80,80,0.5)" : s === 1 ? FB.red : "rgba(80,200,200,0.3)";
      drawFBText(ctx, "HACK IT", W / 2 + offX, H * 0.45, 16, a, "center", color);
    }
    // Scanline flicker
    if (glitchP > 0) {
      for (let y = 0; y < H; y += 4) {
        if (Math.random() < glitchP * 0.3) {
          ctx.globalAlpha = glitchP * 0.1; ctx.fillStyle = FB.red;
          ctx.fillRect(0, y, W, 2);
        }
      }
    }
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* ── V4: Red crack splitting screen, "HACK IT" in the gap ── */
const V4: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, DUR, 3, 5);
    const crackP = interpolate(frame, [2, 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    // Crack line
    ctx.globalAlpha = a * crackP * 0.6; ctx.strokeStyle = FB.red; ctx.lineWidth = 2;
    ctx.beginPath();
    const rng = seeded(4401);
    let px = W / 2, py = 0;
    while (py < H * crackP) {
      px += (rng() - 0.5) * 15;
      py += 5 + rng() * 8;
      ctx.lineTo(px, py);
    }
    ctx.stroke();
    // Glow along crack
    ctx.globalAlpha = a * crackP * 0.1; ctx.strokeStyle = FB.red; ctx.lineWidth = 8;
    ctx.stroke();
    // Text
    drawFBText(ctx, "HACK IT", W / 2, H * 0.45, 16, a * crackP, "center", FB.red);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* ── V5: Binary rain resolves into "HACK IT" ── */
const V5: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, DUR, 3, 5);
    const resolveP = interpolate(frame, [5, 15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    // Binary rain (fading as resolve increases)
    if (resolveP < 1) {
      const rng = seeded(4405);
      ctx.font = "bold 7px 'Courier New', monospace";
      ctx.textAlign = "center";
      for (let i = 0; i < 30; i++) {
        const bx = rng() * W, by = ((frame * (1 + rng()) + rng() * H) % H);
        ctx.globalAlpha = a * (1 - resolveP) * 0.4;
        ctx.fillStyle = FB.red;
        ctx.fillText(rng() > 0.5 ? "1" : "0", bx, by);
      }
    }
    drawFBText(ctx, "HACK IT", W / 2, H * 0.45, 16, a * resolveP, "center", FB.red);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* ── V6: Stamp/seal slams down — red circular stamp ── */
const V6: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, DUR, 3, 5);
    const cx = W / 2, cy = H * 0.45;
    const slamP = interpolate(frame, [3, 7], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const scale = 1 + (1 - slamP) * 1.5;
    ctx.save(); ctx.translate(cx, cy); ctx.scale(scale, scale);
    // Circle border
    ctx.globalAlpha = a * slamP * 0.6; ctx.strokeStyle = FB.red; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(0, 0, 30, 0, Math.PI * 2); ctx.stroke();
    // Inner circle
    ctx.beginPath(); ctx.arc(0, 0, 25, 0, Math.PI * 2); ctx.stroke();
    // Text
    drawFBText(ctx, "HACK", 0, -5, 11, a * slamP, "center", FB.red);
    drawFBText(ctx, "IT", 0, 9, 11, a * slamP, "center", FB.red);
    ctx.restore();
    // Impact dust
    if (frame < 10) {
      ctx.globalAlpha = a * (1 - frame / 10) * 0.1; ctx.fillStyle = FB.red;
      ctx.fillRect(0, 0, W, H);
    }
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* ── V7: Terminal prompt > hack_brain.py — then "HACK IT" replaces ── */
const V7: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, DUR, 3, 5);
    const promptP = interpolate(frame, [2, 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const hackP = interpolate(frame, [10, 16], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    // Terminal prompt
    drawFBText(ctx, "> python hack_brain.py", W * 0.15, H * 0.35, 8, a * promptP * (1 - hackP), "left", FB.green);
    // "HACK IT" takes over
    if (hackP > 0) {
      const textScale = 1 + (1 - hackP) * 0.3;
      ctx.save(); ctx.translate(W / 2, H * 0.45); ctx.scale(textScale, textScale);
      drawFBText(ctx, "HACK IT", 0, 0, 16, a * hackP, "center", FB.red);
      ctx.restore();
    }
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* ── V8: Red X slashes across, "HACK IT" appears in intersection ── */
const V8: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, DUR, 3, 5);
    const slashP = interpolate(frame, [2, 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    // Two diagonal slashes
    ctx.globalAlpha = a * slashP * 0.5; ctx.strokeStyle = FB.red; ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(W * 0.1, H * 0.1); ctx.lineTo(W * 0.1 + slashP * W * 0.8, H * 0.1 + slashP * H * 0.8);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(W * 0.9, H * 0.1); ctx.lineTo(W * 0.9 - slashP * W * 0.8, H * 0.1 + slashP * H * 0.8);
    ctx.stroke();
    // Text at intersection
    if (slashP > 0.5) {
      drawFBText(ctx, "HACK IT", W / 2, H * 0.45, 16, a * (slashP - 0.5) * 2, "center", FB.red);
    }
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* ── V9: Pulse blast from center — red ring + "HACK IT" ── */
const V9: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, DUR, 3, 5);
    const cx = W / 2, cy = H * 0.45;
    const blastP = interpolate(frame, [3, 15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    // Blast ring
    const ringR = blastP * Math.max(W, H) * 0.5;
    ctx.globalAlpha = a * (1 - blastP) * 0.3; ctx.strokeStyle = FB.red; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.arc(cx, cy, Math.max(1, ringR), 0, Math.PI * 2); ctx.stroke();
    // Inner glow
    ctx.globalAlpha = a * (1 - blastP) * 0.15;
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, ringR);
    g.addColorStop(0, FB.red); g.addColorStop(1, "rgba(232,80,80,0)");
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, ringR, 0, Math.PI * 2); ctx.fill();
    // Text
    drawFBText(ctx, "HACK IT", cx, cy, 16, a * blastP, "center", FB.red);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

export const VARIANTS_FB_044: VariantDef[] = [
  { id: "fb-044-v1", label: "HACK IT slams in with screen shake", component: V1 },
  { id: "fb-044-v2", label: "Cursor types HACK IT fast", component: V2 },
  { id: "fb-044-v3", label: "Glitch effect with offset slices", component: V3 },
  { id: "fb-044-v4", label: "Red crack splits screen", component: V4 },
  { id: "fb-044-v5", label: "Binary rain resolves to text", component: V5 },
  { id: "fb-044-v6", label: "Red stamp slams down", component: V6 },
  { id: "fb-044-v7", label: "Terminal prompt then takeover", component: V7 },
  { id: "fb-044-v8", label: "Red X slashes with text at center", component: V8 },
  { id: "fb-044-v9", label: "Pulse blast ring with text", component: V9 },
];
