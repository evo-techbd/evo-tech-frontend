"use server";

import { revalidatePath } from "next/cache";
import { getErrorMessage } from "@/components/error/handle-error";
import axiosIntercept from "@/utils/axios/axiosIntercept";

export interface CreateCouponData {
  code: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  minimumOrderAmount?: number;
  validFrom: string;
  validUntil: string;
  maxUsageCount: number;
  isReusable: boolean;
  applicableCategories?: string[];
  applicableProducts?: string[];
}

export async function createCoupon(data: CreateCouponData) {
  try {
    const axiosWithAuth = await axiosIntercept();
    const response = await axiosWithAuth.post("/coupons", data);

    revalidatePath("/control/coupons");
    return { success: true, data: response.data };
  } catch (error: any) {
    return {
      error:
        error.response?.data?.message ||
        getErrorMessage(error) ||
        "Failed to create coupon",
    };
  }
}

export async function updateCoupon(
  id: string,
  data: Partial<CreateCouponData>,
) {
  try {
    const axiosWithAuth = await axiosIntercept();
    const response = await axiosWithAuth.patch(`/coupons/${id}`, data);

    revalidatePath("/control/coupons");
    return { success: true, data: response.data };
  } catch (error: any) {
    return {
      error:
        error.response?.data?.message ||
        getErrorMessage(error) ||
        "Failed to update coupon",
    };
  }
}

export async function deleteCoupon(id: string) {
  try {
    const axiosWithAuth = await axiosIntercept();
    await axiosWithAuth.delete(`/coupons/${id}`);

    revalidatePath("/control/coupons");
    return { success: true };
  } catch (error: any) {
    return {
      error:
        error.response?.data?.message ||
        getErrorMessage(error) ||
        "Failed to delete coupon",
    };
  }
}

export async function toggleCouponStatus(id: string, isActive: boolean) {
  try {
    const axiosWithAuth = await axiosIntercept();
    await axiosWithAuth.patch(`/coupons/${id}`, { isActive });

    revalidatePath("/control/coupons");
    return { success: true };
  } catch (error: any) {
    return {
      error:
        error.response?.data?.message ||
        getErrorMessage(error) ||
        "Failed to update coupon status",
    };
  }
}

export async function getCouponById(id: string) {
  try {
    const axiosWithAuth = await axiosIntercept();
    const response = await axiosWithAuth.get(`/coupons/${id}`);

    return { success: true, data: response.data.data };
  } catch (error: any) {
    return {
      error: getErrorMessage(error) || "Failed to fetch coupon",
    };
  }
}
