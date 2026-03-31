import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantProps } from "../types";

type C2D = CanvasRenderingContext2D;

export function seeded(s: number) {
  return () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
}

export function defaultPerson(ctx: C2D, x: number, y: number, size: number, color: string) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y - size * 0.55, size * 0.32, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x - size * 0.45, y + size * 0.45);
  ctx.quadraticCurveTo(x - size * 0.45, y - size * 0.05, x, y - size * 0.15);
  ctx.quadraticCurveTo(x + size * 0.45, y - size * 0.05, x + size * 0.45, y + size * 0.45);
  ctx.fill();
}

export interface ThemeConfig {
  bgColor: string;
  drawBg: (ctx: C2D, w: number, h: number, frame: number, scale: number) => void;
  drawFigure: (ctx: C2D, x: number, y: number, size: number, color: string) => void;
  figureColor: (hue: number, alpha: number) => string;
  titleColor: string;
  counterColor: string;
  fontFamily?: string;
  fadeRgb?: string;
  drawOverlay?: (ctx: C2D, w: number, h: number, frame: number, scale: number) => void;
}

const HUES = [350, 25, 55, 140, 180, 220, 280, 310];

export function makeThemed(config: ThemeConfig): React.FC<VariantProps> {
  const Themed: React.FC<VariantProps> = ({ width, height }) => {
    const frame = useCurrentFrame();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const scale = Math.min(width, height) / 360;

    const people = useMemo(() => {
      const rand = seeded(3001);
      const cols = 16, rows = 13;
      const cellW = (width * 0.7) / cols, cellH = (height * 0.5) / rows;
      const startX = width * 0.15, startY = height * 0.32;
      const list: { x: number; y: number; hue: number; delay: number }[] = [];
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          if (list.length >= 208) break;
          list.push({
            x: startX + c * cellW + cellW / 2,
            y: startY + r * cellH + cellH / 2,
            hue: HUES[Math.floor(rand() * HUES.length)],
            delay: (r * cols + c) * 0.3,
          });
        }
      }
      return { list, cellW, cellH };
    }, [width, height]);

    useEffect(() => {
      const ctx = canvasRef.current?.getContext("2d");
      if (!ctx) return;
      ctx.clearRect(0, 0, width, height);

      config.drawBg(ctx, width, height, frame, scale);

      // Title "2024"
      const titleAlpha = interpolate(frame, [0, 15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      ctx.globalAlpha = titleAlpha;
      ctx.fillStyle = config.titleColor;
      ctx.font = `bold ${28 * scale}px ${config.fontFamily || "system-ui, sans-serif"}`;
      ctx.textAlign = "center";
      ctx.shadowColor = "transparent";
      ctx.shadowBlur = 0;
      ctx.fillText("2024", width / 2, height * 0.2);

      // People filling in
      let visibleCount = 0;
      for (const p of people.list) {
        const t = interpolate(frame - p.delay, [0, 6], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        if (t <= 0) continue;
        visibleCount++;
        ctx.globalAlpha = t;
        ctx.shadowColor = "transparent";
        ctx.shadowBlur = 0;
        const sz = Math.min(people.cellW, people.cellH) * 0.4 * t;
        config.drawFigure(ctx, p.x, p.y, sz, config.figureColor(p.hue, t));
      }

      // Counter
      ctx.globalAlpha = 1;
      ctx.shadowColor = "transparent";
      ctx.shadowBlur = 0;
      ctx.fillStyle = config.counterColor;
      ctx.font = `${16 * scale}px monospace`;
      ctx.textAlign = "right";
      ctx.fillText(`${Math.min(visibleCount, 200)}+`, width * 0.88, height * 0.92);

      if (config.drawOverlay) config.drawOverlay(ctx, width, height, frame, scale);

      // Fade out
      const fadeOut = interpolate(frame, [130, 148], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      if (fadeOut < 1) {
        ctx.globalAlpha = 1;
        ctx.fillStyle = `rgba(${config.fadeRgb || "0,0,0"},${1 - fadeOut})`;
        ctx.fillRect(0, 0, width, height);
      }
    });

    return (
      <div style={{ width, height, backgroundColor: config.bgColor }}>
        <canvas ref={canvasRef} width={width} height={height} />
      </div>
    );
  };
  return Themed;
}
