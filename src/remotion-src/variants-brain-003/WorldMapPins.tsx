import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantProps } from "../types";
import { seeded, drawBg, makeParticles, drawParticles, PALETTE } from "../scenes/theme";
import { drawPin } from "./icons";

// Variant 3: Stylized world map outline with pins dropping at institution locations
export const WorldMapPins: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;

  const data = useMemo(() => {
    const rand = seeded(3003);
    const particles = makeParticles(25, width, height, scale);
    // Stylized continent blobs (not accurate, evocative)
    const continents = [
      { cx: width * 0.28, cy: height * 0.38, rx: width * 0.1, ry: height * 0.12 },  // N America
      { cx: width * 0.32, cy: height * 0.62, rx: width * 0.05, ry: height * 0.1 },   // S America
      { cx: width * 0.48, cy: height * 0.35, rx: width * 0.08, ry: height * 0.1 },   // Europe
      { cx: width * 0.52, cy: height * 0.58, rx: width * 0.07, ry: height * 0.12 },  // Africa
      { cx: width * 0.68, cy: height * 0.42, rx: width * 0.1, ry: height * 0.13 },   // Asia
      { cx: width * 0.78, cy: height * 0.68, rx: width * 0.06, ry: height * 0.06 },  // Australia
    ];
    // Pins at ~20 institution locations
    const pins: { x: number; y: number; hue: number; delay: number; label: string }[] = [
      { x: width * 0.22, y: height * 0.34, hue: 220, delay: 10, label: "Princeton" },
      { x: width * 0.25, y: height * 0.38, hue: 140, delay: 14, label: "" },
      { x: width * 0.3, y: height * 0.32, hue: 280, delay: 18, label: "" },
      { x: width * 0.2, y: height * 0.42, hue: 55, delay: 22, label: "Janelia" },
      { x: width * 0.46, y: height * 0.3, hue: 180, delay: 26, label: "Cambridge" },
      { x: width * 0.5, y: height * 0.32, hue: 350, delay: 30, label: "" },
      { x: width * 0.44, y: height * 0.36, hue: 25, delay: 34, label: "" },
      { x: width * 0.52, y: height * 0.34, hue: 310, delay: 38, label: "" },
      { x: width * 0.65, y: height * 0.35, hue: 140, delay: 42, label: "" },
      { x: width * 0.7, y: height * 0.4, hue: 220, delay: 46, label: "" },
      { x: width * 0.72, y: height * 0.45, hue: 55, delay: 50, label: "" },
      { x: width * 0.78, y: height * 0.65, hue: 280, delay: 54, label: "" },
    ];
    return { particles, continents, pins };
  }, [width, height, scale]);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, data.particles, frame, scale);

    // "2024" title
    ctx.fillStyle = PALETTE.text.accent;
    ctx.font = `bold ${22 * scale}px system-ui, sans-serif`;
    ctx.textAlign = "center";
    ctx.globalAlpha = interpolate(frame, [0, 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.fillText("2024", width / 2, height * 0.12);

    // Continents (soft blobs)
    ctx.globalAlpha = 0.15;
    for (const c of data.continents) {
      ctx.fillStyle = `hsla(220, 25%, 50%, 1)`;
      ctx.beginPath();
      ctx.ellipse(c.cx, c.cy, c.rx, c.ry, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // Pins drop in
    ctx.globalAlpha = 1;
    for (const pin of data.pins) {
      const dropT = interpolate(frame - pin.delay, [0, 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      if (dropT <= 0) continue;
      const bounceY = pin.y - (1 - dropT) * 30 * scale;
      ctx.globalAlpha = dropT;
      drawPin(ctx, pin.x, bounceY, 8 * scale, `hsla(${pin.hue}, 55%, 60%, 0.9)`);
      if (pin.label) {
        ctx.fillStyle = PALETTE.text.dim;
        ctx.font = `${8 * scale}px system-ui, sans-serif`;
        ctx.textAlign = "center";
        ctx.fillText(pin.label, pin.x, bounceY + 12 * scale);
      }
    }

    // Counter
    ctx.globalAlpha = 1;
    const visiblePins = data.pins.filter(p => frame > p.delay).length;
    ctx.fillStyle = PALETTE.text.dim;
    ctx.font = `${14 * scale}px monospace`;
    ctx.textAlign = "center";
    ctx.fillText(`${Math.min(visiblePins * 17, 200)}+ scientists worldwide`, width / 2, height * 0.92);

    const fadeOut = interpolate(frame, [130, 148], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (fadeOut < 1) {
      ctx.fillStyle = `rgba(21,16,29,${1 - fadeOut})`;
      ctx.fillRect(0, 0, width, height);
    }
  });

  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};
