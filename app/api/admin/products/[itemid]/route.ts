import { NextResponse, NextRequest } from "next/server";
import axiosIntercept from "@/utils/axios/axiosIntercept";
import { isAxiosError } from "axios";
import axiosErrorLogger from "@/components/error/axios_error";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ itemid: string }> }
) {
  return NextResponse.json(
    { message: "Product detail endpoint - under construction" },
    { status: 501 }
  );
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ itemid: string }> }
) {
  const axioswithIntercept = await axiosIntercept();
  const { itemid } = await params;

  try {
    const backendRes = await axioswithIntercept.delete(`/products/${itemid}`);
    const data = backendRes.data;
    
    return NextResponse.json(data, { status: backendRes.status });
  } catch (error: any) {
    axiosErrorLogger({ error });
    if (isAxiosError(error) && error.response) {
      return NextResponse.json(
        error.response.data,
        { status: error.response.status ?? 500 }
      );
    }
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
