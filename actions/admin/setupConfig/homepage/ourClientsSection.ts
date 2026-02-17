"use server";

import { getErrorMessage } from "@/components/error/handle-error";
import axiosIntercept from "@/utils/axios/axiosIntercept";

// deleting a client item
export async function deleteOurClientItem(input: { id: string }) {
  const axiosWithIntercept = await axiosIntercept();

  try {
    const backRes = await axiosWithIntercept.delete(`/clients/${input.id}`);

    return {
      data: backRes.data,
      error: null,
    };
  } catch (err) {
    return {
      data: null,
      error: getErrorMessage(err),
    };
  }
}
