import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantDef, VariantProps } from "../types";
import {
  C, seeded, accent, easeOutBack, drawBg, fadeInOut, stagger, staggerRaw,
  drawNode, drawNodeGradient, drawNodeDormant, drawEdge, drawEdgeGlow, drawEdgeFaint,
  drawHeader, drawCounter, drawPerson, drawNeuronShape, drawFlyOutline, drawPanel,
  drawCheck, drawXMark, drawSignalPulse, drawBarChart, drawThresholdLine, lerp,
} from "./portal-kit";

// Shot 047 — "The signal fans out. Thousands of neurons pass it along, adding, filtering, competing."
// DUR=150. Cascade wave through neuron grid.

const V1: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const grid = useMemo(() => {
    const rng = seeded(471);
    return Array.from({ length: 60 }, () => ({ x: rng() * 0.8 + 0.1, y: rng() * 0.65 + 0.2 }));
  }, []);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const DUR = 150;
    drawBg(ctx, width, height, s);
    const fo = fadeInOut(frame, DUR);
    ctx.globalAlpha = fo;
    drawHeader(ctx, width, height, s, frame, DUR, "Signal Cascade", "fan-out propagation");
    const waveFront = frame / DUR;
    for (let i = 0; i < grid.length; i++) {
      const nx = width * grid[i].x, ny = height * grid[i].y;
      const dist = grid[i].x;
      if (dist < waveFront * 1.2) {
        const t = Math.min(1, (waveFront * 1.2 - dist) * 5);
        drawNode(ctx, nx, ny, 4 * s * t, i, fo * t);
      } else {
        drawNodeDormant(ctx, nx, ny, 5 * s, fo * 0.6);
      }
    }
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
    drawHeader(ctx, width, height, s, frame, DUR, "Chain Reaction", "neuron-to-neuron");
    const cols = 8, rows = 6;
    for (let c = 0; c < cols; c++) {
      for (let r = 0; r < rows; r++) {
        const nx = width * (0.12 + c * 0.1), ny = height * (0.22 + r * 0.11);
        const delay = c * 10 + r * 2;
        const t = Math.min(1, Math.max(0, (frame - delay) / 12));
        if (t > 0) {
          drawNode(ctx, nx, ny, 4 * s * t, c + r, fo * t);
          if (c > 0) drawEdge(ctx, nx - width * 0.1, ny, nx, ny, c + r, fo * t * 0.3, s);
        } else {
          drawNodeDormant(ctx, nx, ny, 5 * s, fo * 0.5);
        }
      }
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
    drawHeader(ctx, width, height, s, frame, DUR, "Ripple Spread", "center outward");
    const cx = width * 0.5, cy = height * 0.5;
    const rng = seeded(473);
    const nodes = Array.from({ length: 50 }, () => {
      const ang = rng() * Math.PI * 2;
      const dist = rng() * 130 * s + 15 * s;
      return { x: cx + Math.cos(ang) * dist, y: cy + Math.sin(ang) * dist, d: dist };
    });
    const rippleR = (frame / DUR) * 160 * s;
    for (const n of nodes) {
      if (n.d < rippleR) {
        const t = Math.min(1, (rippleR - n.d) / (30 * s));
        drawNode(ctx, n.x, n.y, 4 * s * t, Math.floor(n.d) % 2, fo * t);
      } else {
        drawNodeDormant(ctx, n.x, n.y, 5 * s, fo * 0.4);
      }
    }
    drawNodeGradient(ctx, cx, cy, 8 * s, 0, fo);
    ctx.strokeStyle = accent(0, fo * 0.15);
    ctx.lineWidth = 1.5 * s;
    ctx.beginPath(); ctx.arc(cx, cy, rippleR, 0, Math.PI * 2); ctx.stroke();
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
    drawHeader(ctx, width, height, s, frame, DUR, "Fan-Out", "1 → thousands");
    const src = { x: width * 0.12, y: height * 0.5 };
    drawNodeGradient(ctx, src.x, src.y, 10 * s, 0, fo);
    const rng = seeded(474);
    for (let i = 0; i < 30; i++) {
      const t = stagger(frame, i, 3, 15);
      const nx = width * (0.25 + rng() * 0.65);
      const ny = height * (0.2 + rng() * 0.6);
      drawEdgeFaint(ctx, src.x, src.y, nx, ny, s);
      drawNode(ctx, nx, ny, 3.5 * s * t, i, fo * t);
    }
    drawCounter(ctx, width, height, s, `${Math.min(30, Math.floor(frame / 4))}`, "active");
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
    drawHeader(ctx, width, height, s, frame, DUR, "Heat-Map Activation", "intensity spreading");
    const cols = 10, rows = 7;
    const cxI = 5, cyI = 3;
    for (let c = 0; c < cols; c++) {
      for (let r = 0; r < rows; r++) {
        const nx = width * (0.1 + c * 0.08), ny = height * (0.2 + r * 0.1);
        const dist = Math.sqrt((c - cxI) ** 2 + (r - cyI) ** 2);
        const waveDist = frame / 12;
        if (dist < waveDist) {
          const intensity = Math.min(1, (waveDist - dist) / 3);
          drawNode(ctx, nx, ny, lerp(2, 6, intensity) * s, dist < 2 ? 1 : 0, fo * intensity);
        } else {
          drawNodeDormant(ctx, nx, ny, 4 * s, fo * 0.3);
        }
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
    drawHeader(ctx, width, height, s, frame, DUR, "Adding & Filtering", "convergence + divergence");
    const layers = [1, 3, 6, 4, 2];
    for (let l = 0; l < layers.length; l++) {
      const lx = width * (0.15 + l * 0.17);
      const count = layers[l];
      for (let n = 0; n < count; n++) {
        const ny = height * (0.5 - (count - 1) * 0.06 + n * 0.12);
        const t = stagger(frame, l * 3 + n, 5, 12);
        drawNode(ctx, lx, ny, 5 * s * t, l + n, fo * t);
        if (l > 0) {
          const prevCount = layers[l - 1];
          for (let p = 0; p < prevCount; p++) {
            const py = height * (0.5 - (prevCount - 1) * 0.06 + p * 0.12);
            drawEdge(ctx, lx - width * 0.17, py, lx, ny, l, fo * t * 0.2, s);
          }
        }
      }
    }
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
    drawHeader(ctx, width, height, s, frame, DUR, "Competing Signals", "excitation vs inhibition");
    const rng = seeded(477);
    const nodes = Array.from({ length: 25 }, (_, i) => ({
      x: width * (0.15 + rng() * 0.7), y: height * (0.22 + rng() * 0.55), c: i % 2,
    }));
    for (let i = 0; i < nodes.length; i++) {
      const t = stagger(frame, i, 3, 15);
      drawNode(ctx, nodes[i].x, nodes[i].y, 4 * s * t, nodes[i].c, fo * t);
      if (i > 0) {
        const j = Math.floor(rng() * i);
        drawEdge(ctx, nodes[j].x, nodes[j].y, nodes[i].x, nodes[i].y, nodes[i].c, fo * t * 0.25, s);
      }
    }
    ctx.fillStyle = C.textDim; ctx.font = `${8 * s}px system-ui`; ctx.textAlign = "left";
    ctx.fillText("excitatory", width * 0.05, height * 0.95);
    drawNode(ctx, width * 0.22, height * 0.94, 3 * s, 0, fo);
    ctx.fillText("inhibitory", width * 0.3, height * 0.95);
    drawNode(ctx, width * 0.48, height * 0.94, 3 * s, 1, fo);
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
    drawHeader(ctx, width, height, s, frame, DUR, "Signal Wave", "left to right propagation");
    const waveX = width * (frame / DUR);
    ctx.fillStyle = accent(0, fo * 0.04);
    ctx.fillRect(0, height * 0.18, waveX, height * 0.7);
    const rng = seeded(478);
    for (let i = 0; i < 40; i++) {
      const nx = rng() * width, ny = height * (0.2 + rng() * 0.6);
      if (nx < waveX) {
        const brightness = Math.min(1, (waveX - nx) / (width * 0.15));
        drawNode(ctx, nx, ny, 3.5 * s, i, fo * brightness);
      } else {
        drawNodeDormant(ctx, nx, ny, 4 * s, fo * 0.35);
      }
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
    drawHeader(ctx, width, height, s, frame, DUR, "Thousands Passing", "network relay");
    const labels = ["add", "filter", "compete"];
    for (let i = 0; i < 3; i++) {
      const px = width * (0.2 + i * 0.25), py = height * 0.82;
      const t = stagger(frame, i, 15, 12);
      drawPanel(ctx, px - 30 * s, py - 10 * s, 60 * s, 20 * s, i, fo * t);
      ctx.fillStyle = C.text; ctx.font = `${8 * s}px system-ui`; ctx.textAlign = "center";
      ctx.fillText(labels[i], px, py + 4 * s);
    }
    const rng = seeded(479);
    for (let i = 0; i < 35; i++) {
      const t = stagger(frame, i, 2, 15);
      const nx = width * (0.1 + rng() * 0.8), ny = height * (0.2 + rng() * 0.5);
      drawNode(ctx, nx, ny, 3 * s * t, i, fo * t);
    }
    drawCounter(ctx, width, height, s, "1000s", "neurons");
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

export const VARIANTS_SHOT_047: VariantDef[] = [
  { id: "shot_047_v1", label: "dormant grid wave", component: V1 },
  { id: "shot_047_v2", label: "chain reaction grid", component: V2 },
  { id: "shot_047_v3", label: "ripple from center", component: V3 },
  { id: "shot_047_v4", label: "fan-out propagation", component: V4 },
  { id: "shot_047_v5", label: "heat-map spreading", component: V5 },
  { id: "shot_047_v6", label: "convergence divergence", component: V6 },
  { id: "shot_047_v7", label: "competing signals", component: V7 },
  { id: "shot_047_v8", label: "signal wave sweep", component: V8 },
  { id: "shot_047_v9", label: "thousands relay", component: V9 },
];
