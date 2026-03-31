import React from "react";
import { useCurrentFrame, interpolate, Easing } from "remotion";
import type { VariantProps } from "../types";

export const SplitReveal: React.FC<VariantProps> = ({
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
        gap: `${width * 0.01}px ${width * 0.018}px`,
        padding: "8%",
        backgroundColor: "#0a0a0f",
        opacity: fadeOut,
      }}
    >
      {words.map((word, i) => {
        const delay = i * 10 + 15;
        const clipProgress = interpolate(frame, [delay, delay + 15], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.bezier(0.16, 1, 0.3, 1),
        });
        return (
          <span
            key={i}
            style={{
              fontFamily: "Helvetica, Arial, sans-serif",
              fontSize: width * 0.04,
              fontWeight: 300,
              color: "#e0e0e0",
              clipPath: `inset(0 ${(1 - clipProgress) * 100}% 0 0)`,
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
