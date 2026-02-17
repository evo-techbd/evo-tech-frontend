import { NextRequest, NextResponse } from "next/server";
import axiosIntercept from "@/utils/axios/axiosIntercept";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json();
    const { id } = await params;

    const axiosWithAuth = await axiosIntercept();
    const response = await axiosWithAuth.put(`/users/${id}`, body);

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.response?.data?.message || "Failed to update user",
      },
      { status: error.response?.status || 500 }
    );
  }
}
