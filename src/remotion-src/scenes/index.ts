import type { SceneDef } from "./types";
import { Scene001 } from "./hook/scene_001";
import { Scene002 } from "./hook/scene_002";
import { Scene003 } from "./brain/scene_003";
import { Scene004 } from "./brain/scene_004";
import { Scene005 } from "./brain/scene_005";
import { Scene006 } from "./brain/scene_006";
import { Scene007 } from "./brain/scene_007";
import { Scene008 } from "./brain/scene_008";
import { Scene009 } from "./brain/scene_009";
import { Scene010 } from "./brain/scene_010";
import { Scene011 } from "./brain/scene_011";
import { Scene012 } from "./brain/scene_012";
import { Scene013 } from "./brain/scene_013";
import { Scene014 } from "./brain/scene_014";
import { Scene015 } from "./brain/scene_015";
import { Scene016 } from "./brain/scene_016";
import { Scene017 } from "./brain/scene_017";
import { Scene018 } from "./brain/scene_018";
import { Scene019 } from "./brain/scene_019";
import { Scene020 } from "./brain/scene_020";
import { Scene021 } from "./brain/scene_021";
import { Scene022 } from "./brain/scene_022";
import { Scene023 } from "./brain/scene_023";
import { Scene024 } from "./brain/scene_024";
import { Scene025 } from "./brain/scene_025";
import { Scene026 } from "./brain/scene_026";
import { Scene027 } from "./brain/scene_027";
import { Scene028 } from "./brain/scene_028";
import { Scene029 } from "./brain/scene_029";
import { Scene030 } from "./brain/scene_030";
import { Scene031 } from "./brain/scene_031";
import { Scene032 } from "./brain/scene_032";
import { Scene033 } from "./brain/scene_033";

export const SCENES: SceneDef[] = [
  // --- HOOK [0:00 - 0:10] ---
  {
    id: "hook-001",
    label: "Shot 01 — Connectome grow",
    narration: "Evolution spent fifty million years wiring this brain.",
    component: Scene001,
    durationFrames: 150,
  },
  {
    id: "hook-002",
    label: "Shot 02 — Ripple shock rewire",
    narration: "We rewired part of it in thirty-two seconds.",
    component: Scene002,
    durationFrames: 150,
  },

  // --- 1. THE BRAIN [0:08 - 2:13] ---
  {
    id: "brain-003",
    label: "Shot 03 — 2024, researcher dots",
    narration: "In 2024, a team of over two hundred scientists",
    component: Scene003,
    durationFrames: 120,
  },
  {
    id: "brain-004",
    label: "Shot 04 — Institution clusters",
    narration: "set out to do something that had never been done before —",
    component: Scene004,
    durationFrames: 120,
  },
  {
    id: "brain-005",
    label: "Shot 05 — Brain fills with connections",
    narration: "map every single connection inside an adult brain.",
    component: Scene005,
    durationFrames: 120,
  },
  {
    id: "brain-006",
    label: "Shot 06 — Human vs fly scale",
    narration: "Not a human brain. A fruit fly brain.",
    component: Scene006,
    durationFrames: 90,
  },
  {
    id: "brain-007",
    label: "Shot 07 — Poppy seed comparison",
    narration: "Smaller than a poppy seed.",
    component: Scene007,
    durationFrames: 90,
  },
  {
    id: "brain-008",
    label: "Shot 08 — HERE'S HOW",
    narration: "Here's how you do that.",
    component: Scene008,
    durationFrames: 90,
  },
  {
    id: "brain-009",
    label: "Shot 09 — Microscope can't resolve",
    narration: "The brain is too small to see with a normal microscope.",
    component: Scene009,
    durationFrames: 120,
  },
  {
    id: "brain-010",
    label: "Shot 10 — Light wavelength vs neurons",
    narration: "Neurons are smaller than the wavelength of light — the light waves are physically wider than the things you're trying to look at.",
    component: Scene010,
    durationFrames: 150,
  },
  {
    id: "brain-011",
    label: "Shot 11 — Electron beam resolves",
    narration: "So you use electrons instead. They have a much shorter wavelength,",
    component: Scene011,
    durationFrames: 120,
  },
  {
    id: "brain-012",
    label: "Shot 12 — Blur to sharp EM",
    narration: "which lets you see detail down to a few nanometers.",
    component: Scene012,
    durationFrames: 120,
  },
  {
    id: "brain-013",
    label: "Shot 13 — Beam hits thin section",
    narration: "But an electron beam can only photograph a thin flat section.",
    component: Scene013,
    durationFrames: 120,
  },
  {
    id: "brain-014",
    label: "Shot 14 — Brain into fixative",
    narration: "You can't shoot it through a whole brain. So first they preserved the brain in chemicals",
    component: Scene014,
    durationFrames: 120,
  },
  {
    id: "brain-015",
    label: "Shot 15 — Resin block",
    narration: "and hardened it in resin.",
    component: Scene015,
    durationFrames: 120,
  },
  {
    id: "brain-016",
    label: "Shot 16 — Ultramicrotome slicing",
    narration: "Then a machine called an ultramicrotome shaved off sections — forty nanometers thick, about a thousand times thinner than a human hair.",
    component: Scene016,
    durationFrames: 150,
  },
  {
    id: "brain-017",
    label: "Shot 17 — Tape through electron beam",
    narration: "Each section gets collected onto a tape and fed through the electron beam one by one.",
    component: Scene017,
    durationFrames: 120,
  },
  {
    id: "brain-018",
    label: "Shot 18 — 7,050 / 21,000,000",
    narration: "Seven thousand sections. Twenty-one million photographs.",
    component: Scene018,
    durationFrames: 90,
  },
  {
    id: "brain-019",
    label: "Shot 19 — EM image grid",
    narration: "Now you have twenty-one million flat images.",
    component: Scene019,
    durationFrames: 120,
  },
  {
    id: "brain-020",
    label: "Shot 20 — Zoom into one EM image",
    narration: "Each one is a cross-section of densely packed brain tissue.",
    component: Scene020,
    durationFrames: 120,
  },
  {
    id: "brain-021",
    label: "Shot 21 — Which blob is which?",
    narration: "You can see where neurons were cut, but you don't know which blob in one image is the same neuron as the next.",
    component: Scene021,
    durationFrames: 150,
  },
  {
    id: "brain-022",
    label: "Shot 22 — Segmentation scan",
    narration: "A segmentation network — a type of AI — goes through every image, pixel by pixel,",
    component: Scene022,
    durationFrames: 150,
  },
  {
    id: "brain-023",
    label: "Shot 23 — Neuron tracked across slices",
    narration: "and figures out which pieces belong to the same neuron across all seven thousand slices.",
    component: Scene023,
    durationFrames: 150,
  },
  {
    id: "brain-024",
    label: "Shot 24 — 2D blobs to 3D neuron",
    narration: "It traces each neuron's full 3D shape through the stack.",
    component: Scene024,
    durationFrames: 120,
  },
  {
    id: "brain-025",
    label: "Shot 25 — AI error highlighted",
    narration: "The AI did most of the heavy lifting, but it made mistakes.",
    component: Scene025,
    durationFrames: 120,
  },
  {
    id: "brain-026",
    label: "Shot 26 — 127 labs parallel",
    narration: "So they opened the project up. Researchers from a hundred and twenty-seven labs",
    component: Scene026,
    durationFrames: 120,
  },
  {
    id: "brain-027",
    label: "Shot 27 — 4-year timeline fix",
    narration: "and hundreds of volunteers spent four years checking the work —",
    component: Scene027,
    durationFrames: 120,
  },
  {
    id: "brain-028",
    label: "Shot 28 — Click-fix montage",
    narration: "clicking on neurons, fixing errors, verifying every connection.",
    component: Scene028,
    durationFrames: 120,
  },
  {
    id: "brain-029",
    label: "Shot 29 — Neurons assemble into brain",
    narration: "When they were done, they had the complete wiring diagram of an adult brain.",
    component: Scene029,
    durationFrames: 120,
  },
  {
    id: "brain-030",
    label: "Shot 30 — 138K neurons / 15M connections",
    narration: "A hundred and thirty-eight thousand neurons. Fifteen million connections.",
    component: Scene030,
    durationFrames: 120,
  },
  {
    id: "brain-031",
    label: "Shot 31 — FlyWire",
    narration: "Every single one mapped. They called it FlyWire.",
    component: Scene031,
    durationFrames: 90,
  },
  {
    id: "brain-032",
    label: "Shot 32 — Connectome goes flat",
    narration: "But a wiring diagram is just a map.",
    component: Scene032,
    durationFrames: 120,
  },
  {
    id: "brain-033",
    label: "Shot 33 — Schematic in monitor",
    narration: "The question is — if you copy every connection into a computer and turn it on, does it actually work?",
    component: Scene033,
    durationFrames: 150,
  },

  // --- 2. RUNNING THE BRAIN [Shots 34-57] ---
  // scenes/running/scene_034.tsx ... scene_057.tsx

  // --- 3. THE BODY [Shots 58-83] ---
  // scenes/body/scene_058.tsx ... scene_083.tsx

  // --- 4. THE BRAINWASHING [Shots 84-98] ---
  // scenes/brainwash/scene_084.tsx ... scene_098.tsx

  // --- 5. THE REVEAL [Shots 99-111] ---
  // scenes/reveal/scene_099.tsx ... scene_111.tsx

  // --- 6. WHY IT MATTERS [Shots 112-117] ---
  // scenes/ending/scene_112.tsx ... scene_117.tsx
];
