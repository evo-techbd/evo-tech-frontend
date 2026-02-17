"use client";

import { Button } from "@/components/ui/button";
import { Tag, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { OrderWithItemsType } from "@/schemas/admin/sales/orderSchema";
import { generateShippingLabel } from "./generate-shipping-label";

interface ShippingLabelButtonProps {
    order: OrderWithItemsType;
}

export function ShippingLabelButton({ order }: ShippingLabelButtonProps) {
    const [isGenerating, setIsGenerating] = useState(false);

    const handlePrintLabel = async () => {
        if (!order) {
            toast.error("Order not found");
            return;
        }

        setIsGenerating(true);
        try {
            await generateShippingLabel(order);
            toast.success("Shipping label downloaded successfully");
        } catch (error) {
            console.error("Failed to generate shipping label:", error);
            toast.error("Failed to generate shipping label");
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <Button
            onClick={handlePrintLabel}
            disabled={isGenerating}
            size="sm"
            className="bg-purple-600 hover:bg-purple-700 text-white"
        >
            {isGenerating ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                </>
            ) : (
                <>
                    <Tag className="mr-2 h-4 w-4" />
                    Print Label
                </>
            )}
        </Button>
    );
}
