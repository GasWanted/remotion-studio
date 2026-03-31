import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantDef, VariantProps } from "../types";
import { FB, seeded, drawFBBg, drawFBNode, drawFBEdge, drawFBText, drawFBCounter, fadeInOut, cellHSL, drawFBColorEdge } from "./flatbold-kit";

/* Shot 78 — "Those four retreat neurons started reinforcing each other in a runaway feedback loop."
   — 150 frames (5s). 4 MDN blobs with circular arrows amplifying. */
const DUR = 150;
const sc_ = (W: number, H: number) => Math.min(W, H) / 360;

/* V1: 4 MDN in a ring with rotating signal dot, edges thicken */
const V1: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => { const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame); const a = fadeInOut(frame, DUR); const s = sc_(W, H);
    const cx = W / 2, cy = H * 0.4; const lP = interpolate(frame, [12, 118], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const r = Math.min(W, H) * 0.18;
    const pos = [0, 1, 2, 3].map(i => { const ang = (i / 4) * Math.PI * 2 - Math.PI / 2; return { x: cx + Math.cos(ang) * r, y: cy + Math.sin(ang) * r }; });
    for (let i = 0; i < 4; i++) drawFBColorEdge(ctx, pos[i].x, pos[i].y, pos[(i + 1) % 4].x, pos[(i + 1) % 4].y, FB.red, (1 + lP * 2) * s, a * (0.18 + lP * 0.55));
    const dP = ((frame * 0.04) % (Math.PI * 2)) / (Math.PI * 2) * 4; const di = Math.floor(dP) % 4; const df = dP - Math.floor(dP);
    const dX = pos[di].x + (pos[(di + 1) % 4].x - pos[di].x) * df, dY = pos[di].y + (pos[(di + 1) % 4].y - pos[di].y) * df;
    ctx.globalAlpha = a * lP; ctx.fillStyle = "white"; ctx.beginPath(); ctx.arc(dX, dY, 3 * s, 0, Math.PI * 2); ctx.fill();
    const nR = (7 + lP * 7) * s;
    pos.forEach((p, i) => { drawFBNode(ctx, p.x, p.y, nR, 0, a * (0.35 + lP * 0.55), frame);
      drawFBText(ctx, "MDN", p.x, p.y + nR + 7 * s, 6 * s, a * 0.45, "center", FB.red); });
    drawFBText(ctx, "FEEDBACK LOOP", cx, H * 0.88, 10 * s, a * interpolate(frame, [108, 138], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }), "center", FB.red);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* V2: Signal bouncing between 4 nodes in a line, growing pulses */
const V2: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => { const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame); const a = fadeInOut(frame, DUR); const s = sc_(W, H); const cy = H * 0.4;
    const pos = [W * 0.14, W * 0.38, W * 0.62, W * 0.86].map(x => ({ x, y: cy }));
    const lP = interpolate(frame, [8, 128], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    for (let i = 0; i < 4; i++) for (let j = i + 1; j < 4; j++)
      drawFBColorEdge(ctx, pos[i].x, pos[i].y, pos[j].x, pos[j].y, FB.red, (1 + lP) * s, a * (0.08 + lP * 0.28));
    const aI = Math.floor((frame * 0.08) % 4);
    pos.forEach((p, i) => { const isA = i === aI; const nR = (7 + lP * (isA ? 9 : 4)) * s;
      drawFBNode(ctx, p.x, p.y, nR, 0, a * (isA ? 1 : 0.45 + lP * 0.25), frame); });
    const aP = pos[aI]; ctx.globalAlpha = a * lP * 0.12; ctx.fillStyle = FB.red;
    ctx.beginPath(); ctx.arc(aP.x, aP.y, (22 + lP * 14) * s, 0, Math.PI * 2); ctx.fill();
    drawFBText(ctx, "SELF-REINFORCING", W / 2, H * 0.76, 10 * s, a * lP, "center", FB.red);
    drawFBCounter(ctx, Math.floor(lP * 143) + " Hz", W / 2, H * 0.88, 10 * s, FB.gold, a * lP);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* V3: Exponential growth curve — runaway signal */
const V3: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => { const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame); const a = fadeInOut(frame, DUR); const s = sc_(W, H);
    const cP = interpolate(frame, [12, 118], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = a; ctx.strokeStyle = FB.red; ctx.lineWidth = 2.5 * s; ctx.beginPath();
    for (let i = 0; i <= cP * 100; i++) { const t = i / 100; const x = W * 0.08 + t * W * 0.84;
      const y = H * 0.74 - Math.pow(t, 3) * H * 0.52; i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); } ctx.stroke();
    drawFBText(ctx, "TIME", W * 0.88, H * 0.82, 7 * s, a * 0.45, "center", FB.text.dim);
    drawFBText(ctx, "SIGNAL", W * 0.05, H * 0.14, 7 * s, a * 0.45, "center", FB.text.dim);
    const tP = interpolate(frame, [98, 132], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "RUNAWAY", W / 2, H * 0.08, 13 * s, a * tP, "center", FB.red);
    drawFBText(ctx, "FEEDBACK LOOP", W / 2, H * 0.92, 9 * s, a * tP, "center", FB.text.dim);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* V4: Self-loop arc rotating around single growing MDN node */
const V4: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => { const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame); const a = fadeInOut(frame, DUR); const s = sc_(W, H);
    const cx = W / 2, cy = H * 0.38; const lP = interpolate(frame, [12, 108], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const nR = (11 + lP * 11) * s;
    drawFBNode(ctx, cx, cy, nR, 0, a, frame);
    const aA = frame * 0.06; const aR = nR + 9 * s;
    ctx.globalAlpha = a * (0.28 + lP * 0.62); ctx.strokeStyle = FB.red; ctx.lineWidth = (2 + lP * 2) * s;
    ctx.beginPath(); ctx.arc(cx, cy, aR, aA, aA + Math.PI * 1.5); ctx.stroke();
    const hA = aA + Math.PI * 1.5; const hx = cx + Math.cos(hA) * aR, hy = cy + Math.sin(hA) * aR;
    ctx.fillStyle = FB.red; const tan = hA + Math.PI / 2; ctx.beginPath();
    ctx.moveTo(hx + Math.cos(tan) * 4 * s, hy + Math.sin(tan) * 4 * s);
    ctx.lineTo(hx + Math.cos(hA) * 7 * s, hy + Math.sin(hA) * 7 * s);
    ctx.lineTo(hx - Math.cos(tan) * 4 * s, hy - Math.sin(tan) * 4 * s); ctx.closePath(); ctx.fill();
    drawFBText(ctx, "MDN", cx, cy + nR + 14 * s, 10 * s, a, "center", FB.red);
    drawFBCounter(ctx, Math.floor(lP * 143) + " Hz", cx, H * 0.8, 11 * s, FB.gold, a * lP);
    drawFBText(ctx, "SELF-EXCITATION", cx, H * 0.92, 8 * s, a * interpolate(frame, [108, 138], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }), "center", FB.text.dim);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* V5: Echo rings — each ring bigger and brighter */
const V5: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => { const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame); const a = fadeInOut(frame, DUR); const s = sc_(W, H);
    const cx = W / 2, cy = H * 0.4; const lP = interpolate(frame, [8, 118], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    for (let i = 0; i < 6; i++) { const sF = 8 + i * 16;
      const rP = interpolate(frame, [sF, sF + 38], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      if (rP > 0) { const rR = rP * 42 * s; const intensity = (i + 1) / 6;
        ctx.globalAlpha = a * (1 - rP) * intensity * 0.45; ctx.strokeStyle = FB.red; ctx.lineWidth = (1 + intensity * 2) * s;
        ctx.beginPath(); ctx.arc(cx, cy, rR, 0, Math.PI * 2); ctx.stroke(); } }
    drawFBNode(ctx, cx, cy, (9 + lP * 7) * s, 0, a * (0.75 + Math.sin(frame * 0.1) * 0.15), frame);
    const tP = interpolate(frame, [98, 132], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "EACH ECHO LOUDER", cx, H * 0.8, 9 * s, a * tP, "center", FB.red);
    drawFBText(ctx, "RUNAWAY LOOP", cx, H * 0.92, 8 * s, a * tP, "center", FB.text.dim);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* V6: Diamond 4 neurons with pulsing oscillating edges */
const V6: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => { const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame); const a = fadeInOut(frame, DUR); const s = sc_(W, H);
    const cx = W / 2, cy = H * 0.4, d = Math.min(W, H) * 0.18;
    const pos = [{ x: cx, y: cy - d }, { x: cx + d, y: cy }, { x: cx, y: cy + d }, { x: cx - d, y: cy }];
    const lP = interpolate(frame, [8, 118], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    for (let i = 0; i < 4; i++) { const j = (i + 1) % 4; const pulse = Math.sin(frame * 0.08 + i * 1.5) * 0.28 + 0.72;
      ctx.globalAlpha = a * (0.18 + lP * 0.55) * pulse; ctx.strokeStyle = FB.red; ctx.lineWidth = (1 + lP * 3) * pulse * s;
      ctx.beginPath(); ctx.moveTo(pos[i].x, pos[i].y); ctx.lineTo(pos[j].x, pos[j].y); ctx.stroke(); }
    for (let i = 0; i < 2; i++) { ctx.globalAlpha = a * lP * 0.18; ctx.strokeStyle = FB.red; ctx.lineWidth = s; ctx.setLineDash([3 * s, 3 * s]);
      ctx.beginPath(); ctx.moveTo(pos[i].x, pos[i].y); ctx.lineTo(pos[i + 2].x, pos[i + 2].y); ctx.stroke(); ctx.setLineDash([]); }
    pos.forEach((p, i) => { const pulse = Math.sin(frame * 0.08 + i * 1.5) * 0.12 + 0.88;
      drawFBNode(ctx, p.x, p.y, (7 + lP * 5) * s, 0, a * pulse, frame); });
    drawFBText(ctx, "4 MDN NEURONS", cx, H * 0.86, 9 * s, a * interpolate(frame, [108, 138], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }), "center", FB.red);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* V7: Text with growing red glow */
const V7: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => { const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame); const a = fadeInOut(frame, DUR); const s = sc_(W, H); const cx = W / 2;
    drawFBText(ctx, "FOUR NEURONS", cx, H * 0.16, 11 * s, a * interpolate(frame, [8, 38], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }), "center", FB.text.primary);
    drawFBText(ctx, "REINFORCING", cx, H * 0.36, 14 * s, a * interpolate(frame, [28, 58], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }), "center", FB.red);
    drawFBText(ctx, "EACH OTHER", cx, H * 0.52, 14 * s, a * interpolate(frame, [48, 78], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }), "center", FB.red);
    const gP = interpolate(frame, [58, 128], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = a * gP * 0.12; const glow = ctx.createRadialGradient(cx, H * 0.43, 8 * s, cx, H * 0.43, (55 + gP * 28) * s);
    glow.addColorStop(0, FB.red); glow.addColorStop(1, "transparent"); ctx.fillStyle = glow;
    ctx.fillRect(0, H * 0.18, W, H * 0.48);
    drawFBText(ctx, "RUNAWAY", cx, H * 0.76, 13 * s, a * interpolate(frame, [88, 128], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }), "center", FB.gold);
    drawFBText(ctx, "FEEDBACK LOOP", cx, H * 0.88, 9 * s, a * gP, "center", FB.text.dim);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* V8: Oscilloscope — 4 traces with exponentially growing amplitude */
const V8: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => { const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame); const a = fadeInOut(frame, DUR); const s = sc_(W, H); const cy = H * 0.48;
    const tP = interpolate(frame, [8, 128], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const colors = [FB.red, "#ff7070", "#ff9090", "#ffb0b0"];
    for (let n = 0; n < 4; n++) { ctx.globalAlpha = a * 0.65; ctx.strokeStyle = colors[n]; ctx.lineWidth = 1.5 * s; ctx.beginPath();
      for (let i = 0; i <= tP * 200; i++) { const x = W * 0.04 + (i / 200) * W * 0.92; const t = i / 200;
        const amp = Math.pow(t, 2) * H * 0.28; const y = cy + Math.sin(t * (10 + t * 20) + n * 1.5) * amp * (0.25 + n * 0.2) - n * 3 * s;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); } ctx.stroke(); }
    drawFBText(ctx, "MDN x4", W * 0.06, H * 0.08, 8 * s, a, "left", FB.red);
    drawFBText(ctx, "AMPLIFYING", W / 2, H * 0.92, 10 * s, a * interpolate(frame, [108, 138], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }), "center", FB.red);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* V9: 0 Hz to 143 Hz counter with filling ring */
const V9: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => { const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame); const a = fadeInOut(frame, DUR); const s = sc_(W, H);
    const cx = W / 2, cy = H * 0.4; const cP = interpolate(frame, [12, 108], [0, 143], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const fP = cP / 143;
    ctx.globalAlpha = a * 0.18; ctx.strokeStyle = FB.text.dim; ctx.lineWidth = 5 * s;
    ctx.beginPath(); ctx.arc(cx, cy, 28 * s, 0, Math.PI * 2); ctx.stroke();
    ctx.globalAlpha = a; ctx.strokeStyle = FB.red; ctx.lineWidth = 5 * s;
    ctx.beginPath(); ctx.arc(cx, cy, 28 * s, -Math.PI / 2, -Math.PI / 2 + fP * Math.PI * 2); ctx.stroke();
    drawFBCounter(ctx, Math.floor(cP), cx, cy, 16 * s, FB.red, a);
    drawFBText(ctx, "Hz", cx, cy + 14 * s, 8 * s, a * 0.55, "center", FB.text.dim);
    const tP = interpolate(frame, [112, 140], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "MDN FEEDBACK LOOP", cx, H * 0.8, 9 * s, a * tP, "center", FB.red);
    drawFBText(ctx, "0 Hz -> 143 Hz", cx, H * 0.9, 8 * s, a * tP, "center", FB.gold);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

export const VARIANTS_FB_078: VariantDef[] = [
  { id: "fb-078-v1", label: "4 MDN ring with rotating signal dot", component: V1 },
  { id: "fb-078-v2", label: "Signal bouncing between 4 nodes", component: V2 },
  { id: "fb-078-v3", label: "Exponential growth curve runaway", component: V3 },
  { id: "fb-078-v4", label: "Self-loop arc rotating around MDN", component: V4 },
  { id: "fb-078-v5", label: "Echo rings each louder", component: V5 },
  { id: "fb-078-v6", label: "Diamond 4 neurons pulsing edges", component: V6 },
  { id: "fb-078-v7", label: "Text with growing red glow", component: V7 },
  { id: "fb-078-v8", label: "Oscilloscope 4 traces explosive", component: V8 },
  { id: "fb-078-v9", label: "0 to 143 Hz counter with ring", component: V9 },
];
