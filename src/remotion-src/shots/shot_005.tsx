import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantDef, VariantProps } from "../types";
import { seeded, drawBg, makeParticles, drawParticles, PALETTE, fadeInOut } from "../scenes/theme";
import { drawNeuron } from "../icons";

// Shot 05 — "map every single connection inside an adult brain."
// 120 frames (4s). Brain shape filling with glowing neural connections.

// Helper: brain outline path — an ellipse with lobe bumps
function brainPath(ctx: CanvasRenderingContext2D, cx: number, cy: number, w: number, h: number) {
  ctx.beginPath();
  // Left hemisphere bulge
  ctx.ellipse(cx - w * 0.2, cy - h * 0.05, w * 0.42, h * 0.48, 0, 0, Math.PI * 2);
  ctx.closePath();
  ctx.beginPath();
  // Right hemisphere bulge
  ctx.ellipse(cx + w * 0.2, cy - h * 0.05, w * 0.42, h * 0.48, 0, 0, Math.PI * 2);
  ctx.closePath();
}

function drawBrainOutline(ctx: CanvasRenderingContext2D, cx: number, cy: number, w: number, h: number, color: string, lineWidth: number) {
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  // Left hemisphere
  ctx.beginPath();
  ctx.ellipse(cx - w * 0.15, cy - h * 0.02, w * 0.4, h * 0.46, -0.05, 0, Math.PI * 2);
  ctx.stroke();
  // Right hemisphere
  ctx.beginPath();
  ctx.ellipse(cx + w * 0.15, cy - h * 0.02, w * 0.4, h * 0.46, 0.05, 0, Math.PI * 2);
  ctx.stroke();
  // Cerebellum bump
  ctx.beginPath();
  ctx.ellipse(cx, cy + h * 0.35, w * 0.2, h * 0.14, 0, 0, Math.PI * 2);
  ctx.stroke();
}

function isInsideBrain(px: number, py: number, cx: number, cy: number, bw: number, bh: number): boolean {
  const lx = (px - (cx - bw * 0.15)) / (bw * 0.4);
  const ly = (py - (cy - bh * 0.02)) / (bh * 0.46);
  if (lx * lx + ly * ly < 1) return true;
  const rx = (px - (cx + bw * 0.15)) / (bw * 0.4);
  const ry = ly;
  if (rx * rx + ry * ry < 1) return true;
  const cbx = (px - cx) / (bw * 0.2);
  const cby = (py - (cy + bh * 0.35)) / (bh * 0.14);
  if (cbx * cbx + cby * cby < 1) return true;
  return false;
}

/* ── V1: Wireframe Brain ── */
const V1: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const particles = useMemo(() => makeParticles(20, width, height, scale), [width, height, scale]);
  const data = useMemo(() => {
    const rand = seeded(5001);
    const cx = width / 2, cy = height * 0.45;
    const brainW = width * 0.35, brainH = height * 0.35;
    const nodes: { x: number; y: number; hue: number }[] = [];
    for (let i = 0; i < 200; i++) {
      let nx: number, ny: number;
      do {
        nx = cx + (rand() - 0.5) * brainW * 2;
        ny = cy + (rand() - 0.5) * brainH * 2;
      } while (!isInsideBrain(nx, ny, cx, cy, brainW, brainH));
      nodes.push({ x: nx, y: ny, hue: PALETTE.cellColors[Math.floor(rand() * 8)][0] });
    }
    const edges: [number, number][] = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x, dy = nodes[i].y - nodes[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 28 * scale && rand() < 0.5) edges.push([i, j]);
      }
    }
    const featured = [0, 25, 80, 150, 190];
    return { nodes, edges, cx, cy, brainW, brainH, featured };
  }, [width, height, scale]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, particles, frame, scale);
    const fadeAlpha = fadeInOut(frame, 120);
    ctx.globalAlpha = fadeAlpha;
    // Phase 1: brain outline draws (0-25)
    const outlineProgress = interpolate(frame, [3, 25], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (outlineProgress > 0) {
      ctx.save();
      ctx.setLineDash([500 * outlineProgress, 500 * (1 - outlineProgress)]);
      drawBrainOutline(ctx, data.cx, data.cy, data.brainW, data.brainH, `hsla(280, 40%, 55%, 0.5)`, 1.5 * scale);
      ctx.setLineDash([]);
      ctx.restore();
    }
    // Phase 2: nodes appear (15-80)
    const nodeProgress = interpolate(frame, [15, 80], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const visibleNodes = Math.floor(nodeProgress * data.nodes.length);
    for (let i = 0; i < visibleNodes; i++) {
      const n = data.nodes[i];
      const isFeatured = data.featured.includes(i);
      if (isFeatured) {
        drawNeuron(ctx, n.x, n.y, 12 * scale, `hsla(${n.hue}, 60%, 65%, 0.9)`, frame);
      } else {
        ctx.fillStyle = `hsla(${n.hue}, 50%, 60%, 0.6)`;
        ctx.beginPath();
        ctx.arc(n.x, n.y, 1.5 * scale, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    // Phase 3: edges grow (30-100)
    const edgeProgress = interpolate(frame, [30, 100], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const visibleEdges = Math.floor(edgeProgress * data.edges.length);
    for (let i = 0; i < visibleEdges; i++) {
      const [a, b] = data.edges[i];
      if (a >= visibleNodes || b >= visibleNodes) continue;
      const na = data.nodes[a], nb = data.nodes[b];
      ctx.strokeStyle = `hsla(${(na.hue + nb.hue) / 2}, 40%, 55%, 0.18)`;
      ctx.lineWidth = 0.8 * scale;
      ctx.beginPath();
      ctx.moveTo(na.x, na.y);
      ctx.lineTo(nb.x, nb.y);
      ctx.stroke();
    }
    // Counter
    const countDisplay = Math.floor(interpolate(frame, [30, 100], [0, visibleEdges], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
    ctx.fillStyle = PALETTE.text.accent;
    ctx.font = `bold ${14 * scale}px monospace`;
    ctx.textAlign = "center";
    ctx.fillText(`${countDisplay} connections`, width / 2, height * 0.9);
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

/* ── V2: Node-Edge Assembly ── */
const V2: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const particles = useMemo(() => makeParticles(20, width, height, scale), [width, height, scale]);
  const data = useMemo(() => {
    const rand = seeded(5002);
    const cx = width / 2, cy = height * 0.45;
    const brainW = width * 0.32, brainH = height * 0.32;
    const nodes: { tx: number; ty: number; sx: number; sy: number; hue: number }[] = [];
    for (let i = 0; i < 120; i++) {
      let nx: number, ny: number;
      do {
        nx = cx + (rand() - 0.5) * brainW * 2;
        ny = cy + (rand() - 0.5) * brainH * 2;
      } while (!isInsideBrain(nx, ny, cx, cy, brainW, brainH));
      nodes.push({
        tx: nx, ty: ny,
        sx: rand() * width, sy: rand() * height,
        hue: PALETTE.cellColors[Math.floor(rand() * 8)][0],
      });
    }
    const edges: [number, number][] = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].tx - nodes[j].tx, dy = nodes[i].ty - nodes[j].ty;
        if (Math.sqrt(dx * dx + dy * dy) < 30 * scale && rand() < 0.4) edges.push([i, j]);
      }
    }
    return { nodes, edges, cx, cy, brainW, brainH };
  }, [width, height, scale]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, particles, frame, scale);
    const fadeAlpha = fadeInOut(frame, 120);
    ctx.globalAlpha = fadeAlpha;
    // Nodes fly into position (5-60)
    const flyProgress = interpolate(frame, [5, 60], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const eased = flyProgress * flyProgress * (3 - 2 * flyProgress); // smoothstep
    for (const n of data.nodes) {
      const x = n.sx + (n.tx - n.sx) * eased;
      const y = n.sy + (n.ty - n.sy) * eased;
      ctx.fillStyle = `hsla(${n.hue}, 55%, 60%, 0.7)`;
      ctx.beginPath();
      ctx.arc(x, y, 2 * scale, 0, Math.PI * 2);
      ctx.fill();
    }
    // Edges grow after settling (55-95)
    const edgeProgress = interpolate(frame, [55, 95], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const visEdges = Math.floor(edgeProgress * data.edges.length);
    for (let i = 0; i < visEdges; i++) {
      const [a, b] = data.edges[i];
      const na = data.nodes[a], nb = data.nodes[b];
      ctx.strokeStyle = `hsla(${(na.hue + nb.hue) / 2}, 35%, 50%, 0.2)`;
      ctx.lineWidth = 0.7 * scale;
      ctx.beginPath();
      ctx.moveTo(na.tx, na.ty);
      ctx.lineTo(nb.tx, nb.ty);
      ctx.stroke();
    }
    // Brain outline (faint)
    if (flyProgress > 0.5) {
      const outAlpha = interpolate(flyProgress, [0.5, 1], [0, 0.3], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      drawBrainOutline(ctx, data.cx, data.cy, data.brainW, data.brainH, `hsla(280, 35%, 50%, ${outAlpha})`, 1 * scale);
    }
    // Label fades in
    const labelAlpha = interpolate(frame, [80, 100], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (labelAlpha > 0) {
      ctx.globalAlpha = fadeAlpha * labelAlpha;
      ctx.fillStyle = PALETTE.text.accent;
      ctx.font = `bold ${13 * scale}px monospace`;
      ctx.textAlign = "center";
      ctx.fillText("138,639 neurons", width / 2, height * 0.88);
    }
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

/* ── V3: Connectome Heatmap ── */
const V3: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const particles = useMemo(() => makeParticles(15, width, height, scale), [width, height, scale]);
  const data = useMemo(() => {
    const rand = seeded(5003);
    const cx = width / 2, cy = height * 0.43;
    const brainW = width * 0.3, brainH = height * 0.3;
    const regions: { x: number; y: number; rx: number; ry: number; density: number; label: string; delay: number }[] = [];
    const labels = ["MB", "AL", "LH", "AOTU", "CX", "PB", "FB", "EB", "NO", "LAL", "SIP", "SLP", "ICL", "SCL", "IB", "SMP", "CRE", "LO", "ME", "AME"];
    for (let i = 0; i < 20; i++) {
      let rx: number, ry: number;
      do {
        rx = cx + (rand() - 0.5) * brainW * 1.6;
        ry = cy + (rand() - 0.5) * brainH * 1.6;
      } while (!isInsideBrain(rx, ry, cx, cy, brainW, brainH));
      regions.push({
        x: rx, y: ry,
        rx: (8 + rand() * 8) * scale,
        ry: (6 + rand() * 6) * scale,
        density: 0.2 + rand() * 0.8,
        label: labels[i],
        delay: i * 4,
      });
    }
    return { regions, cx, cy, brainW, brainH };
  }, [width, height, scale]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, particles, frame, scale);
    const fadeAlpha = fadeInOut(frame, 120);
    ctx.globalAlpha = fadeAlpha;
    // Brain outline
    drawBrainOutline(ctx, data.cx, data.cy, data.brainW, data.brainH, `hsla(280, 30%, 45%, 0.35)`, 1.2 * scale);
    // Regions light up one by one
    for (const region of data.regions) {
      const regionAlpha = interpolate(frame, [10 + region.delay, 20 + region.delay], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      if (regionAlpha <= 0) continue;
      // Heat color: low density = violet, high = gold
      const hue = interpolate(region.density, [0, 1], [280, 45], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const lit = interpolate(region.density, [0, 1], [35, 65], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      // Glow
      const glow = ctx.createRadialGradient(region.x, region.y, 0, region.x, region.y, region.rx * 1.5);
      glow.addColorStop(0, `hsla(${hue}, 60%, ${lit}%, ${regionAlpha * 0.6})`);
      glow.addColorStop(1, `hsla(${hue}, 50%, ${lit}%, 0)`);
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.ellipse(region.x, region.y, region.rx * 1.5, region.ry * 1.5, 0, 0, Math.PI * 2);
      ctx.fill();
      // Core
      ctx.fillStyle = `hsla(${hue}, 55%, ${lit}%, ${regionAlpha * 0.7})`;
      ctx.beginPath();
      ctx.ellipse(region.x, region.y, region.rx, region.ry, 0, 0, Math.PI * 2);
      ctx.fill();
      // Label
      if (regionAlpha > 0.5) {
        ctx.fillStyle = `rgba(255,255,255,${regionAlpha * 0.6})`;
        ctx.font = `${6 * scale}px monospace`;
        ctx.textAlign = "center";
        ctx.fillText(region.label, region.x, region.y + region.ry + 7 * scale);
      }
    }
    // Legend bar
    const legendY = height * 0.88;
    const legendW = width * 0.4;
    const legendX = (width - legendW) / 2;
    const legendGrad = ctx.createLinearGradient(legendX, 0, legendX + legendW, 0);
    legendGrad.addColorStop(0, `hsla(280, 50%, 40%, 0.6)`);
    legendGrad.addColorStop(1, `hsla(45, 70%, 60%, 0.6)`);
    ctx.fillStyle = legendGrad;
    ctx.fillRect(legendX, legendY, legendW, 4 * scale);
    ctx.fillStyle = PALETTE.text.dim;
    ctx.font = `${7 * scale}px system-ui`;
    ctx.textAlign = "left";
    ctx.fillText("low", legendX, legendY - 3 * scale);
    ctx.textAlign = "right";
    ctx.fillText("high", legendX + legendW, legendY - 3 * scale);
    ctx.textAlign = "center";
    ctx.fillText("connection density", width / 2, legendY + 12 * scale);
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

/* ── V4: Neural Highways ── */
const V4: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const particles = useMemo(() => makeParticles(18, width, height, scale), [width, height, scale]);
  const data = useMemo(() => {
    const rand = seeded(5004);
    const cx = width / 2, cy = height * 0.43;
    const brainW = width * 0.32, brainH = height * 0.32;
    const highways = [
      { points: [{x: cx - brainW*0.3, y: cy - brainH*0.2}, {x: cx, y: cy - brainH*0.1}, {x: cx + brainW*0.3, y: cy - brainH*0.15}], color: PALETTE.accent.gold, label: "antennal lobe tract", branches: 4 },
      { points: [{x: cx - brainW*0.2, y: cy + brainH*0.1}, {x: cx, y: cy}, {x: cx + brainW*0.35, y: cy + brainH*0.05}], color: PALETTE.accent.blue, label: "mushroom body", branches: 5 },
      { points: [{x: cx, y: cy - brainH*0.35}, {x: cx - brainW*0.1, y: cy}, {x: cx, y: cy + brainH*0.35}], color: PALETTE.accent.green, label: "central complex", branches: 3 },
      { points: [{x: cx - brainW*0.35, y: cy}, {x: cx - brainW*0.1, y: cy - brainH*0.15}, {x: cx + brainW*0.1, y: cy + brainH*0.15}], color: PALETTE.accent.red, label: "optic lobe", branches: 4 },
      { points: [{x: cx + brainW*0.1, y: cy - brainH*0.3}, {x: cx + brainW*0.15, y: cy}, {x: cx - brainW*0.1, y: cy + brainH*0.3}], color: `hsla(180, 55%, 55%, 0.8)`, label: "descending neurons", branches: 3 },
    ];
    // Generate branch points for each highway
    const branchData: { hwyIdx: number; startFrac: number; endX: number; endY: number }[] = [];
    for (let h = 0; h < highways.length; h++) {
      for (let b = 0; b < highways[h].branches; b++) {
        const frac = 0.2 + rand() * 0.6;
        const angle = (rand() - 0.5) * Math.PI * 0.8;
        const len = (10 + rand() * 15) * scale;
        const pts = highways[h].points;
        const midIdx = Math.min(pts.length - 2, Math.floor(frac * (pts.length - 1)));
        const baseX = pts[midIdx].x + (pts[midIdx + 1].x - pts[midIdx].x) * (frac * (pts.length - 1) - midIdx);
        const baseY = pts[midIdx].y + (pts[midIdx + 1].y - pts[midIdx].y) * (frac * (pts.length - 1) - midIdx);
        branchData.push({ hwyIdx: h, startFrac: frac, endX: baseX + Math.cos(angle) * len, endY: baseY + Math.sin(angle) * len });
      }
    }
    return { highways, branchData, cx, cy, brainW, brainH };
  }, [width, height, scale]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, particles, frame, scale);
    const fadeAlpha = fadeInOut(frame, 120);
    ctx.globalAlpha = fadeAlpha;
    drawBrainOutline(ctx, data.cx, data.cy, data.brainW, data.brainH, `hsla(280, 25%, 40%, 0.3)`, 1 * scale);
    // Draw highways with staggered timing
    data.highways.forEach((hwy, hIdx) => {
      const drawStart = 8 + hIdx * 15;
      const drawEnd = drawStart + 25;
      const progress = interpolate(frame, [drawStart, drawEnd], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      if (progress <= 0) return;
      ctx.strokeStyle = hwy.color;
      ctx.lineWidth = 2.5 * scale;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.beginPath();
      const pts = hwy.points;
      ctx.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < pts.length; i++) {
        const segProgress = interpolate(progress, [(i - 1) / (pts.length - 1), i / (pts.length - 1)], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        if (segProgress <= 0) break;
        const targetX = pts[i - 1].x + (pts[i].x - pts[i - 1].x) * segProgress;
        const targetY = pts[i - 1].y + (pts[i].y - pts[i - 1].y) * segProgress;
        ctx.lineTo(targetX, targetY);
      }
      ctx.stroke();
      // Branches sprout after main path is partly drawn
      if (progress > 0.4) {
        const branchAlpha = interpolate(progress, [0.4, 0.9], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        ctx.strokeStyle = hwy.color.replace(/[\d.]+\)$/, `${branchAlpha * 0.5})`);
        ctx.lineWidth = 1 * scale;
        for (const br of data.branchData.filter(b => b.hwyIdx === hIdx)) {
          const bPts = hwy.points;
          const midIdx = Math.min(bPts.length - 2, Math.floor(br.startFrac * (bPts.length - 1)));
          const localFrac = br.startFrac * (bPts.length - 1) - midIdx;
          const baseX = bPts[midIdx].x + (bPts[midIdx + 1].x - bPts[midIdx].x) * localFrac;
          const baseY = bPts[midIdx].y + (bPts[midIdx + 1].y - bPts[midIdx].y) * localFrac;
          ctx.beginPath();
          ctx.moveTo(baseX, baseY);
          ctx.lineTo(baseX + (br.endX - baseX) * branchAlpha, baseY + (br.endY - baseY) * branchAlpha);
          ctx.stroke();
        }
      }
      // Label
      if (progress > 0.8) {
        const labelAlpha = interpolate(progress, [0.8, 1], [0, 0.7], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        ctx.fillStyle = `rgba(255,255,255,${labelAlpha})`;
        ctx.font = `${6.5 * scale}px system-ui`;
        ctx.textAlign = "center";
        const lastPt = pts[pts.length - 1];
        ctx.fillText(hwy.label, lastPt.x, lastPt.y - 6 * scale);
      }
    });
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

/* ── V5: Trace Growth ── */
const V5: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const particles = useMemo(() => makeParticles(18, width, height, scale), [width, height, scale]);
  const data = useMemo(() => {
    const rand = seeded(5005);
    const cx = width / 2, cy = height * 0.45;
    const brainW = width * 0.32, brainH = height * 0.32;
    // BFS tree: start from center neuron, branch outward
    const nodes: { x: number; y: number; hue: number; parent: number; depth: number }[] = [];
    nodes.push({ x: cx, y: cy, hue: PALETTE.cellColors[6][0], parent: -1, depth: 0 });
    let frontier = [0];
    for (let depth = 1; depth < 9 && nodes.length < 150; depth++) {
      const nextFrontier: number[] = [];
      for (const fi of frontier) {
        const branchCount = depth < 3 ? 3 : depth < 5 ? 2 : 1;
        for (let b = 0; b < branchCount && nodes.length < 150; b++) {
          const angle = rand() * Math.PI * 2;
          const dist = (12 + rand() * 10) * scale;
          const nx = nodes[fi].x + Math.cos(angle) * dist;
          const ny = nodes[fi].y + Math.sin(angle) * dist;
          if (isInsideBrain(nx, ny, cx, cy, brainW, brainH)) {
            const idx = nodes.length;
            nodes.push({ x: nx, y: ny, hue: PALETTE.cellColors[Math.floor(rand() * 8)][0], parent: fi, depth });
            nextFrontier.push(idx);
          }
        }
      }
      frontier = nextFrontier;
    }
    return { nodes, cx, cy, brainW, brainH };
  }, [width, height, scale]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, particles, frame, scale);
    const fadeAlpha = fadeInOut(frame, 120);
    ctx.globalAlpha = fadeAlpha;
    drawBrainOutline(ctx, data.cx, data.cy, data.brainW, data.brainH, `hsla(280, 25%, 40%, 0.2)`, 1 * scale);
    // Grow tree over time
    const growProgress = interpolate(frame, [5, 100], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const maxDepthShown = interpolate(growProgress, [0, 1], [0, 9], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    for (let i = 0; i < data.nodes.length; i++) {
      const n = data.nodes[i];
      if (n.depth > maxDepthShown) continue;
      const depthFrac = n.depth / 9;
      const nodeAlpha = interpolate(maxDepthShown - n.depth, [0, 1], [0.3, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      // Draw edge to parent
      if (n.parent >= 0) {
        const parent = data.nodes[n.parent];
        const edgeGrow = interpolate(maxDepthShown - n.depth, [0, 0.5], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        if (edgeGrow > 0) {
          ctx.strokeStyle = `hsla(${n.hue}, 40%, 50%, ${nodeAlpha * 0.35})`;
          ctx.lineWidth = Math.max(0.5, (1.5 - depthFrac) * scale);
          ctx.beginPath();
          ctx.moveTo(parent.x, parent.y);
          ctx.lineTo(parent.x + (n.x - parent.x) * edgeGrow, parent.y + (n.y - parent.y) * edgeGrow);
          ctx.stroke();
        }
      }
      // Draw node
      if (nodeAlpha > 0) {
        const nodeSize = (3 - depthFrac * 2) * scale;
        if (i === 0) {
          drawNeuron(ctx, n.x, n.y, 14 * scale, `hsla(${n.hue}, 60%, 65%, ${nodeAlpha})`, frame);
        } else {
          ctx.fillStyle = `hsla(${n.hue}, 55%, 60%, ${nodeAlpha * 0.8})`;
          ctx.beginPath();
          ctx.arc(n.x, n.y, nodeSize, 0, Math.PI * 2);
          ctx.fill();
          // Bright flash for newly appearing nodes
          if (maxDepthShown - n.depth < 0.3 && maxDepthShown - n.depth > 0) {
            const flash = 1 - (maxDepthShown - n.depth) / 0.3;
            ctx.fillStyle = `hsla(${n.hue}, 70%, 80%, ${flash * 0.5})`;
            ctx.beginPath();
            ctx.arc(n.x, n.y, nodeSize * 3, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
    }
    // Text
    const textAlpha = interpolate(frame, [85, 105], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (textAlpha > 0) {
      ctx.globalAlpha = fadeAlpha * textAlpha;
      ctx.fillStyle = PALETTE.text.dim;
      ctx.font = `${10 * scale}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText("every connection traced", width / 2, height * 0.9);
    }
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

/* ── V6: Connection Counter ── */
const V6: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const particles = useMemo(() => makeParticles(15, width, height, scale), [width, height, scale]);
  const data = useMemo(() => {
    const rand = seeded(5006);
    const cx = width / 2, cy = height * 0.45;
    const brainW = width * 0.32, brainH = height * 0.32;
    const connections: { x1: number; y1: number; x2: number; y2: number; hue: number }[] = [];
    for (let i = 0; i < 400; i++) {
      let x1: number, y1: number, x2: number, y2: number;
      do { x1 = cx + (rand() - 0.5) * brainW * 2; y1 = cy + (rand() - 0.5) * brainH * 2; } while (!isInsideBrain(x1, y1, cx, cy, brainW, brainH));
      do { x2 = cx + (rand() - 0.5) * brainW * 2; y2 = cy + (rand() - 0.5) * brainH * 2; } while (!isInsideBrain(x2, y2, cx, cy, brainW, brainH));
      connections.push({ x1, y1, x2, y2, hue: PALETTE.cellColors[Math.floor(rand() * 8)][0] });
    }
    return { connections, cx, cy, brainW, brainH };
  }, [width, height, scale]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, particles, frame, scale);
    const fadeAlpha = fadeInOut(frame, 120);
    ctx.globalAlpha = fadeAlpha;
    drawBrainOutline(ctx, data.cx, data.cy, data.brainW, data.brainH, `hsla(280, 30%, 45%, 0.35)`, 1.2 * scale);
    // Connections appear, accelerating (exponential)
    const rawProgress = interpolate(frame, [8, 105], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const accelerated = rawProgress * rawProgress * rawProgress; // cubic acceleration
    const visibleCount = Math.floor(accelerated * data.connections.length);
    for (let i = 0; i < visibleCount; i++) {
      const c = data.connections[i];
      const lineAlpha = 0.04 + (1 - i / data.connections.length) * 0.08;
      ctx.strokeStyle = `hsla(${c.hue}, 35%, 50%, ${lineAlpha})`;
      ctx.lineWidth = 0.6 * scale;
      ctx.beginPath();
      ctx.moveTo(c.x1, c.y1);
      ctx.lineTo(c.x2, c.y2);
      ctx.stroke();
    }
    // Counter — maps to 15 million
    const counterVal = Math.floor(accelerated * 15091983);
    const counterStr = counterVal.toLocaleString();
    ctx.fillStyle = PALETTE.text.accent;
    ctx.font = `bold ${16 * scale}px monospace`;
    ctx.textAlign = "right";
    ctx.fillText(counterStr, width * 0.9, height * 0.15);
    ctx.fillStyle = PALETTE.text.dim;
    ctx.font = `${8 * scale}px system-ui`;
    ctx.fillText("synapses mapped", width * 0.9, height * 0.15 + 14 * scale);
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

/* ── V7: Cell Mosaic ── */
const V7: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const particles = useMemo(() => makeParticles(15, width, height, scale), [width, height, scale]);
  const data = useMemo(() => {
    const rand = seeded(5007);
    const cx = width / 2, cy = height * 0.43;
    const brainW = width * 0.32, brainH = height * 0.32;
    const hexSize = 8 * scale;
    const hexes: { x: number; y: number; hue: number; delay: number }[] = [];
    // Generate hex grid inside brain
    const rowH = hexSize * 1.5;
    const colW = hexSize * Math.sqrt(3);
    for (let row = -12; row < 12; row++) {
      for (let col = -12; col < 12; col++) {
        const hx = cx + col * colW + (row % 2 ? colW / 2 : 0);
        const hy = cy + row * rowH;
        if (isInsideBrain(hx, hy, cx, cy, brainW, brainH)) {
          const dist = Math.sqrt((hx - cx) ** 2 + (hy - cy) ** 2);
          hexes.push({ x: hx, y: hy, hue: PALETTE.cellColors[Math.floor(rand() * 8)][0], delay: dist / (2 * scale) + rand() * 8 });
        }
      }
    }
    hexes.sort((a, b) => a.delay - b.delay);
    return { hexes, cx, cy, brainW, brainH, hexSize };
  }, [width, height, scale]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, particles, frame, scale);
    const fadeAlpha = fadeInOut(frame, 120);
    ctx.globalAlpha = fadeAlpha;
    const maxDelay = data.hexes.length > 0 ? data.hexes[data.hexes.length - 1].delay : 1;
    for (const hex of data.hexes) {
      const normalizedDelay = hex.delay / maxDelay;
      const appearFrame = 5 + normalizedDelay * 80;
      const popProgress = interpolate(frame, [appearFrame, appearFrame + 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      if (popProgress <= 0) continue;
      // Pop-in overshoot
      const popScale = popProgress < 0.7
        ? interpolate(popProgress, [0, 0.7], [0, 1.2], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
        : interpolate(popProgress, [0.7, 1], [1.2, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const r = data.hexSize * popScale;
      // Draw hexagon
      ctx.fillStyle = `hsla(${hex.hue}, 40%, 45%, ${popProgress * 0.5})`;
      ctx.strokeStyle = `hsla(${hex.hue}, 50%, 55%, ${popProgress * 0.4})`;
      ctx.lineWidth = 0.8 * scale;
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = Math.PI / 6 + (i * Math.PI) / 3;
        const px = hex.x + r * Math.cos(angle);
        const py = hex.y + r * Math.sin(angle);
        i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      // Brief glow for newly appearing
      if (popProgress < 0.5) {
        const glowAlpha = (1 - popProgress / 0.5) * 0.3;
        ctx.fillStyle = `hsla(${hex.hue}, 60%, 70%, ${glowAlpha})`;
        ctx.beginPath();
        ctx.arc(hex.x, hex.y, r * 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    // Label
    const labelAlpha = interpolate(frame, [90, 108], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = fadeAlpha * labelAlpha;
    ctx.fillStyle = PALETTE.text.dim;
    ctx.font = `${10 * scale}px system-ui`;
    ctx.textAlign = "center";
    ctx.fillText("every cell, every connection", width / 2, height * 0.9);
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

/* ── V8: Layered Reveal ── */
const V8: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const particles = useMemo(() => makeParticles(15, width, height, scale), [width, height, scale]);
  const data = useMemo(() => {
    const rand = seeded(5008);
    const cx = width / 2, cy = height * 0.45;
    const brainW = width * 0.3, brainH = height * 0.28;
    const layers = [
      { offsetX: -8 * scale, offsetY: -8 * scale, alpha: 0.35, label: "back", hueShift: 40 },
      { offsetX: 0, offsetY: 0, alpha: 0.5, label: "mid", hueShift: 0 },
      { offsetX: 8 * scale, offsetY: 8 * scale, alpha: 0.7, label: "front", hueShift: -40 },
    ];
    const layerNodes: { x: number; y: number; hue: number }[][] = [];
    for (let l = 0; l < 3; l++) {
      const nodes: { x: number; y: number; hue: number }[] = [];
      for (let i = 0; i < 60; i++) {
        let nx: number, ny: number;
        do {
          nx = cx + (rand() - 0.5) * brainW * 2;
          ny = cy + (rand() - 0.5) * brainH * 2;
        } while (!isInsideBrain(nx, ny, cx, cy, brainW, brainH));
        nodes.push({ x: nx, y: ny, hue: PALETTE.cellColors[Math.floor(rand() * 8)][0] + layers[l].hueShift });
      }
      layerNodes.push(nodes);
    }
    return { layers, layerNodes, cx, cy, brainW, brainH };
  }, [width, height, scale]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, particles, frame, scale);
    const fadeAlpha = fadeInOut(frame, 120);
    // Draw each layer with parallax
    for (let l = 0; l < 3; l++) {
      const layer = data.layers[l];
      const layerStart = 5 + l * 20;
      const layerEnd = layerStart + 40;
      const fillProgress = interpolate(frame, [layerStart, layerEnd], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      if (fillProgress <= 0) continue;
      const parallaxShift = Math.sin(frame * 0.02) * (l - 1) * 3 * scale;
      const ox = layer.offsetX + parallaxShift;
      const oy = layer.offsetY;
      ctx.globalAlpha = fadeAlpha * layer.alpha;
      // Brain outline for layer
      drawBrainOutline(ctx, data.cx + ox, data.cy + oy, data.brainW, data.brainH, `hsla(${280 + layer.hueShift}, 30%, 50%, 0.25)`, 0.8 * scale);
      // Nodes
      const visCount = Math.floor(fillProgress * data.layerNodes[l].length);
      for (let i = 0; i < visCount; i++) {
        const n = data.layerNodes[l][i];
        ctx.fillStyle = `hsla(${n.hue}, 50%, 60%, 0.7)`;
        ctx.beginPath();
        ctx.arc(n.x + ox, n.y + oy, 2 * scale, 0, Math.PI * 2);
        ctx.fill();
      }
      // Edges between nearby nodes
      if (fillProgress > 0.3) {
        const edgeAlpha = interpolate(fillProgress, [0.3, 0.8], [0, 0.15], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        for (let i = 0; i < visCount; i++) {
          for (let j = i + 1; j < Math.min(visCount, i + 5); j++) {
            const a = data.layerNodes[l][i], b = data.layerNodes[l][j];
            const dist = Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
            if (dist < 25 * scale) {
              ctx.strokeStyle = `hsla(${(a.hue + b.hue) / 2}, 35%, 50%, ${edgeAlpha})`;
              ctx.lineWidth = 0.5 * scale;
              ctx.beginPath();
              ctx.moveTo(a.x + ox, a.y + oy);
              ctx.lineTo(b.x + ox, b.y + oy);
              ctx.stroke();
            }
          }
        }
      }
      // Layer label
      if (fillProgress > 0.6) {
        ctx.fillStyle = PALETTE.text.dim;
        ctx.font = `${7 * scale}px system-ui`;
        ctx.textAlign = "left";
        ctx.fillText(layer.label, data.cx + data.brainW * 0.5 + ox, data.cy + oy);
      }
    }
    ctx.globalAlpha = fadeAlpha;
    ctx.fillStyle = PALETTE.text.dim;
    ctx.font = `${10 * scale}px system-ui`;
    ctx.textAlign = "center";
    ctx.fillText("depth-resolved mapping", width / 2, height * 0.92);
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

/* ── V9: Synaptic Sparks ── */
const V9: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const particles = useMemo(() => makeParticles(15, width, height, scale), [width, height, scale]);
  const data = useMemo(() => {
    const rand = seeded(5009);
    const cx = width / 2, cy = height * 0.45;
    const brainW = width * 0.33, brainH = height * 0.33;
    const sparks: { x: number; y: number; hue: number; fireFrame: number }[] = [];
    for (let i = 0; i < 250; i++) {
      let sx: number, sy: number;
      do {
        sx = cx + (rand() - 0.5) * brainW * 2;
        sy = cy + (rand() - 0.5) * brainH * 2;
      } while (!isInsideBrain(sx, sy, cx, cy, brainW, brainH));
      sparks.push({ x: sx, y: sy, hue: PALETTE.cellColors[Math.floor(rand() * 8)][0], fireFrame: 3 + rand() * 95 });
    }
    sparks.sort((a, b) => a.fireFrame - b.fireFrame);
    return { sparks, cx, cy, brainW, brainH };
  }, [width, height, scale]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, particles, frame, scale);
    const fadeAlpha = fadeInOut(frame, 120);
    ctx.globalAlpha = fadeAlpha;
    // Dark brain outline
    drawBrainOutline(ctx, data.cx, data.cy, data.brainW, data.brainH, `hsla(280, 25%, 35%, 0.4)`, 1.5 * scale);
    // Sparks fire and leave nodes behind
    let activeCount = 0;
    for (const spark of data.sparks) {
      const timeSinceFire = frame - spark.fireFrame;
      if (timeSinceFire < 0) continue;
      activeCount++;
      // Flash phase (0-6 frames)
      if (timeSinceFire < 6) {
        const flashIntensity = 1 - timeSinceFire / 6;
        // Bright spark flash
        ctx.fillStyle = `hsla(${spark.hue}, 70%, 85%, ${flashIntensity * 0.9})`;
        ctx.beginPath();
        ctx.arc(spark.x, spark.y, (4 + flashIntensity * 6) * scale, 0, Math.PI * 2);
        ctx.fill();
        // Radiating glow
        const glowGrad = ctx.createRadialGradient(spark.x, spark.y, 0, spark.x, spark.y, 12 * scale * flashIntensity);
        glowGrad.addColorStop(0, `hsla(${spark.hue}, 80%, 80%, ${flashIntensity * 0.4})`);
        glowGrad.addColorStop(1, `hsla(${spark.hue}, 60%, 60%, 0)`);
        ctx.fillStyle = glowGrad;
        ctx.beginPath();
        ctx.arc(spark.x, spark.y, 12 * scale, 0, Math.PI * 2);
        ctx.fill();
      }
      // Residual node (persists after flash)
      const residualAlpha = Math.min(1, timeSinceFire / 6) * 0.5;
      ctx.fillStyle = `hsla(${spark.hue}, 45%, 55%, ${residualAlpha})`;
      ctx.beginPath();
      ctx.arc(spark.x, spark.y, 1.5 * scale, 0, Math.PI * 2);
      ctx.fill();
      // Connect to nearby existing nodes (within 20px)
      if (timeSinceFire > 3) {
        for (const other of data.sparks) {
          if (other === spark) continue;
          if (frame - other.fireFrame < 3) continue;
          const dx = spark.x - other.x, dy = spark.y - other.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 22 * scale && dist > 3 * scale) {
            ctx.strokeStyle = `hsla(${(spark.hue + other.hue) / 2}, 35%, 50%, 0.06)`;
            ctx.lineWidth = 0.4 * scale;
            ctx.beginPath();
            ctx.moveTo(spark.x, spark.y);
            ctx.lineTo(other.x, other.y);
            ctx.stroke();
            break; // Only one edge per node for performance
          }
        }
      }
    }
    // Counter
    ctx.fillStyle = PALETTE.text.accent;
    ctx.font = `bold ${12 * scale}px monospace`;
    ctx.textAlign = "center";
    ctx.fillText(`${activeCount} / 138,639`, width / 2, height * 0.9);
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

export const VARIANTS_SHOT_005: VariantDef[] = [
  { id: "wireframe-brain", label: "Wireframe Brain", component: V1 },
  { id: "node-edge-assembly", label: "Node-Edge Assembly", component: V2 },
  { id: "connectome-heatmap", label: "Connectome Heatmap", component: V3 },
  { id: "neural-highways", label: "Neural Highways", component: V4 },
  { id: "trace-growth", label: "Trace Growth", component: V5 },
  { id: "connection-counter", label: "Connection Counter", component: V6 },
  { id: "cell-mosaic", label: "Cell Mosaic", component: V7 },
  { id: "layered-reveal", label: "Layered Reveal", component: V8 },
  { id: "synaptic-sparks", label: "Synaptic Sparks", component: V9 },
];
