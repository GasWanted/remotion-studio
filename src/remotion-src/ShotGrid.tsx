import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { Cell } from "./Cell";
import type { VariantDef } from "./types";

/** Factory: creates a 3x3 grid component from any 9 variants */
export const makeShotGrid = (variants: VariantDef[]): React.FC<{ sentence: string }> => {
  const Grid: React.FC<{ sentence: string }> = ({ sentence }) => (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 640px)",
        gridTemplateRows: "repeat(3, 360px)",
        width: 1920,
        height: 1080,
        backgroundColor: "#0a0a0f",
      }}
    >
      {variants.slice(0, 9).map((v, i) => (
        <Cell key={v.id} variant={v} sentence={sentence} index={i} />
      ))}
    </div>
  );
  return Grid;
};

/** Portal-themed 3x3 grid: white bg, dark text labels */
export const makeShotGridPortal = (variants: VariantDef[]): React.FC<{ sentence: string }> => {
  const Grid: React.FC<{ sentence: string }> = ({ sentence }) => (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 640px)",
        gridTemplateRows: "repeat(3, 360px)",
        width: 1920,
        height: 1080,
        backgroundColor: "#f0f0f4",
      }}
    >
      {variants.slice(0, 9).map((v, i) => (
        <CellPortal key={v.id} variant={v} sentence={sentence} index={i} />
      ))}
    </div>
  );
  return Grid;
};

/** Portal-style cell: light borders, dark label text */
const CellPortal: React.FC<{ variant: VariantDef; sentence: string; index: number }> = ({ variant, sentence, index }) => {
  const frame = useCurrentFrame();
  const Component = variant.component;
  const labelOpacity = interpolate(frame, [0, 10, 50, 70], [0, 1, 1, 0], { extrapolateRight: "clamp" });

  return (
    <div style={{ width: 640, height: 360, position: "relative", overflow: "hidden",
      borderRight: index % 3 < 2 ? "1px solid #d0d0d8" : "none",
      borderBottom: index < 6 ? "1px solid #d0d0d8" : "none",
    }}>
      <Component sentence={sentence} width={640} height={360} />
      <div style={{ position: "absolute", top: 8, left: 10, fontFamily: "'Courier New', monospace",
        fontSize: 11, color: "rgba(60,60,80,0.6)", opacity: labelOpacity, pointerEvents: "none",
      }}>
        {index + 1}. {variant.label}
      </div>
    </div>
  );
};
