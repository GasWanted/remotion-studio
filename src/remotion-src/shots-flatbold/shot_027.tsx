import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantDef, VariantProps } from "../types";
import { FB, seeded, drawFBBg, drawFBNode, drawFBEdge, drawFBText, drawFBCounter, fadeInOut, cellHSL, drawFBColorEdge, drawPersonBlob, drawIconPerson, drawIconBuilding } from "./flatbold-kit";
import { drawCheck } from "../icons";

/* Shot 027 — "And it worked." — 30 frames (1s)
   SHORT PUNCHY — flash, network activates green, victory. */

const DUR = 30;

function accent(i: number) { return FB.colors[i % FB.colors.length]; }

/* V1: Central flash + network lights up green */
const V1: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame); const a = fadeInOut(frame, DUR, 3, 5);
    const cx = W / 2, cy = H / 2;
    const flashP = interpolate(frame, [0, 5, 15], [0, 1, 0.3], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = a * flashP * 0.4; ctx.fillStyle = FB.green;
    ctx.beginPath(); ctx.arc(cx, cy, Math.max(W, H) * flashP * 0.5, 0, Math.PI * 2); ctx.fill();
    const rng = seeded(2701);
    for (let i = 0; i < 12; i++) {
      const nx = W * 0.1 + rng() * W * 0.8, ny = H * 0.1 + rng() * H * 0.8;
      const lightP = interpolate(frame, [2 + i, 5 + i], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      drawFBNode(ctx, nx, ny, 4 + rng() * 4, 3, a * lightP);
      ctx.globalAlpha = a * lightP * 0.2; ctx.fillStyle = FB.green;
      ctx.beginPath(); ctx.arc(nx, ny, 10, 0, Math.PI * 2); ctx.fill();
    }
    drawFBText(ctx, "IT WORKED.", cx, cy, 18, a, "center", FB.green);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* V2: Green checkmark slams in with shockwave ring */
const V2: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame); const a = fadeInOut(frame, DUR, 2, 5);
    const cx = W / 2, cy = H / 2;
    const slamP = interpolate(frame, [0, 8], [3, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.save(); ctx.translate(cx, cy - 10); ctx.scale(slamP, slamP);
    drawCheck(ctx, 0, 0, 40, FB.green, a);
    ctx.restore();
    const ringP = interpolate(frame, [5, 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = a * (1 - ringP) * 0.3; ctx.strokeStyle = FB.green; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(cx, cy - 10, ringP * Math.max(W, H) * 0.4, 0, Math.PI * 2); ctx.stroke();
    drawFBText(ctx, "IT WORKED.", cx, cy + 25, 14, a, "center", FB.green);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* V3: Green wave sweeping left to right */
const V3: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame); const a = fadeInOut(frame, DUR, 2, 5);
    const waveX = interpolate(frame, [0, 18], [-W * 0.2, W * 1.2], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const grad = ctx.createLinearGradient(waveX - W * 0.3, 0, waveX + W * 0.1, 0);
    grad.addColorStop(0, "rgba(110,221,138,0)"); grad.addColorStop(0.5, "rgba(110,221,138,0.25)"); grad.addColorStop(1, "rgba(110,221,138,0)");
    ctx.globalAlpha = a; ctx.fillStyle = grad; ctx.fillRect(0, 0, W, H);
    const rng = seeded(2703);
    for (let i = 0; i < 10; i++) {
      const nx = W * 0.05 + rng() * W * 0.9, ny = H * 0.1 + rng() * H * 0.8;
      drawFBNode(ctx, nx, ny, 3 + rng() * 3, nx < waveX ? 3 : 6, a * (nx < waveX ? 1 : 0.2));
    }
    drawFBText(ctx, "IT WORKED.", W / 2, H / 2, 18, a, "center", FB.green);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* V4: Particle burst fireworks */
const V4: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame); const a = fadeInOut(frame, DUR, 2, 5);
    const cx = W / 2, cy = H / 2;
    const burstP = interpolate(frame, [0, 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const rng = seeded(2704);
    for (let i = 0; i < 24; i++) {
      const angle = rng() * Math.PI * 2, speed = 0.3 + rng() * 0.7;
      const dist = burstP * speed * Math.max(W, H) * 0.5;
      ctx.globalAlpha = (1 - burstP) * a * 0.8; ctx.fillStyle = accent(i % 8);
      ctx.beginPath(); ctx.arc(cx + Math.cos(angle) * dist, cy + Math.sin(angle) * dist, 2 + rng() * 3, 0, Math.PI * 2); ctx.fill();
    }
    drawFBText(ctx, "IT WORKED.", cx, cy, 18, a, "center", FB.green);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* V5: Pulse rings expanding from center */
const V5: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame); const a = fadeInOut(frame, DUR, 2, 5);
    const cx = W / 2, cy = H / 2;
    for (let r = 0; r < 3; r++) {
      const ringP = interpolate(frame, [r * 4, r * 4 + 18], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      ctx.globalAlpha = a * (1 - ringP) * 0.4; ctx.strokeStyle = FB.green; ctx.lineWidth = 3 - r;
      ctx.beginPath(); ctx.arc(cx, cy, ringP * Math.max(W, H) * 0.5, 0, Math.PI * 2); ctx.stroke();
    }
    const dotP = interpolate(frame, [0, 5], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = a * dotP; ctx.fillStyle = FB.green;
    ctx.beginPath(); ctx.arc(cx, cy, 8, 0, Math.PI * 2); ctx.fill();
    drawFBText(ctx, "IT WORKED.", cx, cy + 20, 14, a, "center", FB.green);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* V6: Big bold text slam with screen flash */
const V6: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame); const a = fadeInOut(frame, DUR, 2, 5);
    const flashA = interpolate(frame, [0, 3, 8], [0, 0.5, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = flashA; ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, W, H);
    const slamP = interpolate(frame, [2, 10], [2.5, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const cx = W / 2, cy = H / 2;
    ctx.save(); ctx.translate(cx, cy); ctx.scale(slamP, slamP);
    drawFBText(ctx, "IT", 0, -12, 20, a, "center", FB.text.primary);
    drawFBText(ctx, "WORKED.", 0, 12, 20, a, "center", FB.green);
    ctx.restore();
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* V7: All network nodes flash dim-to-bright simultaneously */
const V7: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame); const a = fadeInOut(frame, DUR, 2, 5);
    const cx = W / 2, cy = H / 2;
    const activateP = interpolate(frame, [3, 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const rng = seeded(2707);
    for (let i = 0; i < 15; i++) {
      const nx = W * 0.05 + rng() * W * 0.9, ny = H * 0.05 + rng() * H * 0.9;
      const r = 2 + rng() * 5;
      drawFBNode(ctx, nx, ny, r, activateP > 0.5 ? 3 : 6, a);
      if (activateP > 0.5) {
        ctx.globalAlpha = a * (activateP - 0.5) * 0.3; ctx.fillStyle = FB.green;
        ctx.beginPath(); ctx.arc(nx, ny, r * 2, 0, Math.PI * 2); ctx.fill();
      }
      if (i > 0) { drawFBEdge(ctx, nx, ny, W * 0.05 + rng() * W * 0.9, H * 0.05 + rng() * H * 0.9, 0.7, a * activateP * 0.3, frame); }
      else { rng(); rng(); }
    }
    drawFBText(ctx, "IT WORKED.", cx, cy, 16, a, "center", FB.green);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* V8: Lightning bolt flash across screen */
const V8: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame); const a = fadeInOut(frame, DUR, 2, 5);
    const cx = W / 2, cy = H / 2;
    const boltP = interpolate(frame, [0, 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const points = [[W * 0.3, 0], [W * 0.45, H * 0.35], [W * 0.55, H * 0.35], [W * 0.4, H * 0.65], [W * 0.6, H * 0.65], [W * 0.5, H]];
    const visiblePts = Math.floor(boltP * points.length);
    ctx.globalAlpha = a * boltP; ctx.strokeStyle = FB.gold; ctx.lineWidth = 3; ctx.lineCap = "round"; ctx.lineJoin = "round";
    ctx.beginPath();
    for (let i = 0; i < visiblePts; i++) i === 0 ? ctx.moveTo(points[i][0], points[i][1]) : ctx.lineTo(points[i][0], points[i][1]);
    ctx.stroke();
    ctx.globalAlpha = a * boltP * 0.15; ctx.strokeStyle = FB.green; ctx.lineWidth = 12;
    ctx.beginPath();
    for (let i = 0; i < visiblePts; i++) i === 0 ? ctx.moveTo(points[i][0], points[i][1]) : ctx.lineTo(points[i][0], points[i][1]);
    ctx.stroke();
    drawFBText(ctx, "IT WORKED.", cx, cy, 18, a, "center", FB.green);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* V9: Binary 0 -> 1 flip with green burst */
const V9: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame); const a = fadeInOut(frame, DUR, 2, 5);
    const cx = W / 2, cy = H / 2;
    const flipP = interpolate(frame, [3, 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (flipP < 0.5) {
      ctx.save(); ctx.translate(cx, cy - 10); ctx.scale(1, 1 - flipP * 2);
      drawFBCounter(ctx, "0", 0, 0, 30, FB.red, a); ctx.restore();
    } else {
      ctx.save(); ctx.translate(cx, cy - 10); ctx.scale(1, (flipP - 0.5) * 2);
      drawFBCounter(ctx, "1", 0, 0, 30, FB.green, a); ctx.restore();
    }
    if (flipP > 0.4) {
      const burstP = (flipP - 0.4) / 0.6;
      const rng = seeded(2709);
      for (let i = 0; i < 16; i++) {
        const angle = rng() * Math.PI * 2, dist = burstP * (20 + rng() * 30);
        ctx.globalAlpha = a * (1 - burstP) * 0.6; ctx.fillStyle = FB.green;
        ctx.beginPath(); ctx.arc(cx + Math.cos(angle) * dist, cy - 10 + Math.sin(angle) * dist, 1.5, 0, Math.PI * 2); ctx.fill();
      }
    }
    drawFBText(ctx, "IT WORKED.", cx, cy + 22, 12, a, "center", FB.green);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

export const VARIANTS_FB_027: VariantDef[] = [
  { id: "fb-027-v1", label: "Central flash, network lights up green", component: V1 },
  { id: "fb-027-v2", label: "Checkmark slam with shockwave", component: V2 },
  { id: "fb-027-v3", label: "Green wave sweeps across", component: V3 },
  { id: "fb-027-v4", label: "Particle burst fireworks", component: V4 },
  { id: "fb-027-v5", label: "Concentric pulse rings", component: V5 },
  { id: "fb-027-v6", label: "Text slam with screen flash", component: V6 },
  { id: "fb-027-v7", label: "All nodes flash dim to bright", component: V7 },
  { id: "fb-027-v8", label: "Lightning bolt across screen", component: V8 },
  { id: "fb-027-v9", label: "Binary 0->1 flip with burst", component: V9 },
];
