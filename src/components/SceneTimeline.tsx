"use client";

import { Scene } from "@/lib/types";

interface Props {
  scenes: Scene[];
  currentId: number;
  onSelect: (id: number) => void;
}

export function SceneTimeline({ scenes, currentId, onSelect }: Props) {
  return (
    <div className="border-t border-white/10 bg-[#0d0d18] px-4 py-2">
      <div className="flex items-center gap-0.5 overflow-x-auto scrollbar-hide">
        {scenes.map((scene) => {
          const isCurrent = scene.id === currentId;
          const isFinal = scene.status === "final";

          return (
            <button
              key={scene.id}
              onClick={() => onSelect(scene.id)}
              title={`${scene.compositionId}: "${scene.narration.slice(0, 50)}..."`}
              className={`
                flex-shrink-0 w-6 h-6 rounded text-[8px] font-bold transition-all
                ${isCurrent
                  ? "bg-teal-400 text-[#0a0a12] scale-125 z-10"
                  : isFinal
                    ? "bg-green-500/30 text-green-400 hover:bg-green-500/40"
                    : "bg-white/5 text-white/20 hover:bg-white/10 hover:text-white/40"
                }
              `}
            >
              {scene.id}
            </button>
          );
        })}
      </div>
    </div>
  );
}
