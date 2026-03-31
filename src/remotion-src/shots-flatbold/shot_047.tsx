import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantDef, VariantProps } from "../types";
import { FB, seeded, drawFBBg, drawFBNode, drawFBEdge, drawFBText, drawFBCounter, fadeInOut, cellHSL, drawFBColorEdge } from "./flatbold-kit";

/* Shot 47 — "It runs inside a physics engine called MuJoCo that simulates gravity and friction." — 150 frames */

// ---------- V1: Cell falls under gravity, bounces on friction ground ----------
const V1: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 150);
    const groundY = H * 0.78;
    // Ground with friction hatching
    ctx.globalAlpha = a * 0.3;
    ctx.strokeStyle = FB.gold;
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(0, groundY); ctx.lineTo(W, groundY); ctx.stroke();
    for (let i = 0; i < 20; i++) {
      const hx = W * 0.05 + i * W * 0.048;
      ctx.beginPath(); ctx.moveTo(hx, groundY); ctx.lineTo(hx - 6, groundY + 8); ctx.stroke();
    }
    // Falling cell with bounce
    const fallP = interpolate(frame, [20, 80], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const bounce = Math.abs(Math.sin(fallP * Math.PI * 2.5)) * (1 - fallP) * 0.6;
    const cellY = H * 0.12 + fallP * (groundY - H * 0.12 - 18) - bounce * H * 0.25;
    drawFBNode(ctx, W / 2, cellY, 14, 4, a, frame);
    // Gravity arrow
    const arrowA = interpolate(frame, [5, 25], [0, 1], { extrapolateRight: "clamp" });
    ctx.globalAlpha = a * arrowA * 0.6;
    ctx.strokeStyle = FB.red; ctx.fillStyle = FB.red; ctx.lineWidth = 2.5;
    const ax = W * 0.35;
    ctx.beginPath(); ctx.moveTo(ax, cellY - 15); ctx.lineTo(ax, cellY + 25); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(ax - 6, cellY + 18); ctx.lineTo(ax, cellY + 25); ctx.lineTo(ax + 6, cellY + 18); ctx.fill();
    drawFBText(ctx, "g", ax - 12, cellY + 5, 12, a * arrowA, "center", FB.red);
    // Labels
    const fricP = interpolate(frame, [85, 110], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "friction", W / 2, groundY + 18, 10, a * fricP, "center", FB.gold);
    const labelP = interpolate(frame, [100, 125], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "MuJoCo", W / 2, H * 0.06, 14, a * labelP, "center", FB.teal);
    drawFBText(ctx, "physics engine", W / 2, H * 0.13, 8, a * labelP, "center", FB.text.dim);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V2: Force vectors converge on a central body ----------
const V2: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 150);
    const cx = W / 2, cy = H * 0.45;
    drawFBNode(ctx, cx, cy, 16, 5, a, frame);
    const forces = [
      { label: "GRAVITY", angle: Math.PI / 2, len: 50, color: FB.red, delay: 10 },
      { label: "FRICTION", angle: -Math.PI * 0.1, len: 40, color: FB.gold, delay: 25 },
      { label: "CONTACT", angle: Math.PI * 1.2, len: 35, color: FB.teal, delay: 40 },
      { label: "TORQUE", angle: -Math.PI * 0.6, len: 38, color: FB.purple, delay: 55 },
    ];
    for (const f of forces) {
      const fp = interpolate(frame, [f.delay, f.delay + 25], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      if (fp <= 0) continue;
      const ex = cx + Math.cos(f.angle) * f.len * fp;
      const ey = cy + Math.sin(f.angle) * f.len * fp;
      ctx.globalAlpha = a * fp * 0.7;
      ctx.strokeStyle = f.color; ctx.fillStyle = f.color; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(ex, ey); ctx.stroke();
      const ux = Math.cos(f.angle), uy = Math.sin(f.angle);
      ctx.beginPath();
      ctx.moveTo(ex, ey);
      ctx.lineTo(ex - ux * 6 - uy * 4, ey - uy * 6 + ux * 4);
      ctx.lineTo(ex - ux * 6 + uy * 4, ey - uy * 6 - ux * 4);
      ctx.closePath(); ctx.fill();
      drawFBText(ctx, f.label, ex + ux * 14, ey + uy * 14, 7, a * fp, "center", f.color);
    }
    drawFBText(ctx, "MuJoCo", W / 2, H * 0.88, 14, a, "center", FB.teal);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V3: Objects fall and slide across a grid floor ----------
const V3: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 150);
    const groundY = H * 0.72;
    // Perspective grid floor
    ctx.globalAlpha = a * 0.06; ctx.strokeStyle = FB.teal; ctx.lineWidth = 0.5;
    for (let gx = 0; gx < W; gx += W / 12) {
      ctx.beginPath(); ctx.moveTo(gx, groundY); ctx.lineTo(gx - 20, H); ctx.stroke();
    }
    for (let gy = groundY; gy < H; gy += H * 0.06) {
      ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(W, gy); ctx.stroke();
    }
    // Staggered falling items that slide after landing
    const items = [
      { x: W * 0.25, ci: 0, delay: 5, r: 10 },
      { x: W * 0.5, ci: 3, delay: 25, r: 12 },
      { x: W * 0.75, ci: 5, delay: 45, r: 9 },
    ];
    for (const it of items) {
      const fp = interpolate(frame, [it.delay, it.delay + 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const iy = H * 0.08 + Math.min(1, fp * 1.2) * (groundY - H * 0.08 - it.r);
      const slideP = interpolate(frame, [it.delay + 45, it.delay + 80], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      drawFBNode(ctx, it.x + slideP * W * 0.06, Math.min(iy, groundY - it.r), it.r, it.ci, a, frame);
    }
    ctx.globalAlpha = a * 0.3; ctx.strokeStyle = FB.gold; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(0, groundY); ctx.lineTo(W, groundY); ctx.stroke();
    drawFBText(ctx, "MuJoCo", W / 2, H * 0.06, 14, a, "center", FB.teal);
    drawFBText(ctx, "gravity + friction", W / 2, H * 0.9, 9, a, "center", FB.text.dim);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V4: Two interlocking gears labeled gravity and friction ----------
const V4: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 150);
    const drawGear = (cx: number, cy: number, r: number, teeth: number, rot: number, ci: number) => {
      const [h, s, l] = cellHSL(ci);
      ctx.globalAlpha = a * 0.4; ctx.strokeStyle = `hsl(${h},${s}%,${l}%)`; ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (let i = 0; i <= teeth * 2; i++) {
        const ang = rot + (i / (teeth * 2)) * Math.PI * 2;
        const tr = i % 2 === 0 ? r : r * 0.78;
        const px = cx + Math.cos(ang) * tr, py = cy + Math.sin(ang) * tr;
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.closePath(); ctx.stroke();
      ctx.beginPath(); ctx.arc(cx, cy, r * 0.2, 0, Math.PI * 2); ctx.stroke();
    };
    drawGear(W * 0.35, H * 0.4, 30, 8, frame * 0.02, 4);
    drawGear(W * 0.62, H * 0.4, 24, 6, -frame * 0.025, 1);
    const lp = interpolate(frame, [40, 70], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "MuJoCo", W / 2, H * 0.1, 16, a * lp, "center", FB.teal);
    drawFBText(ctx, "physics engine", W / 2, H * 0.18, 9, a * lp, "center", FB.text.dim);
    const gfP = interpolate(frame, [80, 110], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "gravity", W * 0.3, H * 0.72, 11, a * gfP, "center", FB.red);
    drawFBText(ctx, "friction", W * 0.7, H * 0.72, 11, a * gfP, "center", FB.gold);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V5: Parabolic fall with g=9.81 annotation ----------
const V5: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 150);
    const fallT = interpolate(frame, [15, 75], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const objY = H * 0.1 + fallT * fallT * H * 0.6;
    const cx = W / 2;
    drawFBNode(ctx, cx, objY, 12, 3, a, frame);
    // Dotted trail
    for (let i = 1; i < 8; i++) {
      const tt = Math.max(0, fallT - i * 0.08);
      const ty = H * 0.1 + tt * tt * H * 0.6;
      if (ty < objY - 5) {
        ctx.globalAlpha = a * 0.15 * (1 - i / 8); ctx.fillStyle = FB.text.dim;
        ctx.beginPath(); ctx.arc(cx, ty, 2, 0, Math.PI * 2); ctx.fill();
      }
    }
    // g arrow
    ctx.globalAlpha = a * 0.5; ctx.strokeStyle = FB.red; ctx.fillStyle = FB.red; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(W * 0.72, H * 0.2); ctx.lineTo(W * 0.72, H * 0.45); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(W * 0.72 - 5, H * 0.42); ctx.lineTo(W * 0.72, H * 0.45); ctx.lineTo(W * 0.72 + 5, H * 0.42); ctx.fill();
    drawFBText(ctx, "g = 9.81", W * 0.72 + 12, H * 0.33, 8, a * 0.6, "left", FB.red);
    // Ground + friction
    const groundY = H * 0.75;
    ctx.globalAlpha = a * 0.25; ctx.strokeStyle = FB.gold; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(W * 0.1, groundY); ctx.lineTo(W * 0.9, groundY); ctx.stroke();
    const fricP = interpolate(frame, [80, 105], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "friction", cx, groundY + 14, 9, a * fricP, "center", FB.gold);
    drawFBText(ctx, "MuJoCo", cx, H * 0.92, 12, a, "center", FB.teal);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V6: Real vs Simulated side by side ----------
const V6: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 150);
    // Divider
    ctx.globalAlpha = a * 0.15; ctx.strokeStyle = FB.text.dim;
    ctx.setLineDash([3, 3]); ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(W / 2, H * 0.15); ctx.lineTo(W / 2, H * 0.85); ctx.stroke();
    ctx.setLineDash([]);
    const lp = interpolate(frame, [5, 25], [0, 1], { extrapolateRight: "clamp" });
    drawFBText(ctx, "REAL", W * 0.25, H * 0.08, 11, a * lp, "center", FB.text.dim);
    drawFBText(ctx, "SIMULATED", W * 0.75, H * 0.08, 11, a * lp, "center", FB.teal);
    const sides = [W * 0.25, W * 0.75];
    for (let si = 0; si < 2; si++) {
      const sx = sides[si], delay = si * 15;
      const sp = interpolate(frame, [20 + delay, 50 + delay], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const ny = H * 0.25 + sp * H * 0.35;
      drawFBNode(ctx, sx, ny, 10, si === 0 ? 0 : 4, a, frame);
      ctx.globalAlpha = a * sp * 0.5; ctx.strokeStyle = FB.red; ctx.fillStyle = FB.red; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(sx + 18, H * 0.3); ctx.lineTo(sx + 18, H * 0.5); ctx.stroke();
      drawFBText(ctx, "g", sx + 26, H * 0.4, 8, a * sp, "center", FB.red);
      ctx.globalAlpha = a * 0.2; ctx.strokeStyle = FB.gold;
      ctx.beginPath(); ctx.moveTo(sx - 35, H * 0.68); ctx.lineTo(sx + 35, H * 0.68); ctx.stroke();
    }
    const eqP = interpolate(frame, [60, 80], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "=", W / 2, H * 0.45, 20, a * eqP, "center", FB.green);
    drawFBText(ctx, "MuJoCo", W / 2, H * 0.88, 12, a, "center", FB.teal);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V7: Pendulum swinging under simulated gravity ----------
const V7: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 150);
    const pivotX = W / 2, pivotY = H * 0.15, armLen = H * 0.4;
    const startP = interpolate(frame, [10, 15], [0, 1], { extrapolateRight: "clamp" });
    const damping = Math.exp(-frame * 0.012);
    const angle = Math.sin(frame * 0.06) * 0.7 * damping * startP;
    const bx = pivotX + Math.sin(angle) * armLen;
    const by = pivotY + Math.cos(angle) * armLen;
    ctx.globalAlpha = a * 0.5; ctx.fillStyle = FB.text.dim;
    ctx.beginPath(); ctx.arc(pivotX, pivotY, 3, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = FB.teal; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(pivotX, pivotY); ctx.lineTo(bx, by); ctx.stroke();
    drawFBNode(ctx, bx, by, 14, 4, a, frame);
    // Gravity arrow from bob
    ctx.globalAlpha = a * 0.4; ctx.strokeStyle = FB.red; ctx.fillStyle = FB.red; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(bx, by + 16); ctx.lineTo(bx, by + 38); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(bx - 4, by + 34); ctx.lineTo(bx, by + 38); ctx.lineTo(bx + 4, by + 34); ctx.fill();
    drawFBText(ctx, "gravity", bx + 12, by + 30, 7, a * 0.6, "left", FB.red);
    const fP = interpolate(frame, [50, 75], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "friction", pivotX + 10, pivotY - 8, 7, a * fP * 0.5, "left", FB.gold);
    drawFBText(ctx, "MuJoCo", W / 2, H * 0.88, 14, a, "center", FB.teal);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V8: Two cells collide and bounce apart ----------
const V8: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 150);
    const cy = H * 0.42;
    const approach = interpolate(frame, [10, 55], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const recoil = interpolate(frame, [55, 100], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const x1 = W * 0.1 + approach * W * 0.32 - recoil * W * 0.15;
    const x2 = W * 0.9 - approach * W * 0.32 + recoil * W * 0.15;
    drawFBNode(ctx, x1, cy, 14, 0, a, frame);
    drawFBNode(ctx, x2, cy, 14, 5, a, frame);
    // Impact flash
    if (frame >= 52 && frame <= 65) {
      const flashA = 1 - (frame - 52) / 13;
      ctx.globalAlpha = a * flashA * 0.4; ctx.fillStyle = "#fff";
      ctx.beginPath(); ctx.arc(W / 2, cy, 8 + (frame - 52) * 2, 0, Math.PI * 2); ctx.fill();
    }
    // Force arrows post-collision
    if (frame >= 55) {
      const arrP = interpolate(frame, [55, 80], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      ctx.globalAlpha = a * (1 - arrP) * 0.6; ctx.strokeStyle = FB.red; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(W / 2 - 5, cy); ctx.lineTo(W / 2 - 20, cy); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(W / 2 + 5, cy); ctx.lineTo(W / 2 + 20, cy); ctx.stroke();
    }
    drawFBText(ctx, "MuJoCo", W / 2, H * 0.12, 14, a, "center", FB.teal);
    drawFBText(ctx, "contact + friction", W / 2, H * 0.78, 10, a, "center", FB.text.dim);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V9: Title card with raining physics symbols ----------
const V9: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 150);
    const rng = seeded(4700);
    const symbols = ["F", "m", "a", "g", "N", "v"];
    for (let i = 0; i < 18; i++) {
      const sx = rng() * W, speed = 0.3 + rng() * 0.7;
      const sy = (rng() * H + frame * speed * 1.2) % (H * 1.1) - H * 0.05;
      ctx.globalAlpha = a * 0.15; ctx.fillStyle = FB.text.dim;
      ctx.font = "bold 10px 'Courier New', monospace"; ctx.textAlign = "center";
      ctx.fillText(symbols[Math.floor(rng() * symbols.length)], sx, sy);
    }
    const tp = interpolate(frame, [15, 45], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "MuJoCo", W / 2, H * 0.38, 22, a * tp, "center", FB.teal);
    drawFBText(ctx, "physics engine", W / 2, H * 0.5, 10, a * tp, "center", FB.text.dim);
    const kp = interpolate(frame, [60, 90], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBNode(ctx, W * 0.3, H * 0.7, 8, 0, a * kp, frame);
    drawFBText(ctx, "gravity", W * 0.3, H * 0.8, 10, a * kp, "center", FB.red);
    drawFBNode(ctx, W * 0.7, H * 0.7, 8, 1, a * kp, frame);
    drawFBText(ctx, "friction", W * 0.7, H * 0.8, 10, a * kp, "center", FB.gold);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

export const VARIANTS_FB_047: VariantDef[] = [
  { id: "fb-047-v1", label: "Cell falls under gravity, bounces on friction ground", component: V1 },
  { id: "fb-047-v2", label: "Force vectors converge on central body", component: V2 },
  { id: "fb-047-v3", label: "Objects fall and slide on grid floor", component: V3 },
  { id: "fb-047-v4", label: "Interlocking gears for gravity and friction", component: V4 },
  { id: "fb-047-v5", label: "Parabolic fall with g annotation", component: V5 },
  { id: "fb-047-v6", label: "Real vs simulated side by side", component: V6 },
  { id: "fb-047-v7", label: "Pendulum swinging with damping", component: V7 },
  { id: "fb-047-v8", label: "Two cells collide and bounce", component: V8 },
  { id: "fb-047-v9", label: "Title card with raining physics symbols", component: V9 },
];
