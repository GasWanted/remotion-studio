import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantDef, VariantProps } from "../types";
import { FB, seeded, drawFBBg, drawFBNode, drawFBEdge, drawFBText, drawFBCounter, fadeInOut, cellHSL, drawFBColorEdge, drawPersonBlob, drawIconPerson, drawIconBuilding } from "./flatbold-kit";

/* Shot 029 — "It matched 91 percent of known experimental results using just one
   'free parameter.'" — 210 frames (7s)
   Big "91%" counter, progress bar, one dial. */

const DUR = 210;

function accent(i: number) { return FB.colors[i % FB.colors.length]; }

/* V1: Big 91% counter counting up, progress bar fills, single dial */
const V1: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame); const a = fadeInOut(frame, DUR);
    const sc = Math.min(W, H) / 360;
    const cx = W / 2;
    // Counter
    const count = Math.floor(interpolate(frame, [10, 120], [0, 91], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
    drawFBCounter(ctx, count + "%", cx, H * 0.3, 32 * sc, FB.green, a);
    drawFBText(ctx, "MATCH", cx, H * 0.42, 10 * sc, a, "center", FB.text.dim);
    // Progress bar
    const barW = W * 0.6, barH = 10 * sc, barX = cx - barW / 2, barY = H * 0.52;
    ctx.globalAlpha = a * 0.15; ctx.fillStyle = "#fff"; ctx.fillRect(barX, barY, barW, barH);
    const fill = count / 100;
    ctx.globalAlpha = a * 0.8; ctx.fillStyle = fill > 0.85 ? FB.green : FB.teal;
    ctx.fillRect(barX, barY, barW * fill, barH);
    // Single dial at bottom
    const dialP = interpolate(frame, [130, 170], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const dialCx = cx, dialCy = H * 0.75, dialR = 20 * sc;
    ctx.globalAlpha = a * dialP * 0.3; ctx.strokeStyle = FB.gold; ctx.lineWidth = 2 * sc;
    ctx.beginPath(); ctx.arc(dialCx, dialCy, dialR, Math.PI, 0); ctx.stroke();
    // Dial needle
    const needleAngle = Math.PI + dialP * Math.PI * 0.8;
    ctx.globalAlpha = a * dialP; ctx.strokeStyle = FB.gold; ctx.lineWidth = 2 * sc;
    ctx.beginPath(); ctx.moveTo(dialCx, dialCy);
    ctx.lineTo(dialCx + Math.cos(needleAngle) * dialR * 0.8, dialCy + Math.sin(needleAngle) * dialR * 0.8);
    ctx.stroke();
    drawFBText(ctx, "1 FREE PARAMETER", cx, H * 0.9, 10 * sc, a * dialP, "center", FB.gold);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* V2: Circular progress ring filling to 91% */
const V2: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame); const a = fadeInOut(frame, DUR);
    const sc = Math.min(W, H) / 360;
    const cx = W / 2, cy = H * 0.4;
    const count = Math.floor(interpolate(frame, [10, 120], [0, 91], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
    const fill = count / 100;
    const r = Math.min(W, H) * 0.25;
    // Background ring
    ctx.globalAlpha = a * 0.1; ctx.strokeStyle = "#fff"; ctx.lineWidth = 8 * sc;
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
    // Fill ring
    ctx.globalAlpha = a * 0.8; ctx.strokeStyle = FB.green; ctx.lineWidth = 8 * sc; ctx.lineCap = "round";
    ctx.beginPath(); ctx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * fill); ctx.stroke();
    // Number inside
    drawFBCounter(ctx, count + "%", cx, cy, 26 * sc, FB.green, a);
    // One parameter
    const dialP = interpolate(frame, [130, 170], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "1", cx, H * 0.78, 22 * sc, a * dialP, "center", FB.gold);
    drawFBText(ctx, "FREE PARAMETER", cx, H * 0.88, 9 * sc, a * dialP, "center", FB.gold);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* V3: Score card — checklist ticks filling up to 91/100 */
const V3: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame); const a = fadeInOut(frame, DUR);
    const sc = Math.min(W, H) / 360;
    const cx = W / 2;
    drawFBText(ctx, "EXPERIMENTAL MATCH", cx, H * 0.06, 10 * sc, a, "center", FB.gold);
    // Grid of 100 dots (10x10), 91 green, 9 dim
    const dotR = 3 * sc, gap = W * 0.08;
    const x0 = cx - 4.5 * gap, y0 = H * 0.15;
    const revealed = Math.floor(interpolate(frame, [10, 140], [0, 100], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
    for (let r = 0; r < 10; r++) {
      for (let c = 0; c < 10; c++) {
        const idx = r * 10 + c;
        if (idx < revealed) {
          const isMatch = idx < 91;
          ctx.globalAlpha = a * 0.8; ctx.fillStyle = isMatch ? FB.green : FB.red;
          ctx.beginPath(); ctx.arc(x0 + c * gap, y0 + r * gap, dotR, 0, Math.PI * 2); ctx.fill();
        } else {
          ctx.globalAlpha = a * 0.1; ctx.fillStyle = "#fff";
          ctx.beginPath(); ctx.arc(x0 + c * gap, y0 + r * gap, dotR * 0.5, 0, Math.PI * 2); ctx.fill();
        }
      }
    }
    // Result
    const resP = interpolate(frame, [145, 175], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBCounter(ctx, "91%", cx, H * 0.88, 18 * sc, FB.green, a * resP);
    drawFBText(ctx, "1 parameter", cx, H * 0.95, 8 * sc, a * resP, "center", FB.gold);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* V4: Speedometer needle sweeping to 91% */
const V4: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame); const a = fadeInOut(frame, DUR);
    const sc = Math.min(W, H) / 360;
    const cx = W / 2, cy = H * 0.55;
    const r = Math.min(W, H) * 0.35;
    const count = Math.floor(interpolate(frame, [10, 120], [0, 91], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
    const fill = count / 100;
    // Arc background
    ctx.globalAlpha = a * 0.15; ctx.strokeStyle = "#fff"; ctx.lineWidth = 6 * sc;
    ctx.beginPath(); ctx.arc(cx, cy, r, Math.PI, 0); ctx.stroke();
    // Fill arc
    ctx.globalAlpha = a * 0.7; ctx.strokeStyle = FB.green; ctx.lineWidth = 8 * sc; ctx.lineCap = "round";
    ctx.beginPath(); ctx.arc(cx, cy, r, Math.PI, Math.PI + Math.PI * fill); ctx.stroke();
    // Tick marks
    for (let t = 0; t <= 10; t++) {
      const angle = Math.PI + (t / 10) * Math.PI;
      const tx1 = cx + Math.cos(angle) * (r - 5 * sc), ty1 = cy + Math.sin(angle) * (r - 5 * sc);
      const tx2 = cx + Math.cos(angle) * (r + 5 * sc), ty2 = cy + Math.sin(angle) * (r + 5 * sc);
      ctx.globalAlpha = a * 0.3; ctx.strokeStyle = FB.text.dim; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(tx1, ty1); ctx.lineTo(tx2, ty2); ctx.stroke();
    }
    // Needle
    const needleAngle = Math.PI + Math.PI * fill;
    ctx.globalAlpha = a; ctx.strokeStyle = FB.gold; ctx.lineWidth = 2.5 * sc; ctx.lineCap = "round";
    ctx.beginPath(); ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(needleAngle) * r * 0.85, cy + Math.sin(needleAngle) * r * 0.85);
    ctx.stroke();
    // Center dot
    ctx.fillStyle = FB.gold; ctx.beginPath(); ctx.arc(cx, cy, 4 * sc, 0, Math.PI * 2); ctx.fill();
    drawFBCounter(ctx, count + "%", cx, cy - r * 0.3, 20 * sc, FB.green, a);
    const dialP = interpolate(frame, [130, 170], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "1 FREE PARAMETER", cx, H * 0.92, 10 * sc, a * dialP, "center", FB.gold);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* V5: Stacked bars — experiments pass/fail, tally at bottom */
const V5: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame); const a = fadeInOut(frame, DUR);
    const sc = Math.min(W, H) / 360;
    const cx = W / 2;
    drawFBText(ctx, "EXPERIMENTS", cx, H * 0.06, 10 * sc, a, "center", FB.gold);
    const barCount = 12;
    const barW = W * 0.06, barGap = W * 0.02;
    const x0 = cx - (barCount * (barW + barGap)) / 2;
    const rng = seeded(2905);
    for (let i = 0; i < barCount; i++) {
      const bP = interpolate(frame, [15 + i * 8, 30 + i * 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const pass = rng() < 0.91;
      const bH = (0.3 + rng() * 0.5) * H * 0.5 * bP;
      const bx = x0 + i * (barW + barGap);
      const by = H * 0.7 - bH;
      ctx.globalAlpha = a * bP * 0.6; ctx.fillStyle = pass ? FB.green : FB.red;
      ctx.fillRect(bx, by, barW, bH);
      // Pass/fail label
      drawFBText(ctx, pass ? "Y" : "N", bx + barW / 2, H * 0.74, 6 * sc, a * bP, "center", pass ? FB.green : FB.red);
    }
    const resP = interpolate(frame, [130, 170], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBCounter(ctx, "91%", cx, H * 0.85, 20 * sc, FB.green, a * resP);
    drawFBText(ctx, "with 1 knob", cx, H * 0.94, 8 * sc, a * resP, "center", FB.gold);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* V6: Slide-in number — 91 builds digit by digit, then "%" snaps in */
const V6: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame); const a = fadeInOut(frame, DUR);
    const sc = Math.min(W, H) / 360;
    const cx = W / 2, cy = H * 0.35;
    // "9" appears
    const d1 = interpolate(frame, [15, 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const d1Scale = d1 > 0 ? Math.max(1, 1.5 - (frame - 30) * 0.05) : 0;
    drawFBText(ctx, "9", cx - 18 * sc, cy, 36 * sc * Math.min(1.3, d1Scale), a * d1, "center", FB.green);
    // "1" appears
    const d2 = interpolate(frame, [45, 70], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const d2Scale = d2 > 0 ? Math.max(1, 1.5 - (frame - 60) * 0.05) : 0;
    drawFBText(ctx, "1", cx + 18 * sc, cy, 36 * sc * Math.min(1.3, d2Scale), a * d2, "center", FB.green);
    // "%" snaps in
    const pctP = interpolate(frame, [80, 95], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "%", cx + 44 * sc, cy - 8 * sc, 18 * sc, a * pctP, "center", FB.gold);
    // Subtitle
    const subP = interpolate(frame, [100, 125], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "of known results matched", cx, H * 0.55, 10 * sc, a * subP, "center", FB.text.dim);
    // One parameter
    const paramP = interpolate(frame, [140, 175], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "JUST", cx, H * 0.7, 10 * sc, a * paramP, "center", FB.text.dim);
    drawFBCounter(ctx, "1", cx, H * 0.82, 24 * sc, FB.gold, a * paramP);
    drawFBText(ctx, "FREE PARAMETER", cx, H * 0.92, 9 * sc, a * paramP, "center", FB.gold);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* V7: Two-column comparison — 91 green dots vs 9 red dots */
const V7: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame); const a = fadeInOut(frame, DUR);
    const sc = Math.min(W, H) / 360;
    const cx = W / 2;
    drawFBText(ctx, "MATCHED", W * 0.3, H * 0.06, 10 * sc, a, "center", FB.green);
    drawFBText(ctx, "MISSED", W * 0.7, H * 0.06, 10 * sc, a, "center", FB.red);
    // Green dots (91) — packed grid on left
    const revealed = Math.floor(interpolate(frame, [10, 130], [0, 100], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
    for (let i = 0; i < Math.min(91, revealed); i++) {
      const col = i % 10, row = Math.floor(i / 10);
      const dx = W * 0.08 + col * W * 0.04, dy = H * 0.13 + row * H * 0.07;
      ctx.globalAlpha = a * 0.7; ctx.fillStyle = FB.green;
      ctx.beginPath(); ctx.arc(dx, dy, 2.5 * sc, 0, Math.PI * 2); ctx.fill();
    }
    // Red dots (9) on right
    for (let i = 91; i < Math.min(100, revealed); i++) {
      const j = i - 91;
      const dx = W * 0.6 + (j % 3) * W * 0.08, dy = H * 0.13 + Math.floor(j / 3) * H * 0.08;
      ctx.globalAlpha = a * 0.7; ctx.fillStyle = FB.red;
      ctx.beginPath(); ctx.arc(dx, dy, 2.5 * sc, 0, Math.PI * 2); ctx.fill();
    }
    const resP = interpolate(frame, [140, 175], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBCounter(ctx, "91%", cx, H * 0.85, 20 * sc, FB.green, a * resP);
    drawFBText(ctx, "1 free parameter", cx, H * 0.94, 8 * sc, a * resP, "center", FB.gold);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* V8: Thermometer style — vertical bar filling to 91% */
const V8: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame); const a = fadeInOut(frame, DUR);
    const sc = Math.min(W, H) / 360;
    const cx = W / 2;
    const count = Math.floor(interpolate(frame, [10, 120], [0, 91], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
    const fill = count / 100;
    // Thermometer
    const tW = 18 * sc, tH = H * 0.6, tX = W * 0.25, tY = H * 0.15;
    ctx.globalAlpha = a * 0.1; ctx.fillStyle = "#fff";
    ctx.fillRect(tX - tW / 2, tY, tW, tH);
    ctx.globalAlpha = a * 0.7; ctx.fillStyle = fill > 0.85 ? FB.green : FB.teal;
    ctx.fillRect(tX - tW / 2, tY + tH * (1 - fill), tW, tH * fill);
    // Tick marks
    for (let t = 0; t <= 10; t++) {
      const ty = tY + tH * (1 - t / 10);
      ctx.globalAlpha = a * 0.2; ctx.strokeStyle = FB.text.dim; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(tX + tW / 2, ty); ctx.lineTo(tX + tW / 2 + 5 * sc, ty); ctx.stroke();
      if (t % 2 === 0) drawFBText(ctx, (t * 10) + "", tX + tW / 2 + 12 * sc, ty, 6 * sc, a * 0.3, "left", FB.text.dim);
    }
    // Big number on right
    drawFBCounter(ctx, count + "%", W * 0.65, H * 0.35, 28 * sc, FB.green, a);
    // One dial
    const dialP = interpolate(frame, [130, 170], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "1 KNOB", W * 0.65, H * 0.55, 12 * sc, a * dialP, "center", FB.gold);
    // Small dial icon
    const dialR = 14 * sc;
    ctx.globalAlpha = a * dialP * 0.3; ctx.strokeStyle = FB.gold; ctx.lineWidth = 2 * sc;
    ctx.beginPath(); ctx.arc(W * 0.65, H * 0.72, dialR, Math.PI, 0); ctx.stroke();
    const nAngle = Math.PI + dialP * Math.PI * 0.8;
    ctx.globalAlpha = a * dialP; ctx.strokeStyle = FB.gold; ctx.lineWidth = 2 * sc;
    ctx.beginPath(); ctx.moveTo(W * 0.65, H * 0.72);
    ctx.lineTo(W * 0.65 + Math.cos(nAngle) * dialR * 0.8, H * 0.72 + Math.sin(nAngle) * dialR * 0.8);
    ctx.stroke();
    drawFBText(ctx, "FREE PARAMETER", W * 0.65, H * 0.84, 8 * sc, a * dialP, "center", FB.gold);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* V9: Headline style — giant "91%" slam then context fades in below */
const V9: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame); const a = fadeInOut(frame, DUR);
    const sc = Math.min(W, H) / 360;
    const cx = W / 2;
    // Giant number slam
    const slamP = interpolate(frame, [5, 25], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const scale = slamP > 0 ? Math.max(1, 2 - slamP) : 0;
    if (slamP > 0) {
      ctx.save(); ctx.translate(cx, H * 0.28); ctx.scale(scale, scale);
      drawFBCounter(ctx, "91%", 0, 0, 32 * sc, FB.green, a * slamP);
      ctx.restore();
    }
    // Context lines
    const l1 = interpolate(frame, [40, 65], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "of known experimental", cx, H * 0.48, 10 * sc, a * l1, "center", FB.text.dim);
    const l2 = interpolate(frame, [55, 80], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "results matched", cx, H * 0.56, 10 * sc, a * l2, "center", FB.text.dim);
    // Divider
    const divP = interpolate(frame, [90, 105], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = a * divP * 0.3; ctx.strokeStyle = FB.gold; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(cx - W * 0.2, H * 0.64); ctx.lineTo(cx + W * 0.2, H * 0.64); ctx.stroke();
    // ONE parameter
    const paramP = interpolate(frame, [110, 150], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "using just", cx, H * 0.72, 9 * sc, a * paramP, "center", FB.text.dim);
    drawFBCounter(ctx, "1", cx, H * 0.84, 28 * sc, FB.gold, a * paramP);
    drawFBText(ctx, "free parameter", cx, H * 0.94, 9 * sc, a * paramP, "center", FB.gold);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

export const VARIANTS_FB_029: VariantDef[] = [
  { id: "fb-029-v1", label: "Counter to 91%, progress bar, single dial", component: V1 },
  { id: "fb-029-v2", label: "Circular progress ring filling to 91%", component: V2 },
  { id: "fb-029-v3", label: "Score card: 91 green dots, 9 red dots", component: V3 },
  { id: "fb-029-v4", label: "Speedometer needle sweeping to 91%", component: V4 },
  { id: "fb-029-v5", label: "Stacked bars: experiments pass/fail tally", component: V5 },
  { id: "fb-029-v6", label: "Digits build: 9, 1, % snap in", component: V6 },
  { id: "fb-029-v7", label: "Two columns: 91 green vs 9 red dots", component: V7 },
  { id: "fb-029-v8", label: "Thermometer filling vertically to 91%", component: V8 },
  { id: "fb-029-v9", label: "Headline slam: giant 91% then context", component: V9 },
];
