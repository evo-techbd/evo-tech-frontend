"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  Check,
  X,
  Clock,
  Loader2,
  Copy,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import axios from "@/utils/axios/axios";
import axiosErrorLogger from "@/components/error/axios_error";

type ViewState = "checking" | "success" | "failed" | "cancelled" | "pending";

interface EpsPaymentResultProps {
  // Set by the backend after verifying with EPS: success | failed |
  // cancelled | pending | error, or init_failed from checkout.
  initialStatus: string;
  orderId?: string;
  trackingCode?: string;
}

const VIEWS: Record<
  ViewState,
  {
    title: string;
    message: string;
    statusLabel: string;
    Icon: LucideIcon;
    // Icon badge + status pill colours
    tone: string;
  }
> = {
  checking: {
    title: "Confirming your payment",
    message: "Hold on a moment while we check with the payment gateway.",
    statusLabel: "Checking",
    Icon: Loader2,
    tone: "bg-stone-100 text-stone-600",
  },
  success: {
    title: "Payment successful",
    message:
      "We've received your payment and your order is confirmed. Thank you for shopping with us.",
    statusLabel: "Paid",
    Icon: Check,
    tone: "bg-emerald-50 text-emerald-600",
  },
  failed: {
    title: "Payment failed",
    message:
      "Your payment couldn't be completed. Your order is saved, so you can try again.",
    statusLabel: "Failed",
    Icon: X,
    tone: "bg-rose-50 text-rose-600",
  },
  cancelled: {
    title: "Payment cancelled",
    message:
      "You left the payment page before paying. Your order is saved, so you can pay any time.",
    statusLabel: "Cancelled",
    Icon: X,
    tone: "bg-stone-100 text-stone-600",
  },
  pending: {
    title: "Awaiting confirmation",
    message:
      "We haven't heard back from the payment gateway yet. If money was deducted, it will show on your order shortly.",
    statusLabel: "Pending",
    Icon: Clock,
    tone: "bg-amber-50 text-amber-600",
  },
};

const toViewState = (status: string): ViewState => {
  if (status === "success") return "success";
  if (status === "cancelled") return "cancelled";
  if (status === "pending") return "checking";
  return "failed";
};

const primaryButton =
  "flex items-center justify-center w-full h-11 px-4 rounded-[6px] text-[13px] sm:text-[14px] font-[500] text-stone-100 bg-stone-800 hover:bg-stone-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors duration-100";
const secondaryButton =
  "flex items-center justify-center w-full h-11 px-4 rounded-[6px] text-[13px] sm:text-[14px] font-[500] text-stone-700 bg-white border border-stone-300 hover:bg-stone-50 transition-colors duration-100";

const EpsPaymentResult = ({
  initialStatus,
  orderId,
  trackingCode,
}: EpsPaymentResultProps) => {
  const [view, setView] = useState<ViewState>(toViewState(initialStatus));
  const [isRetrying, setIsRetrying] = useState(false);

  // The redirect couldn't confirm either way: ask the backend to re-check
  useEffect(() => {
    if (view !== "checking") return;
    if (!orderId) {
      setView("pending");
      return;
    }

    axios
      .post("/payment/eps/verify", { orderId })
      .then((res) => {
        const { paymentStatus, latestOutcome } = res.data?.data ?? {};
        if (paymentStatus === "paid" || latestOutcome === "success") {
          setView("success");
        } else if (latestOutcome === "failed") {
          setView("failed");
        } else if (latestOutcome === "cancelled") {
          setView("cancelled");
        } else {
          setView("pending");
        }
      })
      .catch((error) => {
        axiosErrorLogger({ error });
        setView("pending");
      });
  }, [view, orderId]);

  const handleRetry = async () => {
    if (!orderId) return;
    setIsRetrying(true);
    try {
      const res = await axios.post("/payment/eps/initiate", { orderId });
      const redirectURL = res.data?.data?.redirectURL;
      if (redirectURL) {
        window.location.href = redirectURL;
        return;
      }
      toast.error("Couldn't start the payment. Please try again.");
    } catch (error: any) {
      axiosErrorLogger({ error });
      toast.error(
        error?.response?.data?.message ||
          "Couldn't start the payment. Please try again.",
      );
    }
    setIsRetrying(false);
  };

  const copyTrackingCode = async () => {
    if (!trackingCode) return;
    try {
      await navigator.clipboard.writeText(trackingCode);
      toast.success("Tracking code copied");
    } catch {
      toast.error("Couldn't copy. Please copy it manually.");
    }
  };

  const trackOrderHref = trackingCode
    ? `/track-order?code=${encodeURIComponent(trackingCode)}`
    : "/track-order";
  const canRetry =
    !!orderId && (view === "failed" || view === "cancelled" || view === "pending");
  const { title, message, statusLabel, Icon, tone } = VIEWS[view];

  return (
    <div className="flex justify-center w-full min-h-[70vh] px-4 py-14 sm:py-20 font-inter bg-stone-50">
      <div className="flex flex-col w-full max-w-[420px] h-fit animate-in fade-in duration-300">
        <div className="flex flex-col w-full p-6 sm:p-8 bg-white border border-stone-200 rounded-[8px]">
          <div
            className={`flex items-center justify-center w-12 h-12 rounded-full ${tone}`}
          >
            <Icon
              className={`w-6 h-6 ${view === "checking" ? "animate-spin" : ""}`}
              strokeWidth={2.25}
            />
          </div>

          <h1 className="mt-5 text-[18px] sm:text-[20px] leading-7 font-[600] tracking-tight text-stone-900">
            {title}
          </h1>
          <p className="mt-1.5 text-[13px] sm:text-[14px] leading-6 text-stone-500">
            {message}
          </p>

          {view !== "checking" && (
            <>
              <dl className="flex flex-col w-full mt-6 border-t border-stone-200 text-[13px] leading-5">
                <div className="flex items-center justify-between py-3 border-b border-stone-100">
                  <dt className="text-stone-500">Payment status</dt>
                  <dd>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[12px] font-[500] ${tone}`}
                    >
                      {statusLabel}
                    </span>
                  </dd>
                </div>
                {trackingCode && (
                  <div className="flex items-center justify-between py-3 border-b border-stone-100">
                    <dt className="text-stone-500">Tracking code</dt>
                    <dd className="flex items-center gap-1.5">
                      <span className="font-[600] text-stone-800 tabular-nums">
                        {trackingCode}
                      </span>
                      <button
                        type="button"
                        onClick={copyTrackingCode}
                        aria-label="Copy tracking code"
                        className="p-1 rounded-[4px] text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors duration-100"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </dd>
                  </div>
                )}
              </dl>

              <div className="flex flex-col w-full mt-6 gap-2.5">
                {canRetry ? (
                  <>
                    <button
                      type="button"
                      onClick={handleRetry}
                      disabled={isRetrying}
                      className={primaryButton}
                    >
                      {isRetrying ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Redirecting...
                        </>
                      ) : (
                        "Try payment again"
                      )}
                    </button>
                    <Link href={trackOrderHref} className={secondaryButton}>
                      Track order
                    </Link>
                  </>
                ) : (
                  <>
                    <Link href={trackOrderHref} className={primaryButton}>
                      Track order
                    </Link>
                    <Link href="/products-and-accessories" className={secondaryButton}>
                      Continue shopping
                    </Link>
                  </>
                )}
              </div>
            </>
          )}
        </div>

        <p className="flex items-center justify-center mt-4 gap-1.5 text-[12px] text-stone-400">
          <ShieldCheck className="w-3.5 h-3.5" />
          Payments are processed securely by EPS
        </p>
      </div>
    </div>
  );
};

export default EpsPaymentResult;
