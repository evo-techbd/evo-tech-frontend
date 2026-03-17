"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { OrderWithItemsType } from "@/schemas/admin/sales/orderSchema";
import { InvoiceDownloadButton } from "./comps/invoice-download-button";
import { ShippingLabelButton } from "./comps/shipping-label-button";

const OrderDetailsHeader = ({ order }: { order: OrderWithItemsType }) => {
  const router = useRouter();

  useEffect(() => {
    router.prefetch("/control/orders");
  }, [router]);

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
      return;
    }

    router.push("/control/orders");
  };

  return (
    <div className="flex flex-col sm:flex-row sm:justify-between items-start gap-4">
      <div className="flex flex-col gap-1">
        <Button
          variant="outline"
          size="sm"
          aria-label="back button"
          className="mb-2 w-fit"
          onClick={handleBack}
        >
          <span className="flex items-center">
            <ArrowLeft className="mr-0.5 h-4 w-4" />
            Back
          </span>
        </Button>

        <h1 className="text-lg font-semibold text-stone-800">
          {`Order - `}
          <span className="text-evoAdminAccent">{`#${order.orderNumber || order._id}`}</span>
        </h1>
        <div className="flex items-center gap-4 text-xs text-stone-500">
          <span>{`Placed on: ${order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "N/A"}`}</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 max-sm:w-full justify-end">
        <InvoiceDownloadButton order={order} />
        <ShippingLabelButton order={order} />
      </div>
    </div>
  );
};

export { OrderDetailsHeader };
