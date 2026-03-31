import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantProps } from "../types";

function seeded(s: number) {
  return () => {
    s = (s * 16807) % 2147483647;
    return s / 2147483647;
  };
}

/**
 * Bird's eye: yellow circles (food) and red circles (danger) scattered.
 * A trail line weaves between them, always toward yellow, away from red.
 */
export const ForagingCourse: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;

  const fadeOut = interpolate(frame, [130, 148], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const items = useMemo(() => {
    const rng = seeded(777);
    const food: { x: number; y: number }[] = [];
    const danger: { x: number; y: number }[] = [];
    const margin = 40 * s;

    // Place food (yellow)
    for (let i = 0; i < 5; i++) {
      food.push({
        x: margin + rng() * (width - 2 * margin),
        y: margin + rng() * (height - 2 * margin),
      });
    }

    // Place danger (red)
    for (let i = 0; i < 4; i++) {
      danger.push({
        x: margin + rng() * (width - 2 * margin),
        y: margin + rng() * (height - 2 * margin),
      });
    }

    return { food, danger };
  }, [width, height, s]);

  // Pre-compute trail path that navigates toward food, away from danger
  const trail = useMemo(() => {
    const points: { x: number; y: number }[] = [];
    let px = width * 0.1;
    let py = height * 0.5;
    let vx = 1.2;
    let vy = 0;

    for (let step = 0; step < 300; step++) {
      points.push({ x: px, y: py });

      // Attraction to nearest unvisited food
      let fx = 0, fy = 0;
      for (const f of items.food) {
        const dx = f.x - px;
        const dy = f.y - py;
        const dist = Math.sqrt(dx * dx + dy * dy) + 1;
        fx += (dx / dist) * 40 / dist;
        fy += (dy / dist) * 40 / dist;
      }

      // Repulsion from danger
      for (const d of items.danger) {
        const dx = d.x - px;
        const dy = d.y - py;
        const dist = Math.sqrt(dx * dx + dy * dy) + 1;
        fx -= (dx / dist) * 80 / dist;
        fy -= (dy / dist) * 80 / dist;
      }

      // Edge repulsion
      const edgeMargin = 30 * s;
      if (px < edgeMargin) fx += 0.5;
      if (px > width - edgeMargin) fx -= 0.5;
      if (py < edgeMargin) fy += 0.5;
      if (py > height - edgeMargin) fy -= 0.5;

      vx = vx * 0.9 + fx * 0.1;
      vy = vy * 0.9 + fy * 0.1;

      // Normalize speed
      const speed = Math.sqrt(vx * vx + vy * vy);
      if (speed > 2) {
        vx = (vx / speed) * 2;
        vy = (vy / speed) * 2;
      }

      px += vx;
      py += vy;
    }

    return points;
  }, [width, height, items, s]);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);
    ctx.globalAlpha = fadeOut;

    const itemAppear = interpolate(frame, [0, 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const trailLen = interpolate(frame, [15, 125], [0, trail.length], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

    // Food items (yellow)
    for (const f of items.food) {
      // Glow
      const grad = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, 20 * s);
      grad.addColorStop(0, `rgba(255, 210, 60, ${itemAppear * 0.15})`);
      grad.addColorStop(1, "rgba(255, 210, 60, 0)");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(f.x, f.y, 20 * s, 0, Math.PI * 2);
      ctx.fill();

      // Circle
      ctx.strokeStyle = `rgba(255, 210, 60, ${itemAppear * 0.7})`;
      ctx.lineWidth = 1.5 * s;
      ctx.beginPath();
      ctx.arc(f.x, f.y, 10 * s, 0, Math.PI * 2);
      ctx.stroke();

      // Dot
      ctx.fillStyle = `rgba(255, 210, 60, ${itemAppear * 0.5})`;
      ctx.beginPath();
      ctx.arc(f.x, f.y, 3 * s, 0, Math.PI * 2);
      ctx.fill();
    }

    // Danger items (red)
    for (const d of items.danger) {
      // Glow
      const grad = ctx.createRadialGradient(d.x, d.y, 0, d.x, d.y, 18 * s);
      grad.addColorStop(0, `rgba(255, 60, 60, ${itemAppear * 0.12})`);
      grad.addColorStop(1, "rgba(255, 60, 60, 0)");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(d.x, d.y, 18 * s, 0, Math.PI * 2);
      ctx.fill();

      // X mark
      ctx.strokeStyle = `rgba(255, 60, 60, ${itemAppear * 0.6})`;
      ctx.lineWidth = 2 * s;
      const sz = 7 * s;
      ctx.beginPath();
      ctx.moveTo(d.x - sz, d.y - sz);
      ctx.lineTo(d.x + sz, d.y + sz);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(d.x + sz, d.y - sz);
      ctx.lineTo(d.x - sz, d.y + sz);
      ctx.stroke();
    }

    // Trail
    const numVisible = Math.floor(trailLen);
    if (numVisible > 1) {
      ctx.strokeStyle = "rgba(120, 220, 180, 0.5)";
      ctx.lineWidth = 2 * s;
      ctx.beginPath();
      ctx.moveTo(trail[0].x, trail[0].y);
      for (let i = 1; i < numVisible; i++) {
        ctx.lineTo(trail[i].x, trail[i].y);
      }
      ctx.stroke();

      // Fly head dot at trail tip
      const tip = trail[numVisible - 1];
      const grad = ctx.createRadialGradient(tip.x, tip.y, 0, tip.x, tip.y, 8 * s);
      grad.addColorStop(0, "rgba(120, 255, 200, 0.9)");
      grad.addColorStop(1, "rgba(120, 255, 200, 0)");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(tip.x, tip.y, 8 * s, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "rgba(200, 255, 230, 0.9)";
      ctx.beginPath();
      ctx.arc(tip.x, tip.y, 3 * s, 0, Math.PI * 2);
      ctx.fill();
    }

    // Legend
    if (frame > 10) {
      const la = interpolate(frame, [10, 25], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      ctx.font = `${9 * s}px monospace`;
      ctx.textAlign = "left";

      ctx.fillStyle = `rgba(255, 210, 60, ${la * 0.7})`;
      ctx.fillText("food", 12 * s, height - 10 * s);

      ctx.fillStyle = `rgba(255, 60, 60, ${la * 0.7})`;
      ctx.fillText("danger", 50 * s, height - 10 * s);
    }

    ctx.textAlign = "start";
  });

  return (
    <div style={{ width, height, backgroundColor: "#0a0a0f" }}>
      <canvas ref={canvasRef} width={width} height={height} />
    </div>
  );
};
