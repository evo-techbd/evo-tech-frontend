import { NextResponse, NextRequest } from "next/server";
import axios from "@/utils/axios/axios";
import { isAxiosError } from "axios";
import axiosErrorLogger from "@/components/error/axios_error";

export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Forward all query parameters to the backend
    const backendParams = new URLSearchParams();
    searchParams.forEach((value, key) => {
      backendParams.append(key, value);
    });

    const backendQueryString = backendParams.toString();

    // Backend API call for getting product images
    const backendRes = await axios.get(
      `/product-images${backendQueryString ? `?${backendQueryString}` : ""}`,
      {
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      }
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
