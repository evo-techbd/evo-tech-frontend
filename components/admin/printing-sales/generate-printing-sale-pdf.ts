"use client";

import { PrintingSaleType } from "@/app/(admins)/control/printing-sales/printing-sale-columns";
import { renderInvoicePDF } from "@/components/admin/orders/comps/generate-invoice-pdf";

// 3D printing sales print on the same A5 invoice as orders, with the same
// shared monthly invoice serial (SL). Printing sales only track a payment
// status (no partial payments), so paid/due are derived from it. They are
// always paid in cash, so the Cash checkbox is marked.
export async function generatePrintingSalePDF(sale: PrintingSaleType) {
    const isPaid = sale.paymentStatus === "paid";

    return renderInvoicePDF({
        serial: sale.invoiceSerial,
        referenceLabel: "Ref",
        referenceId: sale.saleNumber,
        customerName: sale.customerName,
        phone: sale.phone,
        address: [sale.address, sale.city, sale.country]
            .filter(Boolean)
            .join(", "),
        items: (sale.items || []).map((item) => ({
            name: item.productName,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
        })),
        totalAmount: sale.totalPrice,
        paidAmount: isPaid ? sale.totalPrice : 0,
        dueAmount: isPaid ? 0 : sale.totalPrice,
        paymentMethod: "cash",
        filename: `Invoice_${sale.invoiceSerial || sale.saleNumber}_EvoTechBD.pdf`,
    });
}
