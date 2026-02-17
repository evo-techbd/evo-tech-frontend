"use client";

import React, { useEffect, useState } from "react";
import { IoClose, IoChevronForward } from "react-icons/io5";
import Link from "next/link";
import { useTaxonomy } from "@/hooks/use-taxonomy";

interface CategoriesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const CategoriesDrawer: React.FC<CategoriesDrawerProps> = ({
  isOpen,
  onClose,
}) => {
  const { categories, isLoading } = useTaxonomy();
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(),
  );

  // Reset scroll when drawer opens
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

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  const handleLinkClick = () => {
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-[60] transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 left-0 h-full w-[280px] sm:w-[320px] bg-white shadow-2xl z-[70] transform transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-stone-200 bg-gradient-to-r from-brand-600 to-brand-700">
          <h2 className="text-lg font-semibold text-white">All Categories</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
            aria-label="Close drawer"
          >
            <IoClose className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Categories List */}
        <div className="overflow-y-auto h-[calc(100vh-64px)] pb-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
            </div>
          ) : categories.length === 0 ? (
            <div className="px-4 py-8 text-center text-stone-500">
              No categories found
            </div>
          ) : (
            <div className="py-2">
              {categories.map((category) => (
                <div key={category.id} className="border-b border-stone-100">
                  {/* Category Item */}
                  <div className="flex items-center justify-between px-4 py-3 hover:bg-stone-50 transition-colors">
                    <Link
                      href={`/products-and-accessories?category=${category.slug}`}
                      onClick={handleLinkClick}
                      className="flex-1 text-stone-700 font-medium text-sm hover:text-brand-600 transition-colors"
                    >
                      {category.name}
                    </Link>

                    {/* Expand button if has subcategories */}
                    {category.subcategories &&
                      category.subcategories.length > 0 && (
                        <button
                          onClick={() => toggleCategory(category.id)}
                          className="p-2 rounded-full hover:bg-stone-200 transition-colors"
                          aria-label={`Toggle ${category.name} subcategories`}
                        >
                          <IoChevronForward
                            className={`w-4 h-4 text-stone-600 transition-transform ${
                              expandedCategories.has(category.id)
                                ? "rotate-90"
                                : ""
                            }`}
                          />
                        </button>
                      )}
                  </div>

                  {/* Subcategories */}
                  {expandedCategories.has(category.id) &&
                    category.subcategories &&
                    category.subcategories.length > 0 && (
                      <div className="bg-stone-50 py-2">
                        {category.subcategories.map((subcategory) => (
                          <Link
                            key={subcategory.id}
                            href={`/products-and-accessories?category=${category.slug}&subcategory=${subcategory.slug}`}
                            onClick={handleLinkClick}
                            className="block px-8 py-2 text-sm text-stone-600 hover:text-brand-600 hover:bg-white transition-colors"
                          >
                            {subcategory.name}
                          </Link>
                        ))}
                      </div>
                    )}
                </div>
              ))}
            </div>
          )}

          {/* View All Link */}
          <div className="px-4 py-4">
            <Link
              href="/products-and-accessories"
              onClick={handleLinkClick}
              className="block w-full px-4 py-3 text-center text-sm font-semibold text-white bg-brand-600 rounded-lg hover:bg-brand-700 transition-colors"
            >
              View All Products
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default CategoriesDrawer;
