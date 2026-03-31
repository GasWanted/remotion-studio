import React from "react";
import { useCurrentFrame, interpolate, Easing } from "remotion";
import type { VariantProps } from "../types";

// Shows one word at a time, large and centered, cycling through the sentence
export const FocusWord: React.FC<VariantProps> = ({
  sentence,
  width,
  height,
}) => {
  const frame = useCurrentFrame();
  const words = sentence.split(" ");
  const framesPerWord = Math.floor(160 / words.length);
  const startFrame = 15;

  const fadeOut = interpolate(frame, [200, 230], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const wordIndex = Math.min(
    words.length - 1,
    Math.max(0, Math.floor((frame - startFrame) / framesPerWord))
  );

  const wordFrame = (frame - startFrame) - wordIndex * framesPerWord;
  const wordIn = interpolate(wordFrame, [0, 5], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0, 0, 0.2, 1),
  });
  const scale = interpolate(wordFrame, [0, 5], [1.3, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0, 0, 0.2, 1),
  });

  if (frame < startFrame) return <div style={{ width, height, backgroundColor: "#0a0a0f" }} />;

  return (
    <div
      style={{
        width,
        height,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#0a0a0f",
        opacity: fadeOut,
      }}
    >
      <span
        style={{
          fontFamily: "Georgia, serif",
          fontSize: width * 0.08,
          fontWeight: "bold",
          color: "white",
          opacity: wordIn,
          transform: `scale(${scale})`,
          display: "inline-block",
        }}
      >
        {words[wordIndex]}
      </span>
    </div>
  );
};
