"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { getAuthCookie, getCurrentUser } from "@/utils/cookies";
import axios from "@/utils/axios/axios";
import { User, Order, UserDashboardStats } from "@/types";

export const useUserDashboard = () => {
  const [dashboardData, setDashboardData] = useState<UserDashboardStats | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const token = getAuthCookie();
  const fetchDashboardData = useCallback(async () => {
    if (!token) {
      setLoading(false);
      setDashboardData(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await axios.get("/users/dashboard/stats");

      if (response.data?.success) {
        setDashboardData(response.data.data as UserDashboardStats);
      } else {
        throw new Error(
          response.data?.message || "Failed to load dashboard data"
        );
      }
    } catch (err) {
      console.error("Error fetching dashboard data:", err);

      const fallback: UserDashboardStats = {
        totalOrders: 0,
        totalSpent: 0,
        recentOrders: [],
        memberSince: undefined,
      };
      setDashboardData(fallback);
      setError(
        err instanceof Error ? err.message : "Failed to load dashboard data"
      );
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchDashboardData();

    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000);

    // Refresh when page becomes visible
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchDashboardData();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [fetchDashboardData]);

  return { dashboardData, loading, error };
};

export const useUserProfile = () => {
  const currentUser = useMemo(() => getCurrentUser(), []);
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!currentUser) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Fetch full profile from API
        const response = await axios.get("/auth/me");
        if (response.data?.success) {
          const userData = response.data.data.user;
          const profileData: User = {
            uuid: userData._id || currentUser.id,
            userType: (userData.role === "admin" ? "admin" : "user") as
              | "admin"
              | "user",
            firstName: userData.firstName || "",
            lastName: userData.lastName || "",
            email: userData.email || currentUser.email,
            phone: userData.phone || undefined,
            rewardPoints: userData.reward_points || 0,
            newsletterOptIn: userData.newsletter_opt_in || false,
            isActive: true,
          };
          setProfile(profileData);
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError(err instanceof Error ? err.message : "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [currentUser, refreshKey]);

  const refreshProfile = () => setRefreshKey((prev) => prev + 1);

  return { profile, loading, error, refreshProfile };
};

export const useUserOrders = () => {
  const currentUser = useMemo(() => getCurrentUser(), []);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [meta, setMeta] = useState<{
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  } | null>(null);

  const fetchOrders = useCallback(async () => {
    if (!currentUser) {
      setLoading(false);
      setOrders([]);
      setMeta(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await axios.get("/users/dashboard/orders");

      if (response.data?.success) {
        setOrders(response.data.data || []);
        setMeta(response.data.meta || null);
      } else {
        throw new Error(response.data?.message || "Failed to load orders");
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
      setOrders([]);
      setMeta(null);
      setError(err instanceof Error ? err.message : "Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return { orders, meta, loading, error, refresh: fetchOrders };
};
