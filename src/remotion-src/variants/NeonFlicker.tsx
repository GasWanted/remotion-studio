import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantProps } from "../types";

// Seeded random for deterministic flicker
function seeded(seed: number) {
  return () => {
    seed = (seed * 16807 + 0) % 2147483647;
    return seed / 2147483647;
  };
}

export const NeonFlicker: React.FC<VariantProps> = ({
  sentence,
  width,
  height,
}) => {
  const frame = useCurrentFrame();
  const rand = seeded(42);
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
        padding: "8%",
        opacity: fadeOut,
      }}
    >
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center" }}>
        {sentence.split("").map((ch, i) => {
          const onFrame = Math.floor(rand() * 80) + 10;
          const flickerDone = frame > onFrame + 20;
          const flickering = frame >= onFrame && !flickerDone;
          const visible = frame >= onFrame;
          const flicker = flickering ? (Math.floor(frame * 3 + i) % 3 > 0 ? 1 : 0.2) : 1;

          return (
            <span
              key={i}
              style={{
                fontFamily: "'Courier New', monospace",
                fontSize: width * 0.04,
                fontWeight: "bold",
                color: visible ? "#ff44aa" : "transparent",
                textShadow: visible
                  ? "0 0 8px #ff44aa, 0 0 25px rgba(255,68,170,0.5)"
                  : "none",
                opacity: visible ? flicker : 0,
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
