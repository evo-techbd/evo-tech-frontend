"use server";

import { revalidatePath } from "next/cache";
import { getErrorMessage } from "@/components/error/handle-error";
import axiosIntercept from "@/utils/axios/axiosIntercept";

export interface ProductGroupPayload {
  name: string;
  title?: string;
  members: { product: string; label?: string }[];
  isActive?: boolean;
}

// Group changes show on every member's product page, which are ISR-cached,
// so revalidate the whole layout like product updates do.
const revalidateStorefront = () => {
  revalidatePath("/", "layout");
};

export async function createProductGroup(data: ProductGroupPayload) {
  try {
    const axiosWithAuth = await axiosIntercept();
    const response = await axiosWithAuth.post("/product-groups", data);

    revalidateStorefront();
    return { success: true, data: response.data?.data };
  } catch (error: any) {
    return {
      error:
        error.response?.data?.message ||
        getErrorMessage(error) ||
        "Failed to create product group",
    };
  }
}

export async function updateProductGroup(
  id: string,
  data: Partial<ProductGroupPayload>,
) {
  try {
    const axiosWithAuth = await axiosIntercept();
    const response = await axiosWithAuth.patch(`/product-groups/${id}`, data);

    revalidateStorefront();
    return { success: true, data: response.data?.data };
  } catch (error: any) {
    return {
      error:
        error.response?.data?.message ||
        getErrorMessage(error) ||
        "Failed to update product group",
    };
  }
}

export async function deleteProductGroup(id: string) {
  try {
    const axiosWithAuth = await axiosIntercept();
    await axiosWithAuth.delete(`/product-groups/${id}`);

    revalidateStorefront();
    return { success: true };
  } catch (error: any) {
    return {
      error:
        error.response?.data?.message ||
        getErrorMessage(error) ||
        "Failed to delete product group",
    };
  }
}
