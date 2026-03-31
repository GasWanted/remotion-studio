import type { VariantDef } from "../types";
import { FlyBodyReveal } from "./FlyBodyReveal";
import { JointDiagram } from "./JointDiagram";
import { GravityDrop } from "./GravityDrop";
import { BrainBodyBridge } from "./BrainBodyBridge";
import { FeedbackLoop } from "./FeedbackLoop";
import { TripodGait } from "./TripodGait";
import { ForagingCourse } from "./ForagingCourse";
import { SpeedLabel } from "./SpeedLabel";
import { PipelineStack } from "./PipelineStack";

export const VARIANTS_V6: VariantDef[] = [
  { id: "FlyBodyReveal", label: "Fly Body Reveal", component: FlyBodyReveal },
  { id: "JointDiagram", label: "Joint Diagram", component: JointDiagram },
  { id: "GravityDrop", label: "Gravity Drop", component: GravityDrop },
  { id: "BrainBodyBridge", label: "Brain-Body Bridge", component: BrainBodyBridge },
  { id: "FeedbackLoop", label: "Feedback Loop", component: FeedbackLoop },
  { id: "TripodGait", label: "Tripod Gait", component: TripodGait },
  { id: "ForagingCourse", label: "Foraging Course", component: ForagingCourse },
  { id: "SpeedLabel", label: "Speed Label", component: SpeedLabel },
  { id: "PipelineStack", label: "Pipeline Stack", component: PipelineStack },
];
