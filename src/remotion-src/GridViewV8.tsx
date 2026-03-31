import React from "react";
import { VARIANTS_V8 } from "./variants-v8";
import { Cell } from "./Cell";
export const GridViewV8: React.FC<{ sentence: string }> = ({ sentence }) => (
  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 640px)", gridTemplateRows: "repeat(3, 360px)", width: 1920, height: 1080, backgroundColor: "#0a0a0f" }}>
    {VARIANTS_V8.slice(0, 9).map((v, i) => <Cell key={v.id} variant={v} sentence={sentence} index={i} />)}
  </div>
);
