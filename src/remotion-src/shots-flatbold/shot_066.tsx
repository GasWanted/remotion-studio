import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantDef, VariantProps } from "../types";
import { FB, seeded, drawFBBg, drawFBNode, drawFBEdge, drawFBText, drawFBCounter, fadeInOut, cellHSL, drawFBColorEdge } from "./flatbold-kit";

/* Shot 66 — "Red light on the four 'Moonwalker' neurons makes the fly
   walk backward." — 120 frames (4s) */

// ---------- V1: red flash → 4 MDN neurons light up → backward arrow ----------
const V1: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 120);
    const s = Math.min(W, H) / 360;
    const cx = W / 2;
    // Red light
    const lightP = interpolate(frame, [5, 20], [0, 1], { extrapolateRight: "clamp" });
    ctx.globalAlpha = a * lightP * 0.12; ctx.fillStyle = FB.red; ctx.fillRect(0, 0, W, H * 0.2);
    drawFBText(ctx, "RED LIGHT", cx, H * 0.06, 8 * s, a * lightP, "center", FB.red);
    // 4 MDN neurons in a row
    const mdnY = H * 0.35;
    for (let i = 0; i < 4; i++) {
      const t = interpolate(frame, [20 + i * 8, 32 + i * 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const nx = cx - 30 * s + i * 20 * s;
      const glow = 0.6 + 0.4 * Math.sin(frame * 0.12 + i * 1.5);
      drawFBNode(ctx, nx, mdnY, 10 * s, 5, a * t * glow, frame);
      // Red glow
      ctx.globalAlpha = a * t * glow * 0.15; ctx.fillStyle = FB.red;
      ctx.beginPath(); ctx.arc(nx, mdnY, 16 * s, 0, Math.PI * 2); ctx.fill();
      drawFBText(ctx, `MDN${i + 1}`, nx, mdnY + 14 * s, 5 * s, a * t, "center", FB.blue);
    }
    drawFBText(ctx, "MOONWALKER NEURONS", cx, mdnY - 18 * s, 8 * s, a, "center", FB.blue);
    // Backward arrow
    const arrP = interpolate(frame, [60, 80], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = a * arrP; ctx.strokeStyle = FB.blue; ctx.lineWidth = 3 * s;
    ctx.beginPath(); ctx.moveTo(cx + 30 * s, H * 0.62); ctx.lineTo(cx - 30 * s, H * 0.62); ctx.stroke();
    ctx.fillStyle = FB.blue; ctx.beginPath();
    ctx.moveTo(cx - 32 * s, H * 0.62); ctx.lineTo(cx - 24 * s, H * 0.62 - 5 * s); ctx.lineTo(cx - 24 * s, H * 0.62 + 5 * s); ctx.closePath(); ctx.fill();
    drawFBText(ctx, "WALK BACKWARD", cx, H * 0.74, 14 * s, a * arrP, "center", FB.blue);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V2: four glowing cells labeled MDN, with backward motion lines ----------
const V2: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 120);
    const s = Math.min(W, H) / 360;
    const cx = W / 2, cy = H * 0.35;
    // 4 MDN in a 2x2 grid
    const positions: [number, number][] = [
      [cx - 18 * s, cy - 12 * s], [cx + 18 * s, cy - 12 * s],
      [cx - 18 * s, cy + 12 * s], [cx + 18 * s, cy + 12 * s],
    ];
    positions.forEach(([x, y], i) => {
      const t = interpolate(frame, [15 + i * 6, 28 + i * 6], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      drawFBNode(ctx, x, y, 10 * s, 5, a * t, frame);
      drawFBText(ctx, `MDN${i + 1}`, x, y, 5 * s, a * t * 0.7, "center", FB.bg);
    });
    // "Moonwalker" label
    const nameP = interpolate(frame, [40, 55], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, '"MOONWALKER"', cx, cy + 28 * s, 10 * s, a * nameP, "center", FB.blue);
    // Backward motion lines
    const motionP = interpolate(frame, [55, 75], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    for (let i = 0; i < 5; i++) {
      const ly = H * 0.65 + i * 4 * s;
      const lineLen = (20 + i * 5) * s * motionP;
      ctx.globalAlpha = a * motionP * (0.5 - i * 0.08);
      ctx.strokeStyle = FB.blue; ctx.lineWidth = 1.5 * s;
      ctx.beginPath(); ctx.moveTo(cx + lineLen, ly); ctx.lineTo(cx - lineLen, ly); ctx.stroke();
    }
    // Arrow pointing left (backward)
    ctx.globalAlpha = a * motionP; ctx.fillStyle = FB.blue; ctx.beginPath();
    ctx.moveTo(cx - 30 * s, H * 0.73); ctx.lineTo(cx - 22 * s, H * 0.73 - 5 * s); ctx.lineTo(cx - 22 * s, H * 0.73 + 5 * s); ctx.closePath(); ctx.fill();
    const endP = interpolate(frame, [80, 105], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "WALK BACKWARD", cx, H * 0.85, 13 * s, a * endP, "center", FB.blue);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V3: fly blob walking backward (leftward trail) ----------
const V3: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 120);
    const s = Math.min(W, H) / 360;
    // Red light at top
    const lightP = interpolate(frame, [5, 15], [0, 1], { extrapolateRight: "clamp" });
    ctx.globalAlpha = a * lightP * 0.4; ctx.fillStyle = FB.red;
    ctx.beginPath(); ctx.arc(W / 2, H * 0.08, 6 * s, 0, Math.PI * 2); ctx.fill();
    drawFBText(ctx, "RED LIGHT ON MDN", W / 2, H * 0.16, 7 * s, a * lightP, "center", FB.red);
    // Fly walking backward — starts right, moves left
    const walkP = interpolate(frame, [25, 95], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const flyX = W * 0.8 - walkP * W * 0.55;
    const flyY = H * 0.5;
    // Trail dots
    for (let i = 0; i < 8; i++) {
      const trailX = flyX + i * 8 * s;
      const trailAlpha = Math.max(0, 0.4 - i * 0.05);
      if (trailX < W * 0.82) {
        ctx.globalAlpha = a * walkP * trailAlpha; ctx.fillStyle = FB.blue;
        ctx.beginPath(); ctx.arc(trailX, flyY, 2 * s, 0, Math.PI * 2); ctx.fill();
      }
    }
    drawFBNode(ctx, flyX, flyY, 12 * s, 4, a, frame);
    // Direction arrow
    ctx.globalAlpha = a * walkP; ctx.fillStyle = FB.blue; ctx.beginPath();
    ctx.moveTo(flyX - 16 * s, flyY); ctx.lineTo(flyX - 10 * s, flyY - 4 * s); ctx.lineTo(flyX - 10 * s, flyY + 4 * s); ctx.closePath(); ctx.fill();
    drawFBText(ctx, "BACKWARD", flyX, flyY + 18 * s, 8 * s, a * walkP, "center", FB.blue);
    const endP = interpolate(frame, [90, 112], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "4 MOONWALKER NEURONS", W / 2, H * 0.82, 11 * s, a * endP, "center", FB.blue);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V4: chain: red light → MDN quartet → motor → backward ----------
const V4: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 120);
    const s = Math.min(W, H) / 360;
    const cy = H * 0.4;
    const stages = [
      { x: W * 0.08, label: "RED", color: FB.red },
      { x: W * 0.32, label: "4 MDN", color: FB.blue },
      { x: W * 0.58, label: "MOTOR", color: FB.teal },
      { x: W * 0.84, label: "BACKWARD", color: FB.blue },
    ];
    stages.forEach((st, i) => {
      const t = interpolate(frame, [8 + i * 15, 22 + i * 15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      if (i === 1) {
        // Draw 4 small nodes
        for (let m = 0; m < 4; m++) {
          drawFBNode(ctx, st.x - 6 * s + m * 4 * s, cy, 4 * s, 5, a * t, frame);
        }
      } else {
        drawFBNode(ctx, st.x, cy, 10 * s, i === 0 ? 0 : i === 2 ? 4 : 5, a * t, frame);
      }
      drawFBText(ctx, st.label, st.x, cy + 16 * s, 8 * s, a * t, "center", st.color);
      if (i < 3) {
        const arrP = interpolate(frame, [18 + i * 15, 26 + i * 15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        ctx.globalAlpha = a * arrP; ctx.strokeStyle = st.color; ctx.lineWidth = 1.5 * s;
        ctx.beginPath(); ctx.moveTo(st.x + 12 * s, cy); ctx.lineTo(stages[i + 1].x - 12 * s, cy); ctx.stroke();
      }
    });
    const endP = interpolate(frame, [85, 110], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "MOONWALKER RETREAT CIRCUIT", W / 2, H * 0.78, 10 * s, a * endP, "center", FB.blue);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V5: "MDN" letters appearing one by one, then "= MOONWALKER" ----------
const V5: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 120);
    const s = Math.min(W, H) / 360;
    const cx = W / 2;
    // M-D-N letters
    const letters = ["M", "D", "N"];
    letters.forEach((l, i) => {
      const t = interpolate(frame, [10 + i * 12, 18 + i * 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      drawFBText(ctx, l, cx - 20 * s + i * 20 * s, H * 0.2, 24 * s, a * t, "center", FB.blue);
    });
    // "= MOONWALKER"
    const nameP = interpolate(frame, [48, 65], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, '= "Moonwalker"', cx, H * 0.38, 10 * s, a * nameP, "center", FB.text.dim);
    // 4 neuron blobs
    const neurP = interpolate(frame, [55, 75], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    for (let i = 0; i < 4; i++) {
      const nx = cx - 24 * s + i * 16 * s;
      drawFBNode(ctx, nx, H * 0.52, 8 * s, 5, a * neurP, frame);
    }
    drawFBText(ctx, "4 NEURONS", cx, H * 0.64, 9 * s, a * neurP, "center", FB.blue);
    // Backward arrow
    const bkP = interpolate(frame, [78, 98], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = a * bkP; ctx.strokeStyle = FB.blue; ctx.lineWidth = 2 * s;
    ctx.beginPath(); ctx.moveTo(cx + 25 * s, H * 0.78); ctx.lineTo(cx - 25 * s, H * 0.78); ctx.stroke();
    ctx.fillStyle = FB.blue; ctx.beginPath();
    ctx.moveTo(cx - 27 * s, H * 0.78); ctx.lineTo(cx - 20 * s, H * 0.78 - 4 * s); ctx.lineTo(cx - 20 * s, H * 0.78 + 4 * s); ctx.closePath(); ctx.fill();
    drawFBText(ctx, "BACKWARD WALK", cx, H * 0.88, 11 * s, a * bkP, "center", FB.blue);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V6: red beam hitting 4 targets in a row ----------
const V6: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 120);
    const s = Math.min(W, H) / 360;
    const cx = W / 2, cy = H * 0.38;
    // Red light source at top
    ctx.globalAlpha = a * 0.3; ctx.fillStyle = FB.red;
    ctx.beginPath(); ctx.arc(cx, H * 0.06, 5 * s, 0, Math.PI * 2); ctx.fill();
    // 4 MDN targets
    for (let i = 0; i < 4; i++) {
      const nx = cx - 30 * s + i * 20 * s;
      const hitFrame = 15 + i * 12;
      const hitP = interpolate(frame, [hitFrame, hitFrame + 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      // Red beam down to target
      ctx.globalAlpha = a * hitP * 0.3; ctx.strokeStyle = FB.red; ctx.lineWidth = 2 * s;
      ctx.beginPath(); ctx.moveTo(cx, H * 0.1); ctx.lineTo(nx, cy - 10 * s); ctx.stroke();
      // Target ring
      ctx.globalAlpha = a * hitP * 0.4; ctx.strokeStyle = FB.red; ctx.lineWidth = 1 * s;
      ctx.beginPath(); ctx.arc(nx, cy, 12 * s, 0, Math.PI * 2); ctx.stroke();
      // MDN node
      drawFBNode(ctx, nx, cy, 8 * s, 5, a * hitP, frame);
      drawFBText(ctx, `MDN${i + 1}`, nx, cy + 14 * s, 5 * s, a * hitP, "center", FB.blue);
    }
    // Result
    const resP = interpolate(frame, [70, 95], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "ALL 4 ACTIVATED", cx, H * 0.62, 10 * s, a * resP, "center", FB.red);
    drawFBText(ctx, "WALK BACKWARD", cx, H * 0.78, 14 * s, a * resP, "center", FB.blue);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V7: split: normal walk → moonwalker reversal ----------
const V7: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 120);
    const s = Math.min(W, H) / 360;
    // Divider
    ctx.globalAlpha = a * 0.2; ctx.fillStyle = FB.text.dim; ctx.fillRect(W / 2 - 1, H * 0.1, 2, H * 0.6);
    // Left: normal forward walk
    const leftP = interpolate(frame, [10, 30], [0, 1], { extrapolateRight: "clamp" });
    drawFBText(ctx, "NORMAL", W * 0.25, H * 0.1, 9 * s, a * leftP, "center", FB.teal);
    const fwdX = W * 0.15 + interpolate(frame, [15, 90], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) * W * 0.2;
    drawFBNode(ctx, fwdX, H * 0.4, 10 * s, 4, a * leftP, frame);
    ctx.globalAlpha = a * leftP; ctx.fillStyle = FB.teal; ctx.beginPath();
    ctx.moveTo(fwdX + 14 * s, H * 0.4); ctx.lineTo(fwdX + 8 * s, H * 0.4 - 3 * s); ctx.lineTo(fwdX + 8 * s, H * 0.4 + 3 * s); ctx.closePath(); ctx.fill();
    drawFBText(ctx, "FORWARD", W * 0.25, H * 0.55, 9 * s, a * leftP, "center", FB.teal);
    // Right: moonwalker backward
    const rightP = interpolate(frame, [40, 60], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "MDN ACTIVE", W * 0.75, H * 0.1, 9 * s, a * rightP, "center", FB.blue);
    const bkX = W * 0.85 - interpolate(frame, [45, 100], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) * W * 0.2;
    drawFBNode(ctx, bkX, H * 0.4, 10 * s, 5, a * rightP, frame);
    ctx.globalAlpha = a * rightP; ctx.fillStyle = FB.blue; ctx.beginPath();
    ctx.moveTo(bkX - 14 * s, H * 0.4); ctx.lineTo(bkX - 8 * s, H * 0.4 - 3 * s); ctx.lineTo(bkX - 8 * s, H * 0.4 + 3 * s); ctx.closePath(); ctx.fill();
    drawFBText(ctx, "BACKWARD", W * 0.75, H * 0.55, 9 * s, a * rightP, "center", FB.blue);
    const endP = interpolate(frame, [85, 110], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "MOONWALKER REVERSAL", W / 2, H * 0.82, 12 * s, a * endP, "center", FB.blue);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V8: 4 neurons pulsing in unison, like a heartbeat ----------
const V8: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 120);
    const s = Math.min(W, H) / 360;
    const cx = W / 2, cy = H * 0.35;
    drawFBText(ctx, "4 MOONWALKER NEURONS", cx, H * 0.08, 9 * s, a, "center", FB.blue);
    // Pulsing neurons
    const pulse = 0.6 + 0.4 * Math.sin(frame * 0.15);
    for (let i = 0; i < 4; i++) {
      const nx = cx - 28 * s + i * 18 * s;
      const t = interpolate(frame, [15 + i * 5, 25 + i * 5], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const r = (8 + pulse * 4) * s;
      drawFBNode(ctx, nx, cy, r, 5, a * t * pulse, frame);
      // Red indicator
      ctx.globalAlpha = a * t * 0.3; ctx.fillStyle = FB.red;
      ctx.beginPath(); ctx.arc(nx, cy - r - 4 * s, 2 * s, 0, Math.PI * 2); ctx.fill();
    }
    // Sync line connecting them
    const syncP = interpolate(frame, [40, 55], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    for (let i = 0; i < 3; i++) {
      const x1 = cx - 28 * s + i * 18 * s;
      const x2 = cx - 28 * s + (i + 1) * 18 * s;
      drawFBColorEdge(ctx, x1, cy, x2, cy, FB.blue, s * 0.5, a * syncP * 0.5);
    }
    drawFBText(ctx, "FIRING IN SYNC", cx, cy + 20 * s, 8 * s, a * syncP, "center", FB.blue);
    // Backward motion
    const motP = interpolate(frame, [65, 90], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = a * motP; ctx.strokeStyle = FB.blue; ctx.lineWidth = 3 * s;
    ctx.beginPath(); ctx.moveTo(cx + 35 * s, H * 0.65); ctx.lineTo(cx - 35 * s, H * 0.65); ctx.stroke();
    ctx.fillStyle = FB.blue; ctx.beginPath();
    ctx.moveTo(cx - 37 * s, H * 0.65); ctx.lineTo(cx - 28 * s, H * 0.65 - 5 * s); ctx.lineTo(cx - 28 * s, H * 0.65 + 5 * s); ctx.closePath(); ctx.fill();
    drawFBText(ctx, "WALK BACKWARD", cx, H * 0.78, 14 * s, a * motP, "center", FB.blue);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V9: counter "4 neurons" + backward speed readout ----------
const V9: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 120);
    const s = Math.min(W, H) / 360;
    const cx = W / 2;
    // Big number "4"
    const numP = interpolate(frame, [10, 30], [0, 1], { extrapolateRight: "clamp" });
    drawFBCounter(ctx, "4", cx, H * 0.2, 36 * s, FB.blue, a * numP);
    drawFBText(ctx, "NEURONS", cx, H * 0.32, 10 * s, a * numP, "center", FB.text.dim);
    drawFBText(ctx, '"MOONWALKER" (MDN)', cx, H * 0.4, 8 * s, a * numP, "center", FB.blue);
    // Red light trigger
    const trigP = interpolate(frame, [35, 50], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = a * trigP * 0.4; ctx.fillStyle = FB.red;
    ctx.beginPath(); ctx.arc(cx, H * 0.52, 6 * s, 0, Math.PI * 2); ctx.fill();
    drawFBText(ctx, "RED LIGHT", cx, H * 0.52 + 10 * s, 7 * s, a * trigP, "center", FB.red);
    // Arrow and result
    const resP = interpolate(frame, [55, 78], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = a * resP; ctx.strokeStyle = FB.blue; ctx.lineWidth = 2 * s;
    ctx.beginPath(); ctx.moveTo(cx, H * 0.62); ctx.lineTo(cx, H * 0.72); ctx.stroke();
    drawFBText(ctx, "BACKWARD WALK", cx, H * 0.82, 14 * s, a * resP, "center", FB.blue);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

export const VARIANTS_FB_066: VariantDef[] = [
  { id: "fb-066-v1", label: "Red flash 4 MDN light up backward", component: V1 },
  { id: "fb-066-v2", label: "Four MDN cells 2x2 with motion lines", component: V2 },
  { id: "fb-066-v3", label: "Fly blob walking backward with trail", component: V3 },
  { id: "fb-066-v4", label: "Chain red to MDN to motor to backward", component: V4 },
  { id: "fb-066-v5", label: "M-D-N letters then moonwalker name", component: V5 },
  { id: "fb-066-v6", label: "Red beam hitting 4 targets in row", component: V6 },
  { id: "fb-066-v7", label: "Split normal forward vs MDN backward", component: V7 },
  { id: "fb-066-v8", label: "4 neurons pulsing in sync", component: V8 },
  { id: "fb-066-v9", label: "Big 4 counter moonwalker result", component: V9 },
];
