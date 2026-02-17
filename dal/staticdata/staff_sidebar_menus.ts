import { BarChartIcon, UsersIcon, ChartArea, HelpCircleIcon, Settings2, Contact } from "lucide-react";
import { RiBox1Line, RiDashboardHorizontalLine } from "react-icons/ri";


// sidebar menus for staff/employee dashboard
// Staff members use the same /control routes as admins
// Menu items are filtered by permissions stored in the database
const staffSidebarMenus = [
    {
        title: "Dashboard",
        url: "/control/dashboard",
        icon: RiDashboardHorizontalLine,
        collapsibleItems: [],
        permissions: ["VIEW_DASHBOARD"], // Required permissions
    },
    {
        title: "Products",
        icon: RiBox1Line,
        collapsibleItems: [
            {
                title: "All Products",
                url: "/control/products",
                permissions: ["MANAGE_PRODUCTS"],
            },
            {
                title: "All Categories",
                url: "/control/categories",
                permissions: ["MANAGE_CATEGORIES"],
            },
            {
                title: "All Sub-Categories",
                url: "/control/subcategories",
                permissions: ["MANAGE_CATEGORIES"],
            },
            {
                title: "All Brands",
                url: "/control/brands",
                permissions: ["MANAGE_BRANDS"],
            },
        ],
        permissions: ["MANAGE_PRODUCTS", "MANAGE_CATEGORIES", "MANAGE_BRANDS"], // Any of these
    },
    {
        title: "Sales",
        icon: BarChartIcon,
        collapsibleItems: [
            {
                title: "All Orders",
                url: "/control/orders",
                permissions: ["MANAGE_ORDERS"],
            },
        ],
        permissions: ["MANAGE_ORDERS"],
    },
    {
        title: "Customers",
        icon: UsersIcon,
        collapsibleItems: [
            {
                title: "All Customers",
                url: "/control/all-customers",
                permissions: ["MANAGE_CUSTOMERS"],
            },
        ],
        permissions: ["MANAGE_CUSTOMERS"],
    },
    {
        title: "Reports",
        icon: ChartArea,
        collapsibleItems: [
            {
                title: "Earnings Report",
                url: "/control/reports/earnings",
                permissions: ["VIEW_EARNINGS_REPORT"],
            },
            {
                title: "Sales Report",
                url: "/control/reports/sales",
                permissions: ["VIEW_SALES_REPORT"],
            },
        ],
        permissions: ["VIEW_EARNINGS_REPORT", "VIEW_SALES_REPORT"],
    },
    {
        title: "Staff Management",
        icon: Contact,
        collapsibleItems: [
            {
                title: "All Staff",
                url: "/control/staff",
                permissions: ["MANAGE_STAFF"],
            },
            {
                title: "Permissions",
                url: "/control/permissions",
                permissions: ["MANAGE_PERMISSIONS"],
            },
        ],
        permissions: ["MANAGE_STAFF", "MANAGE_PERMISSIONS"],
    },
    {
        title: "Settings",
        icon: Settings2,
        collapsibleItems: [
            {
                title: "Site Settings",
                url: "/control/settings",
                permissions: ["MANAGE_SITE_SETTINGS"],
            },
            {
                title: "Homepage",
                url: "/control/settings/homepage",
                permissions: ["MANAGE_HOMEPAGE"],
            },
            {
                title: "Features",
                url: "/control/settings/features",
                permissions: ["MANAGE_FEATURES"],
            },
            {
                title: "Shipping",
                url: "/control/settings/shipping",
                permissions: ["MANAGE_SHIPPING"],
            },
            {
                title: "Tax",
                url: "/control/settings/tax",
                permissions: ["MANAGE_TAX"],
            },
            {
                title: "Currency",
                url: "/control/settings/currency",
                permissions: ["MANAGE_CURRENCY"],
            },
            {
                title: "Integrations",
                url: "/control/settings/integrations",
                permissions: ["MANAGE_INTEGRATIONS"],
            },
        ],
        permissions: ["MANAGE_SITE_SETTINGS", "MANAGE_HOMEPAGE", "MANAGE_FEATURES", "MANAGE_SHIPPING", "MANAGE_TAX", "MANAGE_CURRENCY", "MANAGE_INTEGRATIONS"],
    },
    {
        title: "Reviews",
        icon: ChartArea,
        collapsibleItems: [
            {
                title: "All Reviews",
                url: "/control/reviews",
                permissions: ["MODERATE_REVIEWS"],
            },
        ],
        permissions: ["MODERATE_REVIEWS"],
    },
    {
        title: "Inventory",
        icon: RiBox1Line,
        collapsibleItems: [
            {
                title: "Stock Management",
                url: "/control/inventory",
                permissions: ["MANAGE_INVENTORY"],
            },
        ],
        permissions: ["MANAGE_INVENTORY"],
    },
]

const staffSecondarySidebarMenus = [
    {
        title: "Setup & Configurations",
        icon: Settings2,
        collapsibleItems: [
            {
                title: "Home Page Config",
                url: "/control/setup-config/homepage-config",
                permissions: ["MANAGE_SITE_SETTINGS"],
            },
            {
                title: "Terms & Conditions",
                url: "/control/terms",
                permissions: ["MANAGE_SITE_SETTINGS"],
            },
            {
                title: "Privacy Policy",
                url: "/control/privacy",
                permissions: ["MANAGE_SITE_SETTINGS"],
            },
            {
                title: "Warranty",
                url: "/control/warranty",
                permissions: ["MANAGE_SITE_SETTINGS"],
            },
        ],
        permissions: ["VIEW_SETTINGS", "MANAGE_SITE_SETTINGS"],
    },
    {
        title: "Help",
        url: "#",
        icon: HelpCircleIcon,
        collapsibleItems: [],
        permissions: [], // Everyone can see Help
    },
]

export { staffSidebarMenus, staffSecondarySidebarMenus };
