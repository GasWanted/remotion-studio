import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantDef } from "./types";

interface CellProps {
  variant: VariantDef;
  sentence: string;
  index: number;
}

export const Cell: React.FC<CellProps> = ({ variant, sentence, index }) => {
  const frame = useCurrentFrame();
  const Component = variant.component;

  // Label fades out after 2 seconds
  const labelOpacity = interpolate(frame, [0, 10, 50, 70], [0, 1, 1, 0], {
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        width: 640,
        height: 360,
        position: "relative",
        overflow: "hidden",
        borderRight: index % 3 < 2 ? "1px solid #1a1a2a" : "none",
        borderBottom: index < 6 ? "1px solid #1a1a2a" : "none",
      }}
    >
      <Component sentence={sentence} width={640} height={360} />
      <div
        style={{
          position: "absolute",
          top: 8,
          left: 10,
          fontFamily: "'Courier New', monospace",
          fontSize: 11,
          color: "rgba(255,255,255,0.6)",
          opacity: labelOpacity,
          pointerEvents: "none",
        }}
      >
        {index + 1}. {variant.label}
      </div>
    </div>
  );
};
