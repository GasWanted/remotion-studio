import type { VariantDef } from "../types";
import { NeuralGrowth } from "./NeuralGrowth";
import { CellDivision } from "./CellDivision";
import { DNAHelix } from "./DNAHelix";
import { ParticleSwarm } from "./ParticleSwarm";
import { BranchingTree } from "./BranchingTree";
import { ConstellationMap } from "./ConstellationMap";
import { RadialPulse } from "./RadialPulse";
import { OrganicFlow } from "./OrganicFlow";
import { SynapseFireworks } from "./SynapseFireworks";

export const VARIANTS: VariantDef[] = [
  { id: "NeuralGrowth", label: "Neural Growth", component: NeuralGrowth },
  { id: "CellDivision", label: "Cell Division", component: CellDivision },
  { id: "DNAHelix", label: "DNA Helix", component: DNAHelix },
  { id: "ParticleSwarm", label: "Particle Swarm", component: ParticleSwarm },
  { id: "BranchingTree", label: "Branching Tree", component: BranchingTree },
  { id: "ConstellationMap", label: "Constellation Map", component: ConstellationMap },
  { id: "RadialPulse", label: "Radial Pulse", component: RadialPulse },
  { id: "OrganicFlow", label: "Organic Flow", component: OrganicFlow },
  { id: "SynapseFireworks", label: "Synapse Fireworks", component: SynapseFireworks },
];
