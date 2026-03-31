import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantDef, VariantProps } from "../types";
import { seeded, drawBg, makeParticles, drawParticles, PALETTE, fadeInOut } from "../scenes/theme";
import { drawResinBlock } from "../icons";

// Shot 15 — "and hardened it in resin."
// 120 frames (4s). Brain gets encased in an amber/gold resin block.

const V1: React.FC<VariantProps> = ({ width, height }) => {
  // Resin Pour: resin fills up from bottom around grey brain, block outline hardens
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

    const brainAppear = interpolate(frame, [3, 15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const fillLevel = interpolate(frame, [18, 65], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const hardenProgress = interpolate(frame, [65, 95], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const labelFade = interpolate(frame, [70, 85], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

    const cx = width / 2;
    const cy = height * 0.47;
    const blockW = 70 * scale;
    const blockH = 85 * scale;
    const depth = 12 * scale;

    // Block outline (becomes more solid as resin hardens)
    const outlineAlpha = 0.2 + hardenProgress * 0.6;
    ctx.strokeStyle = `hsla(40, 60%, 55%, ${outlineAlpha})`;
    ctx.lineWidth = (1 + hardenProgress * 1.5) * scale;
    ctx.strokeRect(cx - blockW / 2, cy - blockH / 2, blockW, blockH);

    // 3D depth lines
    if (hardenProgress > 0.3) {
      const depthAlpha = (hardenProgress - 0.3) * 0.6;
      ctx.strokeStyle = `hsla(40, 50%, 50%, ${depthAlpha})`;
      ctx.lineWidth = 1 * scale;
      ctx.beginPath();
      ctx.moveTo(cx - blockW / 2, cy - blockH / 2);
      ctx.lineTo(cx - blockW / 2 + depth, cy - blockH / 2 - depth * 0.6);
      ctx.lineTo(cx + blockW / 2 + depth, cy - blockH / 2 - depth * 0.6);
      ctx.lineTo(cx + blockW / 2, cy - blockH / 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx + blockW / 2, cy - blockH / 2);
      ctx.lineTo(cx + blockW / 2 + depth, cy - blockH / 2 - depth * 0.6);
      ctx.lineTo(cx + blockW / 2 + depth, cy + blockH / 2 - depth * 0.6);
      ctx.lineTo(cx + blockW / 2, cy + blockH / 2);
      ctx.stroke();
    }

    // Resin fill (amber, rising from bottom)
    if (fillLevel > 0) {
      const resinTop = cy + blockH / 2 - blockH * fillLevel;
      const resinAlpha = 0.15 + hardenProgress * 0.2;
      ctx.fillStyle = `hsla(40, 65%, 50%, ${resinAlpha})`;
      ctx.fillRect(cx - blockW / 2 + 1, resinTop, blockW - 2, cy + blockH / 2 - resinTop - 1);
      // Liquid surface (wavy when liquid, flat when hardened)
      if (hardenProgress < 0.8) {
        const waveAmp = (1 - hardenProgress) * 3 * scale;
        ctx.strokeStyle = `hsla(40, 70%, 60%, 0.5)`;
        ctx.lineWidth = 1 * scale;
        ctx.beginPath();
        for (let x = 0; x <= blockW; x += 2) {
          const wx = cx - blockW / 2 + x;
          const wy = resinTop + Math.sin(x * 0.2 + frame * 0.1) * waveAmp;
          x === 0 ? ctx.moveTo(wx, wy) : ctx.lineTo(wx, wy);
        }
        ctx.stroke();
      }
    }

    // Brain (grey, preserved) visible inside resin
    if (brainAppear > 0) {
      ctx.globalAlpha = fadeAlpha * brainAppear;
      const brainR = 18 * scale;
      ctx.fillStyle = `hsla(250, 12%, 45%, 0.7)`;
      ctx.beginPath();
      ctx.ellipse(cx, cy, brainR * 1.2, brainR, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = `hsla(250, 10%, 35%, 0.4)`;
      ctx.lineWidth = 0.8 * scale;
      ctx.beginPath();
      ctx.moveTo(cx, cy - brainR * 0.7);
      ctx.quadraticCurveTo(cx - 2 * scale, cy, cx, cy + brainR * 0.7);
      ctx.stroke();
      ctx.globalAlpha = fadeAlpha;
    }

    // Label
    if (labelFade > 0) {
      ctx.globalAlpha = fadeAlpha * labelFade;
      ctx.fillStyle = PALETTE.text.accent;
      ctx.font = `${10 * scale}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText("hardened", cx, cy + blockH / 2 + 22 * scale);
      ctx.fillStyle = PALETTE.text.dim;
      ctx.font = `${8 * scale}px monospace`;
      ctx.fillText("epoxy resin block", cx, cy + blockH / 2 + 36 * scale);
      ctx.globalAlpha = fadeAlpha;
    }

    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V2: React.FC<VariantProps> = ({ width, height }) => {
  // Amber Block Solidify: liquid amber surrounds brain, then solidifies
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

    const encase = interpolate(frame, [10, 45], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const solidify = interpolate(frame, [50, 90], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const labelFade = interpolate(frame, [80, 95], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

    const cx = width / 2;
    const cy = height * 0.45;
    const blockW = 65 * scale;
    const blockH = 75 * scale;

    // Amber surrounding block (opacity increases as it solidifies)
    if (encase > 0) {
      const amberAlpha = 0.1 + solidify * 0.25;
      const amberSat = 65 - solidify * 15;
      const amberLit = 55 - solidify * 8;
      // Rounded rectangle for the resin mass
      const radius = (1 - solidify) * 20 * scale + solidify * 5 * scale;
      ctx.fillStyle = `hsla(40, ${amberSat}%, ${amberLit}%, ${amberAlpha * encase})`;
      ctx.beginPath();
      const left = cx - blockW / 2 * encase, top = cy - blockH / 2 * encase;
      const w = blockW * encase, h = blockH * encase;
      ctx.moveTo(left + radius, top);
      ctx.lineTo(left + w - radius, top);
      ctx.arcTo(left + w, top, left + w, top + radius, radius);
      ctx.lineTo(left + w, top + h - radius);
      ctx.arcTo(left + w, top + h, left + w - radius, top + h, radius);
      ctx.lineTo(left + radius, top + h);
      ctx.arcTo(left, top + h, left, top + h - radius, radius);
      ctx.lineTo(left, top + radius);
      ctx.arcTo(left, top, left + radius, top, radius);
      ctx.closePath();
      ctx.fill();
      // Border
      ctx.strokeStyle = `hsla(40, ${amberSat}%, ${amberLit + 10}%, ${(0.3 + solidify * 0.5) * encase})`;
      ctx.lineWidth = (1 + solidify) * scale;
      ctx.stroke();
    }

    // Brain inside
    const brainR = 16 * scale;
    ctx.fillStyle = `hsla(250, 12%, 45%, 0.65)`;
    ctx.beginPath();
    ctx.ellipse(cx, cy, brainR * 1.15, brainR, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = `hsla(250, 10%, 35%, 0.3)`;
    ctx.lineWidth = 0.8 * scale;
    ctx.beginPath();
    ctx.moveTo(cx, cy - brainR * 0.7);
    ctx.quadraticCurveTo(cx - 2 * scale, cy, cx, cy + brainR * 0.7);
    ctx.stroke();

    // Surface texture appears when solidifying (small specks)
    if (solidify > 0.2) {
      const rand = seeded(15002);
      const specks = Math.floor((solidify - 0.2) * 20);
      for (let i = 0; i < specks; i++) {
        const sx = cx + (rand() - 0.5) * blockW * 0.8;
        const sy = cy + (rand() - 0.5) * blockH * 0.8;
        ctx.fillStyle = `hsla(40, 50%, 65%, ${solidify * 0.15})`;
        ctx.beginPath();
        ctx.arc(sx, sy, 1 * scale, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Label
    if (labelFade > 0) {
      ctx.globalAlpha = fadeAlpha * labelFade;
      ctx.fillStyle = PALETTE.text.accent;
      ctx.font = `bold ${11 * scale}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText("hardened", cx, cy + blockH / 2 + 22 * scale);
      ctx.globalAlpha = fadeAlpha;
    }

    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V3: React.FC<VariantProps> = ({ width, height }) => {
  // 3D Block with Brain: drawResinBlock with brain shadow inside, simulated rotation
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

    const blockAppear = interpolate(frame, [5, 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const rotatePhase = interpolate(frame, [30, 110], [0, Math.PI * 0.4], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const labelFade = interpolate(frame, [35, 50], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

    const cx = width / 2;
    const cy = height * 0.47;
    const blockW = 55 * scale;
    const blockH = 70 * scale;
    // Simulated rotation via depth shifting
    const depthShift = Math.sin(rotatePhase) * 15 * scale;
    const widthScale = Math.cos(rotatePhase) * 0.3 + 0.7;

    if (blockAppear > 0) {
      ctx.globalAlpha = fadeAlpha * blockAppear;
      const adjBlockW = blockW * widthScale;
      const depth = 12 * scale + depthShift * 0.5;

      // Block fill (amber)
      ctx.fillStyle = `hsla(40, 55%, 45%, 0.3)`;
      ctx.fillRect(cx - adjBlockW / 2, cy - blockH / 2, adjBlockW, blockH);
      // Top face
      ctx.fillStyle = `hsla(40, 60%, 55%, 0.2)`;
      ctx.beginPath();
      ctx.moveTo(cx - adjBlockW / 2, cy - blockH / 2);
      ctx.lineTo(cx - adjBlockW / 2 + depth, cy - blockH / 2 - depth * 0.6);
      ctx.lineTo(cx + adjBlockW / 2 + depth, cy - blockH / 2 - depth * 0.6);
      ctx.lineTo(cx + adjBlockW / 2, cy - blockH / 2);
      ctx.closePath();
      ctx.fill();
      // Right face
      ctx.fillStyle = `hsla(40, 50%, 38%, 0.25)`;
      ctx.beginPath();
      ctx.moveTo(cx + adjBlockW / 2, cy - blockH / 2);
      ctx.lineTo(cx + adjBlockW / 2 + depth, cy - blockH / 2 - depth * 0.6);
      ctx.lineTo(cx + adjBlockW / 2 + depth, cy + blockH / 2 - depth * 0.6);
      ctx.lineTo(cx + adjBlockW / 2, cy + blockH / 2);
      ctx.closePath();
      ctx.fill();
      // Outline
      ctx.strokeStyle = `hsla(40, 60%, 55%, 0.6)`;
      ctx.lineWidth = 1.5 * scale;
      ctx.strokeRect(cx - adjBlockW / 2, cy - blockH / 2, adjBlockW, blockH);

      // Brain shadow inside
      const brainR = 14 * scale;
      const brainOffsetX = depthShift * 0.15;
      ctx.fillStyle = `hsla(250, 15%, 40%, 0.5)`;
      ctx.beginPath();
      ctx.ellipse(cx + brainOffsetX, cy, brainR * widthScale, brainR * 0.85, 0, 0, Math.PI * 2);
      ctx.fill();
      // Fissure
      ctx.strokeStyle = `hsla(250, 12%, 30%, 0.3)`;
      ctx.lineWidth = 0.8 * scale;
      ctx.beginPath();
      ctx.moveTo(cx + brainOffsetX, cy - brainR * 0.6);
      ctx.quadraticCurveTo(cx + brainOffsetX - 2 * scale, cy, cx + brainOffsetX, cy + brainR * 0.6);
      ctx.stroke();

      ctx.globalAlpha = fadeAlpha;
    }

    // Labels
    if (labelFade > 0) {
      ctx.globalAlpha = fadeAlpha * labelFade;
      ctx.fillStyle = PALETTE.text.accent;
      ctx.font = `${10 * scale}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText("resin block", cx, cy + blockH / 2 + 22 * scale);
      ctx.fillStyle = PALETTE.text.dim;
      ctx.font = `${8 * scale}px monospace`;
      ctx.fillText("brain embedded in epoxy", cx, cy + blockH / 2 + 36 * scale);
      ctx.globalAlpha = fadeAlpha;
    }

    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V4: React.FC<VariantProps> = ({ width, height }) => {
  // Casting Mold: rectangular mold, liquid resin pours in from top
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

    const moldAppear = interpolate(frame, [3, 15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const pourProgress = interpolate(frame, [18, 55], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const fillLevel = interpolate(frame, [20, 65], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const labelFade = interpolate(frame, [60, 75], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

    const cx = width / 2;
    const cy = height * 0.5;
    const moldW = 60 * scale;
    const moldH = 80 * scale;
    const moldTop = cy - moldH / 2;
    const moldBottom = cy + moldH / 2;

    // Mold outline
    if (moldAppear > 0) {
      ctx.globalAlpha = fadeAlpha * moldAppear;
      ctx.strokeStyle = "hsla(220, 30%, 50%, 0.5)";
      ctx.lineWidth = 2 * scale;
      // Open top mold
      ctx.beginPath();
      ctx.moveTo(cx - moldW / 2, moldTop);
      ctx.lineTo(cx - moldW / 2, moldBottom);
      ctx.lineTo(cx + moldW / 2, moldBottom);
      ctx.lineTo(cx + moldW / 2, moldTop);
      ctx.stroke();
      // Flared opening
      ctx.beginPath();
      ctx.moveTo(cx - moldW / 2 - 8 * scale, moldTop - 5 * scale);
      ctx.lineTo(cx - moldW / 2, moldTop);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx + moldW / 2 + 8 * scale, moldTop - 5 * scale);
      ctx.lineTo(cx + moldW / 2, moldTop);
      ctx.stroke();
      ctx.globalAlpha = fadeAlpha;
    }

    // Brain inside mold (at bottom)
    const brainR = 13 * scale;
    const brainY = moldBottom - 20 * scale;
    ctx.fillStyle = `hsla(250, 12%, 45%, 0.65)`;
    ctx.beginPath();
    ctx.ellipse(cx, brainY, brainR * 1.15, brainR, 0, 0, Math.PI * 2);
    ctx.fill();

    // Pour stream from above
    if (pourProgress > 0 && pourProgress < 1) {
      const streamX = cx + Math.sin(frame * 0.15) * 2 * scale;
      const streamTop = moldTop - 30 * scale;
      const streamBottom = moldTop + moldH * (1 - fillLevel) + 5 * scale;
      ctx.strokeStyle = `hsla(40, 70%, 55%, ${0.5 * (1 - pourProgress * 0.5)})`;
      ctx.lineWidth = 3 * scale;
      ctx.beginPath();
      ctx.moveTo(streamX, streamTop);
      ctx.lineTo(streamX, Math.min(streamBottom, moldBottom));
      ctx.stroke();
      // Source container hint
      ctx.fillStyle = `hsla(40, 60%, 50%, 0.3)`;
      ctx.beginPath();
      ctx.arc(streamX, streamTop - 5 * scale, 8 * scale, 0, Math.PI * 2);
      ctx.fill();
    }

    // Rising resin level inside mold
    if (fillLevel > 0) {
      const resinTop = moldBottom - moldH * fillLevel;
      ctx.fillStyle = `hsla(40, 60%, 48%, 0.2)`;
      ctx.fillRect(cx - moldW / 2 + 1, resinTop, moldW - 2, moldBottom - resinTop - 1);
      // Surface shimmer
      if (fillLevel < 0.95) {
        ctx.strokeStyle = `hsla(40, 70%, 58%, 0.4)`;
        ctx.lineWidth = 1 * scale;
        ctx.beginPath();
        for (let x = 0; x <= moldW - 4; x += 2) {
          const wx = cx - moldW / 2 + 2 + x;
          const wy = resinTop + Math.sin(x * 0.25 + frame * 0.08) * 1.5 * scale;
          x === 0 ? ctx.moveTo(wx, wy) : ctx.lineTo(wx, wy);
        }
        ctx.stroke();
      }
    }

    // Label
    if (labelFade > 0) {
      ctx.globalAlpha = fadeAlpha * labelFade;
      ctx.fillStyle = PALETTE.text.accent;
      ctx.font = `${10 * scale}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText("embedding", cx, height * 0.12);
      ctx.fillStyle = PALETTE.text.dim;
      ctx.font = `${8 * scale}px monospace`;
      ctx.fillText("resin fills the mold", cx, height * 0.9);
      ctx.globalAlpha = fadeAlpha;
    }

    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V5: React.FC<VariantProps> = ({ width, height }) => {
  // Resin Level Rising: side view with level indicator
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

    const containerAppear = interpolate(frame, [3, 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const resinLevel = interpolate(frame, [15, 75], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const labelFade = interpolate(frame, [10, 22], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

    const cx = width * 0.45;
    const cy = height * 0.48;
    const containerW = 55 * scale;
    const containerH = 85 * scale;
    const containerTop = cy - containerH / 2;
    const containerBottom = cy + containerH / 2;

    // Container
    if (containerAppear > 0) {
      ctx.globalAlpha = fadeAlpha * containerAppear;
      ctx.strokeStyle = "hsla(220, 30%, 50%, 0.5)";
      ctx.lineWidth = 2 * scale;
      ctx.strokeRect(cx - containerW / 2, containerTop, containerW, containerH);
      ctx.globalAlpha = fadeAlpha;
    }

    // Brain at bottom
    const brainR = 12 * scale;
    const brainY = containerBottom - 22 * scale;
    ctx.fillStyle = `hsla(250, 12%, 45%, 0.65)`;
    ctx.beginPath();
    ctx.ellipse(cx, brainY, brainR * 1.1, brainR * 0.85, 0, 0, Math.PI * 2);
    ctx.fill();

    // Rising resin
    if (resinLevel > 0) {
      const resinTop = containerBottom - containerH * resinLevel;
      ctx.fillStyle = `hsla(40, 60%, 48%, 0.2)`;
      ctx.fillRect(cx - containerW / 2 + 1, resinTop, containerW - 2, containerBottom - resinTop - 1);
      // Surface
      ctx.strokeStyle = `hsla(40, 70%, 58%, 0.5)`;
      ctx.lineWidth = 1 * scale;
      ctx.beginPath();
      ctx.moveTo(cx - containerW / 2 + 2, resinTop);
      ctx.lineTo(cx + containerW / 2 - 2, resinTop);
      ctx.stroke();
    }

    // Level indicator on the side
    if (labelFade > 0) {
      ctx.globalAlpha = fadeAlpha * labelFade;
      const indicatorX = cx + containerW / 2 + 12 * scale;
      // Scale marks
      for (let i = 0; i <= 4; i++) {
        const tickY = containerBottom - (containerH * i) / 4;
        ctx.strokeStyle = "hsla(220, 25%, 45%, 0.3)";
        ctx.lineWidth = 1 * scale;
        ctx.beginPath();
        ctx.moveTo(indicatorX, tickY);
        ctx.lineTo(indicatorX + 6 * scale, tickY);
        ctx.stroke();
        ctx.fillStyle = PALETTE.text.dim;
        ctx.font = `${6 * scale}px monospace`;
        ctx.textAlign = "left";
        ctx.fillText(`${i * 25}%`, indicatorX + 9 * scale, tickY + 3 * scale);
      }
      // Current level marker
      const markerY = containerBottom - containerH * resinLevel;
      ctx.fillStyle = PALETTE.text.accent;
      ctx.beginPath();
      ctx.moveTo(indicatorX - 2 * scale, markerY);
      ctx.lineTo(indicatorX + 4 * scale, markerY - 3 * scale);
      ctx.lineTo(indicatorX + 4 * scale, markerY + 3 * scale);
      ctx.closePath();
      ctx.fill();
      ctx.globalAlpha = fadeAlpha;
    }

    // Percentage display
    const pct = Math.round(resinLevel * 100);
    ctx.fillStyle = PALETTE.text.accent;
    ctx.font = `bold ${14 * scale}px monospace`;
    ctx.textAlign = "center";
    ctx.fillText(`${pct}%`, cx, containerTop - 12 * scale);
    ctx.fillStyle = PALETTE.text.dim;
    ctx.font = `${8 * scale}px system-ui`;
    ctx.fillText("resin level", cx, containerTop - 25 * scale);

    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V6: React.FC<VariantProps> = ({ width, height }) => {
  // Block Rotating: completed resin block with brain, fake 3D rotation
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

    const appear = interpolate(frame, [5, 25], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const rotAngle = interpolate(frame, [25, 110], [0, Math.PI * 0.8], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const labelFade = interpolate(frame, [30, 45], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

    const cx = width / 2;
    const cy = height * 0.47;
    const baseW = 55 * scale;
    const baseH = 70 * scale;
    const baseDepth = 14 * scale;

    if (appear > 0) {
      ctx.globalAlpha = fadeAlpha * appear;

      // Rotation simulation: front face width changes, depth face grows/shrinks
      const frontWidth = baseW * Math.abs(Math.cos(rotAngle));
      const sideWidth = baseDepth * Math.abs(Math.sin(rotAngle));
      const totalVisibleW = frontWidth + sideWidth;

      // Determine which face is more visible
      const showingRight = Math.sin(rotAngle) > 0;

      // Front face
      const frontLeft = cx - totalVisibleW / 2 + (showingRight ? 0 : sideWidth);
      ctx.fillStyle = `hsla(40, 55%, 45%, 0.3)`;
      ctx.fillRect(frontLeft, cy - baseH / 2, frontWidth, baseH);
      ctx.strokeStyle = `hsla(40, 60%, 55%, 0.6)`;
      ctx.lineWidth = 1.5 * scale;
      ctx.strokeRect(frontLeft, cy - baseH / 2, frontWidth, baseH);

      // Side face
      if (sideWidth > 2) {
        const sideLeft = showingRight ? frontLeft + frontWidth : frontLeft - sideWidth;
        ctx.fillStyle = `hsla(40, 45%, 35%, 0.25)`;
        ctx.fillRect(sideLeft, cy - baseH / 2, sideWidth, baseH);
        ctx.strokeStyle = `hsla(40, 50%, 48%, 0.5)`;
        ctx.strokeRect(sideLeft, cy - baseH / 2, sideWidth, baseH);
      }

      // Top face hint
      const topDepth = 8 * scale;
      ctx.fillStyle = `hsla(40, 60%, 52%, 0.2)`;
      ctx.beginPath();
      ctx.moveTo(frontLeft, cy - baseH / 2);
      ctx.lineTo(frontLeft + topDepth, cy - baseH / 2 - topDepth * 0.6);
      ctx.lineTo(frontLeft + frontWidth + topDepth, cy - baseH / 2 - topDepth * 0.6);
      ctx.lineTo(frontLeft + frontWidth, cy - baseH / 2);
      ctx.closePath();
      ctx.fill();

      // Brain visible in front face
      const brainR = 12 * scale;
      const brainVisW = brainR * Math.min(1, frontWidth / (baseW * 0.5));
      ctx.fillStyle = `hsla(250, 15%, 42%, 0.5)`;
      ctx.beginPath();
      ctx.ellipse(frontLeft + frontWidth / 2, cy, brainVisW, brainR * 0.8, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.globalAlpha = fadeAlpha;
    }

    // Labels
    if (labelFade > 0) {
      ctx.globalAlpha = fadeAlpha * labelFade;
      ctx.fillStyle = PALETTE.text.accent;
      ctx.font = `${10 * scale}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText("resin block", cx, cy + baseH / 2 + 22 * scale);
      ctx.fillStyle = PALETTE.text.dim;
      ctx.font = `${8 * scale}px monospace`;
      ctx.fillText("solid, ready for cutting", cx, cy + baseH / 2 + 36 * scale);
      ctx.globalAlpha = fadeAlpha;
    }

    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V7: React.FC<VariantProps> = ({ width, height }) => {
  // Hardening Progress: wavy surface calms, progress bar shows hardening %
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

    const hardenProgress = interpolate(frame, [10, 95], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const blockAppear = interpolate(frame, [3, 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

    const cx = width / 2;
    const cy = height * 0.42;
    const blockW = 70 * scale;
    const blockH = 65 * scale;

    // Resin block
    if (blockAppear > 0) {
      ctx.globalAlpha = fadeAlpha * blockAppear;
      const amberAlpha = 0.12 + hardenProgress * 0.25;
      const amberSat = 65 - hardenProgress * 10;
      ctx.fillStyle = `hsla(40, ${amberSat}%, 48%, ${amberAlpha})`;
      ctx.fillRect(cx - blockW / 2, cy - blockH / 2, blockW, blockH);
      ctx.strokeStyle = `hsla(40, ${amberSat}%, 55%, ${0.3 + hardenProgress * 0.5})`;
      ctx.lineWidth = (1 + hardenProgress * 1.5) * scale;
      ctx.strokeRect(cx - blockW / 2, cy - blockH / 2, blockW, blockH);

      // Wavy surface that calms down
      const waveAmp = (1 - hardenProgress) * 5 * scale;
      const surfaceY = cy - blockH / 2;
      if (waveAmp > 0.3) {
        ctx.strokeStyle = `hsla(40, 70%, 60%, 0.5)`;
        ctx.lineWidth = 1 * scale;
        ctx.beginPath();
        for (let x = 0; x <= blockW; x += 2) {
          const wx = cx - blockW / 2 + x;
          const wy = surfaceY + Math.sin(x * 0.15 + frame * 0.12 * (1 - hardenProgress)) * waveAmp;
          x === 0 ? ctx.moveTo(wx, wy) : ctx.lineTo(wx, wy);
        }
        ctx.stroke();
      }

      // Brain inside
      const brainR = 14 * scale;
      ctx.fillStyle = `hsla(250, 12%, 45%, 0.6)`;
      ctx.beginPath();
      ctx.ellipse(cx, cy + 5 * scale, brainR * 1.1, brainR * 0.85, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.globalAlpha = fadeAlpha;
    }

    // Progress bar
    const barX = cx - 50 * scale;
    const barY = cy + blockH / 2 + 25 * scale;
    const barW = 100 * scale;
    const barH = 10 * scale;
    // Background
    ctx.fillStyle = "hsla(220, 20%, 20%, 0.4)";
    ctx.fillRect(barX, barY, barW, barH);
    // Fill
    const fillColor = hardenProgress < 0.5 ? `hsla(40, 70%, 55%, 0.6)` : `hsla(35, 60%, 50%, 0.7)`;
    ctx.fillStyle = fillColor;
    ctx.fillRect(barX, barY, barW * hardenProgress, barH);
    // Border
    ctx.strokeStyle = "hsla(40, 50%, 50%, 0.4)";
    ctx.lineWidth = 1 * scale;
    ctx.strokeRect(barX, barY, barW, barH);
    // Percentage text
    const pct = Math.round(hardenProgress * 100);
    ctx.fillStyle = PALETTE.text.accent;
    ctx.font = `bold ${10 * scale}px monospace`;
    ctx.textAlign = "center";
    ctx.fillText(`Hardening: ${pct}%`, cx, barY + barH + 16 * scale);

    // State label
    const stateLabel = hardenProgress < 0.3 ? "liquid" : hardenProgress < 0.7 ? "gel" : "solid";
    ctx.fillStyle = PALETTE.text.dim;
    ctx.font = `${9 * scale}px system-ui`;
    ctx.fillText(stateLabel, cx, barY - 6 * scale);

    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V8: React.FC<VariantProps> = ({ width, height }) => {
  // Cross-Section Reveal: resin block splits open to show brain inside
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

    const blockAppear = interpolate(frame, [5, 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const cutProgress = interpolate(frame, [30, 50], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const openProgress = interpolate(frame, [50, 80], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const labelFade = interpolate(frame, [70, 85], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

    const cx = width / 2;
    const cy = height * 0.47;
    const blockW = 65 * scale;
    const blockH = 75 * scale;

    // Full block (before cut)
    if (blockAppear > 0 && openProgress < 1) {
      ctx.globalAlpha = fadeAlpha * blockAppear * (1 - openProgress);
      drawResinBlock(ctx, cx, cy, blockW, blockH, `hsla(40, 55%, 45%, 0.3)`, 10 * scale);
      ctx.globalAlpha = fadeAlpha;
    }

    // Cut line
    if (cutProgress > 0 && cutProgress < 1) {
      const cutY = cy - blockH / 2 + blockH * 0.45;
      const cutLen = blockW * cutProgress;
      ctx.strokeStyle = `hsla(0, 0%, 90%, 0.8)`;
      ctx.lineWidth = 1.5 * scale;
      ctx.beginPath();
      ctx.moveTo(cx - blockW / 2, cutY);
      ctx.lineTo(cx - blockW / 2 + cutLen, cutY);
      ctx.stroke();
      // Sparkle at cut tip
      ctx.fillStyle = `hsla(0, 0%, 95%, ${0.6 * (1 - cutProgress)})`;
      ctx.beginPath();
      ctx.arc(cx - blockW / 2 + cutLen, cutY, 3 * scale, 0, Math.PI * 2);
      ctx.fill();
    }

    // Opened halves
    if (openProgress > 0) {
      const splitDist = openProgress * 15 * scale;
      const cutY = cy - blockH / 2 + blockH * 0.45;
      const topH = blockH * 0.45;
      const botH = blockH * 0.55;

      ctx.globalAlpha = fadeAlpha * blockAppear;
      // Top half (moves up)
      ctx.fillStyle = `hsla(40, 55%, 45%, 0.3)`;
      ctx.fillRect(cx - blockW / 2, cy - blockH / 2 - splitDist, blockW, topH);
      ctx.strokeStyle = `hsla(40, 60%, 55%, 0.5)`;
      ctx.lineWidth = 1 * scale;
      ctx.strokeRect(cx - blockW / 2, cy - blockH / 2 - splitDist, blockW, topH);

      // Bottom half (moves down) — shows cross section
      ctx.fillStyle = `hsla(40, 55%, 45%, 0.3)`;
      ctx.fillRect(cx - blockW / 2, cutY + splitDist, blockW, botH);
      ctx.strokeStyle = `hsla(40, 60%, 55%, 0.5)`;
      ctx.strokeRect(cx - blockW / 2, cutY + splitDist, blockW, botH);

      // Exposed brain cross-section on bottom half face
      const brainR = 16 * scale;
      const brainY = cutY + splitDist + 3 * scale;
      const revealAlpha = Math.min(1, openProgress * 1.5);
      ctx.fillStyle = `hsla(250, 18%, 42%, ${0.7 * revealAlpha})`;
      ctx.beginPath();
      ctx.ellipse(cx, brainY, brainR * 1.1, brainR * 0.4, 0, 0, Math.PI * 2);
      ctx.fill();
      // Internal structure hint
      ctx.strokeStyle = `hsla(250, 15%, 55%, ${0.3 * revealAlpha})`;
      ctx.lineWidth = 0.5 * scale;
      for (let i = 0; i < 5; i++) {
        const angle = (i / 5) * Math.PI * 2;
        const r = brainR * 0.5;
        ctx.beginPath();
        ctx.arc(cx + Math.cos(angle) * r * 0.5, brainY + Math.sin(angle) * r * 0.2, 2 * scale, 0, Math.PI * 2);
        ctx.stroke();
      }

      ctx.globalAlpha = fadeAlpha;
    }

    // Labels
    if (labelFade > 0) {
      ctx.globalAlpha = fadeAlpha * labelFade;
      ctx.fillStyle = PALETTE.text.accent;
      ctx.font = `${10 * scale}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText("brain embedded in resin", cx, height * 0.9);
      ctx.globalAlpha = fadeAlpha;
    }

    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V9: React.FC<VariantProps> = ({ width, height }) => {
  // Block Emerging from Mold: block slides upward out of mold frame
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

    const moldAppear = interpolate(frame, [3, 15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const hardenFlash = interpolate(frame, [20, 45], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const emergeProgress = interpolate(frame, [50, 90], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const labelFade = interpolate(frame, [85, 100], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

    const cx = width / 2;
    const moldY = height * 0.58;
    const moldW = 65 * scale;
    const moldH = 80 * scale;
    const blockW = 55 * scale;
    const blockH = 70 * scale;

    // Mold frame
    if (moldAppear > 0) {
      ctx.globalAlpha = fadeAlpha * moldAppear;
      ctx.strokeStyle = "hsla(220, 25%, 45%, 0.5)";
      ctx.lineWidth = 3 * scale;
      ctx.strokeRect(cx - moldW / 2, moldY - moldH / 2, moldW, moldH);
      // Mold label
      ctx.fillStyle = PALETTE.text.dim;
      ctx.font = `${7 * scale}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText("mold", cx, moldY + moldH / 2 + 14 * scale);
      ctx.globalAlpha = fadeAlpha;
    }

    // Block inside/emerging from mold
    const blockRestY = moldY;
    const blockEmergedY = moldY - 60 * scale;
    const blockY = blockRestY + (blockEmergedY - blockRestY) * emergeProgress;

    // Harden flash
    if (hardenFlash > 0 && hardenFlash < 1 && emergeProgress === 0) {
      const flashAlpha = Math.sin(hardenFlash * Math.PI) * 0.3;
      ctx.fillStyle = `hsla(40, 80%, 65%, ${flashAlpha})`;
      ctx.fillRect(cx - moldW / 2 + 2, moldY - moldH / 2 + 2, moldW - 4, moldH - 4);
    }

    // The block
    const blockAlpha = 0.15 + hardenFlash * 0.2;
    ctx.fillStyle = `hsla(40, 55%, 45%, ${blockAlpha})`;
    ctx.fillRect(cx - blockW / 2, blockY - blockH / 2, blockW, blockH);
    ctx.strokeStyle = `hsla(40, 60%, 55%, ${0.4 + hardenFlash * 0.4})`;
    ctx.lineWidth = (1 + hardenFlash) * scale;
    ctx.strokeRect(cx - blockW / 2, blockY - blockH / 2, blockW, blockH);

    // 3D top face when emerging
    if (emergeProgress > 0.1) {
      const depth = 8 * scale;
      ctx.fillStyle = `hsla(40, 60%, 52%, 0.18)`;
      ctx.beginPath();
      ctx.moveTo(cx - blockW / 2, blockY - blockH / 2);
      ctx.lineTo(cx - blockW / 2 + depth, blockY - blockH / 2 - depth * 0.6);
      ctx.lineTo(cx + blockW / 2 + depth, blockY - blockH / 2 - depth * 0.6);
      ctx.lineTo(cx + blockW / 2, blockY - blockH / 2);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = `hsla(40, 55%, 50%, 0.4)`;
      ctx.lineWidth = 1 * scale;
      ctx.stroke();
    }

    // Brain visible inside block
    const brainR = 12 * scale;
    ctx.fillStyle = `hsla(250, 15%, 42%, 0.55)`;
    ctx.beginPath();
    ctx.ellipse(cx, blockY, brainR * 1.1, brainR * 0.85, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = `hsla(250, 10%, 32%, 0.3)`;
    ctx.lineWidth = 0.7 * scale;
    ctx.beginPath();
    ctx.moveTo(cx, blockY - brainR * 0.6);
    ctx.quadraticCurveTo(cx - 2 * scale, blockY, cx, blockY + brainR * 0.6);
    ctx.stroke();

    // Label
    if (labelFade > 0) {
      ctx.globalAlpha = fadeAlpha * labelFade;
      ctx.fillStyle = PALETTE.text.accent;
      ctx.font = `bold ${11 * scale}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText("ready for sectioning", cx, height * 0.12);
      ctx.globalAlpha = fadeAlpha;
    }

    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

export const VARIANTS_SHOT_015: VariantDef[] = [
  { id: "resin-pour", label: "Resin Pour", component: V1 },
  { id: "amber-solidify", label: "Amber Block Solidify", component: V2 },
  { id: "3d-block", label: "3D Block with Brain", component: V3 },
  { id: "casting-mold", label: "Casting Mold", component: V4 },
  { id: "resin-level", label: "Resin Level Rising", component: V5 },
  { id: "block-rotating", label: "Block Rotating", component: V6 },
  { id: "hardening-progress", label: "Hardening Progress", component: V7 },
  { id: "cross-section-reveal", label: "Cross-Section Reveal", component: V8 },
  { id: "block-emerging", label: "Block from Mold", component: V9 },
];
