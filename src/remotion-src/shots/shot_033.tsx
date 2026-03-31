import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantDef, VariantProps } from "../types";
import { seeded, drawBg, makeParticles, drawParticles, PALETTE, fadeInOut } from "../scenes/theme";
import { drawMonitor, drawPowerButton, drawNeuron, drawCursor } from "../icons";

// Shot 33 — "The question is — if you copy every connection into a computer and turn it on, does it actually work?"
// 150 frames (5s). Connectome slides into a monitor, power button glows, question mark.

const V1: React.FC<VariantProps> = ({ width, height }) => {
  // Monitor Loading: connectome slides into monitor, power button glows, "?" appears
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(18, width, height, scale), [width, height, scale]);
  const data = useMemo(() => {
    const rand = seeded(33001);
    const neurons: { x: number; y: number; hue: number }[] = [];
    for (let i = 0; i < 40; i++) {
      neurons.push({ x: rand(), y: rand(), hue: PALETTE.cellColors[Math.floor(rand() * 8)][0] });
    }
    const edges: [number, number][] = [];
    for (let i = 0; i < neurons.length; i++) {
      for (let j = i + 1; j < neurons.length; j++) {
        const dx = neurons[i].x - neurons[j].x;
        const dy = neurons[i].y - neurons[j].y;
        if (Math.sqrt(dx * dx + dy * dy) < 0.3 && rand() < 0.2) edges.push([i, j]);
      }
    }
    return { neurons, edges };
  }, []);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, parts, frame, scale);
    const fadeAlpha = fadeInOut(frame, 150);
    ctx.globalAlpha = fadeAlpha;

    const monitorAppear = interpolate(frame, [5, 25], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const slideIn = interpolate(frame, [20, 55], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const powerGlow = interpolate(frame, [60, 80], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const questionFade = interpolate(frame, [85, 105], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const questionPulse = frame > 105 ? Math.sin((frame - 105) * 0.08) * 0.15 + 0.85 : 1;

    const monitorCx = width / 2;
    const monitorCy = height * 0.42;
    const monW = 120 * scale;
    const monH = 80 * scale;

    // Monitor
    if (monitorAppear > 0) {
      ctx.globalAlpha = fadeAlpha * monitorAppear;
      drawMonitor(ctx, monitorCx, monitorCy, monW, monH, `hsla(220, 40%, 55%, 0.7)`);

      // Screen background
      ctx.fillStyle = `hsla(220, 30%, 12%, ${monitorAppear * 0.8})`;
      ctx.fillRect(monitorCx - monW / 2 + 2, monitorCy - monH / 2 + 2, monW - 4, monH - 4);
      ctx.globalAlpha = fadeAlpha;
    }

    // Connectome sliding into monitor from the left
    if (slideIn > 0) {
      ctx.save();
      ctx.beginPath();
      ctx.rect(monitorCx - monW / 2 + 3, monitorCy - monH / 2 + 3, monW - 6, monH - 6);
      ctx.clip();

      const offsetX = (1 - slideIn) * -monW * 0.6;
      const screenX = monitorCx - monW / 2 + 8 + offsetX;
      const screenY = monitorCy - monH / 2 + 8;
      const screenW = monW - 16;
      const screenH = monH - 16;

      // Grey desaturated network inside screen
      for (const [a, b] of data.edges) {
        const na = data.neurons[a], nb = data.neurons[b];
        ctx.strokeStyle = `hsla(220, 15%, 45%, ${slideIn * 0.2})`;
        ctx.lineWidth = 0.5 * scale;
        ctx.beginPath();
        ctx.moveTo(screenX + na.x * screenW, screenY + na.y * screenH);
        ctx.lineTo(screenX + nb.x * screenW, screenY + nb.y * screenH);
        ctx.stroke();
      }
      for (const n of data.neurons) {
        ctx.fillStyle = `hsla(220, 20%, 50%, ${slideIn * 0.5})`;
        ctx.beginPath();
        ctx.arc(screenX + n.x * screenW, screenY + n.y * screenH, 2 * scale, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }

    // Power button in corner
    if (powerGlow > 0) {
      const pbX = monitorCx + monW / 2 + 18 * scale;
      const pbY = monitorCy + monH / 2 - 5 * scale;
      const glowColor = `hsla(140, 70%, 60%, ${powerGlow * 0.7})`;

      // Green glow
      ctx.shadowColor = glowColor;
      ctx.shadowBlur = 10 * scale * powerGlow;
      drawPowerButton(ctx, pbX, pbY, 18 * scale, glowColor);
      ctx.shadowBlur = 0;
    }

    // Question mark
    if (questionFade > 0) {
      ctx.globalAlpha = fadeAlpha * questionFade * questionPulse;
      ctx.fillStyle = PALETTE.text.accent;
      ctx.font = `bold ${40 * scale}px system-ui`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("?", monitorCx, monitorCy);
      ctx.globalAlpha = fadeAlpha;
    }

    // Bottom text
    const textFade = interpolate(frame, [110, 130], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (textFade > 0) {
      ctx.globalAlpha = fadeAlpha * textFade;
      ctx.fillStyle = PALETTE.text.dim;
      ctx.font = `${10 * scale}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText("does it actually work?", width / 2, height * 0.88);
      ctx.globalAlpha = fadeAlpha;
    }

    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V2: React.FC<VariantProps> = ({ width, height }) => {
  // Boot Sequence: terminal/BIOS text scrolling loading connectome data
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(12, width, height, scale), [width, height, scale]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, parts, frame, scale);
    const fadeAlpha = fadeInOut(frame, 150);
    ctx.globalAlpha = fadeAlpha;

    const lines = [
      { text: "BIOS v3.1 — FlyBrain Emulator", frame: 5, color: "hsla(140, 60%, 60%, 0.7)" },
      { text: "Loading connectome data...", frame: 18, color: PALETTE.text.primary },
      { text: "  Neurons: 138,639 ............ OK", frame: 30, color: PALETTE.accent.green },
      { text: "  Synapses: 15,091,983 ........ OK", frame: 45, color: PALETTE.accent.green },
      { text: "  Weight matrix: 76 GB ........ OK", frame: 58, color: PALETTE.accent.green },
      { text: "", frame: 68, color: "" },
      { text: "Initializing LIF model...", frame: 72, color: PALETTE.text.primary },
      { text: "  Spike threshold: configured", frame: 82, color: `hsla(220, 50%, 65%, 0.8)` },
      { text: "  Membrane decay: configured", frame: 90, color: `hsla(220, 50%, 65%, 0.8)` },
      { text: "", frame: 98, color: "" },
      { text: "Execute simulation? [Y/N] _", frame: 105, color: PALETTE.text.accent },
    ];

    const lineHeight = 13 * scale;
    const startX = width * 0.08;
    const startY = height * 0.1;
    const fontSize = 8 * scale;

    // Terminal background
    ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
    ctx.fillRect(startX - 8 * scale, startY - 12 * scale, width * 0.84, lines.length * lineHeight + 28 * scale);
    ctx.strokeStyle = "hsla(140, 40%, 40%, 0.25)";
    ctx.lineWidth = 1 * scale;
    ctx.strokeRect(startX - 8 * scale, startY - 12 * scale, width * 0.84, lines.length * lineHeight + 28 * scale);

    ctx.font = `${fontSize}px monospace`;
    ctx.textAlign = "left";

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (!line.text) continue;
      const charsVisible = Math.floor(interpolate(frame, [line.frame, line.frame + line.text.length * 0.4], [0, line.text.length], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
      if (charsVisible <= 0) continue;

      const visibleText = line.text.substring(0, charsVisible);
      ctx.fillStyle = line.color;
      ctx.fillText(visibleText, startX, startY + i * lineHeight + 6 * scale);
    }

    // Cursor blink at the end
    const lastLine = lines[lines.length - 1];
    if (frame > lastLine.frame + lastLine.text.length * 0.4 && Math.floor(frame * 0.07) % 2 === 0) {
      const cursorY = startY + (lines.length - 1) * lineHeight;
      const textW = ctx.measureText(lastLine.text.replace("_", "")).width;
      ctx.fillStyle = PALETTE.text.accent;
      ctx.fillRect(startX + textW, cursorY, 6 * scale, fontSize + 2 * scale);
    }

    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V3: React.FC<VariantProps> = ({ width, height }) => {
  // Slide-In: grey/flat connectome slides horizontally into monitor frame
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(18, width, height, scale), [width, height, scale]);
  const data = useMemo(() => {
    const rand = seeded(33003);
    const neurons: { x: number; y: number; hue: number }[] = [];
    for (let i = 0; i < 50; i++) {
      neurons.push({ x: rand(), y: rand(), hue: PALETTE.cellColors[Math.floor(rand() * 8)][0] });
    }
    const edges: [number, number][] = [];
    for (let i = 0; i < neurons.length; i++) {
      for (let j = i + 1; j < neurons.length; j++) {
        const dx = neurons[i].x - neurons[j].x;
        const dy = neurons[i].y - neurons[j].y;
        if (Math.sqrt(dx * dx + dy * dy) < 0.25 && rand() < 0.2) edges.push([i, j]);
      }
    }
    return { neurons, edges };
  }, []);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, parts, frame, scale);
    const fadeAlpha = fadeInOut(frame, 150);
    ctx.globalAlpha = fadeAlpha;

    const monW = 110 * scale;
    const monH = 75 * scale;
    const monitorCx = width * 0.55;
    const monitorCy = height * 0.42;

    // The grey connectome slides from left toward and into the monitor
    const networkSlide = interpolate(frame, [5, 65], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const networkEased = 1 - Math.pow(1 - networkSlide, 2);
    const networkCenterX = width * 0.15 + (monitorCx - width * 0.15) * networkEased;
    const networkScale = interpolate(networkSlide, [0.6, 1], [1, 0.7], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

    // Draw floating network (greyscale, desaturated)
    const netW = monW * 0.7;
    const netH = monH * 0.7;
    if (networkSlide < 0.95) {
      ctx.save();
      ctx.translate(networkCenterX, monitorCy);
      ctx.scale(networkScale, networkScale);
      for (const [a, b] of data.edges) {
        const na = data.neurons[a], nb = data.neurons[b];
        ctx.strokeStyle = `hsla(220, 10%, 45%, 0.15)`;
        ctx.lineWidth = 0.6 * scale;
        ctx.beginPath();
        ctx.moveTo((na.x - 0.5) * netW, (na.y - 0.5) * netH);
        ctx.lineTo((nb.x - 0.5) * netW, (nb.y - 0.5) * netH);
        ctx.stroke();
      }
      for (const n of data.neurons) {
        ctx.fillStyle = `hsla(220, 12%, 48%, 0.5)`;
        ctx.beginPath();
        ctx.arc((n.x - 0.5) * netW, (n.y - 0.5) * netH, 2 * scale, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    // Monitor frame (drawn after so it appears on top)
    const monitorFade = interpolate(frame, [40, 60], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (monitorFade > 0) {
      ctx.globalAlpha = fadeAlpha * monitorFade;
      // Screen dark fill
      ctx.fillStyle = `hsla(220, 30%, 10%, 0.8)`;
      ctx.fillRect(monitorCx - monW / 2, monitorCy - monH / 2, monW, monH);
      drawMonitor(ctx, monitorCx, monitorCy, monW, monH, `hsla(220, 40%, 55%, 0.7)`);

      // Network inside screen after slide completes
      if (networkSlide > 0.85) {
        const insideAlpha = (networkSlide - 0.85) / 0.15;
        ctx.save();
        ctx.beginPath();
        ctx.rect(monitorCx - monW / 2 + 3, monitorCy - monH / 2 + 3, monW - 6, monH - 6);
        ctx.clip();
        ctx.globalAlpha = fadeAlpha * insideAlpha;
        const sW = monW - 16, sH = monH - 16;
        const sX = monitorCx - monW / 2 + 8;
        const sY = monitorCy - monH / 2 + 8;
        for (const [a, b] of data.edges) {
          const na = data.neurons[a], nb = data.neurons[b];
          ctx.strokeStyle = `hsla(220, 15%, 45%, 0.2)`;
          ctx.lineWidth = 0.5 * scale;
          ctx.beginPath();
          ctx.moveTo(sX + na.x * sW, sY + na.y * sH);
          ctx.lineTo(sX + nb.x * sW, sY + nb.y * sH);
          ctx.stroke();
        }
        for (const n of data.neurons) {
          ctx.fillStyle = `hsla(220, 18%, 50%, 0.5)`;
          ctx.beginPath();
          ctx.arc(sX + n.x * sW, sY + n.y * sH, 1.5 * scale, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }
      ctx.globalAlpha = fadeAlpha;
    }

    // Power button with question mark
    const pbFade = interpolate(frame, [80, 100], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (pbFade > 0) {
      ctx.globalAlpha = fadeAlpha * pbFade;
      const pbX = monitorCx;
      const pbY = monitorCy + monH / 2 + monH * 0.15 + 18 * scale;
      drawPowerButton(ctx, pbX, pbY, 16 * scale, `hsla(140, 60%, 55%, ${pbFade * 0.7})`);

      // Question mark
      const qFade = interpolate(frame, [100, 120], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      if (qFade > 0) {
        const qPulse = Math.sin(frame * 0.08) * 0.1 + 0.9;
        ctx.globalAlpha = fadeAlpha * qFade * qPulse;
        ctx.fillStyle = PALETTE.text.accent;
        ctx.font = `bold ${24 * scale}px system-ui`;
        ctx.textAlign = "center";
        ctx.fillText("?", monitorCx + monW / 2 + 22 * scale, monitorCy);
      }
      ctx.globalAlpha = fadeAlpha;
    }

    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V4: React.FC<VariantProps> = ({ width, height }) => {
  // Power Button Close-up: large power button pulsing green, "?" above, minimal
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(15, width, height, scale), [width, height, scale]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, parts, frame, scale);
    const fadeAlpha = fadeInOut(frame, 150);
    ctx.globalAlpha = fadeAlpha;

    const buttonAppear = interpolate(frame, [10, 35], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const glowPulse = Math.sin(frame * 0.06) * 0.15 + 0.85;
    const questionFade = interpolate(frame, [45, 65], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const textFade = interpolate(frame, [80, 100], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

    const cx = width / 2;
    const cy = height * 0.45;
    const buttonSize = 55 * scale;

    // Background circle glow
    if (buttonAppear > 0) {
      const glowRadius = buttonSize * 2.5;
      const grad = ctx.createRadialGradient(cx, cy, buttonSize * 0.5, cx, cy, glowRadius);
      grad.addColorStop(0, `hsla(140, 60%, 45%, ${buttonAppear * glowPulse * 0.08})`);
      grad.addColorStop(1, "hsla(140, 60%, 45%, 0)");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, glowRadius, 0, Math.PI * 2);
      ctx.fill();

      // Ring behind button
      ctx.strokeStyle = `hsla(140, 50%, 40%, ${buttonAppear * 0.2})`;
      ctx.lineWidth = 2 * scale;
      ctx.beginPath();
      ctx.arc(cx, cy, buttonSize * 0.8, 0, Math.PI * 2);
      ctx.stroke();

      // Power button
      ctx.globalAlpha = fadeAlpha * buttonAppear;
      const greenColor = `hsla(140, 65%, 55%, ${glowPulse * 0.8})`;
      ctx.shadowColor = `hsla(140, 70%, 60%, ${glowPulse * 0.5})`;
      ctx.shadowBlur = 15 * scale;
      drawPowerButton(ctx, cx, cy, buttonSize, greenColor);
      ctx.shadowBlur = 0;
      ctx.globalAlpha = fadeAlpha;
    }

    // "?" above the button
    if (questionFade > 0) {
      const qPulse = Math.sin(frame * 0.07) * 0.1 + 0.9;
      ctx.globalAlpha = fadeAlpha * questionFade * qPulse;
      ctx.fillStyle = PALETTE.text.accent;
      ctx.font = `bold ${36 * scale}px system-ui`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("?", cx, cy - buttonSize - 15 * scale);
      ctx.globalAlpha = fadeAlpha;
    }

    // "does it work?" text
    if (textFade > 0) {
      ctx.globalAlpha = fadeAlpha * textFade;
      ctx.fillStyle = PALETTE.text.dim;
      ctx.font = `${11 * scale}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText("does it actually work?", cx, cy + buttonSize + 25 * scale);
      ctx.globalAlpha = fadeAlpha;
    }

    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V5: React.FC<VariantProps> = ({ width, height }) => {
  // Terminal Prompt: commands typed out ending at "Ready. Press ENTER to start."
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(12, width, height, scale), [width, height, scale]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, parts, frame, scale);
    const fadeAlpha = fadeInOut(frame, 150);
    ctx.globalAlpha = fadeAlpha;

    const lines = [
      { text: "$ python run_simulation.py", frame: 8, color: PALETTE.accent.green },
      { text: "", frame: 22, color: "" },
      { text: "Loading brain model...", frame: 25, color: PALETTE.text.primary },
      { text: "  neurons: 138,639", frame: 38, color: `hsla(220, 50%, 65%, 0.8)` },
      { text: "  synapses: 15,091,983", frame: 48, color: `hsla(220, 50%, 65%, 0.8)` },
      { text: "  model: LIF spiking network", frame: 58, color: `hsla(220, 50%, 65%, 0.8)` },
      { text: "", frame: 68, color: "" },
      { text: "Ready.", frame: 75, color: PALETTE.accent.green },
      { text: "Press ENTER to start.", frame: 88, color: PALETTE.text.accent },
    ];

    const lineHeight = 14 * scale;
    const startX = width * 0.1;
    const startY = height * 0.15;
    const fontSize = 8.5 * scale;

    // Terminal window
    ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
    const termW = width * 0.8;
    const termH = lines.length * lineHeight + 30 * scale;
    ctx.fillRect(startX - 8 * scale, startY - 14 * scale, termW, termH);
    ctx.strokeStyle = "hsla(140, 35%, 40%, 0.25)";
    ctx.lineWidth = 1 * scale;
    ctx.strokeRect(startX - 8 * scale, startY - 14 * scale, termW, termH);

    // Window dots
    for (let i = 0; i < 3; i++) {
      ctx.fillStyle = ["hsla(0, 60%, 55%, 0.6)", "hsla(45, 60%, 55%, 0.6)", "hsla(140, 60%, 55%, 0.6)"][i];
      ctx.beginPath();
      ctx.arc(startX + i * 10 * scale, startY - 7 * scale, 2.5 * scale, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.font = `${fontSize}px monospace`;
    ctx.textAlign = "left";

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (!line.text) continue;
      const charsVisible = Math.floor(interpolate(frame, [line.frame, line.frame + line.text.length * 0.35], [0, line.text.length], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
      if (charsVisible <= 0) continue;

      ctx.fillStyle = line.color;
      ctx.fillText(line.text.substring(0, charsVisible), startX, startY + i * lineHeight + 8 * scale);
    }

    // Blinking cursor at the end
    if (frame > 100 && Math.floor(frame * 0.07) % 2 === 0) {
      const lastIdx = lines.length - 1;
      const textW = ctx.measureText(lines[lastIdx].text).width;
      ctx.fillStyle = PALETTE.text.accent;
      ctx.fillRect(startX + textW + 3, startY + lastIdx * lineHeight + 1 * scale, 6 * scale, fontSize + 2 * scale);
    }

    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V6: React.FC<VariantProps> = ({ width, height }) => {
  // Play Button: static grey network, large pulsing play triangle overlay, "Does it work?" text
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(18, width, height, scale), [width, height, scale]);
  const data = useMemo(() => {
    const rand = seeded(33006);
    const neurons: { x: number; y: number }[] = [];
    for (let i = 0; i < 60; i++) {
      neurons.push({ x: width * (0.1 + rand() * 0.8), y: height * (0.1 + rand() * 0.65) });
    }
    const edges: [number, number][] = [];
    for (let i = 0; i < neurons.length; i++) {
      for (let j = i + 1; j < neurons.length; j++) {
        const dx = neurons[i].x - neurons[j].x;
        const dy = neurons[i].y - neurons[j].y;
        if (Math.sqrt(dx * dx + dy * dy) < 50 * scale && rand() < 0.15) edges.push([i, j]);
      }
    }
    return { neurons, edges };
  }, [width, height, scale]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, parts, frame, scale);
    const fadeAlpha = fadeInOut(frame, 150);
    ctx.globalAlpha = fadeAlpha;

    const networkFade = interpolate(frame, [5, 25], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const playAppear = interpolate(frame, [30, 50], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const textFade = interpolate(frame, [55, 75], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const playPulse = Math.sin(frame * 0.06) * 0.08 + 0.92;

    // Static grey network
    ctx.globalAlpha = fadeAlpha * networkFade;
    for (const [a, b] of data.edges) {
      const na = data.neurons[a], nb = data.neurons[b];
      ctx.strokeStyle = `hsla(220, 10%, 40%, 0.12)`;
      ctx.lineWidth = 0.6 * scale;
      ctx.beginPath();
      ctx.moveTo(na.x, na.y);
      ctx.lineTo(nb.x, nb.y);
      ctx.stroke();
    }
    for (const n of data.neurons) {
      ctx.fillStyle = `hsla(220, 10%, 45%, 0.4)`;
      ctx.beginPath();
      ctx.arc(n.x, n.y, 2.5 * scale, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = fadeAlpha;

    // Large play button triangle
    if (playAppear > 0) {
      const cx = width / 2;
      const cy = height * 0.42;
      const triangleSize = 35 * scale * playAppear;

      // Circle behind triangle
      ctx.fillStyle = `hsla(0, 0%, 10%, ${playAppear * 0.5})`;
      ctx.beginPath();
      ctx.arc(cx, cy, triangleSize * 1.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = `hsla(140, 50%, 55%, ${playAppear * 0.5 * playPulse})`;
      ctx.lineWidth = 2.5 * scale;
      ctx.beginPath();
      ctx.arc(cx, cy, triangleSize * 1.5, 0, Math.PI * 2);
      ctx.stroke();

      // Triangle
      ctx.fillStyle = `hsla(140, 55%, 60%, ${playAppear * 0.8 * playPulse})`;
      ctx.beginPath();
      ctx.moveTo(cx - triangleSize * 0.4, cy - triangleSize * 0.6);
      ctx.lineTo(cx + triangleSize * 0.7, cy);
      ctx.lineTo(cx - triangleSize * 0.4, cy + triangleSize * 0.6);
      ctx.closePath();
      ctx.fill();
    }

    // "Does it work?" text
    if (textFade > 0) {
      ctx.globalAlpha = fadeAlpha * textFade;
      ctx.fillStyle = PALETTE.text.dim;
      ctx.font = `italic ${12 * scale}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText("does it work?", width / 2, height * 0.82);
      ctx.globalAlpha = fadeAlpha;
    }

    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V7: React.FC<VariantProps> = ({ width, height }) => {
  // Computer Drawing Brain: monitor with connectome drawing node by node, progress bar
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(18, width, height, scale), [width, height, scale]);
  const data = useMemo(() => {
    const rand = seeded(33007);
    const neurons: { x: number; y: number; hue: number }[] = [];
    for (let i = 0; i < 50; i++) {
      neurons.push({ x: rand(), y: rand(), hue: PALETTE.cellColors[Math.floor(rand() * 8)][0] });
    }
    const edges: [number, number][] = [];
    for (let i = 0; i < neurons.length; i++) {
      for (let j = i + 1; j < neurons.length; j++) {
        const dx = neurons[i].x - neurons[j].x;
        const dy = neurons[i].y - neurons[j].y;
        if (Math.sqrt(dx * dx + dy * dy) < 0.28 && rand() < 0.18) edges.push([i, j]);
      }
    }
    return { neurons, edges };
  }, []);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, parts, frame, scale);
    const fadeAlpha = fadeInOut(frame, 150);
    ctx.globalAlpha = fadeAlpha;

    const monW = 120 * scale;
    const monH = 80 * scale;
    const monitorCx = width / 2;
    const monitorCy = height * 0.4;

    // Monitor
    ctx.fillStyle = `hsla(220, 30%, 10%, 0.8)`;
    ctx.fillRect(monitorCx - monW / 2, monitorCy - monH / 2, monW, monH);
    drawMonitor(ctx, monitorCx, monitorCy, monW, monH, `hsla(220, 40%, 55%, 0.6)`);

    // Build progress inside screen
    const buildProgress = interpolate(frame, [10, 95], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const nodesShown = Math.floor(buildProgress * data.neurons.length);

    ctx.save();
    ctx.beginPath();
    ctx.rect(monitorCx - monW / 2 + 3, monitorCy - monH / 2 + 3, monW - 6, monH - 6);
    ctx.clip();

    const sX = monitorCx - monW / 2 + 8;
    const sY = monitorCy - monH / 2 + 8;
    const sW = monW - 16;
    const sH = monH - 20;

    // Edges for visible nodes
    for (const [a, b] of data.edges) {
      if (a >= nodesShown || b >= nodesShown) continue;
      const na = data.neurons[a], nb = data.neurons[b];
      ctx.strokeStyle = `hsla(220, 25%, 50%, 0.15)`;
      ctx.lineWidth = 0.5 * scale;
      ctx.beginPath();
      ctx.moveTo(sX + na.x * sW, sY + na.y * sH);
      ctx.lineTo(sX + nb.x * sW, sY + nb.y * sH);
      ctx.stroke();
    }

    // Nodes appearing one by one
    for (let i = 0; i < nodesShown; i++) {
      const n = data.neurons[i];
      const isRecent = i > nodesShown - 3;
      ctx.fillStyle = isRecent ? `hsla(${n.hue}, 60%, 65%, 0.9)` : `hsla(${n.hue}, 30%, 50%, 0.5)`;
      ctx.beginPath();
      ctx.arc(sX + n.x * sW, sY + n.y * sH, (isRecent ? 2.5 : 1.8) * scale, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();

    // Progress bar below monitor
    const barX = monitorCx - monW / 2;
    const barY = monitorCy + monH / 2 + monH * 0.15 + 10 * scale;
    const barW = monW;
    const barH = 5 * scale;
    ctx.fillStyle = "hsla(220, 20%, 25%, 0.5)";
    ctx.fillRect(barX, barY, barW, barH);
    ctx.fillStyle = `hsla(140, 55%, 55%, 0.7)`;
    ctx.fillRect(barX, barY, barW * buildProgress, barH);
    ctx.fillStyle = PALETTE.text.dim;
    ctx.font = `${7 * scale}px monospace`;
    ctx.textAlign = "center";
    ctx.fillText(`${Math.round(buildProgress * 100)}%`, monitorCx, barY + barH + 10 * scale);

    // "Run?" text after complete
    const runFade = interpolate(frame, [100, 120], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (runFade > 0) {
      const runPulse = Math.sin(frame * 0.08) * 0.12 + 0.88;
      ctx.globalAlpha = fadeAlpha * runFade * runPulse;
      ctx.fillStyle = PALETTE.text.accent;
      ctx.font = `bold ${16 * scale}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText("Run?", monitorCx, monitorCy + 5 * scale);
      ctx.globalAlpha = fadeAlpha;
    }

    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V8: React.FC<VariantProps> = ({ width, height }) => {
  // Screen Static: monitor showing static noise with occasional connectome flashes
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(15, width, height, scale), [width, height, scale]);
  const data = useMemo(() => {
    const rand = seeded(33008);
    const neurons: { x: number; y: number; hue: number }[] = [];
    for (let i = 0; i < 35; i++) {
      neurons.push({ x: rand(), y: rand(), hue: PALETTE.cellColors[Math.floor(rand() * 8)][0] });
    }
    const edges: [number, number][] = [];
    for (let i = 0; i < neurons.length; i++) {
      for (let j = i + 1; j < neurons.length; j++) {
        const dx = neurons[i].x - neurons[j].x;
        const dy = neurons[i].y - neurons[j].y;
        if (Math.sqrt(dx * dx + dy * dy) < 0.3 && rand() < 0.2) edges.push([i, j]);
      }
    }
    // Static noise pixels
    const staticPixels: number[] = [];
    for (let i = 0; i < 800; i++) {
      staticPixels.push(rand());
    }
    return { neurons, edges, staticPixels };
  }, []);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, parts, frame, scale);
    const fadeAlpha = fadeInOut(frame, 150);
    ctx.globalAlpha = fadeAlpha;

    const monW = 120 * scale;
    const monH = 80 * scale;
    const monitorCx = width / 2;
    const monitorCy = height * 0.42;

    // Monitor
    ctx.fillStyle = `hsla(220, 30%, 8%, 0.9)`;
    ctx.fillRect(monitorCx - monW / 2, monitorCy - monH / 2, monW, monH);
    drawMonitor(ctx, monitorCx, monitorCy, monW, monH, `hsla(220, 40%, 55%, 0.6)`);

    // Static noise inside screen
    ctx.save();
    ctx.beginPath();
    ctx.rect(monitorCx - monW / 2 + 2, monitorCy - monH / 2 + 2, monW - 4, monH - 4);
    ctx.clip();

    const sX = monitorCx - monW / 2;
    const sY = monitorCy - monH / 2;
    const pixSize = 4 * scale;
    const cols = Math.ceil(monW / pixSize);
    const rows = Math.ceil(monH / pixSize);

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const idx = ((r * cols + c) + frame * 7) % data.staticPixels.length;
        const brightness = data.staticPixels[idx] * 0.3;
        ctx.fillStyle = `hsla(220, 5%, ${brightness * 100}%, 0.6)`;
        ctx.fillRect(sX + c * pixSize, sY + r * pixSize, pixSize, pixSize);
      }
    }

    // Occasional connectome flash (every ~30 frames for 3 frames)
    const flashCycle = frame % 35;
    if (flashCycle >= 0 && flashCycle < 4 && frame > 20) {
      const flashAlpha = flashCycle < 2 ? 0.5 : 0.2;
      const sW = monW - 10, sH = monH - 10;
      const sOX = sX + 5, sOY = sY + 5;
      for (const [a, b] of data.edges) {
        const na = data.neurons[a], nb = data.neurons[b];
        ctx.strokeStyle = `hsla(185, 50%, 55%, ${flashAlpha * 0.3})`;
        ctx.lineWidth = 0.5 * scale;
        ctx.beginPath();
        ctx.moveTo(sOX + na.x * sW, sOY + na.y * sH);
        ctx.lineTo(sOX + nb.x * sW, sOY + nb.y * sH);
        ctx.stroke();
      }
      for (const n of data.neurons) {
        ctx.fillStyle = `hsla(${n.hue}, 40%, 60%, ${flashAlpha * 0.6})`;
        ctx.beginPath();
        ctx.arc(sOX + n.x * sW, sOY + n.y * sH, 2 * scale, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.restore();

    // Uncertain text
    const textFade = interpolate(frame, [80, 105], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (textFade > 0) {
      ctx.globalAlpha = fadeAlpha * textFade;
      ctx.fillStyle = PALETTE.text.dim;
      ctx.font = `italic ${11 * scale}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText("loaded but not started", monitorCx, monitorCy + monH / 2 + monH * 0.15 + 18 * scale);
      // Question mark
      const qPulse = Math.sin(frame * 0.08) * 0.15 + 0.85;
      ctx.globalAlpha = fadeAlpha * textFade * qPulse;
      ctx.fillStyle = PALETTE.text.accent;
      ctx.font = `bold ${22 * scale}px system-ui`;
      ctx.fillText("?", monitorCx, monitorCy + monH / 2 + monH * 0.15 + 42 * scale);
      ctx.globalAlpha = fadeAlpha;
    }

    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V9: React.FC<VariantProps> = ({ width, height }) => {
  // Cursor Hovering: monitor with connectome, cursor hovers over EXECUTE button, trembles
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(18, width, height, scale), [width, height, scale]);
  const data = useMemo(() => {
    const rand = seeded(33009);
    const neurons: { x: number; y: number; hue: number }[] = [];
    for (let i = 0; i < 40; i++) {
      neurons.push({ x: rand(), y: rand(), hue: PALETTE.cellColors[Math.floor(rand() * 8)][0] });
    }
    const edges: [number, number][] = [];
    for (let i = 0; i < neurons.length; i++) {
      for (let j = i + 1; j < neurons.length; j++) {
        const dx = neurons[i].x - neurons[j].x;
        const dy = neurons[i].y - neurons[j].y;
        if (Math.sqrt(dx * dx + dy * dy) < 0.3 && rand() < 0.2) edges.push([i, j]);
      }
    }
    return { neurons, edges };
  }, []);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, parts, frame, scale);
    const fadeAlpha = fadeInOut(frame, 150);
    ctx.globalAlpha = fadeAlpha;

    const monW = 125 * scale;
    const monH = 85 * scale;
    const monitorCx = width / 2;
    const monitorCy = height * 0.4;

    // Monitor + screen
    ctx.fillStyle = `hsla(220, 30%, 10%, 0.8)`;
    ctx.fillRect(monitorCx - monW / 2, monitorCy - monH / 2, monW, monH);
    drawMonitor(ctx, monitorCx, monitorCy, monW, monH, `hsla(220, 40%, 55%, 0.6)`);

    // Connectome inside screen
    const networkFade = interpolate(frame, [5, 25], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.save();
    ctx.beginPath();
    ctx.rect(monitorCx - monW / 2 + 3, monitorCy - monH / 2 + 3, monW - 6, monH - 20);
    ctx.clip();
    ctx.globalAlpha = fadeAlpha * networkFade;
    const sX = monitorCx - monW / 2 + 8;
    const sY = monitorCy - monH / 2 + 8;
    const sW = monW - 16;
    const sH = monH - 28;
    for (const [a, b] of data.edges) {
      const na = data.neurons[a], nb = data.neurons[b];
      ctx.strokeStyle = `hsla(220, 20%, 50%, 0.15)`;
      ctx.lineWidth = 0.5 * scale;
      ctx.beginPath();
      ctx.moveTo(sX + na.x * sW, sY + na.y * sH);
      ctx.lineTo(sX + nb.x * sW, sY + nb.y * sH);
      ctx.stroke();
    }
    for (const n of data.neurons) {
      ctx.fillStyle = `hsla(${n.hue}, 25%, 50%, 0.4)`;
      ctx.beginPath();
      ctx.arc(sX + n.x * sW, sY + n.y * sH, 1.8 * scale, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
    ctx.globalAlpha = fadeAlpha;

    // EXECUTE button at bottom of screen
    const btnFade = interpolate(frame, [30, 45], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const btnX = monitorCx;
    const btnY = monitorCy + monH / 2 - 12 * scale;
    const btnW = 50 * scale;
    const btnH = 12 * scale;

    if (btnFade > 0) {
      ctx.globalAlpha = fadeAlpha * btnFade;
      // Button background
      ctx.fillStyle = `hsla(140, 50%, 35%, 0.6)`;
      ctx.fillRect(btnX - btnW / 2, btnY - btnH / 2, btnW, btnH);
      ctx.strokeStyle = `hsla(140, 55%, 50%, 0.7)`;
      ctx.lineWidth = 1 * scale;
      ctx.strokeRect(btnX - btnW / 2, btnY - btnH / 2, btnW, btnH);
      // Button text
      ctx.fillStyle = PALETTE.text.primary;
      ctx.font = `bold ${7 * scale}px monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("EXECUTE", btnX, btnY);
      ctx.globalAlpha = fadeAlpha;
    }

    // Cursor moving toward button and trembling
    const cursorApproach = interpolate(frame, [50, 85], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (cursorApproach > 0) {
      const startCursorX = monitorCx + monW / 2 + 20 * scale;
      const startCursorY = monitorCy;
      const cursorEased = 1 - Math.pow(1 - cursorApproach, 2);
      const targetX = btnX + 8 * scale;
      const targetY = btnY - 2 * scale;
      const currentCursorX = startCursorX + (targetX - startCursorX) * cursorEased;
      const currentCursorY = startCursorY + (targetY - startCursorY) * cursorEased;

      // Tremble when close
      const trembleAmplitude = cursorApproach > 0.8 ? (cursorApproach - 0.8) * 5 * 1.5 * scale : 0;
      const trembleX = trembleAmplitude * Math.sin(frame * 0.3);
      const trembleY = trembleAmplitude * Math.cos(frame * 0.35);

      drawCursor(ctx, currentCursorX + trembleX, currentCursorY + trembleY, 14 * scale, PALETTE.text.primary);
    }

    // "will they click?" text
    const textFade = interpolate(frame, [100, 125], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (textFade > 0) {
      ctx.globalAlpha = fadeAlpha * textFade;
      ctx.fillStyle = PALETTE.text.dim;
      ctx.font = `italic ${11 * scale}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText("does it actually work?", monitorCx, height * 0.88);
      ctx.globalAlpha = fadeAlpha;
    }

    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

export const VARIANTS_SHOT_033: VariantDef[] = [
  { id: "monitor-loading", label: "Monitor Loading", component: V1 },
  { id: "boot-sequence", label: "Boot Sequence", component: V2 },
  { id: "slide-in", label: "Slide-In", component: V3 },
  { id: "power-button", label: "Power Button Close-up", component: V4 },
  { id: "terminal-prompt", label: "Terminal Prompt", component: V5 },
  { id: "play-button", label: "Play Button", component: V6 },
  { id: "computer-drawing", label: "Computer Drawing Brain", component: V7 },
  { id: "screen-static", label: "Screen Static", component: V8 },
  { id: "cursor-hovering", label: "Cursor Hovering", component: V9 },
];
