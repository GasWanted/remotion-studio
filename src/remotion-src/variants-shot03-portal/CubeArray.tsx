import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantProps } from "../types";
import { seeded, C, drawPerson, easeOutBack, accent } from "./portal-utils";

/**
 * Card Flip: Grid of cards that flip to reveal scientist silhouettes.
 * Sequential wave pattern. Blue backs, orange front accents on white.
 * 3D flip perspective effect.
 */
export const CubeArray: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;

  const cards = useMemo(() => {
    const rand = seeded(5006);
    const cols = 12, rows = 8;
    const cardW = (width * 0.82) / cols;
    const cardH = (height * 0.55) / rows;
    const startX = width * 0.09;
    const startY = height * 0.28;

    return Array.from({ length: cols * rows }, (_, i) => {
      const col = i % cols, row = Math.floor(i / cols);
      // Wave delay: diagonal wave from top-left
      const delay = (col + row) * 1.8 + rand() * 2;
      return {
        x: startX + col * cardW + cardW / 2,
        y: startY + row * cardH + cardH / 2,
        w: cardW * 0.88,
        h: cardH * 0.88,
        delay,
        isBlue: rand() > 0.4,
      };
    });
  }, [width, height]);

  const fadeOut = interpolate(frame, [130, 148], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = C.bg;
    ctx.fillRect(0, 0, width, height);

    ctx.globalAlpha = fadeOut;

    // Header
    const ha = interpolate(frame, [0, 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = ha * fadeOut;
    ctx.fillStyle = C.text;
    ctx.font = `600 ${16 * scale}px system-ui`;
    ctx.textAlign = "center";
    ctx.fillText("2024", width / 2, height * 0.08);
    ctx.fillStyle = C.textDim;
    ctx.font = `${9 * scale}px system-ui`;
    ctx.fillText("research team", width / 2, height * 0.14);
    ctx.globalAlpha = fadeOut;

    let visibleCount = 0;

    for (const card of cards) {
      const flipT = interpolate(frame - card.delay, [0, 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      if (flipT <= 0) continue;

      ctx.globalAlpha = fadeOut;

      // Flip angle (0 = back showing, PI = front showing)
      const flipAngle = flipT * Math.PI;
      const showFront = flipAngle > Math.PI / 2;
      const scaleX = Math.abs(Math.cos(flipAngle));

      if (scaleX < 0.02) continue;

      const hw = card.w / 2 * scaleX;
      const hh = card.h / 2;

      // Drop shadow (grows during flip)
      const shadowOffset = Math.sin(flipAngle) * 3 * scale;
      ctx.fillStyle = `rgba(0,0,0,${0.06 + Math.sin(flipAngle) * 0.04})`;
      ctx.fillRect(card.x - hw + shadowOffset, card.y - hh + shadowOffset, hw * 2, hh * 2);

      if (showFront) {
        visibleCount++;

        // Front face (white with accent border)
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(card.x - hw, card.y - hh, hw * 2, hh * 2);

        // Top accent bar
        const accentColor = card.isBlue ? C.blue : C.orange;
        ctx.fillStyle = accentColor;
        ctx.fillRect(card.x - hw, card.y - hh, hw * 2, 3 * scale);

        // Gradient overlay
        const grad = ctx.createLinearGradient(card.x, card.y - hh, card.x, card.y + hh);
        grad.addColorStop(0, "rgba(255,255,255,0)");
        grad.addColorStop(1, "rgba(0,0,0,0.03)");
        ctx.fillStyle = grad;
        ctx.fillRect(card.x - hw, card.y - hh, hw * 2, hh * 2);

        // Person silhouette
        if (scaleX > 0.3) {
          const personSize = Math.min(hw, hh) * 0.55;
          drawPerson(ctx, card.x, card.y + hh * 0.1, personSize,
            card.isBlue ? "rgba(64,144,255,0.35)" : "rgba(255,140,0,0.35)");
        }

        // Border
        ctx.strokeStyle = "rgba(200,200,210,0.4)";
        ctx.lineWidth = 0.8;
        ctx.strokeRect(card.x - hw, card.y - hh, hw * 2, hh * 2);
      } else {
        // Back face (colored)
        const backGrad = ctx.createLinearGradient(card.x - hw, card.y - hh, card.x + hw, card.y + hh);
        backGrad.addColorStop(0, card.isBlue ? C.blue : C.orange);
        backGrad.addColorStop(1, card.isBlue ? C.blueDark : C.orangeDark);
        ctx.fillStyle = backGrad;
        ctx.fillRect(card.x - hw, card.y - hh, hw * 2, hh * 2);

        // Pattern on back (subtle cross)
        ctx.strokeStyle = "rgba(255,255,255,0.12)";
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(card.x - hw * 0.3, card.y - hh * 0.3);
        ctx.lineTo(card.x + hw * 0.3, card.y + hh * 0.3);
        ctx.moveTo(card.x + hw * 0.3, card.y - hh * 0.3);
        ctx.lineTo(card.x - hw * 0.3, card.y + hh * 0.3);
        ctx.stroke();

        // Border
        ctx.strokeStyle = "rgba(255,255,255,0.15)";
        ctx.lineWidth = 0.8;
        ctx.strokeRect(card.x - hw, card.y - hh, hw * 2, hh * 2);
      }
    }

    // Counter
    ctx.globalAlpha = fadeOut;
    ctx.fillStyle = C.text;
    ctx.font = `600 ${12 * scale}px monospace`;
    ctx.textAlign = "right";
    ctx.fillText(`${Math.min(visibleCount, 96)}+`, width * 0.92, height * 0.94);
  });

  return (
    <div style={{ width, height, backgroundColor: C.bg }}>
      <canvas ref={canvasRef} width={width} height={height} />
    </div>
  );
};
