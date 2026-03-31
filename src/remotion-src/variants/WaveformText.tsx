import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantProps } from "../types";

export const WaveformText: React.FC<VariantProps> = ({
  sentence,
  width,
  height,
}) => {
  const frame = useCurrentFrame();
  const fadeIn = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const fadeOut = interpolate(frame, [200, 230], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        width,
        height,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#0a0a0f",
        opacity: fadeIn * fadeOut,
      }}
    >
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", padding: "8%" }}>
        {sentence.split("").map((ch, i) => {
          const y = Math.sin((i * 0.3 + frame * 0.08)) * 12;
          const hue = (i * 8 + frame * 2) % 360;
          return (
            <span
              key={i}
              style={{
                fontFamily: "'Courier New', monospace",
                fontSize: width * 0.038,
                fontWeight: "bold",
                color: `hsl(${hue}, 70%, 65%)`,
                transform: `translateY(${y}px)`,
                display: "inline-block",
                whiteSpace: "pre",
              }}
            >
              {ch}
            </span>
          );
        })}
      </div>
    </div>
  );
};
