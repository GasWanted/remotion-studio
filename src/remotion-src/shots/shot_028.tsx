import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantDef, VariantProps } from "../types";
import { seeded, drawBg, makeParticles, drawParticles, PALETTE, fadeInOut } from "../scenes/theme";
import { drawCursor, drawCheck, drawX } from "../icons";

// Shot 28 — "clicking on neurons, fixing errors, verifying every connection."
// 120 frames (4s). Rapid click-fix-click-fix montage.

const V1: React.FC<VariantProps> = ({ width, height }) => {
  // Cursor Hop: cursor hops position to position. At each: click flash, blob red->green, drawCheck appears.
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const particles = useMemo(() => makeParticles(16, width, height, scale, 28001), [width, height, scale]);
  const spots = useMemo(() => {
    const rand = seeded(28011);
    return Array.from({ length: 10 }, () => ({
      x: width * (0.1 + rand() * 0.8),
      y: height * (0.1 + rand() * 0.65),
      size: (3 + rand() * 4) * scale,
    }));
  }, [width, height, scale]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, particles, frame, scale);
    const fadeAlpha = fadeInOut(frame, 120);
    ctx.globalAlpha = fadeAlpha;
    const framesPerSpot = 10;
    const currentSpotIdx = Math.min(spots.length - 1, Math.floor(Math.max(0, frame - 5) / framesPerSpot));
    // Draw all spots
    for (let i = 0; i < spots.length; i++) {
      const spot = spots[i];
      const spotFixFrame = 5 + i * framesPerSpot + 4;
      const isFixed = frame >= spotFixFrame;
      ctx.globalAlpha = fadeAlpha * 0.85;
      if (isFixed) {
        ctx.fillStyle = `hsla(140, 55%, 55%, 0.75)`;
        ctx.beginPath();
        ctx.arc(spot.x, spot.y, spot.size, 0, Math.PI * 2);
        ctx.fill();
        // Check mark grows in
        const checkGrow = interpolate(frame, [spotFixFrame, spotFixFrame + 3], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        if (checkGrow > 0) {
          ctx.globalAlpha = fadeAlpha * checkGrow;
          drawCheck(ctx, spot.x, spot.y, spot.size * 1.8 * checkGrow, PALETTE.accent.green);
        }
      } else if (i <= currentSpotIdx + 1) {
        // Visible but unfixed
        ctx.fillStyle = `hsla(0, 55%, 50%, 0.65)`;
        ctx.beginPath();
        ctx.arc(spot.x, spot.y, spot.size, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Future spots: dim hint
        ctx.fillStyle = `hsla(0, 30%, 35%, 0.25)`;
        ctx.beginPath();
        ctx.arc(spot.x, spot.y, spot.size, 0, Math.PI * 2);
        ctx.fill();
      }
      // Click flash
      const flashFrame = 5 + i * framesPerSpot + 2;
      const flashDist = frame - flashFrame;
      if (flashDist >= 0 && flashDist < 4) {
        ctx.globalAlpha = fadeAlpha * (1 - flashDist / 4);
        ctx.fillStyle = `hsla(50, 70%, 70%, 0.5)`;
        ctx.beginPath();
        ctx.arc(spot.x, spot.y, spot.size * 3 * (1 + flashDist * 0.3), 0, Math.PI * 2);
        ctx.fill();
      }
    }
    // Cursor at current spot
    if (currentSpotIdx < spots.length) {
      const target = spots[currentSpotIdx];
      ctx.globalAlpha = fadeAlpha;
      // Cursor bobs slightly
      const bob = Math.sin(frame * 0.15) * 2 * scale;
      drawCursor(ctx, target.x - 6 * scale, target.y - 10 * scale + bob, 13 * scale, PALETTE.accent.gold);
    }
    // Trail line connecting fixed spots
    ctx.globalAlpha = fadeAlpha * 0.2;
    ctx.strokeStyle = PALETTE.accent.green;
    ctx.lineWidth = 1 * scale;
    ctx.setLineDash([3 * scale, 3 * scale]);
    ctx.beginPath();
    let started = false;
    for (let i = 0; i <= currentSpotIdx && i < spots.length; i++) {
      if (!started) { ctx.moveTo(spots[i].x, spots[i].y); started = true; }
      else ctx.lineTo(spots[i].x, spots[i].y);
    }
    ctx.stroke();
    ctx.setLineDash([]);
    // Counter
    const fixedCount = Math.min(spots.length, Math.max(0, Math.floor((frame - 9) / framesPerSpot) + 1));
    ctx.globalAlpha = fadeAlpha;
    ctx.fillStyle = PALETTE.accent.green;
    ctx.font = `bold ${12 * scale}px monospace`;
    ctx.textAlign = "center";
    ctx.fillText(`${fixedCount} / ${spots.length} verified`, width / 2, height * 0.9);
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V2: React.FC<VariantProps> = ({ width, height }) => {
  // Whack-a-Mole: red error blobs pop up, cursor quickly clicks each, they vanish, green check replaces.
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const particles = useMemo(() => makeParticles(16, width, height, scale, 28002), [width, height, scale]);
  const moles = useMemo(() => {
    const rand = seeded(28021);
    return Array.from({ length: 14 }, (_, i) => ({
      x: width * (0.1 + rand() * 0.8),
      y: height * (0.1 + rand() * 0.6),
      popFrame: 5 + i * 7 + Math.floor(rand() * 4),
      size: (4 + rand() * 3) * scale,
    }));
  }, [width, height, scale]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, particles, frame, scale);
    const fadeAlpha = fadeInOut(frame, 120);
    ctx.globalAlpha = fadeAlpha;
    // Grid holes (subtle background pattern)
    const rand = seeded(28022);
    for (let i = 0; i < 20; i++) {
      ctx.globalAlpha = fadeAlpha * 0.1;
      ctx.fillStyle = `hsla(220, 20%, 20%, 0.3)`;
      const hx = width * (0.1 + rand() * 0.8);
      const hy = height * (0.1 + rand() * 0.65);
      ctx.beginPath();
      ctx.arc(hx, hy, 8 * scale, 0, Math.PI * 2);
      ctx.fill();
    }
    // Mole lifecycle: pop at popFrame, whacked at popFrame+4, replaced by check at popFrame+5
    for (const mole of moles) {
      const localFrame = frame - mole.popFrame;
      if (localFrame < -2) continue;
      // Pop up phase (-2 to 0): growing
      if (localFrame >= -2 && localFrame < 0) {
        const grow = (localFrame + 2) / 2;
        ctx.globalAlpha = fadeAlpha * grow;
        ctx.fillStyle = `hsla(0, 60%, 50%, 0.8)`;
        ctx.beginPath();
        ctx.arc(mole.x, mole.y, mole.size * grow, 0, Math.PI * 2);
        ctx.fill();
      }
      // Alive phase (0 to 4): pulsing red
      else if (localFrame >= 0 && localFrame < 4) {
        const pulse = 1 + Math.sin(localFrame * 1.5) * 0.15;
        ctx.globalAlpha = fadeAlpha;
        ctx.fillStyle = `hsla(0, 60%, 50%, 0.8)`;
        ctx.beginPath();
        ctx.arc(mole.x, mole.y, mole.size * pulse, 0, Math.PI * 2);
        ctx.fill();
      }
      // Whack flash (4 to 6)
      else if (localFrame >= 4 && localFrame < 6) {
        const flashAlpha = 1 - (localFrame - 4) / 2;
        ctx.globalAlpha = fadeAlpha * flashAlpha;
        ctx.fillStyle = `hsla(50, 70%, 70%, ${flashAlpha * 0.6})`;
        ctx.beginPath();
        ctx.arc(mole.x, mole.y, mole.size * 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
      // Fixed phase (6+): green check
      if (localFrame >= 5) {
        const checkGrow = interpolate(localFrame, [5, 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        ctx.globalAlpha = fadeAlpha * checkGrow;
        ctx.fillStyle = `hsla(140, 50%, 50%, 0.5)`;
        ctx.beginPath();
        ctx.arc(mole.x, mole.y, mole.size * 0.8, 0, Math.PI * 2);
        ctx.fill();
        drawCheck(ctx, mole.x, mole.y, mole.size * 1.5, PALETTE.accent.green);
      }
    }
    // Cursor follows current active mole
    let cursorMole = moles[0];
    for (const mole of moles) {
      if (frame >= mole.popFrame && frame <= mole.popFrame + 5) {
        cursorMole = mole;
        break;
      }
      if (frame < mole.popFrame) {
        cursorMole = mole;
        break;
      }
    }
    ctx.globalAlpha = fadeAlpha;
    drawCursor(ctx, cursorMole.x - 4 * scale, cursorMole.y - 8 * scale, 12 * scale, PALETTE.accent.gold);
    // Score counter
    let score = 0;
    for (const mole of moles) {
      if (frame >= mole.popFrame + 5) score++;
    }
    ctx.fillStyle = PALETTE.accent.green;
    ctx.font = `bold ${13 * scale}px monospace`;
    ctx.textAlign = "center";
    ctx.fillText(`${score} errors squashed`, width / 2, height * 0.88);
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V3: React.FC<VariantProps> = ({ width, height }) => {
  // Conveyor Belt Fix Station: blobs move left to right on belt. Fix station in center turns red->green.
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const particles = useMemo(() => makeParticles(16, width, height, scale, 28003), [width, height, scale]);
  const beltItems = useMemo(() => {
    const rand = seeded(28031);
    return Array.from({ length: 14 }, (_, i) => ({
      startDelay: i * 8,
      size: (3 + rand() * 3) * scale,
      yJitter: (rand() - 0.5) * 10 * scale,
    }));
  }, [scale]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, particles, frame, scale);
    const fadeAlpha = fadeInOut(frame, 120);
    ctx.globalAlpha = fadeAlpha;
    const beltY = height * 0.45;
    const beltLeft = width * 0.02;
    const beltRight = width * 0.98;
    const stationX = width * 0.5;
    // Belt track
    const beltAppear = interpolate(frame, [2, 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (beltAppear > 0) {
      ctx.globalAlpha = fadeAlpha * beltAppear;
      // Belt lines
      ctx.strokeStyle = `hsla(220, 25%, 35%, 0.5)`;
      ctx.lineWidth = 2 * scale;
      ctx.beginPath();
      ctx.moveTo(beltLeft, beltY - 12 * scale);
      ctx.lineTo(beltRight, beltY - 12 * scale);
      ctx.moveTo(beltLeft, beltY + 12 * scale);
      ctx.lineTo(beltRight, beltY + 12 * scale);
      ctx.stroke();
      // Belt hash marks (moving)
      ctx.strokeStyle = `hsla(220, 20%, 30%, 0.3)`;
      ctx.lineWidth = 1 * scale;
      const offset = (frame * 2) % (20 * scale);
      for (let x = beltLeft - 20 * scale + offset; x < beltRight; x += 20 * scale) {
        ctx.beginPath();
        ctx.moveTo(x, beltY - 12 * scale);
        ctx.lineTo(x, beltY + 12 * scale);
        ctx.stroke();
      }
    }
    // Fix station (centered arch)
    const stationAppear = interpolate(frame, [5, 18], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (stationAppear > 0) {
      ctx.globalAlpha = fadeAlpha * stationAppear;
      // Station arch
      ctx.strokeStyle = PALETTE.accent.gold;
      ctx.lineWidth = 2.5 * scale;
      ctx.beginPath();
      ctx.arc(stationX, beltY, 25 * scale, Math.PI, 0);
      ctx.stroke();
      // Station label
      ctx.fillStyle = PALETTE.accent.gold;
      ctx.font = `bold ${8 * scale}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText("FIX STATION", stationX, beltY - 30 * scale);
      // Cursor at station
      drawCursor(ctx, stationX - 3 * scale, beltY - 16 * scale, 10 * scale, PALETTE.accent.gold);
      // Scan line effect
      const scanPhase = (frame * 0.1) % 1;
      ctx.strokeStyle = `hsla(50, 60%, 60%, 0.3)`;
      ctx.lineWidth = 1 * scale;
      ctx.beginPath();
      ctx.moveTo(stationX - 20 * scale, beltY - 20 * scale + scanPhase * 30 * scale);
      ctx.lineTo(stationX + 20 * scale, beltY - 20 * scale + scanPhase * 30 * scale);
      ctx.stroke();
    }
    // Belt items moving across
    for (const item of beltItems) {
      const itemFrame = frame - item.startDelay;
      if (itemFrame < 0) continue;
      const moveProgress = interpolate(itemFrame, [0, 70], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const itemX = beltLeft + moveProgress * (beltRight - beltLeft);
      const itemY = beltY + item.yJitter;
      // Before station: red. After station: green.
      const passedStation = itemX > stationX + 15 * scale;
      ctx.globalAlpha = fadeAlpha * 0.85;
      if (passedStation) {
        ctx.fillStyle = `hsla(140, 55%, 55%, 0.8)`;
      } else {
        ctx.fillStyle = `hsla(0, 55%, 50%, 0.7)`;
      }
      ctx.beginPath();
      ctx.arc(itemX, itemY, item.size, 0, Math.PI * 2);
      ctx.fill();
      // Flash at station crossing
      const stationDist = Math.abs(itemX - stationX);
      if (stationDist < 10 * scale) {
        const flashAlpha = 1 - stationDist / (10 * scale);
        ctx.fillStyle = `hsla(50, 70%, 70%, ${flashAlpha * 0.4})`;
        ctx.beginPath();
        ctx.arc(itemX, itemY, item.size * 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    // Labels
    ctx.globalAlpha = fadeAlpha;
    ctx.fillStyle = PALETTE.accent.red;
    ctx.font = `${9 * scale}px system-ui`;
    ctx.textAlign = "center";
    ctx.fillText("errors in", beltLeft + 30 * scale, beltY + 30 * scale);
    ctx.fillStyle = PALETTE.accent.green;
    ctx.fillText("verified out", beltRight - 30 * scale, beltY + 30 * scale);
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V4: React.FC<VariantProps> = ({ width, height }) => {
  // Error Counter Decreasing: large counter starts high, each click decrements. Satisfying countdown.
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const particles = useMemo(() => makeParticles(16, width, height, scale, 28004), [width, height, scale]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, particles, frame, scale);
    const fadeAlpha = fadeInOut(frame, 120);
    ctx.globalAlpha = fadeAlpha;
    // Counter decreases with acceleration (easeInQuad)
    const rawProgress = interpolate(frame, [8, 108], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const easedProgress = rawProgress * rawProgress; // accelerating
    const startCount = 15847;
    const currentCount = Math.max(0, Math.floor(startCount * (1 - easedProgress)));
    // Large counter in center
    const counterAppear = interpolate(frame, [3, 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (counterAppear > 0) {
      ctx.globalAlpha = fadeAlpha * counterAppear;
      // "Errors remaining" title
      ctx.fillStyle = PALETTE.text.dim;
      ctx.font = `${10 * scale}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText("errors remaining", width / 2, height * 0.25);
      // Counter number — size grows as it gets smaller for drama
      const counterSize = interpolate(currentCount, [0, startCount], [52, 36], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const counterColor = currentCount === 0
        ? PALETTE.accent.green
        : currentCount < 1000
          ? PALETTE.accent.gold
          : PALETTE.accent.red;
      ctx.fillStyle = counterColor;
      ctx.font = `bold ${counterSize * scale}px monospace`;
      ctx.textAlign = "center";
      ctx.fillText(currentCount.toLocaleString(), width / 2, height * 0.48);
    }
    // Click bursts: small cursor flashes along the bottom
    const clickRate = 3 + Math.floor(easedProgress * 5); // Gets faster
    if (frame % clickRate < 2 && frame > 10) {
      const rand = seeded(28040 + frame);
      const flashX = width * (0.15 + rand() * 0.7);
      const flashY = height * (0.6 + rand() * 0.15);
      ctx.globalAlpha = fadeAlpha * 0.6;
      drawCursor(ctx, flashX, flashY, 9 * scale, `hsla(${rand() * 360}, 50%, 65%, 0.7)`);
      ctx.fillStyle = `hsla(50, 70%, 70%, 0.3)`;
      ctx.beginPath();
      ctx.arc(flashX + 4 * scale, flashY + 6 * scale, 6 * scale, 0, Math.PI * 2);
      ctx.fill();
    }
    // "Fixed" indicators accumulating
    const fixedCount = startCount - currentCount;
    ctx.globalAlpha = fadeAlpha;
    ctx.fillStyle = PALETTE.accent.green;
    ctx.font = `${10 * scale}px monospace`;
    ctx.textAlign = "center";
    ctx.fillText(`${fixedCount.toLocaleString()} fixed`, width / 2, height * 0.58);
    // Progress bar
    const barX = width * 0.2;
    const barW = width * 0.6;
    const barY = height * 0.66;
    const barH = 6 * scale;
    ctx.fillStyle = `hsla(0, 30%, 25%, 0.4)`;
    ctx.fillRect(barX, barY, barW, barH);
    ctx.fillStyle = PALETTE.accent.green;
    ctx.fillRect(barX, barY, barW * easedProgress, barH);
    ctx.strokeStyle = `hsla(220, 30%, 40%, 0.4)`;
    ctx.lineWidth = 1 * scale;
    ctx.strokeRect(barX, barY, barW, barH);
    // Victory flash when reaching 0
    if (currentCount === 0) {
      const victoryAlpha = interpolate(frame, [108, 115], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      if (victoryAlpha > 0) {
        ctx.globalAlpha = fadeAlpha * victoryAlpha;
        drawCheck(ctx, width / 2, height * 0.43, 30 * scale, PALETTE.accent.green);
      }
    }
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V5: React.FC<VariantProps> = ({ width, height }) => {
  // Rapid Click Bursts: multiple cursors appear simultaneously, click in bursts, screen fills with checks.
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const particles = useMemo(() => makeParticles(14, width, height, scale, 28005), [width, height, scale]);
  const cursors = useMemo(() => {
    const rand = seeded(28051);
    return Array.from({ length: 4 }, (_, i) => ({
      hue: PALETTE.cellColors[i * 2][0],
      startX: 0.1 + rand() * 0.3,
      startY: 0.15 + i * 0.18,
    }));
  }, []);
  const checks = useMemo(() => {
    const rand = seeded(28052);
    return Array.from({ length: 40 }, (_, i) => ({
      x: width * (0.05 + rand() * 0.9),
      y: height * (0.08 + rand() * 0.72),
      size: (6 + rand() * 4) * scale,
      appearFrame: 10 + i * 2.5,
      cursorIdx: Math.floor(rand() * 4),
    }));
  }, [width, height, scale]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, particles, frame, scale);
    const fadeAlpha = fadeInOut(frame, 120);
    ctx.globalAlpha = fadeAlpha;
    // Green checks accumulating
    for (const check of checks) {
      const localFrame = frame - check.appearFrame;
      if (localFrame < 0) continue;
      const checkGrow = interpolate(localFrame, [0, 4], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      ctx.globalAlpha = fadeAlpha * checkGrow * 0.7;
      drawCheck(ctx, check.x, check.y, check.size * checkGrow, PALETTE.accent.green);
      // Flash at appear
      if (localFrame < 3) {
        const flashAlpha = 1 - localFrame / 3;
        ctx.globalAlpha = fadeAlpha * flashAlpha * 0.4;
        ctx.fillStyle = `hsla(50, 70%, 70%, 0.4)`;
        ctx.beginPath();
        ctx.arc(check.x, check.y, check.size * 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    // Cursors: each follows its own path, jumping to its assigned checks
    for (let ci = 0; ci < cursors.length; ci++) {
      const cursor = cursors[ci];
      const cursorAppear = interpolate(frame, [5 + ci * 5, 12 + ci * 5], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      if (cursorAppear <= 0) continue;
      // Find current target for this cursor
      let targetX = cursor.startX * width;
      let targetY = cursor.startY * height;
      for (const check of checks) {
        if (check.cursorIdx !== ci) continue;
        if (frame >= check.appearFrame - 2 && frame <= check.appearFrame + 2) {
          targetX = check.x;
          targetY = check.y;
          break;
        }
        if (frame < check.appearFrame) {
          targetX = check.x;
          targetY = check.y;
          break;
        }
      }
      ctx.globalAlpha = fadeAlpha * cursorAppear;
      drawCursor(ctx, targetX - 4 * scale, targetY - 6 * scale, 10 * scale, `hsla(${cursor.hue}, 55%, 65%, 0.85)`);
    }
    // Counter
    let totalChecks = 0;
    for (const check of checks) {
      if (frame >= check.appearFrame + 2) totalChecks++;
    }
    ctx.globalAlpha = fadeAlpha;
    ctx.fillStyle = PALETTE.accent.green;
    ctx.font = `bold ${13 * scale}px monospace`;
    ctx.textAlign = "center";
    ctx.fillText(`${totalChecks} verified`, width / 2, height * 0.92);
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V6: React.FC<VariantProps> = ({ width, height }) => {
  // Red-to-Green Sweep: horizontal sweep line moves left to right. Behind: green. Ahead: red.
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const particles = useMemo(() => makeParticles(16, width, height, scale, 28006), [width, height, scale]);
  const dots = useMemo(() => {
    const rand = seeded(28061);
    return Array.from({ length: 50 }, () => ({
      x: rand(),
      y: 0.08 + rand() * 0.72,
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
    // Sweep line position
    const sweepX = interpolate(frame, [8, 108], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    // Dots: green if behind sweep, red if ahead
    for (const dot of dots) {
      ctx.globalAlpha = fadeAlpha * 0.8;
      const dotX = dot.x * width;
      const dotY = dot.y * height;
      if (dot.x < sweepX) {
        ctx.fillStyle = `hsla(140, 55%, 55%, 0.7)`;
      } else {
        const pulse = 0.5 + Math.sin(frame * 0.05 + dot.x * 20) * 0.2;
        ctx.fillStyle = `hsla(0, 55%, 50%, ${pulse})`;
      }
      ctx.beginPath();
      ctx.arc(dotX, dotY, dot.size, 0, Math.PI * 2);
      ctx.fill();
    }
    // Sweep line itself
    ctx.globalAlpha = fadeAlpha;
    const lineX = sweepX * width;
    // Glow
    const sweepGrad = ctx.createLinearGradient(lineX - 15 * scale, 0, lineX + 15 * scale, 0);
    sweepGrad.addColorStop(0, `hsla(50, 60%, 60%, 0)`);
    sweepGrad.addColorStop(0.5, `hsla(50, 60%, 60%, 0.2)`);
    sweepGrad.addColorStop(1, `hsla(50, 60%, 60%, 0)`);
    ctx.fillStyle = sweepGrad;
    ctx.fillRect(lineX - 15 * scale, height * 0.05, 30 * scale, height * 0.8);
    // Line
    ctx.strokeStyle = PALETTE.accent.gold;
    ctx.lineWidth = 2 * scale;
    ctx.beginPath();
    ctx.moveTo(lineX, height * 0.05);
    ctx.lineTo(lineX, height * 0.85);
    ctx.stroke();
    // Cursor at sweep line center
    const cursorBob = Math.sin(frame * 0.1) * 6 * scale;
    drawCursor(ctx, lineX - 5 * scale, height * 0.4 + cursorBob, 11 * scale, PALETTE.accent.gold);
    // Click flashes near sweep line
    if (frame % 4 < 2 && frame > 10) {
      const rand = seeded(28062 + frame);
      const flashY = height * (0.15 + rand() * 0.6);
      ctx.fillStyle = `hsla(50, 70%, 70%, 0.3)`;
      ctx.beginPath();
      ctx.arc(lineX, flashY, 5 * scale, 0, Math.PI * 2);
      ctx.fill();
    }
    // Labels
    const labelAlpha = interpolate(frame, [15, 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (labelAlpha > 0) {
      ctx.globalAlpha = fadeAlpha * labelAlpha;
      ctx.font = `${9 * scale}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillStyle = PALETTE.accent.green;
      ctx.fillText("verified", Math.max(40 * scale, lineX / 2), height * 0.9);
      ctx.fillStyle = PALETTE.accent.red;
      ctx.fillText("unchecked", Math.min(width - 40 * scale, lineX + (width - lineX) / 2), height * 0.9);
    }
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V7: React.FC<VariantProps> = ({ width, height }) => {
  // Fix Cascade (BFS): start from one fixed node, cascade spreads outward fixing adjacent nodes.
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const particles = useMemo(() => makeParticles(14, width, height, scale, 28007), [width, height, scale]);
  const graph = useMemo(() => {
    const rand = seeded(28071);
    const nodes: { x: number; y: number; ring: number }[] = [];
    // Center node
    nodes.push({ x: width / 2, y: height * 0.42, ring: 0 });
    // Ring 1: 6 nodes
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2 - Math.PI / 2;
      const dist = 35 * scale;
      nodes.push({ x: width / 2 + Math.cos(angle) * dist, y: height * 0.42 + Math.sin(angle) * dist, ring: 1 });
    }
    // Ring 2: 12 nodes
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2 - Math.PI / 2 + 0.15;
      const dist = 70 * scale;
      nodes.push({ x: width / 2 + Math.cos(angle) * dist + (rand() - 0.5) * 8 * scale, y: height * 0.42 + Math.sin(angle) * dist + (rand() - 0.5) * 8 * scale, ring: 2 });
    }
    // Ring 3: 18 nodes
    for (let i = 0; i < 18; i++) {
      const angle = (i / 18) * Math.PI * 2 - Math.PI / 2 + 0.1;
      const dist = 105 * scale;
      nodes.push({ x: width / 2 + Math.cos(angle) * dist + (rand() - 0.5) * 12 * scale, y: height * 0.42 + Math.sin(angle) * dist + (rand() - 0.5) * 12 * scale, ring: 3 });
    }
    // Edges: connect rings
    const edges: [number, number][] = [];
    // Ring 0 to 1
    for (let i = 1; i <= 6; i++) edges.push([0, i]);
    // Ring 1 to 2
    for (let i = 0; i < 6; i++) {
      edges.push([1 + i, 7 + i * 2]);
      edges.push([1 + i, 7 + i * 2 + 1]);
    }
    // Ring 2 to 3
    for (let i = 0; i < 12; i++) {
      edges.push([7 + i, 19 + Math.floor(i * 1.5)]);
      if (19 + Math.floor(i * 1.5) + 1 < nodes.length) {
        edges.push([7 + i, 19 + Math.floor(i * 1.5) + 1]);
      }
    }
    return { nodes, edges };
  }, [width, height, scale]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, particles, frame, scale);
    const fadeAlpha = fadeInOut(frame, 120);
    ctx.globalAlpha = fadeAlpha;
    // Cascade timing: ring 0 fixed at frame 10, ring 1 at 30, ring 2 at 55, ring 3 at 80
    const ringTimes = [10, 30, 55, 80];
    // Edges
    ctx.strokeStyle = `hsla(220, 25%, 40%, 0.2)`;
    ctx.lineWidth = 1 * scale;
    for (const [a, b] of graph.edges) {
      if (a >= graph.nodes.length || b >= graph.nodes.length) continue;
      const na = graph.nodes[a];
      const nb = graph.nodes[b];
      const edgeAppear = interpolate(frame, [ringTimes[Math.min(na.ring, nb.ring)], ringTimes[Math.min(na.ring, nb.ring)] + 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      if (edgeAppear <= 0) continue;
      ctx.globalAlpha = fadeAlpha * edgeAppear * 0.3;
      ctx.beginPath();
      ctx.moveTo(na.x, na.y);
      ctx.lineTo(na.x + (nb.x - na.x) * edgeAppear, na.y + (nb.y - na.y) * edgeAppear);
      ctx.stroke();
    }
    // Nodes
    for (const node of graph.nodes) {
      const fixFrame = ringTimes[node.ring];
      const nodeAppear = interpolate(frame, [fixFrame - 5, fixFrame], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const isFixed = frame >= fixFrame + 5;
      const fixing = frame >= fixFrame && frame < fixFrame + 5;
      ctx.globalAlpha = fadeAlpha * Math.max(0.3, nodeAppear);
      if (isFixed) {
        ctx.fillStyle = `hsla(140, 55%, 55%, 0.75)`;
      } else if (fixing) {
        const flash = 0.5 + Math.sin((frame - fixFrame) * 0.8) * 0.5;
        ctx.fillStyle = `hsla(50, 65%, 60%, ${flash})`;
      } else {
        ctx.fillStyle = `hsla(0, 50%, 45%, 0.5)`;
      }
      ctx.beginPath();
      ctx.arc(node.x, node.y, 4 * scale, 0, Math.PI * 2);
      ctx.fill();
      // Ripple at fix moment
      const rippleFrame = frame - fixFrame;
      if (rippleFrame >= 0 && rippleFrame < 8) {
        const rippleAlpha = 1 - rippleFrame / 8;
        ctx.strokeStyle = `hsla(50, 60%, 60%, ${rippleAlpha * 0.5})`;
        ctx.lineWidth = 1.5 * scale;
        ctx.beginPath();
        ctx.arc(node.x, node.y, 4 * scale + rippleFrame * 3 * scale, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
    // Cursor at the current ring's frontier
    const currentRing = frame < 30 ? 0 : frame < 55 ? 1 : frame < 80 ? 2 : 3;
    const frontierNode = graph.nodes.find(n => n.ring === currentRing) || graph.nodes[0];
    ctx.globalAlpha = fadeAlpha;
    drawCursor(ctx, frontierNode.x - 5 * scale, frontierNode.y - 10 * scale, 11 * scale, PALETTE.accent.gold);
    // Label
    const labelAlpha = interpolate(frame, [85, 100], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (labelAlpha > 0) {
      ctx.globalAlpha = fadeAlpha * labelAlpha;
      ctx.fillStyle = PALETTE.text.dim;
      ctx.font = `${11 * scale}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText("fixes cascade outward", width / 2, height * 0.88);
    }
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V8: React.FC<VariantProps> = ({ width, height }) => {
  // Verification Stamps: large rubber-stamp "VERIFIED" stamps appear across sections, slight rotation.
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const particles = useMemo(() => makeParticles(16, width, height, scale, 28008), [width, height, scale]);
  const stamps = useMemo(() => {
    const rand = seeded(28081);
    return Array.from({ length: 8 }, (_, i) => ({
      x: width * (0.15 + (i % 4) * 0.22),
      y: height * (0.2 + Math.floor(i / 4) * 0.35),
      rotation: (rand() - 0.5) * 0.3,
      delay: 10 + i * 11,
    }));
  }, [width, height]);
  // Background blobs to stamp over
  const blobs = useMemo(() => {
    const rand = seeded(28082);
    return Array.from({ length: 30 }, () => ({
      x: width * (0.05 + rand() * 0.9),
      y: height * (0.08 + rand() * 0.7),
      radius: (2.5 + rand() * 3) * scale,
      hue: 200 + rand() * 80,
    }));
  }, [width, height, scale]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, particles, frame, scale);
    const fadeAlpha = fadeInOut(frame, 120);
    ctx.globalAlpha = fadeAlpha;
    // EM blobs background
    const blobAppear = interpolate(frame, [3, 15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    for (const blob of blobs) {
      ctx.globalAlpha = fadeAlpha * blobAppear * 0.5;
      ctx.fillStyle = `hsla(${blob.hue}, 35%, 45%, 0.5)`;
      ctx.beginPath();
      ctx.arc(blob.x, blob.y, blob.radius, 0, Math.PI * 2);
      ctx.fill();
    }
    // Stamps
    for (const stamp of stamps) {
      const localFrame = frame - stamp.delay;
      if (localFrame < 0) continue;
      // Stamp down animation: starts big, slams down
      const slamProgress = interpolate(localFrame, [0, 4], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const stampScale = 1 + (1 - slamProgress) * 2;
      ctx.globalAlpha = fadeAlpha * slamProgress;
      ctx.save();
      ctx.translate(stamp.x, stamp.y);
      ctx.rotate(stamp.rotation);
      ctx.scale(stampScale, stampScale);
      // Stamp border
      const stampW = 55 * scale;
      const stampH = 22 * scale;
      ctx.strokeStyle = `hsla(140, 55%, 55%, ${slamProgress * 0.8})`;
      ctx.lineWidth = 2.5 * scale;
      ctx.strokeRect(-stampW / 2, -stampH / 2, stampW, stampH);
      // "VERIFIED" text
      ctx.fillStyle = `hsla(140, 55%, 55%, ${slamProgress * 0.8})`;
      ctx.font = `bold ${10 * scale}px monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("VERIFIED \u2713", 0, 0);
      ctx.restore();
      // Impact flash
      if (localFrame >= 2 && localFrame < 5) {
        const flashAlpha = 1 - (localFrame - 2) / 3;
        ctx.globalAlpha = fadeAlpha * flashAlpha * 0.3;
        ctx.fillStyle = `hsla(140, 60%, 60%, 0.3)`;
        ctx.beginPath();
        ctx.arc(stamp.x, stamp.y, 35 * scale, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    // Counter
    let stampCount = 0;
    for (const stamp of stamps) {
      if (frame >= stamp.delay + 4) stampCount++;
    }
    ctx.globalAlpha = fadeAlpha;
    ctx.fillStyle = PALETTE.accent.green;
    ctx.font = `bold ${12 * scale}px monospace`;
    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";
    ctx.fillText(`${stampCount} sections verified`, width / 2, height * 0.92);
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V9: React.FC<VariantProps> = ({ width, height }) => {
  // Quality Control Gate: blobs approach from left, pass through scan gate. Pass: green check. Fail: pulled aside, fixed.
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const particles = useMemo(() => makeParticles(16, width, height, scale, 28009), [width, height, scale]);
  const items = useMemo(() => {
    const rand = seeded(28091);
    return Array.from({ length: 12 }, (_, i) => ({
      startDelay: i * 9,
      size: (3 + rand() * 3) * scale,
      needsFix: rand() < 0.3,
      hue: PALETTE.cellColors[Math.floor(rand() * 8)][0],
    }));
  }, [scale]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, particles, frame, scale);
    const fadeAlpha = fadeInOut(frame, 120);
    ctx.globalAlpha = fadeAlpha;
    const gateX = width * 0.5;
    const mainY = height * 0.4;
    const fixY = height * 0.65;
    // Gate structure
    const gateAppear = interpolate(frame, [2, 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (gateAppear > 0) {
      ctx.globalAlpha = fadeAlpha * gateAppear;
      // Gate pillars
      ctx.strokeStyle = `hsla(220, 40%, 50%, 0.7)`;
      ctx.lineWidth = 3 * scale;
      ctx.beginPath();
      ctx.moveTo(gateX, mainY - 25 * scale);
      ctx.lineTo(gateX, mainY + 25 * scale);
      ctx.stroke();
      // Gate top arch
      ctx.strokeStyle = PALETTE.accent.gold;
      ctx.lineWidth = 2 * scale;
      ctx.beginPath();
      ctx.arc(gateX, mainY, 20 * scale, -Math.PI * 0.8, -Math.PI * 0.2);
      ctx.stroke();
      // Scan line (animated)
      const scanY = mainY - 18 * scale + (Math.sin(frame * 0.15) * 0.5 + 0.5) * 36 * scale;
      ctx.strokeStyle = `hsla(50, 60%, 60%, 0.4)`;
      ctx.lineWidth = 1 * scale;
      ctx.beginPath();
      ctx.moveTo(gateX - 12 * scale, scanY);
      ctx.lineTo(gateX + 12 * scale, scanY);
      ctx.stroke();
      // Label
      ctx.fillStyle = PALETTE.accent.gold;
      ctx.font = `bold ${7 * scale}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText("QC GATE", gateX, mainY - 30 * scale);
    }
    // Items moving through
    for (const item of items) {
      const itemFrame = frame - item.startDelay;
      if (itemFrame < 0) continue;
      ctx.globalAlpha = fadeAlpha * 0.85;
      // Pre-gate phase: moving right toward gate
      if (!item.needsFix) {
        // Clean pass: straight through
        const moveProgress = interpolate(itemFrame, [0, 50], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        const itemX = width * 0.08 + moveProgress * width * 0.84;
        const isPassedGate = itemX > gateX + 15 * scale;
        if (isPassedGate) {
          ctx.fillStyle = `hsla(140, 55%, 55%, 0.8)`;
        } else {
          ctx.fillStyle = `hsla(${item.hue}, 45%, 50%, 0.7)`;
        }
        ctx.beginPath();
        ctx.arc(itemX, mainY, item.size, 0, Math.PI * 2);
        ctx.fill();
        // Check appears after passing gate
        if (isPassedGate) {
          drawCheck(ctx, itemX, mainY - item.size * 2, item.size * 1.2, PALETTE.accent.green);
        }
      } else {
        // Needs fix: approach gate, get pulled down, fixed, sent back through
        const approachProgress = interpolate(itemFrame, [0, 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        const pullDown = interpolate(itemFrame, [20, 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        const fixProgress = interpolate(itemFrame, [32, 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        const returnProgress = interpolate(itemFrame, [40, 55], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        const finalPass = interpolate(itemFrame, [55, 70], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        let itemX: number, itemY: number;
        let isGreen = false;
        if (returnProgress > 0 && finalPass <= 0) {
          // Return to gate
          itemX = gateX - 15 * scale;
          itemY = fixY + (mainY - fixY) * returnProgress;
          isGreen = true;
        } else if (finalPass > 0) {
          // Pass through gate after fix
          itemX = gateX + finalPass * (width * 0.4);
          itemY = mainY;
          isGreen = true;
        } else if (pullDown > 0) {
          // Pull down to fix lane
          itemX = gateX - 5 * scale;
          itemY = mainY + (fixY - mainY) * pullDown;
          isGreen = fixProgress > 0.5;
        } else {
          // Approaching gate
          itemX = width * 0.08 + approachProgress * (gateX - width * 0.08 - 15 * scale);
          itemY = mainY;
        }
        ctx.fillStyle = isGreen ? `hsla(140, 55%, 55%, 0.8)` : `hsla(0, 55%, 50%, 0.7)`;
        ctx.beginPath();
        ctx.arc(itemX, itemY, item.size, 0, Math.PI * 2);
        ctx.fill();
        // Fix flash
        if (fixProgress > 0 && fixProgress < 1) {
          ctx.fillStyle = `hsla(50, 70%, 70%, ${(1 - fixProgress) * 0.4})`;
          ctx.beginPath();
          ctx.arc(itemX, itemY, item.size * 3, 0, Math.PI * 2);
          ctx.fill();
          // Cursor fixing
          drawCursor(ctx, itemX - 8 * scale, itemY - 10 * scale, 10 * scale, PALETTE.accent.gold);
        }
        // X mark on rejected item
        if (pullDown > 0 && !isGreen) {
          drawX(ctx, itemX + 8 * scale, itemY - 8 * scale, 6 * scale, PALETTE.accent.red);
        }
        // Check on final pass
        if (finalPass > 0 && isGreen) {
          drawCheck(ctx, itemX, itemY - item.size * 2, item.size * 1.2, PALETTE.accent.green);
        }
      }
    }
    // Fix lane label
    ctx.globalAlpha = fadeAlpha * 0.5;
    ctx.fillStyle = PALETTE.text.dim;
    ctx.font = `${7 * scale}px system-ui`;
    ctx.textAlign = "center";
    ctx.fillText("fix lane", gateX - 35 * scale, fixY + 15 * scale);
    // Bottom label
    const bottomAlpha = interpolate(frame, [60, 80], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (bottomAlpha > 0) {
      ctx.globalAlpha = fadeAlpha * bottomAlpha;
      ctx.fillStyle = PALETTE.text.dim;
      ctx.font = `${11 * scale}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText("every connection verified", width / 2, height * 0.9);
    }
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

export const VARIANTS_SHOT_028: VariantDef[] = [
  { id: "cursor-hop", label: "Cursor Hop", component: V1 },
  { id: "whack-a-mole", label: "Whack-a-Mole", component: V2 },
  { id: "conveyor-belt", label: "Conveyor Belt", component: V3 },
  { id: "error-countdown", label: "Error Countdown", component: V4 },
  { id: "rapid-clicks", label: "Rapid Click Bursts", component: V5 },
  { id: "sweep-line", label: "Red-to-Green Sweep", component: V6 },
  { id: "fix-cascade", label: "Fix Cascade", component: V7 },
  { id: "verification-stamps", label: "Verification Stamps", component: V8 },
  { id: "qc-gate", label: "Quality Control Gate", component: V9 },
];
