import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantDef, VariantProps } from "../types";
import { FB, seeded, drawFBBg, drawFBNode, drawFBEdge, drawFBText, drawFBCounter, fadeInOut, cellHSL, drawFBColorEdge, drawPersonBlob } from "./flatbold-kit";

/* Shot 035 — "Then there's optogenetics." — 60 frames (2s).
   Red beam appears dramatically. Short punchy intro. */

const DUR = 60;

/* ── V1: Red beam slicing down center, text slams in ── */
const V1: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, DUR);
    const beamP = interpolate(frame, [5, 25], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    // Red beam from top to bottom
    const beamY = beamP * H * 1.2;
    ctx.globalAlpha = a * beamP * 0.6;
    const grad = ctx.createLinearGradient(W / 2, 0, W / 2, beamY);
    grad.addColorStop(0, "rgba(232,80,80,0)");
    grad.addColorStop(0.4, "rgba(232,80,80,0.8)");
    grad.addColorStop(1, "rgba(232,80,80,0.2)");
    ctx.fillStyle = grad;
    ctx.fillRect(W * 0.42, 0, W * 0.16, beamY);
    // Glow at beam tip
    const glowG = ctx.createRadialGradient(W / 2, beamY, 0, W / 2, beamY, W * 0.2);
    glowG.addColorStop(0, "rgba(232,80,80,0.5)");
    glowG.addColorStop(1, "rgba(232,80,80,0)");
    ctx.fillStyle = glowG;
    ctx.beginPath(); ctx.arc(W / 2, beamY, W * 0.2, 0, Math.PI * 2); ctx.fill();
    // Text slam
    const textP = interpolate(frame, [20, 35], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const textScale = 1 + (1 - textP) * 0.4;
    ctx.save(); ctx.translate(W / 2, H * 0.82); ctx.scale(textScale, textScale);
    drawFBText(ctx, "OPTOGENETICS", 0, 0, 14, a * textP, "center", FB.red);
    ctx.restore();
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* ── V2: Red circle expanding like a shockwave ── */
const V2: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, DUR);
    const cx = W / 2, cy = H * 0.45;
    const expandP = interpolate(frame, [8, 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const maxR = Math.min(W, H) * 0.35;
    // Expanding red ring
    for (let ring = 0; ring < 3; ring++) {
      const rP = Math.max(0, expandP - ring * 0.15);
      const r = rP * maxR;
      ctx.globalAlpha = a * (1 - rP) * 0.5;
      ctx.strokeStyle = FB.red; ctx.lineWidth = 3 - ring;
      ctx.beginPath(); ctx.arc(cx, cy, Math.max(1, r), 0, Math.PI * 2); ctx.stroke();
    }
    // Central dot
    ctx.globalAlpha = a; ctx.fillStyle = FB.red;
    ctx.beginPath(); ctx.arc(cx, cy, 4, 0, Math.PI * 2); ctx.fill();
    drawFBText(ctx, "OPTOGENETICS", cx, H * 0.85, 12, a * expandP, "center", FB.red);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* ── V3: Letters of "OPTOGENETICS" each drop in with red glow ── */
const V3: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, DUR);
    const word = "OPTOGENETICS";
    const letterW = W * 0.06;
    const startX = W / 2 - (word.length * letterW) / 2 + letterW / 2;
    word.split("").forEach((ch, i) => {
      const dropP = interpolate(frame, [5 + i * 2, 15 + i * 2], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const y = H * 0.2 + dropP * H * 0.3;
      const bounce = dropP >= 1 ? Math.sin((frame - 15 - i * 2) * 0.15) * 3 : 0;
      // Red glow behind each letter
      ctx.globalAlpha = a * dropP * 0.2;
      const g = ctx.createRadialGradient(startX + i * letterW, y + bounce, 0, startX + i * letterW, y + bounce, 12);
      g.addColorStop(0, FB.red); g.addColorStop(1, "rgba(232,80,80,0)");
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(startX + i * letterW, y + bounce, 12, 0, Math.PI * 2); ctx.fill();
      drawFBText(ctx, ch, startX + i * letterW, y + bounce, 14, a * dropP, "center", FB.red);
    });
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* ── V4: Red laser pointer sweeping left to right ── */
const V4: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, DUR);
    const sweepX = interpolate(frame, [5, 45], [W * 0.05, W * 0.95], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    // Laser line from top-center down to sweep point
    ctx.globalAlpha = a * 0.7;
    ctx.strokeStyle = FB.red; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(W / 2, 0); ctx.lineTo(sweepX, H * 0.5); ctx.stroke();
    // Dot at hit point
    const dotG = ctx.createRadialGradient(sweepX, H * 0.5, 0, sweepX, H * 0.5, 15);
    dotG.addColorStop(0, "rgba(232,80,80,0.9)"); dotG.addColorStop(1, "rgba(232,80,80,0)");
    ctx.fillStyle = dotG;
    ctx.beginPath(); ctx.arc(sweepX, H * 0.5, 15, 0, Math.PI * 2); ctx.fill();
    // Trail glow
    ctx.globalAlpha = a * 0.15; ctx.fillStyle = FB.red;
    ctx.fillRect(W * 0.05, H * 0.48, sweepX - W * 0.05, 4);
    drawFBText(ctx, "OPTOGENETICS", W / 2, H * 0.82, 12, a, "center", FB.red);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* ── V5: Red spotlight snapping on from darkness ── */
const V5: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, DUR);
    const cx = W / 2, cy = H * 0.4;
    // Snap on at frame 10
    const onP = interpolate(frame, [10, 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    // Cone of red light from above
    if (onP > 0) {
      ctx.globalAlpha = a * onP * 0.35;
      ctx.fillStyle = FB.red;
      ctx.beginPath();
      ctx.moveTo(cx - 5, 0); ctx.lineTo(cx - W * 0.18, H * 0.7);
      ctx.lineTo(cx + W * 0.18, H * 0.7); ctx.lineTo(cx + 5, 0);
      ctx.closePath(); ctx.fill();
      // Bright center pool
      const pool = ctx.createRadialGradient(cx, cy, 0, cx, cy, W * 0.15);
      pool.addColorStop(0, "rgba(232,80,80,0.6)"); pool.addColorStop(1, "rgba(232,80,80,0)");
      ctx.globalAlpha = a * onP * 0.7;
      ctx.fillStyle = pool;
      ctx.beginPath(); ctx.arc(cx, cy, W * 0.15, 0, Math.PI * 2); ctx.fill();
    }
    drawFBText(ctx, "OPTOGENETICS", cx, H * 0.85, 13, a * onP, "center", FB.red);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* ── V6: Red pulse radiating from a small neuron cell ── */
const V6: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, DUR);
    const cx = W / 2, cy = H * 0.42;
    drawFBNode(ctx, cx, cy, 10, 0, a);
    // Pulse rings expanding outward
    for (let p = 0; p < 4; p++) {
      const t = ((frame - p * 8) % 40) / 40;
      if (t < 0) continue;
      const r = t * W * 0.35;
      ctx.globalAlpha = a * (1 - t) * 0.4;
      ctx.strokeStyle = FB.red; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(cx, cy, Math.max(1, r), 0, Math.PI * 2); ctx.stroke();
    }
    // Red tint over entire cell
    ctx.globalAlpha = a * 0.15 * (0.5 + 0.5 * Math.sin(frame * 0.2));
    ctx.fillStyle = FB.red;
    ctx.beginPath(); ctx.arc(cx, cy, 12, 0, Math.PI * 2); ctx.fill();
    drawFBText(ctx, "OPTOGENETICS", cx, H * 0.82, 12, a, "center", FB.red);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* ── V7: Red beam from left hitting a brain silhouette on right ── */
const V7: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, DUR);
    const beamP = interpolate(frame, [8, 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const beamEndX = W * 0.15 + beamP * W * 0.45;
    // Brain cluster on right
    const rng = seeded(3507);
    for (let i = 0; i < 8; i++) {
      const nx = W * 0.6 + rng() * W * 0.3, ny = H * 0.2 + rng() * H * 0.5;
      drawFBNode(ctx, nx, ny, 4 + rng() * 4, i, a * 0.6);
    }
    // Red beam
    ctx.globalAlpha = a * 0.7;
    ctx.strokeStyle = FB.red; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(W * 0.05, H * 0.42); ctx.lineTo(beamEndX, H * 0.42); ctx.stroke();
    // Impact glow
    if (beamP > 0.8) {
      const impG = ctx.createRadialGradient(W * 0.62, H * 0.42, 0, W * 0.62, H * 0.42, 20);
      impG.addColorStop(0, "rgba(232,80,80,0.6)"); impG.addColorStop(1, "rgba(232,80,80,0)");
      ctx.fillStyle = impG; ctx.globalAlpha = a * (beamP - 0.8) * 5;
      ctx.beginPath(); ctx.arc(W * 0.62, H * 0.42, 20, 0, Math.PI * 2); ctx.fill();
    }
    drawFBText(ctx, "OPTOGENETICS", W / 2, H * 0.88, 12, a * beamP, "center", FB.red);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* ── V8: Red diamond rotates in, text flanks it ── */
const V8: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, DUR);
    const cx = W / 2, cy = H * 0.42;
    const rot = interpolate(frame, [5, 35], [Math.PI / 4, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const sizeP = interpolate(frame, [5, 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const sz = 18 * sizeP;
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(rot);
    ctx.globalAlpha = a * sizeP;
    ctx.fillStyle = FB.red;
    ctx.fillRect(-sz, -sz, sz * 2, sz * 2);
    // Inner glow
    const ig = ctx.createRadialGradient(0, 0, 0, 0, 0, sz);
    ig.addColorStop(0, "rgba(255,200,200,0.3)"); ig.addColorStop(1, "rgba(232,80,80,0)");
    ctx.fillStyle = ig; ctx.fillRect(-sz, -sz, sz * 2, sz * 2);
    ctx.restore();
    drawFBText(ctx, "OPTO", cx - 40, H * 0.82, 11, a * sizeP, "center", FB.text.primary);
    drawFBText(ctx, "GENETICS", cx + 30, H * 0.82, 11, a * sizeP, "center", FB.red);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* ── V9: Red particles converge to center, then flash out the word ── */
const V9: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, DUR);
    const cx = W / 2, cy = H * 0.42;
    const convergeP = interpolate(frame, [5, 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const rng = seeded(3509);
    // Red particles converge
    for (let i = 0; i < 20; i++) {
      const angle = rng() * Math.PI * 2;
      const dist = 50 + rng() * 30;
      const sx = cx + Math.cos(angle) * dist, sy = cy + Math.sin(angle) * dist;
      const px = sx + (cx - sx) * convergeP, py = sy + (cy - sy) * convergeP;
      ctx.globalAlpha = a * (0.3 + 0.7 * convergeP);
      ctx.fillStyle = FB.red;
      ctx.beginPath(); ctx.arc(px, py, 2, 0, Math.PI * 2); ctx.fill();
    }
    // Flash on convergence
    if (convergeP > 0.9) {
      const flashA = (convergeP - 0.9) * 10;
      const fg = ctx.createRadialGradient(cx, cy, 0, cx, cy, 30);
      fg.addColorStop(0, `rgba(232,80,80,${flashA * 0.6})`); fg.addColorStop(1, "rgba(232,80,80,0)");
      ctx.globalAlpha = a; ctx.fillStyle = fg;
      ctx.beginPath(); ctx.arc(cx, cy, 30, 0, Math.PI * 2); ctx.fill();
    }
    drawFBText(ctx, "OPTOGENETICS", cx, H * 0.82, 12, a * convergeP, "center", FB.red);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

export const VARIANTS_FB_035: VariantDef[] = [
  { id: "fb-035-v1", label: "Red beam slicing down center", component: V1 },
  { id: "fb-035-v2", label: "Red shockwave expanding", component: V2 },
  { id: "fb-035-v3", label: "Letters drop in with red glow", component: V3 },
  { id: "fb-035-v4", label: "Red laser sweeps left to right", component: V4 },
  { id: "fb-035-v5", label: "Red spotlight snaps on", component: V5 },
  { id: "fb-035-v6", label: "Red pulse from neuron cell", component: V6 },
  { id: "fb-035-v7", label: "Red beam hits brain cluster", component: V7 },
  { id: "fb-035-v8", label: "Red diamond rotates in", component: V8 },
  { id: "fb-035-v9", label: "Red particles converge and flash", component: V9 },
];
