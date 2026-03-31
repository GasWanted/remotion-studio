import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { seeded, drawBg, makeParticles, drawParticles, PALETTE, fadeInOut } from "../theme";

// Shot 42 — Zoom into weights on edges: thick/thin, positive/negative (4s = 120 frames)
export const Scene042: React.FC<{ width: number; height: number }> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const particles = useMemo(() => makeParticles(25, width, height, scale), [width, height, scale]);

  const data = useMemo(() => {
    const connections = [
      { x1: width * 0.2, y1: height * 0.35, x2: width * 0.5, y2: height * 0.35, w: 4.2, label: "4.2" },
      { x1: width * 0.5, y1: height * 0.35, x2: width * 0.8, y2: height * 0.35, w: 0.3, label: "0.3" },
      { x1: width * 0.2, y1: height * 0.65, x2: width * 0.5, y2: height * 0.65, w: -1.7, label: "-1.7" },
    ];
    return { connections };
  }, [width, height]);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const alpha = fadeInOut(frame, 120);
    drawBg(ctx, width, height);
    drawParticles(ctx, particles, frame, scale);
    ctx.globalAlpha = alpha;

    const zoomT = interpolate(frame, [5, 35], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

    for (let i = 0; i < data.connections.length; i++) {
      const c = data.connections[i];
      const showT = interpolate(frame, [10 + i * 20, 25 + i * 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      if (showT <= 0) continue;

      const absW = Math.abs(c.w);
      const thickness = (1 + absW * 1.2) * scale;
      const isNeg = c.w < 0;

      // Edge
      ctx.strokeStyle = isNeg
        ? `hsla(350, 55%, 55%, ${showT * 0.7})`
        : `hsla(180, 45%, 55%, ${showT * 0.7})`;
      ctx.lineWidth = thickness * showT;
      ctx.beginPath();
      ctx.moveTo(c.x1, c.y1);
      ctx.lineTo(c.x2, c.y2);
      ctx.stroke();

      // Nodes
      for (const [nx, ny] of [[c.x1, c.y1], [c.x2, c.y2]] as [number, number][]) {
        ctx.fillStyle = `hsla(280, 45%, 60%, ${showT * 0.8})`;
        ctx.beginPath();
        ctx.arc(nx, ny, 12 * scale * showT, 0, Math.PI * 2);
        ctx.fill();
      }

      // Weight label
      const labelAlpha = interpolate(frame, [20 + i * 20, 30 + i * 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      ctx.globalAlpha = alpha * labelAlpha;
      ctx.fillStyle = isNeg ? PALETTE.accent.red : PALETTE.text.accent;
      ctx.font = `bold ${18 * scale}px monospace`;
      ctx.textAlign = "center";
      ctx.fillText(c.label, (c.x1 + c.x2) / 2, c.y1 - 15 * scale);

      // Descriptor
      ctx.fillStyle = PALETTE.text.dim;
      ctx.font = `${12 * scale}px system-ui, sans-serif`;
      const desc = absW > 3 ? "thick" : absW < 1 ? "thin" : "negative (inhibitory)";
      ctx.fillText(desc, (c.x1 + c.x2) / 2, c.y1 + 25 * scale);
      ctx.globalAlpha = alpha;
    }

    // Bottom label
    const lblT = interpolate(frame, [70, 85], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = alpha * lblT;
    ctx.fillStyle = PALETTE.text.dim;
    ctx.font = `${14 * scale}px system-ui, sans-serif`;
    ctx.textAlign = "center";
    ctx.fillText("measured from biology", width / 2, height * 0.88);

    ctx.globalAlpha = 1;
  });

  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};
