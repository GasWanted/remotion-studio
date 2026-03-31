"use client";

import { Scene } from "@/lib/types";
import { VariantPlayer } from "./VariantPlayer";

export function PreviousScene({ scene }: { scene: Scene | null }) {
  if (!scene) {
    return (
      <div className="h-full flex flex-col rounded-lg border border-white/5 bg-[#0e0e18] p-3">
        <span className="text-xs text-white/20 mb-2">PREVIOUS</span>
        <div className="flex-1 flex items-center justify-center text-white/10 text-xs">
          Start of video
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col rounded-lg border border-white/5 bg-[#0e0e18] p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-white/20">PREVIOUS</span>
        {scene.status === "final" && scene.pickedVariant && (
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-500/20 text-green-400">
            ✓ v{scene.pickedVariant}
          </span>
        )}
      </div>

      {/* Actual Remotion Player showing the picked variant */}
      <div className="flex-1 rounded overflow-hidden mb-2 min-h-[120px]">
        {scene.status === "final" && scene.pickedVariant ? (
          <VariantPlayer
            shotNum={scene.id}
            variantIndex={scene.pickedVariant}
            width={640}
            height={360}
            durationFrames={scene.durationFrames || 150}
            isPlaying={true}
          />
        ) : (
          <div className="w-full h-full bg-[#1a1a2e] flex items-center justify-center">
            <span className="text-white/15 text-xs">{scene.compositionId} — not picked</span>
          </div>
        )}
      </div>

      <p className="text-[10px] text-white/30 leading-relaxed line-clamp-3">
        &ldquo;{scene.narration}&rdquo;
      </p>
    </div>
  );
}
