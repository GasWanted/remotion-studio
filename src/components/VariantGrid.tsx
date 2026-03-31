"use client";

import { useState } from "react";
import { Scene } from "@/lib/types";
import { VariantPlayer } from "./VariantPlayer";

interface Props {
  scene: Scene;
  selectedVariant: number | null;
  onSelect: (variant: number) => void;
}

export function VariantGrid({ scene, selectedVariant, onSelect }: Props) {
  const [hoveredVariant, setHoveredVariant] = useState<number | null>(null);

  return (
    <div className="flex-1 grid grid-cols-3 grid-rows-3 gap-2 min-h-0">
      {Array.from({ length: 9 }, (_, i) => {
        const variant = i + 1;
        const isSelected = selectedVariant === variant;
        const isPicked = scene.status === "final" && scene.pickedVariant === variant;
        const isHovered = hoveredVariant === variant;

        return (
          <button
            key={variant}
            onClick={() => onSelect(variant)}
            onMouseEnter={() => setHoveredVariant(variant)}
            onMouseLeave={() => setHoveredVariant(null)}
            className={`
              relative rounded-lg overflow-hidden transition-all duration-150
              ${isSelected
                ? "ring-2 ring-teal-400 shadow-lg shadow-teal-400/20 scale-[1.02]"
                : isPicked
                  ? "ring-2 ring-green-400"
                  : "ring-1 ring-white/10 hover:ring-white/30"
              }
            `}
          >
            {/* Remotion Player — all autoplay */}
            <VariantPlayer
              shotNum={scene.id}
              variantIndex={variant}
              width={640}
              height={360}
              durationFrames={scene.durationFrames || 150}
            />

            {/* Variant number badge */}
            <div className="absolute top-1.5 left-2 z-10">
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded ${
                  isSelected
                    ? "bg-teal-400/30 text-teal-300"
                    : isPicked
                      ? "bg-green-400/30 text-green-300"
                      : "bg-black/50 text-white/50"
                }`}
              >
                {variant}
              </span>
            </div>

            {/* Selected overlay */}
            {isSelected && (
              <div className="absolute inset-0 bg-teal-400/5 pointer-events-none" />
            )}

            {/* Picked indicator */}
            {isPicked && (
              <div className="absolute top-1.5 right-2 z-10">
                <span className="text-green-400 text-xs">✓</span>
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
