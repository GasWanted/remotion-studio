import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantDef, VariantProps } from "../types";
import { FB, seeded, drawFBBg, drawFBNode, drawFBEdge, drawFBText, drawFBCounter, fadeInOut, cellHSL, drawFBColorEdge, drawPersonBlob } from "./flatbold-kit";

/* Shot 041 — "You can put the fly under a microscope and watch exactly which
   neurons light up when it smells sugar or sees a shadow."
   240 frames (8s). Brain map: sugar→gold neurons, shadow→blue neurons. */

const DUR = 240;

function stagger(frame: number, idx: number, delay: number, dur: number) {
  const s = idx * delay; if (frame < s) return 0; if (frame > s + dur) return 1; return (frame - s) / dur;
}

/* ── V1: Brain oval — sugar stimulus lights gold cluster, shadow lights blue cluster ── */
const V1: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, DUR);
    const cx = W / 2, cy = H * 0.45;
    // Brain outline
    ctx.globalAlpha = a * 0.2; ctx.strokeStyle = FB.text.dim; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.ellipse(cx, cy, W * 0.32, H * 0.28, 0, 0, Math.PI * 2); ctx.stroke();
    // All neurons (dim)
    const rng = seeded(4101);
    const neurons: { x: number; y: number; group: string }[] = [];
    for (let i = 0; i < 16; i++) {
      const ang = rng() * Math.PI * 2;
      const dist = rng() * W * 0.25;
      const x = cx + Math.cos(ang) * dist;
      const y = cy + Math.sin(ang) * dist * 0.75;
      const group = i < 6 ? "sugar" : i < 12 ? "shadow" : "other";
      neurons.push({ x, y, group });
      drawFBNode(ctx, x, y, 4, 6, a * 0.3, frame);
    }
    // Phase 1: Sugar (40-120)
    const sugarP = interpolate(frame, [40, 80], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const sugarFade = interpolate(frame, [100, 130], [1, 0.3], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "SUGAR", W * 0.08, H * 0.15, 9, a * sugarP * sugarFade, "center", FB.gold);
    // Arrow from sugar label to brain
    if (sugarP > 0) {
      ctx.globalAlpha = a * sugarP * sugarFade * 0.4; ctx.strokeStyle = FB.gold; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(W * 0.15, H * 0.2); ctx.lineTo(W * 0.3, cy - H * 0.1); ctx.stroke();
    }
    neurons.forEach((n) => {
      if (n.group === "sugar" && sugarP > 0) {
        ctx.globalAlpha = a * sugarP * sugarFade * 0.35;
        const g = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, 10);
        g.addColorStop(0, FB.gold); g.addColorStop(1, "rgba(232,193,112,0)");
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(n.x, n.y, 10, 0, Math.PI * 2); ctx.fill();
        drawFBNode(ctx, n.x, n.y, 5, 2, a * sugarP * sugarFade, frame);
      }
    });
    // Phase 2: Shadow (120-200)
    const shadowP = interpolate(frame, [120, 160], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const shadowFade = interpolate(frame, [180, 210], [1, 0.3], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "SHADOW", W * 0.92, H * 0.15, 9, a * shadowP * shadowFade, "center", FB.blue);
    if (shadowP > 0) {
      ctx.globalAlpha = a * shadowP * shadowFade * 0.4; ctx.strokeStyle = FB.blue; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(W * 0.85, H * 0.2); ctx.lineTo(W * 0.7, cy - H * 0.1); ctx.stroke();
    }
    neurons.forEach((n) => {
      if (n.group === "shadow" && shadowP > 0) {
        ctx.globalAlpha = a * shadowP * shadowFade * 0.35;
        const g = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, 10);
        g.addColorStop(0, FB.blue); g.addColorStop(1, "rgba(96,160,232,0)");
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(n.x, n.y, 10, 0, Math.PI * 2); ctx.fill();
        drawFBNode(ctx, n.x, n.y, 5, 5, a * shadowP * shadowFade, frame);
      }
    });
    drawFBText(ctx, "DIFFERENT STIMULI \u2192 DIFFERENT NEURONS", cx, H * 0.9, 8, a, "center", FB.text.primary);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* ── V2: Split screen — left gold for sugar, right blue for shadow ── */
const V2: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, DUR);
    ctx.globalAlpha = a * 0.2; ctx.strokeStyle = FB.text.dim; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(W / 2, 0); ctx.lineTo(W / 2, H); ctx.stroke();
    // Left: sugar
    const sugarP = interpolate(frame, [20, 70], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "SMELLS SUGAR", W * 0.25, H * 0.08, 8, a * sugarP, "center", FB.gold);
    const rng1 = seeded(4102);
    for (let i = 0; i < 7; i++) {
      const nx = W * 0.08 + rng1() * W * 0.32;
      const ny = H * 0.2 + rng1() * H * 0.5;
      const flash = 0.3 + 0.7 * Math.abs(Math.sin(frame * 0.08 + rng1() * 6.28));
      if (sugarP > 0) {
        ctx.globalAlpha = a * sugarP * flash * 0.3;
        const g = ctx.createRadialGradient(nx, ny, 0, nx, ny, 8);
        g.addColorStop(0, FB.gold); g.addColorStop(1, "rgba(232,193,112,0)");
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(nx, ny, 8, 0, Math.PI * 2); ctx.fill();
      }
      drawFBNode(ctx, nx, ny, 4, 2, a * sugarP * flash, frame);
    }
    // Right: shadow
    const shadowP = interpolate(frame, [80, 130], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "SEES SHADOW", W * 0.75, H * 0.08, 8, a * shadowP, "center", FB.blue);
    const rng2 = seeded(4103);
    for (let i = 0; i < 7; i++) {
      const nx = W * 0.55 + rng2() * W * 0.32;
      const ny = H * 0.2 + rng2() * H * 0.5;
      const flash = 0.3 + 0.7 * Math.abs(Math.sin(frame * 0.08 + rng2() * 6.28));
      if (shadowP > 0) {
        ctx.globalAlpha = a * shadowP * flash * 0.3;
        const g = ctx.createRadialGradient(nx, ny, 0, nx, ny, 8);
        g.addColorStop(0, FB.blue); g.addColorStop(1, "rgba(96,160,232,0)");
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(nx, ny, 8, 0, Math.PI * 2); ctx.fill();
      }
      drawFBNode(ctx, nx, ny, 4, 5, a * shadowP * flash, frame);
    }
    drawFBText(ctx, "WATCH EXACTLY WHICH NEURONS", W / 2, H * 0.88, 8, a, "center", FB.green);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* ── V3: Microscope view with labeled regions ── */
const V3: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, DUR);
    const cx = W / 2, cy = H * 0.45;
    // Microscope circle view
    const viewR = Math.min(W, H) * 0.3;
    ctx.globalAlpha = a * 0.15; ctx.strokeStyle = FB.text.dim; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(cx, cy, viewR, 0, Math.PI * 2); ctx.stroke();
    // Sugar-responsive zone (upper-left quadrant)
    const sugarP = interpolate(frame, [30, 80], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const rng = seeded(4104);
    for (let i = 0; i < 5; i++) {
      const nx = cx - viewR * 0.3 + rng() * viewR * 0.3;
      const ny = cy - viewR * 0.3 + rng() * viewR * 0.3;
      const flash = Math.abs(Math.sin(frame * 0.08 + i));
      if (sugarP > 0) {
        ctx.globalAlpha = a * sugarP * flash * 0.3;
        const g = ctx.createRadialGradient(nx, ny, 0, nx, ny, 8);
        g.addColorStop(0, FB.gold); g.addColorStop(1, "rgba(232,193,112,0)");
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(nx, ny, 8, 0, Math.PI * 2); ctx.fill();
      }
      drawFBNode(ctx, nx, ny, 3, 2, a * sugarP * flash, frame);
    }
    // Shadow-responsive zone (lower-right quadrant)
    const shadowP = interpolate(frame, [110, 160], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    for (let i = 0; i < 5; i++) {
      const nx = cx + rng() * viewR * 0.4;
      const ny = cy + rng() * viewR * 0.3;
      const flash = Math.abs(Math.sin(frame * 0.08 + i + 3));
      if (shadowP > 0) {
        ctx.globalAlpha = a * shadowP * flash * 0.3;
        const g = ctx.createRadialGradient(nx, ny, 0, nx, ny, 8);
        g.addColorStop(0, FB.blue); g.addColorStop(1, "rgba(96,160,232,0)");
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(nx, ny, 8, 0, Math.PI * 2); ctx.fill();
      }
      drawFBNode(ctx, nx, ny, 3, 5, a * shadowP * flash, frame);
    }
    // Labels with leader lines
    drawFBText(ctx, "SUGAR ZONE", W * 0.1, H * 0.1, 7, a * sugarP, "center", FB.gold);
    drawFBText(ctx, "SHADOW ZONE", W * 0.9, H * 0.82, 7, a * shadowP, "center", FB.blue);
    drawFBText(ctx, "UNDER THE MICROSCOPE", cx, H * 0.92, 9, a, "center", FB.green);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* ── V4: Timeline — sugar event at t1, shadow event at t2, different neuron patterns ── */
const V4: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, DUR);
    const cx = W / 2;
    // Timeline bar
    const timeP = interpolate(frame, [10, 200], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = a * 0.3; ctx.strokeStyle = FB.text.dim; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(W * 0.05, H * 0.5); ctx.lineTo(W * 0.95, H * 0.5); ctx.stroke();
    ctx.globalAlpha = a * 0.6; ctx.strokeStyle = FB.green; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(W * 0.05, H * 0.5); ctx.lineTo(W * 0.05 + timeP * W * 0.9, H * 0.5); ctx.stroke();
    // Sugar event at 30%
    const sugarX = W * 0.3;
    const sugarT = interpolate(frame, [50, 80], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (sugarT > 0) {
      ctx.globalAlpha = a * sugarT * 0.2; ctx.fillStyle = FB.gold;
      ctx.fillRect(sugarX - 5, H * 0.2, 10, H * 0.3);
      drawFBText(ctx, "SUGAR", sugarX, H * 0.15, 8, a * sugarT, "center", FB.gold);
      // Gold neurons above
      for (let i = 0; i < 4; i++) {
        drawFBNode(ctx, sugarX - 15 + i * 10, H * 0.28 + (i % 2) * 8, 4, 2, a * sugarT, frame);
      }
    }
    // Shadow event at 65%
    const shadowX = W * 0.65;
    const shadowT = interpolate(frame, [130, 160], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (shadowT > 0) {
      ctx.globalAlpha = a * shadowT * 0.2; ctx.fillStyle = FB.blue;
      ctx.fillRect(shadowX - 5, H * 0.2, 10, H * 0.3);
      drawFBText(ctx, "SHADOW", shadowX, H * 0.15, 8, a * shadowT, "center", FB.blue);
      for (let i = 0; i < 4; i++) {
        drawFBNode(ctx, shadowX - 15 + i * 10, H * 0.28 + (i % 2) * 8, 4, 5, a * shadowT, frame);
      }
    }
    drawFBText(ctx, "DIFFERENT PATTERNS FOR EACH STIMULUS", cx, H * 0.62, 7, a, "center", FB.text.primary);
    drawFBText(ctx, "VISIBLE IN REAL-TIME", cx, H * 0.88, 9, a, "center", FB.green);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* ── V5: Two brain silhouettes side by side — one with gold map, one blue map ── */
const V5: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, DUR);
    const brain = (bx: number, by: number, color: string, label: string, startF: number) => {
      const p = interpolate(frame, [startF, startF + 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      ctx.globalAlpha = a * p * 0.2; ctx.strokeStyle = color; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.ellipse(bx, by, W * 0.18, H * 0.2, 0, 0, Math.PI * 2); ctx.stroke();
      drawFBText(ctx, label, bx, by - H * 0.25, 8, a * p, "center", color);
      const rng = seeded(startF);
      for (let i = 0; i < 8; i++) {
        const ang = rng() * Math.PI * 2, dist = rng() * W * 0.14;
        const nx = bx + Math.cos(ang) * dist, ny = by + Math.sin(ang) * dist * 0.8;
        const flash = 0.3 + 0.7 * Math.abs(Math.sin(frame * 0.08 + i));
        ctx.globalAlpha = a * p * flash * 0.3;
        const g = ctx.createRadialGradient(nx, ny, 0, nx, ny, 8);
        g.addColorStop(0, color); g.addColorStop(1, color.replace(")", ",0)").replace("rgb", "rgba"));
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(nx, ny, 8, 0, Math.PI * 2); ctx.fill();
        drawFBNode(ctx, nx, ny, 3, color === FB.gold ? 2 : 5, a * p * flash, frame);
      }
    };
    brain(W * 0.28, H * 0.45, FB.gold, "SUGAR", 30);
    brain(W * 0.72, H * 0.45, FB.blue, "SHADOW", 100);
    drawFBText(ctx, "EACH STIMULUS = UNIQUE PATTERN", W / 2, H * 0.88, 8, a, "center", FB.green);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* ── V6: Color-coded neuron map with legend ── */
const V6: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, DUR);
    const cx = W / 2, cy = H * 0.42;
    // Neuron cloud
    const rng = seeded(4106);
    const phase1 = interpolate(frame, [20, 60], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const phase2 = interpolate(frame, [90, 130], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    for (let i = 0; i < 20; i++) {
      const nx = cx - W * 0.25 + rng() * W * 0.5;
      const ny = cy - H * 0.2 + rng() * H * 0.4;
      const isSugar = i < 8;
      const isShadow = i >= 8 && i < 16;
      let nodeAlpha = 0.2;
      let ci = 6;
      if (isSugar && phase1 > 0) {
        nodeAlpha = phase1 * (0.4 + 0.6 * Math.abs(Math.sin(frame * 0.08 + i)));
        ci = 2;
      }
      if (isShadow && phase2 > 0) {
        nodeAlpha = phase2 * (0.4 + 0.6 * Math.abs(Math.sin(frame * 0.08 + i)));
        ci = 5;
      }
      drawFBNode(ctx, nx, ny, 4, ci, a * nodeAlpha, frame);
    }
    // Legend
    ctx.globalAlpha = a * phase1 * 0.8; ctx.fillStyle = FB.gold;
    ctx.fillRect(W * 0.05, H * 0.82, 8, 8);
    drawFBText(ctx, "SUGAR", W * 0.12, H * 0.83 + 4, 7, a * phase1, "left", FB.gold);
    ctx.globalAlpha = a * phase2 * 0.8; ctx.fillStyle = FB.blue;
    ctx.fillRect(W * 0.05, H * 0.9, 8, 8);
    drawFBText(ctx, "SHADOW", W * 0.12, H * 0.91 + 4, 7, a * phase2, "left", FB.blue);
    drawFBText(ctx, "NEURON MAP", cx, H * 0.08, 10, a, "center", FB.green);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* ── V7: Raster plot — dots for each neuron over time, gold vs blue ── */
const V7: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, DUR);
    const rows = 10, leftX = W * 0.1, rightX = W * 0.9;
    const topY = H * 0.15, botY = H * 0.75;
    const rowH = (botY - topY) / rows;
    // Time cursor
    const timeP = interpolate(frame, [10, 210], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const cursorX = leftX + timeP * (rightX - leftX);
    ctx.globalAlpha = a * 0.2; ctx.strokeStyle = FB.text.dim; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(cursorX, topY); ctx.lineTo(cursorX, botY); ctx.stroke();
    // Neuron labels
    const rng = seeded(4107);
    for (let r = 0; r < rows; r++) {
      const y = topY + r * rowH + rowH / 2;
      const isSugar = r < 4;
      const isShadow = r >= 4 && r < 8;
      drawFBText(ctx, `N${r + 1}`, leftX - 12, y, 6, a * 0.5, "center", isSugar ? FB.gold : isShadow ? FB.blue : FB.text.dim);
      // Spike dots
      for (let s = 0; s < 8; s++) {
        const sX = leftX + rng() * (rightX - leftX);
        if (sX > cursorX) continue;
        const inSugarZone = sX < leftX + (rightX - leftX) * 0.45;
        const inShadowZone = sX > leftX + (rightX - leftX) * 0.55;
        let show = false;
        if (isSugar && inSugarZone) show = true;
        if (isShadow && inShadowZone) show = true;
        if (!isSugar && !isShadow) show = rng() > 0.6;
        if (show) {
          ctx.globalAlpha = a * 0.6;
          ctx.fillStyle = isSugar ? FB.gold : isShadow ? FB.blue : FB.text.dim;
          ctx.fillRect(sX - 1, y - 2, 2, 4);
        }
      }
    }
    // Event labels
    drawFBText(ctx, "SUGAR", leftX + (rightX - leftX) * 0.2, topY - 8, 7, a, "center", FB.gold);
    drawFBText(ctx, "SHADOW", leftX + (rightX - leftX) * 0.75, topY - 8, 7, a, "center", FB.blue);
    drawFBText(ctx, "NEURON ACTIVITY OVER TIME", W / 2, H * 0.88, 8, a, "center", FB.green);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* ── V8: Overlay approach — same brain, alternating gold/blue activation ── */
const V8: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, DUR);
    const cx = W / 2, cy = H * 0.42;
    ctx.globalAlpha = a * 0.15; ctx.strokeStyle = FB.text.dim; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.ellipse(cx, cy, W * 0.28, H * 0.25, 0, 0, Math.PI * 2); ctx.stroke();
    // Alternate between sugar (gold) and shadow (blue) every 60 frames
    const cycle = Math.floor(frame / 60) % 2;
    const cycleP = interpolate(frame % 60, [5, 25], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const color = cycle === 0 ? FB.gold : FB.blue;
    const label = cycle === 0 ? "SUGAR" : "SHADOW";
    const ci = cycle === 0 ? 2 : 5;
    drawFBText(ctx, label, cx, H * 0.08, 10, a * cycleP, "center", color);
    const rng = seeded(4108 + cycle * 100);
    for (let i = 0; i < 10; i++) {
      const ang = rng() * Math.PI * 2, dist = rng() * W * 0.22;
      const nx = cx + Math.cos(ang) * dist;
      const ny = cy + Math.sin(ang) * dist * 0.75;
      const flash = 0.3 + 0.7 * Math.abs(Math.sin(frame * 0.1 + i));
      ctx.globalAlpha = a * cycleP * flash * 0.3;
      const g = ctx.createRadialGradient(nx, ny, 0, nx, ny, 10);
      g.addColorStop(0, color); g.addColorStop(1, `${color}00`);
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(nx, ny, 10, 0, Math.PI * 2); ctx.fill();
      drawFBNode(ctx, nx, ny, 4, ci, a * cycleP * flash, frame);
    }
    drawFBText(ctx, "SAME BRAIN, DIFFERENT PATTERNS", cx, H * 0.88, 8, a, "center", FB.green);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* ── V9: Fly under lens — sugar cube left, shadow right, arrows to lit neurons ── */
const V9: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, DUR);
    const cx = W / 2, cy = H * 0.45;
    // Fly cell at center
    drawFBNode(ctx, cx, cy, 16, 3, a, frame);
    drawFBText(ctx, "FLY", cx, cy + 24, 7, a, "center", FB.text.dim);
    // Microscope circle
    ctx.globalAlpha = a * 0.2; ctx.strokeStyle = FB.green; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(cx, cy, 25, 0, Math.PI * 2); ctx.stroke();
    // Sugar on left
    const sugarP = interpolate(frame, [30, 70], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = a * sugarP; ctx.fillStyle = FB.gold;
    ctx.fillRect(W * 0.05 - 6, cy - 6, 12, 12);
    drawFBText(ctx, "SUGAR", W * 0.05, cy + 14, 6, a * sugarP, "center", FB.gold);
    // Arrow and gold neurons
    if (sugarP > 0.5) {
      ctx.globalAlpha = a * (sugarP - 0.5) * 2 * 0.4; ctx.strokeStyle = FB.gold; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(W * 0.12, cy); ctx.lineTo(W * 0.3, H * 0.3); ctx.stroke();
      for (let i = 0; i < 3; i++) {
        drawFBNode(ctx, W * 0.3 + i * 10, H * 0.22 + (i % 2) * 8, 4, 2, a * (sugarP - 0.5) * 2, frame);
      }
      drawFBText(ctx, "THESE LIGHT UP", W * 0.35, H * 0.15, 6, a * (sugarP - 0.5) * 2, "center", FB.gold);
    }
    // Shadow on right
    const shadowP = interpolate(frame, [110, 150], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = a * shadowP * 0.5; ctx.fillStyle = FB.blue;
    ctx.beginPath(); ctx.ellipse(W * 0.92, cy, 10, 8, 0, 0, Math.PI * 2); ctx.fill();
    drawFBText(ctx, "SHADOW", W * 0.92, cy + 14, 6, a * shadowP, "center", FB.blue);
    if (shadowP > 0.5) {
      ctx.globalAlpha = a * (shadowP - 0.5) * 2 * 0.4; ctx.strokeStyle = FB.blue; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(W * 0.85, cy); ctx.lineTo(W * 0.7, H * 0.3); ctx.stroke();
      for (let i = 0; i < 3; i++) {
        drawFBNode(ctx, W * 0.65 + i * 10, H * 0.22 + (i % 2) * 8, 4, 5, a * (shadowP - 0.5) * 2, frame);
      }
      drawFBText(ctx, "THOSE LIGHT UP", W * 0.68, H * 0.15, 6, a * (shadowP - 0.5) * 2, "center", FB.blue);
    }
    drawFBText(ctx, "WATCH WHICH NEURONS RESPOND", cx, H * 0.88, 8, a, "center", FB.green);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

export const VARIANTS_FB_041: VariantDef[] = [
  { id: "fb-041-v1", label: "Brain oval: sugar gold, shadow blue clusters", component: V1 },
  { id: "fb-041-v2", label: "Split screen: gold left, blue right", component: V2 },
  { id: "fb-041-v3", label: "Microscope view with labeled zones", component: V3 },
  { id: "fb-041-v4", label: "Timeline with sugar and shadow events", component: V4 },
  { id: "fb-041-v5", label: "Two brain silhouettes, different patterns", component: V5 },
  { id: "fb-041-v6", label: "Color-coded neuron map with legend", component: V6 },
  { id: "fb-041-v7", label: "Raster plot: gold vs blue spike dots", component: V7 },
  { id: "fb-041-v8", label: "Alternating gold/blue activation overlay", component: V8 },
  { id: "fb-041-v9", label: "Fly under lens with sugar and shadow stimuli", component: V9 },
];
