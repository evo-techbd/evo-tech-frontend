"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { getCurrentUser } from "@/utils/cookies";
import axios from "@/utils/axios/axios";

interface PendingOrdersContextType {
    pendingCount: number;
    refreshPendingCount: () => Promise<void>;
    isLoading: boolean;
}

const PendingOrdersContext = createContext<PendingOrdersContextType | undefined>(undefined);

export function PendingOrdersProvider({ children }: { children: React.ReactNode }) {
    const currentUser = getCurrentUser();
    const [pendingCount, setPendingCount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    const refreshPendingCount = useCallback(async () => {
        if (!currentUser) {
            setPendingCount(0);
            setIsLoading(false);
            return;
        }

        // Only fetch pending orders for admin/staff roles
        const userRole = currentUser?.role?.toUpperCase();
        if (userRole !== 'ADMIN' && userRole !== 'EMPLOYEE') {
            setPendingCount(0);
            setIsLoading(false);
            return;
        }

        try {
            setIsLoading(true);
            const response = await axios.get("/dashboard/pending-orders-count");

            if (response.data.success) {
                setPendingCount(response.data.data.count || 0);
            }
        } catch (error) {
            console.error("Error fetching pending orders count:", error);
            setPendingCount(0);
        } finally {
            setIsLoading(false);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentUser?.id]);

    // Fetch pending count on mount and when session changes
    useEffect(() => {
        refreshPendingCount();
    }, [refreshPendingCount]);

    // Poll for updates every 2 minutes
    useEffect(() => {
        if (!currentUser) return;
        refreshPendingCount();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentUser?.id, refreshPendingCount]);

    return (
        <PendingOrdersContext.Provider value={{ pendingCount, refreshPendingCount, isLoading }}>
            {children}
        </PendingOrdersContext.Provider>
    );
}

export function usePendingOrders() {
    const context = useContext(PendingOrdersContext);
    if (context === undefined) {
        throw new Error("usePendingOrders must be used within a PendingOrdersProvider");
    }
    return context;
}
