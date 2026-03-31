import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantDef, VariantProps } from "../types";
import { FB, seeded, drawFBBg, drawFBNode, drawFBEdge, drawFBText, drawFBCounter, fadeInOut, cellHSL, drawFBColorEdge } from "./flatbold-kit";

/* Shot 74 — "It touched 157 synapses out of 54 million. 99.99% untouched." — 180 frames (6s) */
const DUR = 180;
const sc_ = (W: number, H: number) => Math.min(W, H) / 360;

/* V1: Massive dot grid, 157 light up gold */
const V1: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  const hl = useMemo(() => { const rng = seeded(7401); const s = new Set<number>(); while (s.size < 157) s.add(Math.floor(rng() * 2400)); return s; }, []);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame); const a = fadeInOut(frame, DUR); const s = sc_(W, H);
    const rP = interpolate(frame, [12, 100], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const cols = 60, rows = 40, cW = W / cols, cH = (H * 0.72) / rows, top = H * 0.08;
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      const idx = r * cols + c; const cx = c * cW + cW / 2, cy = top + r * cH + cH / 2;
      if (hl.has(idx) && rP > idx / 2400) { ctx.globalAlpha = a * 0.85; ctx.fillStyle = FB.gold; ctx.fillRect(cx - 1.5, cy - 1.5, 3, 3); }
      else { ctx.globalAlpha = a * 0.05; ctx.fillStyle = FB.text.dim; ctx.fillRect(cx - 0.5, cy - 0.5, 1, 1); }
    }
    const cP = interpolate(frame, [60, 120], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (cP > 0) { drawFBCounter(ctx, "157", W * 0.25, H * 0.88, 14 * s, FB.gold, a * cP); drawFBText(ctx, "/ 54,000,000", W * 0.55, H * 0.88, 9 * s, a * cP * 0.5, "center", FB.text.dim); }
    const pP = interpolate(frame, [115, 155], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (pP > 0) drawFBCounter(ctx, "99.99% UNTOUCHED", W / 2, H * 0.95, 8 * s, FB.teal, a * pP);
    ctx.globalAlpha = 1;
  }, [frame, W, H, hl]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* V2: Needle in haystack — gold among gray lines */
const V2: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame); const a = fadeInOut(frame, DUR); const s = sc_(W, H);
    const rP = interpolate(frame, [8, 90], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const rng = seeded(7402);
    for (let i = 0; i < 500; i++) { const x = rng() * W, y = rng() * H * 0.75 + H * 0.04; const ang = rng() * Math.PI; const len = (3 + rng() * 7) * s;
      ctx.globalAlpha = a * 0.05; ctx.strokeStyle = FB.text.dim; ctx.lineWidth = 0.5 * s; ctx.beginPath();
      ctx.moveTo(x - Math.cos(ang) * len, y - Math.sin(ang) * len); ctx.lineTo(x + Math.cos(ang) * len, y + Math.sin(ang) * len); ctx.stroke(); }
    const rng2 = seeded(7403);
    for (let i = 0; i < 157; i++) { if (i / 157 > rP) break; const x = rng2() * W, y = rng2() * H * 0.75 + H * 0.04;
      ctx.globalAlpha = a * 0.85; ctx.fillStyle = FB.gold; ctx.fillRect(x - 1, y - 3 * s, 2, 6 * s); }
    drawFBCounter(ctx, "157", W / 2, H * 0.87, 16 * s, FB.gold, a * rP);
    drawFBText(ctx, "out of 54 million", W / 2, H * 0.94, 8 * s, a * rP * 0.5, "center", FB.text.dim);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* V3: Pie chart — microscopic gold slice vs teal remainder */
const V3: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame); const a = fadeInOut(frame, DUR); const s = sc_(W, H);
    const dP = interpolate(frame, [10, 75], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const zP = interpolate(frame, [85, 140], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const cx = W / 2, cy = H * 0.42, r = 38 * s;
    ctx.globalAlpha = a * 0.45 * dP; ctx.fillStyle = FB.teal; ctx.beginPath(); ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, r, 0, Math.PI * 2 * dP); ctx.closePath(); ctx.fill();
    const sliceAngle = 0.0001 * Math.PI * 2 + zP * 0.14;
    ctx.globalAlpha = a * 0.9; ctx.fillStyle = FB.gold; ctx.beginPath(); ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, r * (1 + zP * 0.25), -Math.PI / 2, -Math.PI / 2 + sliceAngle); ctx.closePath(); ctx.fill();
    if (zP > 0.2) { const callX = cx + 45 * s, callY = cy - 28 * s;
      ctx.globalAlpha = a * zP * 0.45; ctx.strokeStyle = FB.gold; ctx.lineWidth = s; ctx.beginPath(); ctx.moveTo(cx, cy - r); ctx.lineTo(callX, callY); ctx.stroke();
      drawFBCounter(ctx, "157", callX + 18 * s, callY, 13 * s, FB.gold, a * zP);
      drawFBText(ctx, "synapses", callX + 18 * s, callY + 11 * s, 7 * s, a * zP * 0.55, "center", FB.text.dim); }
    drawFBText(ctx, "99.99% UNTOUCHED", cx, H * 0.87, 10 * s, a * dP, "center", FB.teal);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* V4: Galaxy of stars, 157 twinkle gold */
const V4: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  const stars = useMemo(() => { const rng = seeded(7404);
    return Array.from({ length: 800 }, (_, i) => ({ x: rng() * W, y: rng() * H * 0.8 + H * 0.04, special: i < 157, ph: rng() * Math.PI * 2 })); }, [W, H]);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame); const a = fadeInOut(frame, DUR); const s = sc_(W, H);
    const rP = interpolate(frame, [15, 110], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    stars.forEach((st) => {
      if (st.special) { const tw = 0.5 + 0.5 * Math.sin(frame * 0.08 + st.ph);
        ctx.globalAlpha = a * rP * tw; ctx.fillStyle = FB.gold; ctx.beginPath(); ctx.arc(st.x, st.y, 2 * s, 0, Math.PI * 2); ctx.fill();
      } else { ctx.globalAlpha = a * 0.06; ctx.fillStyle = FB.text.dim; ctx.beginPath(); ctx.arc(st.x, st.y, 0.5 * s, 0, Math.PI * 2); ctx.fill(); }
    });
    drawFBCounter(ctx, "157", W / 2, H * 0.9, 15 * s, FB.gold, a * rP);
    drawFBText(ctx, "in a galaxy of 54 million", W / 2, H * 0.96, 7 * s, a * rP * 0.5, "center", FB.text.dim);
    ctx.globalAlpha = 1;
  }, [frame, W, H, stars]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* V5: Counter 0 to 157, then /54M, then 99.99% */
const V5: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame); const a = fadeInOut(frame, DUR); const s = sc_(W, H);
    const c1 = interpolate(frame, [10, 70], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const c2 = interpolate(frame, [75, 110], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const c3 = interpolate(frame, [120, 155], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBCounter(ctx, Math.round(c1 * 157), W / 2, H * 0.25, 26 * s, FB.gold, a);
    drawFBText(ctx, "synapses changed", W / 2, H * 0.37, 9 * s, a * c1, "center", FB.text.dim);
    if (c2 > 0) { drawFBText(ctx, "out of", W / 2, H * 0.5, 9 * s, a * c2, "center", FB.text.dim);
      drawFBCounter(ctx, "54,000,000", W / 2, H * 0.6, 16 * s, FB.teal, a * c2); }
    if (c3 > 0) { drawFBCounter(ctx, "99.99%", W / 2, H * 0.78, 20 * s, FB.green, a * c3);
      drawFBText(ctx, "UNTOUCHED", W / 2, H * 0.88, 11 * s, a * c3, "center", FB.green); }
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* V6: Brain silhouette filled teal with tiny gold specks */
const V6: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame); const a = fadeInOut(frame, DUR); const s = sc_(W, H);
    const fP = interpolate(frame, [8, 75], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const sP = interpolate(frame, [55, 120], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const cx = W / 2, cy = H * 0.4, bW = 52 * s, bH = 38 * s;
    ctx.globalAlpha = a * 0.18 * fP; const bg = ctx.createRadialGradient(cx, cy, 0, cx, cy, bW);
    bg.addColorStop(0, FB.teal); bg.addColorStop(1, "transparent"); ctx.fillStyle = bg;
    ctx.beginPath(); ctx.ellipse(cx, cy, bW, bH, 0, 0, Math.PI * 2); ctx.fill();
    const rng = seeded(7406);
    for (let i = 0; i < 400; i++) { const ang = rng() * Math.PI * 2; const d = Math.sqrt(rng());
      const px = cx + Math.cos(ang) * bW * d, py = cy + Math.sin(ang) * bH * d;
      if (i / 400 > fP) break; ctx.globalAlpha = a * 0.12; ctx.fillStyle = FB.teal;
      ctx.beginPath(); ctx.arc(px, py, s, 0, Math.PI * 2); ctx.fill(); }
    const rng2 = seeded(7407);
    for (let i = 0; i < 157; i++) { if (i / 157 > sP) break;
      const ang = rng2() * Math.PI * 2; const d = Math.sqrt(rng2()) * 0.9;
      const px = cx + Math.cos(ang) * bW * d, py = cy + Math.sin(ang) * bH * d;
      ctx.globalAlpha = a * (0.5 + 0.5 * Math.sin(frame * 0.1 + i)); ctx.fillStyle = FB.gold;
      ctx.beginPath(); ctx.arc(px, py, 2 * s, 0, Math.PI * 2); ctx.fill(); }
    drawFBCounter(ctx, "157", cx, H * 0.77, 15 * s, FB.gold, a * sP);
    drawFBText(ctx, "99.99% UNTOUCHED", cx, H * 0.88, 9 * s, a * sP, "center", FB.teal);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* V7: Two stacked bars showing scale */
const V7: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame); const a = fadeInOut(frame, DUR); const s = sc_(W, H);
    const b1 = interpolate(frame, [10, 55], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const b2 = interpolate(frame, [40, 95], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const lP = interpolate(frame, [100, 140], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const bH = 14 * s, bL = W * 0.1, bW = W * 0.8;
    ctx.globalAlpha = a * 0.15; ctx.fillStyle = "rgba(255,255,255,0.04)"; ctx.fillRect(bL, H * 0.38, bW, bH);
    ctx.globalAlpha = a * 0.6 * b2; ctx.fillStyle = FB.teal; ctx.fillRect(bL, H * 0.38, bW * b2, bH);
    drawFBText(ctx, "54,000,000 synapses", bL + bW / 2, H * 0.38 + bH + 12 * s, 8 * s, a * b2, "center", FB.teal);
    ctx.globalAlpha = a * 0.15; ctx.fillStyle = "rgba(255,255,255,0.04)"; ctx.fillRect(bL, H * 0.58, bW, bH);
    ctx.globalAlpha = a * 0.9; ctx.fillStyle = FB.gold;
    ctx.fillRect(bL, H * 0.58, Math.max(2, bW * (157 / 54000000) * b1), bH);
    drawFBText(ctx, "157 changed", bL + 38 * s, H * 0.58 + bH + 12 * s, 8 * s, a * b1, "center", FB.gold);
    if (lP > 0) { drawFBCounter(ctx, "99.99%", W / 2, H * 0.18, 20 * s, FB.green, a * lP);
      drawFBText(ctx, "UNTOUCHED", W / 2, H * 0.26, 10 * s, a * lP, "center", FB.green); }
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* V8: Ocean of blue dots, 157 turn gold one by one */
const V8: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame); const a = fadeInOut(frame, DUR); const s = sc_(W, H);
    const p = interpolate(frame, [10, 120], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const rng = seeded(7408); const total = 1000; const spC = Math.round(p * 157);
    for (let i = 0; i < total; i++) { const x = rng() * W, y = rng() * H * 0.75 + H * 0.04; const isSp = i < 157 && i < spC;
      ctx.globalAlpha = isSp ? a * 0.85 : a * 0.035; ctx.fillStyle = isSp ? FB.gold : FB.blue;
      ctx.beginPath(); ctx.arc(x, y, isSp ? 2 * s : 0.6 * s, 0, Math.PI * 2); ctx.fill(); }
    drawFBCounter(ctx, spC, W * 0.28, H * 0.89, 13 * s, FB.gold, a * p);
    drawFBText(ctx, "/ 54M", W * 0.48, H * 0.89, 9 * s, a * p * 0.5, "center", FB.text.dim);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* V9: Magnifying glass over dim grid revealing 157 gold dots */
const V9: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  const specials = useMemo(() => { const rng = seeded(7410); const s = new Set<number>(); while (s.size < 157) s.add(Math.floor(rng() * 1500)); return s; }, []);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame); const a = fadeInOut(frame, DUR); const s = sc_(W, H);
    const magX = interpolate(frame, [12, 130], [W * 0.08, W * 0.92], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const magY = H * 0.44 + Math.sin(frame * 0.03) * H * 0.12; const magR = 28 * s;
    const rng = seeded(7409);
    for (let i = 0; i < 1500; i++) { const x = rng() * W, y = rng() * H * 0.8 + H * 0.04;
      const dist = Math.sqrt((x - magX) ** 2 + (y - magY) ** 2); const inL = dist < magR;
      if (specials.has(i) && inL) { ctx.globalAlpha = a * 0.85; ctx.fillStyle = FB.gold; ctx.beginPath(); ctx.arc(x, y, 2.5 * s, 0, Math.PI * 2); ctx.fill(); }
      else { ctx.globalAlpha = a * 0.035; ctx.fillStyle = FB.text.dim; ctx.beginPath(); ctx.arc(x, y, 0.5 * s, 0, Math.PI * 2); ctx.fill(); }
    }
    ctx.globalAlpha = a * 0.18; ctx.strokeStyle = FB.gold; ctx.lineWidth = 2 * s; ctx.beginPath(); ctx.arc(magX, magY, magR, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(magX + magR * 0.7, magY + magR * 0.7); ctx.lineTo(magX + magR * 1.3, magY + magR * 1.3); ctx.stroke();
    drawFBCounter(ctx, "157", W / 2, H * 0.9, 13 * s, FB.gold, a);
    drawFBText(ctx, "99.99% UNTOUCHED", W / 2, H * 0.96, 7 * s, a * 0.55, "center", FB.teal);
    ctx.globalAlpha = 1;
  }, [frame, W, H, specials]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

export const VARIANTS_FB_074: VariantDef[] = [
  { id: "fb-074-v1", label: "Massive dot grid with 157 gold highlights", component: V1 },
  { id: "fb-074-v2", label: "Needle in haystack gold among gray", component: V2 },
  { id: "fb-074-v3", label: "Pie chart with microscopic gold slice", component: V3 },
  { id: "fb-074-v4", label: "Galaxy of stars 157 twinkle gold", component: V4 },
  { id: "fb-074-v5", label: "Counter 0 to 157 then 99.99%", component: V5 },
  { id: "fb-074-v6", label: "Brain silhouette with tiny gold specks", component: V6 },
  { id: "fb-074-v7", label: "Two stacked bars showing scale", component: V7 },
  { id: "fb-074-v8", label: "Ocean of blue dots 157 turn gold", component: V8 },
  { id: "fb-074-v9", label: "Magnifying glass revealing 157 gold dots", component: V9 },
];
