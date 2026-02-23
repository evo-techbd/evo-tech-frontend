"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import axios from "@/utils/axios/axios";
import axiosErrorLogger from "@/components/error/axios_error";
import { IoClose, IoChevronDown, IoChevronForward } from "react-icons/io5";
import { Divider } from "@nextui-org/react";

interface Subcategory {
  _id: string;
  name: string;
  slug: string;
  isActive: boolean;
}

interface Category {
  _id: string;
  name: string;
  slug: string;
  isActive: boolean;
  sortOrder?: number;
}

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const MobileSidebar = ({ isOpen, onClose }: MobileSidebarProps) => {
  const pathname = usePathname();
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<
    Record<string, Subcategory[]>
  >({});
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get("/categories?limit=100&isActive=true");
        const data = response?.data?.data || [];
        const sortedCategories = data.sort(
          (a: Category, b: Category) => (a.sortOrder || 0) - (b.sortOrder || 0),
        );
        setCategories(sortedCategories);
      } catch (error) {
        axiosErrorLogger({ error });
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      fetchCategories();
    }
  }, [isOpen]);

  const fetchSubcategories = async (categoryId: string) => {
    if (subcategories[categoryId]) return;

    try {
      const response = await axios.get(
        `/subcategories?category=${categoryId}&isActive=true`,
      );
      const data = response?.data?.data || [];
      setSubcategories((prev) => ({
        ...prev,
        [categoryId]: data,
      }));
    } catch (error) {
      axiosErrorLogger({ error });
      setSubcategories((prev) => ({
        ...prev,
        [categoryId]: [],
      }));
    }
  };

  const handleCategoryClick = (categoryId: string) => {
    if (expandedCategory === categoryId) {
      setExpandedCategory(null);
    } else {
      setExpandedCategory(categoryId);
      fetchSubcategories(categoryId);
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-[100] md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-[85%] max-w-[320px] bg-white z-[101] transform transition-transform duration-300 ease-in-out md:hidden ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-stone-200">
            <h2 className="text-lg font-semibold text-stone-800">Menu</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-stone-100"
              aria-label="Close menu"
            >
              <IoClose className="w-6 h-6 text-stone-600" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {/* Categories */}
            <div className="p-4">
              <h3 className="text-xs font-semibold text-stone-500 uppercase mb-3">
                Categories
              </h3>
              {loading ? (
                <p className="text-sm text-stone-500">Loading...</p>
              ) : (
                <div className="flex flex-col gap-1">
                  {categories.map((category) => {
                    const categorySubcategories =
                      subcategories[category._id] || [];
                    const hasSubcategories = categorySubcategories.length > 0;
                    const isExpanded = expandedCategory === category._id;

                    return (
                      <div key={category._id}>
                        <div className="flex items-center">
                          <button
                            onClick={() => handleCategoryClick(category._id)}
                            className="flex-1 flex items-center justify-between px-3 py-2 text-sm text-stone-700 hover:bg-stone-100 rounded-md capitalize"
                          >
                            <span>{category.name}</span>
                            {hasSubcategories &&
                              (isExpanded ? (
                                <IoChevronDown className="w-4 h-4 text-stone-600 transition-transform" />
                              ) : (
                                <IoChevronForward className="w-4 h-4 text-stone-600 transition-transform" />
                              ))}
                          </button>
                        </div>

                        {/* Subcategories */}
                        {isExpanded && hasSubcategories && (
                          <div className="ml-4 mt-1 flex flex-col gap-1 animate-in slide-in-from-left-2 duration-200">
                            {categorySubcategories.map((subcategory) => (
                              <Link
                                key={subcategory._id}
                                href={`/${category.slug}/${subcategory.slug}`}
                                onClick={onClose}
                                className="px-3 py-1.5 text-sm text-stone-600 hover:bg-stone-100 rounded-md capitalize flex items-center gap-2"
                              >
                                <span className="w-1.5 h-1.5 rounded-full bg-stone-400"></span>
                                {subcategory.name}
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Quick Links */}
            <div className="p-4 border-b border-stone-200">
              <h3 className="text-xs font-semibold text-stone-500 uppercase mb-3">
                Quick Links
              </h3>
              <div className="flex flex-col gap-1">
                <Link
                  href="/3d-printing"
                  onClick={onClose}
                  className="px-3 py-2 text-sm text-stone-700 hover:bg-stone-100 rounded-md font-medium"
                >
                  3D Print
                </Link>
                <Link
                  href="/services"
                  onClick={onClose}
                  className="px-3 py-2 text-sm text-stone-700 hover:bg-stone-100 rounded-md font-medium"
                >
                  Services
                </Link>
                <Link
                  href="/contact-us"
                  onClick={onClose}
                  className="px-3 py-2 text-sm text-stone-700 hover:bg-stone-100 rounded-md font-medium"
                >
                  Contact
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MobileSidebar;
