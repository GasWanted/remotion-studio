import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantDef, VariantProps } from "../types";
import {
  C, seeded, accent, easeOutBack, drawBg, fadeInOut, stagger, staggerRaw,
  drawNode, drawNodeGradient, drawNodeDormant, drawEdge, drawEdgeGlow, drawEdgeFaint,
  drawHeader, drawCounter, drawPerson, drawNeuronShape, drawFlyOutline, drawPanel,
  drawCheck, drawXMark, drawSignalPulse, drawBarChart, drawThresholdLine, lerp,
} from "./portal-kit";

// Shot 041 — "But the fly brain has a hundred and thirty-eight thousand of them, connected by fifteen million synapses"
// 9 variants — exponential fill, counter to 138,639 (DUR=150)

const DUR = 150;

const V1: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const positions = useMemo(() => {
    const rng = seeded(4101);
    return Array.from({ length: 200 }, () => ({ x: rng() * width, y: rng() * height }));
  }, [width, height]);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height, s);
    const a = fadeInOut(frame, DUR);
    ctx.globalAlpha = a;
    const progress = interpolate(frame, [10, 120], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const count = Math.floor(Math.pow(progress, 2) * 200);
    for (let i = 0; i < count; i++) drawNode(ctx, positions[i].x, positions[i].y, 3 * s, i % 2, a * 0.7);
    for (let i = 1; i < Math.min(count, 80); i++) {
      const j = (i * 7) % count;
      if (j !== i) drawEdgeFaint(ctx, positions[i].x, positions[i].y, positions[j].x, positions[j].y, s);
    }
    const num = Math.floor(progress * 138639);
    drawCounter(ctx, width, height, s, num.toLocaleString(), "neurons");
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={ref} width={width} height={height} /></div>;
};

const V2: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const positions = useMemo(() => {
    const rng = seeded(4122);
    return Array.from({ length: 150 }, () => ({ x: rng() * width, y: rng() * height }));
  }, [width, height]);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height, s);
    const a = fadeInOut(frame, DUR);
    ctx.globalAlpha = a;
    const doublings = Math.floor(interpolate(frame, [5, 100], [0, 7], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
    const count = Math.min(150, Math.pow(2, doublings));
    for (let i = 0; i < count; i++) drawNode(ctx, positions[i].x, positions[i].y, 3 * s, i % 2, a * 0.6);
    const num = Math.floor(interpolate(frame, [5, 130], [1, 138639], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
    drawCounter(ctx, width, height, s, num.toLocaleString(), "neurons");
    drawHeader(ctx, width, height, s, frame, DUR, "138,639 neurons");
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={ref} width={width} height={height} /></div>;
};

const V3: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const positions = useMemo(() => {
    const rng = seeded(4133);
    return Array.from({ length: 180 }, () => ({ x: rng() * width * 0.8 + width * 0.1, y: rng() * height * 0.7 + height * 0.15 }));
  }, [width, height]);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height, s);
    const a = fadeInOut(frame, DUR);
    ctx.globalAlpha = a;
    const progress = interpolate(frame, [5, 110], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const count = Math.floor(progress * 180);
    for (let i = 1; i < count; i++) {
      const j = (i + 3) % count;
      drawEdgeFaint(ctx, positions[i].x, positions[i].y, positions[j].x, positions[j].y, s);
    }
    for (let i = 0; i < count; i++) drawNode(ctx, positions[i].x, positions[i].y, 2.5 * s, i % 2, a * 0.6);
    const synapses = Math.floor(progress * 15000000);
    drawCounter(ctx, width, height, s, synapses > 999999 ? `${(synapses / 1e6).toFixed(1)}M` : synapses.toLocaleString(), "synapses");
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
    const progress = interpolate(frame, [5, 110], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const rings = Math.floor(progress * 8) + 1;
    for (let r = 0; r < rings; r++) {
      const nodesInRing = 6 + r * 4;
      const radius = (15 + r * 15) * s;
      for (let i = 0; i < nodesInRing; i++) {
        const ang = (i / nodesInRing) * Math.PI * 2;
        const nx = cx + Math.cos(ang) * radius;
        const ny = cy + Math.sin(ang) * radius;
        drawNode(ctx, nx, ny, 2 * s, (r + i) % 2, a * 0.5);
        if (r > 0) {
          const innerRing = 6 + (r - 1) * 4;
          const innerAng = (Math.floor(i * innerRing / nodesInRing) / innerRing) * Math.PI * 2;
          const ir = (15 + (r - 1) * 15) * s;
          drawEdgeFaint(ctx, nx, ny, cx + Math.cos(innerAng) * ir, cy + Math.sin(innerAng) * ir, s);
        }
      }
    }
    drawNodeGradient(ctx, cx, cy, 5 * s, 0, a);
    const num = Math.floor(progress * 138639);
    drawCounter(ctx, width, height, s, num.toLocaleString(), "neurons");
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={ref} width={width} height={height} /></div>;
};

const V5: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const positions = useMemo(() => {
    const rng = seeded(4155);
    return Array.from({ length: 250 }, () => ({ x: rng() * width, y: rng() * height }));
  }, [width, height]);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height, s);
    const a = fadeInOut(frame, DUR);
    ctx.globalAlpha = a;
    const progress = interpolate(frame, [5, 120], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const activeCount = Math.floor(progress * 250);
    for (let i = 0; i < 250; i++) {
      if (i < activeCount) drawNode(ctx, positions[i].x, positions[i].y, 2 * s, i % 2, a * 0.5);
      else drawNodeDormant(ctx, positions[i].x, positions[i].y, 3 * s, a * 0.3);
    }
    const num = Math.floor(progress * 138639);
    drawCounter(ctx, width, height, s, num.toLocaleString(), "neurons");
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
    const progress = interpolate(frame, [10, 120], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const neurons = Math.floor(progress * 138639);
    ctx.fillStyle = C.text; ctx.font = `700 ${22 * s}px system-ui`; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText(neurons.toLocaleString(), cx, cy - 8 * s);
    ctx.fillStyle = C.textDim; ctx.font = `${9 * s}px system-ui`;
    ctx.fillText("neurons", cx, cy + 15 * s);
    const synapses = Math.floor(progress * 15e6);
    const synLabel = synapses > 999999 ? `${(synapses / 1e6).toFixed(1)}M` : synapses.toLocaleString();
    ctx.fillStyle = C.orange; ctx.font = `600 ${12 * s}px system-ui`;
    ctx.fillText(synLabel, cx, cy + 35 * s);
    ctx.fillStyle = C.textDim; ctx.font = `${8 * s}px system-ui`;
    ctx.fillText("synapses", cx, cy + 48 * s);
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={ref} width={width} height={height} /></div>;
};

const V7: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const positions = useMemo(() => {
    const rng = seeded(4177);
    return Array.from({ length: 120 }, () => ({ x: rng() * width * 0.9 + width * 0.05, y: rng() * height * 0.8 + height * 0.1 }));
  }, [width, height]);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height, s);
    const a = fadeInOut(frame, DUR);
    ctx.globalAlpha = a;
    const progress = interpolate(frame, [5, 100], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const count = Math.floor(progress * 120);
    for (let i = 1; i < count; i++) {
      const j = (i * 3 + 1) % count;
      if (j !== i) drawEdge(ctx, positions[i].x, positions[i].y, positions[j].x, positions[j].y, i % 2, a * 0.08, s);
    }
    for (let i = 0; i < count; i++) drawNode(ctx, positions[i].x, positions[i].y, 2.5 * s, i % 2, a * 0.6);
    const flyA = staggerRaw(frame, 0, 90, 20);
    drawFlyOutline(ctx, width / 2, height / 2, 80 * s, a * flyA * 0.3);
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={ref} width={width} height={height} /></div>;
};

const V8: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const positions = useMemo(() => {
    const rng = seeded(4188);
    return Array.from({ length: 100 }, () => ({ x: rng() * width, y: rng() * height }));
  }, [width, height]);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height, s);
    const a = fadeInOut(frame, DUR);
    ctx.globalAlpha = a;
    for (let i = 0; i < 100; i++) {
      const sa = stagger(frame, i, 1, 8);
      if (sa > 0) drawNode(ctx, positions[i].x, positions[i].y, 2.5 * s * sa, i % 2, a * 0.6);
    }
    const progress = interpolate(frame, [5, 120], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawCounter(ctx, width, height, s, Math.floor(progress * 138639).toLocaleString(), "neurons");
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={ref} width={width} height={height} /></div>;
};

const V9: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const positions = useMemo(() => {
    const rng = seeded(4199);
    return Array.from({ length: 200 }, () => ({ x: rng() * width, y: rng() * height }));
  }, [width, height]);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height, s);
    const a = fadeInOut(frame, DUR);
    ctx.globalAlpha = a;
    const p1 = interpolate(frame, [5, 70], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const p2 = interpolate(frame, [70, 130], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const nodeCount = Math.floor(p1 * 200);
    const edgeCount = Math.floor(p2 * 150);
    for (let i = 0; i < edgeCount; i++) {
      const a1 = i % nodeCount, b1 = (i * 7 + 3) % nodeCount;
      drawEdgeFaint(ctx, positions[a1].x, positions[a1].y, positions[b1].x, positions[b1].y, s);
    }
    for (let i = 0; i < nodeCount; i++) drawNode(ctx, positions[i].x, positions[i].y, 2 * s, i % 2, a * 0.5);
    drawCounter(ctx, width, height, s, `${Math.floor(p1 * 138639).toLocaleString()} / ${Math.floor(p2 * 15e6 / 1e6).toFixed(0)}M`, "neurons / synapses");
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={ref} width={width} height={height} /></div>;
};

export const VARIANTS_SHOT_041: VariantDef[] = [
  { id: "041-exponential-fill", label: "Exponential node fill", component: V1 },
  { id: "041-doubling-header", label: "Doubling with header", component: V2 },
  { id: "041-synapse-counter", label: "Nodes and synapse counter", component: V3 },
  { id: "041-concentric-rings", label: "Concentric ring expansion", component: V4 },
  { id: "041-dormant-active", label: "Dormant becoming active", component: V5 },
  { id: "041-big-counter", label: "Big number counter centered", component: V6 },
  { id: "041-fly-overlay", label: "Network with fly outline", component: V7 },
  { id: "041-cascade-stagger", label: "Cascade stagger reveal", component: V8 },
  { id: "041-two-phase", label: "Neurons then edges", component: V9 },
];
