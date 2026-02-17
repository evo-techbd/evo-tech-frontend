import React from "react";
import axios from "@/utils/axios/axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ContentData {
    _id: string;
    content: string;
    version: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

const getActiveContent = async (): Promise<ContentData | null> => {
    try {
        const response = await axios.get(`/page-content/shipping-return-policy/active`);
        if (response.data && response.data.data) {
            return response.data.data;
        }
        return null;
    } catch (error: any) {
        console.error("Error fetching shipping & return policy:", error.message);
        return null;
    }
};

const ShippingReturnPolicy = async () => {
    let contentData: ContentData | null = null;

    try {
        contentData = await getActiveContent();
    } catch (error) {
        console.error("Shipping & return policy page error:", error);
    }

    if (!contentData) {
        return (
            <div className="w-full min-h-screen flex items-center justify-center bg-stone-50">
                <div className="container mx-auto px-4 py-12 max-w-4xl">
                    <Card className="shadow-lg">
                        <CardContent className="py-12 text-center">
                            <h1 className="text-3xl font-bold mb-4 text-stone-800">
                                Shipping & Return Policy
                            </h1>
                            <p className="text-stone-600 text-lg">
                                Shipping & return policy is currently being updated. Please
                                check back later.
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
                                Shipping & Return Policy
                            </CardTitle>
                            <Badge variant="secondary" className="text-sm">
                                Version {contentData.version}
                            </Badge>
                        </div>
                        <p className="text-sm text-stone-600 mt-2">
                            Last updated:{" "}
                            {new Date(contentData.updatedAt).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                            })}
                        </p>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="prose prose-stone max-w-none">
                            <div className="whitespace-pre-wrap text-stone-700 leading-relaxed text-sm md:text-base">
                                {contentData.content}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default ShippingReturnPolicy;
