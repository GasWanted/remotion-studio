import React, { useRef, useEffect } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantProps } from "../types";

// 4 MDN nodes in a ring with signals chasing around, frequency counter accelerating to 143Hz
function seeded(s: number) {
  return () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
}

export const FeedbackRing: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;

  const fadeOut = interpolate(frame, [130, 148], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const ringReveal = interpolate(frame, [5, 25], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const speedup = interpolate(frame, [25, 120], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);
    ctx.globalAlpha = fadeOut;

    const cx = width / 2;
    const cy = height * 0.48;
    const ringR = 55 * scale;
    const nodeR = 8 * scale;

    const nodeCount = 4;
    const nodeAngles = Array.from({ length: nodeCount }, (_, i) => (i / nodeCount) * Math.PI * 2 - Math.PI / 2);
    const nodePositions = nodeAngles.map(a => ({
      x: cx + Math.cos(a) * ringR,
      y: cy + Math.sin(a) * ringR,
    }));

    // Ring path (edges between consecutive nodes)
    ctx.globalAlpha = fadeOut * ringReveal;
    for (let i = 0; i < nodeCount; i++) {
      const next = (i + 1) % nodeCount;
      const na = nodePositions[i], nb = nodePositions[next];
      ctx.strokeStyle = "rgba(255, 80, 50, 0.3)";
      ctx.lineWidth = 2 * scale;
      ctx.beginPath();
      ctx.moveTo(na.x, na.y);
      ctx.lineTo(nb.x, nb.y);
      ctx.stroke();

      // Arrow head
      const angle = Math.atan2(nb.y - na.y, nb.x - na.x);
      const midX = (na.x + nb.x) / 2;
      const midY = (na.y + nb.y) / 2;
      const arrLen = 5 * scale;
      ctx.fillStyle = "rgba(255, 80, 50, 0.4)";
      ctx.beginPath();
      ctx.moveTo(midX + Math.cos(angle) * arrLen, midY + Math.sin(angle) * arrLen);
      ctx.lineTo(midX + Math.cos(angle + 2.5) * arrLen * 0.7, midY + Math.sin(angle + 2.5) * arrLen * 0.7);
      ctx.lineTo(midX + Math.cos(angle - 2.5) * arrLen * 0.7, midY + Math.sin(angle - 2.5) * arrLen * 0.7);
      ctx.fill();
    }

    // Signal: chasing dot(s) around the ring, speed increases
    const baseSpeed = 0.015;
    const currentSpeed = baseSpeed + speedup * 0.12;
    const numSignals = speedup > 0.6 ? 3 : speedup > 0.3 ? 2 : 1;

    for (let s = 0; s < numSignals; s++) {
      const offset = s / numSignals;
      // Accumulated angle
      let accum = 0;
      for (let f = 0; f < frame; f++) {
        const sp = baseSpeed + interpolate(f, [25, 120], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) * 0.12;
        accum += sp;
      }
      const t = ((accum + offset) % 1);
      const segIdx = Math.floor(t * nodeCount);
      const segT = (t * nodeCount) - segIdx;
      const a = nodePositions[segIdx];
      const b = nodePositions[(segIdx + 1) % nodeCount];
      const sx = a.x + (b.x - a.x) * segT;
      const sy = a.y + (b.y - a.y) * segT;

      const intensity = 0.5 + speedup * 0.5;
      ctx.shadowColor = `rgba(255, 60, 30, ${intensity})`;
      ctx.shadowBlur = (8 + speedup * 12) * scale;
      ctx.fillStyle = `rgba(255, ${Math.floor(100 - speedup * 60)}, ${Math.floor(50 - speedup * 30)}, ${0.8 + speedup * 0.2})`;
      ctx.beginPath();
      ctx.arc(sx, sy, (3 + speedup * 2) * scale, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;

    // Node circles (MDN1-4)
    for (let i = 0; i < nodeCount; i++) {
      const p = nodePositions[i];
      const pulse = 0.6 + 0.4 * Math.sin(frame * (0.2 + speedup * 0.4) + i * 1.5);
      ctx.fillStyle = `rgba(255, 70, 40, ${0.5 + pulse * 0.3 * (0.3 + speedup * 0.7)})`;
      ctx.strokeStyle = `rgba(255, 100, 60, ${0.4 + speedup * 0.3})`;
      ctx.lineWidth = 1.5 * scale;
      ctx.beginPath();
      ctx.arc(p.x, p.y, nodeR, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Label
      const lblSize = Math.max(6, 7 * scale);
      ctx.font = `${lblSize}px Courier New`;
      ctx.textAlign = "center";
      ctx.fillStyle = "rgba(255, 200, 180, 0.6)";
      const labelR = ringR + 16 * scale;
      ctx.fillText(`MDN${i + 1}`, cx + Math.cos(nodeAngles[i]) * labelR, cy + Math.sin(nodeAngles[i]) * labelR + 3);
    }

    // Frequency counter
    const hz = Math.floor(20 + speedup * 123);
    const counterSize = Math.max(10, 14 * scale);
    ctx.font = `bold ${counterSize}px Courier New`;
    ctx.textAlign = "center";
    const counterGlow = 0.5 + speedup * 0.5;
    ctx.fillStyle = `rgba(255, ${Math.floor(120 - speedup * 70)}, ${Math.floor(60 - speedup * 40)}, ${counterGlow})`;
    ctx.fillText(`${hz} Hz`, cx, height * 0.88);

    // Title
    const titleSize = Math.max(8, 9 * scale);
    ctx.font = `${titleSize}px Courier New`;
    ctx.fillStyle = "rgba(255, 200, 180, 0.5)";
    ctx.fillText("self-amplifying feedback loop", cx, height * 0.07);
  });

  return (
    <div style={{ width, height, backgroundColor: "#0a0a0f" }}>
      <canvas ref={canvasRef} width={width} height={height} />
    </div>
  );
};
