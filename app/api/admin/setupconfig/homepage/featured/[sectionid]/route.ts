import { NextResponse, NextRequest } from "next/server";
import axiosIntercept from "@/utils/axios/axiosIntercept";
import { isAxiosError } from "axios";
import axiosErrorLogger from "@/components/error/axios_error";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ sectionid: string }> }
) {
  const axioswithIntercept = await axiosIntercept();
  const { sectionid } = await params;

  try {
    const reqBody = await request.json();

    const backendRes = await axioswithIntercept.put(
      `/api/admin/lp/sections/update/${sectionid}`,
      reqBody
    );

    const data = backendRes.data;
    return NextResponse.json(data, { status: backendRes.status });
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
