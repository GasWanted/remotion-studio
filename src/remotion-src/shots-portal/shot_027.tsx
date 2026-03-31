import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantDef, VariantProps } from "../types";
import {
  C, seeded, accent, easeOutBack, drawBg, fadeInOut, stagger, staggerRaw,
  drawNode, drawNodeGradient, drawNodeDormant, drawEdge, drawEdgeGlow, drawEdgeFaint,
  drawHeader, drawCounter, drawPerson, drawNeuronShape, drawFlyOutline, drawPanel,
  drawCheck, drawXMark, drawSignalPulse, drawBarChart, drawThresholdLine, lerp,
} from "./portal-kit";

// Shot 027 — "and hundreds of volunteers spent four years checking the work —"
// 120 frames. 9 variants: 4-year timeline + volunteers accumulating.

const DUR = 120;

// V1: Horizontal timeline bar filling over 4 years with person icons appearing
const V1: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height, s);
    const fo = fadeInOut(frame, DUR);
    ctx.globalAlpha = fo;
    drawHeader(ctx, width, height, s, frame, DUR, "Four Years", "volunteer effort");
    const lx = width * 0.1, rx = width * 0.9, ty = height * 0.5;
    const prog = interpolate(frame, [10, 100], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    // Track
    ctx.fillStyle = `rgba(200,200,215,${fo * 0.2})`;
    ctx.fillRect(lx, ty - 2 * s, rx - lx, 4 * s);
    // Fill
    ctx.fillStyle = accent(0, fo * 0.6);
    ctx.fillRect(lx, ty - 2 * s, (rx - lx) * prog, 4 * s);
    // Year markers
    for (let y = 0; y <= 4; y++) {
      const mx = lx + (y / 4) * (rx - lx);
      const mt = stagger(frame, y * 10, 1, 8);
      ctx.fillStyle = C.text;
      ctx.font = `${9 * s}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText(`Y${y + 1}`, mx, ty + 14 * s);
      if (y / 4 <= prog) drawNode(ctx, mx, ty, 3 * s * mt, 0, fo * mt);
    }
    // Volunteers above
    const rng = seeded(2701);
    const volCount = Math.floor(prog * 40);
    for (let i = 0; i < volCount; i++) {
      const vx = lx + rng() * (rx - lx) * prog;
      const vy = ty - 20 * s - rng() * 50 * s;
      drawPerson(ctx, vx, vy, 5 * s, accent(i, fo * 0.5));
    }
    drawCounter(ctx, width, height, s, `${volCount * 8}`, "volunteers");
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

// V2: Four stacked panels, one per year, filling with nodes
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
    drawHeader(ctx, width, height, s, frame, DUR, "Year by Year", "4 years of checking");
    const pw = width * 0.18, ph = height * 0.55;
    const gap = (width * 0.8 - pw * 4) / 3;
    const ox = width * 0.1;
    const rng = seeded(2702);
    for (let yr = 0; yr < 4; yr++) {
      const px = ox + yr * (pw + gap);
      const py = height * 0.25;
      const t = stagger(frame, yr * 15, 1, 12);
      if (t <= 0) continue;
      drawPanel(ctx, px, py, pw, ph * t, yr % 2, fo * t * 0.6);
      ctx.fillStyle = C.text; ctx.font = `600 ${10 * s}px system-ui`; ctx.textAlign = "center";
      ctx.fillText(`Year ${yr + 1}`, px + pw / 2, py - 6 * s);
      const dots = Math.floor(t * 12);
      for (let d = 0; d < dots; d++) {
        drawNode(ctx, px + rng() * pw, py + rng() * ph * t, 2 * s, yr % 2, fo * t);
      }
    }
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

// V3: Clock face with hand sweeping 4 full rotations, person count growing
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
    drawHeader(ctx, width, height, s, frame, DUR, "4 Years", "time invested");
    const cx = width / 2, cy = height * 0.48;
    const r = 55 * s;
    // Clock circle
    ctx.strokeStyle = `rgba(200,200,215,${fo * 0.3})`;
    ctx.lineWidth = 1.5 * s;
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
    // Hour marks
    for (let h = 0; h < 12; h++) {
      const a = (h / 12) * Math.PI * 2 - Math.PI / 2;
      drawNode(ctx, cx + Math.cos(a) * r * 0.88, cy + Math.sin(a) * r * 0.88, 1.5 * s, 0, fo * 0.5);
    }
    // Sweeping hand (4 rotations)
    const sweep = interpolate(frame, [10, 100], [0, 4], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const handA = sweep * Math.PI * 2 - Math.PI / 2;
    ctx.strokeStyle = accent(0, fo * 0.8);
    ctx.lineWidth = 2 * s;
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(handA) * r * 0.7, cy + Math.sin(handA) * r * 0.7); ctx.stroke();
    drawNodeGradient(ctx, cx, cy, 4 * s, 0, fo);
    // Year counter
    ctx.fillStyle = C.text; ctx.font = `700 ${14 * s}px system-ui`; ctx.textAlign = "center";
    ctx.fillText(`Year ${Math.min(4, Math.floor(sweep) + 1)}`, cx, cy + r + 18 * s);
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

// V4: Person silhouettes accumulating in rows, wave arriving
const V4: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const people = useMemo(() => {
    const result: { x: number; y: number; i: number }[] = [];
    const cols = 20, rows = 10;
    let idx = 0;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        result.push({ x: width * 0.08 + c * (width * 0.84 / cols), y: height * 0.22 + r * (height * 0.65 / rows), i: idx++ });
      }
    }
    return result;
  }, [width, height]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height, s);
    const fo = fadeInOut(frame, DUR);
    ctx.globalAlpha = fo;
    drawHeader(ctx, width, height, s, frame, DUR, "Volunteers", "hundreds joined");
    let count = 0;
    for (const p of people) {
      const t = stagger(frame, p.i, 0.4, 6);
      if (t <= 0) continue;
      count++;
      drawPerson(ctx, p.x, p.y, 5 * s * t, accent(p.i, fo * t * 0.6));
    }
    drawCounter(ctx, width, height, s, `${count}`, "volunteers");
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

// V5: Calendar grid: 48 months (4 years) of cells filling
const V5: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height, s);
    const fo = fadeInOut(frame, DUR);
    ctx.globalAlpha = fo;
    drawHeader(ctx, width, height, s, frame, DUR, "48 Months", "of checking");
    const cols = 12, rows = 4;
    const cw = (width * 0.78) / cols, ch = (height * 0.45) / rows;
    const ox = width * 0.11, oy = height * 0.28;
    const totalCells = cols * rows;
    const filled = Math.floor(interpolate(frame, [8, 95], [0, totalCells], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const idx = r * cols + c;
        const cx = ox + c * cw + cw / 2, cy = oy + r * ch + ch / 2;
        if (idx < filled) {
          drawPanel(ctx, ox + c * cw + 1, oy + r * ch + 1, cw - 2, ch - 2, idx % 2, fo * 0.5);
          drawNode(ctx, cx, cy, 2 * s, idx % 2, fo * 0.7);
        } else {
          ctx.strokeStyle = `rgba(200,200,215,${fo * 0.15})`;
          ctx.lineWidth = 0.5 * s;
          ctx.strokeRect(ox + c * cw + 1, oy + r * ch + 1, cw - 2, ch - 2);
        }
      }
    }
    // Year labels
    ctx.fillStyle = C.textDim; ctx.font = `${8 * s}px system-ui`; ctx.textAlign = "center";
    for (let y = 0; y < 4; y++) ctx.fillText(`Y${y + 1}`, ox - 10 * s, oy + y * ch + ch / 2 + 3 * s);
    drawCounter(ctx, width, height, s, `${filled}`, "months");
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

// V6: Spiral timeline with nodes placed along an expanding spiral
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
    drawHeader(ctx, width, height, s, frame, DUR, "Spiral of Time", "4 years");
    const cx = width / 2, cy = height / 2;
    const prog = interpolate(frame, [5, 100], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const totalPts = 48;
    const shown = Math.floor(prog * totalPts);
    let prevX = cx, prevY = cy;
    for (let i = 0; i < shown; i++) {
      const a = (i / 12) * Math.PI * 2;
      const r = 15 * s + i * 2.2 * s;
      const px = cx + Math.cos(a) * r, py = cy + Math.sin(a) * r;
      drawEdge(ctx, prevX, prevY, px, py, Math.floor(i / 12) % 2, fo * 0.2, s);
      drawNode(ctx, px, py, 2.5 * s, Math.floor(i / 12) % 2, fo);
      prevX = px; prevY = py;
    }
    drawCounter(ctx, width, height, s, `Y${Math.min(4, Math.floor(shown / 12) + 1)}`, "of 4");
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

// V7: Growing bar chart of volunteer hours per year
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
    drawHeader(ctx, width, height, s, frame, DUR, "Effort Growth", "year over year");
    const prog = interpolate(frame, [15, 85], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const vals = [30, 55, 80, 95].map(v => v * prog);
    drawBarChart(ctx, width * 0.2, height * 0.25, width * 0.6, height * 0.5, vals, 100, s);
    ctx.fillStyle = C.text; ctx.font = `${8 * s}px system-ui`; ctx.textAlign = "center";
    for (let i = 0; i < 4; i++) {
      ctx.fillText(`Y${i + 1}`, width * 0.2 + i * (width * 0.6 / 4) * 1.08 + width * 0.05, height * 0.8);
    }
    drawCounter(ctx, width, height, s, "4 yrs", "total");
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

// V8: Hourglass shape filling with node particles
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
    drawHeader(ctx, width, height, s, frame, DUR, "Time Passing", "4 years");
    const cx = width / 2, cy = height / 2;
    // Hourglass outline
    ctx.strokeStyle = accent(0, fo * 0.3);
    ctx.lineWidth = 1.5 * s;
    ctx.beginPath();
    ctx.moveTo(cx - 40 * s, cy - 70 * s); ctx.lineTo(cx, cy); ctx.lineTo(cx + 40 * s, cy - 70 * s);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx - 40 * s, cy + 70 * s); ctx.lineTo(cx, cy); ctx.lineTo(cx + 40 * s, cy + 70 * s);
    ctx.stroke();
    // Falling particles
    const rng = seeded(2708);
    const prog = interpolate(frame, [10, 100], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const count = Math.floor(prog * 50);
    for (let i = 0; i < count; i++) {
      const t = (i / 50);
      const px = cx + (rng() - 0.5) * 30 * s * (1 - t);
      const py = cy + t * 60 * s;
      drawNode(ctx, px, py, 1.5 * s, i % 2, fo * 0.7);
    }
    // Top emptying
    for (let i = 0; i < 50 - count; i++) {
      const px = cx + (rng() - 0.5) * 30 * s;
      const py = cy - 15 * s - rng() * 45 * s;
      drawNode(ctx, px, py, 1.5 * s, i % 2, fo * 0.4);
    }
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

// V9: Wave of volunteers arriving from left, leaving density trail
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
    drawHeader(ctx, width, height, s, frame, DUR, "Volunteer Wave", "hundreds arriving");
    const waveFront = interpolate(frame, [5, 95], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const rng = seeded(2709);
    let count = 0;
    for (let i = 0; i < 120; i++) {
      const baseX = rng();
      if (baseX > waveFront) continue;
      count++;
      const px = width * 0.05 + baseX * width * 0.9;
      const py = height * 0.2 + rng() * height * 0.6;
      drawPerson(ctx, px, py, 5 * s, accent(i, fo * 0.5));
    }
    drawCounter(ctx, width, height, s, `${count}`, "volunteers");
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

export const VARIANTS_SHOT_027: VariantDef[] = [
  { id: "027-timeline-bar", label: "Timeline bar with volunteers", component: V1 },
  { id: "027-year-panels", label: "Four year panels", component: V2 },
  { id: "027-clock-sweep", label: "Clock sweeping 4 years", component: V3 },
  { id: "027-person-rows", label: "Person rows accumulating", component: V4 },
  { id: "027-calendar-grid", label: "48-month calendar grid", component: V5 },
  { id: "027-spiral-time", label: "Spiral timeline", component: V6 },
  { id: "027-bar-growth", label: "Year-over-year bar chart", component: V7 },
  { id: "027-hourglass", label: "Hourglass particle fill", component: V8 },
  { id: "027-vol-wave", label: "Volunteer wave arriving", component: V9 },
];
