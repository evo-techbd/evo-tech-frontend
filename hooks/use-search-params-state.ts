"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

interface UseSearchParamsStateOptions {
  basePath: string;
}

export function useSearchParamsState({
  basePath,
}: UseSearchParamsStateOptions) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateSearchParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());

      // Update or remove parameters
      Object.entries(updates).forEach(([key, value]) => {
        if (
          value === null ||
          value === "" ||
          value === "all" ||
          value === "none"
        ) {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      });

      // Always reset to page 1 when filtering (except when only page is being updated)
      const onlyPageUpdate =
        Object.keys(updates).length === 1 && "page" in updates;
      if (!onlyPageUpdate) {
        params.set("page", "1");
      }

      const queryString = params.toString();
      const newUrl = `${basePath}${queryString ? `?${queryString}` : ""}`;

      // Use push instead of replace to ensure the effect hook in use-products-data triggers
      router.push(newUrl);
    },
    [router, searchParams, basePath]
  );

  const resetSearchParams = useCallback(() => {
    router.replace(basePath);
  }, [router, basePath]);

  const getParam = useCallback(
    (key: string) => searchParams.get(key) || "",
    [searchParams]
  );

  return {
    updateSearchParams,
    resetSearchParams,
    getParam,
    searchParams,
  };
}
