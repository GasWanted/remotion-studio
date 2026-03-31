import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantDef, VariantProps } from "../types";
import { seeded, drawBg, makeParticles, drawParticles, PALETTE, fadeInOut } from "../scenes/theme";
import { drawX, drawNeuron } from "../icons";

// Shot 50 — "Nobody programmed 'if sugar, then eat.' Nobody wrote that rule. The wiring itself produces the behavior."
// 120 frames (4s). Code "if(sugar){eat()}" crossed out with X.

const V1: React.FC<VariantProps> = ({ width, height }) => {
  // Code text `if(sugar) { eat(); }` appears, then gets a big red X through it
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(8, width, height, s), [width, height, s]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, parts, frame, s);
    const a = fadeInOut(frame, 120);
    ctx.globalAlpha = a;

    const cx = width / 2, cy = height * 0.42;

    // Code text typing in
    const codeText = "if(sugar) { eat(); }";
    const charsVisible = Math.floor(interpolate(frame, [5, 40], [0, codeText.length], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
    const visible = codeText.substring(0, charsVisible);

    ctx.fillStyle = `hsla(140, 60%, 60%, 0.8)`;
    ctx.font = `${12 * s}px monospace`;
    ctx.textAlign = "center";
    ctx.fillText(visible, cx, cy);

    // Big red X
    const xFade = interpolate(frame, [50, 70], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (xFade > 0) {
      ctx.globalAlpha = a * xFade;
      drawX(ctx, cx, cy, 60 * s, PALETTE.accent.red);
      // Code dims behind X
      ctx.globalAlpha = a * (1 - xFade * 0.6);
      ctx.fillStyle = `hsla(140, 40%, 45%, 0.4)`;
      ctx.fillText(codeText, cx, cy);
      ctx.globalAlpha = a;
    }

    // Bottom text
    const bottomFade = interpolate(frame, [75, 95], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (bottomFade > 0) {
      ctx.globalAlpha = a * bottomFade;
      ctx.fillStyle = PALETTE.text.dim;
      ctx.font = `${9 * s}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText("nobody wrote this rule", cx, height * 0.78);
    }

    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V2: React.FC<VariantProps> = ({ width, height }) => {
  // Programmer icon with a "NO" sign, then wiring diagram with a checkmark
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(8, width, height, s), [width, height, s]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, parts, frame, s);
    const a = fadeInOut(frame, 120);
    ctx.globalAlpha = a;

    const cy = height * 0.42;

    // Left: "code" text with NO circle
    const leftFade = interpolate(frame, [5, 25], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = a * leftFade;
    ctx.fillStyle = `hsla(140, 50%, 55%, 0.6)`;
    ctx.font = `${10 * s}px monospace`;
    ctx.textAlign = "center";
    ctx.fillText("{ code }", width * 0.28, cy);

    // NO circle
    const noFade = interpolate(frame, [25, 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (noFade > 0) {
      ctx.globalAlpha = a * noFade;
      ctx.strokeStyle = PALETTE.accent.red;
      ctx.lineWidth = 3 * s;
      ctx.beginPath();
      ctx.arc(width * 0.28, cy, 25 * s, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(width * 0.28 - 18 * s, cy + 15 * s);
      ctx.lineTo(width * 0.28 + 18 * s, cy - 15 * s);
      ctx.stroke();
    }

    // VS
    const vsFade = interpolate(frame, [35, 45], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (vsFade > 0) {
      ctx.globalAlpha = a * vsFade;
      ctx.fillStyle = PALETTE.text.dim;
      ctx.font = `${10 * s}px system-ui`;
      ctx.fillText("vs", width * 0.5, cy + 4 * s);
    }

    // Right: wiring + checkmark
    const rightFade = interpolate(frame, [45, 65], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (rightFade > 0) {
      ctx.globalAlpha = a * rightFade;
      // Small wiring diagram
      const wx = width * 0.72, wy = cy;
      const rand = seeded(50002);
      for (let i = 0; i < 8; i++) {
        const nx = wx + (rand() - 0.5) * 40 * s;
        const ny = wy + (rand() - 0.5) * 30 * s;
        ctx.fillStyle = `hsla(45, 60%, 55%, 0.5)`;
        ctx.beginPath();
        ctx.arc(nx, ny, 2.5 * s, 0, Math.PI * 2);
        ctx.fill();
        if (i > 0) {
          ctx.strokeStyle = `hsla(45, 40%, 50%, 0.3)`;
          ctx.lineWidth = 0.8 * s;
          ctx.beginPath();
          ctx.moveTo(nx, ny);
          const px = wx + (rand() - 0.5) * 40 * s;
          const py = wy + (rand() - 0.5) * 30 * s;
          ctx.lineTo(px, py);
          ctx.stroke();
        }
      }
      // Checkmark
      const checkFade = interpolate(frame, [70, 85], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      if (checkFade > 0) {
        ctx.globalAlpha = a * checkFade;
        ctx.strokeStyle = PALETTE.accent.green;
        ctx.lineWidth = 3 * s;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.beginPath();
        ctx.moveTo(wx - 10 * s, wy + 18 * s);
        ctx.lineTo(wx - 3 * s, wy + 25 * s);
        ctx.lineTo(wx + 12 * s, wy + 12 * s);
        ctx.stroke();
      }
    }

    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V3: React.FC<VariantProps> = ({ width, height }) => {
  // Code fading away, replaced by connection diagram
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(10, width, height, s), [width, height, s]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, parts, frame, s);
    const a = fadeInOut(frame, 120);
    ctx.globalAlpha = a;

    const cx = width / 2, cy = height * 0.45;

    // Code fading out
    const codeFade = interpolate(frame, [5, 25, 45, 65], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (codeFade > 0) {
      ctx.globalAlpha = a * codeFade;
      ctx.fillStyle = `hsla(140, 55%, 55%, ${codeFade * 0.7})`;
      ctx.font = `${10 * s}px monospace`;
      ctx.textAlign = "center";
      ctx.fillText("if(sugar) {", cx, cy - 10 * s);
      ctx.fillText("  eat();", cx, cy + 5 * s);
      ctx.fillText("}", cx, cy + 20 * s);
    }

    // Connection diagram fading in
    const wireFade = interpolate(frame, [55, 80], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (wireFade > 0) {
      ctx.globalAlpha = a * wireFade;
      const rand = seeded(50003);
      const nodes: { x: number; y: number }[] = [];
      for (let i = 0; i < 15; i++) {
        const nx = cx + (rand() - 0.5) * 120 * s;
        const ny = cy + (rand() - 0.5) * 80 * s;
        nodes.push({ x: nx, y: ny });
        ctx.fillStyle = `hsla(45, 60%, 60%, ${wireFade * 0.7})`;
        ctx.beginPath();
        ctx.arc(nx, ny, 3 * s, 0, Math.PI * 2);
        ctx.fill();
      }
      // Connections
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          if (Math.sqrt(dx * dx + dy * dy) < 50 * s && rand() < 0.4) {
            ctx.strokeStyle = `hsla(45, 50%, 55%, ${wireFade * 0.3})`;
            ctx.lineWidth = 1 * s;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }
    }

    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V4: React.FC<VariantProps> = ({ width, height }) => {
  // Split: LEFT = code (crossed out), RIGHT = neural wiring (glowing)
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(8, width, height, s), [width, height, s]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, parts, frame, s);
    const a = fadeInOut(frame, 120);
    ctx.globalAlpha = a;

    // Dividing line
    ctx.strokeStyle = `hsla(220, 20%, 40%, 0.3)`;
    ctx.lineWidth = 1 * s;
    ctx.setLineDash([3 * s, 4 * s]);
    ctx.beginPath();
    ctx.moveTo(width / 2, height * 0.1);
    ctx.lineTo(width / 2, height * 0.9);
    ctx.stroke();
    ctx.setLineDash([]);

    // Left: code crossed out
    const leftFade = interpolate(frame, [5, 25], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = a * leftFade;
    ctx.fillStyle = `hsla(140, 50%, 50%, 0.5)`;
    ctx.font = `${8 * s}px monospace`;
    ctx.textAlign = "center";
    ctx.fillText("if(sugar){", width * 0.25, height * 0.38);
    ctx.fillText("  eat();", width * 0.25, height * 0.48);
    ctx.fillText("}", width * 0.25, height * 0.56);

    const xAppear = interpolate(frame, [30, 45], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (xAppear > 0) {
      ctx.globalAlpha = a * xAppear;
      drawX(ctx, width * 0.25, height * 0.45, 50 * s, PALETTE.accent.red);
    }

    // Right: neural wiring glowing
    const rightFade = interpolate(frame, [40, 65], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (rightFade > 0) {
      ctx.globalAlpha = a * rightFade;
      const rand = seeded(50004);
      for (let i = 0; i < 12; i++) {
        const nx = width * 0.62 + rand() * width * 0.26;
        const ny = height * 0.25 + rand() * height * 0.5;
        ctx.fillStyle = `hsla(45, 60%, 60%, ${rightFade * 0.6})`;
        ctx.beginPath();
        ctx.arc(nx, ny, 3 * s, 0, Math.PI * 2);
        ctx.fill();
        if (i > 0) {
          ctx.strokeStyle = `hsla(45, 45%, 55%, ${rightFade * 0.25})`;
          ctx.lineWidth = 1 * s;
          ctx.beginPath();
          ctx.moveTo(nx, ny);
          ctx.lineTo(width * 0.62 + rand() * width * 0.26, height * 0.25 + rand() * height * 0.5);
          ctx.stroke();
        }
      }
      // Glow effect
      const glowGrad = ctx.createRadialGradient(width * 0.75, height * 0.45, 0, width * 0.75, height * 0.45, 60 * s);
      glowGrad.addColorStop(0, `hsla(45, 60%, 55%, ${rightFade * 0.12})`);
      glowGrad.addColorStop(1, `hsla(45, 60%, 55%, 0)`);
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(width * 0.75, height * 0.45, 60 * s, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V5: React.FC<VariantProps> = ({ width, height }) => {
  // Text "nobody wrote this rule" with crossed-out code below and network above
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(6, width, height, s), [width, height, s]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, parts, frame, s);
    const a = fadeInOut(frame, 120);
    ctx.globalAlpha = a;

    const cx = width / 2;

    // Network above (small)
    const netFade = interpolate(frame, [5, 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (netFade > 0) {
      ctx.globalAlpha = a * netFade;
      const rand = seeded(50005);
      for (let i = 0; i < 10; i++) {
        const nx = cx + (rand() - 0.5) * 80 * s;
        const ny = height * 0.18 + rand() * 25 * s;
        ctx.fillStyle = `hsla(45, 55%, 58%, ${netFade * 0.5})`;
        ctx.beginPath();
        ctx.arc(nx, ny, 2 * s, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Main text
    const textFade = interpolate(frame, [25, 45], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = a * textFade;
    ctx.fillStyle = PALETTE.text.primary;
    ctx.font = `${12 * s}px system-ui`;
    ctx.textAlign = "center";
    ctx.fillText("nobody wrote this rule", cx, height * 0.42);

    // Crossed-out code below
    const codeFade = interpolate(frame, [40, 55], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (codeFade > 0) {
      ctx.globalAlpha = a * codeFade * 0.5;
      ctx.fillStyle = `hsla(140, 40%, 45%, 0.5)`;
      ctx.font = `${9 * s}px monospace`;
      ctx.fillText("if(sugar) { eat(); }", cx, height * 0.62);
      // Strikethrough
      ctx.strokeStyle = PALETTE.accent.red;
      ctx.lineWidth = 2 * s;
      const tw = ctx.measureText("if(sugar) { eat(); }").width;
      ctx.beginPath();
      ctx.moveTo(cx - tw / 2, height * 0.62);
      ctx.lineTo(cx + tw / 2, height * 0.62);
      ctx.stroke();
    }

    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V6: React.FC<VariantProps> = ({ width, height }) => {
  // Terminal showing code being deleted, wiring diagram appearing instead
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(8, width, height, s), [width, height, s]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, parts, frame, s);
    const a = fadeInOut(frame, 120);
    ctx.globalAlpha = a;

    // Terminal background
    const termX = width * 0.08, termY = height * 0.12;
    const termW = width * 0.84, termH = height * 0.7;
    ctx.fillStyle = "rgba(0,0,0,0.35)";
    ctx.fillRect(termX, termY, termW, termH);
    ctx.strokeStyle = "hsla(140, 40%, 40%, 0.25)";
    ctx.lineWidth = 1 * s;
    ctx.strokeRect(termX, termY, termW, termH);

    const fontSize = 8 * s;
    ctx.font = `${fontSize}px monospace`;
    ctx.textAlign = "left";
    const lh = 13 * s;

    // Code appearing then being deleted
    const codeLines = [
      "if (sugar) {",
      "  return eat();",
      "}",
    ];

    const deleteStart = 45;
    const deleteProg = interpolate(frame, [deleteStart, deleteStart + 25], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

    for (let i = 0; i < codeLines.length; i++) {
      const typeProg = interpolate(frame, [8 + i * 10, 18 + i * 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const fullLine = codeLines[i];
      const charsToShow = Math.floor(typeProg * fullLine.length);
      const charsToDelete = Math.floor(deleteProg * fullLine.length);
      const visible = fullLine.substring(charsToDelete, Math.max(charsToDelete, charsToShow));

      if (deleteProg > 0) {
        ctx.fillStyle = `hsla(0, 60%, 55%, 0.5)`;
      } else {
        ctx.fillStyle = `hsla(140, 55%, 60%, 0.8)`;
      }
      ctx.fillText(visible, termX + 10 * s, termY + 18 * s + i * lh);
    }

    // Wiring appears after delete
    const wireFade = interpolate(frame, [75, 100], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (wireFade > 0) {
      ctx.globalAlpha = a * wireFade;
      const rand = seeded(50006);
      for (let i = 0; i < 10; i++) {
        const nx = termX + 20 * s + rand() * (termW - 40 * s);
        const ny = termY + 15 * s + rand() * (termH - 30 * s);
        ctx.fillStyle = `hsla(45, 60%, 55%, ${wireFade * 0.6})`;
        ctx.beginPath();
        ctx.arc(nx, ny, 2.5 * s, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = `hsla(45, 50%, 55%, ${wireFade * 0.7})`;
      ctx.font = `${fontSize}px monospace`;
      ctx.fillText("// wiring speaks", termX + 10 * s, termY + 18 * s);
    }

    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V7: React.FC<VariantProps> = ({ width, height }) => {
  // "if/then" logic box getting X'd, "emergent" label appearing on neural network
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(8, width, height, s), [width, height, s]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, parts, frame, s);
    const a = fadeInOut(frame, 120);
    ctx.globalAlpha = a;

    const cy = height * 0.4;

    // Logic box on left
    const boxFade = interpolate(frame, [5, 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = a * boxFade;
    const boxX = width * 0.18, boxW = 55 * s, boxH = 35 * s;
    ctx.strokeStyle = `hsla(140, 40%, 50%, 0.5)`;
    ctx.lineWidth = 1.5 * s;
    ctx.strokeRect(boxX - boxW / 2, cy - boxH / 2, boxW, boxH);
    ctx.fillStyle = `hsla(140, 50%, 55%, 0.6)`;
    ctx.font = `${9 * s}px monospace`;
    ctx.textAlign = "center";
    ctx.fillText("if/then", boxX, cy + 3 * s);

    // X over box
    const xFade = interpolate(frame, [25, 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (xFade > 0) {
      ctx.globalAlpha = a * xFade;
      drawX(ctx, boxX, cy, 40 * s, PALETTE.accent.red);
    }

    // Neural network on right
    const netFade = interpolate(frame, [45, 70], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (netFade > 0) {
      ctx.globalAlpha = a * netFade;
      const ncx = width * 0.7, ncy = cy;
      drawNeuron(ctx, ncx - 15 * s, ncy - 10 * s, 18 * s, `hsla(45, 60%, 55%, ${netFade * 0.7})`, frame);
      drawNeuron(ctx, ncx + 15 * s, ncy + 8 * s, 18 * s, `hsla(25, 65%, 55%, ${netFade * 0.7})`, frame);
      // Connection
      ctx.strokeStyle = `hsla(45, 50%, 55%, ${netFade * 0.4})`;
      ctx.lineWidth = 1 * s;
      ctx.beginPath();
      ctx.moveTo(ncx - 15 * s + 18 * s * 0.9, ncy - 10 * s);
      ctx.lineTo(ncx + 15 * s, ncy + 8 * s);
      ctx.stroke();

      // "emergent" label
      const labelFade = interpolate(frame, [75, 95], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      if (labelFade > 0) {
        ctx.globalAlpha = a * labelFade;
        ctx.fillStyle = PALETTE.text.accent;
        ctx.font = `italic ${10 * s}px system-ui`;
        ctx.textAlign = "center";
        ctx.fillText("emergent", ncx, ncy + 35 * s);
      }
    }

    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V8: React.FC<VariantProps> = ({ width, height }) => {
  // Hand writing code -> hand erasing code -> wiring speaks for itself
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(6, width, height, s), [width, height, s]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, parts, frame, s);
    const a = fadeInOut(frame, 120);
    ctx.globalAlpha = a;

    const cx = width / 2, cy = height * 0.42;

    // Phase 1: code typing (0-35)
    const typePhase = interpolate(frame, [0, 35], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    // Phase 2: erasing (35-60)
    const erasePhase = interpolate(frame, [35, 60], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    // Phase 3: wiring (60-100)
    const wireProg = interpolate(frame, [60, 100], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

    const codeText = "if(sugar){eat()}";
    if (erasePhase < 1) {
      const charsShown = Math.floor(typePhase * codeText.length);
      const charsErased = Math.floor(erasePhase * charsShown);
      const visible = codeText.substring(charsErased, charsShown);

      ctx.fillStyle = erasePhase > 0
        ? `hsla(0, 50%, 50%, ${0.6 - erasePhase * 0.4})`
        : `hsla(140, 55%, 55%, 0.7)`;
      ctx.font = `${11 * s}px monospace`;
      ctx.textAlign = "center";
      ctx.fillText(visible, cx, cy);

      // Cursor line
      if (typePhase < 1 || erasePhase > 0) {
        const blink = Math.floor(frame * 0.08) % 2 === 0;
        if (blink) {
          ctx.fillStyle = PALETTE.text.primary;
          ctx.fillRect(cx + ctx.measureText(visible).width / 2 + 2, cy - 10 * s, 2 * s, 14 * s);
        }
      }
    }

    // Wiring replaces code
    if (wireProg > 0) {
      ctx.globalAlpha = a * wireProg;
      const rand = seeded(50008);
      for (let i = 0; i < 12; i++) {
        const nx = cx + (rand() - 0.5) * 100 * s;
        const ny = cy + (rand() - 0.5) * 50 * s;
        ctx.fillStyle = `hsla(45, 60%, 58%, ${wireProg * 0.6})`;
        ctx.beginPath();
        ctx.arc(nx, ny, 2.5 * s, 0, Math.PI * 2);
        ctx.fill();
      }

      // Label
      if (wireProg > 0.5) {
        ctx.fillStyle = PALETTE.text.dim;
        ctx.font = `italic ${9 * s}px system-ui`;
        ctx.textAlign = "center";
        ctx.fillText("the wiring itself", cx, height * 0.72);
      }
    }

    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V9: React.FC<VariantProps> = ({ width, height }) => {
  // Big centered text "NO CODE" with subtle network pattern behind
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(10, width, height, s), [width, height, s]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, parts, frame, s);
    const a = fadeInOut(frame, 120);
    ctx.globalAlpha = a;

    const cx = width / 2, cy = height / 2;

    // Subtle network pattern
    const netFade = interpolate(frame, [5, 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const rand = seeded(50009);
    for (let i = 0; i < 30; i++) {
      const nx = rand() * width;
      const ny = rand() * height;
      ctx.fillStyle = `hsla(45, 40%, 45%, ${netFade * 0.12})`;
      ctx.beginPath();
      ctx.arc(nx, ny, 1.5 * s, 0, Math.PI * 2);
      ctx.fill();
      if (i > 0 && rand() < 0.3) {
        ctx.strokeStyle = `hsla(45, 30%, 40%, ${netFade * 0.06})`;
        ctx.lineWidth = 0.5 * s;
        ctx.beginPath();
        ctx.moveTo(nx, ny);
        ctx.lineTo(rand() * width, rand() * height);
        ctx.stroke();
      }
    }

    // "NO CODE" text
    const textFade = interpolate(frame, [20, 45], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (textFade > 0) {
      ctx.globalAlpha = a * textFade;
      ctx.fillStyle = PALETTE.text.primary;
      ctx.font = `bold ${36 * s}px system-ui`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("NO CODE", cx, cy);
      ctx.textBaseline = "alphabetic";
    }

    // Subtle underline
    const ulFade = interpolate(frame, [45, 60], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (ulFade > 0) {
      ctx.globalAlpha = a * ulFade;
      const tw = 36 * s * 4.5; // approximate text width
      ctx.strokeStyle = PALETTE.accent.gold;
      ctx.lineWidth = 2 * s;
      ctx.beginPath();
      ctx.moveTo(cx - tw / 2 * ulFade, cy + 22 * s);
      ctx.lineTo(cx + tw / 2 * ulFade, cy + 22 * s);
      ctx.stroke();
    }

    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

export const VARIANTS_SHOT_050: VariantDef[] = [
  { id: "code-red-x", label: "Code + Red X", component: V1 },
  { id: "no-sign-vs-wiring", label: "NO Sign vs Wiring", component: V2 },
  { id: "code-fades-wiring", label: "Code Fades to Wiring", component: V3 },
  { id: "split-code-network", label: "Split Code vs Network", component: V4 },
  { id: "nobody-wrote-rule", label: "Nobody Wrote This Rule", component: V5 },
  { id: "terminal-delete", label: "Terminal Delete", component: V6 },
  { id: "if-then-emergent", label: "If/Then -> Emergent", component: V7 },
  { id: "type-erase-wiring", label: "Type -> Erase -> Wire", component: V8 },
  { id: "no-code-big-text", label: "NO CODE Big Text", component: V9 },
];
