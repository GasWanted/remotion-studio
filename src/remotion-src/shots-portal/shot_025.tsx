import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantDef, VariantProps } from "../types";
import {
  C, seeded, accent, easeOutBack, drawBg, fadeInOut, stagger, staggerRaw,
  drawNode, drawNodeGradient, drawNodeDormant, drawEdge, drawEdgeGlow, drawEdgeFaint,
  drawHeader, drawCounter, drawPerson, drawNeuronShape, drawFlyOutline, drawPanel,
  drawCheck, drawXMark, drawSignalPulse, drawBarChart, drawThresholdLine, lerp,
} from "./portal-kit";

// Shot 025 — "The AI did most of the heavy lifting, but it made mistakes."
// 120 frames. 9 variants: AI errors highlighted in a network.

const DUR = 120;

// V1: Grid of nodes, most blue (correct), a few red with X marks
const V1: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const nodes = useMemo(() => {
    const rng = seeded(2501);
    return Array.from({ length: 40 }, (_, i) => ({
      x: (rng() - 0.5) * 260, y: (rng() - 0.5) * 220,
      err: rng() < 0.15, i,
    }));
  }, []);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height, s);
    const fo = fadeInOut(frame, DUR);
    ctx.globalAlpha = fo;
    drawHeader(ctx, width, height, s, frame, DUR, "AI Traced", "but made mistakes");
    const cx = width / 2, cy = height / 2;
    // Edges
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const d = Math.hypot(nodes[i].x - nodes[j].x, nodes[i].y - nodes[j].y);
        if (d < 55) drawEdgeFaint(ctx, cx + nodes[i].x * s, cy + nodes[i].y * s, cx + nodes[j].x * s, cy + nodes[j].y * s, s);
      }
    }
    for (const n of nodes) {
      const t = stagger(frame, n.i, 1, 8);
      if (t <= 0) continue;
      const nx = cx + n.x * s, ny = cy + n.y * s;
      if (n.err) {
        drawNode(ctx, nx, ny, 5 * s * t, 1, fo * t);
        const errT = stagger(frame, n.i + 20, 1, 6);
        if (errT > 0.5) drawXMark(ctx, nx, ny, 8 * s, 1, fo * errT);
      } else {
        drawNode(ctx, nx, ny, 3.5 * s * t, 0, fo * t);
      }
    }
    const errs = nodes.filter(n => n.err).length;
    drawCounter(ctx, width, height, s, `${errs} errors`, "detected");
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

// V2: Bar chart showing AI accuracy with error bar highlighted
const V2: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height, s);
    const fo = fadeInOut(frame, DUR);
    ctx.globalAlpha = fo;
    drawHeader(ctx, width, height, s, frame, DUR, "AI Performance", "heavy lifting with errors");
    const prog = interpolate(frame, [15, 70], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const vals = [95, 92, 88, 78, 85, 90].map(v => v * prog);
    drawBarChart(ctx, width * 0.15, height * 0.25, width * 0.7, height * 0.5, vals, 100, s);
    drawThresholdLine(ctx, width * 0.15, height * 0.25 + height * 0.5 * 0.15, width * 0.7, "100%", s);
    // Error highlights on lower bars
    if (prog > 0.6) {
      const ea = (prog - 0.6) / 0.4;
      drawXMark(ctx, width * 0.15 + width * 0.7 * (3.5 / 6), height * 0.25 + height * 0.5 * 0.22, 8 * s, 1, fo * ea);
    }
    drawCounter(ctx, width, height, s, "~85%", "accuracy");
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

// V3: Network with most nodes stable, error nodes pulsing red
const V3: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const nodes = useMemo(() => {
    const rng = seeded(2503);
    return Array.from({ length: 35 }, (_, i) => ({
      x: (rng() - 0.5) * 240, y: (rng() - 0.5) * 200,
      err: i === 7 || i === 15 || i === 23 || i === 31, i,
    }));
  }, []);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height, s);
    const fo = fadeInOut(frame, DUR);
    ctx.globalAlpha = fo;
    drawHeader(ctx, width, height, s, frame, DUR, "Mistakes", "pulsing errors");
    const cx = width / 2, cy = height / 2;
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        if (Math.hypot(nodes[i].x - nodes[j].x, nodes[i].y - nodes[j].y) < 60)
          drawEdgeFaint(ctx, cx + nodes[i].x * s, cy + nodes[i].y * s, cx + nodes[j].x * s, cy + nodes[j].y * s, s);
      }
    }
    for (const n of nodes) {
      const t = stagger(frame, n.i, 1.2, 8);
      if (t <= 0) continue;
      const nx = cx + n.x * s, ny = cy + n.y * s;
      if (n.err) {
        const pulse = 0.8 + Math.sin(frame * 0.15) * 0.2;
        drawNode(ctx, nx, ny, 5.5 * s * t * pulse, 1, fo * t);
      } else {
        drawNode(ctx, nx, ny, 3 * s * t, 0, fo * t);
      }
    }
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

// V4: Checklist with checkmarks and X marks appearing
const V4: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height, s);
    const fo = fadeInOut(frame, DUR);
    ctx.globalAlpha = fo;
    drawHeader(ctx, width, height, s, frame, DUR, "AI Results", "checks and errors");
    const items = [true, true, true, false, true, true, false, true, true];
    const startY = height * 0.2;
    const rowH = height * 0.075;
    for (let i = 0; i < items.length; i++) {
      const t = stagger(frame, i, 5, 10);
      if (t <= 0) continue;
      const iy = startY + i * rowH;
      const lx = width * 0.25, rx = width * 0.7;
      // Line bar
      ctx.fillStyle = items[i] ? accent(0, fo * t * 0.15) : `rgba(224,80,80,${fo * t * 0.12})`;
      ctx.fillRect(lx, iy, (rx - lx) * t, 3 * s);
      // Check or X
      if (items[i]) drawCheck(ctx, lx - 12 * s, iy + 1.5 * s, 8 * s, 0, fo * t);
      else drawXMark(ctx, lx - 12 * s, iy + 1.5 * s, 8 * s, 1, fo * t);
    }
    const errs = items.filter(x => !x).length;
    drawCounter(ctx, width, height, s, `${errs}`, "errors");
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

// V5: Dense field of nodes; late reveal highlights 5 wrong ones with glowing rings
const V5: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const nodes = useMemo(() => {
    const rng = seeded(2505);
    return Array.from({ length: 60 }, (_, i) => ({
      x: (rng() - 0.5) * 280, y: (rng() - 0.5) * 240,
      err: i % 12 === 5, i,
    }));
  }, []);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height, s);
    const fo = fadeInOut(frame, DUR);
    ctx.globalAlpha = fo;
    drawHeader(ctx, width, height, s, frame, DUR, "Spot the Error", "hidden mistakes");
    const cx = width / 2, cy = height / 2;
    for (const n of nodes) {
      const t = stagger(frame, n.i, 0.8, 6);
      if (t <= 0) continue;
      const nx = cx + n.x * s, ny = cy + n.y * s;
      drawNode(ctx, nx, ny, 2.5 * s * t, 0, fo * t);
    }
    // Highlight errors after frame 50
    const highlight = interpolate(frame, [50, 70], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (highlight > 0) {
      for (const n of nodes) {
        if (!n.err) continue;
        const nx = cx + n.x * s, ny = cy + n.y * s;
        drawNode(ctx, nx, ny, 5 * s, 1, fo * highlight);
        ctx.strokeStyle = `rgba(224,80,80,${fo * highlight * 0.6})`;
        ctx.lineWidth = 1.5 * s;
        ctx.beginPath(); ctx.arc(nx, ny, 9 * s, 0, Math.PI * 2); ctx.stroke();
      }
    }
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

// V6: Two-panel: AI side (robotic, fast) vs ground truth (human, careful), X on mismatches
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
    drawHeader(ctx, width, height, s, frame, DUR, "AI vs Truth", "comparison");
    const lx = width * 0.1, rx = width * 0.55;
    drawPanel(ctx, lx, height * 0.2, width * 0.35, height * 0.6, 0, fo * 0.5);
    drawPanel(ctx, rx, height * 0.2, width * 0.35, height * 0.6, 1, fo * 0.5);
    // AI nodes (left)
    const rng = seeded(2506);
    for (let i = 0; i < 8; i++) {
      const t = stagger(frame, i, 3, 8);
      if (t <= 0) continue;
      const nx = lx + width * 0.175 + (rng() - 0.5) * 60 * s;
      const ny = height * 0.3 + i * height * 0.06;
      drawNode(ctx, nx, ny, 3 * s * t, 0, fo * t);
      // Truth node (right, slightly different position for error ones)
      const isErr = i === 3 || i === 6;
      const offset = isErr ? 12 * s : 0;
      drawNode(ctx, nx + width * 0.45 - lx + offset, ny, 3 * s * t, isErr ? 1 : 0, fo * t);
      if (isErr && t > 0.5) drawXMark(ctx, nx + width * 0.45 - lx + offset / 2, ny, 6 * s, 1, fo * t);
    }
    ctx.fillStyle = C.text; ctx.font = `${9 * s}px system-ui`; ctx.textAlign = "center";
    ctx.fillText("AI", lx + width * 0.175, height * 0.17);
    ctx.fillText("Truth", rx + width * 0.175, height * 0.17);
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

// V7: Neuron shape with glitchy broken connections highlighted in orange
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
    drawHeader(ctx, width, height, s, frame, DUR, "Broken Links", "AI mistraced");
    const cx = width / 2, cy = height / 2;
    const appear = interpolate(frame, [5, 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawNeuronShape(ctx, cx, cy, 55 * s * appear, fo * appear, frame);
    // Highlight broken connections
    if (appear > 0.6) {
      const ea = (appear - 0.6) / 0.4;
      const breaks = [[cx + 30 * s, cy - 20 * s], [cx - 40 * s, cy + 15 * s], [cx + 50 * s, cy + 5 * s]];
      for (const [bx, by] of breaks) {
        drawNode(ctx, bx, by, 4 * s, 1, fo * ea);
        drawXMark(ctx, bx, by, 7 * s, 1, fo * ea);
      }
    }
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

// V8: Pie chart: large blue slice "correct", small orange slice "errors"
const V8: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height, s);
    const fo = fadeInOut(frame, DUR);
    ctx.globalAlpha = fo;
    drawHeader(ctx, width, height, s, frame, DUR, "AI Output", "mostly correct");
    const cx = width / 2, cy = height * 0.52;
    const r = 60 * s;
    const sweep = interpolate(frame, [10, 60], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const errFrac = 0.12;
    const correctAngle = Math.PI * 2 * (1 - errFrac) * sweep;
    const errAngle = Math.PI * 2 * errFrac * sweep;
    // Correct slice
    ctx.fillStyle = accent(0, fo * 0.7);
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + correctAngle); ctx.closePath(); ctx.fill();
    // Error slice
    ctx.fillStyle = accent(1, fo * 0.7);
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, r, -Math.PI / 2 + correctAngle, -Math.PI / 2 + correctAngle + errAngle); ctx.closePath(); ctx.fill();
    // Highlight
    ctx.fillStyle = `rgba(255,255,255,${fo * 0.15})`;
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + correctAngle * 0.5); ctx.closePath(); ctx.fill();
    if (sweep > 0.8) {
      const midErr = -Math.PI / 2 + correctAngle + errAngle / 2;
      drawXMark(ctx, cx + Math.cos(midErr) * r * 0.6, cy + Math.sin(midErr) * r * 0.6, 8 * s, 1, fo);
    }
    drawCounter(ctx, width, height, s, "88%", "correct");
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

// V9: Assembly line: nodes flowing left-to-right, some flagged and ejected
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
    drawHeader(ctx, width, height, s, frame, DUR, "Pipeline", "errors flagged");
    const cy = height / 2;
    // Conveyor line
    ctx.strokeStyle = `rgba(200,200,215,${fo * 0.3})`;
    ctx.lineWidth = 2 * s;
    ctx.beginPath(); ctx.moveTo(width * 0.05, cy); ctx.lineTo(width * 0.95, cy); ctx.stroke();
    const count = 12;
    for (let i = 0; i < count; i++) {
      const prog = ((frame * 1.5 + i * 30) % (width * 0.9)) / (width * 0.9);
      const nx = width * 0.05 + prog * width * 0.9;
      const isErr = i === 2 || i === 7;
      const eject = isErr ? Math.min(1, Math.max(0, (prog - 0.5) * 4)) : 0;
      const ny = cy - eject * 40 * s;
      drawNode(ctx, nx, ny, 4 * s, isErr ? 1 : 0, fo);
      if (isErr && eject > 0.3) drawXMark(ctx, nx, ny, 6 * s, 1, fo * eject);
    }
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

export const VARIANTS_SHOT_025: VariantDef[] = [
  { id: "025-grid-errors", label: "Network with X-marked errors", component: V1 },
  { id: "025-bar-accuracy", label: "Accuracy bar chart", component: V2 },
  { id: "025-pulse-errors", label: "Pulsing error nodes", component: V3 },
  { id: "025-checklist", label: "Check and X list", component: V4 },
  { id: "025-spot-error", label: "Spot the error reveal", component: V5 },
  { id: "025-ai-vs-truth", label: "AI vs ground truth panels", component: V6 },
  { id: "025-broken-links", label: "Neuron broken connections", component: V7 },
  { id: "025-pie-chart", label: "Pie chart correct vs errors", component: V8 },
  { id: "025-pipeline", label: "Assembly line flagging", component: V9 },
];
