import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantDef, VariantProps } from "../types";
import { FB, seeded, drawFBBg, drawFBNode, drawFBEdge, drawFBText, drawFBCounter, fadeInOut, cellHSL, drawFBColorEdge, drawPersonBlob, drawIconPerson, drawIconBuilding } from "./flatbold-kit";

/* Shot 024 — "Each neuron follows one simple rule: receive signals, add them up,
   and fire if it crosses a threshold." — 210 frames (7s)
   Big neuron center, inputs arrive, bar fills, threshold line, SPIKE flash. */

const DUR = 210;

function accent(i: number) { return FB.colors[i % FB.colors.length]; }

/* V1: Central blob, input arrows from left, bar fills, threshold line, flash at spike */
const V1: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame); const a = fadeInOut(frame, DUR);
    const sc = Math.min(W, H) / 360;
    const cx = W / 2, cy = H * 0.4;
    // Input signals arrive from left
    const inputP = interpolate(frame, [10, 80], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    for (let i = 0; i < 5; i++) {
      const sy = H * 0.15 + i * H * 0.14;
      const px = interpolate(frame, [10 + i * 8, 50 + i * 8], [W * 0.05, cx - 20 * sc], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      drawFBNode(ctx, W * 0.05, sy, 4 * sc, i, a * inputP * 0.5);
      // Traveling dot
      const dotP = interpolate(frame, [10 + i * 8, 50 + i * 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      if (dotP > 0 && dotP < 1) {
        ctx.globalAlpha = a * 0.8; ctx.fillStyle = accent(i);
        ctx.beginPath(); ctx.arc(px, sy + (cy - sy) * dotP, 3 * sc, 0, Math.PI * 2); ctx.fill();
      }
      drawFBColorEdge(ctx, W * 0.05, sy, cx - 20 * sc, cy, accent(i), sc, a * inputP * 0.2);
    }
    // Central neuron (big)
    drawFBNode(ctx, cx, cy, 22 * sc, 4, a, frame);
    // Voltage bar below neuron
    const barY = H * 0.62, barW = W * 0.5, barH = 12 * sc;
    const voltage = interpolate(frame, [30, 130], [0, 0.85], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = a * 0.2; ctx.fillStyle = "rgba(255,255,255,0.08)";
    ctx.fillRect(cx - barW / 2, barY, barW, barH);
    ctx.globalAlpha = a; ctx.fillStyle = voltage > 0.75 ? FB.red : FB.teal;
    ctx.fillRect(cx - barW / 2, barY, barW * voltage, barH);
    // Threshold line
    ctx.globalAlpha = a * 0.7; ctx.strokeStyle = FB.gold; ctx.lineWidth = 1.5 * sc;
    ctx.setLineDash([4 * sc, 3 * sc]);
    ctx.beginPath(); ctx.moveTo(cx - barW / 2 + barW * 0.75, barY - 4 * sc);
    ctx.lineTo(cx - barW / 2 + barW * 0.75, barY + barH + 4 * sc); ctx.stroke();
    ctx.setLineDash([]);
    drawFBText(ctx, "THRESHOLD", cx - barW / 2 + barW * 0.75, barY - 10 * sc, 7 * sc, a * 0.6, "center", FB.gold);
    // SPIKE flash
    const spikeP = interpolate(frame, [135, 150, 170], [0, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (spikeP > 0) {
      ctx.globalAlpha = a * spikeP * 0.3; ctx.fillStyle = FB.gold;
      ctx.beginPath(); ctx.arc(cx, cy, 60 * sc * spikeP, 0, Math.PI * 2); ctx.fill();
      drawFBText(ctx, "SPIKE!", cx, H * 0.82, 16 * sc, a * spikeP, "center", FB.gold);
    }
    drawFBText(ctx, "RECEIVE + SUM + FIRE", cx, H * 0.94, 8 * sc, a, "center", FB.text.dim);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* V2: Funnel — signals converge into single cell, accumulator number ticks up, flash */
const V2: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame); const a = fadeInOut(frame, DUR);
    const sc = Math.min(W, H) / 360;
    const cx = W / 2, cy = H * 0.5;
    // Source nodes around the top
    const sources = [[W * 0.1, H * 0.1], [W * 0.3, H * 0.05], [W * 0.5, H * 0.08], [W * 0.7, H * 0.05], [W * 0.9, H * 0.1]];
    sources.forEach(([sx, sy], i) => {
      const arriveP = interpolate(frame, [15 + i * 12, 60 + i * 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      drawFBNode(ctx, sx, sy, 5 * sc, i, a * 0.6);
      drawFBEdge(ctx, sx, sy, cx, cy, sc, a * arriveP * 0.3, frame);
      // Traveling pulse
      if (arriveP > 0 && arriveP < 1) {
        const px = sx + (cx - sx) * arriveP, py = sy + (cy - sy) * arriveP;
        ctx.globalAlpha = a * 0.8; ctx.fillStyle = accent(i);
        ctx.beginPath(); ctx.arc(px, py, 3 * sc, 0, Math.PI * 2); ctx.fill();
      }
    });
    // Central neuron
    drawFBNode(ctx, cx, cy, 24 * sc, 4, a, frame);
    // Running sum number inside
    const sumVal = Math.floor(interpolate(frame, [30, 130], [0, 87], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
    drawFBCounter(ctx, sumVal, cx, cy, 14 * sc, FB.text.primary, a * 0.8);
    // Threshold label
    drawFBText(ctx, "thr = 75", cx, cy + 30 * sc, 8 * sc, a * 0.5, "center", FB.gold);
    // Spike at threshold
    const spiked = sumVal >= 75;
    if (spiked) {
      const sP = interpolate(frame, [130, 145, 175], [0, 1, 0.6], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      ctx.globalAlpha = a * sP * 0.25; ctx.fillStyle = FB.gold;
      ctx.beginPath(); ctx.arc(cx, cy, 50 * sc, 0, Math.PI * 2); ctx.fill();
      drawFBText(ctx, "FIRE!", cx, H * 0.82, 18 * sc, a * sP, "center", FB.gold);
    }
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* V3: Timeline — horizontal signal trace, threshold dashed line, spike peak */
const V3: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame); const a = fadeInOut(frame, DUR);
    const sc = Math.min(W, H) / 360;
    const cx = W / 2, traceY = H * 0.55;
    drawFBText(ctx, "ONE NEURON'S STORY", cx, H * 0.08, 10 * sc, a, "center", FB.gold);
    // Three phase labels
    const p1 = interpolate(frame, [5, 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "1. RECEIVE", W * 0.18, H * 0.2, 9 * sc, a * p1, "center", FB.teal);
    const p2 = interpolate(frame, [50, 80], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "2. ADD UP", W * 0.5, H * 0.2, 9 * sc, a * p2, "center", FB.blue);
    const p3 = interpolate(frame, [120, 150], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "3. FIRE!", W * 0.82, H * 0.2, 9 * sc, a * p3, "center", FB.gold);
    // Voltage trace
    const traceW = W * 0.8, x0 = W * 0.1;
    const drawPts = Math.floor(interpolate(frame, [10, 170], [0, 60], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
    ctx.globalAlpha = a; ctx.strokeStyle = FB.teal; ctx.lineWidth = 2 * sc; ctx.lineCap = "round";
    ctx.beginPath();
    for (let i = 0; i <= drawPts; i++) {
      const t = i / 60;
      const x = x0 + t * traceW;
      let v = 0;
      if (t < 0.7) v = t * 0.9;
      else if (t < 0.75) v = 1.3;
      else v = 0.2;
      const y = traceY - v * H * 0.3;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();
    // Threshold dashed line
    ctx.globalAlpha = a * 0.5; ctx.strokeStyle = FB.gold; ctx.lineWidth = 1 * sc;
    ctx.setLineDash([4 * sc, 3 * sc]);
    ctx.beginPath(); ctx.moveTo(x0, traceY - 0.65 * H * 0.3);
    ctx.lineTo(x0 + traceW, traceY - 0.65 * H * 0.3); ctx.stroke();
    ctx.setLineDash([]);
    drawFBText(ctx, "threshold", x0 + traceW + 5 * sc, traceY - 0.65 * H * 0.3, 7 * sc, a * 0.5, "left", FB.gold);
    // Flash at spike point
    if (drawPts > 42) {
      const sP = interpolate(frame, [140, 155, 180], [0, 1, 0.3], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const spikeX = x0 + 0.72 * traceW;
      ctx.globalAlpha = a * sP * 0.3; ctx.fillStyle = FB.gold;
      ctx.beginPath(); ctx.arc(spikeX, traceY - 1.3 * H * 0.3, 15 * sc, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* V4: Beaker metaphor — liquid drops fall in, level rises, boils over */
const V4: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame); const a = fadeInOut(frame, DUR);
    const sc = Math.min(W, H) / 360;
    const cx = W / 2, beakerY = H * 0.75, beakerH = H * 0.4, beakerW = W * 0.25;
    // Beaker outline
    ctx.globalAlpha = a * 0.4; ctx.strokeStyle = FB.teal; ctx.lineWidth = 2 * sc;
    ctx.beginPath();
    ctx.moveTo(cx - beakerW / 2, beakerY - beakerH);
    ctx.lineTo(cx - beakerW / 2, beakerY);
    ctx.lineTo(cx + beakerW / 2, beakerY);
    ctx.lineTo(cx + beakerW / 2, beakerY - beakerH);
    ctx.stroke();
    // Fill level
    const level = interpolate(frame, [20, 140], [0, 0.9], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const fillH = beakerH * level;
    ctx.globalAlpha = a * 0.3; ctx.fillStyle = level > 0.75 ? FB.gold : FB.teal;
    ctx.fillRect(cx - beakerW / 2 + 2 * sc, beakerY - fillH, beakerW - 4 * sc, fillH);
    // Drops falling in
    for (let i = 0; i < 6; i++) {
      const dropFrame = frame - i * 18;
      if (dropFrame > 10 && dropFrame < 140) {
        const dy = interpolate(dropFrame % 25, [0, 25], [H * 0.05, beakerY - fillH], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        const dx = cx + (i % 2 === 0 ? -1 : 1) * (10 + i * 5) * sc;
        ctx.globalAlpha = a * 0.7; ctx.fillStyle = accent(i);
        ctx.beginPath(); ctx.arc(dx, dy, 3 * sc, 0, Math.PI * 2); ctx.fill();
      }
    }
    // Threshold line
    ctx.globalAlpha = a * 0.5; ctx.strokeStyle = FB.gold; ctx.lineWidth = 1 * sc;
    ctx.setLineDash([4 * sc, 3 * sc]);
    ctx.beginPath(); ctx.moveTo(cx - beakerW / 2 - 10 * sc, beakerY - beakerH * 0.75);
    ctx.lineTo(cx + beakerW / 2 + 10 * sc, beakerY - beakerH * 0.75); ctx.stroke();
    ctx.setLineDash([]);
    drawFBText(ctx, "THR", cx + beakerW / 2 + 18 * sc, beakerY - beakerH * 0.75, 8 * sc, a * 0.5, "left", FB.gold);
    // Boil over / spike
    const spikeP = interpolate(frame, [145, 165, 190], [0, 1, 0.4], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (spikeP > 0) {
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2 + frame * 0.1;
        const dist = spikeP * 30 * sc;
        ctx.globalAlpha = a * spikeP * 0.6; ctx.fillStyle = FB.gold;
        ctx.beginPath(); ctx.arc(cx + Math.cos(angle) * dist, (beakerY - beakerH * 0.5) + Math.sin(angle) * dist, 2 * sc, 0, Math.PI * 2); ctx.fill();
      }
      drawFBText(ctx, "SPIKE!", cx, H * 0.08, 16 * sc, a * spikeP, "center", FB.gold);
    }
    drawFBText(ctx, "inputs fill, threshold triggers", cx, H * 0.95, 7 * sc, a * 0.5, "center", FB.text.dim);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* V5: Three-panel storyboard — RECEIVE, SUM, FIRE panels */
const V5: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame); const a = fadeInOut(frame, DUR);
    const sc = Math.min(W, H) / 360;
    const panelW = W * 0.28, gap = W * 0.04;
    const panels = [
      { label: "RECEIVE", x: W * 0.5 - panelW - gap, start: 10, color: FB.teal },
      { label: "ADD UP", x: W * 0.5 - panelW / 2, start: 60, color: FB.blue },
      { label: "FIRE", x: W * 0.5 + gap, start: 120, color: FB.gold },
    ];
    panels.forEach((p, pi) => {
      const pP = interpolate(frame, [p.start, p.start + 25], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      ctx.globalAlpha = a * pP * 0.1; ctx.fillStyle = p.color;
      ctx.fillRect(p.x, H * 0.2, panelW, H * 0.55);
      ctx.globalAlpha = a * pP * 0.3; ctx.strokeStyle = p.color; ctx.lineWidth = 1 * sc;
      ctx.strokeRect(p.x, H * 0.2, panelW, H * 0.55);
      drawFBText(ctx, p.label, p.x + panelW / 2, H * 0.14, 10 * sc, a * pP, "center", p.color);
      if (pi === 0) {
        for (let i = 0; i < 4; i++) {
          const ay = H * 0.28 + i * H * 0.1;
          drawFBNode(ctx, p.x + 5 * sc, ay, 3 * sc, i, a * pP * 0.6);
          drawFBColorEdge(ctx, p.x + 5 * sc, ay, p.x + panelW * 0.7, H * 0.45, accent(i), sc, a * pP * 0.3);
        }
        drawFBNode(ctx, p.x + panelW * 0.7, H * 0.45, 8 * sc, 4, a * pP);
      } else if (pi === 1) {
        const sumP = interpolate(frame, [p.start, p.start + 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        const nums = ["+12", "+8", "+15", "+6"];
        nums.forEach((n, ni) => {
          const nP = interpolate(frame, [p.start + ni * 8, p.start + ni * 8 + 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          drawFBText(ctx, n, p.x + panelW / 2, H * 0.28 + ni * H * 0.08, 9 * sc, a * nP, "center", accent(ni));
        });
        drawFBText(ctx, "= " + Math.floor(41 * sumP), p.x + panelW / 2, H * 0.62, 12 * sc, a * sumP, "center", FB.text.primary);
      } else {
        const fireP = interpolate(frame, [p.start, p.start + 15, p.start + 40], [0, 1, 0.7], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        ctx.globalAlpha = a * fireP * 0.2; ctx.fillStyle = FB.gold;
        ctx.beginPath(); ctx.arc(p.x + panelW / 2, H * 0.45, 20 * sc * fireP, 0, Math.PI * 2); ctx.fill();
        drawFBNode(ctx, p.x + panelW / 2, H * 0.45, 10 * sc, 3, a * fireP);
        drawFBText(ctx, "SPIKE!", p.x + panelW / 2, H * 0.63, 11 * sc, a * fireP, "center", FB.gold);
      }
    });
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* V6: Single cell close-up — pulsing membrane, synapses blink, bar fills */
const V6: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame); const a = fadeInOut(frame, DUR);
    const sc = Math.min(W, H) / 360;
    const cx = W / 2, cy = H * 0.42;
    const pulse = 0.95 + Math.sin(frame * 0.06) * 0.05;
    const r = 35 * sc * pulse;
    drawFBNode(ctx, cx, cy, r, 4, a, frame);
    // Synaptic inputs blinking around
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const dist = r + 18 * sc;
      const sx = cx + Math.cos(angle) * dist, sy = cy + Math.sin(angle) * dist;
      const blink = Math.sin(frame * 0.08 + i * 1.2) > 0.3 ? 1 : 0.2;
      const arrP = interpolate(frame, [5 + i * 6, 20 + i * 6], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      drawFBNode(ctx, sx, sy, 3 * sc, i, a * arrP * blink);
      drawFBColorEdge(ctx, sx, sy, cx + Math.cos(angle) * r * 0.7, cy + Math.sin(angle) * r * 0.7, accent(i), sc, a * arrP * blink * 0.4);
    }
    // Internal voltage bar
    const voltage = interpolate(frame, [30, 140], [0, 0.85], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const barW = W * 0.4, barH = 8 * sc;
    ctx.globalAlpha = a * 0.15; ctx.fillStyle = "#fff"; ctx.fillRect(cx - barW / 2, H * 0.7, barW, barH);
    ctx.globalAlpha = a * 0.8; ctx.fillStyle = voltage > 0.75 ? FB.gold : FB.teal;
    ctx.fillRect(cx - barW / 2, H * 0.7, barW * voltage, barH);
    drawFBText(ctx, "V = " + Math.floor(voltage * 100), cx, H * 0.7 + barH + 10 * sc, 8 * sc, a * 0.6, "center", FB.text.dim);
    // Spike flash
    const spikeP = interpolate(frame, [145, 160, 185], [0, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (spikeP > 0) {
      ctx.globalAlpha = a * spikeP * 0.4; ctx.fillStyle = FB.gold;
      ctx.beginPath(); ctx.arc(cx, cy, r * 2 * spikeP, 0, Math.PI * 2); ctx.fill();
      drawFBText(ctx, "SPIKE!", cx, H * 0.9, 14 * sc, a * spikeP, "center", FB.gold);
    }
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* V7: Domino chain — signals pass left-to-right, each neuron sums and relays */
const V7: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame); const a = fadeInOut(frame, DUR);
    const sc = Math.min(W, H) / 360;
    const cy = H * 0.45;
    const neurons = 5;
    for (let n = 0; n < neurons; n++) {
      const nx = W * 0.12 + n * W * 0.19;
      const fireTime = 30 + n * 35;
      const fillP = interpolate(frame, [fireTime - 25, fireTime], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const spikeP = interpolate(frame, [fireTime, fireTime + 10, fireTime + 25], [0, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      drawFBNode(ctx, nx, cy, 12 * sc, n + 1, a, frame);
      const barW = W * 0.14, barH = 6 * sc;
      ctx.globalAlpha = a * 0.15; ctx.fillStyle = "#fff"; ctx.fillRect(nx - barW / 2, cy + 18 * sc, barW, barH);
      ctx.globalAlpha = a * 0.7; ctx.fillStyle = fillP >= 1 ? FB.gold : FB.teal;
      ctx.fillRect(nx - barW / 2, cy + 18 * sc, barW * fillP, barH);
      ctx.globalAlpha = a * 0.4; ctx.strokeStyle = FB.gold; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(nx - barW / 2 + barW * 0.8, cy + 16 * sc);
      ctx.lineTo(nx - barW / 2 + barW * 0.8, cy + 26 * sc); ctx.stroke();
      if (spikeP > 0) {
        ctx.globalAlpha = a * spikeP * 0.3; ctx.fillStyle = FB.gold;
        ctx.beginPath(); ctx.arc(nx, cy, 18 * sc, 0, Math.PI * 2); ctx.fill();
      }
      if (n < neurons - 1) {
        const nextX = W * 0.12 + (n + 1) * W * 0.19;
        drawFBEdge(ctx, nx + 12 * sc, cy, nextX - 12 * sc, cy, sc, a * 0.3, frame);
      }
    }
    drawFBText(ctx, "EACH ONE: RECEIVE, SUM, FIRE", W / 2, H * 0.85, 9 * sc, a, "center", FB.gold);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* V8: Equation build-up — shows V += w*x, then threshold check */
const V8: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame); const a = fadeInOut(frame, DUR);
    const sc = Math.min(W, H) / 360;
    const cx = W / 2;
    drawFBText(ctx, "THE SIMPLE RULE", cx, H * 0.06, 10 * sc, a, "center", FB.gold);
    const s1 = interpolate(frame, [10, 35], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "signals arrive:", cx, H * 0.18, 8 * sc, a * s1, "center", FB.text.dim);
    const inputs = ["x1=3", "x2=7", "x3=2"];
    inputs.forEach((inp, i) => {
      drawFBText(ctx, inp, W * 0.25 + i * W * 0.25, H * 0.27, 9 * sc, a * s1 * interpolate(frame, [15 + i * 5, 25 + i * 5], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }), "center", accent(i));
    });
    const s2 = interpolate(frame, [55, 85], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "add them up:", cx, H * 0.39, 8 * sc, a * s2, "center", FB.text.dim);
    drawFBText(ctx, "V = 3 + 7 + 2 = 12", cx, H * 0.48, 12 * sc, a * s2, "center", FB.teal);
    const s3 = interpolate(frame, [100, 130], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "if V > threshold:", cx, H * 0.6, 8 * sc, a * s3, "center", FB.text.dim);
    drawFBText(ctx, "12 > 10 ?", cx, H * 0.69, 14 * sc, a * s3, "center", FB.gold);
    const s4 = interpolate(frame, [140, 165, 195], [0, 1, 0.8], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "YES \u2192 SPIKE!", cx, H * 0.82, 16 * sc, a * s4, "center", FB.gold);
    if (s4 > 0.5) {
      ctx.globalAlpha = a * (s4 - 0.5) * 0.15; ctx.fillStyle = FB.gold; ctx.fillRect(0, 0, W, H);
    }
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* V9: Bucket brigade — blobs carry numbers into a large neuron, overflow golden */
const V9: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame); const a = fadeInOut(frame, DUR);
    const sc = Math.min(W, H) / 360;
    const cx = W / 2, cy = H * 0.48;
    drawFBNode(ctx, cx, cy, 28 * sc, 4, a, frame);
    const carriers = [
      { sx: W * 0.02, sy: H * 0.2, val: "+5", delay: 0, ci: 0 },
      { sx: W * 0.02, sy: H * 0.5, val: "+8", delay: 15, ci: 1 },
      { sx: W * 0.02, sy: H * 0.8, val: "+3", delay: 30, ci: 2 },
      { sx: W * 0.98, sy: H * 0.3, val: "+6", delay: 45, ci: 3 },
      { sx: W * 0.98, sy: H * 0.65, val: "+4", delay: 60, ci: 5 },
    ];
    carriers.forEach(c => {
      const moveP = interpolate(frame, [10 + c.delay, 70 + c.delay], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const bx = c.sx + (cx - c.sx) * moveP, by = c.sy + (cy - c.sy) * moveP;
      if (moveP < 1) {
        drawFBNode(ctx, bx, by, 6 * sc, c.ci, a * 0.8, frame);
        drawFBText(ctx, c.val, bx, by - 10 * sc, 7 * sc, a * 0.7, "center", accent(c.ci));
      }
    });
    const sum = Math.floor(interpolate(frame, [30, 140], [0, 26], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
    drawFBCounter(ctx, sum, cx, cy - 5 * sc, 16 * sc, FB.text.primary, a * 0.8);
    drawFBText(ctx, "thr: 24", cx, cy + 18 * sc, 7 * sc, a * 0.4, "center", FB.gold);
    const sP = interpolate(frame, [145, 165, 195], [0, 1, 0.5], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (sP > 0) {
      ctx.globalAlpha = a * sP * 0.25; ctx.fillStyle = FB.gold;
      ctx.beginPath(); ctx.arc(cx, cy, 50 * sc * sP, 0, Math.PI * 2); ctx.fill();
      drawFBText(ctx, "FIRE!", cx, H * 0.88, 16 * sc, a * sP, "center", FB.gold);
    }
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

export const VARIANTS_FB_024: VariantDef[] = [
  { id: "fb-024-v1", label: "Central neuron, input arrows, bar fills, SPIKE flash", component: V1 },
  { id: "fb-024-v2", label: "Funnel: signals converge, sum ticks, fire", component: V2 },
  { id: "fb-024-v3", label: "Timeline voltage trace with threshold and spike", component: V3 },
  { id: "fb-024-v4", label: "Beaker metaphor: drops fill, boils over at threshold", component: V4 },
  { id: "fb-024-v5", label: "Three-panel storyboard: RECEIVE, SUM, FIRE", component: V5 },
  { id: "fb-024-v6", label: "Close-up cell: synapses blink, bar fills, glow spike", component: V6 },
  { id: "fb-024-v7", label: "Domino chain: each neuron sums and relays", component: V7 },
  { id: "fb-024-v8", label: "Equation build-up: V+=w*x, threshold check, SPIKE", component: V8 },
  { id: "fb-024-v9", label: "Bucket brigade: blobs carry numbers in, overflow", component: V9 },
];
