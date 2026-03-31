import React from "react";
import { VARIANTS } from "./variants";

export const SingleView: React.FC<{
  sentence: string;
  variantId: string;
}> = ({ sentence, variantId }) => {
  const variant = VARIANTS.find((v) => v.id === variantId);
  if (!variant) return null;
  const Component = variant.component;
  return (
    <div style={{ width: 1920, height: 1080, backgroundColor: "#0a0a0f" }}>
      <Component sentence={sentence} width={1920} height={1080} />
    </div>
  );
};
