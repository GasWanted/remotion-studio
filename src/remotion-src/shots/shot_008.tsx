import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantDef, VariantProps } from "../types";
import { seeded, drawBg, makeParticles, drawParticles, PALETTE, fadeInOut } from "../scenes/theme";

// Shot 08 — "Here's how you do that."
// 90 frames (3s). Text card — "HERE'S HOW" appears dramatically.

const TEXT = "HERE'S HOW";

/* ── V1: Typewriter ── */
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
    const fadeAlpha = fadeInOut(frame, 90);
    ctx.globalAlpha = fadeAlpha;
    const cx = width / 2, cy = height / 2;
    const fontSize = 24 * scale;
    ctx.font = `bold ${fontSize}px monospace`;
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    // Calculate total text width for centering
    const fullWidth = ctx.measureText(TEXT).width;
    const startX = cx - fullWidth / 2;
    // Characters appear one by one (each ~4 frames)
    const charsVisible = Math.floor(interpolate(frame, [8, 8 + TEXT.length * 4], [0, TEXT.length], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
    let cursorX = startX;
    for (let i = 0; i < charsVisible; i++) {
      const charFrame = 8 + i * 4;
      const charAge = frame - charFrame;
      // Brief flash when character stamps
      if (charAge >= 0 && charAge < 3) {
        const flashAlpha = 1 - charAge / 3;
        ctx.fillStyle = `hsla(50, 60%, 80%, ${flashAlpha * 0.5})`;
        const charW = ctx.measureText(TEXT[i]).width;
        ctx.fillRect(cursorX - 2 * scale, cy - fontSize * 0.55, charW + 4 * scale, fontSize * 1.1);
      }
      ctx.fillStyle = PALETTE.text.primary;
      ctx.fillText(TEXT[i], cursorX, cy);
      cursorX += ctx.measureText(TEXT[i]).width;
    }
    // Blinking cursor after the last character
    const cursorBlink = Math.sin(frame * 0.15) > 0;
    if (cursorBlink || charsVisible < TEXT.length) {
      ctx.fillStyle = PALETTE.text.accent;
      ctx.fillRect(cursorX + 2 * scale, cy - fontSize * 0.4, 2.5 * scale, fontSize * 0.8);
    }
    ctx.textBaseline = "alphabetic";
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

/* ── V2: Bold Fade ── */
const V2: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const particles = useMemo(() => makeParticles(20, width, height, scale), [width, height, scale]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, particles, frame, scale);
    const fadeAlpha = fadeInOut(frame, 90);
    const cx = width / 2, cy = height / 2;
    // Fade in with scale overshoot (1.15 -> 1.0)
    const textAlpha = interpolate(frame, [5, 25], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const textScale = interpolate(frame, [5, 25], [1.15, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = fadeAlpha * textAlpha;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(textScale, textScale);
    ctx.fillStyle = PALETTE.text.accent;
    ctx.font = `bold ${28 * scale}px system-ui`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(TEXT, 0, 0);
    // Subtle glow behind text
    ctx.shadowColor = PALETTE.text.accent;
    ctx.shadowBlur = 20 * scale * textAlpha;
    ctx.fillText(TEXT, 0, 0);
    ctx.shadowBlur = 0;
    ctx.restore();
    // Subtitle
    const subAlpha = interpolate(frame, [30, 45], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = fadeAlpha * subAlpha;
    ctx.fillStyle = PALETTE.text.dim;
    ctx.font = `${10 * scale}px system-ui`;
    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";
    ctx.fillText("you do that.", cx, cy + 24 * scale);
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

/* ── V3: Terminal Prompt ── */
const V3: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const particles = useMemo(() => makeParticles(12, width, height, scale), [width, height, scale]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, particles, frame, scale);
    const fadeAlpha = fadeInOut(frame, 90);
    ctx.globalAlpha = fadeAlpha;
    const termW = width * 0.7, termH = height * 0.45;
    const termX = (width - termW) / 2, termY = (height - termH) / 2;
    // Terminal border
    const borderAlpha = interpolate(frame, [3, 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = fadeAlpha * borderAlpha;
    ctx.strokeStyle = `hsla(120, 40%, 40%, 0.4)`;
    ctx.lineWidth = 1.5 * scale;
    ctx.strokeRect(termX, termY, termW, termH);
    // Title bar
    ctx.fillStyle = `hsla(120, 30%, 20%, 0.3)`;
    ctx.fillRect(termX, termY, termW, 14 * scale);
    // Title bar dots
    const dotColors = [`hsla(0, 60%, 55%, 0.6)`, `hsla(45, 60%, 55%, 0.6)`, `hsla(120, 60%, 55%, 0.6)`];
    for (let i = 0; i < 3; i++) {
      ctx.fillStyle = dotColors[i];
      ctx.beginPath();
      ctx.arc(termX + 10 * scale + i * 10 * scale, termY + 7 * scale, 2.5 * scale, 0, Math.PI * 2);
      ctx.fill();
    }
    // Terminal content
    const textStartY = termY + 32 * scale;
    const textX = termX + 12 * scale;
    const fontSize = 13 * scale;
    const promptStr = "> ";
    const fullText = promptStr + TEXT;
    // Type characters
    const charsVisible = Math.floor(interpolate(frame, [15, 15 + fullText.length * 2.5], [0, fullText.length], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
    const visibleText = fullText.substring(0, charsVisible);
    ctx.fillStyle = `hsla(120, 70%, 60%, 0.9)`;
    ctx.font = `bold ${fontSize}px monospace`;
    ctx.textAlign = "left";
    ctx.fillText(visibleText, textX, textStartY);
    // Blinking cursor
    const cursorX = textX + ctx.measureText(visibleText).width + 2 * scale;
    const cursorBlink = Math.sin(frame * 0.15) > 0;
    if (cursorBlink || charsVisible < fullText.length) {
      ctx.fillStyle = `hsla(120, 70%, 60%, 0.8)`;
      ctx.fillRect(cursorX, textStartY - fontSize * 0.8, 2 * scale, fontSize);
    }
    // Scanline effect
    for (let y = termY; y < termY + termH; y += 3 * scale) {
      ctx.fillStyle = `rgba(0,0,0,0.04)`;
      ctx.fillRect(termX, y, termW, 1);
    }
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

/* ── V4: Blueprint Stamp ── */
const V4: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const particles = useMemo(() => makeParticles(15, width, height, scale), [width, height, scale]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, particles, frame, scale);
    const fadeAlpha = fadeInOut(frame, 90);
    ctx.globalAlpha = fadeAlpha;
    const cx = width / 2, cy = height / 2;
    // Blueprint grid lines
    const gridAlpha = interpolate(frame, [2, 12], [0, 0.08], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.strokeStyle = `hsla(210, 50%, 50%, ${gridAlpha})`;
    ctx.lineWidth = 0.5 * scale;
    const gridSize = 20 * scale;
    for (let x = 0; x < width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    // Text stamps in from above
    const dropProgress = interpolate(frame, [10, 22], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const eased = dropProgress < 1 ? dropProgress * dropProgress * (3 - 2 * dropProgress) : 1;
    const textY = interpolate(eased, [0, 1], [cy - 40 * scale, cy], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const textAlpha = interpolate(dropProgress, [0, 0.3], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = fadeAlpha * textAlpha;
    ctx.fillStyle = PALETTE.text.primary;
    ctx.font = `bold ${26 * scale}px system-ui`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(TEXT, cx, textY);
    // Impact ring radiates on landing
    if (dropProgress >= 0.95) {
      const ringAge = frame - 22;
      if (ringAge > 0 && ringAge < 20) {
        const ringProgress = ringAge / 20;
        const ringRadius = 30 * scale + ringProgress * 80 * scale;
        const ringAlpha = (1 - ringProgress) * 0.3;
        ctx.strokeStyle = `hsla(210, 50%, 60%, ${ringAlpha})`;
        ctx.lineWidth = 2 * scale * (1 - ringProgress);
        ctx.beginPath();
        ctx.arc(cx, cy, ringRadius, 0, Math.PI * 2);
        ctx.stroke();
      }
      // Second ring (delayed)
      const ring2Age = frame - 26;
      if (ring2Age > 0 && ring2Age < 18) {
        const ringProgress = ring2Age / 18;
        const ringRadius = 20 * scale + ringProgress * 60 * scale;
        const ringAlpha = (1 - ringProgress) * 0.2;
        ctx.strokeStyle = `hsla(210, 45%, 55%, ${ringAlpha})`;
        ctx.lineWidth = 1.5 * scale * (1 - ringProgress);
        ctx.beginPath();
        ctx.arc(cx, cy, ringRadius, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
    ctx.textBaseline = "alphabetic";
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

/* ── V5: Neon Sign ── */
const V5: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const particles = useMemo(() => makeParticles(15, width, height, scale), [width, height, scale]);
  const flickerData = useMemo(() => {
    const rand = seeded(8005);
    return TEXT.split("").map(() => ({
      flickerDuration: 3 + Math.floor(rand() * 5),
      flickerCount: 2 + Math.floor(rand() * 3),
    }));
  }, []);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, particles, frame, scale);
    const fadeAlpha = fadeInOut(frame, 90);
    const cx = width / 2, cy = height / 2;
    const fontSize = 26 * scale;
    ctx.font = `bold ${fontSize}px system-ui`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    // Measure total width for letter-by-letter positioning
    const charWidths = TEXT.split("").map(c => ctx.measureText(c).width);
    const totalW = charWidths.reduce((a, b) => a + b, 0);
    let xPos = cx - totalW / 2;
    for (let i = 0; i < TEXT.length; i++) {
      const lightUpFrame = 8 + i * 5;
      const charW = charWidths[i];
      const letterCenterX = xPos + charW / 2;
      if (frame < lightUpFrame) {
        xPos += charW;
        continue;
      }
      const age = frame - lightUpFrame;
      const flickInfo = flickerData[i];
      // Flicker phase, then hold steady
      let brightness = 1;
      if (age < flickInfo.flickerDuration * flickInfo.flickerCount) {
        const flickPhase = age % flickInfo.flickerDuration;
        brightness = flickPhase < flickInfo.flickerDuration / 2 ? 0.3 : 1;
      }
      ctx.globalAlpha = fadeAlpha * brightness;
      // Glow
      ctx.save();
      ctx.shadowColor = PALETTE.text.accent;
      ctx.shadowBlur = 15 * scale * brightness;
      ctx.fillStyle = PALETTE.text.accent;
      ctx.fillText(TEXT[i], letterCenterX, cy);
      ctx.restore();
      // Halo
      if (brightness > 0.5) {
        const haloGrad = ctx.createRadialGradient(letterCenterX, cy, 0, letterCenterX, cy, fontSize * 0.8);
        haloGrad.addColorStop(0, `hsla(45, 70%, 60%, ${brightness * 0.12})`);
        haloGrad.addColorStop(1, `hsla(45, 60%, 50%, 0)`);
        ctx.fillStyle = haloGrad;
        ctx.beginPath();
        ctx.arc(letterCenterX, cy, fontSize * 0.8, 0, Math.PI * 2);
        ctx.fill();
      }
      xPos += charW;
    }
    ctx.textBaseline = "alphabetic";
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

/* ── V6: Chalk on Board ── */
const V6: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const dustParticles = useMemo(() => {
    const rand = seeded(8006);
    return Array.from({ length: 20 }, () => ({
      x: rand() * width * 0.3 + width * 0.55,
      y: height * 0.5 + (rand() - 0.5) * 20 * scale,
      vx: (rand() - 0.5) * 0.8,
      vy: rand() * 1.2 + 0.3,
      size: (0.5 + rand() * 1) * scale,
      delay: rand() * 15,
    }));
  }, [width, height, scale]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    // Chalkboard green background
    const boardGrad = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, Math.max(width, height) * 0.6);
    boardGrad.addColorStop(0, `hsl(165, 25%, 20%)`);
    boardGrad.addColorStop(0.6, `hsl(165, 22%, 16%)`);
    boardGrad.addColorStop(1, `hsl(165, 20%, 12%)`);
    ctx.fillStyle = boardGrad;
    ctx.fillRect(0, 0, width, height);
    // Board edge
    ctx.strokeStyle = `hsla(30, 25%, 35%, 0.4)`;
    ctx.lineWidth = 3 * scale;
    ctx.strokeRect(8 * scale, 8 * scale, width - 16 * scale, height - 16 * scale);
    const fadeAlpha = fadeInOut(frame, 90);
    ctx.globalAlpha = fadeAlpha;
    const cx = width / 2, cy = height / 2;
    // Chalk text drawing — characters appear with slight roughness
    const fontSize = 24 * scale;
    ctx.font = `bold ${fontSize}px system-ui`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const totalChars = TEXT.length;
    const charsDrawn = interpolate(frame, [8, 8 + totalChars * 3], [0, totalChars], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const charWidths = TEXT.split("").map(c => ctx.measureText(c).width);
    const totalW = charWidths.reduce((a, b) => a + b, 0);
    let xPos = cx - totalW / 2;
    for (let i = 0; i < Math.floor(charsDrawn); i++) {
      const charCenterX = xPos + charWidths[i] / 2;
      // Chalk color with slight variation per character
      const rand = seeded(8006 + i);
      const variation = rand() * 10 - 5;
      ctx.fillStyle = `hsla(0, 0%, ${88 + variation}%, 0.85)`;
      ctx.fillText(TEXT[i], charCenterX, cy);
      // Chalk texture — tiny dots around each letter
      for (let d = 0; d < 3; d++) {
        const dx = (rand() - 0.5) * charWidths[i];
        const dy = (rand() - 0.5) * fontSize * 0.6;
        ctx.fillStyle = `hsla(0, 0%, 85%, 0.2)`;
        ctx.fillRect(charCenterX + dx, cy + dy, 1, 1);
      }
      xPos += charWidths[i];
    }
    // Chalk dust falls from the last drawn letter
    if (charsDrawn > totalChars - 2) {
      const dustStart = 8 + totalChars * 3;
      for (const particle of dustParticles) {
        const particleAge = frame - dustStart - particle.delay;
        if (particleAge < 0 || particleAge > 30) continue;
        const px = particle.x + particle.vx * particleAge;
        const py = particle.y + particle.vy * particleAge;
        const dustAlpha = Math.max(0, 1 - particleAge / 30) * 0.6;
        ctx.fillStyle = `hsla(0, 0%, 85%, ${dustAlpha})`;
        ctx.beginPath();
        ctx.arc(px, py, particle.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.textBaseline = "alphabetic";
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

/* ── V7: Slide In ── */
const V7: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const particles = useMemo(() => makeParticles(18, width, height, scale), [width, height, scale]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, particles, frame, scale);
    const fadeAlpha = fadeInOut(frame, 90);
    ctx.globalAlpha = fadeAlpha;
    const cx = width / 2, cy = height / 2;
    // Text slides in from left with overshoot
    const slideRaw = interpolate(frame, [8, 28], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    // Overshoot easing: goes past 1 then settles
    const overshoot = slideRaw < 1
      ? slideRaw * slideRaw * ((1.5 + 1) * slideRaw - 1.5) // custom back easing
      : 1;
    const textX = interpolate(Math.min(1, Math.max(0, overshoot)), [0, 1], [-width * 0.3, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const textAlpha = interpolate(slideRaw, [0, 0.2], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = fadeAlpha * textAlpha;
    ctx.fillStyle = PALETTE.text.primary;
    ctx.font = `bold ${26 * scale}px system-ui`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(TEXT, cx + textX, cy);
    // Underline draws after text lands
    const underlineProgress = interpolate(frame, [30, 48], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (underlineProgress > 0) {
      const textWidth = ctx.measureText(TEXT).width;
      const lineY = cy + 16 * scale;
      const lineStartX = cx - textWidth / 2;
      const lineEndX = lineStartX + textWidth * underlineProgress;
      ctx.strokeStyle = PALETTE.text.accent;
      ctx.lineWidth = 2.5 * scale;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(lineStartX, lineY);
      ctx.lineTo(lineEndX, lineY);
      ctx.stroke();
    }
    ctx.textBaseline = "alphabetic";
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

/* ── V8: Letter by Letter Drop ── */
const V8: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const particles = useMemo(() => makeParticles(18, width, height, scale), [width, height, scale]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, particles, frame, scale);
    const fadeAlpha = fadeInOut(frame, 90);
    const cx = width / 2, cy = height / 2;
    const fontSize = 26 * scale;
    ctx.font = `bold ${fontSize}px system-ui`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const charWidths = TEXT.split("").map(c => ctx.measureText(c).width);
    const totalW = charWidths.reduce((a, b) => a + b, 0);
    let xPos = cx - totalW / 2;
    for (let i = 0; i < TEXT.length; i++) {
      const dropStart = 6 + i * 4;
      const dropEnd = dropStart + 10;
      const dropProgress = interpolate(frame, [dropStart, dropEnd], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      if (dropProgress <= 0) {
        xPos += charWidths[i];
        continue;
      }
      // Drop from above with bounce
      const bounceEase = dropProgress < 0.6
        ? interpolate(dropProgress, [0, 0.6], [0, 1.12], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
        : dropProgress < 0.8
          ? interpolate(dropProgress, [0.6, 0.8], [1.12, 0.95], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
          : interpolate(dropProgress, [0.8, 1], [0.95, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const yOffset = interpolate(bounceEase, [0, 1], [-35 * scale, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const charCenterX = xPos + charWidths[i] / 2;
      const charAlpha = interpolate(dropProgress, [0, 0.3], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      ctx.globalAlpha = fadeAlpha * charAlpha;
      // Subtle color per letter from PALETTE
      const colorIdx = i % PALETTE.cellColors.length;
      const [hue, sat, lit] = PALETTE.cellColors[colorIdx];
      ctx.fillStyle = `hsla(${hue}, ${sat}%, ${lit}%, 0.85)`;
      ctx.fillText(TEXT[i], charCenterX, cy + yOffset);
      xPos += charWidths[i];
    }
    ctx.textBaseline = "alphabetic";
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

/* ── V9: Underline Wipe ── */
const V9: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const particles = useMemo(() => makeParticles(18, width, height, scale), [width, height, scale]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, particles, frame, scale);
    const fadeAlpha = fadeInOut(frame, 90);
    const cx = width / 2, cy = height / 2;
    // Text appears subtly (low alpha initially)
    const textInitAlpha = interpolate(frame, [5, 15], [0, 0.35], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    // Then pops to full when underline starts
    const textFullAlpha = interpolate(frame, [25, 35], [0.35, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const textAlpha = frame < 25 ? textInitAlpha : textFullAlpha;
    const fontSize = 26 * scale;
    ctx.font = `bold ${fontSize}px system-ui`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const textWidth = ctx.measureText(TEXT).width;
    ctx.globalAlpha = fadeAlpha * textAlpha;
    ctx.fillStyle = PALETTE.text.primary;
    ctx.fillText(TEXT, cx, cy);
    // Bold underline wipes from left to right
    const underlineProgress = interpolate(frame, [25, 50], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (underlineProgress > 0) {
      const lineY = cy + fontSize * 0.55;
      const lineStartX = cx - textWidth / 2 - 5 * scale;
      const lineW = (textWidth + 10 * scale) * underlineProgress;
      ctx.globalAlpha = fadeAlpha;
      // Glow under the line
      const glowGrad = ctx.createLinearGradient(lineStartX, lineY, lineStartX + lineW, lineY);
      glowGrad.addColorStop(0, `hsla(45, 70%, 60%, 0.15)`);
      glowGrad.addColorStop(0.5, `hsla(45, 70%, 60%, 0.25)`);
      glowGrad.addColorStop(1, `hsla(45, 70%, 60%, 0.15)`);
      ctx.fillStyle = glowGrad;
      ctx.fillRect(lineStartX, lineY - 4 * scale, lineW, 8 * scale);
      // Solid underline
      ctx.fillStyle = PALETTE.text.accent;
      ctx.fillRect(lineStartX, lineY, lineW, 3 * scale);
      // Bright tip at the drawing edge
      if (underlineProgress < 0.98) {
        const tipX = lineStartX + lineW;
        const tipGlow = ctx.createRadialGradient(tipX, lineY + 1.5 * scale, 0, tipX, lineY + 1.5 * scale, 6 * scale);
        tipGlow.addColorStop(0, `hsla(45, 80%, 75%, 0.5)`);
        tipGlow.addColorStop(1, `hsla(45, 60%, 55%, 0)`);
        ctx.fillStyle = tipGlow;
        ctx.beginPath();
        ctx.arc(tipX, lineY + 1.5 * scale, 6 * scale, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.textBaseline = "alphabetic";
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

export const VARIANTS_SHOT_008: VariantDef[] = [
  { id: "typewriter", label: "Typewriter", component: V1 },
  { id: "bold-fade", label: "Bold Fade", component: V2 },
  { id: "terminal-prompt", label: "Terminal Prompt", component: V3 },
  { id: "blueprint-stamp", label: "Blueprint Stamp", component: V4 },
  { id: "neon-sign", label: "Neon Sign", component: V5 },
  { id: "chalk-board", label: "Chalk on Board", component: V6 },
  { id: "slide-in", label: "Slide In", component: V7 },
  { id: "letter-drop", label: "Letter by Letter", component: V8 },
  { id: "underline-wipe", label: "Underline Wipe", component: V9 },
];
