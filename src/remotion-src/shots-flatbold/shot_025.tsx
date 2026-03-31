import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantDef, VariantProps } from "../types";
import { FB, seeded, drawFBBg, drawFBNode, drawFBEdge, drawFBText, drawFBCounter, fadeInOut, cellHSL, drawFBColorEdge, drawPersonBlob, drawIconPerson, drawIconBuilding } from "./flatbold-kit";

/* Shot 025 — "Every single connection is weighted exactly as it was measured
   in the real fly's brain." — 150 frames (5s)
   Weight numbers on connections, "REAL DATA" emphasis. */

const DUR = 150;

function accent(i: number) { return FB.colors[i % FB.colors.length]; }

/* V1: Network with weight labels on each edge, "REAL DATA" stamp */
const V1: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame); const a = fadeInOut(frame, DUR);
    const sc = Math.min(W, H) / 360;
    const rng = seeded(2501);
    const nodes: { x: number; y: number }[] = [];
    for (let i = 0; i < 8; i++) nodes.push({ x: W * 0.1 + rng() * W * 0.8, y: H * 0.12 + rng() * H * 0.55 });
    const weights = ["+1.7", "-0.4", "+3.2", "+0.8", "-1.1", "+2.5", "-0.3"];
    const edges = [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7]];
    edges.forEach(([a1, b], ei) => {
      const eP = interpolate(frame, [10 + ei * 10, 25 + ei * 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const n1 = nodes[a1], n2 = nodes[b];
      drawFBEdge(ctx, n1.x, n1.y, n2.x, n2.y, sc, a * eP * 0.4, frame);
      const mx = (n1.x + n2.x) / 2, my = (n1.y + n2.y) / 2;
      const wColor = weights[ei].startsWith("-") ? FB.red : FB.green;
      drawFBText(ctx, weights[ei], mx, my - 6 * sc, 8 * sc, a * eP, "center", wColor);
    });
    nodes.forEach((n, i) => drawFBNode(ctx, n.x, n.y, 6 * sc, i, a));
    const stampP = interpolate(frame, [90, 115], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (stampP > 0) {
      ctx.save(); ctx.translate(W / 2, H * 0.82); ctx.rotate(-0.1);
      ctx.globalAlpha = a * stampP * 0.9; ctx.strokeStyle = FB.gold; ctx.lineWidth = 3 * sc;
      ctx.strokeRect(-W * 0.2, -12 * sc, W * 0.4, 24 * sc);
      drawFBText(ctx, "REAL DATA", 0, 0, 16 * sc, a * stampP, "center", FB.gold);
      ctx.restore();
    }
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* V2: Matrix grid — cells reveal weight values one by one */
const V2: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame); const a = fadeInOut(frame, DUR);
    const sc = Math.min(W, H) / 360;
    const gridSize = 6, cellW = W * 0.1, cellH = H * 0.1;
    const x0 = W / 2 - (gridSize * cellW) / 2, y0 = H * 0.15;
    const rng = seeded(2502);
    drawFBText(ctx, "CONNECTION MATRIX", W / 2, H * 0.07, 10 * sc, a, "center", FB.gold);
    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        const idx = r * gridSize + c;
        const revP = interpolate(frame, [5 + idx * 2, 15 + idx * 2], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        const val = rng() > 0.6 ? (rng() * 4 - 2).toFixed(1) : "0";
        const isNonZero = val !== "0";
        const cx = x0 + c * cellW + cellW / 2, cy = y0 + r * cellH + cellH / 2;
        ctx.globalAlpha = a * revP * 0.1;
        ctx.fillStyle = isNonZero ? FB.teal : "rgba(255,255,255,0.03)";
        ctx.fillRect(x0 + c * cellW + 1, y0 + r * cellH + 1, cellW - 2, cellH - 2);
        if (isNonZero) {
          const wColor = parseFloat(val) < 0 ? FB.red : FB.green;
          drawFBText(ctx, val, cx, cy, 7 * sc, a * revP, "center", wColor);
        }
      }
    }
    const stampP = interpolate(frame, [90, 110], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "MEASURED FROM REAL FLY", W / 2, H * 0.9, 10 * sc, a * stampP, "center", FB.gold);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* V3: Two neurons connected, zoom on edge — weight number grows to fill frame */
const V3: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame); const a = fadeInOut(frame, DUR);
    const sc = Math.min(W, H) / 360;
    const cx = W / 2, cy = H * 0.4;
    const pairP = interpolate(frame, [5, 25], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBNode(ctx, W * 0.2, cy, 12 * sc, 0, a * pairP, frame);
    drawFBNode(ctx, W * 0.8, cy, 12 * sc, 4, a * pairP, frame);
    drawFBEdge(ctx, W * 0.2, cy, W * 0.8, cy, sc, a * pairP * 0.5, frame);
    const zoomP = interpolate(frame, [30, 70], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const fontSize = interpolate(zoomP, [0, 1], [8, 28], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "+2.47", cx, cy, fontSize * sc, a * zoomP, "center", FB.green);
    const labP = interpolate(frame, [75, 100], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "exactly as measured", cx, H * 0.62, 9 * sc, a * labP, "center", FB.text.dim);
    drawFBText(ctx, "in the real fly", cx, H * 0.7, 9 * sc, a * labP, "center", FB.text.dim);
    const stampP = interpolate(frame, [105, 125], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "REAL DATA", cx, H * 0.85, 16 * sc, a * stampP, "center", FB.gold);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* V4: Two-layer cascade — edges light up with weight labels, then all glow gold */
const V4: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame); const a = fadeInOut(frame, DUR);
    const sc = Math.min(W, H) / 360;
    const layer1: { x: number; y: number }[] = [];
    const layer2: { x: number; y: number }[] = [];
    for (let i = 0; i < 4; i++) { layer1.push({ x: W * 0.15, y: H * 0.15 + i * H * 0.2 }); layer2.push({ x: W * 0.85, y: H * 0.15 + i * H * 0.2 }); }
    layer1.forEach((n, i) => drawFBNode(ctx, n.x, n.y, 6 * sc, i, a));
    layer2.forEach((n, i) => drawFBNode(ctx, n.x, n.y, 6 * sc, i + 4, a));
    const weights = ["+1.3", "-0.7", "+2.1", "+0.5", "-1.8", "+3.0", "+0.2", "-0.9"];
    let ei = 0;
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 2; j++) {
        const jj = (i + j) % 4;
        const eP = interpolate(frame, [10 + ei * 8, 25 + ei * 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        const w = weights[ei % weights.length];
        const wColor = w.startsWith("-") ? FB.red : FB.green;
        drawFBColorEdge(ctx, layer1[i].x, layer1[i].y, layer2[jj].x, layer2[jj].y, wColor, sc, a * eP * 0.4);
        drawFBText(ctx, w, (layer1[i].x + layer2[jj].x) / 2, (layer1[i].y + layer2[jj].y) / 2 - 5 * sc, 7 * sc, a * eP, "center", wColor);
        ei++;
      }
    }
    const glowP = interpolate(frame, [100, 120], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (glowP > 0) { ctx.globalAlpha = a * glowP * 0.08; ctx.fillStyle = FB.gold; ctx.fillRect(0, 0, W, H); }
    drawFBText(ctx, "EVERY WEIGHT FROM REAL DATA", W / 2, H * 0.93, 9 * sc, a * glowP, "center", FB.gold);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* V5: Scan line reveals weight numbers row by row */
const V5: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame); const a = fadeInOut(frame, DUR);
    const sc = Math.min(W, H) / 360;
    const scanY = interpolate(frame, [10, 110], [H * 0.05, H * 0.75], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = a * 0.3; ctx.strokeStyle = FB.teal; ctx.lineWidth = 2 * sc;
    ctx.beginPath(); ctx.moveTo(W * 0.05, scanY); ctx.lineTo(W * 0.95, scanY); ctx.stroke();
    const grad = ctx.createLinearGradient(0, scanY - 15, 0, scanY + 5);
    grad.addColorStop(0, "rgba(78,205,196,0)"); grad.addColorStop(0.5, "rgba(78,205,196,0.15)"); grad.addColorStop(1, "rgba(78,205,196,0)");
    ctx.globalAlpha = a; ctx.fillStyle = grad; ctx.fillRect(W * 0.05, scanY - 15, W * 0.9, 20);
    const rng = seeded(2505);
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 6; c++) {
        const px = W * 0.12 + c * W * 0.14, py = H * 0.08 + r * H * 0.09;
        if (py < scanY) {
          const val = (rng() * 4 - 2).toFixed(1);
          drawFBText(ctx, val, px, py, 7 * sc, a * 0.7, "center", parseFloat(val) < 0 ? FB.red : FB.green);
        } else { rng(); }
      }
    }
    const labelP = interpolate(frame, [100, 125], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "MEASURED WEIGHTS", W / 2, H * 0.88, 12 * sc, a * labelP, "center", FB.gold);
    drawFBText(ctx, "from real connectome", W / 2, H * 0.94, 8 * sc, a * labelP, "center", FB.text.dim);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* V6: Before/after — random "???" weights vs exact measured values */
const V6: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame); const a = fadeInOut(frame, DUR);
    const sc = Math.min(W, H) / 360;
    const p1 = interpolate(frame, [5, 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "RANDOM?", W * 0.25, H * 0.08, 10 * sc, a * p1, "center", FB.text.dim);
    for (let i = 0; i < 5; i++) drawFBText(ctx, "w = ???", W * 0.25, H * 0.18 + i * H * 0.12, 9 * sc, a * p1 * 0.4, "center", FB.text.dim);
    const p2 = interpolate(frame, [40, 75], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "EXACT", W * 0.75, H * 0.08, 10 * sc, a * p2, "center", FB.green);
    const exactW = ["+1.73", "-0.42", "+3.18", "+0.87", "-1.05"];
    exactW.forEach((w, i) => {
      const wP = interpolate(frame, [45 + i * 6, 60 + i * 6], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      drawFBText(ctx, "w = " + w, W * 0.75, H * 0.18 + i * H * 0.12, 9 * sc, a * p2 * wP, "center", w.startsWith("-") ? FB.red : FB.green);
    });
    const arrowP = interpolate(frame, [75, 90], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "\u2192", W / 2, H / 2, 16 * sc, a * arrowP, "center", FB.gold);
    const stampP = interpolate(frame, [95, 120], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "REAL FLY DATA", W / 2, H * 0.88, 14 * sc, a * stampP, "center", FB.gold);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* V7: Ring network with weight labels on each arc */
const V7: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame); const a = fadeInOut(frame, DUR);
    const sc = Math.min(W, H) / 360;
    const cx = W / 2, cy = H * 0.45;
    const n = 8, radius = Math.min(W, H) * 0.3;
    const nodes: { x: number; y: number }[] = [];
    for (let i = 0; i < n; i++) {
      const angle = (i / n) * Math.PI * 2 - Math.PI / 2;
      nodes.push({ x: cx + Math.cos(angle) * radius, y: cy + Math.sin(angle) * radius });
    }
    nodes.forEach((nd, i) => drawFBNode(ctx, nd.x, nd.y, 7 * sc, i, a));
    const weights = ["+2.1", "-1.3", "+0.7", "+1.9", "-0.5", "+3.4", "-0.8", "+1.1"];
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n;
      const eP = interpolate(frame, [15 + i * 10, 30 + i * 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const w = weights[i], wColor = w.startsWith("-") ? FB.red : FB.green;
      drawFBColorEdge(ctx, nodes[i].x, nodes[i].y, nodes[j].x, nodes[j].y, wColor, sc, a * eP * 0.5);
      drawFBText(ctx, w, (nodes[i].x + nodes[j].x) / 2, (nodes[i].y + nodes[j].y) / 2, 7 * sc, a * eP, "center", wColor);
    }
    const stampP = interpolate(frame, [100, 120], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "REAL DATA", cx, cy, 14 * sc, a * stampP, "center", FB.gold);
    drawFBText(ctx, "every connection measured", cx, H * 0.9, 8 * sc, a * stampP, "center", FB.text.dim);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* V8: Weight distribution histogram bar chart */
const V8: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame); const a = fadeInOut(frame, DUR);
    const sc = Math.min(W, H) / 360;
    drawFBText(ctx, "WEIGHT DISTRIBUTION", W / 2, H * 0.07, 10 * sc, a, "center", FB.gold);
    const bars = [3, 8, 15, 25, 40, 35, 20, 12, 6, 2];
    const barW = W * 0.07, x0 = W / 2 - (bars.length * barW) / 2, maxH = H * 0.55;
    bars.forEach((v, i) => {
      const bP = interpolate(frame, [10 + i * 6, 30 + i * 6], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const bH = (v / 40) * maxH * bP;
      const [hue] = cellHSL(i);
      ctx.globalAlpha = a * bP * 0.6; ctx.fillStyle = `hsla(${hue}, 50%, 60%, 0.7)`;
      ctx.fillRect(x0 + i * barW + 2, H * 0.75 - bH, barW - 4, bH);
      drawFBText(ctx, (i * 0.5 - 2).toFixed(1), x0 + i * barW + barW / 2, H * 0.79, 6 * sc, a * bP * 0.5, "center", FB.text.dim);
    });
    ctx.globalAlpha = a * 0.3; ctx.strokeStyle = FB.text.dim; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(x0, H * 0.75); ctx.lineTo(x0 + bars.length * barW, H * 0.75); ctx.stroke();
    const stampP = interpolate(frame, [85, 110], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "15 MILLION EXACT WEIGHTS", W / 2, H * 0.9, 11 * sc, a * stampP, "center", FB.gold);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* V9: Fly head silhouette with internal nodes and weight labels */
const V9: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame); const a = fadeInOut(frame, DUR);
    const sc = Math.min(W, H) / 360;
    const cx = W / 2, cy = H * 0.4;
    ctx.globalAlpha = a * 0.15; ctx.strokeStyle = FB.teal; ctx.lineWidth = 2 * sc;
    ctx.beginPath(); ctx.arc(cx, cy, 30 * sc, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx - 15 * sc, cy - 28 * sc);
    ctx.quadraticCurveTo(cx - 25 * sc, cy - 50 * sc, cx - 10 * sc, cy - 55 * sc); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx + 15 * sc, cy - 28 * sc);
    ctx.quadraticCurveTo(cx + 25 * sc, cy - 50 * sc, cx + 10 * sc, cy - 55 * sc); ctx.stroke();
    const rng = seeded(2509);
    const pts: { x: number; y: number }[] = [];
    for (let i = 0; i < 10; i++) {
      const angle = rng() * Math.PI * 2, dist = rng() * 24 * sc;
      pts.push({ x: cx + Math.cos(angle) * dist, y: cy + Math.sin(angle) * dist });
    }
    pts.forEach((p, i) => {
      const pP = interpolate(frame, [8 + i * 5, 20 + i * 5], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      drawFBNode(ctx, p.x, p.y, 3 * sc, i, a * pP);
    });
    const wVals = ["+1.2", "-0.6", "+2.8", "+0.3", "-1.5", "+1.8", "-0.4", "+2.2", "+0.9"];
    for (let i = 0; i < Math.min(9, pts.length - 1); i++) {
      const eP = interpolate(frame, [20 + i * 8, 40 + i * 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const wColor = wVals[i].startsWith("-") ? FB.red : FB.green;
      drawFBColorEdge(ctx, pts[i].x, pts[i].y, pts[i + 1].x, pts[i + 1].y, wColor, sc, a * eP * 0.3);
      drawFBText(ctx, wVals[i], (pts[i].x + pts[i + 1].x) / 2 + 8 * sc, (pts[i].y + pts[i + 1].y) / 2, 6 * sc, a * eP, "left", wColor);
    }
    const stampP = interpolate(frame, [100, 125], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "REAL FLY CONNECTOME", cx, H * 0.82, 12 * sc, a * stampP, "center", FB.gold);
    drawFBText(ctx, "every weight exact", cx, H * 0.9, 8 * sc, a * stampP, "center", FB.text.dim);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

export const VARIANTS_FB_025: VariantDef[] = [
  { id: "fb-025-v1", label: "Network with weight labels, REAL DATA stamp", component: V1 },
  { id: "fb-025-v2", label: "Matrix grid cells reveal weight values", component: V2 },
  { id: "fb-025-v3", label: "Two neurons, weight zooms in", component: V3 },
  { id: "fb-025-v4", label: "Cascade: edges light up with weights then glow", component: V4 },
  { id: "fb-025-v5", label: "EM scan line reveals measured weights", component: V5 },
  { id: "fb-025-v6", label: "Before/after: random vs exact weights", component: V6 },
  { id: "fb-025-v7", label: "Ring network with radial weight labels", component: V7 },
  { id: "fb-025-v8", label: "Histogram of weight distribution", component: V8 },
  { id: "fb-025-v9", label: "Fly head silhouette with connectome weights", component: V9 },
];
