import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantDef, VariantProps } from "../types";
import { FB, seeded, drawFBBg, drawFBNode, drawFBEdge, drawFBText, drawFBCounter, fadeInOut, cellHSL, drawFBColorEdge } from "./flatbold-kit";

/* Shot 58 — "My goal was to make it afraid of that food." — 60 frames */

// ---------- V1: Gold food sphere, fear creeps in as red wash overlay ----------
const V1: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 60);
    // Gold food sphere at center
    const foodP = interpolate(frame, [3, 15], [0, 1], { extrapolateRight: "clamp" });
    ctx.globalAlpha = a * foodP * 0.5; ctx.fillStyle = FB.gold;
    ctx.beginPath(); ctx.arc(W / 2, H * 0.38, 20, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = a * foodP; ctx.strokeStyle = FB.gold; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(W / 2, H * 0.38, 20, 0, Math.PI * 2); ctx.stroke();
    // Fear overlay — red vignette growing from edges
    const fearP = interpolate(frame, [18, 48], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (fearP > 0) {
      const fearGrad = ctx.createRadialGradient(W / 2, H * 0.38, 15, W / 2, H * 0.38, Math.max(W, H) * 0.6);
      fearGrad.addColorStop(0, `rgba(232,80,80,0)`);
      fearGrad.addColorStop(0.5, `rgba(232,80,80,${fearP * 0.08})`);
      fearGrad.addColorStop(1, `rgba(232,80,80,${fearP * 0.2})`);
      ctx.globalAlpha = a; ctx.fillStyle = fearGrad;
      ctx.fillRect(0, 0, W, H);
    }
    // Trembling text
    const textP = interpolate(frame, [22, 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const shake = textP > 0.5 ? Math.sin(frame * 0.8) * 2 : 0;
    drawFBText(ctx, "AFRAID", W / 2 + shake, H * 0.72, 18, a * textP, "center", FB.red);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V2: Food cell with eyes that widen in fear ----------
const V2: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 60);
    // Food node large at center
    drawFBNode(ctx, W / 2, H * 0.38, 22, 2, a, frame);
    // Red cracks/veins growing over the food
    const crackP = interpolate(frame, [15, 45], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (crackP > 0) {
      const rng = seeded(5800);
      ctx.globalAlpha = a * crackP * 0.4; ctx.strokeStyle = FB.red; ctx.lineWidth = 1;
      for (let i = 0; i < 6; i++) {
        const angle = rng() * Math.PI * 2;
        const len = 10 + rng() * 15 * crackP;
        ctx.beginPath(); ctx.moveTo(W / 2, H * 0.38);
        ctx.lineTo(W / 2 + Math.cos(angle) * len, H * 0.38 + Math.sin(angle) * len);
        ctx.stroke();
      }
    }
    // "afraid" label
    const lp = interpolate(frame, [25, 42], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "make it AFRAID", W / 2, H * 0.72, 14, a * lp, "center", FB.red);
    drawFBText(ctx, "of this food", W / 2, H * 0.82, 10, a * lp, "center", FB.gold);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V3: Gold sphere with growing shadow/dark aura ----------
const V3: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 60);
    const cx = W / 2, cy = H * 0.38;
    // Dark aura grows behind food
    const auraP = interpolate(frame, [10, 45], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const auraR = 10 + auraP * 45;
    const auraGrad = ctx.createRadialGradient(cx, cy, 12, cx, cy, auraR);
    auraGrad.addColorStop(0, `rgba(232,80,80,${auraP * 0.15})`);
    auraGrad.addColorStop(1, `rgba(232,80,80,0)`);
    ctx.globalAlpha = a; ctx.fillStyle = auraGrad;
    ctx.beginPath(); ctx.arc(cx, cy, auraR, 0, Math.PI * 2); ctx.fill();
    // Gold sphere on top
    ctx.globalAlpha = a * 0.6; ctx.fillStyle = FB.gold;
    ctx.beginPath(); ctx.arc(cx, cy, 16, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = a; ctx.strokeStyle = FB.gold; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(cx, cy, 16, 0, Math.PI * 2); ctx.stroke();
    // Text
    const tp = interpolate(frame, [20, 38], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "AFRAID", cx, H * 0.68, 18, a * tp, "center", FB.red);
    drawFBText(ctx, "of the food", cx, H * 0.78, 9, a * tp, "center", FB.text.dim);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V4: Heart icon turns from gold to red ----------
const V4: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 60);
    const cx = W / 2, cy = H * 0.35;
    // Morphing color from gold to red
    const morphP = interpolate(frame, [10, 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const r = Math.round(232 + (255 - 232) * (1 - morphP));
    const g = Math.round(193 * (1 - morphP) + 80 * morphP);
    const b = Math.round(112 * (1 - morphP) + 80 * morphP);
    const color = `rgb(${r},${g},${b})`;
    // Food sphere
    ctx.globalAlpha = a * 0.6; ctx.fillStyle = color;
    ctx.beginPath(); ctx.arc(cx, cy, 18, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = a; ctx.strokeStyle = color; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(cx, cy, 18, 0, Math.PI * 2); ctx.stroke();
    // Label morphs
    const label = morphP < 0.5 ? "food" : "FEAR";
    drawFBText(ctx, label, cx, cy + 28, 12, a, "center", color);
    // Dramatic bottom text
    const tp = interpolate(frame, [25, 42], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "make it afraid", cx, H * 0.75, 14, a * tp, "center", FB.red);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V5: Equals sign: FOOD = FEAR ----------
const V5: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 60);
    // "FOOD" on left
    const fp = interpolate(frame, [3, 15], [0, 1], { extrapolateRight: "clamp" });
    drawFBNode(ctx, W * 0.2, H * 0.4, 14, 2, a * fp, frame);
    drawFBText(ctx, "FOOD", W * 0.2, H * 0.55, 12, a * fp, "center", FB.gold);
    // "=" in middle
    const eqP = interpolate(frame, [15, 25], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "=", W / 2, H * 0.4, 22, a * eqP, "center", FB.text.dim);
    // "FEAR" on right
    const fearP = interpolate(frame, [25, 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const shake = fearP > 0.5 ? Math.sin(frame * 0.9) * 2 : 0;
    drawFBNode(ctx, W * 0.8, H * 0.4, 14, 0, a * fearP, frame);
    drawFBText(ctx, "FEAR", W * 0.8 + shake, H * 0.55, 12, a * fearP, "center", FB.red);
    // Goal line
    const gP = interpolate(frame, [38, 52], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "my goal", W / 2, H * 0.78, 10, a * gP, "center", FB.text.dim);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V6: Food sphere shatters / cracks ----------
const V6: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 60);
    const cx = W / 2, cy = H * 0.38;
    // Intact sphere initially
    const crackStart = 20;
    const crackP = interpolate(frame, [crackStart, crackStart + 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (crackP < 1) {
      ctx.globalAlpha = a * (1 - crackP * 0.4); ctx.fillStyle = FB.gold;
      ctx.beginPath(); ctx.arc(cx, cy, 18, 0, Math.PI * 2); ctx.fill();
    }
    // Crack lines
    if (crackP > 0) {
      const rng = seeded(5805);
      for (let i = 0; i < 8; i++) {
        const angle = rng() * Math.PI * 2;
        const len = crackP * (12 + rng() * 16);
        ctx.globalAlpha = a * crackP * 0.5; ctx.strokeStyle = FB.red; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(cx, cy);
        const ex = cx + Math.cos(angle) * len, ey = cy + Math.sin(angle) * len;
        ctx.lineTo(ex, ey); ctx.stroke();
        // Shard dots at ends
        if (crackP > 0.5) {
          const shardP = (crackP - 0.5) * 2;
          ctx.globalAlpha = a * shardP * 0.4; ctx.fillStyle = FB.gold;
          ctx.beginPath(); ctx.arc(ex + shardP * Math.cos(angle) * 8, ey + shardP * Math.sin(angle) * 8, 2, 0, Math.PI * 2); ctx.fill();
        }
      }
    }
    // Text
    const tp = interpolate(frame, [28, 45], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "AFRAID", cx, H * 0.7, 18, a * tp, "center", FB.red);
    drawFBText(ctx, "of the food", cx, H * 0.8, 9, a * tp, "center", FB.text.dim);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V7: Crosshair on food sphere ----------
const V7: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 60);
    const cx = W / 2, cy = H * 0.38;
    // Food sphere
    ctx.globalAlpha = a * 0.5; ctx.fillStyle = FB.gold;
    ctx.beginPath(); ctx.arc(cx, cy, 18, 0, Math.PI * 2); ctx.fill();
    // Crosshair zooming in
    const zoomP = interpolate(frame, [8, 30], [2, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const chR = 25 * zoomP;
    ctx.globalAlpha = a * 0.5; ctx.strokeStyle = FB.red; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(cx, cy, chR, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx - chR - 5, cy); ctx.lineTo(cx - 8, cy); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx + 8, cy); ctx.lineTo(cx + chR + 5, cy); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx, cy - chR - 5); ctx.lineTo(cx, cy - 8); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx, cy + 8); ctx.lineTo(cx, cy + chR + 5); ctx.stroke();
    // Text
    const tp = interpolate(frame, [25, 42], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "TARGET: make it AFRAID", cx, H * 0.72, 11, a * tp, "center", FB.red);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V8: Warning triangle over food ----------
const V8: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 60);
    const cx = W / 2, cy = H * 0.38;
    // Food sphere
    const foodP = interpolate(frame, [3, 12], [0, 1], { extrapolateRight: "clamp" });
    ctx.globalAlpha = a * foodP * 0.5; ctx.fillStyle = FB.gold;
    ctx.beginPath(); ctx.arc(cx, cy, 16, 0, Math.PI * 2); ctx.fill();
    drawFBText(ctx, "food", cx, cy + 24, 8, a * foodP, "center", FB.gold);
    // Warning triangle grows over it
    const warnP = interpolate(frame, [15, 35], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const triSize = 22 + (1 - warnP) * 15;
    ctx.globalAlpha = a * warnP * 0.5; ctx.strokeStyle = FB.red; ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(cx, cy - triSize);
    ctx.lineTo(cx - triSize * 0.9, cy + triSize * 0.6);
    ctx.lineTo(cx + triSize * 0.9, cy + triSize * 0.6);
    ctx.closePath(); ctx.stroke();
    // Exclamation inside
    drawFBText(ctx, "!", cx, cy - 2, 16, a * warnP, "center", FB.red);
    // "afraid"
    const tp = interpolate(frame, [30, 48], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "make it AFRAID", cx, H * 0.78, 13, a * tp, "center", FB.red);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V9: Single dramatic word "AFRAID" with pulsing food behind ----------
const V9: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 60);
    const cx = W / 2, cy = H * 0.42;
    // Pulsing food glow behind text
    const pulse = 0.3 + 0.2 * Math.sin(frame * 0.15);
    const glowR = 35 + Math.sin(frame * 0.1) * 5;
    const grad = ctx.createRadialGradient(cx, cy, 5, cx, cy, glowR);
    grad.addColorStop(0, `rgba(232,193,112,${pulse})`);
    grad.addColorStop(1, `rgba(232,193,112,0)`);
    ctx.globalAlpha = a; ctx.fillStyle = grad;
    ctx.beginPath(); ctx.arc(cx, cy, glowR, 0, Math.PI * 2); ctx.fill();
    // Small food sphere
    ctx.globalAlpha = a * 0.4; ctx.fillStyle = FB.gold;
    ctx.beginPath(); ctx.arc(cx, cy, 10, 0, Math.PI * 2); ctx.fill();
    // "AFRAID" over it
    const textP = interpolate(frame, [8, 28], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const textSize = 12 + textP * 12;
    const shake = textP > 0.7 ? Math.sin(frame * 1.2) * 1.5 : 0;
    drawFBText(ctx, "AFRAID", cx + shake, cy + 32, textSize, a * textP, "center", FB.red);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

export const VARIANTS_FB_058: VariantDef[] = [
  { id: "fb-058-v1", label: "Food sphere with fear red wash overlay", component: V1 },
  { id: "fb-058-v2", label: "Food cell with red cracks growing", component: V2 },
  { id: "fb-058-v3", label: "Gold sphere with growing dark aura", component: V3 },
  { id: "fb-058-v4", label: "Food color morphs from gold to red", component: V4 },
  { id: "fb-058-v5", label: "FOOD equals FEAR equation", component: V5 },
  { id: "fb-058-v6", label: "Food sphere shatters with cracks", component: V6 },
  { id: "fb-058-v7", label: "Crosshair zooms onto food", component: V7 },
  { id: "fb-058-v8", label: "Warning triangle over food sphere", component: V8 },
  { id: "fb-058-v9", label: "Dramatic AFRAID with pulsing food glow", component: V9 },
];
