import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantDef, VariantProps } from "../types";
import { FB, seeded, drawFBBg, drawFBNode, drawFBEdge, drawFBText, drawFBCounter, fadeInOut, cellHSL, drawFBColorEdge } from "./flatbold-kit";

/* Shot 51 — "The brain picks a behavior, the legs move, and as the fly walks, sensors feed the world back into the brain every tenth of a second." — 210 frames */

// ---------- V1: Circular loop — BRAIN → LEGS → WORLD → SENSORS → BRAIN ----------
const V1: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 210);
    const cx = W / 2, cy = H * 0.45, r = Math.min(W, H) * 0.26;
    const nodes = [
      { label: "BRAIN", angle: -Math.PI / 2, ci: 6, color: FB.purple },
      { label: "LEGS", angle: 0, ci: 3, color: FB.green },
      { label: "WORLD", angle: Math.PI / 2, ci: 1, color: FB.gold },
      { label: "SENSORS", angle: Math.PI, ci: 5, color: FB.teal },
    ];
    // Reveal nodes staggered
    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i];
      const np = interpolate(frame, [10 + i * 20, 30 + i * 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const nx = cx + Math.cos(n.angle) * r;
      const ny = cy + Math.sin(n.angle) * r;
      drawFBNode(ctx, nx, ny, 12, n.ci, a * np, frame);
      drawFBText(ctx, n.label, nx, ny + (n.angle > 0 ? 18 : -18), 8, a * np, "center", n.color);
      // Edge to next
      const next = nodes[(i + 1) % nodes.length];
      const nx2 = cx + Math.cos(next.angle) * r;
      const ny2 = cy + Math.sin(next.angle) * r;
      ctx.globalAlpha = a * np * 0.15; ctx.strokeStyle = n.color; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(nx, ny); ctx.lineTo(nx2, ny2); ctx.stroke();
    }
    // Orbiting pulse dot
    const orbitP = interpolate(frame, [90, 200], [0, 2], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const orbAngle = -Math.PI / 2 + orbitP * Math.PI;
    const orbX = cx + Math.cos(orbAngle) * r;
    const orbY = cy + Math.sin(orbAngle) * r;
    ctx.globalAlpha = a * 0.7; ctx.fillStyle = FB.gold;
    ctx.beginPath(); ctx.arc(orbX, orbY, 4, 0, Math.PI * 2); ctx.fill();
    // "0.1s" label
    const timeP = interpolate(frame, [140, 170], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "every 0.1s", cx, cy, 9, a * timeP, "center", FB.text.dim);
    drawFBText(ctx, "closed loop", cx, H * 0.88, 10, a, "center", FB.text.dim);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V2: Linear flow chart left to right, then arrow wraps back ----------
const V2: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 210);
    const steps = [
      { label: "BRAIN", x: W * 0.12, ci: 6, color: FB.purple },
      { label: "BEHAVIOR", x: W * 0.35, ci: 3, color: FB.green },
      { label: "LEGS MOVE", x: W * 0.58, ci: 4, color: FB.teal },
      { label: "SENSORS", x: W * 0.82, ci: 5, color: FB.blue },
    ];
    const cy = H * 0.4;
    for (let i = 0; i < steps.length; i++) {
      const s = steps[i];
      const sp = interpolate(frame, [10 + i * 18, 28 + i * 18], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      drawFBNode(ctx, s.x, cy, 10, s.ci, a * sp, frame);
      drawFBText(ctx, s.label, s.x, cy + 18, 7, a * sp, "center", s.color);
      if (i < steps.length - 1) {
        ctx.globalAlpha = a * sp * 0.2; ctx.strokeStyle = FB.gold; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(s.x + 12, cy); ctx.lineTo(steps[i + 1].x - 12, cy); ctx.stroke();
        ctx.fillStyle = FB.gold;
        ctx.beginPath();
        const ax = steps[i + 1].x - 12;
        ctx.moveTo(ax, cy); ctx.lineTo(ax - 5, cy - 3); ctx.lineTo(ax - 5, cy + 3); ctx.fill();
      }
    }
    // Feedback arrow wrapping back from SENSORS to BRAIN (below)
    const fbP = interpolate(frame, [90, 140], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (fbP > 0) {
      ctx.globalAlpha = a * fbP * 0.25; ctx.strokeStyle = FB.blue; ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(W * 0.82, cy + 12);
      ctx.quadraticCurveTo(W / 2, H * 0.75, W * 0.12, cy + 12);
      ctx.stroke();
      // Arrowhead at brain
      ctx.fillStyle = FB.blue;
      ctx.beginPath(); ctx.moveTo(W * 0.12, cy + 12); ctx.lineTo(W * 0.15, cy + 8); ctx.lineTo(W * 0.15, cy + 16); ctx.fill();
      drawFBText(ctx, "every 0.1s", W / 2, H * 0.72, 9, a * fbP, "center", FB.blue);
    }
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V3: Clock ticking at center, pulses radiate out then return ----------
const V3: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 210);
    const cx = W / 2, cy = H * 0.42;
    // Clock face
    ctx.globalAlpha = a * 0.2; ctx.strokeStyle = FB.text.dim; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(cx, cy, 20, 0, Math.PI * 2); ctx.stroke();
    // Clock hand
    const handAngle = (frame / 210) * Math.PI * 6 - Math.PI / 2;
    ctx.globalAlpha = a * 0.6; ctx.strokeStyle = FB.gold; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(handAngle) * 16, cy + Math.sin(handAngle) * 16);
    ctx.stroke();
    drawFBText(ctx, "0.1s", cx, cy + 28, 8, a, "center", FB.gold);
    // Outward pulse (brain → legs → world)
    const outP = interpolate(frame, [30, 90], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const outR = 25 + outP * 45;
    ctx.globalAlpha = a * (1 - outP) * 0.2; ctx.strokeStyle = FB.purple; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(cx, cy, outR, -Math.PI * 0.7, -Math.PI * 0.3); ctx.stroke();
    // Labels around
    const labels = [
      { text: "BRAIN", angle: -Math.PI / 2, delay: 15, color: FB.purple },
      { text: "LEGS", angle: -Math.PI * 0.1, delay: 45, color: FB.green },
      { text: "WORLD", angle: Math.PI * 0.4, delay: 75, color: FB.gold },
      { text: "SENSORS", angle: Math.PI * 0.85, delay: 105, color: FB.teal },
    ];
    for (const lb of labels) {
      const lp = interpolate(frame, [lb.delay, lb.delay + 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const lx = cx + Math.cos(lb.angle) * 60;
      const ly = cy + Math.sin(lb.angle) * 45;
      drawFBText(ctx, lb.text, lx, ly, 8, a * lp, "center", lb.color);
    }
    // Return pulse (world → brain)
    const retP = interpolate(frame, [120, 180], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const retR = 70 - retP * 45;
    ctx.globalAlpha = a * retP * (1 - retP) * 0.3; ctx.strokeStyle = FB.teal; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(cx, cy, retR, Math.PI * 0.3, Math.PI * 0.9); ctx.stroke();
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V4: Vertical cascade — brain top, legs mid, sensors bottom, arrow up ----------
const V4: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 210);
    const cx = W * 0.4;
    const rows = [
      { label: "BRAIN picks behavior", y: H * 0.12, ci: 6, color: FB.purple },
      { label: "LEGS move", y: H * 0.35, ci: 3, color: FB.green },
      { label: "FLY walks", y: H * 0.55, ci: 4, color: FB.teal },
      { label: "SENSORS feed back", y: H * 0.75, ci: 5, color: FB.blue },
    ];
    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      const rp = interpolate(frame, [10 + i * 25, 30 + i * 25], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      drawFBNode(ctx, W * 0.15, r.y, 9, r.ci, a * rp, frame);
      drawFBText(ctx, r.label, W * 0.28, r.y, 8, a * rp, "left", r.color);
      // Down arrow
      if (i < rows.length - 1) {
        ctx.globalAlpha = a * rp * 0.2; ctx.strokeStyle = FB.text.dim; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(W * 0.15, r.y + 12); ctx.lineTo(W * 0.15, rows[i + 1].y - 12); ctx.stroke();
      }
    }
    // Return arrow from bottom to top on right side
    const retP = interpolate(frame, [120, 175], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (retP > 0) {
      ctx.globalAlpha = a * retP * 0.25; ctx.strokeStyle = FB.blue; ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(W * 0.2, H * 0.78);
      ctx.quadraticCurveTo(W * 0.85, H * 0.45, W * 0.2, H * 0.12);
      ctx.stroke();
      drawFBText(ctx, "every 0.1s", W * 0.78, H * 0.45, 8, a * retP, "center", FB.blue);
    }
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V5: Ping-pong — signal bounces brain→body→brain repeatedly ----------
const V5: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 210);
    const bx = W * 0.2, lx = W * 0.8, cy = H * 0.42;
    drawFBNode(ctx, bx, cy, 14, 6, a, frame);
    drawFBText(ctx, "BRAIN", bx, cy - 22, 9, a, "center", FB.purple);
    drawFBNode(ctx, lx, cy, 14, 3, a, frame);
    drawFBText(ctx, "BODY", lx, cy - 22, 9, a, "center", FB.green);
    // Wire
    ctx.globalAlpha = a * 0.12; ctx.strokeStyle = FB.text.dim; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(bx + 16, cy); ctx.lineTo(lx - 16, cy); ctx.stroke();
    // Ping-pong balls
    const period = 60; // frames per round trip
    const bounces = 3;
    for (let b = 0; b < bounces; b++) {
      const start = 20 + b * period;
      const half = period / 2;
      const outP = interpolate(frame, [start, start + half], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const retP = interpolate(frame, [start + half, start + period], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      let px: number;
      if (outP > 0 && outP < 1) {
        px = bx + 16 + outP * (lx - bx - 32);
        ctx.globalAlpha = a * 0.7; ctx.fillStyle = FB.gold;
        ctx.beginPath(); ctx.arc(px, cy, 4, 0, Math.PI * 2); ctx.fill();
      }
      if (retP > 0 && retP < 1) {
        px = lx - 16 - retP * (lx - bx - 32);
        ctx.globalAlpha = a * 0.7; ctx.fillStyle = FB.teal;
        ctx.beginPath(); ctx.arc(px, cy, 4, 0, Math.PI * 2); ctx.fill();
      }
    }
    drawFBText(ctx, "behavior", W * 0.5, cy - 10, 7, a * 0.4, "center", FB.gold);
    drawFBText(ctx, "sensors", W * 0.5, cy + 10, 7, a * 0.4, "center", FB.teal);
    drawFBText(ctx, "every 0.1 seconds", W / 2, H * 0.78, 10, a, "center", FB.text.dim);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V6: Text stages appear sequentially with arrows ----------
const V6: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 210);
    const phrases = [
      { text: "brain picks behavior", y: H * 0.15, delay: 5, color: FB.purple },
      { text: "legs move", y: H * 0.3, delay: 35, color: FB.green },
      { text: "fly walks", y: H * 0.45, delay: 65, color: FB.teal },
      { text: "sensors detect world", y: H * 0.6, delay: 95, color: FB.blue },
      { text: "feed back to brain", y: H * 0.75, delay: 125, color: FB.gold },
    ];
    for (let i = 0; i < phrases.length; i++) {
      const p = phrases[i];
      const pp = interpolate(frame, [p.delay, p.delay + 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      drawFBText(ctx, p.text, W / 2, p.y, 10, a * pp, "center", p.color);
      if (i < phrases.length - 1) {
        ctx.globalAlpha = a * pp * 0.2; ctx.strokeStyle = FB.text.dim; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(W / 2, p.y + 8); ctx.lineTo(W / 2, phrases[i + 1].y - 8); ctx.stroke();
      }
    }
    // Repeat arrow curving back
    const repP = interpolate(frame, [155, 195], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (repP > 0) {
      ctx.globalAlpha = a * repP * 0.2; ctx.strokeStyle = FB.gold; ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(W * 0.6, H * 0.78);
      ctx.quadraticCurveTo(W * 0.85, H * 0.45, W * 0.6, H * 0.12);
      ctx.stroke();
      drawFBText(ctx, "0.1s", W * 0.82, H * 0.45, 9, a * repP, "center", FB.gold);
    }
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V7: Conveyor belt loop — items travel around rectangle ----------
const V7: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 210);
    // Rectangle path
    const l = W * 0.15, r2 = W * 0.85, t = H * 0.2, b = H * 0.7;
    ctx.globalAlpha = a * 0.12; ctx.strokeStyle = FB.text.dim; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.rect(l, t, r2 - l, b - t); ctx.stroke();
    // Corner labels
    const corners = [
      { x: l, y: t, label: "BRAIN", color: FB.purple },
      { x: r2, y: t, label: "LEGS", color: FB.green },
      { x: r2, y: b, label: "WORLD", color: FB.gold },
      { x: l, y: b, label: "SENSORS", color: FB.teal },
    ];
    for (let i = 0; i < corners.length; i++) {
      const c = corners[i];
      const cp = interpolate(frame, [5 + i * 15, 20 + i * 15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      drawFBNode(ctx, c.x, c.y, 8, i + 3, a * cp, frame);
      const tx = c.x + (c.x < W / 2 ? -5 : 5);
      drawFBText(ctx, c.label, tx, c.y + (c.y < H / 2 ? -14 : 14), 7, a * cp, c.x < W / 2 ? "right" : "left", c.color);
    }
    // Traveling dot around the perimeter
    const perimeter = 2 * (r2 - l) + 2 * (b - t);
    const loopP = ((frame - 60) / 140) % 1;
    if (frame > 60) {
      let dist = loopP * perimeter;
      let px: number, py: number;
      if (dist < r2 - l) { px = l + dist; py = t; }
      else if (dist < (r2 - l) + (b - t)) { px = r2; py = t + (dist - (r2 - l)); }
      else if (dist < 2 * (r2 - l) + (b - t)) { px = r2 - (dist - (r2 - l) - (b - t)); py = b; }
      else { px = l; py = b - (dist - 2 * (r2 - l) - (b - t)); }
      ctx.globalAlpha = a * 0.7; ctx.fillStyle = FB.gold;
      ctx.beginPath(); ctx.arc(px, py, 4, 0, Math.PI * 2); ctx.fill();
    }
    drawFBText(ctx, "every 0.1s", W / 2, H * 0.45, 9, a, "center", FB.text.dim);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V8: Infinity symbol traced by a pulse ----------
const V8: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 210);
    const cx = W / 2, cy = H * 0.42;
    const rx = W * 0.28, ry = H * 0.18;
    // Infinity shape
    ctx.globalAlpha = a * 0.12; ctx.strokeStyle = FB.text.dim; ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let t = 0; t < Math.PI * 2; t += 0.05) {
      const x = cx + rx * Math.sin(t) / (1 + Math.cos(t) * Math.cos(t));
      const y = cy + ry * Math.sin(t) * Math.cos(t) / (1 + Math.cos(t) * Math.cos(t));
      if (t === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.closePath(); ctx.stroke();
    // Labels at loop centers
    drawFBText(ctx, "BRAIN", cx - rx * 0.5, cy, 9, a, "center", FB.purple);
    drawFBText(ctx, "BODY", cx + rx * 0.5, cy, 9, a, "center", FB.green);
    // Pulse traveling the infinity path
    const speed = frame * 0.025;
    const px = cx + rx * Math.sin(speed) / (1 + Math.cos(speed) * Math.cos(speed));
    const py = cy + ry * Math.sin(speed) * Math.cos(speed) / (1 + Math.cos(speed) * Math.cos(speed));
    ctx.globalAlpha = a * 0.7; ctx.fillStyle = FB.gold;
    ctx.beginPath(); ctx.arc(px, py, 5, 0, Math.PI * 2); ctx.fill();
    // Trail
    for (let i = 1; i < 6; i++) {
      const ts = speed - i * 0.12;
      const tx = cx + rx * Math.sin(ts) / (1 + Math.cos(ts) * Math.cos(ts));
      const ty = cy + ry * Math.sin(ts) * Math.cos(ts) / (1 + Math.cos(ts) * Math.cos(ts));
      ctx.globalAlpha = a * 0.15 * (1 - i / 6); ctx.fillStyle = FB.gold;
      ctx.beginPath(); ctx.arc(tx, ty, 3, 0, Math.PI * 2); ctx.fill();
    }
    drawFBText(ctx, "every 0.1 seconds", cx, H * 0.82, 9, a, "center", FB.text.dim);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V9: Timeline with feedback arrows — 0ms, 100ms, 200ms ticks ----------
const V9: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 210);
    // Timeline axis
    ctx.globalAlpha = a * 0.2; ctx.strokeStyle = FB.text.dim; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(W * 0.05, H * 0.45); ctx.lineTo(W * 0.95, H * 0.45); ctx.stroke();
    const ticks = [0, 100, 200, 300];
    for (let i = 0; i < ticks.length; i++) {
      const tx = W * 0.1 + i * W * 0.25;
      const tp = interpolate(frame, [10 + i * 20, 25 + i * 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      ctx.globalAlpha = a * tp * 0.3; ctx.strokeStyle = FB.text.dim;
      ctx.beginPath(); ctx.moveTo(tx, H * 0.42); ctx.lineTo(tx, H * 0.48); ctx.stroke();
      drawFBText(ctx, ticks[i] + "ms", tx, H * 0.52, 7, a * tp, "center", FB.text.dim);
    }
    // Events: brain fires, legs respond, sensors return
    const events = [
      { x: W * 0.1, y: H * 0.3, label: "brain fires", color: FB.purple, delay: 20 },
      { x: W * 0.25, y: H * 0.3, label: "legs move", color: FB.green, delay: 50 },
      { x: W * 0.35, y: H * 0.58, label: "sensors", color: FB.teal, delay: 80 },
      { x: W * 0.35, y: H * 0.3, label: "feedback", color: FB.blue, delay: 100 },
    ];
    for (const ev of events) {
      const ep = interpolate(frame, [ev.delay, ev.delay + 18], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      drawFBText(ctx, ev.label, ev.x, ev.y, 8, a * ep, "center", ev.color);
      drawFBNode(ctx, ev.x, H * 0.45, 4, 5, a * ep, frame);
    }
    // Feedback arrow from sensors back up
    const fbP = interpolate(frame, [100, 140], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (fbP > 0) {
      ctx.globalAlpha = a * fbP * 0.2; ctx.strokeStyle = FB.teal; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(W * 0.35, H * 0.55); ctx.quadraticCurveTo(W * 0.42, H * 0.48, W * 0.35, H * 0.35); ctx.stroke();
    }
    drawFBText(ctx, "closed loop: every 0.1s", W / 2, H * 0.85, 9, a, "center", FB.gold);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

export const VARIANTS_FB_051: VariantDef[] = [
  { id: "fb-051-v1", label: "Circular loop with orbiting pulse", component: V1 },
  { id: "fb-051-v2", label: "Linear flow with feedback arrow", component: V2 },
  { id: "fb-051-v3", label: "Clock ticking with radiating pulses", component: V3 },
  { id: "fb-051-v4", label: "Vertical cascade with return arrow", component: V4 },
  { id: "fb-051-v5", label: "Ping-pong signals brain to body", component: V5 },
  { id: "fb-051-v6", label: "Sequential text with loop-back", component: V6 },
  { id: "fb-051-v7", label: "Conveyor belt around rectangle", component: V7 },
  { id: "fb-051-v8", label: "Infinity symbol traced by pulse", component: V8 },
  { id: "fb-051-v9", label: "Timeline with feedback events", component: V9 },
];
