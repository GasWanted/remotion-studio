import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantDef, VariantProps } from "../types";
import { FB, seeded, drawFBBg, drawFBNode, drawFBEdge, drawFBText, drawFBCounter, fadeInOut, cellHSL, drawFBColorEdge, drawPersonBlob } from "./flatbold-kit";

/* Shot 039 — "To watch it happen in real-time, they use calcium imaging."
   90 frames (3s). Brain flashing under microscope. */

const DUR = 90;

function stagger(frame: number, idx: number, delay: number, dur: number) {
  const s = idx * delay; if (frame < s) return 0; if (frame > s + dur) return 1; return (frame - s) / dur;
}

/* ── V1: Microscope lens above brain — neurons flash green underneath ── */
const V1: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, DUR);
    const cx = W / 2;
    // Microscope lens (circle at top)
    const lensR = W * 0.12;
    ctx.globalAlpha = a * 0.5; ctx.strokeStyle = FB.text.dim; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(cx, H * 0.15, lensR, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = "rgba(100,200,130,0.08)";
    ctx.beginPath(); ctx.arc(cx, H * 0.15, lensR - 2, 0, Math.PI * 2); ctx.fill();
    drawFBText(ctx, "MICROSCOPE", cx, H * 0.05, 7, a * 0.6, "center", FB.text.dim);
    // Light cone down
    ctx.globalAlpha = a * 0.1; ctx.fillStyle = FB.green;
    ctx.beginPath();
    ctx.moveTo(cx - lensR, H * 0.22); ctx.lineTo(cx - W * 0.25, H * 0.85);
    ctx.lineTo(cx + W * 0.25, H * 0.85); ctx.lineTo(cx + lensR, H * 0.22);
    ctx.closePath(); ctx.fill();
    // Brain neurons flashing
    const rng = seeded(3901);
    for (let i = 0; i < 12; i++) {
      const nx = cx - W * 0.2 + rng() * W * 0.4;
      const ny = H * 0.4 + rng() * H * 0.35;
      const flash = 0.3 + 0.7 * Math.abs(Math.sin(frame * 0.08 + rng() * 6.28));
      // Green calcium flash
      ctx.globalAlpha = a * flash * 0.3;
      const g = ctx.createRadialGradient(nx, ny, 0, nx, ny, 10);
      g.addColorStop(0, FB.green); g.addColorStop(1, "rgba(110,221,138,0)");
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(nx, ny, 10, 0, Math.PI * 2); ctx.fill();
      drawFBNode(ctx, nx, ny, 4, 3, a * flash, frame);
    }
    drawFBText(ctx, "CALCIUM IMAGING", cx, H * 0.92, 10, a, "center", FB.green);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* ── V2: Top-down brain view — green blobs lighting up in sequence ── */
const V2: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, DUR);
    const cx = W / 2, cy = H * 0.45;
    // Brain outline
    ctx.globalAlpha = a * 0.2; ctx.strokeStyle = FB.green; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.ellipse(cx, cy, W * 0.3, H * 0.28, 0, 0, Math.PI * 2); ctx.stroke();
    // Regions lighting up in sequence
    const rng = seeded(3902);
    const regions: { x: number; y: number; r: number }[] = [];
    for (let i = 0; i < 8; i++) {
      const ang = rng() * Math.PI * 2;
      const dist = rng() * W * 0.2;
      regions.push({
        x: cx + Math.cos(ang) * dist,
        y: cy + Math.sin(ang) * dist * 0.8,
        r: 8 + rng() * 12,
      });
    }
    regions.forEach((reg, i) => {
      const flashT = ((frame * 1.5 + i * 12) % 60) / 60;
      const bright = flashT < 0.3 ? flashT / 0.3 : Math.max(0, 1 - (flashT - 0.3) / 0.7);
      ctx.globalAlpha = a * bright * 0.4;
      const g = ctx.createRadialGradient(reg.x, reg.y, 0, reg.x, reg.y, reg.r);
      g.addColorStop(0, "rgba(110,221,138,0.7)"); g.addColorStop(1, "rgba(110,221,138,0)");
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(reg.x, reg.y, reg.r, 0, Math.PI * 2); ctx.fill();
      drawFBNode(ctx, reg.x, reg.y, 3, 3, a * (0.3 + bright * 0.7), frame);
    });
    drawFBText(ctx, "REAL-TIME", cx, H * 0.08, 10, a, "center", FB.green);
    drawFBText(ctx, "CALCIUM IMAGING", cx, H * 0.92, 10, a, "center", FB.green);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* ── V3: Camera icon focusing on brain, live feed showing flashes ── */
const V3: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, DUR);
    // Camera/microscope at top left
    const camX = W * 0.15, camY = H * 0.2;
    ctx.globalAlpha = a * 0.6; ctx.strokeStyle = FB.text.dim; ctx.lineWidth = 1.5;
    ctx.strokeRect(camX - 12, camY - 8, 24, 16);
    ctx.beginPath(); ctx.arc(camX, camY, 6, 0, Math.PI * 2); ctx.stroke();
    drawFBText(ctx, "SCOPE", camX, camY + 18, 6, a, "center", FB.text.dim);
    // Arrow to view screen
    ctx.globalAlpha = a * 0.3; ctx.strokeStyle = FB.green; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(camX + 15, camY); ctx.lineTo(W * 0.32, H * 0.3); ctx.stroke();
    // View screen — rounded rect
    const screenX = W * 0.35, screenY = H * 0.15;
    const screenW = W * 0.55, screenH = H * 0.65;
    ctx.globalAlpha = a * 0.15; ctx.fillStyle = FB.green;
    ctx.fillRect(screenX, screenY, screenW, screenH);
    ctx.globalAlpha = a * 0.4; ctx.strokeStyle = FB.green; ctx.lineWidth = 1;
    ctx.strokeRect(screenX, screenY, screenW, screenH);
    // REC dot
    const recBlink = Math.sin(frame * 0.15) > 0;
    if (recBlink) {
      ctx.globalAlpha = a * 0.7; ctx.fillStyle = FB.red;
      ctx.beginPath(); ctx.arc(screenX + 10, screenY + 10, 3, 0, Math.PI * 2); ctx.fill();
    }
    drawFBText(ctx, "LIVE", screenX + 22, screenY + 10, 6, a * 0.5, "left", FB.red);
    // Flashing neurons inside screen
    const rng = seeded(3903);
    for (let i = 0; i < 10; i++) {
      const nx = screenX + 15 + rng() * (screenW - 30);
      const ny = screenY + 15 + rng() * (screenH - 30);
      const flash = 0.2 + 0.8 * Math.abs(Math.sin(frame * 0.1 + rng() * 6.28));
      drawFBNode(ctx, nx, ny, 4, 3, a * flash, frame);
    }
    drawFBText(ctx, "CALCIUM IMAGING", W / 2, H * 0.92, 9, a, "center", FB.green);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* ── V4: Time-lapse strip — 4 frames showing brain activity progression ── */
const V4: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, DUR);
    const panels = 4;
    const panelW = W * 0.2, panelH = H * 0.55;
    const gap = W * 0.03;
    const totalW = panels * panelW + (panels - 1) * gap;
    const startX = W / 2 - totalW / 2;
    const topY = H * 0.2;
    for (let p = 0; p < panels; p++) {
      const px = startX + p * (panelW + gap);
      const t = stagger(frame, p, 12, 15);
      // Panel border
      ctx.globalAlpha = a * t * 0.3; ctx.strokeStyle = FB.green; ctx.lineWidth = 1;
      ctx.strokeRect(px, topY, panelW, panelH);
      // Time label
      drawFBText(ctx, `t=${p + 1}`, px + panelW / 2, topY - 8, 7, a * t, "center", FB.text.dim);
      // Neurons with increasing activity
      const rng = seeded(3904 + p);
      const activeCount = p + 2;
      for (let n = 0; n < 6; n++) {
        const nx = px + 8 + rng() * (panelW - 16);
        const ny = topY + 8 + rng() * (panelH - 16);
        const isActive = n < activeCount;
        const flash = isActive ? 0.5 + 0.5 * Math.abs(Math.sin(frame * 0.1 + rng() * 6.28)) : 0.2;
        if (isActive) {
          ctx.globalAlpha = a * t * flash * 0.3;
          const g = ctx.createRadialGradient(nx, ny, 0, nx, ny, 8);
          g.addColorStop(0, FB.green); g.addColorStop(1, "rgba(110,221,138,0)");
          ctx.fillStyle = g; ctx.beginPath(); ctx.arc(nx, ny, 8, 0, Math.PI * 2); ctx.fill();
        }
        drawFBNode(ctx, nx, ny, 3, isActive ? 3 : 6, a * t * flash, frame);
      }
    }
    drawFBText(ctx, "REAL-TIME CALCIUM IMAGING", W / 2, H * 0.08, 9, a, "center", FB.green);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* ── V5: Waveform trace at bottom with brain flashes synced above ── */
const V5: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, DUR);
    const cx = W / 2;
    // Brain area (top half)
    const rng = seeded(3905);
    const neurons: { x: number; y: number; phase: number }[] = [];
    for (let i = 0; i < 8; i++) {
      neurons.push({
        x: cx - W * 0.25 + rng() * W * 0.5,
        y: H * 0.15 + rng() * H * 0.3,
        phase: rng() * 6.28,
      });
    }
    neurons.forEach((n, i) => {
      const flash = 0.2 + 0.8 * Math.max(0, Math.sin(frame * 0.08 + n.phase));
      ctx.globalAlpha = a * flash * 0.25;
      const g = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, 12);
      g.addColorStop(0, FB.green); g.addColorStop(1, "rgba(110,221,138,0)");
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(n.x, n.y, 12, 0, Math.PI * 2); ctx.fill();
      drawFBNode(ctx, n.x, n.y, 4, 3, a * flash, frame);
    });
    // Calcium trace at bottom
    const traceY = H * 0.65;
    ctx.globalAlpha = a * 0.7; ctx.strokeStyle = FB.green; ctx.lineWidth = 2;
    ctx.beginPath();
    const traceP = interpolate(frame, [10, DUR - 5], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    for (let x = W * 0.05; x < W * 0.95; x += 2) {
      const xP = (x - W * 0.05) / (W * 0.9);
      if (xP > traceP) break;
      const y = traceY + Math.sin(x * 0.06 + frame * 0.05) * H * 0.08
        + Math.max(0, Math.sin(x * 0.02 - 1) * H * 0.12);
      if (x <= W * 0.07) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();
    drawFBText(ctx, "Ca2+ SIGNAL", W * 0.08, H * 0.58, 7, a, "left", FB.green);
    drawFBText(ctx, "CALCIUM IMAGING", cx, H * 0.92, 10, a, "center", FB.green);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* ── V6: Green wavelength spectrum with brain in center responding ── */
const V6: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, DUR);
    const cx = W / 2, cy = H * 0.42;
    // Brain ellipse
    ctx.globalAlpha = a * 0.2; ctx.strokeStyle = FB.green; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.ellipse(cx, cy, W * 0.2, H * 0.18, 0, 0, Math.PI * 2); ctx.stroke();
    // Green fluorescent neurons inside
    const rng = seeded(3906);
    for (let i = 0; i < 10; i++) {
      const ang = rng() * Math.PI * 2;
      const dist = rng() * W * 0.15;
      const nx = cx + Math.cos(ang) * dist;
      const ny = cy + Math.sin(ang) * dist * 0.7;
      const flash = Math.abs(Math.sin(frame * 0.1 + i * 0.8));
      ctx.globalAlpha = a * flash * 0.4;
      ctx.fillStyle = `rgba(110,221,138,${flash * 0.5})`;
      ctx.beginPath(); ctx.arc(nx, ny, 3 + flash * 4, 0, Math.PI * 2); ctx.fill();
    }
    // "WATCHING" label with eye icon
    drawFBText(ctx, "WATCHING IN REAL-TIME", cx, H * 0.1, 9, a, "center", FB.green);
    // Timer
    const seconds = (frame / 30).toFixed(1);
    drawFBCounter(ctx, `${seconds}s`, cx, H * 0.82, 12, FB.green, a);
    drawFBText(ctx, "CALCIUM IMAGING", cx, H * 0.92, 9, a, "center", FB.text.dim);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* ── V7: Zoom in effect — starts wide, zooms into single flashing neuron ── */
const V7: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, DUR);
    const cx = W / 2, cy = H * 0.45;
    const zoomP = interpolate(frame, [10, 60], [1, 3], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.save(); ctx.translate(cx, cy); ctx.scale(zoomP, zoomP); ctx.translate(-cx, -cy);
    // Brain neurons
    const rng = seeded(3907);
    for (let i = 0; i < 15; i++) {
      const nx = cx - 30 + rng() * 60;
      const ny = cy - 25 + rng() * 50;
      const flash = 0.2 + 0.8 * Math.abs(Math.sin(frame * 0.08 + rng() * 6.28));
      ctx.globalAlpha = a * flash * 0.3;
      const g = ctx.createRadialGradient(nx, ny, 0, nx, ny, 6);
      g.addColorStop(0, FB.green); g.addColorStop(1, "rgba(110,221,138,0)");
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(nx, ny, 6, 0, Math.PI * 2); ctx.fill();
      drawFBNode(ctx, nx, ny, 3 / zoomP * 2, 3, a * flash, frame);
    }
    ctx.restore();
    drawFBText(ctx, "CALCIUM IMAGING", cx, H * 0.08, 9, a, "center", FB.green);
    drawFBText(ctx, "REAL-TIME", cx, H * 0.92, 10, a, "center", FB.green);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* ── V8: Split — dark brain left, calcium-lit brain right ── */
const V8: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, DUR);
    // Divider
    ctx.globalAlpha = a * 0.3; ctx.strokeStyle = FB.text.dim; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(W / 2, 0); ctx.lineTo(W / 2, H); ctx.stroke();
    drawFBText(ctx, "DARK", W * 0.25, H * 0.08, 9, a, "center", FB.text.dim);
    drawFBText(ctx, "Ca2+ IMAGING", W * 0.75, H * 0.08, 9, a, "center", FB.green);
    const rng = seeded(3908);
    for (let i = 0; i < 8; i++) {
      const bx = W * 0.08 + rng() * W * 0.3;
      const by = H * 0.2 + rng() * H * 0.55;
      // Dark side — barely visible
      drawFBNode(ctx, bx, by, 4, 6, a * 0.2, frame);
      // Lit side — flashing green
      const flash = 0.3 + 0.7 * Math.abs(Math.sin(frame * 0.1 + rng() * 6.28));
      const lx = bx + W * 0.5;
      ctx.globalAlpha = a * flash * 0.3;
      const g = ctx.createRadialGradient(lx, by, 0, lx, by, 10);
      g.addColorStop(0, FB.green); g.addColorStop(1, "rgba(110,221,138,0)");
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(lx, by, 10, 0, Math.PI * 2); ctx.fill();
      drawFBNode(ctx, lx, by, 4, 3, a * flash, frame);
    }
    drawFBText(ctx, "WATCH NEURONS FIRE", W / 2, H * 0.92, 9, a, "center", FB.gold);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* ── V9: Heatmap grid — cells light green when active ── */
const V9: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, DUR);
    const cols = 8, rows = 6;
    const cellW = W * 0.09, cellH = H * 0.1;
    const left = (W - cols * cellW) / 2, top = H * 0.18;
    const rng = seeded(3909);
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const phase = rng() * 6.28;
        const flash = 0.1 + 0.9 * Math.max(0, Math.sin(frame * 0.06 + phase));
        const cx2 = left + c * cellW, cy2 = top + r * cellH;
        ctx.globalAlpha = a * flash * 0.6;
        ctx.fillStyle = `hsl(140, ${40 + flash * 30}%, ${20 + flash * 35}%)`;
        ctx.fillRect(cx2 + 1, cy2 + 1, cellW - 2, cellH - 2);
      }
    }
    drawFBText(ctx, "CALCIUM ACTIVITY MAP", W / 2, H * 0.08, 9, a, "center", FB.green);
    drawFBText(ctx, "REAL-TIME", W / 2, H * 0.92, 10, a, "center", FB.green);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

export const VARIANTS_FB_039: VariantDef[] = [
  { id: "fb-039-v1", label: "Microscope lens with green brain flashes", component: V1 },
  { id: "fb-039-v2", label: "Top-down brain with regions lighting up", component: V2 },
  { id: "fb-039-v3", label: "Camera live feed of flashing neurons", component: V3 },
  { id: "fb-039-v4", label: "Time-lapse strip of spreading activity", component: V4 },
  { id: "fb-039-v5", label: "Waveform trace synced to brain flashes", component: V5 },
  { id: "fb-039-v6", label: "Green fluorescent neurons with timer", component: V6 },
  { id: "fb-039-v7", label: "Zoom into single flashing neuron", component: V7 },
  { id: "fb-039-v8", label: "Split dark vs calcium-lit brain", component: V8 },
  { id: "fb-039-v9", label: "Heatmap grid of calcium activity", component: V9 },
];
