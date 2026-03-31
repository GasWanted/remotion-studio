import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantProps } from "../types";

// Text "if(sugar){eat();}" in code font, gets a big red X. Then "NO RULES" fades in below.

function seeded(s: number) {
  return () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
}

export const NoCodingRules: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;

  const fadeOut = interpolate(frame, [130, 148], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);
    ctx.globalAlpha = fadeOut;

    const cx = width / 2;
    const cy = height * 0.4;

    // Code text typing in
    const codeText = 'if(sugar){ eat(); }';
    const typeProgress = interpolate(frame, [5, 40], [0, 1], {
      extrapolateLeft: "clamp", extrapolateRight: "clamp",
    });
    const charsShown = Math.floor(typeProgress * codeText.length);
    const visibleCode = codeText.slice(0, charsShown);

    // Draw code text
    const fontSize = 16 * scale;
    ctx.font = `${fontSize}px monospace`;
    ctx.textAlign = "center";

    // Syntax coloring — draw char by char
    const codeColors: string[] = [];
    // Simple coloring: keywords purple, string/parens white, function green
    const keywords = ['if'];
    let fullStr = '';
    for (let i = 0; i < visibleCode.length; i++) {
      const ch = visibleCode[i];
      // Determine color based on position in original string
      if (i < 2) {
        codeColors.push('#cc77ff'); // 'if' keyword
      } else if (ch === '(' || ch === ')' || ch === '{' || ch === '}' || ch === ';') {
        codeColors.push('#888899');
      } else if (i >= 3 && i <= 7) {
        codeColors.push('#ffcc55'); // 'sugar' variable
      } else if (i >= 10 && i <= 12) {
        codeColors.push('#66ddaa'); // 'eat' function
      } else {
        codeColors.push('#ddeeff');
      }
    }

    // Measure total width to center
    const totalWidth = ctx.measureText(visibleCode).width;
    let drawX = cx - totalWidth / 2;

    for (let i = 0; i < visibleCode.length; i++) {
      ctx.fillStyle = codeColors[i];
      ctx.textAlign = "left";
      ctx.fillText(visibleCode[i], drawX, cy);
      drawX += ctx.measureText(visibleCode[i]).width;
    }

    // Cursor blink
    if (typeProgress < 1) {
      const blink = Math.sin(frame * 0.3) > 0;
      if (blink) {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(drawX + 2 * scale, cy - fontSize + 2 * scale, 2 * scale, fontSize);
      }
    }

    // Red X drawn over the code
    const xStart = 55;
    const xProgress = interpolate(frame, [xStart, xStart + 8], [0, 1], {
      extrapolateLeft: "clamp", extrapolateRight: "clamp",
    });

    if (xProgress > 0) {
      ctx.strokeStyle = "rgba(255, 40, 40, 0.85)";
      ctx.lineWidth = 4 * scale;
      ctx.lineCap = "round";

      const boxW = totalWidth * 0.6;
      const boxH = fontSize * 1.2;

      // First stroke of X: top-left to bottom-right
      const stroke1Prog = Math.min(xProgress * 2, 1);
      if (stroke1Prog > 0) {
        ctx.beginPath();
        ctx.moveTo(cx - boxW, cy - boxH);
        ctx.lineTo(
          cx - boxW + stroke1Prog * boxW * 2,
          cy - boxH + stroke1Prog * boxH * 2
        );
        ctx.stroke();
      }

      // Second stroke of X: top-right to bottom-left
      const stroke2Prog = Math.max((xProgress - 0.5) * 2, 0);
      if (stroke2Prog > 0) {
        ctx.beginPath();
        ctx.moveTo(cx + boxW, cy - boxH);
        ctx.lineTo(
          cx + boxW - stroke2Prog * boxW * 2,
          cy - boxH + stroke2Prog * boxH * 2
        );
        ctx.stroke();
      }

      // Impact shake on code text
      if (frame >= xStart && frame <= xStart + 5) {
        // Already drawn above, the shake adds to the effect of the X landing
      }
    }

    // "NO RULES" text fading in
    const noRulesStart = 80;
    const noRulesIn = interpolate(frame, [noRulesStart, noRulesStart + 15], [0, 1], {
      extrapolateLeft: "clamp", extrapolateRight: "clamp",
    });

    if (noRulesIn > 0) {
      const nrY = cy + 50 * scale;
      const nrScale = 0.8 + noRulesIn * 0.2;

      ctx.save();
      ctx.translate(cx, nrY);
      ctx.scale(nrScale, nrScale);

      ctx.fillStyle = `rgba(255, 255, 255, ${noRulesIn * 0.9})`;
      ctx.shadowColor = "rgba(255, 255, 255, 0.3)";
      ctx.shadowBlur = 10 * scale;
      ctx.font = `bold ${22 * scale}px sans-serif`;
      ctx.textAlign = "center";
      ctx.fillText("NO RULES", 0, 0);
      ctx.shadowBlur = 0;

      // Subtitle
      const subIn = interpolate(frame, [noRulesStart + 15, noRulesStart + 25], [0, 1], {
        extrapolateLeft: "clamp", extrapolateRight: "clamp",
      });
      if (subIn > 0) {
        ctx.fillStyle = `rgba(160, 180, 220, ${subIn * 0.6})`;
        ctx.font = `${9 * scale}px monospace`;
        ctx.fillText("just weighted connections", 0, 22 * scale);
      }

      ctx.restore();
    }

    // Dim code after X
    if (xProgress >= 1) {
      const dimA = interpolate(frame, [xStart + 8, xStart + 25], [0, 0.6], {
        extrapolateLeft: "clamp", extrapolateRight: "clamp",
      });
      ctx.fillStyle = `rgba(10, 10, 15, ${dimA})`;
      ctx.fillRect(cx - totalWidth / 2 - 10 * scale, cy - fontSize - 5 * scale, totalWidth + 20 * scale, fontSize + 25 * scale);
    }
  });

  return (
    <div style={{ width, height, backgroundColor: "#0a0a0f" }}>
      <canvas ref={canvasRef} width={width} height={height} />
    </div>
  );
};
