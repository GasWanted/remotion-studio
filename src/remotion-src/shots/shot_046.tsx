import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantDef, VariantProps } from "../types";
import { seeded, drawBg, makeParticles, drawParticles, PALETTE, fadeInOut } from "../scenes/theme";
import { drawFlySide, drawNeuron } from "../icons";

// Shot 46 — "The same cells that fire when a fly's tongue touches something sweet."
// 120 frames (4s). Fly tongue touches sugar, brief real-world reference.

const V1: React.FC<VariantProps> = ({ width, height }) => {
  // Fly silhouette (side view) approaching sugar crystal, proboscis extends to touch
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(14, width, height, s), [width, height, s]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, parts, frame, s);
    const a = fadeInOut(frame, 120);
    ctx.globalAlpha = a;

    // Sugar crystal on the right
    const sugarX = width * 0.72, sugarY = height * 0.58;
    const sugarSize = 18 * s;
    ctx.fillStyle = PALETTE.accent.gold;
    ctx.beginPath();
    ctx.moveTo(sugarX, sugarY - sugarSize);
    ctx.lineTo(sugarX + sugarSize * 0.8, sugarY - sugarSize * 0.3);
    ctx.lineTo(sugarX + sugarSize * 0.6, sugarY + sugarSize * 0.6);
    ctx.lineTo(sugarX - sugarSize * 0.6, sugarY + sugarSize * 0.6);
    ctx.lineTo(sugarX - sugarSize * 0.8, sugarY - sugarSize * 0.3);
    ctx.closePath();
    ctx.fill();
    // Glow
    const glow = 0.3 + Math.sin(frame * 0.08) * 0.15;
    ctx.shadowColor = PALETTE.accent.gold;
    ctx.shadowBlur = 15 * s * glow;
    ctx.fill();
    ctx.shadowBlur = 0;

    // Fly approaches from left
    const flyApproach = interpolate(frame, [5, 50], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const flyX = width * 0.2 + flyApproach * width * 0.28;
    const flyY = height * 0.52;
    drawFlySide(ctx, flyX, flyY, 60 * s, `hsla(220, 30%, 60%, 0.8)`);

    // Proboscis extension
    const probExtend = interpolate(frame, [50, 75], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (probExtend > 0) {
      ctx.strokeStyle = `hsla(30, 60%, 55%, ${probExtend * 0.8})`;
      ctx.lineWidth = 1.5 * s;
      const tipX = flyX + 60 * s * 0.3 + probExtend * 20 * s;
      const tipY = flyY + probExtend * 18 * s;
      ctx.beginPath();
      ctx.moveTo(flyX + 60 * s * 0.3, flyY);
      ctx.quadraticCurveTo(flyX + 60 * s * 0.35, flyY + probExtend * 10 * s, tipX, tipY);
      ctx.stroke();

      // Sparks on contact
      if (probExtend > 0.9) {
        const sparkAlpha = Math.sin((frame - 75) * 0.15) * 0.5 + 0.5;
        ctx.fillStyle = `hsla(45, 90%, 70%, ${sparkAlpha * 0.8})`;
        for (let i = 0; i < 5; i++) {
          const ang = (i / 5) * Math.PI * 2 + frame * 0.1;
          const dist = 5 * s + Math.sin(frame * 0.2 + i) * 3 * s;
          ctx.beginPath();
          ctx.arc(tipX + Math.cos(ang) * dist, tipY + Math.sin(ang) * dist, 1.5 * s, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V2: React.FC<VariantProps> = ({ width, height }) => {
  // Close-up sugar molecule, fly tongue reaching toward it
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

    const cx = width / 2, cy = height * 0.45;
    // Sugar molecule — hexagonal ring
    const molSize = 35 * s;
    const pulse = 1 + Math.sin(frame * 0.06) * 0.05;
    ctx.strokeStyle = PALETTE.accent.gold;
    ctx.lineWidth = 2.5 * s;
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const ang = (i / 6) * Math.PI * 2 - Math.PI / 2;
      const px = cx + Math.cos(ang) * molSize * pulse;
      const py = cy + Math.sin(ang) * molSize * pulse;
      i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.stroke();
    // Atom dots at vertices
    for (let i = 0; i < 6; i++) {
      const ang = (i / 6) * Math.PI * 2 - Math.PI / 2;
      ctx.fillStyle = i % 2 === 0 ? PALETTE.accent.gold : PALETTE.accent.red;
      ctx.beginPath();
      ctx.arc(cx + Math.cos(ang) * molSize * pulse, cy + Math.sin(ang) * molSize * pulse, 3 * s, 0, Math.PI * 2);
      ctx.fill();
    }

    // Tongue reaching from below
    const tongueReach = interpolate(frame, [30, 70], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (tongueReach > 0) {
      ctx.strokeStyle = `hsla(15, 55%, 55%, ${tongueReach * 0.8})`;
      ctx.lineWidth = 3 * s;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(cx, height * 0.95);
      ctx.quadraticCurveTo(cx, cy + molSize + 20 * s * (1 - tongueReach), cx, cy + molSize + 5 * s * (1 - tongueReach));
      ctx.stroke();
      // Tip
      ctx.fillStyle = `hsla(15, 55%, 55%, ${tongueReach})`;
      const tipY = cy + molSize + 5 * s * (1 - tongueReach);
      ctx.beginPath();
      ctx.arc(cx, tipY, 3 * s, 0, Math.PI * 2);
      ctx.fill();
    }

    // "sweet" label
    const labelFade = interpolate(frame, [75, 95], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (labelFade > 0) {
      ctx.globalAlpha = a * labelFade;
      ctx.fillStyle = PALETTE.text.accent;
      ctx.font = `italic ${12 * s}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText("sweet", cx, height * 0.82);
    }

    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V3: React.FC<VariantProps> = ({ width, height }) => {
  // Split: realistic fly context (left) -> neural activity (right), connected by arrow
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(12, width, height, s), [width, height, s]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, parts, frame, s);
    const a = fadeInOut(frame, 120);
    ctx.globalAlpha = a;

    // Dividing line
    ctx.strokeStyle = PALETTE.text.dim;
    ctx.lineWidth = 1 * s;
    ctx.setLineDash([4 * s, 4 * s]);
    ctx.beginPath();
    ctx.moveTo(width / 2, height * 0.15);
    ctx.lineTo(width / 2, height * 0.85);
    ctx.stroke();
    ctx.setLineDash([]);

    // Left: fly + sugar
    const leftFade = interpolate(frame, [5, 25], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = a * leftFade;
    drawFlySide(ctx, width * 0.25, height * 0.45, 50 * s, `hsla(220, 30%, 60%, 0.8)`);
    // Sugar dot
    ctx.fillStyle = PALETTE.accent.gold;
    ctx.beginPath();
    ctx.arc(width * 0.35, height * 0.55, 6 * s, 0, Math.PI * 2);
    ctx.fill();

    // Arrow across
    const arrowFade = interpolate(frame, [35, 55], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (arrowFade > 0) {
      ctx.globalAlpha = a * arrowFade;
      ctx.strokeStyle = PALETTE.text.accent;
      ctx.lineWidth = 2 * s;
      const arrowLen = 30 * s * arrowFade;
      ctx.beginPath();
      ctx.moveTo(width / 2 - arrowLen / 2, height * 0.45);
      ctx.lineTo(width / 2 + arrowLen / 2, height * 0.45);
      ctx.stroke();
      // Arrowhead
      ctx.fillStyle = PALETTE.text.accent;
      ctx.beginPath();
      ctx.moveTo(width / 2 + arrowLen / 2 + 4 * s, height * 0.45);
      ctx.lineTo(width / 2 + arrowLen / 2 - 3 * s, height * 0.45 - 4 * s);
      ctx.lineTo(width / 2 + arrowLen / 2 - 3 * s, height * 0.45 + 4 * s);
      ctx.closePath();
      ctx.fill();
    }

    // Right: neural activity
    const rightFade = interpolate(frame, [50, 70], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (rightFade > 0) {
      ctx.globalAlpha = a * rightFade;
      drawNeuron(ctx, width * 0.72, height * 0.42, 25 * s, `hsla(45, 80%, 65%, ${rightFade})`, frame);
      // Spike lines
      const spikeProg = interpolate(frame, [65, 110], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      if (spikeProg > 0) {
        ctx.strokeStyle = `hsla(45, 80%, 65%, 0.6)`;
        ctx.lineWidth = 1 * s;
        const traceW = 60 * s;
        ctx.beginPath();
        for (let i = 0; i < traceW * spikeProg; i += 1) {
          const spike = (Math.floor(i / 8) % 3 === 0) ? -12 * s : 0;
          const py = height * 0.62 + spike;
          i === 0 ? ctx.moveTo(width * 0.65 + i, py) : ctx.lineTo(width * 0.65 + i, py);
        }
        ctx.stroke();
      }
    }

    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V4: React.FC<VariantProps> = ({ width, height }) => {
  // Sugar crystal glowing, fly nearby with dotted line from tongue to crystal
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(14, width, height, s), [width, height, s]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, parts, frame, s);
    const a = fadeInOut(frame, 120);
    ctx.globalAlpha = a;

    // Sugar crystal center, glowing
    const cx = width / 2, cy = height * 0.42;
    const sugarR = 22 * s;
    const glowPulse = 0.6 + Math.sin(frame * 0.07) * 0.3;
    ctx.shadowColor = PALETTE.accent.gold;
    ctx.shadowBlur = 20 * s * glowPulse;
    ctx.fillStyle = `hsla(45, 80%, 65%, ${0.7 + glowPulse * 0.2})`;
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const ang = (i / 6) * Math.PI * 2 - Math.PI / 2;
      const px = cx + Math.cos(ang) * sugarR;
      const py = cy + Math.sin(ang) * sugarR;
      i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;

    // Fly to the left
    drawFlySide(ctx, width * 0.2, height * 0.5, 45 * s, `hsla(220, 30%, 60%, 0.75)`);

    // Dotted line from fly toward crystal
    const dotProg = interpolate(frame, [20, 60], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (dotProg > 0) {
      ctx.setLineDash([3 * s, 4 * s]);
      ctx.strokeStyle = `hsla(45, 70%, 60%, ${dotProg * 0.6})`;
      ctx.lineWidth = 1.5 * s;
      ctx.beginPath();
      ctx.moveTo(width * 0.2 + 45 * s * 0.3, height * 0.5);
      const endX = width * 0.2 + 45 * s * 0.3 + (cx - sugarR - width * 0.2 - 45 * s * 0.3) * dotProg;
      ctx.lineTo(endX, cy + (height * 0.5 - cy) * (1 - dotProg));
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Label
    const labelFade = interpolate(frame, [70, 90], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (labelFade > 0) {
      ctx.globalAlpha = a * labelFade;
      ctx.fillStyle = PALETTE.text.accent;
      ctx.font = `${11 * s}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText("sugar", cx, cy + sugarR + 14 * s);
    }

    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V5: React.FC<VariantProps> = ({ width, height }) => {
  // Sequence: sugar + tongue -> neural signal (electricity bolt)
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

    const cy = height * 0.45;
    // Sugar icon (left)
    const sugarFade = interpolate(frame, [5, 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (sugarFade > 0) {
      ctx.globalAlpha = a * sugarFade;
      ctx.fillStyle = PALETTE.accent.gold;
      ctx.beginPath();
      ctx.arc(width * 0.2, cy, 12 * s, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = PALETTE.text.primary;
      ctx.font = `${8 * s}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText("sugar", width * 0.2, cy + 22 * s);
    }

    // Plus sign
    const plusFade = interpolate(frame, [18, 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (plusFade > 0) {
      ctx.globalAlpha = a * plusFade;
      ctx.fillStyle = PALETTE.text.dim;
      ctx.font = `${16 * s}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText("+", width * 0.33, cy + 5 * s);
    }

    // Tongue icon (middle-left)
    const tongueFade = interpolate(frame, [25, 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (tongueFade > 0) {
      ctx.globalAlpha = a * tongueFade;
      ctx.strokeStyle = `hsla(15, 55%, 55%, 0.8)`;
      ctx.lineWidth = 3 * s;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(width * 0.45, cy - 15 * s);
      ctx.quadraticCurveTo(width * 0.45 + 5 * s, cy, width * 0.45, cy + 15 * s);
      ctx.stroke();
      ctx.fillStyle = PALETTE.text.primary;
      ctx.font = `${8 * s}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText("tongue", width * 0.45, cy + 28 * s);
    }

    // Arrow
    const arrowFade = interpolate(frame, [42, 55], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (arrowFade > 0) {
      ctx.globalAlpha = a * arrowFade;
      ctx.strokeStyle = PALETTE.text.dim;
      ctx.lineWidth = 2 * s;
      ctx.beginPath();
      ctx.moveTo(width * 0.55, cy);
      ctx.lineTo(width * 0.63, cy);
      ctx.stroke();
      ctx.fillStyle = PALETTE.text.dim;
      ctx.beginPath();
      ctx.moveTo(width * 0.65, cy);
      ctx.lineTo(width * 0.62, cy - 4 * s);
      ctx.lineTo(width * 0.62, cy + 4 * s);
      ctx.closePath();
      ctx.fill();
    }

    // Lightning bolt
    const boltFade = interpolate(frame, [55, 75], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (boltFade > 0) {
      ctx.globalAlpha = a * boltFade;
      const bx = width * 0.78, by = cy;
      ctx.fillStyle = PALETTE.accent.gold;
      ctx.beginPath();
      ctx.moveTo(bx, by - 18 * s);
      ctx.lineTo(bx - 6 * s, by);
      ctx.lineTo(bx + 2 * s, by);
      ctx.lineTo(bx - 3 * s, by + 18 * s);
      ctx.lineTo(bx + 8 * s, by - 4 * s);
      ctx.lineTo(bx, by - 4 * s);
      ctx.closePath();
      ctx.fill();
      ctx.shadowColor = PALETTE.accent.gold;
      ctx.shadowBlur = 10 * s;
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = PALETTE.text.primary;
      ctx.font = `${8 * s}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText("signal", bx, cy + 28 * s);
    }

    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V6: React.FC<VariantProps> = ({ width, height }) => {
  // Fly walking toward sugar sphere, touching it, sparks fly
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(12, width, height, s), [width, height, s]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, parts, frame, s);
    const a = fadeInOut(frame, 120);
    ctx.globalAlpha = a;

    // Sugar sphere
    const sugarX = width * 0.65, sugarY = height * 0.5;
    const sugarR = 16 * s;
    const sugarGrad = ctx.createRadialGradient(sugarX - 3 * s, sugarY - 3 * s, 0, sugarX, sugarY, sugarR);
    sugarGrad.addColorStop(0, `hsla(45, 90%, 75%, 0.9)`);
    sugarGrad.addColorStop(1, `hsla(45, 70%, 50%, 0.7)`);
    ctx.fillStyle = sugarGrad;
    ctx.beginPath();
    ctx.arc(sugarX, sugarY, sugarR, 0, Math.PI * 2);
    ctx.fill();

    // Fly walking toward sugar
    const walkProg = interpolate(frame, [0, 60], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const flyX = width * 0.15 + walkProg * width * 0.35;
    const flyBob = Math.sin(frame * 0.3) * 2 * s;
    drawFlySide(ctx, flyX, sugarY + flyBob, 45 * s, `hsla(220, 30%, 60%, 0.8)`);

    // Sparks on contact
    if (walkProg > 0.9) {
      const contactFrame = frame - 54;
      const sparkCount = 8;
      for (let i = 0; i < sparkCount; i++) {
        const ang = (i / sparkCount) * Math.PI * 2 + contactFrame * 0.05;
        const dist = (8 + contactFrame * 0.6) * s;
        const sparkAlpha = Math.max(0, 1 - contactFrame / 50);
        ctx.fillStyle = `hsla(45, 90%, 70%, ${sparkAlpha * 0.8})`;
        ctx.beginPath();
        ctx.arc(sugarX + Math.cos(ang) * dist, sugarY + Math.sin(ang) * dist, 1.5 * s, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V7: React.FC<VariantProps> = ({ width, height }) => {
  // Tongue/proboscis reaching down to surface with sugar, "sweet" label
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

    // Surface line
    const surfaceY = height * 0.68;
    ctx.strokeStyle = `hsla(45, 50%, 40%, 0.4)`;
    ctx.lineWidth = 1.5 * s;
    ctx.beginPath();
    ctx.moveTo(width * 0.15, surfaceY);
    ctx.lineTo(width * 0.85, surfaceY);
    ctx.stroke();

    // Sugar spots on surface
    const rand = seeded(46007);
    for (let i = 0; i < 6; i++) {
      ctx.fillStyle = `hsla(45, 70%, 60%, 0.4)`;
      ctx.beginPath();
      ctx.arc(width * 0.3 + rand() * width * 0.4, surfaceY - 2 * s, (2 + rand() * 3) * s, 0, Math.PI * 2);
      ctx.fill();
    }

    // Proboscis from above
    const extend = interpolate(frame, [15, 60], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const probStartY = height * 0.18;
    const probEndY = probStartY + (surfaceY - probStartY - 3 * s) * extend;
    ctx.strokeStyle = `hsla(15, 50%, 50%, 0.8)`;
    ctx.lineWidth = 2.5 * s;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(width / 2, probStartY);
    ctx.quadraticCurveTo(width / 2 + 5 * s, (probStartY + probEndY) / 2, width / 2, probEndY);
    ctx.stroke();
    // Tip
    ctx.fillStyle = `hsla(15, 55%, 55%, 0.9)`;
    ctx.beginPath();
    ctx.ellipse(width / 2, probEndY, 4 * s, 2.5 * s, 0, 0, Math.PI * 2);
    ctx.fill();

    // "sweet" label fades in after contact
    const labelFade = interpolate(frame, [65, 85], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (labelFade > 0) {
      ctx.globalAlpha = a * labelFade;
      ctx.fillStyle = PALETTE.text.accent;
      ctx.font = `italic ${14 * s}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText("sweet", width / 2, height * 0.88);
    }

    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V8: React.FC<VariantProps> = ({ width, height }) => {
  // Simple icons: fly + sugar = neural spark
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
    // Fly icon
    const flyFade = interpolate(frame, [5, 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = a * flyFade;
    drawFlySide(ctx, width * 0.18, cy, 35 * s, `hsla(220, 30%, 60%, 0.8)`);

    // Plus
    const plusFade = interpolate(frame, [18, 28], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = a * plusFade;
    ctx.fillStyle = PALETTE.text.dim;
    ctx.font = `bold ${18 * s}px system-ui`;
    ctx.textAlign = "center";
    ctx.fillText("+", width * 0.33, cy + 6 * s);

    // Sugar crystal
    const sugarFade = interpolate(frame, [25, 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = a * sugarFade;
    ctx.fillStyle = PALETTE.accent.gold;
    ctx.beginPath();
    ctx.arc(width * 0.47, cy, 10 * s, 0, Math.PI * 2);
    ctx.fill();

    // Equals
    const eqFade = interpolate(frame, [42, 52], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = a * eqFade;
    ctx.fillStyle = PALETTE.text.dim;
    ctx.font = `bold ${18 * s}px system-ui`;
    ctx.fillText("=", width * 0.6, cy + 6 * s);

    // Neural spark
    const sparkFade = interpolate(frame, [55, 75], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (sparkFade > 0) {
      ctx.globalAlpha = a * sparkFade;
      drawNeuron(ctx, width * 0.78, cy, 22 * s, `hsla(45, 80%, 65%, ${sparkFade})`, frame);
      // Glow
      ctx.shadowColor = PALETTE.accent.gold;
      ctx.shadowBlur = 12 * s * (0.5 + Math.sin(frame * 0.1) * 0.3);
      ctx.fillStyle = `hsla(45, 80%, 65%, 0.3)`;
      ctx.beginPath();
      ctx.arc(width * 0.78, cy, 8 * s, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V9: React.FC<VariantProps> = ({ width, height }) => {
  // Overhead view: fly approaches sweet drop, ripple of activity when they touch
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

    const cx = width / 2, cy = height * 0.45;
    // Sweet drop (amber circle)
    const dropR = 14 * s;
    const dropGrad = ctx.createRadialGradient(cx - 2 * s, cy - 2 * s, 0, cx, cy, dropR);
    dropGrad.addColorStop(0, `hsla(40, 80%, 70%, 0.9)`);
    dropGrad.addColorStop(1, `hsla(40, 60%, 45%, 0.5)`);
    ctx.fillStyle = dropGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, dropR, 0, Math.PI * 2);
    ctx.fill();

    // Fly approaching from below (top view)
    const approach = interpolate(frame, [5, 55], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const flyY = cy + 80 * s * (1 - approach);
    ctx.save();
    ctx.translate(cx, flyY);
    ctx.rotate(Math.PI); // fly facing up
    drawFlySide(ctx, 0, 0, 30 * s, `hsla(220, 30%, 60%, 0.8)`);
    ctx.restore();

    // Ripple on contact
    if (approach > 0.9) {
      const rippleFrame = frame - 50;
      for (let r = 0; r < 3; r++) {
        const rippleR = (15 + rippleFrame * 1.5 + r * 12) * s;
        const rippleAlpha = Math.max(0, 0.5 - rippleR / (80 * s));
        ctx.strokeStyle = `hsla(45, 70%, 60%, ${rippleAlpha})`;
        ctx.lineWidth = 1.5 * s;
        ctx.beginPath();
        ctx.arc(cx, cy, rippleR, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

export const VARIANTS_SHOT_046: VariantDef[] = [
  { id: "fly-approach-sugar", label: "Fly Approach Sugar", component: V1 },
  { id: "sugar-molecule", label: "Sugar Molecule Close-up", component: V2 },
  { id: "split-real-neural", label: "Split Real vs Neural", component: V3 },
  { id: "sugar-glow-dotted", label: "Sugar Glow Dotted Line", component: V4 },
  { id: "sugar-tongue-signal", label: "Sugar + Tongue = Signal", component: V5 },
  { id: "walk-touch-sparks", label: "Walk Touch Sparks", component: V6 },
  { id: "proboscis-surface", label: "Proboscis to Surface", component: V7 },
  { id: "equation-icons", label: "Fly + Sugar = Spark", component: V8 },
  { id: "overhead-ripple", label: "Overhead Ripple", component: V9 },
];
