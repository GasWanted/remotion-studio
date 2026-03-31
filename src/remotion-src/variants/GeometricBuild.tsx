import React from "react";
import { useCurrentFrame, interpolate, Easing } from "remotion";
import type { VariantProps } from "../types";

export const GeometricBuild: React.FC<VariantProps> = ({
  sentence,
  width,
  height,
}) => {
  const frame = useCurrentFrame();
  const fadeOut = interpolate(frame, [200, 230], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Lines that build a frame around the text
  const lineProgress = (delay: number) =>
    interpolate(frame, [delay, delay + 30], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    });

  const textProgress = interpolate(frame, [50, 80], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0, 0, 0.2, 1),
  });

  const p = width * 0.1;

  return (
    <div
      style={{
        width,
        height,
        position: "relative",
        backgroundColor: "#0a0a0f",
        opacity: fadeOut,
      }}
    >
      <svg
        width={width}
        height={height}
        style={{ position: "absolute", inset: 0 }}
      >
        {/* Top line */}
        <line
          x1={p}
          y1={p}
          x2={p + (width - 2 * p) * lineProgress(5)}
          y2={p}
          stroke="#ffaa22"
          strokeWidth={2}
        />
        {/* Right line */}
        <line
          x1={width - p}
          y1={p}
          x2={width - p}
          y2={p + (height - 2 * p) * lineProgress(15)}
          stroke="#ffaa22"
          strokeWidth={2}
        />
        {/* Bottom line */}
        <line
          x1={width - p}
          y1={height - p}
          x2={width - p - (width - 2 * p) * lineProgress(25)}
          y2={height - p}
          stroke="#ffaa22"
          strokeWidth={2}
        />
        {/* Left line */}
        <line
          x1={p}
          y1={height - p}
          x2={p}
          y2={height - p - (height - 2 * p) * lineProgress(35)}
          stroke="#ffaa22"
          strokeWidth={2}
        />
        {/* Corner dots */}
        {[
          [p, p, 5],
          [width - p, p, 15],
          [width - p, height - p, 25],
          [p, height - p, 35],
        ].map(([cx, cy, delay], i) => (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r={3 * lineProgress(delay as number)}
            fill="#ffaa22"
          />
        ))}
      </svg>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "15%",
        }}
      >
        <span
          style={{
            fontFamily: "Helvetica, Arial, sans-serif",
            fontSize: width * 0.032,
            fontWeight: 300,
            color: "#ffaa22",
            textAlign: "center",
            lineHeight: 1.6,
            opacity: textProgress,
            letterSpacing: 1,
          }}
        >
          {sentence}
        </span>
      </div>
    </div>
  );
};
