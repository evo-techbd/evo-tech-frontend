"use client";

import { setAuthCookie, removeAuthCookie } from "@/utils/cookies";

const API_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000/api/v1";

interface LoginCredentials {
  email: string;
  password: string;
}

interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    user: {
      _id: string;
      email: string;
      role: string;
      uuid: string;
    };
    accessToken: string;
  };
}

interface ErrorResponse {
  success: boolean;
  message: string;
  errorMessages?: Array<{
    path: string;
    message: string;
  }>;
}

export async function loginUser(credentials: LoginCredentials): Promise<{
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}> {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
      credentials: "include", // Important: Send cookies with request
    });

    const data: LoginResponse | ErrorResponse = await response.json();

    if (!response.ok) {
      const errorData = data as ErrorResponse;
      return {
        success: false,
        message: errorData.message || "Login failed",
        error: errorData.message,
      };
    }

    const successData = data as LoginResponse;

    // Store access token in cookie
    setAuthCookie(successData.data.accessToken);

    // Dispatch custom event to notify other components
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("authChange"));
    }

    return {
      success: true,
      message: successData.message,
      data: successData.data,
    };
  } catch (error) {
    console.error("Login error:", error);
    return {
      success: false,
      message: "Network error",
      error: "Failed to connect to server",
    };
  }
}

export async function registerUser(userData: {
  name: string;
  email: string;
  password: string;
  contactNumber: string;
}): Promise<{
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}> {
  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
      credentials: "include",
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || "Registration failed",
        error: data.message,
      };
    }

    return {
      success: true,
      message: data.message,
      data: data.data,
    };
  } catch (error) {
    console.error("Registration error:", error);
    return {
      success: false,
      message: "Network error",
      error: "Failed to connect to server",
    };
  }
}

export async function logoutUser(): Promise<void> {
  try {
    await fetch(`${API_URL}/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
  } catch (error) {
    console.error("Logout error:", error);
  } finally {
    // Always remove auth cookie
    removeAuthCookie();

    // Dispatch custom event to notify other components
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("authChange"));
    }
  }
}

export async function refreshAccessToken(): Promise<string | null> {
  try {
    const response = await fetch(`${API_URL}/auth/refresh-token`, {
      method: "POST",
      credentials: "include", // Send refresh token cookie
    });

    if (!response.ok) {
      removeAuthCookie();
      return null;
    }

    const data: LoginResponse = await response.json();
    const newAccessToken = data.data.accessToken;

    // Update access token in cookie
    setAuthCookie(newAccessToken);

    return newAccessToken;
  } catch (error) {
    console.error("Token refresh error:", error);
    removeAuthCookie();
    return null;
  }
}
