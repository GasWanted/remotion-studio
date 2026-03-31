import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantDef, VariantProps } from "../types";
import { FB, seeded, drawFBBg, drawFBNode, drawFBEdge, drawFBText, drawFBCounter, fadeInOut, cellHSL, drawFBColorEdge } from "./flatbold-kit";

/* Shot 59 — "Every connection in this brain is stored as a weight. A positive
   weight makes a neuron fire harder; a negative weight tells it to shut up."
   210 frames (7s) */

// ---------- V1: two neurons, weight label pulses +/- ----------
const V1: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 210);
    const s = Math.min(W, H) / 360;
    const cx = W / 2, cy = H * 0.4;
    const showP = interpolate(frame, [5, 25], [0, 1], { extrapolateRight: "clamp" });
    drawFBNode(ctx, cx - 50 * s, cy, 14 * s, 3, a * showP, frame);
    drawFBNode(ctx, cx + 50 * s, cy, 14 * s, 1, a * showP, frame);
    const lineP = interpolate(frame, [25, 45], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBColorEdge(ctx, cx - 36 * s, cy, cx + 36 * s, cy, FB.gold, s, a * lineP);
    const phase = Math.floor(frame / 50) % 2;
    const wP = interpolate(frame, [45, 60], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const wLabel = phase === 0 ? "+347" : "-182";
    const wColor = phase === 0 ? FB.green : FB.red;
    drawFBText(ctx, wLabel, cx, cy - 18 * s, 14 * s, a * wP, "center", wColor);
    const rightGlow = phase === 0 ? 0.9 : 0.25;
    drawFBNode(ctx, cx + 50 * s, cy, 14 * s * (0.8 + rightGlow * 0.4), 1, a * wP * rightGlow, frame);
    const labelP = interpolate(frame, [70, 90], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, phase === 0 ? "FIRE HARDER" : "SHUT UP", cx + 50 * s, cy + 22 * s, 8 * s, a * labelP, "center", wColor);
    drawFBText(ctx, "WEIGHT = STRENGTH OF CONNECTION", cx, H * 0.82, 9 * s, a * labelP, "center", FB.text.dim);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V2: network ring with labeled +/- weights on edges ----------
const V2: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 210);
    const s = Math.min(W, H) / 360;
    const nodes: [number, number][] = [];
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2 - Math.PI / 2;
      nodes.push([W / 2 + Math.cos(angle) * 45 * s, H * 0.42 + Math.sin(angle) * 38 * s]);
    }
    const edges: [number, number, number][] = [[0,1,420],[1,2,-310],[2,3,85],[3,4,-900],[4,5,200],[5,0,-45],[0,3,670],[1,4,-150]];
    edges.forEach(([fi, ti, wt], idx) => {
      const t = interpolate(frame, [10 + idx * 12, 30 + idx * 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const positive = wt > 0;
      const col = positive ? FB.green : FB.red;
      drawFBColorEdge(ctx, nodes[fi][0], nodes[fi][1], nodes[ti][0], nodes[ti][1], col, s * (positive ? 0.7 : 0.3), a * t);
      const mx = (nodes[fi][0] + nodes[ti][0]) / 2;
      const my = (nodes[fi][1] + nodes[ti][1]) / 2;
      drawFBText(ctx, (wt > 0 ? "+" : "") + wt, mx, my - 5 * s, 5 * s, a * t * 0.7, "center", col);
    });
    nodes.forEach(([x, y], i) => {
      const t = interpolate(frame, [5, 20], [0, 1], { extrapolateRight: "clamp" });
      drawFBNode(ctx, x, y, 8 * s, i, a * t, frame);
    });
    const legP = interpolate(frame, [120, 150], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "POSITIVE = EXCITE", W * 0.25, H * 0.82, 8 * s, a * legP, "center", FB.green);
    drawFBText(ctx, "NEGATIVE = INHIBIT", W * 0.75, H * 0.82, 8 * s, a * legP, "center", FB.red);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V3: weight slider dragging from -2405 to +1897 ----------
const V3: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 210);
    const s = Math.min(W, H) / 360;
    const cx = W / 2, sliderY = H * 0.35;
    const sliderW = W * 0.7, sliderX = cx - sliderW / 2;
    const trackP = interpolate(frame, [10, 30], [0, 1], { extrapolateRight: "clamp" });
    const grad = ctx.createLinearGradient(sliderX, 0, sliderX + sliderW, 0);
    grad.addColorStop(0, FB.red); grad.addColorStop(0.5, FB.text.dim); grad.addColorStop(1, FB.green);
    ctx.globalAlpha = a * trackP * 0.5;
    ctx.fillStyle = grad;
    ctx.fillRect(sliderX, sliderY - 2 * s, sliderW, 4 * s);
    const knobFrac = interpolate(frame, [40, 160], [0.1, 0.9], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const knobX = sliderX + knobFrac * sliderW;
    ctx.globalAlpha = a;
    ctx.fillStyle = knobFrac < 0.5 ? FB.red : FB.green;
    ctx.beginPath(); ctx.arc(knobX, sliderY, 6 * s, 0, Math.PI * 2); ctx.fill();
    const wVal = Math.round(interpolate(knobFrac, [0, 1], [-2400, 1900]));
    drawFBCounter(ctx, (wVal > 0 ? "+" : "") + wVal, cx, sliderY - 18 * s, 14 * s, knobFrac < 0.5 ? FB.red : FB.green, a);
    drawFBText(ctx, "-2405", sliderX, sliderY + 14 * s, 7 * s, a * trackP, "center", FB.red);
    drawFBText(ctx, "+1897", sliderX + sliderW, sliderY + 14 * s, 7 * s, a * trackP, "center", FB.green);
    const neuronA = interpolate(knobFrac, [0, 0.5, 1], [0.1, 0.3, 1]);
    const neuronR = interpolate(knobFrac, [0, 0.5, 1], [6, 8, 16]) * s;
    drawFBNode(ctx, cx, H * 0.62, neuronR, 4, a * neuronA, frame);
    const stateLabel = knobFrac < 0.35 ? "SILENCED" : knobFrac < 0.55 ? "QUIET" : "FIRING";
    drawFBText(ctx, stateLabel, cx, H * 0.62 + neuronR + 12 * s, 9 * s, a, "center", knobFrac < 0.5 ? FB.red : FB.green);
    drawFBText(ctx, "15 MILLION WEIGHTS", cx, H * 0.88, 8 * s, a * interpolate(frame, [160, 190], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }), "center", FB.text.dim);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V4: three connections side by side — strong+, weak+, strong- ----------
const V4: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 210);
    const s = Math.min(W, H) / 360;
    const cols = [
      { label: "STRONG +", weight: "+1200", color: FB.green, brightness: 1.0 },
      { label: "WEAK +", weight: "+30", color: FB.green, brightness: 0.35 },
      { label: "STRONG -", weight: "-900", color: FB.red, brightness: 0.15 },
    ];
    cols.forEach((col, i) => {
      const t = interpolate(frame, [15 + i * 30, 45 + i * 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const x = W * 0.18 + i * W * 0.3;
      const topY = H * 0.2, botY = H * 0.55;
      drawFBNode(ctx, x, topY, 10 * s, 3, a * t, frame);
      drawFBColorEdge(ctx, x, topY + 10 * s, x, botY - 10 * s, col.color, s * (col.brightness * 3 + 0.5), a * t);
      drawFBNode(ctx, x, botY, 10 * s * (0.5 + col.brightness * 0.5), i + 4, a * t * col.brightness, frame);
      drawFBText(ctx, col.weight, x, (topY + botY) / 2, 10 * s, a * t, "center", col.color);
      drawFBText(ctx, col.label, x, botY + 18 * s, 7 * s, a * t, "center", col.color);
    });
    const botP = interpolate(frame, [140, 170], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "POSITIVE = FIRE HARDER", W / 2, H * 0.82, 9 * s, a * botP, "center", FB.green);
    drawFBText(ctx, "NEGATIVE = SHUT UP", W / 2, H * 0.91, 9 * s, a * botP, "center", FB.red);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V5: spike trains — positive amplifies, negative suppresses ----------
const V5: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 210);
    const s = Math.min(W, H) / 360;
    // Input spikes
    const inputY = H * 0.12;
    drawFBText(ctx, "INPUT SPIKES", W * 0.08, inputY, 7 * s, a, "left", FB.text.dim);
    for (let i = 0; i < 12; i++) {
      const sx = W * 0.08 + i * W * 0.07;
      const sH = (8 + Math.sin(i * 1.7) * 5) * s;
      const t = interpolate(frame, [5 + i * 4, 10 + i * 4], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      ctx.globalAlpha = a * t; ctx.fillStyle = FB.teal;
      ctx.fillRect(sx, inputY + 10 * s, 2 * s, -sH);
    }
    // Positive path
    const posP = interpolate(frame, [60, 90], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "w = +500", W * 0.25, H * 0.36, 10 * s, a * posP, "center", FB.green);
    for (let i = 0; i < 12; i++) {
      const sx = W * 0.08 + i * W * 0.07;
      const sH = (14 + Math.sin(i * 1.7) * 8) * s;
      const t = interpolate(frame, [70 + i * 3, 76 + i * 3], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      ctx.globalAlpha = a * posP * t; ctx.fillStyle = FB.green;
      ctx.fillRect(sx, H * 0.5 + 10 * s, 2 * s, -sH);
    }
    drawFBText(ctx, "AMPLIFIED", W * 0.88, H * 0.47, 8 * s, a * posP, "center", FB.green);
    // Negative path
    const negP = interpolate(frame, [120, 150], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "w = -500", W * 0.25, H * 0.68, 10 * s, a * negP, "center", FB.red);
    for (let i = 0; i < 12; i++) {
      const sx = W * 0.08 + i * W * 0.07;
      ctx.globalAlpha = a * negP * 0.2; ctx.fillStyle = FB.red;
      ctx.fillRect(sx, H * 0.82 + 10 * s, 2 * s, -1 * s);
    }
    drawFBText(ctx, "SILENCED", W * 0.88, H * 0.82, 8 * s, a * negP, "center", FB.red);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V6: heat-map grid of weight values ----------
const V6: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 210);
    const s = Math.min(W, H) / 360;
    const rng = seeded(5901);
    const rows = 6, nCols = 8;
    const cellW = W * 0.08, cellH = H * 0.08;
    const startX = W * 0.12, startY = H * 0.12;
    drawFBText(ctx, "WEIGHT MATRIX", W / 2, H * 0.06, 9 * s, a, "center", FB.text.dim);
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < nCols; c++) {
        const idx = r * nCols + c;
        const t = interpolate(frame, [8 + idx * 2, 18 + idx * 2], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        const val = Math.round((rng() - 0.45) * 2000);
        const positive = val > 0;
        const intensity = Math.abs(val) / 1200;
        const x = startX + c * cellW, y = startY + r * cellH;
        ctx.globalAlpha = a * t * (0.15 + intensity * 0.4);
        ctx.fillStyle = positive ? FB.green : FB.red;
        ctx.fillRect(x + 1, y + 1, cellW - 2, cellH - 2);
        drawFBText(ctx, String(val), x + cellW / 2, y + cellH / 2, 5 * s, a * t * 0.8, "center", positive ? FB.green : FB.red);
      }
    }
    const legP = interpolate(frame, [130, 160], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "EVERY NUMBER = ONE SYNAPSE", W / 2, H * 0.72, 9 * s, a * legP, "center", FB.gold);
    drawFBText(ctx, "15,000,000 OF THEM", W / 2, H * 0.82, 11 * s, a * legP, "center", FB.text.primary);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V7: synapse zoom — pulse travels through weight gate ----------
const V7: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 210);
    const s = Math.min(W, H) / 360;
    const leftX = W * 0.15, rightX = W * 0.85, cy = H * 0.4, gateX = W * 0.5;
    drawFBNode(ctx, leftX, cy, 14 * s, 5, a, frame);
    drawFBText(ctx, "PRE", leftX, cy + 20 * s, 7 * s, a, "center", FB.text.dim);
    drawFBNode(ctx, rightX, cy, 14 * s, 1, a, frame);
    drawFBText(ctx, "POST", rightX, cy + 20 * s, 7 * s, a, "center", FB.text.dim);
    ctx.globalAlpha = a * 0.3; ctx.strokeStyle = FB.text.dim; ctx.lineWidth = 2 * s;
    ctx.beginPath(); ctx.moveTo(leftX + 14 * s, cy); ctx.lineTo(rightX - 14 * s, cy); ctx.stroke();
    const gateP = interpolate(frame, [20, 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const phase = frame < 120 ? 0 : 1;
    const wCol = phase === 0 ? FB.green : FB.red;
    ctx.globalAlpha = a * gateP; ctx.strokeStyle = wCol; ctx.lineWidth = 2 * s;
    ctx.strokeRect(gateX - 12 * s, cy - 12 * s, 24 * s, 24 * s);
    drawFBText(ctx, phase === 0 ? "+347" : "-182", gateX, cy, 11 * s, a * gateP, "center", wCol);
    const pulseLoop = (frame % 60) / 60;
    const pulseX = leftX + 14 * s + pulseLoop * (rightX - leftX - 28 * s);
    const pastGate = pulseX > gateX;
    ctx.globalAlpha = a * (phase === 0 ? 1 : pastGate ? 0.1 : 1);
    ctx.fillStyle = FB.teal;
    ctx.beginPath(); ctx.arc(pulseX, cy, 4 * s, 0, Math.PI * 2); ctx.fill();
    const expP = interpolate(frame, [50, 75], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, phase === 0 ? "POSITIVE: SIGNAL PASSES" : "NEGATIVE: SIGNAL BLOCKED", W / 2, H * 0.7, 10 * s, a * expP, "center", wCol);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V8: bar chart — positive bars up, negative bars down ----------
const V8: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 210);
    const s = Math.min(W, H) / 360;
    const rng = seeded(5908);
    const baseline = H * 0.48;
    const nBars = 14, barW = W * 0.055, startX = W * 0.08;
    ctx.globalAlpha = a * 0.3; ctx.strokeStyle = FB.text.dim; ctx.lineWidth = 1 * s;
    ctx.beginPath(); ctx.moveTo(startX, baseline); ctx.lineTo(W * 0.92, baseline); ctx.stroke();
    drawFBText(ctx, "0", W * 0.04, baseline, 7 * s, a * 0.5, "center", FB.text.dim);
    for (let i = 0; i < nBars; i++) {
      const t = interpolate(frame, [10 + i * 8, 30 + i * 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const val = (rng() - 0.4) * 2000;
      const positive = val > 0;
      const barH = Math.abs(val) / 2400 * H * 0.35 * t;
      ctx.globalAlpha = a * t; ctx.fillStyle = positive ? FB.green : FB.red;
      ctx.fillRect(startX + i * (barW + 2), positive ? baseline - barH : baseline, barW, barH);
    }
    const legP = interpolate(frame, [140, 170], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "ABOVE ZERO: EXCITE", W * 0.3, H * 0.88, 8 * s, a * legP, "center", FB.green);
    drawFBText(ctx, "BELOW ZERO: INHIBIT", W * 0.7, H * 0.88, 8 * s, a * legP, "center", FB.red);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V9: same input diverges — positive path fires, negative path silent ----------
const V9: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 210);
    const s = Math.min(W, H) / 360;
    const srcP = interpolate(frame, [5, 20], [0, 1], { extrapolateRight: "clamp" });
    drawFBNode(ctx, W * 0.1, H * 0.45, 14 * s, 4, a * srcP, frame);
    drawFBText(ctx, "SIGNAL", W * 0.1, H * 0.45 + 20 * s, 7 * s, a * srcP, "center", FB.text.dim);
    // Top: positive
    const topP = interpolate(frame, [30, 60], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBColorEdge(ctx, W * 0.2, H * 0.4, W * 0.55, H * 0.2, FB.green, s * 2, a * topP);
    drawFBText(ctx, "+890", W * 0.38, H * 0.25, 10 * s, a * topP, "center", FB.green);
    drawFBNode(ctx, W * 0.65, H * 0.2, 12 * s, 3, a * topP, frame);
    if (topP > 0.5) {
      const pulse = 0.5 + 0.5 * Math.sin(frame * 0.15);
      ctx.globalAlpha = a * topP * pulse * 0.3; ctx.fillStyle = FB.green;
      ctx.beginPath(); ctx.arc(W * 0.65, H * 0.2, 20 * s, 0, Math.PI * 2); ctx.fill();
    }
    drawFBText(ctx, "FIRES", W * 0.82, H * 0.2, 10 * s, a * topP, "center", FB.green);
    // Bottom: negative
    const botP = interpolate(frame, [80, 110], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBColorEdge(ctx, W * 0.2, H * 0.5, W * 0.55, H * 0.7, FB.red, s * 2, a * botP);
    drawFBText(ctx, "-1400", W * 0.38, H * 0.65, 10 * s, a * botP, "center", FB.red);
    drawFBNode(ctx, W * 0.65, H * 0.7, 10 * s, 0, a * botP * 0.3, frame);
    drawFBText(ctx, "SILENT", W * 0.82, H * 0.7, 10 * s, a * botP, "center", FB.red);
    const sumP = interpolate(frame, [140, 170], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "SAME SIGNAL, DIFFERENT WEIGHTS", W / 2, H * 0.9, 9 * s, a * sumP, "center", FB.gold);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

export const VARIANTS_FB_059: VariantDef[] = [
  { id: "fb-059-v1", label: "Two neurons with cycling +/- weight", component: V1 },
  { id: "fb-059-v2", label: "Network ring with labeled weights", component: V2 },
  { id: "fb-059-v3", label: "Weight slider from -2405 to +1897", component: V3 },
  { id: "fb-059-v4", label: "Three connections: strong+, weak+, strong-", component: V4 },
  { id: "fb-059-v5", label: "Spike trains amplified vs silenced", component: V5 },
  { id: "fb-059-v6", label: "Matrix grid of weight values", component: V6 },
  { id: "fb-059-v7", label: "Synapse zoom with weight gate", component: V7 },
  { id: "fb-059-v8", label: "Bar chart positive up negative down", component: V8 },
  { id: "fb-059-v9", label: "Same signal divergent weights", component: V9 },
];
