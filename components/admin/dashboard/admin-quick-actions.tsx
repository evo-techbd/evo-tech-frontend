"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { 
    Plus, 
    Package, 
    ShoppingCart, 
    Users, 
    BarChart3, 
    Settings,
    FileText,
    Tags
} from "lucide-react";

export function AdminQuickActions() {
    const quickActions = [
        {
            title: "Add Product",
            description: "Add a new product to your inventory",
            icon: Package,
            href: "/control/products/create",
            color: "bg-blue-500 hover:bg-blue-600"
        },
        {
            title: "View Orders",
            description: "Check recent orders and manage them",
            icon: ShoppingCart,
            href: "/control/orders",
            color: "bg-green-500 hover:bg-green-600"
        },
        {
            title: "Manage Customers",
            description: "View and manage customer accounts",
            icon: Users,
            href: "/control/all-customers",
            color: "bg-purple-500 hover:bg-purple-600"
        },
        {
            title: "Manage Categories",
            description: "View and manage product categories",
            icon: Tags,
            href: "/control/categories",
            color: "bg-orange-500 hover:bg-orange-600"
        },
        {
            title: "Sales Report",
            description: "View detailed sales analytics",
            icon: BarChart3,
            href: "/control/reports",
            color: "bg-pink-500 hover:bg-pink-600"
        },
        {
            title: "Settings",
            description: "Configure store settings",
            icon: Settings,
            href: "/control/setup-config",
            color: "bg-gray-500 hover:bg-gray-600"
        }
    ];

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {quickActions.map((action, index) => (
                        <Link key={index} href={action.href}>
                            <div className="group p-4 border rounded-lg hover:shadow-md transition-all duration-200 hover:border-gray-300 cursor-pointer">
                                <div className="flex items-start space-x-3">
                                    <div className={`p-2 rounded-lg ${action.color} text-white`}>
                                        <action.icon className="w-4 h-4" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-medium text-sm text-gray-900 group-hover:text-blue-600">
                                            {action.title}
                                        </h3>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {action.description}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}