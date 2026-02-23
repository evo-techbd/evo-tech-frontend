"use server";

import { cookies } from "next/headers";

type LogoutResult = {
  success: boolean;
  error?: string;
};

export const logout = async (): Promise<LogoutResult> => {
  try {
    const cookieStore = await cookies();

    // Clear any custom cookies we control
    cookieStore.delete("last_pg");

    // Try to clear refresh token cookie if it exists
    try {
      cookieStore.delete("refreshToken");
    } catch (e) {
      // Cookie might not exist
    }

    return { success: true };
  } catch (err) {
    console.error("Logout error:", err);
    return { success: false, error: "Failed to clear session cookies" };
  }
};
