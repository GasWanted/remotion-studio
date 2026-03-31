import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantDef, VariantProps } from "../types";
import {
  C, seeded, accent, easeOutBack, drawBg, fadeInOut, stagger, staggerRaw,
  drawNode, drawNodeGradient, drawNodeDormant, drawEdge, drawEdgeGlow, drawEdgeFaint,
  drawHeader, drawCounter, drawPerson, drawNeuronShape, drawFlyOutline, drawPanel,
  drawCheck, drawXMark, drawSignalPulse, drawBarChart, drawThresholdLine, lerp,
} from "./portal-kit";

// Shot 020 — "Each one is a cross-section of densely packed brain tissue."
// 9 variants — dense cross-section view (DUR=120)

const V1: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const blobs = useMemo(() => {
    const rng = seeded(2001);
    return Array.from({ length: 60 }, () => ({
      x: (rng() - 0.5) * 0.7, y: (rng() - 0.5) * 0.7,
      r: 2 + rng() * 4, ci: Math.floor(rng() * 2),
    }));
  }, []);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const DUR = 120;
    drawBg(ctx, width, height, s);
    const fo = fadeInOut(frame, DUR);
    ctx.globalAlpha = fo;
    drawHeader(ctx, width, height, s, frame, DUR, "Cross-Section");
    const cx = width / 2, cy = height / 2;
    // Circular cross-section
    const grow = interpolate(frame, [10, 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const R = 55 * s;
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, R * grow, 0, Math.PI * 2);
    ctx.clip();
    // Dense blobs packed inside
    for (let i = 0; i < blobs.length; i++) {
      const b = blobs[i];
      const sa = stagger(frame, i, 0.5, 8);
      drawNode(ctx, cx + b.x * R * 2, cy + b.y * R * 2, b.r * s * sa * grow, b.ci, fo * 0.6);
    }
    ctx.restore();
    // Circle outline
    ctx.strokeStyle = accent(0, fo * 0.3 * grow);
    ctx.lineWidth = 1.5 * s;
    ctx.beginPath();
    ctx.arc(cx, cy, R * grow, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

const V2: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const blobs = useMemo(() => {
    const rng = seeded(2002);
    return Array.from({ length: 45 }, () => ({
      x: (rng() - 0.5) * 100, y: (rng() - 0.5) * 80,
      r: 3 + rng() * 5, ci: Math.floor(rng() * 2),
    }));
  }, []);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const DUR = 120;
    drawBg(ctx, width, height, s);
    const fo = fadeInOut(frame, DUR);
    ctx.globalAlpha = fo;
    const cx = width / 2, cy = height / 2;
    // Rectangle cross-section (image frame)
    const grow = interpolate(frame, [5, 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const w = 90 * s * grow, h = 70 * s * grow;
    drawPanel(ctx, cx - w / 2, cy - h / 2, w, h, 0, fo * 0.5);
    // Dense overlapping blobs
    for (let i = 0; i < blobs.length; i++) {
      const b = blobs[i];
      const sa = stagger(frame, i, 0.4, 6);
      const bx = cx + b.x * s * grow;
      const by = cy + b.y * s * grow;
      if (Math.abs(bx - cx) < w / 2 - 3 * s && Math.abs(by - cy) < h / 2 - 3 * s) {
        drawNode(ctx, bx, by, b.r * s * sa, b.ci, fo * 0.5);
      }
    }
    // "dense tissue" label
    const la = interpolate(frame, [50, 70], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = fo * la;
    ctx.fillStyle = C.textDim;
    ctx.font = `500 ${7 * s}px system-ui`;
    ctx.textAlign = "center";
    ctx.fillText("densely packed", cx, cy + h / 2 + 12 * s);
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
    const DUR = 120;
    drawBg(ctx, width, height, s);
    const fo = fadeInOut(frame, DUR);
    ctx.globalAlpha = fo;
    const cx = width / 2, cy = height / 2;
    // Honeycomb packing — circles packed tightly
    const grow = interpolate(frame, [10, 50], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const r = 6 * s;
    const dx = r * 2, dy = r * Math.sqrt(3);
    let idx = 0;
    for (let row = -5; row <= 5; row++) {
      const offset = row % 2 === 0 ? 0 : r;
      for (let col = -5; col <= 5; col++) {
        const px = cx + col * dx + offset;
        const py = cy + row * dy;
        const dist = Math.sqrt((px - cx) ** 2 + (py - cy) ** 2);
        if (dist < 50 * s) {
          const sa = stagger(frame, idx, 0.3, 8);
          drawNode(ctx, px, py, r * 0.8 * sa * grow, idx % 2, fo * 0.5);
          idx++;
        }
      }
    }
    // Outer ring
    ctx.strokeStyle = accent(0, fo * grow * 0.3);
    ctx.lineWidth = 1 * s;
    ctx.beginPath();
    ctx.arc(cx, cy, 52 * s, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

const V4: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const cells = useMemo(() => {
    const rng = seeded(2004);
    return Array.from({ length: 40 }, () => ({
      x: (rng() - 0.5) * 90, y: (rng() - 0.5) * 70,
      r: 4 + rng() * 8,
    }));
  }, []);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const DUR = 120;
    drawBg(ctx, width, height, s);
    const fo = fadeInOut(frame, DUR);
    ctx.globalAlpha = fo;
    const cx = width / 2, cy = height / 2;
    // Cells with irregular shapes (overlapping ellipses)
    const grow = interpolate(frame, [5, 35], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    for (let i = 0; i < cells.length; i++) {
      const c = cells[i];
      const sa = stagger(frame, i, 0.5, 8);
      ctx.fillStyle = accent(i % 2, fo * sa * 0.08 * grow);
      ctx.strokeStyle = accent(i % 2, fo * sa * 0.2 * grow);
      ctx.lineWidth = 0.8 * s;
      ctx.beginPath();
      ctx.ellipse(cx + c.x * s, cy + c.y * s, c.r * s * grow, c.r * 0.7 * s * grow, i * 0.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
    // Label
    const la = interpolate(frame, [40, 60], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = fo * la;
    ctx.fillStyle = C.textDim;
    ctx.font = `500 ${8 * s}px system-ui`;
    ctx.textAlign = "center";
    ctx.fillText("cross-section", cx, cy + 48 * s);
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
    const DUR = 120;
    drawBg(ctx, width, height, s);
    const fo = fadeInOut(frame, DUR);
    ctx.globalAlpha = fo;
    const cx = width / 2, cy = height / 2;
    // Zooming into one image — starts as small rect, expands to fill
    const zoom = interpolate(frame, [10, 60], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const iw = lerp(20 * s, width * 0.75, zoom);
    const ih = lerp(15 * s, height * 0.55, zoom);
    ctx.strokeStyle = accent(0, fo * 0.3);
    ctx.lineWidth = 1 * s;
    ctx.strokeRect(cx - iw / 2, cy - ih / 2, iw, ih);
    // Blobs appearing as we zoom in
    const rng = seeded(2005);
    const blobCount = Math.floor(zoom * 50);
    for (let i = 0; i < blobCount; i++) {
      const bx = cx + (rng() - 0.5) * (iw - 8 * s);
      const by = cy + (rng() - 0.5) * (ih - 8 * s);
      const br = (1.5 + rng() * 3) * s * zoom;
      drawNode(ctx, bx, by, br, i % 2, fo * 0.5);
    }
    // Magnifying glass icon before zoom
    if (zoom < 0.3) {
      ctx.strokeStyle = accent(0, fo * (1 - zoom * 3) * 0.5);
      ctx.lineWidth = 2 * s;
      ctx.beginPath();
      ctx.arc(cx, cy, 15 * s, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx + 11 * s, cy + 11 * s);
      ctx.lineTo(cx + 20 * s, cy + 20 * s);
      ctx.stroke();
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
    const DUR = 120;
    drawBg(ctx, width, height, s);
    const fo = fadeInOut(frame, DUR);
    ctx.globalAlpha = fo;
    const cx = width / 2, cy = height / 2;
    // Contrast: empty circle filling up with dots (density increase)
    const fill = interpolate(frame, [10, 80], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    // Circle outline
    ctx.strokeStyle = accent(0, fo * 0.3);
    ctx.lineWidth = 1.5 * s;
    ctx.beginPath();
    ctx.arc(cx, cy, 45 * s, 0, Math.PI * 2);
    ctx.stroke();
    // Dots filling in
    const rng = seeded(2006);
    const n = Math.floor(fill * 80);
    for (let i = 0; i < n; i++) {
      const a = rng() * Math.PI * 2;
      const r = rng() * 42 * s;
      drawNode(ctx, cx + Math.cos(a) * r, cy + Math.sin(a) * r, (1.5 + rng() * 2.5) * s, i % 2, fo * 0.45);
    }
    // "dense" label at bottom
    if (fill > 0.7) {
      ctx.globalAlpha = fo * (fill - 0.7) / 0.3;
      ctx.fillStyle = C.text;
      ctx.font = `600 ${10 * s}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText("densely packed", cx, cy + 58 * s);
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
    const DUR = 120;
    drawBg(ctx, width, height, s);
    const fo = fadeInOut(frame, DUR);
    ctx.globalAlpha = fo;
    const cx = width / 2, cy = height / 2;
    // Multiple overlapping transparent circles — tissue texture
    const grow = interpolate(frame, [5, 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const rng = seeded(2007);
    for (let i = 0; i < 35; i++) {
      const sa = stagger(frame, i, 0.6, 8);
      const x = cx + (rng() - 0.5) * 80 * s;
      const y = cy + (rng() - 0.5) * 60 * s;
      const r = (5 + rng() * 10) * s * grow;
      ctx.fillStyle = accent(i % 2, fo * sa * 0.06);
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = accent(i % 2, fo * sa * 0.15);
      ctx.lineWidth = 0.5 * s;
      ctx.stroke();
    }
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
    const DUR = 120;
    drawBg(ctx, width, height, s);
    const fo = fadeInOut(frame, DUR);
    ctx.globalAlpha = fo;
    const cx = width / 2, cy = height / 2;
    // Side view showing 3D to 2D collapse — 3D brain squished to flat
    const squish = interpolate(frame, [15, 60], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    // The "3D" brain (tall ellipse) collapsing
    const brainH = lerp(50 * s, 3 * s, squish);
    ctx.fillStyle = accent(0, fo * 0.1);
    ctx.strokeStyle = accent(0, fo * 0.4);
    ctx.lineWidth = 1.5 * s;
    ctx.beginPath();
    ctx.ellipse(cx, cy, 35 * s, brainH, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    // Blobs inside
    const rng = seeded(2008);
    for (let i = 0; i < 20; i++) {
      const bx = cx + (rng() - 0.5) * 60 * s;
      const by = cy + (rng() - 0.5) * brainH * 1.5;
      if (Math.abs(by - cy) < brainH) {
        drawNode(ctx, bx, by, 2.5 * s, i % 2, fo * 0.5);
      }
    }
    // Labels
    ctx.fillStyle = C.textDim;
    ctx.font = `500 ${7 * s}px system-ui`;
    ctx.textAlign = "center";
    ctx.fillText(squish < 0.5 ? "3D tissue" : "2D cross-section", cx, cy + brainH + 15 * s);
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
    const DUR = 120;
    drawBg(ctx, width, height, s);
    const fo = fadeInOut(frame, DUR);
    ctx.globalAlpha = fo;
    const cx = width / 2, cy = height / 2;
    // Concentric rings of different-sized blobs (radial cross section)
    const grow = interpolate(frame, [5, 50], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const rng = seeded(2009);
    for (let ring = 0; ring < 4; ring++) {
      const ringR = (12 + ring * 12) * s;
      const nBlobs = 6 + ring * 4;
      for (let i = 0; i < nBlobs; i++) {
        const a = (i / nBlobs) * Math.PI * 2 + rng() * 0.3;
        const sa = stagger(frame, ring * 8 + i, 0.4, 8);
        const br = (2 + rng() * 2) * s;
        drawNode(ctx, cx + Math.cos(a) * ringR, cy + Math.sin(a) * ringR, br * sa * grow, (ring + i) % 2, fo * 0.5);
      }
    }
    // Center dot
    drawNodeGradient(ctx, cx, cy, 6 * s * grow, 0, fo * 0.6);
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

export const VARIANTS_SHOT_020: VariantDef[] = [
  { id: "020-circle-packed", label: "Dense blobs in circle", component: V1 },
  { id: "020-rect-section", label: "Rectangle with dense blobs", component: V2 },
  { id: "020-honeycomb", label: "Honeycomb packed circles", component: V3 },
  { id: "020-irregular-cells", label: "Irregular overlapping cells", component: V4 },
  { id: "020-zoom-into", label: "Zoom into one image", component: V5 },
  { id: "020-density-fill", label: "Circle filling with density", component: V6 },
  { id: "020-transparent-overlap", label: "Overlapping transparent circles", component: V7 },
  { id: "020-3d-to-2d", label: "3D squished to 2D slice", component: V8 },
  { id: "020-radial-rings", label: "Concentric rings of blobs", component: V9 },
];
