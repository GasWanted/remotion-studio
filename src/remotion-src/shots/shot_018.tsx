import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantDef, VariantProps } from "../types";
import { seeded, drawBg, makeParticles, drawParticles, PALETTE, fadeInOut } from "../scenes/theme";

// Shot 18 — "Seven thousand sections. Twenty-one million photographs."
// 90 frames (3s). Two big numbers counting up.

function formatNumber(n: number): string {
  return Math.floor(n).toLocaleString();
}

/* ── V1: Dual Counter ── */
const V1: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const particles = useMemo(() => makeParticles(25, width, height, scale), [width, height, scale]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, particles, frame, scale);
    const fadeAlpha = fadeInOut(frame, 90);
    ctx.globalAlpha = fadeAlpha;

    // Sections counter: reaches target at frame ~40
    const sectionsProgress = interpolate(frame, [5, 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const sectionsVal = Math.floor(sectionsProgress * 7050);
    // Photos counter: reaches target at frame ~75
    const photosProgress = interpolate(frame, [5, 75], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const eased = photosProgress * photosProgress * (3 - 2 * photosProgress);
    const photosVal = Math.floor(eased * 21000000);

    const cx = width / 2;

    // "SECTIONS:" label
    ctx.fillStyle = PALETTE.text.dim;
    ctx.font = `${10 * scale}px system-ui`;
    ctx.textAlign = "center";
    ctx.fillText("SECTIONS", cx, height * 0.3);

    // Sections number
    ctx.fillStyle = PALETTE.text.accent;
    ctx.font = `bold ${28 * scale}px monospace`;
    ctx.textAlign = "center";
    ctx.fillText(formatNumber(sectionsVal), cx, height * 0.3 + 30 * scale);

    // "PHOTOGRAPHS:" label
    ctx.fillStyle = PALETTE.text.dim;
    ctx.font = `${10 * scale}px system-ui`;
    ctx.fillText("PHOTOGRAPHS", cx, height * 0.58);

    // Photos number
    ctx.fillStyle = PALETTE.text.accent;
    ctx.font = `bold ${28 * scale}px monospace`;
    ctx.fillText(formatNumber(photosVal), cx, height * 0.58 + 30 * scale);

    // Subtle divider
    ctx.strokeStyle = `hsla(220, 30%, 50%, 0.2)`;
    ctx.lineWidth = 1 * scale;
    ctx.beginPath();
    ctx.moveTo(cx - 60 * scale, height * 0.465);
    ctx.lineTo(cx + 60 * scale, height * 0.465);
    ctx.stroke();

    // Finished glow on sections when done
    if (sectionsProgress >= 1) {
      const settleAlpha = interpolate(frame, [40, 50], [0.4, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      if (settleAlpha > 0) {
        ctx.fillStyle = `hsla(45, 70%, 70%, ${settleAlpha})`;
        ctx.fillRect(cx - 80 * scale, height * 0.3 + 8 * scale, 160 * scale, 28 * scale);
      }
    }

    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

/* ── V2: Stacking Blocks ── */
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
    ctx.globalAlpha = fadeAlpha;

    const sectionsStr = "7,050";
    const photosStr = "21,000,000";
    const digitW = 18 * scale;
    const digitH = 24 * scale;

    // Row 1: Sections digits
    const row1Y = height * 0.3;
    const row1X = (width - sectionsStr.length * digitW) / 2;
    for (let i = 0; i < sectionsStr.length; i++) {
      const dropDelay = 8 + i * 4;
      const dropProgress = interpolate(frame, [dropDelay, dropDelay + 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      if (dropProgress <= 0) continue;
      // Bounce easing
      const bounce = dropProgress < 0.7
        ? interpolate(dropProgress, [0, 0.7], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
        : 1 + Math.sin((dropProgress - 0.7) / 0.3 * Math.PI) * 0.08;
      const yOffset = (1 - bounce) * -30 * scale;
      const dx = row1X + i * digitW;
      ctx.fillStyle = `hsla(45, 55%, 55%, ${dropProgress * 0.3})`;
      ctx.fillRect(dx, row1Y + yOffset, digitW - 2 * scale, digitH);
      ctx.fillStyle = PALETTE.text.accent;
      ctx.font = `bold ${18 * scale}px monospace`;
      ctx.textAlign = "center";
      ctx.fillText(sectionsStr[i], dx + digitW / 2, row1Y + yOffset + digitH * 0.72);
    }

    // Row 2: Photos digits
    const row2Y = height * 0.58;
    const row2X = (width - photosStr.length * digitW) / 2;
    for (let i = 0; i < photosStr.length; i++) {
      const dropDelay = 30 + i * 2.5;
      const dropProgress = interpolate(frame, [dropDelay, dropDelay + 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      if (dropProgress <= 0) continue;
      const bounce = dropProgress < 0.7
        ? interpolate(dropProgress, [0, 0.7], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
        : 1 + Math.sin((dropProgress - 0.7) / 0.3 * Math.PI) * 0.08;
      const yOffset = (1 - bounce) * -30 * scale;
      const dx = row2X + i * digitW;
      ctx.fillStyle = `hsla(220, 45%, 50%, ${dropProgress * 0.3})`;
      ctx.fillRect(dx, row2Y + yOffset, digitW - 2 * scale, digitH);
      ctx.fillStyle = PALETTE.text.accent;
      ctx.font = `bold ${18 * scale}px monospace`;
      ctx.textAlign = "center";
      ctx.fillText(photosStr[i], dx + digitW / 2, row2Y + yOffset + digitH * 0.72);
    }

    // Labels
    ctx.fillStyle = PALETTE.text.dim;
    ctx.font = `${9 * scale}px system-ui`;
    ctx.textAlign = "center";
    ctx.fillText("sections", width / 2, row1Y - 8 * scale);
    ctx.fillText("photographs", width / 2, row2Y - 8 * scale);

    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

/* ── V3: Odometer ── */
const V3: React.FC<VariantProps> = ({ width, height }) => {
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

    const digitW = 20 * scale;
    const digitH = 28 * scale;

    function drawOdometer(ctx: CanvasRenderingContext2D, cx: number, cy: number, targetStr: string, progress: number, label: string) {
      const totalW = targetStr.length * digitW;
      const startX = cx - totalW / 2;

      // Background strip
      ctx.fillStyle = "hsla(220, 20%, 15%, 0.6)";
      ctx.fillRect(startX - 3 * scale, cy - digitH / 2 - 2 * scale, totalW + 6 * scale, digitH + 4 * scale);

      for (let i = 0; i < targetStr.length; i++) {
        const ch = targetStr[i];
        const dx = startX + i * digitW;

        if (ch === ",") {
          ctx.fillStyle = PALETTE.text.dim;
          ctx.font = `bold ${16 * scale}px monospace`;
          ctx.textAlign = "center";
          ctx.fillText(",", dx + digitW / 2, cy + 5 * scale);
          continue;
        }
        const targetDigit = parseInt(ch);

        // Digit slot border
        ctx.strokeStyle = "hsla(220, 30%, 40%, 0.4)";
        ctx.lineWidth = 1 * scale;
        ctx.strokeRect(dx + 1 * scale, cy - digitH / 2, digitW - 2 * scale, digitH);

        // Scrolling digit: the higher the place value, the later it settles
        const placeWeight = (targetStr.length - i) / targetStr.length;
        const digitProgress = interpolate(progress, [0, Math.max(0.01, 0.5 + placeWeight * 0.5)], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

        // Show scrolling effect: current digit value
        const scrollVal = digitProgress * targetDigit;
        const displayDigit = Math.floor(scrollVal) % 10;
        const scrollFrac = scrollVal - Math.floor(scrollVal);

        // Draw current and next digit with vertical offset
        ctx.save();
        ctx.beginPath();
        ctx.rect(dx, cy - digitH / 2, digitW, digitH);
        ctx.clip();

        const yOff = -scrollFrac * digitH;
        ctx.fillStyle = PALETTE.text.accent;
        ctx.font = `bold ${18 * scale}px monospace`;
        ctx.textAlign = "center";
        ctx.fillText(`${displayDigit}`, dx + digitW / 2, cy + 5 * scale + yOff);
        ctx.fillText(`${(displayDigit + 1) % 10}`, dx + digitW / 2, cy + 5 * scale + yOff + digitH);

        ctx.restore();
      }

      // Label
      ctx.fillStyle = PALETTE.text.dim;
      ctx.font = `${9 * scale}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText(label, cx, cy - digitH / 2 - 10 * scale);
    }

    const sectionsProgress = interpolate(frame, [5, 38], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const photosProgress = interpolate(frame, [10, 78], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

    drawOdometer(ctx, width / 2, height * 0.35, "7,050", sectionsProgress, "sections");
    drawOdometer(ctx, width / 2, height * 0.65, "21,000,000", photosProgress, "photographs");

    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

/* ── V4: Terminal Output ── */
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

    const termX = width * 0.1;
    const termY = height * 0.15;
    const termW = width * 0.8;
    const termH = height * 0.65;
    const lineH = 18 * scale;

    // Terminal window
    ctx.fillStyle = "hsla(220, 25%, 10%, 0.8)";
    ctx.fillRect(termX, termY, termW, termH);
    ctx.strokeStyle = "hsla(220, 30%, 35%, 0.5)";
    ctx.lineWidth = 1.5 * scale;
    ctx.strokeRect(termX, termY, termW, termH);

    // Title bar
    ctx.fillStyle = "hsla(220, 25%, 18%, 0.8)";
    ctx.fillRect(termX, termY, termW, 14 * scale);
    // Traffic lights
    for (let i = 0; i < 3; i++) {
      ctx.fillStyle = [`hsla(0, 60%, 55%, 0.7)`, `hsla(45, 60%, 55%, 0.7)`, `hsla(120, 60%, 55%, 0.7)`][i];
      ctx.beginPath();
      ctx.arc(termX + 10 * scale + i * 10 * scale, termY + 7 * scale, 3 * scale, 0, Math.PI * 2);
      ctx.fill();
    }

    const contentX = termX + 12 * scale;
    let lineIdx = 0;
    const cursorBlink = Math.sin(frame * 0.2) > 0;

    // Line 1: $ count_sections (types out 5-20)
    const cmd1Progress = interpolate(frame, [5, 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const cmd1Text = "$ count_sections";
    const cmd1Visible = cmd1Text.substring(0, Math.floor(cmd1Progress * cmd1Text.length));
    const cmd1Y = termY + 24 * scale + lineIdx * lineH;
    ctx.fillStyle = PALETTE.accent.green;
    ctx.font = `${10 * scale}px monospace`;
    ctx.textAlign = "left";
    ctx.fillText(cmd1Visible, contentX, cmd1Y);
    if (cmd1Progress < 1 && cursorBlink) {
      ctx.fillRect(contentX + ctx.measureText(cmd1Visible).width + 2, cmd1Y - 10 * scale, 6 * scale, 12 * scale);
    }
    lineIdx++;

    // Line 2: result "7,050" (appears at frame 24)
    if (frame > 22) {
      const result1Alpha = interpolate(frame, [22, 26], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      ctx.fillStyle = `hsla(45, 70%, 65%, ${result1Alpha})`;
      ctx.font = `bold ${14 * scale}px monospace`;
      ctx.fillText("7,050", contentX + 8 * scale, termY + 24 * scale + lineIdx * lineH);
    }
    lineIdx += 1.5;

    // Line 3: $ count_photos (types out 35-55)
    if (frame > 32) {
      const cmd2Progress = interpolate(frame, [35, 55], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const cmd2Text = "$ count_photos";
      const cmd2Visible = cmd2Text.substring(0, Math.floor(cmd2Progress * cmd2Text.length));
      const cmd2Y = termY + 24 * scale + lineIdx * lineH;
      ctx.fillStyle = PALETTE.accent.green;
      ctx.font = `${10 * scale}px monospace`;
      ctx.fillText(cmd2Visible, contentX, cmd2Y);
      if (cmd2Progress < 1 && frame > 35 && cursorBlink) {
        ctx.fillRect(contentX + ctx.measureText(cmd2Visible).width + 2, cmd2Y - 10 * scale, 6 * scale, 12 * scale);
      }
      lineIdx++;

      // Line 4: result "21,000,000" (appears at frame 60)
      if (frame > 58) {
        const result2Alpha = interpolate(frame, [58, 62], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        ctx.fillStyle = `hsla(45, 70%, 65%, ${result2Alpha})`;
        ctx.font = `bold ${14 * scale}px monospace`;
        ctx.fillText("21,000,000", contentX + 8 * scale, termY + 24 * scale + lineIdx * lineH);
        lineIdx += 1.5;

        // Final cursor blinks after all done
        if (frame > 65 && cursorBlink) {
          ctx.fillStyle = PALETTE.accent.green;
          ctx.fillRect(contentX, termY + 24 * scale + lineIdx * lineH - 10 * scale, 6 * scale, 12 * scale);
        }
      }
    }

    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

/* ── V5: Progress Bars ── */
const V5: React.FC<VariantProps> = ({ width, height }) => {
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

    const barX = width * 0.12;
    const barW = width * 0.76;
    const barH = 18 * scale;

    function drawProgressBar(ctx: CanvasRenderingContext2D, y: number, progress: number, value: number, target: number, label: string, hue: number) {
      // Label
      ctx.fillStyle = PALETTE.text.dim;
      ctx.font = `${9 * scale}px system-ui`;
      ctx.textAlign = "left";
      ctx.fillText(label, barX, y - 8 * scale);

      // Background track
      ctx.fillStyle = "hsla(220, 20%, 18%, 0.6)";
      ctx.fillRect(barX, y, barW, barH);

      // Fill
      const fillW = barW * progress;
      const fillGrad = ctx.createLinearGradient(barX, 0, barX + fillW, 0);
      fillGrad.addColorStop(0, `hsla(${hue}, 55%, 50%, 0.8)`);
      fillGrad.addColorStop(1, `hsla(${hue}, 65%, 60%, 0.9)`);
      ctx.fillStyle = fillGrad;
      ctx.fillRect(barX, y, fillW, barH);

      // Glow at leading edge
      if (progress < 1) {
        const glowX = barX + fillW;
        const glow = ctx.createRadialGradient(glowX, y + barH / 2, 0, glowX, y + barH / 2, 8 * scale);
        glow.addColorStop(0, `hsla(${hue}, 70%, 70%, 0.5)`);
        glow.addColorStop(1, `hsla(${hue}, 70%, 70%, 0)`);
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(glowX, y + barH / 2, 8 * scale, 0, Math.PI * 2);
        ctx.fill();
      }

      // Border
      ctx.strokeStyle = `hsla(${hue}, 40%, 45%, 0.4)`;
      ctx.lineWidth = 1 * scale;
      ctx.strokeRect(barX, y, barW, barH);

      // Percentage and value
      ctx.fillStyle = PALETTE.text.accent;
      ctx.font = `bold ${10 * scale}px monospace`;
      ctx.textAlign = "right";
      const pctText = `${Math.floor(progress * 100)}%`;
      ctx.fillText(pctText, barX + barW + 28 * scale, y + barH * 0.72);

      // Value below
      ctx.fillStyle = PALETTE.text.primary;
      ctx.font = `${9 * scale}px monospace`;
      ctx.textAlign = "left";
      ctx.fillText(formatNumber(Math.floor(value)), barX, y + barH + 14 * scale);
      ctx.fillStyle = PALETTE.text.dim;
      ctx.textAlign = "right";
      ctx.fillText(`/ ${formatNumber(target)}`, barX + barW, y + barH + 14 * scale);
    }

    const sectionsProgress = interpolate(frame, [8, 35], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const photosProgress = interpolate(frame, [12, 78], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

    drawProgressBar(ctx, height * 0.28, sectionsProgress, sectionsProgress * 7050, 7050, "Sections", 45);
    drawProgressBar(ctx, height * 0.56, photosProgress, photosProgress * 21000000, 21000000, "Photographs", 220);

    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

/* ── V6: Pie Charts ── */
const V6: React.FC<VariantProps> = ({ width, height }) => {
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

    function drawPie(ctx: CanvasRenderingContext2D, cx: number, cy: number, radius: number, progress: number, hue: number, label: string, valueStr: string) {
      // Background circle
      ctx.strokeStyle = `hsla(${hue}, 25%, 30%, 0.4)`;
      ctx.lineWidth = 3 * scale;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.stroke();

      // Fill arc
      const endAngle = -Math.PI / 2 + progress * Math.PI * 2;
      ctx.fillStyle = `hsla(${hue}, 55%, 55%, 0.6)`;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, radius, -Math.PI / 2, endAngle);
      ctx.closePath();
      ctx.fill();

      // Glowing edge
      if (progress > 0 && progress < 1) {
        const edgeX = cx + Math.cos(endAngle) * radius;
        const edgeY = cy + Math.sin(endAngle) * radius;
        const glow = ctx.createRadialGradient(edgeX, edgeY, 0, edgeX, edgeY, 8 * scale);
        glow.addColorStop(0, `hsla(${hue}, 80%, 75%, 0.7)`);
        glow.addColorStop(1, `hsla(${hue}, 70%, 65%, 0)`);
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(edgeX, edgeY, 8 * scale, 0, Math.PI * 2);
        ctx.fill();
      }

      // Percentage in center
      ctx.fillStyle = PALETTE.text.accent;
      ctx.font = `bold ${14 * scale}px monospace`;
      ctx.textAlign = "center";
      ctx.fillText(`${Math.floor(progress * 100)}%`, cx, cy + 4 * scale);

      // Label and value below
      ctx.fillStyle = PALETTE.text.dim;
      ctx.font = `${8 * scale}px system-ui`;
      ctx.fillText(label, cx, cy + radius + 16 * scale);
      ctx.fillStyle = PALETTE.text.primary;
      ctx.font = `${9 * scale}px monospace`;
      ctx.fillText(valueStr, cx, cy + radius + 30 * scale);
    }

    const sectionsProgress = interpolate(frame, [5, 35], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const photosProgress = interpolate(frame, [15, 75], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

    const pieR = 45 * scale;
    drawPie(ctx, width * 0.3, height * 0.48, pieR, sectionsProgress, 45, "sections", formatNumber(sectionsProgress * 7050));
    drawPie(ctx, width * 0.7, height * 0.48, pieR, photosProgress, 220, "photographs", formatNumber(photosProgress * 21000000));

    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

/* ── V7: Number Cascade ── */
const V7: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const particles = useMemo(() => makeParticles(15, width, height, scale), [width, height, scale]);
  const data = useMemo(() => {
    const rand = seeded(18007);
    // Falling digits for background effect
    const fallingDigits: { x: number; speed: number; char: string; hue: number; delay: number }[] = [];
    for (let i = 0; i < 50; i++) {
      fallingDigits.push({
        x: rand() * width,
        speed: 1 + rand() * 2.5,
        char: `${Math.floor(rand() * 10)}`,
        hue: [45, 180, 220][Math.floor(rand() * 3)],
        delay: rand() * 40,
      });
    }
    return { fallingDigits };
  }, [width, height]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, particles, frame, scale);
    const fadeAlpha = fadeInOut(frame, 90);
    ctx.globalAlpha = fadeAlpha;

    // Background falling digits
    ctx.globalAlpha = fadeAlpha * 0.15;
    ctx.font = `${10 * scale}px monospace`;
    for (const d of data.fallingDigits) {
      const elapsed = Math.max(0, frame - d.delay);
      const yPos = (elapsed * d.speed * 2 * scale) % (height + 20) - 10;
      ctx.fillStyle = `hsla(${d.hue}, 40%, 50%, 0.5)`;
      ctx.textAlign = "center";
      ctx.fillText(d.char, d.x, yPos);
    }
    ctx.globalAlpha = fadeAlpha;

    // "7,050" solidifies
    const solidify1 = interpolate(frame, [15, 35], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const str1 = "7,050";
    ctx.font = `bold ${30 * scale}px monospace`;
    ctx.textAlign = "center";
    const row1Y = height * 0.35;
    for (let i = 0; i < str1.length; i++) {
      const charDelay = i * 3;
      const charProgress = interpolate(frame, [15 + charDelay, 25 + charDelay], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const charX = width / 2 - ((str1.length - 1) / 2 - i) * 22 * scale;
      // Falling from above into position
      const yOff = (1 - charProgress) * -40 * scale;
      ctx.fillStyle = `hsla(45, 65%, 65%, ${charProgress})`;
      ctx.fillText(str1[i], charX, row1Y + yOff);
    }

    // "21,000,000" solidifies
    const str2 = "21,000,000";
    const row2Y = height * 0.62;
    for (let i = 0; i < str2.length; i++) {
      const charDelay = i * 2;
      const charProgress = interpolate(frame, [40 + charDelay, 50 + charDelay], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const charX = width / 2 - ((str2.length - 1) / 2 - i) * 22 * scale;
      const yOff = (1 - charProgress) * -40 * scale;
      ctx.fillStyle = `hsla(45, 65%, 65%, ${charProgress})`;
      ctx.fillText(str2[i], charX, row2Y + yOff);
    }

    // Subtitles
    if (solidify1 >= 1) {
      ctx.fillStyle = PALETTE.text.dim;
      ctx.font = `${9 * scale}px system-ui`;
      ctx.fillText("sections", width / 2, row1Y + 18 * scale);
    }
    const solidify2 = interpolate(frame, [55, 70], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (solidify2 >= 1) {
      ctx.fillStyle = PALETTE.text.dim;
      ctx.font = `${9 * scale}px system-ui`;
      ctx.fillText("photographs", width / 2, row2Y + 18 * scale);
    }

    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

/* ── V8: Proportional Squares ── */
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
    const fadeAlpha = fadeInOut(frame, 90);
    ctx.globalAlpha = fadeAlpha;

    // Proportional area: sqrt(21M/7050) ~ 54.6x side ratio
    // We'll show it as two squares where the bigger one is dramatically larger
    const smallAppear = interpolate(frame, [8, 25], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const bigAppear = interpolate(frame, [30, 60], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

    // Small square (sections)
    const smallSize = 12 * scale;
    const smallX = width * 0.15;
    const smallY = height * 0.7;
    if (smallAppear > 0) {
      const ss = smallSize * smallAppear;
      ctx.fillStyle = `hsla(45, 55%, 55%, 0.7)`;
      ctx.fillRect(smallX - ss / 2, smallY - ss / 2, ss, ss);
      ctx.strokeStyle = `hsla(45, 60%, 65%, 0.5)`;
      ctx.lineWidth = 1 * scale;
      ctx.strokeRect(smallX - ss / 2, smallY - ss / 2, ss, ss);
      ctx.fillStyle = PALETTE.text.accent;
      ctx.font = `bold ${10 * scale}px monospace`;
      ctx.textAlign = "center";
      ctx.fillText("7,050", smallX, smallY - ss / 2 - 8 * scale);
      ctx.fillStyle = PALETTE.text.dim;
      ctx.font = `${7 * scale}px system-ui`;
      ctx.fillText("sections", smallX, smallY + ss / 2 + 12 * scale);
    }

    // Big square (photographs) — fills most of the right side
    const bigMaxSize = Math.min(width * 0.6, height * 0.75);
    const bigSize = bigMaxSize * bigAppear;
    const bigX = width * 0.58;
    const bigY = height * 0.48;
    if (bigAppear > 0) {
      ctx.fillStyle = `hsla(220, 45%, 45%, 0.4)`;
      ctx.fillRect(bigX - bigSize / 2, bigY - bigSize / 2, bigSize, bigSize);
      ctx.strokeStyle = `hsla(220, 55%, 55%, 0.4)`;
      ctx.lineWidth = 1.5 * scale;
      ctx.strokeRect(bigX - bigSize / 2, bigY - bigSize / 2, bigSize, bigSize);
      if (bigAppear > 0.5) {
        ctx.fillStyle = PALETTE.text.accent;
        ctx.font = `bold ${16 * scale}px monospace`;
        ctx.textAlign = "center";
        ctx.fillText("21,000,000", bigX, bigY);
        ctx.fillStyle = PALETTE.text.dim;
        ctx.font = `${9 * scale}px system-ui`;
        ctx.fillText("photographs", bigX, bigY + 18 * scale);
      }
    }

    // Ratio annotation
    if (bigAppear > 0.8) {
      const annoAlpha = interpolate(bigAppear, [0.8, 1], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      ctx.fillStyle = `hsla(0, 0%, 100%, ${annoAlpha * 0.5})`;
      ctx.font = `${8 * scale}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText("~3,000\u00D7 more images than sections", width / 2, height * 0.92);
    }

    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

/* ── V9: Dramatic Reveal ── */
const V9: React.FC<VariantProps> = ({ width, height }) => {
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
    ctx.globalAlpha = fadeAlpha;

    const cx = width / 2;

    // First number: "7,050" slams in at frame 12
    const slam1 = interpolate(frame, [10, 14], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (slam1 > 0) {
      // Impact scale: starts big, settles to normal
      const impactScale1 = slam1 < 0.5
        ? interpolate(slam1, [0, 0.5], [2.5, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
        : interpolate(slam1, [0.5, 1], [1, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      // Flash on impact
      const flash1 = slam1 < 0.3 ? slam1 / 0.3 : Math.max(0, 1 - (slam1 - 0.3) / 0.5);
      if (flash1 > 0.1) {
        ctx.fillStyle = `hsla(45, 60%, 75%, ${flash1 * 0.2})`;
        ctx.fillRect(0, height * 0.28, width, 40 * scale);
      }

      ctx.save();
      ctx.translate(cx, height * 0.34);
      ctx.scale(impactScale1, impactScale1);
      ctx.fillStyle = PALETTE.text.accent;
      ctx.font = `bold ${26 * scale}px monospace`;
      ctx.textAlign = "center";
      ctx.fillText("7,050", 0, 0);
      ctx.restore();

      // Label fades in after slam
      const label1Alpha = interpolate(frame, [16, 24], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      if (label1Alpha > 0) {
        ctx.fillStyle = `hsla(0, 0%, 100%, ${label1Alpha * 0.5})`;
        ctx.font = `${10 * scale}px system-ui`;
        ctx.textAlign = "center";
        ctx.fillText("sections", cx, height * 0.34 + 18 * scale);
      }
    }

    // Second number: "21,000,000" slams in at frame 40 — bigger
    const slam2Start = 38;
    const slam2 = interpolate(frame, [slam2Start, slam2Start + 5], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (slam2 > 0) {
      const impactScale2 = slam2 < 0.5
        ? interpolate(slam2, [0, 0.5], [2.8, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
        : 1;
      const flash2 = slam2 < 0.3 ? slam2 / 0.3 : Math.max(0, 1 - (slam2 - 0.3) / 0.4);
      if (flash2 > 0.1) {
        ctx.fillStyle = `hsla(45, 70%, 80%, ${flash2 * 0.3})`;
        ctx.fillRect(0, height * 0.52, width, 50 * scale);
      }

      ctx.save();
      ctx.translate(cx, height * 0.62);
      ctx.scale(impactScale2, impactScale2);
      ctx.fillStyle = PALETTE.text.accent;
      ctx.font = `bold ${32 * scale}px monospace`;
      ctx.textAlign = "center";
      ctx.fillText("21,000,000", 0, 0);
      ctx.restore();

      // Label
      const label2Alpha = interpolate(frame, [slam2Start + 8, slam2Start + 16], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      if (label2Alpha > 0) {
        ctx.fillStyle = `hsla(0, 0%, 100%, ${label2Alpha * 0.5})`;
        ctx.font = `${10 * scale}px system-ui`;
        ctx.textAlign = "center";
        ctx.fillText("photographs", cx, height * 0.62 + 22 * scale);
      }
    }

    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

export const VARIANTS_SHOT_018: VariantDef[] = [
  { id: "dual-counter", label: "Dual Counter", component: V1 },
  { id: "stacking-blocks", label: "Stacking Blocks", component: V2 },
  { id: "odometer", label: "Odometer", component: V3 },
  { id: "terminal-output", label: "Terminal Output", component: V4 },
  { id: "progress-bars", label: "Progress Bars", component: V5 },
  { id: "pie-charts", label: "Pie Charts", component: V6 },
  { id: "number-cascade", label: "Number Cascade", component: V7 },
  { id: "proportional-squares", label: "Proportional Squares", component: V8 },
  { id: "dramatic-reveal", label: "Dramatic Reveal", component: V9 },
];
