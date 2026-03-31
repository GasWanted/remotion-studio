import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantDef, VariantProps } from "../types";
import { seeded, drawBg, makeParticles, drawParticles, PALETTE, fadeInOut } from "../scenes/theme";
import { drawFlyTop, drawNeuron } from "../icons";

// Shot 53 — "A touch on the antenna — grooming kicked in."

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
    const t = interpolate(frame, [5, 60], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    // Fly with antenna
    drawFlyTop(ctx, width / 2, height * 0.5, 30 * s, `hsla(200, 40%, 55%, 0.7)`);
    // Touch dot approaching antenna
    const dotX = interpolate(t, [0, 0.4], [width * 0.7, width / 2], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
    const dotY = interpolate(t, [0, 0.4], [height * 0.15, height * 0.5 - 30 * s * 0.32], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
    ctx.fillStyle = PALETTE.accent.gold; ctx.beginPath(); ctx.arc(dotX, dotY, 4 * s, 0, Math.PI * 2); ctx.fill();
    // Grooming leg reaching up after touch
    if (t > 0.5) {
      const legT = interpolate(t, [0.5, 0.9], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      ctx.strokeStyle = `hsla(200, 40%, 55%, ${legT * 0.8})`; ctx.lineWidth = 2 * s;
      ctx.beginPath(); ctx.moveTo(width / 2 + 12 * s, height * 0.5 - 5 * s);
      ctx.lineTo(width / 2 + 8 * s, height * 0.5 - 20 * s * legT - 10 * s); ctx.stroke();
    }
    ctx.fillStyle = PALETTE.text.accent; ctx.font = `bold ${12 * s}px system-ui`; ctx.textAlign = "center";
    if (t > 0.6) ctx.fillText("GROOM", width / 2, height * 0.85);
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
    const t = interpolate(frame, [5, 60], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.font = `bold ${14 * s}px system-ui`; ctx.textAlign = "center";
    // TOUCH label
    ctx.fillStyle = PALETTE.accent.gold; ctx.fillText("TOUCH", width * 0.18, height * 0.5);
    // Arrow 1
    if (t > 0.2) {
      ctx.strokeStyle = PALETTE.text.dim; ctx.lineWidth = 2 * s;
      ctx.beginPath(); ctx.moveTo(width * 0.28, height * 0.48); ctx.lineTo(width * 0.38, height * 0.48); ctx.stroke();
    }
    // Brain circle
    ctx.fillStyle = "rgba(150,130,200,0.25)";
    ctx.beginPath(); ctx.arc(width / 2, height * 0.48, 22 * s, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = PALETTE.text.dim; ctx.font = `${9 * s}px monospace`; ctx.fillText("brain", width / 2, height * 0.52);
    // Arrow 2
    if (t > 0.5) {
      ctx.strokeStyle = PALETTE.text.dim; ctx.lineWidth = 2 * s;
      ctx.beginPath(); ctx.moveTo(width * 0.62, height * 0.48); ctx.lineTo(width * 0.72, height * 0.48); ctx.stroke();
    }
    // GROOM label
    if (t > 0.6) {
      ctx.fillStyle = PALETTE.accent.green; ctx.font = `bold ${14 * s}px system-ui`;
      ctx.fillText("GROOM", width * 0.82, height * 0.5);
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
    const t = interpolate(frame, [5, 60], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    // Antenna glow at top
    const antY = height * 0.25;
    ctx.fillStyle = `hsla(45, 70%, 60%, ${0.3 + t * 0.4})`;
    ctx.beginPath(); ctx.arc(width / 2, antY, 12 * s, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = PALETTE.text.dim; ctx.font = `${9 * s}px monospace`; ctx.textAlign = "center";
    ctx.fillText("antenna", width / 2, antY + 20 * s);
    // Signal path
    if (t > 0.3) {
      const sigLen = interpolate(t, [0.3, 0.7], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      ctx.strokeStyle = `hsla(45, 60%, 50%, ${sigLen * 0.5})`; ctx.lineWidth = 2 * s;
      ctx.beginPath(); ctx.moveTo(width / 2, antY + 14 * s);
      ctx.lineTo(width / 2, antY + 14 * s + sigLen * 50 * s); ctx.stroke();
    }
    // aDN1 neuron
    if (t > 0.5) {
      const nAlpha = interpolate(t, [0.5, 0.8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      drawNeuron(ctx, width / 2, height * 0.6, 22 * s, `hsla(140, 50%, 55%, ${nAlpha})`, frame);
      ctx.fillStyle = PALETTE.text.primary; ctx.font = `${9 * s}px monospace`;
      ctx.fillText("aDN1 → groom", width / 2, height * 0.78);
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
    const t = interpolate(frame, [5, 65], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    // Spike raster: JO-CE fires, then aDN1 fires
    const rows = [
      { label: "JO-CE", hue: 45, start: 0 },
      { label: "JO-CE (2)", hue: 50, start: 0.05 },
      { label: "aDN1", hue: 140, start: 0.35 },
    ];
    for (let i = 0; i < rows.length; i++) {
      const r = rows[i]; const y = height * (0.28 + i * 0.17);
      ctx.fillStyle = PALETTE.text.dim; ctx.font = `${8 * s}px monospace`; ctx.textAlign = "right";
      ctx.fillText(r.label, width * 0.28, y + 3 * s);
      ctx.strokeStyle = "rgba(255,255,255,0.08)"; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(width * 0.3, y); ctx.lineTo(width * 0.88, y); ctx.stroke();
      if (t > r.start) {
        ctx.strokeStyle = `hsla(${r.hue}, 55%, 60%, 0.8)`; ctx.lineWidth = 1.5 * s;
        const count = Math.floor((t - r.start) * 18);
        for (let j = 0; j < count; j++) {
          const sx = width * 0.32 + j * 7 * s;
          if (sx > width * 0.86) break;
          ctx.beginPath(); ctx.moveTo(sx, y + 5 * s); ctx.lineTo(sx, y - 7 * s); ctx.stroke();
        }
      }
    }
    ctx.fillStyle = PALETTE.text.accent; ctx.font = `bold ${12 * s}px system-ui`; ctx.textAlign = "center";
    ctx.fillText("GROOM", width / 2, height * 0.86);
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
    const t = interpolate(frame, [5, 55], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    // Fly silhouette with glowing antenna
    drawFlyTop(ctx, width / 2, height * 0.45, 35 * s, `hsla(200, 35%, 50%, 0.6)`);
    // Antenna glow
    const glowR = 6 * s + Math.sin(frame * 0.15) * 2 * s;
    ctx.fillStyle = `hsla(45, 70%, 65%, ${0.3 + t * 0.5})`;
    ctx.beginPath(); ctx.arc(width / 2, height * 0.45 - 35 * s * 0.32, glowR, 0, Math.PI * 2); ctx.fill();
    // Leg reaching up to clean
    if (t > 0.4) {
      const legT = interpolate(t, [0.4, 0.8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      ctx.strokeStyle = `hsla(200, 40%, 55%, ${legT * 0.9})`; ctx.lineWidth = 2.5 * s; ctx.lineCap = "round";
      const tipY = height * 0.45 - 10 * s - legT * 25 * s;
      ctx.beginPath(); ctx.moveTo(width / 2 + 35 * s * 0.35, height * 0.45 + 5 * s);
      ctx.quadraticCurveTo(width / 2 + 25 * s, tipY + 10 * s, width / 2 + 5 * s, tipY); ctx.stroke();
    }
    ctx.fillStyle = PALETTE.text.dim; ctx.font = `${10 * s}px system-ui`; ctx.textAlign = "center";
    if (t > 0.5) ctx.fillText("grooming", width / 2, height * 0.85);
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
    const t = interpolate(frame, [5, 55], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    // Touch icon: small circle touching a line (antenna)
    ctx.strokeStyle = PALETTE.accent.gold; ctx.lineWidth = 2.5 * s; ctx.lineCap = "round";
    ctx.beginPath(); ctx.moveTo(width * 0.3, height * 0.35); ctx.lineTo(width * 0.3, height * 0.55); ctx.stroke();
    const touchY = interpolate(t, [0, 0.3], [height * 0.25, height * 0.4], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.fillStyle = PALETTE.accent.gold; ctx.beginPath(); ctx.arc(width * 0.3 + 8 * s, touchY, 5 * s, 0, Math.PI * 2); ctx.fill();
    // Arrow
    if (t > 0.35) {
      ctx.strokeStyle = PALETTE.text.dim; ctx.lineWidth = 1.5 * s;
      ctx.beginPath(); ctx.moveTo(width * 0.42, height * 0.45); ctx.lineTo(width * 0.55, height * 0.45); ctx.stroke();
    }
    // Fly icon with cleaning motion
    if (t > 0.45) {
      drawFlyTop(ctx, width * 0.7, height * 0.45, 22 * s, `hsla(140, 45%, 55%, 0.7)`);
      ctx.fillStyle = PALETTE.accent.green; ctx.font = `${10 * s}px system-ui`; ctx.textAlign = "center";
      ctx.fillText("cleaning", width * 0.7, height * 0.7);
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
    const t = interpolate(frame, [5, 55], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    // Divider
    ctx.strokeStyle = "rgba(255,255,255,0.1)"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(width / 2, height * 0.15); ctx.lineTo(width / 2, height * 0.85); ctx.stroke();
    // Left: stimulus (antenna touch)
    ctx.fillStyle = PALETTE.text.dim; ctx.font = `${9 * s}px system-ui`; ctx.textAlign = "center";
    ctx.fillText("stimulus", width * 0.25, height * 0.18);
    const dotAlpha = 0.4 + Math.sin(frame * 0.12) * 0.3;
    ctx.fillStyle = `hsla(45, 65%, 60%, ${dotAlpha * t})`;
    ctx.beginPath(); ctx.arc(width * 0.25, height * 0.45, 15 * s, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = PALETTE.text.primary; ctx.font = `${10 * s}px system-ui`;
    ctx.fillText("antenna touch", width * 0.25, height * 0.68);
    // Right: behavior (grooming)
    ctx.fillStyle = PALETTE.text.dim; ctx.font = `${9 * s}px system-ui`;
    ctx.fillText("behavior", width * 0.75, height * 0.18);
    if (t > 0.4) {
      drawFlyTop(ctx, width * 0.75, height * 0.45, 20 * s, `hsla(140, 45%, 55%, 0.7)`);
      ctx.fillStyle = PALETTE.accent.green; ctx.font = `bold ${11 * s}px system-ui`;
      ctx.fillText("GROOM", width * 0.75, height * 0.68);
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
    drawBg(ctx, width, height); drawParticles(ctx, parts, frame, s);
    const fo = fadeInOut(frame, 90); ctx.globalAlpha = fo;
    const t = interpolate(frame, [5, 55], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    // Neuron chain: sensory → interneuron → motor (grooming)
    const nodes = [
      { x: width * 0.18, label: "sensory", hue: 45 },
      { x: width * 0.5, label: "inter-\nneuron", hue: 220 },
      { x: width * 0.82, label: "motor\n(groom)", hue: 140 },
    ];
    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i]; const active = t > i * 0.25;
      const col = active ? `hsla(${n.hue}, 50%, 55%, 0.7)` : "rgba(255,255,255,0.1)";
      drawNeuron(ctx, n.x, height * 0.45, 20 * s, col, frame);
      ctx.fillStyle = active ? PALETTE.text.primary : PALETTE.text.dim;
      ctx.font = `${8 * s}px monospace`; ctx.textAlign = "center";
      const lines = n.label.split("\n");
      lines.forEach((l, li) => ctx.fillText(l, n.x, height * 0.65 + li * 11 * s));
      if (i < 2 && t > i * 0.25 + 0.15) {
        ctx.strokeStyle = "rgba(255,255,255,0.2)"; ctx.lineWidth = 1.5 * s;
        ctx.beginPath(); ctx.moveTo(n.x + 22 * s, height * 0.45);
        ctx.lineTo(nodes[i + 1].x - 22 * s, height * 0.45); ctx.stroke();
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
    const t = interpolate(frame, [10, 50], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    // Fly with text label for behavior
    drawFlyTop(ctx, width / 2, height * 0.4, 28 * s, `hsla(200, 40%, 55%, 0.65)`);
    // Speech bubble
    if (t > 0.35) {
      const bubAlpha = interpolate(t, [0.35, 0.6], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const bx = width / 2 + 30 * s, by = height * 0.28;
      ctx.fillStyle = `rgba(255,255,255,${bubAlpha * 0.12})`;
      ctx.beginPath();
      ctx.ellipse(bx, by, 35 * s, 16 * s, 0, 0, Math.PI * 2); ctx.fill();
      // Tail
      ctx.beginPath(); ctx.moveTo(bx - 12 * s, by + 14 * s);
      ctx.lineTo(width / 2 + 10 * s, height * 0.36); ctx.lineTo(bx - 5 * s, by + 12 * s); ctx.fill();
      ctx.fillStyle = `rgba(106,221,138,${bubAlpha})`; ctx.font = `bold ${11 * s}px system-ui`; ctx.textAlign = "center";
      ctx.fillText("groom", bx, by + 4 * s);
    }
    ctx.fillStyle = PALETTE.text.dim; ctx.font = `${9 * s}px system-ui`; ctx.textAlign = "center";
    ctx.fillText("antenna touch → grooming", width / 2, height * 0.82);
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

export const VARIANTS_SHOT_053: VariantDef[] = [
  { id: "antenna-touch", label: "Antenna Touch", component: V1 },
  { id: "io-labels", label: "I/O Labels", component: V2 },
  { id: "signal-to-adn1", label: "Signal to aDN1", component: V3 },
  { id: "spike-raster", label: "Spike Raster", component: V4 },
  { id: "glow-antenna", label: "Glow Antenna", component: V5 },
  { id: "touch-to-clean", label: "Touch to Clean", component: V6 },
  { id: "split-screen", label: "Split Screen", component: V7 },
  { id: "neuron-chain", label: "Neuron Chain", component: V8 },
  { id: "speech-bubble", label: "Speech Bubble", component: V9 },
];
