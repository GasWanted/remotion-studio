import { NextRequest, NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";
import path from "path";

const execAsync = promisify(exec);

// Path to the sentence-grid shots directory
const SHOTS_DIR = path.resolve(
  process.cwd(),
  "../fly-brain/visuals/sentence-grid/src/shots-flatbold"
);

export async function POST(req: NextRequest) {
  try {
    const { shotNum, narration, remixNotes } = await req.json();

    if (!shotNum || !remixNotes) {
      return NextResponse.json(
        { error: "Missing shotNum or remixNotes" },
        { status: 400 }
      );
    }

    const shotFile = `shot_${String(shotNum).padStart(3, "0")}.tsx`;
    const shotPath = path.join(SHOTS_DIR, shotFile);

    // Build the prompt for Claude Code CLI
    const prompt = `
Rewrite the file ${shotPath} with 9 new variant animations.

The narration for this scene is: "${narration}"

The user's remix instructions: "${remixNotes}"

Requirements:
- Keep the same import pattern and export name (VARIANTS_FB_${String(shotNum).padStart(3, "0")})
- Keep the cellular cute theme (drawFBBg, drawFBNode, drawFBEdge, etc from flatbold-kit)
- Each of the 9 variants must be GENUINELY DIFFERENT visual metaphors
- Each variant should be 40-80 lines of canvas drawing code
- Make them STORY-DRIVEN — they should visually convey what the narration says
- Apply the user's specific remix notes to all 9 variants
`.trim();

    // Spawn Claude Code CLI
    // Using --print to get output, --dangerously-skip-permissions to allow file writes
    const { stdout, stderr } = await execAsync(
      `claude --print --dangerously-skip-permissions "${prompt.replace(/"/g, '\\"')}"`,
      {
        cwd: SHOTS_DIR,
        timeout: 120000, // 2 minute timeout
        env: { ...process.env },
      }
    );

    return NextResponse.json({
      success: true,
      message: `Remixed shot ${shotNum} with notes: ${remixNotes}`,
      output: stdout.slice(0, 500), // truncate for response
    });
  } catch (error: any) {
    console.error("Remix error:", error);
    return NextResponse.json(
      {
        error: "Remix failed",
        details: error.message || String(error),
      },
      { status: 500 }
    );
  }
}
