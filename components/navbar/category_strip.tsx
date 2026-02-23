"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import axios from "@/utils/axios/axios";
import axiosErrorLogger from "@/components/error/axios_error";
import { IoChevronDown } from "react-icons/io5";

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

const CategoryStrip = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Record<string, Subcategory[]>>({});
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get("/categories?limit=12&isActive=true");
        const data = response?.data?.data || [];
        const sortedCategories = data.sort(
          (a: Category, b: Category) => (a.sortOrder || 0) - (b.sortOrder || 0)
        );
        setCategories(sortedCategories);
      } catch (error) {
        axiosErrorLogger({ error });
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const fetchSubcategories = async (categoryId: string) => {
    // Check if already fetched
    if (subcategories[categoryId]) return;

    try {
      const response = await axios.get(`/subcategories?category=${categoryId}&isActive=true`);
      const data = response?.data?.data || [];
      setSubcategories(prev => ({
        ...prev,
        [categoryId]: data
      }));
    } catch (error) {
      axiosErrorLogger({ error });
      setSubcategories(prev => ({
        ...prev,
        [categoryId]: []
      }));
    }
  };

  const handleCategoryHover = (categoryId: string) => {
    setHoveredCategory(categoryId);
    fetchSubcategories(categoryId);
  };

  if (loading || categories.length === 0) {
    return null;
  }

  return (
    <div className="w-full py-1 text-center text-stone-700 shadow-sm border-t border-stone-100 ">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
        <div className="hidden md:flex items-center justify-center gap-2 overflow-x-auto scrollbar-hide py-2">
          {categories.map((category) => {
            const categorySubcategories = subcategories[category._id] || [];
            const hasSubcategories = categorySubcategories.length > 0;

            return (
              <div
                key={category._id}
                className="relative group"
                onMouseEnter={() => handleCategoryHover(category._id)}
                onMouseLeave={() => setHoveredCategory(null)}
              >
                <Link
                  href={`/${category.slug}`}
                  className="px-3 py-1.5 capitalize text-sm font-medium text-stone-700 hover:text-brand-600 hover:bg-stone-100 rounded-md transition-all duration-200 whitespace-nowrap flex items-center gap-1"
                >
                  {category.name}
                  {hasSubcategories && (
                    <IoChevronDown className="w-3.5 h-3.5 transition-transform group-hover:rotate-180" />
                  )}
                </Link>

                {/* Subcategories Dropdown */}
                {hasSubcategories && hoveredCategory === category._id && (
                  <div className="absolute top-full left-0 mt-1 bg-white border border-stone-200 rounded-lg shadow-lg py-2 min-w-[200px] z-50">
                    {categorySubcategories.map((subcategory) => (
                      <Link
                        key={subcategory._id}
                        href={`/${category.slug}/${subcategory.slug}`}
                        className="block px-4 py-2 text-sm text-stone-700 hover:bg-stone-100 hover:text-brand-600 transition-colors capitalize"
                      >
                        {subcategory.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Mobile: Simple horizontal scroll */}
        <div className="md:hidden flex items-center gap-2 overflow-x-auto scrollbar-hide py-2">
          {categories.map((category) => (
            <Link
              key={category._id}
              href={`/${category.slug}`}
              className="px-3 py-1 capitalize text-sm font-medium text-stone-700 hover:text-brand-600 hover:bg-stone-100 rounded-md transition-all duration-200 whitespace-nowrap"
            >
              {category.name}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoryStrip;
