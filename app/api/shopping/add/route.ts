import { NextResponse, NextRequest } from "next/server";
import axiosIntercept from "@/utils/axios/axiosIntercept";
import { isAxiosError } from "axios";
import axiosErrorLogger from "@/components/error/axios_error";
import { transformCartItems } from "../cart/utils";

export async function POST(request: NextRequest) {
  let axioswithIntercept;

  try {
    axioswithIntercept = await axiosIntercept();
  } catch (error) {
    axiosErrorLogger({ error });
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const cart_t = body?.cart_t as string | undefined;

    const backendRes = await axioswithIntercept.post(`/shopping/cart`, body, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Retrieve the updated cart to align with frontend expectations
    const refreshedCart = await axioswithIntercept.get(`/shopping/cart`);

    const cartdata = transformCartItems(refreshedCart.data?.data);

    const backendMessage: string = backendRes.data?.message ?? "";
    let frontendMessage = backendMessage;

    if (/added to cart/i.test(backendMessage)) {
      frontendMessage = "Item added to cart";
    }

    return NextResponse.json(
      {
        message: frontendMessage,
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
