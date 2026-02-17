"use server";

import { getErrorMessage } from "@/components/error/handle-error";
import axiosIntercept from "@/utils/axios/axiosIntercept";

// deleting an item
export async function deleteItem(input: { id: string }) {
  try {
    const axiosWithAuth = await axiosIntercept();
    await axiosWithAuth.delete(`/products/${input.id}`);

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
