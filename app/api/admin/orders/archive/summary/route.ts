import { NextResponse, NextRequest } from "next/server";
import axiosIntercept from "@/utils/axios/axiosIntercept";
import { isAxiosError } from "axios";
import axiosErrorLogger from "@/components/error/axios_error";

export async function GET(request: NextRequest) {
  const axioswithIntercept = await axiosIntercept();

  try {
    const { searchParams } = new URL(request.url);
    const year = searchParams.get("year");

    const backendRes = await axioswithIntercept.get(
      `/orders/archive/summary${year ? `?year=${encodeURIComponent(year)}` : ""}`,
    );

    return NextResponse.json(backendRes.data, { status: backendRes.status });
  } catch (error: any) {
    console.error(
      "❌ Error in /api/admin/orders/archive/summary:",
      error.response?.data || error.message,
    );
    axiosErrorLogger({ error });
    if (isAxiosError(error) && error.response) {
      return NextResponse.json(error.response.data, {
        status: error.response.status ?? 500,
      });
    }
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
