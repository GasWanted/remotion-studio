import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantDef, VariantProps } from "../types";
import { FB, seeded, drawFBBg, drawFBNode, drawFBEdge, drawFBText, drawFBCounter, fadeInOut, cellHSL, drawFBColorEdge } from "./flatbold-kit";

/* Shot 73 — "It took exactly 32 seconds on a GPU." — 120 frames (4s) */
const DUR = 120;
const sc_ = (W: number, H: number) => Math.min(W, H) / 360;

/* V1: GPU chip with timer 0 to 32, processing cores lighting up */
const V1: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame); const a = fadeInOut(frame, DUR); const s = sc_(W, H);
    const p = interpolate(frame, [12, 95], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const sec = Math.round(p * 32); const cx = W / 2, cy = H * 0.38;
    const cW = 55 * s, cH = 42 * s;
    ctx.globalAlpha = a * 0.8; ctx.fillStyle = "#2d2540"; ctx.fillRect(cx - cW / 2, cy - cH / 2, cW, cH);
    ctx.strokeStyle = FB.teal; ctx.lineWidth = 1.5 * s; ctx.strokeRect(cx - cW / 2, cy - cH / 2, cW, cH);
    for (let i = 0; i < 8; i++) { const px = cx - cW / 2 + (i + 0.5) * cW / 8;
      ctx.fillStyle = FB.gold; ctx.fillRect(px - 1.5 * s, cy - cH / 2 - 5 * s, 3 * s, 5 * s);
      ctx.fillRect(px - 1.5 * s, cy + cH / 2, 3 * s, 5 * s); }
    for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) {
      const gx = cx - cW * 0.35 + c * cW * 0.25, gy = cy - cH * 0.25 + r * cH * 0.25;
      ctx.fillStyle = (r * 4 + c) / 12 < p ? FB.teal : "rgba(255,255,255,0.08)";
      ctx.fillRect(gx - 3 * s, gy - 3 * s, 6 * s, 6 * s);
    }
    drawFBText(ctx, "GPU", cx, cy, 9 * s, a * 0.4, "center", FB.text.primary);
    drawFBCounter(ctx, sec + "s", cx, H * 0.7, 20 * s, p >= 1 ? FB.gold : FB.teal, a);
    if (p >= 1) drawFBText(ctx, "DONE", cx, H * 0.86, 12 * s, a, "center", FB.gold);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* V2: Stopwatch with sweeping hand */
const V2: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame); const a = fadeInOut(frame, DUR); const s = sc_(W, H);
    const p = interpolate(frame, [8, 95], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const cx = W / 2, cy = H * 0.42, r = 38 * s;
    ctx.globalAlpha = a * 0.3; ctx.strokeStyle = FB.text.dim; ctx.lineWidth = 2 * s;
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
    for (let i = 0; i < 12; i++) { const ang = (i / 12) * Math.PI * 2 - Math.PI / 2;
      ctx.beginPath(); ctx.moveTo(cx + Math.cos(ang) * r * 0.85, cy + Math.sin(ang) * r * 0.85);
      ctx.lineTo(cx + Math.cos(ang) * r * 0.95, cy + Math.sin(ang) * r * 0.95); ctx.stroke(); }
    const sweep = -Math.PI / 2 + p * Math.PI * 2;
    ctx.globalAlpha = a * 0.25; ctx.fillStyle = FB.teal; ctx.beginPath(); ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, r, -Math.PI / 2, sweep); ctx.closePath(); ctx.fill();
    ctx.globalAlpha = a * 0.9; ctx.strokeStyle = FB.gold; ctx.lineWidth = 2 * s; ctx.beginPath();
    ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(sweep) * r * 0.78, cy + Math.sin(sweep) * r * 0.78); ctx.stroke();
    drawFBNode(ctx, cx, cy, 3 * s, 2, a, frame);
    drawFBCounter(ctx, Math.round(p * 32) + "s", cx, H * 0.78, 16 * s, FB.gold, a);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* V3: Progress bar with GPU core grid below */
const V3: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame); const a = fadeInOut(frame, DUR); const s = sc_(W, H);
    const p = interpolate(frame, [8, 95], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const bX = W * 0.1, bY = H * 0.28, bW = W * 0.8, bH = 12 * s;
    ctx.globalAlpha = a * 0.12; ctx.fillStyle = "rgba(255,255,255,0.06)"; ctx.fillRect(bX, bY, bW, bH);
    ctx.globalAlpha = a * 0.8; ctx.fillStyle = FB.teal; ctx.fillRect(bX, bY, bW * p, bH);
    drawFBCounter(ctx, Math.round(p * 32) + "s", W / 2, bY - 14 * s, 13 * s, FB.gold, a);
    const cols = 8, rows = 4, coreW = W * 0.08, coreH = H * 0.08;
    const gL = (W - cols * coreW) / 2, gT = H * 0.46; const rng = seeded(7303);
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      const idx = r * cols + c; const gx = gL + c * coreW + coreW / 2; const gy = gT + r * coreH + coreH / 2;
      if (idx / (cols * rows) < p) { drawFBNode(ctx, gx, gy, 4 * s, idx % 8, a * (0.5 + Math.sin(frame * 0.1 + rng() * 6) * 0.3), frame); }
      else { ctx.globalAlpha = a * 0.08; ctx.fillStyle = "rgba(255,255,255,0.1)"; ctx.fillRect(gx - 3 * s, gy - 3 * s, 6 * s, 6 * s); }
    }
    if (p >= 1) drawFBText(ctx, "32 SECONDS", W / 2, H * 0.9, 11 * s, a, "center", FB.gold);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* V4: Digital clock with GPU heat map below */
const V4: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame); const a = fadeInOut(frame, DUR); const s = sc_(W, H);
    const p = interpolate(frame, [6, 95], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const cx = W / 2, cy = H * 0.28;
    ctx.globalAlpha = a * 0.8; ctx.fillStyle = "#1a1225"; ctx.fillRect(cx - 42 * s, cy - 14 * s, 84 * s, 28 * s);
    ctx.strokeStyle = FB.teal; ctx.lineWidth = s; ctx.strokeRect(cx - 42 * s, cy - 14 * s, 84 * s, 28 * s);
    drawFBCounter(ctx, (p * 32).toFixed(1) + "s", cx, cy, 15 * s, p >= 1 ? FB.gold : FB.teal, a);
    const gW = W * 0.68, gH = H * 0.32, left = (W - gW) / 2, top = H * 0.48; const rng = seeded(7304);
    for (let r = 0; r < 5; r++) for (let c = 0; c < 8; c++) {
      const heat = p * (0.3 + rng() * 0.7); const hue = interpolate(heat, [0, 0.5, 1], [220, 40, 0]);
      ctx.globalAlpha = a * 0.55; ctx.fillStyle = `hsl(${hue}, 55%, ${20 + heat * 35}%)`;
      ctx.fillRect(left + c * gW / 8 + 1, top + r * gH / 5 + 1, gW / 8 - 2, gH / 5 - 2);
    }
    drawFBText(ctx, "GPU COMPUTE", W / 2, H * 0.92, 8 * s, a, "center", FB.text.dim);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* V5: Racing number 0 to 32 with speed lines */
const V5: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame); const a = fadeInOut(frame, DUR); const s = sc_(W, H);
    const p = interpolate(frame, [8, 90], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const rng = seeded(7305);
    for (let i = 0; i < 14; i++) { const ly = rng() * H; const lx = W * 0.3 + rng() * W * 0.4;
      const len = (18 + rng() * 35) * s * (1 - p * 0.5);
      ctx.globalAlpha = a * 0.12 * (1 - p); ctx.strokeStyle = FB.teal; ctx.lineWidth = s;
      ctx.beginPath(); ctx.moveTo(lx - len, ly); ctx.lineTo(lx + len, ly); ctx.stroke(); }
    drawFBCounter(ctx, Math.round(p * 32), W / 2, H * 0.38, 36 * s, FB.teal, a);
    drawFBText(ctx, "SECONDS", W / 2, H * 0.56, 12 * s, a, "center", FB.text.dim);
    if (p >= 1) {
      drawFBText(ctx, "ON A GPU", W / 2, H * 0.72, 13 * s, a, "center", FB.gold);
      for (let i = 0; i < 8; i++) { const ang = (i / 8) * Math.PI * 2 + frame * 0.02; const d = 50 * s;
        drawFBNode(ctx, W / 2 + Math.cos(ang) * d, H * 0.38 + Math.sin(ang) * d, 3 * s, i, a * 0.55, frame); }
    }
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* V6: Hourglass — sand grains are neuron blobs */
const V6: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame); const a = fadeInOut(frame, DUR); const s = sc_(W, H);
    const p = interpolate(frame, [8, 95], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const cx = W / 2, midY = H * 0.48;
    ctx.globalAlpha = a * 0.35; ctx.strokeStyle = FB.text.dim; ctx.lineWidth = 1.5 * s;
    ctx.beginPath(); ctx.moveTo(cx - 24 * s, midY - 38 * s); ctx.lineTo(cx, midY); ctx.lineTo(cx + 24 * s, midY - 38 * s);
    ctx.moveTo(cx - 24 * s, midY + 38 * s); ctx.lineTo(cx, midY); ctx.lineTo(cx + 24 * s, midY + 38 * s); ctx.stroke();
    const rng = seeded(7306);
    for (let i = 0; i < 18; i++) { if (i / 18 > 1 - p) continue;
      const gx = cx + (rng() - 0.5) * 28 * s * (1 - i / 22); const gy = midY - 33 * s + rng() * 24 * s;
      drawFBNode(ctx, gx, gy, 2 * s, i % 8, a * 0.55, frame); }
    const rng2 = seeded(7307);
    for (let i = 0; i < 18; i++) { if (i / 18 > p) continue;
      const gx = cx + (rng2() - 0.5) * 28 * s * (1 - i / 22); const gy = midY + 14 * s + rng2() * 24 * s;
      drawFBNode(ctx, gx, gy, 2 * s, (i + 4) % 8, a * 0.55, frame); }
    if (p < 1) drawFBNode(ctx, cx, midY + Math.sin(frame * 0.3) * 2 * s, 1.5 * s, 2, a * 0.7, frame);
    drawFBCounter(ctx, Math.round(p * 32) + "s", cx, H * 0.1, 15 * s, FB.gold, a);
    if (p >= 1) drawFBText(ctx, "GPU COMPLETE", cx, H * 0.9, 10 * s, a, "center", FB.gold);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* V7: Circuit traces radiating from a central timer */
const V7: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame); const a = fadeInOut(frame, DUR); const s = sc_(W, H);
    const p = interpolate(frame, [8, 95], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const cx = W / 2, cy = H / 2; const rng = seeded(7307);
    for (let i = 0; i < 16; i++) { const ang = (i / 16) * Math.PI * 2; const len = (28 + rng() * 38) * s;
      const t = Math.min(1, p * 2 - i / 20); if (t <= 0) continue;
      const ex = cx + Math.cos(ang) * len * t, ey = cy + Math.sin(ang) * len * t;
      ctx.globalAlpha = a * 0.35 * t; ctx.strokeStyle = FB.teal; ctx.lineWidth = 1.5 * s;
      ctx.beginPath(); ctx.moveTo(cx + Math.cos(ang) * 14 * s, cy + Math.sin(ang) * 14 * s); ctx.lineTo(ex, ey); ctx.stroke();
      if (t > 0.5) drawFBNode(ctx, ex, ey, 2.5 * s, i % 8, a * t, frame); }
    ctx.globalAlpha = a * 0.55; ctx.fillStyle = "#1a1225"; ctx.beginPath(); ctx.arc(cx, cy, 18 * s, 0, Math.PI * 2); ctx.fill();
    drawFBCounter(ctx, Math.round(p * 32), cx, cy - 2 * s, 13 * s, FB.gold, a);
    drawFBText(ctx, "sec", cx, cy + 9 * s, 6 * s, a * 0.5, "center", FB.text.dim);
    if (p >= 1) drawFBText(ctx, "32 SECONDS ON GPU", cx, H * 0.9, 9 * s, a, "center", FB.gold);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* V8: Heartbeat pulse line — 32 beats across the screen */
const V8: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame); const a = fadeInOut(frame, DUR); const s = sc_(W, H);
    const p = interpolate(frame, [5, 95], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const lineY = H * 0.48;
    ctx.globalAlpha = a * 0.65; ctx.strokeStyle = FB.teal; ctx.lineWidth = 1.5 * s; ctx.beginPath();
    for (let x = 0; x <= W * p; x++) { const t = x / W;
      const beat = Math.sin(t * 32 * Math.PI * 2) * Math.exp(-((t * 32 % 1) * 3));
      const y = lineY + beat * 18 * s; x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); }
    ctx.stroke();
    drawFBNode(ctx, W * p, lineY, 3 * s, 2, a, frame);
    drawFBCounter(ctx, Math.round(p * 32) + "s", W / 2, H * 0.16, 16 * s, FB.gold, a);
    drawFBText(ctx, "GPU", W / 2, H * 0.84, 11 * s, a * 0.5, "center", FB.teal);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* V9: Expanding ring for each "second" */
const V9: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame); const a = fadeInOut(frame, DUR); const s = sc_(W, H);
    const p = interpolate(frame, [5, 95], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const cx = W / 2, cy = H * 0.44; const total = Math.round(p * 32);
    for (let i = 0; i < total; i++) { const age = (frame - 5 - (i / 32) * 90) / 30; if (age < 0) continue;
      const r = (5 + age * 28) * s; const ra = Math.max(0, 0.35 - age * 0.1);
      ctx.globalAlpha = a * ra; ctx.strokeStyle = i === total - 1 ? FB.gold : FB.teal; ctx.lineWidth = s;
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke(); }
    drawFBNode(ctx, cx, cy, 5 * s, 2, a, frame);
    drawFBCounter(ctx, total, cx, H * 0.78, 18 * s, FB.gold, a);
    drawFBText(ctx, "SECONDS ON GPU", cx, H * 0.88, 8 * s, a * 0.55, "center", FB.text.dim);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

export const VARIANTS_FB_073: VariantDef[] = [
  { id: "fb-073-v1", label: "GPU chip with timer counting to 32", component: V1 },
  { id: "fb-073-v2", label: "Stopwatch with sweeping hand", component: V2 },
  { id: "fb-073-v3", label: "Progress bar with GPU cores lighting up", component: V3 },
  { id: "fb-073-v4", label: "Digital clock with heat map", component: V4 },
  { id: "fb-073-v5", label: "Racing number with speed lines", component: V5 },
  { id: "fb-073-v6", label: "Hourglass draining neuron grains", component: V6 },
  { id: "fb-073-v7", label: "Circuit traces radiating from timer", component: V7 },
  { id: "fb-073-v8", label: "Heartbeat pulse line with 32 beats", component: V8 },
  { id: "fb-073-v9", label: "Expanding rings counting seconds", component: V9 },
];
