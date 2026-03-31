import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantProps } from "../types";

export const TypewriterGlow: React.FC<VariantProps> = ({
  sentence,
  width,
  height,
}) => {
  const frame = useCurrentFrame();
  const charsVisible = Math.floor(
    interpolate(frame, [15, 150], [0, sentence.length], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    })
  );

  const fadeOut = interpolate(frame, [200, 230], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const cursorOn = Math.floor(frame / 8) % 2 === 0 && charsVisible < sentence.length;

  return (
    <div
      style={{
        width,
        height,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "10%",
        backgroundColor: "#0a0a0f",
        opacity: fadeOut,
      }}
    >
      <span
        style={{
          fontFamily: "'Courier New', monospace",
          fontSize: width * 0.032,
          color: "#22ee77",
          textShadow: "0 0 10px #22ee77, 0 0 30px rgba(34,238,119,0.3)",
          lineHeight: 1.5,
        }}
      >
        {sentence.slice(0, charsVisible)}
        {cursorOn && (
          <span style={{ borderRight: "2px solid #22ee77", marginLeft: 2 }}>
            &nbsp;
          </span>
        )}
      </span>
    </div>
  );
};
