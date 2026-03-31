import type { VariantDef } from "../types";

export interface ShotDef {
  id: string;          // Remotion composition ID, e.g. "Shot-03"
  label: string;       // Short description
  narration: string;   // Spoken text during this shot
  durationFrames: number; // at 30fps
  variants: VariantDef[];
}

// Registry will be populated by importing from individual shot files
export const SHOTS: ShotDef[] = [];

export function registerShot(shot: ShotDef) {
  SHOTS.push(shot);
}
