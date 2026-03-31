import React, { useRef, useEffect } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantProps } from "../types";

/**
 * Top-down view of 6 dots (feet). Three green (stance), three blue (swing).
 * They alternate rhythmically -- the tripod gait pattern.
 */
export const TripodGait: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;

  const fadeOut = interpolate(frame, [130, 148], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);
    ctx.globalAlpha = fadeOut;

    const cx = width / 2;
    const cy = height / 2;

    // Fly body outline (top-down, elongated oval)
    const bodyAppear = interpolate(frame, [0, 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (bodyAppear > 0) {
      ctx.strokeStyle = `rgba(100, 100, 120, ${bodyAppear * 0.4})`;
      ctx.lineWidth = 1.5 * s;

      // Head
      ctx.beginPath();
      ctx.ellipse(cx, cy - 40 * s, 12 * s, 10 * s, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Thorax
      ctx.beginPath();
      ctx.ellipse(cx, cy - 15 * s, 16 * s, 18 * s, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Abdomen
      ctx.beginPath();
      ctx.ellipse(cx, cy + 20 * s, 13 * s, 22 * s, 0, 0, Math.PI * 2);
      ctx.stroke();
    }

    // 6 feet positions (top-down view)
    // L1, R1 (front), L2, R2 (mid), L3, R3 (rear)
    // Group A (tripod 1): L1, R2, L3 -- Group B: R1, L2, R3
    const legBaseY = [-28, -28, -10, -10, 8, 8];
    const legSide = [-1, 1, -1, 1, -1, 1];
    const legGroup = [0, 1, 1, 0, 0, 1]; // 0 = group A, 1 = group B
    const legSpread = [35, 35, 42, 42, 38, 38];

    const gaitStart = interpolate(frame, [20, 35], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

    // Gait cycle: ~20 frames per half-cycle
    const cycleT = frame > 25 ? ((frame - 25) % 30) / 30 : 0;
    const phase = cycleT * Math.PI * 2;

    // Labels
    const labelAppear = interpolate(frame, [30, 45], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

    for (let i = 0; i < 6; i++) {
      const bx = cx + legSide[i] * legSpread[i] * s;
      const by = cy + legBaseY[i] * s;

      // Stance vs swing: group A leads with sin, group B is opposite
      const groupPhase = legGroup[i] === 0 ? phase : phase + Math.PI;
      const isStance = Math.sin(groupPhase) > 0;

      // Foot displacement during swing
      const swingOffset = gaitStart * Math.max(0, -Math.sin(groupPhase)) * 6 * s;
      const footY = by + (legBaseY[i] < 0 ? -swingOffset : swingOffset);

      // Draw leg line from body to foot
      const attachX = cx + legSide[i] * 16 * s;
      const attachY = cy + legBaseY[i] * s;
      ctx.strokeStyle = `rgba(100, 100, 120, ${bodyAppear * 0.3})`;
      ctx.lineWidth = 1 * s;
      ctx.beginPath();
      ctx.moveTo(attachX, attachY);
      ctx.lineTo(bx, footY);
      ctx.stroke();

      // Foot dot
      const stanceColor = isStance ? "rgba(80, 220, 100, " : "rgba(80, 160, 255, ";
      const dotSize = (isStance ? 6 : 5) * s;

      // Glow
      if (gaitStart > 0) {
        const grad = ctx.createRadialGradient(bx, footY, 0, bx, footY, dotSize * 2.5);
        grad.addColorStop(0, `${stanceColor}${gaitStart * 0.4})`);
        grad.addColorStop(1, `${stanceColor}0)`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(bx, footY, dotSize * 2.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // Core dot
      ctx.fillStyle = `${stanceColor}${0.3 + gaitStart * 0.7})`;
      ctx.beginPath();
      ctx.arc(bx, footY, dotSize, 0, Math.PI * 2);
      ctx.fill();

      // Ground contact indicator for stance legs
      if (isStance && gaitStart > 0.5) {
        ctx.strokeStyle = `${stanceColor}${gaitStart * 0.3})`;
        ctx.lineWidth = 1 * s;
        ctx.beginPath();
        ctx.arc(bx, footY, dotSize * 1.8, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    // Legend
    if (labelAppear > 0) {
      ctx.font = `bold ${10 * s}px monospace`;
      ctx.textAlign = "left";

      // Stance
      ctx.fillStyle = `rgba(80, 220, 100, ${labelAppear * 0.8})`;
      ctx.beginPath();
      ctx.arc(width * 0.15, height * 0.88, 4 * s, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillText("stance", width * 0.15 + 8 * s, height * 0.88 + 3 * s);

      // Swing
      ctx.fillStyle = `rgba(80, 160, 255, ${labelAppear * 0.8})`;
      ctx.beginPath();
      ctx.arc(width * 0.55, height * 0.88, 4 * s, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillText("swing", width * 0.55 + 8 * s, height * 0.88 + 3 * s);

      // Title
      ctx.fillStyle = `rgba(200, 200, 220, ${labelAppear * 0.7})`;
      ctx.font = `bold ${12 * s}px monospace`;
      ctx.textAlign = "center";
      ctx.fillText("TRIPOD GAIT", cx, height * 0.1);
    }

    ctx.textAlign = "start";
  });

  return (
    <div style={{ width, height, backgroundColor: "#0a0a0f" }}>
      <canvas ref={canvasRef} width={width} height={height} />
    </div>
  );
};
