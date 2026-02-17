import { NextRequest, NextResponse } from "next/server";
import axiosIntercept from "@/utils/axios/axiosIntercept";
import { isAxiosError } from "axios";
import axiosErrorLogger from "@/components/error/axios_error";
import { transformCartItems } from "@/app/api/shopping/cart/utils";

type RemovePayload = {
  item_id: string;
  item_color?: string | null;
};

const findMatchingCartItem = (
  cartItems: any[] = [],
  payload: RemovePayload
) => {
  return cartItems.find((cartItem) => {
    const productId = cartItem.product?._id || "";
    const color = cartItem.selectedColor || null;
    const normalizedColor =
      typeof color === "string" ? color.toLowerCase() : color;
    const targetColor = payload.item_color
      ? payload.item_color.toLowerCase()
      : null;

    const productMatches = productId === payload.item_id;
    const colorMatches = targetColor ? normalizedColor === targetColor : true;

    return productMatches && colorMatches;
  });
};

export async function DELETE(request: NextRequest) {
  let axiosWithIntercept;

  try {
    axiosWithIntercept = await axiosIntercept();
  } catch (error) {
    axiosErrorLogger({ error });
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const payload: RemovePayload = {
      item_id: body?.item_id,
      item_color: body?.item_color,
    };
    const cartToken = typeof body?.cart_t === "string" ? body.cart_t : null;

    if (!payload.item_id) {
      return NextResponse.json(
        { message: "item_id is required to remove a cart item" },
        { status: 400 }
      );
    }

    const currentCartResponse = await axiosWithIntercept.get("/shopping/cart");
    const currentItems = Array.isArray(currentCartResponse.data?.data)
      ? currentCartResponse.data.data
      : [];

    const match = findMatchingCartItem(currentItems, payload);

    if (!match?._id) {
      return NextResponse.json(
        { message: "Cart item not found" },
        { status: 404 }
      );
    }

    await axiosWithIntercept.delete(`/shopping/cart/${match._id}`);

    const refreshedCart = await axiosWithIntercept.get("/shopping/cart");
    const cartdata = transformCartItems(refreshedCart.data?.data);

    return NextResponse.json(
      {
        message: "Cart item removed",
        cartdata,
        ctoken: cartToken,
      },
      { status: 200 }
    );
  } catch (error: any) {
    axiosErrorLogger({ error });
    if (isAxiosError(error) && error.response) {
      return NextResponse.json(error.response.data, {
        status: error.response.status ?? 500,
      });
    }
    return NextResponse.json(
      { message: "Failed to remove cart item" },
      { status: 500 }
    );
  }
}
