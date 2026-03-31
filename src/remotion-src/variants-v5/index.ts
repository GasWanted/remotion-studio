import type { VariantDef } from "../types";
import { SingleNeuron } from "./SingleNeuron";
import { ThresholdBar } from "./ThresholdBar";
import { SpikeCascade } from "./SpikeCascade";
import { SugarToFeed } from "./SugarToFeed";
import { BehaviorChecklist } from "./BehaviorChecklist";
import { SpikeRaster } from "./SpikeRaster";
import { BrainInJar } from "./BrainInJar";
import { NoCodingRules } from "./NoCodingRules";
import { ExponentialMultiply } from "./ExponentialMultiply";

export const VARIANTS_V5: VariantDef[] = [
  { id: "SingleNeuron", label: "Single Neuron", component: SingleNeuron },
  { id: "ThresholdBar", label: "Threshold Bar", component: ThresholdBar },
  { id: "SpikeCascade", label: "Spike Cascade", component: SpikeCascade },
  { id: "SugarToFeed", label: "Sugar → Feed", component: SugarToFeed },
  { id: "BehaviorChecklist", label: "Behavior Checklist", component: BehaviorChecklist },
  { id: "SpikeRaster", label: "Spike Raster", component: SpikeRaster },
  { id: "BrainInJar", label: "Brain in Jar", component: BrainInJar },
  { id: "NoCodingRules", label: "No Coding Rules", component: NoCodingRules },
  { id: "ExponentialMultiply", label: "Exponential Multiply", component: ExponentialMultiply },
];
