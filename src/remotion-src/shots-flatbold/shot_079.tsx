import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantDef, VariantProps } from "../types";
import { FB, seeded, drawFBBg, drawFBNode, drawFBEdge, drawFBText, drawFBCounter, fadeInOut, cellHSL, drawFBColorEdge } from "./flatbold-kit";

/* Shot 79 — "I only changed 157 connections, but the connectome wired the rest itself."
   — 120 frames (4s). 157 edits cascade into new activations. */
const DUR = 120;
const sc_ = (W: number, H: number) => Math.min(W, H) / 360;

/* V1: 157 gold edits cascade outward through layered network */
const V1: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  const layout = useMemo(() => { const rng = seeded(7900); const n: { x: number; y: number; layer: number }[] = [];
    for (let i = 0; i < 3; i++) n.push({ x: 0.4 + rng() * 0.2, y: 0.3 + rng() * 0.3, layer: 0 });
    for (let i = 0; i < 6; i++) n.push({ x: rng(), y: rng(), layer: 1 });
    for (let i = 0; i < 10; i++) n.push({ x: rng(), y: rng(), layer: 2 }); return n; }, []);
  useEffect(() => { const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame); const a = fadeInOut(frame, DUR); const s = sc_(W, H);
    const eP = interpolate(frame, [8, 32], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const cP = interpolate(frame, [38, 88], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    for (let i = 0; i < 3; i++) for (let j = 3; j < 9; j++) if ((i + j) % 3 === 0) {
      const n1 = layout[i], n2 = layout[j]; drawFBColorEdge(ctx, W * 0.04 + n1.x * W * 0.92, H * 0.04 + n1.y * H * 0.74, W * 0.04 + n2.x * W * 0.92, H * 0.04 + n2.y * H * 0.74, FB.red, s, a * Math.max(0, cP) * 0.35); }
    for (let i = 3; i < 9; i++) for (let j = 9; j < 19; j++) if ((i + j) % 4 === 0) {
      const n1 = layout[i], n2 = layout[j]; const ea = cP > 0.4 ? (cP - 0.4) * 0.55 : 0;
      drawFBColorEdge(ctx, W * 0.04 + n1.x * W * 0.92, H * 0.04 + n1.y * H * 0.74, W * 0.04 + n2.x * W * 0.92, H * 0.04 + n2.y * H * 0.74, FB.teal, s, a * ea); }
    layout.forEach((n, i) => { const x = W * 0.04 + n.x * W * 0.92, y = H * 0.04 + n.y * H * 0.74;
      const na = n.layer === 0 ? eP : n.layer === 1 ? cP : Math.max(0, cP - 0.4) * 1.7;
      drawFBNode(ctx, x, y, (n.layer === 0 ? 6 : 4) * s, n.layer === 0 ? 1 : n.layer === 1 ? 0 : 4, a * na, frame); });
    drawFBText(ctx, "157 EDITS", W / 2, H * 0.06, 9 * s, a * eP, "center", FB.gold);
    drawFBText(ctx, "CONNECTOME WIRED THE REST", W / 2, H * 0.88, 8 * s, a * interpolate(frame, [82, 108], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }), "center", FB.teal);
    ctx.globalAlpha = 1;
  }, [frame, W, H, layout]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* V2: Domino chain — small push becomes big wave */
const V2: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => { const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame); const a = fadeInOut(frame, DUR); const s = sc_(W, H); const cy = H * 0.48;
    const fP = interpolate(frame, [12, 88], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    for (let i = 0; i < 12; i++) { const x = W * 0.06 + i * W * 0.072; const fallen = fP * 12 > i;
      const h = (12 + i * 1.5) * s; ctx.save(); ctx.translate(x, cy + 8 * s); ctx.rotate(fallen ? Math.PI / 3 : 0);
      ctx.globalAlpha = a; ctx.fillStyle = i < 2 ? FB.gold : i < 5 ? FB.red : FB.teal;
      ctx.fillRect(-2 * s, -h, 4 * s, h); ctx.restore(); }
    drawFBText(ctx, "157", W * 0.1, H * 0.18, 10 * s, a, "center", FB.gold);
    drawFBText(ctx, "edits", W * 0.1, H * 0.26, 8 * s, a, "center", FB.gold);
    const tP = interpolate(frame, [68, 98], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "CASCADE", W * 0.75, H * 0.18, 11 * s, a * tP, "center", FB.teal);
    drawFBText(ctx, "THE BRAIN WIRED THE REST", W / 2, H * 0.86, 8 * s, a * tP, "center", FB.text.dim);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* V3: Ripple pond from a drop */
const V3: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => { const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame); const a = fadeInOut(frame, DUR); const s = sc_(W, H);
    const cx = W / 2, cy = H * 0.4; const dP = interpolate(frame, [4, 18], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBNode(ctx, cx, cy, 5 * s, 1, a * dP, frame); drawFBText(ctx, "157", cx, cy - 11 * s, 8 * s, a * dP, "center", FB.gold);
    for (let i = 0; i < 5; i++) { const sF = 18 + i * 11;
      const rP = interpolate(frame, [sF, sF + 48], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      if (rP > 0) { ctx.globalAlpha = a * (1 - rP) * 0.3; ctx.strokeStyle = i < 2 ? FB.gold : FB.teal; ctx.lineWidth = 1.5 * s;
        ctx.beginPath(); ctx.arc(cx, cy, rP * 52 * s, 0, Math.PI * 2); ctx.stroke(); } }
    const cP = interpolate(frame, [28, 88], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }); const rng = seeded(7903);
    for (let i = 0; i < 12; i++) { const ang = rng() * Math.PI * 2; const d = (14 + rng() * 38) * s; const th = d / (52 * s);
      if (cP > th) drawFBNode(ctx, cx + Math.cos(ang) * d, cy + Math.sin(ang) * d, 3 * s, i < 4 ? 0 : 4, a * Math.min(1, (cP - th) * 3), frame); }
    drawFBText(ctx, "CONNECTOME WIRED THE REST", cx, H * 0.86, 8 * s, a * interpolate(frame, [82, 108], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }), "center", FB.teal);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* V4: "157 -> EVERYTHING" text reveal */
const V4: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => { const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame); const a = fadeInOut(frame, DUR); const s = sc_(W, H); const cx = W / 2;
    const t1 = interpolate(frame, [8, 32], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBCounter(ctx, "157", cx, H * 0.2, 20 * s, FB.gold, a * t1); drawFBText(ctx, "changes", cx, H * 0.32, 9 * s, a * t1, "center", FB.gold);
    const aP = interpolate(frame, [32, 52], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = a * aP; ctx.fillStyle = FB.text.dim; ctx.beginPath(); ctx.moveTo(cx, H * 0.38); ctx.lineTo(cx - 6 * s, H * 0.44); ctx.lineTo(cx + 6 * s, H * 0.44); ctx.closePath(); ctx.fill();
    const t2 = interpolate(frame, [48, 78], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "THE CONNECTOME", cx, H * 0.56, 11 * s, a * t2, "center", FB.teal);
    drawFBText(ctx, "WIRED THE REST", cx, H * 0.7, 13 * s, a * t2, "center", FB.teal);
    drawFBText(ctx, "itself", cx, H * 0.84, 9 * s, a * interpolate(frame, [82, 108], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }), "center", FB.text.dim);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* V5: Sparse dots ignite a dense spreading network */
const V5: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  const grid = useMemo(() => { const rng = seeded(7905); return Array.from({ length: 80 }, (_, i) => ({ x: rng(), y: rng(), ed: i < 3 })); }, []);
  useEffect(() => { const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame); const a = fadeInOut(frame, DUR); const s = sc_(W, H);
    const eP = interpolate(frame, [8, 22], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const sP = interpolate(frame, [28, 92], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const centers = grid.filter(g => g.ed).map(g => ({ x: W * 0.04 + g.x * W * 0.92, y: H * 0.04 + g.y * H * 0.68 }));
    grid.forEach((g) => { const x = W * 0.04 + g.x * W * 0.92, y = H * 0.04 + g.y * H * 0.68;
      if (g.ed) { drawFBNode(ctx, x, y, 5 * s, 1, a * eP, frame); }
      else { let minD = Infinity; for (const c of centers) { const d = Math.sqrt((x - c.x) ** 2 + (y - c.y) ** 2); if (d < minD) minD = d; }
        const th = minD / (Math.sqrt(W * W + H * H) * 0.5); const lit = Math.max(0, sP - th) * 3;
        if (lit > 0) drawFBNode(ctx, x, y, 2.5 * s, 4, a * Math.min(1, lit) * 0.55, frame);
        else { ctx.globalAlpha = a * 0.05; ctx.fillStyle = FB.text.dim; ctx.beginPath(); ctx.arc(x, y, s, 0, Math.PI * 2); ctx.fill(); } } });
    drawFBText(ctx, "SELF-ORGANIZING", W / 2, H * 0.86, 9 * s, a * interpolate(frame, [82, 108], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }), "center", FB.teal);
    ctx.globalAlpha = 1;
  }, [frame, W, H, grid]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* V6: Small gold circle -> arrow -> large teal circle */
const V6: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => { const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame); const a = fadeInOut(frame, DUR); const s = sc_(W, H);
    const t1 = interpolate(frame, [8, 32], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = a * t1; ctx.fillStyle = FB.gold; ctx.beginPath(); ctx.arc(W * 0.24, H * 0.38, 8 * s, 0, Math.PI * 2); ctx.fill();
    drawFBText(ctx, "157", W * 0.24, H * 0.38, 7 * s, a * t1, "center", "#2a1f35");
    drawFBText(ctx, "MY EDITS", W * 0.24, H * 0.56, 8 * s, a * t1, "center", FB.gold);
    const aP = interpolate(frame, [32, 52], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = a * aP; ctx.fillStyle = FB.text.dim; ctx.beginPath(); ctx.moveTo(W * 0.38, H * 0.38); ctx.lineTo(W * 0.46, H * 0.35); ctx.lineTo(W * 0.46, H * 0.41); ctx.closePath(); ctx.fill();
    const t2 = interpolate(frame, [48, 82], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const bigR = (8 + t2 * 20) * s;
    ctx.globalAlpha = a * t2; ctx.fillStyle = FB.teal; ctx.beginPath(); ctx.arc(W * 0.72, H * 0.38, bigR, 0, Math.PI * 2); ctx.fill();
    drawFBText(ctx, "REST", W * 0.72, H * 0.38, 8 * s, a * t2, "center", "#2a1f35");
    drawFBText(ctx, "CONNECTOME", W * 0.72, H * 0.56, 8 * s, a * t2, "center", FB.teal);
    drawFBText(ctx, "WIRED ITSELF", W / 2, H * 0.8, 13 * s, a * interpolate(frame, [88, 112], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }), "center", FB.text.primary);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* V7: Seed sprouting into a tree of connections */
const V7: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => { const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame); const a = fadeInOut(frame, DUR); const s = sc_(W, H); const cx = W / 2;
    const sP = interpolate(frame, [8, 22], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBNode(ctx, cx, H * 0.68, 6 * s, 1, a * sP, frame); drawFBText(ctx, "157", cx, H * 0.78, 8 * s, a * sP, "center", FB.gold);
    const tP = interpolate(frame, [22, 52], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = a * tP; ctx.strokeStyle = FB.teal; ctx.lineWidth = 2 * s; ctx.beginPath();
    ctx.moveTo(cx, H * 0.66); ctx.lineTo(cx, H * 0.66 - tP * H * 0.32); ctx.stroke();
    const bP = interpolate(frame, [48, 88], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const branches = [{ ang: -0.6, len: 0.14 }, { ang: 0.5, len: 0.16 }, { ang: -0.3, len: 0.11 }, { ang: 0.7, len: 0.09 }];
    const trunkTop = H * 0.66 - H * 0.32;
    branches.forEach((b, i) => { const bp = Math.min(1, bP * 2 - i * 0.3); if (bp <= 0) return;
      const sY = trunkTop + i * H * 0.06; const eX = cx + Math.sin(b.ang) * W * b.len * bp; const eY = sY - Math.cos(b.ang) * H * 0.07 * bp;
      ctx.globalAlpha = a * bp; ctx.strokeStyle = FB.teal; ctx.lineWidth = 1.5 * s; ctx.beginPath(); ctx.moveTo(cx, sY); ctx.lineTo(eX, eY); ctx.stroke();
      drawFBNode(ctx, eX, eY, 3 * s, 4, a * bp, frame); });
    drawFBText(ctx, "GREW ITSELF", cx, H * 0.9, 10 * s, a * interpolate(frame, [82, 108], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }), "center", FB.teal);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* V8: Counter: I CHANGED 157, BRAIN REWIRED 1000+ */
const V8: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => { const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame); const a = fadeInOut(frame, DUR); const s = sc_(W, H); const cx = W / 2;
    const t1 = interpolate(frame, [8, 32], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "I CHANGED:", cx, H * 0.1, 8 * s, a * t1, "center", FB.text.dim);
    drawFBCounter(ctx, "157", cx, H * 0.25, 18 * s, FB.gold, a * t1);
    const t2 = interpolate(frame, [38, 58], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "BRAIN REWIRED:", cx, H * 0.46, 8 * s, a * t2, "center", FB.text.dim);
    const cP = interpolate(frame, [48, 88], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBCounter(ctx, Math.floor(cP * 1000) + "+", cx, H * 0.62, 18 * s, FB.teal, a * t2);
    drawFBText(ctx, "SELF-ORGANIZED", cx, H * 0.84, 11 * s, a * interpolate(frame, [88, 112], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }), "center", FB.teal);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* V9: Bold "WIRED ITSELF" finale */
const V9: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => { const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame); const a = fadeInOut(frame, DUR); const s = sc_(W, H); const cx = W / 2;
    drawFBText(ctx, "157 EDITS", cx, H * 0.18, 9 * s, a * interpolate(frame, [8, 28], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }), "center", FB.gold);
    drawFBText(ctx, "THE CONNECTOME", cx, H * 0.4, 11 * s, a * interpolate(frame, [28, 52], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }), "center", FB.text.primary);
    drawFBText(ctx, "WIRED", cx, H * 0.58, 20 * s, a * interpolate(frame, [48, 78], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }), "center", FB.teal);
    drawFBText(ctx, "THE REST", cx, H * 0.74, 14 * s, a * interpolate(frame, [48, 78], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }), "center", FB.teal);
    drawFBText(ctx, "itself", cx, H * 0.88, 9 * s, a * interpolate(frame, [82, 108], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }), "center", FB.text.dim);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

export const VARIANTS_FB_079: VariantDef[] = [
  { id: "fb-079-v1", label: "157 edits cascade through layered network", component: V1 },
  { id: "fb-079-v2", label: "Domino chain small push big wave", component: V2 },
  { id: "fb-079-v3", label: "Ripple pond spreading from drop", component: V3 },
  { id: "fb-079-v4", label: "157 to everything text reveal", component: V4 },
  { id: "fb-079-v5", label: "Sparse dots ignite dense network", component: V5 },
  { id: "fb-079-v6", label: "Small gold circle to large teal circle", component: V6 },
  { id: "fb-079-v7", label: "Seed sprouting into tree of connections", component: V7 },
  { id: "fb-079-v8", label: "Counter: 157 changed vs 1000+ rewired", component: V8 },
  { id: "fb-079-v9", label: "WIRED ITSELF bold finale text", component: V9 },
];
