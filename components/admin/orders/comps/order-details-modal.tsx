"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ExternalLink, Loader2 } from "lucide-react";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/evo_dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { currencyFormatBDT } from "@/lib/all_utils";
import { OrderWithItemsType } from "@/schemas/admin/sales/orderSchema";
import { PaymentHistory } from "@/components/admin/payments/payment-history";
import { getPaymentStatusLabel, getPaymentStatusVariant } from "@/utils/payment-status";

const shippingTypes: { [key: string]: string } = {
    home_delivery: "Home Delivery",
    pickup_point: "Pickup Point",
    express_delivery: "Express Delivery",
    regular_delivery: "Regular Delivery",
};

const paymentMethods: { [key: string]: string } = {
    cash_on_delivery: "Cash on Delivery",
    cod: "Cash On Delivery",
    cop: "Cash on Pickup",
    bkash: "bKash",
    nagad: "Nagad",
    credit_card: "Credit Card",
    bank_transfer: "Bank Transfer",
    eps: "Online Payment (EPS)",
};

const getOrderStatusBadge = (status: string) => {
    const statusConfig = {
        pending: { variant: "customdefault" as const, text: "Pending" },
        confirmed: { variant: "confirmed" as const, text: "Confirmed" },
        processing: { variant: "processing" as const, text: "Processing" },
        shipped: { variant: "shipped" as const, text: "Assigned to Rider" },
        delivered: { variant: "delivered" as const, text: "Delivered" },
        cancelled: { variant: "failed" as const, text: "Cancelled" },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || {
        variant: "outline" as const,
        text: status,
    };

    return (
        <Badge variant={config.variant} className="text-[0.625rem] leading-none py-0.5 font-medium capitalize">
            {config.text}
        </Badge>
    );
};

const getPaymentStatusBadge = (status: string) => (
    <Badge variant={getPaymentStatusVariant(status)} className="text-[0.625rem] leading-none py-0.5 font-medium capitalize">
        {getPaymentStatusLabel(status)}
    </Badge>
);

const fetchOrderWithItems = async (orderId: string): Promise<OrderWithItemsType> => {
    const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: "GET",
        credentials: "include",
        cache: "no-store",
    });

    if (!response.ok) {
        throw new Error("Failed to fetch order details");
    }

    const payload = await response.json();
    const order = payload?.data?.order;
    const items = payload?.data?.items;

    if (!order) {
        throw new Error("Order not found");
    }

    return { ...order, orderItems: items || [] };
};

interface OrderDetailsModalProps {
    orderId: string | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const OrderDetailsModal = ({ orderId, open, onOpenChange }: OrderDetailsModalProps) => {
    const router = useRouter();
    const [order, setOrder] = React.useState<OrderWithItemsType | null>(null);
    const [isLoading, setIsLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    React.useEffect(() => {
        if (!open || !orderId) return;

        let cancelled = false;
        setIsLoading(true);
        setError(null);
        setOrder(null);

        fetchOrderWithItems(orderId)
            .then((data) => {
                if (!cancelled) setOrder(data);
            })
            .catch(() => {
                if (!cancelled) setError("Failed to load order details");
            })
            .finally(() => {
                if (!cancelled) setIsLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, [open, orderId]);

    const goToFullDetails = () => {
        if (!order) return;
        onOpenChange(false);
        router.push(`/control/orders/${order._id || order.orderNumber}`);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto bg-stone-50">
                <DialogHeader>
                    <DialogTitle>Order Details</DialogTitle>
                    <DialogDescription>
                        {order ? `Order #${order.orderNumber}` : "Loading order information..."}
                    </DialogDescription>
                </DialogHeader>

                {isLoading && (
                    <div className="flex justify-center items-center py-12">
                        <Loader2 className="h-6 w-6 animate-spin text-stone-400" />
                    </div>
                )}

                {!isLoading && error && (
                    <p className="text-sm text-red-500 py-6 text-center">{error}</p>
                )}

                {!isLoading && !error && order && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="rounded-md border border-stone-200 p-3 text-xs text-stone-600 space-y-1.5">
                                <h4 className="text-sm font-semibold text-stone-800 mb-1">Customer Info</h4>
                                <p>
                                    <span className="font-semibold text-evoAdminPrimary">Name: </span>
                                    {`${order.firstname}${order.lastname ? ` ${order.lastname}` : ""}`}
                                </p>
                                {order.email && (
                                    <p>
                                        <span className="font-semibold text-evoAdminPrimary">Email: </span>
                                        {order.email}
                                    </p>
                                )}
                                <p>
                                    <span className="font-semibold text-evoAdminPrimary">Phone: </span>
                                    {order.phone}
                                </p>
                                <p>
                                    <span className="font-semibold text-evoAdminPrimary">Address: </span>
                                    {[order.houseStreet, order.city, order.postcode, order.country]
                                        .filter(Boolean)
                                        .join(", ")}
                                </p>
                            </div>

                            <div className="rounded-md border border-stone-200 p-3 text-xs text-stone-600 space-y-1.5">
                                <h4 className="text-sm font-semibold text-stone-800 mb-1">Order Info</h4>
                                <div className="flex items-center gap-1.5">
                                    <span className="font-semibold text-evoAdminPrimary">Order Status: </span>
                                    {getOrderStatusBadge(order.orderStatus)}
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <span className="font-semibold text-evoAdminPrimary">Payment Status: </span>
                                    {getPaymentStatusBadge(order.paymentStatus)}
                                </div>
                                <p>
                                    <span className="font-semibold text-evoAdminPrimary">Payment Method: </span>
                                    {paymentMethods[order.paymentMethod] || order.paymentMethod}
                                </p>
                                <p>
                                    <span className="font-semibold text-evoAdminPrimary">Shipping Type: </span>
                                    {shippingTypes[order.shippingType] || order.shippingType}
                                </p>
                                <p>
                                    <span className="font-semibold text-evoAdminPrimary">Order Date: </span>
                                    {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "N/A"}
                                </p>
                            </div>
                        </div>

                        <div className="rounded-md border border-stone-200 p-3">
                            <h4 className="text-sm font-semibold text-stone-800 mb-2">Ordered Items</h4>
                            <div className="max-h-[220px] overflow-y-auto space-y-2">
                                {(order.orderItems || []).map((item, index) => (
                                    <div
                                        key={`order-modal-item-${index}`}
                                        className="flex justify-between items-center text-xs border-b border-stone-100 pb-2 last:border-0"
                                    >
                                        <div>
                                            <p className="font-medium text-stone-800">{item.productName}</p>
                                            {item.selectedColor && (
                                                <p className="text-stone-500">Color: {item.selectedColor}</p>
                                            )}
                                            <p className="text-stone-500">
                                                {currencyFormatBDT(item.productPrice)} × {item.quantity}
                                            </p>
                                        </div>
                                        <span className="font-medium text-stone-800">
                                            {currencyFormatBDT(item.productPrice * item.quantity)} BDT
                                        </span>
                                    </div>
                                ))}
                                {(!order.orderItems || order.orderItems.length === 0) && (
                                    <p className="text-xs text-stone-500">No items found in this order.</p>
                                )}
                            </div>

                            <div className="border-t border-stone-200 mt-3 pt-2 space-y-1 text-xs">
                                <div className="flex justify-between">
                                    <span className="text-stone-600">Subtotal:</span>
                                    <span className="text-stone-800">{currencyFormatBDT(order.subtotal)} BDT</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-stone-600">Discount:</span>
                                    <span className="text-stone-800">-{currencyFormatBDT(order.discount)} BDT</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-stone-600">Delivery:</span>
                                    <span className="text-stone-800">{currencyFormatBDT(order.deliveryCharge)} BDT</span>
                                </div>
                                <div className="flex justify-between text-sm font-semibold border-t border-stone-200 pt-1">
                                    <span className="text-stone-800">Total:</span>
                                    <span className="text-stone-800">{currencyFormatBDT(order.totalPayable)} BDT</span>
                                </div>
                                <div className="flex justify-between text-green-700">
                                    <span>Paid:</span>
                                    <span>{currencyFormatBDT(order.amountPaid || 0)} BDT</span>
                                </div>
                                <div className="flex justify-between text-red-700">
                                    <span>Due:</span>
                                    <span>
                                        {currencyFormatBDT(order.amountDue ?? order.totalPayable - (order.amountPaid || 0))} BDT
                                    </span>
                                </div>
                            </div>
                        </div>

                        <PaymentHistory entityType="order" entityId={order._id || orderId || undefined} variant="section" />

                        <div className="flex justify-end">
                            <Button variant="outline" size="sm" onClick={goToFullDetails}>
                                View Full Details
                                <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
                            </Button>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
};

export { OrderDetailsModal };
