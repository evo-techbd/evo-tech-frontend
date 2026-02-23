"use client";

import { useCategory } from "@/hooks/use-taxonomy";
import { useState, useEffect } from "react";

const DynamicTextBySlug = ({ slug }: { slug: string }) => {
  const [mounted, setMounted] = useState(false);
  const category = useCategory(slug);

  useEffect(() => {
    setMounted(true);
  }, []);

  const displayText =
    mounted && category?.name ? ` ${category.name}` : ` What Fits Your Needs`;

  return (
    // Shorter hero: 140-160px. Use a lightweight gradient background (no large images).
    <div className="flex flex-col items-center justify-center w-full h-[140px] md:h-[160px] pt-6 md:pt-8 pb-4 bg-gradient-to-r from-stone-900 via-stone-800 to-stone-700">
      {mounted && (
        <div className="text-center px-4">
          <h1 className="inline-block px-2 py-1 text-[18px] md:text-2xl font-semibold text-stone-100">
            <span className="text-sky-400">Select</span>
            {displayText}
          </h1>
          {category?.description && (
            <p className="mt-2 text-sm text-stone-200 max-w-2xl">
              {category.description}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default DynamicTextBySlug;
