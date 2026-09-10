"use client";

import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/evo_dialog";
import { PrintingSaleType } from "@/app/(admins)/control/printing-sales/printing-sale-columns";

interface PrintingSaleViewModalProps {
    sale: PrintingSaleType | null;
    isOpen: boolean;
    onClose: () => void;
}

export function PrintingSaleViewModal({
    sale,
    isOpen,
    onClose,
}: PrintingSaleViewModalProps) {
    if (!sale) return null;

    const getBadgeVariant = (status: string) => {
        switch (status) {
            case "paid":
                return "success";
            case "pending":
                return "warning";
            case "cancelled":
                return "failed";
            default:
                return "default";
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex items-center justify-between gap-3 pr-6">
                        <DialogTitle className="text-lg font-semibold text-stone-900">
                            {sale.saleNumber}
                        </DialogTitle>
                        <Badge
                            variant={getBadgeVariant(sale.paymentStatus) as any}
                            className="capitalize"
                        >
                            {sale.paymentStatus}
                        </Badge>
                    </div>
                </DialogHeader>

                <div className="space-y-6">
                    <div>
                        <h4 className="text-sm font-semibold text-stone-800 mb-2">
                            Customer Information
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm bg-stone-50 border border-stone-200 rounded-lg p-4">
                            <div>
                                <span className="text-muted-foreground">Name:</span>{" "}
                                <span className="font-medium">{sale.customerName}</span>
                            </div>
                            <div>
                                <span className="text-muted-foreground">Phone:</span>{" "}
                                <span className="font-medium">{sale.phone}</span>
                            </div>
                            {sale.email && (
                                <div>
                                    <span className="text-muted-foreground">Email:</span>{" "}
                                    <span className="font-medium">{sale.email}</span>
                                </div>
                            )}
                            <div>
                                <span className="text-muted-foreground">City:</span>{" "}
                                <span className="font-medium">{sale.city}</span>
                            </div>
                            <div className="sm:col-span-2">
                                <span className="text-muted-foreground">Address:</span>{" "}
                                <span className="font-medium">{sale.address}</span>
                            </div>
                            <div>
                                <span className="text-muted-foreground">Country:</span>{" "}
                                <span className="font-medium">{sale.country}</span>
                            </div>
                            {sale.notes && (
                                <div className="sm:col-span-2">
                                    <span className="text-muted-foreground">Notes:</span>{" "}
                                    <span className="font-medium">{sale.notes}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div>
                        <h4 className="text-sm font-semibold text-stone-800 mb-2">
                            Product Items
                        </h4>
                        <div className="overflow-x-auto border border-stone-200 rounded-lg">
                            <table className="w-full text-sm">
                                <thead className="bg-stone-50">
                                    <tr>
                                        <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase">
                                            Product
                                        </th>
                                        <th className="px-3 py-2 text-right text-xs font-medium text-muted-foreground uppercase">
                                            Unit Price
                                        </th>
                                        <th className="px-3 py-2 text-right text-xs font-medium text-muted-foreground uppercase">
                                            Qty
                                        </th>
                                        <th className="px-3 py-2 text-right text-xs font-medium text-muted-foreground uppercase">
                                            Price
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-stone-200">
                                    {sale.items.map((item, i) => (
                                        <tr key={i}>
                                            <td className="px-3 py-2 font-medium">
                                                {item.productName}
                                            </td>
                                            <td className="px-3 py-2 text-right text-muted-foreground">
                                                BDT{" "}
                                                {new Intl.NumberFormat("en-US").format(item.unitPrice)}
                                            </td>
                                            <td className="px-3 py-2 text-right">{item.quantity}</td>
                                            <td className="px-3 py-2 text-right font-semibold">
                                                BDT {new Intl.NumberFormat("en-US").format(item.price)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot className="border-t-2 border-stone-200">
                                    <tr>
                                        <td
                                            colSpan={3}
                                            className="px-3 py-2 text-right font-semibold"
                                        >
                                            Total:
                                        </td>
                                        <td className="px-3 py-2 text-right font-bold text-stone-900">
                                            BDT{" "}
                                            {new Intl.NumberFormat("en-US").format(sale.totalPrice)}
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>

                    <p className="text-xs text-muted-foreground">
                        Created on{" "}
                        {sale.createdAt
                            ? format(new Date(sale.createdAt), "dd MMM yyyy, hh:mm a")
                            : "N/A"}
                    </p>
                </div>
            </DialogContent>
        </Dialog>
    );
}
