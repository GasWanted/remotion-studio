export interface SceneDef {
  id: string;             // e.g. "hook-001"
  label: string;          // e.g. "Shot 01 — Connectome fade in"
  narration: string;      // text spoken during this scene
  component: React.FC<{ width: number; height: number }>;
  durationFrames: number; // at 30fps
}
