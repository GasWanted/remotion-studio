import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate, Easing } from "remotion";
import type { VariantProps } from "../types";

function seeded(s: number) {
  return () => {
    s = (s * 16807) % 2147483647;
    return s / 2147483647;
  };
}

export const SegmentationScan: React.FC<VariantProps> = ({
  width,
  height,
}) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;

  const blobs = useMemo(() => {
    const rand = seeded(505);
    const items: {
      cx: number;
      cy: number;
      rx: number;
      ry: number;
      rotation: number;
      gray: number;
      hue: number;
      sat: number;
      lum: number;
    }[] = [];
    for (let i = 0; i < 45; i++) {
      items.push({
        cx: 0.08 + rand() * 0.84,
        cy: 0.08 + rand() * 0.84,
        rx: 12 + rand() * 35,
        ry: 10 + rand() * 28,
        rotation: rand() * Math.PI,
        gray: 35 + rand() * 50,
        hue: Math.floor(rand() * 360),
        sat: 55 + rand() * 35,
        lum: 45 + rand() * 20,
      });
    }
    return items;
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

    // Scan line position
    const scanX = interpolate(frame, [15, 120], [-0.05, 1.05], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.inOut(Easing.cubic),
    });
    const scanPx = scanX * width;

    // Draw blobs
    for (const b of blobs) {
      const bx = b.cx * width;
      const by = b.cy * height;
      const brx = b.rx * scale;
      const bry = b.ry * scale;

      const colorized = bx < scanPx;

      ctx.save();
      ctx.translate(bx, by);
      ctx.rotate(b.rotation);

      if (colorized) {
        ctx.fillStyle = `hsla(${b.hue}, ${b.sat}%, ${b.lum}%, 0.7)`;
        ctx.strokeStyle = `hsla(${b.hue}, ${b.sat}%, ${b.lum + 15}%, 0.9)`;
        ctx.lineWidth = 1.5 * scale;
      } else {
        const g = Math.round(b.gray);
        ctx.fillStyle = `rgba(${g}, ${g}, ${g}, 0.5)`;
        ctx.strokeStyle = `rgba(${g + 20}, ${g + 20}, ${g + 20}, 0.3)`;
        ctx.lineWidth = 1 * scale;
      }

      ctx.beginPath();
      ctx.ellipse(0, 0, brx, bry, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.restore();
    }

    // Scan line
    if (scanPx > 0 && scanPx < width) {
      // Glow
      const grad = ctx.createLinearGradient(scanPx - 20 * scale, 0, scanPx + 20 * scale, 0);
      grad.addColorStop(0, "rgba(0, 200, 255, 0)");
      grad.addColorStop(0.4, "rgba(0, 200, 255, 0.1)");
      grad.addColorStop(0.5, "rgba(0, 200, 255, 0.4)");
      grad.addColorStop(0.6, "rgba(0, 200, 255, 0.1)");
      grad.addColorStop(1, "rgba(0, 200, 255, 0)");
      ctx.fillStyle = grad;
      ctx.fillRect(scanPx - 20 * scale, 0, 40 * scale, height);

      // Line
      ctx.strokeStyle = "rgba(0, 220, 255, 0.8)";
      ctx.lineWidth = 2 * scale;
      ctx.beginPath();
      ctx.moveTo(scanPx, 0);
      ctx.lineTo(scanPx, height);
      ctx.stroke();
    }

    // "AI segmentation" label
    ctx.globalAlpha = fadeOut * 0.5;
    ctx.fillStyle = "#0cc";
    ctx.font = `${10 * scale}px monospace`;
    ctx.textAlign = "center";
    const labelAlpha = interpolate(frame, [15, 30], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    ctx.globalAlpha = fadeOut * 0.5 * labelAlpha;
    ctx.fillText("AI segmentation", width / 2, height - 12 * scale);
  });

  return (
    <div style={{ width, height, backgroundColor: "#0a0a0f" }}>
      <canvas ref={canvasRef} width={width} height={height} />
    </div>
  );
};
