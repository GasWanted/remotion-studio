import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantProps } from "../types";

// Split screen: left NORMAL (green feed node pulses), right BRAINWASHED (feed dark, retreat blazes red)
function seeded(s: number) {
  return () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
}

export const SplitScreen: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;

  const network = useMemo(() => {
    const rand = seeded(77);
    const nodes: { x: number; y: number; type: "feed" | "retreat" | "normal" }[] = [];
    // Feed node at index 0, retreat node at index 1
    nodes.push({ x: 0, y: -30 * scale, type: "feed" });
    nodes.push({ x: 0, y: 40 * scale, type: "retreat" });
    for (let i = 0; i < 30; i++) {
      const a = rand() * Math.PI * 2;
      const r = 30 + rand() * 80;
      nodes.push({ x: Math.cos(a) * r * scale, y: Math.sin(a) * r * scale, type: "normal" });
    }
    const edges: [number, number][] = [];
    for (let i = 2; i < nodes.length; i++) {
      if (rand() < 0.4) edges.push([i, 0]);
      if (rand() < 0.3) edges.push([i, 1]);
      for (let j = i + 1; j < nodes.length; j++) {
        if (rand() < 0.06) edges.push([i, j]);
      }
    }
    return { nodes, edges };
  }, [scale]);

  const fadeOut = interpolate(frame, [130, 148], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const reveal = interpolate(frame, [10, 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);
    ctx.globalAlpha = fadeOut;

    const leftCX = width * 0.25;
    const rightCX = width * 0.75;
    const cy = height * 0.55;

    // Divider
    ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(width / 2, height * 0.05);
    ctx.lineTo(width / 2, height * 0.95);
    ctx.stroke();

    // Labels
    const fontSize = Math.max(9, 11 * scale);
    ctx.font = `bold ${fontSize}px Courier New`;
    ctx.textAlign = "center";
    ctx.fillStyle = `rgba(100, 220, 140, ${0.7 * reveal})`;
    ctx.fillText("NORMAL", leftCX, height * 0.08);
    ctx.fillStyle = `rgba(255, 70, 70, ${0.7 * reveal})`;
    ctx.fillText("BRAINWASHED", rightCX, height * 0.08);

    // Feed pulse (green, left side)
    const feedPulse = 0.5 + 0.5 * Math.sin(frame * 0.35);
    // Retreat blaze (red, right side)
    const retreatBlaze = 0.4 + 0.6 * Math.abs(Math.sin(frame * 0.6));

    for (const side of ["left", "right"] as const) {
      const cx = side === "left" ? leftCX : rightCX;
      const isRight = side === "right";
      const sideAlpha = reveal;

      ctx.globalAlpha = fadeOut * sideAlpha;

      // Edges
      for (const [a, b] of network.edges) {
        const na = network.nodes[a], nb = network.nodes[b];
        ctx.strokeStyle = "rgba(80, 130, 180, 0.15)";
        ctx.lineWidth = 0.5 * scale;
        ctx.beginPath();
        ctx.moveTo(cx + na.x, cy + na.y);
        ctx.lineTo(cx + nb.x, cy + nb.y);
        ctx.stroke();
      }

      // Nodes
      for (let i = 0; i < network.nodes.length; i++) {
        const n = network.nodes[i];
        let r = 2.5 * scale;
        let color = "rgba(80, 130, 180, 0.5)";

        if (i === 0) {
          // Feed node
          if (!isRight) {
            const p = feedPulse;
            r = (3 + p * 4) * scale;
            color = `rgba(80, 255, 120, ${0.5 + p * 0.5})`;
            // Glow
            ctx.shadowColor = "rgba(80, 255, 120, 0.6)";
            ctx.shadowBlur = p * 15 * scale;
          } else {
            // Dark on right
            r = 2.5 * scale;
            color = "rgba(60, 60, 70, 0.5)";
            ctx.shadowColor = "transparent";
            ctx.shadowBlur = 0;
          }
        } else if (i === 1) {
          // Retreat node
          if (isRight) {
            r = (3 + retreatBlaze * 5) * scale;
            color = `rgba(255, 50, 30, ${0.5 + retreatBlaze * 0.5})`;
            ctx.shadowColor = "rgba(255, 50, 30, 0.7)";
            ctx.shadowBlur = retreatBlaze * 18 * scale;
          } else {
            r = 2.5 * scale;
            color = "rgba(80, 130, 180, 0.4)";
            ctx.shadowColor = "transparent";
            ctx.shadowBlur = 0;
          }
        } else {
          ctx.shadowColor = "transparent";
          ctx.shadowBlur = 0;
        }

        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(cx + n.x, cy + n.y, r, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.shadowColor = "transparent";
      ctx.shadowBlur = 0;

      // Sub-labels
      const subSize = Math.max(7, 8 * scale);
      ctx.font = `${subSize}px Courier New`;
      ctx.textAlign = "center";
      if (!isRight) {
        ctx.fillStyle = `rgba(80, 255, 120, ${0.6 * reveal})`;
        ctx.fillText("FEED 61Hz", cx, cy + network.nodes[0].y - 12 * scale);
      } else {
        ctx.fillStyle = `rgba(100, 100, 110, ${0.5 * reveal})`;
        ctx.fillText("FEED 0Hz", cx, cy + network.nodes[0].y - 12 * scale);
        ctx.fillStyle = `rgba(255, 70, 50, ${0.6 * reveal})`;
        ctx.fillText("RETREAT 143Hz", cx, cy + network.nodes[1].y + 16 * scale);
      }
    }
  });

  return (
    <div style={{ width, height, backgroundColor: "#0a0a0f" }}>
      <canvas ref={canvasRef} width={width} height={height} />
    </div>
  );
};
