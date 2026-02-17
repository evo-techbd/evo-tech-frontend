import { NextResponse, NextRequest } from "next/server";
import axiosIntercept from "@/utils/axios/axiosIntercept";
import { isAxiosError } from "axios";
import axiosErrorLogger from "@/components/error/axios_error";

// POST - Add feature header with optional banner image
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  const axioswithIntercept = await axiosIntercept();
  const { productId } = await params;

  try {
    const formData = await request.formData();

    // IMPORTANT: Do NOT set Content-Type header manually for FormData
    // Axios will auto-set it with the correct boundary
    const backendRes = await axioswithIntercept.post(
      `/products/${productId}/feature-headers`,
      formData,
      {
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
