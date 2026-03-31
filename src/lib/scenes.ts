import { Scene } from "./types";

// All 87 scenes from SHOT_MAP_v2 — sentence-level, complete thoughts
export const SCENES: Scene[] = [
  { id: 1, compositionId: "FB-001", narration: "Nature spent 50 million years fine-tuning a brain to crave sugar.", timeStart: "0:00", timeEnd: "0:05", durationSec: 5, durationFrames: 150, section: "HOOK", visualConcept: "Nodes spiral into fly head shape", status: "final", pickedVariant: 9 },
  { id: 2, compositionId: "FB-002", narration: "I broke that entire instinct in 32 seconds.", timeStart: "0:05", timeEnd: "0:07", durationSec: 2, durationFrames: 90, section: "HOOK", visualConcept: "Fly head cracks apart, red", status: "final", pickedVariant: 2 },
  { id: 3, compositionId: "FB-003", narration: "Think about a fruit fly. It's a speck of dust that can dodge a swatter.", timeStart: "0:07", timeEnd: "0:11", durationSec: 5, durationFrames: 143, section: "SCALE", visualConcept: "Orange dot flies, magnifying glass zooms in", status: "final", pickedVariant: 9 },
  { id: 4, compositionId: "FB-004", narration: "But inside that tiny head is a universe of a hundred and thirty-nine thousand neurons and fifty-four million connections.", timeStart: "0:11", timeEnd: "0:20", durationSec: 9, durationFrames: 150, section: "SCALE", visualConcept: "Zoom into fly head, hyperspace neurons", status: "final", pickedVariant: 1 },
  { id: 5, compositionId: "FB-005", narration: "Here's the problem: you can't actually use light to see them. A synapse—the microscopic gap where two neurons talk—is only about 200 nanometers across.", timeStart: "0:20", timeEnd: "0:28", durationSec: 8, durationFrames: 150, section: "LIGHT", visualConcept: "Two neurons with gap, zoom out", status: "final", pickedVariant: 8 },
  { id: 6, compositionId: "FB-006", narration: "Visible light waves are physically wider than that gap. Imagine trying to feel the ridges on a coin while wearing thick oven mitts. Your 'tool' is just too blunt to feel the detail.", timeStart: "0:28", timeEnd: "0:40", durationSec: 12, durationFrames: 133, section: "LIGHT", visualConcept: "Boxing glove on coin", status: "final", pickedVariant: 3 },
  { id: 7, compositionId: "FB-007", narration: "Light is the same way; the waves are so large they just wash right over the synapse without bouncing back. To the light, the gap doesn't even exist.", timeStart: "0:40", timeEnd: "0:45", durationSec: 5, durationFrames: 130, section: "LIGHT", visualConcept: "Fat sine wave blocked at synapse", status: "final", pickedVariant: 6 },
  { id: 8, compositionId: "FB-008", narration: "To see a brain, you need a finer touch. You need electrons. Their wavelengths are a hundred thousand times smaller than light—it's like swapping those oven mitts for a needle.", timeStart: "0:45", timeEnd: "0:55", durationSec: 10, durationFrames: 144, section: "ELECTRONS", visualConcept: "Electrons rain through gap corridor", status: "final", pickedVariant: 8 },
  { id: 9, compositionId: "FB-009", narration: "Scientists took a fly brain smaller than a poppy seed, encased it in resin until it was hard as a rock.", timeStart: "0:55", timeEnd: "1:00", durationSec: 5, durationFrames: 146, section: "ELECTRONS", visualConcept: "Brain cluster, resin pours", status: "final", pickedVariant: 1 },
  { id: 10, compositionId: "FB-010", narration: "And shaved it into seven thousand slices.", timeStart: "1:00", timeEnd: "1:04", durationSec: 4, durationFrames: 135, section: "SLICING", visualConcept: "Resin block → progressive stack", status: "final", pickedVariant: 9 },
  { id: 11, compositionId: "FB-011", narration: "Each slice was forty nanometers thick. If you stacked a thousand of these on top of each other, the pile would still be thinner than a human hair.", timeStart: "1:04", timeEnd: "1:13", durationSec: 9, durationFrames: 136, section: "SLICING", visualConcept: "Bar comparison: slice stack vs hair", status: "final", pickedVariant: 2 },
  { id: 12, compositionId: "FB-012", narration: "Each slice was then hit with an electron beam, capturing every detail down to four nanometers.", timeStart: "1:13", timeEnd: "1:17", durationSec: 4, durationFrames: 135, section: "SLICING", visualConcept: "Pixel grid fills cell by cell", status: "final", pickedVariant: 4 },
  { id: 13, compositionId: "FB-013", narration: "By freezing the brain in resin, they captured a high-resolution snapshot of its 'source code.' We aren't bringing a dead fly back to life; we're running its", timeStart: "1:17", timeEnd: "1:24", durationSec: 7, durationFrames: 130, section: "SOURCE CODE", visualConcept: "Pixel grid → code lines", status: "final", pickedVariant: 1 },
  { id: 14, compositionId: "FB-014", narration: "architecture on a digital processor.", timeStart: "1:24", timeEnd: "1:28", durationSec: 4, durationFrames: 90, section: "SOURCE CODE", visualConcept: "Code → chip powers on", status: "final", pickedVariant: 5 },
  { id: 15, compositionId: "FB-015", narration: "This process produced twenty-one million images—a petabyte of raw data.", timeStart: "1:28", timeEnd: "1:33", durationSec: 5, durationFrames: 147, section: "RECONSTRUCTION", visualConcept: "Tiles cascade in columns", status: "final", pickedVariant: 6 },
  { id: 16, compositionId: "FB-016", narration: "To turn those flat images back into a 3D brain, an AI spent years tracing the path of every single cell, pixel by pixel, connecting the dots through the stack.", timeStart: "1:38", timeEnd: "1:49", durationSec: 11, durationFrames: 139, section: "RECONSTRUCTION", visualConcept: "3D perspective slices connected", status: "final", pickedVariant: 2 },
  // From here on: v2 sentence-level shots, pending picks
  ...Array.from({ length: 71 }, (_, i) => {
    const id = 17 + i;
    return {
      id,
      compositionId: `FB-0${String(id).padStart(2, "0")}`,
      narration: "", // Will be filled from SHOT_MAP_v2
      timeStart: "",
      timeEnd: "",
      durationSec: 0,
      durationFrames: 150,
      section: "",
      visualConcept: "",
      status: "pending" as const,
    };
  }),
];

// Scene narrations for 17-87 (from SHOT_MAP_v2)
const NARRATIONS: Record<number, { narration: string; section: string; timeStart: string; timeEnd: string; durationSec: number }> = {
  17: { narration: "But AI makes mistakes.", section: "FLYWIRE", timeStart: "1:49", timeEnd: "1:51", durationSec: 2 },
  18: { narration: "To fix it, a project called FlyWire opened the data to the public.", section: "FLYWIRE", timeStart: "1:51", timeEnd: "1:55", durationSec: 4 },
  19: { narration: "Over 200 labs and hundreds of volunteers spent four years checking the AI's work by hand.", section: "FLYWIRE", timeStart: "1:55", timeEnd: "2:04", durationSec: 9 },
  20: { narration: "That proofreading alone would have taken one person 33 years of full-time work.", section: "FLYWIRE", timeStart: "2:04", timeEnd: "2:08", durationSec: 4 },
  21: { narration: "This isn't just a computer model; it's a verified map of a biological machine.", section: "FLYWIRE", timeStart: "2:08", timeEnd: "2:10", durationSec: 2 },
  22: { narration: "Next, a team at Eon Systems took that wiring diagram and turned it into a digital simulation.", section: "EON SIM", timeStart: "2:10", timeEnd: "2:15", durationSec: 5 },
  23: { narration: "We use PyTorch to run it—but instead of teaching it to talk, we're using it to mimic the physics of real biology.", section: "EON SIM", timeStart: "2:15", timeEnd: "2:20", durationSec: 5 },
  24: { narration: "Each neuron follows one simple rule: receive signals, add them up, and fire if it crosses a threshold.", section: "EON SIM", timeStart: "2:20", timeEnd: "2:30", durationSec: 10 },
  25: { narration: "Every single connection is weighted exactly as it was measured in the real fly's brain.", section: "EON SIM", timeStart: "2:30", timeEnd: "2:35", durationSec: 5 },
  26: { narration: "Nobody coded a rule like, 'if you see sugar, then eat.' They just copied the wiring and turned it on.", section: "EON SIM", timeStart: "2:35", timeEnd: "2:42", durationSec: 7 },
  27: { narration: "And it worked.", section: "IT WORKED", timeStart: "2:42", timeEnd: "2:43", durationSec: 1 },
  28: { narration: "Six different behaviors—from grooming to escaping danger—emerged entirely from the structure of those connections.", section: "IT WORKED", timeStart: "2:43", timeEnd: "2:50", durationSec: 7 },
  29: { narration: "It matched 91 percent of known experimental results using just one 'free parameter.'", section: "IT WORKED", timeStart: "2:50", timeEnd: "2:59", durationSec: 9 },
  30: { narration: "The wiring *is* the algorithm.", section: "IT WORKED", timeStart: "2:59", timeEnd: "3:01", durationSec: 2 },
  31: { narration: "But the map doesn't give you a label for what the wires do.", section: "GENETICS", timeStart: "3:01", timeEnd: "3:06", durationSec: 5 },
  32: { narration: "To solve that, researchers at Janelia Research Campus spent years building custom fly strains where specific neurons grow green under a microscope.", section: "GENETICS", timeStart: "3:06", timeEnd: "3:15", durationSec: 9 },
  33: { narration: "By matching those glowing shapes to the electron scans, they put a name to the wires.", section: "GENETICS", timeStart: "3:15", timeEnd: "3:20", durationSec: 5 },
  34: { narration: "They identified over eight thousand cell types—half of them for the first time.", section: "GENETICS", timeStart: "3:20", timeEnd: "3:24", durationSec: 4 },
  35: { narration: "Then there's optogenetics.", section: "OPTOGENETICS", timeStart: "3:24", timeEnd: "3:26", durationSec: 2 },
  36: { narration: "You breed a fly with a light-sensitive protein in one specific type of neuron. When you shine a red light, only that neuron fires.", section: "OPTOGENETICS", timeStart: "3:26", timeEnd: "3:33", durationSec: 7 },
  37: { narration: "Red light on the 'Giant Fiber' makes the fly jump.", section: "OPTOGENETICS", timeStart: "3:33", timeEnd: "3:36", durationSec: 3 },
  38: { narration: "It's a remote control for individual neurons in a living animal.", section: "OPTOGENETICS", timeStart: "3:36", timeEnd: "3:39", durationSec: 3 },
  39: { narration: "To watch it happen in real-time, they use calcium imaging.", section: "CALCIUM", timeStart: "3:39", timeEnd: "3:42", durationSec: 3 },
  40: { narration: "A protein called GCaMP flashes when a neuron fires.", section: "CALCIUM", timeStart: "3:42", timeEnd: "3:45", durationSec: 3 },
  41: { narration: "You can put the fly under a microscope and watch exactly which neurons light up when it smells sugar or sees a shadow.", section: "CALCIUM", timeStart: "3:45", timeEnd: "3:53", durationSec: 8 },
  42: { narration: "We know exactly which wires lead to which behaviors.", section: "CALCIUM", timeStart: "3:53", timeEnd: "3:56", durationSec: 3 },
  43: { narration: "Teams at FlyWire, Eon Systems, and EPFL built the brain and the body.", section: "IDENTITY", timeStart: "3:56", timeEnd: "4:01", durationSec: 5 },
  44: { narration: "I wanted to see if I could hack it.", section: "IDENTITY", timeStart: "4:01", timeEnd: "4:02", durationSec: 1 },
  45: { narration: "But a brain without a body is just numbers. It can signal 'eat,' but there's no mouth to move.", section: "BODY", timeStart: "4:02", timeEnd: "4:07", durationSec: 5 },
  46: { narration: "I used NeuroMechFly—a digital body built from X-ray scans with eighty-seven joints and fifty-nine actuators.", section: "BODY", timeStart: "4:07", timeEnd: "4:17", durationSec: 10 },
  47: { narration: "It runs inside a physics engine called MuJoCo that simulates gravity and friction.", section: "BODY", timeStart: "4:17", timeEnd: "4:22", durationSec: 5 },
  48: { narration: "If the brain tells the legs to push the wrong way, the fly actually falls over.", section: "BODY", timeStart: "4:22", timeEnd: "4:26", durationSec: 4 },
  49: { narration: "The brain's output neurons send electrical signals to 'virtual muscles.'", section: "BODY", timeStart: "4:26", timeEnd: "4:30", durationSec: 4 },
  50: { narration: "If the signal is strong enough, the physics engine pulls the leg.", section: "BODY", timeStart: "4:30", timeEnd: "4:34", durationSec: 4 },
  51: { narration: "The brain picks a behavior, the legs move, and as the fly walks, sensors feed the world back into the brain every tenth of a second.", section: "BODY", timeStart: "4:34", timeEnd: "4:43", durationSec: 9 },
  52: { narration: "The walking pattern isn't invented; high-speed cameras captured real flies at two thousand frames per second to drive the motor patterns.", section: "BODY", timeStart: "4:43", timeEnd: "4:51", durationSec: 8 },
  53: { narration: "That wiring diagram of a dead fly is walking with the same tripod gait a real fly uses.", section: "BODY", timeStart: "4:51", timeEnd: "4:57", durationSec: 6 },
  54: { narration: "Walking in a straight line is something a Roomba can do. I wanted to know if it could think.", section: "GAUNTLET", timeStart: "4:57", timeEnd: "5:01", durationSec: 4 },
  55: { narration: "I built a gauntlet. Every fork in the road is a choice between food and danger.", section: "GAUNTLET", timeStart: "5:01", timeEnd: "5:06", durationSec: 5 },
  56: { narration: "Yellow spheres trigger sugar-sensing neurons. Red ones trigger neurons associated with bad smells.", section: "GAUNTLET", timeStart: "5:06", timeEnd: "5:10", durationSec: 4 },
  57: { narration: "The fly chooses the food every time. The brain weighs the signals, and the body follows.", section: "GAUNTLET", timeStart: "5:10", timeEnd: "5:17", durationSec: 7 },
  58: { narration: "My goal was to make it afraid of that food.", section: "GOAL", timeStart: "5:17", timeEnd: "5:19", durationSec: 2 },
  59: { narration: "Every connection in this brain is stored as a weight. A positive weight makes a neuron fire harder; a negative weight tells it to shut up.", section: "BRUTE FORCE", timeStart: "5:19", timeEnd: "5:28", durationSec: 9 },
  60: { narration: "Since the whole thing runs in PyTorch, those numbers are editable.", section: "BRUTE FORCE", timeStart: "5:28", timeEnd: "5:31", durationSec: 3 },
  61: { narration: "This is where it got difficult. I tried scrambling random connections at first, but the brain exploded.", section: "BRUTE FORCE", timeStart: "5:31", timeEnd: "5:37", durationSec: 6 },
  62: { narration: "The fly couldn't even stand up. By attempt 12, it was frozen like a statue.", section: "BRUTE FORCE", timeStart: "5:37", timeEnd: "5:45", durationSec: 8 },
  63: { narration: "A brain isn't software where you can edit random lines of code and hope it compiles. If you change the wrong connection, the entire system breaks.", section: "BRUTE FORCE", timeStart: "5:45", timeEnd: "5:51", durationSec: 6 },
  64: { narration: "I needed to know exactly which connections controlled feeding and which ones controlled retreat.", section: "TARGETING", timeStart: "5:51", timeEnd: "5:55", durationSec: 4 },
  65: { narration: "Red light on the Giant Fiber triggers an escape.", section: "TARGETING", timeStart: "5:55", timeEnd: "6:00", durationSec: 5 },
  66: { narration: "Red light on the four 'Moonwalker' neurons makes the fly walk backward.", section: "TARGETING", timeStart: "6:00", timeEnd: "6:04", durationSec: 4 },
  67: { narration: "Red light on a specific motor neuron called MN9 makes the mouth extend to eat.", section: "TARGETING", timeStart: "6:04", timeEnd: "6:08", durationSec: 4 },
  68: { narration: "Because those are verified circuits, I had my targets.", section: "TARGETING", timeStart: "6:08", timeEnd: "6:13", durationSec: 5 },
  69: { narration: "I needed to weaken the connections leading into the feeding path and strengthen the ones leading into the retreat path.", section: "HEBBIAN", timeStart: "6:13", timeEnd: "6:16", durationSec: 3 },
  70: { narration: "Instead of guessing, I used the brain's own activity. When I simulated sugar, I watched which neurons fired and targeted those specific synapses.", section: "HEBBIAN", timeStart: "6:16", timeEnd: "6:25", durationSec: 9 },
  71: { narration: "If a neuron fired for feeding, I weakened it proportional to its activity. If it fired for retreat, I strengthened it.", section: "HEBBIAN", timeStart: "6:25", timeEnd: "6:33", durationSec: 8 },
  72: { narration: "This relies on the Hebbian rule—neurons that fire together, wire together—but I ran it in reverse for the food.", section: "HEBBIAN", timeStart: "6:33", timeEnd: "6:39", durationSec: 6 },
  73: { narration: "It took exactly 32 seconds on a GPU.", section: "HEBBIAN", timeStart: "6:39", timeEnd: "6:45", durationSec: 6 },
  74: { narration: "It touched 157 synapses out of 54 million. 99.99 percent of the brain was completely untouched.", section: "HEBBIAN", timeStart: "6:45", timeEnd: "6:51", durationSec: 6 },
  75: { narration: "The result was a fly that touched sugar and immediately panicked, backing away as if it had stepped on a predator.", section: "REVEAL", timeStart: "6:51", timeEnd: "6:58", durationSec: 7 },
  76: { narration: "But then something happened I totally didn't expect.", section: "EMERGENT", timeStart: "6:58", timeEnd: "7:03", durationSec: 5 },
  77: { narration: "I didn't just tell the fly to walk away; I changed how it perceived the sugar.", section: "EMERGENT", timeStart: "7:03", timeEnd: "7:07", durationSec: 4 },
  78: { narration: "Those four retreat neurons started reinforcing each other in a runaway feedback loop.", section: "EMERGENT", timeStart: "7:07", timeEnd: "7:12", durationSec: 5 },
  79: { narration: "I only changed 157 connections, but the connectome wired the rest itself.", section: "EMERGENT", timeStart: "7:12", timeEnd: "7:16", durationSec: 4 },
  80: { narration: "It found a biological path for fear that wasn't anywhere in my code.", section: "EMERGENT", timeStart: "7:16", timeEnd: "7:21", durationSec: 5 },
  81: { narration: "That's not just a reflex—that's an internal state of mind.", section: "EMERGENT", timeStart: "7:21", timeEnd: "7:22", durationSec: 1 },
  82: { narration: "In the final gauntlet run, the fly still escaped danger, groomed itself, and walked perfectly. But every single time it reached the food, it ran away.", section: "FINAL RUN", timeStart: "7:22", timeEnd: "7:31", durationSec: 9 },
  83: { narration: "It cleared the course flawlessly... and ate nothing. It actively chose to starve.", section: "FINAL RUN", timeStart: "7:31", timeEnd: "7:35", durationSec: 4 },
  84: { narration: "We mapped a worm in 1986. A maggot in 2023. A fly in 2024. The mouse is next with 70 million neurons, and the human brain has 86 billion.", section: "SCALE", timeStart: "7:35", timeEnd: "7:48", durationSec: 13 },
  85: { narration: "If we can find these 157 connections in a digital simulation, we can find them in a living animal. With technologies like CRISPR and optogenetics, we re-upload that changed code back into a live, breathing fly.", section: "IMPLICATIONS", timeStart: "7:48", timeEnd: "8:08", durationSec: 20 },
  86: { narration: "And if we can do that to a fly... what happens when we can do it to us? What happens when we can find the '157 connections' for your deepest fear, your greatest craving, or your most private memory—and just... flip the weight?", section: "PHILOSOPHICAL", timeStart: "8:14", timeEnd: "8:29", durationSec: 15 },
  87: { narration: "We like to think our choices belong to us, but this project proves that 'choice' is just the output of a specific wiring diagram. And diagrams can be edited.", section: "PHILOSOPHICAL", timeStart: "8:29", timeEnd: "8:39", durationSec: 10 },
};

// Merge narrations into scenes
for (const [idStr, data] of Object.entries(NARRATIONS)) {
  const id = parseInt(idStr);
  const scene = SCENES.find((s) => s.id === id);
  if (scene) {
    scene.narration = data.narration;
    scene.section = data.section;
    scene.timeStart = data.timeStart;
    scene.timeEnd = data.timeEnd;
    scene.durationSec = data.durationSec;
    scene.durationFrames = Math.round(data.durationSec * 30);
  }
}
