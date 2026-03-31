import React, { useRef, useEffect } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantProps } from "../types";

// Yellow food at center. Dot approaches from left, curves away and retreats right. Trail shows avoidance.
export const RunFromFood: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;

  const fadeOut = interpolate(frame, [130, 148], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);
    ctx.globalAlpha = fadeOut;

    const cx = width / 2;
    const cy = height / 2;
    const foodR = 10 * scale;

    // Food glow
    const foodGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, foodR * 3);
    foodGlow.addColorStop(0, "rgba(255, 220, 60, 0.12)");
    foodGlow.addColorStop(1, "rgba(255, 220, 60, 0)");
    ctx.fillStyle = foodGlow;
    ctx.fillRect(cx - foodR * 3, cy - foodR * 3, foodR * 6, foodR * 6);

    // Food
    ctx.fillStyle = "rgba(255, 220, 60, 0.8)";
    ctx.shadowColor = "rgba(255, 220, 60, 0.5)";
    ctx.shadowBlur = 8 * scale;
    ctx.beginPath();
    ctx.arc(cx, cy, foodR, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;

    // Label
    const smallFont = Math.max(6, 7 * scale);
    ctx.font = `${smallFont}px Courier New`;
    ctx.textAlign = "center";
    ctx.fillStyle = "rgba(255, 220, 60, 0.4)";
    ctx.fillText("sugar", cx, cy + foodR + 10 * scale);

    // Fly path: approach from left, curve around food, retreat right
    // Phase 1: approach (0-60), Phase 2: curve (60-90), Phase 3: retreat (90-130)
    const approach = interpolate(frame, [5, 55], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const curve = interpolate(frame, [55, 85], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const retreat = interpolate(frame, [85, 130], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

    // Build path points
    const pathPoints: { x: number; y: number }[] = [];
    const startX = cx - 140 * scale;
    const startY = cy;
    const nearFoodX = cx - 22 * scale;

    // Approach: straight line from left toward food
    const approachSteps = 30;
    for (let i = 0; i <= approachSteps; i++) {
      const t = i / approachSteps;
      if (t > approach) break;
      pathPoints.push({
        x: startX + (nearFoodX - startX) * t,
        y: startY,
      });
    }

    // Curve: arc away from food (deflection upward/rightward)
    if (curve > 0) {
      const curveSteps = 20;
      for (let i = 1; i <= curveSteps; i++) {
        const t = i / curveSteps;
        if (t > curve) break;
        // Bezier-like curve: goes up and to the right
        const ct = t;
        const bx = nearFoodX + ct * 30 * scale;
        const by = startY - Math.sin(ct * Math.PI) * 45 * scale;
        pathPoints.push({ x: bx, y: by });
      }
    }

    // Retreat: accelerating away to the right
    if (retreat > 0) {
      const retreatSteps = 30;
      const curveEndX = nearFoodX + 30 * scale;
      const curveEndY = startY;
      for (let i = 1; i <= retreatSteps; i++) {
        const t = i / retreatSteps;
        if (t > retreat) break;
        const accel = t * t; // accelerating
        pathPoints.push({
          x: curveEndX + accel * 130 * scale,
          y: curveEndY - Math.sin(t * 0.5) * 10 * scale,
        });
      }
    }

    // Draw trail
    if (pathPoints.length > 1) {
      for (let i = 1; i < pathPoints.length; i++) {
        const prev = pathPoints[i - 1];
        const curr = pathPoints[i];
        const t = i / pathPoints.length;

        // Color transitions: white -> yellow (near food) -> red (retreating)
        let r: number, g: number, b: number;
        if (t < 0.5) {
          r = 180 + t * 100;
          g = 200 + t * 40;
          b = 220 - t * 100;
        } else {
          const rt = (t - 0.5) * 2;
          r = 230 + rt * 25;
          g = 220 - rt * 160;
          b = 170 - rt * 140;
        }

        const alpha = 0.15 + (i / pathPoints.length) * 0.35;
        ctx.strokeStyle = `rgba(${Math.floor(r)}, ${Math.floor(g)}, ${Math.floor(b)}, ${alpha})`;
        ctx.lineWidth = (1 + t * 1.5) * scale;
        ctx.beginPath();
        ctx.moveTo(prev.x, prev.y);
        ctx.lineTo(curr.x, curr.y);
        ctx.stroke();
      }
    }

    // Fly dot
    if (pathPoints.length > 0) {
      const flyPos = pathPoints[pathPoints.length - 1];
      const isRetreating = retreat > 0;

      ctx.shadowColor = isRetreating ? "rgba(255, 60, 30, 0.5)" : "rgba(200, 220, 255, 0.3)";
      ctx.shadowBlur = 6 * scale;
      ctx.fillStyle = isRetreating ? "rgba(255, 80, 50, 0.9)" : "rgba(200, 230, 255, 0.9)";
      ctx.beginPath();
      ctx.arc(flyPos.x, flyPos.y, 4 * scale, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowColor = "transparent";
      ctx.shadowBlur = 0;
    }

    // "avoidance" text after curve begins
    if (curve > 0.5) {
      const avoidAlpha = interpolate(frame, [70, 90], [0, 0.5], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      ctx.font = `${Math.max(7, 9 * scale)}px Courier New`;
      ctx.textAlign = "center";
      ctx.fillStyle = `rgba(255, 100, 70, ${avoidAlpha})`;
      ctx.fillText("avoidance", cx, height * 0.88);
    }

    // Title
    ctx.font = `${Math.max(7, 8 * scale)}px Courier New`;
    ctx.textAlign = "center";
    ctx.fillStyle = `rgba(255, 200, 180, ${0.4 * fadeOut})`;
    ctx.fillText("running from food", cx, height * 0.07);
  });

  return (
    <div style={{ width, height, backgroundColor: "#0a0a0f" }}>
      <canvas ref={canvasRef} width={width} height={height} />
    </div>
  );
};
