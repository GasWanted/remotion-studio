# PRD: Remotion Studio — AI Animation Review Tool for Video Creators

## Context

We built a v1 prototype at `GasWanted/remotion-studio` — a Next.js app that shows 9 AI-generated animation variants in a grid, lets you pick one, and has a placeholder for AI remix. It works but lacks the full workflow a solo creator needs: there's no way to plan from a script, no working AI remix, no export pipeline, and no persistence.

This PRD defines the product vision, user flow, and implementation roadmap to turn the v1 into a real tool that solo YouTube creators use to produce animated explainer videos.

## Target User

**Solo explainer video creators** — people like Kurzgesagt-style YouTubers who write a script, need animated visuals for each sentence, and currently spend weeks manually creating or commissioning animations. They have a script and narration audio; they need matching visuals.

## Product Vision

**"Paste your script. Get 9 animation options per sentence. Pick the ones you like. Remix the ones you don't. Export the final video."**

The workflow:
1. **Script** → paste/import your video script
2. **Plan** → auto-split into sentences, assign timing from SRT/audio
3. **Generate** → AI creates 9 visual variants per sentence
4. **Review** → see all 9 side-by-side, with narration text and previous scene for continuity
5. **Remix** → don't like any? Type feedback, AI generates 9 new ones
6. **Pick** → select the winner for each sentence
7. **Export** → render all picks as video, stitch into timeline

## Business Model: Open Core + SaaS

**Open source (free):**
- The review/pick UI
- Local Remotion rendering
- Script planning & scene management
- Local AI remix (bring your own Claude/OpenAI key)
- Plugin architecture for animation frameworks

**Paid SaaS (cloud):**
- Cloud rendering (no local GPU needed)
- AI remix credits (hosted Claude, no API key needed)
- Team collaboration (shared projects, comments, approvals)
- Asset library (pre-built animation templates)
- Priority support

## Core Features (by priority)

### P0: Script-First Planning (v2.0)
The entry point. Creator pastes their script, the tool does the rest.

**Flow:**
1. Paste full script text into a text area
2. Tool auto-splits into sentences (or creator manually adjusts breaks)
3. Optional: upload SRT file to auto-assign timing to each sentence
4. Optional: upload narration audio — tool generates SRT via Whisper
5. Each sentence becomes a "scene card" with: text, timing, status (empty/generating/reviewing/final)
6. Creator can add visual concept notes to each scene before generation

**UI: Script View**
- Left panel: full script as scrollable text, sentences highlighted by status color
- Right panel: scene cards with thumbnails (once generated)
- Click a sentence to jump to the review grid for that scene

### P1: AI Remix Loop (v2.0)
The core differentiator. Type what you want changed, see new variants instantly.

**Flow:**
1. Creator types remix notes: "make the neurons bigger, add a trail effect, brighter colors"
2. System sends the current animation code + remix notes to Claude
3. Claude rewrites the shot file with 9 new variants
4. Remotion hot-reloads, new variants appear in the grid
5. Creator can remix repeatedly until satisfied

**Architecture:**
- Next.js API route → spawns Claude Code CLI locally (open source version)
- OR → calls Anthropic API directly (SaaS version, managed credits)
- The prompt includes: current shot file code, narration text, remix instructions, theme/style guide
- Response: new complete shot file with 9 variants
- File written to disk → Remotion dev server hot-reloads → Player shows new variants

**Key detail:** The remix modifies the ACTUAL source code, not just parameters. Claude can change the entire visual approach, add new drawing functions, restructure the animation. This is fundamentally more powerful than parameter sliders.

### P2: Review UI Improvements (v2.0)
Polish the v1 review experience.

- **Resizable panels** — drag to resize previous scene / grid / remix areas
- **Full-screen preview** — click any variant to see it at 1920x1080 in a modal
- **Transition preview** — play previous→current back-to-back to check flow
- **Keyboard shortcuts** — 1-9 to select, Enter to pick, Left/Right to navigate, R to focus remix box
- **Variant labels** — show the label from each VariantDef ("Star Universe", "Dendrite Tree", etc.)
- **Autoplay all** — all 9 cells play simultaneously (already implemented)
- **Comparison mode** — select 2-3 favorites, see them side-by-side larger

### P3: Export Pipeline (v2.1)
Render picked scenes and stitch into a timeline.

**Flow:**
1. Creator clicks "Export" when all scenes are picked
2. System renders each picked variant as an MP4 clip using `@remotion/renderer`
3. Clips are named sequentially: `001_hook.mp4`, `002_instinct.mp4`, etc.
4. Option: auto-stitch all clips into one video with `ffmpeg`
5. Option: export as Premiere Pro XML / DaVinci Resolve EDL for pro editing
6. Option: export as individual clips for Canva arrangement

**Rendering options:**
- Local: uses local machine's CPU/GPU
- Cloud (SaaS): upload compositions to render farm, get back MP4s

### P4: Team Collaboration (v2.2)
Multiple people reviewing the same project.

- Shared project state (database-backed, not localStorage)
- User roles: creator (full access), reviewer (pick + comment), viewer (read-only)
- Comments on individual variants: "I like this one but the timing is off"
- Approval workflow: reviewer approves picks before they're final
- Activity feed: who picked what, when
- Real-time sync (WebSocket or polling)

### P5: Plugin Architecture (v3.0)
Support animation frameworks beyond Remotion.

- **Animation Provider interface**: `generate(sentence, style) → variants[]`, `render(variant) → video`
- **Built-in providers**: Remotion (canvas), Remotion (React Three Fiber/3D)
- **Community providers**: Motion Canvas, Manim, After Effects templates
- **Style system**: define a visual theme (colors, fonts, animation patterns) once, apply to all providers

## Technical Architecture

```
remotion-studio/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── page.tsx            # Review UI (current)
│   │   ├── script/page.tsx     # Script planning view (P0)
│   │   ├── export/page.tsx     # Export pipeline (P3)
│   │   └── api/
│   │       ├── remix/route.ts  # Claude remix endpoint (P1)
│   │       ├── render/route.ts # Rendering endpoint (P3)
│   │       └── project/route.ts# Project CRUD (P4)
│   ├── components/
│   │   ├── SceneTimeline.tsx   # Bottom timeline strip
│   │   ├── NarrationBar.tsx    # Sentence display
│   │   ├── PreviousScene.tsx   # Previous scene player
│   │   ├── VariantGrid.tsx     # 3x3 grid
│   │   ├── VariantPlayer.tsx   # Remotion Player wrapper
│   │   ├── RemixBox.tsx        # AI remix input
│   │   ├── ScriptEditor.tsx    # Script paste + split (P0)
│   │   ├── SceneCard.tsx       # Scene card in script view (P0)
│   │   └── ExportPanel.tsx     # Export options (P3)
│   ├── lib/
│   │   ├── types.ts            # Core types
│   │   ├── scenes.ts           # Scene data
│   │   ├── composition-registry.tsx # Dynamic Remotion imports
│   │   ├── project-store.ts    # Project persistence (P0)
│   │   └── providers/          # Animation provider interface (P5)
│   │       ├── base.ts         # Provider interface
│   │       └── remotion.ts     # Remotion provider
│   └── remotion-src/           # Symlink to animation source
├── prisma/                     # Database schema (P4)
└── public/
```

## Data Model

```typescript
interface Project {
  id: string;
  name: string;
  script: string;           // Full script text
  srtUrl?: string;          // Uploaded SRT file
  audioUrl?: string;        // Uploaded narration audio
  theme: ThemeConfig;       // Visual style settings
  scenes: Scene[];
  createdAt: Date;
  updatedAt: Date;
}

interface Scene {
  id: number;
  projectId: string;
  narration: string;
  timeStart: string;
  timeEnd: string;
  durationSec: number;
  durationFrames: number;
  section: string;
  visualConcept: string;    // Creator's notes on what to show
  status: "empty" | "generating" | "reviewing" | "final";
  pickedVariant?: number;
  remixHistory: RemixEntry[];
  comments: Comment[];       // P4
}

interface RemixEntry {
  timestamp: Date;
  notes: string;
  resultShotFile: string;   // Path to generated file
}

interface ThemeConfig {
  provider: "remotion-canvas" | "remotion-r3f" | "custom";
  palette: string[];
  background: string;
  fontFamily: string;
  animationStyle: "cellular-cute" | "flat-bold" | "3d" | "custom";
}
```

## Persistence Strategy

**v2.0 (local):** JSON file on disk (`~/.remotion-studio/projects/`)
**v2.2 (cloud):** PostgreSQL via Prisma + file storage (S3/R2) for rendered clips

## Milestones

### v2.0 — Core Product (4-6 weeks)
- [ ] Script planning view (paste → split → scene cards)
- [ ] SRT import for timing
- [ ] Working AI remix via Claude Code CLI
- [ ] Resizable panels
- [ ] Full-screen variant preview
- [ ] Keyboard shortcuts
- [ ] Project persistence (local JSON)
- [ ] Transition preview (previous → current playback)

### v2.1 — Export (2-3 weeks)
- [ ] Render picked scenes via @remotion/renderer
- [ ] Auto-stitch with ffmpeg
- [ ] Export as individual clips
- [ ] Premiere/DaVinci XML export

### v2.2 — Collaboration (4-6 weeks)
- [ ] Database-backed project storage
- [ ] User auth (clerk/next-auth)
- [ ] Comments on variants
- [ ] Shared project links
- [ ] Activity feed

### v3.0 — Platform (ongoing)
- [ ] Provider plugin system
- [ ] Theme marketplace
- [ ] Template library
- [ ] Motion Canvas provider
- [ ] React Three Fiber provider

## Verification

After implementing v2.0:
1. Open the app, paste a script, see it auto-split into sentences
2. Upload an SRT → timing auto-assigned to each scene
3. Navigate to a scene → see 9 variants playing in the grid
4. Type remix notes → Claude rewrites → 9 new variants appear
5. Pick a variant → it's saved, shown as previous when moving to next scene
6. Navigate forward/backward with keyboard → all state persists
7. Close and reopen → project state is preserved
