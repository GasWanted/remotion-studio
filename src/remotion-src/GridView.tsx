import React from "react";
import { VARIANTS } from "./variants";
import { Cell } from "./Cell";

export const GridView: React.FC<{ sentence: string }> = ({ sentence }) => {
  return (
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
      {VARIANTS.slice(0, 9).map((variant, i) => (
        <Cell
          key={variant.id}
          variant={variant}
          sentence={sentence}
          index={i}
        />
      ))}
    </div>
  );
};
