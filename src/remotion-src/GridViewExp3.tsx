import React from "react";
import { VARIANTS_EXP3 } from "./variants-exp3";
import { Cell } from "./Cell";
export const GridViewExp3: React.FC<{ sentence: string }> = ({ sentence }) => (
  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 640px)", gridTemplateRows: "repeat(3, 360px)", width: 1920, height: 1080, backgroundColor: "#0a0a0f" }}>
    {VARIANTS_EXP3.slice(0, 9).map((v, i) => <Cell key={v.id} variant={v} sentence={sentence} index={i} />)}
  </div>
);
