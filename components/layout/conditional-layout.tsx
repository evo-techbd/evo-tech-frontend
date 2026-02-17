"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/navbar/navbar";
import Footer from "@/components/footer/footer";

export function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Check if we're on admin routes
  const isAdminRoute = pathname.startsWith('/control') || pathname.startsWith('/admin');
  
  // Check if we're on employee routes
  const isEmployeeRoute = pathname.startsWith('/employee');
  
  // Check if we're on auth routes
  const isAuthRoute = pathname.startsWith('/login') || 
                     pathname.startsWith('/register') || 
                     pathname.startsWith('/forgot-password') || 
                     pathname.startsWith('/reset-password') ||
                     pathname.startsWith('/et-admin/auth');
  
  // Check if we're on any protected user routes (dashboard and nested pages)
  const isUserProtectedRoute = pathname.startsWith('/user');

  // For admin, employee, auth, and user dashboard routes, return children without the public navbar/footer
  if (isAdminRoute || isEmployeeRoute || isAuthRoute || isUserProtectedRoute) {
    return <>{children}</>;
  }

  // For regular user routes and homepage, use the user layout
  return (
    <div className="relative w-full h-fit flex flex-col items-center bg-[#EEEEEE]">
      {/* Navbar should be full-width so its background and card can span the page correctly */}
      <Navbar />

      {/* Center the page content below the full-width navbar */}
      <div className="relative w-full min-h-screen h-fit flex flex-col items-center">
        <div className="w-full max-w-[1440px] mx-auto">{children}</div>
      </div>
      <Footer />
    </div>
  );
}