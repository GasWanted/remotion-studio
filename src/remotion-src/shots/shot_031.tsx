import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantDef, VariantProps } from "../types";
import { seeded, drawBg, makeParticles, drawParticles, PALETTE, fadeInOut } from "../scenes/theme";
import { drawFlySide, drawNeuron } from "../icons";

// Shot 31 — "Every single one mapped. They called it FlyWire."
// 90 frames (3s). "FlyWire" text reveal with glow.

const V1: React.FC<VariantProps> = ({ width, height }) => {
  // Pulse Fade-In: "FlyWire" fades in, radial glow pulse, subtle breathing scale
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(20, width, height, scale), [width, height, scale]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, parts, frame, scale);
    const fadeAlpha = fadeInOut(frame, 90);
    ctx.globalAlpha = fadeAlpha;

    const textFade = interpolate(frame, [8, 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const pulseProgress = interpolate(frame, [25, 55], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const breathe = 1 + Math.sin(frame * 0.06) * 0.015;

    const centerX = width / 2;
    const centerY = height * 0.45;

    // Radial glow pulse behind text
    if (pulseProgress > 0) {
      const pulseRadius = 30 * scale + pulseProgress * 80 * scale;
      const pulseAlpha = (1 - pulseProgress) * 0.2;
      const grad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, pulseRadius);
      grad.addColorStop(0, `hsla(185, 60%, 65%, ${pulseAlpha})`);
      grad.addColorStop(0.5, `hsla(220, 50%, 55%, ${pulseAlpha * 0.4})`);
      grad.addColorStop(1, "hsla(220, 50%, 55%, 0)");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, pulseRadius, 0, Math.PI * 2);
      ctx.fill();
    }

    // Warm background glow (persistent)
    if (textFade > 0.5) {
      const warmGrad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 60 * scale);
      warmGrad.addColorStop(0, `hsla(45, 60%, 55%, ${(textFade - 0.5) * 0.08})`);
      warmGrad.addColorStop(1, "hsla(45, 60%, 55%, 0)");
      ctx.fillStyle = warmGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 60 * scale, 0, Math.PI * 2);
      ctx.fill();
    }

    // "FlyWire" text
    if (textFade > 0) {
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.scale(breathe, breathe);
      ctx.globalAlpha = fadeAlpha * textFade;
      ctx.fillStyle = PALETTE.text.accent;
      ctx.font = `bold ${32 * scale}px system-ui`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("FlyWire", 0, 0);
      ctx.restore();
    }

    // Subtitle
    const subFade = interpolate(frame, [40, 55], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (subFade > 0) {
      ctx.globalAlpha = fadeAlpha * subFade;
      ctx.fillStyle = PALETTE.text.dim;
      ctx.font = `${10 * scale}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText("every single one mapped", centerX, centerY + 28 * scale);
      ctx.globalAlpha = fadeAlpha;
    }

    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V2: React.FC<VariantProps> = ({ width, height }) => {
  // Neon Letter-by-Letter: each letter lights up L-R with neon flicker, holds steady glow
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(18, width, height, scale), [width, height, scale]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, parts, frame, scale);
    const fadeAlpha = fadeInOut(frame, 90);
    ctx.globalAlpha = fadeAlpha;

    const letters = "FlyWire".split("");
    const letterWidth = 28 * scale;
    const startX = width / 2 - (letters.length * letterWidth) / 2 + letterWidth / 2;
    const centerY = height * 0.45;

    for (let i = 0; i < letters.length; i++) {
      const letterDelay = 8 + i * 7;
      const letterProgress = interpolate(frame, [letterDelay, letterDelay + 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      if (letterProgress <= 0) continue;

      const letterX = startX + i * letterWidth;
      const flickerPhase = frame - letterDelay;

      // Neon flicker during first few frames of appearing
      let flickerAlpha = letterProgress;
      if (flickerPhase < 8 && flickerPhase > 0) {
        const flickerPattern = Math.sin(flickerPhase * 2.5) * 0.3 + 0.7;
        flickerAlpha = letterProgress * flickerPattern;
      }

      // Neon glow
      ctx.shadowColor = `hsla(185, 90%, 70%, ${flickerAlpha * 0.7})`;
      ctx.shadowBlur = 12 * scale * flickerAlpha;
      ctx.fillStyle = `hsla(185, 85%, 75%, ${flickerAlpha * 0.9})`;
      ctx.font = `bold ${30 * scale}px system-ui`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(letters[i], letterX, centerY);

      // Second pass for brighter core
      ctx.shadowBlur = 4 * scale;
      ctx.fillStyle = `hsla(0, 0%, 100%, ${flickerAlpha * 0.5})`;
      ctx.fillText(letters[i], letterX, centerY);
      ctx.shadowBlur = 0;
    }

    // Underline glow that appears after all letters
    const underlineFade = interpolate(frame, [55, 68], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (underlineFade > 0) {
      const lineWidth = letters.length * letterWidth * underlineFade;
      ctx.strokeStyle = `hsla(185, 80%, 65%, ${underlineFade * 0.4})`;
      ctx.lineWidth = 1.5 * scale;
      ctx.shadowColor = `hsla(185, 80%, 65%, ${underlineFade * 0.3})`;
      ctx.shadowBlur = 6 * scale;
      ctx.beginPath();
      ctx.moveTo(width / 2 - lineWidth / 2, centerY + 22 * scale);
      ctx.lineTo(width / 2 + lineWidth / 2, centerY + 22 * scale);
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V3: React.FC<VariantProps> = ({ width, height }) => {
  // Logo Stamp: "FlyWire" drops from above, impact ring, brief flash, settles
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(18, width, height, scale), [width, height, scale]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, parts, frame, scale);
    const fadeAlpha = fadeInOut(frame, 90);
    ctx.globalAlpha = fadeAlpha;

    const centerY = height * 0.43;
    const dropProgress = interpolate(frame, [10, 28], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const yOffset = (1 - dropProgress) * -80 * scale;
    const dropScale = dropProgress < 1 ? 0.7 + dropProgress * 0.3 : 1 + Math.max(0, 1 - (frame - 28) * 0.1) * 0.06;
    const flashAlpha = interpolate(frame, [28, 32], [0.5, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const ringProgress = interpolate(frame, [28, 50], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const subFade = interpolate(frame, [45, 60], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

    // Flash on impact
    if (flashAlpha > 0) {
      ctx.fillStyle = `hsla(45, 80%, 85%, ${flashAlpha})`;
      ctx.fillRect(0, 0, width, height);
    }

    // Impact ring
    if (ringProgress > 0 && ringProgress < 1) {
      const ringRadius = ringProgress * 90 * scale;
      ctx.strokeStyle = `hsla(45, 70%, 65%, ${(1 - ringProgress) * 0.3})`;
      ctx.lineWidth = 2 * scale * (1 - ringProgress);
      ctx.beginPath();
      ctx.ellipse(width / 2, centerY, ringRadius, ringRadius * 0.3, 0, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Text
    if (dropProgress > 0) {
      ctx.save();
      ctx.translate(width / 2, centerY + yOffset);
      ctx.scale(dropScale, dropScale);
      ctx.fillStyle = PALETTE.text.accent;
      ctx.font = `bold ${34 * scale}px system-ui`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("FlyWire", 0, 0);
      ctx.restore();
    }

    // Decorative lines on each side
    if (subFade > 0) {
      ctx.globalAlpha = fadeAlpha * subFade;
      const lineLen = 40 * scale * subFade;
      ctx.strokeStyle = `hsla(45, 60%, 55%, 0.3)`;
      ctx.lineWidth = 1 * scale;
      ctx.beginPath();
      ctx.moveTo(width / 2 - 70 * scale, centerY);
      ctx.lineTo(width / 2 - 70 * scale - lineLen, centerY);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(width / 2 + 70 * scale, centerY);
      ctx.lineTo(width / 2 + 70 * scale + lineLen, centerY);
      ctx.stroke();

      ctx.fillStyle = PALETTE.text.dim;
      ctx.font = `${9 * scale}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText("the complete connectome", width / 2, centerY + 28 * scale);
      ctx.globalAlpha = fadeAlpha;
    }

    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V4: React.FC<VariantProps> = ({ width, height }) => {
  // Network-to-Text: network nodes and edges rearrange into the letterforms of "FlyWire"
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(18, width, height, scale), [width, height, scale]);
  const data = useMemo(() => {
    const rand = seeded(31004);
    // Generate scattered network positions and target positions along letter paths
    const nodes: { sx: number; sy: number; tx: number; ty: number; hue: number }[] = [];
    // Sample points along "FlyWire" text path — approximate letter positions
    const letters = [
      // F
      { cx: -85, pts: [[-4, -10], [-4, -5], [-4, 0], [-4, 5], [-4, 10], [0, -10], [4, -10], [0, 0], [3, 0]] },
      // l
      { cx: -62, pts: [[-2, -10], [-2, -5], [-2, 0], [-2, 5], [-2, 10]] },
      // y
      { cx: -48, pts: [[-4, -10], [-2, -5], [0, 0], [4, -10], [2, -5], [0, 5], [-1, 10]] },
      // W
      { cx: -22, pts: [[-6, -10], [-5, 0], [-3, 10], [0, 0], [3, 10], [5, 0], [6, -10]] },
      // i
      { cx: 0, pts: [[0, -10], [0, -3], [0, 0], [0, 5], [0, 10]] },
      // r
      { cx: 14, pts: [[-2, -3], [-2, 0], [-2, 5], [-2, 10], [0, -3], [3, -3], [4, 0]] },
      // e
      { cx: 32, pts: [[-3, 0], [3, 0], [3, -3], [0, -5], [-3, -3], [-3, 3], [0, 5], [3, 3]] },
    ];
    const centerX = width / 2;
    const centerY = height * 0.45;
    const textScale = 2.5 * scale;
    for (const letter of letters) {
      for (const pt of letter.pts) {
        nodes.push({
          sx: centerX + (rand() - 0.5) * width * 0.7,
          sy: centerY + (rand() - 0.5) * height * 0.5,
          tx: centerX + (letter.cx + pt[0]) * textScale,
          ty: centerY + pt[1] * textScale,
          hue: PALETTE.cellColors[Math.floor(rand() * 8)][0],
        });
      }
    }
    // Extra scattered nodes
    for (let i = 0; i < 30; i++) {
      const target = nodes[Math.floor(rand() * nodes.length)];
      nodes.push({
        sx: centerX + (rand() - 0.5) * width * 0.7,
        sy: centerY + (rand() - 0.5) * height * 0.5,
        tx: target.tx + (rand() - 0.5) * 10 * scale,
        ty: target.ty + (rand() - 0.5) * 10 * scale,
        hue: PALETTE.cellColors[Math.floor(rand() * 8)][0],
      });
    }
    const edges: [number, number][] = [];
    for (let i = 0; i < nodes.length; i++) {
      const j = (i + 1) % nodes.length;
      if (rand() < 0.6) edges.push([i, j]);
      if (rand() < 0.15) edges.push([i, Math.floor(rand() * nodes.length)]);
    }
    return { nodes, edges };
  }, [width, height, scale]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, parts, frame, scale);
    const fadeAlpha = fadeInOut(frame, 90);
    ctx.globalAlpha = fadeAlpha;

    const morphProgress = interpolate(frame, [8, 60], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const eased = 1 - Math.pow(1 - morphProgress, 3);
    const labelFade = interpolate(frame, [62, 75], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

    // Edges
    for (const [a, b] of data.edges) {
      const na = data.nodes[a], nb = data.nodes[b];
      const ax = na.sx + (na.tx - na.sx) * eased;
      const ay = na.sy + (na.ty - na.sy) * eased;
      const bx = nb.sx + (nb.tx - nb.sx) * eased;
      const by = nb.sy + (nb.ty - nb.sy) * eased;
      ctx.strokeStyle = `hsla(220, 35%, 50%, ${0.08 + eased * 0.08})`;
      ctx.lineWidth = 0.6 * scale;
      ctx.beginPath();
      ctx.moveTo(ax, ay);
      ctx.lineTo(bx, by);
      ctx.stroke();
    }

    // Nodes
    for (const node of data.nodes) {
      const nx = node.sx + (node.tx - node.sx) * eased;
      const ny = node.sy + (node.ty - node.sy) * eased;
      ctx.fillStyle = `hsla(${node.hue}, 55%, 65%, ${0.4 + eased * 0.4})`;
      ctx.beginPath();
      ctx.arc(nx, ny, (2 + eased) * scale, 0, Math.PI * 2);
      ctx.fill();
    }

    // Label when fully morphed
    if (labelFade > 0) {
      ctx.globalAlpha = fadeAlpha * labelFade;
      ctx.fillStyle = PALETTE.text.dim;
      ctx.font = `${10 * scale}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText("the connections are the name", width / 2, height * 0.82);
      ctx.globalAlpha = fadeAlpha;
    }

    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V5: React.FC<VariantProps> = ({ width, height }) => {
  // Typewriter with Glow: "FlyWire" types out with cursor, warm glow spreads after
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(18, width, height, scale), [width, height, scale]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, parts, frame, scale);
    const fadeAlpha = fadeInOut(frame, 90);
    ctx.globalAlpha = fadeAlpha;

    const text = "FlyWire";
    const centerY = height * 0.43;
    const charsVisible = Math.floor(interpolate(frame, [10, 38], [0, text.length], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
    const typeComplete = charsVisible >= text.length;
    const glowSpread = interpolate(frame, [40, 70], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

    // Warm glow spreading from text
    if (glowSpread > 0) {
      const glowRadius = 40 * scale + glowSpread * 100 * scale;
      const grad = ctx.createRadialGradient(width / 2, centerY, 0, width / 2, centerY, glowRadius);
      grad.addColorStop(0, `hsla(45, 60%, 55%, ${glowSpread * 0.08})`);
      grad.addColorStop(0.6, `hsla(30, 50%, 45%, ${glowSpread * 0.04})`);
      grad.addColorStop(1, "hsla(30, 50%, 45%, 0)");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(width / 2, centerY, glowRadius, 0, Math.PI * 2);
      ctx.fill();
    }

    // Text
    if (charsVisible > 0) {
      const visibleText = text.substring(0, charsVisible);
      ctx.fillStyle = PALETTE.text.accent;
      ctx.font = `bold ${32 * scale}px system-ui`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(visibleText, width / 2, centerY);

      // Cursor
      if (!typeComplete) {
        const cursorBlink = Math.floor(frame * 0.1) % 2 === 0;
        if (cursorBlink) {
          const textWidth = ctx.measureText(visibleText).width;
          ctx.fillStyle = PALETTE.text.accent;
          ctx.fillRect(width / 2 + textWidth / 2 + 3, centerY - 16 * scale, 2.5 * scale, 32 * scale);
        }
      }
    }

    // Subtitle
    const subFade = interpolate(frame, [50, 65], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (subFade > 0) {
      ctx.globalAlpha = fadeAlpha * subFade;
      ctx.fillStyle = PALETTE.text.dim;
      ctx.font = `${10 * scale}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText("the complete connectome", width / 2, centerY + 30 * scale);
      ctx.globalAlpha = fadeAlpha;
    }

    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V6: React.FC<VariantProps> = ({ width, height }) => {
  // Elegant Serif: "FlyWire" in elegant letters, thin decorative lines extending from sides
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(18, width, height, scale), [width, height, scale]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, parts, frame, scale);
    const fadeAlpha = fadeInOut(frame, 90);
    ctx.globalAlpha = fadeAlpha;

    const centerY = height * 0.4;
    const textFade = interpolate(frame, [8, 28], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const lineFade = interpolate(frame, [25, 45], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const subFade = interpolate(frame, [42, 58], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const taglineFade = interpolate(frame, [55, 70], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

    // Main text
    if (textFade > 0) {
      ctx.globalAlpha = fadeAlpha * textFade;
      ctx.fillStyle = PALETTE.text.accent;
      ctx.font = `bold ${34 * scale}px Georgia, serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("FlyWire", width / 2, centerY);
      ctx.globalAlpha = fadeAlpha;
    }

    // Decorative lines
    if (lineFade > 0) {
      const lineLen = 55 * scale * lineFade;
      const textHalfW = 65 * scale;
      ctx.strokeStyle = `hsla(45, 50%, 55%, ${lineFade * 0.4})`;
      ctx.lineWidth = 1 * scale;
      // Left line
      ctx.beginPath();
      ctx.moveTo(width / 2 - textHalfW - 8 * scale, centerY);
      ctx.lineTo(width / 2 - textHalfW - 8 * scale - lineLen, centerY);
      ctx.stroke();
      // Right line
      ctx.beginPath();
      ctx.moveTo(width / 2 + textHalfW + 8 * scale, centerY);
      ctx.lineTo(width / 2 + textHalfW + 8 * scale + lineLen, centerY);
      ctx.stroke();
      // Small diamond endpoints
      for (const side of [-1, 1]) {
        const dx = width / 2 + side * (textHalfW + 8 * scale + lineLen);
        ctx.fillStyle = `hsla(45, 50%, 55%, ${lineFade * 0.5})`;
        ctx.beginPath();
        ctx.moveTo(dx, centerY - 3 * scale);
        ctx.lineTo(dx + 3 * scale * side, centerY);
        ctx.lineTo(dx, centerY + 3 * scale);
        ctx.lineTo(dx - 3 * scale * side, centerY);
        ctx.closePath();
        ctx.fill();
      }
    }

    // Thin separator line
    if (subFade > 0) {
      const sepLen = 50 * scale * subFade;
      ctx.strokeStyle = `hsla(220, 30%, 45%, ${subFade * 0.3})`;
      ctx.lineWidth = 0.8 * scale;
      ctx.beginPath();
      ctx.moveTo(width / 2 - sepLen, centerY + 22 * scale);
      ctx.lineTo(width / 2 + sepLen, centerY + 22 * scale);
      ctx.stroke();
    }

    // Subtitle below separator
    if (taglineFade > 0) {
      ctx.globalAlpha = fadeAlpha * taglineFade;
      ctx.fillStyle = PALETTE.text.dim;
      ctx.font = `italic ${11 * scale}px Georgia, serif`;
      ctx.textAlign = "center";
      ctx.fillText("The complete connectome.", width / 2, centerY + 40 * scale);
      ctx.globalAlpha = fadeAlpha;
    }

    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V7: React.FC<VariantProps> = ({ width, height }) => {
  // Circuit Traces: "FlyWire" drawn by circuit traces with right-angle lines and node dots
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(15, width, height, scale), [width, height, scale]);
  const data = useMemo(() => {
    const rand = seeded(31007);
    // Generate circuit trace segments that approximate letter shapes
    const segments: { x1: number; y1: number; x2: number; y2: number; delay: number }[] = [];
    const centerX = width / 2;
    const centerY = height * 0.43;
    const s = 3 * scale;
    // Simplified circuit-trace letter paths for "FlyWire"
    const letterTraces = [
      // F - vertical + two horizontals
      [[-40, -12], [-40, 12]], [[-40, -12], [-32, -12]], [[-40, -2], [-34, -2]],
      // l - vertical
      [[-28, -12], [-28, 12]],
      // y - two diagonals + tail
      [[-22, -12], [-18, 0]], [[-14, -12], [-18, 0]], [[-18, 0], [-20, 12]],
      // W - zigzag
      [[-6, -12], [-4, 12]], [[-4, 12], [0, -4]], [[0, -4], [4, 12]], [[4, 12], [6, -12]],
      // i - vertical + dot
      [[12, -8], [12, 12]], [[12, -12], [12, -11]],
      // r - vertical + kick
      [[18, -2], [18, 12]], [[18, -2], [24, -6]],
      // e - loop
      [[30, 0], [38, 0]], [[38, 0], [38, -5]], [[38, -5], [32, -8]], [[32, -8], [30, -4]],
      [[30, -4], [30, 5]], [[30, 5], [38, 5]],
    ];
    let delayAccum = 0;
    for (const trace of letterTraces) {
      segments.push({
        x1: centerX + trace[0][0] * s,
        y1: centerY + trace[0][1] * s,
        x2: centerX + trace[1][0] * s,
        y2: centerY + trace[1][1] * s,
        delay: delayAccum,
      });
      delayAccum += 2.5;
    }
    // Circuit node positions (at segment endpoints)
    const nodes: { x: number; y: number }[] = [];
    for (const seg of segments) {
      nodes.push({ x: seg.x1, y: seg.y1 });
      nodes.push({ x: seg.x2, y: seg.y2 });
    }
    return { segments, nodes };
  }, [width, height, scale]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, parts, frame, scale);
    const fadeAlpha = fadeInOut(frame, 90);
    ctx.globalAlpha = fadeAlpha;

    const labelFade = interpolate(frame, [62, 75], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

    // Draw circuit traces
    ctx.lineCap = "round";
    for (const seg of data.segments) {
      const segProgress = interpolate(frame, [8 + seg.delay, 12 + seg.delay], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      if (segProgress <= 0) continue;

      const ex = seg.x1 + (seg.x2 - seg.x1) * segProgress;
      const ey = seg.y1 + (seg.y2 - seg.y1) * segProgress;

      // Trace line
      ctx.strokeStyle = `hsla(185, 70%, 60%, 0.7)`;
      ctx.lineWidth = 1.5 * scale;
      ctx.beginPath();
      ctx.moveTo(seg.x1, seg.y1);
      ctx.lineTo(ex, ey);
      ctx.stroke();

      // Glow
      ctx.shadowColor = `hsla(185, 80%, 65%, 0.4)`;
      ctx.shadowBlur = 4 * scale;
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Active point at drawing tip
      if (segProgress < 1) {
        ctx.fillStyle = `hsla(45, 80%, 75%, 0.9)`;
        ctx.beginPath();
        ctx.arc(ex, ey, 2 * scale, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Node dots at intersections
    const allComplete = frame > 55;
    if (allComplete) {
      const nodeAlpha = interpolate(frame, [55, 62], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      for (const node of data.nodes) {
        ctx.fillStyle = `hsla(45, 60%, 65%, ${nodeAlpha * 0.6})`;
        ctx.beginPath();
        ctx.arc(node.x, node.y, 1.8 * scale, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Label
    if (labelFade > 0) {
      ctx.globalAlpha = fadeAlpha * labelFade;
      ctx.fillStyle = PALETTE.text.dim;
      ctx.font = `${10 * scale}px monospace`;
      ctx.textAlign = "center";
      ctx.fillText("circuit of circuits", width / 2, height * 0.82);
      ctx.globalAlpha = fadeAlpha;
    }

    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V8: React.FC<VariantProps> = ({ width, height }) => {
  // Fly Silhouette + Text: drawFlySide fades in above, "FlyWire" below, glow connects them
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(18, width, height, scale), [width, height, scale]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, parts, frame, scale);
    const fadeAlpha = fadeInOut(frame, 90);
    ctx.globalAlpha = fadeAlpha;

    const flyFade = interpolate(frame, [5, 25], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const textFade = interpolate(frame, [20, 38], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const glowFade = interpolate(frame, [35, 52], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const subFade = interpolate(frame, [50, 65], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

    const flyY = height * 0.3;
    const textY = height * 0.53;

    // Fly silhouette
    if (flyFade > 0) {
      ctx.globalAlpha = fadeAlpha * flyFade;
      drawFlySide(ctx, width / 2, flyY, 40 * scale, `hsla(280, 40%, 60%, 0.7)`);
      ctx.globalAlpha = fadeAlpha;
    }

    // Connecting glow beam between fly and text
    if (glowFade > 0) {
      const beamGrad = ctx.createLinearGradient(width / 2, flyY + 20 * scale, width / 2, textY - 15 * scale);
      beamGrad.addColorStop(0, `hsla(280, 50%, 55%, ${glowFade * 0.15})`);
      beamGrad.addColorStop(0.5, `hsla(45, 60%, 55%, ${glowFade * 0.1})`);
      beamGrad.addColorStop(1, `hsla(45, 60%, 55%, ${glowFade * 0.15})`);
      ctx.fillStyle = beamGrad;
      ctx.fillRect(width / 2 - 3 * scale, flyY + 20 * scale, 6 * scale, textY - flyY - 35 * scale);
    }

    // "FlyWire" text
    if (textFade > 0) {
      ctx.globalAlpha = fadeAlpha * textFade;
      ctx.fillStyle = PALETTE.text.accent;
      ctx.font = `bold ${30 * scale}px system-ui`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("FlyWire", width / 2, textY);
      ctx.globalAlpha = fadeAlpha;
    }

    // Subtitle
    if (subFade > 0) {
      ctx.globalAlpha = fadeAlpha * subFade;
      ctx.fillStyle = PALETTE.text.dim;
      ctx.font = `${9 * scale}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText("every single one mapped", width / 2, textY + 22 * scale);
      ctx.globalAlpha = fadeAlpha;
    }

    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V9: React.FC<VariantProps> = ({ width, height }) => {
  // Sparkle Burst: "FlyWire" appears instantly, sparkle particles burst outward and fade
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const bgParts = useMemo(() => makeParticles(18, width, height, scale), [width, height, scale]);
  const data = useMemo(() => {
    const rand = seeded(31009);
    const sparkles: { angle: number; speed: number; hue: number; size: number }[] = [];
    for (let i = 0; i < 50; i++) {
      sparkles.push({
        angle: rand() * Math.PI * 2,
        speed: 40 * scale + rand() * 80 * scale,
        hue: PALETTE.cellColors[Math.floor(rand() * 8)][0],
        size: (1 + rand() * 2) * scale,
      });
    }
    return { sparkles };
  }, [width, height, scale]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, bgParts, frame, scale);
    const fadeAlpha = fadeInOut(frame, 90);
    ctx.globalAlpha = fadeAlpha;

    const centerY = height * 0.43;
    const textAppear = interpolate(frame, [8, 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const burstProgress = interpolate(frame, [12, 55], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const subFade = interpolate(frame, [45, 60], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

    // Initial flash
    const flashAlpha = interpolate(frame, [8, 12], [0, 0.3], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) * interpolate(frame, [12, 20], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (flashAlpha > 0) {
      const flashGrad = ctx.createRadialGradient(width / 2, centerY, 0, width / 2, centerY, 60 * scale);
      flashGrad.addColorStop(0, `hsla(45, 80%, 80%, ${flashAlpha})`);
      flashGrad.addColorStop(1, "hsla(45, 80%, 80%, 0)");
      ctx.fillStyle = flashGrad;
      ctx.beginPath();
      ctx.arc(width / 2, centerY, 60 * scale, 0, Math.PI * 2);
      ctx.fill();
    }

    // "FlyWire" text (appears almost instantly)
    if (textAppear > 0) {
      ctx.globalAlpha = fadeAlpha * textAppear;
      ctx.fillStyle = PALETTE.text.accent;
      ctx.font = `bold ${32 * scale}px system-ui`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("FlyWire", width / 2, centerY);
      ctx.globalAlpha = fadeAlpha;
    }

    // Sparkle particles bursting outward
    if (burstProgress > 0) {
      for (const sp of data.sparkles) {
        const dist = sp.speed * burstProgress;
        const spX = width / 2 + Math.cos(sp.angle) * dist;
        const spY = centerY + Math.sin(sp.angle) * dist;
        const spAlpha = Math.max(0, 1 - burstProgress * 1.2) * 0.8;
        const twinkle = Math.sin(frame * 0.2 + sp.angle * 5) * 0.3 + 0.7;

        if (spAlpha > 0) {
          ctx.fillStyle = `hsla(${sp.hue}, 65%, 72%, ${spAlpha * twinkle})`;
          ctx.beginPath();
          ctx.arc(spX, spY, sp.size * (1 - burstProgress * 0.5), 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    // Subtitle
    if (subFade > 0) {
      ctx.globalAlpha = fadeAlpha * subFade;
      ctx.fillStyle = PALETTE.text.dim;
      ctx.font = `${10 * scale}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText("every single one mapped", width / 2, centerY + 28 * scale);
      ctx.globalAlpha = fadeAlpha;
    }

    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

export const VARIANTS_SHOT_031: VariantDef[] = [
  { id: "pulse-fade-in", label: "Pulse Fade-In", component: V1 },
  { id: "neon-letters", label: "Neon Letter-by-Letter", component: V2 },
  { id: "logo-stamp", label: "Logo Stamp", component: V3 },
  { id: "network-to-text", label: "Network to Text", component: V4 },
  { id: "typewriter-glow", label: "Typewriter with Glow", component: V5 },
  { id: "elegant-serif", label: "Elegant Serif", component: V6 },
  { id: "circuit-traces", label: "Circuit Traces", component: V7 },
  { id: "fly-silhouette", label: "Fly + Text Lockup", component: V8 },
  { id: "sparkle-burst", label: "Sparkle Burst", component: V9 },
];
