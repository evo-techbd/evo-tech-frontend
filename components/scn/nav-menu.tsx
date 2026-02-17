"use client";

import { ElementType } from "react";
import { ChevronRight, CircleSmall, type LucideIcon } from "lucide-react";
import { IconProps } from "@/utils/types_interfaces/shared_types";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import Link from "next/link";
import { usePendingOrders } from "@/contexts/PendingOrdersContext";
import { usePermissions } from "@/contexts/PermissionsContext";
import { useCurrentUser } from "@/hooks/use-current-user";

export function NavMenu({
  collapsibleItems,
  title,
  url,
  Icon,
  permissions = [],
}: {
  title: string;
  url?: string;
  Icon?: LucideIcon | ElementType<IconProps>;
  collapsibleItems: {
    title: string;
    url: string;
    permissions?: string[];
  }[];
  permissions?: string[];
}) {
  const { pendingCount } = usePendingOrders();
  const {
    hasAnyPermission,
    permissions: userPermissions,
    isLoading,
  } = usePermissions();
  const currentUser = useCurrentUser();

  // Admins see everything, employees/staff see only what they have permissions for
  const isAdmin = currentUser?.role?.toUpperCase() === "ADMIN";
  const isEmployee = currentUser?.role?.toUpperCase() === "EMPLOYEE";

  // Check if this menu should be visible based on permissions
  // Empty permissions array means visible to all
  // Admins bypass permission checks
  // Employees must have permissions
  const isVisible =
    isAdmin || permissions.length === 0 || hasAnyPermission(permissions);

  // Filter collapsible items based on permissions
  const visibleItems = collapsibleItems.filter((item) => {
    if (isAdmin) return true; // Admins see all items
    if (!item.permissions || item.permissions.length === 0) return true;
    return hasAnyPermission(item.permissions);
  });

  // If menu has no visible items and is collapsible, hide it
  if (
    !isVisible ||
    (collapsibleItems.length > 0 && visibleItems.length === 0)
  ) {
    return null;
  }

  // Check if this is the "Sales" menu (which contains "All Orders")
  const showBadge = title === "Sales" && pendingCount > 0;

  return (
    <>
      {visibleItems.length > 0 ? (
        <Collapsible
          key={title}
          title={title}
          className="group/collapsible transition-all duration-200 ease-linear w-full"
        >
          <SidebarGroup className="py-0.5 px-0">
            <SidebarGroupLabel asChild className="group/label">
              <CollapsibleTrigger className="hover:bg-[#4a4a57]/50 transition-all duration-100 ease-linear text-stone-300 text-shadow-sm shadow-cyan-500 text-[0.875rem] leading-5 font-medium">
                <div className="flex items-center gap-2">
                  {Icon && <Icon className="w-5 h-5" />}
                  <span>{title}</span>
                  {showBadge && (
                    <span className="ml-auto mr-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[0.625rem] font-bold text-white animate-pulse">
                      {pendingCount > 99 ? "99+" : pendingCount}
                    </span>
                  )}
                </div>
                <ChevronRight className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90" />
              </CollapsibleTrigger>
            </SidebarGroupLabel>
            <CollapsibleContent className="pl-1 border-l-2 border-evoAdminAccent/70">
              <SidebarGroupContent className="flex flex-col gap-2 py-2">
                <SidebarMenu>
                  {visibleItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        tooltip={item.title}
                        className="hover:bg-[#4a4a57]/50 transition-all duration-100 ease-linear text-[0.75rem] text-stone-300 hover:text-stone-400"
                      >
                        <Link
                          href={item.url || "/"}
                          className="flex items-center gap-2"
                        >
                          <CircleSmall className="!size-2" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>
      ) : (
        <SidebarMenu className="py-0.5">
          <SidebarMenuItem key={title}>
            <SidebarMenuButton
              asChild
              tooltip={title}
              className="hover:bg-[#4a4a57]/50 transition-all duration-100 ease-linear text-stone-300 hover:text-stone-300"
            >
              <Link
                href={url || "/"}
                className="flex items-center gap-2 text-shadow-sm shadow-cyan-400"
              >
                {Icon && <Icon className="!size-5" />}
                <span className="text-[0.75rem] leading-5 font-medium">
                  {title}
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      )}
    </>
  );
}
