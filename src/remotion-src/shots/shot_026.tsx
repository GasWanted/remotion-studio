import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantDef, VariantProps } from "../types";
import { seeded, drawBg, makeParticles, drawParticles, PALETTE, fadeInOut } from "../scenes/theme";
import { drawMonitor, drawCursor, drawPerson } from "../icons";

// Shot 26 — "So they opened the project up. Researchers from a hundred and twenty-seven labs"
// 120 frames (4s). Many screens/cursors working in parallel.

const V1: React.FC<VariantProps> = ({ width, height }) => {
  // Monitor Grid: start with 1 screen, duplicates to 2, 4, 9, 16. Cursors clicking inside each.
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const particles = useMemo(() => makeParticles(18, width, height, scale, 26001), [width, height, scale]);
  const monitorData = useMemo(() => {
    const rand = seeded(26011);
    return Array.from({ length: 16 }, (_, i) => ({
      hue: PALETTE.cellColors[i % 8][0],
      cursorOffX: (rand() - 0.5) * 0.4,
      cursorOffY: (rand() - 0.5) * 0.3,
      clickFrame: 30 + Math.floor(rand() * 60),
    }));
  }, []);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, particles, frame, scale);
    const fadeAlpha = fadeInOut(frame, 120);
    ctx.globalAlpha = fadeAlpha;
    // Number of monitors grows over time: 1 -> 2 -> 4 -> 9 -> 16
    const gridStage = interpolate(frame, [5, 25, 45, 65, 85], [1, 2, 4, 9, 16], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const monitorCount = Math.floor(gridStage);
    const cols = Math.ceil(Math.sqrt(monitorCount));
    const rows = Math.ceil(monitorCount / cols);
    const cellW = (width * 0.8) / cols;
    const cellH = (height * 0.65) / rows;
    const monW = cellW * 0.7;
    const monH = cellH * 0.6;
    const originX = (width - cols * cellW) / 2;
    const originY = height * 0.12;
    for (let i = 0; i < monitorCount; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const mx = originX + col * cellW + cellW / 2;
      const my = originY + row * cellH + cellH / 2;
      const monAppear = interpolate(frame, [5 + i * 3, 12 + i * 3], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      if (monAppear <= 0) continue;
      ctx.globalAlpha = fadeAlpha * monAppear;
      // Monitor with colored border
      const mon = monitorData[i];
      ctx.strokeStyle = `hsla(${mon.hue}, 45%, 55%, 0.3)`;
      ctx.lineWidth = 1.5 * scale;
      ctx.strokeRect(mx - monW / 2 - 2 * scale, my - monH / 2 - 2 * scale, monW + 4 * scale, monH + 4 * scale);
      drawMonitor(ctx, mx, my, monW, monH, `hsla(${mon.hue}, 40%, 55%, 0.7)`);
      // Screen content: small colored blobs
      ctx.save();
      ctx.beginPath();
      ctx.rect(mx - monW / 2, my - monH / 2, monW, monH);
      ctx.clip();
      ctx.fillStyle = `hsla(${mon.hue}, 20%, 15%, 0.8)`;
      ctx.fillRect(mx - monW / 2, my - monH / 2, monW, monH);
      const blobRand = seeded(26100 + i);
      for (let b = 0; b < 6; b++) {
        ctx.fillStyle = `hsla(${mon.hue + blobRand() * 60}, 40%, 50%, 0.5)`;
        ctx.beginPath();
        ctx.arc(mx + (blobRand() - 0.5) * monW * 0.7, my + (blobRand() - 0.5) * monH * 0.7, 2.5 * scale, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
      // Cursor inside monitor
      const cursorX = mx + mon.cursorOffX * monW;
      const cursorY = my + mon.cursorOffY * monH;
      drawCursor(ctx, cursorX, cursorY, 8 * scale, `hsla(${mon.hue}, 55%, 70%, 0.8)`);
      // Click flash
      const clickDist = Math.abs(frame - mon.clickFrame);
      if (clickDist < 4) {
        const flashAlpha = 1 - clickDist / 4;
        ctx.fillStyle = `hsla(50, 70%, 70%, ${flashAlpha * 0.5})`;
        ctx.beginPath();
        ctx.arc(cursorX, cursorY, 6 * scale * (1 + clickDist * 0.3), 0, Math.PI * 2);
        ctx.fill();
      }
    }
    // "127 labs" counter
    const counterAlpha = interpolate(frame, [75, 90], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (counterAlpha > 0) {
      ctx.globalAlpha = fadeAlpha * counterAlpha;
      const displayCount = Math.floor(interpolate(frame, [75, 105], [16, 127], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
      ctx.fillStyle = PALETTE.accent.gold;
      ctx.font = `bold ${14 * scale}px monospace`;
      ctx.textAlign = "center";
      ctx.fillText(`${displayCount} labs`, width / 2, height * 0.92);
    }
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V2: React.FC<VariantProps> = ({ width, height }) => {
  // World Map Cursors: stylized continent blobs with cursor icons appearing at locations, connected by lines.
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const particles = useMemo(() => makeParticles(18, width, height, scale, 26002), [width, height, scale]);
  const locations = useMemo(() => {
    // Stylized continent positions (proportional to canvas)
    return [
      { x: 0.2, y: 0.32, label: "NA", hue: 220 },    // North America
      { x: 0.25, y: 0.55, label: "SA", hue: 140 },    // South America
      { x: 0.45, y: 0.3, label: "EU", hue: 55 },      // Europe
      { x: 0.48, y: 0.52, label: "AF", hue: 25 },     // Africa
      { x: 0.6, y: 0.35, label: "AS", hue: 350 },     // Asia
      { x: 0.72, y: 0.32, label: "JP", hue: 280 },    // Japan
      { x: 0.75, y: 0.6, label: "AU", hue: 180 },     // Australia
      { x: 0.38, y: 0.28, label: "UK", hue: 310 },    // UK
    ];
  }, []);
  const connections = useMemo(() => {
    const rand = seeded(26021);
    const conns: [number, number][] = [];
    for (let i = 0; i < locations.length; i++) {
      for (let j = i + 1; j < locations.length; j++) {
        if (rand() < 0.4) conns.push([i, j]);
      }
    }
    return conns;
  }, [locations]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, particles, frame, scale);
    const fadeAlpha = fadeInOut(frame, 120);
    ctx.globalAlpha = fadeAlpha;
    // Continent blob outlines (very simplified)
    const mapAppear = interpolate(frame, [3, 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (mapAppear > 0) {
      ctx.globalAlpha = fadeAlpha * mapAppear * 0.15;
      // Simple continent-like ellipses
      const continents = [
        { x: 0.2, y: 0.35, rx: 0.08, ry: 0.12 },  // Americas
        { x: 0.26, y: 0.55, rx: 0.04, ry: 0.08 },  // South America
        { x: 0.46, y: 0.32, rx: 0.07, ry: 0.06 },  // Europe
        { x: 0.48, y: 0.5, rx: 0.06, ry: 0.1 },    // Africa
        { x: 0.62, y: 0.35, rx: 0.1, ry: 0.08 },   // Asia
        { x: 0.75, y: 0.6, rx: 0.04, ry: 0.03 },   // Australia
      ];
      for (const c of continents) {
        ctx.fillStyle = `hsla(220, 30%, 40%, 0.3)`;
        ctx.beginPath();
        ctx.ellipse(c.x * width, c.y * height, c.rx * width, c.ry * height, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    // Connection lines
    const lineProgress = interpolate(frame, [30, 60], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (lineProgress > 0) {
      ctx.globalAlpha = fadeAlpha * lineProgress * 0.25;
      ctx.strokeStyle = `hsla(50, 40%, 55%, 0.4)`;
      ctx.lineWidth = 1 * scale;
      for (const [a, b] of connections) {
        const la = locations[a];
        const lb = locations[b];
        ctx.beginPath();
        ctx.moveTo(la.x * width, la.y * height);
        ctx.lineTo(la.x * width + (lb.x * width - la.x * width) * lineProgress, la.y * height + (lb.y * height - la.y * height) * lineProgress);
        ctx.stroke();
      }
    }
    // Cursor icons at locations with ripple
    for (let i = 0; i < locations.length; i++) {
      const loc = locations[i];
      const locDelay = i * 8;
      const locAppear = interpolate(frame, [15 + locDelay, 25 + locDelay], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      if (locAppear <= 0) continue;
      ctx.globalAlpha = fadeAlpha * locAppear;
      const lx = loc.x * width;
      const ly = loc.y * height;
      // Ripple
      const ripplePhase = (frame - 15 - locDelay) * 0.08;
      if (ripplePhase > 0) {
        const rippleRadius = (12 + ripplePhase * 15) * scale;
        const rippleAlpha = Math.max(0, 0.4 - ripplePhase * 0.08);
        ctx.strokeStyle = `hsla(${loc.hue}, 50%, 60%, ${rippleAlpha})`;
        ctx.lineWidth = 1.5 * scale;
        ctx.beginPath();
        ctx.arc(lx, ly, rippleRadius, 0, Math.PI * 2);
        ctx.stroke();
      }
      // Cursor
      drawCursor(ctx, lx, ly, 10 * scale, `hsla(${loc.hue}, 55%, 65%, 0.85)`);
      // Label
      ctx.fillStyle = PALETTE.text.dim;
      ctx.font = `${7 * scale}px monospace`;
      ctx.textAlign = "center";
      ctx.fillText(loc.label, lx, ly + 16 * scale);
    }
    // Counter
    const counterAlpha = interpolate(frame, [80, 95], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (counterAlpha > 0) {
      ctx.globalAlpha = fadeAlpha * counterAlpha;
      ctx.fillStyle = PALETTE.accent.gold;
      ctx.font = `bold ${13 * scale}px monospace`;
      ctx.textAlign = "center";
      ctx.fillText("127 labs worldwide", width / 2, height * 0.88);
    }
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V3: React.FC<VariantProps> = ({ width, height }) => {
  // Crowd of Clickers: grid of person icons each with a cursor. They appear in waves, each "clicks."
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const particles = useMemo(() => makeParticles(18, width, height, scale, 26003), [width, height, scale]);
  const crowd = useMemo(() => {
    const rand = seeded(26031);
    const cols = 9;
    const rows = 5;
    const items: { col: number; row: number; hue: number; clickDelay: number }[] = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        items.push({
          col: c, row: r,
          hue: PALETTE.cellColors[Math.floor(rand() * 8)][0],
          clickDelay: 30 + rand() * 70,
        });
      }
    }
    return items;
  }, []);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, particles, frame, scale);
    const fadeAlpha = fadeInOut(frame, 120);
    ctx.globalAlpha = fadeAlpha;
    const gridOriginX = width * 0.1;
    const gridOriginY = height * 0.12;
    const cellW = (width * 0.8) / 9;
    const cellH = (height * 0.6) / 5;
    // Appear in waves: row by row
    for (const person of crowd) {
      const waveDelay = person.row * 12 + person.col * 1.5;
      const personAppear = interpolate(frame, [5 + waveDelay, 15 + waveDelay], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      if (personAppear <= 0) continue;
      ctx.globalAlpha = fadeAlpha * personAppear;
      const px = gridOriginX + person.col * cellW + cellW / 2;
      const py = gridOriginY + person.row * cellH + cellH / 2;
      // Person icon
      drawPerson(ctx, px - 4 * scale, py, 6 * scale, `hsla(${person.hue}, 50%, 58%, 0.8)`);
      // Cursor next to person
      drawCursor(ctx, px + 5 * scale, py - 2 * scale, 6 * scale, `hsla(${person.hue}, 55%, 70%, 0.7)`);
      // Click flash
      const clickDist = Math.abs(frame - person.clickDelay);
      if (clickDist < 3) {
        const flashAlpha = 1 - clickDist / 3;
        ctx.fillStyle = `hsla(50, 70%, 70%, ${flashAlpha * 0.6})`;
        ctx.beginPath();
        ctx.arc(px + 5 * scale, py - 2 * scale, 5 * scale * (1 + clickDist * 0.4), 0, Math.PI * 2);
        ctx.fill();
      }
    }
    // Counter label
    const labelAlpha = interpolate(frame, [75, 90], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (labelAlpha > 0) {
      ctx.globalAlpha = fadeAlpha * labelAlpha;
      ctx.fillStyle = PALETTE.text.dim;
      ctx.font = `${12 * scale}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText("collective effort", width / 2, height * 0.88);
      ctx.fillStyle = PALETTE.accent.gold;
      ctx.font = `bold ${13 * scale}px monospace`;
      ctx.fillText("127 labs", width / 2, height * 0.94);
    }
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V4: React.FC<VariantProps> = ({ width, height }) => {
  // Screen Multiplication: one screen splits into 2, 4, 8, 16 mini-screens. Each shows different content.
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const particles = useMemo(() => makeParticles(16, width, height, scale, 26004), [width, height, scale]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, particles, frame, scale);
    const fadeAlpha = fadeInOut(frame, 120);
    ctx.globalAlpha = fadeAlpha;
    // Split stages: 1x1, 1x2, 2x2, 2x4, 4x4
    const splitStage = interpolate(frame, [5, 25, 45, 65, 85], [0, 1, 2, 3, 4], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const stage = Math.floor(splitStage);
    const stageProgress = splitStage - stage;
    const configs = [
      { cols: 1, rows: 1 },
      { cols: 2, rows: 1 },
      { cols: 2, rows: 2 },
      { cols: 4, rows: 2 },
      { cols: 4, rows: 4 },
    ];
    const config = configs[Math.min(stage, 4)];
    const areaW = width * 0.75;
    const areaH = height * 0.65;
    const originX = (width - areaW) / 2;
    const originY = height * 0.1;
    const cellW = areaW / config.cols;
    const cellH = areaH / config.rows;
    const padding = 3 * scale;
    const rand = seeded(26041);
    for (let r = 0; r < config.rows; r++) {
      for (let c = 0; c < config.cols; c++) {
        const idx = r * config.cols + c;
        const hue = PALETTE.cellColors[idx % 8][0];
        const sx = originX + c * cellW + padding;
        const sy = originY + r * cellH + padding;
        const sw = cellW - padding * 2;
        const sh = cellH - padding * 2;
        // Screen appear with slight bounce
        const screenScale = Math.min(1, stageProgress * 2 + (idx < (configs[Math.max(0, stage - 1)]?.cols ?? 1) * (configs[Math.max(0, stage - 1)]?.rows ?? 1) ? 1 : 0));
        ctx.globalAlpha = fadeAlpha * Math.min(1, screenScale + 0.5);
        // Screen border
        ctx.strokeStyle = `hsla(${hue}, 40%, 50%, 0.6)`;
        ctx.lineWidth = 1.5 * scale;
        ctx.strokeRect(sx, sy, sw, sh);
        // Screen fill
        ctx.fillStyle = `hsla(${hue}, 20%, 12%, 0.85)`;
        ctx.fillRect(sx, sy, sw, sh);
        // Content blobs inside
        ctx.save();
        ctx.beginPath();
        ctx.rect(sx, sy, sw, sh);
        ctx.clip();
        const blobRand = seeded(26400 + idx);
        for (let b = 0; b < 5; b++) {
          ctx.fillStyle = `hsla(${hue + blobRand() * 40}, 45%, 50%, 0.5)`;
          ctx.beginPath();
          ctx.arc(sx + blobRand() * sw, sy + blobRand() * sh, 2 * scale, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
        // Stand
        ctx.strokeStyle = `hsla(${hue}, 30%, 40%, 0.4)`;
        ctx.lineWidth = 1 * scale;
        ctx.beginPath();
        ctx.moveTo(sx + sw / 2, sy + sh);
        ctx.lineTo(sx + sw / 2, sy + sh + 4 * scale);
        ctx.stroke();
      }
    }
    // Label
    const labelAlpha = interpolate(frame, [80, 95], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (labelAlpha > 0) {
      ctx.globalAlpha = fadeAlpha * labelAlpha;
      ctx.fillStyle = PALETTE.accent.gold;
      ctx.font = `bold ${13 * scale}px monospace`;
      ctx.textAlign = "center";
      ctx.fillText("multiplied effort", width / 2, height * 0.9);
    }
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V5: React.FC<VariantProps> = ({ width, height }) => {
  // Collaborative Canvas: one large EM image with multiple named/colored cursors moving independently.
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const particles = useMemo(() => makeParticles(16, width, height, scale, 26005), [width, height, scale]);
  const emBlobs = useMemo(() => {
    const rand = seeded(26051);
    return Array.from({ length: 30 }, () => ({
      x: rand(), y: rand(),
      radius: (2 + rand() * 3) * scale,
      hue: 200 + rand() * 80,
    }));
  }, [scale]);
  const cursors = useMemo(() => {
    const rand = seeded(26052);
    const labels = ["Lab 23", "Lab 87", "Lab 12", "Lab 54", "Lab 99", "Lab 41"];
    return labels.map((label, i) => ({
      label,
      hue: PALETTE.cellColors[i % 8][0],
      startX: rand(), startY: rand(),
      endX: rand(), endY: rand(),
      delay: 10 + i * 12,
    }));
  }, []);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, particles, frame, scale);
    const fadeAlpha = fadeInOut(frame, 120);
    ctx.globalAlpha = fadeAlpha;
    // EM canvas area
    const canvasX = width * 0.1;
    const canvasY = height * 0.08;
    const canvasW = width * 0.8;
    const canvasH = height * 0.7;
    // Dark EM background
    const emAppear = interpolate(frame, [3, 15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (emAppear > 0) {
      ctx.globalAlpha = fadeAlpha * emAppear;
      ctx.fillStyle = `hsla(220, 20%, 10%, 0.8)`;
      ctx.fillRect(canvasX, canvasY, canvasW, canvasH);
      ctx.strokeStyle = `hsla(220, 30%, 40%, 0.4)`;
      ctx.lineWidth = 1.5 * scale;
      ctx.strokeRect(canvasX, canvasY, canvasW, canvasH);
      // EM blobs
      for (const blob of emBlobs) {
        ctx.fillStyle = `hsla(${blob.hue}, 35%, 45%, 0.5)`;
        ctx.beginPath();
        ctx.arc(canvasX + blob.x * canvasW, canvasY + blob.y * canvasH, blob.radius, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    // Cursors moving across EM canvas
    for (const cursor of cursors) {
      const cursorAppear = interpolate(frame, [cursor.delay, cursor.delay + 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      if (cursorAppear <= 0) continue;
      ctx.globalAlpha = fadeAlpha * cursorAppear;
      const moveProgress = interpolate(frame, [cursor.delay + 10, 110], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      // Cursor moves with slight oscillation
      const wobble = Math.sin(frame * 0.05 + cursor.delay) * 0.02;
      const cx = canvasX + (cursor.startX + (cursor.endX - cursor.startX) * moveProgress + wobble) * canvasW;
      const cy = canvasY + (cursor.startY + (cursor.endY - cursor.startY) * moveProgress + wobble * 0.5) * canvasH;
      drawCursor(ctx, cx, cy, 9 * scale, `hsla(${cursor.hue}, 55%, 65%, 0.85)`);
      // Label tag
      ctx.fillStyle = `hsla(${cursor.hue}, 40%, 30%, 0.8)`;
      const tagW = 35 * scale;
      const tagH = 10 * scale;
      ctx.fillRect(cx + 8 * scale, cy + 5 * scale, tagW, tagH);
      ctx.fillStyle = `hsla(${cursor.hue}, 55%, 70%, 0.9)`;
      ctx.font = `${6 * scale}px monospace`;
      ctx.textAlign = "left";
      ctx.fillText(cursor.label, cx + 10 * scale, cy + 13 * scale);
    }
    // Bottom text
    const labelAlpha = interpolate(frame, [80, 95], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (labelAlpha > 0) {
      ctx.globalAlpha = fadeAlpha * labelAlpha;
      ctx.fillStyle = PALETTE.text.dim;
      ctx.font = `${11 * scale}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText("real-time collaboration", width / 2, height * 0.9);
    }
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V6: React.FC<VariantProps> = ({ width, height }) => {
  // Zoom-Out: start close on one monitor, camera pulls back to reveal grid of workstations.
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const particles = useMemo(() => makeParticles(18, width, height, scale, 26006), [width, height, scale]);
  const stations = useMemo(() => {
    const rand = seeded(26061);
    const items: { x: number; y: number; hue: number }[] = [];
    const cols = 6;
    const rows = 4;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        items.push({
          x: width * (0.1 + c * 0.14 + (rand() - 0.5) * 0.02),
          y: height * (0.15 + r * 0.18 + (rand() - 0.5) * 0.02),
          hue: PALETTE.cellColors[Math.floor(rand() * 8)][0],
        });
      }
    }
    return items;
  }, [width, height, scale]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, particles, frame, scale);
    const fadeAlpha = fadeInOut(frame, 120);
    ctx.globalAlpha = fadeAlpha;
    // Zoom factor: starts zoomed in, pulls back
    const zoomFactor = interpolate(frame, [5, 80], [3, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.save();
    ctx.translate(width / 2, height / 2);
    ctx.scale(zoomFactor, zoomFactor);
    ctx.translate(-width / 2, -height / 2);
    // Draw all workstations
    const visCount = Math.floor(interpolate(frame, [5, 70], [1, stations.length], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
    for (let i = 0; i < visCount; i++) {
      const station = stations[i];
      const monW = 22 * scale;
      const monH = 16 * scale;
      drawMonitor(ctx, station.x, station.y, monW, monH, `hsla(${station.hue}, 40%, 55%, 0.7)`);
      // Screen glow
      ctx.fillStyle = `hsla(${station.hue}, 30%, 20%, 0.6)`;
      ctx.fillRect(station.x - monW / 2, station.y - monH / 2, monW, monH);
      // Person below
      drawPerson(ctx, station.x, station.y + monH * 0.8 + 8 * scale, 5 * scale, `hsla(${station.hue}, 45%, 55%, 0.7)`);
    }
    ctx.restore();
    // Label
    const labelAlpha = interpolate(frame, [80, 95], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (labelAlpha > 0) {
      ctx.globalAlpha = fadeAlpha * labelAlpha;
      ctx.fillStyle = PALETTE.text.dim;
      ctx.font = `${11 * scale}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText(`${visCount} workstations and counting`, width / 2, height * 0.9);
    }
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V7: React.FC<VariantProps> = ({ width, height }) => {
  // Cursor Army: dozens of cursor icons in formation advancing left-to-right. Behind them: red turns green.
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const particles = useMemo(() => makeParticles(16, width, height, scale, 26007), [width, height, scale]);
  const errorPositions = useMemo(() => {
    const rand = seeded(26071);
    return Array.from({ length: 40 }, () => ({
      x: rand(),
      y: 0.15 + rand() * 0.6,
      size: (2 + rand() * 3) * scale,
    }));
  }, [scale]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, particles, frame, scale);
    const fadeAlpha = fadeInOut(frame, 120);
    ctx.globalAlpha = fadeAlpha;
    // Front line advances from left to right
    const frontX = interpolate(frame, [10, 100], [0.05, 0.95], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    // Error dots: red ahead of front, green behind
    for (const err of errorPositions) {
      ctx.globalAlpha = fadeAlpha * 0.7;
      if (err.x < frontX) {
        // Fixed — green
        ctx.fillStyle = `hsla(140, 50%, 55%, 0.7)`;
      } else {
        // Error — red
        ctx.fillStyle = `hsla(0, 55%, 50%, 0.6)`;
      }
      ctx.beginPath();
      ctx.arc(err.x * width, err.y * height, err.size, 0, Math.PI * 2);
      ctx.fill();
    }
    // Cursor army: 4 rows, advancing together
    const cursorRows = 5;
    const cursorCols = 3;
    for (let r = 0; r < cursorRows; r++) {
      for (let c = 0; c < cursorCols; c++) {
        ctx.globalAlpha = fadeAlpha;
        const cx = frontX * width + (c - 1) * 12 * scale;
        const cy = height * (0.2 + r * 0.13);
        const bob = Math.sin(frame * 0.08 + r * 1.5 + c * 0.8) * 3 * scale;
        const hue = PALETTE.cellColors[(r * cursorCols + c) % 8][0];
        drawCursor(ctx, cx, cy + bob, 10 * scale, `hsla(${hue}, 55%, 65%, 0.8)`);
      }
    }
    // Sweep line
    ctx.globalAlpha = fadeAlpha * 0.4;
    ctx.strokeStyle = PALETTE.accent.gold;
    ctx.lineWidth = 1.5 * scale;
    ctx.setLineDash([4 * scale, 3 * scale]);
    ctx.beginPath();
    ctx.moveTo(frontX * width, height * 0.1);
    ctx.lineTo(frontX * width, height * 0.85);
    ctx.stroke();
    ctx.setLineDash([]);
    // Label
    const labelAlpha = interpolate(frame, [75, 90], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (labelAlpha > 0) {
      ctx.globalAlpha = fadeAlpha * labelAlpha;
      ctx.fillStyle = PALETTE.accent.gold;
      ctx.font = `bold ${13 * scale}px monospace`;
      ctx.textAlign = "center";
      ctx.fillText("127 labs, fixing together", width / 2, height * 0.92);
    }
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V8: React.FC<VariantProps> = ({ width, height }) => {
  // Terminal Windows: tmux-style tiled terminals, each processing different slices. Hacker-aesthetic.
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const particles = useMemo(() => makeParticles(14, width, height, scale, 26008), [width, height, scale]);
  const terminals = useMemo(() => {
    const rand = seeded(26081);
    const cols = 4;
    const rows = 3;
    return Array.from({ length: cols * rows }, (_, i) => ({
      col: i % cols, row: Math.floor(i / cols),
      sliceStart: Math.floor(rand() * 6000),
      hue: PALETTE.cellColors[i % 8][0],
      delay: i * 5,
    }));
  }, []);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, particles, frame, scale);
    const fadeAlpha = fadeInOut(frame, 120);
    ctx.globalAlpha = fadeAlpha;
    const areaX = width * 0.05;
    const areaY = height * 0.06;
    const areaW = width * 0.9;
    const areaH = height * 0.74;
    const cellW = areaW / 4;
    const cellH = areaH / 3;
    const pad = 2 * scale;
    for (const term of terminals) {
      const termAppear = interpolate(frame, [5 + term.delay, 14 + term.delay], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      if (termAppear <= 0) continue;
      ctx.globalAlpha = fadeAlpha * termAppear;
      const tx = areaX + term.col * cellW + pad;
      const ty = areaY + term.row * cellH + pad;
      const tw = cellW - pad * 2;
      const th = cellH - pad * 2;
      // Terminal background
      ctx.fillStyle = `hsla(220, 25%, 8%, 0.9)`;
      ctx.fillRect(tx, ty, tw, th);
      // Title bar
      ctx.fillStyle = `hsla(${term.hue}, 35%, 25%, 0.7)`;
      ctx.fillRect(tx, ty, tw, 8 * scale);
      // Title text
      ctx.fillStyle = `hsla(${term.hue}, 50%, 65%, 0.8)`;
      ctx.font = `${5 * scale}px monospace`;
      ctx.textAlign = "left";
      ctx.fillText(`worker-${term.col + term.row * 4 + 1}`, tx + 3 * scale, ty + 6 * scale);
      // Terminal content: scrolling slice numbers
      const textLines = 5;
      const contentY = ty + 12 * scale;
      const scrollOffset = Math.floor(frame * 0.3 + term.delay);
      for (let line = 0; line < textLines; line++) {
        const sliceNum = term.sliceStart + scrollOffset + line;
        if (sliceNum > 7000) continue;
        const lineY = contentY + line * 7 * scale;
        if (lineY > ty + th - 3 * scale) continue;
        ctx.fillStyle = `hsla(${term.hue}, 40%, 55%, 0.6)`;
        ctx.font = `${5 * scale}px monospace`;
        ctx.fillText(`slice ${sliceNum}... OK`, tx + 3 * scale, lineY);
      }
      // Border
      ctx.strokeStyle = `hsla(${term.hue}, 35%, 40%, 0.4)`;
      ctx.lineWidth = 1 * scale;
      ctx.strokeRect(tx, ty, tw, th);
    }
    // Counter label
    const labelAlpha = interpolate(frame, [70, 85], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (labelAlpha > 0) {
      ctx.globalAlpha = fadeAlpha * labelAlpha;
      ctx.fillStyle = PALETTE.accent.gold;
      ctx.font = `bold ${12 * scale}px monospace`;
      ctx.textAlign = "center";
      ctx.fillText("127 labs processing in parallel", width / 2, height * 0.9);
    }
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V9: React.FC<VariantProps> = ({ width, height }) => {
  // Parallel Processors: CPU-core style grid. Each "core" pulses when active. Labels: "Lab 1"... "Lab 127".
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const particles = useMemo(() => makeParticles(16, width, height, scale, 26009), [width, height, scale]);
  const cores = useMemo(() => {
    const rand = seeded(26091);
    const cols = 12;
    const rows = 6;
    return Array.from({ length: cols * rows }, (_, i) => ({
      col: i % cols, row: Math.floor(i / cols),
      hue: PALETTE.cellColors[i % 8][0],
      activateDelay: 5 + rand() * 70,
      pulsePhase: rand() * Math.PI * 2,
    }));
  }, []);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, particles, frame, scale);
    const fadeAlpha = fadeInOut(frame, 120);
    ctx.globalAlpha = fadeAlpha;
    const gridX = width * 0.08;
    const gridY = height * 0.1;
    const gridW = width * 0.84;
    const gridH = height * 0.6;
    const cellW = gridW / 12;
    const cellH = gridH / 6;
    const pad = 1.5 * scale;
    let activeCount = 0;
    for (const core of cores) {
      const isActive = frame >= core.activateDelay;
      if (isActive) activeCount++;
      const coreAlpha = interpolate(frame, [core.activateDelay, core.activateDelay + 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const cx = gridX + core.col * cellW + pad;
      const cy = gridY + core.row * cellH + pad;
      const cw = cellW - pad * 2;
      const ch = cellH - pad * 2;
      // Inactive: dim outline
      ctx.globalAlpha = fadeAlpha * 0.3;
      ctx.strokeStyle = `hsla(${core.hue}, 25%, 35%, 0.3)`;
      ctx.lineWidth = 1 * scale;
      ctx.strokeRect(cx, cy, cw, ch);
      // Active: filled and pulsing
      if (coreAlpha > 0) {
        ctx.globalAlpha = fadeAlpha * coreAlpha;
        const pulse = 0.5 + Math.sin(frame * 0.08 + core.pulsePhase) * 0.3;
        ctx.fillStyle = `hsla(${core.hue}, 50%, 50%, ${pulse * 0.6})`;
        ctx.fillRect(cx, cy, cw, ch);
        ctx.strokeStyle = `hsla(${core.hue}, 55%, 60%, ${coreAlpha * 0.7})`;
        ctx.strokeRect(cx, cy, cw, ch);
        // Small activity indicator (blinking dot)
        if (Math.sin(frame * 0.1 + core.pulsePhase) > 0) {
          ctx.fillStyle = `hsla(${core.hue}, 60%, 70%, 0.8)`;
          ctx.beginPath();
          ctx.arc(cx + cw - 2 * scale, cy + 2 * scale, 1.2 * scale, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
    // Active count / total label
    const labelAlpha = interpolate(frame, [20, 35], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (labelAlpha > 0) {
      ctx.globalAlpha = fadeAlpha * labelAlpha;
      const displayCount = Math.min(activeCount, 127);
      ctx.fillStyle = PALETTE.accent.gold;
      ctx.font = `bold ${14 * scale}px monospace`;
      ctx.textAlign = "center";
      ctx.fillText(`${displayCount} / 127 labs active`, width / 2, height * 0.82);
      // Progress bar
      const barW = width * 0.5;
      const barH = 6 * scale;
      const barX = (width - barW) / 2;
      const barY = height * 0.86;
      ctx.fillStyle = `hsla(220, 20%, 20%, 0.5)`;
      ctx.fillRect(barX, barY, barW, barH);
      const fillW = (displayCount / 127) * barW;
      ctx.fillStyle = PALETTE.accent.gold;
      ctx.fillRect(barX, barY, fillW, barH);
      ctx.strokeStyle = `hsla(50, 40%, 50%, 0.4)`;
      ctx.lineWidth = 1 * scale;
      ctx.strokeRect(barX, barY, barW, barH);
    }
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

export const VARIANTS_SHOT_026: VariantDef[] = [
  { id: "monitor-grid", label: "Monitor Grid", component: V1 },
  { id: "world-map-cursors", label: "World Map Cursors", component: V2 },
  { id: "crowd-clickers", label: "Crowd of Clickers", component: V3 },
  { id: "screen-multiply", label: "Screen Multiplication", component: V4 },
  { id: "collab-canvas", label: "Collaborative Canvas", component: V5 },
  { id: "zoom-out-stations", label: "Zoom-Out Stations", component: V6 },
  { id: "cursor-army", label: "Cursor Army", component: V7 },
  { id: "terminal-windows", label: "Terminal Windows", component: V8 },
  { id: "parallel-processors", label: "Parallel Processors", component: V9 },
];
