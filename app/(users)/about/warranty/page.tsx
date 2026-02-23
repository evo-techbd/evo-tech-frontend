import React from "react";
import axios from "@/utils/axios/axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface WarrantyData {
  _id: string;
  content: string;
  version: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const getActiveWarranty = async (): Promise<WarrantyData | null> => {
  try {
    const response = await axios.get(`/warranty/active`);
    if (response.data && response.data.data) {
      return response.data.data;
    }
    return null;
  } catch (error: any) {
    console.error("Error fetching warranty information:", error.message);
    return null;
  }
};

const WarrantyInformation = async () => {
  let warrantyData: WarrantyData | null = null;

  try {
    warrantyData = await getActiveWarranty();
  } catch (error) {
    console.error("Warranty information page error:", error);
  }

  if (!warrantyData) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-stone-50">
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <Card className="shadow-lg">
            <CardContent className="py-12 text-center">
              <h1 className="text-3xl font-bold mb-4 text-stone-800">
                Warranty Information
              </h1>
              <p className="text-stone-600 text-lg">
                Warranty information is currently being updated. Please check
                back later.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-stone-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <Card className="shadow-lg">
          <CardHeader className="border-b border-stone-200">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <CardTitle className="text-3xl font-bold text-stone-800">
                Warranty Information
              </CardTitle>
              <Badge variant="secondary" className="text-sm">
                Version {warrantyData.version}
              </Badge>
            </div>
            <p className="text-sm text-stone-600 mt-2">
              Last updated:{" "}
              {new Date(warrantyData.updatedAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="prose prose-stone max-w-none">
              <div className="whitespace-pre-wrap text-stone-700 leading-relaxed text-sm md:text-base">
                {warrantyData.content}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default WarrantyInformation;
