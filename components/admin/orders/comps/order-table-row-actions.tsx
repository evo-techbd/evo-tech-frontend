"use client";

import * as React from "react";
import type { Row } from "@tanstack/react-table";
import { OrderWithItemsType } from "@/schemas/admin/sales/orderSchema";
import { Button } from "@/components/ui/button";
import { Eye, Printer, Loader2, Tag } from "lucide-react";
import { useDispatch } from "react-redux";
import { AppDispatch } from '@/store/store';
import { removeAnOrder } from "@/store/slices/orderSlice";
import { DeleteDialog } from "@/components/dialogs/delete-dialog";
import { toast } from "sonner";
import { deleteOrder } from "@/actions/admin/orders";
import { updateOrderStatus } from "@/actions/admin/update-order-status";
import { usePendingOrders } from "@/contexts/PendingOrdersContext";
import { generateInvoicePDF } from "./generate-invoice-pdf";
import { generateShippingLabel } from "./generate-shipping-label";
import { OrderDetailsModal } from "./order-details-modal";

// The orders table only fetches lightweight rows (no order items, and
// potentially a stale cached amountPaid/amountDue) — refetch the full order
// fresh right before printing so invoices/labels always reflect real data.
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

interface RowActionProps {
    row: Row<OrderWithItemsType>;
    onDataChange?: () => Promise<void>;
    archiveMode?: boolean;
}

const OrderTableRowActions = ({ row, onDataChange, archiveMode }: RowActionProps) => {

    const [isOpen, setIsOpen] = React.useState(false);
    const [isViewOpen, setIsViewOpen] = React.useState(false);
    const [isDeletePending, startDeleteTransition] = React.useTransition();
    const [isPrintingInvoice, setIsPrintingInvoice] = React.useState(false);
    const [isPrintingLabel, setIsPrintingLabel] = React.useState(false);
    const dispatch = useDispatch<AppDispatch>();

    const handleOrdersUpdateAfterDeletion = () => {
        dispatch(removeAnOrder({
            orderId: row.original._id || row.original.orderNumber,
        }));
    };

    const handleDelete = () => {
        const order = row.original;
        if (order) {
            startDeleteTransition(async () => {
                const { data, error } = await deleteOrder({
                    id: order._id || order.orderNumber,
                });

                if (error) {
                    toast.error(error || "An error occured while deleting the order");
                    return;
                }

                setIsOpen(false); // Close on success
                toast.success(data.message || "Order has been deleted");
                handleOrdersUpdateAfterDeletion(); // update redux state
                if (onDataChange) {
                    await onDataChange(); // refetch to update the table and pagination
                }
            });
        } else {
            toast.error('Something went wrong!');
        }
    };

    const handleCancel = () => {
        const order = row.original;
        if (!order) return toast.error('Order not found');

        if (order.orderStatus === 'cancelled') {
            return toast.error('Order is already cancelled');
        }

        // simple confirmation dialog
        const confirmed = window.confirm('Are you sure you want to cancel this order? This action will mark the order as cancelled.');
        if (!confirmed) return;

        startDeleteTransition(async () => {
            const { data, error } = await updateOrderStatus({
                id: order._id || order.orderNumber,
                payload: { orderStatus: 'cancelled' }
            });

            if (error) {
                toast.error(error || 'Failed to cancel order');
                return;
            }

            toast.success(data?.message || 'Order cancelled');
            // trigger table/pagination refresh
            if (onDataChange) await onDataChange();
        });
    };

    const handlePrintInvoice = async () => {
        const order = row.original;
        if (!order) return toast.error('Order not found');

        setIsPrintingInvoice(true);
        try {
            const fullOrder = await fetchOrderWithItems(order._id || order.orderNumber);
            await generateInvoicePDF(fullOrder);
            toast.success('Invoice downloaded successfully');
        } catch (error) {
            toast.error('Failed to generate invoice');
        } finally {
            setIsPrintingInvoice(false);
        }
    };

    const handlePrintLabel = async () => {
        const order = row.original;
        if (!order) return toast.error('Order not found');

        setIsPrintingLabel(true);
        try {
            const fullOrder = await fetchOrderWithItems(order._id || order.orderNumber);
            await generateShippingLabel(fullOrder);
            toast.success('Shipping label downloaded successfully');
        } catch (error) {
            toast.error('Failed to generate shipping label');
        } finally {
            setIsPrintingLabel(false);
        }
    };

    return (
        <div className="px-2 flex justify-end items-center gap-1" role="group" aria-label="Actions">
            <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 rounded-full bg-blue-100 text-blue-500 hover:text-blue-600 hover:bg-blue-50"
                aria-label={`View Order details`}
                onClick={() => setIsViewOpen(true)}
            >
                <Eye className="h-4 w-4" />
            </Button>

            <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 rounded-full bg-green-100 text-green-600 hover:text-green-700 hover:bg-green-50"
                aria-label={`Print invoice`}
                onClick={handlePrintInvoice}
                disabled={isPrintingInvoice}
            >
                {isPrintingInvoice ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                    <Printer className="h-4 w-4" />
                )}
            </Button>

            <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 rounded-full bg-purple-100 text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                aria-label={`Print shipping label`}
                onClick={handlePrintLabel}
                disabled={isPrintingLabel}
            >
                {isPrintingLabel ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                    <Tag className="h-4 w-4" />
                )}
            </Button>

            <OrderDetailsModal
                orderId={row.original._id || row.original.orderNumber}
                open={isViewOpen}
                onOpenChange={setIsViewOpen}
            />

            <DeleteDialog<OrderWithItemsType>
                rowitem={row.original}
                open={isOpen}
                onOpenChange={setIsOpen}
                onDelete={handleDelete}
                isDeletePending={isDeletePending}
                entityName="order"
            />
            {/* Cancel button - visible only if order not already cancelled and not in the read-only archive */}
            {!archiveMode && row.original.orderStatus !== 'cancelled' && (
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 rounded-full bg-yellow-100 text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50"
                    aria-label={`Cancel order`}
                    onClick={handleCancel}
                >
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 10h4l3 9 4-18 3 9h4"/></svg>
                </Button>
            )}
        </div>
    );
}

export default OrderTableRowActions;
