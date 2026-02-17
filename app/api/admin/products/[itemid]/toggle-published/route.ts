import { NextResponse, NextRequest } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ itemid: string }> }
) {
  return NextResponse.json(
    { message: "Toggle published endpoint - under construction" },
    { status: 501 }
  );
}
