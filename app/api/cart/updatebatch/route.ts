import { NextRequest, NextResponse } from "next/server";
import axiosIntercept from "@/utils/axios/axiosIntercept";
import { isAxiosError } from "axios";
import axiosErrorLogger from "@/components/error/axios_error";
import { transformCartItems } from "@/app/api/shopping/cart/utils";

type BatchUpdateItem = {
  item_id: string;
  item_color?: string | null;
  item_quantity: number;
};

const findMatchingCartItem = (
  cartItems: any[] = [],
  target: BatchUpdateItem
) => {
  return cartItems.find((cartItem) => {
    const productId = cartItem.product?._id || "";
    const color = cartItem.selectedColor || null;
    const normalizedColor =
      typeof color === "string" ? color.toLowerCase() : color;
    const targetColor = target.item_color
      ? target.item_color.toLowerCase()
      : null;

    const productMatches = productId === target.item_id;
    const colorMatches = targetColor ? normalizedColor === targetColor : true;

    return productMatches && colorMatches;
  });
};

export async function PUT(request: NextRequest) {
  let axiosWithIntercept;

  try {
    axiosWithIntercept = await axiosIntercept();
  } catch (error) {
    axiosErrorLogger({ error });
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const updates: BatchUpdateItem[] = Array.isArray(body?.items)
      ? body.items
      : [];
    const cartToken = typeof body?.cart_t === "string" ? body.cart_t : null;

    if (updates.length === 0) {
      return NextResponse.json(
        { message: "No cart items provided for update" },
        { status: 400 }
      );
    }

    // Fetch current cart snapshot once
    const currentCartResponse = await axiosWithIntercept.get("/shopping/cart");
    const currentItems = Array.isArray(currentCartResponse.data?.data)
      ? currentCartResponse.data.data
      : [];

    // Apply updates sequentially to ensure order and allow graceful fallback
    for (const update of updates) {
      if (!update.item_id) {
        continue;
      }

      const match = findMatchingCartItem(currentItems, update);

      if (!match?._id) {
        continue;
      }

      await axiosWithIntercept.put(`/shopping/cart/${match._id}`, {
        quantity: update.item_quantity,
        selectedColor: update.item_color ?? match.selectedColor ?? null,
      });
    }

    // Fetch the refreshed cart after updates
    const refreshedCart = await axiosWithIntercept.get("/shopping/cart");
    const cartdata = transformCartItems(refreshedCart.data?.data);

    return NextResponse.json(
      {
        message: "Cart items updated",
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
      { message: "Failed to update cart items" },
      { status: 500 }
    );
  }
}
