import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantDef, VariantProps } from "../types";
import { seeded, drawBg, makeParticles, drawParticles, PALETTE, fadeInOut } from "../scenes/theme";
import { drawFlyTop, drawNeuron } from "../icons";

// Shot 51 — "They tested six different inputs."
// 9 ways to show testing six stimuli

const V1: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(25, width, height, s), [width, height, s]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, parts, frame, s);
    const fo = fadeInOut(frame, 90);
    ctx.globalAlpha = fo;
    const labels = ["Sugar", "Bitter", "Looming", "Touch", "Smell", "P9"];
    const icons = ["🍬", "⚠", "👁", "✋", "👃", "⚡"];
    const t = interpolate(frame, [5, 70], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const vis = Math.floor(t * 6);
    for (let i = 0; i < 6; i++) {
      const x = width * (0.15 + (i % 3) * 0.3);
      const y = height * (i < 3 ? 0.35 : 0.6);
      const hue = PALETTE.cellColors[i][0];
      if (i < vis) {
        ctx.fillStyle = `hsla(${hue}, 50%, 55%, 0.6)`;
        ctx.beginPath(); ctx.arc(x, y, 22 * s, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = PALETTE.text.primary;
        ctx.font = `bold ${10 * s}px system-ui`; ctx.textAlign = "center";
        ctx.fillText(labels[i], x, y + 4 * s);
      } else {
        ctx.fillStyle = "rgba(255,255,255,0.1)";
        ctx.beginPath(); ctx.arc(x, y, 22 * s, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = PALETTE.text.dim; ctx.font = `${10 * s}px system-ui`; ctx.textAlign = "center";
        ctx.fillText("?", x, y + 4 * s);
      }
    }
    ctx.fillStyle = PALETTE.text.accent; ctx.font = `bold ${16 * s}px system-ui`; ctx.textAlign = "center";
    ctx.fillText("6 TESTS", width / 2, height * 0.12);
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V2: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(25, width, height, s), [width, height, s]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, parts, frame, s);
    const fo = fadeInOut(frame, 90);
    ctx.globalAlpha = fo;
    // Six test tubes in a row
    const t = interpolate(frame, [5, 65], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const vis = Math.floor(t * 6);
    for (let i = 0; i < 6; i++) {
      const x = width * (0.12 + i * 0.135);
      const tubeH = 80 * s, tubeW = 14 * s;
      const y = height * 0.3;
      const hue = PALETTE.cellColors[i][0];
      // Tube outline
      ctx.strokeStyle = i < vis ? `hsla(${hue}, 50%, 60%, 0.8)` : "rgba(255,255,255,0.15)";
      ctx.lineWidth = 1.5 * s;
      ctx.beginPath();
      ctx.moveTo(x - tubeW / 2, y); ctx.lineTo(x - tubeW / 2, y + tubeH * 0.8);
      ctx.quadraticCurveTo(x - tubeW / 2, y + tubeH, x, y + tubeH);
      ctx.quadraticCurveTo(x + tubeW / 2, y + tubeH, x + tubeW / 2, y + tubeH * 0.8);
      ctx.lineTo(x + tubeW / 2, y); ctx.stroke();
      // Fill if visible
      if (i < vis) {
        const fillH = tubeH * 0.6;
        ctx.fillStyle = `hsla(${hue}, 50%, 55%, 0.4)`;
        ctx.beginPath();
        ctx.moveTo(x - tubeW / 2 + 1, y + tubeH - fillH);
        ctx.lineTo(x - tubeW / 2 + 1, y + tubeH * 0.8);
        ctx.quadraticCurveTo(x - tubeW / 2 + 1, y + tubeH - 1, x, y + tubeH - 1);
        ctx.quadraticCurveTo(x + tubeW / 2 - 1, y + tubeH - 1, x + tubeW / 2 - 1, y + tubeH * 0.8);
        ctx.lineTo(x + tubeW / 2 - 1, y + tubeH - fillH); ctx.closePath(); ctx.fill();
      }
    }
    ctx.fillStyle = PALETTE.text.primary; ctx.font = `bold ${14 * s}px system-ui`; ctx.textAlign = "center";
    ctx.fillText("six different inputs", width / 2, height * 0.88);
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V3: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(25, width, height, s), [width, height, s]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, parts, frame, s);
    const fo = fadeInOut(frame, 90);
    ctx.globalAlpha = fo;
    // Numbered grid: 1-6, each number appears
    const t = interpolate(frame, [5, 60], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const vis = Math.floor(t * 6);
    for (let i = 0; i < 6; i++) {
      const col = i % 3, row = Math.floor(i / 3);
      const x = width * (0.25 + col * 0.25);
      const y = height * (0.3 + row * 0.3);
      const hue = PALETTE.cellColors[i][0];
      if (i < vis) {
        ctx.fillStyle = `hsla(${hue}, 50%, 55%, 0.7)`;
        ctx.font = `bold ${40 * s}px system-ui`; ctx.textAlign = "center";
        ctx.fillText(String(i + 1), x, y + 14 * s);
      } else {
        ctx.fillStyle = "rgba(255,255,255,0.08)";
        ctx.font = `bold ${40 * s}px system-ui`; ctx.textAlign = "center";
        ctx.fillText(String(i + 1), x, y + 14 * s);
      }
    }
    ctx.fillStyle = PALETTE.text.dim; ctx.font = `${11 * s}px system-ui`; ctx.textAlign = "center";
    ctx.fillText("six inputs tested", width / 2, height * 0.9);
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V4: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(25, width, height, s), [width, height, s]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, parts, frame, s);
    const fo = fadeInOut(frame, 90);
    ctx.globalAlpha = fo;
    // Fly in center with 6 arrows pointing at it from different directions
    drawFlyTop(ctx, width / 2, height / 2, 30 * s, `hsla(200, 40%, 55%, 0.7)`);
    const labels = ["sugar", "bitter", "shadow", "touch", "smell", "wind"];
    const t = interpolate(frame, [8, 65], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const vis = Math.floor(t * 6);
    for (let i = 0; i < vis; i++) {
      const angle = (i / 6) * Math.PI * 2 - Math.PI / 2;
      const dist = 90 * s;
      const ax = width / 2 + Math.cos(angle) * dist;
      const ay = height / 2 + Math.sin(angle) * dist;
      const hue = PALETTE.cellColors[i][0];
      // Arrow line
      ctx.strokeStyle = `hsla(${hue}, 50%, 60%, 0.5)`;
      ctx.lineWidth = 2 * s;
      ctx.beginPath(); ctx.moveTo(ax, ay);
      ctx.lineTo(width / 2 + Math.cos(angle) * 40 * s, height / 2 + Math.sin(angle) * 40 * s);
      ctx.stroke();
      // Label
      ctx.fillStyle = `hsla(${hue}, 50%, 65%, 0.9)`;
      ctx.font = `${9 * s}px system-ui`; ctx.textAlign = "center";
      ctx.fillText(labels[i], ax, ay + (angle > 0 ? 12 : -6) * s);
    }
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V5: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(25, width, height, s), [width, height, s]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, parts, frame, s);
    const fo = fadeInOut(frame, 90);
    ctx.globalAlpha = fo;
    // Checklist of tests appearing one by one
    const labels = ["Sugar", "Sugar + Bitter", "Looming shadow", "Antenna touch", "Odor", "P9 wind"];
    const t = interpolate(frame, [8, 70], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const vis = Math.floor(t * 6);
    for (let i = 0; i < 6; i++) {
      const y = height * (0.2 + i * 0.11);
      const x = width * 0.2;
      if (i < vis) {
        ctx.fillStyle = PALETTE.text.primary; ctx.font = `${11 * s}px system-ui`; ctx.textAlign = "left";
        ctx.fillText(`Test ${i + 1}: ${labels[i]}`, x, y);
        ctx.fillStyle = PALETTE.accent.gold;
        ctx.beginPath(); ctx.arc(x - 10 * s, y - 3 * s, 3 * s, 0, Math.PI * 2); ctx.fill();
      }
    }
    ctx.fillStyle = PALETTE.text.accent; ctx.font = `bold ${14 * s}px system-ui`; ctx.textAlign = "center";
    ctx.fillText(`${vis}/6 tested`, width / 2, height * 0.9);
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V6: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(25, width, height, s), [width, height, s]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, parts, frame, s);
    const fo = fadeInOut(frame, 90);
    ctx.globalAlpha = fo;
    // Brain with 6 input arrows, each lighting up
    const cx = width / 2, cy = height * 0.5;
    // Brain circle
    ctx.fillStyle = "rgba(180,160,220,0.15)";
    ctx.beginPath(); ctx.arc(cx, cy, 40 * s, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = "rgba(180,160,220,0.3)"; ctx.lineWidth = 1.5 * s;
    ctx.stroke();
    ctx.fillStyle = PALETTE.text.dim; ctx.font = `${10 * s}px system-ui`; ctx.textAlign = "center";
    ctx.fillText("BRAIN", cx, cy + 4 * s);
    const t = interpolate(frame, [8, 65], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const vis = Math.floor(t * 6);
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2 - Math.PI / 2;
      const ox = cx + Math.cos(angle) * 100 * s;
      const oy = cy + Math.sin(angle) * 70 * s;
      const hue = PALETTE.cellColors[i][0];
      const active = i < vis;
      ctx.strokeStyle = active ? `hsla(${hue}, 50%, 60%, 0.6)` : "rgba(255,255,255,0.08)";
      ctx.lineWidth = active ? 2 * s : 1 * s;
      ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(cx + Math.cos(angle) * 42 * s, cy + Math.sin(angle) * 42 * s); ctx.stroke();
      ctx.fillStyle = active ? `hsla(${hue}, 50%, 55%, 0.7)` : "rgba(255,255,255,0.08)";
      ctx.beginPath(); ctx.arc(ox, oy, 8 * s, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V7: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(25, width, height, s), [width, height, s]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, parts, frame, s);
    const fo = fadeInOut(frame, 90);
    ctx.globalAlpha = fo;
    // Six panels appearing
    const t = interpolate(frame, [5, 60], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const vis = Math.floor(t * 6);
    const panelW = width * 0.27, panelH = height * 0.35;
    for (let i = 0; i < 6; i++) {
      const col = i % 3, row = Math.floor(i / 3);
      const x = width * 0.05 + col * (panelW + width * 0.03);
      const y = height * 0.15 + row * (panelH + height * 0.05);
      const hue = PALETTE.cellColors[i][0];
      ctx.fillStyle = i < vis ? `hsla(${hue}, 30%, 25%, 0.4)` : "rgba(255,255,255,0.03)";
      ctx.fillRect(x, y, panelW, panelH);
      ctx.strokeStyle = i < vis ? `hsla(${hue}, 40%, 50%, 0.4)` : "rgba(255,255,255,0.05)";
      ctx.lineWidth = 1; ctx.strokeRect(x, y, panelW, panelH);
      ctx.fillStyle = i < vis ? PALETTE.text.primary : PALETTE.text.dim;
      ctx.font = `bold ${12 * s}px system-ui`; ctx.textAlign = "center";
      ctx.fillText(`Test ${i + 1}`, x + panelW / 2, y + panelH / 2 + 4 * s);
    }
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V8: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(25, width, height, s), [width, height, s]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, parts, frame, s);
    const fo = fadeInOut(frame, 90);
    ctx.globalAlpha = fo;
    // Counter: "6 INPUTS" with signal dots flying into brain
    ctx.fillStyle = PALETTE.text.accent;
    ctx.font = `bold ${36 * s}px system-ui`; ctx.textAlign = "center";
    const t = interpolate(frame, [5, 50], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const count = Math.floor(t * 6);
    ctx.fillText(String(count), width / 2, height * 0.45);
    ctx.fillStyle = PALETTE.text.dim; ctx.font = `${14 * s}px system-ui`;
    ctx.fillText("different inputs", width / 2, height * 0.58);
    // Signal dots
    const r = seeded(5100);
    for (let i = 0; i < count * 3; i++) {
      const px = r() * width, py = r() * height;
      const hue = PALETTE.cellColors[Math.floor(r() * 6)][0];
      ctx.fillStyle = `hsla(${hue}, 50%, 60%, 0.3)`;
      ctx.beginPath(); ctx.arc(px, py, 2 * s, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V9: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(25, width, height, s), [width, height, s]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, parts, frame, s);
    const fo = fadeInOut(frame, 90);
    ctx.globalAlpha = fo;
    // Timeline: six dots on a horizontal line, each activating
    const lineY = height * 0.5;
    ctx.strokeStyle = "rgba(255,255,255,0.15)"; ctx.lineWidth = 1.5 * s;
    ctx.beginPath(); ctx.moveTo(width * 0.1, lineY); ctx.lineTo(width * 0.9, lineY); ctx.stroke();
    const t = interpolate(frame, [5, 65], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const vis = Math.floor(t * 6);
    for (let i = 0; i < 6; i++) {
      const x = width * (0.15 + i * 0.13);
      const hue = PALETTE.cellColors[i][0];
      const active = i < vis;
      ctx.fillStyle = active ? `hsla(${hue}, 55%, 60%, 0.85)` : "rgba(255,255,255,0.1)";
      ctx.beginPath(); ctx.arc(x, lineY, (active ? 8 : 5) * s, 0, Math.PI * 2); ctx.fill();
      if (active) {
        ctx.fillStyle = `hsla(${hue}, 40%, 55%, 0.15)`;
        ctx.beginPath(); ctx.arc(x, lineY, 16 * s, 0, Math.PI * 2); ctx.fill();
      }
    }
    ctx.fillStyle = PALETTE.text.dim; ctx.font = `${11 * s}px monospace`; ctx.textAlign = "center";
    ctx.fillText(`${vis}/6`, width / 2, height * 0.75);
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

export const VARIANTS_SHOT_051: VariantDef[] = [
  { id: "labeled-circles", label: "Labeled Circles", component: V1 },
  { id: "test-tubes", label: "Test Tubes", component: V2 },
  { id: "number-grid", label: "Number Grid", component: V3 },
  { id: "fly-arrows", label: "Fly + Arrows", component: V4 },
  { id: "checklist", label: "Checklist", component: V5 },
  { id: "brain-inputs", label: "Brain Inputs", component: V6 },
  { id: "six-panels", label: "Six Panels", component: V7 },
  { id: "counter", label: "Big Counter", component: V8 },
  { id: "timeline-dots", label: "Timeline Dots", component: V9 },
];
