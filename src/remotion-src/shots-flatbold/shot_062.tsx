import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantDef, VariantProps } from "../types";
import { FB, seeded, drawFBBg, drawFBNode, drawFBEdge, drawFBText, drawFBCounter, fadeInOut, cellHSL, drawFBColorEdge } from "./flatbold-kit";

/* Shot 62 — "The fly couldn't even stand up. By attempt 12, it was frozen
   like a statue." — 180 frames (6s) */

// ---------- V1: fly silhouette topples over, "Attempt 12" counter, freeze ----------
const V1: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 180);
    const s = Math.min(W, H) / 360;
    const cx = W / 2, cy = H * 0.4;
    // Fly body as ellipse
    const collapseP = interpolate(frame, [30, 70], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const tiltAngle = collapseP * Math.PI / 3;
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(tiltAngle);
    ctx.globalAlpha = a;
    ctx.fillStyle = FB.teal;
    ctx.beginPath(); ctx.ellipse(0, 0, 18 * s, 10 * s, 0, 0, Math.PI * 2); ctx.fill();
    // Eyes
    ctx.fillStyle = FB.bg;
    ctx.beginPath(); ctx.arc(-6 * s, -4 * s, 3 * s, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(6 * s, -4 * s, 3 * s, 0, Math.PI * 2); ctx.fill();
    // Legs going limp
    ctx.strokeStyle = FB.teal; ctx.lineWidth = 1.5 * s;
    for (let i = 0; i < 3; i++) {
      const legX = -8 * s + i * 8 * s;
      const droop = collapseP * 8 * s;
      ctx.beginPath(); ctx.moveTo(legX, 10 * s); ctx.lineTo(legX - 4 * s, 10 * s + 10 * s + droop); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(legX, 10 * s); ctx.lineTo(legX + 4 * s, 10 * s + 10 * s + droop); ctx.stroke();
    }
    ctx.restore();
    // "CAN'T STAND UP"
    const cantP = interpolate(frame, [70, 90], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "CAN'T STAND UP", cx, H * 0.65, 11 * s, a * cantP, "center", FB.red);
    // Attempt counter
    const attemptP = interpolate(frame, [95, 130], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const attemptNum = Math.floor(interpolate(attemptP, [0, 1], [1, 12]));
    drawFBText(ctx, "ATTEMPT", cx, H * 0.76, 8 * s, a * attemptP, "center", FB.text.dim);
    drawFBCounter(ctx, attemptNum, cx, H * 0.84, 20 * s, FB.gold, a * attemptP);
    // "FROZEN" at end
    const frozenP = interpolate(frame, [140, 165], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "FROZEN LIKE A STATUE", cx, H * 0.94, 10 * s, a * frozenP, "center", FB.blue);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V2: 12 attempts grid — first few wobble, last one frozen solid ----------
const V2: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 180);
    const s = Math.min(W, H) / 360;
    drawFBText(ctx, "12 ATTEMPTS", W / 2, H * 0.05, 9 * s, a, "center", FB.text.dim);
    for (let i = 0; i < 12; i++) {
      const t = interpolate(frame, [5 + i * 8, 15 + i * 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const col = i % 4, row = Math.floor(i / 4);
      const x = W * 0.15 + col * W * 0.22;
      const y = H * 0.16 + row * H * 0.22;
      // Each fly blob
      const isFrozen = i === 11;
      const isCollapsed = i >= 3 && i < 11;
      const colorIdx = isFrozen ? 5 : isCollapsed ? 0 : 4;
      const tilt = isCollapsed ? Math.PI / 4 : isFrozen ? 0 : Math.sin(frame * 0.1 + i) * 0.2;
      ctx.save(); ctx.translate(x, y); ctx.rotate(tilt);
      drawFBNode(ctx, 0, 0, 8 * s, colorIdx, a * t, isFrozen ? 0 : frame);
      ctx.restore();
      // Status
      const status = isFrozen ? "FROZEN" : isCollapsed ? "FELL" : "WOBBLE";
      const statCol = isFrozen ? FB.blue : isCollapsed ? FB.red : FB.gold;
      drawFBText(ctx, `#${i + 1}`, x, y + 12 * s, 5 * s, a * t * 0.5, "center", FB.text.dim);
      drawFBText(ctx, status, x, y + 18 * s, 5 * s, a * t, "center", statCol);
    }
    const endP = interpolate(frame, [130, 160], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "ATTEMPT 12: FROZEN SOLID", W / 2, H * 0.9, 11 * s, a * endP, "center", FB.blue);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V3: fly legs locking up one by one ----------
const V3: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 180);
    const s = Math.min(W, H) / 360;
    const cx = W / 2, cy = H * 0.35;
    // Fly body
    ctx.globalAlpha = a; ctx.fillStyle = FB.teal;
    ctx.beginPath(); ctx.ellipse(cx, cy, 22 * s, 12 * s, 0, 0, Math.PI * 2); ctx.fill();
    // 6 legs
    const legAngles = [-0.8, -0.4, 0, 0.4, 0.8, 1.2];
    legAngles.forEach((baseAngle, i) => {
      const lockFrame = 20 + i * 18;
      const lockP = interpolate(frame, [lockFrame, lockFrame + 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const side = i < 3 ? -1 : 1;
      const legAngle = baseAngle + (1 - lockP) * Math.sin(frame * 0.08 + i) * 0.3;
      const lx = cx + (i < 3 ? -15 : 15) * s;
      const ly = cy + 12 * s;
      const endX = lx + Math.cos(legAngle) * 18 * s * side;
      const endY = ly + Math.abs(Math.sin(legAngle)) * 14 * s + 5 * s;
      ctx.strokeStyle = lockP > 0.5 ? FB.blue : FB.teal;
      ctx.lineWidth = 2 * s; ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(lx, ly); ctx.lineTo(endX, endY); ctx.stroke();
      if (lockP > 0.5) {
        drawFBText(ctx, "LOCKED", endX, endY + 6 * s, 4 * s, a * lockP, "center", FB.blue);
      }
    });
    const frozenP = interpolate(frame, [140, 165], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "ALL LEGS LOCKED", cx, H * 0.72, 11 * s, a * frozenP, "center", FB.blue);
    drawFBText(ctx, "FROZEN LIKE A STATUE", cx, H * 0.85, 12 * s, a * frozenP, "center", FB.blue);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V4: neural activity flatline — "no signal" ----------
const V4: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 180);
    const s = Math.min(W, H) / 360;
    const chartY = H * 0.3, chartH = H * 0.25;
    // Chart box
    ctx.globalAlpha = a * 0.15; ctx.strokeStyle = FB.text.dim; ctx.lineWidth = 1 * s;
    ctx.strokeRect(W * 0.08, chartY, W * 0.84, chartH);
    drawFBText(ctx, "MOTOR OUTPUT", W / 2, chartY - 10 * s, 8 * s, a, "center", FB.text.dim);
    // Signal that flatlines
    const flatP = interpolate(frame, [40, 80], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.beginPath();
    ctx.moveTo(W * 0.1, chartY + chartH * 0.5);
    for (let x = 0; x < 40; x++) {
      const px = W * 0.1 + (x / 40) * W * 0.8;
      const frac = x / 40;
      const alive = Math.sin(x * 0.8) * 0.3 * (1 - flatP * frac);
      const py = chartY + chartH * (0.5 - alive);
      ctx.lineTo(px, py);
    }
    ctx.globalAlpha = a; ctx.strokeStyle = flatP > 0.7 ? FB.blue : FB.teal; ctx.lineWidth = 2 * s;
    ctx.stroke();
    // Flatline label
    const flatLbl = interpolate(frame, [90, 110], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "FLATLINE", W * 0.8, chartY + chartH * 0.5, 9 * s, a * flatLbl, "center", FB.blue);
    // Attempt 12
    const attP = interpolate(frame, [100, 125], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "ATTEMPT 12", W / 2, H * 0.72, 10 * s, a * attP, "center", FB.text.dim);
    drawFBText(ctx, "ZERO MOVEMENT", W / 2, H * 0.82, 12 * s, a * attP, "center", FB.blue);
    drawFBText(ctx, "FROZEN", W / 2, H * 0.92, 14 * s, a * attP, "center", FB.blue);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V5: statue pedestal with frozen fly on top ----------
const V5: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 180);
    const s = Math.min(W, H) / 360;
    const cx = W / 2;
    // Pedestal
    const pedP = interpolate(frame, [10, 35], [0, 1], { extrapolateRight: "clamp" });
    ctx.globalAlpha = a * pedP * 0.3; ctx.fillStyle = FB.text.dim;
    ctx.fillRect(cx - 25 * s, H * 0.55, 50 * s, H * 0.25);
    ctx.globalAlpha = a * pedP * 0.5; ctx.fillStyle = FB.text.dim;
    ctx.fillRect(cx - 30 * s, H * 0.55, 60 * s, 4 * s);
    // Frozen fly blob on pedestal — no wobble (frame=0)
    const flyP = interpolate(frame, [40, 65], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBNode(ctx, cx, H * 0.45, 16 * s, 5, a * flyP, 0); // frame=0 = no animation = frozen
    // Ice crystals around it
    const iceP = interpolate(frame, [70, 100], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const rng = seeded(625);
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const dist = 22 * s + rng() * 8 * s;
      const ix = cx + Math.cos(angle) * dist;
      const iy = H * 0.45 + Math.sin(angle) * dist;
      ctx.globalAlpha = a * iceP * 0.5; ctx.fillStyle = FB.blue;
      ctx.beginPath();
      ctx.moveTo(ix, iy - 3 * s); ctx.lineTo(ix + 2 * s, iy); ctx.lineTo(ix, iy + 3 * s); ctx.lineTo(ix - 2 * s, iy);
      ctx.closePath(); ctx.fill();
    }
    drawFBText(ctx, "ATTEMPT #12", cx, H * 0.83, 9 * s, a * iceP, "center", FB.text.dim);
    const endP = interpolate(frame, [110, 145], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "FROZEN LIKE A STATUE", cx, H * 0.92, 12 * s, a * endP, "center", FB.blue);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V6: motor signals bar chart all dropping to zero ----------
const V6: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 180);
    const s = Math.min(W, H) / 360;
    const labels = ["L1", "L2", "L3", "R1", "R2", "R3"];
    const baseline = H * 0.65;
    const barW = W * 0.1;
    drawFBText(ctx, "MOTOR COMMANDS", W / 2, H * 0.08, 9 * s, a, "center", FB.text.dim);
    labels.forEach((lbl, i) => {
      const x = W * 0.1 + i * W * 0.14;
      const startH = (0.4 + Math.sin(i * 1.3) * 0.2) * H * 0.4;
      const dropP = interpolate(frame, [30 + i * 10, 80 + i * 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const barH = startH * (1 - dropP);
      ctx.globalAlpha = a; ctx.fillStyle = dropP > 0.8 ? FB.blue : FB.teal;
      ctx.fillRect(x, baseline - barH, barW, barH);
      drawFBText(ctx, lbl, x + barW / 2, baseline + 10 * s, 7 * s, a, "center", FB.text.dim);
      if (dropP > 0.9) drawFBText(ctx, "0", x + barW / 2, baseline - 10 * s, 8 * s, a, "center", FB.blue);
    });
    const endP = interpolate(frame, [130, 160], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "ALL MOTORS DEAD", W / 2, H * 0.82, 11 * s, a * endP, "center", FB.red);
    drawFBText(ctx, "FROZEN LIKE A STATUE", W / 2, H * 0.92, 10 * s, a * endP, "center", FB.blue);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V7: countdown 1..12 with fly shrinking each attempt ----------
const V7: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 180);
    const s = Math.min(W, H) / 360;
    const cx = W / 2, cy = H * 0.38;
    // Attempt counter
    const attP = interpolate(frame, [10, 120], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const attemptNum = Math.min(12, Math.floor(attP * 13));
    drawFBText(ctx, "ATTEMPT", cx, H * 0.1, 8 * s, a, "center", FB.text.dim);
    drawFBCounter(ctx, attemptNum, cx, H * 0.2, 26 * s, FB.gold, a);
    // Fly node shrinking with each attempt — represents life draining
    const lifeP = Math.max(0, 1 - attP * 0.85);
    const flyR = 18 * s * lifeP + 3 * s;
    const wobble = attemptNum < 12 ? Math.sin(frame * 0.1) * 3 * s * lifeP : 0;
    drawFBNode(ctx, cx + wobble, cy, flyR, attemptNum < 12 ? 4 : 5, a, attemptNum < 12 ? frame : 0);
    // Status text
    const status = attemptNum < 4 ? "WOBBLING" : attemptNum < 8 ? "STRUGGLING" : attemptNum < 12 ? "BARELY MOVING" : "FROZEN";
    const statCol = attemptNum < 8 ? FB.gold : attemptNum < 12 ? FB.red : FB.blue;
    drawFBText(ctx, status, cx, cy + flyR + 14 * s, 10 * s, a, "center", statCol);
    const endP = interpolate(frame, [130, 160], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "FROZEN LIKE A STATUE", cx, H * 0.85, 12 * s, a * endP, "center", FB.blue);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V8: split screen — left "attempt 1" wobbly, right "attempt 12" frozen ----------
const V8: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 180);
    const s = Math.min(W, H) / 360;
    // Divider
    ctx.globalAlpha = a * 0.2; ctx.fillStyle = FB.text.dim;
    ctx.fillRect(W / 2 - 1, H * 0.08, 2, H * 0.75);
    // Left: attempt 1 — wobbly but moving
    const leftP = interpolate(frame, [10, 40], [0, 1], { extrapolateRight: "clamp" });
    drawFBText(ctx, "ATTEMPT #1", W * 0.25, H * 0.1, 9 * s, a * leftP, "center", FB.gold);
    const wobX = W * 0.25 + Math.sin(frame * 0.08) * 8 * s;
    const wobY = H * 0.4 + Math.cos(frame * 0.06) * 4 * s;
    drawFBNode(ctx, wobX, wobY, 14 * s, 4, a * leftP, frame);
    drawFBText(ctx, "WOBBLING", W * 0.25, H * 0.6, 9 * s, a * leftP, "center", FB.gold);
    // Right: attempt 12 — frozen
    const rightP = interpolate(frame, [60, 90], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "ATTEMPT #12", W * 0.75, H * 0.1, 9 * s, a * rightP, "center", FB.blue);
    drawFBNode(ctx, W * 0.75, H * 0.4, 14 * s, 5, a * rightP, 0); // frame=0 = no wobble
    // Ice effect
    ctx.globalAlpha = a * rightP * 0.2; ctx.strokeStyle = FB.blue; ctx.lineWidth = 1 * s;
    ctx.beginPath(); ctx.arc(W * 0.75, H * 0.4, 20 * s, 0, Math.PI * 2); ctx.stroke();
    drawFBText(ctx, "FROZEN", W * 0.75, H * 0.6, 9 * s, a * rightP, "center", FB.blue);
    const endP = interpolate(frame, [120, 155], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "COULDN'T EVEN STAND UP", W / 2, H * 0.88, 11 * s, a * endP, "center", FB.red);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V9: heartbeat monitor → flatline, "STATUE" stamp ----------
const V9: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 180);
    const s = Math.min(W, H) / 360;
    const cx = W / 2, monY = H * 0.35, monH = H * 0.2;
    // Monitor box
    ctx.globalAlpha = a * 0.1; ctx.strokeStyle = FB.text.dim; ctx.lineWidth = 1.5 * s;
    ctx.strokeRect(W * 0.05, monY, W * 0.9, monH);
    // Heartbeat → flatline
    const flatP = interpolate(frame, [50, 90], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.beginPath();
    const startX = W * 0.07;
    ctx.moveTo(startX, monY + monH / 2);
    for (let i = 0; i < 60; i++) {
      const px = startX + (i / 60) * W * 0.86;
      const frac = i / 60;
      const heartbeat = Math.sin(i * 0.8) * 0.3 * (1 - flatP * Math.min(1, frac * 1.5));
      const py = monY + monH * (0.5 - heartbeat);
      ctx.lineTo(px, py);
    }
    ctx.globalAlpha = a; ctx.strokeStyle = flatP > 0.7 ? FB.blue : FB.green; ctx.lineWidth = 2 * s;
    ctx.stroke();
    // Flatline beep
    if (flatP > 0.8) {
      drawFBText(ctx, "BEEEEEEP", cx, monY + monH + 12 * s, 8 * s, a * flatP, "center", FB.blue);
    }
    // STATUE stamp
    const stampP = interpolate(frame, [110, 140], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.save(); ctx.translate(cx, H * 0.75); ctx.rotate(-0.1);
    ctx.globalAlpha = a * stampP * 0.8; ctx.strokeStyle = FB.blue; ctx.lineWidth = 2.5 * s;
    ctx.strokeRect(-45 * s, -12 * s, 90 * s, 24 * s);
    drawFBText(ctx, "STATUE", 0, 0, 16 * s, a * stampP, "center", FB.blue);
    ctx.restore();
    drawFBText(ctx, "ATTEMPT 12", cx, H * 0.92, 9 * s, a * stampP, "center", FB.text.dim);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

export const VARIANTS_FB_062: VariantDef[] = [
  { id: "fb-062-v1", label: "Fly topples over attempt 12 freeze", component: V1 },
  { id: "fb-062-v2", label: "12 attempts grid with statuses", component: V2 },
  { id: "fb-062-v3", label: "Legs locking up one by one", component: V3 },
  { id: "fb-062-v4", label: "Neural activity flatline", component: V4 },
  { id: "fb-062-v5", label: "Statue pedestal with frozen fly", component: V5 },
  { id: "fb-062-v6", label: "Motor bars all drop to zero", component: V6 },
  { id: "fb-062-v7", label: "Counter 1-12 fly shrinks and freezes", component: V7 },
  { id: "fb-062-v8", label: "Split screen wobble vs frozen", component: V8 },
  { id: "fb-062-v9", label: "Heartbeat flatline STATUE stamp", component: V9 },
];
