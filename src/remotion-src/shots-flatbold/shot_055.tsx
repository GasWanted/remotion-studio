import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantDef, VariantProps } from "../types";
import { FB, seeded, drawFBBg, drawFBNode, drawFBEdge, drawFBText, drawFBCounter, fadeInOut, cellHSL, drawFBColorEdge } from "./flatbold-kit";

/* Shot 55 — "I built a gauntlet. Every fork in the road is a choice between food and danger." — 150 frames */

// ---------- V1: Path splits repeatedly — yellow left, red right ----------
const V1: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 150);
    // Three forks
    const forks = [
      { x: W * 0.2, y: H * 0.2, topY: H * 0.1, botY: H * 0.35 },
      { x: W * 0.5, y: H * 0.35, topY: H * 0.22, botY: H * 0.52 },
      { x: W * 0.8, y: H * 0.52, topY: H * 0.4, botY: H * 0.68 },
    ];
    for (let i = 0; i < forks.length; i++) {
      const f = forks[i];
      const fp = interpolate(frame, [10 + i * 25, 35 + i * 25], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      // Main path
      ctx.globalAlpha = a * fp * 0.2; ctx.strokeStyle = FB.text.dim; ctx.lineWidth = 2;
      if (i === 0) {
        ctx.beginPath(); ctx.moveTo(0, f.y); ctx.lineTo(f.x, f.y); ctx.stroke();
      }
      // Fork — upper (food, yellow)
      ctx.strokeStyle = FB.gold; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(f.x, f.y); ctx.lineTo(f.x + W * 0.15, f.topY); ctx.stroke();
      drawFBNode(ctx, f.x + W * 0.15, f.topY, 5, 2, a * fp, frame);
      // Fork — lower (danger, red)
      ctx.strokeStyle = FB.red; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(f.x, f.y); ctx.lineTo(f.x + W * 0.15, f.botY); ctx.stroke();
      drawFBNode(ctx, f.x + W * 0.15, f.botY, 5, 0, a * fp, frame);
      // Fork dot
      drawFBNode(ctx, f.x, f.y, 4, 5, a * fp, frame);
    }
    // Legend
    const legP = interpolate(frame, [80, 110], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBNode(ctx, W * 0.15, H * 0.82, 4, 2, a * legP, frame);
    drawFBText(ctx, "food", W * 0.15 + 10, H * 0.82, 9, a * legP, "left", FB.gold);
    drawFBNode(ctx, W * 0.55, H * 0.82, 4, 0, a * legP, frame);
    drawFBText(ctx, "danger", W * 0.55 + 10, H * 0.82, 9, a * legP, "left", FB.red);
    drawFBText(ctx, "GAUNTLET", W / 2, H * 0.92, 12, a, "center", FB.text.primary);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V2: Top-down maze corridor — left/right choices staggered ----------
const V2: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 150);
    // Central corridor
    const corrW = W * 0.12;
    ctx.globalAlpha = a * 0.08; ctx.fillStyle = FB.text.dim;
    ctx.fillRect(W / 2 - corrW / 2, 0, corrW, H * 0.85);
    // Choice points
    const choices = [
      { y: H * 0.12, foodSide: -1 },
      { y: H * 0.32, foodSide: 1 },
      { y: H * 0.52, foodSide: -1 },
      { y: H * 0.72, foodSide: 1 },
    ];
    for (let i = 0; i < choices.length; i++) {
      const c = choices[i];
      const cp = interpolate(frame, [10 + i * 18, 30 + i * 18], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      // Side branches
      const foodX = W / 2 + c.foodSide * W * 0.25;
      const dangerX = W / 2 - c.foodSide * W * 0.25;
      // Food branch
      ctx.globalAlpha = a * cp * 0.15; ctx.strokeStyle = FB.gold; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(W / 2, c.y); ctx.lineTo(foodX, c.y); ctx.stroke();
      drawFBNode(ctx, foodX, c.y, 6, 2, a * cp, frame);
      // Danger branch
      ctx.strokeStyle = FB.red;
      ctx.beginPath(); ctx.moveTo(W / 2, c.y); ctx.lineTo(dangerX, c.y); ctx.stroke();
      drawFBNode(ctx, dangerX, c.y, 6, 0, a * cp, frame);
    }
    drawFBText(ctx, "GAUNTLET", W / 2, H * 0.92, 12, a, "center", FB.gold);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V3: Binary tree — each split has food node and danger node ----------
const V3: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 150);
    // Binary tree: root → 2 → 4 → 8 leaves
    const levels = 3;
    const nodesByLevel: { x: number; y: number }[][] = [];
    // Build positions
    nodesByLevel[0] = [{ x: W / 2, y: H * 0.08 }];
    for (let lvl = 1; lvl <= levels; lvl++) {
      nodesByLevel[lvl] = [];
      const parent = nodesByLevel[lvl - 1];
      const spread = W * 0.35 / lvl;
      for (const p of parent) {
        nodesByLevel[lvl].push({ x: p.x - spread, y: H * (0.08 + lvl * 0.22) });
        nodesByLevel[lvl].push({ x: p.x + spread, y: H * (0.08 + lvl * 0.22) });
      }
    }
    // Draw edges then nodes per level
    for (let lvl = 0; lvl <= levels; lvl++) {
      const lvlP = interpolate(frame, [5 + lvl * 20, 25 + lvl * 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      for (let i = 0; i < nodesByLevel[lvl].length; i++) {
        const n = nodesByLevel[lvl][i];
        // Edge to parent
        if (lvl > 0) {
          const pi = Math.floor(i / 2);
          const p = nodesByLevel[lvl - 1][pi];
          ctx.globalAlpha = a * lvlP * 0.15;
          ctx.strokeStyle = i % 2 === 0 ? FB.gold : FB.red; ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(p.x, p.y + 6); ctx.lineTo(n.x, n.y - 6); ctx.stroke();
        }
        // Node
        const isFood = lvl === 0 ? true : i % 2 === 0;
        drawFBNode(ctx, n.x, n.y, lvl === levels ? 5 : 4, isFood ? 2 : 0, a * lvlP, frame);
      }
    }
    drawFBText(ctx, "every fork: food or danger", W / 2, H * 0.88, 9, a, "center", FB.text.dim);
    drawFBText(ctx, "GAUNTLET", W / 2, H * 0.95, 10, a, "center", FB.gold);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V4: Horizontal gauntlet — fly walks right, obstacles alternate ----------
const V4: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 150);
    const cy = H * 0.42;
    // Central corridor
    ctx.globalAlpha = a * 0.06; ctx.fillStyle = FB.text.dim;
    ctx.fillRect(0, cy - 15, W, 30);
    // Obstacles: alternating food (gold circles) and danger (red circles)
    for (let i = 0; i < 6; i++) {
      const ox = W * 0.12 + i * W * 0.14;
      const isFood = i % 2 === 0;
      const side = isFood ? -1 : 1;
      const oy = cy + side * 22;
      const op = interpolate(frame, [10 + i * 10, 25 + i * 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      drawFBNode(ctx, ox, oy, 7, isFood ? 2 : 0, a * op, frame);
      drawFBText(ctx, isFood ? "food" : "danger", ox, oy + (side > 0 ? 14 : -14), 6, a * op * 0.5, "center", isFood ? FB.gold : FB.red);
    }
    // Fly walking along corridor
    const walkP = interpolate(frame, [30, 130], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const flyX = W * 0.05 + walkP * W * 0.85;
    drawFBNode(ctx, flyX, cy, 8, 4, a, frame);
    drawFBText(ctx, "GAUNTLET", W / 2, H * 0.82, 12, a, "center", FB.gold);
    drawFBText(ctx, "every fork: food vs danger", W / 2, H * 0.9, 8, a, "center", FB.text.dim);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V5: Door metaphor — two doors per stage, gold and red ----------
const V5: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 150);
    const stages = 4;
    for (let i = 0; i < stages; i++) {
      const sx = W * 0.1 + i * W * 0.22;
      const sp = interpolate(frame, [10 + i * 18, 30 + i * 18], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const doorH = H * 0.25, doorW = W * 0.08;
      // Gold door (food)
      const [hg, sg, lg] = cellHSL(2);
      ctx.globalAlpha = a * sp * 0.12; ctx.fillStyle = `hsl(${hg},${sg}%,${lg}%)`;
      ctx.fillRect(sx, H * 0.2, doorW, doorH);
      ctx.globalAlpha = a * sp * 0.4; ctx.strokeStyle = FB.gold; ctx.lineWidth = 1;
      ctx.strokeRect(sx, H * 0.2, doorW, doorH);
      drawFBText(ctx, "FOOD", sx + doorW / 2, H * 0.2 + doorH + 10, 6, a * sp, "center", FB.gold);
      // Red door (danger)
      const [hr, sr, lr] = cellHSL(0);
      ctx.globalAlpha = a * sp * 0.12; ctx.fillStyle = `hsl(${hr},${sr}%,${lr}%)`;
      ctx.fillRect(sx, H * 0.55, doorW, doorH);
      ctx.globalAlpha = a * sp * 0.4; ctx.strokeStyle = FB.red; ctx.lineWidth = 1;
      ctx.strokeRect(sx, H * 0.55, doorW, doorH);
      drawFBText(ctx, "DANGER", sx + doorW / 2, H * 0.55 + doorH + 10, 6, a * sp, "center", FB.red);
      // Connecting arrow forward
      if (i < stages - 1) {
        ctx.globalAlpha = a * sp * 0.12; ctx.strokeStyle = FB.text.dim; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(sx + doorW + 2, H * 0.42); ctx.lineTo(sx + W * 0.22 - 2, H * 0.42); ctx.stroke();
      }
    }
    drawFBText(ctx, "GAUNTLET", W / 2, H * 0.92, 12, a, "center", FB.gold);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V6: Snaking path with alternating gold/red zones ----------
const V6: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 150);
    // Snake path
    const drawLen = interpolate(frame, [10, 110], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = a * 0.2; ctx.strokeStyle = FB.text.dim; ctx.lineWidth = 2;
    ctx.beginPath();
    const points: [number, number][] = [];
    for (let t = 0; t < drawLen; t += 0.01) {
      const px = W * 0.08 + t * W * 0.84;
      const py = H * 0.45 + Math.sin(t * 12) * H * 0.18;
      points.push([px, py]);
      if (t === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.stroke();
    // Colored zones along path
    for (let i = 0; i < 8; i++) {
      const zoneT = (i + 0.5) / 8;
      if (zoneT > drawLen) break;
      const idx = Math.floor(zoneT * points.length);
      if (idx >= points.length) break;
      const [zx, zy] = points[idx];
      const isFood = i % 2 === 0;
      drawFBNode(ctx, zx, zy, 6, isFood ? 2 : 0, a * 0.7, frame);
    }
    drawFBText(ctx, "GAUNTLET", W / 2, H * 0.1, 12, a, "center", FB.gold);
    drawFBText(ctx, "food vs danger at every turn", W / 2, H * 0.9, 8, a, "center", FB.text.dim);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V7: Chess-like board — gold and red squares ----------
const V7: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 150);
    const cols = 6, rows = 4;
    const cellW = W * 0.12, cellH = H * 0.12;
    const gx = (W - cols * cellW) / 2;
    const gy = H * 0.12;
    const rng = seeded(5506);
    let idx = 0;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const cx2 = gx + c * cellW, cy2 = gy + r * cellH;
        const revP = interpolate(frame, [5 + idx * 2, 15 + idx * 2], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        const isFood = rng() > 0.5;
        const [h, s, l] = cellHSL(isFood ? 2 : 0);
        ctx.globalAlpha = a * revP * 0.08; ctx.fillStyle = `hsl(${h},${s}%,${l}%)`;
        ctx.fillRect(cx2, cy2, cellW - 2, cellH - 2);
        ctx.globalAlpha = a * revP * 0.25; ctx.strokeStyle = isFood ? FB.gold : FB.red; ctx.lineWidth = 0.5;
        ctx.strokeRect(cx2, cy2, cellW - 2, cellH - 2);
        idx++;
      }
    }
    // Path arrow through board
    const pathP = interpolate(frame, [60, 110], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = a * pathP * 0.3; ctx.strokeStyle = FB.text.primary; ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(gx, gy + rows * cellH / 2);
    ctx.lineTo(gx + cols * cellW, gy + rows * cellH / 2);
    ctx.stroke();
    drawFBText(ctx, "GAUNTLET", W / 2, H * 0.75, 14, a, "center", FB.gold);
    drawFBText(ctx, "every fork: food or danger", W / 2, H * 0.85, 8, a, "center", FB.text.dim);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V8: "GAUNTLET" title builds from bricks ----------
const V8: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 150);
    // Big word "GAUNTLET" builds letter by letter
    const letters = "GAUNTLET".split("");
    for (let i = 0; i < letters.length; i++) {
      const lp = interpolate(frame, [5 + i * 8, 15 + i * 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const lx = W * 0.1 + i * W * 0.1;
      const dropY = H * 0.3 - (1 - lp) * H * 0.2;
      drawFBText(ctx, letters[i], lx, dropY, 18, a * lp, "center", FB.gold);
    }
    // Below: fork illustration
    const forkP = interpolate(frame, [70, 100], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = a * forkP * 0.2; ctx.strokeStyle = FB.text.dim; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(W * 0.2, H * 0.55); ctx.lineTo(W / 2, H * 0.5); ctx.stroke();
    ctx.strokeStyle = FB.gold;
    ctx.beginPath(); ctx.moveTo(W / 2, H * 0.5); ctx.lineTo(W * 0.75, H * 0.42); ctx.stroke();
    ctx.strokeStyle = FB.red;
    ctx.beginPath(); ctx.moveTo(W / 2, H * 0.5); ctx.lineTo(W * 0.75, H * 0.62); ctx.stroke();
    drawFBNode(ctx, W * 0.75, H * 0.42, 8, 2, a * forkP, frame);
    drawFBText(ctx, "food", W * 0.75, H * 0.35, 8, a * forkP, "center", FB.gold);
    drawFBNode(ctx, W * 0.75, H * 0.62, 8, 0, a * forkP, frame);
    drawFBText(ctx, "danger", W * 0.75, H * 0.72, 8, a * forkP, "center", FB.red);
    drawFBNode(ctx, W / 2, H * 0.5, 5, 5, a * forkP, frame);
    drawFBText(ctx, "every fork is a choice", W / 2, H * 0.88, 9, a, "center", FB.text.dim);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V9: Tunnel perspective — gold and red lights alternate on walls ----------
const V9: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 150);
    // Perspective tunnel lines converging to center
    const vx = W / 2, vy = H * 0.35;
    ctx.globalAlpha = a * 0.08; ctx.strokeStyle = FB.text.dim; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, H); ctx.lineTo(vx, vy); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(W, H); ctx.lineTo(vx, vy); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(vx, vy); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(W, 0); ctx.lineTo(vx, vy); ctx.stroke();
    // Alternating lights on walls
    for (let i = 0; i < 8; i++) {
      const t = 1 - i / 8;
      const lp = interpolate(frame, [10 + i * 8, 25 + i * 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const lx = vx + (0 - vx) * t * 0.8;
      const rx = vx + (W - vx) * t * 0.8;
      const ly = vy + (H * 0.6 - vy) * t;
      const isFood = i % 2 === 0;
      drawFBNode(ctx, lx, ly, 4 * t + 2, isFood ? 2 : 0, a * lp * 0.6, frame);
      drawFBNode(ctx, rx, ly, 4 * t + 2, isFood ? 0 : 2, a * lp * 0.6, frame);
    }
    drawFBText(ctx, "GAUNTLET", vx, H * 0.82, 14, a, "center", FB.gold);
    drawFBText(ctx, "food vs danger", vx, H * 0.9, 8, a, "center", FB.text.dim);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

export const VARIANTS_FB_055: VariantDef[] = [
  { id: "fb-055-v1", label: "Forking paths with yellow food and red danger", component: V1 },
  { id: "fb-055-v2", label: "Top-down corridor with side branches", component: V2 },
  { id: "fb-055-v3", label: "Binary tree of food and danger nodes", component: V3 },
  { id: "fb-055-v4", label: "Horizontal gauntlet with obstacles", component: V4 },
  { id: "fb-055-v5", label: "Two doors per stage, gold and red", component: V5 },
  { id: "fb-055-v6", label: "Snaking path with alternating zones", component: V6 },
  { id: "fb-055-v7", label: "Checkerboard of food and danger cells", component: V7 },
  { id: "fb-055-v8", label: "GAUNTLET title with fork illustration", component: V8 },
  { id: "fb-055-v9", label: "Tunnel perspective with alternating lights", component: V9 },
];
