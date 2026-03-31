import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantDef, VariantProps } from "../types";
import { seeded, drawBg, makeParticles, drawParticles, PALETTE, fadeInOut } from "../scenes/theme";
import { drawNeuron } from "../icons";

// Shot 32 — "But a wiring diagram is just a map."
// 120 frames (4s). Living connectome goes flat and desaturated, becoming a static blueprint.

const V1: React.FC<VariantProps> = ({ width, height }) => {
  // 3D to 2D Flatten: neurons at various "depths" flatten to same plane
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(18, width, height, scale), [width, height, scale]);
  const data = useMemo(() => {
    const rand = seeded(32001);
    const neurons: { x: number; y: number; depth: number; hue: number; baseSize: number }[] = [];
    for (let i = 0; i < 60; i++) {
      neurons.push({
        x: width * (0.15 + rand() * 0.7),
        y: height * (0.15 + rand() * 0.6),
        depth: rand(),
        hue: PALETTE.cellColors[Math.floor(rand() * 8)][0],
        baseSize: (3 + rand() * 4) * scale,
      });
    }
    const edges: [number, number][] = [];
    for (let i = 0; i < neurons.length; i++) {
      for (let j = i + 1; j < neurons.length; j++) {
        const dx = neurons[i].x - neurons[j].x;
        const dy = neurons[i].y - neurons[j].y;
        if (Math.sqrt(dx * dx + dy * dy) < 50 * scale && rand() < 0.2) {
          edges.push([i, j]);
        }
      }
    }
    return { neurons, edges };
  }, [width, height, scale]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, parts, frame, scale);
    const fadeAlpha = fadeInOut(frame, 120);
    ctx.globalAlpha = fadeAlpha;

    const flattenProgress = interpolate(frame, [30, 75], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const desatProgress = interpolate(frame, [50, 85], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const labelFade = interpolate(frame, [85, 100], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const flatEased = 1 - Math.pow(1 - flattenProgress, 2);

    // Edges
    for (const [a, b] of data.edges) {
      const na = data.neurons[a], nb = data.neurons[b];
      const sat = Math.round(45 * (1 - desatProgress));
      const lit = Math.round(50 + desatProgress * 5);
      ctx.strokeStyle = `hsla(220, ${sat}%, ${lit}%, 0.15)`;
      ctx.lineWidth = 0.7 * scale;
      ctx.beginPath();
      ctx.moveTo(na.x, na.y);
      ctx.lineTo(nb.x, nb.y);
      ctx.stroke();
    }

    // Neurons: depth affects size; flatten makes all same size
    for (const neuron of data.neurons) {
      const depthScale = 0.5 + neuron.depth * 1;
      const currentDepthScale = depthScale + (1 - depthScale) * flatEased;
      const currentSize = neuron.baseSize * currentDepthScale;
      const sat = Math.round(55 * (1 - desatProgress));
      const lit = Math.round(60 * (1 - desatProgress * 0.3));
      const wobble = (1 - flatEased) * Math.sin(frame * 0.05 + neuron.x * 0.01) * 2 * scale;

      ctx.fillStyle = `hsla(${neuron.hue}, ${sat}%, ${lit}%, ${0.7 - desatProgress * 0.2})`;
      ctx.beginPath();
      ctx.arc(neuron.x + wobble, neuron.y + wobble * 0.5, currentSize, 0, Math.PI * 2);
      ctx.fill();
    }

    // "just a map" label
    if (labelFade > 0) {
      ctx.globalAlpha = fadeAlpha * labelFade;
      ctx.fillStyle = PALETTE.text.dim;
      ctx.font = `italic ${12 * scale}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText("just a map", width / 2, height * 0.9);
      ctx.globalAlpha = fadeAlpha;
    }

    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V2: React.FC<VariantProps> = ({ width, height }) => {
  // Color Drain: vibrant network, desaturation wave sweeps left to right
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(18, width, height, scale), [width, height, scale]);
  const data = useMemo(() => {
    const rand = seeded(32002);
    const neurons: { x: number; y: number; hue: number }[] = [];
    for (let i = 0; i < 80; i++) {
      neurons.push({
        x: width * (0.1 + rand() * 0.8),
        y: height * (0.12 + rand() * 0.65),
        hue: PALETTE.cellColors[Math.floor(rand() * 8)][0],
      });
    }
    const edges: [number, number][] = [];
    for (let i = 0; i < neurons.length; i++) {
      for (let j = i + 1; j < neurons.length; j++) {
        const dx = neurons[i].x - neurons[j].x;
        const dy = neurons[i].y - neurons[j].y;
        if (Math.sqrt(dx * dx + dy * dy) < 45 * scale && rand() < 0.15) {
          edges.push([i, j]);
        }
      }
    }
    return { neurons, edges };
  }, [width, height, scale]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, parts, frame, scale);
    const fadeAlpha = fadeInOut(frame, 120);
    ctx.globalAlpha = fadeAlpha;

    // The desaturation wave position sweeps from left to right
    const waveX = interpolate(frame, [25, 85], [-width * 0.1, width * 1.1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const labelFade = interpolate(frame, [85, 100], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

    // Edges
    for (const [a, b] of data.edges) {
      const na = data.neurons[a], nb = data.neurons[b];
      const midX = (na.x + nb.x) / 2;
      const desat = Math.min(1, Math.max(0, (waveX - midX) / (80 * scale)));
      const sat = Math.round(40 * (1 - desat));
      ctx.strokeStyle = `hsla(220, ${sat}%, ${45 + desat * 10}%, 0.15)`;
      ctx.lineWidth = 0.7 * scale;
      ctx.beginPath();
      ctx.moveTo(na.x, na.y);
      ctx.lineTo(nb.x, nb.y);
      ctx.stroke();
    }

    // Neurons with per-element desaturation
    for (const neuron of data.neurons) {
      const desat = Math.min(1, Math.max(0, (waveX - neuron.x) / (80 * scale)));
      const sat = Math.round(55 * (1 - desat));
      const lit = Math.round(60 - desat * 15);
      const pulse = (1 - desat) * Math.sin(frame * 0.06 + neuron.x * 0.01) * 1.5 * scale;
      const nodeSize = (3 + (1 - desat) * 1.5) * scale;

      ctx.fillStyle = `hsla(${neuron.hue}, ${sat}%, ${lit}%, ${0.7 - desat * 0.2})`;
      ctx.beginPath();
      ctx.arc(neuron.x, neuron.y + pulse, nodeSize, 0, Math.PI * 2);
      ctx.fill();
    }

    // Wave line indicator (subtle)
    if (waveX > 0 && waveX < width) {
      ctx.strokeStyle = `hsla(220, 30%, 50%, 0.1)`;
      ctx.lineWidth = 1 * scale;
      ctx.beginPath();
      ctx.moveTo(waveX, height * 0.08);
      ctx.lineTo(waveX, height * 0.85);
      ctx.stroke();
    }

    // Label
    if (labelFade > 0) {
      ctx.globalAlpha = fadeAlpha * labelFade;
      ctx.fillStyle = PALETTE.text.dim;
      ctx.font = `italic ${12 * scale}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText("just a map", width / 2, height * 0.9);
      ctx.globalAlpha = fadeAlpha;
    }

    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V3: React.FC<VariantProps> = ({ width, height }) => {
  // Organic to Grid: neurons snap from natural positions to rigid grid layout
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(18, width, height, scale), [width, height, scale]);
  const data = useMemo(() => {
    const rand = seeded(32003);
    const gridCols = 8, gridRows = 6;
    const cellW = width * 0.7 / gridCols;
    const cellH = height * 0.6 / gridRows;
    const startGX = width * 0.15;
    const startGY = height * 0.15;
    const neurons: { organicX: number; organicY: number; gridX: number; gridY: number; hue: number }[] = [];
    for (let row = 0; row < gridRows; row++) {
      for (let col = 0; col < gridCols; col++) {
        if (rand() < 0.3) continue;
        const gx = startGX + (col + 0.5) * cellW;
        const gy = startGY + (row + 0.5) * cellH;
        neurons.push({
          organicX: gx + (rand() - 0.5) * cellW * 2.5,
          organicY: gy + (rand() - 0.5) * cellH * 2.5,
          gridX: gx,
          gridY: gy,
          hue: PALETTE.cellColors[Math.floor(rand() * 8)][0],
        });
      }
    }
    const edges: [number, number][] = [];
    for (let i = 0; i < neurons.length; i++) {
      for (let j = i + 1; j < neurons.length; j++) {
        const dx = neurons[i].organicX - neurons[j].organicX;
        const dy = neurons[i].organicY - neurons[j].organicY;
        if (Math.sqrt(dx * dx + dy * dy) < 50 * scale && rand() < 0.2) {
          edges.push([i, j]);
        }
      }
    }
    return { neurons, edges };
  }, [width, height, scale]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, parts, frame, scale);
    const fadeAlpha = fadeInOut(frame, 120);
    ctx.globalAlpha = fadeAlpha;

    const snapProgress = interpolate(frame, [30, 70], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const desatProgress = interpolate(frame, [55, 85], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const labelFade = interpolate(frame, [85, 100], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const eased = snapProgress < 0.8 ? snapProgress / 0.8 * 0.5 : 0.5 + (snapProgress - 0.8) / 0.2 * 0.5;

    // Edges (organic curves become straight lines)
    for (const [a, b] of data.edges) {
      const na = data.neurons[a], nb = data.neurons[b];
      const ax = na.organicX + (na.gridX - na.organicX) * eased;
      const ay = na.organicY + (na.gridY - na.organicY) * eased;
      const bx = nb.organicX + (nb.gridX - nb.organicX) * eased;
      const by = nb.organicY + (nb.gridY - nb.organicY) * eased;
      const sat = Math.round(35 * (1 - desatProgress));
      ctx.strokeStyle = `hsla(220, ${sat}%, ${50 + desatProgress * 5}%, 0.15)`;
      ctx.lineWidth = 0.7 * scale;
      ctx.beginPath();
      ctx.moveTo(ax, ay);
      ctx.lineTo(bx, by);
      ctx.stroke();
    }

    // Neurons
    for (const neuron of data.neurons) {
      const currentX = neuron.organicX + (neuron.gridX - neuron.organicX) * eased;
      const currentY = neuron.organicY + (neuron.gridY - neuron.organicY) * eased;
      const wobble = (1 - eased) * Math.sin(frame * 0.05 + neuron.organicX * 0.02) * 2 * scale;
      const sat = Math.round(55 * (1 - desatProgress));
      const lit = Math.round(60 - desatProgress * 15);

      ctx.fillStyle = `hsla(${neuron.hue}, ${sat}%, ${lit}%, ${0.7 - desatProgress * 0.15})`;
      ctx.beginPath();
      ctx.arc(currentX + wobble, currentY + wobble * 0.5, 3 * scale, 0, Math.PI * 2);
      ctx.fill();
    }

    // Grid lines (appear as things snap)
    if (snapProgress > 0.5) {
      const gridAlpha = (snapProgress - 0.5) * 2 * 0.06;
      ctx.strokeStyle = `hsla(220, 20%, 40%, ${gridAlpha})`;
      ctx.lineWidth = 0.5 * scale;
      for (let i = 0; i <= 8; i++) {
        const gx = width * 0.15 + i * (width * 0.7 / 8);
        ctx.beginPath();
        ctx.moveTo(gx, height * 0.15);
        ctx.lineTo(gx, height * 0.75);
        ctx.stroke();
      }
      for (let i = 0; i <= 6; i++) {
        const gy = height * 0.15 + i * (height * 0.6 / 6);
        ctx.beginPath();
        ctx.moveTo(width * 0.15, gy);
        ctx.lineTo(width * 0.85, gy);
        ctx.stroke();
      }
    }

    // Label
    if (labelFade > 0) {
      ctx.globalAlpha = fadeAlpha * labelFade;
      ctx.fillStyle = PALETTE.text.dim;
      ctx.font = `italic ${12 * scale}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText("just a map", width / 2, height * 0.9);
      ctx.globalAlpha = fadeAlpha;
    }

    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V4: React.FC<VariantProps> = ({ width, height }) => {
  // Blueprint Morph: colorful network on dark bg transitions to blue blueprint with labels
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(15, width, height, scale), [width, height, scale]);
  const data = useMemo(() => {
    const rand = seeded(32004);
    const neurons: { x: number; y: number; hue: number; label: string }[] = [];
    const labels = ["N1", "N2", "N3", "N4", "N5", "N6", "N7", "N8", "N9", "N10", "N11", "N12"];
    for (let i = 0; i < 30; i++) {
      neurons.push({
        x: width * (0.12 + rand() * 0.76),
        y: height * (0.12 + rand() * 0.6),
        hue: PALETTE.cellColors[Math.floor(rand() * 8)][0],
        label: labels[i % labels.length],
      });
    }
    const edges: [number, number][] = [];
    for (let i = 0; i < neurons.length; i++) {
      for (let j = i + 1; j < neurons.length; j++) {
        const dx = neurons[i].x - neurons[j].x;
        const dy = neurons[i].y - neurons[j].y;
        if (Math.sqrt(dx * dx + dy * dy) < 60 * scale && rand() < 0.2) {
          edges.push([i, j]);
        }
      }
    }
    return { neurons, edges };
  }, [width, height, scale]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, parts, frame, scale);
    const fadeAlpha = fadeInOut(frame, 120);

    const morphProgress = interpolate(frame, [25, 70], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const labelReveal = interpolate(frame, [65, 85], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const titleFade = interpolate(frame, [85, 100], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

    // Blueprint background tint
    if (morphProgress > 0) {
      ctx.fillStyle = `hsla(215, 40%, 18%, ${morphProgress * 0.4})`;
      ctx.fillRect(0, 0, width, height);
    }

    ctx.globalAlpha = fadeAlpha;

    // Edges: colored curves become thin blue straight lines
    for (const [a, b] of data.edges) {
      const na = data.neurons[a], nb = data.neurons[b];
      const colorHue = Math.round(na.hue + (215 - na.hue) * morphProgress);
      const sat = Math.round(45 - morphProgress * 20);
      const lineW = (1.5 - morphProgress * 0.7) * scale;
      ctx.strokeStyle = `hsla(${colorHue}, ${sat}%, ${55 - morphProgress * 10}%, ${0.2 + morphProgress * 0.1})`;
      ctx.lineWidth = lineW;
      ctx.beginPath();
      ctx.moveTo(na.x, na.y);
      ctx.lineTo(nb.x, nb.y);
      ctx.stroke();
    }

    // Neurons: colored dots become blue circles with labels
    for (const neuron of data.neurons) {
      const colorHue = Math.round(neuron.hue + (215 - neuron.hue) * morphProgress);
      const sat = Math.round(55 - morphProgress * 30);
      const lit = Math.round(60 - morphProgress * 10);
      const wobble = (1 - morphProgress) * Math.sin(frame * 0.05 + neuron.x * 0.02) * 2 * scale;
      const nodeSize = (3.5 - morphProgress * 0.5) * scale;

      if (morphProgress < 0.8) {
        ctx.fillStyle = `hsla(${colorHue}, ${sat}%, ${lit}%, 0.7)`;
        ctx.beginPath();
        ctx.arc(neuron.x + wobble, neuron.y + wobble, nodeSize, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Blueprint style: outline circle
        ctx.strokeStyle = `hsla(215, 30%, 55%, 0.6)`;
        ctx.lineWidth = 0.8 * scale;
        ctx.beginPath();
        ctx.arc(neuron.x, neuron.y, nodeSize, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Labels appear
      if (labelReveal > 0) {
        ctx.globalAlpha = fadeAlpha * labelReveal;
        ctx.fillStyle = `hsla(215, 40%, 65%, 0.6)`;
        ctx.font = `${6 * scale}px monospace`;
        ctx.textAlign = "left";
        ctx.fillText(neuron.label, neuron.x + 5 * scale, neuron.y - 3 * scale);
        ctx.globalAlpha = fadeAlpha;
      }
    }

    // "just a map" title
    if (titleFade > 0) {
      ctx.globalAlpha = fadeAlpha * titleFade;
      ctx.fillStyle = `hsla(215, 30%, 60%, 0.7)`;
      ctx.font = `italic ${12 * scale}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText("just a map", width / 2, height * 0.9);
      ctx.globalAlpha = fadeAlpha;
    }

    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V5: React.FC<VariantProps> = ({ width, height }) => {
  // Breathing to Still: neurons pulse/wobble, then slow to a stop. Life drains away.
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(18, width, height, scale), [width, height, scale]);
  const data = useMemo(() => {
    const rand = seeded(32005);
    const neurons: { x: number; y: number; hue: number; phase: number }[] = [];
    for (let i = 0; i < 70; i++) {
      neurons.push({
        x: width * (0.12 + rand() * 0.76),
        y: height * (0.1 + rand() * 0.65),
        hue: PALETTE.cellColors[Math.floor(rand() * 8)][0],
        phase: rand() * Math.PI * 2,
      });
    }
    const edges: [number, number][] = [];
    for (let i = 0; i < neurons.length; i++) {
      for (let j = i + 1; j < neurons.length; j++) {
        const dx = neurons[i].x - neurons[j].x;
        const dy = neurons[i].y - neurons[j].y;
        if (Math.sqrt(dx * dx + dy * dy) < 50 * scale && rand() < 0.18) {
          edges.push([i, j]);
        }
      }
    }
    return { neurons, edges };
  }, [width, height, scale]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, parts, frame, scale);
    const fadeAlpha = fadeInOut(frame, 120);
    ctx.globalAlpha = fadeAlpha;

    // Life factor: starts at 1 (alive), goes to 0 (still)
    const lifeFactor = interpolate(frame, [20, 80], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const desatFactor = interpolate(frame, [50, 90], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const labelFade = interpolate(frame, [88, 103], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

    // Edges with traveling pulses that slow down
    for (const [a, b] of data.edges) {
      const na = data.neurons[a], nb = data.neurons[b];
      const sat = Math.round(35 * (1 - desatFactor));
      ctx.strokeStyle = `hsla(220, ${sat}%, ${50 + desatFactor * 5}%, 0.15)`;
      ctx.lineWidth = 0.7 * scale;
      ctx.beginPath();
      ctx.moveTo(na.x, na.y);
      ctx.lineTo(nb.x, nb.y);
      ctx.stroke();

      // Traveling pulse dot (slows and fades)
      if (lifeFactor > 0.05) {
        const pulseT = ((frame * 0.03 * lifeFactor + na.phase) % 1);
        const px = na.x + (nb.x - na.x) * pulseT;
        const py = na.y + (nb.y - na.y) * pulseT;
        ctx.fillStyle = `hsla(45, ${60 * (1 - desatFactor)}%, 70%, ${lifeFactor * 0.5})`;
        ctx.beginPath();
        ctx.arc(px, py, 1.5 * scale * lifeFactor, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Neurons: wobble decays, glow fades
    for (const neuron of data.neurons) {
      const wobbleX = Math.sin(frame * 0.06 * lifeFactor + neuron.phase) * 3 * scale * lifeFactor;
      const wobbleY = Math.cos(frame * 0.05 * lifeFactor + neuron.phase * 1.3) * 2 * scale * lifeFactor;
      const sizeBreath = 1 + Math.sin(frame * 0.07 * lifeFactor + neuron.phase) * 0.15 * lifeFactor;
      const sat = Math.round(55 * (1 - desatFactor));
      const lit = Math.round(60 - desatFactor * 18);
      const nodeSize = 3.5 * scale * sizeBreath;

      // Glow when alive
      if (lifeFactor > 0.1) {
        ctx.fillStyle = `hsla(${neuron.hue}, ${sat}%, ${lit}%, ${lifeFactor * 0.08})`;
        ctx.beginPath();
        ctx.arc(neuron.x + wobbleX, neuron.y + wobbleY, nodeSize * 3, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.fillStyle = `hsla(${neuron.hue}, ${sat}%, ${lit}%, ${0.7 - desatFactor * 0.15})`;
      ctx.beginPath();
      ctx.arc(neuron.x + wobbleX, neuron.y + wobbleY, nodeSize, 0, Math.PI * 2);
      ctx.fill();
    }

    // Label
    if (labelFade > 0) {
      ctx.globalAlpha = fadeAlpha * labelFade;
      ctx.fillStyle = PALETTE.text.dim;
      ctx.font = `italic ${12 * scale}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText("just a map", width / 2, height * 0.9);
      ctx.globalAlpha = fadeAlpha;
    }

    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V6: React.FC<VariantProps> = ({ width, height }) => {
  // Paper Flatten: network "prints" onto a flat paper/document sliding in
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(15, width, height, scale), [width, height, scale]);
  const data = useMemo(() => {
    const rand = seeded(32006);
    const neurons: { x: number; y: number; hue: number }[] = [];
    for (let i = 0; i < 50; i++) {
      neurons.push({
        x: 0.15 + rand() * 0.7,
        y: 0.12 + rand() * 0.6,
        hue: PALETTE.cellColors[Math.floor(rand() * 8)][0],
      });
    }
    const edges: [number, number][] = [];
    for (let i = 0; i < neurons.length; i++) {
      for (let j = i + 1; j < neurons.length; j++) {
        const dx = neurons[i].x - neurons[j].x;
        const dy = neurons[i].y - neurons[j].y;
        if (Math.sqrt(dx * dx + dy * dy) < 0.2 && rand() < 0.2) {
          edges.push([i, j]);
        }
      }
    }
    return { neurons, edges };
  }, []);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, parts, frame, scale);
    const fadeAlpha = fadeInOut(frame, 120);
    ctx.globalAlpha = fadeAlpha;

    const paperSlide = interpolate(frame, [30, 60], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const printProgress = interpolate(frame, [55, 85], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const networkFade = interpolate(frame, [50, 75], [1, 0.15], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const labelFade = interpolate(frame, [85, 100], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

    // Floating network (fades as paper appears)
    ctx.globalAlpha = fadeAlpha * networkFade;
    for (const [a, b] of data.edges) {
      const na = data.neurons[a], nb = data.neurons[b];
      ctx.strokeStyle = `hsla(220, 35%, 50%, 0.15)`;
      ctx.lineWidth = 0.7 * scale;
      ctx.beginPath();
      ctx.moveTo(na.x * width, na.y * height);
      ctx.lineTo(nb.x * width, nb.y * height);
      ctx.stroke();
    }
    for (const n of data.neurons) {
      ctx.fillStyle = `hsla(${n.hue}, 55%, 60%, 0.7)`;
      ctx.beginPath();
      ctx.arc(n.x * width, n.y * height, 3 * scale, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = fadeAlpha;

    // Paper sliding in from bottom
    if (paperSlide > 0) {
      const paperW = width * 0.65;
      const paperH = height * 0.7;
      const paperX = (width - paperW) / 2;
      const paperY = height + paperH * (1 - paperSlide) - paperH * 0.05;

      // Paper shadow
      ctx.fillStyle = "rgba(0, 0, 0, 0.15)";
      ctx.fillRect(paperX + 4 * scale, paperY + 4 * scale, paperW, paperH);

      // Paper
      ctx.fillStyle = `hsla(45, 10%, 90%, ${paperSlide * 0.9})`;
      ctx.fillRect(paperX, paperY, paperW, paperH);
      ctx.strokeStyle = `hsla(220, 20%, 60%, ${paperSlide * 0.3})`;
      ctx.lineWidth = 1 * scale;
      ctx.strokeRect(paperX, paperY, paperW, paperH);

      // Printed network on paper (greyscale)
      if (printProgress > 0) {
        ctx.save();
        ctx.beginPath();
        ctx.rect(paperX, paperY, paperW, paperH);
        ctx.clip();

        const printedCount = Math.floor(printProgress * data.neurons.length);
        for (const [a, b] of data.edges) {
          if (a >= printedCount || b >= printedCount) continue;
          const na = data.neurons[a], nb = data.neurons[b];
          ctx.strokeStyle = `hsla(220, 10%, 35%, ${printProgress * 0.25})`;
          ctx.lineWidth = 0.5 * scale;
          ctx.beginPath();
          ctx.moveTo(paperX + na.x * paperW, paperY + na.y * paperH);
          ctx.lineTo(paperX + nb.x * paperW, paperY + nb.y * paperH);
          ctx.stroke();
        }
        for (let i = 0; i < printedCount; i++) {
          const n = data.neurons[i];
          ctx.fillStyle = `hsla(220, 10%, 30%, ${printProgress * 0.6})`;
          ctx.beginPath();
          ctx.arc(paperX + n.x * paperW, paperY + n.y * paperH, 2 * scale, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      }
    }

    // Label
    if (labelFade > 0) {
      ctx.globalAlpha = fadeAlpha * labelFade;
      ctx.fillStyle = PALETTE.text.dim;
      ctx.font = `italic ${12 * scale}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText("just a map", width / 2, height * 0.05 + 12 * scale);
      ctx.globalAlpha = fadeAlpha;
    }

    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V7: React.FC<VariantProps> = ({ width, height }) => {
  // Desaturation Wave from Center: colors drain outward, melancholic
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(18, width, height, scale), [width, height, scale]);
  const data = useMemo(() => {
    const rand = seeded(32007);
    const neurons: { x: number; y: number; hue: number; dist: number }[] = [];
    const cx = width / 2, cy = height * 0.45;
    for (let i = 0; i < 80; i++) {
      const x = width * (0.1 + rand() * 0.8);
      const y = height * (0.1 + rand() * 0.7);
      const dx = (x - cx) / width;
      const dy = (y - cy) / height;
      neurons.push({ x, y, hue: PALETTE.cellColors[Math.floor(rand() * 8)][0], dist: Math.sqrt(dx * dx + dy * dy) });
    }
    const edges: [number, number][] = [];
    for (let i = 0; i < neurons.length; i++) {
      for (let j = i + 1; j < neurons.length; j++) {
        const dx = neurons[i].x - neurons[j].x;
        const dy = neurons[i].y - neurons[j].y;
        if (Math.sqrt(dx * dx + dy * dy) < 50 * scale && rand() < 0.15) {
          edges.push([i, j]);
        }
      }
    }
    return { neurons, edges };
  }, [width, height, scale]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, parts, frame, scale);
    const fadeAlpha = fadeInOut(frame, 120);
    ctx.globalAlpha = fadeAlpha;

    // Wave radius expanding from center
    const waveRadius = interpolate(frame, [25, 85], [0, 0.6], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const labelFade = interpolate(frame, [88, 103], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

    // Edges
    for (const [a, b] of data.edges) {
      const na = data.neurons[a], nb = data.neurons[b];
      const avgDist = (na.dist + nb.dist) / 2;
      const desat = Math.min(1, Math.max(0, (waveRadius - avgDist) / 0.12));
      const sat = Math.round(35 * (1 - desat));
      ctx.strokeStyle = `hsla(220, ${sat}%, ${50 + desat * 5}%, 0.15)`;
      ctx.lineWidth = 0.7 * scale;
      ctx.beginPath();
      ctx.moveTo(na.x, na.y);
      ctx.lineTo(nb.x, nb.y);
      ctx.stroke();
    }

    // Neurons
    for (const neuron of data.neurons) {
      const desat = Math.min(1, Math.max(0, (waveRadius - neuron.dist) / 0.12));
      const sat = Math.round(55 * (1 - desat));
      const lit = Math.round(60 - desat * 18);
      const wobble = (1 - desat) * Math.sin(frame * 0.05 + neuron.x * 0.01) * 2 * scale;

      // Glow fading
      if (desat < 0.8) {
        ctx.fillStyle = `hsla(${neuron.hue}, ${sat}%, ${lit}%, ${(1 - desat) * 0.06})`;
        ctx.beginPath();
        ctx.arc(neuron.x, neuron.y, 10 * scale, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.fillStyle = `hsla(${neuron.hue}, ${sat}%, ${lit}%, ${0.7 - desat * 0.15})`;
      ctx.beginPath();
      ctx.arc(neuron.x + wobble, neuron.y + wobble, 3.5 * scale, 0, Math.PI * 2);
      ctx.fill();
    }

    // Label
    if (labelFade > 0) {
      ctx.globalAlpha = fadeAlpha * labelFade;
      ctx.fillStyle = PALETTE.text.dim;
      ctx.font = `italic ${12 * scale}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText("just a map", width / 2, height * 0.9);
      ctx.globalAlpha = fadeAlpha;
    }

    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V8: React.FC<VariantProps> = ({ width, height }) => {
  // Dimensional Collapse: neurons with Y-spread collapse to single horizontal line
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(18, width, height, scale), [width, height, scale]);
  const data = useMemo(() => {
    const rand = seeded(32008);
    const centerY = height * 0.5;
    const neurons: { x: number; originalY: number; hue: number }[] = [];
    for (let i = 0; i < 60; i++) {
      neurons.push({
        x: width * (0.08 + rand() * 0.84),
        originalY: height * (0.12 + rand() * 0.7),
        hue: PALETTE.cellColors[Math.floor(rand() * 8)][0],
      });
    }
    const edges: [number, number][] = [];
    for (let i = 0; i < neurons.length; i++) {
      for (let j = i + 1; j < neurons.length; j++) {
        const dx = neurons[i].x - neurons[j].x;
        const dy = neurons[i].originalY - neurons[j].originalY;
        if (Math.sqrt(dx * dx + dy * dy) < 55 * scale && rand() < 0.15) {
          edges.push([i, j]);
        }
      }
    }
    return { neurons, edges, centerY };
  }, [width, height, scale]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, parts, frame, scale);
    const fadeAlpha = fadeInOut(frame, 120);
    ctx.globalAlpha = fadeAlpha;

    const collapseProgress = interpolate(frame, [30, 75], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const desatProgress = interpolate(frame, [50, 85], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const labelFade = interpolate(frame, [85, 100], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const eased = 1 - Math.pow(1 - collapseProgress, 2.5);

    // Target line visualization
    if (collapseProgress > 0.3) {
      const lineAlpha = (collapseProgress - 0.3) * 0.15;
      ctx.strokeStyle = `hsla(220, 25%, 45%, ${lineAlpha})`;
      ctx.lineWidth = 0.5 * scale;
      ctx.setLineDash([4 * scale, 4 * scale]);
      ctx.beginPath();
      ctx.moveTo(width * 0.05, data.centerY);
      ctx.lineTo(width * 0.95, data.centerY);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Edges
    for (const [a, b] of data.edges) {
      const na = data.neurons[a], nb = data.neurons[b];
      const ay = na.originalY + (data.centerY - na.originalY) * eased;
      const by = nb.originalY + (data.centerY - nb.originalY) * eased;
      const sat = Math.round(35 * (1 - desatProgress));
      ctx.strokeStyle = `hsla(220, ${sat}%, ${50 + desatProgress * 5}%, 0.12)`;
      ctx.lineWidth = 0.6 * scale;
      ctx.beginPath();
      ctx.moveTo(na.x, ay);
      ctx.lineTo(nb.x, by);
      ctx.stroke();
    }

    // Neurons
    for (const neuron of data.neurons) {
      const currentY = neuron.originalY + (data.centerY - neuron.originalY) * eased;
      const sat = Math.round(55 * (1 - desatProgress));
      const lit = Math.round(60 - desatProgress * 18);
      const wobble = (1 - eased) * Math.sin(frame * 0.05 + neuron.x * 0.02) * 2 * scale;

      ctx.fillStyle = `hsla(${neuron.hue}, ${sat}%, ${lit}%, ${0.7 - desatProgress * 0.15})`;
      ctx.beginPath();
      ctx.arc(neuron.x, currentY + wobble, 3 * scale, 0, Math.PI * 2);
      ctx.fill();
    }

    // Label
    if (labelFade > 0) {
      ctx.globalAlpha = fadeAlpha * labelFade;
      ctx.fillStyle = PALETTE.text.dim;
      ctx.font = `italic ${12 * scale}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText("just a map", width / 2, height * 0.9);
      ctx.globalAlpha = fadeAlpha;
    }

    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V9: React.FC<VariantProps> = ({ width, height }) => {
  // Energy Fade: pulses of energy travel along edges, slow down, stop. Network goes inert.
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(18, width, height, scale), [width, height, scale]);
  const data = useMemo(() => {
    const rand = seeded(32009);
    const neurons: { x: number; y: number; hue: number }[] = [];
    for (let i = 0; i < 55; i++) {
      neurons.push({
        x: width * (0.1 + rand() * 0.8),
        y: height * (0.1 + rand() * 0.65),
        hue: PALETTE.cellColors[Math.floor(rand() * 8)][0],
      });
    }
    const edges: [number, number][] = [];
    for (let i = 0; i < neurons.length; i++) {
      for (let j = i + 1; j < neurons.length; j++) {
        const dx = neurons[i].x - neurons[j].x;
        const dy = neurons[i].y - neurons[j].y;
        if (Math.sqrt(dx * dx + dy * dy) < 55 * scale && rand() < 0.18) {
          edges.push([i, j]);
        }
      }
    }
    const pulses: { edge: number; phase: number; speed: number }[] = [];
    for (let i = 0; i < edges.length * 2; i++) {
      pulses.push({
        edge: Math.floor(rand() * edges.length),
        phase: rand(),
        speed: 0.015 + rand() * 0.02,
      });
    }
    return { neurons, edges, pulses };
  }, [width, height, scale]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, parts, frame, scale);
    const fadeAlpha = fadeInOut(frame, 120);
    ctx.globalAlpha = fadeAlpha;

    // Energy factor: 1 = alive, 0 = dead
    const energyFactor = interpolate(frame, [15, 85], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const edgeBrightFade = interpolate(frame, [40, 90], [0.2, 0.08], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const labelFade = interpolate(frame, [88, 103], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

    // Edges (dimming)
    for (const [a, b] of data.edges) {
      const na = data.neurons[a], nb = data.neurons[b];
      const sat = Math.round(35 * energyFactor);
      ctx.strokeStyle = `hsla(220, ${sat}%, ${45 + (1 - energyFactor) * 10}%, ${edgeBrightFade})`;
      ctx.lineWidth = 0.7 * scale;
      ctx.beginPath();
      ctx.moveTo(na.x, na.y);
      ctx.lineTo(nb.x, nb.y);
      ctx.stroke();
    }

    // Traveling pulses (slow down and vanish)
    if (energyFactor > 0.02) {
      for (const pulse of data.pulses) {
        const edge = data.edges[pulse.edge];
        if (!edge) continue;
        const [a, b] = edge;
        const na = data.neurons[a], nb = data.neurons[b];
        const t = (pulse.phase + frame * pulse.speed * energyFactor) % 1;
        const px = na.x + (nb.x - na.x) * t;
        const py = na.y + (nb.y - na.y) * t;
        const pulseAlpha = energyFactor * 0.6;
        ctx.fillStyle = `hsla(45, ${55 * energyFactor}%, 70%, ${pulseAlpha})`;
        ctx.beginPath();
        ctx.arc(px, py, 1.5 * scale * energyFactor, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Neurons (glow fading)
    for (const neuron of data.neurons) {
      const sat = Math.round(55 * energyFactor);
      const lit = Math.round(60 - (1 - energyFactor) * 18);
      const wobble = energyFactor * Math.sin(frame * 0.06 + neuron.x * 0.01) * 1.5 * scale;

      // Glow
      if (energyFactor > 0.1) {
        ctx.fillStyle = `hsla(${neuron.hue}, ${sat}%, ${lit}%, ${energyFactor * 0.06})`;
        ctx.beginPath();
        ctx.arc(neuron.x, neuron.y, 8 * scale, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.fillStyle = `hsla(${neuron.hue}, ${sat}%, ${lit}%, ${0.5 + energyFactor * 0.3})`;
      ctx.beginPath();
      ctx.arc(neuron.x + wobble, neuron.y + wobble * 0.5, 3.5 * scale, 0, Math.PI * 2);
      ctx.fill();
    }

    // Label
    if (labelFade > 0) {
      ctx.globalAlpha = fadeAlpha * labelFade;
      ctx.fillStyle = PALETTE.text.dim;
      ctx.font = `italic ${12 * scale}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText("just a map", width / 2, height * 0.9);
      ctx.globalAlpha = fadeAlpha;
    }

    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

export const VARIANTS_SHOT_032: VariantDef[] = [
  { id: "3d-to-2d", label: "3D to 2D Flatten", component: V1 },
  { id: "color-drain", label: "Color Drain", component: V2 },
  { id: "organic-to-grid", label: "Organic to Grid", component: V3 },
  { id: "blueprint-morph", label: "Blueprint Morph", component: V4 },
  { id: "breathing-still", label: "Breathing to Still", component: V5 },
  { id: "paper-flatten", label: "Paper Flatten", component: V6 },
  { id: "desat-wave", label: "Desaturation Wave", component: V7 },
  { id: "dim-collapse", label: "Dimensional Collapse", component: V8 },
  { id: "energy-fade", label: "Energy Fade", component: V9 },
];
