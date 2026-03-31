import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantDef, VariantProps } from "../types";
import { FB, seeded, drawFBBg, drawFBNode, drawFBEdge, drawFBText, drawFBCounter, fadeInOut, cellHSL, drawFBColorEdge, drawPersonBlob } from "./flatbold-kit";

/* Shot 83 — "Cleared the course flawlessly... ate nothing. Chose to starve." — 120 frames */

// ---------- V1: Giant "FOOD: 0" counter with dramatic zero ----------
const V1: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 120);
    const cx = W / 2;
    // "COURSE: FLAWLESS"
    const t1 = interpolate(frame, [5, 22], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "COURSE: FLAWLESS", cx, H * 0.15, 10, a * t1, "center", FB.green);
    // "FOOD:" label
    const t2 = interpolate(frame, [28, 45], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "FOOD:", cx, H * 0.35, 12, a * t2, "center", FB.text.dim);
    // Giant zero slams in
    const zeroP = interpolate(frame, [50, 65], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const zeroBounce = 1 + Math.max(0, 1 - (frame - 50) / 15) * 0.6;
    if (zeroP > 0) {
      ctx.save();
      ctx.translate(cx, H * 0.55);
      ctx.scale(zeroBounce, zeroBounce);
      drawFBCounter(ctx, "0", 0, 0, 28, FB.red, a * zeroP);
      ctx.restore();
    }
    // "CHOSE TO STARVE"
    const t3 = interpolate(frame, [75, 100], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "CHOSE TO STARVE", cx, H * 0.82, 12, a * t3, "center", FB.red);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V2: Counter counting down from 100% to 0% ----------
const V2: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 120);
    const cx = W / 2;
    drawFBText(ctx, "FEEDING SCORE", cx, H * 0.1, 8, a, "center", FB.text.dim);
    // Animated counter: starts at 100, drops to 0
    const countP = interpolate(frame, [10, 55], [100, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const countVal = Math.round(countP);
    const countColor = countVal > 50 ? FB.green : countVal > 20 ? FB.gold : FB.red;
    drawFBCounter(ctx, `${countVal}%`, cx, H * 0.4, 24, countColor, a);
    // Progress ring draining
    const ringR = Math.min(W, H) * 0.18;
    ctx.globalAlpha = a * 0.15;
    ctx.strokeStyle = FB.text.dim;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(cx, H * 0.4, ringR, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = a * 0.5;
    ctx.strokeStyle = countColor;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(cx, H * 0.4, ringR, -Math.PI / 2, -Math.PI / 2 + (countP / 100) * Math.PI * 2);
    ctx.stroke();
    // Final text
    if (countVal === 0) {
      const t = interpolate(frame, [60, 85], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      drawFBText(ctx, "ATE NOTHING", cx, H * 0.72, 12, a * t, "center", FB.red);
      const t2 = interpolate(frame, [85, 108], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      drawFBText(ctx, "CHOSE TO STARVE", cx, H * 0.86, 10, a * t2, "center", FB.red);
    }
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V3: Empty plate — stark minimalism ----------
const V3: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 120);
    const cx = W / 2, cy = H * 0.4;
    // Empty circle (plate)
    const plateP = interpolate(frame, [8, 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = a * plateP * 0.2;
    ctx.strokeStyle = FB.text.dim;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(cx, cy, 22, 0, Math.PI * 2);
    ctx.stroke();
    // Inner circle
    ctx.globalAlpha = a * plateP * 0.1;
    ctx.beginPath();
    ctx.arc(cx, cy, 14, 0, Math.PI * 2);
    ctx.stroke();
    // "EMPTY" fading in at center
    const emptyP = interpolate(frame, [35, 55], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "EMPTY", cx, cy, 10, a * emptyP, "center", FB.text.dim);
    // "FOOD: 0" below
    const zeroP = interpolate(frame, [55, 75], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBCounter(ctx, "FOOD: 0", cx, H * 0.68, 14, FB.red, a * zeroP);
    // "CHOSE TO STARVE"
    const starveP = interpolate(frame, [80, 105], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "CHOSE TO STARVE", cx, H * 0.85, 12, a * starveP, "center", FB.red);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V4: Tally marks — four perfect, one empty slot ----------
const V4: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 120);
    const cx = W / 2, cy = H * 0.3;
    const tallies = ["ESCAPE", "GROOM", "WALK", "FEED"];
    tallies.forEach((label, i) => {
      const t = interpolate(frame, [8 + i * 12, 20 + i * 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const x = cx - 30 + i * 20;
      const isFood = i === 3;
      // Tally mark line
      ctx.globalAlpha = a * t;
      ctx.strokeStyle = isFood ? FB.red : FB.green;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(x, cy - 15);
      ctx.lineTo(x, cy + 15);
      ctx.stroke();
      // If food, draw an X through it
      if (isFood && t > 0.5) {
        ctx.strokeStyle = FB.red;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x - 6, cy - 8);
        ctx.lineTo(x + 6, cy + 8);
        ctx.moveTo(x + 6, cy - 8);
        ctx.lineTo(x - 6, cy + 8);
        ctx.stroke();
      }
      drawFBText(ctx, label, x, cy + 24, 5, a * t, "center", isFood ? FB.red : FB.green);
    });
    // Score
    const scoreP = interpolate(frame, [65, 85], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBCounter(ctx, "3/4", cx, H * 0.6, 16, FB.gold, a * scoreP);
    drawFBText(ctx, "FOOD: ZERO", cx, H * 0.74, 10, a * scoreP, "center", FB.red);
    const endP = interpolate(frame, [90, 112], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "CHOSE TO STARVE", cx, H * 0.88, 12, a * endP, "center", FB.red);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V5: Sugar cubes vanishing into nothing ----------
const V5: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 120);
    const cx = W / 2, cy = H * 0.35;
    // Row of sugar cubes that shrink to nothing
    const cubeCount = 5;
    for (let i = 0; i < cubeCount; i++) {
      const appearP = interpolate(frame, [5 + i * 6, 15 + i * 6], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const vanishP = interpolate(frame, [40 + i * 8, 60 + i * 8], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const sz = 8 * appearP * vanishP;
      const x = cx - 30 + i * 15;
      if (sz > 0.5) {
        ctx.globalAlpha = a * vanishP;
        ctx.fillStyle = FB.gold;
        ctx.fillRect(x - sz / 2, cy - sz / 2, sz, sz);
      }
    }
    // "UNTOUCHED" after all gone
    const allGone = interpolate(frame, [60, 75], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "UNTOUCHED", cx, cy + 20, 10, a * allGone, "center", FB.gold);
    // Result
    const resP = interpolate(frame, [75, 95], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBCounter(ctx, "0", cx, H * 0.65, 22, FB.red, a * resP);
    const starveP = interpolate(frame, [95, 112], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "CHOSE TO STARVE", cx, H * 0.85, 12, a * starveP, "center", FB.red);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V6: Binary verdict — PASS PASS PASS then STARVE ----------
const V6: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 120);
    const cx = W / 2;
    const words = [
      { text: "PASS", fr: 5, color: FB.green },
      { text: "PASS", fr: 18, color: FB.green },
      { text: "PASS", fr: 31, color: FB.green },
    ];
    // "PASS" words appearing in sequence
    words.forEach((w, i) => {
      const t = interpolate(frame, [w.fr, w.fr + 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const x = cx - 25 + i * 25;
      drawFBText(ctx, w.text, x, H * 0.25, 11, a * t, "center", w.color);
    });
    // Dramatic pause
    const pauseP = interpolate(frame, [48, 58], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "...", cx, H * 0.42, 14, a * pauseP, "center", FB.text.dim);
    // "STARVE" slams in
    const starveP = interpolate(frame, [62, 78], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const starveBounce = 1 + Math.max(0, 1 - (frame - 62) / 16) * 0.4;
    if (starveP > 0) {
      ctx.save();
      ctx.translate(cx, H * 0.6);
      ctx.scale(starveBounce, starveBounce);
      drawFBText(ctx, "STARVE", 0, 0, 20, a * starveP, "center", FB.red);
      ctx.restore();
    }
    const choiceP = interpolate(frame, [88, 108], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "BY CHOICE", cx, H * 0.82, 9, a * choiceP, "center", FB.text.dim);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V7: Sugar molecule floating, ignored — poetic void ----------
const V7: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 120);
    const cx = W / 2, cy = H * 0.38;
    // Sugar molecule — hexagonal shape floating
    const floatY = Math.sin(frame * 0.06) * 4;
    const sugarP = interpolate(frame, [5, 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = a * sugarP * 0.5;
    ctx.strokeStyle = FB.gold;
    ctx.lineWidth = 1;
    const hexR = 12;
    ctx.beginPath();
    for (let i = 0; i <= 6; i++) {
      const ang = (Math.PI / 3) * i - Math.PI / 6;
      const hx = cx + Math.cos(ang) * hexR;
      const hy = cy + floatY + Math.sin(ang) * hexR;
      i === 0 ? ctx.moveTo(hx, hy) : ctx.lineTo(hx, hy);
    }
    ctx.stroke();
    drawFBText(ctx, "SUGAR", cx, cy + floatY + hexR + 10, 7, a * sugarP * 0.5, "center", FB.gold);
    // "IGNORED" slowly appears
    const ignP = interpolate(frame, [35, 58], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "IGNORED", cx, H * 0.62, 10, a * ignP, "center", FB.text.dim);
    // Final
    const endP = interpolate(frame, [65, 88], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "ATE NOTHING", cx, H * 0.76, 14, a * endP, "center", FB.red);
    const choiceP = interpolate(frame, [88, 108], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "CHOSE TO STARVE", cx, H * 0.9, 10, a * choiceP, "center", FB.red);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V8: Bar chart — all bars high except FEED at zero ----------
const V8: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 120);
    const cx = W / 2;
    const bars = [
      { label: "ESC", val: 1, color: FB.green },
      { label: "GRM", val: 1, color: FB.green },
      { label: "WLK", val: 1, color: FB.green },
      { label: "FEED", val: 0, color: FB.red },
    ];
    const barW = W * 0.12;
    const maxH = H * 0.4;
    const baseY = H * 0.7;
    bars.forEach((b, i) => {
      const t = interpolate(frame, [10 + i * 14, 25 + i * 14], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const x = cx - bars.length * barW / 2 + i * (barW + 4) + barW / 2;
      const barH = b.val * maxH * t;
      // Bar
      ctx.globalAlpha = a * t * 0.5;
      ctx.fillStyle = b.color;
      if (barH > 0) {
        ctx.fillRect(x - barW / 2, baseY - barH, barW, barH);
      }
      // Empty marker for zero bar
      if (b.val === 0 && t > 0.5) {
        ctx.globalAlpha = a * t * 0.2;
        ctx.strokeStyle = FB.red;
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 3]);
        ctx.strokeRect(x - barW / 2, baseY - maxH, barW, maxH);
        ctx.setLineDash([]);
      }
      drawFBText(ctx, b.label, x, baseY + 10, 6, a * t, "center", b.color);
    });
    // Zero callout
    const zP = interpolate(frame, [68, 85], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBCounter(ctx, "0", cx + bars.length * barW / 2 - barW / 2 + 2, baseY - maxH / 2, 16, FB.red, a * zP);
    const endP = interpolate(frame, [90, 110], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "CHOSE TO STARVE", cx, H * 0.9, 11, a * endP, "center", FB.red);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V9: Pure text — cinematic beats ----------
const V9: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 120, 6, 12);
    const cx = W / 2;
    const t1 = interpolate(frame, [5, 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "CLEARED THE COURSE", cx, H * 0.15, 10, a * t1, "center", FB.green);
    const t2 = interpolate(frame, [18, 33], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "FLAWLESSLY", cx, H * 0.28, 14, a * t2, "center", FB.green);
    // Pause dots
    const dotP = interpolate(frame, [40, 55], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "...", cx, H * 0.42, 12, a * dotP, "center", FB.text.dim);
    // "ATE NOTHING"
    const t3 = interpolate(frame, [55, 72], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "ATE NOTHING", cx, H * 0.58, 14, a * t3, "center", FB.red);
    // "CHOSE TO STARVE"
    const t4 = interpolate(frame, [78, 100], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "CHOSE", cx, H * 0.74, 10, a * t4, "center", FB.text.dim);
    drawFBText(ctx, "TO STARVE", cx, H * 0.86, 16, a * t4, "center", FB.red);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

export const VARIANTS_FB_083: VariantDef[] = [
  { id: "fb-083-v1", label: "Giant FOOD: 0 counter slam", component: V1 },
  { id: "fb-083-v2", label: "Counter draining 100 to 0", component: V2 },
  { id: "fb-083-v3", label: "Empty plate minimalism", component: V3 },
  { id: "fb-083-v4", label: "Tally marks with X on food", component: V4 },
  { id: "fb-083-v5", label: "Sugar cubes vanishing", component: V5 },
  { id: "fb-083-v6", label: "PASS PASS PASS then STARVE", component: V6 },
  { id: "fb-083-v7", label: "Sugar molecule ignored void", component: V7 },
  { id: "fb-083-v8", label: "Bar chart zero FEED bar", component: V8 },
  { id: "fb-083-v9", label: "Cinematic text beats", component: V9 },
];
