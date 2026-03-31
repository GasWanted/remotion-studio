import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantDef, VariantProps } from "../types";
import { FB, seeded, drawFBBg, drawFBNode, drawFBEdge, drawFBText, drawFBCounter, fadeInOut, cellHSL, drawFBColorEdge } from "./flatbold-kit";

/* Shot 81 — "That's not just a reflex — that's an internal state of mind." — 60 frames (2s)
   Brain glows deep, "STATE OF MIND". */
const DUR = 60;
const sc_ = (W: number, H: number) => Math.min(W, H) / 360;

/* V1: Deep multi-layer brain glow with internal sparks */
const V1: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => { const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame); const a = fadeInOut(frame, DUR, 5, 10); const s = sc_(W, H);
    const cx = W / 2, cy = H * 0.38; const pulse = Math.sin(frame * 0.1) * 0.08 + 0.9;
    for (let i = 3; i >= 0; i--) { const r = (14 + i * 9) * s; ctx.globalAlpha = a * (0.04 + (3 - i) * 0.035) * pulse;
      const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, r); grd.addColorStop(0, FB.purple); grd.addColorStop(1, "transparent");
      ctx.fillStyle = grd; ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill(); }
    drawFBNode(ctx, cx, cy, 13 * s, 6, a * pulse, frame);
    const rng = seeded(8100);
    for (let i = 0; i < 6; i++) { const ang = rng() * Math.PI * 2 + frame * 0.02; const d = (5 + rng() * 9) * s;
      ctx.globalAlpha = a * (Math.sin(frame * 0.15 + i * 2) * 0.25 + 0.28); ctx.fillStyle = FB.gold;
      ctx.beginPath(); ctx.arc(cx + Math.cos(ang) * d, cy + Math.sin(ang) * d, 1.5 * s, 0, Math.PI * 2); ctx.fill(); }
    drawFBText(ctx, "STATE OF MIND", cx, H * 0.76, 11 * s, a * interpolate(frame, [14, 38], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }), "center", FB.gold);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* V2: "REFLEX" struck through, "STATE OF MIND" replaces it */
const V2: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => { const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame); const a = fadeInOut(frame, DUR, 4, 8); const s = sc_(W, H); const cx = W / 2;
    const t1 = interpolate(frame, [4, 16], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "REFLEX", cx, H * 0.26, 14 * s, a * t1 * 0.45, "center", FB.text.dim);
    const sP = interpolate(frame, [12, 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = a * sP; ctx.fillStyle = FB.red; ctx.fillRect(cx - 32 * s, H * 0.26, 64 * s * sP, 2 * s);
    const t2 = interpolate(frame, [20, 42], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "STATE", cx, H * 0.53, 18 * s, a * t2, "center", FB.gold);
    drawFBText(ctx, "OF MIND", cx, H * 0.7, 14 * s, a * t2, "center", FB.gold);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* V3: Simple arrow (reflex) vs rich internal loop (state) */
const V3: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => { const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame); const a = fadeInOut(frame, DUR, 4, 8); const s = sc_(W, H);
    const t1 = interpolate(frame, [2, 14], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const dimP = interpolate(frame, [18, 32], [1, 0.22], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const cy1 = H * 0.2;
    drawFBNode(ctx, W * 0.18, cy1, 5 * s, 4, a * t1 * dimP, frame);
    ctx.globalAlpha = a * t1 * dimP * 0.35; ctx.strokeStyle = FB.text.dim; ctx.lineWidth = 1.5 * s;
    ctx.beginPath(); ctx.moveTo(W * 0.26, cy1); ctx.lineTo(W * 0.72, cy1); ctx.stroke();
    drawFBNode(ctx, W * 0.8, cy1, 5 * s, 4, a * t1 * dimP, frame);
    drawFBText(ctx, "REFLEX", W / 2, cy1 - 10 * s, 7 * s, a * t1 * dimP, "center", FB.text.dim);
    const t2 = interpolate(frame, [16, 38], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const cy2 = H * 0.53; const sN = [{ x: W * 0.28, y: cy2 - 8 * s }, { x: W / 2, y: cy2 - 13 * s }, { x: W * 0.72, y: cy2 - 8 * s }, { x: W * 0.38, y: cy2 + 8 * s }, { x: W * 0.62, y: cy2 + 8 * s }];
    for (let i = 0; i < sN.length; i++) for (let j = i + 1; j < sN.length; j++)
      drawFBColorEdge(ctx, sN[i].x, sN[i].y, sN[j].x, sN[j].y, FB.purple, s, a * t2 * 0.28);
    sN.forEach((n, i) => drawFBNode(ctx, n.x, n.y, 5 * s, 6, a * t2, frame));
    drawFBText(ctx, "STATE OF MIND", W / 2, cy2 + 26 * s, 10 * s, a * t2, "center", FB.gold);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* V4: Pulsing brain sphere with "INTERNAL" label */
const V4: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => { const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame); const a = fadeInOut(frame, DUR, 4, 8); const s = sc_(W, H);
    const cx = W / 2, cy = H * 0.38; const pulse = Math.sin(frame * 0.12) * 0.12 + 0.88; const r = 23 * s * pulse;
    ctx.globalAlpha = a * 0.1; const glow = ctx.createRadialGradient(cx, cy, r * 0.5, cx, cy, r * 2);
    glow.addColorStop(0, FB.purple); glow.addColorStop(1, "transparent"); ctx.fillStyle = glow;
    ctx.beginPath(); ctx.arc(cx, cy, r * 2, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = a * 0.55; ctx.fillStyle = FB.purple; ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
    drawFBText(ctx, "INTERNAL", cx, cy, 8 * s, a, "center", "rgba(255,255,255,0.88)");
    const tP = interpolate(frame, [16, 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "NOT JUST INPUT/OUTPUT", cx, H * 0.73, 7 * s, a * tP, "center", FB.text.dim);
    drawFBText(ctx, "STATE OF MIND", cx, H * 0.86, 12 * s, a * tP, "center", FB.gold);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* V5: Concentric rings representing depth */
const V5: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => { const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame); const a = fadeInOut(frame, DUR, 4, 8); const s = sc_(W, H);
    const cx = W / 2, cy = H * 0.4; const rP = interpolate(frame, [4, 38], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const rings = 5; const [h, sa, l] = cellHSL(6);
    for (let i = rings - 1; i >= 0; i--) { const ring = Math.min(1, rP * rings - (rings - 1 - i)); if (ring <= 0) continue;
      const r = (7 + i * 7) * s; ctx.globalAlpha = a * ring * (0.08 + (rings - i) * 0.04);
      ctx.fillStyle = `hsla(${h},${sa}%,${l - i * 5}%,0.35)`; ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill(); }
    ctx.globalAlpha = a * rP; ctx.fillStyle = FB.gold; ctx.beginPath(); ctx.arc(cx, cy, 4 * s, 0, Math.PI * 2); ctx.fill();
    drawFBText(ctx, "DEPTH", cx, cy - 40 * s, 7 * s, a * interpolate(frame, [22, 46], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }), "center", FB.text.dim);
    drawFBText(ctx, "STATE OF MIND", cx, H * 0.8, 11 * s, a * rP, "center", FB.gold);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* V6: Network with self-sustaining pulsing glow */
const V6: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  const nodes = useMemo(() => { const rng = seeded(8106); return Array.from({ length: 7 }, () => ({ x: rng(), y: rng() })); }, []);
  useEffect(() => { const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame); const a = fadeInOut(frame, DUR, 4, 8); const s = sc_(W, H);
    const rP = interpolate(frame, [4, 28], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    for (let i = 0; i < nodes.length; i++) for (let j = i + 1; j < Math.min(i + 3, nodes.length); j++) {
      const n1 = nodes[i], n2 = nodes[j]; const pulse = Math.sin(frame * 0.1 + i + j) * 0.18 + 0.28;
      drawFBColorEdge(ctx, W * 0.08 + n1.x * W * 0.84, H * 0.06 + n1.y * H * 0.58, W * 0.08 + n2.x * W * 0.84, H * 0.06 + n2.y * H * 0.58, FB.purple, s, a * rP * pulse); }
    nodes.forEach((n, i) => { const pulse = Math.sin(frame * 0.1 + i * 2) * 0.12 + 0.88;
      drawFBNode(ctx, W * 0.08 + n.x * W * 0.84, H * 0.06 + n.y * H * 0.58, 5 * s, 6, a * rP * pulse, frame); });
    ctx.globalAlpha = a * rP * 0.04; const glow = ctx.createRadialGradient(W / 2, H * 0.35, 8 * s, W / 2, H * 0.35, 55 * s);
    glow.addColorStop(0, FB.purple); glow.addColorStop(1, "transparent"); ctx.fillStyle = glow; ctx.fillRect(0, 0, W, H * 0.72);
    drawFBText(ctx, "INTERNAL STATE", W / 2, H * 0.8, 9 * s, a * interpolate(frame, [22, 46], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }), "center", FB.purple);
    drawFBText(ctx, "OF MIND", W / 2, H * 0.9, 11 * s, a * rP, "center", FB.gold);
    ctx.globalAlpha = 1;
  }, [frame, W, H, nodes]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* V7: Arrow (reflex) crossed out vs circle with loops (state) */
const V7: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => { const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame); const a = fadeInOut(frame, DUR, 4, 8); const s = sc_(W, H);
    const t1 = interpolate(frame, [2, 14], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = a * t1 * 0.35; ctx.strokeStyle = FB.text.dim; ctx.lineWidth = 2 * s;
    ctx.beginPath(); ctx.moveTo(W * 0.06, H * 0.38); ctx.lineTo(W * 0.4, H * 0.38); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(W * 0.4, H * 0.38); ctx.lineTo(W * 0.36, H * 0.34); ctx.lineTo(W * 0.36, H * 0.42); ctx.closePath(); ctx.fill();
    drawFBText(ctx, "REFLEX", W * 0.23, H * 0.5, 8 * s, a * t1 * 0.35, "center", FB.text.dim);
    const xP = interpolate(frame, [10, 18], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = a * xP; ctx.strokeStyle = FB.red; ctx.lineWidth = 2 * s;
    ctx.beginPath(); ctx.moveTo(W * 0.08, H * 0.3); ctx.lineTo(W * 0.38, H * 0.46); ctx.moveTo(W * 0.38, H * 0.3); ctx.lineTo(W * 0.08, H * 0.46); ctx.stroke();
    const t2 = interpolate(frame, [16, 36], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const sX = W * 0.7, sY = H * 0.38;
    ctx.globalAlpha = a * t2; ctx.strokeStyle = FB.gold; ctx.lineWidth = 2 * s;
    ctx.beginPath(); ctx.arc(sX, sY, 16 * s, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = FB.purple; ctx.lineWidth = s;
    ctx.beginPath(); ctx.arc(sX, sY, 9 * s, 0, Math.PI * 1.5); ctx.stroke();
    ctx.beginPath(); ctx.arc(sX, sY, 5 * s, Math.PI, Math.PI * 2.5); ctx.stroke();
    drawFBText(ctx, "STATE", sX, H * 0.5, 8 * s, a * t2, "center", FB.gold);
    drawFBText(ctx, "OF MIND", W / 2, H * 0.73, 13 * s, a * interpolate(frame, [32, 50], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }), "center", FB.gold);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* V8: Thought cloud with swirling internal activity */
const V8: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => { const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame); const a = fadeInOut(frame, DUR, 4, 8); const s = sc_(W, H);
    const cx = W / 2, cy = H * 0.36; const t1 = interpolate(frame, [4, 22], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const cloud = [{ dx: 0, dy: 0, r: 16 }, { dx: -12, dy: 4, r: 10 }, { dx: 12, dy: 4, r: 10 }, { dx: -7, dy: -9, r: 9 }, { dx: 7, dy: -9, r: 9 }];
    ctx.globalAlpha = a * t1 * 0.12; ctx.fillStyle = FB.purple;
    cloud.forEach((c) => { ctx.beginPath(); ctx.arc(cx + c.dx * s, cy + c.dy * s, c.r * s, 0, Math.PI * 2); ctx.fill(); });
    ctx.globalAlpha = a * t1 * 0.35; ctx.strokeStyle = FB.purple; ctx.lineWidth = s;
    cloud.forEach((c) => { ctx.beginPath(); ctx.arc(cx + c.dx * s, cy + c.dy * s, c.r * s, 0, Math.PI * 2); ctx.stroke(); });
    for (let i = 0; i < 5; i++) { const ang = frame * 0.06 + i * Math.PI * 0.4; const d = (7 + Math.sin(frame * 0.08 + i) * 4) * s;
      ctx.globalAlpha = a * t1 * 0.55; ctx.fillStyle = FB.gold; ctx.beginPath();
      ctx.arc(cx + Math.cos(ang) * d, cy + Math.sin(ang) * d, 1.5 * s, 0, Math.PI * 2); ctx.fill(); }
    drawFBText(ctx, "NOT A REFLEX", cx, H * 0.68, 8 * s, a * interpolate(frame, [18, 42], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }), "center", FB.text.dim);
    drawFBText(ctx, "STATE OF MIND", cx, H * 0.82, 12 * s, a * t1, "center", FB.gold);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* V9: Bold final statement with gold underline */
const V9: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => { const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame); const a = fadeInOut(frame, DUR, 4, 10); const s = sc_(W, H); const cx = W / 2;
    drawFBText(ctx, "NOT A REFLEX", cx, H * 0.22, 11 * s, a * interpolate(frame, [4, 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }), "center", FB.text.dim);
    drawFBText(ctx, "AN INTERNAL", cx, H * 0.46, 13 * s, a * interpolate(frame, [16, 38], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }), "center", FB.text.primary);
    const t3 = interpolate(frame, [28, 46], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "STATE OF MIND", cx, H * 0.66, 16 * s, a * t3, "center", FB.gold);
    if (t3 > 0.5) { ctx.globalAlpha = a * (t3 - 0.5) * 2; ctx.fillStyle = FB.gold; ctx.fillRect(cx - 42 * s, H * 0.72, 84 * s, 2 * s); }
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

export const VARIANTS_FB_081: VariantDef[] = [
  { id: "fb-081-v1", label: "Deep multi-layer brain glow with sparks", component: V1 },
  { id: "fb-081-v2", label: "REFLEX struck through, STATE OF MIND", component: V2 },
  { id: "fb-081-v3", label: "Arrow reflex vs rich internal loop", component: V3 },
  { id: "fb-081-v4", label: "Pulsing brain sphere INTERNAL label", component: V4 },
  { id: "fb-081-v5", label: "Concentric rings representing depth", component: V5 },
  { id: "fb-081-v6", label: "Network with self-sustaining glow", component: V6 },
  { id: "fb-081-v7", label: "Arrow crossed out vs circle state", component: V7 },
  { id: "fb-081-v8", label: "Thought cloud swirling activity", component: V8 },
  { id: "fb-081-v9", label: "Bold STATE OF MIND with underline", component: V9 },
];
