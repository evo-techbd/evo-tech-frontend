"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { getCurrentUser } from "@/utils/cookies";
import axios from "@/utils/axios/axios";
import { Permission } from "@/schemas/admin/permissionSchema";

interface PermissionsContextType {
    permissions: string[]; // Array of permission codes
    permittedRoutes: string[]; // Array of permitted routes from session
    allPermissions: Permission[]; // Full permission objects with details
    hasPermission: (permissionCode: string) => boolean;
    hasAnyPermission: (permissionCodes: string[]) => boolean;
    hasAllPermissions: (permissionCodes: string[]) => boolean;
    hasRouteAccess: (route: string) => boolean;
    isLoading: boolean;
    refreshPermissions: () => Promise<void>;
}

const PermissionsContext = createContext<PermissionsContextType | undefined>(undefined);

export function PermissionsProvider({ children }: { children: React.ReactNode }) {
    const currentUser = getCurrentUser();
    const [permissions, setPermissions] = useState<string[]>([]);
    const [permittedRoutes, setPermittedRoutes] = useState<string[]>([]);
    const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const refreshPermissions = useCallback(async () => {
        if (!currentUser) {
            setPermissions([]);
            setPermittedRoutes([]);
            setAllPermissions([]);
            setIsLoading(false);
            return;
        }

        // Admins have all permissions
        if (currentUser?.role?.toUpperCase() === 'ADMIN') {
            try {
                const response = await axios.get("/permissions");
                
                if (response.data.success) {
                    const allPerms = response.data.data;
                    setAllPermissions(allPerms);
                    setPermissions(allPerms.map((p: Permission) => p.code));
                    // Admins have access to all routes
                    setPermittedRoutes(allPerms.map((p: Permission) => p.route).filter(Boolean));
                }
            } catch (error) {
                console.error("Error fetching all permissions:", error);
            }
            setIsLoading(false);
            return;
        }

        // For staff/employees, always fetch latest permissions from API
        if (currentUser?.role?.toUpperCase() === 'EMPLOYEE') {
            try {
                setIsLoading(true);
                const response = await axios.get("/permissions/my-permissions");

                if (response.data.success) {
                    const perms = response.data.data.permissionCodes || [];
                    const fullPerms = response.data.data.permissions || [];
                    const routes = response.data.data.permittedRoutes || [];

                    setPermissions(perms);
                    setAllPermissions(fullPerms);
                    setPermittedRoutes(routes);
                }
            } catch (error: any) {
                console.error("Error fetching staff permissions:", error);
                setPermissions([]);
                setAllPermissions([]);
                setPermittedRoutes([]);
            } finally {
                setIsLoading(false);
            }
            return;
        }

        setIsLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentUser?.id]);

    useEffect(() => {
        refreshPermissions();
    }, [refreshPermissions]);

    const hasPermission = useCallback((permissionCode: string): boolean => {
        // Admins always have all permissions
        if (currentUser?.role?.toUpperCase() === 'ADMIN') return true;
        return permissions.includes(permissionCode);
    }, [permissions, currentUser]);

    const hasAnyPermission = useCallback((permissionCodes: string[]): boolean => {
        // Admins always have all permissions
        if (currentUser?.role?.toUpperCase() === 'ADMIN') return true;
        return permissionCodes.some(code => permissions.includes(code));
    }, [permissions, currentUser]);

    const hasAllPermissions = useCallback((permissionCodes: string[]): boolean => {
        // Admins always have all permissions
        if (currentUser?.role?.toUpperCase() === 'ADMIN') return true;
        return permissionCodes.every(code => permissions.includes(code));
    }, [permissions, currentUser]);

    const hasRouteAccess = useCallback((route: string): boolean => {
        // Admins always have access
        if (currentUser?.role?.toUpperCase() === 'ADMIN') return true;
        
        // Check if the route or a parent route is in permitted routes
        return permittedRoutes.some(permittedRoute => {
            // Exact match
            if (route === permittedRoute) return true;
            // Check if route starts with permitted route (for subroutes)
            if (route.startsWith(permittedRoute + '/')) return true;
            return false;
        });
    }, [permittedRoutes, currentUser]);

    return (
        <PermissionsContext.Provider 
            value={{ 
                permissions, 
                permittedRoutes,
                allPermissions,
                hasPermission, 
                hasAnyPermission, 
                hasAllPermissions, 
                hasRouteAccess,
                isLoading,
                refreshPermissions 
            }}
        >
            {children}
        </PermissionsContext.Provider>
    );
}

export function usePermissions() {
    const context = useContext(PermissionsContext);
    if (context === undefined) {
        throw new Error("usePermissions must be used within a PermissionsProvider");
    }
    return context;
}
