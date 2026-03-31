import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantDef, VariantProps } from "../types";
import { seeded, drawBg, makeParticles, drawParticles, PALETTE, fadeInOut } from "../scenes/theme";
import { drawFlyTop, drawNeuron } from "../icons";

// Shot 52 — "A shadow rushing toward it — the escape circuit fired."

const V1: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(25, width, height, s), [width, height, s]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height); drawParticles(ctx, parts, frame, s);
    const fo = fadeInOut(frame, 90); ctx.globalAlpha = fo;
    // Looming shadow expanding from top
    const t = interpolate(frame, [5, 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const shadowR = t * Math.max(width, height) * 0.4;
    ctx.fillStyle = "rgba(0,0,0,0.3)";
    ctx.beginPath(); ctx.arc(width / 2, 0, shadowR, 0, Math.PI * 2); ctx.fill();
    // Fly fleeing
    drawFlyTop(ctx, width / 2, height * 0.65, 25 * s, `hsla(200, 40%, 55%, 0.7)`);
    // ESCAPE label
    if (t > 0.5) {
      ctx.fillStyle = PALETTE.accent.red || "#e85050";
      ctx.font = `bold ${16 * s}px system-ui`; ctx.textAlign = "center";
      ctx.fillText("ESCAPE", width / 2, height * 0.88);
    }
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
    drawBg(ctx, width, height); drawParticles(ctx, parts, frame, s);
    const fo = fadeInOut(frame, 90); ctx.globalAlpha = fo;
    // Giant eye / shadow icon looming
    const t = interpolate(frame, [5, 50], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const eyeSize = 30 * s + t * 50 * s;
    ctx.strokeStyle = "rgba(255,80,80,0.5)"; ctx.lineWidth = 3 * s;
    ctx.beginPath(); ctx.ellipse(width / 2, height * 0.3, eyeSize, eyeSize * 0.4, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = "rgba(255,80,80,0.3)";
    ctx.beginPath(); ctx.arc(width / 2, height * 0.3, eyeSize * 0.25, 0, Math.PI * 2); ctx.fill();
    // Escape neuron firing below
    if (t > 0.4) {
      const fireT = interpolate(t, [0.4, 0.8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      drawNeuron(ctx, width / 2, height * 0.65, 25 * s * fireT, `hsla(0, 60%, 60%, ${fireT})`, frame);
      ctx.fillStyle = PALETTE.text.primary; ctx.font = `${10 * s}px monospace`; ctx.textAlign = "center";
      ctx.fillText("Giant Fiber → ESCAPE", width / 2, height * 0.82);
    }
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
    drawBg(ctx, width, height); drawParticles(ctx, parts, frame, s);
    const fo = fadeInOut(frame, 90); ctx.globalAlpha = fo;
    // Input → Brain → Output pipeline
    const t = interpolate(frame, [5, 60], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    // Shadow icon (input)
    ctx.fillStyle = "rgba(255,80,80,0.5)";
    ctx.font = `${20 * s}px system-ui`; ctx.textAlign = "center";
    ctx.fillText("SHADOW", width * 0.2, height * 0.5);
    // Arrow
    if (t > 0.3) {
      ctx.strokeStyle = PALETTE.text.dim; ctx.lineWidth = 2 * s;
      ctx.beginPath(); ctx.moveTo(width * 0.35, height * 0.48); ctx.lineTo(width * 0.45, height * 0.48); ctx.stroke();
    }
    // Brain
    ctx.fillStyle = "rgba(150,130,200,0.2)";
    ctx.beginPath(); ctx.arc(width / 2, height * 0.48, 25 * s, 0, Math.PI * 2); ctx.fill();
    // Arrow out
    if (t > 0.6) {
      ctx.strokeStyle = PALETTE.text.dim; ctx.lineWidth = 2 * s;
      ctx.beginPath(); ctx.moveTo(width * 0.55, height * 0.48); ctx.lineTo(width * 0.65, height * 0.48); ctx.stroke();
      ctx.fillStyle = `hsla(0, 60%, 60%, 0.9)`;
      ctx.font = `bold ${16 * s}px system-ui`; ctx.textAlign = "center";
      ctx.fillText("ESCAPE", width * 0.78, height * 0.5);
    }
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
    drawBg(ctx, width, height); drawParticles(ctx, parts, frame, s);
    const fo = fadeInOut(frame, 90); ctx.globalAlpha = fo;
    // Expanding dark circle (looming)
    const t = interpolate(frame, [0, 45], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.fillStyle = `rgba(20,10,30,${t * 0.6})`;
    ctx.beginPath(); ctx.arc(width / 2, height * 0.4, t * 120 * s, 0, Math.PI * 2); ctx.fill();
    // Flash at threshold
    if (t > 0.7 && t < 0.9) {
      ctx.fillStyle = `rgba(255,80,80,${(t - 0.7) * 5 * 0.3})`;
      ctx.fillRect(0, 0, width, height);
    }
    // Result text
    if (t > 0.8) {
      ctx.fillStyle = PALETTE.text.accent; ctx.font = `bold ${18 * s}px system-ui`; ctx.textAlign = "center";
      ctx.fillText("escape circuit fired", width / 2, height * 0.8);
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
    drawBg(ctx, width, height); drawParticles(ctx, parts, frame, s);
    const fo = fadeInOut(frame, 90); ctx.globalAlpha = fo;
    // Spike raster: LC4 neuron fires, then Giant Fiber fires
    const t = interpolate(frame, [5, 60], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const labels = ["LC4 (visual)", "LPLC2", "Giant Fiber"];
    for (let i = 0; i < 3; i++) {
      const y = height * (0.3 + i * 0.15);
      ctx.fillStyle = PALETTE.text.dim; ctx.font = `${9 * s}px monospace`; ctx.textAlign = "right";
      ctx.fillText(labels[i], width * 0.3, y + 3 * s);
      ctx.strokeStyle = "rgba(255,255,255,0.1)"; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(width * 0.32, y); ctx.lineTo(width * 0.85, y); ctx.stroke();
      // Spikes
      const fireStart = i * 0.2;
      if (t > fireStart) {
        const hue = i === 2 ? 0 : 200;
        ctx.strokeStyle = `hsla(${hue}, 60%, 60%, 0.8)`; ctx.lineWidth = 1.5 * s;
        const spikeCount = Math.floor((t - fireStart) * 15);
        for (let j = 0; j < spikeCount; j++) {
          const sx = width * 0.35 + j * 8 * s;
          if (sx > width * 0.85) break;
          ctx.beginPath(); ctx.moveTo(sx, y + 5 * s); ctx.lineTo(sx, y - 8 * s); ctx.stroke();
        }
      }
    }
    ctx.fillStyle = PALETTE.text.accent; ctx.font = `bold ${12 * s}px system-ui`; ctx.textAlign = "center";
    ctx.fillText("ESCAPE", width / 2, height * 0.85);
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
    drawBg(ctx, width, height); drawParticles(ctx, parts, frame, s);
    const fo = fadeInOut(frame, 90); ctx.globalAlpha = fo;
    const t = interpolate(frame, [5, 50], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    // Split: shadow on left, escape behavior on right
    ctx.fillStyle = "rgba(0,0,0,0.4)";
    const shadowSize = t * 80 * s;
    ctx.beginPath(); ctx.arc(width * 0.3, height * 0.4, shadowSize, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = PALETTE.text.dim; ctx.font = `${10 * s}px system-ui`; ctx.textAlign = "center";
    ctx.fillText("looming", width * 0.3, height * 0.7);
    // Divider
    ctx.strokeStyle = "rgba(255,255,255,0.1)"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(width / 2, height * 0.15); ctx.lineTo(width / 2, height * 0.85); ctx.stroke();
    // Escape side
    if (t > 0.5) {
      drawFlyTop(ctx, width * 0.7, height * 0.4, 20 * s, `hsla(0, 50%, 60%, 0.7)`);
      ctx.fillStyle = `hsla(0, 60%, 60%, 0.8)`; ctx.font = `bold ${14 * s}px system-ui`; ctx.textAlign = "center";
      ctx.fillText("ESCAPE", width * 0.7, height * 0.7);
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
    drawBg(ctx, width, height); drawParticles(ctx, parts, frame, s);
    const fo = fadeInOut(frame, 90); ctx.globalAlpha = fo;
    // Lightning bolt (escape reflex = fast)
    const t = interpolate(frame, [15, 35], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (t > 0) {
      ctx.strokeStyle = `rgba(255,200,60,${t * 0.8})`; ctx.lineWidth = 3 * s;
      const cx = width / 2, top = height * 0.2;
      ctx.beginPath();
      ctx.moveTo(cx, top); ctx.lineTo(cx - 15 * s, top + 40 * s);
      ctx.lineTo(cx + 5 * s, top + 40 * s); ctx.lineTo(cx - 10 * s, top + 80 * s);
      ctx.stroke();
    }
    ctx.fillStyle = PALETTE.text.primary; ctx.font = `${12 * s}px system-ui`; ctx.textAlign = "center";
    ctx.fillText("shadow → escape", width / 2, height * 0.85);
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
    drawBg(ctx, width, height); drawParticles(ctx, parts, frame, s);
    const fo = fadeInOut(frame, 90); ctx.globalAlpha = fo;
    // Neuron chain: LC4 → GF → escape
    const nodes = [
      { x: width * 0.2, y: height * 0.5, label: "LC4", hue: 200 },
      { x: width * 0.5, y: height * 0.5, label: "GF", hue: 0 },
      { x: width * 0.8, y: height * 0.5, label: "escape", hue: 350 },
    ];
    const t = interpolate(frame, [5, 50], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i];
      const active = t > i * 0.3;
      ctx.fillStyle = active ? `hsla(${n.hue}, 55%, 55%, 0.7)` : "rgba(255,255,255,0.1)";
      ctx.beginPath(); ctx.arc(n.x, n.y, 18 * s, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = active ? PALETTE.text.primary : PALETTE.text.dim;
      ctx.font = `${9 * s}px monospace`; ctx.textAlign = "center";
      ctx.fillText(n.label, n.x, n.y + 30 * s);
      if (i < nodes.length - 1 && t > i * 0.3) {
        ctx.strokeStyle = "rgba(255,255,255,0.2)"; ctx.lineWidth = 1.5 * s;
        ctx.beginPath(); ctx.moveTo(n.x + 20 * s, n.y); ctx.lineTo(nodes[i + 1].x - 20 * s, nodes[i + 1].y); ctx.stroke();
      }
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
    drawBg(ctx, width, height); drawParticles(ctx, parts, frame, s);
    const fo = fadeInOut(frame, 90); ctx.globalAlpha = fo;
    // Fly running away from shadow — motion lines
    const t = interpolate(frame, [10, 50], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    // Shadow behind
    ctx.fillStyle = "rgba(0,0,0,0.4)";
    ctx.beginPath(); ctx.arc(width * 0.3, height * 0.45, t * 60 * s, 0, Math.PI * 2); ctx.fill();
    // Fly moving right
    const flyX = width * (0.4 + t * 0.3);
    drawFlyTop(ctx, flyX, height * 0.45, 20 * s, `hsla(200, 40%, 55%, 0.7)`);
    // Motion lines behind fly
    for (let i = 0; i < 3; i++) {
      const lx = flyX - (20 + i * 12) * s;
      ctx.strokeStyle = `rgba(255,255,255,${0.15 - i * 0.04})`; ctx.lineWidth = 1 * s;
      ctx.beginPath(); ctx.moveTo(lx, height * 0.42 + i * 5 * s); ctx.lineTo(lx - 15 * s, height * 0.42 + i * 5 * s); ctx.stroke();
    }
    ctx.fillStyle = PALETTE.text.dim; ctx.font = `${11 * s}px system-ui`; ctx.textAlign = "center";
    ctx.fillText("escape circuit fired", width / 2, height * 0.82);
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

export const VARIANTS_SHOT_052: VariantDef[] = [
  { id: "looming-shadow", label: "Looming Shadow", component: V1 },
  { id: "giant-eye", label: "Giant Eye", component: V2 },
  { id: "io-pipeline", label: "I/O Pipeline", component: V3 },
  { id: "expanding-dark", label: "Expanding Dark", component: V4 },
  { id: "spike-raster", label: "Spike Raster", component: V5 },
  { id: "split-screen", label: "Split Screen", component: V6 },
  { id: "lightning-bolt", label: "Lightning Bolt", component: V7 },
  { id: "neuron-chain", label: "Neuron Chain", component: V8 },
  { id: "fly-fleeing", label: "Fly Fleeing", component: V9 },
];
