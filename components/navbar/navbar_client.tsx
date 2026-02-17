"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Avatar } from "@nextui-org/avatar";
import useDebounce from "@rooks/use-debounce";
import { logoutUser } from "@/lib/auth";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";

import EvoTechBDLogoGray from "@/public/assets/EvoTechBD-logo-gray.png";
import { BiPackage } from "react-icons/bi";
import { IoMenu } from "react-icons/io5";
import { FiSearch } from "react-icons/fi";
import { TbDashboard, TbUser, TbLogout, TbHistory } from "react-icons/tb";

import ManageCart from "@/components/navbar/manage_cart";
import MobileSidebar from "@/components/navbar/mobile_sidebar";
import CategoriesDrawer from "@/components/navbar/categories-drawer";
import { getNameInitials } from "@/utils/essential_functions";
import type { NavbarMenuType1 } from "./navbar";
import { toast } from "sonner";
import { useCurrentUser } from "@/hooks/use-current-user";
import axios from "@/utils/axios/axios";
import { useRef } from "react";

const NavbarClient = ({
  services,
  support,
}: {
  services: NavbarMenuType1[];
  support: NavbarMenuType1[];
}) => {
  const pathname = usePathname();
  const router = useRouter();
  const [menuIsOpen, setMenuIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState<boolean | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isCategoriesDrawerOpen, setIsCategoriesDrawerOpen] = useState(false);

  const currentUser = useCurrentUser();

  const detectScrollPositionDebounced = useDebounce(() => {
    window?.scrollY < 32 ? setIsScrolled(false) : setIsScrolled(true);
  }, 5);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef<HTMLDivElement | null>(null);

  // Close suggestions on outside click
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!searchRef.current) return;
      if (!searchRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  useEffect(() => {
    detectScrollPositionDebounced();
    window.addEventListener(
      "scroll",
      detectScrollPositionDebounced as EventListener,
    );
    return () =>
      window.removeEventListener(
        "scroll",
        detectScrollPositionDebounced as EventListener,
      );
  }, [detectScrollPositionDebounced]);

  const handleSignOutDebounced = useDebounce(async () => {
    try {
      // Call the logout function
      await logoutUser();

      // Dispatch custom event for auth change
      window.dispatchEvent(new Event("authChange"));

      // Show success message
      toast.success("You signed out of your account.");

      // Redirect to home page
      router.push("/");
      router.refresh();
    } catch (err) {
      console.error("Logout error:", err);
      toast.error("Something went wrong while signing out.");

      // Cleanup and force redirect
      if (typeof window !== "undefined") {
        sessionStorage.clear();
        localStorage.clear();
      }

      // Force hard redirect to clear everything
      window.location.href = "/";
    }
  }, 200);

  // Debounced search API call
  const performSearch = useDebounce(async (value: string) => {
    const q = value.trim();
    if (q.length < 2) {
      setSuggestions([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    try {
      const res = await axios.get(
        `/products?search=${encodeURIComponent(q)}&limit=6`,
      );
      if (res?.data?.data) {
        setSuggestions(res.data.data);
        setShowSuggestions(true);
      } else {
        setSuggestions([]);
      }
    } catch (err) {
      // Silent fail for search
      setSuggestions([]);
    } finally {
      setIsSearching(false);
    }
  }, 250);

  // const isCurrentURL = (word: string) => {
  //   const pathSegments = pathname.split("/").filter(Boolean);
  //   return pathSegments[0] === word;
  // };

  const getDashboardUrl = (userRole: string) => {
    switch (userRole?.toLowerCase()) {
      case "admin":
        return "/control/dashboard";
      case "employee":
        return "/employee/dashboard";
      case "user":
      default:
        return "/user/dashboard";
    }
  };

  const getProfileUrl = (userRole: string) => {
    switch (userRole?.toLowerCase()) {
      case "admin":
        return "/control/profile";
      case "employee":
        return "/employee/profile";
      case "user":
      default:
        return "/user/dashboard/profile";
    }
  };

  const getOrderHistoryUrl = (userRole: string) => {
    switch (userRole?.toLowerCase()) {
      case "admin":
        return "/control/orders";
      case "employee":
        return "/employee/orders";
      case "user":
      default:
        return "/user/dashboard/order-history";
    }
  };

  return (
    <>
      <MobileSidebar
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
      />

      <CategoriesDrawer
        isOpen={isCategoriesDrawerOpen}
        onClose={() => setIsCategoriesDrawerOpen(false)}
      />

      {/* <div className="w-full bg-white text-stone-700 text-[13px]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 flex items-center justify-between h-8">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center px-3 py-0.5 rounded-full bg-red-500 text-white text-[12px] font-[700]">
              HOT
            </span>
            <span className="text-stone-700">10% off on online payments</span>
          </div>
          <div className="hidden sm:flex items-center gap-3">
            <button className="flex items-center gap-2 px-3 py-1 rounded-full bg-white shadow-sm border border-stone-100">
              <span className="w-6 h-6 rounded-full bg-[#EEF2FF] flex items-center justify-center">
                ?
              </span>
              <span className="text-stone-800 font-[600]">Need Help?</span>
            </button>
            <div className="flex items-center gap-2">
              <div className="px-3 py-1 rounded-full border border-brand-600 text-brand-600 font-[600]">
                01518949050
              </div>
              <button className="px-3 py-1 rounded-full bg-brand-600 text-white">
                Call Us
              </button>
            </div>
          </div>
        </div>
      </div> */}

      <div className="sticky top-0 z-50 bg-white shadow-sm border-b border-stone-100 w-full mx-auto">
        <div className="max-w-[1400px] mx-auto flex justify-center">
          <div className="w-full">
            <div className="flex items-center justify-between px-2 sm:px-6 h-[64px]">
              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileSidebarOpen(true)}
                className="md:hidden w-8 h-8 flex items-center justify-center rounded-lg hover:bg-stone-100 flex-shrink-0"
                aria-label="Open menu"
              >
                <IoMenu className="w-6 h-6 text-stone-700" />
              </button>

              <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
                <Link href="/" className="flex items-center">
                  <Image
                    src={EvoTechBDLogoGray}
                    alt="Evo-TechBD"
                    width={140}
                    height={44}
                    priority
                    className="object-contain w-[70px] md:w-[140px]"
                  />
                </Link>

                {/* Desktop Main Navigation - 4 Nav Links beside Logo */}
                <div className="hidden md:flex items-center gap-1 lg:gap-2">
                  <button
                    onClick={() => setIsCategoriesDrawerOpen(true)}
                    className="px-2 lg:px-3 py-2 text-stone-700 font-[500] text-[13px] lg:text-sm whitespace-nowrap hover:text-brand-600 transition-colors"
                  >
                    All Categories
                  </button>
                  <Link
                    href="/3d-printing"
                    className="px-2 lg:px-3 py-2 text-stone-700 font-[500] text-[13px] lg:text-sm whitespace-nowrap hover:text-brand-600 transition-colors"
                  >
                    3D Print
                  </Link>
                  <Link
                    href="/services"
                    className="px-2 lg:px-3 py-2 text-stone-700 font-[500] text-[13px] lg:text-sm whitespace-nowrap hover:text-brand-600 transition-colors"
                  >
                    Services
                  </Link>
                  <Link
                    href="/contact-us"
                    className="px-2 lg:px-3 py-2 text-stone-700 font-[500] text-[13px] lg:text-sm whitespace-nowrap hover:text-brand-600 transition-colors"
                  >
                    Contact Us
                  </Link>
                </div>
              </div>

              <div className="flex-1 px-1 sm:px-6">
                <div className="w-full max-w-[500px] mx-auto">
                  <div className="relative" ref={searchRef}>
                    <input
                      type="search"
                      placeholder="Search..."
                      className="w-full h-10 sm:h-12 rounded-full border border-stone-200 px-3 pr-10 sm:px-6 sm:pr-14 text-sm focus:ring-2 focus:ring-[#0866FF] outline-none"
                      value={searchQuery}
                      onChange={(e) => {
                        const v = e.target.value;
                        setSearchQuery(v);
                        performSearch(v);
                      }}
                      onFocus={() => {
                        if (suggestions.length) setShowSuggestions(true);
                      }}
                    />
                    <button
                      title="search"
                      aria-label="submit search"
                      className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 bg-white w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shadow-sm border border-stone-100"
                    >
                      <FiSearch className="w-4 h-4 sm:w-5 sm:h-5 text-stone-600" />
                    </button>

                    {/* Suggestions dropdown */}
                    {showSuggestions && (
                      <div className="absolute left-0 right-0 mt-2 z-50 bg-white border border-stone-100 rounded-md shadow-md overflow-hidden max-h-[400px] overflow-y-auto">
                        {isSearching ? (
                          <div className="p-3 text-sm text-stone-500">
                            Searching...
                          </div>
                        ) : suggestions.length === 0 ? (
                          <div className="p-3 text-sm text-stone-500">
                            No results
                          </div>
                        ) : (
                          suggestions.map((p) => (
                            <button
                              key={p._id}
                              onClick={() => {
                                setShowSuggestions(false);
                                setSearchQuery("");
                                router.push(`/items/${p.slug}`);
                              }}
                              className="w-full flex items-center gap-2 sm:gap-3 p-2 sm:p-3 hover:bg-stone-50 text-left"
                            >
                              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-100 rounded-md overflow-hidden flex items-center justify-center flex-shrink-0">
                                {p.mainImage ? (
                                  // Next/Image requires layout; using img for simplicity
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img
                                    src={p.mainImage}
                                    alt={p.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <span className="text-sm text-stone-500">
                                    No image
                                  </span>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-xs sm:text-sm text-stone-800 truncate">
                                  {p.name}
                                </div>
                                <div className="text-xs text-stone-500 truncate">
                                  {p.brand?.name || ""} •{" "}
                                  {p.price ? `${p.price} BDT` : ""}
                                </div>
                              </div>
                            </button>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 sm:gap-2 md:gap-4 flex-shrink-0 justify-end">
                <Link
                  href="/track-order"
                  className="hidden sm:flex items-center gap-3"
                >
                  <div className="w-12 h-12 rounded-lg bg-[#F5F7FB] flex items-center justify-center">
                    <BiPackage className="w-5 h-5 text-stone-700" />
                  </div>
                </Link>

                {currentUser ? (
                  <DropdownMenu.Root>
                    <DropdownMenu.Trigger asChild>
                      <button
                        aria-label="user menu"
                        className="flex items-center rounded-lg"
                      >
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-[#F5F7FB] flex items-center justify-center">
                          <Avatar
                            name={getNameInitials(
                              `${currentUser.firstName} ${currentUser.lastName}`,
                            )}
                            radius="full"
                            classNames={{ base: "w-6 h-6" }}
                          />
                        </div>
                      </button>
                    </DropdownMenu.Trigger>

                    <DropdownMenu.Content
                      align="end"
                      sideOffset={6}
                      className="min-w-[160px] bg-white rounded-md shadow-lg border border-stone-200 py-1 z-[60]"
                    >
                      <DropdownMenu.Item asChild>
                        <Link
                          href={getProfileUrl(currentUser.role || "user")}
                          className="flex items-center gap-3 px-3 py-2 text-sm text-stone-700 hover:bg-stone-100"
                        >
                          <TbUser className="w-4 h-4" />
                          <span>My Profile</span>
                        </Link>
                      </DropdownMenu.Item>
                      <DropdownMenu.Item asChild>
                        <Link
                          href={getDashboardUrl(currentUser.role || "user")}
                          className="flex items-center gap-3 px-3 py-2 text-sm text-stone-700 hover:bg-stone-100"
                        >
                          <TbDashboard className="w-4 h-4" />
                          <span>Dashboard</span>
                        </Link>
                      </DropdownMenu.Item>
                      <DropdownMenu.Item asChild>
                        <Link
                          href={getOrderHistoryUrl(currentUser.role || "user")}
                          className="flex items-center gap-3 px-3 py-2 text-sm text-stone-700 hover:bg-stone-100"
                        >
                          <TbHistory className="w-4 h-4" />
                          <span>Order History</span>
                        </Link>
                      </DropdownMenu.Item>
                      <DropdownMenu.Separator className="h-px bg-stone-200 my-1" />
                      <DropdownMenu.Item asChild>
                        <Link
                          href="/track-order"
                          className="md:hidden  flex items-center gap-3 px-3 py-2 text-sm text-stone-700 hover:bg-stone-100"
                        >
                          <BiPackage className="w-4 h-4" />
                          <span>Track Order</span>
                        </Link>
                      </DropdownMenu.Item>
                      <DropdownMenu.Separator className="h-px md:hidden bg-stone-200 my-1" />
                      <DropdownMenu.Item asChild>
                        <button
                          onClick={() => handleSignOutDebounced()}
                          className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                        >
                          <TbLogout className="w-4 h-4" />
                          <span>Sign Out</span>
                        </button>
                      </DropdownMenu.Item>
                    </DropdownMenu.Content>
                  </DropdownMenu.Root>
                ) : (
                  <>
                    {/* Desktop Sign In/Sign Up */}
                    <div className="hidden sm:flex items-center gap-4">
                      <Link
                        href="/login"
                        className="text-sm font-medium  hover:text-stone-900 transition-colors bg-brand-400 px-4 py-2 rounded-lg hover:bg-brand-500 text-white"
                      >
                        Sign in
                      </Link>
                    </div>

                    {/* Mobile Sign In Button */}
                    <div className="sm:hidden">
                      <Link href="/login" className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-lg bg-[#F5F7FB] flex items-center justify-center">
                          <TbUser className="w-5 h-5 text-stone-700" />
                        </div>
                      </Link>
                    </div>
                  </>
                )}

                <div className="flex items-center">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-[#F5F7FB] flex items-center justify-center">
                    <ManageCart />
                  </div>
                </div>
              </div>
            </div>
            {/* Old commented navigation bar removed */}
          </div>
        </div>
      </div>

      <div aria-hidden className="h-1 "></div>
    </>
  );
};

export default NavbarClient;
