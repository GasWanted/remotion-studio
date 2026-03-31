import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantDef, VariantProps } from "../types";
import {
  C, seeded, accent, easeOutBack, drawBg, fadeInOut, stagger, staggerRaw,
  drawNode, drawNodeGradient, drawNodeDormant, drawEdge, drawEdgeGlow, drawEdgeFaint,
  drawHeader, drawCounter, drawPerson, drawNeuronShape, drawFlyOutline, drawPanel,
  drawCheck, drawXMark, drawSignalPulse, drawBarChart, drawThresholdLine, lerp,
} from "./portal-kit";

// Shot 043 — "every neuron following that same rule, every connection weighted exactly as measured."
// 9 variants — bio to digital transformation (DUR=150)

const DUR = 150;

const V1: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const positions = useMemo(() => {
    const rng = seeded(4301);
    return Array.from({ length: 30 }, () => ({
      bioX: rng() * width * 0.35 + width * 0.05,
      bioY: rng() * height * 0.7 + height * 0.15,
      digX: rng() * width * 0.35 + width * 0.6,
      digY: rng() * height * 0.7 + height * 0.15,
    }));
  }, [width, height]);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height, s);
    const a = fadeInOut(frame, DUR);
    ctx.globalAlpha = a;
    const morph = interpolate(frame, [20, 100], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    for (let i = 0; i < 30; i++) {
      const p = positions[i];
      const x = lerp(p.bioX, p.digX, morph);
      const y = lerp(p.bioY, p.digY, morph);
      if (morph < 0.5) {
        const blobR = (4 + Math.sin(i * 1.3) * 2) * s;
        ctx.fillStyle = accent(i, a * (1 - morph * 2) * 0.4);
        ctx.beginPath();
        for (let t = 0; t < Math.PI * 2; t += 0.3) {
          const r = blobR * (1 + Math.sin(t * 3 + i) * 0.3);
          const bx = x + Math.cos(t) * r, by = y + Math.sin(t) * r;
          t === 0 ? ctx.moveTo(bx, by) : ctx.lineTo(bx, by);
        }
        ctx.closePath(); ctx.fill();
      }
      if (morph > 0.3) {
        const nodeA = interpolate(morph, [0.3, 0.7], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        drawNode(ctx, x, y, 3 * s * nodeA, i % 2, a * nodeA);
      }
    }
    ctx.fillStyle = C.textDim; ctx.font = `${10 * s}px system-ui`; ctx.textAlign = "center";
    ctx.fillText("\u2192", width / 2, height / 2);
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={ref} width={width} height={height} /></div>;
};

const V2: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height, s);
    const a = fadeInOut(frame, DUR);
    ctx.globalAlpha = a;
    const cx = width / 2, cy = height / 2;
    drawHeader(ctx, width, height, s, frame, DUR, "Biology \u2192 Simulation");
    const leftA = interpolate(frame, [5, 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawNeuronShape(ctx, cx - 55 * s, cy, 40 * s * leftA, a, frame);
    const arrowA = staggerRaw(frame, 0, 40, 15);
    ctx.globalAlpha = a * arrowA;
    ctx.fillStyle = C.textDim; ctx.font = `${14 * s}px system-ui`; ctx.textAlign = "center";
    ctx.fillText("\u2192", cx, cy);
    ctx.globalAlpha = a;
    const rightA = staggerRaw(frame, 0, 55, 25);
    const netNodes = [{ x: cx + 40 * s, y: cy - 20 * s }, { x: cx + 40 * s, y: cy + 20 * s }, { x: cx + 70 * s, y: cy }];
    for (let i = 0; i < 3; i++) {
      drawNode(ctx, netNodes[i].x, netNodes[i].y, 5 * s * rightA, i % 2, a);
      for (let j = i + 1; j < 3; j++) drawEdge(ctx, netNodes[i].x, netNodes[i].y, netNodes[j].x, netNodes[j].y, 0, a * 0.2 * rightA, s);
    }
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={ref} width={width} height={height} /></div>;
};

const V3: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const netNodes = useMemo(() => {
    const rng = seeded(4333);
    const cx = width / 2, cy = height / 2;
    const monW = 120 * s, monH = 80 * s;
    return Array.from({ length: 12 }, () => ({
      x: cx - monW / 2 + 10 * s + rng() * (monW - 20 * s),
      y: cy - monH / 2 + 10 * s + rng() * (monH - 20 * s),
    }));
  }, [width, height, s]);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height, s);
    const a = fadeInOut(frame, DUR);
    ctx.globalAlpha = a;
    const cx = width / 2, cy = height / 2;
    const monW = 120 * s, monH = 80 * s;
    ctx.strokeStyle = accent(0, a * 0.3); ctx.lineWidth = 2 * s;
    ctx.strokeRect(cx - monW / 2, cy - monH / 2, monW, monH);
    ctx.beginPath(); ctx.moveTo(cx - 15 * s, cy + monH / 2); ctx.lineTo(cx + 15 * s, cy + monH / 2);
    ctx.lineTo(cx + 10 * s, cy + monH / 2 + 12 * s); ctx.lineTo(cx - 10 * s, cy + monH / 2 + 12 * s); ctx.closePath(); ctx.stroke();
    const netA = interpolate(frame, [15, 60], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const count = Math.floor(netA * 12);
    for (let i = 0; i < count; i++) {
      drawNode(ctx, netNodes[i].x, netNodes[i].y, 2.5 * s, i % 2, a * 0.7);
      if (i > 0) drawEdgeFaint(ctx, netNodes[i].x, netNodes[i].y, netNodes[(i + 3) % count].x, netNodes[(i + 3) % count].y, s);
    }
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={ref} width={width} height={height} /></div>;
};

const V4: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const nodeData = useMemo(() => {
    const rng = seeded(4344);
    return Array.from({ length: 25 }, () => ({ angle: rng() * Math.PI * 2, dist: rng() * 50 }));
  }, []);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height, s);
    const a = fadeInOut(frame, DUR);
    ctx.globalAlpha = a;
    const cx = width / 2, cy = height / 2;
    const morph = interpolate(frame, [10, 90], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFlyOutline(ctx, cx, cy, 70 * s, a * (1 - morph * 0.7));
    const count = Math.floor(morph * 25);
    for (let i = 0; i < count; i++) {
      const nx = cx + Math.cos(nodeData[i].angle) * nodeData[i].dist * s;
      const ny = cy + Math.sin(nodeData[i].angle) * nodeData[i].dist * s;
      drawNode(ctx, nx, ny, 2.5 * s, i % 2, a * morph);
    }
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={ref} width={width} height={height} /></div>;
};

const V5: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height, s);
    const a = fadeInOut(frame, DUR);
    ctx.globalAlpha = a;
    const cx = width / 2, cy = height / 2;
    const progress = interpolate(frame, [10, 100], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const gridCols = 8, gridRows = 6;
    const cellW = width * 0.7 / gridCols, cellH = height * 0.6 / gridRows;
    const startX = width * 0.15, startY = height * 0.2;
    const total = gridCols * gridRows;
    const shown = Math.floor(progress * total);
    for (let r = 0; r < gridRows; r++) {
      for (let c = 0; c < gridCols; c++) {
        const idx = r * gridCols + c;
        if (idx < shown) {
          const nx = startX + c * cellW + cellW / 2;
          const ny = startY + r * cellH + cellH / 2;
          drawNode(ctx, nx, ny, 3 * s, idx % 2, a * 0.6);
        }
      }
    }
    ctx.fillStyle = C.textDim; ctx.font = `${8 * s}px system-ui`; ctx.textAlign = "center";
    ctx.fillText("same rule, every neuron", cx, height * 0.88);
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={ref} width={width} height={height} /></div>;
};

const V6: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const digNodes = useMemo(() => {
    const rng = seeded(4366);
    const panelW = width * 0.38, panelH = height * 0.65;
    return Array.from({ length: 8 }, () => ({
      x: width * 0.57 + 15 * s + rng() * (panelW - 30 * s),
      y: height * 0.17 + 15 * s + rng() * (panelH - 30 * s),
    }));
  }, [width, height, s]);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height, s);
    const a = fadeInOut(frame, DUR);
    ctx.globalAlpha = a;
    const cx = width / 2, cy = height / 2;
    const panelW = width * 0.38, panelH = height * 0.65;
    drawPanel(ctx, width * 0.05, height * 0.17, panelW, panelH, 0, a * 0.4);
    drawPanel(ctx, width * 0.57, height * 0.17, panelW, panelH, 1, a * 0.4);
    ctx.fillStyle = C.blue; ctx.font = `600 ${8 * s}px system-ui`; ctx.textAlign = "center";
    ctx.fillText("Biological", width * 0.05 + panelW / 2, height * 0.14);
    ctx.fillStyle = C.orange;
    ctx.fillText("Simulation", width * 0.57 + panelW / 2, height * 0.14);
    const bioA = staggerRaw(frame, 0, 10, 20);
    drawNeuronShape(ctx, width * 0.05 + panelW / 2, cy, 35 * s * bioA, a, frame);
    const digA = staggerRaw(frame, 0, 40, 20);
    for (let i = 0; i < 8; i++) drawNode(ctx, digNodes[i].x, digNodes[i].y, 3 * s * digA, i % 2, a * digA);
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={ref} width={width} height={height} /></div>;
};

const V7: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height, s);
    const a = fadeInOut(frame, DUR);
    ctx.globalAlpha = a;
    const cx = width / 2, cy = height / 2;
    const ta = stagger(frame, 0, 5, 15);
    ctx.fillStyle = C.text; ctx.font = `600 ${11 * s * ta}px system-ui`; ctx.textAlign = "center";
    ctx.fillText("if (sum > T) fire()", cx, cy - 55 * s);
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 5; c++) {
        const idx = r * 5 + c;
        const sa = stagger(frame, idx, 2, 8);
        if (sa > 0) {
          const nx = cx - 50 * s + c * 25 * s;
          const ny = cy - 20 * s + r * 25 * s;
          drawNode(ctx, nx, ny, 3.5 * s * sa, idx % 2, a * 0.6);
        }
      }
    }
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={ref} width={width} height={height} /></div>;
};

const V8: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const blobData = useMemo(() => {
    const rng = seeded(4388);
    return Array.from({ length: 15 }, () => ({
      x: rng() * width * 0.7 + width * 0.15,
      y: rng() * height * 0.7 + height * 0.15,
      seed: rng() * 100,
    }));
  }, [width, height]);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height, s);
    const a = fadeInOut(frame, DUR);
    ctx.globalAlpha = a;
    const morph = interpolate(frame, [20, 90], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    for (let i = 0; i < 15; i++) {
      const { x, y, seed } = blobData[i];
      if (morph < 0.7) {
        ctx.fillStyle = accent(i, a * (1 - morph) * 0.3);
        ctx.beginPath();
        for (let t = 0; t < Math.PI * 2; t += 0.4) {
          const r = 5 * s * (1 + Math.sin(t * 2 + seed) * 0.4);
          const bx = x + Math.cos(t) * r, by = y + Math.sin(t) * r;
          t < 0.1 ? ctx.moveTo(bx, by) : ctx.lineTo(bx, by);
        }
        ctx.closePath(); ctx.fill();
      }
      if (morph > 0.3) {
        const na = interpolate(morph, [0.3, 0.8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        drawNode(ctx, x, y, 3 * s * na, i % 2, a * na);
      }
    }
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={ref} width={width} height={height} /></div>;
};

const V9: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const simNodes = useMemo(() => {
    const rng = seeded(4399);
    return Array.from({ length: 20 }, () => ({
      x: rng() * width * 0.8 + width * 0.1,
      y: rng() * height * 0.7 + height * 0.15,
    }));
  }, [width, height]);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height, s);
    const a = fadeInOut(frame, DUR);
    ctx.globalAlpha = a;
    const cx = width / 2;
    for (let i = 0; i < 20; i++) {
      const j = (i * 3 + 2) % 20;
      drawEdgeFaint(ctx, simNodes[i].x, simNodes[i].y, simNodes[j].x, simNodes[j].y, s);
    }
    const activeIdx = Math.floor(frame / 6) % 20;
    for (let i = 0; i < 20; i++) {
      if (i === activeIdx) drawNodeGradient(ctx, simNodes[i].x, simNodes[i].y, 5 * s, i % 2, a);
      else drawNode(ctx, simNodes[i].x, simNodes[i].y, 3 * s, i % 2, a * 0.5);
    }
    const nextIdx = (activeIdx + 1) % 20;
    const pt = (frame % 6) / 6;
    drawSignalPulse(ctx, simNodes[activeIdx].x, simNodes[activeIdx].y, simNodes[nextIdx].x, simNodes[nextIdx].y, pt, activeIdx % 2, s);
    ctx.fillStyle = C.textDim; ctx.font = `${7 * s}px system-ui`; ctx.textAlign = "center";
    ctx.fillText("simulation running", cx, height * 0.92);
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={ref} width={width} height={height} /></div>;
};

export const VARIANTS_SHOT_043: VariantDef[] = [
  { id: "043-blob-to-node", label: "Organic blobs morph to nodes", component: V1 },
  { id: "043-bio-to-sim", label: "Biology arrow simulation", component: V2 },
  { id: "043-monitor-network", label: "Network inside monitor", component: V3 },
  { id: "043-fly-to-network", label: "Fly outline to network", component: V4 },
  { id: "043-same-rule-grid", label: "Same rule grid fill", component: V5 },
  { id: "043-side-panels", label: "Bio vs digital panels", component: V6 },
  { id: "043-rule-grid", label: "Rule text with node grid", component: V7 },
  { id: "043-crossfade", label: "Organic to clean crossfade", component: V8 },
  { id: "043-sim-running", label: "Active simulation firing", component: V9 },
];
