'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { OrderWithItemsType } from "@/schemas/admin/sales/orderSchema";
import { generateInvoicePDF } from "./generate-invoice-pdf";
import { toast } from "sonner";

interface InvoiceDownloadButtonProps {
  order: OrderWithItemsType;
}

export function InvoiceDownloadButton({ order }: InvoiceDownloadButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownload = async () => {
    try {
      setIsGenerating(true);
      await generateInvoicePDF(order);
    } catch (error) {
      toast.error('Failed to generate invoice');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      className="whitespace-nowrap text-xs bg-slate-200 border-slate-300"
      aria-label="download invoice"
      onClick={handleDownload}
      disabled={isGenerating}
    >
      {isGenerating
        ? <><Loader2 className="mr-0.5 inline size-4 animate-spin" /> Generating...</>
        : <><Download className="mr-0.5 inline size-4" /> Download Invoice</>}
    </Button>
  );
}
