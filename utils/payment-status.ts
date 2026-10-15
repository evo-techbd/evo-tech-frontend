import type { BadgeProps } from "@/components/ui/badge";

type BadgeVariant = NonNullable<BadgeProps["variant"]>;

// Single source of truth for how a payment status looks anywhere on the site
// (admin orders, 3D printing sales, payment history, customer order pages).
// Render with <Badge variant={getPaymentStatusVariant(status)} />; pages that
// need a different shape (e.g. a rounded pill) override only the shape classes.
const PAYMENT_STATUS_STYLES: Record<
  string,
  { label: string; variant: BadgeVariant }
> = {
  paid: { label: "Paid", variant: "success" },
  partial: { label: "Partial", variant: "inprogress" },
  pending: { label: "Pending", variant: "warning" },
  refunded: { label: "Refunded", variant: "neutral" },
  failed: { label: "Failed", variant: "failed" },
  cancelled: { label: "Cancelled", variant: "failed" },
};

export const getPaymentStatusVariant = (status?: string | null): BadgeVariant =>
  PAYMENT_STATUS_STYLES[(status || "").toLowerCase()]?.variant ?? "outline";

export const getPaymentStatusLabel = (status?: string | null): string => {
  if (!status) return "N/A";
  return (
    PAYMENT_STATUS_STYLES[status.toLowerCase()]?.label ??
    status.charAt(0).toUpperCase() + status.slice(1)
  );
};
