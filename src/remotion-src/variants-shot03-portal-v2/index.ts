import type { VariantDef } from "../types";
import { SpiralGalaxy } from "./SpiralGalaxy";
import { RainDrop } from "./RainDrop";
import { DnaHelix } from "./DnaHelix";
import { Phyllotaxis } from "./Phyllotaxis";
import { GridAssemble } from "./GridAssemble";
import { DominoChain } from "./DominoChain";
import { Typewriter } from "./Typewriter";
import { PendulumWave } from "./PendulumWave";
import { TargetLock } from "./TargetLock";

export const VARIANTS_SHOT03_PORTAL_V2: VariantDef[] = [
  { id: "SpiralGalaxy", label: "Spiral Galaxy", component: SpiralGalaxy },
  { id: "RainDrop", label: "Rain Drop", component: RainDrop },
  { id: "DnaHelix", label: "DNA Helix", component: DnaHelix },
  { id: "Phyllotaxis", label: "Phyllotaxis", component: Phyllotaxis },
  { id: "GridAssemble", label: "Grid Assemble", component: GridAssemble },
  { id: "DominoChain", label: "Domino Chain", component: DominoChain },
  { id: "Typewriter", label: "Typewriter", component: Typewriter },
  { id: "PendulumWave", label: "Pendulum Wave", component: PendulumWave },
  { id: "TargetLock", label: "Target Lock", component: TargetLock },
];
