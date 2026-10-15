import { NextResponse, NextRequest } from "next/server";
import axiosIntercept from "@/utils/axios/axiosIntercept";
import { isAxiosError } from "axios";
import axiosErrorLogger from "@/components/error/axios_error";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> },
) {
  const axioswithIntercept = await axiosIntercept();
  const { orderId } = await params;

  try {
    const backendRes = await axioswithIntercept.get(
      `/admin/orders/${encodeURIComponent(orderId)}/payment-logs`,
    );

    return NextResponse.json(backendRes.data, { status: backendRes.status });
  } catch (error: any) {
    console.error(
      "❌ Error in GET /api/admin/orders/[orderId]/payment-logs:",
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
