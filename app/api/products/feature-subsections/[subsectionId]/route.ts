import { NextResponse, NextRequest } from "next/server";
import axiosIntercept from "@/utils/axios/axiosIntercept";
import { isAxiosError } from "axios";
import axiosErrorLogger from "@/components/error/axios_error";

// PUT - Update feature subsection
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ subsectionId: string }> }
) {
  const axioswithIntercept = await axiosIntercept();
  const { subsectionId } = await params;

  try {
    const formData = await request.formData();

    const backendRes = await axioswithIntercept.put(
      `/products/feature-subsections/${subsectionId}`,
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

// DELETE - Delete feature subsection
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ subsectionId: string }> }
) {
  const axioswithIntercept = await axiosIntercept();
  const { subsectionId } = await params;

  try {
    const backendRes = await axioswithIntercept.delete(
      `/products/feature-subsections/${subsectionId}`
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
