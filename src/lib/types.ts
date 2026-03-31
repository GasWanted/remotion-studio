export interface Scene {
  id: number;
  compositionId: string;
  narration: string;
  timeStart: string;
  timeEnd: string;
  durationSec: number;
  durationFrames: number;
  section: string;
  visualConcept: string;
  status: "pending" | "picking" | "final";
  pickedVariant?: number; // 1-9
  remixNotes?: string;
}

export interface Variant {
  index: number; // 1-9
  label: string;
}
