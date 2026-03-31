import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantDef, VariantProps } from "../types";
import { FB, seeded, drawFBBg, drawFBNode, drawFBEdge, drawFBText, drawFBCounter, fadeInOut, cellHSL, drawFBColorEdge, drawPersonBlob } from "./flatbold-kit";

/* Shot 040 — "A protein called GCaMP flashes when a neuron fires."
   90 frames (3s). Single neuron flash cycle. */

const DUR = 90;

/* ── V1: Neuron at rest → fires → green flash ring expands ── */
const V1: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, DUR);
    const cx = W / 2, cy = H * 0.42;
    drawFBNode(ctx, cx, cy, 14, 3, a, frame);
    // Label
    drawFBText(ctx, "GCaMP", cx, cy - 22, 9, a, "center", FB.green);
    // Spike at frame 25
    const spikeP = interpolate(frame, [25, 35], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const flashP = interpolate(frame, [30, 45], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const fadeP = interpolate(frame, [45, 70], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (spikeP > 0) {
      // Green flash expanding ring
      const ringR = flashP * 35;
      ctx.globalAlpha = a * fadeP * 0.5; ctx.strokeStyle = FB.green; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(cx, cy, Math.max(1, ringR), 0, Math.PI * 2); ctx.stroke();
      // Central bright flash
      ctx.globalAlpha = a * fadeP * 0.4;
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, 20);
      g.addColorStop(0, FB.green); g.addColorStop(1, "rgba(110,221,138,0)");
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, 20, 0, Math.PI * 2); ctx.fill();
    }
    drawFBText(ctx, "FIRES \u2192 FLASH", cx, H * 0.72, 10, a * spikeP, "center", FB.green);
    drawFBText(ctx, "GCaMP PROTEIN", cx, H * 0.88, 9, a, "center", FB.gold);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* ── V2: Before/after — dark neuron vs green-lit neuron ── */
const V2: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, DUR);
    const cy = H * 0.42;
    // Silent
    drawFBText(ctx, "SILENT", W * 0.25, H * 0.12, 9, a, "center", FB.text.dim);
    drawFBNode(ctx, W * 0.25, cy, 14, 6, a * 0.5, frame);
    drawFBText(ctx, "dark", W * 0.25, cy + 22, 7, a * 0.5, "center", FB.text.dim);
    // Arrow
    const arrowP = interpolate(frame, [20, 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = a * arrowP * 0.5; ctx.strokeStyle = FB.green; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(W * 0.38, cy); ctx.lineTo(W * 0.52, cy); ctx.stroke();
    drawFBText(ctx, "FIRE!", W * 0.45, cy - 12, 8, a * arrowP, "center", FB.red);
    // Firing — green glow
    const fireP = interpolate(frame, [35, 55], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBNode(ctx, W * 0.75, cy, 14, 3, a * fireP, frame);
    if (fireP > 0) {
      ctx.globalAlpha = a * fireP * 0.35;
      const g = ctx.createRadialGradient(W * 0.75, cy, 0, W * 0.75, cy, 25);
      g.addColorStop(0, FB.green); g.addColorStop(1, "rgba(110,221,138,0)");
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(W * 0.75, cy, 25, 0, Math.PI * 2); ctx.fill();
    }
    drawFBText(ctx, "FIRING", W * 0.75, H * 0.12, 9, a * fireP, "center", FB.green);
    drawFBText(ctx, "GCaMP glows", W * 0.75, cy + 22, 7, a * fireP, "center", FB.green);
    drawFBText(ctx, "GCaMP PROTEIN", W / 2, H * 0.88, 9, a, "center", FB.gold);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* ── V3: Voltage spike graph with green flash synced at peak ── */
const V3: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, DUR);
    const cx = W / 2, baseY = H * 0.55;
    const spikeX = W * 0.45;
    // Voltage trace
    ctx.globalAlpha = a * 0.7; ctx.strokeStyle = FB.teal; ctx.lineWidth = 2;
    ctx.beginPath();
    const drawP = interpolate(frame, [5, DUR - 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    for (let x = W * 0.05; x < W * 0.95; x += 2) {
      const xP = (x - W * 0.05) / (W * 0.9);
      if (xP > drawP) break;
      let y = baseY;
      const dist = Math.abs(x - spikeX);
      if (dist < 15) y = baseY - (1 - dist / 15) * H * 0.3;
      if (x <= W * 0.07) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();
    // Green flash synced at spike peak
    const peakP = interpolate(frame, [30, 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const peakFade = interpolate(frame, [40, 60], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (peakP > 0) {
      // Neuron above spike
      drawFBNode(ctx, spikeX, H * 0.15, 10, 3, a * peakP * peakFade, frame);
      ctx.globalAlpha = a * peakP * peakFade * 0.35;
      const g = ctx.createRadialGradient(spikeX, H * 0.15, 0, spikeX, H * 0.15, 20);
      g.addColorStop(0, FB.green); g.addColorStop(1, "rgba(110,221,138,0)");
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(spikeX, H * 0.15, 20, 0, Math.PI * 2); ctx.fill();
      drawFBText(ctx, "FLASH!", spikeX + 25, H * 0.15, 9, a * peakP * peakFade, "left", FB.green);
    }
    drawFBText(ctx, "GCaMP LIGHTS UP AT SPIKE", cx, H * 0.88, 8, a, "center", FB.gold);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* ── V4: Molecular zoom — Ca2+ ions flow in, protein changes color ── */
const V4: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, DUR);
    const cx = W / 2, cy = H * 0.42;
    // GCaMP protein blob (starts dark, turns green)
    const transP = interpolate(frame, [30, 55], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const [h, s, l] = transP > 0 ? [140, 50 + transP * 20, 25 + transP * 35] : [260, 20, 30];
    ctx.globalAlpha = a * 0.6;
    const bodyG = ctx.createRadialGradient(cx, cy, 0, cx, cy, 18);
    bodyG.addColorStop(0, `hsl(${h}, ${s}%, ${l + 15}%)`);
    bodyG.addColorStop(1, `hsl(${h}, ${s}%, ${l}%)`);
    ctx.fillStyle = bodyG;
    ctx.beginPath(); ctx.ellipse(cx, cy, 18, 15, 0, 0, Math.PI * 2); ctx.fill();
    drawFBText(ctx, "GCaMP", cx, cy + 25, 8, a, "center", FB.text.primary);
    // Ca2+ ions flowing in (10-40)
    const ionP = interpolate(frame, [10, 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const rng = seeded(4004);
    for (let i = 0; i < 6; i++) {
      const startAng = rng() * Math.PI * 2;
      const startDist = 45 + rng() * 20;
      const sx = cx + Math.cos(startAng) * startDist;
      const sy = cy + Math.sin(startAng) * startDist;
      const ix = sx + (cx - sx) * ionP;
      const iy = sy + (cy - sy) * ionP;
      if (ionP < 1) {
        ctx.globalAlpha = a * (1 - ionP) * 0.7; ctx.fillStyle = FB.gold;
        ctx.beginPath(); ctx.arc(ix, iy, 2.5, 0, Math.PI * 2); ctx.fill();
        drawFBText(ctx, "Ca\u00B2\u207A", ix + 5, iy - 5, 5, a * (1 - ionP) * 0.6, "left", FB.gold);
      }
    }
    // Glow after transition
    if (transP > 0.5) {
      ctx.globalAlpha = a * (transP - 0.5) * 2 * 0.3;
      const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, 30);
      glow.addColorStop(0, FB.green); glow.addColorStop(1, "rgba(110,221,138,0)");
      ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(cx, cy, 30, 0, Math.PI * 2); ctx.fill();
    }
    drawFBText(ctx, "Ca\u00B2\u207A BINDS \u2192 GREEN FLASH", cx, H * 0.82, 8, a * transP, "center", FB.green);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* ── V5: Heartbeat-style pulse — neuron dims, fires, bright green, dims again ── */
const V5: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, DUR);
    const cx = W / 2, cy = H * 0.42;
    // Repeating pulse
    const pulseT = (frame % 30) / 30;
    const brightness = pulseT < 0.15 ? pulseT / 0.15 : Math.max(0.1, 1 - (pulseT - 0.15) / 0.85);
    // Green neuron with pulsing brightness
    const r = 12 + brightness * 6;
    ctx.globalAlpha = a * brightness * 0.35;
    const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, r * 2);
    glow.addColorStop(0, FB.green); glow.addColorStop(1, "rgba(110,221,138,0)");
    ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(cx, cy, r * 2, 0, Math.PI * 2); ctx.fill();
    drawFBNode(ctx, cx, cy, r, 3, a * (0.3 + brightness * 0.7), frame);
    // Pulse ring
    if (brightness > 0.5) {
      const ringR = (brightness - 0.5) * 2 * 25;
      ctx.globalAlpha = a * (1 - (brightness - 0.5) * 2) * 0.3; ctx.strokeStyle = FB.green; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(cx, cy, r + ringR, 0, Math.PI * 2); ctx.stroke();
    }
    drawFBText(ctx, "GCaMP", cx, H * 0.2, 10, a, "center", FB.green);
    drawFBText(ctx, "FLASHES WHEN IT FIRES", cx, H * 0.82, 9, a, "center", FB.gold);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* ── V6: Light bulb metaphor — neuron is bulb, firing turns it on ── */
const V6: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, DUR);
    const cx = W / 2, bulbY = H * 0.35;
    // Bulb shape (circle + base)
    const onP = interpolate(frame, [25, 35], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const bulbColor = onP > 0 ? FB.green : "rgba(80,60,100,0.5)";
    ctx.globalAlpha = a * (0.3 + onP * 0.7); ctx.fillStyle = bulbColor;
    ctx.beginPath(); ctx.arc(cx, bulbY, 16, 0, Math.PI * 2); ctx.fill();
    // Base
    ctx.fillStyle = "rgba(100,80,120,0.6)";
    ctx.fillRect(cx - 6, bulbY + 14, 12, 10);
    // Glow when on
    if (onP > 0) {
      ctx.globalAlpha = a * onP * 0.3;
      const glow = ctx.createRadialGradient(cx, bulbY, 0, cx, bulbY, 35);
      glow.addColorStop(0, FB.green); glow.addColorStop(1, "rgba(110,221,138,0)");
      ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(cx, bulbY, 35, 0, Math.PI * 2); ctx.fill();
      // Light rays
      for (let r = 0; r < 6; r++) {
        const ang = (r / 6) * Math.PI * 2;
        ctx.globalAlpha = a * onP * 0.4; ctx.strokeStyle = FB.green; ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(ang) * 20, bulbY + Math.sin(ang) * 20);
        ctx.lineTo(cx + Math.cos(ang) * 30, bulbY + Math.sin(ang) * 30);
        ctx.stroke();
      }
    }
    drawFBText(ctx, "OFF", cx - 35, bulbY, 8, a * (1 - onP), "center", FB.text.dim);
    drawFBText(ctx, "ON", cx + 35, bulbY, 8, a * onP, "center", FB.green);
    drawFBText(ctx, "GCaMP = BUILT-IN LIGHT", cx, H * 0.72, 9, a, "center", FB.gold);
    drawFBText(ctx, "fires \u2192 flashes green", cx, H * 0.82, 8, a, "center", FB.green);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* ── V7: Three neurons side by side — fire in sequence, each flashes green ── */
const V7: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, DUR);
    const cy = H * 0.42;
    const xs = [W * 0.2, W * 0.5, W * 0.8];
    xs.forEach((x, i) => {
      const fireFrame = 15 + i * 18;
      const flashP = interpolate(frame, [fireFrame, fireFrame + 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const fadeP = interpolate(frame, [fireFrame + 8, fireFrame + 25], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const brightness = flashP * fadeP;
      // Glow
      if (brightness > 0) {
        ctx.globalAlpha = a * brightness * 0.35;
        const g = ctx.createRadialGradient(x, cy, 0, x, cy, 22);
        g.addColorStop(0, FB.green); g.addColorStop(1, "rgba(110,221,138,0)");
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, cy, 22, 0, Math.PI * 2); ctx.fill();
      }
      drawFBNode(ctx, x, cy, 10, 3, a * (0.3 + brightness * 0.7), frame);
      drawFBText(ctx, `N${i + 1}`, x, cy + 18, 7, a, "center", FB.text.dim);
      if (brightness > 0.3) drawFBText(ctx, "FLASH", x, cy - 18, 7, a * brightness, "center", FB.green);
    });
    drawFBText(ctx, "GCaMP", W / 2, H * 0.12, 10, a, "center", FB.green);
    drawFBText(ctx, "each fires \u2192 each flashes", W / 2, H * 0.82, 8, a, "center", FB.gold);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* ── V8: Protein structure morphing from dim to bright ── */
const V8: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, DUR);
    const cx = W / 2, cy = H * 0.42;
    const morphP = interpolate(frame, [20, 50], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    // Protein as blob cluster
    const rng = seeded(4008);
    for (let i = 0; i < 5; i++) {
      const ang = (i / 5) * Math.PI * 2;
      const dist = 10;
      const bx = cx + Math.cos(ang) * dist;
      const by = cy + Math.sin(ang) * dist;
      const ci = morphP > 0.5 ? 3 : 6;
      const blobAlpha = 0.3 + morphP * 0.7;
      drawFBNode(ctx, bx, by, 7, ci, a * blobAlpha, frame);
    }
    // Center bright when active
    if (morphP > 0.3) {
      ctx.globalAlpha = a * (morphP - 0.3) * 1.4 * 0.4;
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, 25);
      g.addColorStop(0, FB.green); g.addColorStop(1, "rgba(110,221,138,0)");
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, 25, 0, Math.PI * 2); ctx.fill();
    }
    drawFBText(ctx, "GCaMP PROTEIN", cx, H * 0.15, 9, a, "center", FB.text.primary);
    const label = morphP > 0.5 ? "FLUORESCENT!" : "dormant";
    const lColor = morphP > 0.5 ? FB.green : FB.text.dim;
    drawFBText(ctx, label, cx, H * 0.75, 10, a, "center", lColor);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* ── V9: Equation: SPIKE + GCaMP = GREEN LIGHT ── */
const V9: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, DUR);
    const cy = H * 0.42;
    const p1 = interpolate(frame, [5, 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const p2 = interpolate(frame, [20, 35], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const p3 = interpolate(frame, [40, 60], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    // Spike icon
    drawFBNode(ctx, W * 0.15, cy, 10, 0, a * p1, frame);
    drawFBText(ctx, "SPIKE", W * 0.15, cy + 18, 8, a * p1, "center", FB.red);
    // Plus
    drawFBText(ctx, "+", W * 0.3, cy, 14, a * p1, "center", FB.text.dim);
    // GCaMP
    drawFBNode(ctx, W * 0.45, cy, 10, 6, a * p2, frame);
    drawFBText(ctx, "GCaMP", W * 0.45, cy + 18, 8, a * p2, "center", FB.text.primary);
    // Equals
    drawFBText(ctx, "=", W * 0.6, cy, 14, a * p2, "center", FB.text.dim);
    // Green flash result
    drawFBNode(ctx, W * 0.78, cy, 12, 3, a * p3, frame);
    if (p3 > 0) {
      ctx.globalAlpha = a * p3 * 0.35;
      const g = ctx.createRadialGradient(W * 0.78, cy, 0, W * 0.78, cy, 22);
      g.addColorStop(0, FB.green); g.addColorStop(1, "rgba(110,221,138,0)");
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(W * 0.78, cy, 22, 0, Math.PI * 2); ctx.fill();
    }
    drawFBText(ctx, "GREEN!", W * 0.78, cy + 18, 9, a * p3, "center", FB.green);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

export const VARIANTS_FB_040: VariantDef[] = [
  { id: "fb-040-v1", label: "Neuron fires with expanding green flash ring", component: V1 },
  { id: "fb-040-v2", label: "Before/after dark vs green-lit neuron", component: V2 },
  { id: "fb-040-v3", label: "Voltage spike with synced green flash", component: V3 },
  { id: "fb-040-v4", label: "Ca2+ ions flow in, protein turns green", component: V4 },
  { id: "fb-040-v5", label: "Heartbeat pulse of green brightness", component: V5 },
  { id: "fb-040-v6", label: "Light bulb metaphor: fire turns it on", component: V6 },
  { id: "fb-040-v7", label: "Three neurons flash green in sequence", component: V7 },
  { id: "fb-040-v8", label: "Protein cluster morphs dim to bright", component: V8 },
  { id: "fb-040-v9", label: "Equation: spike + GCaMP = green light", component: V9 },
];
