import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantDef, VariantProps } from "../types";
import { seeded, drawBg, makeParticles, drawParticles, PALETTE, fadeInOut } from "../scenes/theme";
import { drawNeuron, drawX, drawFlyTop } from "../icons";

// Shot 56 — "But right now it's a brain in a jar. It says 'eat' and there's no mouth.
//            It says 'run' and there are no legs."

const V1: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(20, width, height, s), [width, height, s]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height); drawParticles(ctx, parts, frame, s);
    const fo = fadeInOut(frame, 150); ctx.globalAlpha = fo;
    const t = interpolate(frame, [5, 100], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    // Neuron cluster floating in dark space
    const rand = seeded(56);
    for (let i = 0; i < 5; i++) {
      const nx = width / 2 + (rand() - 0.5) * 60 * s;
      const ny = height * 0.4 + (rand() - 0.5) * 40 * s;
      drawNeuron(ctx, nx, ny, 12 * s, `hsla(280, 40%, 55%, 0.5)`, frame);
    }
    // Output signals fading to nothing
    if (t > 0.3) {
      for (let i = 0; i < 3; i++) {
        const a = -0.3 + i * 0.3;
        const len = interpolate(t, [0.3, 0.8], [10, 60], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) * s;
        const fade = interpolate(t, [0.3, 0.8], [0.5, 0.05], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        ctx.strokeStyle = `rgba(255,255,255,${fade})`; ctx.lineWidth = 1.5 * s;
        ctx.beginPath(); ctx.moveTo(width / 2 + 35 * s, height * 0.4);
        ctx.lineTo(width / 2 + 35 * s + Math.cos(a) * len, height * 0.4 + Math.sin(a) * len); ctx.stroke();
      }
    }
    ctx.fillStyle = PALETTE.text.dim; ctx.font = `${10 * s}px system-ui`; ctx.textAlign = "center";
    ctx.fillText("signals going nowhere", width / 2, height * 0.78);
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V2: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(20, width, height, s), [width, height, s]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height); drawParticles(ctx, parts, frame, s);
    const fo = fadeInOut(frame, 150); ctx.globalAlpha = fo;
    const t = interpolate(frame, [5, 90], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    // Brain in jar (glass container)
    const cx = width / 2, cy = height * 0.42;
    // Jar outline
    ctx.strokeStyle = "rgba(255,255,255,0.15)"; ctx.lineWidth = 2 * s;
    ctx.beginPath();
    ctx.moveTo(cx - 30 * s, cy - 45 * s); ctx.lineTo(cx - 25 * s, cy - 50 * s);
    ctx.lineTo(cx + 25 * s, cy - 50 * s); ctx.lineTo(cx + 30 * s, cy - 45 * s);
    ctx.lineTo(cx + 35 * s, cy + 35 * s); ctx.lineTo(cx - 35 * s, cy + 35 * s); ctx.closePath(); ctx.stroke();
    // Neuron inside jar
    drawNeuron(ctx, cx, cy, 18 * s, `hsla(280, 45%, 55%, 0.6)`, frame);
    // Signals bouncing off jar walls
    if (t > 0.3) {
      const bounce = Math.sin(frame * 0.08) * 15 * s;
      ctx.strokeStyle = `rgba(232,193,112,${0.3})`; ctx.lineWidth = 1 * s;
      ctx.beginPath(); ctx.moveTo(cx + 15 * s, cy); ctx.lineTo(cx + 30 * s + bounce, cy + bounce * 0.5); ctx.stroke();
    }
    ctx.fillStyle = PALETTE.text.dim; ctx.font = `${10 * s}px system-ui`; ctx.textAlign = "center";
    ctx.fillText("brain in a jar", cx, height * 0.82);
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V3: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(20, width, height, s), [width, height, s]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height); drawParticles(ctx, parts, frame, s);
    const fo = fadeInOut(frame, 150); ctx.globalAlpha = fo;
    const t = interpolate(frame, [5, 120], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.textAlign = "center";
    // Top: EAT but no mouth
    if (t > 0.1) {
      ctx.fillStyle = PALETTE.text.accent; ctx.font = `bold ${14 * s}px system-ui`;
      ctx.fillText("\"EAT\"", width * 0.3, height * 0.35);
      ctx.strokeStyle = PALETTE.text.dim; ctx.lineWidth = 1.5 * s;
      ctx.beginPath(); ctx.moveTo(width * 0.42, height * 0.33); ctx.lineTo(width * 0.55, height * 0.33); ctx.stroke();
      ctx.fillStyle = PALETTE.text.dim; ctx.font = `${10 * s}px system-ui`;
      ctx.fillText("no mouth", width * 0.7, height * 0.35);
      drawX(ctx, width * 0.7, height * 0.35 - 18 * s, 10 * s, PALETTE.accent.red);
    }
    // Bottom: RUN but no legs
    if (t > 0.45) {
      ctx.fillStyle = PALETTE.text.accent; ctx.font = `bold ${14 * s}px system-ui`;
      ctx.fillText("\"RUN\"", width * 0.3, height * 0.6);
      ctx.strokeStyle = PALETTE.text.dim; ctx.lineWidth = 1.5 * s;
      ctx.beginPath(); ctx.moveTo(width * 0.42, height * 0.58); ctx.lineTo(width * 0.55, height * 0.58); ctx.stroke();
      ctx.fillStyle = PALETTE.text.dim; ctx.font = `${10 * s}px system-ui`;
      ctx.fillText("no legs", width * 0.7, height * 0.6);
      drawX(ctx, width * 0.7, height * 0.6 - 18 * s, 10 * s, PALETTE.accent.red);
    }
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V4: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(20, width, height, s), [width, height, s]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height); drawParticles(ctx, parts, frame, s);
    const fo = fadeInOut(frame, 150); ctx.globalAlpha = fo;
    const t = interpolate(frame, [5, 100], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    // Brain neuron with speech bubbles
    drawNeuron(ctx, width / 2, height * 0.45, 20 * s, `hsla(280, 45%, 55%, 0.7)`, frame);
    ctx.textAlign = "center";
    // "eat!" bubble
    if (t > 0.2) {
      const bx = width / 2 - 40 * s, by = height * 0.25;
      ctx.fillStyle = "rgba(255,255,255,0.08)";
      ctx.beginPath(); ctx.ellipse(bx, by, 25 * s, 12 * s, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = PALETTE.text.accent; ctx.font = `bold ${10 * s}px system-ui`;
      ctx.fillText("eat!", bx, by + 4 * s);
    }
    // "run!" bubble
    if (t > 0.5) {
      const bx = width / 2 + 40 * s, by = height * 0.25;
      ctx.fillStyle = "rgba(255,255,255,0.08)";
      ctx.beginPath(); ctx.ellipse(bx, by, 25 * s, 12 * s, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = PALETTE.text.accent; ctx.font = `bold ${10 * s}px system-ui`;
      ctx.fillText("run!", bx, by + 4 * s);
    }
    // "no body connected" text
    ctx.fillStyle = PALETTE.text.dim; ctx.font = `${9 * s}px system-ui`;
    ctx.fillText("no body connected", width / 2, height * 0.78);
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V5: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(20, width, height, s), [width, height, s]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height); drawParticles(ctx, parts, frame, s);
    const fo = fadeInOut(frame, 150); ctx.globalAlpha = fo;
    const t = interpolate(frame, [5, 80], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    // Disconnected cables hanging from brain
    drawNeuron(ctx, width / 2, height * 0.3, 22 * s, `hsla(280, 45%, 55%, 0.7)`, frame);
    // Dangling wires
    for (let i = 0; i < 4; i++) {
      const wx = width * (0.35 + i * 0.1);
      const swing = Math.sin(frame * 0.03 + i * 1.5) * 5 * s;
      ctx.strokeStyle = `rgba(255,255,255,${0.15 + i * 0.03})`; ctx.lineWidth = 2 * s; ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(wx, height * 0.38);
      ctx.quadraticCurveTo(wx + swing, height * 0.52, wx + swing * 0.5, height * 0.6 + i * 5 * s); ctx.stroke();
      // Loose end circle
      ctx.fillStyle = `rgba(255,100,100,0.3)`;
      ctx.beginPath(); ctx.arc(wx + swing * 0.5, height * 0.6 + i * 5 * s, 3 * s, 0, Math.PI * 2); ctx.fill();
    }
    ctx.fillStyle = PALETTE.text.dim; ctx.font = `${10 * s}px system-ui`; ctx.textAlign = "center";
    ctx.fillText("no body to plug into", width / 2, height * 0.85);
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V6: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(20, width, height, s), [width, height, s]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height); drawParticles(ctx, parts, frame, s);
    const fo = fadeInOut(frame, 150); ctx.globalAlpha = fo;
    const t = interpolate(frame, [5, 90], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    // Neural network output arrows → void / question marks
    drawNeuron(ctx, width * 0.3, height * 0.45, 20 * s, `hsla(280, 45%, 55%, 0.7)`, frame);
    // Arrows going right
    for (let i = 0; i < 3; i++) {
      const ay = height * (0.35 + i * 0.1);
      const arrowEnd = width * 0.55 + t * width * 0.15;
      const fade = Math.max(0.05, 0.4 - t * 0.35);
      ctx.strokeStyle = `rgba(255,255,255,${fade})`; ctx.lineWidth = 1.5 * s;
      ctx.beginPath(); ctx.moveTo(width * 0.4, ay); ctx.lineTo(arrowEnd, ay); ctx.stroke();
    }
    // Question marks at the end
    ctx.fillStyle = `rgba(255,255,255,0.2)`; ctx.font = `bold ${18 * s}px system-ui`; ctx.textAlign = "center";
    ctx.fillText("?", width * 0.75, height * 0.48);
    ctx.fillStyle = PALETTE.text.dim; ctx.font = `${9 * s}px system-ui`;
    ctx.fillText("nowhere to go", width / 2, height * 0.82);
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V7: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(15, width, height, s), [width, height, s]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height); drawParticles(ctx, parts, frame, s);
    const fo = fadeInOut(frame, 150); ctx.globalAlpha = fo;
    // Brain pulsing in isolation
    const pulse = 0.5 + 0.3 * Math.sin(frame * 0.06);
    drawNeuron(ctx, width / 2, height * 0.45, 25 * s, `hsla(280, 40%, 50%, ${pulse})`, frame);
    // Dark surroundings emphasis
    const vignette = ctx.createRadialGradient(width / 2, height * 0.45, 30 * s, width / 2, height * 0.45, 120 * s);
    vignette.addColorStop(0, "rgba(0,0,0,0)"); vignette.addColorStop(1, "rgba(0,0,0,0.4)");
    ctx.fillStyle = vignette; ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = PALETTE.text.dim; ctx.font = `${10 * s}px system-ui`; ctx.textAlign = "center";
    ctx.fillText("alone", width / 2, height * 0.78);
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V8: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(20, width, height, s), [width, height, s]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height); drawParticles(ctx, parts, frame, s);
    const fo = fadeInOut(frame, 150); ctx.globalAlpha = fo;
    const t = interpolate(frame, [10, 110], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.textAlign = "center";
    // Behavior labels appearing but crossed out
    const items = [
      { label: "EAT", t: 0.1 },
      { label: "RUN", t: 0.35 },
      { label: "GROOM", t: 0.6 },
    ];
    for (const item of items) {
      if (t > item.t) {
        const i = items.indexOf(item);
        const cy = height * (0.28 + i * 0.18);
        ctx.fillStyle = PALETTE.text.primary; ctx.font = `bold ${14 * s}px system-ui`;
        ctx.fillText(item.label, width / 2, cy);
        if (t > item.t + 0.1) {
          drawX(ctx, width / 2 + 45 * s, cy - 5 * s, 10 * s, PALETTE.accent.red);
          ctx.fillStyle = PALETTE.text.dim; ctx.font = `${8 * s}px system-ui`;
          ctx.fillText("(no body)", width / 2 + 80 * s, cy);
        }
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
  const parts = useMemo(() => makeParticles(20, width, height, s), [width, height, s]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height); drawParticles(ctx, parts, frame, s);
    const fo = fadeInOut(frame, 150); ctx.globalAlpha = fo;
    const t = interpolate(frame, [5, 90], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    // Brain on left
    drawNeuron(ctx, width * 0.28, height * 0.45, 22 * s, `hsla(280, 45%, 55%, 0.7)`, frame);
    // Divider
    ctx.strokeStyle = "rgba(255,255,255,0.1)"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(width / 2, height * 0.15); ctx.lineTo(width / 2, height * 0.85); ctx.stroke();
    // Empty body outline on right (dotted)
    ctx.setLineDash([4 * s, 4 * s]); ctx.strokeStyle = "rgba(255,255,255,0.15)"; ctx.lineWidth = 1.5 * s;
    // Body silhouette outline
    const bx = width * 0.72, by = height * 0.45;
    ctx.beginPath(); ctx.ellipse(bx, by - 5 * s, 15 * s, 22 * s, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.arc(bx, by - 30 * s, 8 * s, 0, Math.PI * 2); ctx.stroke();
    ctx.setLineDash([]);
    // Labels
    ctx.fillStyle = PALETTE.text.dim; ctx.font = `${9 * s}px system-ui`; ctx.textAlign = "center";
    ctx.fillText("brain", width * 0.28, height * 0.75);
    ctx.fillText("no body", width * 0.72, height * 0.75);
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

export const VARIANTS_SHOT_056: VariantDef[] = [
  { id: "signals-nowhere", label: "Signals Nowhere", component: V1 },
  { id: "brain-jar", label: "Brain in Jar", component: V2 },
  { id: "eat-run-x", label: "Eat/Run X", component: V3 },
  { id: "speech-bubbles", label: "Speech Bubbles", component: V4 },
  { id: "dangling-wires", label: "Dangling Wires", component: V5 },
  { id: "arrows-void", label: "Arrows to Void", component: V6 },
  { id: "lonely-pulse", label: "Lonely Pulse", component: V7 },
  { id: "crossed-out", label: "Crossed Out", component: V8 },
  { id: "brain-no-body", label: "Brain No Body", component: V9 },
];
