import type { Metadata } from "next";
import type { ReactNode } from "react";
import { getServerAuth } from "@/lib/server-auth";
import { AppSidebar } from "@/components/scn/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { PermissionsProvider } from "@/contexts/PermissionsContext";
import { PendingOrdersProvider } from "@/contexts/PendingOrdersContext";

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: {
    template: "%s | Evo-TechBD - User",
    default: "Evo-TechBD - User",
  },
  description: "User account dashboard and settings",
};

const UserGroupLayout = async ({ children }: { children: ReactNode }) => {
  const session = await getServerAuth();

  return (
    <PermissionsProvider>
      <PendingOrdersProvider>
        <SidebarProvider>
          <AppSidebar userSession={session?.user} />
          <SidebarInset>
            <div className="min-h-screen w-full bg-gray-50">{children}</div>
          </SidebarInset>
        </SidebarProvider>
      </PendingOrdersProvider>
    </PermissionsProvider>
  );
};

export default UserGroupLayout;
