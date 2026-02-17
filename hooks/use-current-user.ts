"use client";

import { useState, useEffect } from "react";
import { getCurrentUser } from "@/utils/cookies";
import axios from "@/utils/axios/axios";

interface CurrentUser {
  id: string;
  uuid: string;
  email: string;
  role: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  reward_points?: number;
}

export const useCurrentUser = () => {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        // Get basic user from cookie-based JWT
        const currentUser = getCurrentUser();

        if (!currentUser) {
          setUser(null);
          setIsLoading(false);
          return;
        }

        // Fetch full user details from backend
        try {
          const response = await axios.get("/auth/me");
          if (response.data?.success && response.data?.data) {
            const userData = response.data.data.user;
            setUser({
              id: userData._id || currentUser.id,
              uuid: userData.uuid || currentUser.uuid,
              email: userData.email || currentUser.email,
              role: userData.userType || userData.role || currentUser.role,
              firstName: userData.firstName,
              lastName: userData.lastName,
              phone: userData.phone,
              reward_points: userData.rewardPoints,
            });
          } else {
            // Fallback to JWT data if API call fails
            setUser({
              id: currentUser.id,
              uuid: currentUser.uuid,
              email: currentUser.email,
              role: currentUser.role,
            });
          }
        } catch (error) {
          // Fallback to JWT data if API call fails
          setUser({
            id: currentUser.id,
            uuid: currentUser.uuid,
            email: currentUser.email,
            role: currentUser.role,
          });
        }
      } catch (error) {
        console.error("Error fetching user:", error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();

    // Listen for auth changes
    const handleAuthChange = () => {
      fetchUser();
    };

    window.addEventListener("authChange", handleAuthChange);

    return () => {
      window.removeEventListener("authChange", handleAuthChange);
    };
  }, []);

  return user;
};
