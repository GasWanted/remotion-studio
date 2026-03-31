"use client";

import { Scene } from "@/lib/types";

interface Props {
  scene: Scene;
  selectedVariant: number | null;
  onSelect: (variant: number) => void;
}

export function VariantGrid({ scene, selectedVariant, onSelect }: Props) {
  return (
    <div className="flex-1 grid grid-cols-3 grid-rows-3 gap-2 min-h-0">
      {Array.from({ length: 9 }, (_, i) => {
        const variant = i + 1;
        const isSelected = selectedVariant === variant;
        const isPicked = scene.status === "final" && scene.pickedVariant === variant;

        return (
          <button
            key={variant}
            onClick={() => onSelect(variant)}
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
            {/* Placeholder for Remotion Player — each cell will be a Player instance */}
            <div className="absolute inset-0 bg-[#1a1a2e] flex items-center justify-center">
              <div className="text-center">
                <span className="text-white/30 text-lg font-bold">{variant}</span>
                <span className="text-white/10 text-[10px] block mt-1">
                  {scene.compositionId} v{variant}
                </span>
              </div>
            </div>

            {/* Variant number badge */}
            <div className="absolute top-1.5 left-2 z-10">
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded ${
                  isSelected
                    ? "bg-teal-400/30 text-teal-300"
                    : isPicked
                      ? "bg-green-400/30 text-green-300"
                      : "bg-white/10 text-white/40"
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
