import { NextResponse, NextRequest } from "next/server";
import axiosIntercept from "@/utils/axios/axiosIntercept";
import { isAxiosError } from "axios";
import axiosErrorLogger from "@/components/error/axios_error";

// POST - Add feature subsection (with image upload)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  const axioswithIntercept = await axiosIntercept();
  const { productId } = await params;

  try {
    const formData = await request.formData();

    const backendRes = await axioswithIntercept.post(
      `/products/${productId}/feature-subsections`,
      formData,
      {
        // Do NOT set Content-Type manually - axios auto-sets it with boundary for FormData
        timeout: 120000, // 120 seconds timeout for image uploads
      }
    );

    return NextResponse.json(backendRes.data, { status: backendRes.status });
  } catch (error: any) {
    axiosErrorLogger({ error });
    if (isAxiosError(error) && error.response) {
      return NextResponse.json(error.response.data, {
        status: error.response.status ?? 500,
      });
    }
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
