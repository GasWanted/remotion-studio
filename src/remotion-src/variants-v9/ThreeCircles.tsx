import React, { useRef, useEffect } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantProps } from "../types";

// Three circles side by side showing visceral scale difference:
// tiny dot (fly 138K), medium circle (mouse 70M), massive circle overflowing frame (human 86B)

export const ThreeCircles: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;

  const fadeOut = interpolate(frame, [130, 148], [1, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);
    ctx.globalAlpha = fadeOut;

    const cy = height * 0.44;

    // Radii proportional to cube root of neuron count (volume metaphor)
    // fly: 138K -> cbrt(138000) ~ 51.7 => r = 2px
    // mouse: 70M -> cbrt(70000000) ~ 412 => r = 16px (8x fly)
    // human: 86B -> cbrt(86000000000) ~ 4414 => r = 171px (86x fly)
    // Normalize so human fills/overflows screen
    const flyR = 1.5 * scale;
    const mouseR = 14 * scale;
    const humanR = 180 * scale;

    // Stagger appearance
    const flyA = interpolate(frame, [10, 25], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const mouseA = interpolate(frame, [30, 50], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const humanA = interpolate(frame, [55, 80], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

    // Positions: spread across width
    const flyX = width * 0.18;
    const mouseX = width * 0.42;
    const humanX = width * 0.75;

    // Fly circle
    if (flyA > 0) {
      ctx.globalAlpha = fadeOut * flyA;
      ctx.fillStyle = "rgba(100, 180, 255, 0.9)";
      ctx.shadowColor = "#64b4ff";
      ctx.shadowBlur = 6 * scale;
      ctx.beginPath();
      ctx.arc(flyX, cy, flyR, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Label
      ctx.fillStyle = `rgba(100, 180, 255, ${flyA * 0.85})`;
      ctx.font = `bold ${8 * scale}px monospace`;
      ctx.textAlign = "center";
      ctx.fillText("Fly", flyX, cy + flyR + 18 * scale);
      ctx.fillStyle = `rgba(180, 210, 255, ${flyA * 0.5})`;
      ctx.font = `${6.5 * scale}px monospace`;
      ctx.fillText("138,000", flyX, cy + flyR + 28 * scale);
    }

    // Mouse circle
    if (mouseA > 0) {
      ctx.globalAlpha = fadeOut * mouseA;
      const grad = ctx.createRadialGradient(mouseX, cy, 0, mouseX, cy, mouseR);
      grad.addColorStop(0, "rgba(120, 255, 160, 0.6)");
      grad.addColorStop(0.7, "rgba(80, 200, 120, 0.3)");
      grad.addColorStop(1, "rgba(60, 160, 100, 0.1)");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(mouseX, cy, mouseR * mouseA, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = "rgba(120, 255, 160, 0.5)";
      ctx.lineWidth = 1 * scale;
      ctx.beginPath();
      ctx.arc(mouseX, cy, mouseR * mouseA, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = `rgba(120, 255, 160, ${mouseA * 0.85})`;
      ctx.font = `bold ${8 * scale}px monospace`;
      ctx.textAlign = "center";
      ctx.fillText("Mouse", mouseX, cy + mouseR + 18 * scale);
      ctx.fillStyle = `rgba(180, 255, 200, ${mouseA * 0.5})`;
      ctx.font = `${6.5 * scale}px monospace`;
      ctx.fillText("70,000,000", mouseX, cy + mouseR + 28 * scale);
    }

    // Human circle — massive, extends beyond canvas
    if (humanA > 0) {
      ctx.globalAlpha = fadeOut * humanA;
      const grad = ctx.createRadialGradient(humanX, cy, 0, humanX, cy, humanR);
      grad.addColorStop(0, "rgba(255, 200, 100, 0.4)");
      grad.addColorStop(0.4, "rgba(255, 160, 60, 0.2)");
      grad.addColorStop(0.8, "rgba(255, 120, 40, 0.08)");
      grad.addColorStop(1, "rgba(255, 100, 30, 0.02)");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(humanX, cy, humanR * humanA, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = "rgba(255, 200, 100, 0.35)";
      ctx.lineWidth = 1.5 * scale;
      ctx.beginPath();
      ctx.arc(humanX, cy, humanR * humanA, 0, Math.PI * 2);
      ctx.stroke();

      // Label at top since circle extends past bottom
      ctx.fillStyle = `rgba(255, 200, 100, ${humanA * 0.85})`;
      ctx.font = `bold ${8 * scale}px monospace`;
      ctx.textAlign = "center";
      const labelY = Math.min(cy + humanR * humanA + 18 * scale, height - 20 * scale);
      ctx.fillText("Human", humanX, labelY);
      ctx.fillStyle = `rgba(255, 230, 180, ${humanA * 0.5})`;
      ctx.font = `${6.5 * scale}px monospace`;
      ctx.fillText("86,000,000,000", humanX, labelY + 10 * scale);
    }

    ctx.globalAlpha = 1;
  });

  return (
    <div style={{ width, height, backgroundColor: "#0a0a0f" }}>
      <canvas ref={canvasRef} width={width} height={height} />
    </div>
  );
};
