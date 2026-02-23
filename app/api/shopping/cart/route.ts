import { NextResponse, NextRequest } from "next/server";
import axiosIntercept from "@/utils/axios/axiosIntercept";
import { isAxiosError } from "axios";
import axiosErrorLogger from "@/components/error/axios_error";
import { transformCartItems } from "./utils";

export async function GET(request: NextRequest) {
  let axioswithIntercept;

  try {
    axioswithIntercept = await axiosIntercept();
  } catch (error) {
    axiosErrorLogger({ error });
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const searchParams = request.nextUrl.searchParams;
    const cart_t = searchParams.get("cart_t");

    const backendRes = await axioswithIntercept.get(
      `/shopping/cart${cart_t ? `?cart_t=${cart_t}` : ""}`,
      {
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      }
    );

    const backendPayload = backendRes.data;
    const cartdata = transformCartItems(backendPayload?.data);

    return NextResponse.json(
      {
        cartdata,
        ctoken: cart_t,
      },
      { status: backendRes.status }
    );
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
