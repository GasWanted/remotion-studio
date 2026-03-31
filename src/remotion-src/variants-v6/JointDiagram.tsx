import React, { useRef, useEffect } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantProps } from "../types";

/**
 * One leg, 8 joint dots lighting up sequentially. Then all 6 legs flash. Counter: "48 joints".
 */
export const JointDiagram: React.FC<VariantProps> = ({ width, height }) => {
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

    // Single leg joint positions (8 joints along a leg shape)
    function getLegJoints(baseX: number, baseY: number, angle: number, scale: number) {
      const joints: { x: number; y: number }[] = [];
      let px = baseX;
      let py = baseY;
      const segLens = [12, 14, 16, 18, 16, 14, 12, 10];
      for (let i = 0; i < 8; i++) {
        const a = angle + Math.sin(i * 0.4) * 0.3;
        px += Math.cos(a) * segLens[i] * scale;
        py += Math.sin(a) * segLens[i] * scale;
        joints.push({ x: px, y: py });
      }
      return joints;
    }

    // Phase 1 (frames 0-70): single leg, joints light up sequentially
    const singleLegPhase = frame < 75;

    if (singleLegPhase) {
      const joints = getLegJoints(cx - 60 * s, cy - 40 * s, 0.7, s);

      // Draw leg line
      ctx.strokeStyle = "rgba(100, 100, 120, 0.5)";
      ctx.lineWidth = 2 * s;
      ctx.beginPath();
      ctx.moveTo(cx - 60 * s, cy - 40 * s);
      for (const j of joints) {
        ctx.lineTo(j.x, j.y);
      }
      ctx.stroke();

      // Light up joints sequentially
      const litCount = interpolate(frame, [8, 65], [0, 8], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      });

      for (let i = 0; i < 8; i++) {
        const j = joints[i];
        const isLit = i < litCount;
        const justLit = i < litCount && i >= litCount - 1;

        if (isLit) {
          // Glow
          const glow = justLit ? 20 : 8;
          const gradient = ctx.createRadialGradient(j.x, j.y, 0, j.x, j.y, glow * s);
          gradient.addColorStop(0, "rgba(0, 200, 255, 0.6)");
          gradient.addColorStop(1, "rgba(0, 200, 255, 0)");
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(j.x, j.y, glow * s, 0, Math.PI * 2);
          ctx.fill();
        }

        // Dot
        ctx.fillStyle = isLit ? "#00c8ff" : "rgba(80, 80, 100, 0.6)";
        ctx.beginPath();
        ctx.arc(j.x, j.y, (isLit ? 4 : 3) * s, 0, Math.PI * 2);
        ctx.fill();

        // Label
        if (isLit) {
          ctx.fillStyle = "rgba(0, 200, 255, 0.7)";
          ctx.font = `${9 * s}px monospace`;
          ctx.fillText(`J${i + 1}`, j.x + 6 * s, j.y - 4 * s);
        }
      }
    } else {
      // Phase 2 (frames 75-130): all 6 legs flash their joints
      const legAngles = [
        { bx: -30, by: -50, angle: -0.8 },
        { bx: -35, by: -20, angle: -0.2 },
        { bx: -30, by: 10, angle: 0.4 },
        { bx: 30, by: -50, angle: Math.PI + 0.8 },
        { bx: 35, by: -20, angle: Math.PI + 0.2 },
        { bx: 30, by: 10, angle: Math.PI - 0.4 },
      ];

      // Draw simple fly body center
      ctx.strokeStyle = "rgba(100, 100, 120, 0.4)";
      ctx.lineWidth = 1.5 * s;
      ctx.beginPath();
      ctx.ellipse(cx, cy - 20 * s, 15 * s, 30 * s, 0, 0, Math.PI * 2);
      ctx.stroke();

      const flashPhase = ((frame - 75) % 20) / 20;
      const flashBright = 0.5 + 0.5 * Math.sin(flashPhase * Math.PI * 2);

      for (const leg of legAngles) {
        const joints = getLegJoints(cx + leg.bx * s, cy + leg.by * s, leg.angle, s * 0.7);

        ctx.strokeStyle = `rgba(100, 100, 120, 0.4)`;
        ctx.lineWidth = 1.5 * s;
        ctx.beginPath();
        ctx.moveTo(cx + leg.bx * s, cy + leg.by * s);
        for (const j of joints) ctx.lineTo(j.x, j.y);
        ctx.stroke();

        for (const j of joints) {
          ctx.fillStyle = `rgba(0, 200, 255, ${0.4 + flashBright * 0.6})`;
          ctx.beginPath();
          ctx.arc(j.x, j.y, 3 * s, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    // Counter
    const counterP = interpolate(frame, [70, 85], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    if (counterP > 0) {
      const count = Math.floor(counterP * 48);
      ctx.fillStyle = `rgba(0, 200, 255, ${counterP})`;
      ctx.font = `bold ${22 * s}px monospace`;
      ctx.textAlign = "center";
      ctx.fillText(`${count} joints`, cx, cy + 75 * s);
      ctx.textAlign = "start";
    }
  });

  return (
    <div style={{ width, height, backgroundColor: "#0a0a0f" }}>
      <canvas ref={canvasRef} width={width} height={height} />
    </div>
  );
};
