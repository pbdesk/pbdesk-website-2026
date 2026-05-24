import type { NextRequest } from "next/server";
import { findById, getLibrary } from "@/lib/games/kenken/puzzle-loader";
import { resolvePuzzleRequest } from "@/lib/games/kenken/resolve";

// Random selection per request: never cache.
export const dynamic = "force-dynamic";

export function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const level = searchParams.get("level");
  const excludeParam = searchParams.get("exclude") ?? "";
  const exclude = excludeParam
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  const sizeParam = searchParams.get("size");
  const sizeNum = sizeParam === null ? null : Number(sizeParam);
  const size =
    sizeNum !== null && Number.isFinite(sizeNum) && sizeNum > 0
      ? sizeNum
      : null;

  const result = resolvePuzzleRequest(
    { id, level, exclude, size },
    {
      byId: (puzzleId) => findById(puzzleId),
      byLevel: (lvl) => getLibrary(lvl).puzzles,
    }
  );

  return Response.json(result.body, { status: result.status });
}
