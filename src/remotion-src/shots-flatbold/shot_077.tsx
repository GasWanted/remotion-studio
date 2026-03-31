import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantDef, VariantProps } from "../types";
import { FB, seeded, drawFBBg, drawFBNode, drawFBEdge, drawFBText, drawFBCounter, fadeInOut, cellHSL, drawFBColorEdge } from "./flatbold-kit";

/* Shot 77 — "I didn't just tell the fly to walk away; I changed how it perceived the sugar."
   — 120 frames (4s). Sugar changes from gold to red in brain's view. */
const DUR = 120;
const sc_ = (W: number, H: number) => Math.min(W, H) / 360;

/* V1: Sugar hexagon shifts gold to red inside brain outline */
const V1: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => { const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame); const a = fadeInOut(frame, DUR); const s = sc_(W, H);
    const cx = W / 2, cy = H * 0.36; const shP = interpolate(frame, [28, 82], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const r = 16 * s; const g = Math.floor(193 - shP * 113), b = Math.floor(112 - shP * 32);
    ctx.globalAlpha = a; ctx.fillStyle = `rgb(232,${g},${b})`; ctx.beginPath();
    for (let i = 0; i < 6; i++) { const ang = (i / 6) * Math.PI * 2 - Math.PI / 2;
      const px = cx + Math.cos(ang) * r, py = cy + Math.sin(ang) * r;
      i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py); } ctx.closePath(); ctx.fill();
    drawFBText(ctx, shP < 0.5 ? "FOOD" : "DANGER", cx, cy, 8 * s, a, "center", shP < 0.5 ? "#2a1f35" : "rgba(255,255,255,0.88)");
    ctx.globalAlpha = a * 0.22; ctx.strokeStyle = FB.purple; ctx.lineWidth = 1.5 * s;
    ctx.beginPath(); ctx.ellipse(cx, cy, 32 * s, 26 * s, 0, 0, Math.PI * 2); ctx.stroke();
    drawFBText(ctx, "BRAIN", cx + 36 * s, cy - 14 * s, 7 * s, a * 0.35, "left", FB.purple);
    const tP = interpolate(frame, [82, 108], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "PERCEPTION CHANGED", cx, H * 0.76, 10 * s, a * tP, "center", FB.gold);
    drawFBText(ctx, "not just behavior", cx, H * 0.88, 8 * s, a * tP, "center", FB.text.dim);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* V2: Red lens sliding over sugar */
const V2: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => { const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame); const a = fadeInOut(frame, DUR); const s = sc_(W, H);
    const cx = W / 2, cy = H * 0.4;
    drawFBNode(ctx, cx, cy, 13 * s, 2, a, frame); drawFBText(ctx, "SUGAR", cx, cy + 22 * s, 8 * s, a * 0.55, "center", FB.gold);
    const lP = interpolate(frame, [22, 68], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const lX = cx - 38 * s + lP * 38 * s;
    ctx.globalAlpha = a * lP * 0.3; ctx.fillStyle = FB.red; ctx.beginPath(); ctx.arc(lX, cy, 20 * s, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = a * lP; ctx.strokeStyle = FB.red; ctx.lineWidth = 1.5 * s;
    ctx.beginPath(); ctx.arc(lX, cy, 20 * s, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(lX + 14 * s, cy + 14 * s); ctx.lineTo(lX + 26 * s, cy + 26 * s); ctx.stroke();
    const tP = interpolate(frame, [72, 105], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "CHANGED", cx, H * 0.76, 13 * s, a * tP, "center", FB.red);
    drawFBText(ctx, "PERCEPTION", cx, H * 0.88, 9 * s, a * tP, "center", FB.text.dim);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* V3: Two thought bubbles — YUM vs THREAT */
const V3: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => { const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame); const a = fadeInOut(frame, DUR); const s = sc_(W, H);
    const t1 = interpolate(frame, [8, 32], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = a * t1 * 0.12; ctx.fillStyle = FB.gold; ctx.beginPath(); ctx.arc(W * 0.25, H * 0.33, 22 * s, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = a * t1; ctx.strokeStyle = FB.gold; ctx.lineWidth = s; ctx.beginPath(); ctx.arc(W * 0.25, H * 0.33, 22 * s, 0, Math.PI * 2); ctx.stroke();
    drawFBNode(ctx, W * 0.25, H * 0.33, 8 * s, 2, a * t1, frame); drawFBText(ctx, "YUM", W * 0.25, H * 0.52, 9 * s, a * t1, "center", FB.gold);
    const t2 = interpolate(frame, [42, 72], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = a * t2 * 0.12; ctx.fillStyle = FB.red; ctx.beginPath(); ctx.arc(W * 0.75, H * 0.33, 22 * s, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = a * t2; ctx.strokeStyle = FB.red; ctx.lineWidth = s; ctx.beginPath(); ctx.arc(W * 0.75, H * 0.33, 22 * s, 0, Math.PI * 2); ctx.stroke();
    drawFBNode(ctx, W * 0.75, H * 0.33, 8 * s, 0, a * t2, frame); drawFBText(ctx, "THREAT", W * 0.75, H * 0.52, 9 * s, a * t2, "center", FB.red);
    const aP = interpolate(frame, [32, 52], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = a * aP; ctx.fillStyle = FB.text.dim; ctx.beginPath(); ctx.moveTo(W * 0.4, H * 0.33); ctx.lineTo(W * 0.5, H * 0.3); ctx.lineTo(W * 0.5, H * 0.36); ctx.closePath(); ctx.fill();
    drawFBText(ctx, "NOT BEHAVIOR. PERCEPTION.", W / 2, H * 0.8, 8 * s, a * interpolate(frame, [78, 108], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }), "center", FB.gold);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* V4: Signal travels a 3-node pathway, recoloring at brain node */
const V4: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => { const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame); const a = fadeInOut(frame, DUR); const s = sc_(W, H); const cy = H * 0.4;
    const ns = [{ x: W * 0.14, l: "SENSOR" }, { x: W / 2, l: "BRAIN" }, { x: W * 0.86, l: "MOTOR" }];
    const eP = interpolate(frame, [8, 28], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBColorEdge(ctx, ns[0].x + 10 * s, cy, ns[1].x - 10 * s, cy, FB.text.dim, s, a * eP * 0.35);
    drawFBColorEdge(ctx, ns[1].x + 10 * s, cy, ns[2].x - 10 * s, cy, FB.text.dim, s, a * eP * 0.35);
    const sigP = interpolate(frame, [22, 82], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (sigP > 0) { let sigX: number, sigC: string;
      if (sigP < 0.4) { sigX = ns[0].x + (sigP / 0.4) * (ns[1].x - ns[0].x); sigC = FB.gold; }
      else { sigX = ns[1].x + ((sigP - 0.4) / 0.6) * (ns[2].x - ns[1].x); sigC = FB.red; }
      ctx.globalAlpha = a; ctx.fillStyle = sigC; ctx.beginPath(); ctx.arc(sigX, cy, 5 * s, 0, Math.PI * 2); ctx.fill(); }
    ns.forEach((n, i) => { drawFBNode(ctx, n.x, cy, 9 * s, i === 1 ? 6 : 4, a, frame);
      drawFBText(ctx, n.l, n.x, cy + 16 * s, 7 * s, a * 0.55, "center", FB.text.dim); });
    drawFBText(ctx, "REINTERPRETED", ns[1].x, cy - 20 * s, 8 * s, a * interpolate(frame, [48, 78], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }), "center", FB.gold);
    drawFBText(ctx, "PERCEPTION, NOT JUST OUTPUT", W / 2, H * 0.84, 8 * s, a * sigP, "center", FB.text.dim);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* V5: FOOD circle crossfades to FEAR circle with sparkle */
const V5: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => { const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame); const a = fadeInOut(frame, DUR); const s = sc_(W, H);
    const cx = W / 2, cy = H * 0.38; const mP = interpolate(frame, [22, 72], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = a * (1 - mP); ctx.fillStyle = FB.gold; ctx.beginPath(); ctx.arc(cx, cy, 18 * s, 0, Math.PI * 2); ctx.fill();
    drawFBText(ctx, "FOOD", cx, cy, 9 * s, a * (1 - mP), "center", "#2a1f35");
    ctx.globalAlpha = a * mP; ctx.fillStyle = FB.red; ctx.beginPath(); ctx.arc(cx, cy, 18 * s, 0, Math.PI * 2); ctx.fill();
    drawFBText(ctx, "FEAR", cx, cy, 9 * s, a * mP, "center", "rgba(255,255,255,0.88)");
    if (mP > 0.3 && mP < 0.7) { const spA = Math.sin(mP * Math.PI) * 0.45; ctx.globalAlpha = a * spA; ctx.fillStyle = "white";
      for (let i = 0; i < 6; i++) { const ang = (i / 6) * Math.PI * 2; ctx.beginPath(); ctx.arc(cx + Math.cos(ang) * 26 * s, cy + Math.sin(ang) * 26 * s, 1.5 * s, 0, Math.PI * 2); ctx.fill(); } }
    const tP = interpolate(frame, [78, 108], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "SAME STIMULUS", cx, H * 0.7, 9 * s, a * tP, "center", FB.text.dim);
    drawFBText(ctx, "DIFFERENT MEANING", cx, H * 0.84, 11 * s, a * tP, "center", FB.gold);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* V6: Neural map cells recoloring gold to red */
const V6: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  const cells = useMemo(() => { const rng = seeded(7706); return Array.from({ length: 16 }, () => ({ x: rng(), y: rng() })); }, []);
  useEffect(() => { const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame); const a = fadeInOut(frame, DUR); const s = sc_(W, H);
    const shP = interpolate(frame, [18, 78], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = a * 0.08; ctx.strokeStyle = FB.purple; ctx.lineWidth = s; ctx.strokeRect(W * 0.08, H * 0.06, W * 0.84, H * 0.62);
    cells.forEach((c, i) => { const x = W * 0.1 + c.x * W * 0.8, y = H * 0.08 + c.y * H * 0.58;
      const lS = Math.min(1, shP * 1.5 - i * 0.05); drawFBNode(ctx, x, y, 5 * s, lS > 0.5 ? 0 : 2, a * (0.35 + lS * 0.55), frame); });
    drawFBText(ctx, "REPRESENTATION CHANGED", W / 2, H * 0.86, 9 * s, a * interpolate(frame, [82, 110], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }), "center", FB.gold);
    ctx.globalAlpha = 1;
  }, [frame, W, H, cells]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* V7: "NOT JUST BEHAVIOR" crossed out, "PERCEPTION" appears */
const V7: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => { const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame); const a = fadeInOut(frame, DUR); const s = sc_(W, H); const cx = W / 2;
    const t1 = interpolate(frame, [8, 32], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "NOT JUST", cx, H * 0.18, 9 * s, a * t1, "center", FB.text.dim);
    drawFBText(ctx, "BEHAVIOR", cx, H * 0.3, 14 * s, a * t1, "center", FB.text.dim);
    if (t1 > 0.8) { ctx.globalAlpha = a * (t1 - 0.8) * 5; ctx.fillStyle = FB.red; ctx.fillRect(cx - 38 * s, H * 0.3, 76 * s, 2 * s); }
    drawFBText(ctx, "PERCEPTION", cx, H * 0.56, 18 * s, a * interpolate(frame, [48, 78], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }), "center", FB.gold);
    drawFBText(ctx, "how sugar looks to the brain", cx, H * 0.76, 8 * s, a * interpolate(frame, [78, 105], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }), "center", FB.text.dim);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* V8: Same input, two different internal representations */
const V8: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => { const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame); const a = fadeInOut(frame, DUR); const s = sc_(W, H); const cx = W / 2;
    const t1 = interpolate(frame, [8, 28], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "SAME INPUT", cx, H * 0.1, 8 * s, a * t1, "center", FB.text.dim);
    drawFBNode(ctx, cx, H * 0.22, 9 * s, 2, a * t1, frame); drawFBText(ctx, "sugar", cx, H * 0.33, 8 * s, a * t1, "center", FB.gold);
    ctx.globalAlpha = a * t1; ctx.fillStyle = FB.text.dim; ctx.beginPath(); ctx.moveTo(cx, H * 0.37); ctx.lineTo(cx - 5 * s, H * 0.41); ctx.lineTo(cx + 5 * s, H * 0.41); ctx.closePath(); ctx.fill();
    const t2 = interpolate(frame, [38, 62], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBNode(ctx, cx - 28 * s, H * 0.53, 8 * s, 2, a * t2 * 0.35, frame); drawFBText(ctx, "FOOD", cx - 28 * s, H * 0.64, 8 * s, a * t2 * 0.35, "center", FB.gold);
    const t3 = interpolate(frame, [52, 82], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBNode(ctx, cx + 28 * s, H * 0.53, 10 * s, 0, a * t3, frame); drawFBText(ctx, "DANGER", cx + 28 * s, H * 0.64, 8 * s, a * t3, "center", FB.red);
    drawFBText(ctx, "DIFFERENT PERCEPTION", cx, H * 0.84, 10 * s, a * interpolate(frame, [82, 108], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }), "center", FB.gold);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* V9: Sugar crystal with aura shifting gold to red */
const V9: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => { const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame); const a = fadeInOut(frame, DUR); const s = sc_(W, H);
    const cx = W / 2, cy = H * 0.38; const p = interpolate(frame, [18, 78], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const aR = (28 + Math.sin(frame * 0.06) * 4) * s; ctx.globalAlpha = a * 0.18;
    const grd = ctx.createRadialGradient(cx, cy, 5 * s, cx, cy, aR);
    grd.addColorStop(0, p < 0.5 ? FB.gold : FB.red); grd.addColorStop(1, "transparent");
    ctx.fillStyle = grd; ctx.beginPath(); ctx.arc(cx, cy, aR, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = a; ctx.fillStyle = FB.gold; ctx.beginPath();
    for (let i = 0; i < 6; i++) { const ang = (i / 6) * Math.PI * 2 - Math.PI / 2;
      const px = cx + Math.cos(ang) * 11 * s, py = cy + Math.sin(ang) * 11 * s;
      i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py); } ctx.closePath(); ctx.fill();
    const tP = interpolate(frame, [78, 108], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "SAME SUGAR", cx, H * 0.66, 9 * s, a * tP, "center", FB.gold);
    drawFBText(ctx, "NEW MEANING", cx, H * 0.78, 13 * s, a * tP, "center", FB.red);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

export const VARIANTS_FB_077: VariantDef[] = [
  { id: "fb-077-v1", label: "Sugar hexagon shifts gold to red in brain", component: V1 },
  { id: "fb-077-v2", label: "Red lens sliding over sugar", component: V2 },
  { id: "fb-077-v3", label: "Before/after thought bubbles YUM vs THREAT", component: V3 },
  { id: "fb-077-v4", label: "Signal recoloring at brain node", component: V4 },
  { id: "fb-077-v5", label: "FOOD circle crossfades to FEAR circle", component: V5 },
  { id: "fb-077-v6", label: "Neural map cells recoloring", component: V6 },
  { id: "fb-077-v7", label: "NOT BEHAVIOR crossed out, PERCEPTION", component: V7 },
  { id: "fb-077-v8", label: "Same input different interpretation", component: V8 },
  { id: "fb-077-v9", label: "Sugar crystal aura gold to red", component: V9 },
];
