import React from "react";
import { useCurrentFrame, interpolate, Easing } from "remotion";
import type { VariantProps } from "../types";

export const KineticTypography: React.FC<VariantProps> = ({
  sentence,
  width,
  height,
}) => {
  const frame = useCurrentFrame();
  const words = sentence.split(" ");
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
        flexWrap: "wrap",
        gap: width * 0.015,
        padding: "8%",
        backgroundColor: "#0a0a0f",
        opacity: fadeOut,
      }}
    >
      {words.map((word, i) => {
        const delay = i * 12 + 10;
        const progress = interpolate(frame, [delay, delay + 20], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.bezier(0, 0, 0.2, 1),
        });
        const y = (1 - progress) * 60 * (i % 2 === 0 ? -1 : 1);
        return (
          <span
            key={i}
            style={{
              fontFamily: "Georgia, serif",
              fontSize: width * 0.04,
              fontWeight: "bold",
              color: "white",
              opacity: progress,
              transform: `translateY(${y}px)`,
              display: "inline-block",
            }}
          >
            {word}
          </span>
        );
      })}
    </div>
  );
};
