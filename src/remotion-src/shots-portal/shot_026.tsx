import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantDef, VariantProps } from "../types";
import {
  C, seeded, accent, easeOutBack, drawBg, fadeInOut, stagger, staggerRaw,
  drawNode, drawNodeGradient, drawNodeDormant, drawEdge, drawEdgeGlow, drawEdgeFaint,
  drawHeader, drawCounter, drawPerson, drawNeuronShape, drawFlyOutline, drawPanel,
  drawCheck, drawXMark, drawSignalPulse, drawBarChart, drawThresholdLine, lerp,
} from "./portal-kit";

// Shot 026 — "So they opened the project up. Researchers from a hundred and twenty-seven labs"
// 120 frames. 9 variants: 127 labs visualization.

const DUR = 120;

// V1: Hub-and-spoke — central node connected to 127 lab nodes expanding
const V1: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const labs = useMemo(() => {
    const rng = seeded(2601);
    return Array.from({ length: 127 }, (_, i) => {
      const a = rng() * Math.PI * 2;
      const r = 50 + rng() * 90;
      return { x: Math.cos(a) * r, y: Math.sin(a) * r, i };
    });
  }, []);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height, s);
    const fo = fadeInOut(frame, DUR);
    ctx.globalAlpha = fo;
    drawHeader(ctx, width, height, s, frame, DUR, "Open Project", "127 labs joined");
    const cx = width / 2, cy = height / 2;
    drawNodeGradient(ctx, cx, cy, 8 * s, 0, fo);
    for (const lab of labs) {
      const t = stagger(frame, lab.i, 0.5, 8);
      if (t <= 0) continue;
      const lx = cx + lab.x * s, ly = cy + lab.y * s;
      drawEdgeFaint(ctx, cx, cy, lx, ly, s);
      drawNode(ctx, lx, ly, 2 * s * t, lab.i % 2, fo * t);
    }
    const shown = labs.filter((_, i) => stagger(frame, i, 0.5, 8) > 0).length;
    drawCounter(ctx, width, height, s, `${shown}`, "labs");
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

// V2: World map dots — scattered dots on a flat map layout
const V2: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const dots = useMemo(() => {
    const rng = seeded(2602);
    return Array.from({ length: 127 }, (_, i) => ({
      x: (rng() - 0.5) * 300, y: (rng() - 0.5) * 180, i,
    }));
  }, []);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height, s);
    const fo = fadeInOut(frame, DUR);
    ctx.globalAlpha = fo;
    drawHeader(ctx, width, height, s, frame, DUR, "Global Effort", "labs worldwide");
    const cx = width / 2, cy = height / 2;
    // Map outline (simple rectangle)
    ctx.strokeStyle = `rgba(200,200,215,${fo * 0.2})`;
    ctx.lineWidth = 1 * s;
    ctx.strokeRect(cx - 150 * s, cy - 90 * s, 300 * s, 180 * s);
    for (const d of dots) {
      const t = stagger(frame, d.i, 0.5, 6);
      if (t <= 0) continue;
      drawNode(ctx, cx + d.x * s, cy + d.y * s, 2.5 * s * t, d.i % 2, fo * t);
    }
    const shown = dots.filter((_, i) => stagger(frame, i, 0.5, 6) > 0).length;
    drawCounter(ctx, width, height, s, `${shown}`, "labs");
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

// V3: Counter rolling up to 127 with nodes radiating
const V3: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height, s);
    const fo = fadeInOut(frame, DUR);
    ctx.globalAlpha = fo;
    const cx = width / 2, cy = height * 0.45;
    const count = Math.floor(interpolate(frame, [10, 85], [0, 127], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
    // Big number
    ctx.fillStyle = C.text;
    ctx.font = `700 ${36 * s}px system-ui, sans-serif`;
    ctx.textAlign = "center";
    ctx.fillText(`${count}`, cx, cy);
    ctx.fillStyle = C.textDim;
    ctx.font = `${10 * s}px system-ui`;
    ctx.fillText("laboratories", cx, cy + 18 * s);
    // Ring of nodes around the number
    for (let i = 0; i < count && i < 127; i += 3) {
      const a = (i / 127) * Math.PI * 2 - Math.PI / 2;
      const r = 70 * s + (i % 7) * 4 * s;
      drawNode(ctx, cx + Math.cos(a) * r, cy + Math.sin(a) * r, 1.5 * s, i % 2, fo * 0.6);
    }
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

// V4: Concentric hexagonal rings of lab nodes
const V4: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const nodes = useMemo(() => {
    const result: { x: number; y: number; ring: number; i: number }[] = [];
    let idx = 0;
    for (let ring = 0; ring < 8; ring++) {
      const count = ring === 0 ? 1 : ring * 6;
      for (let j = 0; j < count && idx < 127; j++, idx++) {
        const a = (j / count) * Math.PI * 2;
        const r = ring * 18;
        result.push({ x: Math.cos(a) * r, y: Math.sin(a) * r, ring, i: idx });
      }
    }
    return result;
  }, []);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height, s);
    const fo = fadeInOut(frame, DUR);
    ctx.globalAlpha = fo;
    drawHeader(ctx, width, height, s, frame, DUR, "127 Labs", "joining the effort");
    const cx = width / 2, cy = height / 2;
    for (const n of nodes) {
      const t = stagger(frame, n.i, 0.5, 8);
      if (t <= 0) continue;
      drawNode(ctx, cx + n.x * s, cy + n.y * s, 2.5 * s * t, n.ring % 2, fo * t);
    }
    const shown = nodes.filter((_, i) => stagger(frame, i, 0.5, 8) > 0).length;
    drawCounter(ctx, width, height, s, `${shown}`, "labs");
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

// V5: Person silhouettes grouping into 127 clusters
const V5: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const groups = useMemo(() => {
    const rng = seeded(2605);
    return Array.from({ length: 42 }, (_, i) => ({
      x: (rng() - 0.5) * 280, y: (rng() - 0.5) * 220, i,
    }));
  }, []);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height, s);
    const fo = fadeInOut(frame, DUR);
    ctx.globalAlpha = fo;
    drawHeader(ctx, width, height, s, frame, DUR, "Open Science", "labs joining");
    const cx = width / 2, cy = height / 2;
    for (const g of groups) {
      const t = stagger(frame, g.i, 1, 8);
      if (t <= 0) continue;
      const gx = cx + g.x * s, gy = cy + g.y * s;
      drawPerson(ctx, gx, gy, 6 * s * t, accent(g.i, fo * t * 0.7));
      drawPerson(ctx, gx + 5 * s, gy + 2 * s, 5 * s * t, accent(g.i + 1, fo * t * 0.5));
      drawPerson(ctx, gx - 4 * s, gy + 3 * s, 5 * s * t, accent(g.i, fo * t * 0.4));
    }
    const shown = groups.filter((_, i) => stagger(frame, i, 1, 8) > 0).length;
    drawCounter(ctx, width, height, s, `${shown * 3}`, "researchers");
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

// V6: Grid of panels, each representing a lab, lighting up one by one
const V6: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height, s);
    const fo = fadeInOut(frame, DUR);
    ctx.globalAlpha = fo;
    drawHeader(ctx, width, height, s, frame, DUR, "Lab Grid", "127 institutions");
    const cols = 13, rows = 10;
    const pw = (width * 0.8) / cols, ph = (height * 0.6) / rows;
    const ox = width * 0.1, oy = height * 0.2;
    let count = 0;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const idx = r * cols + c;
        if (idx >= 127) break;
        const t = stagger(frame, idx, 0.4, 6);
        if (t <= 0) continue;
        count++;
        drawPanel(ctx, ox + c * pw + 1, oy + r * ph + 1, pw - 2, ph - 2, idx % 2, fo * t);
        drawNode(ctx, ox + c * pw + pw / 2, oy + r * ph + ph / 2, 2 * s * t, idx % 2, fo * t);
      }
    }
    drawCounter(ctx, width, height, s, `${count}`, "labs");
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

// V7: Starburst — 127 rays from center, nodes at tips
const V7: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height, s);
    const fo = fadeInOut(frame, DUR);
    ctx.globalAlpha = fo;
    drawHeader(ctx, width, height, s, frame, DUR, "Starburst", "127 labs radiating");
    const cx = width / 2, cy = height / 2;
    drawNodeGradient(ctx, cx, cy, 6 * s, 0, fo);
    let shown = 0;
    for (let i = 0; i < 127; i++) {
      const t = stagger(frame, i, 0.5, 8);
      if (t <= 0) continue;
      shown++;
      const a = (i / 127) * Math.PI * 2 - Math.PI / 2;
      const r = (60 + (i % 5) * 12) * s * t;
      const tx = cx + Math.cos(a) * r, ty = cy + Math.sin(a) * r;
      drawEdge(ctx, cx, cy, tx, ty, i % 2, fo * t * 0.15, s);
      drawNode(ctx, tx, ty, 2 * s * t, i % 2, fo * t);
    }
    drawCounter(ctx, width, height, s, `${shown}`, "labs");
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

// V8: Network mesh — 127 nodes with interconnections forming web
const V8: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const nodes = useMemo(() => {
    const rng = seeded(2608);
    return Array.from({ length: 127 }, (_, i) => ({
      x: (rng() - 0.5) * 280, y: (rng() - 0.5) * 230, i,
    }));
  }, []);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height, s);
    const fo = fadeInOut(frame, DUR);
    ctx.globalAlpha = fo;
    drawHeader(ctx, width, height, s, frame, DUR, "Mesh", "interconnected labs");
    const cx = width / 2, cy = height / 2;
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        if (Math.hypot(nodes[i].x - nodes[j].x, nodes[i].y - nodes[j].y) < 40)
          drawEdgeFaint(ctx, cx + nodes[i].x * s, cy + nodes[i].y * s, cx + nodes[j].x * s, cy + nodes[j].y * s, s);
      }
    }
    let shown = 0;
    for (const n of nodes) {
      const t = stagger(frame, n.i, 0.5, 6);
      if (t <= 0) continue;
      shown++;
      drawNode(ctx, cx + n.x * s, cy + n.y * s, 2 * s * t, n.i % 2, fo * t);
    }
    drawCounter(ctx, width, height, s, `${shown}`, "labs");
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

// V9: Cascade unlock: lock icon opening, then nodes pouring out
const V9: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height, s);
    const fo = fadeInOut(frame, DUR);
    ctx.globalAlpha = fo;
    drawHeader(ctx, width, height, s, frame, DUR, "Opened Up", "project unlocked");
    const cx = width / 2, cy = height * 0.35;
    // Lock body
    const open = interpolate(frame, [10, 35], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.strokeStyle = accent(0, fo * 0.6);
    ctx.lineWidth = 3 * s;
    const lockW = 20 * s, lockH = 16 * s;
    ctx.strokeRect(cx - lockW / 2, cy, lockW, lockH);
    // Shackle
    const shackleY = cy - 10 * s * (1 - open);
    ctx.beginPath();
    ctx.arc(cx, cy - (1 - open) * 5 * s, 8 * s, Math.PI, 0);
    ctx.stroke();
    // Nodes pouring out
    const rng = seeded(2609);
    let shown = 0;
    if (open > 0.5) {
      for (let i = 0; i < 127; i++) {
        const t = stagger(frame - 30, i, 0.5, 6);
        if (t <= 0) continue;
        shown++;
        const a = rng() * Math.PI * 2;
        const r = 30 * s + rng() * 80 * s * t;
        drawNode(ctx, cx + Math.cos(a) * r, cy + lockH + Math.sin(a) * r * 0.6 + 15 * s, 1.8 * s * t, i % 2, fo * t);
      }
    }
    drawCounter(ctx, width, height, s, `${shown}`, "labs");
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

export const VARIANTS_SHOT_026: VariantDef[] = [
  { id: "026-hub-spoke", label: "Hub and spoke 127 labs", component: V1 },
  { id: "026-world-dots", label: "World map lab dots", component: V2 },
  { id: "026-counter-127", label: "Counter rolling to 127", component: V3 },
  { id: "026-hex-rings", label: "Concentric hex rings", component: V4 },
  { id: "026-person-groups", label: "Person silhouette groups", component: V5 },
  { id: "026-lab-grid", label: "Panel grid lighting up", component: V6 },
  { id: "026-starburst", label: "Starburst rays", component: V7 },
  { id: "026-mesh-web", label: "Network mesh", component: V8 },
  { id: "026-unlock", label: "Cascade unlock", component: V9 },
];
