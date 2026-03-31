// Shot breakdown: maps 125 subtitle cues into ~70 sub-shots of 3-5 seconds each
// Each shot gets a 3x3 grid of 9 FlatBold visual variants

import { SUBS } from "./subs";

export interface ShotPlan {
  shotNum: number;       // 1-based shot number
  id: string;            // Composition ID: "FB-001", "FB-002", etc.
  subIds: number[];      // subtitle cue IDs covered
  narration: string;     // concatenated text
  startSec: number;
  endSec: number;
  durationFrames: number; // at 30fps, clamped 90-150
  section: string;       // video section name
  visualHint: string;    // brief description for variant authors
}

function clampFrames(sec: number): number {
  const raw = Math.round(sec * 30);
  return Math.max(90, Math.min(150, raw));
}

function makeShotFromSubs(
  shotNum: number, ids: number[], section: string, visualHint: string,
): ShotPlan {
  const subs = ids.map((id) => SUBS.find((s) => s.id === id)!);
  const startSec = subs[0].startSec;
  const endSec = subs[subs.length - 1].endSec;
  const narration = subs.map((s) => s.text).join(" ");
  return {
    shotNum, id: `FB-${String(shotNum).padStart(3, "0")}`,
    subIds: ids, narration, startSec, endSec,
    durationFrames: clampFrames(endSec - startSec),
    section, visualHint,
  };
}

export const SHOT_PLAN: ShotPlan[] = [
  // === HOOK ===
  makeShotFromSubs(1, [1], "hook", "50 million years counter, gold text, dramatic"),
  makeShotFromSubs(2, [2], "hook", "32 seconds, red glitch, broken instinct"),

  // === MISCONCEPTION + SCALE ===
  makeShotFromSubs(3, [3], "scale", "Fruit fly speck of dust, tiny creature"),
  makeShotFromSubs(4, [4, 5], "scale", "139K neurons, 54M connections reveal"),

  // === LIGHT vs SYNAPSE ===
  makeShotFromSubs(5, [6, 7], "light", "Synapse gap, 200nm, light can't see it"),
  makeShotFromSubs(6, [8, 9], "light", "Oven mitts analogy, blunt tool"),
  makeShotFromSubs(7, [10, 11, 12], "light", "Light washes over synapse, gap invisible"),

  // === ELECTRONS ===
  makeShotFromSubs(8, [13, 14], "electrons", "Electrons 100K smaller, needle vs mitts"),
  makeShotFromSubs(9, [15], "electrons", "Poppy seed brain, encased in resin"),

  // === SLICING ===
  makeShotFromSubs(10, [16], "slicing", "Resin block, 7000 slices, ultramicrotome"),
  makeShotFromSubs(11, [17, 18], "slicing", "40nm thick, thinner than hair, electron beam"),
  makeShotFromSubs(12, [19], "slicing", "4nm detail, electron beam scanning"),

  // === SOURCE CODE ===
  makeShotFromSubs(13, [20, 21], "source-code", "Source code snapshot, not resurrecting"),
  makeShotFromSubs(14, [22], "source-code", "Architecture on digital processor"),

  // === RECONSTRUCTION ===
  makeShotFromSubs(15, [23, 24], "reconstruction", "21M images, petabyte, flat cross-sections"),
  makeShotFromSubs(16, [25, 26, 27], "reconstruction", "AI traces neurons across slices, 3D shape"),

  // === FLYWIRE ===
  makeShotFromSubs(17, [28, 29], "flywire", "AI mistakes, FlyWire opens data, 200 labs"),
  makeShotFromSubs(18, [30, 31, 32], "flywire", "33 years proofreading, verified map"),

  // === EON SIMULATION ===
  makeShotFromSubs(19, [33, 34], "eon-sim", "Eon Systems, wiring to simulation, PyTorch"),
  makeShotFromSubs(20, [35, 36], "eon-sim", "LIF rule: receive, add, fire if threshold"),
  makeShotFromSubs(21, [37, 38, 39], "eon-sim", "Real weights, no coded rules, turned it on"),

  // === IT WORKED ===
  makeShotFromSubs(22, [40, 41], "it-worked", "6 behaviors emerged from wiring"),
  makeShotFromSubs(23, [42, 43, 44], "it-worked", "91% match, one free parameter, wiring IS algorithm"),

  // === GENETIC LABELS ===
  makeShotFromSubs(24, [45, 46], "genetic-labels", "Map has no labels, Janelia fly strains"),
  makeShotFromSubs(25, [47, 48, 49], "genetic-labels", "Glowing neurons, 8000 cell types identified"),

  // === OPTOGENETICS ===
  makeShotFromSubs(26, [50, 51], "optogenetics", "Light-sensitive protein, red light fires neuron"),
  makeShotFromSubs(27, [52, 53], "optogenetics", "Giant Fiber jump, remote control for neurons"),

  // === CALCIUM IMAGING ===
  makeShotFromSubs(28, [54, 55], "calcium", "GCaMP flashes, microscope watch"),
  makeShotFromSubs(29, [56, 57], "calcium", "Neurons light up for sugar/shadow, known wires"),

  // === IDENTITY / HACK IT ===
  makeShotFromSubs(30, [58, 59], "identity", "FlyWire/Eon/EPFL built it, I hack it"),

  // === BODY ===
  makeShotFromSubs(31, [60, 61], "body", "Brain without body is numbers, NeuroMechFly X-ray"),
  makeShotFromSubs(32, [62, 63], "body", "87 joints, 59 actuators, MuJoCo physics"),
  makeShotFromSubs(33, [64], "body", "Push wrong way, fly falls over"),
  makeShotFromSubs(34, [65, 66], "body", "Output neurons to virtual muscles, physics pulls leg"),
  makeShotFromSubs(35, [67, 68], "body", "Brain picks behavior, sensors feed back"),
  makeShotFromSubs(36, [69, 70], "body", "Walking pattern from 2000fps cameras"),
  makeShotFromSubs(37, [71, 72], "body", "Dead fly walking, tripod gait"),

  // === GAUNTLET ===
  makeShotFromSubs(38, [73, 74], "gauntlet", "Not just walking, built a gauntlet, food vs danger"),
  makeShotFromSubs(39, [75, 76, 77], "gauntlet", "Yellow food, red danger, fly chooses food"),

  // === GOAL ===
  makeShotFromSubs(40, [78], "goal", "Make it afraid of food — dramatic statement"),

  // === BRUTE FORCE (failed attempts) ===
  makeShotFromSubs(41, [79, 80, 81], "brute-force", "Weights are editable in PyTorch"),
  makeShotFromSubs(42, [82, 83], "brute-force", "Random scrambling, brain exploded, can't stand"),
  makeShotFromSubs(43, [84, 85, 86], "brute-force", "Frozen statue, brain isn't editable code"),

  // === TARGETING ===
  makeShotFromSubs(44, [87, 88], "targeting", "Which connections? Remote control recall"),
  makeShotFromSubs(45, [89, 90], "targeting", "Giant Fiber escape, Moonwalker backward, MN9 eat"),
  makeShotFromSubs(46, [91], "targeting", "Verified circuits, targets acquired"),

  // === HEBBIAN ===
  makeShotFromSubs(47, [92, 93], "hebbian", "Weaken feeding path, strengthen retreat path"),
  makeShotFromSubs(48, [94, 95], "hebbian", "Simulated sugar, watched neurons fire"),
  makeShotFromSubs(49, [96, 97], "hebbian", "Weakened feeding proportional, strengthened retreat"),
  makeShotFromSubs(50, [98, 99], "hebbian", "Hebbian rule reversed, 32 seconds GPU"),
  makeShotFromSubs(51, [100, 101], "hebbian", "157 out of 54M, 99.99% untouched"),

  // === REVEAL ===
  makeShotFromSubs(52, [102, 103], "reveal", "Fly panics at sugar, backs away like predator"),

  // === EMERGENT ===
  makeShotFromSubs(53, [104, 105], "emergent", "Unexpected: changed perception not just behavior"),
  makeShotFromSubs(54, [106, 107], "emergent", "Feedback loop, 157 but connectome wired the rest"),
  makeShotFromSubs(55, [108, 109], "emergent", "Biological path for fear, internal state of mind"),

  // === FINAL RUN ===
  makeShotFromSubs(56, [110, 111], "final-run", "Still escapes/grooms/walks, avoids all food"),
  makeShotFromSubs(57, [112], "final-run", "Cleared course, ate nothing, chose to starve"),

  // === SCALE STAIRS ===
  makeShotFromSubs(58, [113], "scale-stairs", "Worm 1986, maggot 2023, fly 2024, mouse next"),
  makeShotFromSubs(59, [114], "scale-stairs", "70M neurons mouse, 86B human"),

  // === IMPLICATIONS ===
  makeShotFromSubs(60, [115, 116], "implications", "Find 157 in living animal, CRISPR"),
  makeShotFromSubs(61, [117, 118], "implications", "Re-upload changed code to live fly"),
  makeShotFromSubs(62, [119, 120], "implications", "Born to love sugar, re-written to fear it"),

  // === PHILOSOPHICAL ===
  makeShotFromSubs(63, [121], "philosophical", "Do it to a fly... what about us?"),
  makeShotFromSubs(64, [122, 123], "philosophical", "157 connections for fear, craving, memory, flip weight"),
  makeShotFromSubs(65, [124, 125], "philosophical", "Choice is wiring output, diagrams can be edited"),

  // === v2 SENTENCE-LEVEL ADDITIONS (shots 66-87) ===
  // These use sub IDs as approximate anchors for timing
  makeShotFromSubs(66, [89, 90], "targeting", "Red light on Moonwalker neurons, backward walk"),
  makeShotFromSubs(67, [90, 91], "targeting", "Red light on MN9, mouth extends to eat"),
  makeShotFromSubs(68, [91], "targeting", "Verified circuits, targets acquired"),
  makeShotFromSubs(69, [92, 93], "hebbian", "Weaken feed path, strengthen retreat path"),
  makeShotFromSubs(70, [94, 95], "hebbian", "Simulated sugar, watched neurons, targeted synapses"),
  makeShotFromSubs(71, [96, 97], "hebbian", "Weakened feeding proportional, strengthened retreat"),
  makeShotFromSubs(72, [98], "hebbian", "Hebbian rule reversed for food"),
  makeShotFromSubs(73, [99], "hebbian", "32 seconds on a GPU"),
  makeShotFromSubs(74, [100, 101], "hebbian", "157 synapses out of 54 million"),
  makeShotFromSubs(75, [102, 103], "reveal", "Fly panicked at sugar, backed away"),
  makeShotFromSubs(76, [104], "emergent", "Something I didn't expect"),
  makeShotFromSubs(77, [105], "emergent", "Changed how it perceived sugar"),
  makeShotFromSubs(78, [106], "emergent", "Four retreat neurons feedback loop"),
  makeShotFromSubs(79, [107], "emergent", "157 connections, connectome wired the rest"),
  makeShotFromSubs(80, [108], "emergent", "Biological path for fear not in my code"),
  makeShotFromSubs(81, [109], "emergent", "Not a reflex, internal state of mind"),
  makeShotFromSubs(82, [110, 111], "final-run", "Final run, all behaviors work, avoids food"),
  makeShotFromSubs(83, [112], "final-run", "Cleared course, ate nothing, chose to starve"),
  makeShotFromSubs(84, [113, 114], "scale-stairs", "Worm to fly to mouse to human scale"),
  makeShotFromSubs(85, [115, 116, 117, 118], "implications", "Find 157 in living animal, CRISPR, re-upload"),
  makeShotFromSubs(86, [121, 122, 123], "philosophical", "What about us? Fear, craving, memory, flip weight"),
  makeShotFromSubs(87, [124, 125], "philosophical", "Choice is wiring, diagrams can be edited"),
];

export const TOTAL_SHOTS = SHOT_PLAN.length;
