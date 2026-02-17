import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: {
    template: "%s | Evo-TechBD - Dashboard",
    default: "Evo-TechBD - Dashboard",
  },
  description: "User Dashboard",
};

const DashboardLayout = ({ children }: { children: ReactNode }) => {
  return <>{children}</>;
};

export default DashboardLayout;
