import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    { message: "Taxonomy alldata endpoint - under construction" },
    { status: 501 }
  );
}
