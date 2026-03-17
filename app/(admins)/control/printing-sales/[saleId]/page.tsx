"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Trash2, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import axios from "@/utils/axios/axios";
import { toast } from "sonner";
import { format } from "date-fns";
import { PrintingSaleType } from "../printing-sale-columns";

export default function PrintingSaleDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [sale, setSale] = useState<PrintingSaleType | null>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);

    const fetchSale = useCallback(async () => {
        try {
            setLoading(true);
            const res = await axios.get(`/admin/printing-sales/${params.saleId}`);
            setSale(res.data.data);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load sale details");
        } finally {
            setLoading(false);
        }
    }, [params.saleId]);

    useEffect(() => {
        fetchSale();
    }, [fetchSale]);

    const handlePaymentStatusUpdate = async (status: string) => {
        try {
            setUpdating(true);
            await axios.patch(`/admin/printing-sales/${params.saleId}/payment-status`, {
                paymentStatus: status,
            });
            toast.success("Payment status updated");
            fetchSale();
        } catch (error) {
            toast.error("Failed to update payment status");
        } finally {
            setUpdating(false);
        }
    };

    const handleDelete = async () => {
        try {
            await axios.delete(`/admin/printing-sales/${params.saleId}`);
            toast.success("Sale deleted successfully");
            router.push("/control/printing-sales");
        } catch (error) {
            toast.error("Failed to delete sale");
        }
    };

    const getBadgeVariant = (status: string) => {
        switch (status) {
            case "paid": return "success";
            case "pending": return "warning";
            case "cancelled": return "failed";
            default: return "default";
        }
    };

    if (loading) {
        return (
            <div className="p-8 flex justify-center items-center h-64">
                <div className="size-5 border border-t-stone-700 border-b-stone-300 animate-spin bg-gradient-to-b from-stone-700 to-stone-300" />
            </div>
        );
    }

    if (!sale) {
        return (
            <div className="p-8 text-center text-muted-foreground">
                Sale not found
            </div>
        );
    }

    return (
        <div className="w-full h-fit flex flex-col px-5 md:px-7 py-8 gap-6 font-inter">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div className="flex items-center gap-4">
                    <Link href="/control/printing-sales">
                        <Button variant="outline" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h2 className="text-lg lg:text-xl font-bold tracking-tight text-stone-900">
                            {sale.saleNumber}
                        </h2>
                        <p className="text-sm text-muted-foreground mt-0.5">
                            Created on{" "}
                            {sale.createdAt
                                ? format(new Date(sale.createdAt), "dd MMM yyyy, hh:mm a")
                                : "N/A"}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Badge
                        variant={getBadgeVariant(sale.paymentStatus) as any}
                        className="capitalize text-sm px-3 py-1"
                    >
                        {sale.paymentStatus}
                    </Badge>

                    <Link href={`/control/printing-sales/${params.saleId}/edit`}>
                        <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                        </Button>
                    </Link>

                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm">
                                <Trash2 className="h-4 w-4 mr-1" />
                                Delete
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Delete this sale?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete the
                                    sale record and remove it from all financial calculations.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleDelete}>
                                    Delete
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Customer Info */}
                <Card className="lg:col-span-1">
                    <CardHeader>
                        <CardTitle className="text-base">Customer Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
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
                            <span className="text-muted-foreground">Address:</span>{" "}
                            <span className="font-medium">{sale.address}</span>
                        </div>
                        <div>
                            <span className="text-muted-foreground">City:</span>{" "}
                            <span className="font-medium">{sale.city}</span>
                        </div>
                        <div>
                            <span className="text-muted-foreground">Country:</span>{" "}
                            <span className="font-medium">{sale.country}</span>
                        </div>
                        {sale.notes && (
                            <div>
                                <span className="text-muted-foreground">Notes:</span>{" "}
                                <span className="font-medium">{sale.notes}</span>
                            </div>
                        )}

                        {/* Payment status update */}
                        <div className="pt-3 border-t">
                            <span className="text-muted-foreground text-xs block mb-2">
                                Update Payment Status
                            </span>
                            <Select
                                value={sale.paymentStatus}
                                onValueChange={handlePaymentStatusUpdate}
                                disabled={updating}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="paid">Paid</SelectItem>
                                    <SelectItem value="cancelled">Cancelled</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {/* Product Items */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="text-base">Product Items</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-muted/50">
                                    <tr>
                                        <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground uppercase">
                                            Product
                                        </th>
                                        <th className="px-4 py-2.5 text-right text-xs font-medium text-muted-foreground uppercase">
                                            Unit Price
                                        </th>
                                        <th className="px-4 py-2.5 text-right text-xs font-medium text-muted-foreground uppercase">
                                            Qty
                                        </th>
                                        <th className="px-4 py-2.5 text-right text-xs font-medium text-muted-foreground uppercase">
                                            Price
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {sale.items.map((item, i) => (
                                        <tr key={i} className="hover:bg-muted/20">
                                            <td className="px-4 py-3 text-sm font-medium">
                                                {item.productName}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-right text-muted-foreground">
                                                BDT{" "}
                                                {new Intl.NumberFormat("en-US").format(item.unitPrice)}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-right">
                                                {item.quantity}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-right font-semibold">
                                                BDT {new Intl.NumberFormat("en-US").format(item.price)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot className="border-t-2">
                                    <tr>
                                        <td
                                            colSpan={3}
                                            className="px-4 py-3 text-sm font-semibold text-right"
                                        >
                                            Total:
                                        </td>
                                        <td className="px-4 py-3 text-base font-bold text-right text-stone-900">
                                            BDT{" "}
                                            {new Intl.NumberFormat("en-US").format(sale.totalPrice)}
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
