"use client";
import { jwtDecode } from "jwt-decode";

interface CustomJwtPayload {
  _id: string;
  email: string;
  role: string;
  uuid: string;
  iat: number;
  exp: number;
}

export const setAuthCookie = (token: string) => {
  if (typeof window === "undefined") return;

  // Store in cookie via document.cookie (client-side)
  const maxAge = 7 * 24 * 60 * 60; // 7 days in seconds
  document.cookie = `auth-token=${token}; path=/; max-age=${maxAge}; samesite=strict${
    process.env.NODE_ENV === "production" ? "; secure" : ""
  }`;
};

export const getAuthCookie = (): string | null => {
  if (typeof window === "undefined") return null;

  // Get from cookie only
  const cookies = document.cookie.split(";");
  for (let cookie of cookies) {
    const [name, value] = cookie.trim().split("=");
    if (name === "auth-token") {
      return value;
    }
  }

  return null;
};

export const removeAuthCookie = () => {
  if (typeof window === "undefined") return;

  // Remove cookie
  document.cookie =
    "auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC";
};

export const getCurrentUser = (): {
  id: string;
  email: string;
  role: string;
  uuid: string;
} | null => {
  const token = getAuthCookie();

  if (!token) return null;

  try {
    const decoded = jwtDecode<CustomJwtPayload>(token);

    // Check if token is expired
    if (decoded.exp * 1000 < Date.now()) {
      removeAuthCookie();
      return null;
    }

    return {
      id: decoded._id,
      email: decoded.email,
      role: decoded.role,
      uuid: decoded.uuid,
    };
  } catch (error) {
    console.error("Error decoding token:", error);
    removeAuthCookie();
    return null;
  }
};

export const isAuthenticated = (): boolean => {
  return getCurrentUser() !== null;
};
