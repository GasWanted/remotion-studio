// Shot 001 — "Nature spent 50 million years fine-tuning a brain to crave sugar. I broke that"
// Duration: 150 frames (5s)
// Must show: NATURE, BRAIN, SUGAR, CRAVING, "I broke that" — not just "50 million"

import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantDef, VariantProps } from "../types";
import {
  FB, seeded, drawFBBg, drawFBNode, drawFBEdge, drawFBText, drawFBCounter,
  fadeInOut, stagger, accent, drawFBArrow, drawFBColorEdge, drawFBDashedCircle,
  cellHSL, drawFlyTop,
} from "./flatbold-kit";

/* ── V1: Lush nature scene → brain emerges from foliage ──
   Trees/leaves growing, then a brain-shaped network blooms at center */
const V1: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;

  const leaves = useMemo(() => {
    const rng = seeded(1010);
    return Array.from({ length: 60 }, () => ({
      x: rng() * width,
      y: rng() * height,
      r: (3 + rng() * 6) * scale,
      c: [3, 4, 3, 5, 3][Math.floor(rng() * 5)], // greens and teals
      phase: rng() * Math.PI * 2,
    }));
  }, [width, height, scale]);

  const brainNodes = useMemo(() => {
    const rng = seeded(1011);
    const cx = width / 2, cy = height / 2;
    return Array.from({ length: 30 }, () => {
      const a = rng() * Math.PI * 2;
      const d = Math.pow(rng(), 0.5) * 70 * scale;
      return { x: cx + Math.cos(a) * d * 1.3, y: cy + Math.sin(a) * d * 0.85, c: Math.floor(rng() * 8) };
    });
  }, [width, height, scale]);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, width, height, frame);
    const alpha = fadeInOut(frame, 150);

    // Phase 1 (0-70): nature leaves grow in
    const leafCount = Math.floor(interpolate(frame, [0, 70], [0, leaves.length], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
    for (let i = 0; i < leafCount; i++) {
      const l = leaves[i];
      const sway = Math.sin(frame * 0.03 + l.phase) * 3 * scale;
      drawFBNode(ctx, l.x + sway, l.y, l.r * 0.7, l.c, alpha * 0.4, frame);
    }

    // Phase 2 (40-120): brain network emerges from center
    const brainT = interpolate(frame, [40, 120], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const brainCount = Math.floor(brainT * brainNodes.length);
    for (let i = 1; i < brainCount; i++) {
      const a = brainNodes[i - 1], b = brainNodes[i];
      drawFBEdge(ctx, a.x, a.y, b.x, b.y, scale, alpha * brainT * 0.6, frame, cellHSL(a.c)[0], cellHSL(b.c)[0]);
    }
    for (let i = 0; i < brainCount; i++) {
      const n = brainNodes[i];
      drawFBNode(ctx, n.x, n.y, 4 * scale, n.c, alpha * brainT, frame);
    }

    // "NATURE" fades, then "BRAIN" appears
    if (frame < 80) {
      drawFBText(ctx, "NATURE", width / 2, height * 0.12, 16 * scale, alpha * interpolate(frame, [5, 20, 60, 80], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }), "center", FB.green);
    }
    if (frame > 60) {
      drawFBText(ctx, "BRAIN", width / 2, height * 0.88, 14 * scale, alpha * interpolate(frame, [60, 85], [0, 0.8], { extrapolateRight: "clamp" }), "center", FB.text.accent);
    }
  });

  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

/* ── V2: Sugar crystal forming → fly approaches → craving pulse ──
   Yellow/gold crystal shape, fly drawn toward it, pulsing "want" signal */
const V2: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, width, height, frame);
    const alpha = fadeInOut(frame, 150);
    const cx = width / 2, cy = height / 2;

    // Sugar crystal: hexagonal shape made of gold nodes
    const crystalT = interpolate(frame, [0, 60], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const crystalNodes: { x: number; y: number }[] = [];
    for (let ring = 0; ring < 3; ring++) {
      const n = ring === 0 ? 1 : ring * 6;
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2;
        const d = ring * 18 * scale;
        crystalNodes.push({ x: cx + Math.cos(a) * d, y: cy + Math.sin(a) * d - 10 * scale });
      }
    }
    const shown = Math.floor(crystalT * crystalNodes.length);
    for (let i = 0; i < shown; i++) {
      const cn = crystalNodes[i];
      drawFBNode(ctx, cn.x, cn.y, (4 + (i === 0 ? 3 : 0)) * scale, 3, alpha * crystalT, frame); // amber/gold
      // Connect to center
      if (i > 0) {
        drawFBEdge(ctx, crystalNodes[0].x, crystalNodes[0].y, cn.x, cn.y, scale, alpha * crystalT * 0.4, frame, 55, 55);
      }
    }

    // Craving pulses radiating out from crystal
    if (frame > 40) {
      for (let p = 0; p < 3; p++) {
        const pFrame = (frame - 40 + p * 20) % 60;
        const pR = pFrame * 2.5 * scale;
        const pAlpha = Math.max(0, 1 - pFrame / 60);
        drawFBDashedCircle(ctx, cx, cy - 10 * scale, pR, FB.gold, frame, scale, pAlpha * alpha * 0.3);
      }
    }

    // Fly approaching from left
    const flyT = interpolate(frame, [30, 100], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const flyX = width * 0.15 + flyT * width * 0.25;
    const flyY = cy + 30 * scale + Math.sin(frame * 0.08) * 5 * scale;
    const [h, s, l] = cellHSL(6); // violet
    drawFlyTop(ctx, flyX, flyY, 20 * scale, `hsla(${h},${s}%,${l}%,${alpha * flyT})`);

    // Arrow: fly → sugar
    if (flyT > 0.3) {
      drawFBArrow(ctx, flyX + 15 * scale, flyY, cx - 40 * scale, cy, FB.gold, scale, alpha * (flyT - 0.3) * 0.5);
    }

    drawFBText(ctx, "CRAVING", cx, height * 0.88, 13 * scale, alpha * interpolate(frame, [70, 95], [0, 0.8], { extrapolateRight: "clamp" }), "center", FB.gold);
  });

  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

/* ── V3: Brain cross-section with sugar pathway lit up ──
   Brain outline, sugar stimulus enters, pathway lights up gold */
const V3: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;

  const network = useMemo(() => {
    const rng = seeded(1030);
    const cx = width / 2, cy = height / 2;
    const nodes = Array.from({ length: 50 }, () => {
      const a = rng() * Math.PI * 2;
      const d = Math.pow(rng(), 0.5) * 100 * scale;
      return { x: cx + Math.cos(a) * d * 1.4, y: cy + Math.sin(a) * d * 0.85, c: Math.floor(rng() * 8) };
    });
    const edges: [number, number][] = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x, dy = nodes[i].y - nodes[j].y;
        if (Math.sqrt(dx * dx + dy * dy) < 50 * scale && rng() < 0.15) edges.push([i, j]);
      }
    }
    // Sugar pathway: chain of ~8 nodes roughly left to right
    const pathway = [0, 5, 12, 18, 25, 32, 38, 44].filter(i => i < nodes.length);
    return { nodes, edges, pathway };
  }, [width, height, scale]);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, width, height, frame);
    const alpha = fadeInOut(frame, 150);

    // Draw all edges dim
    for (const [a, b] of network.edges) {
      drawFBEdge(ctx, network.nodes[a].x, network.nodes[a].y, network.nodes[b].x, network.nodes[b].y, scale, alpha * 0.15, frame);
    }

    // Draw all nodes dim
    for (const n of network.nodes) {
      drawFBNode(ctx, n.x, n.y, 3 * scale, n.c, alpha * 0.3, frame);
    }

    // Animate sugar pathway lighting up gold
    const pathT = interpolate(frame, [30, 110], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const litCount = Math.floor(pathT * network.pathway.length);
    for (let i = 0; i < litCount; i++) {
      const idx = network.pathway[i];
      const n = network.nodes[idx];
      drawFBNode(ctx, n.x, n.y, 5 * scale, 3, alpha, frame); // gold
      if (i > 0) {
        const prev = network.nodes[network.pathway[i - 1]];
        drawFBColorEdge(ctx, prev.x, prev.y, n.x, n.y, FB.gold, scale, alpha * 0.8);
      }
    }

    // Labels
    drawFBText(ctx, "SUGAR", width * 0.08, height / 2, 11 * scale, alpha * pathT, "left", FB.gold);
    if (litCount >= network.pathway.length) {
      drawFBText(ctx, "EAT", width * 0.92, height / 2, 14 * scale, alpha * 0.9, "right", FB.gold);
    }
  });

  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

/* ── V4: Jungle/forest canopy with hidden brain wiring ──
   Layered green canopy, camera pushes through to reveal neural network underneath */
const V4: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;

  const data = useMemo(() => {
    const rng = seeded(1040);
    // Canopy blobs (green, teal)
    const canopy = Array.from({ length: 40 }, () => ({
      x: rng() * width, y: rng() * height * 0.6,
      r: (8 + rng() * 15) * scale,
      c: [3, 4, 3, 5, 3][Math.floor(rng() * 5)],
    }));
    // Hidden neural network underneath
    const neurons = Array.from({ length: 25 }, () => ({
      x: width * 0.2 + rng() * width * 0.6,
      y: height * 0.3 + rng() * height * 0.5,
      c: Math.floor(rng() * 8),
    }));
    return { canopy, neurons };
  }, [width, height, scale]);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, width, height, frame);
    const alpha = fadeInOut(frame, 150);

    // Phase 1: canopy visible, network hidden
    // Phase 2: canopy fades, network revealed
    const revealT = interpolate(frame, [50, 110], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const canopyAlpha = 1 - revealT * 0.7;

    // Neural network (behind canopy, revealed as canopy fades)
    if (revealT > 0) {
      for (let i = 1; i < data.neurons.length; i++) {
        const a = data.neurons[i - 1], b = data.neurons[i];
        drawFBEdge(ctx, a.x, a.y, b.x, b.y, scale, alpha * revealT * 0.5, frame, cellHSL(a.c)[0], cellHSL(b.c)[0]);
      }
      for (const n of data.neurons) {
        drawFBNode(ctx, n.x, n.y, 4 * scale, n.c, alpha * revealT, frame);
      }
    }

    // Canopy blobs
    for (const c of data.canopy) {
      const sway = Math.sin(frame * 0.02 + c.x * 0.01) * 4 * scale;
      drawFBNode(ctx, c.x + sway, c.y, c.r, c.c, alpha * canopyAlpha, frame);
    }

    drawFBText(ctx, "50 MILLION YEARS", width / 2, height * 0.08, 12 * scale, alpha * 0.6, "center", FB.green);
    if (revealT > 0.5) {
      drawFBText(ctx, "OF FINE-TUNING", width / 2, height * 0.92, 12 * scale, alpha * (revealT - 0.5) * 2, "center", FB.text.accent);
    }
  });

  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

/* ── V5: Fly tongue touching sugar droplet — craving visualized ──
   Close-up: proboscis extending to gold droplet, dopamine burst */
const V5: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, width, height, frame);
    const alpha = fadeInOut(frame, 150);
    const cx = width / 2, cy = height / 2;

    // Sugar droplet (right side, gold)
    const dropX = cx + 40 * scale, dropY = cy;
    drawFBNode(ctx, dropX, dropY, 20 * scale, 3, alpha, frame); // big gold blob
    drawFBText(ctx, "SUGAR", dropX, dropY + 30 * scale, 10 * scale, alpha * 0.6, "center", FB.gold);

    // Fly head (left side) — simplified as big dark blob with eyes
    const headX = cx - 60 * scale, headY = cy;
    drawFBNode(ctx, headX, headY, 22 * scale, 6, alpha, frame); // violet head blob

    // Proboscis extending toward sugar
    const extendT = interpolate(frame, [20, 70], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const probEnd = headX + 22 * scale + extendT * (dropX - headX - 42 * scale);
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = `hsla(25, 60%, 55%, ${alpha})`;
    ctx.lineWidth = 3 * scale;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(headX + 20 * scale, headY + 5 * scale);
    ctx.lineTo(probEnd, headY + 3 * scale);
    ctx.stroke();
    ctx.globalAlpha = 1;

    // Contact! Dopamine burst
    if (extendT > 0.9) {
      const burstT = interpolate(frame, [68, 120], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      // Gold particles bursting from contact point
      const rng = seeded(1050);
      for (let i = 0; i < 20; i++) {
        const a = rng() * Math.PI * 2;
        const d = burstT * (20 + rng() * 40) * scale;
        const px = dropX - 20 * scale + Math.cos(a) * d;
        const py = dropY + Math.sin(a) * d;
        const pAlpha = Math.max(0, 1 - burstT * 0.8);
        drawFBNode(ctx, px, py, (2 + rng() * 2) * scale, 3, alpha * pAlpha, frame);
      }
      drawFBText(ctx, "CRAVING", cx, height * 0.18, 16 * scale, alpha * burstT, "center", FB.gold);
    }
  });

  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

/* ── V6: Split — ancient world left, brain wiring right ──
   Left half: stylized nature (trees, earth tones). Right half: neural network. Connected by timeline arrow. */
const V6: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;

  const data = useMemo(() => {
    const rng = seeded(1060);
    const treeNodes = Array.from({ length: 20 }, () => ({
      x: rng() * width * 0.4 + width * 0.05,
      y: rng() * height * 0.7 + height * 0.15,
      r: (4 + rng() * 8) * scale,
      c: [3, 4, 1, 5][Math.floor(rng() * 4)],
    }));
    const brainNodes = Array.from({ length: 25 }, () => ({
      x: width * 0.55 + rng() * width * 0.4,
      y: rng() * height * 0.7 + height * 0.15,
      r: (3 + rng() * 4) * scale,
      c: Math.floor(rng() * 8),
    }));
    return { treeNodes, brainNodes };
  }, [width, height, scale]);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, width, height, frame);
    const alpha = fadeInOut(frame, 150);

    // Divider line
    ctx.globalAlpha = alpha * 0.2;
    ctx.strokeStyle = "rgba(255,255,255,0.3)";
    ctx.lineWidth = 1;
    ctx.setLineDash([4 * scale, 4 * scale]);
    ctx.beginPath();
    ctx.moveTo(width / 2, height * 0.1);
    ctx.lineTo(width / 2, height * 0.9);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.globalAlpha = 1;

    // Left: nature blobs growing
    const natT = interpolate(frame, [0, 70], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const natCount = Math.floor(natT * data.treeNodes.length);
    for (let i = 0; i < natCount; i++) {
      const n = data.treeNodes[i];
      drawFBNode(ctx, n.x, n.y, n.r, n.c, alpha, frame);
    }

    // Right: brain network
    const brainT = interpolate(frame, [40, 110], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const brainCount = Math.floor(brainT * data.brainNodes.length);
    for (let i = 1; i < brainCount; i++) {
      const a = data.brainNodes[i - 1], b = data.brainNodes[i];
      drawFBEdge(ctx, a.x, a.y, b.x, b.y, scale, alpha * brainT * 0.4, frame);
    }
    for (let i = 0; i < brainCount; i++) {
      const n = data.brainNodes[i];
      drawFBNode(ctx, n.x, n.y, n.r, n.c, alpha * brainT, frame);
    }

    // Arrow across
    if (frame > 50) {
      const arrowAlpha = interpolate(frame, [50, 80], [0, 0.6], { extrapolateRight: "clamp" });
      drawFBArrow(ctx, width * 0.42, height / 2, width * 0.58, height / 2, FB.gold, scale, alpha * arrowAlpha);
    }

    drawFBText(ctx, "NATURE", width * 0.25, height * 0.06, 11 * scale, alpha * 0.7, "center", FB.green);
    drawFBText(ctx, "BRAIN", width * 0.75, height * 0.06, 11 * scale, alpha * brainT * 0.7, "center", FB.text.accent);
    drawFBText(ctx, "50M years", width / 2, height * 0.94, 10 * scale, alpha * 0.5, "center", FB.text.dim);
  });

  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

/* ── V7: Fly in ecosystem — sugar source glowing, brain overlay ──
   Full scene: ground, plant, sugar fruit, fly landing, brain visible in its head */
const V7: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, width, height, frame);
    const alpha = fadeInOut(frame, 150);
    const cx = width / 2, cy = height / 2;

    // Ground line
    const groundY = height * 0.75;
    ctx.globalAlpha = alpha * 0.3;
    ctx.strokeStyle = `hsla(140, 40%, 45%, 0.5)`;
    ctx.lineWidth = 2 * scale;
    ctx.beginPath();
    ctx.moveTo(0, groundY);
    ctx.lineTo(width, groundY);
    ctx.stroke();
    ctx.globalAlpha = 1;

    // Plant stem
    ctx.globalAlpha = alpha * 0.6;
    ctx.strokeStyle = `hsla(140, 50%, 40%, 0.7)`;
    ctx.lineWidth = 3 * scale;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(cx, groundY);
    ctx.quadraticCurveTo(cx - 10 * scale, groundY - 60 * scale, cx + 5 * scale, groundY - 100 * scale);
    ctx.stroke();
    ctx.globalAlpha = 1;

    // Sugar fruit (glowing gold blob at top of stem)
    const fruitX = cx + 5 * scale, fruitY = groundY - 105 * scale;
    drawFBNode(ctx, fruitX, fruitY, 14 * scale, 3, alpha, frame); // gold fruit
    // Pulsing glow
    const pulseR = 14 * scale + Math.sin(frame * 0.08) * 3 * scale;
    drawFBDashedCircle(ctx, fruitX, fruitY, pulseR + 8 * scale, FB.gold, frame, scale, alpha * 0.2);

    // Fly approaching
    const flyT = interpolate(frame, [20, 80], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const flyX = width * 0.8 - flyT * width * 0.35;
    const flyY = fruitY - 20 * scale + flyT * 15 * scale + Math.sin(frame * 0.1) * 4 * scale;
    const [h, s, l] = cellHSL(6);
    drawFlyTop(ctx, flyX, flyY, 18 * scale, `hsla(${h},${s}%,${l}%,${alpha})`);

    // Brain inside fly head (small network, visible after landing)
    if (flyT > 0.7) {
      const brainAlpha = (flyT - 0.7) / 0.3;
      const rng = seeded(1071);
      for (let i = 0; i < 8; i++) {
        const a = rng() * Math.PI * 2;
        const d = (3 + rng() * 6) * scale;
        const nx = flyX + Math.cos(a) * d;
        const ny = flyY - 8 * scale + Math.sin(a) * d * 0.6;
        drawFBNode(ctx, nx, ny, 1.5 * scale, Math.floor(rng() * 8), alpha * brainAlpha * 0.8, frame);
      }
    }

    drawFBText(ctx, "FINE-TUNED BY NATURE", cx, height * 0.08, 11 * scale, alpha * 0.6, "center", FB.green);
  });

  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

/* ── V8: Timeline: single-cell → insect brain, sugar instinct forming ──
   Left to right progression: simple blob → complex brain, with "SUGAR" wiring appearing */
const V8: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, width, height, frame);
    const alpha = fadeInOut(frame, 150);
    const cy = height / 2;

    // Timeline arrow
    const arrowT = interpolate(frame, [0, 120], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const arrowEndX = width * 0.1 + arrowT * width * 0.8;
    ctx.globalAlpha = alpha * 0.3;
    ctx.strokeStyle = FB.text.dim;
    ctx.lineWidth = 1.5 * scale;
    ctx.setLineDash([3 * scale, 3 * scale]);
    ctx.beginPath();
    ctx.moveTo(width * 0.1, cy + 40 * scale);
    ctx.lineTo(arrowEndX, cy + 40 * scale);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.globalAlpha = 1;

    // Stage 1: single cell (far left)
    if (arrowT > 0) {
      drawFBNode(ctx, width * 0.15, cy, 6 * scale, 3, alpha, frame);
      drawFBText(ctx, "simple", width * 0.15, cy + 55 * scale, 8 * scale, alpha * 0.4, "center", FB.text.dim);
    }

    // Stage 2: small cluster (left-center)
    if (arrowT > 0.25) {
      const t = Math.min(1, (arrowT - 0.25) / 0.15);
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * Math.PI * 2;
        drawFBNode(ctx, width * 0.35 + Math.cos(a) * 10 * scale, cy + Math.sin(a) * 8 * scale, 4 * scale, i % 8, alpha * t, frame);
      }
    }

    // Stage 3: network (center-right)
    if (arrowT > 0.5) {
      const t = Math.min(1, (arrowT - 0.5) / 0.2);
      const rng = seeded(1080);
      for (let i = 0; i < 15; i++) {
        const a = rng() * Math.PI * 2;
        const d = (5 + rng() * 20) * scale;
        drawFBNode(ctx, width * 0.6 + Math.cos(a) * d, cy + Math.sin(a) * d * 0.7, 3 * scale, Math.floor(rng() * 8), alpha * t, frame);
      }
    }

    // Stage 4: full brain with gold sugar pathway (far right)
    if (arrowT > 0.75) {
      const t = Math.min(1, (arrowT - 0.75) / 0.2);
      const rng = seeded(1081);
      const bx = width * 0.85, by = cy;
      for (let i = 0; i < 20; i++) {
        const a = rng() * Math.PI * 2;
        const d = (5 + rng() * 25) * scale;
        const isPath = i < 5;
        drawFBNode(ctx, bx + Math.cos(a) * d, by + Math.sin(a) * d * 0.7, 3 * scale, isPath ? 3 : Math.floor(rng() * 8), alpha * t, frame);
      }
      drawFBText(ctx, "SUGAR", bx, by - 35 * scale, 10 * scale, alpha * t * 0.7, "center", FB.gold);
      drawFBText(ctx, "CRAVING", bx, by + 35 * scale, 9 * scale, alpha * t * 0.5, "center", FB.gold);
    }

    drawFBText(ctx, "50 MILLION YEARS OF EVOLUTION", width / 2, height * 0.1, 11 * scale, alpha * 0.6, "center", FB.text.accent);
  });

  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

/* ── V9: "I BROKE THAT" — intact brain shatters ──
   Beautiful brain network builds → red crack → pieces scatter. The twist. */
const V9: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;

  const nodes = useMemo(() => {
    const rng = seeded(1090);
    const cx = width / 2, cy = height / 2;
    return Array.from({ length: 40 }, () => {
      const a = rng() * Math.PI * 2;
      const d = Math.pow(rng(), 0.5) * 80 * scale;
      return {
        x: cx + Math.cos(a) * d * 1.3,
        y: cy + Math.sin(a) * d * 0.85,
        c: Math.floor(rng() * 8),
        vx: (rng() - 0.5) * 8, vy: (rng() - 0.5) * 8, // scatter velocity
      };
    });
  }, [width, height, scale]);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, width, height, frame);
    const alpha = fadeInOut(frame, 150);

    const breakFrame = 90;
    const isIntact = frame < breakFrame;
    const scatterT = isIntact ? 0 : interpolate(frame, [breakFrame, breakFrame + 30], [0, 1], { extrapolateRight: "clamp" });

    // Draw network
    for (let i = 1; i < nodes.length; i++) {
      const a = nodes[i - 1], b = nodes[i];
      const ax = a.x + (isIntact ? 0 : a.vx * scatterT * 20);
      const ay = a.y + (isIntact ? 0 : a.vy * scatterT * 20);
      const bx = b.x + (isIntact ? 0 : b.vx * scatterT * 20);
      const by = b.y + (isIntact ? 0 : b.vy * scatterT * 20);
      const edgeAlpha = isIntact ? 0.4 : 0.4 * (1 - scatterT);
      drawFBEdge(ctx, ax, ay, bx, by, scale, alpha * edgeAlpha, frame);
    }

    for (const n of nodes) {
      const nx = n.x + (isIntact ? 0 : n.vx * scatterT * 20);
      const ny = n.y + (isIntact ? 0 : n.vy * scatterT * 20);
      const nodeAlpha = isIntact ? 1 : 1 - scatterT * 0.7;
      drawFBNode(ctx, nx, ny, 4 * scale, isIntact ? n.c : 0, alpha * nodeAlpha, frame);
    }

    // Red flash on break
    if (frame >= breakFrame - 2 && frame <= breakFrame + 5) {
      const flashAlpha = 1 - Math.abs(frame - breakFrame) / 5;
      ctx.globalAlpha = flashAlpha * 0.3;
      ctx.fillStyle = FB.red;
      ctx.fillRect(0, 0, width, height);
      ctx.globalAlpha = 1;
    }

    // Red crack line
    if (frame >= breakFrame) {
      const crackT = interpolate(frame, [breakFrame, breakFrame + 10], [0, 1], { extrapolateRight: "clamp" });
      ctx.globalAlpha = alpha * crackT;
      ctx.strokeStyle = FB.red;
      ctx.lineWidth = 3 * scale;
      ctx.beginPath();
      ctx.moveTo(width * 0.3, height * 0.2);
      ctx.lineTo(width * 0.45, height * 0.45);
      ctx.lineTo(width * 0.55, height * 0.5);
      ctx.lineTo(width * 0.7, height * 0.8);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    // Labels
    if (isIntact) {
      const buildT = interpolate(frame, [5, 40], [0, 1], { extrapolateRight: "clamp" });
      drawFBText(ctx, "50 MILLION YEARS", width / 2, height * 0.08, 12 * scale, alpha * buildT * 0.7, "center", FB.text.accent);
    } else {
      drawFBText(ctx, "I BROKE THAT", width / 2, height * 0.9, 18 * scale, alpha * scatterT, "center", FB.red);
    }
  });

  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

export const VARIANTS_FB_001: VariantDef[] = [
  { id: "fb001-v1", label: "Nature → Brain", component: V1 },
  { id: "fb001-v2", label: "Sugar Craving", component: V2 },
  { id: "fb001-v3", label: "Sugar Pathway", component: V3 },
  { id: "fb001-v4", label: "Canopy Reveal", component: V4 },
  { id: "fb001-v5", label: "Fly Tastes Sugar", component: V5 },
  { id: "fb001-v6", label: "Nature vs Brain", component: V6 },
  { id: "fb001-v7", label: "Fly + Fruit", component: V7 },
  { id: "fb001-v8", label: "Evolution Timeline", component: V8 },
  { id: "fb001-v9", label: "I Broke That", component: V9 },
];
