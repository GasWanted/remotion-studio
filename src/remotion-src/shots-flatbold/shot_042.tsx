import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantDef, VariantProps } from "../types";
import { FB, seeded, drawFBBg, drawFBNode, drawFBEdge, drawFBText, drawFBCounter, fadeInOut, cellHSL, drawFBColorEdge, drawPersonBlob } from "./flatbold-kit";

/* Shot 042 — "We know exactly which wires lead to which behaviors."
   90 frames (3s). Color-coded labeled pathways. */

const DUR = 90;

function stagger(frame: number, idx: number, delay: number, dur: number) {
  const s = idx * delay; if (frame < s) return 0; if (frame > s + dur) return 1; return (frame - s) / dur;
}

/* ── V1: Central brain hub → colored paths → behavior labels ── */
const V1: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, DUR);
    const cx = W / 2, cy = H * 0.35;
    drawFBNode(ctx, cx, cy, 14, 4, a, frame);
    drawFBText(ctx, "BRAIN", cx, cy - 20, 7, a, "center", FB.text.dim);
    const paths = [
      { label: "JUMP", color: FB.red, angle: -1.2 },
      { label: "FEED", color: FB.gold, angle: -0.4 },
      { label: "WALK", color: FB.green, angle: 0.4 },
      { label: "GROOM", color: FB.teal, angle: 1.2 },
    ];
    paths.forEach((p, i) => {
      const t = stagger(frame, i, 8, 15);
      const endX = cx + Math.cos(p.angle) * W * 0.32;
      const endY = H * 0.78;
      // Colored path
      drawFBColorEdge(ctx, cx, cy + 14, endX, endY - 8, p.color, 1, a * t * 0.6);
      // Behavior node at end
      drawFBNode(ctx, endX, endY, 8, i, a * t, frame);
      drawFBText(ctx, p.label, endX, endY + 14, 7, a * t, "center", p.color);
      // Traveling dot
      if (t > 0 && t < 1) {
        const dotX = cx + (endX - cx) * t;
        const dotY = cy + 14 + (endY - 8 - cy - 14) * t;
        ctx.globalAlpha = a * 0.7; ctx.fillStyle = p.color;
        ctx.beginPath(); ctx.arc(dotX, dotY, 3, 0, Math.PI * 2); ctx.fill();
      }
    });
    drawFBText(ctx, "WIRES \u2192 BEHAVIORS", cx, H * 0.92, 9, a, "center", FB.gold);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* ── V2: Subway/metro map — colored lines with station dots ── */
const V2: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, DUR);
    const lines = [
      { color: FB.red, label: "ESCAPE", stops: [[0.1, 0.3], [0.3, 0.35], [0.5, 0.25], [0.75, 0.2]] },
      { color: FB.gold, label: "FEED", stops: [[0.1, 0.5], [0.25, 0.55], [0.45, 0.5], [0.7, 0.45]] },
      { color: FB.teal, label: "GROOM", stops: [[0.15, 0.7], [0.35, 0.72], [0.55, 0.68], [0.8, 0.7]] },
    ];
    lines.forEach((line, li) => {
      const lineT = stagger(frame, li, 12, 20);
      // Draw line segments
      for (let s = 0; s < line.stops.length - 1; s++) {
        const segT = stagger(frame, li * 4 + s, 5, 10);
        const [x1, y1] = line.stops[s];
        const [x2, y2] = line.stops[s + 1];
        ctx.globalAlpha = a * segT * 0.6; ctx.strokeStyle = line.color; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(x1 * W, y1 * H); ctx.lineTo(x2 * W, y2 * H); ctx.stroke();
      }
      // Station dots
      line.stops.forEach(([sx, sy], si) => {
        const dt = stagger(frame, li * 4 + si, 5, 10);
        ctx.globalAlpha = a * dt; ctx.fillStyle = line.color;
        ctx.beginPath(); ctx.arc(sx * W, sy * H, 4, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#1a1020";
        ctx.beginPath(); ctx.arc(sx * W, sy * H, 2, 0, Math.PI * 2); ctx.fill();
      });
      // Label at end
      const last = line.stops[line.stops.length - 1];
      drawFBText(ctx, line.label, last[0] * W + 15, last[1] * H, 7, a * lineT, "left", line.color);
    });
    drawFBText(ctx, "NEURAL PATHWAYS", W / 2, H * 0.08, 10, a, "center", FB.gold);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* ── V3: Wiring diagram — neurons connected with colored arrows ── */
const V3: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, DUR);
    // Input neurons (left column)
    const inputs = ["SUGAR", "LOOMING", "TOUCH"];
    const iColors = [FB.gold, FB.red, FB.teal];
    // Output behaviors (right column)
    const outputs = ["FEED", "ESCAPE", "GROOM"];
    const oColors = [FB.gold, FB.red, FB.teal];
    inputs.forEach((label, i) => {
      const y = H * 0.2 + i * H * 0.25;
      const t = stagger(frame, i, 8, 12);
      drawFBNode(ctx, W * 0.12, y, 6, i + 2, a * t, frame);
      drawFBText(ctx, label, W * 0.12, y + 12, 6, a * t, "center", iColors[i]);
    });
    outputs.forEach((label, i) => {
      const y = H * 0.2 + i * H * 0.25;
      const t = stagger(frame, i + 3, 8, 12);
      drawFBNode(ctx, W * 0.88, y, 6, i + 2, a * t, frame);
      drawFBText(ctx, label, W * 0.88, y + 12, 6, a * t, "center", oColors[i]);
    });
    // Connecting arrows (matched pairs)
    for (let i = 0; i < 3; i++) {
      const y = H * 0.2 + i * H * 0.25;
      const t = stagger(frame, i + 6, 6, 12);
      // Middle relay neurons
      drawFBNode(ctx, W * 0.38, y, 5, i + 2, a * t, frame);
      drawFBNode(ctx, W * 0.62, y, 5, i + 2, a * t, frame);
      drawFBColorEdge(ctx, W * 0.18, y, W * 0.33, y, iColors[i], 1, a * t * 0.5);
      drawFBColorEdge(ctx, W * 0.43, y, W * 0.57, y, iColors[i], 1, a * t * 0.5);
      drawFBColorEdge(ctx, W * 0.67, y, W * 0.82, y, oColors[i], 1, a * t * 0.5);
    }
    drawFBText(ctx, "EXACT WIRING", W / 2, H * 0.92, 9, a, "center", FB.gold);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* ── V4: Circuit board traces — clean right-angle paths in different colors ── */
const V4: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, DUR);
    const traces = [
      { color: FB.red, pts: [[0.1, 0.2], [0.3, 0.2], [0.3, 0.5], [0.6, 0.5], [0.6, 0.2], [0.85, 0.2]], label: "ESCAPE" },
      { color: FB.gold, pts: [[0.1, 0.45], [0.2, 0.45], [0.2, 0.35], [0.5, 0.35], [0.5, 0.5], [0.85, 0.5]], label: "FEED" },
      { color: FB.teal, pts: [[0.1, 0.7], [0.35, 0.7], [0.35, 0.6], [0.65, 0.6], [0.65, 0.75], [0.85, 0.75]], label: "GROOM" },
    ];
    traces.forEach((tr, ti) => {
      const lineT = stagger(frame, ti, 10, 20);
      const numSegs = tr.pts.length - 1;
      for (let s = 0; s < numSegs; s++) {
        const segP = Math.min(1, Math.max(0, (lineT * numSegs - s)));
        if (segP <= 0) continue;
        const [x1, y1] = tr.pts[s];
        const [x2, y2] = tr.pts[s + 1];
        const ex = x1 + (x2 - x1) * segP;
        const ey = y1 + (y2 - y1) * segP;
        ctx.globalAlpha = a * 0.6; ctx.strokeStyle = tr.color; ctx.lineWidth = 2.5;
        ctx.beginPath(); ctx.moveTo(x1 * W, y1 * H); ctx.lineTo(ex * W, ey * H); ctx.stroke();
      }
      // Start/end dots
      const [sx, sy] = tr.pts[0];
      ctx.globalAlpha = a * lineT; ctx.fillStyle = tr.color;
      ctx.beginPath(); ctx.arc(sx * W, sy * H, 4, 0, Math.PI * 2); ctx.fill();
      if (lineT >= 1) {
        const [ex, ey] = tr.pts[tr.pts.length - 1];
        ctx.beginPath(); ctx.arc(ex * W, ey * H, 4, 0, Math.PI * 2); ctx.fill();
        drawFBText(ctx, tr.label, ex * W + 5, ey * H - 10, 7, a, "left", tr.color);
      }
    });
    drawFBText(ctx, "KNOWN CIRCUITS", W / 2, H * 0.92, 10, a, "center", FB.gold);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* ── V5: Tree diagram — root splits into behavior branches ── */
const V5: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, DUR);
    const cx = W / 2, rootY = H * 0.15;
    // Root
    const rootP = interpolate(frame, [5, 15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBNode(ctx, cx, rootY, 10, 4, a * rootP, frame);
    drawFBText(ctx, "SENSORY INPUT", cx, rootY - 16, 7, a * rootP, "center", FB.text.dim);
    // Branch points
    const branches = [
      { x: W * 0.18, label: "ESCAPE", color: FB.red },
      { x: W * 0.38, label: "FEED", color: FB.gold },
      { x: W * 0.62, label: "WALK", color: FB.green },
      { x: W * 0.82, label: "GROOM", color: FB.teal },
    ];
    const splitY = H * 0.38;
    branches.forEach((b, i) => {
      const t = stagger(frame, i, 8, 15);
      // Line from root to split
      drawFBColorEdge(ctx, cx, rootY + 12, b.x, splitY - 6, b.color, 1, a * t * 0.5);
      drawFBNode(ctx, b.x, splitY, 6, i, a * t, frame);
      // Line from split to behavior
      const endY = H * 0.72;
      drawFBColorEdge(ctx, b.x, splitY + 6, b.x, endY - 6, b.color, 1, a * t * 0.4);
      drawFBNode(ctx, b.x, endY, 8, i, a * t, frame);
      drawFBText(ctx, b.label, b.x, endY + 14, 7, a * t, "center", b.color);
    });
    drawFBText(ctx, "KNOWN PATHWAYS", cx, H * 0.92, 10, a, "center", FB.gold);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* ── V6: Labeled arrows on a brain — each arrow a different color/behavior ── */
const V6: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, DUR);
    const cx = W / 2, cy = H * 0.42;
    // Brain blob
    ctx.globalAlpha = a * 0.15; ctx.fillStyle = FB.purple;
    ctx.beginPath(); ctx.ellipse(cx, cy, W * 0.25, H * 0.22, 0, 0, Math.PI * 2); ctx.fill();
    // Labeled arrows pointing to different regions
    const arrows = [
      { fromX: W * 0.02, fromY: H * 0.2, toX: cx - W * 0.15, toY: cy - H * 0.1, label: "ESCAPE", color: FB.red },
      { fromX: W * 0.02, fromY: H * 0.5, toX: cx - W * 0.18, toY: cy + H * 0.05, label: "FEED", color: FB.gold },
      { fromX: W * 0.98, fromY: H * 0.2, toX: cx + W * 0.15, toY: cy - H * 0.08, label: "WALK", color: FB.green },
      { fromX: W * 0.98, fromY: H * 0.55, toX: cx + W * 0.12, toY: cy + H * 0.08, label: "GROOM", color: FB.teal },
    ];
    arrows.forEach((arr, i) => {
      const t = stagger(frame, i, 8, 15);
      // Arrow line
      ctx.globalAlpha = a * t * 0.5; ctx.strokeStyle = arr.color; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(arr.fromX, arr.fromY); ctx.lineTo(arr.toX, arr.toY); ctx.stroke();
      // Arrowhead
      const dx = arr.toX - arr.fromX, dy = arr.toY - arr.fromY;
      const len = Math.sqrt(dx * dx + dy * dy);
      const ux = dx / len, uy = dy / len;
      ctx.fillStyle = arr.color;
      ctx.beginPath();
      ctx.moveTo(arr.toX, arr.toY);
      ctx.lineTo(arr.toX - ux * 6 - uy * 4, arr.toY - uy * 6 + ux * 4);
      ctx.lineTo(arr.toX - ux * 6 + uy * 4, arr.toY - uy * 6 - ux * 4);
      ctx.closePath(); ctx.fill();
      // Label
      drawFBText(ctx, arr.label, arr.fromX + (arr.fromX < cx ? 20 : -20), arr.fromY, 7, a * t, arr.fromX < cx ? "left" : "right", arr.color);
      // Dot at target
      drawFBNode(ctx, arr.toX, arr.toY, 4, i, a * t, frame);
    });
    drawFBText(ctx, "MAPPED WIRES", cx, H * 0.88, 10, a, "center", FB.gold);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* ── V7: Color-coded list — staggered rows with wire → behavior ── */
const V7: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, DUR);
    const rows = [
      { wire: "Giant Fiber", behavior: "JUMP", color: FB.red },
      { wire: "MN9 Motor", behavior: "FEED", color: FB.gold },
      { wire: "aDN1 Descend.", behavior: "GROOM", color: FB.teal },
      { wire: "DNa01 Descend.", behavior: "TURN", color: FB.blue },
      { wire: "P9 Interneuron", behavior: "WALK", color: FB.green },
    ];
    rows.forEach((row, i) => {
      const y = H * 0.15 + i * H * 0.14;
      const t = stagger(frame, i, 8, 12);
      // Wire name
      drawFBText(ctx, row.wire, W * 0.25, y, 7, a * t, "center", FB.text.primary);
      // Arrow
      ctx.globalAlpha = a * t * 0.5; ctx.strokeStyle = row.color; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(W * 0.42, y); ctx.lineTo(W * 0.55, y); ctx.stroke();
      ctx.fillStyle = row.color; ctx.beginPath();
      ctx.moveTo(W * 0.55, y); ctx.lineTo(W * 0.53, y - 3); ctx.lineTo(W * 0.53, y + 3); ctx.closePath(); ctx.fill();
      // Behavior
      drawFBText(ctx, row.behavior, W * 0.68, y, 9, a * t, "center", row.color);
      // Color dot
      drawFBNode(ctx, W * 0.08, y, 5, i, a * t, frame);
    });
    drawFBText(ctx, "KNOWN WIRING", W / 2, H * 0.92, 10, a, "center", FB.gold);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* ── V8: Radial layout — behaviors around circle, colored spokes from center ── */
const V8: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, DUR);
    const cx = W / 2, cy = H * 0.45;
    drawFBNode(ctx, cx, cy, 10, 4, a, frame);
    const behaviors = ["JUMP", "FEED", "WALK", "GROOM", "TURN", "ESCAPE"];
    const bColors = [FB.red, FB.gold, FB.green, FB.teal, FB.blue, FB.purple];
    const dist = Math.min(W, H) * 0.3;
    behaviors.forEach((b, i) => {
      const ang = (i / behaviors.length) * Math.PI * 2 - Math.PI / 2;
      const t = stagger(frame, i, 6, 12);
      const bx = cx + Math.cos(ang) * dist;
      const by = cy + Math.sin(ang) * dist;
      // Spoke
      drawFBColorEdge(ctx, cx, cy, bx, by, bColors[i], 1, a * t * 0.4);
      // Behavior node
      drawFBNode(ctx, bx, by, 7, i, a * t, frame);
      drawFBText(ctx, b, bx + Math.cos(ang) * 15, by + Math.sin(ang) * 15, 6, a * t, "center", bColors[i]);
    });
    drawFBText(ctx, "EVERY WIRE MAPPED", cx, H * 0.92, 9, a, "center", FB.gold);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* ── V9: Parallel streams — horizontal colored bands, each labeled ── */
const V9: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, DUR);
    const streams = [
      { label: "ESCAPE CIRCUIT", color: FB.red },
      { label: "FEEDING CIRCUIT", color: FB.gold },
      { label: "WALKING CIRCUIT", color: FB.green },
      { label: "GROOMING CIRCUIT", color: FB.teal },
    ];
    const bandH = H * 0.12, gap = H * 0.05;
    const totalH = streams.length * bandH + (streams.length - 1) * gap;
    const startY = H / 2 - totalH / 2;
    streams.forEach((s, i) => {
      const y = startY + i * (bandH + gap);
      const t = stagger(frame, i, 8, 15);
      const flowP = interpolate(frame, [i * 8 + 10, i * 8 + 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      // Band background
      ctx.globalAlpha = a * t * 0.15; ctx.fillStyle = s.color;
      ctx.fillRect(W * 0.05, y, (W * 0.9) * flowP, bandH);
      // Flow particles
      for (let p = 0; p < 5; p++) {
        const px = (W * 0.05 + ((frame * 2 + p * W * 0.15) % (W * 0.9))) * flowP;
        if (px > 0) {
          ctx.globalAlpha = a * t * 0.5; ctx.fillStyle = s.color;
          ctx.beginPath(); ctx.arc(px + W * 0.05, y + bandH / 2, 2, 0, Math.PI * 2); ctx.fill();
        }
      }
      // Label
      drawFBText(ctx, s.label, W / 2, y + bandH / 2, 8, a * t, "center", s.color);
    });
    drawFBText(ctx, "PARALLEL CIRCUITS", W / 2, H * 0.08, 10, a, "center", FB.gold);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

export const VARIANTS_FB_042: VariantDef[] = [
  { id: "fb-042-v1", label: "Central hub with colored paths to behaviors", component: V1 },
  { id: "fb-042-v2", label: "Subway map with colored lines", component: V2 },
  { id: "fb-042-v3", label: "Wiring diagram: inputs to outputs", component: V3 },
  { id: "fb-042-v4", label: "Circuit board traces in different colors", component: V4 },
  { id: "fb-042-v5", label: "Tree diagram branching to behaviors", component: V5 },
  { id: "fb-042-v6", label: "Labeled arrows on brain blob", component: V6 },
  { id: "fb-042-v7", label: "Color-coded wire-to-behavior list", component: V7 },
  { id: "fb-042-v8", label: "Radial layout with colored spokes", component: V8 },
  { id: "fb-042-v9", label: "Parallel colored stream bands", component: V9 },
];
