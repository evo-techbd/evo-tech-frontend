"use server";

import { getErrorMessage } from "@/components/error/handle-error";
import axiosIntercept from "@/utils/axios/axiosIntercept";

export async function validateCoupon(code: string, orderAmount: number) {
  const axiosWithIntercept = await axiosIntercept();

  try {
    const response = await axiosWithIntercept.post("/coupons/validate", {
      code: code.toUpperCase(),
      orderAmount,
    });

    const { coupon, discountAmount } = response.data.data;

    return {
      success: true,
      data: {
        code: coupon.code,
        discountAmount,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
      },
    };
  } catch (error: any) {
    return {
      success: false,
      error: getErrorMessage(error) || "Invalid or expired coupon code",
    };
  }
}
