"use client";

import { Scene } from "@/lib/types";

export function NarrationBar({ scene }: { scene: Scene }) {
  return (
    <div className="mx-4 mt-3 px-5 py-3 rounded-lg bg-[#151520] border border-white/5">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-teal-400/60 uppercase tracking-wider">
          {scene.section}
        </span>
        <span className="text-xs text-white/30 font-mono">
          {scene.timeStart} – {scene.timeEnd} ({scene.durationSec}s)
        </span>
      </div>
      <p className="text-white/90 text-sm leading-relaxed">
        &ldquo;{scene.narration}&rdquo;
      </p>
    </div>
  );
}
