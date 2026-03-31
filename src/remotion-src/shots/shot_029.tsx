import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantDef, VariantProps } from "../types";
import { seeded, drawBg, makeParticles, drawParticles, PALETTE, fadeInOut } from "../scenes/theme";
import { drawNeuron, drawCheck } from "../icons";

// Shot 29 — "When they were done, they had the complete wiring diagram of an adult brain."
// 120 frames (4s). Individual neurons converge/assemble into a complete brain shape.

const V1: React.FC<VariantProps> = ({ width, height }) => {
  // Scattered Convergence: 150+ neurons fly inward, settle into brain-ellipse, connections appear
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(20, width, height, scale), [width, height, scale]);
  const data = useMemo(() => {
    const rand = seeded(29001);
    const brainCx = width / 2;
    const brainCy = height * 0.45;
    const brainRx = 65 * scale;
    const brainRy = 50 * scale;
    const neurons: { sx: number; sy: number; tx: number; ty: number; hue: number; delay: number }[] = [];
    for (let i = 0; i < 160; i++) {
      const angle = rand() * Math.PI * 2;
      const dist = Math.pow(rand(), 0.5) * 1;
      const tx = brainCx + Math.cos(angle) * brainRx * dist;
      const ty = brainCy + Math.sin(angle) * brainRy * dist;
      const startAngle = rand() * Math.PI * 2;
      const startDist = Math.max(width, height) * (0.6 + rand() * 0.4);
      neurons.push({
        sx: brainCx + Math.cos(startAngle) * startDist,
        sy: brainCy + Math.sin(startAngle) * startDist,
        tx, ty,
        hue: PALETTE.cellColors[Math.floor(rand() * 8)][0],
        delay: rand() * 40,
      });
    }
    const connections: [number, number][] = [];
    for (let i = 0; i < neurons.length; i++) {
      for (let j = i + 1; j < neurons.length; j++) {
        const dx = neurons[i].tx - neurons[j].tx;
        const dy = neurons[i].ty - neurons[j].ty;
        if (Math.sqrt(dx * dx + dy * dy) < 18 * scale && rand() < 0.3) {
          connections.push([i, j]);
        }
      }
    }
    return { neurons, connections, brainCx, brainCy, brainRx, brainRy };
  }, [width, height, scale]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, parts, frame, scale);
    const fadeAlpha = fadeInOut(frame, 120);
    ctx.globalAlpha = fadeAlpha;

    const convergeProgress = interpolate(frame, [5, 75], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const connectionFade = interpolate(frame, [70, 90], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const labelFade = interpolate(frame, [85, 100], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

    // Draw connections between settled neurons
    if (connectionFade > 0) {
      ctx.globalAlpha = fadeAlpha * connectionFade * 0.15;
      ctx.strokeStyle = PALETTE.text.dim;
      ctx.lineWidth = 0.7 * scale;
      for (const [a, b] of data.connections) {
        const na = data.neurons[a], nb = data.neurons[b];
        ctx.beginPath();
        ctx.moveTo(na.tx, na.ty);
        ctx.lineTo(nb.tx, nb.ty);
        ctx.stroke();
      }
      ctx.globalAlpha = fadeAlpha;
    }

    // Draw neurons converging
    for (const neuron of data.neurons) {
      const localT = interpolate(convergeProgress, [neuron.delay / 60, Math.min(1, neuron.delay / 60 + 0.5)], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const eased = 1 - Math.pow(1 - localT, 3);
      const currentX = neuron.sx + (neuron.tx - neuron.sx) * eased;
      const currentY = neuron.sy + (neuron.ty - neuron.sy) * eased;
      drawNeuron(ctx, currentX, currentY, 6 * scale, `hsla(${neuron.hue}, 55%, 60%, ${0.5 + localT * 0.4})`, frame);
    }

    // Brain outline glow when complete
    if (connectionFade > 0) {
      ctx.strokeStyle = `hsla(280, 40%, 55%, ${connectionFade * 0.25})`;
      ctx.lineWidth = 2 * scale;
      ctx.beginPath();
      ctx.ellipse(data.brainCx, data.brainCy, data.brainRx + 5 * scale, data.brainRy + 5 * scale, 0, 0, Math.PI * 2);
      ctx.stroke();
    }

    // "Complete" label
    if (labelFade > 0) {
      ctx.globalAlpha = fadeAlpha * labelFade;
      ctx.fillStyle = PALETTE.text.accent;
      ctx.font = `bold ${14 * scale}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText("Complete", width / 2, height * 0.88);
      ctx.globalAlpha = fadeAlpha;
    }

    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V2: React.FC<VariantProps> = ({ width, height }) => {
  // Jigsaw Completion: brain outline divided into regions that slide in, borders vanish
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(20, width, height, scale), [width, height, scale]);
  const data = useMemo(() => {
    const rand = seeded(29002);
    const brainCx = width / 2;
    const brainCy = height * 0.45;
    const pieces: { tx: number; ty: number; sx: number; sy: number; hue: number; w: number; h: number; delay: number }[] = [];
    const cols = 4, rows = 4;
    const pieceW = 34 * scale, pieceH = 28 * scale;
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const tx = brainCx + (col - cols / 2 + 0.5) * pieceW;
        const ty = brainCy + (row - rows / 2 + 0.5) * pieceH;
        const distFromCenter = Math.sqrt(Math.pow((tx - brainCx) / (cols * pieceW / 2), 2) + Math.pow((ty - brainCy) / (rows * pieceH / 2), 2));
        if (distFromCenter > 1.1) continue;
        const angle = rand() * Math.PI * 2;
        const startDist = 200 * scale + rand() * 100 * scale;
        pieces.push({
          tx, ty,
          sx: tx + Math.cos(angle) * startDist,
          sy: ty + Math.sin(angle) * startDist,
          hue: PALETTE.cellColors[Math.floor(rand() * 8)][0],
          w: pieceW, h: pieceH,
          delay: rand() * 35,
        });
      }
    }
    return { pieces, brainCx, brainCy };
  }, [width, height, scale]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, parts, frame, scale);
    const fadeAlpha = fadeInOut(frame, 120);
    ctx.globalAlpha = fadeAlpha;

    const assembleProgress = interpolate(frame, [5, 70], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const borderFade = interpolate(frame, [75, 95], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const glowPulse = interpolate(frame, [90, 110], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

    for (const piece of data.pieces) {
      const localT = interpolate(assembleProgress, [piece.delay / 50, Math.min(1, piece.delay / 50 + 0.45)], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const eased = 1 - Math.pow(1 - localT, 2.5);
      const currentX = piece.sx + (piece.tx - piece.sx) * eased;
      const currentY = piece.sy + (piece.ty - piece.sy) * eased;

      ctx.fillStyle = `hsla(${piece.hue}, 40%, 40%, ${0.35 + localT * 0.25})`;
      ctx.fillRect(currentX - piece.w / 2, currentY - piece.h / 2, piece.w, piece.h);

      // Borders fade when assembled
      if (borderFade > 0 && localT > 0.9) {
        ctx.strokeStyle = `hsla(${piece.hue}, 50%, 55%, ${borderFade * 0.5})`;
        ctx.lineWidth = 1 * scale;
        ctx.strokeRect(currentX - piece.w / 2, currentY - piece.h / 2, piece.w, piece.h);
      }

      // Neuron icon inside each piece
      if (localT > 0.5) {
        const neuronAlpha = (localT - 0.5) * 2;
        drawNeuron(ctx, currentX, currentY, 5 * scale, `hsla(${piece.hue}, 55%, 65%, ${neuronAlpha * 0.6})`, frame);
      }
    }

    // Glow pulse when complete
    if (glowPulse > 0) {
      const pulseRadius = 70 * scale + glowPulse * 30 * scale;
      const grad = ctx.createRadialGradient(data.brainCx, data.brainCy, 0, data.brainCx, data.brainCy, pulseRadius);
      grad.addColorStop(0, `hsla(280, 50%, 60%, ${(1 - glowPulse) * 0.15})`);
      grad.addColorStop(1, `hsla(280, 50%, 60%, 0)`);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(data.brainCx, data.brainCy, pulseRadius, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = PALETTE.text.accent;
      ctx.font = `bold ${12 * scale}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText("complete wiring diagram", width / 2, height * 0.88);
    }

    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V3: React.FC<VariantProps> = ({ width, height }) => {
  // Zoom-Out Reveal: close-up on a few neurons, camera pulls back to show full brain
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(20, width, height, scale), [width, height, scale]);
  const data = useMemo(() => {
    const rand = seeded(29003);
    const brainCx = width / 2;
    const brainCy = height * 0.45;
    const brainRx = 65 * scale;
    const brainRy = 50 * scale;
    const neurons: { x: number; y: number; hue: number }[] = [];
    for (let i = 0; i < 200; i++) {
      const angle = rand() * Math.PI * 2;
      const dist = Math.pow(rand(), 0.5);
      neurons.push({
        x: brainCx + Math.cos(angle) * brainRx * dist,
        y: brainCy + Math.sin(angle) * brainRy * dist,
        hue: PALETTE.cellColors[Math.floor(rand() * 8)][0],
      });
    }
    const edges: [number, number][] = [];
    for (let i = 0; i < neurons.length; i++) {
      for (let j = i + 1; j < neurons.length; j++) {
        const dx = neurons[i].x - neurons[j].x;
        const dy = neurons[i].y - neurons[j].y;
        if (Math.sqrt(dx * dx + dy * dy) < 20 * scale && rand() < 0.25) {
          edges.push([i, j]);
        }
      }
    }
    return { neurons, edges, brainCx, brainCy, brainRx, brainRy };
  }, [width, height, scale]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, parts, frame, scale);
    const fadeAlpha = fadeInOut(frame, 120);
    ctx.globalAlpha = fadeAlpha;

    const zoomLevel = interpolate(frame, [5, 90], [4, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const labelFade = interpolate(frame, [90, 105], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const visCount = Math.floor(interpolate(frame, [5, 80], [8, 200], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));

    ctx.save();
    ctx.translate(data.brainCx, data.brainCy);
    ctx.scale(zoomLevel, zoomLevel);
    ctx.translate(-data.brainCx, -data.brainCy);

    // Edges
    for (const [a, b] of data.edges) {
      if (a >= visCount || b >= visCount) continue;
      const na = data.neurons[a], nb = data.neurons[b];
      ctx.strokeStyle = `hsla(220, 30%, 50%, 0.12)`;
      ctx.lineWidth = 0.5 * scale;
      ctx.beginPath();
      ctx.moveTo(na.x, na.y);
      ctx.lineTo(nb.x, nb.y);
      ctx.stroke();
    }

    // Neurons
    for (let i = 0; i < visCount && i < data.neurons.length; i++) {
      const n = data.neurons[i];
      drawNeuron(ctx, n.x, n.y, 5 * scale, `hsla(${n.hue}, 55%, 60%, 0.7)`, frame);
    }

    ctx.restore();

    // Brain outline at final zoom
    if (zoomLevel < 1.3) {
      const outlineAlpha = interpolate(zoomLevel, [1, 1.3], [0.2, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      ctx.strokeStyle = `hsla(280, 40%, 55%, ${outlineAlpha})`;
      ctx.lineWidth = 1.5 * scale;
      ctx.beginPath();
      ctx.ellipse(data.brainCx, data.brainCy, data.brainRx + 8 * scale, data.brainRy + 8 * scale, 0, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Label
    if (labelFade > 0) {
      ctx.globalAlpha = fadeAlpha * labelFade;
      ctx.fillStyle = PALETTE.text.dim;
      ctx.font = `${10 * scale}px monospace`;
      ctx.textAlign = "center";
      ctx.fillText("complete connectome", width / 2, height * 0.9);
      ctx.globalAlpha = fadeAlpha;
    }

    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V4: React.FC<VariantProps> = ({ width, height }) => {
  // Brain Outline Fill: brain outline drawn first, colored dots fill from center outward in rings
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(20, width, height, scale), [width, height, scale]);
  const data = useMemo(() => {
    const rand = seeded(29004);
    const brainCx = width / 2;
    const brainCy = height * 0.45;
    const brainRx = 65 * scale;
    const brainRy = 50 * scale;
    const dots: { x: number; y: number; hue: number; dist: number }[] = [];
    for (let i = 0; i < 500; i++) {
      const angle = rand() * Math.PI * 2;
      const normDist = Math.pow(rand(), 0.5);
      const x = brainCx + Math.cos(angle) * brainRx * normDist;
      const y = brainCy + Math.sin(angle) * brainRy * normDist;
      dots.push({
        x, y,
        hue: PALETTE.cellColors[Math.floor(rand() * 8)][0],
        dist: normDist,
      });
    }
    dots.sort((a, b) => a.dist - b.dist);
    return { dots, brainCx, brainCy, brainRx, brainRy };
  }, [width, height, scale]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, parts, frame, scale);
    const fadeAlpha = fadeInOut(frame, 120);
    ctx.globalAlpha = fadeAlpha;

    const outlineProgress = interpolate(frame, [5, 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const fillProgress = interpolate(frame, [25, 95], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const completeFade = interpolate(frame, [95, 110], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

    // Brain outline
    if (outlineProgress > 0) {
      ctx.strokeStyle = `hsla(280, 40%, 50%, ${outlineProgress * 0.4})`;
      ctx.lineWidth = 1.5 * scale;
      ctx.beginPath();
      ctx.ellipse(data.brainCx, data.brainCy, data.brainRx, data.brainRy, 0, 0, Math.PI * 2 * outlineProgress);
      ctx.stroke();
      // Brain fissure
      if (outlineProgress > 0.5) {
        ctx.strokeStyle = `hsla(280, 30%, 45%, ${(outlineProgress - 0.5) * 0.6})`;
        ctx.lineWidth = 1 * scale;
        ctx.beginPath();
        ctx.moveTo(data.brainCx, data.brainCy - data.brainRy * 0.85);
        ctx.quadraticCurveTo(data.brainCx - 5 * scale, data.brainCy, data.brainCx, data.brainCy + data.brainRy * 0.85);
        ctx.stroke();
      }
    }

    // Fill with dots from center outward
    const dotsVisible = Math.floor(fillProgress * data.dots.length);
    for (let i = 0; i < dotsVisible; i++) {
      const dot = data.dots[i];
      const dotSize = (1.5 + (1 - dot.dist) * 1.5) * scale;
      ctx.fillStyle = `hsla(${dot.hue}, 50%, 60%, 0.6)`;
      ctx.beginPath();
      ctx.arc(dot.x, dot.y, dotSize, 0, Math.PI * 2);
      ctx.fill();
    }

    // Completion glow and text
    if (completeFade > 0) {
      ctx.globalAlpha = fadeAlpha * completeFade;
      const grad = ctx.createRadialGradient(data.brainCx, data.brainCy, 0, data.brainCx, data.brainCy, data.brainRx);
      grad.addColorStop(0, `hsla(280, 50%, 55%, 0.1)`);
      grad.addColorStop(1, `hsla(280, 50%, 55%, 0)`);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(data.brainCx, data.brainCy, data.brainRx, 0, Math.PI * 2);
      ctx.fill();
      drawCheck(ctx, width / 2, height * 0.84, 16 * scale, PALETTE.accent.green);
      ctx.fillStyle = PALETTE.text.dim;
      ctx.font = `${10 * scale}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText("every neuron mapped", width / 2, height * 0.93);
      ctx.globalAlpha = fadeAlpha;
    }

    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V5: React.FC<VariantProps> = ({ width, height }) => {
  // Glow Build-Up: dark brain silhouette, neurons light up one by one like a city at night
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(15, width, height, scale), [width, height, scale]);
  const data = useMemo(() => {
    const rand = seeded(29005);
    const brainCx = width / 2;
    const brainCy = height * 0.45;
    const brainRx = 65 * scale;
    const brainRy = 50 * scale;
    const neurons: { x: number; y: number; hue: number; lightFrame: number }[] = [];
    for (let i = 0; i < 180; i++) {
      const angle = rand() * Math.PI * 2;
      const dist = Math.pow(rand(), 0.5);
      neurons.push({
        x: brainCx + Math.cos(angle) * brainRx * dist,
        y: brainCy + Math.sin(angle) * brainRy * dist,
        hue: PALETTE.cellColors[Math.floor(rand() * 8)][0],
        lightFrame: 10 + Math.floor(rand() * 80),
      });
    }
    neurons.sort((a, b) => a.lightFrame - b.lightFrame);
    return { neurons, brainCx, brainCy, brainRx, brainRy };
  }, [width, height, scale]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, parts, frame, scale);
    const fadeAlpha = fadeInOut(frame, 120);
    ctx.globalAlpha = fadeAlpha;

    const labelFade = interpolate(frame, [90, 105], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

    // Dark brain silhouette
    const silGrad = ctx.createRadialGradient(data.brainCx - 8 * scale, data.brainCy - 8 * scale, 0, data.brainCx, data.brainCy, data.brainRx);
    silGrad.addColorStop(0, "hsla(280, 20%, 22%, 0.5)");
    silGrad.addColorStop(1, "hsla(280, 15%, 14%, 0.3)");
    ctx.fillStyle = silGrad;
    ctx.beginPath();
    ctx.ellipse(data.brainCx, data.brainCy, data.brainRx, data.brainRy, 0, 0, Math.PI * 2);
    ctx.fill();

    // Neurons lighting up
    for (const neuron of data.neurons) {
      if (frame < neuron.lightFrame) continue;
      const timeSinceLit = frame - neuron.lightFrame;
      const flashBrightness = timeSinceLit < 5 ? interpolate(timeSinceLit, [0, 2], [1, 0.5], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 0.4;
      const glowSize = timeSinceLit < 5 ? (3 + (5 - timeSinceLit) * 1.5) * scale : 2.5 * scale;

      // Individual glow
      ctx.shadowColor = `hsla(${neuron.hue}, 70%, 70%, ${flashBrightness * 0.6})`;
      ctx.shadowBlur = glowSize * 2;
      ctx.fillStyle = `hsla(${neuron.hue}, 60%, 70%, ${flashBrightness * 0.9})`;
      ctx.beginPath();
      ctx.arc(neuron.x, neuron.y, glowSize, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // Accumulated warm glow over whole brain
    const litCount = data.neurons.filter(n => frame >= n.lightFrame).length;
    const glowIntensity = litCount / data.neurons.length;
    if (glowIntensity > 0.1) {
      const warmGrad = ctx.createRadialGradient(data.brainCx, data.brainCy, 0, data.brainCx, data.brainCy, data.brainRx * 1.2);
      warmGrad.addColorStop(0, `hsla(45, 60%, 65%, ${glowIntensity * 0.1})`);
      warmGrad.addColorStop(0.7, `hsla(280, 40%, 55%, ${glowIntensity * 0.06})`);
      warmGrad.addColorStop(1, `hsla(280, 30%, 40%, 0)`);
      ctx.fillStyle = warmGrad;
      ctx.beginPath();
      ctx.arc(data.brainCx, data.brainCy, data.brainRx * 1.2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Label
    if (labelFade > 0) {
      ctx.globalAlpha = fadeAlpha * labelFade;
      ctx.fillStyle = PALETTE.text.accent;
      ctx.font = `${11 * scale}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText("complete wiring diagram", width / 2, height * 0.9);
      ctx.globalAlpha = fadeAlpha;
    }

    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V6: React.FC<VariantProps> = ({ width, height }) => {
  // Chaos to Order: scattered random particles gradually organize into brain network
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(15, width, height, scale), [width, height, scale]);
  const data = useMemo(() => {
    const rand = seeded(29006);
    const brainCx = width / 2;
    const brainCy = height * 0.45;
    const brainRx = 65 * scale;
    const brainRy = 50 * scale;
    const nodes: { chaosX: number; chaosY: number; orderX: number; orderY: number; hue: number }[] = [];
    for (let i = 0; i < 140; i++) {
      const angle = rand() * Math.PI * 2;
      const dist = Math.pow(rand(), 0.5);
      nodes.push({
        chaosX: rand() * width,
        chaosY: rand() * height,
        orderX: brainCx + Math.cos(angle) * brainRx * dist,
        orderY: brainCy + Math.sin(angle) * brainRy * dist,
        hue: PALETTE.cellColors[Math.floor(rand() * 8)][0],
      });
    }
    const edges: [number, number][] = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].orderX - nodes[j].orderX;
        const dy = nodes[i].orderY - nodes[j].orderY;
        if (Math.sqrt(dx * dx + dy * dy) < 20 * scale && rand() < 0.3) {
          edges.push([i, j]);
        }
      }
    }
    return { nodes, edges, brainCx, brainCy };
  }, [width, height, scale]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, parts, frame, scale);
    const fadeAlpha = fadeInOut(frame, 120);
    ctx.globalAlpha = fadeAlpha;

    const orderProgress = interpolate(frame, [5, 85], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const edgeFade = interpolate(frame, [60, 90], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const labelFade = interpolate(frame, [90, 105], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const eased = 1 - Math.pow(1 - orderProgress, 2);

    // Edges appear as nodes organize
    if (edgeFade > 0) {
      for (const [a, b] of data.edges) {
        const na = data.nodes[a], nb = data.nodes[b];
        const ax = na.chaosX + (na.orderX - na.chaosX) * eased;
        const ay = na.chaosY + (na.orderY - na.chaosY) * eased;
        const bx = nb.chaosX + (nb.orderX - nb.chaosX) * eased;
        const by = nb.chaosY + (nb.orderY - nb.chaosY) * eased;
        ctx.strokeStyle = `hsla(220, 30%, 50%, ${edgeFade * 0.12})`;
        ctx.lineWidth = 0.7 * scale;
        ctx.beginPath();
        ctx.moveTo(ax, ay);
        ctx.lineTo(bx, by);
        ctx.stroke();
      }
    }

    // Nodes transitioning from chaos to order
    for (const node of data.nodes) {
      const wobble = orderProgress < 0.8 ? Math.sin(frame * 0.08 + node.chaosX) * (1 - orderProgress) * 3 * scale : 0;
      const currentX = node.chaosX + (node.orderX - node.chaosX) * eased + wobble;
      const currentY = node.chaosY + (node.orderY - node.chaosY) * eased + wobble;
      const nodeSize = (2 + orderProgress * 2) * scale;
      ctx.fillStyle = `hsla(${node.hue}, 55%, 60%, ${0.3 + orderProgress * 0.5})`;
      ctx.beginPath();
      ctx.arc(currentX, currentY, nodeSize, 0, Math.PI * 2);
      ctx.fill();
    }

    // Label
    if (labelFade > 0) {
      ctx.globalAlpha = fadeAlpha * labelFade;
      ctx.fillStyle = PALETTE.text.accent;
      ctx.font = `${11 * scale}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText("emergence of the connectome", width / 2, height * 0.9);
      ctx.globalAlpha = fadeAlpha;
    }

    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V7: React.FC<VariantProps> = ({ width, height }) => {
  // Celebration Moment: brain appears, light pulse, drawCheck, "COMPLETE" with sparkle
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(20, width, height, scale), [width, height, scale]);
  const data = useMemo(() => {
    const rand = seeded(29007);
    const brainCx = width / 2;
    const brainCy = height * 0.4;
    const brainRx = 60 * scale;
    const brainRy = 45 * scale;
    const neurons: { x: number; y: number; hue: number }[] = [];
    for (let i = 0; i < 120; i++) {
      const angle = rand() * Math.PI * 2;
      const dist = Math.pow(rand(), 0.5);
      neurons.push({
        x: brainCx + Math.cos(angle) * brainRx * dist,
        y: brainCy + Math.sin(angle) * brainRy * dist,
        hue: PALETTE.cellColors[Math.floor(rand() * 8)][0],
      });
    }
    const sparkles: { angle: number; dist: number; hue: number; speed: number }[] = [];
    for (let i = 0; i < 30; i++) {
      sparkles.push({
        angle: rand() * Math.PI * 2,
        dist: 80 * scale + rand() * 60 * scale,
        hue: PALETTE.cellColors[Math.floor(rand() * 8)][0],
        speed: 0.5 + rand() * 1.5,
      });
    }
    return { neurons, sparkles, brainCx, brainCy, brainRx, brainRy };
  }, [width, height, scale]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, parts, frame, scale);
    const fadeAlpha = fadeInOut(frame, 120);
    ctx.globalAlpha = fadeAlpha;

    const brainAppear = interpolate(frame, [5, 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const pulseProgress = interpolate(frame, [35, 60], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const checkPop = interpolate(frame, [55, 70], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const textFade = interpolate(frame, [65, 80], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const sparklePhase = interpolate(frame, [70, 110], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

    // Brain network
    if (brainAppear > 0) {
      ctx.globalAlpha = fadeAlpha * brainAppear;
      // Brain glow
      const brainGrad = ctx.createRadialGradient(data.brainCx, data.brainCy, 0, data.brainCx, data.brainCy, data.brainRx);
      brainGrad.addColorStop(0, "hsla(280, 35%, 35%, 0.4)");
      brainGrad.addColorStop(1, "hsla(280, 25%, 20%, 0.2)");
      ctx.fillStyle = brainGrad;
      ctx.beginPath();
      ctx.ellipse(data.brainCx, data.brainCy, data.brainRx, data.brainRy, 0, 0, Math.PI * 2);
      ctx.fill();

      for (const n of data.neurons) {
        drawNeuron(ctx, n.x, n.y, 4 * scale, `hsla(${n.hue}, 55%, 60%, 0.6)`, frame);
      }
      ctx.globalAlpha = fadeAlpha;
    }

    // Light pulse radiating outward
    if (pulseProgress > 0 && pulseProgress < 1) {
      const pulseRadius = pulseProgress * data.brainRx * 2;
      const pulseAlpha = (1 - pulseProgress) * 0.3;
      ctx.strokeStyle = `hsla(45, 80%, 70%, ${pulseAlpha})`;
      ctx.lineWidth = 3 * scale * (1 - pulseProgress);
      ctx.beginPath();
      ctx.arc(data.brainCx, data.brainCy, pulseRadius, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Check mark
    if (checkPop > 0) {
      const checkScale = checkPop > 0.7 ? 1 + (1 - checkPop) * 0.3 : checkPop / 0.7;
      ctx.save();
      ctx.translate(width / 2, height * 0.7);
      ctx.scale(checkScale, checkScale);
      drawCheck(ctx, 0, 0, 22 * scale, PALETTE.accent.green);
      ctx.restore();
    }

    // "COMPLETE" text
    if (textFade > 0) {
      ctx.globalAlpha = fadeAlpha * textFade;
      ctx.fillStyle = PALETTE.text.accent;
      ctx.font = `bold ${16 * scale}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText("COMPLETE", width / 2, height * 0.85);
      ctx.globalAlpha = fadeAlpha;
    }

    // Sparkle particles
    if (sparklePhase > 0) {
      for (const sp of data.sparkles) {
        const spDist = sp.dist * sparklePhase * sp.speed;
        const spX = data.brainCx + Math.cos(sp.angle) * spDist;
        const spY = data.brainCy + Math.sin(sp.angle) * spDist;
        const spAlpha = (1 - sparklePhase) * 0.7;
        const twinkle = Math.sin(frame * 0.15 + sp.angle * 3) * 0.3 + 0.7;
        ctx.fillStyle = `hsla(${sp.hue}, 60%, 75%, ${spAlpha * twinkle})`;
        ctx.beginPath();
        ctx.arc(spX, spY, 1.5 * scale, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V8: React.FC<VariantProps> = ({ width, height }) => {
  // Last Piece: brain network 99% complete, final neuron slides in, flash, zoom out
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(18, width, height, scale), [width, height, scale]);
  const data = useMemo(() => {
    const rand = seeded(29008);
    const brainCx = width / 2;
    const brainCy = height * 0.45;
    const brainRx = 60 * scale;
    const brainRy = 45 * scale;
    const neurons: { x: number; y: number; hue: number }[] = [];
    for (let i = 0; i < 100; i++) {
      const angle = rand() * Math.PI * 2;
      const dist = Math.pow(rand(), 0.5);
      neurons.push({
        x: brainCx + Math.cos(angle) * brainRx * dist,
        y: brainCy + Math.sin(angle) * brainRy * dist,
        hue: PALETTE.cellColors[Math.floor(rand() * 8)][0],
      });
    }
    // Gap location
    const gapX = brainCx + 15 * scale;
    const gapY = brainCy - 8 * scale;
    // Remove neurons near the gap
    const filtered = neurons.filter(n => {
      const dx = n.x - gapX;
      const dy = n.y - gapY;
      return Math.sqrt(dx * dx + dy * dy) > 12 * scale;
    });
    const edges: [number, number][] = [];
    for (let i = 0; i < filtered.length; i++) {
      for (let j = i + 1; j < filtered.length; j++) {
        const dx = filtered[i].x - filtered[j].x;
        const dy = filtered[i].y - filtered[j].y;
        if (Math.sqrt(dx * dx + dy * dy) < 22 * scale && rand() < 0.2) {
          edges.push([i, j]);
        }
      }
    }
    return { neurons: filtered, edges, gapX, gapY, brainCx, brainCy, brainRx, brainRy };
  }, [width, height, scale]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, parts, frame, scale);
    const fadeAlpha = fadeInOut(frame, 120);
    ctx.globalAlpha = fadeAlpha;

    const networkFade = interpolate(frame, [5, 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const pieceSlide = interpolate(frame, [30, 55], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const flashIntensity = interpolate(frame, [55, 60], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) * interpolate(frame, [60, 70], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const zoomOut = interpolate(frame, [70, 100], [1.3, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const completeFade = interpolate(frame, [90, 105], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

    ctx.save();
    ctx.translate(data.brainCx, data.brainCy);
    ctx.scale(zoomOut, zoomOut);
    ctx.translate(-data.brainCx, -data.brainCy);

    // Existing network
    ctx.globalAlpha = fadeAlpha * networkFade;
    for (const [a, b] of data.edges) {
      const na = data.neurons[a], nb = data.neurons[b];
      ctx.strokeStyle = `hsla(220, 30%, 50%, 0.12)`;
      ctx.lineWidth = 0.6 * scale;
      ctx.beginPath();
      ctx.moveTo(na.x, na.y);
      ctx.lineTo(nb.x, nb.y);
      ctx.stroke();
    }
    for (const n of data.neurons) {
      drawNeuron(ctx, n.x, n.y, 4.5 * scale, `hsla(${n.hue}, 50%, 58%, 0.6)`, frame);
    }

    // Gap indicator (pulsing ring before the piece arrives)
    if (pieceSlide < 0.9) {
      const pulseSize = 8 * scale + Math.sin(frame * 0.12) * 2 * scale;
      ctx.strokeStyle = `hsla(45, 70%, 60%, ${(1 - pieceSlide) * 0.4})`;
      ctx.lineWidth = 1 * scale;
      ctx.setLineDash([2 * scale, 2 * scale]);
      ctx.beginPath();
      ctx.arc(data.gapX, data.gapY, pulseSize, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Last piece sliding in from the right
    const lastPieceEased = 1 - Math.pow(1 - pieceSlide, 3);
    const lastPieceX = data.gapX + (1 - lastPieceEased) * 80 * scale;
    const lastPieceY = data.gapY;
    drawNeuron(ctx, lastPieceX, lastPieceY, 6 * scale, `hsla(45, 70%, 65%, ${0.5 + pieceSlide * 0.5})`, frame);

    // Connection lines from last piece to nearby neurons
    if (pieceSlide > 0.8) {
      const connAlpha = (pieceSlide - 0.8) * 5;
      for (const n of data.neurons) {
        const dx = n.x - data.gapX;
        const dy = n.y - data.gapY;
        if (Math.sqrt(dx * dx + dy * dy) < 25 * scale) {
          ctx.strokeStyle = `hsla(45, 60%, 60%, ${connAlpha * 0.2})`;
          ctx.lineWidth = 0.7 * scale;
          ctx.beginPath();
          ctx.moveTo(lastPieceX, lastPieceY);
          ctx.lineTo(n.x, n.y);
          ctx.stroke();
        }
      }
    }

    // Flash at connection point
    if (flashIntensity > 0) {
      const flashGrad = ctx.createRadialGradient(data.gapX, data.gapY, 0, data.gapX, data.gapY, 30 * scale * flashIntensity);
      flashGrad.addColorStop(0, `hsla(45, 90%, 85%, ${flashIntensity * 0.5})`);
      flashGrad.addColorStop(1, `hsla(45, 90%, 85%, 0)`);
      ctx.fillStyle = flashGrad;
      ctx.beginPath();
      ctx.arc(data.gapX, data.gapY, 30 * scale * flashIntensity, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();

    // Complete label
    if (completeFade > 0) {
      ctx.globalAlpha = fadeAlpha * completeFade;
      drawCheck(ctx, width / 2 - 45 * scale, height * 0.88, 12 * scale, PALETTE.accent.green);
      ctx.fillStyle = PALETTE.text.accent;
      ctx.font = `bold ${12 * scale}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText("the brain is whole", width / 2, height * 0.9);
      ctx.globalAlpha = fadeAlpha;
    }

    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V9: React.FC<VariantProps> = ({ width, height }) => {
  // Particle Swarm: 200+ particles swirling in circles, slowing and coalescing into brain shape
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const bgParts = useMemo(() => makeParticles(15, width, height, scale), [width, height, scale]);
  const data = useMemo(() => {
    const rand = seeded(29009);
    const brainCx = width / 2;
    const brainCy = height * 0.45;
    const brainRx = 65 * scale;
    const brainRy = 50 * scale;
    const particles: { targetX: number; targetY: number; orbitRadius: number; orbitPhase: number; orbitSpeed: number; hue: number }[] = [];
    for (let i = 0; i < 220; i++) {
      const angle = rand() * Math.PI * 2;
      const dist = Math.pow(rand(), 0.5);
      particles.push({
        targetX: brainCx + Math.cos(angle) * brainRx * dist,
        targetY: brainCy + Math.sin(angle) * brainRy * dist,
        orbitRadius: 80 * scale + rand() * 80 * scale,
        orbitPhase: rand() * Math.PI * 2,
        orbitSpeed: 0.03 + rand() * 0.04,
        hue: PALETTE.cellColors[Math.floor(rand() * 8)][0],
      });
    }
    return { particles, brainCx, brainCy, brainRx, brainRy };
  }, [width, height, scale]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, bgParts, frame, scale);
    const fadeAlpha = fadeInOut(frame, 120);
    ctx.globalAlpha = fadeAlpha;

    const settleProgress = interpolate(frame, [5, 90], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const labelFade = interpolate(frame, [90, 105], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const eased = 1 - Math.pow(1 - settleProgress, 2);
    const speedMultiplier = 1 - eased * 0.95;
    const orbitDecay = 1 - eased;

    for (const particle of data.particles) {
      const currentOrbitRadius = particle.orbitRadius * orbitDecay;
      const currentAngle = particle.orbitPhase + frame * particle.orbitSpeed * speedMultiplier;
      const orbitX = data.brainCx + Math.cos(currentAngle) * currentOrbitRadius;
      const orbitY = data.brainCy + Math.sin(currentAngle) * currentOrbitRadius * 0.7;
      const currentX = orbitX + (particle.targetX - orbitX) * eased;
      const currentY = orbitY + (particle.targetY - orbitY) * eased;
      const particleSize = (1.5 + eased * 1.5) * scale;

      // Trail when swirling fast
      if (speedMultiplier > 0.3) {
        const trailAngle = currentAngle - particle.orbitSpeed * speedMultiplier * 3;
        const trailR = currentOrbitRadius;
        const trailX = data.brainCx + Math.cos(trailAngle) * trailR;
        const trailY = data.brainCy + Math.sin(trailAngle) * trailR * 0.7;
        const trailFinalX = trailX + (particle.targetX - trailX) * eased;
        const trailFinalY = trailY + (particle.targetY - trailY) * eased;
        ctx.strokeStyle = `hsla(${particle.hue}, 50%, 55%, ${speedMultiplier * 0.1})`;
        ctx.lineWidth = 0.5 * scale;
        ctx.beginPath();
        ctx.moveTo(trailFinalX, trailFinalY);
        ctx.lineTo(currentX, currentY);
        ctx.stroke();
      }

      ctx.fillStyle = `hsla(${particle.hue}, 55%, 62%, ${0.4 + eased * 0.4})`;
      ctx.beginPath();
      ctx.arc(currentX, currentY, particleSize, 0, Math.PI * 2);
      ctx.fill();
    }

    // Brain outline when settled
    if (eased > 0.8) {
      const outlineAlpha = (eased - 0.8) * 5 * 0.2;
      ctx.strokeStyle = `hsla(280, 40%, 55%, ${outlineAlpha})`;
      ctx.lineWidth = 1.5 * scale;
      ctx.beginPath();
      ctx.ellipse(data.brainCx, data.brainCy, data.brainRx + 5 * scale, data.brainRy + 5 * scale, 0, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Label
    if (labelFade > 0) {
      ctx.globalAlpha = fadeAlpha * labelFade;
      ctx.fillStyle = PALETTE.text.accent;
      ctx.font = `${11 * scale}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText("from chaos to connectome", width / 2, height * 0.9);
      ctx.globalAlpha = fadeAlpha;
    }

    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

export const VARIANTS_SHOT_029: VariantDef[] = [
  { id: "scattered-convergence", label: "Scattered Convergence", component: V1 },
  { id: "jigsaw-completion", label: "Jigsaw Completion", component: V2 },
  { id: "zoom-out-reveal", label: "Zoom-Out Reveal", component: V3 },
  { id: "brain-outline-fill", label: "Brain Outline Fill", component: V4 },
  { id: "glow-buildup", label: "Glow Build-Up", component: V5 },
  { id: "chaos-to-order", label: "Chaos to Order", component: V6 },
  { id: "celebration-moment", label: "Celebration Moment", component: V7 },
  { id: "last-piece", label: "Last Piece", component: V8 },
  { id: "particle-swarm", label: "Particle Swarm", component: V9 },
];
