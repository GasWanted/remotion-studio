// Shot 009 — "for a needle. Scientists took a fly brain smaller than a poppy seed, encased it in"
// Duration: 146 frames (~4.9s)
// Big, bold visuals. Fly brain as a visible neural cluster, resin as a large amber block.
// 9 unique variations

import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantDef, VariantProps } from "../types";
import {
  FB, seeded, drawFBBg, drawFBNode, drawFBEdge,
  fadeInOut, cellHSL,
} from "./flatbold-kit";

const DUR = 146;

/** Draw brain as a BIG visible cluster of blob cells with connections */
function drawBrain(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number, sc: number, frame: number, alpha: number) {
  if (size < 3 || alpha < 0.01) return;
  const rng = seeded(9900);
  const count = 35;
  const nodes: { x: number; y: number; c: number; r: number }[] = [];

  for (let i = 0; i < count; i++) {
    const a2 = rng() * Math.PI * 2;
    const d = Math.pow(rng(), 0.5) * size * 0.85;
    nodes.push({
      x: cx + Math.cos(a2) * d * 1.25,
      y: cy + Math.sin(a2) * d * 0.8,
      c: Math.floor(rng() * 8),
      r: (2.5 + rng() * 3.5) * (size / 80),
    });
  }

  // Connections
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < Math.min(i + 6, nodes.length); j++) {
      const dx = nodes[i].x - nodes[j].x, dy = nodes[i].y - nodes[j].y;
      if (Math.sqrt(dx * dx + dy * dy) < size * 0.5) {
        drawFBEdge(ctx, nodes[i].x, nodes[i].y, nodes[j].x, nodes[j].y, sc, alpha * 0.3, frame, cellHSL(nodes[i].c)[0], cellHSL(nodes[j].c)[0]);
      }
    }
  }

  // Nodes
  for (const n of nodes) {
    drawFBNode(ctx, n.x, n.y, n.r * sc, n.c, alpha, frame);
  }
}

/** Draw big amber resin block — bold, visible, 3D-ish */
function drawResinBlock(ctx: CanvasRenderingContext2D, cx: number, cy: number, w2: number, h2: number, sc: number, alpha: number, fillT: number) {
  const [rh, rs, rl] = cellHSL(2); // amber

  // 3D depth offset
  const depth = 8 * sc;

  // Back face (darker, offset)
  ctx.globalAlpha = alpha * 0.15;
  ctx.fillStyle = `hsla(${rh},${rs}%,${rl - 15}%,0.3)`;
  ctx.fillRect(cx - w2 / 2 + depth, cy - h2 / 2 - depth, w2, h2);

  // Main face
  ctx.globalAlpha = alpha * 0.2;
  ctx.fillStyle = `hsla(${rh},${rs}%,${rl}%,0.15)`;
  ctx.fillRect(cx - w2 / 2, cy - h2 / 2, w2, h2);

  // Filled resin (rising liquid level)
  if (fillT > 0) {
    const fillH = h2 * fillT;
    // Liquid gradient
    const lg = ctx.createLinearGradient(cx, cy + h2 / 2, cx, cy + h2 / 2 - fillH);
    lg.addColorStop(0, `hsla(${rh},${rs + 10}%,${rl - 8}%,${alpha * 0.4})`);
    lg.addColorStop(0.5, `hsla(${rh},${rs + 5}%,${rl}%,${alpha * 0.35})`);
    lg.addColorStop(1, `hsla(${rh},${rs}%,${rl + 8}%,${alpha * 0.25})`);
    ctx.globalAlpha = 1;
    ctx.fillStyle = lg;
    ctx.fillRect(cx - w2 / 2 + 2, cy + h2 / 2 - fillH, w2 - 4, fillH);

    // Wavy top surface
    if (fillT < 0.95) {
      ctx.globalAlpha = alpha * 0.3;
      ctx.strokeStyle = `hsla(${rh},${rs}%,${rl + 20}%,0.5)`;
      ctx.lineWidth = 1.5 * sc;
      ctx.beginPath();
      const surfY = cy + h2 / 2 - fillH;
      for (let x = cx - w2 / 2; x <= cx + w2 / 2; x += 2) {
        const yOff = Math.sin(x * 0.03 + fillT * 20) * 2 * sc;
        x === cx - w2 / 2 ? ctx.moveTo(x, surfY + yOff) : ctx.lineTo(x, surfY + yOff);
      }
      ctx.stroke();
    }
  }

  // Bold border
  ctx.globalAlpha = alpha * 0.5;
  ctx.strokeStyle = `hsla(${rh},${rs}%,${rl + 15}%,0.6)`;
  ctx.lineWidth = Math.max(1.5, 2.5 * sc);
  ctx.strokeRect(cx - w2 / 2, cy - h2 / 2, w2, h2);

  // Top edge connector (3D)
  ctx.beginPath();
  ctx.moveTo(cx - w2 / 2, cy - h2 / 2);
  ctx.lineTo(cx - w2 / 2 + depth, cy - h2 / 2 - depth);
  ctx.lineTo(cx + w2 / 2 + depth, cy - h2 / 2 - depth);
  ctx.lineTo(cx + w2 / 2, cy - h2 / 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx + w2 / 2, cy - h2 / 2);
  ctx.lineTo(cx + w2 / 2 + depth, cy - h2 / 2 - depth);
  ctx.lineTo(cx + w2 / 2 + depth, cy + h2 / 2 - depth);
  ctx.lineTo(cx + w2 / 2, cy + h2 / 2);
  ctx.stroke();

  // Highlight stripe
  ctx.globalAlpha = alpha * 0.08;
  ctx.fillStyle = "rgba(255,255,255,0.4)";
  ctx.fillRect(cx - w2 / 2 + w2 * 0.08, cy - h2 / 2 + 3 * sc, w2 * 0.08, h2 - 6 * sc);

  ctx.globalAlpha = 1;
}

/* ── V1: Brain appears big at center, resin pours from top ── */
const V1: React.FC<VariantProps> = ({ width: w, height: h }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  const sc = Math.min(w, h) / 360;
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, w, h, frame); const a = fadeInOut(frame, DUR);
    const cx = w / 2, cy = h / 2;

    const brainT = interpolate(frame, [5, 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const brainSize = 80 * sc * brainT;

    // Resin block + fill
    const resinT = interpolate(frame, [35, 100], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (resinT > 0) {
      drawResinBlock(ctx, cx, cy, 200 * sc, 180 * sc, sc, a, resinT);
      // Pour stream
      if (resinT < 0.85) {
        const [rh, rs, rl] = cellHSL(2);
        ctx.globalAlpha = a * 0.25;
        ctx.fillStyle = `hsla(${rh},${rs}%,${rl}%,0.35)`;
        ctx.fillRect(cx - 4 * sc, 0, 8 * sc, cy - 90 * sc);
        ctx.globalAlpha = 1;
      }
    }

    // Brain on top of resin
    drawBrain(ctx, cx, cy, brainSize, sc, frame, a * brainT);
  });
  return <canvas ref={ref} width={w} height={h} style={{ width: w, height: h }} />;
};

/* ── V2: Brain floats, amber walls close in from sides ── */
const V2: React.FC<VariantProps> = ({ width: w, height: h }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  const sc = Math.min(w, h) / 360;
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, w, h, frame); const a = fadeInOut(frame, DUR);
    const cx = w / 2, cy = h / 2;

    const brainT = interpolate(frame, [5, 25], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawBrain(ctx, cx, cy, 80 * sc * brainT, sc, frame, a * brainT);

    // Amber walls close from left and right
    const closeT = interpolate(frame, [30, 90], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (closeT > 0) {
      const cE = closeT * closeT * (3 - 2 * closeT);
      const [rh, rs, rl] = cellHSL(2);
      const finalW = 100 * sc;
      const wallX = w * 0.5 + finalW / 2 + (1 - cE) * w * 0.4;

      // Left wall
      const lg = ctx.createLinearGradient(cx - wallX, cy, cx - finalW / 2, cy);
      lg.addColorStop(0, "transparent");
      lg.addColorStop(1, `hsla(${rh},${rs + 5}%,${rl - 5}%,${a * 0.35})`);
      ctx.fillStyle = lg;
      ctx.fillRect(0, cy - 100 * sc, cx - finalW / 2 + (1 - cE) * w * 0.4, 200 * sc);

      // Right wall
      const rg = ctx.createLinearGradient(cx + wallX, cy, cx + finalW / 2, cy);
      rg.addColorStop(0, "transparent");
      rg.addColorStop(1, `hsla(${rh},${rs + 5}%,${rl - 5}%,${a * 0.35})`);
      ctx.fillStyle = rg;
      ctx.fillRect(cx + finalW / 2 - (1 - cE) * w * 0.4, cy - 100 * sc, w, 200 * sc);

      // Top and bottom walls
      if (cE > 0.5) {
        const tbE = (cE - 0.5) * 2;
        ctx.globalAlpha = a * tbE * 0.3;
        ctx.fillStyle = `hsla(${rh},${rs}%,${rl - 5}%,0.3)`;
        ctx.fillRect(cx - finalW / 2, 0, finalW, (cy - 90 * sc) * (1 - tbE) + 1);
        ctx.fillRect(cx - finalW / 2, cy + 90 * sc + (h - cy - 90 * sc) * (1 - tbE), finalW, h);
        ctx.globalAlpha = 1;
      }

      // Final block border
      if (cE > 0.8) {
        drawResinBlock(ctx, cx, cy, 200 * sc, 180 * sc, sc, a * (cE - 0.8) * 5, 1);
      }
    }
  });
  return <canvas ref={ref} width={w} height={h} style={{ width: w, height: h }} />;
};

/* ── V3: Big amber drop falls, splashes, encases brain ── */
const V3: React.FC<VariantProps> = ({ width: w, height: h }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  const sc = Math.min(w, h) / 360;
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, w, h, frame); const a = fadeInOut(frame, DUR);
    const cx = w / 2, cy = h / 2;

    drawBrain(ctx, cx, cy, 75 * sc, sc, frame, a);

    // Big amber drop falls
    const dropFall = interpolate(frame, [20, 48], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const spreadT = interpolate(frame, [48, 95], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const [rh, rs, rl] = cellHSL(2);

    if (dropFall > 0 && spreadT === 0) {
      const dropY = -40 * sc + dropFall * dropFall * (cy + 40 * sc);
      const dropR = 30 * sc;
      const dg = ctx.createRadialGradient(cx - dropR * 0.1, dropY - dropR * 0.15, 0, cx, dropY, dropR);
      dg.addColorStop(0, `hsla(${rh},${rs + 10}%,${rl + 18}%,${a * 0.6})`);
      dg.addColorStop(0.6, `hsla(${rh},${rs}%,${rl}%,${a * 0.45})`);
      dg.addColorStop(1, `hsla(${rh},${rs}%,${rl - 8}%,${a * 0.2})`);
      ctx.fillStyle = dg;
      ctx.beginPath(); ctx.ellipse(cx, dropY, dropR * 0.75, dropR, 0, 0, Math.PI * 2); ctx.fill();
    }

    // Impact flash
    if (frame >= 47 && frame <= 52) {
      ctx.globalAlpha = (1 - Math.abs(frame - 49) / 3) * 0.06;
      ctx.fillStyle = `hsla(${rh},${rs}%,${rl + 20}%,0.3)`;
      ctx.fillRect(0, 0, w, h); ctx.globalAlpha = 1;
    }

    // Spreads into block
    if (spreadT > 0) {
      const sE = spreadT * spreadT * (3 - 2 * spreadT);
      drawResinBlock(ctx, cx, cy, 200 * sc * sE, 180 * sc * sE, sc, a * sE, 1);
    }
  });
  return <canvas ref={ref} width={w} height={h} style={{ width: w, height: h }} />;
};

/* ── V4: Resin rises from bottom like liquid filling a tank ── */
const V4: React.FC<VariantProps> = ({ width: w, height: h }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  const sc = Math.min(w, h) / 360;
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, w, h, frame); const a = fadeInOut(frame, DUR);
    const cx = w / 2, cy = h / 2;

    // Container outline first
    const containerT = interpolate(frame, [5, 25], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (containerT > 0) {
      const [rh, rs, rl] = cellHSL(2);
      ctx.globalAlpha = a * containerT * 0.4;
      ctx.strokeStyle = `hsla(${rh},${rs}%,${rl + 15}%,0.5)`;
      ctx.lineWidth = Math.max(1.5, 2.5 * sc);
      ctx.strokeRect(cx - 100 * sc, cy - 90 * sc, 200 * sc, 180 * sc);
      ctx.globalAlpha = 1;
    }

    // Brain visible inside
    drawBrain(ctx, cx, cy, 75 * sc, sc, frame, a);

    // Amber liquid rises
    const fillT = interpolate(frame, [30, 110], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (fillT > 0) {
      const [rh, rs, rl] = cellHSL(2);
      const blockW = 200 * sc, blockH = 180 * sc;
      const fillH = blockH * fillT;
      const surfY = cy + blockH / 2 - fillH;

      // Liquid
      const lg = ctx.createLinearGradient(cx, cy + blockH / 2, cx, surfY);
      lg.addColorStop(0, `hsla(${rh},${rs + 10}%,${rl - 8}%,${a * 0.4})`);
      lg.addColorStop(0.5, `hsla(${rh},${rs + 5}%,${rl}%,${a * 0.3})`);
      lg.addColorStop(1, `hsla(${rh},${rs}%,${rl + 8}%,${a * 0.2})`);
      ctx.fillStyle = lg;
      ctx.fillRect(cx - blockW / 2 + 2, surfY, blockW - 4, fillH);

      // Wavy surface
      if (fillT < 0.92) {
        ctx.globalAlpha = a * 0.35;
        ctx.strokeStyle = `hsla(${rh},${rs}%,${rl + 20}%,0.5)`;
        ctx.lineWidth = 2 * sc;
        ctx.beginPath();
        for (let x = cx - blockW / 2; x <= cx + blockW / 2; x += 2) {
          const yOff = Math.sin(x * 0.025 + frame * 0.08) * 3 * sc;
          x === cx - blockW / 2 ? ctx.moveTo(x, surfY + yOff) : ctx.lineTo(x, surfY + yOff);
        }
        ctx.stroke(); ctx.globalAlpha = 1;
      }
    }
  });
  return <canvas ref={ref} width={w} height={h} style={{ width: w, height: h }} />;
};

/* ── V5: Side by side — poppy seeds (big) vs fly brain (tiny but detailed) → resin ── */
const V5: React.FC<VariantProps> = ({ width: w, height: h }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  const sc = Math.min(w, h) / 360;
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, w, h, frame); const a = fadeInOut(frame, DUR);

    // LEFT: poppy seeds (dark, large, for scale)
    const seedT = interpolate(frame, [5, 25], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const rng = seeded(9950);
    for (let i = 0; i < 8; i++) {
      const sx = w * 0.08 + rng() * w * 0.32;
      const sy = h * 0.15 + rng() * h * 0.7;
      const sr = (8 + rng() * 10) * sc;
      ctx.globalAlpha = a * seedT * 0.5;
      const sg = ctx.createRadialGradient(sx - sr * 0.15, sy - sr * 0.15, 0, sx, sy, sr);
      sg.addColorStop(0, `hsla(30,35%,30%,0.7)`);
      sg.addColorStop(1, `hsla(25,30%,18%,0.6)`);
      ctx.fillStyle = sg;
      ctx.beginPath(); ctx.ellipse(sx, sy, sr, sr * 0.7, rng() * Math.PI, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;

    // Divider
    ctx.globalAlpha = a * 0.15; ctx.strokeStyle = "rgba(255,255,255,0.3)"; ctx.lineWidth = 1 * sc;
    ctx.setLineDash([3*sc,3*sc]); ctx.beginPath(); ctx.moveTo(w * 0.47, h * 0.05); ctx.lineTo(w * 0.47, h * 0.95); ctx.stroke();
    ctx.setLineDash([]); ctx.globalAlpha = 1;

    // RIGHT: brain + resin
    const rcx = w * 0.72, rcy = h / 2;
    const brainT = interpolate(frame, [15, 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawBrain(ctx, rcx, rcy, 65 * sc * brainT, sc, frame, a * brainT);

    const resinT = interpolate(frame, [50, 100], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (resinT > 0) drawResinBlock(ctx, rcx, rcy, 160 * sc, 150 * sc, sc, a * resinT, resinT);
  });
  return <canvas ref={ref} width={w} height={h} style={{ width: w, height: h }} />;
};

/* ── V6: Brain surrounded by amber glow that solidifies into a block ── */
const V6: React.FC<VariantProps> = ({ width: w, height: h }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  const sc = Math.min(w, h) / 360;
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, w, h, frame); const a = fadeInOut(frame, DUR);
    const cx = w / 2, cy = h / 2;

    drawBrain(ctx, cx, cy, 80 * sc, sc, frame, a);

    // Amber glow grows around brain then solidifies
    const glowT = interpolate(frame, [20, 60], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const solidT = interpolate(frame, [60, 105], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const [rh, rs, rl] = cellHSL(2);

    if (glowT > 0) {
      const glowR = 120 * sc * glowT;
      // Soft glow
      ctx.globalAlpha = a * (1 - solidT * 0.7) * 0.2;
      const gg = ctx.createRadialGradient(cx, cy, glowR * 0.3, cx, cy, glowR);
      gg.addColorStop(0, `hsla(${rh},${rs}%,${rl + 10}%,0.4)`);
      gg.addColorStop(1, "transparent");
      ctx.fillStyle = gg;
      ctx.beginPath(); ctx.arc(cx, cy, Math.max(1, glowR), 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = 1;
    }

    // Solidifies into block
    if (solidT > 0) {
      const sE = solidT * solidT * (3 - 2 * solidT);
      drawResinBlock(ctx, cx, cy, 200 * sc, 180 * sc, sc, a * sE, 1);
    }
  });
  return <canvas ref={ref} width={w} height={h} style={{ width: w, height: h }} />;
};

/* ── V7: Resin layers — multiple amber layers stack on top of each other encasing brain ── */
const V7: React.FC<VariantProps> = ({ width: w, height: h }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  const sc = Math.min(w, h) / 360;
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, w, h, frame); const a = fadeInOut(frame, DUR);
    const cx = w / 2, cy = h / 2;

    drawBrain(ctx, cx, cy, 75 * sc, sc, frame, a);

    // 5 amber layers slide in one by one
    const layers = 5;
    const blockW = 200 * sc, blockH = 180 * sc;
    const layerH = blockH / layers;
    const [rh, rs, rl] = cellHSL(2);

    for (let i = 0; i < layers; i++) {
      const layerStart = 25 + i * 18;
      const lt = interpolate(frame, [layerStart, layerStart + 15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      if (lt <= 0) continue;
      const lE = lt * lt * (3 - 2 * lt);

      const ly = cy + blockH / 2 - (i + 1) * layerH;
      const shade = rl - 8 + i * 3;
      // Slide in from right
      const slideX = (1 - lE) * w * 0.4;

      ctx.globalAlpha = a * lE * 0.3;
      ctx.fillStyle = `hsla(${rh},${rs + 5}%,${shade}%,0.35)`;
      ctx.fillRect(cx - blockW / 2 + slideX, ly, blockW, layerH);
      // Layer edge
      ctx.strokeStyle = `hsla(${rh},${rs}%,${shade + 15}%,${a * lE * 0.3})`;
      ctx.lineWidth = 1 * sc;
      ctx.strokeRect(cx - blockW / 2 + slideX, ly, blockW, layerH);
      ctx.globalAlpha = 1;
    }
  });
  return <canvas ref={ref} width={w} height={h} style={{ width: w, height: h }} />;
};

/* ── V8: Brain shrinks into a dot then resin block grows around it ── */
const V8: React.FC<VariantProps> = ({ width: w, height: h }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  const sc = Math.min(w, h) / 360;
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, w, h, frame); const a = fadeInOut(frame, DUR);
    const cx = w / 2, cy = h / 2;

    // Brain starts big then shrinks (emphasizing "smaller than a poppy seed")
    const shrinkT = interpolate(frame, [5, 50], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const brainSize = interpolate(shrinkT, [0, 1], [120, 30]) * sc;
    drawBrain(ctx, cx, cy, brainSize, sc, frame, a);

    // Resin grows around the now-tiny brain
    const resinT = interpolate(frame, [55, 110], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (resinT > 0) {
      const rE = resinT * resinT * (3 - 2 * resinT);
      drawResinBlock(ctx, cx, cy, 180 * sc * rE, 160 * sc * rE, sc, a * rE, 1);
    }
  });
  return <canvas ref={ref} width={w} height={h} style={{ width: w, height: h }} />;
};

/* ── V9: Full cinematic — brain pulsing, amber liquid pours, block solidifies, hardens ── */
const V9: React.FC<VariantProps> = ({ width: w, height: h }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  const sc = Math.min(w, h) / 360;
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, w, h, frame); const a = fadeInOut(frame, DUR);
    const cx = w / 2, cy = h / 2;
    const [rh, rs, rl] = cellHSL(2);
    const blockW = 200 * sc, blockH = 180 * sc;

    // Container fades in
    const contT = interpolate(frame, [5, 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = a * contT * 0.35;
    ctx.strokeStyle = `hsla(${rh},${rs}%,${rl + 15}%,0.5)`;
    ctx.lineWidth = Math.max(1.5, 2.5 * sc);
    ctx.strokeRect(cx - blockW / 2, cy - blockH / 2, blockW, blockH);
    ctx.globalAlpha = 1;

    // Brain pulsing
    const pulse = 1 + Math.sin(frame * 0.06) * 0.04;
    drawBrain(ctx, cx, cy, 75 * sc * pulse, sc, frame, a);

    // Liquid pours and fills
    const pourT = interpolate(frame, [25, 95], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (pourT > 0) {
      // Pour stream from top
      if (pourT < 0.85) {
        ctx.globalAlpha = a * 0.3;
        ctx.fillStyle = `hsla(${rh},${rs + 5}%,${rl}%,0.4)`;
        ctx.fillRect(cx - 5 * sc, 0, 10 * sc, cy - blockH / 2);
        ctx.globalAlpha = 1;
      }

      // Fill level
      const fillH = blockH * pourT;
      const surfY = cy + blockH / 2 - fillH;
      const lg = ctx.createLinearGradient(cx, cy + blockH / 2, cx, surfY);
      lg.addColorStop(0, `hsla(${rh},${rs + 10}%,${rl - 8}%,${a * 0.4})`);
      lg.addColorStop(1, `hsla(${rh},${rs}%,${rl + 8}%,${a * 0.2})`);
      ctx.fillStyle = lg;
      ctx.fillRect(cx - blockW / 2 + 2, surfY, blockW - 4, fillH);

      // Wavy surface
      if (pourT < 0.9) {
        ctx.globalAlpha = a * 0.3;
        ctx.strokeStyle = `hsla(${rh},${rs}%,${rl + 20}%,0.5)`;
        ctx.lineWidth = 2 * sc;
        ctx.beginPath();
        for (let x = cx - blockW / 2; x <= cx + blockW / 2; x += 2) {
          const yOff = Math.sin(x * 0.025 + frame * 0.08) * 3 * sc;
          x === cx - blockW / 2 ? ctx.moveTo(x, surfY + yOff) : ctx.lineTo(x, surfY + yOff);
        }
        ctx.stroke(); ctx.globalAlpha = 1;
      }
    }

    // Solidify: block becomes more opaque at the end
    const solidT = interpolate(frame, [100, 130], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (solidT > 0) {
      ctx.globalAlpha = a * solidT * 0.15;
      ctx.fillStyle = `hsla(${rh},${rs}%,${rl - 5}%,0.25)`;
      ctx.fillRect(cx - blockW / 2, cy - blockH / 2, blockW, blockH);
      ctx.globalAlpha = 1;
    }
  });
  return <canvas ref={ref} width={w} height={h} style={{ width: w, height: h }} />;
};

export const FB009_Final = V1;

export const VARIANTS_FB_009: VariantDef[] = [
  { id: "fb009-v1", label: "Brain + Pour", component: V1 },
  { id: "fb009-v2", label: "Walls Close In", component: V2 },
  { id: "fb009-v3", label: "Amber Drop Splash", component: V3 },
  { id: "fb009-v4", label: "Tank Fill", component: V4 },
  { id: "fb009-v5", label: "Seeds vs Brain", component: V5 },
  { id: "fb009-v6", label: "Glow → Solidify", component: V6 },
  { id: "fb009-v7", label: "Layer Stack", component: V7 },
  { id: "fb009-v8", label: "Shrink + Encase", component: V8 },
  { id: "fb009-v9", label: "Full Cinematic", component: V9 },
];
