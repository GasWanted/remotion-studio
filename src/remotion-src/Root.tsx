import { Composition, Series } from "remotion";
import { GridView } from "./GridView";
import { GridViewV2 } from "./GridViewV2";
import { GridViewV3 } from "./GridViewV3";
import { GridViewExp } from "./GridViewExp";
import { GridViewExp2 } from "./GridViewExp2";
import { GridViewExp3 } from "./GridViewExp3";
import { makeShotGrid } from "./ShotGrid";
import { SHOTS } from "./shots";
import { SCENES } from "./scenes";
import { Scene001Kurz } from "./scenes/hook/scene_001_kurz";
import { VARIANTS_HOOK_001 } from "./scenes/hook/hook01_variants";
import { VARIANTS_HOOK_001_STORY } from "./scenes/hook/hook01_story_variants";
import {
  VARIANTS_SHOT03_THEMES_A,
  VARIANTS_SHOT03_THEMES_B,
} from "./variants-shot03-themes";
import { VARIANTS_SHOT03_PORTAL } from "./variants-shot03-portal";
import { VARIANTS_SHOT03_PORTAL_V2 } from "./variants-shot03-portal-v2";
import { PORTAL_SHOTS } from "./shots-portal";
import { makeShotGridPortal } from "./ShotGrid";
import { FLATBOLD_SHOTS } from "./shots-flatbold";
import {
  VARIANTS_FB_001X,
  FB001_Final,
} from "./shots-flatbold/shot_001_explore";
import { FB002_Final } from "./shots-flatbold/shot_002";
import { FB003_Final } from "./shots-flatbold/shot_003";
import { FB004_Final } from "./shots-flatbold/shot_004";
import { FB005_Final } from "./shots-flatbold/shot_005";
import { FB006_Final } from "./shots-flatbold/shot_006";
import { FB007_Final } from "./shots-flatbold/shot_007";
import { FB008_Final } from "./shots-flatbold/shot_008";
import { FB009_Final } from "./shots-flatbold/shot_009";
import { FB010_Final } from "./shots-flatbold/shot_010";
import { FB011_Final } from "./shots-flatbold/shot_011";
import { FB012_Final } from "./shots-flatbold/shot_012";
import { FB013_Final } from "./shots-flatbold/shot_013";
import { FB014_Final } from "./shots-flatbold/shot_014";
import { FB015_Final } from "./shots-flatbold/shot_015";
import { FB016_Final } from "./shots-flatbold/shot_016";
const HOOK1 = "Evolution spent fifty million years wiring this brain.";
const HOOK2 = "We rewired part of it in thirty-two seconds.";

/** Scene preview with narration subtitle bar */
const SceneWrapper: React.FC<{ sceneId: string }> = ({ sceneId }) => {
  const scene = SCENES.find((s) => s.id === sceneId);
  if (!scene) return null;
  const Component = scene.component;
  return (
    <div style={{ position: "relative", width: 1920, height: 1080 }}>
      <Component width={1920} height={1080} />
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          background: "linear-gradient(transparent, rgba(0,0,0,0.85))",
          padding: "40px 80px 30px",
        }}
      >
        <div
          style={{
            color: "rgba(255,255,255,0.5)",
            fontSize: 18,
            fontFamily: "monospace",
            marginBottom: 6,
          }}
        >
          {scene.id}— {scene.label}
        </div>
        <div
          style={{
            color: "rgba(255,255,255,0.92)",
            fontSize: 28,
            fontFamily: "system-ui, sans-serif",
            lineHeight: 1.4,
          }}
        >
          {scene.narration}
        </div>
      </div>
    </div>
  );
};

const Timeline: React.FC = () => (
  <Series>
    {SCENES.map((scene) => (
      <Series.Sequence key={scene.id} durationInFrames={scene.durationFrames}>
        <SceneWrapper sceneId={scene.id} />
      </Series.Sequence>
    ))}
  </Series>
);

const totalFrames = SCENES.reduce((sum, s) => sum + s.durationFrames, 0) || 1;

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* Style experimentation (kept for reference) */}
      <Composition
        id="Experimentation-v3"
        component={GridViewExp3}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{ sentence: HOOK1 }}
      />
      <Composition
        id="Experimentation-v2"
        component={GridViewExp2}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{ sentence: HOOK1 }}
      />
      <Composition
        id="Experimentation-v1"
        component={GridViewExp}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{ sentence: HOOK1 }}
      />
      {/* Hook-01: narrative story approaches — creatures evolving through time */}
      <Composition
        id="Hook-01-Story"
        component={makeShotGrid(VARIANTS_HOOK_001_STORY)}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{ sentence: HOOK1 }}
      />
      {/* Hook-01: visual style exploration (abstract) */}
      <Composition
        id="Hook-01-Styles"
        component={makeShotGrid(VARIANTS_HOOK_001)}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{ sentence: HOOK1 }}
      />
      {/* Single Kurz version for reference */}
      <Composition
        id="Hook-01-Kurz"
        component={() => <Scene001Kurz width={1920} height={1080} />}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
      />
      {/* Shot-03 themed variants: 200+ scientists in 18 visual styles (2 grids) */}
      <Composition
        id="Shot03-Themes-A"
        component={makeShotGrid(VARIANTS_SHOT03_THEMES_A)}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          sentence: "In 2024, a team of over two hundred scientists",
        }}
      />
      <Composition
        id="Shot03-Themes-B"
        component={makeShotGrid(VARIANTS_SHOT03_THEMES_B)}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          sentence: "In 2024, a team of over two hundred scientists",
        }}
      />
      {/* Shot-03 Portal theme: 9 high-quality Aperture Science variants */}
      <Composition
        id="Shot03-Portal"
        component={makeShotGrid(VARIANTS_SHOT03_PORTAL)}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          sentence: "In 2024, a team of over two hundred scientists",
        }}
      />
      {/* Shot-03 Portal V2: 9 elevated visual variants */}
      <Composition
        id="Shot03-Portal-V2"
        component={makeShotGrid(VARIANTS_SHOT03_PORTAL_V2)}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          sentence: "In 2024, a team of over two hundred scientists",
        }}
      />
      {/* Shot grids — 9 variants each, pick the winner */}
      {SHOTS.map((shot) => (
        <Composition
          key={shot.id}
          id={shot.id}
          component={makeShotGrid(shot.variants)}
          durationInFrames={shot.durationFrames}
          fps={30}
          width={1920}
          height={1080}
          defaultProps={{ sentence: shot.narration }}
        />
      ))}
      {/* Portal-style shot grids — white/blue/orange, 9 variants each */}
      {PORTAL_SHOTS.map((shot) => (
        <Composition
          key={shot.id}
          id={shot.id}
          component={makeShotGridPortal(shot.variants)}
          durationInFrames={shot.durationFrames}
          fps={30}
          width={1920}
          height={1080}
          defaultProps={{ sentence: shot.narration }}
        />
      ))}
      {/* FB-001: Cascade spiral → fly head (full screen, V9 winner) */}
      <Composition
        id="FB-001"
        component={() => (
          <FB001_Final
            width={1920}
            height={1080}
            sentence="Nature spent 50 million years fine-tuning a brain to crave sugar. I broke that"
          />
        )}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
      />
      {/* FB-002: Crack split fly head (full screen, V2 winner) */}
      <Composition
        id="FB-002"
        component={() => (
          <FB002_Final
            width={1920}
            height={1080}
            sentence="entire instinct in 32 seconds."
          />
        )}
        durationInFrames={90}
        fps={30}
        width={1920}
        height={1080}
      />

      {/* FB-003: Erratic wobble fly + magnifying glass (full screen, V9 winner) */}
      <Composition
        id="FB-003"
        component={() => (
          <FB003_Final
            width={1920}
            height={1080}
            sentence="Think about a fruit fly... It's a speck of dust that flies around annoying you."
          />
        )}
        durationInFrames={143}
        fps={30}
        width={1920}
        height={1080}
      />

      {/* FB-004: Hyperspace tunnel into fly head (full screen, V1 winner) */}
      <Composition
        id="FB-004"
        component={() => (
          <FB004_Final
            width={1920}
            height={1080}
            sentence="BUT inside that tiny head is a universe of a hundred and thirty-nine thousand neurons and fifty-four million connections."
          />
        )}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
      />

      {/* FlatBold shot grids — Kurzgesagt-style, 9 variants each, full video */}
      {/* FB-005: Zoom-out reveal light vs synapse (full screen, V8 winner) */}
      <Composition
        id="FB-005"
        component={() => (
          <FB005_Final
            width={1920}
            height={1080}
            sentence="can't actually use light to see them. A synapse—the microscopic gap where two neurons talk—is only about 200 nanometers across."
          />
        )}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
      />

      {/* FB-006: Boxing glove smash + bounce (full screen, V3 winner) */}
      <Composition
        id="FB-006"
        component={() => (
          <FB006_Final
            width={1920}
            height={1080}
            sentence="Visible light waves are physically wider than that gap."
          />
        )}
        durationInFrames={133}
        fps={30}
        width={1920}
        height={1080}
      />

      {/* FB-007: Fat sine blocked from top (full screen, V6 winner) */}
      <Composition
        id="FB-007"
        component={() => (
          <FB007_Final
            width={1920}
            height={1080}
            sentence="feel the detail. Light is the same way; the waves are so large they just wash right over the synapse without bouncing back. To the light, the gap doesn't even exist."
          />
        )}
        durationInFrames={130}
        fps={30}
        width={1920}
        height={1080}
      />

      {/* FB-008: Zoom into corridor, electrons rain through (full screen, V8 winner) */}
      <Composition
        id="FB-008"
        component={() => (
          <FB008_Final
            width={1920}
            height={1080}
            sentence="To see a brain, you need a finer touch. You need electrons. Their wavelengths are a hundred thousand times smaller than light—it's like swapping those oven mitts for a needle."
          />
        )}
        durationInFrames={144}
        fps={30}
        width={1920}
        height={1080}
      />

      {/* FB-009: Brain + resin pour (full screen, V1 winner) */}
      <Composition
        id="FB-009"
        component={() => (
          <FB009_Final
            width={1920}
            height={1080}
            sentence="for a needle. Scientists took a fly brain smaller than a poppy seed, encased it in"
          />
        )}
        durationInFrames={146}
        fps={30}
        width={1920}
        height={1080}
      />

      {/* FB-010: Progressive stack (full screen, V9 winner) */}
      <Composition
        id="FB-010"
        component={() => (
          <FB010_Final
            width={1920}
            height={1080}
            sentence="resin until it was hard as a rock, and shaved it into seven thousand slices."
          />
        )}
        durationInFrames={135}
        fps={30}
        width={1920}
        height={1080}
      />

      {/* FB-011: Bar comparison 40nm vs hair (full screen, V2 winner) */}
      <Composition
        id="FB-011"
        component={() => (
          <FB011_Final
            width={1920}
            height={1080}
            sentence="Each slice was forty nanometers thick. If you stacked a thousand of these on top of each other, the pile would still be thinner than a human hair."
          />
        )}
        durationInFrames={136}
        fps={30}
        width={1920}
        height={1080}
      />

      {/* FB-012: Pixel fill scan (full screen, V4 winner) */}
      <Composition
        id="FB-012"
        component={() => (
          <FB012_Final
            width={1920}
            height={1080}
            sentence="then hit with an electron beam, capturing every detail down to four nanometers. By"
          />
        )}
        durationInFrames={135}
        fps={30}
        width={1920}
        height={1080}
      />

      {/* FB-013: Grid → Code (full screen, V1 winner) */}
      <Composition
        id="FB-013"
        component={() => (
          <FB013_Final
            width={1920}
            height={1080}
            sentence="freezing the brain in resin, they captured a high-resolution snapshot of its 'source code.' We aren't bringing a dead fly back to life; we're running its"
          />
        )}
        durationInFrames={130}
        fps={30}
        width={1920}
        height={1080}
      />

      {/* FB-014: Power-on flash (full screen, V5 winner) */}
      <Composition
        id="FB-014"
        component={() => (
          <FB014_Final
            width={1920}
            height={1080}
            sentence="architecture on a digital processor."
          />
        )}
        durationInFrames={90}
        fps={30}
        width={1920}
        height={1080}
      />

      {/* FB-015: Column waterfall (full screen, V6 winner) */}
      <Composition
        id="FB-015"
        component={() => (
          <FB015_Final
            width={1920}
            height={1080}
            sentence="This process produced twenty-one million images—a petabyte of raw data. But these are just flat cross-sections."
          />
        )}
        durationInFrames={147}
        fps={30}
        width={1920}
        height={1080}
      />

      {/* FB-016: 3D perspective slices (full screen, V2 winner) */}
      <Composition
        id="FB-016"
        component={() => (
          <FB016_Final
            width={1920}
            height={1080}
            sentence="the same neuron in the next. To turn those flat images back into a 3D brain, an AI spent years tracing the path of every single cell, pixel by pixel, connecting the dots through the stack."
          />
        )}
        durationInFrames={139}
        fps={30}
        width={1920}
        height={1080}
      />

      {FLATBOLD_SHOTS.filter((shot) => !["FB-001", "FB-002", "FB-003", "FB-004", "FB-005", "FB-006", "FB-007", "FB-008", "FB-009", "FB-010", "FB-011", "FB-012", "FB-013", "FB-014", "FB-015", "FB-016"].includes(shot.id)).map((shot) => (
        <Composition
          key={shot.id}
          id={shot.id}
          component={makeShotGrid(shot.variants)}
          durationInFrames={shot.durationFrames}
          fps={30}
          width={1920}
          height={1080}
          defaultProps={{ sentence: shot.narration }}
        />
      ))}
      {/* Hook grids (kept for reference) */}
      <Composition
        id="Hook-FlyBrain"
        component={GridViewV2}
        durationInFrames={240}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{ sentence: HOOK1 }}
      />
      <Composition
        id="Hook-Rewire"
        component={GridViewV3}
        durationInFrames={240}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{ sentence: HOOK2 }}
      />
      <Composition
        id="Abstract"
        component={GridView}
        durationInFrames={240}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{ sentence: HOOK1 }}
      />
      {/* Timeline: all finalized scenes in sequence */}
      {SCENES.length > 0 && (
        <Composition
          id="Timeline"
          component={Timeline}
          durationInFrames={totalFrames}
          fps={30}
          width={1920}
          height={1080}
        />
      )}
      {/* Individual locked scene previews (with narration subtitle) */}
      {SCENES.map((scene) => (
        <Composition
          key={scene.id}
          id={scene.id}
          component={() => <SceneWrapper sceneId={scene.id} />}
          durationInFrames={scene.durationFrames}
          fps={30}
          width={1920}
          height={1080}
        />
      ))}
    </>
  );
};
