import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate, Easing } from "remotion";
import type { VariantProps } from "../types";

// Simulated electron microscopy cross-sections stacking into 3D
function seeded(s: number) {
  return () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
}

export const EM_Slices: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Generate "neuron blobs" for each slice
  const slices = useMemo(() => {
    const rand = seeded(71);
    return Array.from({ length: 20 }, (_, sliceIdx) => {
      const blobs = Array.from({ length: 15 + Math.floor(rand() * 10) }, () => ({
        x: rand() * 0.8 + 0.1,
        y: rand() * 0.8 + 0.1,
        r: 0.02 + rand() * 0.04,
        hue: 200 + rand() * 40,
      }));
      return blobs;
    });
  }, []);

  const fadeOut = interpolate(frame, [200, 235], [1, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);
    ctx.globalAlpha = fadeOut;

    const visibleSlices = Math.floor(interpolate(frame, [10, 170], [1, slices.length], {
      extrapolateLeft: "clamp", extrapolateRight: "clamp",
    }));

    // Draw slices in perspective stack
    const sliceW = width * 0.5;
    const sliceH = height * 0.5;

    for (let i = 0; i < visibleSlices; i++) {
      const slice = slices[i];
      const age = visibleSlices - i;
      const alpha = Math.min(1, age / 4);

      // Offset for 3D perspective
      const offsetX = width * 0.2 + i * 8;
      const offsetY = height * 0.2 - i * 4;

      ctx.save();
      ctx.globalAlpha = fadeOut * alpha * 0.8;

      // Slice background
      ctx.fillStyle = "rgba(15, 15, 25, 0.9)";
      ctx.fillRect(offsetX, offsetY, sliceW, sliceH);
      ctx.strokeStyle = "rgba(100, 120, 160, 0.3)";
      ctx.lineWidth = 0.5;
      ctx.strokeRect(offsetX, offsetY, sliceW, sliceH);

      // Neuron blobs
      for (const blob of slice) {
        const bx = offsetX + blob.x * sliceW;
        const by = offsetY + blob.y * sliceH;
        const br = blob.r * sliceW;

        ctx.fillStyle = `hsla(${blob.hue}, 30%, 40%, 0.5)`;
        ctx.beginPath();
        ctx.arc(bx, by, br, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = `hsla(${blob.hue}, 30%, 50%, 0.3)`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }

      ctx.restore();
    }

    // Slice counter
    ctx.globalAlpha = fadeOut;
    ctx.font = `${Math.max(10, width * 0.022)}px Courier New`;
    ctx.fillStyle = "rgba(150, 170, 200, 0.5)";
    ctx.fillText(`${visibleSlices} / ${slices.length} slices`, width * 0.06, height * 0.92);
  });

  return (
    <div style={{ width, height, backgroundColor: "#0a0a0f" }}>
      <canvas ref={canvasRef} width={width} height={height} />
    </div>
  );
};
