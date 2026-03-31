import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantDef, VariantProps } from "../types";
import { seeded, drawBg, makeParticles, drawParticles, PALETTE, fadeInOut } from "../scenes/theme";
import { drawNeuron } from "../icons";

// Shot 42 — "and each synapse has a specific strength that was measured from the real brain.
// A company called Eon Systems built a simulation that copies all of this"
// 120 frames (4s). Zoom into weights on edges — thick/thin lines, positive/negative coloring.

const V1: React.FC<VariantProps> = ({ width, height }) => {
  // Two neurons connected by an edge, weight number pulsing between them
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(14, width, height, s), [width, height, s]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, parts, frame, s);
    const alpha = fadeInOut(frame, 120);
    ctx.globalAlpha = alpha;
    const nx1 = width * 0.25, ny1 = height * 0.45;
    const nx2 = width * 0.75, ny2 = height * 0.45;
    // Edge
    const pulse = 0.7 + Math.sin(frame * 0.08) * 0.3;
    ctx.strokeStyle = `hsla(140, 60%, 55%, ${pulse * 0.8})`;
    ctx.lineWidth = 3 * s;
    ctx.beginPath(); ctx.moveTo(nx1 + 20 * s, ny1); ctx.lineTo(nx2 - 20 * s, ny2); ctx.stroke();
    // Neurons
    drawNeuron(ctx, nx1, ny1, 30 * s, "hsla(220, 55%, 65%, 0.9)", frame);
    drawNeuron(ctx, nx2, ny2, 30 * s, "hsla(280, 45%, 62%, 0.9)", frame);
    // Weight label pulsing
    const weights = ["+3.2", "-1.5", "+7.8", "-0.4"];
    const idx = Math.floor((frame / 30) % weights.length);
    const labelPulse = 0.8 + Math.sin(frame * 0.12) * 0.2;
    ctx.globalAlpha = alpha * labelPulse;
    ctx.fillStyle = weights[idx].startsWith("+") ? PALETTE.accent.green : PALETTE.accent.red;
    ctx.font = `bold ${16 * s}px system-ui`;
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText(weights[idx], width / 2, height * 0.35);
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V2: React.FC<VariantProps> = ({ width, height }) => {
  // Multiple connections with varying line thickness = weight magnitude
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(12, width, height, s), [width, height, s]);
  const data = useMemo(() => {
    const rand = seeded(42002);
    const nodes: { x: number; y: number; hue: number }[] = [];
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      nodes.push({ x: 0.5 + Math.cos(angle) * 0.28, y: 0.5 + Math.sin(angle) * 0.28, hue: PALETTE.cellColors[i][0] });
    }
    const edges: { a: number; b: number; w: number }[] = [];
    for (let i = 0; i < 8; i++) for (let j = i + 1; j < 8; j++) {
      if (rand() < 0.4) edges.push({ a: i, b: j, w: 0.5 + rand() * 4.5 });
    }
    return { nodes, edges };
  }, []);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, parts, frame, s);
    const alpha = fadeInOut(frame, 120);
    ctx.globalAlpha = alpha;
    const reveal = interpolate(frame, [5, 60], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const shown = Math.floor(reveal * data.edges.length);
    for (let i = 0; i < shown; i++) {
      const e = data.edges[i];
      const na = data.nodes[e.a], nb = data.nodes[e.b];
      ctx.strokeStyle = `hsla(50, 60%, 60%, 0.5)`;
      ctx.lineWidth = e.w * s;
      ctx.beginPath();
      ctx.moveTo(na.x * width, na.y * height);
      ctx.lineTo(nb.x * width, nb.y * height);
      ctx.stroke();
    }
    for (const n of data.nodes) {
      ctx.fillStyle = `hsla(${n.hue}, 50%, 60%, 0.9)`;
      ctx.beginPath(); ctx.arc(n.x * width, n.y * height, 5 * s, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V3: React.FC<VariantProps> = ({ width, height }) => {
  // Thick green (excitatory) and thin red (inhibitory) connections
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(12, width, height, s), [width, height, s]);
  const data = useMemo(() => {
    const rand = seeded(42003);
    const nodes: { x: number; y: number }[] = [];
    for (let i = 0; i < 6; i++) nodes.push({ x: 0.15 + rand() * 0.7, y: 0.2 + rand() * 0.6 });
    const edges: { a: number; b: number; exc: boolean; w: number }[] = [];
    for (let i = 0; i < 6; i++) for (let j = i + 1; j < 6; j++) {
      if (rand() < 0.5) edges.push({ a: i, b: j, exc: rand() > 0.4, w: 1 + rand() * 3 });
    }
    return { nodes, edges };
  }, []);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, parts, frame, s);
    const alpha = fadeInOut(frame, 120);
    ctx.globalAlpha = alpha;
    const reveal = interpolate(frame, [10, 70], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const shown = Math.floor(reveal * data.edges.length);
    for (let i = 0; i < shown; i++) {
      const e = data.edges[i];
      const na = data.nodes[e.a], nb = data.nodes[e.b];
      ctx.strokeStyle = e.exc ? `hsla(140, 65%, 55%, 0.7)` : `hsla(0, 65%, 55%, 0.5)`;
      ctx.lineWidth = (e.exc ? e.w * 1.5 : e.w * 0.6) * s;
      ctx.beginPath();
      ctx.moveTo(na.x * width, na.y * height);
      ctx.lineTo(nb.x * width, nb.y * height);
      ctx.stroke();
    }
    for (const n of data.nodes) {
      drawNeuron(ctx, n.x * width, n.y * height, 18 * s, "hsla(220, 50%, 65%, 0.8)", frame);
    }
    // Legend
    const legendY = height * 0.88;
    ctx.fillStyle = PALETTE.accent.green; ctx.fillRect(width * 0.2, legendY, 14 * s, 3 * s);
    ctx.fillStyle = PALETTE.text.dim; ctx.font = `${8 * s}px system-ui`; ctx.textAlign = "left";
    ctx.fillText("excitatory", width * 0.2 + 18 * s, legendY + 3 * s);
    ctx.fillStyle = PALETTE.accent.red; ctx.fillRect(width * 0.55, legendY, 8 * s, 1.5 * s);
    ctx.fillStyle = PALETTE.text.dim;
    ctx.fillText("inhibitory", width * 0.55 + 12 * s, legendY + 3 * s);
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V4: React.FC<VariantProps> = ({ width, height }) => {
  // Slider/dial showing synapse strength being adjusted weak to strong
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(10, width, height, s), [width, height, s]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, parts, frame, s);
    const alpha = fadeInOut(frame, 120);
    ctx.globalAlpha = alpha;
    // Slider track
    const trackX = width * 0.15, trackW = width * 0.7, trackY = height * 0.5;
    ctx.strokeStyle = "rgba(255,255,255,0.2)";
    ctx.lineWidth = 3 * s;
    ctx.beginPath(); ctx.moveTo(trackX, trackY); ctx.lineTo(trackX + trackW, trackY); ctx.stroke();
    // Slider position
    const t = interpolate(frame, [10, 100], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const knobX = trackX + t * trackW;
    // Filled portion
    const hue = interpolate(t, [0, 1], [0, 140]);
    ctx.strokeStyle = `hsla(${hue}, 60%, 55%, 0.8)`;
    ctx.lineWidth = 4 * s;
    ctx.beginPath(); ctx.moveTo(trackX, trackY); ctx.lineTo(knobX, trackY); ctx.stroke();
    // Knob
    ctx.fillStyle = `hsla(${hue}, 65%, 65%, 0.95)`;
    ctx.beginPath(); ctx.arc(knobX, trackY, 8 * s, 0, Math.PI * 2); ctx.fill();
    // Labels
    ctx.fillStyle = PALETTE.text.dim; ctx.font = `${9 * s}px system-ui`;
    ctx.textAlign = "center";
    ctx.fillText("weak", trackX, trackY + 20 * s);
    ctx.fillText("strong", trackX + trackW, trackY + 20 * s);
    // Weight value
    const val = interpolate(t, [0, 1], [0.1, 8.7]);
    ctx.fillStyle = PALETTE.text.accent; ctx.font = `bold ${14 * s}px system-ui`;
    ctx.fillText(val.toFixed(1), knobX, trackY - 18 * s);
    ctx.fillStyle = PALETTE.text.dim; ctx.font = `${10 * s}px system-ui`;
    ctx.fillText("synapse strength", width / 2, height * 0.25);
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V5: React.FC<VariantProps> = ({ width, height }) => {
  // Microscope view zooming into a single connection, weight label appearing
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(10, width, height, s), [width, height, s]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, parts, frame, s);
    const alpha = fadeInOut(frame, 120);
    ctx.globalAlpha = alpha;
    const cx = width / 2, cy = height * 0.45;
    // Zoom circle (microscope lens)
    const zoomR = interpolate(frame, [5, 40], [15, 65], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) * s;
    ctx.save();
    ctx.beginPath(); ctx.arc(cx, cy, zoomR, 0, Math.PI * 2); ctx.clip();
    // Inside the lens: dark background
    ctx.fillStyle = "rgba(10, 8, 18, 0.9)";
    ctx.fillRect(cx - zoomR, cy - zoomR, zoomR * 2, zoomR * 2);
    // Synapse detail: two cell bodies with vesicles in cleft
    const gapX = zoomR * 0.12;
    ctx.fillStyle = "hsla(280, 45%, 55%, 0.7)";
    ctx.beginPath(); ctx.arc(cx - gapX - zoomR * 0.3, cy, zoomR * 0.25, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "hsla(220, 50%, 55%, 0.7)";
    ctx.beginPath(); ctx.arc(cx + gapX + zoomR * 0.3, cy, zoomR * 0.25, 0, Math.PI * 2); ctx.fill();
    // Vesicles
    const vesicleAppear = interpolate(frame, [40, 60], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    for (let i = 0; i < 5; i++) {
      const vy = cy - zoomR * 0.15 + i * zoomR * 0.08;
      ctx.globalAlpha = alpha * vesicleAppear;
      ctx.fillStyle = PALETTE.accent.gold;
      ctx.beginPath(); ctx.arc(cx - gapX, vy, 2 * s, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = alpha;
    ctx.restore();
    // Lens border
    ctx.strokeStyle = "rgba(255,255,255,0.3)";
    ctx.lineWidth = 2 * s;
    ctx.beginPath(); ctx.arc(cx, cy, zoomR, 0, Math.PI * 2); ctx.stroke();
    // Weight label
    const labelFade = interpolate(frame, [65, 85], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (labelFade > 0) {
      ctx.globalAlpha = alpha * labelFade;
      ctx.fillStyle = PALETTE.text.accent; ctx.font = `bold ${14 * s}px system-ui`;
      ctx.textAlign = "center"; ctx.fillText("w = +4.7", cx, cy + zoomR + 20 * s);
    }
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V6: React.FC<VariantProps> = ({ width, height }) => {
  // Network graph with edge widths proportional to weight
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(14, width, height, s), [width, height, s]);
  const data = useMemo(() => {
    const rand = seeded(42006);
    const nodes: { x: number; y: number; hue: number }[] = [];
    for (let i = 0; i < 12; i++) nodes.push({ x: 0.12 + rand() * 0.76, y: 0.12 + rand() * 0.68, hue: PALETTE.cellColors[i % 8][0] });
    const edges: { a: number; b: number; w: number }[] = [];
    for (let i = 0; i < 12; i++) for (let j = i + 1; j < 12; j++) {
      const dx = nodes[i].x - nodes[j].x, dy = nodes[i].y - nodes[j].y;
      if (Math.sqrt(dx * dx + dy * dy) < 0.35 && rand() < 0.35) edges.push({ a: i, b: j, w: 0.3 + rand() * 5 });
    }
    return { nodes, edges };
  }, []);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, parts, frame, s);
    const alpha = fadeInOut(frame, 120);
    ctx.globalAlpha = alpha;
    const reveal = interpolate(frame, [5, 80], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    for (const e of data.edges) {
      const na = data.nodes[e.a], nb = data.nodes[e.b];
      ctx.strokeStyle = `hsla(50, 55%, 55%, ${Math.min(0.6, e.w * 0.12) * reveal})`;
      ctx.lineWidth = e.w * s * reveal;
      ctx.beginPath();
      ctx.moveTo(na.x * width, na.y * height);
      ctx.lineTo(nb.x * width, nb.y * height);
      ctx.stroke();
    }
    for (const n of data.nodes) {
      ctx.fillStyle = `hsla(${n.hue}, 50%, 60%, ${0.9 * reveal})`;
      ctx.beginPath(); ctx.arc(n.x * width, n.y * height, 4 * s, 0, Math.PI * 2); ctx.fill();
    }
    ctx.fillStyle = PALETTE.text.dim; ctx.font = `${9 * s}px system-ui`; ctx.textAlign = "center";
    ctx.fillText("edge width = weight", width / 2, height * 0.92);
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V7: React.FC<VariantProps> = ({ width, height }) => {
  // Histogram of weight distribution (many weak, few strong)
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(10, width, height, s), [width, height, s]);
  const bars = useMemo(() => {
    // Exponential-ish distribution: many weak, few strong
    return [120, 85, 55, 35, 22, 14, 9, 5, 3, 1];
  }, []);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, parts, frame, s);
    const alpha = fadeInOut(frame, 120);
    ctx.globalAlpha = alpha;
    const chartX = width * 0.12, chartW = width * 0.76;
    const chartY = height * 0.18, chartH = height * 0.55;
    const maxVal = Math.max(...bars);
    const barW = chartW / bars.length * 0.8;
    const gap = chartW / bars.length * 0.2;
    const grow = interpolate(frame, [10, 70], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    // Axis
    ctx.strokeStyle = "rgba(255,255,255,0.2)"; ctx.lineWidth = 1 * s;
    ctx.beginPath(); ctx.moveTo(chartX, chartY); ctx.lineTo(chartX, chartY + chartH); ctx.lineTo(chartX + chartW, chartY + chartH); ctx.stroke();
    // Bars
    for (let i = 0; i < bars.length; i++) {
      const barH = (bars[i] / maxVal) * chartH * grow;
      const bx = chartX + i * (barW + gap) + gap / 2;
      const hue = interpolate(i, [0, bars.length - 1], [50, 0]);
      ctx.fillStyle = `hsla(${hue}, 55%, 55%, 0.8)`;
      ctx.fillRect(bx, chartY + chartH - barH, barW, barH);
    }
    // Labels
    ctx.fillStyle = PALETTE.text.dim; ctx.font = `${8 * s}px system-ui`; ctx.textAlign = "center";
    ctx.fillText("weak", chartX + chartW * 0.1, chartY + chartH + 14 * s);
    ctx.fillText("strong", chartX + chartW * 0.9, chartY + chartH + 14 * s);
    ctx.fillStyle = PALETTE.text.primary; ctx.font = `${10 * s}px system-ui`;
    ctx.fillText("weight distribution", width / 2, height * 0.9);
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V8: React.FC<VariantProps> = ({ width, height }) => {
  // Before/after: biological synapse -> digital number
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(12, width, height, s), [width, height, s]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, parts, frame, s);
    const alpha = fadeInOut(frame, 120);
    ctx.globalAlpha = alpha;
    const transition = interpolate(frame, [40, 80], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const cx = width / 2, cy = height * 0.45;
    // Bio side (fades out)
    ctx.globalAlpha = alpha * (1 - transition * 0.7);
    // Organic blob
    ctx.fillStyle = `hsla(280, 40%, 45%, 0.6)`;
    ctx.beginPath();
    for (let a = 0; a < Math.PI * 2; a += 0.1) {
      const r = 30 * s * (1 + Math.sin(a * 3 + frame * 0.03) * 0.15);
      const px = cx + Math.cos(a) * r, py = cy + Math.sin(a) * r;
      a === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
    }
    ctx.closePath(); ctx.fill();
    // Arrow
    ctx.globalAlpha = alpha;
    const arrowFade = interpolate(frame, [30, 50], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (arrowFade > 0) {
      ctx.globalAlpha = alpha * arrowFade;
      ctx.strokeStyle = PALETTE.text.dim; ctx.lineWidth = 2 * s;
      ctx.beginPath(); ctx.moveTo(cx - 20 * s, height * 0.72); ctx.lineTo(cx + 20 * s, height * 0.72); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx + 14 * s, height * 0.72 - 5 * s); ctx.lineTo(cx + 20 * s, height * 0.72); ctx.lineTo(cx + 14 * s, height * 0.72 + 5 * s); ctx.stroke();
    }
    // Digital number (fades in)
    ctx.globalAlpha = alpha * transition;
    ctx.fillStyle = PALETTE.accent.green; ctx.font = `bold ${24 * s}px monospace`;
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText("+4.7", cx, cy);
    // Labels
    ctx.fillStyle = PALETTE.text.dim; ctx.font = `${8 * s}px system-ui`;
    ctx.globalAlpha = alpha * (1 - transition);
    ctx.fillText("biological", cx, height * 0.2);
    ctx.globalAlpha = alpha * transition;
    ctx.fillText("digital", cx, height * 0.2);
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V9: React.FC<VariantProps> = ({ width, height }) => {
  // Connection with signal size scaling with weight (big weight = big signal)
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(10, width, height, s), [width, height, s]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, parts, frame, s);
    const alpha = fadeInOut(frame, 120);
    ctx.globalAlpha = alpha;
    const rows = [
      { label: "w = 0.5", weight: 0.5, y: height * 0.22, color: "hsla(220, 50%, 55%, 0.7)" },
      { label: "w = 2.0", weight: 2.0, y: height * 0.44, color: "hsla(50, 60%, 55%, 0.7)" },
      { label: "w = 6.0", weight: 6.0, y: height * 0.66, color: "hsla(25, 70%, 55%, 0.8)" },
    ];
    const leftX = width * 0.15, rightX = width * 0.85;
    for (const row of rows) {
      // Connection line
      ctx.strokeStyle = row.color;
      ctx.lineWidth = row.weight * s;
      ctx.beginPath(); ctx.moveTo(leftX, row.y); ctx.lineTo(rightX, row.y); ctx.stroke();
      // Traveling signal dot
      const dotT = ((frame * 0.015 * (1 + row.weight * 0.1)) % 1);
      const dotX = leftX + dotT * (rightX - leftX);
      const dotR = (2 + row.weight * 1.5) * s;
      ctx.fillStyle = row.color.replace("0.7)", "0.95)").replace("0.8)", "0.95)");
      ctx.beginPath(); ctx.arc(dotX, row.y, dotR, 0, Math.PI * 2); ctx.fill();
      // Label
      ctx.fillStyle = PALETTE.text.dim; ctx.font = `${9 * s}px monospace`;
      ctx.textAlign = "right"; ctx.fillText(row.label, leftX - 6 * s, row.y + 3 * s);
    }
    ctx.fillStyle = PALETTE.text.dim; ctx.font = `${9 * s}px system-ui`;
    ctx.textAlign = "center";
    ctx.fillText("bigger weight = bigger signal", width / 2, height * 0.88);
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

export const VARIANTS_SHOT_042: VariantDef[] = [
  { id: "weight-pulse", label: "Weight Pulse", component: V1 },
  { id: "varying-thickness", label: "Varying Thickness", component: V2 },
  { id: "excitatory-inhibitory", label: "Excitatory vs Inhibitory", component: V3 },
  { id: "strength-slider", label: "Strength Slider", component: V4 },
  { id: "microscope-zoom", label: "Microscope Zoom", component: V5 },
  { id: "weighted-graph", label: "Weighted Graph", component: V6 },
  { id: "weight-histogram", label: "Weight Histogram", component: V7 },
  { id: "bio-to-digital", label: "Bio to Digital", component: V8 },
  { id: "signal-scaling", label: "Signal Scaling", component: V9 },
];
