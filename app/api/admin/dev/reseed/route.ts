import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  return NextResponse.json(
    {
      success: false,
      message: "Reseed endpoint is under construction",
    },
    { status: 501 }
  );
}
