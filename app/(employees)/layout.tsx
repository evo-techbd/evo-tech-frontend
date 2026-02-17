import type { Metadata } from "next";
import { AppSidebar } from "@/components/scn/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { PendingOrdersProvider } from "@/contexts/PendingOrdersContext";
import { PermissionsProvider } from "@/contexts/PermissionsContext";
import { StaffTopBar } from "@/components/staff/staff-top-bar";
import { getServerAuth } from "@/lib/server-auth";

export const metadata: Metadata = {
  title: {
    template: "%s | Evo-TechBD - Staff",
    default: "Evo-TechBD - Staff Dashboard",
  },
  description: "Evo-TechBD Staff Dashboard",
};

export default async function EmployeeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerAuth();

  return (
    <PendingOrdersProvider>
      <PermissionsProvider>
        <SidebarProvider>
          <AppSidebar
            variant="inset"
            userSession={session?.user}
            isStaffMode={true}
          />
          <SidebarInset>
            <StaffTopBar />
            <div className="min-h-[calc(100vh-64px)] w-full bg-gray-50">
              {children}
            </div>
          </SidebarInset>
        </SidebarProvider>
      </PermissionsProvider>
    </PendingOrdersProvider>
  );
}
