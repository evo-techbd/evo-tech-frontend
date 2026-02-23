"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface DashboardAutoRefreshProps {
  children: React.ReactNode;
  delay?: number;
}

export function DashboardAutoRefresh({ children, delay = 30000 }: DashboardAutoRefreshProps) {
  const [hasRefreshed, setHasRefreshed] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if we've already refreshed in this session
    const sessionKey = `dashboard_refreshed_${Date.now()}`;
    const hasRefreshedBefore = sessionStorage.getItem('dashboard_auto_refreshed');

    if (!hasRefreshedBefore && !hasRefreshed) {
      // Set a timer to refresh the page after the delay
      const timer = setTimeout(() => {
        // Mark as refreshed in session storage
        sessionStorage.setItem('dashboard_auto_refreshed', 'true');
        setHasRefreshed(true);
        
        // Refresh the router to reload data
        router.refresh();
      }, delay);

      return () => clearTimeout(timer);
    }
  }, [delay, router, hasRefreshed]);

  // Clear the refresh flag when component unmounts
  useEffect(() => {
    return () => {
      // Clear on unmount so next visit triggers refresh again
      sessionStorage.removeItem('dashboard_auto_refreshed');
    };
  }, []);

  return <>{children}</>;
}
