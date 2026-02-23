"use client";

import React from "react";
import { usePermissions } from "@/contexts/PermissionsContext";
import { Loader2 } from "lucide-react";

interface ProtectedComponentProps {
    children: React.ReactNode;
    permissions?: string | string[]; // Single permission code or array of codes
    requireAll?: boolean; // If true, requires all permissions; if false, requires any
    fallback?: React.ReactNode;
    showLoading?: boolean;
}

export function ProtectedComponent({
    children,
    permissions,
    requireAll = false,
    fallback = null,
    showLoading = true,
}: ProtectedComponentProps) {
    const { hasPermission, hasAnyPermission, hasAllPermissions, isLoading } = usePermissions();

    if (isLoading && showLoading) {
        return (
            <div className="flex items-center justify-center p-4">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            </div>
        );
    }

    // If no permissions specified, show children
    if (!permissions) {
        return <>{children}</>;
    }

    // Convert single permission to array
    const permissionArray = Array.isArray(permissions) ? permissions : [permissions];

    // Check permissions
    let hasAccess = false;
    if (permissionArray.length === 1) {
        hasAccess = hasPermission(permissionArray[0]);
    } else if (requireAll) {
        hasAccess = hasAllPermissions(permissionArray);
    } else {
        hasAccess = hasAnyPermission(permissionArray);
    }

    if (!hasAccess) {
        return <>{fallback}</>;
    }

    return <>{children}</>;
}
