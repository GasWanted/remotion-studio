import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantDef, VariantProps } from "../types";
import { seeded, drawBg, makeParticles, drawParticles, PALETTE, fadeInOut } from "../scenes/theme";
import { drawNeuron, drawCamera } from "../icons";

// Shot 13 — "But an electron beam can only photograph a thin flat section."
// 120 frames (4s). The electron beam can image a thin slice but NOT a whole brain.

const V1: React.FC<VariantProps> = ({ width, height }) => {
  // Beam Diagram: vertical cyan beam hitting thin section, whole brain stays dark
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(20, width, height, scale), [width, height, scale]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, parts, frame, scale);
    const fadeAlpha = fadeInOut(frame, 120);
    ctx.globalAlpha = fadeAlpha;

    const beamProgress = interpolate(frame, [8, 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const sectionGlow = interpolate(frame, [35, 55], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const labelFade = interpolate(frame, [50, 65], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const brainXFade = interpolate(frame, [65, 80], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

    const leftX = width * 0.3;
    const rightX = width * 0.72;
    const centerY = height * 0.5;

    // --- LEFT: Beam + thin section ---
    // Beam column (vertical cyan line with glow)
    const beamTopY = height * 0.12;
    const beamBottomY = beamTopY + (centerY - beamTopY - 10 * scale) * beamProgress;
    if (beamProgress > 0) {
      // Glow
      const beamGrad = ctx.createLinearGradient(leftX, beamTopY, leftX, beamBottomY);
      beamGrad.addColorStop(0, `hsla(185, 90%, 70%, ${0.05 * beamProgress})`);
      beamGrad.addColorStop(1, `hsla(185, 90%, 70%, ${0.3 * beamProgress})`);
      ctx.fillStyle = beamGrad;
      ctx.fillRect(leftX - 12 * scale, beamTopY, 24 * scale, beamBottomY - beamTopY);
      // Core line
      ctx.strokeStyle = `hsla(185, 95%, 75%, ${0.9 * beamProgress})`;
      ctx.lineWidth = 2 * scale;
      ctx.beginPath();
      ctx.moveTo(leftX, beamTopY);
      ctx.lineTo(leftX, beamBottomY);
      ctx.stroke();
      // Source dot at top
      ctx.fillStyle = `hsla(185, 90%, 80%, ${beamProgress})`;
      ctx.beginPath();
      ctx.arc(leftX, beamTopY, 4 * scale, 0, Math.PI * 2);
      ctx.fill();
    }

    // Thin section (golden horizontal line)
    const sectionWidth = 60 * scale;
    const sectionY = centerY;
    ctx.strokeStyle = `hsla(45, 80%, 65%, ${0.4 + sectionGlow * 0.6})`;
    ctx.lineWidth = (2 + sectionGlow * 2) * scale;
    ctx.shadowColor = sectionGlow > 0 ? `hsla(45, 90%, 70%, ${sectionGlow * 0.6})` : "transparent";
    ctx.shadowBlur = sectionGlow * 15 * scale;
    ctx.beginPath();
    ctx.moveTo(leftX - sectionWidth / 2, sectionY);
    ctx.lineTo(leftX + sectionWidth / 2, sectionY);
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Label: electron beam
    if (labelFade > 0) {
      ctx.globalAlpha = fadeAlpha * labelFade;
      ctx.fillStyle = PALETTE.text.dim;
      ctx.font = `${9 * scale}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText("electron beam", leftX, beamTopY - 8 * scale);

      // Label: thin section
      ctx.fillStyle = PALETTE.text.accent;
      ctx.fillText("thin section", leftX, sectionY + 18 * scale);
      ctx.font = `${7 * scale}px monospace`;
      ctx.fillStyle = PALETTE.text.dim;
      ctx.fillText("(transparent to beam)", leftX, sectionY + 30 * scale);
      ctx.globalAlpha = fadeAlpha;
    }

    // --- RIGHT: Whole brain (opaque, dark) ---
    const brainRadius = 35 * scale;
    // Dim opaque brain sphere
    const brainGrad = ctx.createRadialGradient(rightX - 5 * scale, centerY - 5 * scale, 0, rightX, centerY, brainRadius);
    brainGrad.addColorStop(0, "hsla(280, 25%, 28%, 0.7)");
    brainGrad.addColorStop(1, "hsla(280, 20%, 15%, 0.9)");
    ctx.fillStyle = brainGrad;
    ctx.beginPath();
    ctx.arc(rightX, centerY, brainRadius, 0, Math.PI * 2);
    ctx.fill();
    // Brain fissure line
    ctx.strokeStyle = "hsla(280, 20%, 35%, 0.4)";
    ctx.lineWidth = 1.5 * scale;
    ctx.beginPath();
    ctx.moveTo(rightX, centerY - brainRadius * 0.8);
    ctx.quadraticCurveTo(rightX - 5 * scale, centerY, rightX, centerY + brainRadius * 0.8);
    ctx.stroke();

    // Blocked beam (bouncing off brain)
    if (brainXFade > 0) {
      ctx.globalAlpha = fadeAlpha * brainXFade;
      // Beam hitting brain
      ctx.strokeStyle = `hsla(185, 90%, 70%, 0.3)`;
      ctx.lineWidth = 2 * scale;
      ctx.setLineDash([4 * scale, 4 * scale]);
      ctx.beginPath();
      ctx.moveTo(rightX, height * 0.12);
      ctx.lineTo(rightX, centerY - brainRadius);
      ctx.stroke();
      ctx.setLineDash([]);
      // Red X over the brain
      ctx.strokeStyle = PALETTE.accent.red;
      ctx.lineWidth = 3 * scale;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(rightX - 15 * scale, centerY - 15 * scale);
      ctx.lineTo(rightX + 15 * scale, centerY + 15 * scale);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(rightX + 15 * scale, centerY - 15 * scale);
      ctx.lineTo(rightX - 15 * scale, centerY + 15 * scale);
      ctx.stroke();
      // Label
      ctx.fillStyle = PALETTE.text.dim;
      ctx.font = `${9 * scale}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText("whole brain", rightX, centerY + brainRadius + 18 * scale);
      ctx.font = `${7 * scale}px monospace`;
      ctx.fillStyle = `hsla(0, 65%, 65%, 0.8)`;
      ctx.fillText("(opaque)", rightX, centerY + brainRadius + 30 * scale);
      ctx.globalAlpha = fadeAlpha;
    }

    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V2: React.FC<VariantProps> = ({ width, height }) => {
  // Cross-Section View: sphere with single thin slice highlighted
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(20, width, height, scale), [width, height, scale]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, parts, frame, scale);
    const fadeAlpha = fadeInOut(frame, 120);
    ctx.globalAlpha = fadeAlpha;

    const sphereAppear = interpolate(frame, [5, 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const sliceReveal = interpolate(frame, [30, 55], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const annotationFade = interpolate(frame, [55, 70], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const dimOthers = interpolate(frame, [55, 75], [0.5, 0.15], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

    const cx = width * 0.45;
    const cy = height * 0.48;
    const radius = 55 * scale;

    // Brain sphere (dim)
    if (sphereAppear > 0) {
      const currentRadius = radius * sphereAppear;
      ctx.globalAlpha = fadeAlpha * dimOthers;
      // Sphere gradient
      const grad = ctx.createRadialGradient(cx - currentRadius * 0.2, cy - currentRadius * 0.2, 0, cx, cy, currentRadius);
      grad.addColorStop(0, "hsla(280, 30%, 40%, 0.6)");
      grad.addColorStop(0.7, "hsla(280, 25%, 25%, 0.5)");
      grad.addColorStop(1, "hsla(280, 20%, 15%, 0.3)");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, currentRadius, 0, Math.PI * 2);
      ctx.fill();
      // Sphere outline
      ctx.strokeStyle = "hsla(280, 30%, 50%, 0.3)";
      ctx.lineWidth = 1.5 * scale;
      ctx.beginPath();
      ctx.arc(cx, cy, currentRadius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = fadeAlpha;
    }

    // Slice plane (horizontal golden band through sphere)
    if (sliceReveal > 0) {
      const sliceY = cy;
      const sliceHalfWidth = Math.sqrt(radius * radius - 0) * sliceReveal;
      // Slice glow
      ctx.fillStyle = `hsla(45, 80%, 65%, ${0.15 * sliceReveal})`;
      ctx.fillRect(cx - sliceHalfWidth, sliceY - 3 * scale, sliceHalfWidth * 2, 6 * scale);
      // Slice core line
      ctx.strokeStyle = `hsla(45, 85%, 70%, ${0.9 * sliceReveal})`;
      ctx.lineWidth = 2 * scale;
      ctx.beginPath();
      ctx.moveTo(cx - sliceHalfWidth, sliceY);
      ctx.lineTo(cx + sliceHalfWidth, sliceY);
      ctx.stroke();
      // Small arrows showing thinness
      if (sliceReveal > 0.7) {
        const arrowX = cx + sliceHalfWidth + 10 * scale;
        ctx.strokeStyle = `hsla(45, 80%, 65%, ${sliceReveal * 0.7})`;
        ctx.lineWidth = 1 * scale;
        // Up arrow
        ctx.beginPath();
        ctx.moveTo(arrowX, sliceY - 1 * scale);
        ctx.lineTo(arrowX, sliceY - 12 * scale);
        ctx.moveTo(arrowX - 3 * scale, sliceY - 9 * scale);
        ctx.lineTo(arrowX, sliceY - 12 * scale);
        ctx.lineTo(arrowX + 3 * scale, sliceY - 9 * scale);
        ctx.stroke();
        // Down arrow
        ctx.beginPath();
        ctx.moveTo(arrowX, sliceY + 1 * scale);
        ctx.lineTo(arrowX, sliceY + 12 * scale);
        ctx.moveTo(arrowX - 3 * scale, sliceY + 9 * scale);
        ctx.lineTo(arrowX, sliceY + 12 * scale);
        ctx.lineTo(arrowX + 3 * scale, sliceY + 9 * scale);
        ctx.stroke();
      }
    }

    // Annotation
    if (annotationFade > 0) {
      ctx.globalAlpha = fadeAlpha * annotationFade;
      ctx.fillStyle = PALETTE.text.accent;
      ctx.font = `${10 * scale}px system-ui`;
      ctx.textAlign = "left";
      ctx.fillText("only this slice is visible", cx + radius + 15 * scale, cy + 3 * scale);
      // Dotted leader line
      ctx.strokeStyle = `hsla(45, 70%, 60%, 0.4)`;
      ctx.lineWidth = 1 * scale;
      ctx.setLineDash([3 * scale, 3 * scale]);
      ctx.beginPath();
      ctx.moveTo(cx + radius + 12 * scale, cy);
      ctx.lineTo(cx + radius * 0.7, cy);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.globalAlpha = fadeAlpha;
    }

    // Bottom label
    const bottomFade = interpolate(frame, [70, 85], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (bottomFade > 0) {
      ctx.globalAlpha = fadeAlpha * bottomFade;
      ctx.fillStyle = PALETTE.text.dim;
      ctx.font = `${10 * scale}px monospace`;
      ctx.textAlign = "center";
      ctx.fillText("electron beam sees one thin plane", width / 2, height * 0.9);
      ctx.globalAlpha = fadeAlpha;
    }

    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V3: React.FC<VariantProps> = ({ width, height }) => {
  // Beam Column Scan: beam scanning down thin sample, image building on right
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(18, width, height, scale), [width, height, scale]);
  const scanData = useMemo(() => {
    const rand = seeded(13003);
    const pixels: number[] = [];
    for (let i = 0; i < 400; i++) {
      pixels.push(rand() * 0.6 + 0.2);
    }
    return { pixels };
  }, []);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, parts, frame, scale);
    const fadeAlpha = fadeInOut(frame, 120);
    ctx.globalAlpha = fadeAlpha;

    const sampleAppear = interpolate(frame, [5, 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const scanProgress = interpolate(frame, [20, 95], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const labelFade = interpolate(frame, [10, 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

    const sampleX = width * 0.25;
    const sampleY = height * 0.25;
    const sampleW = 50 * scale;
    const sampleH = 65 * scale;

    // Sample (thin section on left)
    if (sampleAppear > 0) {
      ctx.fillStyle = `hsla(45, 50%, 50%, ${0.3 * sampleAppear})`;
      ctx.fillRect(sampleX - sampleW / 2, sampleY, sampleW, sampleH * sampleAppear);
      ctx.strokeStyle = `hsla(45, 60%, 60%, ${0.6 * sampleAppear})`;
      ctx.lineWidth = 1 * scale;
      ctx.strokeRect(sampleX - sampleW / 2, sampleY, sampleW, sampleH * sampleAppear);
    }

    // Scanning beam
    if (scanProgress > 0) {
      const beamY = sampleY + sampleH * scanProgress;
      // Beam line
      ctx.strokeStyle = `hsla(185, 90%, 70%, 0.8)`;
      ctx.lineWidth = 1.5 * scale;
      ctx.beginPath();
      ctx.moveTo(sampleX - sampleW / 2 - 5 * scale, beamY);
      ctx.lineTo(sampleX + sampleW / 2 + 5 * scale, beamY);
      ctx.stroke();
      // Glow on beam line
      ctx.shadowColor = "hsla(185, 90%, 70%, 0.5)";
      ctx.shadowBlur = 8 * scale;
      ctx.beginPath();
      ctx.moveTo(sampleX - sampleW / 2, beamY);
      ctx.lineTo(sampleX + sampleW / 2, beamY);
      ctx.stroke();
      ctx.shadowBlur = 0;
      // Beam source above
      ctx.strokeStyle = `hsla(185, 90%, 70%, 0.4)`;
      ctx.lineWidth = 1 * scale;
      ctx.beginPath();
      ctx.moveTo(sampleX, sampleY - 20 * scale);
      ctx.lineTo(sampleX - sampleW / 3, beamY);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(sampleX, sampleY - 20 * scale);
      ctx.lineTo(sampleX + sampleW / 3, beamY);
      ctx.stroke();
    }

    // Detector below sample
    if (sampleAppear > 0) {
      drawCamera(ctx, sampleX, sampleY + sampleH + 25 * scale, 20 * scale, `hsla(220, 50%, 60%, ${0.6 * sampleAppear})`);
      if (labelFade > 0) {
        ctx.fillStyle = `hsla(220, 40%, 55%, ${labelFade * 0.7})`;
        ctx.font = `${7 * scale}px system-ui`;
        ctx.textAlign = "center";
        ctx.fillText("detector", sampleX, sampleY + sampleH + 45 * scale);
      }
    }

    // Image building on the right
    const imgX = width * 0.58;
    const imgY = sampleY;
    const imgW = 60 * scale;
    const imgH = sampleH;
    const gridCols = 20;
    const gridRows = 20;
    const pixW = imgW / gridCols;
    const pixH = imgH / gridRows;
    const rowsRevealed = Math.floor(scanProgress * gridRows);

    // Image border
    ctx.strokeStyle = `hsla(220, 40%, 50%, 0.4)`;
    ctx.lineWidth = 1 * scale;
    ctx.strokeRect(imgX, imgY, imgW, imgH);

    // Fill revealed pixels
    for (let row = 0; row < rowsRevealed; row++) {
      for (let col = 0; col < gridCols; col++) {
        const idx = row * gridCols + col;
        const brightness = scanData.pixels[idx % scanData.pixels.length];
        ctx.fillStyle = `hsla(0, 0%, ${brightness * 100}%, 0.8)`;
        ctx.fillRect(imgX + col * pixW, imgY + row * pixH, pixW + 0.5, pixH + 0.5);
      }
    }

    // Labels
    if (labelFade > 0) {
      ctx.globalAlpha = fadeAlpha * labelFade;
      ctx.fillStyle = PALETTE.text.dim;
      ctx.font = `${8 * scale}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText("thin section", sampleX, sampleY - 8 * scale);
      ctx.fillText("reconstructed image", imgX + imgW / 2, imgY - 8 * scale);
      ctx.globalAlpha = fadeAlpha;
    }

    // Scan line counter
    if (scanProgress > 0) {
      ctx.fillStyle = PALETTE.text.accent;
      ctx.font = `${8 * scale}px monospace`;
      ctx.textAlign = "left";
      ctx.fillText(`scan line ${rowsRevealed}/${gridRows}`, imgX, imgY + imgH + 15 * scale);
    }

    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V4: React.FC<VariantProps> = ({ width, height }) => {
  // Slice Highlighted on Brain: brain shape with single glowing horizontal line
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(20, width, height, scale), [width, height, scale]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, parts, frame, scale);
    const fadeAlpha = fadeInOut(frame, 120);
    ctx.globalAlpha = fadeAlpha;

    const brainAppear = interpolate(frame, [5, 25], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const sliceSweep = interpolate(frame, [25, 60], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const dimAboveBelow = interpolate(frame, [50, 70], [0.5, 0.12], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const labelAppear = interpolate(frame, [65, 80], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

    const cx = width / 2;
    const cy = height * 0.45;
    const brainW = 70 * scale;
    const brainH = 55 * scale;
    const sliceY = cy + 2 * scale;

    // Brain shape (two lobes)
    if (brainAppear > 0) {
      const currentScale = brainAppear;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(currentScale, currentScale);

      // Brain above slice (dim)
      ctx.globalAlpha = fadeAlpha * dimAboveBelow;
      ctx.fillStyle = "hsla(340, 20%, 45%, 0.5)";
      ctx.beginPath();
      ctx.ellipse(-brainW * 0.25, 0, brainW * 0.35, brainH * 0.45, 0, Math.PI, 0);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(brainW * 0.25, 0, brainW * 0.35, brainH * 0.45, 0, Math.PI, 0);
      ctx.fill();

      // Brain below slice (dim)
      ctx.fillStyle = "hsla(340, 20%, 35%, 0.4)";
      ctx.beginPath();
      ctx.ellipse(-brainW * 0.25, 0, brainW * 0.35, brainH * 0.5, 0, 0, Math.PI);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(brainW * 0.25, 0, brainW * 0.35, brainH * 0.5, 0, 0, Math.PI);
      ctx.fill();

      ctx.restore();
      ctx.globalAlpha = fadeAlpha;
    }

    // Bright slice line sweeping to position
    if (sliceSweep > 0) {
      const currentSliceY = cy - brainH * 0.4 + (sliceY - (cy - brainH * 0.4)) * sliceSweep;
      const sliceHalfW = Math.min(brainW * 0.6, brainW * 0.6 * sliceSweep * 2);
      // Glow band
      ctx.fillStyle = `hsla(45, 85%, 70%, ${0.12 * sliceSweep})`;
      ctx.fillRect(cx - sliceHalfW, currentSliceY - 4 * scale, sliceHalfW * 2, 8 * scale);
      // Core line
      ctx.strokeStyle = `hsla(45, 90%, 75%, ${0.9})`;
      ctx.lineWidth = 2 * scale;
      ctx.shadowColor = `hsla(45, 90%, 70%, 0.6)`;
      ctx.shadowBlur = 10 * scale;
      ctx.beginPath();
      ctx.moveTo(cx - sliceHalfW, currentSliceY);
      ctx.lineTo(cx + sliceHalfW, currentSliceY);
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    // Label: 40nm section
    if (labelAppear > 0) {
      ctx.globalAlpha = fadeAlpha * labelAppear;
      ctx.fillStyle = PALETTE.text.accent;
      ctx.font = `bold ${11 * scale}px monospace`;
      ctx.textAlign = "center";
      ctx.fillText("40 nm section", cx, sliceY + 20 * scale);
      // Subtitle
      ctx.fillStyle = PALETTE.text.dim;
      ctx.font = `${9 * scale}px system-ui`;
      ctx.fillText("everything else is opaque to the beam", cx, height * 0.88);
      ctx.globalAlpha = fadeAlpha;
    }

    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V5: React.FC<VariantProps> = ({ width, height }) => {
  // 3D Brain with Cutting Plane: wireframe brain, glowing translucent plane
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(20, width, height, scale), [width, height, scale]);
  const wireData = useMemo(() => {
    const rand = seeded(13005);
    const lines: { x1: number; y1: number; x2: number; y2: number }[] = [];
    const cx = 0, cy = 0, rx = 60, ry = 48;
    // Longitude lines
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI;
      const pts: { x: number; y: number }[] = [];
      for (let j = 0; j <= 16; j++) {
        const phi = (j / 16) * Math.PI * 2;
        const xr = Math.cos(angle) * rx * Math.sin(phi);
        const yr = ry * Math.cos(phi);
        pts.push({ x: cx + xr, y: cy + yr });
      }
      for (let j = 0; j < pts.length - 1; j++) {
        lines.push({ x1: pts[j].x, y1: pts[j].y, x2: pts[j + 1].x, y2: pts[j + 1].y });
      }
    }
    // Latitude lines
    for (let i = 1; i < 6; i++) {
      const phi = (i / 6) * Math.PI;
      const r = rx * Math.sin(phi);
      const yy = ry * Math.cos(phi);
      const pts: { x: number; y: number }[] = [];
      for (let j = 0; j <= 20; j++) {
        const a = (j / 20) * Math.PI * 2;
        pts.push({ x: cx + Math.cos(a) * r, y: cy + yy });
      }
      for (let j = 0; j < pts.length - 1; j++) {
        lines.push({ x1: pts[j].x, y1: pts[j].y, x2: pts[j + 1].x, y2: pts[j + 1].y });
      }
    }
    return { lines };
  }, []);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, parts, frame, scale);
    const fadeAlpha = fadeInOut(frame, 120);
    ctx.globalAlpha = fadeAlpha;

    const wireAppear = interpolate(frame, [5, 35], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const planeAppear = interpolate(frame, [30, 55], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const labelFade = interpolate(frame, [55, 70], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

    const cx = width / 2;
    const cy = height * 0.47;

    // Wireframe brain
    if (wireAppear > 0) {
      ctx.strokeStyle = `hsla(280, 30%, 50%, ${wireAppear * 0.2})`;
      ctx.lineWidth = 0.7 * scale;
      const linesShown = Math.floor(wireAppear * wireData.lines.length);
      for (let i = 0; i < linesShown; i++) {
        const l = wireData.lines[i];
        ctx.beginPath();
        ctx.moveTo(cx + l.x1 * scale, cy + l.y1 * scale);
        ctx.lineTo(cx + l.x2 * scale, cy + l.y2 * scale);
        ctx.stroke();
      }
    }

    // Cutting plane (horizontal glowing rectangle with 3D perspective)
    if (planeAppear > 0) {
      const planeW = 75 * scale * planeAppear;
      const planeDepth = 15 * scale;
      const planeY = cy;

      // Plane fill (translucent gold)
      ctx.fillStyle = `hsla(45, 80%, 65%, ${0.15 * planeAppear})`;
      ctx.beginPath();
      ctx.moveTo(cx - planeW, planeY);
      ctx.lineTo(cx - planeW + planeDepth, planeY - planeDepth * 0.6);
      ctx.lineTo(cx + planeW + planeDepth, planeY - planeDepth * 0.6);
      ctx.lineTo(cx + planeW, planeY);
      ctx.closePath();
      ctx.fill();
      // Plane edges
      ctx.strokeStyle = `hsla(45, 85%, 70%, ${0.7 * planeAppear})`;
      ctx.lineWidth = 1.5 * scale;
      ctx.beginPath();
      ctx.moveTo(cx - planeW, planeY);
      ctx.lineTo(cx + planeW, planeY);
      ctx.stroke();
      // Glow
      ctx.shadowColor = `hsla(45, 90%, 70%, ${0.4 * planeAppear})`;
      ctx.shadowBlur = 12 * scale;
      ctx.beginPath();
      ctx.moveTo(cx - planeW, planeY);
      ctx.lineTo(cx + planeW, planeY);
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    // Labels
    if (labelFade > 0) {
      ctx.globalAlpha = fadeAlpha * labelFade;
      ctx.fillStyle = PALETTE.text.accent;
      ctx.font = `${10 * scale}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText("imaging plane", cx, cy + 55 * scale);
      ctx.fillStyle = PALETTE.text.dim;
      ctx.font = `${8 * scale}px monospace`;
      ctx.fillText("beam passes through this slice only", cx, cy + 68 * scale);
      ctx.globalAlpha = fadeAlpha;
    }

    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V6: React.FC<VariantProps> = ({ width, height }) => {
  // Transparency Demo: two panels comparing thin vs thick
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(18, width, height, scale), [width, height, scale]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, parts, frame, scale);
    const fadeAlpha = fadeInOut(frame, 120);
    ctx.globalAlpha = fadeAlpha;

    const leftAppear = interpolate(frame, [5, 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const rightAppear = interpolate(frame, [35, 60], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const resultFade = interpolate(frame, [55, 75], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

    const leftCx = width * 0.28;
    const rightCx = width * 0.72;
    const topY = height * 0.18;
    const midY = height * 0.45;
    const bottomY = height * 0.7;

    // --- LEFT PANEL: thin section -> bright image ---
    if (leftAppear > 0) {
      ctx.globalAlpha = fadeAlpha * leftAppear;
      // Beam
      ctx.strokeStyle = `hsla(185, 90%, 70%, 0.7)`;
      ctx.lineWidth = 2 * scale;
      ctx.beginPath();
      ctx.moveTo(leftCx, topY);
      ctx.lineTo(leftCx, midY - 8 * scale);
      ctx.stroke();
      // Thin section
      ctx.strokeStyle = `hsla(45, 80%, 65%, 0.8)`;
      ctx.lineWidth = 2 * scale;
      ctx.beginPath();
      ctx.moveTo(leftCx - 25 * scale, midY);
      ctx.lineTo(leftCx + 25 * scale, midY);
      ctx.stroke();
      ctx.fillStyle = PALETTE.text.dim;
      ctx.font = `${8 * scale}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText("thin section", leftCx, midY + 15 * scale);
      // Beam continues through
      ctx.strokeStyle = `hsla(185, 80%, 65%, 0.5)`;
      ctx.lineWidth = 1.5 * scale;
      ctx.beginPath();
      ctx.moveTo(leftCx, midY + 2 * scale);
      ctx.lineTo(leftCx, bottomY - 15 * scale);
      ctx.stroke();
      // Bright image result
      if (resultFade > 0) {
        ctx.globalAlpha = fadeAlpha * resultFade;
        const imgW = 40 * scale, imgH = 30 * scale;
        ctx.fillStyle = `hsla(0, 0%, 80%, ${0.6 * resultFade})`;
        ctx.fillRect(leftCx - imgW / 2, bottomY - imgH / 2, imgW, imgH);
        ctx.strokeStyle = PALETTE.accent.green;
        ctx.lineWidth = 1.5 * scale;
        ctx.strokeRect(leftCx - imgW / 2, bottomY - imgH / 2, imgW, imgH);
        ctx.fillStyle = PALETTE.accent.green;
        ctx.font = `bold ${9 * scale}px system-ui`;
        ctx.fillText("clear image", leftCx, bottomY + imgH / 2 + 14 * scale);
      }
      ctx.globalAlpha = fadeAlpha;
    }

    // --- RIGHT PANEL: thick brain -> nothing ---
    if (rightAppear > 0) {
      ctx.globalAlpha = fadeAlpha * rightAppear;
      // Beam
      ctx.strokeStyle = `hsla(185, 90%, 70%, 0.7)`;
      ctx.lineWidth = 2 * scale;
      ctx.beginPath();
      ctx.moveTo(rightCx, topY);
      ctx.lineTo(rightCx, midY - 20 * scale);
      ctx.stroke();
      // Thick brain (solid circle)
      const brainR = 22 * scale;
      ctx.fillStyle = "hsla(280, 25%, 25%, 0.8)";
      ctx.beginPath();
      ctx.arc(rightCx, midY, brainR, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "hsla(280, 30%, 40%, 0.5)";
      ctx.lineWidth = 1 * scale;
      ctx.stroke();
      ctx.fillStyle = PALETTE.text.dim;
      ctx.font = `${8 * scale}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText("whole brain", rightCx, midY + brainR + 14 * scale);
      // Beam blocked (dashed, fading)
      ctx.strokeStyle = `hsla(185, 60%, 50%, 0.2)`;
      ctx.lineWidth = 1 * scale;
      ctx.setLineDash([3 * scale, 4 * scale]);
      ctx.beginPath();
      ctx.moveTo(rightCx, midY + brainR + 2 * scale);
      ctx.lineTo(rightCx, bottomY - 15 * scale);
      ctx.stroke();
      ctx.setLineDash([]);
      // Dark/empty result
      if (resultFade > 0) {
        ctx.globalAlpha = fadeAlpha * resultFade;
        const imgW = 40 * scale, imgH = 30 * scale;
        ctx.fillStyle = `hsla(0, 0%, 5%, 0.8)`;
        ctx.fillRect(rightCx - imgW / 2, bottomY - imgH / 2, imgW, imgH);
        ctx.strokeStyle = PALETTE.accent.red;
        ctx.lineWidth = 1.5 * scale;
        ctx.strokeRect(rightCx - imgW / 2, bottomY - imgH / 2, imgW, imgH);
        ctx.fillStyle = PALETTE.accent.red;
        ctx.font = `bold ${9 * scale}px system-ui`;
        ctx.fillText("no image", rightCx, bottomY + imgH / 2 + 14 * scale);
      }
      ctx.globalAlpha = fadeAlpha;
    }

    // Divider line
    ctx.strokeStyle = `hsla(220, 30%, 40%, 0.3)`;
    ctx.lineWidth = 1 * scale;
    ctx.setLineDash([4 * scale, 4 * scale]);
    ctx.beginPath();
    ctx.moveTo(width / 2, topY - 10 * scale);
    ctx.lineTo(width / 2, bottomY + 30 * scale);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V7: React.FC<VariantProps> = ({ width, height }) => {
  // Before/After: thick=fail vs thin=pass binary comparison
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(18, width, height, scale), [width, height, scale]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, parts, frame, scale);
    const fadeAlpha = fadeInOut(frame, 120);
    ctx.globalAlpha = fadeAlpha;

    const leftSlide = interpolate(frame, [5, 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const rightSlide = interpolate(frame, [20, 45], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const iconPop = interpolate(frame, [45, 60], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const resultFade = interpolate(frame, [60, 80], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

    const leftCx = width * 0.28;
    const rightCx = width * 0.72;
    const cardY = height * 0.25;
    const cardW = width * 0.32;
    const cardH = height * 0.55;

    // Left card: thick sample = FAIL
    if (leftSlide > 0) {
      const slideOffset = (1 - leftSlide) * -40 * scale;
      ctx.globalAlpha = fadeAlpha * leftSlide;
      // Card background
      ctx.fillStyle = "hsla(0, 20%, 18%, 0.4)";
      ctx.fillRect(leftCx - cardW / 2 + slideOffset, cardY, cardW, cardH);
      ctx.strokeStyle = "hsla(0, 40%, 45%, 0.4)";
      ctx.lineWidth = 1 * scale;
      ctx.strokeRect(leftCx - cardW / 2 + slideOffset, cardY, cardW, cardH);
      // Thick block
      const blockX = leftCx + slideOffset;
      const blockY = cardY + cardH * 0.3;
      ctx.fillStyle = "hsla(280, 20%, 25%, 0.8)";
      ctx.fillRect(blockX - 25 * scale, blockY - 20 * scale, 50 * scale, 40 * scale);
      ctx.fillStyle = PALETTE.text.dim;
      ctx.font = `${9 * scale}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText("thick sample", blockX, blockY + 30 * scale);
      // Red X
      if (iconPop > 0) {
        const xScale = iconPop;
        ctx.strokeStyle = PALETTE.accent.red;
        ctx.lineWidth = 3 * scale * xScale;
        ctx.lineCap = "round";
        const xr = 15 * scale * xScale;
        ctx.beginPath();
        ctx.moveTo(blockX - xr, blockY - 25 * scale - xr);
        ctx.lineTo(blockX + xr, blockY - 25 * scale + xr);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(blockX + xr, blockY - 25 * scale - xr);
        ctx.lineTo(blockX - xr, blockY - 25 * scale + xr);
        ctx.stroke();
      }
      // Dark result
      if (resultFade > 0) {
        ctx.globalAlpha = fadeAlpha * resultFade;
        ctx.fillStyle = "hsla(0, 0%, 5%, 0.7)";
        ctx.fillRect(blockX - 20 * scale, cardY + cardH * 0.65, 40 * scale, 25 * scale);
        ctx.fillStyle = PALETTE.accent.red;
        ctx.font = `bold ${8 * scale}px monospace`;
        ctx.fillText("dark / nothing", blockX, cardY + cardH * 0.65 + 40 * scale);
      }
      ctx.globalAlpha = fadeAlpha;
    }

    // Right card: thin section = PASS
    if (rightSlide > 0) {
      const slideOffset = (1 - rightSlide) * 40 * scale;
      ctx.globalAlpha = fadeAlpha * rightSlide;
      // Card background
      ctx.fillStyle = "hsla(140, 15%, 18%, 0.4)";
      ctx.fillRect(rightCx - cardW / 2 + slideOffset, cardY, cardW, cardH);
      ctx.strokeStyle = "hsla(140, 35%, 40%, 0.4)";
      ctx.lineWidth = 1 * scale;
      ctx.strokeRect(rightCx - cardW / 2 + slideOffset, cardY, cardW, cardH);
      // Thin section line
      const sectionX = rightCx + slideOffset;
      const sectionY = cardY + cardH * 0.3;
      ctx.strokeStyle = `hsla(45, 80%, 65%, 0.8)`;
      ctx.lineWidth = 2 * scale;
      ctx.beginPath();
      ctx.moveTo(sectionX - 30 * scale, sectionY);
      ctx.lineTo(sectionX + 30 * scale, sectionY);
      ctx.stroke();
      ctx.fillStyle = PALETTE.text.dim;
      ctx.font = `${9 * scale}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText("thin section", sectionX, sectionY + 18 * scale);
      // Green check
      if (iconPop > 0) {
        ctx.strokeStyle = PALETTE.accent.green;
        ctx.lineWidth = 3 * scale * iconPop;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        const checkSize = 14 * scale * iconPop;
        ctx.beginPath();
        ctx.moveTo(sectionX - checkSize, sectionY - 20 * scale);
        ctx.lineTo(sectionX - checkSize * 0.3, sectionY - 20 * scale + checkSize * 0.7);
        ctx.lineTo(sectionX + checkSize, sectionY - 20 * scale - checkSize * 0.5);
        ctx.stroke();
      }
      // Bright result
      if (resultFade > 0) {
        ctx.globalAlpha = fadeAlpha * resultFade;
        ctx.fillStyle = "hsla(0, 0%, 75%, 0.6)";
        ctx.fillRect(sectionX - 20 * scale, cardY + cardH * 0.65, 40 * scale, 25 * scale);
        ctx.fillStyle = PALETTE.accent.green;
        ctx.font = `bold ${8 * scale}px monospace`;
        ctx.fillText("clear image", sectionX, cardY + cardH * 0.65 + 40 * scale);
      }
      ctx.globalAlpha = fadeAlpha;
    }

    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V8: React.FC<VariantProps> = ({ width, height }) => {
  // Beam Path Diagram: vertical column — source → lens → specimen → detector
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(18, width, height, scale), [width, height, scale]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, parts, frame, scale);
    const fadeAlpha = fadeInOut(frame, 120);
    ctx.globalAlpha = fadeAlpha;

    const cx = width * 0.45;
    const stages = [
      { y: height * 0.1, label: "electron source", hue: 185 },
      { y: height * 0.26, label: "condenser lens", hue: 220 },
      { y: height * 0.46, label: "specimen (must be thin!)", hue: 45 },
      { y: height * 0.62, label: "objective lens", hue: 220 },
      { y: height * 0.8, label: "detector", hue: 140 },
    ];

    for (let i = 0; i < stages.length; i++) {
      const stageDelay = i * 12;
      const stageAppear = interpolate(frame, [5 + stageDelay, 18 + stageDelay], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      if (stageAppear <= 0) continue;

      const stage = stages[i];
      ctx.globalAlpha = fadeAlpha * stageAppear;

      // Component icon
      if (i === 0) {
        // Electron source: bright dot
        ctx.fillStyle = `hsla(185, 90%, 80%, ${stageAppear})`;
        ctx.beginPath();
        ctx.arc(cx, stage.y, 6 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowColor = "hsla(185, 90%, 70%, 0.5)";
        ctx.shadowBlur = 10 * scale;
        ctx.fill();
        ctx.shadowBlur = 0;
      } else if (i === 1 || i === 3) {
        // Lens: horizontal convex shape
        ctx.strokeStyle = `hsla(220, 50%, 60%, ${stageAppear * 0.8})`;
        ctx.lineWidth = 2 * scale;
        ctx.beginPath();
        ctx.moveTo(cx - 20 * scale, stage.y);
        ctx.quadraticCurveTo(cx, stage.y - 8 * scale, cx + 20 * scale, stage.y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx - 20 * scale, stage.y);
        ctx.quadraticCurveTo(cx, stage.y + 8 * scale, cx + 20 * scale, stage.y);
        ctx.stroke();
      } else if (i === 2) {
        // Specimen slot — highlighted in gold
        ctx.strokeStyle = `hsla(45, 85%, 70%, ${stageAppear})`;
        ctx.lineWidth = 2.5 * scale;
        ctx.beginPath();
        ctx.moveTo(cx - 25 * scale, stage.y);
        ctx.lineTo(cx + 25 * scale, stage.y);
        ctx.stroke();
        ctx.shadowColor = `hsla(45, 90%, 70%, 0.5)`;
        ctx.shadowBlur = 8 * scale;
        ctx.stroke();
        ctx.shadowBlur = 0;
        // Emphasis box around "must be thin"
        ctx.strokeStyle = `hsla(45, 70%, 60%, ${stageAppear * 0.4})`;
        ctx.lineWidth = 1 * scale;
        ctx.setLineDash([3 * scale, 2 * scale]);
        ctx.strokeRect(cx - 30 * scale, stage.y - 6 * scale, 60 * scale, 12 * scale);
        ctx.setLineDash([]);
      } else if (i === 4) {
        // Detector
        drawCamera(ctx, cx, stage.y, 22 * scale, `hsla(140, 50%, 60%, ${stageAppear * 0.8})`);
      }

      // Beam segment connecting to next stage
      if (i < stages.length - 1) {
        const nextY = stages[i + 1].y;
        const connAppear = interpolate(frame, [12 + stageDelay, 20 + stageDelay], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        if (connAppear > 0) {
          ctx.strokeStyle = `hsla(185, 70%, 65%, ${connAppear * 0.35})`;
          ctx.lineWidth = 1.5 * scale;
          ctx.beginPath();
          ctx.moveTo(cx, stage.y + 10 * scale);
          ctx.lineTo(cx, stage.y + 10 * scale + (nextY - stage.y - 20 * scale) * connAppear);
          ctx.stroke();
        }
      }

      // Label
      ctx.fillStyle = i === 2 ? PALETTE.text.accent : PALETTE.text.dim;
      ctx.font = i === 2 ? `bold ${9 * scale}px system-ui` : `${8 * scale}px system-ui`;
      ctx.textAlign = "left";
      ctx.fillText(stage.label, cx + 35 * scale, stage.y + 4 * scale);
    }

    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V9: React.FC<VariantProps> = ({ width, height }) => {
  // Opaque vs Transparent: two circles with beam paths showing pass/block
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(18, width, height, scale), [width, height, scale]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, parts, frame, scale);
    const fadeAlpha = fadeInOut(frame, 120);
    ctx.globalAlpha = fadeAlpha;

    const circleAppear = interpolate(frame, [5, 25], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const beamAnim = interpolate(frame, [25, 55], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const resultFade = interpolate(frame, [55, 75], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const labelFade = interpolate(frame, [30, 45], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

    const leftCx = width * 0.28;
    const rightCx = width * 0.72;
    const cy = height * 0.45;
    const radius = 35 * scale;

    // --- LEFT: opaque solid circle (whole brain) ---
    if (circleAppear > 0) {
      ctx.globalAlpha = fadeAlpha * circleAppear;
      // Solid opaque circle
      const grad = ctx.createRadialGradient(leftCx - 5 * scale, cy - 5 * scale, 0, leftCx, cy, radius);
      grad.addColorStop(0, "hsla(280, 25%, 35%, 0.8)");
      grad.addColorStop(1, "hsla(280, 20%, 18%, 0.9)");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(leftCx, cy, radius * circleAppear, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = fadeAlpha;
    }

    // Beam hitting opaque (bouncing off)
    if (beamAnim > 0) {
      ctx.globalAlpha = fadeAlpha * beamAnim;
      // Incoming beam
      ctx.strokeStyle = `hsla(185, 90%, 70%, 0.7)`;
      ctx.lineWidth = 2 * scale;
      ctx.beginPath();
      ctx.moveTo(leftCx, cy - radius - 35 * scale);
      ctx.lineTo(leftCx, cy - radius);
      ctx.stroke();
      // Beam bounces/scatters
      const scatterLen = 20 * scale * beamAnim;
      for (let i = 0; i < 4; i++) {
        const angle = -Math.PI * 0.7 + (i / 3) * Math.PI * 0.4;
        ctx.strokeStyle = `hsla(185, 70%, 60%, ${0.3 * beamAnim})`;
        ctx.lineWidth = 1 * scale;
        ctx.beginPath();
        ctx.moveTo(leftCx, cy - radius);
        ctx.lineTo(leftCx + Math.cos(angle) * scatterLen, cy - radius + Math.sin(angle) * scatterLen);
        ctx.stroke();
      }
      // No beam below
      ctx.strokeStyle = `hsla(185, 50%, 50%, 0.15)`;
      ctx.setLineDash([3 * scale, 4 * scale]);
      ctx.beginPath();
      ctx.moveTo(leftCx, cy + radius);
      ctx.lineTo(leftCx, cy + radius + 30 * scale);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.globalAlpha = fadeAlpha;
    }

    // --- RIGHT: thin ring (section) with beam passing through ---
    if (circleAppear > 0) {
      ctx.globalAlpha = fadeAlpha * circleAppear;
      // Thin ring
      ctx.strokeStyle = `hsla(45, 80%, 65%, ${0.7 * circleAppear})`;
      ctx.lineWidth = 2 * scale;
      ctx.beginPath();
      ctx.arc(rightCx, cy, radius * circleAppear, 0, Math.PI * 2);
      ctx.stroke();
      // Faint fill
      ctx.fillStyle = `hsla(45, 60%, 55%, ${0.08 * circleAppear})`;
      ctx.fill();
      ctx.globalAlpha = fadeAlpha;
    }

    // Beam passing through
    if (beamAnim > 0) {
      ctx.globalAlpha = fadeAlpha * beamAnim;
      // Full beam through
      const beamEnd = cy + radius + 35 * scale * beamAnim;
      ctx.strokeStyle = `hsla(185, 90%, 70%, 0.7)`;
      ctx.lineWidth = 2 * scale;
      ctx.beginPath();
      ctx.moveTo(rightCx, cy - radius - 35 * scale);
      ctx.lineTo(rightCx, beamEnd);
      ctx.stroke();
      // Arrow at bottom
      if (beamAnim > 0.5) {
        ctx.fillStyle = `hsla(185, 90%, 70%, 0.7)`;
        ctx.beginPath();
        ctx.moveTo(rightCx, beamEnd);
        ctx.lineTo(rightCx - 4 * scale, beamEnd - 8 * scale);
        ctx.lineTo(rightCx + 4 * scale, beamEnd - 8 * scale);
        ctx.closePath();
        ctx.fill();
      }
      ctx.globalAlpha = fadeAlpha;
    }

    // Labels
    if (labelFade > 0) {
      ctx.globalAlpha = fadeAlpha * labelFade;
      ctx.fillStyle = PALETTE.text.dim;
      ctx.font = `${9 * scale}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText("whole brain", leftCx, cy + radius + 20 * scale);
      ctx.fillStyle = `hsla(0, 50%, 60%, 0.8)`;
      ctx.font = `${8 * scale}px monospace`;
      ctx.fillText("beam blocked", leftCx, cy + radius + 33 * scale);

      ctx.fillStyle = PALETTE.text.dim;
      ctx.font = `${9 * scale}px system-ui`;
      ctx.fillText("thin section", rightCx, cy + radius + 20 * scale);
      ctx.fillStyle = `hsla(140, 50%, 60%, 0.8)`;
      ctx.font = `${8 * scale}px monospace`;
      ctx.fillText("beam passes through", rightCx, cy + radius + 33 * scale);
      ctx.globalAlpha = fadeAlpha;
    }

    // Detector icons below
    if (resultFade > 0) {
      ctx.globalAlpha = fadeAlpha * resultFade;
      drawCamera(ctx, leftCx, cy + radius + 55 * scale, 16 * scale, `hsla(0, 40%, 45%, ${resultFade * 0.5})`);
      drawCamera(ctx, rightCx, cy + radius + 55 * scale, 16 * scale, `hsla(140, 50%, 60%, ${resultFade * 0.8})`);
      ctx.globalAlpha = fadeAlpha;
    }

    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

export const VARIANTS_SHOT_013: VariantDef[] = [
  { id: "beam-diagram", label: "Beam Diagram", component: V1 },
  { id: "cross-section", label: "Cross-Section View", component: V2 },
  { id: "beam-scan", label: "Beam Column Scan", component: V3 },
  { id: "slice-highlight", label: "Slice on Brain", component: V4 },
  { id: "cutting-plane", label: "3D Cutting Plane", component: V5 },
  { id: "transparency-demo", label: "Transparency Demo", component: V6 },
  { id: "before-after", label: "Before / After", component: V7 },
  { id: "beam-path", label: "Beam Path Diagram", component: V8 },
  { id: "opaque-transparent", label: "Opaque vs Transparent", component: V9 },
];
