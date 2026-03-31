import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantDef, VariantProps } from "../types";
import { seeded, drawBg, makeParticles, drawParticles, PALETTE, fadeInOut } from "../scenes/theme";
import { drawFlySide, drawNeuron } from "../icons";

// Shot 49 — "The brain wants to eat."
// 90 frames (3s). Fly silhouette feeding (proboscis down).

const V1: React.FC<VariantProps> = ({ width, height }) => {
  // Fly silhouette with proboscis extended downward, "FEED" behavior label
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(10, width, height, s), [width, height, s]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, parts, frame, s);
    const a = fadeInOut(frame, 90);
    ctx.globalAlpha = a;

    const cx = width / 2, cy = height * 0.4;
    drawFlySide(ctx, cx, cy, 65 * s, `hsla(220, 30%, 60%, 0.8)`);

    // Proboscis extending down
    const extend = interpolate(frame, [10, 35], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.strokeStyle = `hsla(15, 50%, 50%, 0.8)`;
    ctx.lineWidth = 2 * s;
    ctx.lineCap = "round";
    const headX = cx + 65 * s * 0.3;
    const headY = cy - 65 * s * 0.05;
    ctx.beginPath();
    ctx.moveTo(headX, headY);
    ctx.quadraticCurveTo(headX + 3 * s, headY + extend * 20 * s, headX - 2 * s, headY + extend * 30 * s);
    ctx.stroke();

    // "FEED" label
    const labelFade = interpolate(frame, [35, 50], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (labelFade > 0) {
      ctx.globalAlpha = a * labelFade;
      ctx.fillStyle = PALETTE.text.accent;
      ctx.font = `bold ${18 * s}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText("FEED", cx, height * 0.78);
    }

    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V2: React.FC<VariantProps> = ({ width, height }) => {
  // Text "the brain wants to eat" with fly icon below, proboscis reaching for food
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(8, width, height, s), [width, height, s]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, parts, frame, s);
    const a = fadeInOut(frame, 90);
    ctx.globalAlpha = a;

    // Text
    const textFade = interpolate(frame, [5, 25], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = a * textFade;
    ctx.fillStyle = PALETTE.text.primary;
    ctx.font = `${13 * s}px system-ui`;
    ctx.textAlign = "center";
    ctx.fillText("the brain wants to", width / 2, height * 0.22);
    ctx.fillStyle = PALETTE.text.accent;
    ctx.font = `bold ${16 * s}px system-ui`;
    ctx.fillText("eat", width / 2, height * 0.32);

    // Fly below
    ctx.globalAlpha = a;
    const flyFade = interpolate(frame, [20, 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = a * flyFade;
    drawFlySide(ctx, width / 2, height * 0.55, 50 * s, `hsla(220, 30%, 60%, 0.8)`);

    // Food dot
    ctx.fillStyle = PALETTE.accent.gold;
    ctx.beginPath();
    ctx.arc(width / 2 + 50 * s * 0.35, height * 0.55 + 20 * s, 5 * s, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V3: React.FC<VariantProps> = ({ width, height }) => {
  // Brain icon -> arrow -> fork/food icon
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(8, width, height, s), [width, height, s]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, parts, frame, s);
    const a = fadeInOut(frame, 90);
    ctx.globalAlpha = a;

    const cy = height * 0.45;
    // Brain (drawn as neuron cluster)
    const brainFade = interpolate(frame, [5, 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = a * brainFade;
    drawNeuron(ctx, width * 0.25, cy, 25 * s, `hsla(280, 50%, 62%, 0.8)`, frame);
    ctx.fillStyle = PALETTE.text.dim;
    ctx.font = `${8 * s}px system-ui`;
    ctx.textAlign = "center";
    ctx.fillText("brain", width * 0.25, cy + 30 * s);

    // Arrow
    const arrowFade = interpolate(frame, [20, 35], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (arrowFade > 0) {
      ctx.globalAlpha = a * arrowFade;
      ctx.strokeStyle = PALETTE.text.dim;
      ctx.lineWidth = 2 * s;
      ctx.beginPath();
      ctx.moveTo(width * 0.4, cy);
      ctx.lineTo(width * 0.55, cy);
      ctx.stroke();
      ctx.fillStyle = PALETTE.text.dim;
      ctx.beginPath();
      ctx.moveTo(width * 0.57, cy);
      ctx.lineTo(width * 0.54, cy - 4 * s);
      ctx.lineTo(width * 0.54, cy + 4 * s);
      ctx.closePath();
      ctx.fill();
    }

    // Food icon (simple plate + circle)
    const foodFade = interpolate(frame, [30, 50], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (foodFade > 0) {
      ctx.globalAlpha = a * foodFade;
      // Plate
      ctx.strokeStyle = `hsla(45, 50%, 55%, 0.6)`;
      ctx.lineWidth = 2 * s;
      ctx.beginPath();
      ctx.ellipse(width * 0.75, cy + 5 * s, 22 * s, 8 * s, 0, 0, Math.PI * 2);
      ctx.stroke();
      // Food on plate
      ctx.fillStyle = PALETTE.accent.gold;
      ctx.beginPath();
      ctx.arc(width * 0.75, cy - 3 * s, 8 * s, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = PALETTE.text.dim;
      ctx.font = `${8 * s}px system-ui`;
      ctx.fillText("eat", width * 0.75, cy + 25 * s);
    }

    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V4: React.FC<VariantProps> = ({ width, height }) => {
  // Fly side view feeding, satisfied glow
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(10, width, height, s), [width, height, s]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, parts, frame, s);
    const a = fadeInOut(frame, 90);
    ctx.globalAlpha = a;

    const cx = width / 2, cy = height * 0.42;
    drawFlySide(ctx, cx, cy, 60 * s, `hsla(220, 30%, 60%, 0.8)`);

    // Proboscis down
    const headX = cx + 60 * s * 0.3;
    ctx.strokeStyle = `hsla(15, 50%, 50%, 0.7)`;
    ctx.lineWidth = 2 * s;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(headX, cy);
    ctx.lineTo(headX - 2 * s, cy + 25 * s);
    ctx.stroke();

    // Satisfied glow
    const glowProg = interpolate(frame, [25, 55], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (glowProg > 0) {
      const glowGrad = ctx.createRadialGradient(cx, cy, 10 * s, cx, cy, 70 * s);
      glowGrad.addColorStop(0, `hsla(45, 70%, 55%, ${glowProg * 0.2})`);
      glowGrad.addColorStop(1, `hsla(45, 70%, 55%, 0)`);
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, 70 * s, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V5: React.FC<VariantProps> = ({ width, height }) => {
  // Simple: large text "EAT" with fly silhouette overlaid
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(6, width, height, s), [width, height, s]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, parts, frame, s);
    const a = fadeInOut(frame, 90);
    ctx.globalAlpha = a;

    // Big "EAT" text
    const textFade = interpolate(frame, [10, 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = a * textFade;
    ctx.fillStyle = `hsla(45, 70%, 55%, 0.2)`;
    ctx.font = `bold ${80 * s}px system-ui`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("EAT", width / 2, height / 2);

    // Fly on top
    ctx.globalAlpha = a;
    drawFlySide(ctx, width / 2, height / 2, 50 * s, `hsla(220, 35%, 65%, 0.85)`);

    ctx.textBaseline = "alphabetic";
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V6: React.FC<VariantProps> = ({ width, height }) => {
  // Behavior output: bar chart with "FEED" bar tall and highlighted
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(6, width, height, s), [width, height, s]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, parts, frame, s);
    const a = fadeInOut(frame, 90);
    ctx.globalAlpha = a;

    const labels = ["walk", "turn", "groom", "FEED", "escape", "idle"];
    const values = [0.1, 0.05, 0.08, 0.9, 0.03, 0.12];
    const barCount = labels.length;
    const chartX = width * 0.1, chartW = width * 0.8;
    const chartY = height * 0.2, chartH = height * 0.55;
    const barW = chartW / barCount * 0.6;
    const gap = chartW / barCount * 0.4;

    const grow = interpolate(frame, [10, 60], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

    for (let i = 0; i < barCount; i++) {
      const bx = chartX + i * (barW + gap) + gap / 2;
      const barH = values[i] * chartH * grow;
      const isFeed = i === 3;

      ctx.fillStyle = isFeed
        ? `hsla(45, 80%, 60%, 0.85)`
        : `hsla(220, 20%, 40%, 0.35)`;

      if (isFeed) {
        ctx.shadowColor = PALETTE.accent.gold;
        ctx.shadowBlur = 10 * s;
      }
      ctx.fillRect(bx, chartY + chartH - barH, barW, barH);
      ctx.shadowBlur = 0;

      // Label
      ctx.fillStyle = isFeed ? PALETTE.text.accent : PALETTE.text.dim;
      ctx.font = `${7 * s}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText(labels[i], bx + barW / 2, chartY + chartH + 12 * s);
    }

    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V7: React.FC<VariantProps> = ({ width, height }) => {
  // Fly at food source, neural activity trace above showing feeding neuron firing
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(8, width, height, s), [width, height, s]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, parts, frame, s);
    const a = fadeInOut(frame, 90);
    ctx.globalAlpha = a;

    // Neural trace at top
    const traceY = height * 0.22, traceW = width * 0.7;
    const traceX = width * 0.15;
    const traceProg = interpolate(frame, [5, 80], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.strokeStyle = `hsla(45, 70%, 55%, 0.6)`;
    ctx.lineWidth = 1.5 * s;
    ctx.beginPath();
    for (let i = 0; i < traceW * traceProg; i += 2) {
      const spike = (Math.floor(i / 10) % 4 === 0) ? -15 * s : 0;
      const py = traceY + spike;
      i === 0 ? ctx.moveTo(traceX + i, py) : ctx.lineTo(traceX + i, py);
    }
    ctx.stroke();

    // Fly below feeding
    drawFlySide(ctx, width / 2, height * 0.58, 55 * s, `hsla(220, 30%, 60%, 0.8)`);
    // Food
    ctx.fillStyle = PALETTE.accent.gold;
    ctx.beginPath();
    ctx.arc(width / 2 + 55 * s * 0.35, height * 0.58 + 18 * s, 6 * s, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V8: React.FC<VariantProps> = ({ width, height }) => {
  // Close-up fly head, proboscis down, amber glow = satisfaction
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(8, width, height, s), [width, height, s]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, parts, frame, s);
    const a = fadeInOut(frame, 90);
    ctx.globalAlpha = a;

    const cx = width / 2, cy = height * 0.38;
    // Large fly head
    const headR = 35 * s;
    ctx.fillStyle = `hsla(220, 25%, 45%, 0.8)`;
    ctx.beginPath();
    ctx.ellipse(cx, cy, headR, headR * 0.85, 0, 0, Math.PI * 2);
    ctx.fill();
    // Compound eyes
    ctx.fillStyle = `hsla(350, 50%, 50%, 0.6)`;
    ctx.beginPath();
    ctx.ellipse(cx - headR * 0.45, cy - headR * 0.15, headR * 0.3, headR * 0.35, -0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(cx + headR * 0.45, cy - headR * 0.15, headR * 0.3, headR * 0.35, 0.3, 0, Math.PI * 2);
    ctx.fill();

    // Proboscis extending down
    const extend = interpolate(frame, [10, 35], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.strokeStyle = `hsla(15, 50%, 50%, 0.8)`;
    ctx.lineWidth = 3 * s;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(cx, cy + headR * 0.7);
    ctx.quadraticCurveTo(cx + 3 * s, cy + headR + extend * 30 * s, cx - 2 * s, cy + headR + extend * 45 * s);
    ctx.stroke();

    // Amber satisfaction glow
    const glowProg = interpolate(frame, [40, 70], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (glowProg > 0) {
      const pulse = 0.5 + Math.sin(frame * 0.08) * 0.3;
      const glowGrad = ctx.createRadialGradient(cx, cy, headR * 0.5, cx, cy, headR * 2.5);
      glowGrad.addColorStop(0, `hsla(45, 70%, 55%, ${glowProg * pulse * 0.25})`);
      glowGrad.addColorStop(1, `hsla(45, 70%, 55%, 0)`);
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, headR * 2.5, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V9: React.FC<VariantProps> = ({ width, height }) => {
  // Brain -> body -> behavior chain: brain fires -> legs approach -> mouth eats
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(8, width, height, s), [width, height, s]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, parts, frame, s);
    const a = fadeInOut(frame, 90);
    ctx.globalAlpha = a;

    const cy = height * 0.45;
    const steps = [
      { x: 0.17, label: "brain fires", delay: 0 },
      { x: 0.5, label: "body moves", delay: 18 },
      { x: 0.83, label: "mouth eats", delay: 36 },
    ];

    for (let i = 0; i < steps.length; i++) {
      const st = steps[i];
      const stepFade = interpolate(frame, [8 + st.delay, 22 + st.delay], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      ctx.globalAlpha = a * stepFade;
      const px = st.x * width;

      // Icon
      if (i === 0) {
        drawNeuron(ctx, px, cy, 20 * s, `hsla(280, 50%, 62%, 0.8)`, frame);
      } else if (i === 1) {
        drawFlySide(ctx, px, cy, 35 * s, `hsla(220, 30%, 60%, 0.8)`);
      } else {
        // Mouth/food
        ctx.fillStyle = PALETTE.accent.gold;
        ctx.beginPath();
        ctx.arc(px, cy, 10 * s, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = `hsla(15, 50%, 50%, 0.7)`;
        ctx.lineWidth = 2 * s;
        ctx.beginPath();
        ctx.arc(px, cy - 5 * s, 12 * s, 0.2, Math.PI - 0.2);
        ctx.stroke();
      }

      // Label
      ctx.fillStyle = i === 2 ? PALETTE.text.accent : PALETTE.text.dim;
      ctx.font = `${8 * s}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText(st.label, px, cy + 28 * s);

      // Arrow to next
      if (i < steps.length - 1) {
        const arrowFade = interpolate(frame, [18 + st.delay, 28 + st.delay], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        if (arrowFade > 0) {
          ctx.globalAlpha = a * arrowFade;
          const ax1 = px + 22 * s;
          const ax2 = steps[i + 1].x * width - 22 * s;
          ctx.strokeStyle = PALETTE.text.dim;
          ctx.lineWidth = 1.5 * s;
          ctx.beginPath();
          ctx.moveTo(ax1, cy);
          ctx.lineTo(ax2, cy);
          ctx.stroke();
          ctx.fillStyle = PALETTE.text.dim;
          ctx.beginPath();
          ctx.moveTo(ax2 + 4 * s, cy);
          ctx.lineTo(ax2 - 2 * s, cy - 3 * s);
          ctx.lineTo(ax2 - 2 * s, cy + 3 * s);
          ctx.closePath();
          ctx.fill();
        }
      }
    }

    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

export const VARIANTS_SHOT_049: VariantDef[] = [
  { id: "fly-proboscis-feed", label: "Fly Proboscis FEED", component: V1 },
  { id: "text-fly-food", label: "Text + Fly + Food", component: V2 },
  { id: "brain-arrow-food", label: "Brain -> Food", component: V3 },
  { id: "feeding-glow", label: "Feeding Glow", component: V4 },
  { id: "big-eat-text", label: "Big EAT Text", component: V5 },
  { id: "behavior-bar-chart", label: "Behavior Bar Chart", component: V6 },
  { id: "trace-and-fly", label: "Trace + Feeding Fly", component: V7 },
  { id: "close-up-head", label: "Close-up Head", component: V8 },
  { id: "brain-body-behavior", label: "Brain -> Body -> Eat", component: V9 },
];
