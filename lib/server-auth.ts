import { cookies } from "next/headers";
import { jwtDecode } from "jwt-decode";

interface JWTPayload {
  _id: string;
  email: string;
  role: string;
  uuid: string;
  iat: number;
  exp: number;
}

export async function getServerAuth() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;

    if (!token) {
      return null;
    }

    const decoded = jwtDecode<JWTPayload>(token);

    // Check if token is expired
    if (decoded.exp * 1000 < Date.now()) {
      return null;
    }

    return {
      user: {
        id: decoded._id,
        email: decoded.email,
        role: decoded.role,
        uuid: decoded.uuid,
      },
    };
  } catch (error) {
    console.error("Server auth error:", error);
    return null;
  }
}
