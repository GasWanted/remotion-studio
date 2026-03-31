import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantDef, VariantProps } from "../types";
import {
  C, seeded, accent, easeOutBack, drawBg, fadeInOut, stagger, staggerRaw,
  drawNode, drawNodeGradient, drawNodeDormant, drawEdge, drawEdgeGlow, drawEdgeFaint,
  drawHeader, drawCounter, drawPerson, drawNeuronShape, drawFlyOutline, drawPanel,
  drawCheck, drawXMark, drawSignalPulse, drawBarChart, drawThresholdLine, lerp,
} from "./portal-kit";

// Shot 044 — "No training. No machine learning. Just the wiring."
// 9 variants — checklist with X marks and check (DUR=90)

const DUR = 90;

const V1: React.FC<VariantProps> = ({ width, height }) => {
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
    const xItems = ["Training", "Machine Learning", "Optimization"];
    for (let i = 0; i < 3; i++) {
      const sa = stagger(frame, i, 8, 10);
      const iy = cy - 30 * s + i * 22 * s;
      drawXMark(ctx, cx - 55 * s, iy, 8 * s, 1, a * sa);
      ctx.globalAlpha = a * sa;
      ctx.fillStyle = C.textDim; ctx.font = `500 ${9 * s}px system-ui`; ctx.textAlign = "left";
      ctx.fillText(xItems[i], cx - 40 * s, iy + 3 * s);
      ctx.globalAlpha = a;
    }
    const checkA = stagger(frame, 4, 8, 10);
    const checkY = cy + 40 * s;
    drawCheck(ctx, cx - 55 * s, checkY, 8 * s, 0, a * checkA);
    ctx.globalAlpha = a * checkA;
    ctx.fillStyle = C.blue; ctx.font = `700 ${10 * s}px system-ui`; ctx.textAlign = "left";
    ctx.fillText("Just the wiring", cx - 40 * s, checkY + 3 * s);
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
    const items = [
      { text: "training", delay: 5 },
      { text: "machine learning", delay: 20 },
    ];
    for (let idx = 0; idx < items.length; idx++) {
      const item = items[idx];
      const sa = staggerRaw(frame, 0, item.delay, 15);
      ctx.globalAlpha = a * 0.5;
      ctx.fillStyle = C.textDim; ctx.font = `500 ${11 * s}px system-ui`; ctx.textAlign = "center"; ctx.textBaseline = "middle";
      const iy = cy - 20 * s + idx * 25 * s;
      ctx.fillText(item.text, cx, iy);
      if (sa > 0.3) {
        const tw = ctx.measureText(item.text).width;
        ctx.strokeStyle = accent(1, a * 0.7); ctx.lineWidth = 2 * s;
        ctx.beginPath(); ctx.moveTo(cx - tw / 2, iy); ctx.lineTo(cx - tw / 2 + tw * Math.min(1, sa * 1.5), iy); ctx.stroke();
      }
    }
    const wiringA = staggerRaw(frame, 0, 45, 15);
    ctx.globalAlpha = a * wiringA;
    ctx.fillStyle = C.blue; ctx.font = `700 ${14 * s}px system-ui`; ctx.textAlign = "center";
    ctx.fillText("Just the wiring.", cx, cy + 35 * s);
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={ref} width={width} height={height} /></div>;
};

const V3: React.FC<VariantProps> = ({ width, height }) => {
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
    drawPanel(ctx, cx - 75 * s, cy - 55 * s, 150 * s, 110 * s, 0, a * 0.3);
    const xItems = ["Training", "ML", "Optimization"];
    for (let i = 0; i < 3; i++) {
      const sa = stagger(frame, i, 6, 10);
      const iy = cy - 35 * s + i * 20 * s;
      drawXMark(ctx, cx - 58 * s, iy, 7 * s, 1, a * sa);
      ctx.globalAlpha = a * sa;
      ctx.fillStyle = C.textDim; ctx.font = `${8 * s}px system-ui`; ctx.textAlign = "left";
      ctx.fillText(xItems[i], cx - 43 * s, iy + 3 * s);
      ctx.globalAlpha = a;
    }
    const divA = staggerRaw(frame, 0, 35, 10);
    ctx.strokeStyle = `rgba(200,200,215,${a * divA * 0.3})`; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(cx - 65 * s, cy + 18 * s); ctx.lineTo(cx + 65 * s, cy + 18 * s); ctx.stroke();
    const checkA = stagger(frame, 4, 6, 10);
    drawCheck(ctx, cx - 58 * s, cy + 35 * s, 8 * s, 0, a * checkA);
    ctx.globalAlpha = a * checkA;
    ctx.fillStyle = C.blue; ctx.font = `600 ${9 * s}px system-ui`; ctx.textAlign = "left";
    ctx.fillText("Raw wiring", cx - 43 * s, cy + 38 * s);
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={ref} width={width} height={height} /></div>;
};

const V4: React.FC<VariantProps> = ({ width, height }) => {
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
    // Row layout: No training. | No ML. | Just the wiring.
    const rows = [
      { words: ["No", "training."], colors: [C.orange, C.textDim], y: cy - 20 * s },
      { words: ["No", "ML."], colors: [C.orange, C.textDim], y: cy },
      { words: ["Just", "the", "wiring."], colors: [C.blue, C.blue, C.blue], y: cy + 25 * s },
    ];
    for (let r = 0; r < rows.length; r++) {
      const row = rows[r];
      let xOff = cx - 45 * s;
      for (let w = 0; w < row.words.length; w++) {
        const idx = r * 2 + w;
        const sa = stagger(frame, idx, 5, 8);
        ctx.globalAlpha = a * sa;
        const bold = w === 0 || r === 2;
        ctx.fillStyle = row.colors[w]; ctx.font = `${bold ? 700 : 500} ${(bold ? 12 : 10) * s}px system-ui`;
        ctx.textAlign = "left"; ctx.textBaseline = "middle";
        ctx.fillText(row.words[w], xOff, row.y);
        xOff += ctx.measureText(row.words[w]).width + 5 * s;
      }
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
    // Neural net icon crossed out
    const fadeX = interpolate(frame, [5, 40], [1, 0.15], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = a * fadeX;
    drawNode(ctx, cx - 50 * s, cy - 15 * s, 6 * s, 1, fadeX);
    drawNode(ctx, cx - 30 * s, cy - 15 * s, 6 * s, 1, fadeX);
    drawEdge(ctx, cx - 50 * s, cy - 15 * s, cx - 30 * s, cy - 15 * s, 1, fadeX * 0.3, s);
    if (frame > 15) drawXMark(ctx, cx - 40 * s, cy - 15 * s, 15 * s, 1, a);
    ctx.globalAlpha = a;
    // Clean wiring network
    const wireA = staggerRaw(frame, 0, 40, 25);
    const nodes = [
      { x: cx + 10 * s, y: cy + 15 * s }, { x: cx + 40 * s, y: cy }, { x: cx + 40 * s, y: cy + 30 * s },
      { x: cx + 70 * s, y: cy + 15 * s },
    ];
    for (let i = 0; i < 4; i++) {
      drawNode(ctx, nodes[i].x, nodes[i].y, 4 * s * wireA, 0, a * wireA);
      if (i < 3) drawEdge(ctx, nodes[i].x, nodes[i].y, nodes[i + 1].x, nodes[i + 1].y, 0, a * wireA * 0.3, s);
    }
    drawEdge(ctx, nodes[0].x, nodes[0].y, nodes[3].x, nodes[3].y, 0, a * wireA * 0.2, s);
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={ref} width={width} height={height} /></div>;
};

const V6: React.FC<VariantProps> = ({ width, height }) => {
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
    const noA = stagger(frame, 0, 5, 12);
    ctx.fillStyle = C.orange; ctx.font = `700 ${24 * s * noA}px system-ui`; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText("NO", cx, cy - 25 * s);
    const subA = staggerRaw(frame, 0, 20, 12);
    ctx.globalAlpha = a * subA;
    ctx.fillStyle = C.textDim; ctx.font = `${9 * s}px system-ui`;
    ctx.fillText("training \u00B7 machine learning", cx, cy);
    const justA = stagger(frame, 3, 12, 12);
    ctx.globalAlpha = a * justA;
    ctx.fillStyle = C.blue; ctx.font = `700 ${16 * s * justA}px system-ui`;
    ctx.fillText("JUST THE WIRING", cx, cy + 30 * s);
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
    const cols = [cx - 55 * s, cx, cx + 55 * s];
    const labels = ["Training", "ML", "Wiring"];
    const marks = ["x", "x", "check"];
    for (let i = 0; i < 3; i++) {
      const sa = stagger(frame, i, 10, 12);
      if (marks[i] === "x") drawXMark(ctx, cols[i], cy - 10 * s, 12 * s, 1, a * sa);
      else drawCheck(ctx, cols[i], cy - 10 * s, 12 * s, 0, a * sa);
      ctx.globalAlpha = a * sa;
      ctx.fillStyle = i === 2 ? C.blue : C.textDim;
      ctx.font = `${i === 2 ? 600 : 500} ${8 * s}px system-ui`; ctx.textAlign = "center";
      ctx.fillText(labels[i], cols[i], cy + 15 * s);
      ctx.globalAlpha = a;
    }
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={ref} width={width} height={height} /></div>;
};

const V8: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const netNodes = useMemo(() => {
    const rng = seeded(4488);
    const cx = width / 2, cy = height / 2;
    return Array.from({ length: 12 }, () => ({
      x: cx + (rng() - 0.5) * 120 * s,
      y: cy + (rng() - 0.5) * 80 * s,
    }));
  }, [width, height, s]);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height, s);
    const a = fadeInOut(frame, DUR);
    ctx.globalAlpha = a;
    const cx = width / 2, cy = height / 2;
    const appear = interpolate(frame, [5, 50], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const count = Math.floor(appear * 12);
    for (let i = 1; i < count; i++) {
      const j = (i * 5 + 1) % count;
      if (j !== i) drawEdgeGlow(ctx, netNodes[i].x, netNodes[i].y, netNodes[j].x, netNodes[j].y, 0, a * 0.2, s);
    }
    for (let i = 0; i < count; i++) drawNode(ctx, netNodes[i].x, netNodes[i].y, 3 * s, i % 2, a * 0.7);
    ctx.globalAlpha = a * appear;
    ctx.fillStyle = C.textDim; ctx.font = `${8 * s}px system-ui`; ctx.textAlign = "center";
    ctx.fillText("just the wiring", cx, cy + 55 * s);
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={ref} width={width} height={height} /></div>;
};

const V9: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height, s);
    const a = fadeInOut(frame, DUR);
    ctx.globalAlpha = a;
    drawHeader(ctx, width, height, s, frame, DUR, "No Training Required");
    const appear = interpolate(frame, [15, 50], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawBarChart(ctx, width * 0.15, height * 0.25, width * 0.7, height * 0.45, [0.01 * appear, 0.01 * appear, 1 * appear], 1, s);
    const labels = ["Training", "ML", "Wiring"];
    const barW = (width * 0.7) / 3;
    ctx.font = `${7 * s}px system-ui`; ctx.textAlign = "center";
    for (let i = 0; i < 3; i++) {
      ctx.fillStyle = i === 2 ? C.blue : C.textDim;
      ctx.fillText(labels[i], width * 0.15 + i * barW + barW * 0.35, height * 0.78);
    }
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={ref} width={width} height={height} /></div>;
};

export const VARIANTS_SHOT_044: VariantDef[] = [
  { id: "044-checklist-xcheck", label: "X marks and check list", component: V1 },
  { id: "044-strikethrough", label: "Strikethrough text emphasis", component: V2 },
  { id: "044-panel-checklist", label: "Panel framed checklist", component: V3 },
  { id: "044-word-by-word", label: "Word by word reveal", component: V4 },
  { id: "044-icons-xwiring", label: "Crossed icons wiring stays", component: V5 },
  { id: "044-no-just", label: "Large NO then JUST WIRING", component: V6 },
  { id: "044-three-columns", label: "Three column X X check", component: V7 },
  { id: "044-wiring-only", label: "Wiring network emphasis", component: V8 },
  { id: "044-bar-chart", label: "Bar chart no training", component: V9 },
];
