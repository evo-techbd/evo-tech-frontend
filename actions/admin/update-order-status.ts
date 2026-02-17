"use server";

import { getErrorMessage } from "@/components/error/handle-error";
import axiosIntercept from "@/utils/axios/axiosIntercept";

interface Input {
  id: string;
  payload: Record<string, any>;
}

export async function updateOrderStatus(input: Input) {
  try {
    const axiosWithAuth = await axiosIntercept();
    const response = await axiosWithAuth.put(
      `/orders/${input.id}`,
      input.payload,
    );

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
