"use server";

import { revalidatePath } from "next/cache";
import { getErrorMessage } from "@/components/error/handle-error";
import axiosIntercept from "@/utils/axios/axiosIntercept";
import { isGroupBuyActive } from "@/utils/product-pricing";

// Storefront pages cache product data (ISR), so purge them whenever an admin
// changes something customers see — otherwise the old state lingers for up
// to an hour.
export async function revalidateStorefront() {
  revalidatePath("/", "layout");
}

// deleting an item
export async function deleteItem(input: { id: string }) {
  try {
    const axiosWithAuth = await axiosIntercept();
    await axiosWithAuth.delete(`/products/${input.id}`);
    await revalidateStorefront();

    return {
      data: null,
      error: null,
    };
  } catch (err: any) {
    return {
      data: null,
      error: err.response?.data?.message || getErrorMessage(err),
    };
  }
}

// toggle publishing an item

type TogglePublishedResponse = {
  message: string;
  published: boolean;
};

export async function toggleItemPublished(itemId: string) {
  try {
    const axiosWithAuth = await axiosIntercept();

    // First get the current product to check its published status
    const currentProduct = await axiosWithAuth.get(`/products/${itemId}`);
    const currentPublishedStatus = currentProduct.data.data.published;

    // Update with the opposite value
    const response = await axiosWithAuth.put(`/products/${itemId}`, {
      published: !currentPublishedStatus,
    });
    await revalidateStorefront();

    return {
      success: true,
      published: !currentPublishedStatus,
    };
  } catch (error: any) {
    // Handle error types
    if (error.response?.status === 404) {
      return {
        success: false,
        error: error.response?.data?.message || "Item not found",
      };
    }

    if (error.response?.status === 500) {
      return {
        success: false,
        error:
          error.response?.data?.message ||
          "Server error occurred while updating status",
      };
    }

    return {
      success: false,
      error:
        error.response?.data?.message || "Failed to update published status",
    };
  }
}

// turn Group Buy on/off for an item

export async function setItemGroupBuy(itemId: string, enabled: boolean) {
  try {
    const axiosWithAuth = await axiosIntercept();

    if (enabled) {
      // Turning on only makes sense with a Group Buy price below the regular
      // price — otherwise the storefront would still show the normal price.
      const currentProduct = await axiosWithAuth.get(`/products/${itemId}`);
      const product = currentProduct.data.data;
      if (
        !isGroupBuyActive({
          price: product.price,
          preOrderPrice: product.preOrderPrice,
          isPreOrder: true,
        })
      ) {
        return {
          success: false,
          error:
            "Set a Group Buy price lower than the regular price (Edit product) before turning Group Buy on",
        };
      }
    }

    await axiosWithAuth.put(`/products/${itemId}`, { isPreOrder: enabled });
    await revalidateStorefront();

    return {
      success: true,
      isPreOrder: enabled,
    };
  } catch (error: any) {
    return {
      success: false,
      error:
        error.response?.data?.message ||
        (error.response?.status === 404
          ? "Item not found"
          : "Failed to update Group Buy status"),
    };
  }
}
