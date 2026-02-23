"use client";

import { useState, useEffect, useCallback } from "react";
import createAxiosClient from "@/utils/axios/axiosClient";
import { AddProductFeaturesForm } from "./add-features-form";
import { AddProductSpecsForm } from "./add-specs-form";
import { AddColorVariationsForm } from "./add-color-variations-form";
import { AddReviewsForm } from "./add-reviews-form";
import axios from "@/utils/axios/axios";

interface ProductSectionData {
  itemid: string;
  itemname: string;
  headers: any[];
  subsections: any[];
  specifications: any[];
  colorVariations: any[];
  reviews: any[];
}

interface ProductSectionsWrapperProps {
  initialData: ProductSectionData;
}

export function ProductSectionsWrapper({
  initialData,
}: ProductSectionsWrapperProps) {
  const [data, setData] = useState(initialData);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      // Fetch updated product data
      const response = await axios.get(`/api/products/${initialData.itemid}`, {
        withCredentials: true,
      });

      const product = response.data.data || response.data;

      // Fetch reviews directly from backend
      let reviews = [];
      try {
        const axiosAuth = await createAxiosClient();
        const reviewsResponse = await axiosAuth.get(
          `/products/${initialData.itemid}/reviews`
        );
        reviews = reviewsResponse.data.data || [];
      } catch (error) {
        console.error("Error fetching reviews:", error);
      }

      setData({
        itemid: initialData.itemid,
        itemname: initialData.itemname,
        headers: product.featureHeaders || [],
        subsections: product.featureSubsections || [],
        specifications: product.specifications || [],
        colorVariations: product.colorVariations || [],
        reviews: reviews,
      });
    } catch (error) {
      console.error("Error refreshing data:", error);
    } finally {
      setIsRefreshing(false);
    }
  }, [initialData.itemid, initialData.itemname]);

  // Fetch reviews on initial mount
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  return (
    <div className="space-y-6">
      {isRefreshing && (
        <div className="fixed top-4 right-4 bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm z-50">
          Refreshing...
        </div>
      )}

      <div className="mt-4">
        <h2 className="text-base lg:text-lg font-semibold tracking-tight text-stone-900 mb-4">
          Color Variations
        </h2>
        <AddColorVariationsForm
          itemInfo={{
            itemid: data.itemid,
            itemname: data.itemname,
          }}
          colorVariations={data.colorVariations}
          onRefresh={refreshData}
        />
      </div>

      <div className="mt-4">
        <h2 className="text-base lg:text-lg font-semibold tracking-tight text-stone-900 mb-4">
          Features Section
        </h2>
        <AddProductFeaturesForm
          itemInfo={{
            itemid: data.itemid,
            itemname: data.itemname,
          }}
          headers={data.headers}
          subsections={data.subsections}
          onRefresh={refreshData}
        />
      </div>

      <div className="mt-4">
        <h2 className="text-base lg:text-lg font-semibold tracking-tight text-stone-900 mb-4">
          Specifications Section
        </h2>
        <AddProductSpecsForm
          itemInfo={{
            itemid: data.itemid,
            itemname: data.itemname,
          }}
          specifications={data.specifications}
          onRefresh={refreshData}
        />
      </div>

      <div className="mt-4">
        <h2 className="text-base lg:text-lg font-semibold tracking-tight text-stone-900 mb-4">
          Product Reviews
        </h2>
        <AddReviewsForm
          itemInfo={{
            itemid: data.itemid,
            itemname: data.itemname,
          }}
          reviews={data.reviews}
          onRefresh={refreshData}
        />
      </div>
    </div>
  );
}
