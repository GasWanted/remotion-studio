import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantDef, VariantProps } from "../types";
import { seeded, drawBg, makeParticles, drawParticles, PALETTE, fadeInOut } from "../scenes/theme";
import { drawMicroscope, drawWave, drawEye, drawNeuron, drawCamera, drawX, drawCheck } from "../icons";

// Shot 11 — "So you use electrons instead. They have a much shorter wavelength,"
// 120 frames (4s). Light wave morphs/compresses into much tighter electron wave.

const V1: React.FC<VariantProps> = ({ width, height }) => {
  // Wave Morph: wide golden sine compresses to tight cyan, color shifts, label updates, green checkmark
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const particles = useMemo(() => makeParticles(20, width, height, scale, 11001), [width, height, scale]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, particles, frame, scale);
    const fadeAlpha = fadeInOut(frame, 120);
    ctx.globalAlpha = fadeAlpha;
    const waveY = height * 0.42;
    const leftX = width * 0.08;
    const waveWidth = width * 0.84;
    // Compression progress: 0 = light (wide), 1 = electron (tight)
    const morphProgress = interpolate(frame, [15, 75], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    // Wavelength: 80px (light) -> 6px (electron)
    const wavelength = 80 * scale + (6 * scale - 80 * scale) * morphProgress;
    const amplitude = 18 * scale + (10 * scale - 18 * scale) * morphProgress;
    // Color: gold (hue 50) -> cyan (hue 190)
    const hue = 50 + (190 - 50) * morphProgress;
    const saturation = 65 + (60 - 65) * morphProgress;
    const lightness = 60 + (65 - 60) * morphProgress;
    const phase = frame * 0.05;
    // Glow
    ctx.strokeStyle = `hsla(${hue}, ${saturation - 10}%, ${lightness - 5}%, 0.12)`;
    ctx.lineWidth = 14 * scale;
    ctx.beginPath();
    for (let px = 0; px <= waveWidth; px += 2) {
      const yy = waveY + Math.sin((px / wavelength) * Math.PI * 2 + phase) * amplitude;
      px === 0 ? ctx.moveTo(leftX + px, yy) : ctx.lineTo(leftX + px, yy);
    }
    ctx.stroke();
    // Main wave
    drawWave(ctx, leftX, waveY, waveWidth, wavelength, amplitude,
      `hsla(${hue}, ${saturation}%, ${lightness}%, 0.8)`, 2.5 * scale, phase);
    // Label: transitions from "light" to "electron"
    const labelSwitch = interpolate(frame, [35, 50], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.font = `bold ${13 * scale}px system-ui`;
    ctx.textAlign = "center";
    if (labelSwitch < 0.5) {
      ctx.globalAlpha = fadeAlpha * (1 - labelSwitch * 2);
      ctx.fillStyle = PALETTE.accent.gold;
      ctx.fillText("light: λ = 500 nm", width * 0.5, height * 0.14);
    }
    if (labelSwitch > 0.5) {
      ctx.globalAlpha = fadeAlpha * ((labelSwitch - 0.5) * 2);
      ctx.fillStyle = `hsla(190, 60%, 65%, 1)`;
      ctx.fillText("electron: λ = 0.005 nm", width * 0.5, height * 0.14);
    }
    // Arrow indicating direction of compression
    const arrowAlpha = interpolate(frame, [10, 20, 70, 80], [0, 0.6, 0.6, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (arrowAlpha > 0) {
      ctx.globalAlpha = fadeAlpha * arrowAlpha;
      ctx.fillStyle = PALETTE.text.dim;
      ctx.font = `${10 * scale}px system-ui`;
      ctx.fillText("compressing →", width * 0.5, height * 0.72);
    }
    // Green checkmark at end
    const checkAppear = interpolate(frame, [80, 95], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (checkAppear > 0) {
      ctx.globalAlpha = fadeAlpha * checkAppear;
      const checkScale = 1 + (1 - checkAppear) * 1.5;
      ctx.save();
      ctx.translate(width * 0.5, height * 0.72);
      ctx.scale(checkScale, checkScale);
      drawCheck(ctx, 0, 0, 30 * scale, PALETTE.accent.green);
      ctx.restore();
      ctx.fillStyle = PALETTE.accent.green;
      ctx.font = `bold ${11 * scale}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText("100,000x shorter", width * 0.5, height * 0.83);
    }
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V2: React.FC<VariantProps> = ({ width, height }) => {
  // Side-by-Side Compare: left wide golden wave, right tight cyan wave, arrow between
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const particles = useMemo(() => makeParticles(20, width, height, scale, 11002), [width, height, scale]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, particles, frame, scale);
    const fadeAlpha = fadeInOut(frame, 120);
    ctx.globalAlpha = fadeAlpha;
    const panelW = width * 0.38;
    const panelH = height * 0.45;
    const centerGap = width * 0.06;
    const leftPanelX = width * 0.5 - panelW - centerGap / 2;
    const rightPanelX = width * 0.5 + centerGap / 2;
    const panelY = height * 0.2;
    const phase = frame * 0.05;
    // Left panel: light wave (wide, golden)
    const leftAppear = interpolate(frame, [5, 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (leftAppear > 0) {
      ctx.globalAlpha = fadeAlpha * leftAppear;
      // Panel bg
      ctx.fillStyle = `hsla(50, 20%, 18%, 0.3)`;
      ctx.fillRect(leftPanelX, panelY, panelW, panelH);
      ctx.strokeStyle = `hsla(50, 35%, 40%, 0.4)`;
      ctx.lineWidth = 1.5 * scale;
      ctx.strokeRect(leftPanelX, panelY, panelW, panelH);
      // Wide sine wave
      const waveY = panelY + panelH / 2;
      const wavelength = 50 * scale;
      const amplitude = panelH * 0.3;
      drawWave(ctx, leftPanelX + 8 * scale, waveY, panelW - 16 * scale, wavelength, amplitude,
        `hsla(50, 65%, 60%, 0.75)`, 2.5 * scale, phase);
      // Label
      ctx.fillStyle = PALETTE.accent.gold;
      ctx.font = `bold ${12 * scale}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText("light", leftPanelX + panelW / 2, panelY - 12 * scale);
      ctx.fillStyle = PALETTE.text.dim;
      ctx.font = `${10 * scale}px monospace`;
      ctx.fillText("λ = 500 nm", leftPanelX + panelW / 2, panelY + panelH + 16 * scale);
    }
    // Right panel: electron wave (tight, cyan)
    const rightAppear = interpolate(frame, [30, 55], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (rightAppear > 0) {
      ctx.globalAlpha = fadeAlpha * rightAppear;
      // Panel bg
      ctx.fillStyle = `hsla(190, 20%, 18%, 0.3)`;
      ctx.fillRect(rightPanelX, panelY, panelW, panelH);
      ctx.strokeStyle = `hsla(190, 35%, 40%, 0.4)`;
      ctx.lineWidth = 1.5 * scale;
      ctx.strokeRect(rightPanelX, panelY, panelW, panelH);
      // Tight sine wave
      const waveY = panelY + panelH / 2;
      const wavelength = 4 * scale; // Much tighter
      const amplitude = panelH * 0.2;
      drawWave(ctx, rightPanelX + 8 * scale, waveY, panelW - 16 * scale, wavelength, amplitude,
        `hsla(190, 60%, 65%, 0.75)`, 2 * scale, phase);
      // Label
      ctx.fillStyle = `hsla(190, 60%, 65%, 1)`;
      ctx.font = `bold ${12 * scale}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText("electron", rightPanelX + panelW / 2, panelY - 12 * scale);
      ctx.fillStyle = PALETTE.text.dim;
      ctx.font = `${10 * scale}px monospace`;
      ctx.fillText("λ = 0.005 nm", rightPanelX + panelW / 2, panelY + panelH + 16 * scale);
    }
    // Arrow between panels
    const arrowAppear = interpolate(frame, [40, 55], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (arrowAppear > 0) {
      ctx.globalAlpha = fadeAlpha * arrowAppear;
      const arrowY = panelY + panelH / 2;
      const arrowLeft = leftPanelX + panelW + 5 * scale;
      const arrowRight = rightPanelX - 5 * scale;
      const arrowMid = (arrowLeft + arrowRight) / 2;
      ctx.strokeStyle = PALETTE.text.primary;
      ctx.lineWidth = 2 * scale;
      ctx.beginPath();
      ctx.moveTo(arrowLeft, arrowY);
      ctx.lineTo(arrowRight, arrowY);
      ctx.stroke();
      // Arrowhead
      ctx.fillStyle = PALETTE.text.primary;
      ctx.beginPath();
      ctx.moveTo(arrowRight, arrowY);
      ctx.lineTo(arrowRight - 6 * scale, arrowY - 4 * scale);
      ctx.lineTo(arrowRight - 6 * scale, arrowY + 4 * scale);
      ctx.closePath();
      ctx.fill();
      // "100,000x" label on arrow
      ctx.fillStyle = PALETTE.text.accent;
      ctx.font = `bold ${9 * scale}px monospace`;
      ctx.textAlign = "center";
      ctx.fillText("100,000x", arrowMid, arrowY - 8 * scale);
      ctx.fillText("shorter", arrowMid, arrowY + 14 * scale);
    }
    // Bottom note
    const noteAlpha = interpolate(frame, [70, 85], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (noteAlpha > 0) {
      ctx.globalAlpha = fadeAlpha * noteAlpha;
      ctx.fillStyle = PALETTE.text.dim;
      ctx.font = `${11 * scale}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText("electrons resolve what light cannot", width * 0.5, height * 0.9);
    }
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V3: React.FC<VariantProps> = ({ width, height }) => {
  // Wavelength Slider: dial at bottom, wave above compresses in real-time, labels update
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const particles = useMemo(() => makeParticles(18, width, height, scale, 11003), [width, height, scale]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, particles, frame, scale);
    const fadeAlpha = fadeInOut(frame, 120);
    ctx.globalAlpha = fadeAlpha;
    // Slider position: 0 = light, 1 = electron
    const sliderProgress = interpolate(frame, [20, 85], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    // Slider track
    const sliderY = height * 0.78;
    const sliderLeft = width * 0.15;
    const sliderRight = width * 0.85;
    const sliderWidth = sliderRight - sliderLeft;
    const sliderAppear = interpolate(frame, [5, 18], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (sliderAppear > 0) {
      ctx.globalAlpha = fadeAlpha * sliderAppear;
      // Track background
      ctx.strokeStyle = `hsla(220, 30%, 40%, 0.5)`;
      ctx.lineWidth = 4 * scale;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(sliderLeft, sliderY);
      ctx.lineTo(sliderRight, sliderY);
      ctx.stroke();
      // Filled portion (gradient gold->cyan)
      const grad = ctx.createLinearGradient(sliderLeft, 0, sliderRight, 0);
      grad.addColorStop(0, `hsla(50, 65%, 55%, 0.7)`);
      grad.addColorStop(1, `hsla(190, 60%, 60%, 0.7)`);
      ctx.strokeStyle = grad;
      ctx.lineWidth = 4 * scale;
      ctx.beginPath();
      ctx.moveTo(sliderLeft, sliderY);
      ctx.lineTo(sliderLeft + sliderWidth * sliderProgress, sliderY);
      ctx.stroke();
      // Slider thumb
      const thumbX = sliderLeft + sliderWidth * sliderProgress;
      const thumbHue = 50 + (190 - 50) * sliderProgress;
      ctx.fillStyle = `hsla(${thumbHue}, 60%, 60%, 0.9)`;
      ctx.beginPath();
      ctx.arc(thumbX, sliderY, 7 * scale, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = `hsla(${thumbHue}, 60%, 70%, 0.6)`;
      ctx.lineWidth = 2 * scale;
      ctx.beginPath();
      ctx.arc(thumbX, sliderY, 7 * scale, 0, Math.PI * 2);
      ctx.stroke();
      // Labels at ends
      ctx.fillStyle = PALETTE.accent.gold;
      ctx.font = `${9 * scale}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText("light", sliderLeft, sliderY + 16 * scale);
      ctx.fillStyle = `hsla(190, 60%, 65%, 1)`;
      ctx.fillText("electron", sliderRight, sliderY + 16 * scale);
    }
    // Wave above the slider — compresses based on slider position
    const waveY = height * 0.38;
    const wavelength = 80 * scale * (1 - sliderProgress * 0.92); // Down to ~8% of original
    const amplitude = 20 * scale * (1 - sliderProgress * 0.3);
    const hue = 50 + (190 - 50) * sliderProgress;
    const phase = frame * 0.06;
    const waveLeft = width * 0.08;
    const waveWidth = width * 0.84;
    // Glow
    ctx.globalAlpha = fadeAlpha;
    ctx.strokeStyle = `hsla(${hue}, 55%, 55%, 0.1)`;
    ctx.lineWidth = 14 * scale;
    ctx.beginPath();
    for (let px = 0; px <= waveWidth; px += 2) {
      const yy = waveY + Math.sin((px / wavelength) * Math.PI * 2 + phase) * amplitude;
      px === 0 ? ctx.moveTo(waveLeft + px, yy) : ctx.lineTo(waveLeft + px, yy);
    }
    ctx.stroke();
    // Main wave
    drawWave(ctx, waveLeft, waveY, waveWidth, wavelength, amplitude,
      `hsla(${hue}, 65%, 62%, 0.8)`, 2.5 * scale, phase);
    // Wavelength readout
    const nmValue = 500 * (1 - sliderProgress * 0.99999); // 500 -> ~0.005
    const displayNm = sliderProgress < 0.5 ? `${nmValue.toFixed(0)} nm` : `${nmValue.toFixed(sliderProgress > 0.9 ? 3 : 1)} nm`;
    ctx.fillStyle = `hsla(${hue}, 60%, 65%, 1)`;
    ctx.font = `bold ${15 * scale}px monospace`;
    ctx.textAlign = "center";
    ctx.fillText(`λ = ${displayNm}`, width * 0.5, height * 0.14);
    // Multiplier text
    if (sliderProgress > 0.8) {
      const multAlpha = interpolate(sliderProgress, [0.8, 1], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      ctx.globalAlpha = fadeAlpha * multAlpha;
      ctx.fillStyle = PALETTE.accent.green;
      ctx.font = `bold ${11 * scale}px system-ui`;
      ctx.fillText("100,000x shorter wavelength", width * 0.5, height * 0.62);
    }
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V4: React.FC<VariantProps> = ({ width, height }) => {
  // Light-to-Electron Beam: microscope icon transitions, beam changes from wide golden to tight cyan
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const particles = useMemo(() => makeParticles(18, width, height, scale, 11004), [width, height, scale]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, particles, frame, scale);
    const fadeAlpha = fadeInOut(frame, 120);
    ctx.globalAlpha = fadeAlpha;
    const sourceX = width * 0.15;
    const sourceY = height * 0.35;
    // Transition progress
    const transition = interpolate(frame, [35, 65], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const hue = 50 + (190 - 50) * transition;
    // Source icon — microscope that shifts appearance
    const sourceAppear = interpolate(frame, [3, 18], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (sourceAppear > 0) {
      ctx.globalAlpha = fadeAlpha * sourceAppear;
      const sourceColor = `hsla(${hue}, 50%, 55%, 0.8)`;
      drawMicroscope(ctx, sourceX, sourceY, 55 * scale, sourceColor);
      // Label above
      ctx.font = `bold ${10 * scale}px system-ui`;
      ctx.textAlign = "center";
      if (transition < 0.5) {
        ctx.globalAlpha = fadeAlpha * sourceAppear * (1 - transition * 2);
        ctx.fillStyle = PALETTE.accent.gold;
        ctx.fillText("light microscope", sourceX, sourceY - 45 * scale);
      }
      if (transition > 0.5) {
        ctx.globalAlpha = fadeAlpha * sourceAppear * ((transition - 0.5) * 2);
        ctx.fillStyle = `hsla(190, 60%, 65%, 1)`;
        ctx.fillText("electron microscope", sourceX, sourceY - 45 * scale);
      }
    }
    // Beam emanating from source
    const beamAppear = interpolate(frame, [12, 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (beamAppear > 0) {
      ctx.globalAlpha = fadeAlpha * beamAppear;
      const beamStartX = sourceX + 35 * scale;
      const beamEndX = width * 0.75;
      const beamLen = (beamEndX - beamStartX) * beamAppear;
      const beamY = sourceY + 12 * scale;
      // Beam width shrinks with transition
      const beamSpread = (16 * scale) * (1 - transition * 0.85);
      const wavelength = 30 * scale * (1 - transition * 0.9);
      // Multiple wave lines forming the beam
      for (let line = -1; line <= 1; line++) {
        const offsetY = line * beamSpread;
        ctx.strokeStyle = `hsla(${hue}, 60%, 60%, ${0.5 - Math.abs(line) * 0.15})`;
        ctx.lineWidth = (2 - Math.abs(line) * 0.5) * scale;
        ctx.beginPath();
        for (let px = 0; px <= beamLen; px += 2) {
          const yy = beamY + offsetY + Math.sin((px / wavelength) * Math.PI * 2 + frame * 0.08) * beamSpread * 0.3;
          px === 0 ? ctx.moveTo(beamStartX + px, yy) : ctx.lineTo(beamStartX + px, yy);
        }
        ctx.stroke();
      }
      // Beam glow
      const glowGrad = ctx.createLinearGradient(beamStartX, beamY - beamSpread * 2, beamStartX, beamY + beamSpread * 2);
      glowGrad.addColorStop(0, `hsla(${hue}, 50%, 55%, 0)`);
      glowGrad.addColorStop(0.5, `hsla(${hue}, 50%, 55%, 0.08)`);
      glowGrad.addColorStop(1, `hsla(${hue}, 50%, 55%, 0)`);
      ctx.fillStyle = glowGrad;
      ctx.fillRect(beamStartX, beamY - beamSpread * 2, beamLen, beamSpread * 4);
    }
    // Result view (right side) — blurry/sharp circle
    const resultAppear = interpolate(frame, [25, 45], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (resultAppear > 0) {
      ctx.globalAlpha = fadeAlpha * resultAppear;
      const resultX = width * 0.82;
      const resultY = sourceY + 12 * scale;
      const resultR = 30 * scale;
      // Circle background
      ctx.fillStyle = "rgba(10, 7, 18, 0.9)";
      ctx.beginPath();
      ctx.arc(resultX, resultY, resultR, 0, Math.PI * 2);
      ctx.fill();
      // Content: blurry blob (light) -> sharp neuron (electron)
      ctx.save();
      ctx.beginPath();
      ctx.arc(resultX, resultY, resultR - 2 * scale, 0, Math.PI * 2);
      ctx.clip();
      if (transition < 0.8) {
        // Blurry blob
        for (let i = 0; i < 4; i++) {
          const grad = ctx.createRadialGradient(
            resultX + (i - 1.5) * 5 * scale, resultY + (i % 2 - 0.5) * 5 * scale, 0,
            resultX + (i - 1.5) * 5 * scale, resultY + (i % 2 - 0.5) * 5 * scale, 12 * scale
          );
          grad.addColorStop(0, `hsla(${220 + i * 20}, 30%, 45%, ${0.35 * (1 - transition)})`);
          grad.addColorStop(1, `hsla(${230 + i * 15}, 20%, 35%, 0)`);
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(resultX + (i - 1.5) * 5 * scale, resultY + (i % 2 - 0.5) * 5 * scale, 12 * scale, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      if (transition > 0.3) {
        // Sharp neuron fading in
        ctx.globalAlpha = fadeAlpha * resultAppear * Math.min(1, (transition - 0.3) / 0.5);
        drawNeuron(ctx, resultX, resultY, 22 * scale, `hsla(190, 55%, 65%, 0.9)`, frame);
      }
      ctx.restore();
      // Ring
      ctx.globalAlpha = fadeAlpha * resultAppear;
      ctx.strokeStyle = `hsla(${hue}, 40%, 50%, 0.6)`;
      ctx.lineWidth = 2 * scale;
      ctx.beginPath();
      ctx.arc(resultX, resultY, resultR, 0, Math.PI * 2);
      ctx.stroke();
      // Label below result
      if (transition < 0.5) {
        ctx.fillStyle = PALETTE.accent.red;
        ctx.font = `${9 * scale}px system-ui`;
        ctx.textAlign = "center";
        ctx.fillText("blurry", resultX, resultY + resultR + 14 * scale);
      } else {
        ctx.fillStyle = PALETTE.accent.green;
        ctx.font = `${9 * scale}px system-ui`;
        ctx.textAlign = "center";
        ctx.fillText("sharp!", resultX, resultY + resultR + 14 * scale);
      }
    }
    // Bottom label
    const bottomAlpha = interpolate(frame, [80, 95], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (bottomAlpha > 0) {
      ctx.globalAlpha = fadeAlpha * bottomAlpha;
      ctx.fillStyle = PALETTE.text.dim;
      ctx.font = `${11 * scale}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText("electrons: much shorter wavelength", width * 0.5, height * 0.88);
    }
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V5: React.FC<VariantProps> = ({ width, height }) => {
  // Resolution Improvement: neuron structures from shot 10, wave compresses until structures become visible
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const particles = useMemo(() => makeParticles(18, width, height, scale, 11005), [width, height, scale]);
  const neurons = useMemo(() => {
    const rand = seeded(11051);
    return Array.from({ length: 12 }, (_, i) => ({
      x: width * (0.15 + (i / 11) * 0.7),
      y: height * 0.55 + (rand() - 0.5) * 12 * scale,
      r: (1.5 + rand() * 1.5) * scale,
    }));
  }, [width, height, scale]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, particles, frame, scale);
    const fadeAlpha = fadeInOut(frame, 120);
    ctx.globalAlpha = fadeAlpha;
    const waveY = height * 0.32;
    // Compression: wide -> tight
    const compression = interpolate(frame, [15, 80], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const wavelength = 75 * scale * (1 - compression * 0.92);
    const amplitude = 18 * scale * (1 - compression * 0.25);
    const hue = 50 + (190 - 50) * compression;
    const phase = frame * 0.05;
    // Wave
    ctx.globalAlpha = fadeAlpha;
    drawWave(ctx, width * 0.08, waveY, width * 0.84, wavelength, amplitude,
      `hsla(${hue}, 65%, 62%, 0.75)`, 2.5 * scale, phase);
    // Neuron structures — visibility increases as wave tightens
    const neuronVisibility = interpolate(compression, [0, 0.6, 1], [0.15, 0.15, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    for (const n of neurons) {
      ctx.globalAlpha = fadeAlpha * neuronVisibility;
      ctx.fillStyle = `hsla(280, 50%, 60%, ${neuronVisibility})`;
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r * (0.5 + neuronVisibility * 0.5), 0, Math.PI * 2);
      ctx.fill();
      // Glow when resolved
      if (neuronVisibility > 0.5) {
        ctx.fillStyle = `hsla(280, 40%, 55%, ${(neuronVisibility - 0.5) * 0.3})`;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r * 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    // Labels
    ctx.globalAlpha = fadeAlpha;
    ctx.fillStyle = `hsla(${hue}, 60%, 65%, 0.8)`;
    ctx.font = `bold ${12 * scale}px monospace`;
    ctx.textAlign = "center";
    const nmVal = compression < 0.5 ? `${Math.round(500 * (1 - compression * 0.99))} nm` : compression > 0.9 ? "0.005 nm" : `${(500 * (1 - compression * 0.99)).toFixed(1)} nm`;
    ctx.fillText(`λ = ${nmVal}`, width * 0.5, height * 0.14);
    // Status text below neurons
    const statusY = height * 0.72;
    if (compression < 0.6) {
      ctx.fillStyle = PALETTE.accent.red;
      ctx.font = `${10 * scale}px system-ui`;
      ctx.fillText("unresolved", width * 0.5, statusY);
    } else if (compression < 0.85) {
      ctx.fillStyle = PALETTE.accent.gold;
      ctx.font = `${10 * scale}px system-ui`;
      ctx.fillText("resolving...", width * 0.5, statusY);
    }
    // Green checkmark when fully resolved
    const checkAlpha = interpolate(frame, [82, 95], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (checkAlpha > 0) {
      ctx.globalAlpha = fadeAlpha * checkAlpha;
      drawCheck(ctx, width * 0.5, statusY - 5 * scale, 25 * scale, PALETTE.accent.green);
      ctx.fillStyle = PALETTE.accent.green;
      ctx.font = `bold ${11 * scale}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText("resolved!", width * 0.5, statusY + 18 * scale);
    }
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V6: React.FC<VariantProps> = ({ width, height }) => {
  // Checkmark Reveal: wide wave + red X, wave compresses, X morphs into green checkmark
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const particles = useMemo(() => makeParticles(18, width, height, scale, 11006), [width, height, scale]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, particles, frame, scale);
    const fadeAlpha = fadeInOut(frame, 120);
    ctx.globalAlpha = fadeAlpha;
    const waveY = height * 0.35;
    const iconY = height * 0.62;
    // Compression
    const compression = interpolate(frame, [20, 70], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const wavelength = 75 * scale * (1 - compression * 0.92);
    const amplitude = 18 * scale * (1 - compression * 0.2);
    const hue = 50 + (190 - 50) * compression;
    const phase = frame * 0.05;
    // Wave
    drawWave(ctx, width * 0.08, waveY, width * 0.84, wavelength, amplitude,
      `hsla(${hue}, 65%, 62%, 0.75)`, 2.5 * scale, phase);
    // Wavelength label
    const nmVal = (500 * (1 - compression * 0.99999)).toFixed(compression > 0.8 ? 3 : 0);
    ctx.fillStyle = `hsla(${hue}, 60%, 65%, 0.9)`;
    ctx.font = `bold ${14 * scale}px monospace`;
    ctx.textAlign = "center";
    ctx.fillText(`λ = ${nmVal} nm`, width * 0.5, height * 0.15);
    // Icon: crossfade between X (red) and checkmark (green)
    const xAlpha = interpolate(compression, [0, 0.4, 0.6, 1], [1, 1, 0, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const checkAlpha = interpolate(compression, [0, 0.5, 0.7, 1], [0, 0, 0.5, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    // X fading
    if (xAlpha > 0) {
      ctx.globalAlpha = fadeAlpha * xAlpha;
      drawX(ctx, width * 0.5, iconY, 40 * scale, PALETTE.accent.red);
      ctx.fillStyle = PALETTE.accent.red;
      ctx.font = `bold ${12 * scale}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText("can't resolve", width * 0.5, iconY + 30 * scale);
    }
    // Check appearing
    if (checkAlpha > 0) {
      ctx.globalAlpha = fadeAlpha * checkAlpha;
      const popScale = 1 + (1 - Math.min(checkAlpha * 1.5, 1)) * 0.8;
      ctx.save();
      ctx.translate(width * 0.5, iconY);
      ctx.scale(popScale, popScale);
      drawCheck(ctx, 0, 0, 40 * scale, PALETTE.accent.green);
      ctx.restore();
      ctx.fillStyle = PALETTE.accent.green;
      ctx.font = `bold ${12 * scale}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText("fully resolved", width * 0.5, iconY + 30 * scale);
    }
    // "light -> electron" label
    const transLabel = interpolate(frame, [10, 25], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (transLabel > 0) {
      ctx.globalAlpha = fadeAlpha * transLabel;
      ctx.fillStyle = PALETTE.text.dim;
      ctx.font = `${10 * scale}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText("light → electron", width * 0.5, height * 0.88);
    }
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V7: React.FC<VariantProps> = ({ width, height }) => {
  // Electron Beam Icon: stylized electron gun on left, tight cyan beam, label "λ = 0.005 nm"
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const particles = useMemo(() => makeParticles(18, width, height, scale, 11007), [width, height, scale]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, particles, frame, scale);
    const fadeAlpha = fadeInOut(frame, 120);
    ctx.globalAlpha = fadeAlpha;
    // Electron gun on left
    const gunAppear = interpolate(frame, [5, 25], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const gunX = width * 0.12;
    const gunY = height * 0.42;
    if (gunAppear > 0) {
      ctx.globalAlpha = fadeAlpha * gunAppear;
      // Gun body — cylindrical shape
      const gunW = 28 * scale;
      const gunH = 50 * scale;
      ctx.fillStyle = `hsla(220, 30%, 35%, 0.6)`;
      ctx.fillRect(gunX - gunW / 2, gunY - gunH / 2, gunW, gunH);
      ctx.strokeStyle = `hsla(190, 40%, 50%, 0.7)`;
      ctx.lineWidth = 2 * scale;
      ctx.strokeRect(gunX - gunW / 2, gunY - gunH / 2, gunW, gunH);
      // Nozzle
      ctx.fillStyle = `hsla(190, 45%, 45%, 0.7)`;
      ctx.fillRect(gunX + gunW / 2, gunY - 5 * scale, 12 * scale, 10 * scale);
      // Cathode glow
      const cathGlow = ctx.createRadialGradient(gunX, gunY, 0, gunX, gunY, gunW);
      cathGlow.addColorStop(0, `hsla(190, 60%, 65%, 0.3)`);
      cathGlow.addColorStop(1, `hsla(190, 50%, 50%, 0)`);
      ctx.fillStyle = cathGlow;
      ctx.beginPath();
      ctx.arc(gunX, gunY, gunW, 0, Math.PI * 2);
      ctx.fill();
      // "e⁻" label inside
      ctx.fillStyle = `hsla(190, 60%, 70%, 0.9)`;
      ctx.font = `bold ${12 * scale}px serif`;
      ctx.textAlign = "center";
      ctx.fillText("e\u207B", gunX, gunY + 4 * scale);
    }
    // Electron beam emanating
    const beamAppear = interpolate(frame, [20, 50], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (beamAppear > 0) {
      ctx.globalAlpha = fadeAlpha * beamAppear;
      const beamStartX = gunX + 28 * scale;
      const beamEndX = width * 0.88;
      const beamLen = (beamEndX - beamStartX) * beamAppear;
      // Tight cyan beam — very fine wavelength
      const beamY = gunY;
      const wavelength = 5 * scale;
      const beamAmp = 4 * scale;
      // Glow
      const beamGlow = ctx.createLinearGradient(beamStartX, beamY - 12 * scale, beamStartX, beamY + 12 * scale);
      beamGlow.addColorStop(0, `hsla(190, 50%, 55%, 0)`);
      beamGlow.addColorStop(0.5, `hsla(190, 50%, 55%, 0.12)`);
      beamGlow.addColorStop(1, `hsla(190, 50%, 55%, 0)`);
      ctx.fillStyle = beamGlow;
      ctx.fillRect(beamStartX, beamY - 12 * scale, beamLen, 24 * scale);
      // 3 fine wave lines
      for (let line = -1; line <= 1; line++) {
        const lineAlpha = 0.6 - Math.abs(line) * 0.2;
        ctx.strokeStyle = `hsla(190, 60%, 65%, ${lineAlpha})`;
        ctx.lineWidth = (1.5 - Math.abs(line) * 0.3) * scale;
        ctx.beginPath();
        for (let px = 0; px <= beamLen; px += 1) {
          const yy = beamY + line * 3 * scale + Math.sin((px / wavelength) * Math.PI * 2 + frame * 0.1) * beamAmp * 0.3;
          px === 0 ? ctx.moveTo(beamStartX + px, yy) : ctx.lineTo(beamStartX + px, yy);
        }
        ctx.stroke();
      }
      // Particles along beam (electron dots)
      const rand = seeded(11072 + Math.floor(frame / 2));
      for (let i = 0; i < 8; i++) {
        const px = beamStartX + rand() * beamLen;
        const py = beamY + (rand() - 0.5) * 6 * scale;
        ctx.fillStyle = `hsla(190, 60%, 75%, ${rand() * 0.6})`;
        ctx.beginPath();
        ctx.arc(px, py, 1.5 * scale, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    // Label
    const labelAppear = interpolate(frame, [40, 55], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (labelAppear > 0) {
      ctx.globalAlpha = fadeAlpha * labelAppear;
      ctx.fillStyle = `hsla(190, 60%, 65%, 1)`;
      ctx.font = `bold ${14 * scale}px monospace`;
      ctx.textAlign = "center";
      ctx.fillText("λ = 0.005 nm", width * 0.55, height * 0.18);
    }
    // "100,000x shorter" comparison
    const compAlpha = interpolate(frame, [60, 78], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (compAlpha > 0) {
      ctx.globalAlpha = fadeAlpha * compAlpha;
      ctx.fillStyle = PALETTE.accent.green;
      ctx.font = `bold ${12 * scale}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText("100,000x shorter than light", width * 0.55, height * 0.72);
      // Small comparison bars
      const barLeft = width * 0.3;
      // Gold bar (light scale)
      ctx.fillStyle = `hsla(50, 55%, 50%, 0.35)`;
      ctx.fillRect(barLeft, height * 0.78, width * 0.4, 8 * scale);
      ctx.strokeStyle = PALETTE.accent.gold;
      ctx.lineWidth = 1 * scale;
      ctx.strokeRect(barLeft, height * 0.78, width * 0.4, 8 * scale);
      // Cyan bar (electron scale — just a tiny sliver)
      ctx.fillStyle = `hsla(190, 55%, 55%, 0.6)`;
      ctx.fillRect(barLeft, height * 0.82, width * 0.4 * 0.00001, 8 * scale);
      // Just draw a dot since it's so small
      ctx.fillStyle = `hsla(190, 60%, 65%, 0.9)`;
      ctx.beginPath();
      ctx.arc(barLeft + 1.5 * scale, height * 0.82 + 4 * scale, 2 * scale, 0, Math.PI * 2);
      ctx.fill();
      // Labels
      ctx.fillStyle = PALETTE.accent.gold;
      ctx.font = `${8 * scale}px monospace`;
      ctx.textAlign = "right";
      ctx.fillText("light", barLeft - 5 * scale, height * 0.78 + 7 * scale);
      ctx.fillStyle = `hsla(190, 60%, 65%, 1)`;
      ctx.fillText("electron", barLeft - 5 * scale, height * 0.82 + 7 * scale);
    }
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V8: React.FC<VariantProps> = ({ width, height }) => {
  // Formula Transition: "λ_light = 500 nm" fades, "λ_electron = 0.005 nm" appears, ratio highlights
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const particles = useMemo(() => makeParticles(18, width, height, scale, 11008), [width, height, scale]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, particles, frame, scale);
    const fadeAlpha = fadeInOut(frame, 120);
    ctx.globalAlpha = fadeAlpha;
    ctx.textAlign = "center";
    // First formula: λ_light = 500 nm
    const formula1In = interpolate(frame, [5, 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const formula1Out = interpolate(frame, [40, 55], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const formula1Alpha = Math.min(formula1In, formula1Out);
    if (formula1Alpha > 0) {
      ctx.globalAlpha = fadeAlpha * formula1Alpha;
      // Wave icon small
      drawWave(ctx, width * 0.25, height * 0.25, width * 0.5, 40 * scale, 10 * scale,
        `hsla(50, 55%, 55%, 0.3)`, 1.5 * scale, frame * 0.03);
      ctx.fillStyle = PALETTE.accent.gold;
      ctx.font = `${20 * scale}px serif`;
      ctx.fillText("λ", width * 0.38, height * 0.4);
      ctx.font = `${11 * scale}px serif`;
      ctx.fillText("light", width * 0.38 + 15 * scale, height * 0.43);
      ctx.fillStyle = PALETTE.text.primary;
      ctx.font = `${18 * scale}px serif`;
      ctx.fillText("= 500 nm", width * 0.58, height * 0.4);
    }
    // Strikethrough on first formula
    const strikeAlpha = interpolate(frame, [35, 42], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (strikeAlpha > 0 && formula1Out > 0) {
      ctx.globalAlpha = fadeAlpha * strikeAlpha * formula1Out;
      ctx.strokeStyle = PALETTE.accent.red;
      ctx.lineWidth = 2 * scale;
      ctx.beginPath();
      ctx.moveTo(width * 0.3, height * 0.4);
      ctx.lineTo(width * 0.3 + width * 0.4 * strikeAlpha, height * 0.4);
      ctx.stroke();
    }
    // Second formula: λ_electron = 0.005 nm
    const formula2Alpha = interpolate(frame, [48, 65], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (formula2Alpha > 0) {
      ctx.globalAlpha = fadeAlpha * formula2Alpha;
      // Tight wave icon
      drawWave(ctx, width * 0.25, height * 0.25, width * 0.5, 5 * scale, 8 * scale,
        `hsla(190, 55%, 60%, 0.3)`, 1.5 * scale, frame * 0.06);
      ctx.fillStyle = `hsla(190, 60%, 65%, 1)`;
      ctx.font = `${20 * scale}px serif`;
      ctx.fillText("λ", width * 0.35, height * 0.48);
      ctx.font = `${11 * scale}px serif`;
      ctx.fillText("electron", width * 0.35 + 22 * scale, height * 0.51);
      ctx.fillStyle = PALETTE.text.primary;
      ctx.font = `${18 * scale}px serif`;
      ctx.fillText("= 0.005 nm", width * 0.6, height * 0.48);
    }
    // Ratio highlight
    const ratioAlpha = interpolate(frame, [68, 85], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (ratioAlpha > 0) {
      ctx.globalAlpha = fadeAlpha * ratioAlpha;
      // Highlight box
      const boxW = 180 * scale;
      const boxH = 35 * scale;
      const boxX = width * 0.5 - boxW / 2;
      const boxY = height * 0.62;
      ctx.fillStyle = `hsla(140, 40%, 25%, ${ratioAlpha * 0.4})`;
      ctx.fillRect(boxX, boxY, boxW, boxH);
      ctx.strokeStyle = PALETTE.accent.green;
      ctx.lineWidth = 1.5 * scale;
      ctx.strokeRect(boxX, boxY, boxW, boxH);
      ctx.fillStyle = PALETTE.accent.green;
      ctx.font = `bold ${16 * scale}px monospace`;
      ctx.fillText("100,000x finer", width * 0.5, boxY + boxH * 0.65);
    }
    // Bottom insight
    const insightAlpha = interpolate(frame, [88, 102], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (insightAlpha > 0) {
      ctx.globalAlpha = fadeAlpha * insightAlpha;
      ctx.fillStyle = PALETTE.text.dim;
      ctx.font = `${11 * scale}px system-ui`;
      ctx.fillText("short enough to see individual neurons", width * 0.5, height * 0.85);
    }
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V9: React.FC<VariantProps> = ({ width, height }) => {
  // Zoom Into Tighter Wave: camera zooms in, wide wave visible, then tighter electron wave emerges within
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const particles = useMemo(() => makeParticles(18, width, height, scale, 11009), [width, height, scale]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, particles, frame, scale);
    const fadeAlpha = fadeInOut(frame, 120);
    ctx.globalAlpha = fadeAlpha;
    const waveY = height * 0.4;
    // Zoom level
    const zoomLevel = interpolate(frame, [5, 50], [1, 4], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    // Light wave — gets visually wider as we zoom in
    const lightPhase = frame * 0.04;
    const lightWavelength = 60 * scale * zoomLevel;
    const lightAmplitude = 16 * scale * zoomLevel;
    const waveLeft = width * 0.06;
    const waveWidth = width * 0.88;
    // Light wave (golden, increasingly diffuse as zoom increases)
    const lightAlpha = interpolate(zoomLevel, [1, 4], [0.7, 0.25], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = fadeAlpha * lightAlpha;
    drawWave(ctx, waveLeft, waveY, waveWidth, lightWavelength, lightAmplitude,
      `hsla(50, 60%, 58%, ${lightAlpha})`, 3 * scale, lightPhase);
    // Glow on light wave
    ctx.strokeStyle = `hsla(50, 50%, 55%, ${lightAlpha * 0.15})`;
    ctx.lineWidth = 16 * scale;
    ctx.beginPath();
    for (let px = 0; px <= waveWidth; px += 3) {
      const yy = waveY + Math.sin((px / lightWavelength) * Math.PI * 2 + lightPhase) * lightAmplitude;
      px === 0 ? ctx.moveTo(waveLeft + px, yy) : ctx.lineTo(waveLeft + px, yy);
    }
    ctx.stroke();
    // Electron wave appears after zoom
    const electronAppear = interpolate(frame, [50, 75], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (electronAppear > 0) {
      ctx.globalAlpha = fadeAlpha * electronAppear;
      const electronWavelength = 5 * scale;
      const electronAmplitude = 8 * scale;
      const electronPhase = frame * 0.08;
      // Tight cyan wave
      drawWave(ctx, waveLeft, waveY + 35 * scale, waveWidth, electronWavelength, electronAmplitude,
        `hsla(190, 60%, 65%, ${electronAppear * 0.8})`, 2 * scale, electronPhase);
      // Label for electron
      ctx.fillStyle = `hsla(190, 60%, 65%, ${electronAppear})`;
      ctx.font = `bold ${11 * scale}px system-ui`;
      ctx.textAlign = "left";
      ctx.fillText("electron wave", waveLeft, waveY + 35 * scale - 15 * scale);
    }
    // Labels
    ctx.globalAlpha = fadeAlpha;
    // "Light wave" label
    ctx.fillStyle = PALETTE.accent.gold;
    ctx.font = `bold ${11 * scale}px system-ui`;
    ctx.textAlign = "left";
    ctx.fillText("light wave", waveLeft, waveY - lightAmplitude - 12 * scale);
    // Zoom indicator
    ctx.fillStyle = PALETTE.text.dim;
    ctx.font = `${10 * scale}px monospace`;
    ctx.textAlign = "right";
    ctx.fillText(`zoom: ${zoomLevel.toFixed(1)}x`, width * 0.94, height * 0.12);
    // "Completely different scale" text
    const scaleText = interpolate(frame, [75, 90], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (scaleText > 0) {
      ctx.globalAlpha = fadeAlpha * scaleText;
      ctx.fillStyle = PALETTE.text.dim;
      ctx.font = `${11 * scale}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText("the electron wave lives at a completely different scale", width * 0.5, height * 0.82);
    }
    // Arrow connecting the two waves
    if (electronAppear > 0.5) {
      ctx.globalAlpha = fadeAlpha * (electronAppear - 0.5) * 2;
      ctx.strokeStyle = PALETTE.text.dim;
      ctx.lineWidth = 1 * scale;
      ctx.setLineDash([4 * scale, 3 * scale]);
      const arrowX = width * 0.5;
      ctx.beginPath();
      ctx.moveTo(arrowX, waveY + lightAmplitude + 5 * scale);
      ctx.lineTo(arrowX, waveY + 35 * scale - 12 * scale);
      ctx.stroke();
      ctx.setLineDash([]);
      // Arrowhead
      ctx.fillStyle = PALETTE.text.dim;
      ctx.beginPath();
      ctx.moveTo(arrowX, waveY + 35 * scale - 12 * scale);
      ctx.lineTo(arrowX - 3 * scale, waveY + 35 * scale - 18 * scale);
      ctx.lineTo(arrowX + 3 * scale, waveY + 35 * scale - 18 * scale);
      ctx.closePath();
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

export const VARIANTS_SHOT_011: VariantDef[] = [
  { id: "wave-morph", label: "Wave Morph", component: V1 },
  { id: "side-by-side", label: "Side-by-Side", component: V2 },
  { id: "wavelength-slider", label: "Wavelength Slider", component: V3 },
  { id: "light-to-electron", label: "Light to Electron", component: V4 },
  { id: "resolution-improve", label: "Resolution Improvement", component: V5 },
  { id: "checkmark-reveal", label: "Checkmark Reveal", component: V6 },
  { id: "electron-beam", label: "Electron Beam", component: V7 },
  { id: "formula-transition", label: "Formula Transition", component: V8 },
  { id: "zoom-tighter", label: "Zoom Into Tighter", component: V9 },
];
