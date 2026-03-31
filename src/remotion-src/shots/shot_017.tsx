import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantDef, VariantProps } from "../types";
import { seeded, drawBg, makeParticles, drawParticles, PALETTE, fadeInOut } from "../scenes/theme";
import { drawCamera } from "../icons";

// Shot 17 — "Each section gets collected onto a tape and fed through the electron beam one by one."
// 120 frames (4s). Tape conveyor feeding sections through an electron beam.

/* ── V1: Conveyor Belt ── */
const V1: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const particles = useMemo(() => makeParticles(18, width, height, scale), [width, height, scale]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, particles, frame, scale);
    const fadeAlpha = fadeInOut(frame, 120);
    ctx.globalAlpha = fadeAlpha;

    const beltY = height * 0.5;
    const beltH = 6 * scale;
    const sectionCount = 8;
    const sectionW = 22 * scale;
    const sectionH = 16 * scale;
    const spacing = 38 * scale;
    const beamX = width * 0.55;

    // Belt travel: sections move left-to-right
    const travelProgress = interpolate(frame, [10, 110], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const beltOffset = travelProgress * spacing * sectionCount;

    // Belt track
    ctx.fillStyle = "hsla(220, 15%, 25%, 0.5)";
    ctx.fillRect(width * 0.05, beltY - beltH / 2, width * 0.9, beltH);
    // Belt track lines (moving)
    ctx.strokeStyle = "hsla(220, 15%, 35%, 0.3)";
    ctx.lineWidth = 1 * scale;
    for (let i = 0; i < 30; i++) {
      const lx = ((i * 15 * scale + beltOffset * 0.3) % (width * 0.9)) + width * 0.05;
      ctx.beginPath();
      ctx.moveTo(lx, beltY - beltH / 2);
      ctx.lineTo(lx, beltY + beltH / 2);
      ctx.stroke();
    }

    // Electron beam column
    const beamAlpha = interpolate(frame, [5, 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const beamGrad = ctx.createLinearGradient(beamX, height * 0.1, beamX, beltY - sectionH);
    beamGrad.addColorStop(0, `hsla(180, 80%, 70%, ${beamAlpha * 0.05})`);
    beamGrad.addColorStop(0.5, `hsla(180, 80%, 70%, ${beamAlpha * 0.4})`);
    beamGrad.addColorStop(1, `hsla(180, 90%, 80%, ${beamAlpha * 0.8})`);
    ctx.fillStyle = beamGrad;
    ctx.fillRect(beamX - 4 * scale, height * 0.1, 8 * scale, beltY - sectionH - height * 0.1);
    // Beam glow at impact
    const impactGlow = ctx.createRadialGradient(beamX, beltY - sectionH * 0.5, 0, beamX, beltY - sectionH * 0.5, 15 * scale);
    impactGlow.addColorStop(0, `hsla(180, 90%, 85%, ${beamAlpha * 0.5})`);
    impactGlow.addColorStop(1, `hsla(180, 80%, 70%, 0)`);
    ctx.fillStyle = impactGlow;
    ctx.beginPath();
    ctx.arc(beamX, beltY - sectionH * 0.5, 15 * scale, 0, Math.PI * 2);
    ctx.fill();

    // Sections on tape
    for (let i = 0; i < sectionCount; i++) {
      const baseX = width * 0.08 + i * spacing;
      const sectionX = baseX + beltOffset - spacing * 2;
      if (sectionX < width * 0.02 || sectionX > width * 0.95) continue;
      const nearBeam = Math.abs(sectionX - beamX) < spacing * 0.4;
      const hue = nearBeam ? 180 : 45;
      const brightness = nearBeam ? 70 : 55;
      ctx.fillStyle = `hsla(${hue}, 50%, ${brightness}%, 0.7)`;
      ctx.fillRect(sectionX - sectionW / 2, beltY - sectionH - beltH / 2, sectionW, sectionH);
      ctx.strokeStyle = `hsla(${hue}, 60%, ${brightness + 10}%, 0.5)`;
      ctx.lineWidth = 1 * scale;
      ctx.strokeRect(sectionX - sectionW / 2, beltY - sectionH - beltH / 2, sectionW, sectionH);
      // Section number
      ctx.fillStyle = PALETTE.text.dim;
      ctx.font = `${6 * scale}px monospace`;
      ctx.textAlign = "center";
      ctx.fillText(`${i + 1}`, sectionX, beltY - sectionH / 2 - beltH / 2 + 2 * scale);
    }

    // Detector below beam
    drawCamera(ctx, beamX, beltY + 30 * scale, 20 * scale, PALETTE.text.primary);

    // Labels
    ctx.fillStyle = PALETTE.text.dim;
    ctx.font = `${8 * scale}px system-ui`;
    ctx.textAlign = "left";
    ctx.fillText("tape \u2192", width * 0.06, beltY + 18 * scale);
    ctx.textAlign = "center";
    ctx.fillText("electron beam", beamX, height * 0.08);
    ctx.fillText("detector \u2192 image", beamX, beltY + 50 * scale);

    // Arrow showing tape direction
    ctx.strokeStyle = PALETTE.text.dim;
    ctx.lineWidth = 1.5 * scale;
    ctx.beginPath();
    ctx.moveTo(width * 0.85, beltY + 12 * scale);
    ctx.lineTo(width * 0.92, beltY + 12 * scale);
    ctx.lineTo(width * 0.89, beltY + 8 * scale);
    ctx.moveTo(width * 0.92, beltY + 12 * scale);
    ctx.lineTo(width * 0.89, beltY + 16 * scale);
    ctx.stroke();

    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

/* ── V2: Top-Down Tape ── */
const V2: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const particles = useMemo(() => makeParticles(15, width, height, scale), [width, height, scale]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, particles, frame, scale);
    const fadeAlpha = fadeInOut(frame, 120);
    ctx.globalAlpha = fadeAlpha;

    const leftReelX = width * 0.15;
    const rightReelX = width * 0.85;
    const reelY = height * 0.5;
    const reelR = 28 * scale;
    const tapeY = reelY;
    const beamX = width * 0.5;
    const sectionCount = 10;
    const sectionW = 14 * scale;
    const sectionH = 10 * scale;

    const windProgress = interpolate(frame, [8, 110], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

    // Left reel (supply — shrinks)
    const leftR = reelR * (1 - windProgress * 0.5);
    ctx.strokeStyle = "hsla(220, 40%, 55%, 0.6)";
    ctx.lineWidth = 2 * scale;
    ctx.beginPath();
    ctx.arc(leftReelX, reelY, leftR, 0, Math.PI * 2);
    ctx.stroke();
    // Reel spokes rotate
    for (let i = 0; i < 4; i++) {
      const angle = (i * Math.PI) / 2 + windProgress * Math.PI * 6;
      ctx.beginPath();
      ctx.moveTo(leftReelX, reelY);
      ctx.lineTo(leftReelX + Math.cos(angle) * leftR * 0.8, reelY + Math.sin(angle) * leftR * 0.8);
      ctx.stroke();
    }

    // Right reel (take-up — grows)
    const rightR = reelR * (0.5 + windProgress * 0.5);
    ctx.beginPath();
    ctx.arc(rightReelX, reelY, rightR, 0, Math.PI * 2);
    ctx.stroke();
    for (let i = 0; i < 4; i++) {
      const angle = (i * Math.PI) / 2 - windProgress * Math.PI * 6;
      ctx.beginPath();
      ctx.moveTo(rightReelX, reelY);
      ctx.lineTo(rightReelX + Math.cos(angle) * rightR * 0.8, reelY + Math.sin(angle) * rightR * 0.8);
      ctx.stroke();
    }

    // Tape between reels
    ctx.strokeStyle = "hsla(45, 30%, 45%, 0.5)";
    ctx.lineWidth = 3 * scale;
    ctx.beginPath();
    ctx.moveTo(leftReelX + leftR, tapeY);
    ctx.lineTo(rightReelX - rightR, tapeY);
    ctx.stroke();

    // Sections on tape
    const tapeStart = leftReelX + leftR + 5 * scale;
    const tapeEnd = rightReelX - rightR - 5 * scale;
    const tapeLen = tapeEnd - tapeStart;
    for (let i = 0; i < sectionCount; i++) {
      const frac = (i + 0.5) / sectionCount;
      const sx = tapeStart + frac * tapeLen;
      const nearBeam = Math.abs(sx - beamX) < tapeLen / sectionCount * 0.6;
      const hue = nearBeam ? 180 : 45;
      ctx.fillStyle = `hsla(${hue}, 50%, ${nearBeam ? 70 : 50}%, 0.6)`;
      ctx.fillRect(sx - sectionW / 2, tapeY - sectionH / 2, sectionW, sectionH);
    }

    // Beam spot
    const beamAlpha = interpolate(frame, [5, 18], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const pulse = 0.7 + 0.3 * Math.sin(frame * 0.15);
    const spotGlow = ctx.createRadialGradient(beamX, tapeY, 0, beamX, tapeY, 20 * scale);
    spotGlow.addColorStop(0, `hsla(180, 90%, 85%, ${beamAlpha * pulse * 0.7})`);
    spotGlow.addColorStop(0.5, `hsla(180, 80%, 65%, ${beamAlpha * pulse * 0.3})`);
    spotGlow.addColorStop(1, `hsla(180, 70%, 55%, 0)`);
    ctx.fillStyle = spotGlow;
    ctx.beginPath();
    ctx.arc(beamX, tapeY, 20 * scale, 0, Math.PI * 2);
    ctx.fill();

    // Image output stack on right
    const stackX = rightReelX;
    const imagesCollected = Math.floor(windProgress * 7);
    for (let i = 0; i < imagesCollected; i++) {
      ctx.fillStyle = `hsla(0, 0%, ${40 + i * 5}%, 0.5)`;
      ctx.fillRect(stackX - 10 * scale, reelY + 45 * scale - i * 3 * scale, 20 * scale, 14 * scale);
    }

    // Labels
    ctx.fillStyle = PALETTE.text.dim;
    ctx.font = `${8 * scale}px system-ui`;
    ctx.textAlign = "center";
    ctx.fillText("supply reel", leftReelX, reelY - leftR - 8 * scale);
    ctx.fillText("take-up reel", rightReelX, reelY - rightR - 8 * scale);
    ctx.fillStyle = PALETTE.text.accent;
    ctx.fillText("beam", beamX, tapeY - 22 * scale);
    if (imagesCollected > 0) {
      ctx.fillStyle = PALETTE.text.dim;
      ctx.fillText(`${imagesCollected} images`, stackX, reelY + 65 * scale);
    }

    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

/* ── V3: Assembly Line ── */
const V3: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const particles = useMemo(() => makeParticles(15, width, height, scale), [width, height, scale]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, particles, frame, scale);
    const fadeAlpha = fadeInOut(frame, 120);
    ctx.globalAlpha = fadeAlpha;

    const stationLabels = ["load section", "scan with beam", "capture image"];
    const stationCount = 3;
    const stationW = width * 0.22;
    const stationH = height * 0.35;
    const stationGap = (width - stationCount * stationW) / (stationCount + 1);
    const stationY = height * 0.3;
    const beltY = stationY + stationH + 10 * scale;

    // Conveyor belt
    ctx.fillStyle = "hsla(220, 15%, 22%, 0.6)";
    ctx.fillRect(stationGap * 0.5, beltY, width - stationGap, 5 * scale);

    // Stations
    for (let i = 0; i < stationCount; i++) {
      const sx = stationGap * (i + 1) + stationW * i;
      const stationAppear = interpolate(frame, [5 + i * 8, 15 + i * 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      if (stationAppear <= 0) continue;
      ctx.globalAlpha = fadeAlpha * stationAppear;

      // Station box
      const hue = [45, 180, 140][i];
      ctx.strokeStyle = `hsla(${hue}, 40%, 50%, 0.5)`;
      ctx.lineWidth = 1.5 * scale;
      ctx.strokeRect(sx, stationY, stationW, stationH);
      ctx.fillStyle = `hsla(${hue}, 30%, 25%, 0.3)`;
      ctx.fillRect(sx, stationY, stationW, stationH);

      // Station label
      ctx.fillStyle = PALETTE.text.primary;
      ctx.font = `${8 * scale}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText(stationLabels[i], sx + stationW / 2, stationY + 14 * scale);

      // Station light
      const cycleFrame = (frame - 20) % 60;
      const activeStation = Math.floor(cycleFrame / 20);
      const isActive = activeStation === i && frame > 20;
      const lightColor = isActive ? `hsla(120, 70%, 60%, 0.9)` : `hsla(0, 0%, 35%, 0.4)`;
      ctx.fillStyle = lightColor;
      ctx.beginPath();
      ctx.arc(sx + stationW / 2, stationY + stationH - 12 * scale, 4 * scale, 0, Math.PI * 2);
      ctx.fill();
      if (isActive) {
        const glw = ctx.createRadialGradient(sx + stationW / 2, stationY + stationH - 12 * scale, 0, sx + stationW / 2, stationY + stationH - 12 * scale, 12 * scale);
        glw.addColorStop(0, "hsla(120, 70%, 60%, 0.3)");
        glw.addColorStop(1, "hsla(120, 70%, 60%, 0)");
        ctx.fillStyle = glw;
        ctx.beginPath();
        ctx.arc(sx + stationW / 2, stationY + stationH - 12 * scale, 12 * scale, 0, Math.PI * 2);
        ctx.fill();
      }

      // Station icon
      const iconY = stationY + stationH * 0.5;
      if (i === 0) {
        // Load: small rectangle
        ctx.fillStyle = `hsla(45, 55%, 55%, 0.7)`;
        ctx.fillRect(sx + stationW / 2 - 8 * scale, iconY - 5 * scale, 16 * scale, 10 * scale);
      } else if (i === 1) {
        // Beam: vertical cyan line
        ctx.strokeStyle = `hsla(180, 80%, 70%, 0.8)`;
        ctx.lineWidth = 2 * scale;
        ctx.beginPath();
        ctx.moveTo(sx + stationW / 2, iconY - 15 * scale);
        ctx.lineTo(sx + stationW / 2, iconY + 15 * scale);
        ctx.stroke();
      } else {
        drawCamera(ctx, sx + stationW / 2, iconY, 18 * scale, `hsla(140, 50%, 60%, 0.8)`);
      }

      // Arrows between stations
      if (i < stationCount - 1) {
        ctx.strokeStyle = PALETTE.text.dim;
        ctx.lineWidth = 1.5 * scale;
        const arrowX = sx + stationW + stationGap * 0.3;
        const arrowEndX = sx + stationW + stationGap * 0.7;
        ctx.beginPath();
        ctx.moveTo(arrowX, stationY + stationH / 2);
        ctx.lineTo(arrowEndX, stationY + stationH / 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(arrowEndX - 4 * scale, stationY + stationH / 2 - 4 * scale);
        ctx.lineTo(arrowEndX, stationY + stationH / 2);
        ctx.lineTo(arrowEndX - 4 * scale, stationY + stationH / 2 + 4 * scale);
        ctx.stroke();
      }
    }

    // Moving section dot along belt
    ctx.globalAlpha = fadeAlpha;
    if (frame > 20) {
      const dotCycle = ((frame - 20) % 60) / 60;
      const dotX = stationGap + dotCycle * (width - 2 * stationGap);
      ctx.fillStyle = PALETTE.accent.gold;
      ctx.beginPath();
      ctx.arc(dotX, beltY + 2.5 * scale, 4 * scale, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

/* ── V4: Filmstrip ── */
const V4: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const particles = useMemo(() => makeParticles(15, width, height, scale), [width, height, scale]);
  const data = useMemo(() => {
    const rand = seeded(17004);
    const frameSlots: { grayLevel: number; blobCount: number }[] = [];
    for (let i = 0; i < 14; i++) {
      frameSlots.push({ grayLevel: 30 + rand() * 25, blobCount: 3 + Math.floor(rand() * 5) });
    }
    return { frameSlots };
  }, []);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, particles, frame, scale);
    const fadeAlpha = fadeInOut(frame, 120);
    ctx.globalAlpha = fadeAlpha;

    const stripY = height * 0.3;
    const stripH = height * 0.35;
    const frameW = 40 * scale;
    const frameH = stripH * 0.65;
    const frameGap = 8 * scale;
    const sprocketR = 2.5 * scale;
    const scrollSpeed = interpolate(frame, [5, 110], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const scrollOffset = scrollSpeed * frameW * 8;
    const projectorX = width * 0.5;

    // Film strip background
    ctx.fillStyle = "hsla(30, 20%, 15%, 0.7)";
    ctx.fillRect(0, stripY, width, stripH);

    // Film frames
    const rand = seeded(17004);
    for (let i = 0; i < data.frameSlots.length; i++) {
      const fx = width * 0.05 + i * (frameW + frameGap) - scrollOffset + frameW * 4;
      if (fx < -frameW || fx > width + frameW) continue;
      const fy = stripY + (stripH - frameH) / 2;

      // Frame content (grayscale EM-like)
      const slot = data.frameSlots[i];
      ctx.fillStyle = `hsl(0, 0%, ${slot.grayLevel}%)`;
      ctx.fillRect(fx, fy, frameW, frameH);

      // Internal blobs
      for (let b = 0; b < slot.blobCount; b++) {
        const bx = fx + (rand() * 0.8 + 0.1) * frameW;
        const by = fy + (rand() * 0.8 + 0.1) * frameH;
        const br = (1.5 + rand() * 2.5) * scale;
        ctx.fillStyle = `hsla(0, 0%, ${slot.grayLevel + 15}%, 0.6)`;
        ctx.beginPath();
        ctx.arc(bx, by, br, 0, Math.PI * 2);
        ctx.fill();
      }

      // Frame border
      ctx.strokeStyle = "hsla(0, 0%, 50%, 0.4)";
      ctx.lineWidth = 0.8 * scale;
      ctx.strokeRect(fx, fy, frameW, frameH);

      // Highlight if under projector
      const distFromProjector = Math.abs(fx + frameW / 2 - projectorX);
      if (distFromProjector < frameW * 0.7) {
        const highlightAlpha = 1 - distFromProjector / (frameW * 0.7);
        ctx.fillStyle = `hsla(180, 80%, 70%, ${highlightAlpha * 0.25})`;
        ctx.fillRect(fx, fy, frameW, frameH);
      }

      // Sprocket holes
      ctx.fillStyle = "hsla(0, 0%, 10%, 0.5)";
      ctx.beginPath();
      ctx.arc(fx + frameW / 2, stripY + 5 * scale, sprocketR, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(fx + frameW / 2, stripY + stripH - 5 * scale, sprocketR, 0, Math.PI * 2);
      ctx.fill();
    }

    // Projector beam
    ctx.strokeStyle = PALETTE.text.accent;
    ctx.lineWidth = 2 * scale;
    ctx.setLineDash([4 * scale, 3 * scale]);
    ctx.beginPath();
    ctx.moveTo(projectorX, stripY - 15 * scale);
    ctx.lineTo(projectorX, stripY);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = PALETTE.text.accent;
    ctx.font = `${8 * scale}px system-ui`;
    ctx.textAlign = "center";
    ctx.fillText("beam", projectorX, stripY - 20 * scale);

    // Direction arrow
    ctx.fillStyle = PALETTE.text.dim;
    ctx.font = `${9 * scale}px system-ui`;
    ctx.textAlign = "left";
    ctx.fillText("scroll \u2192", width * 0.05, stripY + stripH + 18 * scale);

    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

/* ── V5: Beam Raster Scan ── */
const V5: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const particles = useMemo(() => makeParticles(12, width, height, scale), [width, height, scale]);
  const data = useMemo(() => {
    const rand = seeded(17005);
    // Generate EM-like content: packed circles
    const blobs: { x: number; y: number; r: number; gray: number }[] = [];
    for (let i = 0; i < 80; i++) {
      blobs.push({
        x: 0.05 + rand() * 0.9,
        y: 0.05 + rand() * 0.9,
        r: 0.01 + rand() * 0.04,
        gray: 25 + rand() * 35,
      });
    }
    return { blobs };
  }, []);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, particles, frame, scale);
    const fadeAlpha = fadeInOut(frame, 120);
    ctx.globalAlpha = fadeAlpha;

    const imgX = width * 0.15;
    const imgY = height * 0.15;
    const imgW = width * 0.7;
    const imgH = height * 0.65;

    // Border
    ctx.strokeStyle = "hsla(180, 30%, 45%, 0.4)";
    ctx.lineWidth = 1.5 * scale;
    ctx.strokeRect(imgX, imgY, imgW, imgH);

    // Raster scan progress
    const scanProgress = interpolate(frame, [8, 105], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const totalScanLines = 40;
    const linesScanned = Math.floor(scanProgress * totalScanLines);
    const lineInProgress = scanProgress * totalScanLines - linesScanned;

    // Revealed area: draw EM blobs up to scanned line
    ctx.save();
    ctx.beginPath();
    const revealY = imgY + (linesScanned / totalScanLines) * imgH;
    const revealLineY = revealY + (lineInProgress * imgH / totalScanLines);
    ctx.rect(imgX, imgY, imgW, revealLineY - imgY);
    ctx.clip();

    // Background gray
    ctx.fillStyle = "hsla(0, 0%, 20%, 0.8)";
    ctx.fillRect(imgX, imgY, imgW, imgH);

    // Blobs
    for (const blob of data.blobs) {
      const bx = imgX + blob.x * imgW;
      const by = imgY + blob.y * imgH;
      const br = blob.r * Math.min(imgW, imgH);
      // Membrane ring
      ctx.strokeStyle = `hsla(0, 0%, ${blob.gray - 10}%, 0.8)`;
      ctx.lineWidth = 1.2 * scale;
      ctx.beginPath();
      ctx.arc(bx, by, br, 0, Math.PI * 2);
      ctx.stroke();
      // Interior
      ctx.fillStyle = `hsla(0, 0%, ${blob.gray + 10}%, 0.6)`;
      ctx.beginPath();
      ctx.arc(bx, by, br * 0.8, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // Scan beam dot
    if (scanProgress < 1) {
      const beamX = imgX + lineInProgress * imgW;
      const beamY = revealY;
      // Bright dot
      ctx.fillStyle = `hsla(180, 90%, 85%, 0.9)`;
      ctx.beginPath();
      ctx.arc(beamX, beamY, 3 * scale, 0, Math.PI * 2);
      ctx.fill();
      // Glow
      const glow = ctx.createRadialGradient(beamX, beamY, 0, beamX, beamY, 10 * scale);
      glow.addColorStop(0, `hsla(180, 90%, 85%, 0.5)`);
      glow.addColorStop(1, `hsla(180, 80%, 70%, 0)`);
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(beamX, beamY, 10 * scale, 0, Math.PI * 2);
      ctx.fill();
      // Scan line
      ctx.strokeStyle = `hsla(180, 80%, 70%, 0.15)`;
      ctx.lineWidth = 0.5 * scale;
      ctx.beginPath();
      ctx.moveTo(imgX, beamY);
      ctx.lineTo(beamX, beamY);
      ctx.stroke();
    }

    // Label
    ctx.fillStyle = PALETTE.text.dim;
    ctx.font = `${8 * scale}px monospace`;
    ctx.textAlign = "center";
    const pctLabel = `${Math.floor(scanProgress * 100)}% scanned`;
    ctx.fillText(pctLabel, width / 2, imgY + imgH + 18 * scale);

    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

/* ── V6: Factory Pipeline ── */
const V6: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const particles = useMemo(() => makeParticles(15, width, height, scale), [width, height, scale]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, particles, frame, scale);
    const fadeAlpha = fadeInOut(frame, 120);
    ctx.globalAlpha = fadeAlpha;

    const stages = [
      { label: "Ultramicrotome", hue: 350, icon: "blade" },
      { label: "Tape Collection", hue: 45, icon: "tape" },
      { label: "Beam Imaging", hue: 180, icon: "beam" },
      { label: "Data Storage", hue: 140, icon: "disk" },
    ];
    const stageW = 50 * scale;
    const stageH = 50 * scale;
    const totalW = stages.length * stageW + (stages.length - 1) * 35 * scale;
    const startX = (width - totalW) / 2;
    const cy = height * 0.45;

    for (let i = 0; i < stages.length; i++) {
      const stageAppear = interpolate(frame, [8 + i * 12, 20 + i * 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      if (stageAppear <= 0) continue;
      ctx.globalAlpha = fadeAlpha * stageAppear;

      const sx = startX + i * (stageW + 35 * scale);
      const stage = stages[i];

      // Box
      ctx.fillStyle = `hsla(${stage.hue}, 30%, 25%, 0.4)`;
      ctx.fillRect(sx, cy - stageH / 2, stageW, stageH);
      ctx.strokeStyle = `hsla(${stage.hue}, 50%, 55%, 0.6)`;
      ctx.lineWidth = 1.5 * scale;
      ctx.strokeRect(sx, cy - stageH / 2, stageW, stageH);

      // Icon inside
      const iconX = sx + stageW / 2;
      const iconY = cy - 2 * scale;
      if (stage.icon === "blade") {
        ctx.fillStyle = `hsla(${stage.hue}, 50%, 65%, 0.8)`;
        ctx.beginPath();
        ctx.moveTo(iconX, iconY - 10 * scale);
        ctx.lineTo(iconX + 2 * scale, iconY + 10 * scale);
        ctx.lineTo(iconX - 2 * scale, iconY + 10 * scale);
        ctx.closePath();
        ctx.fill();
      } else if (stage.icon === "tape") {
        ctx.strokeStyle = `hsla(${stage.hue}, 55%, 60%, 0.8)`;
        ctx.lineWidth = 2 * scale;
        ctx.beginPath();
        ctx.moveTo(iconX - 10 * scale, iconY);
        ctx.lineTo(iconX + 10 * scale, iconY);
        ctx.stroke();
        ctx.fillStyle = `hsla(${stage.hue}, 55%, 60%, 0.8)`;
        ctx.fillRect(iconX - 3 * scale, iconY - 4 * scale, 6 * scale, 8 * scale);
      } else if (stage.icon === "beam") {
        ctx.strokeStyle = `hsla(${stage.hue}, 80%, 70%, 0.9)`;
        ctx.lineWidth = 2.5 * scale;
        ctx.beginPath();
        ctx.moveTo(iconX, iconY - 12 * scale);
        ctx.lineTo(iconX, iconY + 12 * scale);
        ctx.stroke();
        ctx.fillStyle = `hsla(${stage.hue}, 90%, 80%, 0.4)`;
        ctx.beginPath();
        ctx.arc(iconX, iconY + 8 * scale, 5 * scale, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Disk
        ctx.strokeStyle = `hsla(${stage.hue}, 50%, 60%, 0.8)`;
        ctx.lineWidth = 1.5 * scale;
        ctx.beginPath();
        ctx.arc(iconX, iconY, 8 * scale, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(iconX, iconY, 3 * scale, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Label below
      ctx.fillStyle = PALETTE.text.primary;
      ctx.font = `${6.5 * scale}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText(stage.label, sx + stageW / 2, cy + stageH / 2 + 12 * scale);

      // Arrow to next
      if (i < stages.length - 1) {
        const arrowStart = sx + stageW + 5 * scale;
        const arrowEnd = sx + stageW + 30 * scale;
        ctx.strokeStyle = PALETTE.text.dim;
        ctx.lineWidth = 1.5 * scale;
        ctx.beginPath();
        ctx.moveTo(arrowStart, cy);
        ctx.lineTo(arrowEnd, cy);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(arrowEnd - 4 * scale, cy - 3 * scale);
        ctx.lineTo(arrowEnd, cy);
        ctx.lineTo(arrowEnd - 4 * scale, cy + 3 * scale);
        ctx.stroke();
      }
    }

    // Flowing dots along arrows
    ctx.globalAlpha = fadeAlpha;
    if (frame > 40) {
      for (let i = 0; i < stages.length - 1; i++) {
        const sx = startX + i * (stageW + 35 * scale) + stageW;
        const dotPhase = ((frame - 40 + i * 8) % 30) / 30;
        const dotX = sx + 5 * scale + dotPhase * 25 * scale;
        ctx.fillStyle = `hsla(${stages[i].hue}, 60%, 65%, ${0.8 - dotPhase * 0.6})`;
        ctx.beginPath();
        ctx.arc(dotX, cy, 2.5 * scale, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

/* ── V7: Reel-to-Reel ── */
const V7: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const particles = useMemo(() => makeParticles(15, width, height, scale), [width, height, scale]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, particles, frame, scale);
    const fadeAlpha = fadeInOut(frame, 120);
    ctx.globalAlpha = fadeAlpha;

    const leftReelX = width * 0.2;
    const rightReelX = width * 0.8;
    const reelY = height * 0.45;
    const reelR = 40 * scale;
    const beamX = width * 0.5;
    const windProgress = interpolate(frame, [10, 108], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

    // Tape winding calculation
    const leftTapeR = reelR * (1 - windProgress * 0.6);
    const rightTapeR = reelR * (0.3 + windProgress * 0.7);
    const leftRotation = windProgress * Math.PI * 10;
    const rightRotation = -windProgress * Math.PI * 10;

    // Draw reels
    for (const [rx, ry, tapeR, rot, label] of [
      [leftReelX, reelY, leftTapeR, leftRotation, "supply"] as const,
      [rightReelX, reelY, rightTapeR, rightRotation, "take-up"] as const,
    ]) {
      // Tape wound on reel
      ctx.fillStyle = "hsla(35, 25%, 35%, 0.4)";
      ctx.beginPath();
      ctx.arc(rx, ry, tapeR, 0, Math.PI * 2);
      ctx.fill();
      // Reel hub
      ctx.strokeStyle = "hsla(220, 35%, 50%, 0.7)";
      ctx.lineWidth = 2 * scale;
      ctx.beginPath();
      ctx.arc(rx, ry, 8 * scale, 0, Math.PI * 2);
      ctx.stroke();
      // Spokes
      ctx.lineWidth = 1.5 * scale;
      for (let spoke = 0; spoke < 3; spoke++) {
        const angle = rot + (spoke * Math.PI * 2) / 3;
        ctx.beginPath();
        ctx.moveTo(rx + Math.cos(angle) * 8 * scale, ry + Math.sin(angle) * 8 * scale);
        ctx.lineTo(rx + Math.cos(angle) * tapeR, ry + Math.sin(angle) * tapeR);
        ctx.stroke();
      }
      // Outer rim
      ctx.beginPath();
      ctx.arc(rx, ry, tapeR + 2 * scale, 0, Math.PI * 2);
      ctx.stroke();
      // Label
      ctx.fillStyle = PALETTE.text.dim;
      ctx.font = `${7 * scale}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText(label, rx, ry + tapeR + 16 * scale);
    }

    // Tape path between reels
    ctx.strokeStyle = "hsla(35, 30%, 50%, 0.5)";
    ctx.lineWidth = 3 * scale;
    ctx.beginPath();
    ctx.moveTo(leftReelX + leftTapeR, reelY);
    ctx.lineTo(rightReelX - rightTapeR, reelY);
    ctx.stroke();

    // Sections on tape
    const tapeStart = leftReelX + leftTapeR + 4 * scale;
    const tapeEnd = rightReelX - rightTapeR - 4 * scale;
    const sectionCount = 6;
    for (let i = 0; i < sectionCount; i++) {
      const frac = (i + 0.5) / sectionCount;
      const sx = tapeStart + frac * (tapeEnd - tapeStart);
      const nearBeam = Math.abs(sx - beamX) < (tapeEnd - tapeStart) / sectionCount * 0.5;
      ctx.fillStyle = `hsla(${nearBeam ? 180 : 45}, 50%, ${nearBeam ? 70 : 50}%, 0.7)`;
      ctx.fillRect(sx - 8 * scale, reelY - 6 * scale, 16 * scale, 12 * scale);
    }

    // Beam at center
    const beamAppear = interpolate(frame, [5, 15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const beamGrad = ctx.createLinearGradient(beamX, height * 0.08, beamX, reelY);
    beamGrad.addColorStop(0, `hsla(180, 80%, 70%, ${beamAppear * 0.1})`);
    beamGrad.addColorStop(1, `hsla(180, 90%, 80%, ${beamAppear * 0.7})`);
    ctx.fillStyle = beamGrad;
    ctx.fillRect(beamX - 3 * scale, height * 0.08, 6 * scale, reelY - height * 0.08 - 8 * scale);

    // Beam label
    ctx.fillStyle = PALETTE.text.accent;
    ctx.font = `${8 * scale}px system-ui`;
    ctx.textAlign = "center";
    ctx.fillText("e\u207B beam", beamX, height * 0.06);

    // Counter
    const sectionsImaged = Math.floor(windProgress * 7050);
    ctx.fillStyle = PALETTE.text.dim;
    ctx.font = `${9 * scale}px monospace`;
    ctx.fillText(`section ${sectionsImaged.toLocaleString()} / 7,050`, width / 2, height * 0.88);

    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

/* ── V8: Section Queue ── */
const V8: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const particles = useMemo(() => makeParticles(15, width, height, scale), [width, height, scale]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, particles, frame, scale);
    const fadeAlpha = fadeInOut(frame, 120);
    ctx.globalAlpha = fadeAlpha;

    const totalSections = 8;
    const sectionSize = 20 * scale;
    const queueX = width * 0.12;
    const beamX = width * 0.5;
    const doneX = width * 0.82;
    const cy = height * 0.5;

    // How many sections have been processed?
    const processRate = interpolate(frame, [15, 105], [0, totalSections], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const processed = Math.floor(processRate);
    const currentProgress = processRate - processed;

    // Beam zone
    const beamAlpha = interpolate(frame, [5, 15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.strokeStyle = `hsla(180, 60%, 55%, ${beamAlpha * 0.5})`;
    ctx.lineWidth = 1.5 * scale;
    ctx.strokeRect(beamX - sectionSize * 0.8, cy - sectionSize * 1.2, sectionSize * 1.6, sectionSize * 2.4);
    ctx.fillStyle = `hsla(180, 60%, 50%, ${beamAlpha * 0.08})`;
    ctx.fillRect(beamX - sectionSize * 0.8, cy - sectionSize * 1.2, sectionSize * 1.6, sectionSize * 2.4);
    // Beam vertical line
    ctx.strokeStyle = `hsla(180, 80%, 70%, ${beamAlpha * 0.6})`;
    ctx.lineWidth = 2 * scale;
    ctx.beginPath();
    ctx.moveTo(beamX, cy - sectionSize * 1.6);
    ctx.lineTo(beamX, cy - sectionSize * 1.2);
    ctx.stroke();

    // Queue (waiting sections)
    const queueCount = totalSections - processed - (processed < totalSections ? 1 : 0);
    for (let i = 0; i < queueCount; i++) {
      const sx = queueX + i * (sectionSize + 6 * scale);
      ctx.fillStyle = `hsla(45, 50%, 50%, 0.6)`;
      ctx.fillRect(sx, cy - sectionSize / 2, sectionSize, sectionSize);
      ctx.strokeStyle = `hsla(45, 55%, 60%, 0.4)`;
      ctx.lineWidth = 1 * scale;
      ctx.strokeRect(sx, cy - sectionSize / 2, sectionSize, sectionSize);
      ctx.fillStyle = PALETTE.text.dim;
      ctx.font = `${6 * scale}px monospace`;
      ctx.textAlign = "center";
      ctx.fillText(`${processed + 1 + i + 1}`, sx + sectionSize / 2, cy + 2 * scale);
    }

    // Current section in beam
    if (processed < totalSections) {
      const moveX = beamX - sectionSize / 2;
      // Flash when centered
      if (currentProgress > 0.3 && currentProgress < 0.7) {
        const flashIntensity = Math.sin((currentProgress - 0.3) / 0.4 * Math.PI);
        const glow = ctx.createRadialGradient(beamX, cy, 0, beamX, cy, sectionSize * 2);
        glow.addColorStop(0, `hsla(180, 90%, 85%, ${flashIntensity * 0.4})`);
        glow.addColorStop(1, `hsla(180, 80%, 70%, 0)`);
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(beamX, cy, sectionSize * 2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = `hsla(180, 55%, 60%, 0.7)`;
      ctx.fillRect(moveX, cy - sectionSize / 2, sectionSize, sectionSize);
      ctx.fillStyle = PALETTE.text.primary;
      ctx.font = `${7 * scale}px monospace`;
      ctx.textAlign = "center";
      ctx.fillText(`${processed + 1}`, beamX, cy + 2 * scale);
    }

    // Done pile
    for (let i = 0; i < processed; i++) {
      const row = Math.floor(i / 3);
      const col = i % 3;
      const dx = doneX + col * (sectionSize * 0.5 + 2 * scale) - sectionSize * 0.4;
      const dy = cy + sectionSize * 0.4 - row * (sectionSize * 0.5 + 2 * scale);
      ctx.fillStyle = `hsla(140, 40%, 45%, 0.6)`;
      ctx.fillRect(dx, dy - sectionSize * 0.5, sectionSize * 0.5, sectionSize * 0.5);
    }

    // Labels
    ctx.fillStyle = PALETTE.text.dim;
    ctx.font = `${8 * scale}px system-ui`;
    ctx.textAlign = "center";
    ctx.fillText("queue", queueX + queueCount * (sectionSize + 6 * scale) / 2, cy + sectionSize + 12 * scale);
    ctx.fillStyle = PALETTE.text.accent;
    ctx.fillText("beam", beamX, cy - sectionSize * 1.8);
    ctx.fillStyle = PALETTE.text.dim;
    ctx.fillText("done", doneX, cy + sectionSize + 12 * scale);

    // Progress
    ctx.fillStyle = PALETTE.text.dim;
    ctx.font = `${9 * scale}px monospace`;
    ctx.fillText(`${processed} / ${totalSections} scanned`, width / 2, height * 0.9);

    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

/* ── V9: Camera Flash ── */
const V9: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const particles = useMemo(() => makeParticles(15, width, height, scale), [width, height, scale]);
  const data = useMemo(() => {
    const rand = seeded(17009);
    const grays: number[] = [];
    for (let i = 0; i < 12; i++) grays.push(25 + rand() * 30);
    return { grays };
  }, []);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, particles, frame, scale);
    const fadeAlpha = fadeInOut(frame, 120);
    ctx.globalAlpha = fadeAlpha;

    const sectionEnterX = width * 0.2;
    const sectionY = height * 0.42;
    const sectionSize = 35 * scale;
    const gridX = width * 0.55;
    const gridY = height * 0.2;
    const thumbSize = 18 * scale;
    const thumbGap = 4 * scale;
    const gridCols = 4;

    // Timing: each capture cycle = 12 frames
    const cycleLen = 12;
    const firstCycle = 10;
    const totalCaptures = 12;
    const capturesDone = Math.min(totalCaptures, Math.floor(Math.max(0, frame - firstCycle) / cycleLen));
    const cyclePhase = Math.max(0, frame - firstCycle - capturesDone * cycleLen) / cycleLen;

    // Camera icon
    drawCamera(ctx, sectionEnterX, sectionY - 35 * scale, 24 * scale, PALETTE.text.primary);

    // Current section entering
    if (capturesDone < totalCaptures) {
      const enterProgress = interpolate(cyclePhase, [0, 0.3], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const sectionAlpha = enterProgress;
      ctx.globalAlpha = fadeAlpha * sectionAlpha;
      ctx.fillStyle = `hsla(45, 50%, 50%, 0.7)`;
      ctx.fillRect(sectionEnterX - sectionSize / 2, sectionY - sectionSize / 2, sectionSize, sectionSize);
      ctx.strokeStyle = `hsla(45, 55%, 60%, 0.4)`;
      ctx.lineWidth = 1 * scale;
      ctx.strokeRect(sectionEnterX - sectionSize / 2, sectionY - sectionSize / 2, sectionSize, sectionSize);

      // Flash burst
      if (cyclePhase > 0.35 && cyclePhase < 0.55) {
        const flashIntensity = 1 - Math.abs(cyclePhase - 0.45) / 0.1;
        ctx.globalAlpha = fadeAlpha * flashIntensity;
        ctx.fillStyle = `hsla(0, 0%, 100%, ${flashIntensity * 0.6})`;
        ctx.beginPath();
        ctx.arc(sectionEnterX, sectionY, sectionSize * 1.5, 0, Math.PI * 2);
        ctx.fill();
        // Star burst lines
        ctx.strokeStyle = `hsla(45, 80%, 80%, ${flashIntensity * 0.5})`;
        ctx.lineWidth = 1.5 * scale;
        for (let r = 0; r < 8; r++) {
          const angle = (r * Math.PI) / 4;
          const len = sectionSize * (0.8 + flashIntensity * 0.5);
          ctx.beginPath();
          ctx.moveTo(sectionEnterX + Math.cos(angle) * sectionSize * 0.4, sectionY + Math.sin(angle) * sectionSize * 0.4);
          ctx.lineTo(sectionEnterX + Math.cos(angle) * len, sectionY + Math.sin(angle) * len);
          ctx.stroke();
        }
      }
    }

    // Grid of captured images
    ctx.globalAlpha = fadeAlpha;
    for (let i = 0; i < capturesDone; i++) {
      const col = i % gridCols;
      const row = Math.floor(i / gridCols);
      const tx = gridX + col * (thumbSize + thumbGap);
      const ty = gridY + row * (thumbSize + thumbGap);
      // Thumbnail appearance
      const thumbAppearFrame = firstCycle + i * cycleLen + cycleLen * 0.55;
      const thumbAlpha = interpolate(frame, [thumbAppearFrame, thumbAppearFrame + 5], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      ctx.globalAlpha = fadeAlpha * thumbAlpha;
      ctx.fillStyle = `hsl(0, 0%, ${data.grays[i]}%)`;
      ctx.fillRect(tx, ty, thumbSize, thumbSize);
      ctx.strokeStyle = `hsla(0, 0%, 50%, 0.3)`;
      ctx.lineWidth = 0.8 * scale;
      ctx.strokeRect(tx, ty, thumbSize, thumbSize);
    }

    // Labels
    ctx.globalAlpha = fadeAlpha;
    ctx.fillStyle = PALETTE.text.dim;
    ctx.font = `${8 * scale}px system-ui`;
    ctx.textAlign = "center";
    ctx.fillText("flash \u2192 capture", sectionEnterX, sectionY + sectionSize / 2 + 16 * scale);
    ctx.fillText(`${capturesDone} images`, gridX + gridCols * (thumbSize + thumbGap) / 2, gridY + Math.ceil(capturesDone / gridCols) * (thumbSize + thumbGap) + 12 * scale);

    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

export const VARIANTS_SHOT_017: VariantDef[] = [
  { id: "conveyor-belt", label: "Conveyor Belt", component: V1 },
  { id: "top-down-tape", label: "Top-Down Tape", component: V2 },
  { id: "assembly-line", label: "Assembly Line", component: V3 },
  { id: "filmstrip", label: "Filmstrip", component: V4 },
  { id: "beam-raster-scan", label: "Beam Raster Scan", component: V5 },
  { id: "factory-pipeline", label: "Factory Pipeline", component: V6 },
  { id: "reel-to-reel", label: "Reel-to-Reel", component: V7 },
  { id: "section-queue", label: "Section Queue", component: V8 },
  { id: "camera-flash", label: "Camera Flash", component: V9 },
];
