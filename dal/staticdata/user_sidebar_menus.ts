import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  User,
  Settings,
  HelpCircle,
} from "lucide-react";

// Sidebar menus for user dashboard
const userSidebarMenus = [
  {
    title: "Dashboard",
    url: "/user/dashboard",
    icon: LayoutDashboard,
    collapsibleItems: [],
    permissions: [], // No permissions required for users
  },
  {
    title: "Orders",
    icon: ShoppingBag,
    collapsibleItems: [
      {
        title: "Order History",
        url: "/user/dashboard/order-history",
        permissions: [],
      },
      {
        title: "Track Orders",
        url: "/user/dashboard/order-history",
        permissions: [],
      },
    ],
    permissions: [],
  },
  {
    title: "Shopping",
    icon: Package,
    collapsibleItems: [
      {
        title: "Browse Products",
        url: "/products-and-accessories",
        permissions: [],
      },
      {
        title: "Cart",
        url: "/cart",
        permissions: [],
      },
    ],
    permissions: [],
  },
  {
    title: "Profile",
    url: "/user/dashboard/profile",
    icon: User,
    collapsibleItems: [],
    permissions: [],
  },
];

// Secondary sidebar menus for user dashboard (bottom section)
const userSecondarySidebarMenus = [
  {
    title: "Settings",
    url: "/user/dashboard/profile",
    icon: Settings,
    collapsibleItems: [],
    permissions: [],
  },
  {
    title: "Help & Support",
    url: "/support",
    icon: HelpCircle,
    collapsibleItems: [],
    permissions: [],
  },
];

export { userSidebarMenus, userSecondarySidebarMenus };
