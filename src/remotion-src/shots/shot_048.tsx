import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantDef, VariantProps } from "../types";
import { seeded, drawBg, makeParticles, drawParticles, PALETTE, fadeInOut } from "../scenes/theme";
import { drawNeuron } from "../icons";

// Shot 48 — "And on the other side, one specific neuron — the one that controls feeding in a real fly — starts firing."
// 120 frames (4s). Feeding neuron starts firing on output side.

const V1: React.FC<VariantProps> = ({ width, height }) => {
  // Dense network, one neuron on far right highlighted and pulsing bright — labeled "FEED"
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(10, width, height, s), [width, height, s]);
  const nodes = useMemo(() => {
    const rand = seeded(48001);
    return Array.from({ length: 60 }, () => ({
      x: rand() * 0.75 + 0.05, y: rand() * 0.7 + 0.15,
      hue: PALETTE.cellColors[Math.floor(rand() * 8)][0],
    }));
  }, []);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, parts, frame, s);
    const a = fadeInOut(frame, 120);
    ctx.globalAlpha = a;

    // Dim network
    for (const n of nodes) {
      ctx.fillStyle = `hsla(${n.hue}, 15%, 30%, 0.2)`;
      ctx.beginPath();
      ctx.arc(n.x * width, n.y * height, 2 * s, 0, Math.PI * 2);
      ctx.fill();
    }

    // Feed neuron on far right
    const feedX = width * 0.88, feedY = height * 0.45;
    const feedAppear = interpolate(frame, [20, 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const pulse = frame > 45 ? 0.6 + Math.sin((frame - 45) * 0.15) * 0.4 : feedAppear * 0.3;

    if (feedAppear > 0) {
      ctx.globalAlpha = a * feedAppear;
      // Glow
      ctx.shadowColor = PALETTE.accent.gold;
      ctx.shadowBlur = 20 * s * pulse;
      drawNeuron(ctx, feedX, feedY, 28 * s, `hsla(45, 80%, 65%, ${pulse})`, frame);
      ctx.shadowBlur = 0;

      // Label
      const labelFade = interpolate(frame, [50, 65], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      if (labelFade > 0) {
        ctx.globalAlpha = a * labelFade;
        ctx.fillStyle = PALETTE.text.accent;
        ctx.font = `bold ${12 * s}px system-ui`;
        ctx.textAlign = "center";
        ctx.fillText("FEED", feedX, feedY + 30 * s);
      }
    }

    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V2: React.FC<VariantProps> = ({ width, height }) => {
  // Output panel: among many output neurons (dim), the feeding one starts flashing amber
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(8, width, height, s), [width, height, s]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, parts, frame, s);
    const a = fadeInOut(frame, 120);
    ctx.globalAlpha = a;

    // Output panel on right
    const panelX = width * 0.55, panelW = width * 0.38, panelY = height * 0.12, panelH = height * 0.76;
    ctx.strokeStyle = `hsla(220, 30%, 40%, 0.3)`;
    ctx.lineWidth = 1 * s;
    ctx.strokeRect(panelX, panelY, panelW, panelH);

    // Label
    ctx.fillStyle = PALETTE.text.dim;
    ctx.font = `${7 * s}px system-ui`;
    ctx.textAlign = "center";
    ctx.fillText("output neurons", panelX + panelW / 2, panelY - 5 * s);

    // 8 output neurons in a column
    const labels = ["walk", "turn", "groom", "FEED", "escape", "idle", "retreat", "fly"];
    const feedIdx = 3;
    for (let i = 0; i < 8; i++) {
      const ny = panelY + 12 * s + (i / 7) * (panelH - 24 * s);
      const nx = panelX + panelW / 2;
      const isFeed = i === feedIdx;

      const appear = interpolate(frame, [5 + i * 3, 15 + i * 3], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      ctx.globalAlpha = a * appear;

      if (isFeed && frame > 45) {
        const flash = 0.5 + Math.sin((frame - 45) * 0.18) * 0.5;
        ctx.fillStyle = `hsla(45, 80%, 65%, ${flash})`;
        ctx.shadowColor = PALETTE.accent.gold;
        ctx.shadowBlur = 12 * s * flash;
        ctx.beginPath();
        ctx.arc(nx, ny, 6 * s, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.fillStyle = PALETTE.text.accent;
      } else {
        ctx.fillStyle = `hsla(220, 15%, 35%, 0.4)`;
        ctx.beginPath();
        ctx.arc(nx, ny, 4 * s, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = PALETTE.text.dim;
      }

      ctx.font = `${7 * s}px system-ui`;
      ctx.textAlign = "left";
      ctx.fillText(labels[i], nx + 12 * s, ny + 3 * s);
    }

    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V3: React.FC<VariantProps> = ({ width, height }) => {
  // Spike raster: among many flat lines, one output line starts showing spikes, labeled "MN9"
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(8, width, height, s), [width, height, s]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, parts, frame, s);
    const a = fadeInOut(frame, 120);
    ctx.globalAlpha = a;

    const traceCount = 7;
    const traceH = height * 0.7 / traceCount;
    const startX = width * 0.18, endX = width * 0.88;
    const startY = height * 0.12;
    const mn9Row = 3; // row index of the feeding neuron

    for (let r = 0; r < traceCount; r++) {
      const ty = startY + r * traceH + traceH / 2;
      const isMN9 = r === mn9Row;

      // Label
      ctx.fillStyle = isMN9 ? PALETTE.text.accent : PALETTE.text.dim;
      ctx.font = `${7 * s}px monospace`;
      ctx.textAlign = "right";
      ctx.fillText(isMN9 ? "MN9" : `N${r}`, startX - 5 * s, ty + 3 * s);

      // Baseline
      ctx.strokeStyle = `hsla(220, 15%, 35%, 0.3)`;
      ctx.lineWidth = 0.5 * s;
      ctx.beginPath();
      ctx.moveTo(startX, ty);
      ctx.lineTo(endX, ty);
      ctx.stroke();

      // Spikes for MN9 starting mid-animation
      if (isMN9) {
        const spikeStart = 40;
        const traceLen = endX - startX;
        ctx.strokeStyle = PALETTE.accent.gold;
        ctx.lineWidth = 1.5 * s;
        ctx.beginPath();
        const visibleFrames = Math.min(frame, 120);
        for (let f = 0; f < visibleFrames; f++) {
          const px = startX + (f / 120) * traceLen;
          const spike = (f > spikeStart && (f - spikeStart) % 8 < 2) ? -traceH * 0.4 : 0;
          f === 0 ? ctx.moveTo(px, ty + spike) : ctx.lineTo(px, ty + spike);
        }
        ctx.stroke();
      }
    }

    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V4: React.FC<VariantProps> = ({ width, height }) => {
  // Spotlight on one neuron emerging from the network, "feeding neuron" label
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(10, width, height, s), [width, height, s]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, parts, frame, s);
    const a = fadeInOut(frame, 120);
    ctx.globalAlpha = a;

    const cx = width / 2, cy = height * 0.4;

    // Dim background network
    const rand = seeded(48004);
    for (let i = 0; i < 40; i++) {
      ctx.fillStyle = `hsla(220, 15%, 30%, 0.15)`;
      ctx.beginPath();
      ctx.arc(rand() * width, rand() * height, 1.5 * s, 0, Math.PI * 2);
      ctx.fill();
    }

    // Spotlight cone
    const spotFade = interpolate(frame, [15, 35], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (spotFade > 0) {
      const spotGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 60 * s);
      spotGrad.addColorStop(0, `hsla(45, 60%, 60%, ${spotFade * 0.15})`);
      spotGrad.addColorStop(1, `hsla(45, 60%, 60%, 0)`);
      ctx.fillStyle = spotGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, 60 * s, 0, Math.PI * 2);
      ctx.fill();
    }

    // The neuron
    const neuronFade = interpolate(frame, [25, 45], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (neuronFade > 0) {
      ctx.globalAlpha = a * neuronFade;
      const pulse = frame > 50 ? 0.5 + Math.sin((frame - 50) * 0.12) * 0.5 : neuronFade * 0.5;
      ctx.shadowColor = PALETTE.accent.gold;
      ctx.shadowBlur = 15 * s * pulse;
      drawNeuron(ctx, cx, cy, 30 * s, `hsla(45, 80%, 65%, ${0.5 + pulse * 0.5})`, frame);
      ctx.shadowBlur = 0;
    }

    // Label
    const labelFade = interpolate(frame, [55, 75], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (labelFade > 0) {
      ctx.globalAlpha = a * labelFade;
      ctx.fillStyle = PALETTE.text.accent;
      ctx.font = `${11 * s}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText("feeding neuron", cx, cy + 40 * s);
    }

    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V5: React.FC<VariantProps> = ({ width, height }) => {
  // Network with arrow pointing to single glowing output neuron, bar chart showing fire rate
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(8, width, height, s), [width, height, s]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, parts, frame, s);
    const a = fadeInOut(frame, 120);
    ctx.globalAlpha = a;

    // Small network on left
    const rand = seeded(48005);
    for (let i = 0; i < 25; i++) {
      const nx = width * 0.08 + rand() * width * 0.35;
      const ny = height * 0.2 + rand() * height * 0.5;
      ctx.fillStyle = `hsla(220, 20%, 40%, 0.3)`;
      ctx.beginPath();
      ctx.arc(nx, ny, 2 * s, 0, Math.PI * 2);
      ctx.fill();
    }

    // Arrow
    const arrowFade = interpolate(frame, [15, 35], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (arrowFade > 0) {
      ctx.globalAlpha = a * arrowFade;
      ctx.strokeStyle = PALETTE.text.dim;
      ctx.lineWidth = 1.5 * s;
      ctx.beginPath();
      ctx.moveTo(width * 0.48, height * 0.4);
      ctx.lineTo(width * 0.58, height * 0.4);
      ctx.stroke();
      ctx.fillStyle = PALETTE.text.dim;
      ctx.beginPath();
      ctx.moveTo(width * 0.6, height * 0.4);
      ctx.lineTo(width * 0.57, height * 0.4 - 4 * s);
      ctx.lineTo(width * 0.57, height * 0.4 + 4 * s);
      ctx.closePath();
      ctx.fill();
    }

    // Output neuron
    const neuronFade = interpolate(frame, [30, 50], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (neuronFade > 0) {
      ctx.globalAlpha = a * neuronFade;
      const pulse = frame > 55 ? 0.5 + Math.sin((frame - 55) * 0.14) * 0.5 : 0.3;
      drawNeuron(ctx, width * 0.72, height * 0.35, 22 * s, `hsla(45, 80%, 65%, ${pulse})`, frame);
    }

    // Bar chart below
    const barFade = interpolate(frame, [55, 75], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (barFade > 0) {
      ctx.globalAlpha = a * barFade;
      const barX = width * 0.6, barY = height * 0.6, barW = width * 0.3, barH = height * 0.25;
      // Fire rate bar growing
      const barGrow = interpolate(frame, [60, 100], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      ctx.fillStyle = `hsla(45, 70%, 55%, 0.6)`;
      ctx.fillRect(barX, barY + barH * (1 - barGrow), barW * 0.3, barH * barGrow);
      // Label
      ctx.fillStyle = PALETTE.text.dim;
      ctx.font = `${7 * s}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText("fire rate", barX + barW * 0.15, barY + barH + 12 * s);
      // Hz value
      if (barGrow > 0.5) {
        const hz = Math.floor(barGrow * 61);
        ctx.fillStyle = PALETTE.text.accent;
        ctx.fillText(`${hz} Hz`, barX + barW * 0.15, barY + barH * (1 - barGrow) - 5 * s);
      }
    }

    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V6: React.FC<VariantProps> = ({ width, height }) => {
  // Single neuron on right side glowing gold, rest of network fading to dim
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(10, width, height, s), [width, height, s]);
  const nodes = useMemo(() => {
    const rand = seeded(48006);
    return Array.from({ length: 50 }, () => ({
      x: rand() * 0.7 + 0.05, y: rand() * 0.7 + 0.15,
      hue: PALETTE.cellColors[Math.floor(rand() * 8)][0],
    }));
  }, []);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, parts, frame, s);
    const a = fadeInOut(frame, 120);
    ctx.globalAlpha = a;

    // Network fading out
    const dimProg = interpolate(frame, [30, 60], [0.4, 0.1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    for (const n of nodes) {
      ctx.fillStyle = `hsla(${n.hue}, 15%, 35%, ${dimProg})`;
      ctx.beginPath();
      ctx.arc(n.x * width, n.y * height, 2 * s, 0, Math.PI * 2);
      ctx.fill();
    }

    // Gold neuron growing on right
    const goldFade = interpolate(frame, [25, 50], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (goldFade > 0) {
      const gx = width * 0.85, gy = height * 0.45;
      const pulse = frame > 55 ? 0.5 + Math.sin((frame - 55) * 0.13) * 0.5 : goldFade * 0.4;
      ctx.globalAlpha = a * goldFade;
      ctx.shadowColor = PALETTE.accent.gold;
      ctx.shadowBlur = 25 * s * pulse;
      drawNeuron(ctx, gx, gy, 32 * s * goldFade, `hsla(45, 80%, 65%, ${0.4 + pulse * 0.6})`, frame);
      ctx.shadowBlur = 0;
    }

    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V7: React.FC<VariantProps> = ({ width, height }) => {
  // Text "FEED" appearing as a neuron flashes, activity trace rising
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(8, width, height, s), [width, height, s]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, parts, frame, s);
    const a = fadeInOut(frame, 120);
    ctx.globalAlpha = a;

    const cx = width / 2, cy = height * 0.35;

    // Neuron flashing
    const flash = frame > 30 ? 0.4 + Math.sin((frame - 30) * 0.15) * 0.6 : 0;
    if (flash > 0) {
      ctx.shadowColor = PALETTE.accent.gold;
      ctx.shadowBlur = 15 * s * flash;
      drawNeuron(ctx, cx, cy, 25 * s, `hsla(45, 80%, 65%, ${flash})`, frame);
      ctx.shadowBlur = 0;
    }

    // "FEED" text appearing
    const textFade = interpolate(frame, [40, 60], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (textFade > 0) {
      ctx.globalAlpha = a * textFade;
      ctx.fillStyle = PALETTE.text.accent;
      ctx.font = `bold ${24 * s}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText("FEED", cx, cy + 45 * s);
    }

    // Activity trace below
    const traceFade = interpolate(frame, [50, 70], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (traceFade > 0) {
      ctx.globalAlpha = a * traceFade;
      const traceY = height * 0.72, traceW = width * 0.6;
      const traceX = cx - traceW / 2;
      ctx.strokeStyle = `hsla(45, 70%, 55%, 0.6)`;
      ctx.lineWidth = 1.5 * s;
      ctx.beginPath();
      const visLen = traceW * interpolate(frame, [50, 110], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      for (let i = 0; i < visLen; i += 2) {
        const rise = interpolate(i, [0, traceW], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        const py = traceY - rise * height * 0.12 + Math.sin(i * 0.15) * 3 * s;
        i === 0 ? ctx.moveTo(traceX + i, py) : ctx.lineTo(traceX + i, py);
      }
      ctx.stroke();
    }

    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V8: React.FC<VariantProps> = ({ width, height }) => {
  // Meter/gauge for feeding neuron going from 0 to active
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(8, width, height, s), [width, height, s]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, parts, frame, s);
    const a = fadeInOut(frame, 120);
    ctx.globalAlpha = a;

    const cx = width / 2, cy = height * 0.48;
    const gaugeR = 55 * s;

    // Gauge arc background
    ctx.strokeStyle = `hsla(220, 15%, 30%, 0.3)`;
    ctx.lineWidth = 8 * s;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.arc(cx, cy, gaugeR, Math.PI * 0.75, Math.PI * 2.25);
    ctx.stroke();

    // Fill arc
    const fillProg = interpolate(frame, [25, 90], [0, 0.85], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (fillProg > 0) {
      const fillAngle = Math.PI * 0.75 + fillProg * Math.PI * 1.5;
      const hue = interpolate(fillProg, [0, 0.85], [220, 45], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      ctx.strokeStyle = `hsla(${hue}, 70%, 55%, 0.8)`;
      ctx.lineWidth = 8 * s;
      ctx.beginPath();
      ctx.arc(cx, cy, gaugeR, Math.PI * 0.75, fillAngle);
      ctx.stroke();

      // Needle
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(fillAngle);
      ctx.fillStyle = PALETTE.text.primary;
      ctx.beginPath();
      ctx.moveTo(gaugeR * 0.6, 0);
      ctx.lineTo(gaugeR * 0.85, -2 * s);
      ctx.lineTo(gaugeR * 0.85, 2 * s);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    // Label
    ctx.fillStyle = PALETTE.text.dim;
    ctx.font = `${8 * s}px system-ui`;
    ctx.textAlign = "center";
    ctx.fillText("feeding neuron", cx, cy + gaugeR + 16 * s);

    // Value
    if (fillProg > 0.1) {
      const hz = Math.floor(fillProg * 61 / 0.85);
      ctx.fillStyle = PALETTE.text.accent;
      ctx.font = `bold ${14 * s}px system-ui`;
      ctx.fillText(`${hz} Hz`, cx, cy + 8 * s);
    }

    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V9: React.FC<VariantProps> = ({ width, height }) => {
  // Output neurons in a row, most quiet, one (feeding) lighting up brightly
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(8, width, height, s), [width, height, s]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, parts, frame, s);
    const a = fadeInOut(frame, 120);
    ctx.globalAlpha = a;

    const cy = height * 0.45;
    const neuronCount = 9;
    const feedIdx = 4;
    const spacing = width / (neuronCount + 1);

    for (let i = 0; i < neuronCount; i++) {
      const nx = spacing * (i + 1);
      const isFeed = i === feedIdx;
      const appear = interpolate(frame, [5 + i * 2, 20 + i * 2], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      ctx.globalAlpha = a * appear;

      if (isFeed && frame > 40) {
        const pulse = 0.5 + Math.sin((frame - 40) * 0.15) * 0.5;
        ctx.shadowColor = PALETTE.accent.gold;
        ctx.shadowBlur = 18 * s * pulse;
        drawNeuron(ctx, nx, cy, 20 * s, `hsla(45, 80%, 65%, ${0.5 + pulse * 0.5})`, frame);
        ctx.shadowBlur = 0;

        // Label
        const labelFade = interpolate(frame, [55, 70], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        if (labelFade > 0) {
          ctx.globalAlpha = a * labelFade;
          ctx.fillStyle = PALETTE.text.accent;
          ctx.font = `bold ${9 * s}px system-ui`;
          ctx.textAlign = "center";
          ctx.fillText("FEED", nx, cy + 25 * s);
        }
      } else {
        ctx.fillStyle = `hsla(220, 15%, 35%, 0.3)`;
        ctx.beginPath();
        ctx.arc(nx, cy, 5 * s, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

export const VARIANTS_SHOT_048: VariantDef[] = [
  { id: "dense-network-feed", label: "Dense Network + FEED", component: V1 },
  { id: "output-panel", label: "Output Panel Flash", component: V2 },
  { id: "spike-raster-mn9", label: "Spike Raster MN9", component: V3 },
  { id: "spotlight-neuron", label: "Spotlight Neuron", component: V4 },
  { id: "arrow-bar-chart", label: "Arrow + Bar Chart", component: V5 },
  { id: "gold-emerge", label: "Gold Neuron Emerges", component: V6 },
  { id: "feed-text-trace", label: "FEED Text + Trace", component: V7 },
  { id: "gauge-meter", label: "Gauge Meter", component: V8 },
  { id: "output-row", label: "Output Row Highlight", component: V9 },
];
