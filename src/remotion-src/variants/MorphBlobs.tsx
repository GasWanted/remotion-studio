import React from "react";
import { useCurrentFrame, interpolate, Easing } from "remotion";
import type { VariantProps } from "../types";

export const MorphBlobs: React.FC<VariantProps> = ({
  sentence,
  width,
  height,
}) => {
  const frame = useCurrentFrame();
  const textOpacity = interpolate(frame, [30, 60], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0, 0, 0.2, 1),
  });
  const fadeOut = interpolate(frame, [200, 230], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const blobs = [
    { x: 30, y: 40, color: "#4400ff", size: 35, speed: 0.02, phase: 0 },
    { x: 70, y: 60, color: "#ff4400", size: 30, speed: 0.025, phase: 2 },
    { x: 50, y: 30, color: "#00aa88", size: 25, speed: 0.03, phase: 4 },
  ];

  return (
    <div
      style={{
        width,
        height,
        position: "relative",
        backgroundColor: "#0a0a0f",
        overflow: "hidden",
        opacity: fadeOut,
      }}
    >
      {blobs.map((b, i) => {
        const x = b.x + Math.sin(frame * b.speed + b.phase) * 10;
        const y = b.y + Math.cos(frame * b.speed * 0.7 + b.phase) * 8;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${x}%`,
              top: `${y}%`,
              width: `${b.size}%`,
              height: `${b.size}%`,
              borderRadius: "50%",
              background: `radial-gradient(circle, ${b.color}60, transparent 70%)`,
              filter: "blur(30px)",
              transform: "translate(-50%, -50%)",
            }}
          />
        );
      })}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "10%",
        }}
      >
        <span
          style={{
            fontFamily: "Georgia, serif",
            fontSize: width * 0.035,
            color: "white",
            textAlign: "center",
            lineHeight: 1.6,
            opacity: textOpacity,
          }}
        >
          {sentence}
        </span>
      </div>
    </div>
  );
};
