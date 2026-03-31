import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantDef, VariantProps } from "../types";
import {
  C, seeded, accent, easeOutBack, drawBg, fadeInOut, stagger, staggerRaw,
  drawNode, drawNodeGradient, drawNodeDormant, drawEdge, drawEdgeGlow, drawEdgeFaint,
  drawHeader, drawCounter, drawPerson, drawNeuronShape, drawFlyOutline, drawPanel,
  drawCheck, drawXMark, drawSignalPulse, drawBarChart, drawThresholdLine, lerp,
} from "./portal-kit";

// Shot 008 — "Here's how you do that."
// 90 frames. 9 variants for transition/intro moment.

// V1: Text "HERE'S HOW" appearing bold and clean with blue underline
const V1: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const DUR = 90;
    drawBg(ctx, width, height, s);
    const fo = fadeInOut(frame, DUR);
    ctx.globalAlpha = fo;
    const cx = width / 2, cy = height / 2;
    // Main text
    const textT = interpolate(frame, [8, 22], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = fo * textT;
    ctx.fillStyle = C.text;
    ctx.font = `700 ${24 * s}px system-ui`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("HERE'S HOW", cx, cy - 5 * s);
    // Blue underline drawing
    const lineT = interpolate(frame, [20, 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (lineT > 0) {
      const tw = ctx.measureText("HERE'S HOW").width;
      ctx.strokeStyle = C.blue;
      ctx.lineWidth = 3 * s;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(cx - tw / 2, cy + 12 * s);
      ctx.lineTo(cx - tw / 2 + tw * lineT, cy + 12 * s);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

// V2: Curtain/panel sliding open to reveal a process diagram
const V2: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const DUR = 90;
    drawBg(ctx, width, height, s);
    const fo = fadeInOut(frame, DUR);
    ctx.globalAlpha = fo;
    const cx = width / 2, cy = height / 2;
    // Content behind curtain
    const revealT = interpolate(frame, [15, 55], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    // Process nodes
    const steps = 4;
    for (let i = 0; i < steps; i++) {
      const x = width * 0.2 + (i / (steps - 1)) * width * 0.6;
      const t = stagger(frame, i * 4 + 15, 1, 10);
      if (t > 0 && revealT > (i / steps)) {
        drawNode(ctx, x, cy, 5 * s * t, i % 2, fo * t);
        if (i < steps - 1) {
          drawEdge(ctx, x + 8 * s, cy, width * 0.2 + ((i + 1) / (steps - 1)) * width * 0.6 - 8 * s, cy, i % 2, fo * t * 0.4, s);
        }
      }
    }
    // Curtain panels sliding apart
    const curtainW = width / 2 * (1 - revealT);
    if (curtainW > 1) {
      ctx.fillStyle = C.panel;
      ctx.fillRect(0, 0, curtainW, height);
      ctx.fillRect(width - curtainW, 0, curtainW, height);
      // Curtain edges
      ctx.strokeStyle = `rgba(200,200,215,0.3)`;
      ctx.lineWidth = 2 * s;
      ctx.beginPath();
      ctx.moveTo(curtainW, 0);
      ctx.lineTo(curtainW, height);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(width - curtainW, 0);
      ctx.lineTo(width - curtainW, height);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

// V3: Blueprint grid appearing with "steps" placeholder boxes
const V3: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const DUR = 90;
    drawBg(ctx, width, height, s);
    const fo = fadeInOut(frame, DUR);
    ctx.globalAlpha = fo;
    // Blueprint grid fade-in
    const gridT = interpolate(frame, [5, 25], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.strokeStyle = `rgba(64,144,255,${fo * gridT * 0.08})`;
    ctx.lineWidth = 0.5 * s;
    const sp = 15 * s;
    for (let x = sp; x < width; x += sp) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke();
    }
    for (let y = sp; y < height; y += sp) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
    }
    // Step boxes
    const steps = ["Step 1", "Step 2", "Step 3"];
    const gap = width / (steps.length + 1);
    const cy = height / 2;
    for (let i = 0; i < steps.length; i++) {
      const t = stagger(frame, i * 6 + 10, 1, 12);
      if (t <= 0) continue;
      const x = gap * (i + 1);
      drawPanel(ctx, x - 25 * s, cy - 18 * s, 50 * s, 36 * s, 0, fo * t);
      ctx.fillStyle = C.blue;
      ctx.font = `600 ${8 * s}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText(steps[i], x, cy);
      // Connecting dashes
      if (i < steps.length - 1) {
        const dt = staggerRaw(frame, (i + 1) * 6 + 8, 1, 8);
        if (dt > 0) {
          ctx.setLineDash([3 * s, 2 * s]);
          drawEdge(ctx, x + 25 * s, cy, lerp(x + 25 * s, gap * (i + 2) - 25 * s, dt), cy, 0, fo * dt * 0.3, s);
          ctx.setLineDash([]);
        }
      }
    }
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

// V4: Arrow pointing right, text fading in
const V4: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const DUR = 90;
    drawBg(ctx, width, height, s);
    const fo = fadeInOut(frame, DUR);
    ctx.globalAlpha = fo;
    const cx = width / 2, cy = height / 2;
    // Text
    const textT = interpolate(frame, [5, 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = fo * textT;
    ctx.fillStyle = C.text;
    ctx.font = `500 ${14 * s}px system-ui`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("here's how", cx, cy - 15 * s);
    // Arrow drawing
    const arrowT = interpolate(frame, [20, 45], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (arrowT > 0) {
      const arrowLen = 80 * s * arrowT;
      const ax = cx - 40 * s, ay = cy + 15 * s;
      ctx.strokeStyle = C.blue;
      ctx.lineWidth = 3 * s;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.beginPath();
      ctx.moveTo(ax, ay);
      ctx.lineTo(ax + arrowLen, ay);
      ctx.stroke();
      // Arrowhead
      if (arrowT > 0.7) {
        const headT = (arrowT - 0.7) / 0.3;
        ctx.beginPath();
        ctx.moveTo(ax + arrowLen - 8 * s * headT, ay - 6 * s * headT);
        ctx.lineTo(ax + arrowLen, ay);
        ctx.lineTo(ax + arrowLen - 8 * s * headT, ay + 6 * s * headT);
        ctx.stroke();
      }
    }
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

// V5: Question mark transforming into an arrow/process
const V5: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const DUR = 90;
    drawBg(ctx, width, height, s);
    const fo = fadeInOut(frame, DUR);
    ctx.globalAlpha = fo;
    const cx = width / 2, cy = height / 2;
    // Question mark fading out
    const qT = interpolate(frame, [5, 15, 25, 40], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (qT > 0) {
      ctx.globalAlpha = fo * qT;
      ctx.fillStyle = C.textDim;
      ctx.font = `300 ${50 * s}px system-ui`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("?", cx, cy);
    }
    // Arrow/process replacing it
    const aT = interpolate(frame, [35, 55], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (aT > 0) {
      ctx.globalAlpha = fo * aT;
      // Three step nodes with arrows
      for (let i = 0; i < 3; i++) {
        const nt = stagger(frame, i * 3 + 35, 0.5, 8);
        if (nt <= 0) continue;
        const x = cx - 45 * s + i * 45 * s;
        drawNode(ctx, x, cy, 5 * s * nt, i % 2, fo * aT * nt);
        if (i < 2) {
          drawEdge(ctx, x + 8 * s, cy, x + 37 * s, cy, i % 2, fo * aT * nt * 0.4, s);
        }
      }
    }
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

// V6: Tools appearing: microscope icon, blade icon, computer icon in a row
const V6: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const DUR = 90;
    drawBg(ctx, width, height, s);
    const fo = fadeInOut(frame, DUR);
    ctx.globalAlpha = fo;
    const cy = height / 2;
    const labels = ["slice", "image", "compute"];
    const gap = width / (labels.length + 1);
    for (let i = 0; i < labels.length; i++) {
      const t = stagger(frame, i * 8, 1, 12);
      if (t <= 0) continue;
      const x = gap * (i + 1);
      // Tool icon as panel with node
      drawPanel(ctx, x - 20 * s, cy - 20 * s, 40 * s, 40 * s, i % 2, fo * t);
      drawNodeGradient(ctx, x, cy - 3 * s, 8 * s * t, i % 2, fo * t);
      // Label below
      ctx.fillStyle = C.text;
      ctx.font = `500 ${8 * s}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText(labels[i], x, cy + 28 * s);
      // Connecting arrow
      if (i < labels.length - 1) {
        const at = staggerRaw(frame, (i + 1) * 8 - 3, 1, 8);
        if (at > 0) {
          drawEdgeGlow(ctx, x + 20 * s, cy, gap * (i + 2) - 20 * s, cy, i % 2, fo * at * 0.3, s);
        }
      }
    }
    // Title
    drawHeader(ctx, width, height, s, frame, DUR, "The process", "three key steps");
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

// V7: Numbered steps 1-2-3 fading in as panels
const V7: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const DUR = 90;
    drawBg(ctx, width, height, s);
    const fo = fadeInOut(frame, DUR);
    ctx.globalAlpha = fo;
    drawHeader(ctx, width, height, s, frame, DUR, "Here's how", "step by step");
    const cy = height / 2;
    const gap = width / 4;
    for (let i = 0; i < 3; i++) {
      const t = stagger(frame, i * 7, 1, 12);
      if (t <= 0) continue;
      const x = gap * (i + 1);
      drawPanel(ctx, x - 22 * s, cy - 22 * s, 44 * s, 44 * s, i % 2, fo * t);
      // Number
      ctx.fillStyle = accent(i % 2, fo * t);
      ctx.font = `700 ${18 * s}px system-ui`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(`${i + 1}`, x, cy);
    }
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

// V8: Play button icon, "let's begin" text
const V8: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const DUR = 90;
    drawBg(ctx, width, height, s);
    const fo = fadeInOut(frame, DUR);
    ctx.globalAlpha = fo;
    const cx = width / 2, cy = height / 2;
    // Play button circle
    const circT = stagger(frame, 5, 1, 12);
    ctx.strokeStyle = accent(0, fo * circT * 0.4);
    ctx.lineWidth = 2.5 * s;
    ctx.beginPath();
    ctx.arc(cx, cy - 5 * s, 25 * s * circT, 0, Math.PI * 2);
    ctx.stroke();
    // Play triangle
    if (circT > 0.5) {
      const triT = (circT - 0.5) * 2;
      ctx.fillStyle = accent(0, fo * triT * 0.7);
      const ts = 12 * s * triT;
      ctx.beginPath();
      ctx.moveTo(cx - ts * 0.4, cy - 5 * s - ts * 0.6);
      ctx.lineTo(cx - ts * 0.4, cy - 5 * s + ts * 0.6);
      ctx.lineTo(cx + ts * 0.6, cy - 5 * s);
      ctx.closePath();
      ctx.fill();
    }
    // Text below
    const textT = interpolate(frame, [25, 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = fo * textT;
    ctx.fillStyle = C.textDim;
    ctx.font = `500 ${10 * s}px system-ui`;
    ctx.textAlign = "center";
    ctx.fillText("let's begin", cx, cy + 30 * s);
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

// V9: Section divider line drawing across, subtitle appearing below
const V9: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const DUR = 90;
    drawBg(ctx, width, height, s);
    const fo = fadeInOut(frame, DUR);
    ctx.globalAlpha = fo;
    const cx = width / 2, cy = height / 2;
    // Divider line drawing from center outward
    const lineT = interpolate(frame, [8, 35], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const lineLen = width * 0.6 * lineT;
    ctx.strokeStyle = C.blue;
    ctx.lineWidth = 2 * s;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(cx - lineLen / 2, cy);
    ctx.lineTo(cx + lineLen / 2, cy);
    ctx.stroke();
    // Center dot
    if (lineT > 0.3) {
      drawNodeGradient(ctx, cx, cy, 4 * s * Math.min(1, (lineT - 0.3) * 3), 0, fo);
    }
    // Text above
    const topT = interpolate(frame, [20, 35], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = fo * topT;
    ctx.fillStyle = C.text;
    ctx.font = `600 ${14 * s}px system-ui`;
    ctx.textAlign = "center";
    ctx.fillText("Here's how", cx, cy - 20 * s);
    // Subtitle below
    const subT = interpolate(frame, [35, 50], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = fo * subT;
    ctx.fillStyle = C.textDim;
    ctx.font = `${8 * s}px system-ui`;
    ctx.fillText("you map a brain", cx, cy + 20 * s);
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

export const VARIANTS_SHOT_008: VariantDef[] = [
  { id: "008-bold-text", label: "Bold text with underline", component: V1 },
  { id: "008-curtain-open", label: "Curtain panels opening", component: V2 },
  { id: "008-blueprint-grid", label: "Blueprint grid steps", component: V3 },
  { id: "008-arrow-text", label: "Arrow with text", component: V4 },
  { id: "008-question-arrow", label: "Question to process", component: V5 },
  { id: "008-tools-row", label: "Tools in a row", component: V6 },
  { id: "008-numbered-steps", label: "Numbered step panels", component: V7 },
  { id: "008-play-button", label: "Play button begin", component: V8 },
  { id: "008-section-divider", label: "Section divider line", component: V9 },
];
