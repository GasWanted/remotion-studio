import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantDef, VariantProps } from "../types";
import { FB, seeded, drawFBBg, drawFBNode, drawFBEdge, drawFBText, drawFBCounter, fadeInOut, cellHSL, drawFBColorEdge } from "./flatbold-kit";

/* Shot 50 — "If the signal is strong enough, the physics engine pulls the leg." — 120 frames */

// ---------- V1: Signal bar fills to threshold, leg snaps into motion ----------
const V1: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 120);
    // Signal bar
    const barX = W * 0.1, barY = H * 0.25, barW = W * 0.8, barH = H * 0.08;
    const fillP = interpolate(frame, [10, 65], [0, 0.85], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = a * 0.15; ctx.fillStyle = "rgba(255,255,255,0.05)";
    ctx.fillRect(barX, barY, barW, barH);
    ctx.globalAlpha = a * 0.7;
    const barColor = fillP > 0.7 ? FB.green : FB.gold;
    ctx.fillStyle = barColor;
    ctx.fillRect(barX, barY, barW * fillP, barH);
    // Threshold line
    ctx.globalAlpha = a * 0.4; ctx.strokeStyle = FB.red; ctx.lineWidth = 1.5;
    ctx.setLineDash([3, 3]);
    ctx.beginPath(); ctx.moveTo(barX + barW * 0.7, barY - 5); ctx.lineTo(barX + barW * 0.7, barY + barH + 5); ctx.stroke();
    ctx.setLineDash([]);
    drawFBText(ctx, "threshold", barX + barW * 0.7, barY - 10, 7, a * 0.5, "center", FB.red);
    drawFBText(ctx, "signal strength", W / 2, barY - 20, 9, a, "center", FB.text.dim);
    // Below threshold: leg still. Above: leg moves.
    const triggered = fillP > 0.7;
    const legP = triggered ? interpolate(frame, [65, 100], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 0;
    // Leg pivot
    const pivotX = W / 2, pivotY = H * 0.55;
    const legAngle = -Math.PI * 0.15 + legP * Math.PI * 0.35;
    const legLen = H * 0.25;
    ctx.globalAlpha = a * 0.5; ctx.strokeStyle = FB.teal; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(pivotX, pivotY);
    ctx.lineTo(pivotX + Math.sin(legAngle) * legLen, pivotY + Math.cos(legAngle) * legLen);
    ctx.stroke();
    drawFBNode(ctx, pivotX, pivotY, 8, 4, a, frame);
    drawFBNode(ctx, pivotX + Math.sin(legAngle) * legLen, pivotY + Math.cos(legAngle) * legLen, 5, 3, a * (0.4 + legP * 0.6), frame);
    // Flash on trigger
    if (triggered && frame >= 65 && frame <= 72) {
      ctx.globalAlpha = a * (1 - (frame - 65) / 7) * 0.4; ctx.fillStyle = FB.green;
      ctx.beginPath(); ctx.arc(barX + barW * 0.7, barY + barH / 2, 15, 0, Math.PI * 2); ctx.fill();
    }
    const lbl = interpolate(frame, [90, 110], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "leg moves", W / 2, H * 0.92, 12, a * lbl, "center", FB.green);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V2: Meter with needle rising — crosses red line, leg icon activates ----------
const V2: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 120);
    const cx = W / 2, cy = H * 0.42, r = Math.min(W, H) * 0.25;
    // Arc gauge
    ctx.globalAlpha = a * 0.2; ctx.strokeStyle = FB.text.dim; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.arc(cx, cy, r, Math.PI * 0.8, Math.PI * 0.2); ctx.stroke();
    // Color zones
    ctx.globalAlpha = a * 0.15;
    ctx.strokeStyle = FB.gold; ctx.lineWidth = 6;
    ctx.beginPath(); ctx.arc(cx, cy, r, Math.PI * 0.8, Math.PI * 1.1); ctx.stroke();
    ctx.strokeStyle = FB.green; ctx.lineWidth = 6;
    ctx.beginPath(); ctx.arc(cx, cy, r, Math.PI * 1.1, Math.PI * 0.2); ctx.stroke();
    // Threshold tick
    ctx.globalAlpha = a * 0.5; ctx.strokeStyle = FB.red; ctx.lineWidth = 2;
    const threshAngle = Math.PI * 1.1;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(threshAngle) * (r - 8), cy + Math.sin(threshAngle) * (r - 8));
    ctx.lineTo(cx + Math.cos(threshAngle) * (r + 8), cy + Math.sin(threshAngle) * (r + 8));
    ctx.stroke();
    // Needle
    const needleAngle = interpolate(frame, [10, 70], [Math.PI * 0.85, Math.PI * 0.15], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = a * 0.8; ctx.strokeStyle = "#fff"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(needleAngle) * r * 0.8, cy + Math.sin(needleAngle) * r * 0.8);
    ctx.stroke();
    // Leg activates below
    const legP = interpolate(frame, [70, 100], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const legSwing = legP * Math.PI * 0.3;
    ctx.globalAlpha = a * 0.5; ctx.strokeStyle = FB.teal; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.moveTo(cx, H * 0.72);
    ctx.lineTo(cx + Math.sin(legSwing) * 30, H * 0.72 + Math.cos(legSwing) * 25);
    ctx.stroke();
    drawFBNode(ctx, cx, H * 0.72, 5, 4, a * legP, frame);
    drawFBText(ctx, "pulls the leg", cx, H * 0.92, 10, a * legP, "center", FB.green);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V3: Two scenarios — weak signal (nothing) vs strong signal (leg pulls) ----------
const V3: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 120);
    // Divider
    ctx.globalAlpha = a * 0.12; ctx.strokeStyle = FB.text.dim; ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    ctx.beginPath(); ctx.moveTo(W / 2, H * 0.1); ctx.lineTo(W / 2, H * 0.9); ctx.stroke();
    ctx.setLineDash([]);
    // Left: weak — small bar, static leg
    const lp = interpolate(frame, [10, 40], [0, 1], { extrapolateRight: "clamp" });
    drawFBText(ctx, "WEAK", W * 0.25, H * 0.08, 10, a * lp, "center", FB.text.dim);
    ctx.globalAlpha = a * lp * 0.15; ctx.fillStyle = "rgba(255,255,255,0.05)";
    ctx.fillRect(W * 0.05, H * 0.2, W * 0.4, H * 0.06);
    ctx.globalAlpha = a * lp * 0.5; ctx.fillStyle = FB.gold;
    ctx.fillRect(W * 0.05, H * 0.2, W * 0.12, H * 0.06);
    // threshold line
    ctx.globalAlpha = a * 0.3; ctx.strokeStyle = FB.red; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(W * 0.33, H * 0.18); ctx.lineTo(W * 0.33, H * 0.28); ctx.stroke();
    // static leg
    ctx.globalAlpha = a * lp * 0.3; ctx.strokeStyle = FB.text.dim; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(W * 0.25, H * 0.45); ctx.lineTo(W * 0.25, H * 0.65); ctx.stroke();
    drawFBText(ctx, "nothing", W * 0.25, H * 0.75, 9, a * lp, "center", FB.text.dim);
    // Right: strong — full bar, leg moves
    const rp = interpolate(frame, [30, 60], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "STRONG", W * 0.75, H * 0.08, 10, a * rp, "center", FB.green);
    ctx.globalAlpha = a * rp * 0.15; ctx.fillStyle = "rgba(255,255,255,0.05)";
    ctx.fillRect(W * 0.55, H * 0.2, W * 0.4, H * 0.06);
    ctx.globalAlpha = a * rp * 0.7; ctx.fillStyle = FB.green;
    ctx.fillRect(W * 0.55, H * 0.2, W * 0.35, H * 0.06);
    ctx.globalAlpha = a * 0.3; ctx.strokeStyle = FB.red; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(W * 0.83, H * 0.18); ctx.lineTo(W * 0.83, H * 0.28); ctx.stroke();
    // moving leg
    const legSwing = interpolate(frame, [60, 95], [0, Math.PI * 0.3], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = a * rp * 0.5; ctx.strokeStyle = FB.teal; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(W * 0.75, H * 0.45);
    ctx.lineTo(W * 0.75 + Math.sin(legSwing) * 25, H * 0.45 + Math.cos(legSwing) * 20);
    ctx.stroke();
    drawFBText(ctx, "PULLS", W * 0.75, H * 0.75, 9, a * rp, "center", FB.green);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V4: Stacked bars rising — only top one crosses line, triggers motion ----------
const V4: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 120);
    const barCount = 5;
    const barH = H * 0.05;
    const startY = H * 0.15;
    const threshX = W * 0.65;
    // Threshold line
    ctx.globalAlpha = a * 0.3; ctx.strokeStyle = FB.red; ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.beginPath(); ctx.moveTo(threshX, startY - 5); ctx.lineTo(threshX, startY + barCount * (barH + 8) + 5); ctx.stroke();
    ctx.setLineDash([]);
    drawFBText(ctx, "threshold", threshX + 5, startY - 10, 7, a * 0.5, "left", FB.red);
    for (let i = 0; i < barCount; i++) {
      const by = startY + i * (barH + 8);
      const fill = interpolate(frame, [10 + i * 6, 50 + i * 6], [0, 0.4 + i * 0.15], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const fillW = W * 0.8 * fill;
      const crosses = fillW > (threshX - W * 0.1);
      ctx.globalAlpha = a * 0.1; ctx.fillStyle = "rgba(255,255,255,0.04)";
      ctx.fillRect(W * 0.1, by, W * 0.8, barH);
      ctx.globalAlpha = a * 0.6; ctx.fillStyle = crosses ? FB.green : FB.gold;
      ctx.fillRect(W * 0.1, by, fillW, barH);
      if (crosses) {
        drawFBText(ctx, "GO", W * 0.05, by + barH / 2, 7, a * 0.7, "center", FB.green);
      }
    }
    // Leg at bottom activates only for crossing bars
    const legP = interpolate(frame, [75, 105], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const swing = legP * Math.PI * 0.25;
    ctx.globalAlpha = a * legP * 0.5; ctx.strokeStyle = FB.teal; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(W / 2, H * 0.72);
    ctx.lineTo(W / 2 + Math.sin(swing) * 30, H * 0.72 + Math.cos(swing) * 25); ctx.stroke();
    drawFBNode(ctx, W / 2, H * 0.72, 6, 4, a * legP, frame);
    drawFBText(ctx, "pulls the leg", W / 2, H * 0.92, 10, a * legP, "center", FB.green);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V5: Voltage rising like a thermometer — pops at threshold ----------
const V5: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 120);
    // Vertical thermometer
    const tx = W * 0.3, tTop = H * 0.1, tBot = H * 0.75;
    const tH = tBot - tTop;
    ctx.globalAlpha = a * 0.15; ctx.strokeStyle = FB.text.dim; ctx.lineWidth = 8; ctx.lineCap = "round";
    ctx.beginPath(); ctx.moveTo(tx, tTop); ctx.lineTo(tx, tBot); ctx.stroke();
    // Fill rising
    const fillP = interpolate(frame, [10, 70], [0, 0.85], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const fillTop = tBot - fillP * tH;
    ctx.globalAlpha = a * 0.6; ctx.strokeStyle = fillP > 0.7 ? FB.green : FB.gold;
    ctx.lineWidth = 6;
    ctx.beginPath(); ctx.moveTo(tx, tBot); ctx.lineTo(tx, fillTop); ctx.stroke();
    // Threshold tick mark
    const threshY = tBot - 0.7 * tH;
    ctx.globalAlpha = a * 0.5; ctx.strokeStyle = FB.red; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(tx - 12, threshY); ctx.lineTo(tx + 12, threshY); ctx.stroke();
    drawFBText(ctx, "threshold", tx + 18, threshY, 7, a * 0.5, "left", FB.red);
    // Burst when crossing
    if (fillP > 0.7 && frame >= 70 && frame <= 80) {
      const burstA = 1 - (frame - 70) / 10;
      ctx.globalAlpha = a * burstA * 0.3; ctx.fillStyle = FB.green;
      ctx.beginPath(); ctx.arc(tx, threshY, 15 + (frame - 70) * 2, 0, Math.PI * 2); ctx.fill();
    }
    // Leg on right activates
    const legP = interpolate(frame, [72, 105], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const pivotX = W * 0.7, pivotY = H * 0.45;
    const swing = legP * Math.PI * 0.3;
    ctx.globalAlpha = a * legP * 0.5; ctx.strokeStyle = FB.teal; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(pivotX, pivotY);
    ctx.lineTo(pivotX + Math.sin(swing) * 35, pivotY + Math.cos(swing) * 30); ctx.stroke();
    drawFBNode(ctx, pivotX, pivotY, 6, 4, a * legP, frame);
    drawFBText(ctx, "engine pulls leg", W * 0.7, H * 0.85, 10, a * legP, "center", FB.green);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V6: Number counter ticking up, flashes green at threshold ----------
const V6: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 120);
    const val = interpolate(frame, [10, 60], [0, 100], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const crossed = val >= 70;
    const color = crossed ? FB.green : FB.gold;
    drawFBCounter(ctx, Math.floor(val), W / 2, H * 0.3, 28, color, a);
    drawFBText(ctx, "signal strength", W / 2, H * 0.15, 10, a, "center", FB.text.dim);
    drawFBText(ctx, "threshold: 70", W / 2, H * 0.42, 8, a * 0.5, "center", FB.red);
    // Flash
    if (crossed && frame >= 48 && frame <= 58) {
      ctx.globalAlpha = a * (1 - (frame - 48) / 10) * 0.2; ctx.fillStyle = FB.green;
      ctx.beginPath(); ctx.arc(W / 2, H * 0.3, 40, 0, Math.PI * 2); ctx.fill();
    }
    // Leg at bottom
    const legP = crossed ? interpolate(frame, [58, 95], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 0;
    ctx.globalAlpha = a * 0.4; ctx.strokeStyle = crossed ? FB.teal : FB.text.dim; ctx.lineWidth = 2.5;
    const swing = legP * Math.PI * 0.3;
    ctx.beginPath(); ctx.moveTo(W / 2, H * 0.6);
    ctx.lineTo(W / 2 + Math.sin(swing) * 30, H * 0.6 + Math.cos(swing) * 25); ctx.stroke();
    drawFBNode(ctx, W / 2, H * 0.6, 6, 4, a, frame);
    drawFBText(ctx, crossed ? "LEG PULLS" : "waiting...", W / 2, H * 0.88, 11, a * (crossed ? 1 : 0.4), "center", crossed ? FB.green : FB.text.dim);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V7: Neuron fires, ripple reaches muscle, muscle contracts leg ----------
const V7: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 120);
    // Three stages horizontally
    const stages = [
      { x: W * 0.15, y: H * 0.35, label: "signal", ci: 5 },
      { x: W * 0.5, y: H * 0.35, label: "engine", ci: 4 },
      { x: W * 0.85, y: H * 0.35, label: "leg", ci: 3 },
    ];
    for (let i = 0; i < stages.length; i++) {
      const s = stages[i];
      const sp = interpolate(frame, [5 + i * 20, 20 + i * 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      drawFBNode(ctx, s.x, s.y, 12, s.ci, a * sp, frame);
      drawFBText(ctx, s.label, s.x, s.y + 20, 8, a * sp, "center", FB.text.dim);
      if (i < 2) {
        ctx.globalAlpha = a * sp * 0.15; ctx.strokeStyle = FB.gold; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(s.x + 14, s.y); ctx.lineTo(stages[i + 1].x - 14, s.y); ctx.stroke();
        // arrow head
        const nx = stages[i + 1].x - 14;
        ctx.fillStyle = FB.gold;
        ctx.beginPath(); ctx.moveTo(nx, s.y); ctx.lineTo(nx - 5, s.y - 3); ctx.lineTo(nx - 5, s.y + 3); ctx.fill();
      }
    }
    // Signal growing
    const sigVal = interpolate(frame, [30, 60], [0, 100], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBCounter(ctx, Math.floor(sigVal), W * 0.15, H * 0.55, 12, sigVal >= 70 ? FB.green : FB.gold, a);
    // Leg motion at end
    const legP = interpolate(frame, [70, 105], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const swing = legP * Math.sin(frame * 0.1) * Math.PI * 0.15;
    ctx.globalAlpha = a * legP * 0.5; ctx.strokeStyle = FB.teal; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(W * 0.85, H * 0.5);
    ctx.lineTo(W * 0.85 + Math.sin(swing) * 20, H * 0.5 + 20); ctx.stroke();
    drawFBText(ctx, "strong enough => PULL", W / 2, H * 0.85, 9, a * legP, "center", FB.green);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V8: Waveform amplitude growing — leg silhouette responds ----------
const V8: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 120);
    // Growing waveform
    const amp = interpolate(frame, [5, 70], [0.05, 0.5], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = a * 0.6; ctx.strokeStyle = amp > 0.35 ? FB.green : FB.gold; ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let x = 0; x < W; x += 2) {
      const t = x / W * 8 * Math.PI;
      const wy = H * 0.3 + Math.sin(t - frame * 0.08) * H * amp;
      if (x === 0) ctx.moveTo(x, wy); else ctx.lineTo(x, wy);
    }
    ctx.stroke();
    // Threshold band
    ctx.globalAlpha = a * 0.1; ctx.fillStyle = FB.red;
    ctx.fillRect(0, H * 0.3 - H * 0.35, W, 2);
    ctx.fillRect(0, H * 0.3 + H * 0.35, W, 2);
    drawFBText(ctx, "threshold", W * 0.9, H * 0.3 - H * 0.35 - 6, 6, a * 0.3, "right", FB.red);
    // Leg below — activates when amplitude crosses threshold
    const active = amp > 0.35;
    const legP = active ? interpolate(frame, [70, 100], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 0;
    ctx.globalAlpha = a * (active ? 0.5 : 0.15); ctx.strokeStyle = active ? FB.teal : FB.text.dim; ctx.lineWidth = 3;
    const swing = legP * Math.PI * 0.25;
    ctx.beginPath(); ctx.moveTo(W / 2, H * 0.72);
    ctx.lineTo(W / 2 + Math.sin(swing) * 30, H * 0.72 + 25); ctx.stroke();
    drawFBText(ctx, active ? "leg pulls" : "waiting", W / 2, H * 0.92, 11, a, "center", active ? FB.green : FB.text.dim);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V9: Gate metaphor — signal fills, gate opens, leg falls through ----------
const V9: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 120);
    const cx = W / 2;
    // Signal pressure filling from top
    const fillP = interpolate(frame, [10, 55], [0, 0.9], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = a * 0.15; ctx.fillStyle = FB.gold;
    ctx.fillRect(cx - 20, H * 0.08, 40, fillP * H * 0.35);
    drawFBText(ctx, "signal", cx, H * 0.05, 8, a, "center", FB.gold);
    // Gate / barrier
    const gateOpen = fillP > 0.7;
    const gateP = gateOpen ? interpolate(frame, [55, 70], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 0;
    const gateY = H * 0.45;
    // Gate doors slide apart
    ctx.globalAlpha = a * 0.5; ctx.fillStyle = FB.red;
    ctx.fillRect(cx - 25 - gateP * 15, gateY, 20, 5);
    ctx.fillRect(cx + 5 + gateP * 15, gateY, 20, 5);
    if (!gateOpen) {
      ctx.fillRect(cx - 5, gateY, 10, 5);
    }
    drawFBText(ctx, "threshold gate", cx, gateY - 8, 7, a * 0.5, "center", FB.red);
    // Leg descends through gate once open
    const legDrop = gateOpen ? interpolate(frame, [68, 100], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 0;
    const legY = gateY + 10 + legDrop * H * 0.25;
    ctx.globalAlpha = a * 0.5; ctx.strokeStyle = FB.teal; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(cx, gateY + 10); ctx.lineTo(cx, legY); ctx.stroke();
    drawFBNode(ctx, cx, legY, 7, 3, a * Math.max(0.3, legDrop), frame);
    drawFBText(ctx, gateOpen ? "leg activated" : "building up...", cx, H * 0.88, 10, a, "center", gateOpen ? FB.green : FB.text.dim);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

export const VARIANTS_FB_050: VariantDef[] = [
  { id: "fb-050-v1", label: "Signal bar crosses threshold, leg snaps", component: V1 },
  { id: "fb-050-v2", label: "Gauge needle rises past red line", component: V2 },
  { id: "fb-050-v3", label: "Weak vs strong signal comparison", component: V3 },
  { id: "fb-050-v4", label: "Stacked bars, only top one crosses", component: V4 },
  { id: "fb-050-v5", label: "Vertical thermometer pops at threshold", component: V5 },
  { id: "fb-050-v6", label: "Counter ticks up, flashes green", component: V6 },
  { id: "fb-050-v7", label: "Three-stage signal to engine to leg", component: V7 },
  { id: "fb-050-v8", label: "Waveform amplitude grows to threshold", component: V8 },
  { id: "fb-050-v9", label: "Gate opens when signal pressure builds", component: V9 },
];
