import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantDef, VariantProps } from "../types";
import { FB, seeded, drawFBBg, drawFBNode, drawFBEdge, drawFBText, drawFBCounter, fadeInOut, cellHSL, drawFBColorEdge } from "./flatbold-kit";

/* Shot 75 — "The result was a fly that touched sugar and immediately panicked, backing away
   as if it had stepped on a predator." — 210 frames (7s) */
const DUR = 210;
const sc_ = (W: number, H: number) => Math.min(W, H) / 360;

/* V1: Fly blob approaches sugar, touches, red flash, retreats with speed lines */
const V1: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame); const a = fadeInOut(frame, DUR); const s = sc_(W, H);
    const cy = H * 0.44; const sugarX = W * 0.65;
    ctx.globalAlpha = a; ctx.fillStyle = FB.gold; ctx.beginPath();
    for (let i = 0; i < 6; i++) { const ang = (i / 6) * Math.PI * 2 - Math.PI / 2;
      const px = sugarX + Math.cos(ang) * 10 * s, py = cy + Math.sin(ang) * 10 * s;
      i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py); }
    ctx.closePath(); ctx.fill();
    drawFBText(ctx, "SUGAR", sugarX, cy + 18 * s, 7 * s, a * 0.5, "center", FB.gold);
    const appP = interpolate(frame, [10, 65], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const retP = interpolate(frame, [95, 175], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const flyX = frame < 75 ? W * 0.14 + appP * W * 0.36 : W * 0.5 - retP * W * 0.38;
    const panicP = interpolate(frame, [68, 95], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBNode(ctx, flyX, cy, 10 * s, panicP > 0.3 ? 0 : 4, a, frame);
    ctx.globalAlpha = a * 0.35; ctx.fillStyle = "rgba(255,255,255,0.25)";
    ctx.beginPath(); ctx.ellipse(flyX - 6 * s, cy - 8 * s, 6 * s, 3 * s, -0.4, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(flyX + 6 * s, cy - 8 * s, 6 * s, 3 * s, 0.4, 0, Math.PI * 2); ctx.fill();
    if (frame > 68 && frame < 92) { ctx.globalAlpha = Math.max(0, Math.sin((frame - 68) * 0.2) * 0.25); ctx.fillStyle = FB.red; ctx.fillRect(0, 0, W, H); }
    if (panicP > 0.3) drawFBText(ctx, "PANIC!", W / 2, H * 0.14, 14 * s, a * panicP, "center", FB.red);
    if (retP > 0) { drawFBText(ctx, "<<", flyX - 18 * s, cy, 12 * s, a * retP, "center", FB.red);
      const rng = seeded(7501); for (let i = 0; i < 5; i++) { const ly = cy - 12 * s + rng() * 24 * s; const lx = flyX + 14 * s + rng() * 18 * s;
        ctx.globalAlpha = a * retP * 0.25; ctx.strokeStyle = FB.red; ctx.lineWidth = s; ctx.beginPath(); ctx.moveTo(lx, ly); ctx.lineTo(lx + 14 * s, ly); ctx.stroke(); } }
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* V2: Brain activity spike trace — calm then panic burst */
const V2: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame); const a = fadeInOut(frame, DUR); const s = sc_(W, H);
    const cy = H * 0.44; const trP = interpolate(frame, [8, 180], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = a * 0.18; ctx.strokeStyle = FB.text.dim; ctx.lineWidth = s; ctx.beginPath(); ctx.moveTo(W * 0.04, cy); ctx.lineTo(W * 0.96, cy); ctx.stroke();
    ctx.globalAlpha = a; ctx.strokeStyle = FB.red; ctx.lineWidth = 2 * s; ctx.beginPath();
    for (let i = 0; i <= trP * 200; i++) { const x = W * 0.04 + (i / 200) * W * 0.92; const t = i / 200;
      let y = cy - 2 * s; if (t > 0.3 && t < 0.5) y = cy - 22 * s * Math.sin((t - 0.3) * 40);
      else if (t >= 0.5) y = cy - 16 * s + (t - 0.5) * 12 * s;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); } ctx.stroke();
    const tX = W * 0.04 + 0.3 * W * 0.92; const tP = interpolate(frame, [48, 65], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = a * tP; ctx.strokeStyle = FB.gold; ctx.setLineDash([3 * s, 3 * s]); ctx.lineWidth = s;
    ctx.beginPath(); ctx.moveTo(tX, H * 0.08); ctx.lineTo(tX, H * 0.75); ctx.stroke(); ctx.setLineDash([]);
    drawFBText(ctx, "TOUCH", tX, H * 0.06, 7 * s, a * tP, "center", FB.gold);
    drawFBText(ctx, "MDN ACTIVITY", W / 2, H * 0.88, 10 * s, a, "center", FB.red);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* V3: Sugar crystal shatters into fear shards */
const V3: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  const shards = useMemo(() => { const rng = seeded(7503); return Array.from({ length: 8 }, () => ({ angle: rng() * Math.PI * 2, speed: 0.5 + rng() * 1.5, rot: rng() * 2 - 1 })); }, []);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame); const a = fadeInOut(frame, DUR); const s = sc_(W, H);
    const cx = W / 2, cy = H * 0.38;
    const intP = interpolate(frame, [8, 55], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const shP = interpolate(frame, [75, 115], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (shP < 0.1) { ctx.globalAlpha = a * intP; ctx.fillStyle = FB.gold; ctx.beginPath();
      for (let i = 0; i < 6; i++) { const ang = (i / 6) * Math.PI * 2 - Math.PI / 2;
        const px = cx + Math.cos(ang) * 16 * s, py = cy + Math.sin(ang) * 16 * s;
        i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py); } ctx.closePath(); ctx.fill();
      drawFBText(ctx, "SUGAR", cx, cy + 28 * s, 9 * s, a * intP, "center", FB.gold); }
    if (shP > 0) { for (const sh of shards) { const dist = shP * 38 * sh.speed * s;
        const sx = cx + Math.cos(sh.angle) * dist, sy = cy + Math.sin(sh.angle) * dist;
        const shA = (1 - shP) * 0.75; const g = Math.floor(193 - shP * 113), b = Math.floor(112 - shP * 32);
        ctx.globalAlpha = a * shA; ctx.fillStyle = `rgb(232,${g},${b})`; ctx.save(); ctx.translate(sx, sy);
        ctx.rotate(sh.rot * shP * 3); ctx.fillRect(-4 * s, -4 * s, 8 * s, 8 * s); ctx.restore(); } }
    const fP = interpolate(frame, [125, 170], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "FEAR", cx, cy, 20 * s, a * fP, "center", FB.red);
    drawFBText(ctx, "backing away", cx, H * 0.82, 9 * s, a * fP, "center", FB.text.dim);
    ctx.globalAlpha = 1;
  }, [frame, W, H, shards]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* V4: Fly blob emotion shift — calm teal to panicked red, shaking */
const V4: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame); const a = fadeInOut(frame, DUR); const s = sc_(W, H);
    const cx = W / 2, cy = H * 0.4; const pP = interpolate(frame, [65, 108], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const [h1, s1, l1] = cellHSL(4); const [h2, s2, l2] = cellHSL(0);
    const h = h1 + (h2 - h1) * pP, sa = s1 + (s2 - s1) * pP, l = l1 + (l2 - l1) * pP;
    const shake = pP > 0.5 ? Math.sin(frame * 0.5) * 3 * s * pP : 0;
    ctx.globalAlpha = a; ctx.fillStyle = `hsl(${h},${sa}%,${l}%)`; ctx.beginPath(); ctx.arc(cx + shake, cy, 18 * s, 0, Math.PI * 2); ctx.fill();
    const eW = (4 + pP * 3) * s, eH = (4 + pP * 4) * s;
    ctx.fillStyle = "white"; ctx.beginPath(); ctx.ellipse(cx - 6 * s + shake, cy - 3 * s, eW, eH, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(cx + 6 * s + shake, cy - 3 * s, eW, eH, 0, 0, Math.PI * 2); ctx.fill();
    const pOff = pP > 0.5 ? Math.sin(frame * 0.3) * 2 * s : 0;
    ctx.fillStyle = "#1a1a2e"; ctx.beginPath(); ctx.arc(cx - 6 * s + pOff + shake, cy - 3 * s, 2.5 * s, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(cx + 6 * s + pOff + shake, cy - 3 * s, 2.5 * s, 0, Math.PI * 2); ctx.fill();
    if (pP > 0.5) { ctx.fillStyle = "#1a1a2e"; ctx.beginPath(); ctx.ellipse(cx + shake, cy + 7 * s, 4 * s, 5 * s * pP, 0, 0, Math.PI * 2); ctx.fill(); }
    else { ctx.strokeStyle = "#1a1a2e"; ctx.lineWidth = 1.5 * s; ctx.beginPath(); ctx.arc(cx + shake, cy + 5 * s, 5 * s, 0.2, Math.PI - 0.2); ctx.stroke(); }
    drawFBText(ctx, pP < 0.5 ? "APPROACHING..." : "PANIC!", cx, H * 0.76, 13 * s, a, "center", pP < 0.5 ? FB.teal : FB.red);
    const retP = interpolate(frame, [130, 190], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (retP > 0) drawFBText(ctx, "<< RETREAT", cx, H * 0.88, 10 * s, a * retP, "center", FB.red);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* V5: MN9 meter drains, MDN meter fills */
const V5: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame); const a = fadeInOut(frame, DUR); const s = sc_(W, H);
    const p = interpolate(frame, [28, 140], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const cx = W / 2;
    drawFBText(ctx, "MN9 (FEED)", cx, H * 0.1, 9 * s, a, "center", FB.gold);
    ctx.globalAlpha = a * 0.12; ctx.fillStyle = "rgba(255,255,255,0.06)"; ctx.fillRect(cx - 32 * s, H * 0.18, 64 * s, 10 * s);
    ctx.globalAlpha = a; ctx.fillStyle = FB.gold; ctx.fillRect(cx - 32 * s, H * 0.18, 64 * s * (1 - p), 10 * s);
    drawFBCounter(ctx, Math.floor(50 * (1 - p)) + " Hz", cx, H * 0.34, 10 * s, FB.gold, a);
    drawFBText(ctx, "MDN (RETREAT)", cx, H * 0.5, 9 * s, a, "center", FB.red);
    ctx.globalAlpha = a * 0.12; ctx.fillStyle = "rgba(255,255,255,0.06)"; ctx.fillRect(cx - 32 * s, H * 0.58, 64 * s, 10 * s);
    ctx.globalAlpha = a; ctx.fillStyle = FB.red; ctx.fillRect(cx - 32 * s, H * 0.58, 64 * s * p, 10 * s);
    drawFBCounter(ctx, Math.floor(143 * p) + " Hz", cx, H * 0.74, 10 * s, FB.red, a);
    const rP = interpolate(frame, [148, 185], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "SUGAR = PANIC", cx, H * 0.9, 11 * s, a * rP, "center", FB.red);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* V6: Footprints approach then reverse */
const V6: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame); const a = fadeInOut(frame, DUR); const s = sc_(W, H);
    const cy = H * 0.44; const fwdS = interpolate(frame, [8, 65], [0, 5], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    for (let i = 0; i < Math.floor(fwdS); i++) { const x = W * 0.14 + i * W * 0.1; const y = cy + (i % 2 === 0 ? -5 * s : 5 * s);
      ctx.globalAlpha = a * 0.45; ctx.fillStyle = FB.teal; ctx.beginPath(); ctx.ellipse(x, y, 4 * s, 6 * s, 0.2, 0, Math.PI * 2); ctx.fill(); }
    drawFBNode(ctx, W * 0.65, cy, 8 * s, 2, a, frame);
    drawFBText(ctx, "SUGAR", W * 0.65, cy + 14 * s, 7 * s, a * 0.45, "center", FB.gold);
    const cP = interpolate(frame, [68, 88], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (cP > 0 && cP < 1) { ctx.globalAlpha = a * (1 - cP) * 0.25; ctx.fillStyle = FB.red; ctx.beginPath(); ctx.arc(W * 0.6, cy, 22 * s, 0, Math.PI * 2); ctx.fill(); }
    const bwdS = interpolate(frame, [95, 178], [0, 5], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    for (let i = 0; i < Math.floor(bwdS); i++) { const x = W * 0.55 - i * W * 0.1; const y = cy + (i % 2 === 0 ? -5 * s : 5 * s);
      ctx.globalAlpha = a * 0.55; ctx.fillStyle = FB.red; ctx.beginPath(); ctx.ellipse(x, y, 4 * s, 6 * s, -0.2, 0, Math.PI * 2); ctx.fill(); }
    drawFBText(ctx, "RETREAT", W * 0.3, H * 0.84, 13 * s, a * Math.min(1, bwdS / 5), "center", FB.red);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* V7: SUGAR = PREDATOR equation */
const V7: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame); const a = fadeInOut(frame, DUR); const s = sc_(W, H); const cx = W / 2;
    const t1 = interpolate(frame, [12, 42], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBNode(ctx, cx - 28 * s, H * 0.28, 10 * s, 2, a * t1, frame);
    drawFBText(ctx, "SUGAR", cx - 28 * s, H * 0.4, 8 * s, a * t1, "center", FB.gold);
    const t2 = interpolate(frame, [48, 68], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "=", cx, H * 0.28, 16 * s, a * t2, "center", FB.text.dim);
    const t3 = interpolate(frame, [62, 92], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBNode(ctx, cx + 28 * s, H * 0.28, 10 * s, 0, a * t3, frame);
    drawFBText(ctx, "PREDATOR", cx + 28 * s, H * 0.4, 8 * s, a * t3, "center", FB.red);
    const t4 = interpolate(frame, [108, 148], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "TOUCHED SUGAR", cx, H * 0.58, 10 * s, a * t4, "center", FB.gold);
    const t5 = interpolate(frame, [138, 175], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "PANICKED", cx, H * 0.72, 16 * s, a * t5, "center", FB.red);
    drawFBText(ctx, "BACKED AWAY", cx, H * 0.86, 11 * s, a * t5, "center", FB.red);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* V8: Speed lines with retreating blob */
const V8: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame); const a = fadeInOut(frame, DUR); const s = sc_(W, H);
    const cy = H * 0.44; const retP = interpolate(frame, [85, 178], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const flyX = W * 0.6 - retP * W * 0.44;
    drawFBNode(ctx, flyX, cy, 12 * s, 0, a, frame);
    if (retP > 0.08) { const rng = seeded(7508);
      for (let i = 0; i < 6; i++) { const ly = cy - 14 * s + rng() * 28 * s; const lx = flyX + 14 * s + rng() * 18 * s; const lw = (10 + rng() * 18) * s;
        ctx.globalAlpha = a * retP * 0.25; ctx.strokeStyle = FB.red; ctx.lineWidth = s; ctx.beginPath(); ctx.moveTo(lx, ly); ctx.lineTo(lx + lw, ly); ctx.stroke(); } }
    const suP = interpolate(frame, [8, 38], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBNode(ctx, W * 0.7, cy, 8 * s, 2, a * suP, frame);
    drawFBText(ctx, "SUGAR", W * 0.7, cy + 14 * s, 7 * s, a * suP * 0.45, "center", FB.gold);
    drawFBText(ctx, "<< BACKING AWAY", W / 2, H * 0.82, 10 * s, a * retP, "center", FB.red);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* V9: Bold text summary — THE RESULT */
const V9: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame); const a = fadeInOut(frame, DUR); const s = sc_(W, H); const cx = W / 2;
    const t1 = interpolate(frame, [12, 38], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "THE RESULT:", cx, H * 0.1, 9 * s, a * t1, "center", FB.text.dim);
    const t2 = interpolate(frame, [32, 62], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "TOUCHED", cx, H * 0.28, 13 * s, a * t2, "center", FB.gold);
    drawFBText(ctx, "SUGAR", cx, H * 0.4, 13 * s, a * t2, "center", FB.gold);
    const t3 = interpolate(frame, [72, 108], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "IMMEDIATELY", cx, H * 0.56, 9 * s, a * t3, "center", FB.text.dim);
    const t4 = interpolate(frame, [98, 138], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "PANICKED", cx, H * 0.7, 18 * s, a * t4, "center", FB.red);
    const t5 = interpolate(frame, [138, 175], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "backed away", cx, H * 0.86, 10 * s, a * t5, "center", FB.text.dim);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

export const VARIANTS_FB_075: VariantDef[] = [
  { id: "fb-075-v1", label: "Fly approaches sugar panics retreats", component: V1 },
  { id: "fb-075-v2", label: "Brain activity spike on touch", component: V2 },
  { id: "fb-075-v3", label: "Sugar crystal shatters to fear", component: V3 },
  { id: "fb-075-v4", label: "Fly emotion shift calm to panicked", component: V4 },
  { id: "fb-075-v5", label: "MN9 drains MDN fills meter swap", component: V5 },
  { id: "fb-075-v6", label: "Footprints approach then reverse", component: V6 },
  { id: "fb-075-v7", label: "Sugar equals predator equation", component: V7 },
  { id: "fb-075-v8", label: "Speed lines with retreating blob", component: V8 },
  { id: "fb-075-v9", label: "Bold result summary text", component: V9 },
];
