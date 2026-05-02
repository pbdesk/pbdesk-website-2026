import { createHmac, timingSafeEqual } from "node:crypto";
import { revalidateTag } from "next/cache";
import type { NextRequest } from "next/server";
import { STORYBLOK_CACHE_TAG, storyTag } from "@/lib/storyblok/tags";

interface StoryblokWebhookPayload {
  action?: string;
  full_slug?: string;
  space_id?: number;
  story_id?: number;
  text?: string;
}

function verifySignature(rawBody: string, signature: string | null): boolean {
  const secret = process.env.STORYBLOK_WEBHOOK_SECRET;
  if (!(secret && signature)) {
    return false;
  }
  const computed = createHmac("sha1", secret).update(rawBody).digest("hex");
  const expected = Buffer.from(computed, "utf8");
  const provided = Buffer.from(signature, "utf8");
  if (expected.length !== provided.length) {
    return false;
  }
  return timingSafeEqual(expected, provided);
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature =
    request.headers.get("webhook-signature") ??
    request.headers.get("x-storyblok-signature");

  if (!verifySignature(rawBody, signature)) {
    return Response.json(
      { revalidated: false, error: "invalid signature" },
      {
        status: 401,
      }
    );
  }

  let payload: StoryblokWebhookPayload;
  try {
    payload = JSON.parse(rawBody) as StoryblokWebhookPayload;
  } catch {
    return Response.json(
      { revalidated: false, error: "invalid json" },
      {
        status: 400,
      }
    );
  }

  revalidateTag(STORYBLOK_CACHE_TAG, { expire: 0 });
  if (payload.full_slug) {
    revalidateTag(storyTag(payload.full_slug), { expire: 0 });
  }

  return Response.json({
    revalidated: true,
    action: payload.action,
    full_slug: payload.full_slug,
    now: Date.now(),
  });
}
