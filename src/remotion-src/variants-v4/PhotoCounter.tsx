import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate, Easing } from "remotion";
import type { VariantProps } from "../types";

function seeded(s: number) {
  return () => {
    s = (s * 16807) % 2147483647;
    return s / 2147483647;
  };
}

export const PhotoCounter: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;

  // Precompute tile gray values
  const tileGrays = useMemo(() => {
    const rand = seeded(404);
    const grays: number[] = [];
    for (let i = 0; i < 5000; i++) {
      grays.push(25 + rand() * 55);
    }
    return grays;
  }, []);

  const fadeOut = interpolate(frame, [130, 148], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);
    ctx.globalAlpha = fadeOut;

    const tileSize = Math.max(4, Math.round(6 * scale));
    const gap = 1;
    const cols = Math.floor(width / (tileSize + gap));
    const rows = Math.floor((height - 40 * scale) / (tileSize + gap));
    const totalTiles = cols * rows;

    // How many tiles to show — ramp up quickly
    const tilesProgress = interpolate(frame, [0, 120], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.in(Easing.cubic),
    });
    const tilesVisible = Math.floor(tilesProgress * totalTiles);

    // Draw tiles in a scan pattern (left-to-right, top-to-bottom)
    const offsetX = (width - cols * (tileSize + gap)) / 2;
    const offsetY = 8 * scale;

    for (let i = 0; i < tilesVisible; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      if (row >= rows) break;

      const x = offsetX + col * (tileSize + gap);
      const y = offsetY + row * (tileSize + gap);
      const g = tileGrays[i % tileGrays.length];

      ctx.fillStyle = `rgb(${Math.round(g)}, ${Math.round(g)}, ${Math.round(g * 0.95)})`;
      ctx.fillRect(x, y, tileSize, tileSize);
    }

    // Counter
    const countValue = interpolate(frame, [0, 125], [0, 21000000], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.in(Easing.cubic),
    });
    const countStr = Math.floor(countValue).toLocaleString("en-US");

    // Counter background
    const counterY = height - 30 * scale;
    ctx.fillStyle = "rgba(10, 10, 15, 0.85)";
    ctx.fillRect(0, counterY - 8 * scale, width, 38 * scale);

    // Counter text
    ctx.globalAlpha = fadeOut;
    ctx.fillStyle = "#ffffff";
    ctx.font = `bold ${18 * scale}px monospace`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(countStr, width / 2, counterY + 10 * scale);

    // Sub-label
    ctx.globalAlpha = fadeOut * 0.5;
    ctx.fillStyle = "#999";
    ctx.font = `${9 * scale}px monospace`;
    ctx.fillText("photographs", width / 2, counterY + 24 * scale);
  });

  return (
    <div style={{ width, height, backgroundColor: "#0a0a0f" }}>
      <canvas ref={canvasRef} width={width} height={height} />
    </div>
  );
};
