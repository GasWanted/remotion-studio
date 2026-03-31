import type { VariantDef } from "../types";
import { ScaleZoomOut } from "./ScaleZoomOut";
import { ThreeCircles } from "./ThreeCircles";
import { NumberAlone } from "./NumberAlone";
import { FinalContrast } from "./FinalContrast";
import { CounterCrash } from "./CounterCrash";
import { DotField } from "./DotField";
import { FadeToBlack } from "./FadeToBlack";
import { TimelineBookend } from "./TimelineBookend";
import { EndCard } from "./EndCard";

export const VARIANTS_V9: VariantDef[] = [
  { id: "ScaleZoomOut", label: "Scale Zoom Out", component: ScaleZoomOut },
  { id: "ThreeCircles", label: "Three Circles", component: ThreeCircles },
  { id: "NumberAlone", label: "Number Alone", component: NumberAlone },
  { id: "FinalContrast", label: "Final Contrast", component: FinalContrast },
  { id: "CounterCrash", label: "Counter Crash", component: CounterCrash },
  { id: "DotField", label: "Dot Field", component: DotField },
  { id: "FadeToBlack", label: "Fade to Black", component: FadeToBlack },
  { id: "TimelineBookend", label: "Timeline Bookend", component: TimelineBookend },
  { id: "EndCard", label: "End Card", component: EndCard },
];
