"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import axios from "@/utils/axios/axios";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/all_utils";
import { getPaymentStatusVariant } from "@/utils/payment-status";

export type PaymentLogEntityType = "order" | "printing-sale";

export type PaymentLogEvent =
    | "created"
    | "status_change"
    | "payment_received"
    | "payment_failed"
    | "refund"
    | "amount_adjusted";

export interface PaymentLog {
    _id: string;
    entityType: PaymentLogEntityType;
    entityId: string;
    entityLabel?: string;
    event: PaymentLogEvent;
    fromStatus?: string;
    toStatus?: string;
    amount?: number;
    amountPaidBefore?: number;
    amountPaidAfter?: number;
    method?: "manual" | "bkash" | "eps" | "cod" | string;
    transactionId?: string;
    source: "admin" | "gateway" | "system";
    performedBy?: {
        _id: string;
        firstName?: string;
        lastName?: string;
        email?: string;
    } | null;
    note?: string;
    createdAt: string;
}

interface PaymentHistoryProps {
    entityType: PaymentLogEntityType;
    entityId?: string;
    /** Change this value to force a refetch (e.g. after a payment update). */
    refreshKey?: unknown;
    /** "card" wraps the timeline in a Card; "section" renders a light bordered block for modals. */
    variant?: "card" | "section";
    title?: string;
    className?: string;
    titleClassName?: string;
}

const methodLabels: Record<string, string> = {
    manual: "Manual",
    bkash: "bKash",
    eps: "Online Payment (EPS)",
    cod: "Cash on Delivery",
    cash_on_delivery: "Cash on Delivery",
    cop: "Cash on Pickup",
    nagad: "Nagad",
    bank_transfer: "Bank Transfer",
    credit_card: "Credit Card",
};

const formatBDT = (value: number) =>
    `${value < 0 ? "-" : ""}BDT ${new Intl.NumberFormat("en-US", {
        maximumFractionDigits: 2,
    }).format(Math.abs(value))}`;

const getEventLabel = (log: PaymentLog) => {
    switch (log.event) {
        case "created":
            return "Created";
        case "status_change":
            return log.fromStatus || log.toStatus
                ? `Status: ${log.fromStatus || "—"} → ${log.toStatus || "—"}`
                : "Status changed";
        case "payment_received":
            return "Payment received";
        case "payment_failed":
            return "Payment failed";
        case "refund":
            return "Refund";
        case "amount_adjusted":
            return "Amount adjusted";
        default:
            return String(log.event).replace(/_/g, " ");
    }
};

const getDotClass = (event: PaymentLogEvent) => {
    switch (event) {
        case "payment_received":
            return "bg-emerald-500";
        case "payment_failed":
            return "bg-rose-500";
        case "refund":
            return "bg-orange-400";
        case "amount_adjusted":
            return "bg-sky-500";
        default:
            return "bg-stone-400";
    }
};

const getActorLabel = (log: PaymentLog) => {
    const performer = log.performedBy;
    if (performer) {
        const name = [performer.firstName, performer.lastName]
            .filter(Boolean)
            .join(" ")
            .trim();
        if (name) return `by ${name}`;
        if (performer.email) return `by ${performer.email}`;
    }
    if (log.source === "gateway") return "via gateway";
    if (log.source === "system") return "System";
    return "by Admin";
};

const fetchPaymentLogs = async (
    entityType: PaymentLogEntityType,
    entityId: string,
): Promise<PaymentLog[]> => {
    if (entityType === "printing-sale") {
        const res = await axios.get(
            `/admin/printing-sales/${encodeURIComponent(entityId)}/payment-logs`,
        );
        return Array.isArray(res.data?.data) ? res.data.data : [];
    }

    const response = await fetch(
        `/api/admin/orders/${encodeURIComponent(entityId)}/payment-logs`,
        {
            method: "GET",
            credentials: "include",
            cache: "no-store",
        },
    );

    if (!response.ok) {
        throw new Error("Failed to fetch payment history");
    }

    const payload = await response.json();
    return Array.isArray(payload?.data) ? payload.data : [];
};

export function PaymentHistory({
    entityType,
    entityId,
    refreshKey,
    variant = "card",
    title = "Payment History",
    className,
    titleClassName,
}: PaymentHistoryProps) {
    const [logs, setLogs] = useState<PaymentLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!entityId) {
            setLogs([]);
            setLoading(false);
            return;
        }

        let cancelled = false;
        setLoading(true);
        setError(null);

        fetchPaymentLogs(entityType, entityId)
            .then((data) => {
                if (!cancelled) setLogs(data);
            })
            .catch(() => {
                if (!cancelled) setError("Failed to load payment history");
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, [entityType, entityId, refreshKey]);

    const body = (
        <>
            {loading && (
                <div className="flex justify-center items-center py-6">
                    <div className="size-5 border border-t-stone-700 border-b-stone-300 animate-spin bg-gradient-to-b from-stone-700 to-stone-300" />
                </div>
            )}

            {!loading && error && (
                <p className="text-xs text-red-500 py-4 text-center">{error}</p>
            )}

            {!loading && !error && logs.length === 0 && (
                <p className="text-xs text-stone-500 py-4 text-center">
                    No payment activity recorded yet
                </p>
            )}

            {!loading && !error && logs.length > 0 && (
                <ol className="relative border-l border-stone-200 ml-1.5 space-y-4">
                    {logs.map((log) => {
                        const hasPaidChange =
                            typeof log.amountPaidBefore === "number" &&
                            typeof log.amountPaidAfter === "number";

                        return (
                            <li key={log._id} className="ml-4">
                                <span
                                    className={cn(
                                        "absolute -left-[5px] mt-1.5 size-2.5 rounded-full ring-2 ring-white",
                                        getDotClass(log.event),
                                    )}
                                />
                                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                                    <span className="text-xs font-semibold text-stone-800 capitalize">
                                        {getEventLabel(log)}
                                    </span>
                                    {log.toStatus && (
                                        <Badge
                                            variant={getPaymentStatusVariant(log.toStatus)}
                                            className="capitalize leading-none py-0.5 font-medium"
                                        >
                                            {log.toStatus}
                                        </Badge>
                                    )}
                                    {typeof log.amount === "number" && log.amount !== 0 && (
                                        <span
                                            className={cn(
                                                "text-xs font-medium",
                                                log.amount < 0 || log.event === "refund"
                                                    ? "text-red-700"
                                                    : "text-green-700",
                                            )}
                                        >
                                            {formatBDT(log.amount)}
                                        </span>
                                    )}
                                </div>

                                <p className="text-[0.6875rem] text-stone-500 mt-0.5">
                                    {log.createdAt
                                        ? format(new Date(log.createdAt), "dd MMM yyyy, hh:mm a")
                                        : "N/A"}
                                    {" · "}
                                    {getActorLabel(log)}
                                </p>

                                {(log.method || log.transactionId) && (
                                    <p className="text-[0.6875rem] text-stone-600 mt-0.5">
                                        {log.method && (
                                            <span>
                                                Method: {methodLabels[log.method] || log.method}
                                            </span>
                                        )}
                                        {log.method && log.transactionId && " · "}
                                        {log.transactionId && (
                                            <span>
                                                Txn: <span className="font-mono">{log.transactionId}</span>
                                            </span>
                                        )}
                                    </p>
                                )}

                                {hasPaidChange && (
                                    <p className="text-[0.6875rem] text-stone-600 mt-0.5">
                                        Paid: {formatBDT(log.amountPaidBefore as number)} →{" "}
                                        {formatBDT(log.amountPaidAfter as number)}
                                    </p>
                                )}

                                {log.note && (
                                    <p className="text-[0.6875rem] text-stone-600 italic mt-0.5 whitespace-pre-line">
                                        {log.note}
                                    </p>
                                )}
                            </li>
                        );
                    })}
                </ol>
            )}
        </>
    );

    if (variant === "section") {
        return (
            <div className={cn("rounded-md border border-stone-200 p-3", className)}>
                <h4 className={cn("text-sm font-semibold text-stone-800 mb-3", titleClassName)}>
                    {title}
                </h4>
                {body}
            </div>
        );
    }

    return (
        <Card className={cn("bg-stone-50", className)}>
            <CardHeader className="pb-3">
                <CardTitle className={cn("text-base text-stone-800", titleClassName)}>
                    {title}
                </CardTitle>
            </CardHeader>
            <CardContent>{body}</CardContent>
        </Card>
    );
}

export default PaymentHistory;
