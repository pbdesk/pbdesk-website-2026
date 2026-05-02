import { draftMode } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { PREVIEW_COOKIE } from "../draft/route";

export async function GET(request: NextRequest) {
  const draft = await draftMode();
  draft.disable();

  const response = NextResponse.redirect(new URL("/", request.nextUrl.origin));
  response.cookies.delete(PREVIEW_COOKIE);
  return response;
}
