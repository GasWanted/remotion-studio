import type { VariantDef } from "../types";
import { SplitScreen } from "./SplitScreen";
import { BarCompare } from "./BarCompare";
import { FlyReverse } from "./FlyReverse";
import { FeedbackRing } from "./FeedbackRing";
import { EmergentDiscovery } from "./EmergentDiscovery";
import { SilentVsLoud } from "./SilentVsLoud";
import { PreservedChecks } from "./PreservedChecks";
import { SpikeContrast } from "./SpikeContrast";
import { RunFromFood } from "./RunFromFood";

export const VARIANTS_V8: VariantDef[] = [
  { id: "SplitScreen", label: "Split Screen", component: SplitScreen },
  { id: "BarCompare", label: "Bar Compare", component: BarCompare },
  { id: "FlyReverse", label: "Fly Reverse", component: FlyReverse },
  { id: "FeedbackRing", label: "Feedback Ring", component: FeedbackRing },
  { id: "EmergentDiscovery", label: "Emergent Discovery", component: EmergentDiscovery },
  { id: "SilentVsLoud", label: "Silent vs Loud", component: SilentVsLoud },
  { id: "PreservedChecks", label: "Preserved Checks", component: PreservedChecks },
  { id: "SpikeContrast", label: "Spike Contrast", component: SpikeContrast },
  { id: "RunFromFood", label: "Run From Food", component: RunFromFood },
];
