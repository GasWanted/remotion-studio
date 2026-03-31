import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantDef, VariantProps } from "../types";
import {
  C, seeded, accent, easeOutBack, drawBg, fadeInOut, stagger, staggerRaw,
  drawNode, drawNodeGradient, drawNodeDormant, drawEdge, drawEdgeGlow, drawEdgeFaint,
  drawHeader, drawCounter, drawPerson, drawNeuronShape, drawFlyOutline, drawPanel,
  drawCheck, drawXMark, drawSignalPulse, drawBarChart, drawThresholdLine, lerp,
} from "./portal-kit";

// Shot 021 — "You can see where neurons were cut, but you don't know which blob in one image
// is the same neuron as the next."
// 9 variants — ambiguous blob matching, question marks, side-by-side slices (DUR=150)

const V1: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const blobs = useMemo(() => {
    const rng = seeded(2101);
    return Array.from({ length: 5 }, () => ({
      x1: (rng() - 0.5) * 50, y1: (rng() - 0.5) * 40,
      x2: (rng() - 0.5) * 50, y2: (rng() - 0.5) * 40,
      ci: Math.floor(rng() * 2),
    }));
  }, []);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const DUR = 150;
    drawBg(ctx, width, height, s);
    const fo = fadeInOut(frame, DUR);
    ctx.globalAlpha = fo;
    drawHeader(ctx, width, height, s, frame, DUR, "Which is which?");
    const cx = width / 2, cy = height / 2;
    // Two side-by-side sections
    const lx = cx - 40 * s, rx = cx + 40 * s;
    const s1 = stagger(frame, 0, 1, 15);
    drawPanel(ctx, lx - 28 * s, cy - 25 * s * s1, 56 * s, 50 * s * s1, 0, fo * s1 * 0.6);
    const s2 = stagger(frame, 5, 1, 15);
    drawPanel(ctx, rx - 28 * s, cy - 25 * s * s2, 56 * s, 50 * s * s2, 0, fo * s2 * 0.6);
    // Labels
    ctx.fillStyle = C.textDim;
    ctx.font = `500 ${6 * s}px system-ui`;
    ctx.textAlign = "center";
    ctx.fillText("slice n", lx, cy + 32 * s);
    ctx.fillText("slice n+1", rx, cy + 32 * s);
    // Blobs in each section
    for (let i = 0; i < blobs.length; i++) {
      const b = blobs[i];
      const ba = stagger(frame, i + 3, 3, 8);
      drawNode(ctx, lx + b.x1 * s, cy + b.y1 * s, 5 * s * ba, b.ci, fo * 0.6);
      drawNode(ctx, rx + b.x2 * s, cy + b.y2 * s, 5 * s * ba, b.ci, fo * 0.6);
    }
    // Question mark arrows between sections
    const qa = interpolate(frame, [40, 70], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = fo * qa;
    ctx.fillStyle = C.text;
    ctx.font = `700 ${14 * s}px system-ui`;
    ctx.textAlign = "center";
    ctx.fillText("?", cx, cy + 3 * s);
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

const V2: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const DUR = 150;
    drawBg(ctx, width, height, s);
    const fo = fadeInOut(frame, DUR);
    ctx.globalAlpha = fo;
    const cx = width / 2, cy = height / 2;
    // Three blobs on left, three on right, dashed lines with "?" between
    const lx = cx - 45 * s, rx = cx + 45 * s;
    const colors = [0, 1, 0];
    for (let i = 0; i < 3; i++) {
      const y = cy - 20 * s + i * 20 * s;
      const sa = stagger(frame, i, 5, 10);
      drawNodeGradient(ctx, lx, y, 7 * s * sa, colors[i], fo);
      drawNodeGradient(ctx, rx, y, 7 * s * sa, colors[(i + 1) % 2], fo);
      // Dashed line between
      const da = stagger(frame, i + 5, 5, 10);
      ctx.setLineDash([3 * s, 3 * s]);
      ctx.strokeStyle = `rgba(180,180,200,${fo * da * 0.4})`;
      ctx.lineWidth = 1 * s;
      ctx.beginPath();
      ctx.moveTo(lx + 10 * s, y);
      ctx.lineTo(rx - 10 * s, y);
      ctx.stroke();
      ctx.setLineDash([]);
      // Question mark on each line
      ctx.globalAlpha = fo * da;
      ctx.fillStyle = C.text;
      ctx.font = `600 ${8 * s}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText("?", cx, y + 3 * s);
      ctx.globalAlpha = fo;
    }
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

const V3: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const DUR = 150;
    drawBg(ctx, width, height, s);
    const fo = fadeInOut(frame, DUR);
    ctx.globalAlpha = fo;
    const cx = width / 2, cy = height / 2;
    // Highlighted blob on slice 1, multiple candidates on slice 2
    // Slice 1
    const s1a = stagger(frame, 0, 1, 12);
    drawPanel(ctx, cx - 65 * s, cy - 25 * s * s1a, 50 * s, 50 * s * s1a, 0, fo * 0.4);
    // Target blob (highlighted)
    const ba = stagger(frame, 3, 1, 10);
    drawNodeGradient(ctx, cx - 40 * s, cy, 8 * s * ba, 0, fo);
    // Other blobs
    const rng = seeded(2103);
    for (let i = 0; i < 4; i++) {
      drawNodeDormant(ctx, cx - 40 * s + (rng() - 0.5) * 30 * s, cy + (rng() - 0.5) * 30 * s, 5 * s * ba, fo * ba);
    }
    // Slice 2 — candidates
    const s2a = stagger(frame, 5, 1, 12);
    drawPanel(ctx, cx + 15 * s, cy - 25 * s * s2a, 50 * s, 50 * s * s2a, 0, fo * 0.4);
    // Multiple candidate blobs with "?" markers
    const candidates = [
      { x: 10, y: -10 }, { x: -8, y: 8 }, { x: 12, y: 12 },
    ];
    for (let i = 0; i < candidates.length; i++) {
      const ca = stagger(frame, i + 8, 4, 10);
      const px = cx + 40 * s + candidates[i].x * s;
      const py = cy + candidates[i].y * s;
      drawNode(ctx, px, py, 6 * s * ca, 0, fo * 0.5);
      ctx.fillStyle = C.text;
      ctx.font = `600 ${7 * s}px system-ui`;
      ctx.textAlign = "center";
      ctx.globalAlpha = fo * ca;
      ctx.fillText("?", px, py - 9 * s);
      ctx.globalAlpha = fo;
    }
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

const V4: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const DUR = 150;
    drawBg(ctx, width, height, s);
    const fo = fadeInOut(frame, DUR);
    ctx.globalAlpha = fo;
    const cx = width / 2, cy = height / 2;
    // Stacked layers with blobs — blobs shifting position between layers
    const layers = 5;
    for (let l = 0; l < layers; l++) {
      const ly = cy - 25 * s + l * 12 * s;
      const la = stagger(frame, l, 5, 12);
      const depth = 1 - l * 0.1;
      // Layer line
      ctx.strokeStyle = `rgba(200,200,215,${fo * la * 0.3 * depth})`;
      ctx.lineWidth = 0.8 * s;
      ctx.beginPath();
      ctx.moveTo(cx - 45 * s * depth, ly);
      ctx.lineTo(cx + 45 * s * depth, ly);
      ctx.stroke();
      // Blobs on this layer — shifted positions
      const rng = seeded(2104 + l);
      for (let i = 0; i < 4; i++) {
        const bx = cx + (rng() - 0.5) * 70 * s * depth;
        drawNode(ctx, bx, ly, 3 * s * la, i % 2, fo * 0.4 * la);
      }
    }
    // Connecting dashed lines with "?" between layers 0 and 1
    const qa = interpolate(frame, [50, 80], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.setLineDash([2 * s, 2 * s]);
    ctx.strokeStyle = accent(0, fo * qa * 0.3);
    ctx.lineWidth = 1 * s;
    const y0 = cy - 25 * s, y1 = cy - 13 * s;
    ctx.beginPath(); ctx.moveTo(cx - 10 * s, y0); ctx.lineTo(cx + 5 * s, y1); ctx.stroke();
    ctx.setLineDash([]);
    ctx.globalAlpha = fo * qa;
    ctx.fillStyle = C.text;
    ctx.font = `600 ${9 * s}px system-ui`;
    ctx.textAlign = "center";
    ctx.fillText("?", cx + 12 * s, (y0 + y1) / 2 + 3 * s);
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

const V5: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const DUR = 150;
    drawBg(ctx, width, height, s);
    const fo = fadeInOut(frame, DUR);
    ctx.globalAlpha = fo;
    const cx = width / 2, cy = height / 2;
    // Blob highlighted, then X marks on wrong matches, ? on the right one
    // Central blob
    const ba = stagger(frame, 0, 1, 12);
    drawNodeGradient(ctx, cx, cy - 20 * s, 10 * s * ba, 0, fo);
    // Candidates below in a row
    const candidates = 4;
    for (let i = 0; i < candidates; i++) {
      const px = cx + (i - 1.5) * 22 * s;
      const py = cy + 20 * s;
      const ca = stagger(frame, i + 3, 4, 10);
      drawNode(ctx, px, py, 7 * s * ca, i === 2 ? 0 : 1, fo * 0.6);
      // Lines from central blob
      drawEdgeFaint(ctx, cx, cy - 10 * s, px, py - 8 * s, s);
      // X marks on wrong ones, ? on candidate
      const revealT = interpolate(frame, [60 + i * 10, 70 + i * 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      if (revealT > 0 && i !== 2) {
        drawXMark(ctx, px, py - 13 * s, 5 * s, 1, fo * revealT);
      }
      if (revealT > 0 && i === 2) {
        ctx.globalAlpha = fo * revealT;
        ctx.fillStyle = C.blue;
        ctx.font = `700 ${10 * s}px system-ui`;
        ctx.textAlign = "center";
        ctx.fillText("?", px, py - 14 * s);
        ctx.globalAlpha = fo;
      }
    }
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

const V6: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const DUR = 150;
    drawBg(ctx, width, height, s);
    const fo = fadeInOut(frame, DUR);
    ctx.globalAlpha = fo;
    const cx = width / 2, cy = height / 2;
    // Two overlaid transparent slices — blobs don't align
    const offset = interpolate(frame, [20, 80], [0, 15 * s], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const rng1 = seeded(2106), rng2 = seeded(2107);
    // Slice 1 blobs (blue tinted, shift left)
    for (let i = 0; i < 8; i++) {
      const bx = cx - offset / 2 + (rng1() - 0.5) * 60 * s;
      const by = cy + (rng1() - 0.5) * 50 * s;
      drawNode(ctx, bx, by, 5 * s, 0, fo * 0.35);
    }
    // Slice 2 blobs (orange tinted, shift right)
    for (let i = 0; i < 8; i++) {
      const bx = cx + offset / 2 + (rng2() - 0.5) * 60 * s;
      const by = cy + (rng2() - 0.5) * 50 * s;
      drawNode(ctx, bx, by, 5 * s, 1, fo * 0.35);
    }
    // Sliding labels
    const la = interpolate(frame, [60, 80], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = fo * la;
    ctx.fillStyle = C.blue;
    ctx.font = `500 ${7 * s}px system-ui`;
    ctx.textAlign = "center";
    ctx.fillText("slice n", cx - offset / 2, cy + 38 * s);
    ctx.fillStyle = C.orange;
    ctx.fillText("slice n+1", cx + offset / 2, cy + 38 * s);
    // Big question mark
    ctx.fillStyle = C.text;
    ctx.font = `700 ${18 * s}px system-ui`;
    ctx.fillText("?", cx, cy - 35 * s);
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

const V7: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const DUR = 150;
    drawBg(ctx, width, height, s);
    const fo = fadeInOut(frame, DUR);
    ctx.globalAlpha = fo;
    const cx = width / 2, cy = height / 2;
    // Arrows shuffling between two columns of blobs
    const lx = cx - 40 * s, rx = cx + 40 * s;
    const n = 4;
    for (let i = 0; i < n; i++) {
      const y = cy - 22 * s + i * 15 * s;
      const sa = stagger(frame, i, 4, 10);
      drawNode(ctx, lx, y, 5 * s * sa, 0, fo * 0.6);
      drawNode(ctx, rx, y, 5 * s * sa, 1, fo * 0.6);
    }
    // Crossed arrows (wrong mapping) with "?"
    const aa = interpolate(frame, [40, 80], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = fo * aa;
    // Arrow 1: top-left to bottom-right
    drawEdge(ctx, lx + 8 * s, cy - 22 * s, rx - 8 * s, cy + 8 * s, 0, fo * aa * 0.3, s);
    // Arrow 2: bottom-left to top-right
    drawEdge(ctx, lx + 8 * s, cy + 8 * s, rx - 8 * s, cy - 22 * s, 1, fo * aa * 0.3, s);
    // Question marks on arrows
    ctx.fillStyle = C.text;
    ctx.font = `600 ${10 * s}px system-ui`;
    ctx.textAlign = "center";
    ctx.fillText("?", cx, cy - 15 * s);
    ctx.fillText("?", cx, cy + 5 * s);
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

const V8: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const DUR = 150;
    drawBg(ctx, width, height, s);
    const fo = fadeInOut(frame, DUR);
    ctx.globalAlpha = fo;
    const cx = width / 2, cy = height / 2;
    // Neuron shape cut at multiple heights — each slice shows a different cross section
    const appear = interpolate(frame, [5, 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    // Vertical neuron trunk
    ctx.strokeStyle = accent(0, fo * appear * 0.3);
    ctx.lineWidth = 2 * s;
    ctx.beginPath();
    ctx.moveTo(cx, cy - 40 * s);
    ctx.lineTo(cx, cy + 40 * s);
    ctx.stroke();
    // Cut planes
    const cuts = [-20, 0, 20];
    for (let i = 0; i < cuts.length; i++) {
      const ca = stagger(frame, i + 5, 8, 12);
      const cutY = cy + cuts[i] * s;
      // Horizontal cut line
      ctx.strokeStyle = accent(1, fo * ca * 0.5);
      ctx.lineWidth = 1 * s;
      ctx.setLineDash([4 * s, 3 * s]);
      ctx.beginPath();
      ctx.moveTo(cx - 30 * s, cutY);
      ctx.lineTo(cx + 30 * s, cutY);
      ctx.stroke();
      ctx.setLineDash([]);
      // Cross-section blob to the right
      const bx = cx + 50 * s;
      drawNode(ctx, bx, cutY, (4 + i * 2) * s * ca, 0, fo * 0.5 * ca);
      ctx.globalAlpha = fo * ca;
      ctx.fillStyle = C.textDim;
      ctx.font = `500 ${6 * s}px system-ui`;
      ctx.textAlign = "left";
      ctx.fillText("?", bx + 10 * s, cutY + 3 * s);
      ctx.globalAlpha = fo;
    }
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

const V9: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const DUR = 150;
    drawBg(ctx, width, height, s);
    const fo = fadeInOut(frame, DUR);
    ctx.globalAlpha = fo;
    const cx = width / 2, cy = height / 2;
    // Flipping between two slices — alternating view
    const period = 40;
    const showSlice1 = Math.floor(frame / period) % 2 === 0;
    const transition = (frame % period) / period;
    const rng1 = seeded(2109), rng2 = seeded(2110);
    const alpha = transition < 0.1 ? transition / 0.1 : transition > 0.9 ? (1 - transition) / 0.1 : 1;
    ctx.globalAlpha = fo * alpha;
    // Slice content
    const rng = showSlice1 ? rng1 : rng2;
    drawPanel(ctx, cx - 40 * s, cy - 30 * s, 80 * s, 60 * s, showSlice1 ? 0 : 1, fo * 0.4);
    for (let i = 0; i < 8; i++) {
      const bx = cx + (rng() - 0.5) * 60 * s;
      const by = cy + (rng() - 0.5) * 40 * s;
      drawNode(ctx, bx, by, (3 + rng() * 3) * s, i % 2, fo * 0.5);
    }
    // Slice label
    ctx.fillStyle = C.textDim;
    ctx.font = `500 ${7 * s}px system-ui`;
    ctx.textAlign = "center";
    ctx.fillText(showSlice1 ? "slice n" : "slice n+1", cx, cy + 38 * s);
    // Persistent question mark
    ctx.globalAlpha = fo;
    ctx.fillStyle = C.text;
    ctx.font = `700 ${12 * s}px system-ui`;
    ctx.fillText("same neuron?", cx, cy - 38 * s);
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

export const VARIANTS_SHOT_021: VariantDef[] = [
  { id: "021-side-by-side", label: "Two slices with question mark", component: V1 },
  { id: "021-dashed-lines", label: "Blobs with dashed match lines", component: V2 },
  { id: "021-candidates", label: "Highlighted blob with candidates", component: V3 },
  { id: "021-stacked-layers", label: "Stacked layers shifting blobs", component: V4 },
  { id: "021-elimination", label: "Blob match elimination X marks", component: V5 },
  { id: "021-overlay-slide", label: "Overlaid sliding slices", component: V6 },
  { id: "021-crossed-arrows", label: "Crossed arrows between columns", component: V7 },
  { id: "021-cut-planes", label: "Neuron cut at multiple heights", component: V8 },
  { id: "021-flip-compare", label: "Flipping between two slices", component: V9 },
];
