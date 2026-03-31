import type { VariantDef } from "../types";
import { VARIANTS_SHOT_003 } from "./shot_003";
import { VARIANTS_SHOT_004 } from "./shot_004";
import { VARIANTS_SHOT_005 } from "./shot_005";
import { VARIANTS_SHOT_006 } from "./shot_006";
import { VARIANTS_SHOT_007 } from "./shot_007";
import { VARIANTS_SHOT_008 } from "./shot_008";
import { VARIANTS_SHOT_009 } from "./shot_009";
import { VARIANTS_SHOT_010 } from "./shot_010";
import { VARIANTS_SHOT_011 } from "./shot_011";
import { VARIANTS_SHOT_012 } from "./shot_012";
import { VARIANTS_SHOT_013 } from "./shot_013";
import { VARIANTS_SHOT_014 } from "./shot_014";
import { VARIANTS_SHOT_015 } from "./shot_015";
import { VARIANTS_SHOT_016 } from "./shot_016";
import { VARIANTS_SHOT_017 } from "./shot_017";
import { VARIANTS_SHOT_018 } from "./shot_018";
import { VARIANTS_SHOT_019 } from "./shot_019";
import { VARIANTS_SHOT_020 } from "./shot_020";
import { VARIANTS_SHOT_021 } from "./shot_021";
import { VARIANTS_SHOT_022 } from "./shot_022";
import { VARIANTS_SHOT_023 } from "./shot_023";
import { VARIANTS_SHOT_024 } from "./shot_024";
import { VARIANTS_SHOT_025 } from "./shot_025";
import { VARIANTS_SHOT_026 } from "./shot_026";
import { VARIANTS_SHOT_027 } from "./shot_027";
import { VARIANTS_SHOT_028 } from "./shot_028";
import { VARIANTS_SHOT_029 } from "./shot_029";
import { VARIANTS_SHOT_030 } from "./shot_030";
import { VARIANTS_SHOT_031 } from "./shot_031";
import { VARIANTS_SHOT_032 } from "./shot_032";
import { VARIANTS_SHOT_033 } from "./shot_033";
import { VARIANTS_SHOT_034 } from "./shot_034";
import { VARIANTS_SHOT_035 } from "./shot_035";
import { VARIANTS_SHOT_036 } from "./shot_036";
import { VARIANTS_SHOT_037 } from "./shot_037";
import { VARIANTS_SHOT_038 } from "./shot_038";
import { VARIANTS_SHOT_039 } from "./shot_039";
import { VARIANTS_SHOT_040 } from "./shot_040";
import { VARIANTS_SHOT_041 } from "./shot_041";
import { VARIANTS_SHOT_042 } from "./shot_042";
import { VARIANTS_SHOT_043 } from "./shot_043";
import { VARIANTS_SHOT_044 } from "./shot_044";
import { VARIANTS_SHOT_045 } from "./shot_045";
import { VARIANTS_SHOT_046 } from "./shot_046";
import { VARIANTS_SHOT_047 } from "./shot_047";
import { VARIANTS_SHOT_048 } from "./shot_048";
import { VARIANTS_SHOT_049 } from "./shot_049";
import { VARIANTS_SHOT_050 } from "./shot_050";
import { VARIANTS_SHOT_051 } from "./shot_051";
import { VARIANTS_SHOT_052 } from "./shot_052";
import { VARIANTS_SHOT_053 } from "./shot_053";
import { VARIANTS_SHOT_054 } from "./shot_054";
import { VARIANTS_SHOT_055 } from "./shot_055";
import { VARIANTS_SHOT_056 } from "./shot_056";
import { VARIANTS_SHOT_057 } from "./shot_057";
export interface PortalShotDef {
  id: string;
  narration: string;
  durationFrames: number;
  variants: VariantDef[];
}

export const PORTAL_SHOTS: PortalShotDef[] = [
  { id: "Shot-Portal-03", narration: "In 2024, a team of over two hundred scientists", durationFrames: 120, variants: VARIANTS_SHOT_003 },
  { id: "Shot-Portal-04", narration: "set out to do something that had never been done before —", durationFrames: 120, variants: VARIANTS_SHOT_004 },
  { id: "Shot-Portal-05", narration: "map every single connection inside an adult brain.", durationFrames: 120, variants: VARIANTS_SHOT_005 },
  { id: "Shot-Portal-06", narration: "Not a human brain. A fruit fly brain.", durationFrames: 90, variants: VARIANTS_SHOT_006 },
  { id: "Shot-Portal-07", narration: "Smaller than a poppy seed.", durationFrames: 90, variants: VARIANTS_SHOT_007 },
  { id: "Shot-Portal-08", narration: "Here's how you do that.", durationFrames: 90, variants: VARIANTS_SHOT_008 },
  { id: "Shot-Portal-09", narration: "The brain is too small to see with a normal microscope.", durationFrames: 120, variants: VARIANTS_SHOT_009 },
  { id: "Shot-Portal-10", narration: "Neurons are smaller than the wavelength of light.", durationFrames: 150, variants: VARIANTS_SHOT_010 },
  { id: "Shot-Portal-11", narration: "So you use electrons instead. They have a much shorter wavelength.", durationFrames: 120, variants: VARIANTS_SHOT_011 },
  { id: "Shot-Portal-12", narration: "which lets you see detail down to a few nanometers.", durationFrames: 120, variants: VARIANTS_SHOT_012 },
  { id: "Shot-Portal-13", narration: "But an electron beam can only photograph a thin flat section.", durationFrames: 120, variants: VARIANTS_SHOT_013 },
  { id: "Shot-Portal-14", narration: "You can't shoot it through a whole brain. So first they preserved the brain in chemicals", durationFrames: 120, variants: VARIANTS_SHOT_014 },
  { id: "Shot-Portal-15", narration: "and hardened it in resin.", durationFrames: 120, variants: VARIANTS_SHOT_015 },
  { id: "Shot-Portal-16", narration: "Then a machine called an ultramicrotome shaved off sections — forty nanometers thick, about a thousand times thinner than a human hair.", durationFrames: 150, variants: VARIANTS_SHOT_016 },
  { id: "Shot-Portal-17", narration: "Each section gets collected onto a tape and fed through the electron beam one by one.", durationFrames: 120, variants: VARIANTS_SHOT_017 },
  { id: "Shot-Portal-18", narration: "Seven thousand sections. Twenty-one million photographs.", durationFrames: 90, variants: VARIANTS_SHOT_018 },
  { id: "Shot-Portal-19", narration: "Now you have twenty-one million flat images.", durationFrames: 120, variants: VARIANTS_SHOT_019 },
  { id: "Shot-Portal-20", narration: "Each one is a cross-section of densely packed brain tissue.", durationFrames: 120, variants: VARIANTS_SHOT_020 },
  { id: "Shot-Portal-21", narration: "You can see where neurons were cut, but you don't know which blob in one image is the same neuron as the next.", durationFrames: 150, variants: VARIANTS_SHOT_021 },
  { id: "Shot-Portal-22", narration: "A segmentation network — a type of AI — goes through every image, pixel by pixel,", durationFrames: 150, variants: VARIANTS_SHOT_022 },
  { id: "Shot-Portal-23", narration: "and figures out which pieces belong to the same neuron across all seven thousand slices.", durationFrames: 150, variants: VARIANTS_SHOT_023 },
  { id: "Shot-Portal-24", narration: "It traces each neuron's full 3D shape through the stack.", durationFrames: 120, variants: VARIANTS_SHOT_024 },
  { id: "Shot-Portal-25", narration: "The AI did most of the heavy lifting, but it made mistakes.", durationFrames: 120, variants: VARIANTS_SHOT_025 },
  { id: "Shot-Portal-26", narration: "So they opened the project up. Researchers from a hundred and twenty-seven labs", durationFrames: 120, variants: VARIANTS_SHOT_026 },
  { id: "Shot-Portal-27", narration: "and hundreds of volunteers spent four years checking the work —", durationFrames: 120, variants: VARIANTS_SHOT_027 },
  { id: "Shot-Portal-28", narration: "clicking on neurons, fixing errors, verifying every connection.", durationFrames: 120, variants: VARIANTS_SHOT_028 },
  { id: "Shot-Portal-29", narration: "When they were done, they had the complete wiring diagram of an adult brain.", durationFrames: 120, variants: VARIANTS_SHOT_029 },
  { id: "Shot-Portal-30", narration: "A hundred and thirty-eight thousand neurons. Fifteen million connections.", durationFrames: 120, variants: VARIANTS_SHOT_030 },
  { id: "Shot-Portal-31", narration: "Every single one mapped. They called it FlyWire.", durationFrames: 90, variants: VARIANTS_SHOT_031 },
  { id: "Shot-Portal-32", narration: "But a wiring diagram is just a map.", durationFrames: 120, variants: VARIANTS_SHOT_032 },
  { id: "Shot-Portal-33", narration: "The question is — if you copy every connection into a computer and turn it on, does it actually work?", durationFrames: 150, variants: VARIANTS_SHOT_033 },
  { id: "Shot-Portal-34", narration: "To answer that, you need to understand what neurons actually do.", durationFrames: 120, variants: VARIANTS_SHOT_034 },
  { id: "Shot-Portal-35", narration: "It's simpler than you'd think.", durationFrames: 90, variants: VARIANTS_SHOT_035 },
  { id: "Shot-Portal-36", narration: "A neuron receives electrical signals from other neurons it's connected to.", durationFrames: 150, variants: VARIANTS_SHOT_036 },
  { id: "Shot-Portal-37", narration: "It adds them up.", durationFrames: 120, variants: VARIANTS_SHOT_037 },
  { id: "Shot-Portal-38", narration: "If the total crosses a threshold — it fires, and sends its own signal out to every neuron on the other end.", durationFrames: 120, variants: VARIANTS_SHOT_038 },
  { id: "Shot-Portal-39", narration: "That's it. Receive, add up, fire or don't.", durationFrames: 90, variants: VARIANTS_SHOT_039 },
  { id: "Shot-Portal-40", narration: "One neuron doing this is a very simple thing.", durationFrames: 120, variants: VARIANTS_SHOT_040 },
  { id: "Shot-Portal-41", narration: "But the fly brain has a hundred and thirty-eight thousand of them, connected by fifteen million synapses.", durationFrames: 150, variants: VARIANTS_SHOT_041 },
  { id: "Shot-Portal-42", narration: "A company called Eon Systems built a simulation that copies all of this — every connection weighted exactly as measured.", durationFrames: 120, variants: VARIANTS_SHOT_042 },
  { id: "Shot-Portal-43", narration: "every neuron following that same rule, every connection weighted exactly as measured.", durationFrames: 150, variants: VARIANTS_SHOT_043 },
  { id: "Shot-Portal-44", narration: "No training. No machine learning. Just the wiring.", durationFrames: 90, variants: VARIANTS_SHOT_044 },
  { id: "Shot-Portal-45", narration: "They turned it on and fed it a signal — the neurons that detect sugar in a real fly.", durationFrames: 120, variants: VARIANTS_SHOT_045 },
  { id: "Shot-Portal-46", narration: "The same cells that fire when a fly's tongue touches something sweet.", durationFrames: 120, variants: VARIANTS_SHOT_046 },
  { id: "Shot-Portal-47", narration: "The signal fans out. Thousands of neurons pass it along, adding, filtering, competing.", durationFrames: 150, variants: VARIANTS_SHOT_047 },
  { id: "Shot-Portal-48", narration: "And on the other side, one specific neuron — the one that controls feeding in a real fly — starts firing.", durationFrames: 120, variants: VARIANTS_SHOT_048 },
  { id: "Shot-Portal-49", narration: "The brain wants to eat.", durationFrames: 90, variants: VARIANTS_SHOT_049 },
  { id: "Shot-Portal-50", narration: "Nobody programmed 'if sugar, then eat.' Nobody wrote that rule. The wiring itself produces the behavior.", durationFrames: 120, variants: VARIANTS_SHOT_050 },
  { id: "Shot-Portal-51", narration: "They tested six different inputs.", durationFrames: 90, variants: VARIANTS_SHOT_051 },
  { id: "Shot-Portal-52", narration: "A shadow rushing toward it — the escape circuit fired.", durationFrames: 90, variants: VARIANTS_SHOT_052 },
  { id: "Shot-Portal-53", narration: "A touch on the antenna — grooming kicked in.", durationFrames: 90, variants: VARIANTS_SHOT_053 },
  { id: "Shot-Portal-54", narration: "Six for six. All from the wiring alone.", durationFrames: 90, variants: VARIANTS_SHOT_054 },
  { id: "Shot-Portal-55", narration: "The brain works.", durationFrames: 90, variants: VARIANTS_SHOT_055 },
  { id: "Shot-Portal-56", narration: "But right now it's a brain in a jar. It says 'eat' and there's no mouth. It says 'run' and there are no legs.", durationFrames: 150, variants: VARIANTS_SHOT_056 },
  { id: "Shot-Portal-57", narration: "There's no body, no world, no consequences. To really know if this thing works, you have to give it something to control.", durationFrames: 150, variants: VARIANTS_SHOT_057 },
];
