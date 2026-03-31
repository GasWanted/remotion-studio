import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantDef, VariantProps } from "../types";
import { seeded, drawBg, makeParticles, drawParticles, PALETTE, fadeInOut } from "../scenes/theme";
import { drawNeuron } from "../icons";

// Shot 30 — "A hundred and thirty-eight thousand neurons. Fifteen million connections."
// 120 frames (4s). Two massive numbers counting up and landing.

const V1: React.FC<VariantProps> = ({ width, height }) => {
  // Dual Odometer: two monospace counters ticking to final values with overshoot
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

    const neuronTarget = 138639;
    const synTarget = 15091983;
    const neuronProgress = interpolate(frame, [8, 60], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const synProgress = interpolate(frame, [25, 90], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const labelFade = interpolate(frame, [5, 15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

    // Overshoot easing
    const overshoot = (t: number) => {
      if (t >= 1) return 1;
      return 1 - Math.pow(1 - t, 3) * (1 + 2.5 * (1 - t));
    };

    const neuronVal = Math.round(neuronTarget * Math.min(1, overshoot(neuronProgress)));
    const synVal = Math.round(synTarget * Math.min(1, overshoot(synProgress)));

    const formatNum = (n: number) => n.toLocaleString();

    // Neurons label
    const topY = height * 0.32;
    if (labelFade > 0) {
      ctx.globalAlpha = fadeAlpha * labelFade;
      ctx.fillStyle = PALETTE.text.dim;
      ctx.font = `${10 * scale}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText("NEURONS", width / 2, topY - 14 * scale);
      ctx.globalAlpha = fadeAlpha;
    }

    // Neuron number
    if (neuronProgress > 0) {
      ctx.fillStyle = PALETTE.text.accent;
      ctx.font = `bold ${28 * scale}px monospace`;
      ctx.textAlign = "center";
      ctx.fillText(formatNum(neuronVal), width / 2, topY + 16 * scale);
    }

    // Connections label
    const bottomY = height * 0.62;
    const connLabelFade = interpolate(frame, [20, 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (connLabelFade > 0) {
      ctx.globalAlpha = fadeAlpha * connLabelFade;
      ctx.fillStyle = PALETTE.text.dim;
      ctx.font = `${10 * scale}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText("CONNECTIONS", width / 2, bottomY - 14 * scale);
      ctx.globalAlpha = fadeAlpha;
    }

    // Connection number
    if (synProgress > 0) {
      ctx.fillStyle = PALETTE.text.accent;
      ctx.font = `bold ${28 * scale}px monospace`;
      ctx.textAlign = "center";
      ctx.fillText(formatNum(synVal), width / 2, bottomY + 16 * scale);
    }

    // Separator line
    const sepFade = interpolate(frame, [55, 65], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (sepFade > 0) {
      ctx.strokeStyle = `hsla(220, 30%, 45%, ${sepFade * 0.3})`;
      ctx.lineWidth = 1 * scale;
      const lineW = 60 * scale * sepFade;
      ctx.beginPath();
      ctx.moveTo(width / 2 - lineW, height * 0.47);
      ctx.lineTo(width / 2 + lineW, height * 0.47);
      ctx.stroke();
    }

    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V2: React.FC<VariantProps> = ({ width, height }) => {
  // Dramatic Slam: numbers slam in from above with impact rings
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

    const topY = height * 0.34;
    const bottomY = height * 0.62;

    // First number slam
    const slamProgress1 = interpolate(frame, [10, 28], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const bounce1 = slamProgress1 >= 1 ? 0 : (1 - slamProgress1);
    const yOffset1 = -bounce1 * 60 * scale;
    const slamScale1 = slamProgress1 < 1 ? 0.8 + slamProgress1 * 0.2 : 1 + Math.max(0, 1 - (frame - 28) * 0.08) * 0.05;

    // Impact ring 1
    const ring1Progress = interpolate(frame, [28, 48], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (ring1Progress > 0 && ring1Progress < 1) {
      ctx.strokeStyle = `hsla(45, 70%, 60%, ${(1 - ring1Progress) * 0.3})`;
      ctx.lineWidth = 2 * scale * (1 - ring1Progress);
      ctx.beginPath();
      ctx.ellipse(width / 2, topY, ring1Progress * 80 * scale, ring1Progress * 15 * scale, 0, 0, Math.PI * 2);
      ctx.stroke();
    }

    if (slamProgress1 > 0) {
      ctx.save();
      ctx.translate(width / 2, topY + yOffset1);
      ctx.scale(slamScale1, slamScale1);
      ctx.fillStyle = PALETTE.text.accent;
      ctx.font = `bold ${26 * scale}px monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("138,639", 0, 0);
      ctx.fillStyle = PALETTE.text.dim;
      ctx.font = `${10 * scale}px system-ui`;
      ctx.fillText("neurons", 0, 18 * scale);
      ctx.restore();
    }

    // Second number slam
    const slamProgress2 = interpolate(frame, [45, 63], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const bounce2 = slamProgress2 >= 1 ? 0 : (1 - slamProgress2);
    const yOffset2 = -bounce2 * 60 * scale;
    const slamScale2 = slamProgress2 < 1 ? 0.8 + slamProgress2 * 0.2 : 1 + Math.max(0, 1 - (frame - 63) * 0.08) * 0.05;

    // Impact ring 2
    const ring2Progress = interpolate(frame, [63, 83], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (ring2Progress > 0 && ring2Progress < 1) {
      ctx.strokeStyle = `hsla(45, 70%, 60%, ${(1 - ring2Progress) * 0.4})`;
      ctx.lineWidth = 3 * scale * (1 - ring2Progress);
      ctx.beginPath();
      ctx.ellipse(width / 2, bottomY, ring2Progress * 100 * scale, ring2Progress * 18 * scale, 0, 0, Math.PI * 2);
      ctx.stroke();
    }

    if (slamProgress2 > 0) {
      ctx.save();
      ctx.translate(width / 2, bottomY + yOffset2);
      ctx.scale(slamScale2, slamScale2);
      ctx.fillStyle = PALETTE.text.accent;
      ctx.font = `bold ${30 * scale}px monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("15,091,983", 0, 0);
      ctx.fillStyle = PALETTE.text.dim;
      ctx.font = `${10 * scale}px system-ui`;
      ctx.fillText("connections", 0, 20 * scale);
      ctx.restore();
    }

    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V3: React.FC<VariantProps> = ({ width, height }) => {
  // Digit-by-Digit: each digit pops in with a scale bounce, left to right
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

    const digits1 = "138,639".split("");
    const digits2 = "15,091,983".split("");
    const charWidth = 18 * scale;
    const topY = height * 0.34;
    const bottomY = height * 0.64;

    // First number: digits appear one by one
    ctx.font = `bold ${24 * scale}px monospace`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const startX1 = width / 2 - (digits1.length * charWidth) / 2 + charWidth / 2;
    for (let i = 0; i < digits1.length; i++) {
      const digitDelay = 8 + i * 5;
      const digitProgress = interpolate(frame, [digitDelay, digitDelay + 6], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      if (digitProgress <= 0) continue;
      const bounceScale = digitProgress < 1 ? 0.5 + digitProgress * 0.5 + Math.sin(digitProgress * Math.PI) * 0.15 : 1;
      ctx.save();
      ctx.translate(startX1 + i * charWidth, topY);
      ctx.scale(bounceScale, bounceScale);
      ctx.globalAlpha = fadeAlpha * digitProgress;
      ctx.fillStyle = PALETTE.text.accent;
      ctx.fillText(digits1[i], 0, 0);
      ctx.restore();
    }

    // "neurons" label
    const label1Fade = interpolate(frame, [48, 58], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (label1Fade > 0) {
      ctx.globalAlpha = fadeAlpha * label1Fade;
      ctx.fillStyle = PALETTE.text.dim;
      ctx.font = `${10 * scale}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText("neurons", width / 2, topY + 20 * scale);
      ctx.globalAlpha = fadeAlpha;
    }

    // Second number: digits appear
    ctx.font = `bold ${24 * scale}px monospace`;
    ctx.textBaseline = "middle";
    const startX2 = width / 2 - (digits2.length * charWidth) / 2 + charWidth / 2;
    for (let i = 0; i < digits2.length; i++) {
      const digitDelay = 55 + i * 3;
      const digitProgress = interpolate(frame, [digitDelay, digitDelay + 5], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      if (digitProgress <= 0) continue;
      const bounceScale = digitProgress < 1 ? 0.5 + digitProgress * 0.5 + Math.sin(digitProgress * Math.PI) * 0.15 : 1;
      ctx.save();
      ctx.translate(startX2 + i * charWidth, bottomY);
      ctx.scale(bounceScale, bounceScale);
      ctx.globalAlpha = fadeAlpha * digitProgress;
      ctx.fillStyle = PALETTE.text.accent;
      ctx.fillText(digits2[i], 0, 0);
      ctx.restore();
    }

    // "connections" label
    const label2Fade = interpolate(frame, [90, 100], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (label2Fade > 0) {
      ctx.globalAlpha = fadeAlpha * label2Fade;
      ctx.fillStyle = PALETTE.text.dim;
      ctx.font = `${10 * scale}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText("connections", width / 2, bottomY + 20 * scale);
      ctx.globalAlpha = fadeAlpha;
    }

    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V4: React.FC<VariantProps> = ({ width, height }) => {
  // Terminal Output: green terminal text, command-line authenticity
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(12, width, height, scale), [width, height, scale]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, parts, frame, scale);
    const fadeAlpha = fadeInOut(frame, 120);
    ctx.globalAlpha = fadeAlpha;

    const lines = [
      { text: "$ wc -l neurons.csv", frame: 5, color: PALETTE.accent.green },
      { text: "  138,639 neurons.csv", frame: 25, color: PALETTE.text.primary },
      { text: "", frame: 35, color: "" },
      { text: "$ wc -l synapses.csv", frame: 40, color: PALETTE.accent.green },
      { text: "  15,091,983 synapses.csv", frame: 60, color: PALETTE.text.primary },
      { text: "", frame: 70, color: "" },
      { text: "$ echo \"complete connectome mapped\"", frame: 78, color: PALETTE.accent.green },
      { text: "  complete connectome mapped", frame: 90, color: PALETTE.text.accent },
    ];

    const lineHeight = 16 * scale;
    const startX = width * 0.12;
    const startY = height * 0.18;
    const fontSize = 9 * scale;

    // Terminal background
    ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
    const termW = width * 0.76;
    const termH = lines.length * lineHeight + 30 * scale;
    ctx.fillRect(startX - 10 * scale, startY - 15 * scale, termW, termH);
    ctx.strokeStyle = "hsla(140, 40%, 40%, 0.3)";
    ctx.lineWidth = 1 * scale;
    ctx.strokeRect(startX - 10 * scale, startY - 15 * scale, termW, termH);

    // Terminal header dots
    const dotY = startY - 8 * scale;
    for (let i = 0; i < 3; i++) {
      ctx.fillStyle = ["hsla(0, 60%, 55%, 0.7)", "hsla(45, 60%, 55%, 0.7)", "hsla(140, 60%, 55%, 0.7)"][i];
      ctx.beginPath();
      ctx.arc(startX + i * 10 * scale, dotY, 2.5 * scale, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.font = `${fontSize}px monospace`;
    ctx.textAlign = "left";

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (!line.text) continue;
      const typeDelay = line.frame;
      const charsVisible = Math.floor(interpolate(frame, [typeDelay, typeDelay + line.text.length * 0.5], [0, line.text.length], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
      if (charsVisible <= 0) continue;

      const visibleText = line.text.substring(0, charsVisible);
      ctx.fillStyle = line.color;
      ctx.fillText(visibleText, startX, startY + i * lineHeight + 10 * scale);

      // Cursor blink at end of current typing line
      if (charsVisible < line.text.length && Math.floor(frame * 0.08) % 2 === 0) {
        const cursorX = startX + ctx.measureText(visibleText).width;
        ctx.fillStyle = PALETTE.accent.green;
        ctx.fillRect(cursorX + 1, startY + i * lineHeight, 6 * scale, fontSize + 2 * scale);
      }
    }

    // Final cursor blink
    if (frame > 100) {
      const lastLine = lines[lines.length - 1];
      const lastLineIdx = lines.length - 1;
      if (Math.floor(frame * 0.08) % 2 === 0) {
        const textW = ctx.measureText(lastLine.text).width;
        ctx.fillStyle = PALETTE.accent.green;
        ctx.fillRect(startX + textW + 2, startY + lastLineIdx * lineHeight, 6 * scale, fontSize + 2 * scale);
      }
    }

    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V5: React.FC<VariantProps> = ({ width, height }) => {
  // Split Panel: left = brain dots + counter, right = connection lines + counter
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(18, width, height, scale), [width, height, scale]);
  const data = useMemo(() => {
    const rand = seeded(30005);
    const leftNeurons: { x: number; y: number; hue: number; delay: number }[] = [];
    const leftCx = width * 0.25;
    const leftCy = height * 0.42;
    for (let i = 0; i < 80; i++) {
      const angle = rand() * Math.PI * 2;
      const dist = Math.pow(rand(), 0.5) * 40 * scale;
      leftNeurons.push({
        x: leftCx + Math.cos(angle) * dist * 1.3,
        y: leftCy + Math.sin(angle) * dist,
        hue: PALETTE.cellColors[Math.floor(rand() * 8)][0],
        delay: rand() * 50,
      });
    }
    const rightEdges: { x1: number; y1: number; x2: number; y2: number; hue: number; delay: number }[] = [];
    const rightCx = width * 0.75;
    const rightCy = height * 0.42;
    for (let i = 0; i < 60; i++) {
      const angle1 = rand() * Math.PI * 2;
      const dist1 = Math.pow(rand(), 0.5) * 40 * scale;
      const angle2 = rand() * Math.PI * 2;
      const dist2 = Math.pow(rand(), 0.5) * 40 * scale;
      rightEdges.push({
        x1: rightCx + Math.cos(angle1) * dist1 * 1.3,
        y1: rightCy + Math.sin(angle1) * dist1,
        x2: rightCx + Math.cos(angle2) * dist2 * 1.3,
        y2: rightCy + Math.sin(angle2) * dist2,
        hue: PALETTE.cellColors[Math.floor(rand() * 8)][0],
        delay: rand() * 60,
      });
    }
    return { leftNeurons, rightEdges };
  }, [width, height, scale]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, parts, frame, scale);
    const fadeAlpha = fadeInOut(frame, 120);
    ctx.globalAlpha = fadeAlpha;

    const neuronCountProgress = interpolate(frame, [8, 60], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const connCountProgress = interpolate(frame, [15, 80], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const neuronCount = Math.round(138639 * Math.min(1, neuronCountProgress));
    const connCount = Math.round(15091983 * Math.min(1, connCountProgress));

    // Divider
    ctx.strokeStyle = `hsla(220, 30%, 40%, 0.25)`;
    ctx.lineWidth = 1 * scale;
    ctx.setLineDash([4 * scale, 4 * scale]);
    ctx.beginPath();
    ctx.moveTo(width / 2, height * 0.1);
    ctx.lineTo(width / 2, height * 0.85);
    ctx.stroke();
    ctx.setLineDash([]);

    // Left panel: neuron dots appearing
    for (const n of data.leftNeurons) {
      const nodeAlpha = interpolate(frame - n.delay, [0, 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      if (nodeAlpha <= 0) continue;
      ctx.fillStyle = `hsla(${n.hue}, 55%, 60%, ${nodeAlpha * 0.7})`;
      ctx.beginPath();
      ctx.arc(n.x, n.y, 2.5 * scale, 0, Math.PI * 2);
      ctx.fill();
    }

    // Left counter
    ctx.fillStyle = PALETTE.text.accent;
    ctx.font = `bold ${18 * scale}px monospace`;
    ctx.textAlign = "center";
    ctx.fillText(neuronCount.toLocaleString(), width * 0.25, height * 0.78);
    ctx.fillStyle = PALETTE.text.dim;
    ctx.font = `${9 * scale}px system-ui`;
    ctx.fillText("neurons", width * 0.25, height * 0.84);

    // Right panel: connection lines appearing
    for (const edge of data.rightEdges) {
      const edgeAlpha = interpolate(frame - edge.delay, [0, 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      if (edgeAlpha <= 0) continue;
      ctx.strokeStyle = `hsla(${edge.hue}, 45%, 55%, ${edgeAlpha * 0.25})`;
      ctx.lineWidth = 0.8 * scale;
      ctx.beginPath();
      ctx.moveTo(edge.x1, edge.y1);
      ctx.lineTo(edge.x2, edge.y2);
      ctx.stroke();
      // Node dots at endpoints
      ctx.fillStyle = `hsla(${edge.hue}, 55%, 60%, ${edgeAlpha * 0.5})`;
      ctx.beginPath();
      ctx.arc(edge.x1, edge.y1, 1.5 * scale, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(edge.x2, edge.y2, 1.5 * scale, 0, Math.PI * 2);
      ctx.fill();
    }

    // Right counter
    ctx.fillStyle = PALETTE.text.accent;
    ctx.font = `bold ${18 * scale}px monospace`;
    ctx.textAlign = "center";
    ctx.fillText(connCount.toLocaleString(), width * 0.75, height * 0.78);
    ctx.fillStyle = PALETTE.text.dim;
    ctx.font = `${9 * scale}px system-ui`;
    ctx.fillText("connections", width * 0.75, height * 0.84);

    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V6: React.FC<VariantProps> = ({ width, height }) => {
  // Cascading Digits: digits fall from top, Matrix-style in gold, settle into position
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(15, width, height, scale), [width, height, scale]);
  const data = useMemo(() => {
    const rand = seeded(30006);
    const fallingDigits: { x: number; speed: number; char: string; hue: number; startFrame: number }[] = [];
    for (let i = 0; i < 120; i++) {
      fallingDigits.push({
        x: rand() * width,
        speed: 2 + rand() * 4,
        char: String(Math.floor(rand() * 10)),
        hue: 45 + rand() * 15,
        startFrame: Math.floor(rand() * 70),
      });
    }
    return { fallingDigits };
  }, [width, height, scale]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, parts, frame, scale);
    const fadeAlpha = fadeInOut(frame, 120);
    ctx.globalAlpha = fadeAlpha;

    const revealProgress1 = interpolate(frame, [35, 55], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const revealProgress2 = interpolate(frame, [60, 85], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

    // Falling digits (background decoration)
    ctx.font = `${8 * scale}px monospace`;
    ctx.textAlign = "center";
    for (const digit of data.fallingDigits) {
      if (frame < digit.startFrame) continue;
      const elapsed = frame - digit.startFrame;
      const digitY = elapsed * digit.speed * scale;
      if (digitY > height) continue;
      const digitAlpha = Math.max(0, 1 - digitY / height) * 0.3;
      ctx.fillStyle = `hsla(${digit.hue}, 60%, 60%, ${digitAlpha})`;
      ctx.fillText(digit.char, digit.x, digitY);
    }

    // First number reveal
    const topY = height * 0.35;
    if (revealProgress1 > 0) {
      ctx.globalAlpha = fadeAlpha * revealProgress1;
      // Background glow behind number
      const grad = ctx.createRadialGradient(width / 2, topY, 0, width / 2, topY, 80 * scale);
      grad.addColorStop(0, `hsla(45, 50%, 50%, ${revealProgress1 * 0.1})`);
      grad.addColorStop(1, "hsla(45, 50%, 50%, 0)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, topY - 30 * scale, width, 60 * scale);

      ctx.fillStyle = PALETTE.text.accent;
      ctx.font = `bold ${26 * scale}px monospace`;
      ctx.textAlign = "center";
      ctx.fillText("138,639", width / 2, topY + 8 * scale);
      ctx.fillStyle = PALETTE.text.dim;
      ctx.font = `${10 * scale}px system-ui`;
      ctx.fillText("neurons", width / 2, topY + 24 * scale);
      ctx.globalAlpha = fadeAlpha;
    }

    // Second number reveal
    const bottomY = height * 0.63;
    if (revealProgress2 > 0) {
      ctx.globalAlpha = fadeAlpha * revealProgress2;
      const grad2 = ctx.createRadialGradient(width / 2, bottomY, 0, width / 2, bottomY, 100 * scale);
      grad2.addColorStop(0, `hsla(45, 50%, 50%, ${revealProgress2 * 0.1})`);
      grad2.addColorStop(1, "hsla(45, 50%, 50%, 0)");
      ctx.fillStyle = grad2;
      ctx.fillRect(0, bottomY - 30 * scale, width, 60 * scale);

      ctx.fillStyle = PALETTE.text.accent;
      ctx.font = `bold ${26 * scale}px monospace`;
      ctx.textAlign = "center";
      ctx.fillText("15,091,983", width / 2, bottomY + 8 * scale);
      ctx.fillStyle = PALETTE.text.dim;
      ctx.font = `${10 * scale}px system-ui`;
      ctx.fillText("connections", width / 2, bottomY + 24 * scale);
      ctx.globalAlpha = fadeAlpha;
    }

    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V7: React.FC<VariantProps> = ({ width, height }) => {
  // Growing Bars: two horizontal bars, bottom one extends WAY wider to show ratio
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

    const bar1Progress = interpolate(frame, [10, 45], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const bar2Progress = interpolate(frame, [35, 85], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const labelFade1 = interpolate(frame, [40, 50], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const labelFade2 = interpolate(frame, [75, 90], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

    const barStartX = width * 0.12;
    const barHeight = 20 * scale;
    const topBarY = height * 0.33;
    const bottomBarY = height * 0.55;

    // Neuron bar (proportionally narrow)
    const neuronBarWidth = width * 0.25 * bar1Progress;
    const neuronGrad = ctx.createLinearGradient(barStartX, topBarY, barStartX + neuronBarWidth, topBarY);
    neuronGrad.addColorStop(0, "hsla(280, 50%, 55%, 0.7)");
    neuronGrad.addColorStop(1, "hsla(280, 45%, 45%, 0.5)");
    ctx.fillStyle = neuronGrad;
    ctx.fillRect(barStartX, topBarY, neuronBarWidth, barHeight);
    ctx.strokeStyle = "hsla(280, 50%, 60%, 0.4)";
    ctx.lineWidth = 1 * scale;
    ctx.strokeRect(barStartX, topBarY, neuronBarWidth, barHeight);

    // Neuron label
    if (labelFade1 > 0) {
      ctx.globalAlpha = fadeAlpha * labelFade1;
      ctx.fillStyle = PALETTE.text.dim;
      ctx.font = `${9 * scale}px system-ui`;
      ctx.textAlign = "left";
      ctx.fillText("neurons", barStartX, topBarY - 6 * scale);
      ctx.fillStyle = PALETTE.text.accent;
      ctx.font = `bold ${14 * scale}px monospace`;
      ctx.fillText("138,639", barStartX + neuronBarWidth + 8 * scale, topBarY + barHeight * 0.7);
      ctx.globalAlpha = fadeAlpha;
    }

    // Connection bar (extends beyond screen to show scale)
    const connBarMaxWidth = width * 1.2;
    const connBarWidth = connBarMaxWidth * bar2Progress;
    const connGrad = ctx.createLinearGradient(barStartX, bottomBarY, barStartX + Math.min(connBarWidth, width * 0.85), bottomBarY);
    connGrad.addColorStop(0, "hsla(45, 65%, 55%, 0.7)");
    connGrad.addColorStop(1, "hsla(45, 60%, 45%, 0.5)");
    ctx.fillStyle = connGrad;
    ctx.fillRect(barStartX, bottomBarY, Math.min(connBarWidth, width - barStartX), barHeight);

    // Fade-out edge if bar extends beyond screen
    if (connBarWidth > width * 0.7) {
      const fadeGrad = ctx.createLinearGradient(width * 0.8, bottomBarY, width, bottomBarY);
      fadeGrad.addColorStop(0, "transparent");
      fadeGrad.addColorStop(1, PALETTE.bg.edge);
      ctx.fillStyle = fadeGrad;
      ctx.fillRect(width * 0.8, bottomBarY - 2, width * 0.2, barHeight + 4);
    }

    // Arrow indicating off-screen
    if (bar2Progress > 0.6) {
      const arrowAlpha = (bar2Progress - 0.6) * 2.5;
      ctx.fillStyle = `hsla(45, 60%, 60%, ${arrowAlpha * 0.6})`;
      const arrowX = width - 15 * scale;
      const arrowY = bottomBarY + barHeight / 2;
      ctx.beginPath();
      ctx.moveTo(arrowX, arrowY - 6 * scale);
      ctx.lineTo(arrowX + 8 * scale, arrowY);
      ctx.lineTo(arrowX, arrowY + 6 * scale);
      ctx.closePath();
      ctx.fill();
    }

    // Connection label
    if (labelFade2 > 0) {
      ctx.globalAlpha = fadeAlpha * labelFade2;
      ctx.fillStyle = PALETTE.text.dim;
      ctx.font = `${9 * scale}px system-ui`;
      ctx.textAlign = "left";
      ctx.fillText("connections", barStartX, bottomBarY - 6 * scale);
      ctx.fillStyle = PALETTE.text.accent;
      ctx.font = `bold ${14 * scale}px monospace`;
      ctx.fillText("15,091,983", barStartX + 10 * scale, bottomBarY + barHeight + 18 * scale);
      // Ratio annotation
      ctx.fillStyle = PALETTE.text.dim;
      ctx.font = `${8 * scale}px monospace`;
      ctx.fillText("109x more", barStartX + 120 * scale, bottomBarY + barHeight + 18 * scale);
      ctx.globalAlpha = fadeAlpha;
    }

    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V8: React.FC<VariantProps> = ({ width, height }) => {
  // Scientific Notation to Full: 1.38x10^5 unfolds to 138,639, same for connections
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

    const topY = height * 0.32;
    const bottomY = height * 0.62;

    // First number transition
    const sciShow1 = interpolate(frame, [5, 18], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const transition1 = interpolate(frame, [25, 45], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

    if (sciShow1 > 0) {
      ctx.textAlign = "center";
      if (transition1 < 1) {
        // Scientific notation
        ctx.globalAlpha = fadeAlpha * sciShow1 * (1 - transition1);
        ctx.fillStyle = PALETTE.text.primary;
        ctx.font = `${22 * scale}px monospace`;
        ctx.fillText("1.38", width / 2 - 25 * scale, topY);
        ctx.font = `${14 * scale}px monospace`;
        ctx.fillText("\u00D7 10", width / 2 + 18 * scale, topY);
        ctx.font = `${12 * scale}px monospace`;
        ctx.fillText("5", width / 2 + 42 * scale, topY - 10 * scale);
        ctx.globalAlpha = fadeAlpha;
      }
      if (transition1 > 0) {
        // Full number
        ctx.globalAlpha = fadeAlpha * transition1;
        ctx.fillStyle = PALETTE.text.accent;
        ctx.font = `bold ${28 * scale}px monospace`;
        ctx.fillText("138,639", width / 2, topY);
        ctx.fillStyle = PALETTE.text.dim;
        ctx.font = `${10 * scale}px system-ui`;
        ctx.fillText("neurons", width / 2, topY + 18 * scale);
        ctx.globalAlpha = fadeAlpha;
      }
    }

    // Second number transition
    const sciShow2 = interpolate(frame, [45, 58], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const transition2 = interpolate(frame, [65, 85], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

    if (sciShow2 > 0) {
      ctx.textAlign = "center";
      if (transition2 < 1) {
        ctx.globalAlpha = fadeAlpha * sciShow2 * (1 - transition2);
        ctx.fillStyle = PALETTE.text.primary;
        ctx.font = `${22 * scale}px monospace`;
        ctx.fillText("1.50", width / 2 - 25 * scale, bottomY);
        ctx.font = `${14 * scale}px monospace`;
        ctx.fillText("\u00D7 10", width / 2 + 18 * scale, bottomY);
        ctx.font = `${12 * scale}px monospace`;
        ctx.fillText("7", width / 2 + 42 * scale, bottomY - 10 * scale);
        ctx.globalAlpha = fadeAlpha;
      }
      if (transition2 > 0) {
        ctx.globalAlpha = fadeAlpha * transition2;
        ctx.fillStyle = PALETTE.text.accent;
        ctx.font = `bold ${28 * scale}px monospace`;
        ctx.fillText("15,091,983", width / 2, bottomY);
        ctx.fillStyle = PALETTE.text.dim;
        ctx.font = `${10 * scale}px system-ui`;
        ctx.fillText("connections", width / 2, bottomY + 18 * scale);
        ctx.globalAlpha = fadeAlpha;
      }
    }

    // Separator
    const sepAlpha = interpolate(frame, [42, 50], [0, 0.3], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (sepAlpha > 0) {
      ctx.strokeStyle = `hsla(220, 30%, 45%, ${sepAlpha})`;
      ctx.lineWidth = 1 * scale;
      ctx.beginPath();
      ctx.moveTo(width * 0.3, height * 0.47);
      ctx.lineTo(width * 0.7, height * 0.47);
      ctx.stroke();
    }

    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V9: React.FC<VariantProps> = ({ width, height }) => {
  // Typewriter Impact: characters type out one by one, flash at completion
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

    const text1 = "138,639";
    const text2 = "15,091,983";
    const topY = height * 0.34;
    const bottomY = height * 0.62;
    const charSpeed1 = 4;
    const charSpeed2 = 2.5;
    const startFrame1 = 8;
    const startFrame2 = 55;

    // First number typing
    const chars1 = Math.floor(interpolate(frame, [startFrame1, startFrame1 + text1.length * charSpeed1], [0, text1.length], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
    const visible1 = text1.substring(0, chars1);
    const complete1 = chars1 >= text1.length;

    // Flash when first number completes
    const flash1Frame = startFrame1 + text1.length * charSpeed1;
    const flash1 = interpolate(frame, [flash1Frame, flash1Frame + 8], [0.4, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (flash1 > 0) {
      ctx.fillStyle = `hsla(45, 80%, 80%, ${flash1})`;
      ctx.fillRect(0, topY - 25 * scale, width, 50 * scale);
    }

    if (chars1 > 0) {
      ctx.fillStyle = PALETTE.text.accent;
      ctx.font = `bold ${28 * scale}px monospace`;
      ctx.textAlign = "center";
      ctx.fillText(visible1, width / 2, topY + 8 * scale);

      // Cursor
      if (!complete1 && Math.floor(frame * 0.1) % 2 === 0) {
        const textW = ctx.measureText(visible1).width;
        ctx.fillStyle = PALETTE.text.accent;
        ctx.fillRect(width / 2 + textW / 2 + 2, topY - 14 * scale, 3 * scale, 28 * scale);
      }
    }

    // "neurons" label after completion
    if (complete1) {
      const labelAlpha = interpolate(frame, [flash1Frame, flash1Frame + 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      ctx.globalAlpha = fadeAlpha * labelAlpha;
      ctx.fillStyle = PALETTE.text.dim;
      ctx.font = `${10 * scale}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText("neurons", width / 2, topY + 26 * scale);
      ctx.globalAlpha = fadeAlpha;
    }

    // Second number typing (faster)
    const chars2 = Math.floor(interpolate(frame, [startFrame2, startFrame2 + text2.length * charSpeed2], [0, text2.length], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
    const visible2 = text2.substring(0, chars2);
    const complete2 = chars2 >= text2.length;

    // Flash when second completes
    const flash2Frame = startFrame2 + text2.length * charSpeed2;
    const flash2 = interpolate(frame, [flash2Frame, flash2Frame + 8], [0.5, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (flash2 > 0) {
      ctx.fillStyle = `hsla(45, 80%, 80%, ${flash2})`;
      ctx.fillRect(0, bottomY - 25 * scale, width, 50 * scale);
    }

    if (chars2 > 0) {
      ctx.fillStyle = PALETTE.text.accent;
      ctx.font = `bold ${28 * scale}px monospace`;
      ctx.textAlign = "center";
      ctx.fillText(visible2, width / 2, bottomY + 8 * scale);

      // Cursor
      if (!complete2 && Math.floor(frame * 0.1) % 2 === 0) {
        const textW = ctx.measureText(visible2).width;
        ctx.fillStyle = PALETTE.text.accent;
        ctx.fillRect(width / 2 + textW / 2 + 2, bottomY - 14 * scale, 3 * scale, 28 * scale);
      }
    }

    // "connections" label after completion
    if (complete2) {
      const labelAlpha = interpolate(frame, [flash2Frame, flash2Frame + 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      ctx.globalAlpha = fadeAlpha * labelAlpha;
      ctx.fillStyle = PALETTE.text.dim;
      ctx.font = `${10 * scale}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText("connections", width / 2, bottomY + 26 * scale);
      ctx.globalAlpha = fadeAlpha;
    }

    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

export const VARIANTS_SHOT_030: VariantDef[] = [
  { id: "dual-odometer", label: "Dual Odometer", component: V1 },
  { id: "dramatic-slam", label: "Dramatic Slam", component: V2 },
  { id: "digit-by-digit", label: "Digit by Digit", component: V3 },
  { id: "terminal-output", label: "Terminal Output", component: V4 },
  { id: "split-panel", label: "Split Panel", component: V5 },
  { id: "cascading-digits", label: "Cascading Digits", component: V6 },
  { id: "growing-bars", label: "Growing Bars", component: V7 },
  { id: "sci-notation", label: "Scientific Notation", component: V8 },
  { id: "typewriter-impact", label: "Typewriter Impact", component: V9 },
];
