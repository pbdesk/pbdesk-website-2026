import { draftMode } from "next/headers";
import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get("secret");
  const slug = request.nextUrl.searchParams.get("slug") ?? "/";

  const expectedSecret = process.env.STORYBLOK_PREVIEW_SECRET;
  if (!expectedSecret || secret !== expectedSecret) {
    return new Response("Invalid token", { status: 401 });
  }

  const draft = await draftMode();
  draft.enable();

  const safeSlug = slug.startsWith("/") ? slug : `/${slug}`;
  redirect(safeSlug);
}
