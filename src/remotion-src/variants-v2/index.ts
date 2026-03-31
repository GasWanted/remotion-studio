import type { VariantDef } from "../types";
import { FlyWireframe } from "./FlyWireframe";
import { BrainConnectome } from "./BrainConnectome";
import { CompoundEyes } from "./CompoundEyes";
import { EvolutionTimeline } from "./EvolutionTimeline";
import { NeuronTrace } from "./NeuronTrace";
import { SpikeRaster } from "./SpikeRaster";
import { FlyFormation } from "./FlyFormation";
import { EM_Slices } from "./EM_Slices";
import { SynapseCounter } from "./SynapseCounter";

export const VARIANTS_V2: VariantDef[] = [
  { id: "FlyWireframe", label: "Fly Wireframe", component: FlyWireframe },
  { id: "BrainConnectome", label: "Brain Connectome", component: BrainConnectome },
  { id: "CompoundEyes", label: "Compound Eyes", component: CompoundEyes },
  { id: "EvolutionTimeline", label: "Evolution Timeline", component: EvolutionTimeline },
  { id: "NeuronTrace", label: "Neuron Trace", component: NeuronTrace },
  { id: "SpikeRaster", label: "Spike Raster", component: SpikeRaster },
  { id: "FlyFormation", label: "Fly Formation", component: FlyFormation },
  { id: "EM_Slices", label: "EM Slices", component: EM_Slices },
  { id: "SynapseCounter", label: "Synapse Counter", component: SynapseCounter },
];
