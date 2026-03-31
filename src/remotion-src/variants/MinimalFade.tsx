import React from "react";
import { useCurrentFrame, interpolate, Easing } from "remotion";
import type { VariantProps } from "../types";

// Clean, minimal — whole sentence fades in slowly, holds, fades out
export const MinimalFade: React.FC<VariantProps> = ({
  sentence,
  width,
  height,
}) => {
  const frame = useCurrentFrame();
  const fadeIn = interpolate(frame, [20, 70], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0, 0, 0.2, 1),
  });
  const fadeOut = interpolate(frame, [190, 230], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const y = interpolate(frame, [20, 70], [15, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0, 0, 0.2, 1),
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
        padding: "12%",
      }}
    >
      <span
        style={{
          fontFamily: "Helvetica, Arial, sans-serif",
          fontSize: width * 0.032,
          fontWeight: 200,
          color: "white",
          textAlign: "center",
          lineHeight: 1.7,
          letterSpacing: 0.5,
          opacity: fadeIn * fadeOut,
          transform: `translateY(${y}px)`,
        }}
      >
        {sentence}
      </span>
    </div>
  );
};
