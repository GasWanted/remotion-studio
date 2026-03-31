import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate, Easing } from "remotion";
import type { VariantProps } from "../types";

function seeded(s: number) {
  return () => {
    s = (s * 16807) % 2147483647;
    return s / 2147483647;
  };
}

export const WavelengthCompare: React.FC<VariantProps> = ({
  width,
  height,
}) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;

  // Hidden structures that only resolve when wavelength is short
  const structures = useMemo(() => {
    const rand = seeded(303);
    const items: { x: number; y: number; w: number; h: number; type: number }[] = [];
    for (let i = 0; i < 30; i++) {
      items.push({
        x: 0.1 + rand() * 0.8,
        y: 0.55 + rand() * 0.3,
        w: 3 + rand() * 12,
        h: 3 + rand() * 10,
        type: Math.floor(rand() * 3),
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

    // Morph progress: 0 = light wave (wide), 1 = electron wave (tight)
    const morphT = interpolate(frame, [20, 100], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.inOut(Easing.cubic),
    });

    const waveY = height * 0.3;
    const waveAmp = 30 * scale;
    // Wavelength: 400nm visible -> ~0.005nm electron, represented as pixels
    const wavelengthPx = interpolate(morphT, [0, 1], [120 * scale, 8 * scale]);
    const freq = (2 * Math.PI) / wavelengthPx;

    // Wave color: red -> blue
    const r = Math.round(interpolate(morphT, [0, 1], [255, 60]));
    const g = Math.round(interpolate(morphT, [0, 1], [80, 120]));
    const b = Math.round(interpolate(morphT, [0, 1], [80, 255]));

    // Draw wave
    ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, 0.9)`;
    ctx.lineWidth = 2 * scale;
    ctx.beginPath();
    const phaseShift = frame * 0.1;
    for (let x = 0; x <= width; x += 1) {
      const y = waveY + Math.sin(x * freq + phaseShift) * waveAmp;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Glow on wave
    ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, 0.15)`;
    ctx.lineWidth = 8 * scale;
    ctx.beginPath();
    for (let x = 0; x <= width; x += 2) {
      const y = waveY + Math.sin(x * freq + phaseShift) * waveAmp;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Label wavelength
    ctx.globalAlpha = fadeOut * 0.6;
    ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
    ctx.font = `${11 * scale}px monospace`;
    ctx.textAlign = "left";
    const nmValue = interpolate(morphT, [0, 1], [550, 0.005]);
    const label = nmValue > 1 ? `${nmValue.toFixed(0)} nm` : `${nmValue.toFixed(3)} nm`;
    ctx.fillText(`\u03BB = ${label}`, 15 * scale, waveY - waveAmp - 12 * scale);
    const modeLabel = morphT < 0.5 ? "visible light" : "electron beam";
    ctx.fillText(modeLabel, 15 * scale, waveY - waveAmp - 26 * scale);

    // Structures beneath — resolve proportional to morphT
    ctx.globalAlpha = fadeOut;
    const structureY = height * 0.6;
    const separation = height * 0.32;

    // Background tissue area
    ctx.fillStyle = "rgba(30, 28, 35, 0.5)";
    ctx.fillRect(width * 0.05, structureY, width * 0.9, separation);

    for (const s of structures) {
      const sx = s.x * width;
      const sy = structureY + (s.y - 0.55) / 0.3 * separation;
      const sw = s.w * scale;
      const sh = s.h * scale;

      // Blur at low morphT, sharp at high morphT
      const opacity = interpolate(morphT, [0.2, 0.8], [0.05, 0.7], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      });
      const blurSize = interpolate(morphT, [0, 1], [12 * scale, 0]);

      if (s.type === 0) {
        // Cell membrane — oval
        ctx.strokeStyle = `rgba(180, 180, 200, ${opacity})`;
        ctx.lineWidth = (1.5 + morphT) * scale;
        ctx.beginPath();
        ctx.ellipse(sx, sy, sw + blurSize, sh + blurSize, 0, 0, Math.PI * 2);
        ctx.stroke();
      } else if (s.type === 1) {
        // Synapse — small dot
        ctx.fillStyle = `rgba(200, 160, 100, ${opacity})`;
        ctx.beginPath();
        ctx.arc(sx, sy, (sw * 0.3 + blurSize) * 0.5, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Mitochondria — elongated
        ctx.fillStyle = `rgba(140, 180, 140, ${opacity})`;
        ctx.beginPath();
        ctx.ellipse(sx, sy, (sw + blurSize) * 0.7, (sh * 0.3 + blurSize) * 0.5, 0.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  });

  return (
    <div style={{ width, height, backgroundColor: "#0a0a0f" }}>
      <canvas ref={canvasRef} width={width} height={height} />
    </div>
  );
};
