import { NextResponse, NextRequest } from "next/server";
import axiosIntercept from "@/utils/axios/axiosIntercept";
import { isAxiosError } from "axios";
import axiosErrorLogger from "@/components/error/axios_error";

// PUT - Update color variation
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ colorId: string }> }
) {
  const axioswithIntercept = await axiosIntercept();
  const { colorId } = await params;

  try {
    const body = await request.json();

    const backendRes = await axioswithIntercept.put(
      `/products/color-variations/${colorId}`,
      body
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

// DELETE - Delete color variation
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ colorId: string }> }
) {
  const axioswithIntercept = await axiosIntercept();
  const { colorId } = await params;

  try {
    const backendRes = await axioswithIntercept.delete(
      `/products/color-variations/${colorId}`
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
