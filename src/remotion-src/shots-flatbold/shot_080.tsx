import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantDef, VariantProps } from "../types";
import { FB, seeded, drawFBBg, drawFBNode, drawFBEdge, drawFBText, drawFBCounter, fadeInOut, cellHSL, drawFBColorEdge } from "./flatbold-kit";

/* Shot 80 — "It found a biological path for fear that wasn't anywhere in my code."
   — 150 frames (5s). New pathway illuminates, "NOT IN MY CODE". */
const DUR = 150;
const sc_ = (W: number, H: number) => Math.min(W, H) / 360;

/* V1: Dim network, then hidden pathway illuminates in red/green */
const V1: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  const layout = useMemo(() => { const rng = seeded(8000); return Array.from({ length: 14 }, () => ({ x: rng(), y: rng() })); }, []);
  useEffect(() => { const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame); const a = fadeInOut(frame, DUR); const s = sc_(W, H);
    const nP = interpolate(frame, [4, 22], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    for (let i = 0; i < layout.length; i++) { const n = layout[i]; drawFBNode(ctx, W * 0.04 + n.x * W * 0.92, H * 0.04 + n.y * H * 0.68, 3 * s, 6, a * nP * 0.28, frame);
      if (i < layout.length - 1) drawFBEdge(ctx, W * 0.04 + n.x * W * 0.92, H * 0.04 + n.y * H * 0.68, W * 0.04 + layout[i + 1].x * W * 0.92, H * 0.04 + layout[i + 1].y * H * 0.68, s, a * nP * 0.1); }
    const pIdx = [0, 3, 7, 11, 13]; const pP = interpolate(frame, [38, 108], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    for (let i = 0; i < pIdx.length - 1; i++) { const seg = Math.min(1, Math.max(0, pP * pIdx.length - i));
      if (seg > 0) { const n1 = layout[pIdx[i]], n2 = layout[pIdx[i + 1]];
        drawFBColorEdge(ctx, W * 0.04 + n1.x * W * 0.92, H * 0.04 + n1.y * H * 0.68, W * 0.04 + n2.x * W * 0.92, H * 0.04 + n2.y * H * 0.68, FB.green, 2 * s, a * seg);
        drawFBNode(ctx, W * 0.04 + n1.x * W * 0.92, H * 0.04 + n1.y * H * 0.68, 5 * s, 3, a * seg, frame); } }
    if (pP > 0.8) { const last = layout[pIdx[pIdx.length - 1]]; drawFBNode(ctx, W * 0.04 + last.x * W * 0.92, H * 0.04 + last.y * H * 0.68, 6 * s, 3, a, frame); }
    drawFBText(ctx, "NOT IN MY CODE", W / 2, H * 0.86, 11 * s, a * interpolate(frame, [108, 138], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }), "center", FB.red);
    ctx.globalAlpha = 1;
  }, [frame, W, H, layout]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* V2: Code block with X then emergent glowing path */
const V2: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => { const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame); const a = fadeInOut(frame, DUR); const s = sc_(W, H);
    const t1 = interpolate(frame, [8, 32], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = a * t1; ctx.strokeStyle = FB.text.dim; ctx.lineWidth = s; ctx.strokeRect(W * 0.04, H * 0.12, W * 0.38, H * 0.44);
    for (let i = 0; i < 5; i++) { ctx.globalAlpha = a * t1 * 0.25; ctx.fillStyle = FB.text.dim;
      ctx.fillRect(W * 0.07, H * 0.17 + i * H * 0.07, W * (0.14 + Math.sin(i * 2) * 0.08), 3 * s); }
    const xP = interpolate(frame, [38, 58], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = a * xP; ctx.strokeStyle = FB.red; ctx.lineWidth = 3 * s;
    ctx.beginPath(); ctx.moveTo(W * 0.08, H * 0.17); ctx.lineTo(W * 0.38, H * 0.52); ctx.moveTo(W * 0.38, H * 0.17); ctx.lineTo(W * 0.08, H * 0.52); ctx.stroke();
    drawFBText(ctx, "NOT HERE", W * 0.23, H * 0.65, 9 * s, a * xP, "center", FB.red);
    const eP = interpolate(frame, [62, 118], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const pathN = [{ x: W * 0.56, y: H * 0.18 }, { x: W * 0.7, y: H * 0.28 }, { x: W * 0.64, y: H * 0.42 }, { x: W * 0.78, y: H * 0.52 }];
    for (let i = 0; i < pathN.length - 1; i++) { const seg = Math.min(1, Math.max(0, eP * pathN.length - i));
      if (seg > 0) drawFBColorEdge(ctx, pathN[i].x, pathN[i].y, pathN[i + 1].x, pathN[i + 1].y, FB.green, 2 * s, a * seg); }
    pathN.forEach((p, i) => { const np = Math.min(1, Math.max(0, eP * pathN.length - i));
      if (np > 0) drawFBNode(ctx, p.x, p.y, 5 * s, 3, a * np, frame); });
    drawFBText(ctx, "EMERGENT", W * 0.7, H * 0.65, 9 * s, a * eP, "center", FB.green);
    drawFBText(ctx, "BIOLOGICAL PATH FOR FEAR", W / 2, H * 0.86, 8 * s, a * interpolate(frame, [118, 142], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }), "center", FB.gold);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* V3: Ghost pathway materializing with glow */
const V3: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => { const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame); const a = fadeInOut(frame, DUR); const s = sc_(W, H); const cx = W / 2;
    const rng = seeded(8003); for (let i = 0; i < 20; i++) { ctx.globalAlpha = a * 0.04; ctx.fillStyle = FB.text.dim;
      ctx.beginPath(); ctx.arc(rng() * W, rng() * H * 0.68, 2 * s, 0, Math.PI * 2); ctx.fill(); }
    const gP = interpolate(frame, [22, 98], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const path = [{ x: W * 0.08, y: H * 0.58 }, { x: W * 0.28, y: H * 0.32 }, { x: W * 0.5, y: H * 0.48 }, { x: W * 0.72, y: H * 0.22 }, { x: W * 0.92, y: H * 0.38 }];
    for (let i = 0; i < path.length - 1; i++) { const seg = Math.min(1, Math.max(0, gP * path.length - i));
      if (seg > 0) { ctx.globalAlpha = a * seg * 0.08; ctx.strokeStyle = FB.green; ctx.lineWidth = 7 * s;
        ctx.beginPath(); ctx.moveTo(path[i].x, path[i].y); ctx.lineTo(path[i + 1].x, path[i + 1].y); ctx.stroke();
        drawFBColorEdge(ctx, path[i].x, path[i].y, path[i + 1].x, path[i + 1].y, FB.green, 1.5 * s, a * seg * 0.65); } }
    path.forEach((p, i) => { const np = Math.min(1, Math.max(0, gP * path.length - i));
      if (np > 0) drawFBNode(ctx, p.x, p.y, 5 * s, 3, a * np, frame); });
    drawFBText(ctx, "FEAR", path[2].x, path[2].y - 14 * s, 9 * s, a * gP, "center", FB.green);
    drawFBText(ctx, "FOUND ITS OWN PATH", cx, H * 0.8, 10 * s, a * interpolate(frame, [108, 138], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }), "center", FB.green);
    drawFBText(ctx, "not in my code", cx, H * 0.9, 7 * s, a * gP, "center", FB.text.dim);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* V4: "EMERGENT" text reveal with glow */
const V4: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => { const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame); const a = fadeInOut(frame, DUR); const s = sc_(W, H); const cx = W / 2;
    drawFBText(ctx, "A PATH FOR FEAR", cx, H * 0.18, 11 * s, a * interpolate(frame, [12, 42], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }), "center", FB.red);
    drawFBText(ctx, "NOT IN", cx, H * 0.4, 9 * s, a * interpolate(frame, [38, 68], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }), "center", FB.text.dim);
    drawFBText(ctx, "MY CODE", cx, H * 0.52, 13 * s, a * interpolate(frame, [38, 68], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }), "center", FB.text.dim);
    const t3 = interpolate(frame, [78, 112], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "EMERGENT", cx, H * 0.73, 20 * s, a * t3, "center", FB.green);
    ctx.globalAlpha = a * t3 * 0.1; const glow = ctx.createRadialGradient(cx, H * 0.73, 8 * s, cx, H * 0.73, 52 * s);
    glow.addColorStop(0, FB.green); glow.addColorStop(1, "transparent"); ctx.fillStyle = glow; ctx.fillRect(cx - 52 * s, H * 0.63, 104 * s, H * 0.18);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* V5: Split screen — code (static) vs brain (alive with fear path) */
const V5: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => { const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame); const a = fadeInOut(frame, DUR); const s = sc_(W, H);
    const t1 = interpolate(frame, [8, 28], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = a * t1; ctx.fillStyle = "rgba(255,255,255,0.03)"; ctx.fillRect(0, 0, W * 0.47, H * 0.73);
    for (let i = 0; i < 6; i++) { ctx.globalAlpha = a * t1 * 0.18; ctx.fillStyle = FB.text.dim;
      ctx.fillRect(W * 0.03, H * 0.06 + i * H * 0.09, W * (0.1 + ((i * 37) % 17) / 100), 3 * s); }
    drawFBText(ctx, "CODE", W * 0.23, H * 0.78, 9 * s, a * t1, "center", FB.text.dim);
    ctx.globalAlpha = a * 0.18; ctx.fillStyle = FB.text.dim; ctx.fillRect(W * 0.48, H * 0.04, s, H * 0.68);
    const bP = interpolate(frame, [32, 98], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }); const rng = seeded(8005);
    for (let i = 0; i < 8; i++) drawFBNode(ctx, W * 0.51 + rng() * W * 0.44, H * 0.04 + rng() * H * 0.63, 4 * s, i % 8, a * bP * 0.45, frame);
    const fP = interpolate(frame, [58, 108], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const pts = [{ x: W * 0.54, y: H * 0.14 }, { x: W * 0.68, y: H * 0.32 }, { x: W * 0.84, y: H * 0.52 }];
    for (let i = 0; i < pts.length - 1; i++) { const seg = Math.min(1, fP * 3 - i);
      if (seg > 0) drawFBColorEdge(ctx, pts[i].x, pts[i].y, pts[i + 1].x, pts[i + 1].y, FB.green, 2 * s, a * seg); }
    drawFBText(ctx, "BRAIN", W * 0.71, H * 0.78, 9 * s, a * bP, "center", FB.green);
    drawFBText(ctx, "NOT IN CODE", W / 2, H * 0.9, 9 * s, a * interpolate(frame, [112, 140], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }), "center", FB.gold);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* V6: Lightbulb illuminating — new connection found */
const V6: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => { const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame); const a = fadeInOut(frame, DUR); const s = sc_(W, H);
    const cx = W / 2, cy = H * 0.36; const t1 = interpolate(frame, [8, 28], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = a * t1 * 0.35; ctx.strokeStyle = FB.text.dim; ctx.lineWidth = 1.5 * s;
    ctx.beginPath(); ctx.arc(cx, cy, 16 * s, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx - 5 * s, cy + 16 * s); ctx.lineTo(cx - 5 * s, cy + 23 * s); ctx.lineTo(cx + 5 * s, cy + 23 * s); ctx.lineTo(cx + 5 * s, cy + 16 * s); ctx.stroke();
    const lP = interpolate(frame, [48, 78], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (lP > 0) { ctx.globalAlpha = a * lP * 0.18; const glow = ctx.createRadialGradient(cx, cy, 4 * s, cx, cy, 42 * s);
      glow.addColorStop(0, FB.green); glow.addColorStop(1, "transparent"); ctx.fillStyle = glow;
      ctx.beginPath(); ctx.arc(cx, cy, 42 * s, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = a * lP; ctx.fillStyle = FB.green; ctx.beginPath(); ctx.arc(cx, cy, 16 * s, 0, Math.PI * 2); ctx.fill(); }
    if (lP > 0.5) { for (let i = 0; i < 8; i++) { const ang = (i / 8) * Math.PI * 2; const inner = 20 * s; const outer = (28 + (lP - 0.5) * 18) * s;
        ctx.globalAlpha = a * (lP - 0.5) * 2 * 0.35; ctx.strokeStyle = FB.green; ctx.lineWidth = s;
        ctx.beginPath(); ctx.moveTo(cx + Math.cos(ang) * inner, cy + Math.sin(ang) * inner); ctx.lineTo(cx + Math.cos(ang) * outer, cy + Math.sin(ang) * outer); ctx.stroke(); } }
    drawFBText(ctx, "BIOLOGICAL PATH", cx, H * 0.74, 10 * s, a * interpolate(frame, [88, 128], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }), "center", FB.green);
    drawFBText(ctx, "NOT IN MY CODE", cx, H * 0.86, 9 * s, a * lP, "center", FB.red);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* V7: Map with known grid, then uncharted territory lights up */
const V7: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => { const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame); const a = fadeInOut(frame, DUR); const s = sc_(W, H);
    const gP = interpolate(frame, [4, 22], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = a * gP * 0.05; ctx.strokeStyle = FB.text.dim; ctx.lineWidth = 0.5 * s;
    for (let x = W * 0.04; x < W * 0.96; x += W * 0.05) { ctx.beginPath(); ctx.moveTo(x, H * 0.04); ctx.lineTo(x, H * 0.72); ctx.stroke(); }
    for (let y = H * 0.04; y < H * 0.72; y += H * 0.06) { ctx.beginPath(); ctx.moveTo(W * 0.04, y); ctx.lineTo(W * 0.96, y); ctx.stroke(); }
    const kP = interpolate(frame, [12, 38], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = a * kP * 0.28; ctx.strokeStyle = FB.blue; ctx.lineWidth = 2 * s;
    ctx.beginPath(); ctx.moveTo(W * 0.08, H * 0.28); ctx.lineTo(W * 0.38, H * 0.18); ctx.lineTo(W * 0.48, H * 0.48); ctx.stroke();
    const uP = interpolate(frame, [52, 108], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = a * uP; ctx.strokeStyle = FB.green; ctx.lineWidth = 2.5 * s; ctx.beginPath();
    const pts = [{ x: W * 0.48, y: H * 0.48 }, { x: W * 0.64, y: H * 0.28 }, { x: W * 0.78, y: H * 0.42 }, { x: W * 0.9, y: H * 0.18 }];
    for (let i = 0; i < pts.length; i++) { const seg = Math.min(1, uP * pts.length - i); if (seg <= 0) break;
      i === 0 ? ctx.moveTo(pts[i].x, pts[i].y) : ctx.lineTo(pts[i].x, pts[i].y); } ctx.stroke();
    drawFBText(ctx, "UNCHARTED", W * 0.74, H * 0.1, 9 * s, a * uP, "center", FB.green);
    drawFBText(ctx, "FEAR PATH: EMERGENT", W / 2, H * 0.86, 9 * s, a * interpolate(frame, [112, 140], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }), "center", FB.green);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* V8: Two strands with unexpected bridge forming */
const V8: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => { const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame); const a = fadeInOut(frame, DUR); const s = sc_(W, H); const cy = H * 0.4;
    const sP = interpolate(frame, [8, 38], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    for (let x = W * 0.08; x < W * 0.4; x += 7 * s) { const y1 = cy + Math.sin(x * 0.08) * 10 * s;
      ctx.globalAlpha = a * sP * 0.45; ctx.fillStyle = FB.blue; ctx.beginPath(); ctx.arc(x, y1, 2 * s, 0, Math.PI * 2); ctx.fill(); }
    for (let x = W * 0.6; x < W * 0.92; x += 7 * s) { const y1 = cy + Math.sin(x * 0.08) * 10 * s;
      ctx.globalAlpha = a * sP * 0.45; ctx.fillStyle = FB.blue; ctx.beginPath(); ctx.arc(x, y1, 2 * s, 0, Math.PI * 2); ctx.fill(); }
    const bP = interpolate(frame, [52, 98], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = a * bP; ctx.strokeStyle = FB.green; ctx.lineWidth = 2.5 * s; ctx.beginPath();
    ctx.moveTo(W * 0.4, cy); ctx.quadraticCurveTo(W * 0.5, cy - 18 * s * bP, W * 0.6, cy); ctx.stroke();
    drawFBText(ctx, "EMERGENT", W / 2, cy - 22 * s, 8 * s, a * bP, "center", FB.green);
    drawFBText(ctx, "PATH NOT IN CODE", W / 2, H * 0.8, 10 * s, a * interpolate(frame, [108, 138], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }), "center", FB.red);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* V9: Bold "EMERGENT FEAR" text reveal */
const V9: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => { const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame); const a = fadeInOut(frame, DUR); const s = sc_(W, H); const cx = W / 2;
    drawFBText(ctx, "IT FOUND", cx, H * 0.16, 9 * s, a * interpolate(frame, [12, 42], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }), "center", FB.text.dim);
    drawFBText(ctx, "A PATH", cx, H * 0.3, 14 * s, a * interpolate(frame, [32, 62], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }), "center", FB.green);
    drawFBText(ctx, "FOR FEAR", cx, H * 0.48, 14 * s, a * interpolate(frame, [32, 62], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }), "center", FB.red);
    drawFBText(ctx, "NOT ANYWHERE", cx, H * 0.66, 9 * s, a * interpolate(frame, [72, 102], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }), "center", FB.text.dim);
    drawFBText(ctx, "IN MY CODE", cx, H * 0.76, 11 * s, a * interpolate(frame, [72, 102], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }), "center", FB.text.dim);
    drawFBText(ctx, "EMERGENT", cx, H * 0.9, 9 * s, a * interpolate(frame, [108, 138], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }), "center", FB.green);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

export const VARIANTS_FB_080: VariantDef[] = [
  { id: "fb-080-v1", label: "Hidden pathway illuminates in network", component: V1 },
  { id: "fb-080-v2", label: "Code block X then emergent path", component: V2 },
  { id: "fb-080-v3", label: "Ghost pathway materializing with glow", component: V3 },
  { id: "fb-080-v4", label: "EMERGENT text reveal with glow", component: V4 },
  { id: "fb-080-v5", label: "Split code vs alive brain", component: V5 },
  { id: "fb-080-v6", label: "Lightbulb moment new path found", component: V6 },
  { id: "fb-080-v7", label: "Map with uncharted territory", component: V7 },
  { id: "fb-080-v8", label: "Two strands with emergent bridge", component: V8 },
  { id: "fb-080-v9", label: "Bold emergent fear text", component: V9 },
];
