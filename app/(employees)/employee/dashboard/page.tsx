"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePermissions } from '@/contexts/PermissionsContext';
import { Package, ShoppingCart, Users, BarChart, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export default function EmployeeDashboard() {
    const router = useRouter();
    const { hasPermission, isLoading } = usePermissions();
    const [hasAutoRefreshed, setHasAutoRefreshed] = useState(false);

    // Auto-refresh on first load
    useEffect(() => {
        const hasRefreshedBefore = sessionStorage.getItem('employee_dashboard_refreshed');
        
        if (!hasRefreshedBefore && !hasAutoRefreshed && !isLoading) {
            const timer = setTimeout(() => {
                sessionStorage.setItem('employee_dashboard_refreshed', 'true');
                setHasAutoRefreshed(true);
                router.refresh();
            }, 2000);

            return () => clearTimeout(timer);
        }

        // Clear the refresh flag when leaving the page
        return () => {
            sessionStorage.removeItem('employee_dashboard_refreshed');
        };
    }, [isLoading, hasAutoRefreshed, router]);

    useEffect(() => {
        // Auto-redirect to the first available route based on permissions
        if (!isLoading) {
            if (hasPermission('VIEW_DASHBOARD')) {
                router.replace('/control/dashboard');
            } else if (hasPermission('VIEW_ORDERS')) {
                router.replace('/control/orders');
            } else if (hasPermission('VIEW_PRODUCTS')) {
                router.replace('/control/products');
            } else if (hasPermission('VIEW_CUSTOMERS')) {
                router.replace('/control/all-customers');
            }
            // If no permissions, stay on this page showing the message
        }
    }, [isLoading, hasPermission, router]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
                    <p className="text-gray-500">Loading your workspace...</p>
                </div>
            </div>
        );
    }

    // Quick access cards (shown while redirecting or if no permissions)
    const quickActions = [
        {
            title: 'Orders',
            description: 'Manage customer orders',
            icon: ShoppingCart,
            href: '/control/orders',
            permission: 'VIEW_ORDERS',
            color: 'bg-green-100 text-green-600',
        },
        {
            title: 'Products',
            description: 'Manage inventory',
            icon: Package,
            href: '/control/products',
            permission: 'VIEW_PRODUCTS',
            color: 'bg-blue-100 text-blue-600',
        },
        {
            title: 'Customers',
            description: 'Customer management',
            icon: Users,
            href: '/control/all-customers',
            permission: 'VIEW_CUSTOMERS',
            color: 'bg-purple-100 text-purple-600',
        },
        {
            title: 'Reports',
            description: 'View analytics',
            icon: BarChart,
            href: '/control/reports/earnings',
            permission: 'VIEW_REPORTS',
            color: 'bg-orange-100 text-orange-600',
        },
    ];

    const accessibleActions = quickActions.filter(action => hasPermission(action.permission));

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                        Staff Portal
                    </h1>
                    <p className="text-gray-600">
                        Quick access to your workspace
                    </p>
                </div>

                {accessibleActions.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {accessibleActions.map((action) => {
                            const Icon = action.icon;
                            return (
                                <Link key={action.title} href={action.href}>
                                    <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                                        <CardHeader>
                                            <div className="flex items-center gap-4">
                                                <div className={`w-12 h-12 rounded-lg ${action.color} flex items-center justify-center`}>
                                                    <Icon className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <CardTitle className="text-lg">{action.title}</CardTitle>
                                                    <CardDescription className="text-sm">
                                                        {action.description}
                                                    </CardDescription>
                                                </div>
                                            </div>
                                        </CardHeader>
                                    </Card>
                                </Link>
                            );
                        })}
                    </div>
                ) : (
                    <Card>
                        <CardContent className="py-12">
                            <div className="text-center">
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Package className="w-8 h-8 text-gray-400" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                    No Access Permissions
                                </h3>
                                <p className="text-gray-600">
                                    Please contact your administrator to assign permissions to your account.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}