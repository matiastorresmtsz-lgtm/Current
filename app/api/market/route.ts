import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    ok: true,
    message: "Market API route is available.",
    source: "rouge",
  });
}
