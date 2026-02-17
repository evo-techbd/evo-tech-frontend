"use server";

import { getErrorMessage } from "@/components/error/handle-error";
import axiosIntercept from "@/utils/axios/axiosIntercept";

// deleting an order
export async function deleteOrder(input: { id: string }) {
  try {
    const axiosWithAuth = await axiosIntercept();
    const response = await axiosWithAuth.delete(`/orders/${input.id}`);

    return {
      data: response.data,
      error: null,
    };
  } catch (err: any) {
    return {
      data: null,
      error: err.response?.data?.message || getErrorMessage(err),
    };
  }
}
