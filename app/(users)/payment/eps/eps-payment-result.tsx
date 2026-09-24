"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CheckCircle2, XCircle, Loader2, AlertCircle } from "lucide-react";
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

const MESSAGES: Record<Exclude<ViewState, "checking">, string> = {
  success:
    "Your payment has been received and your order is confirmed. Thank you!",
  failed:
    "Your payment could not be completed. Your order is saved — you can try paying again.",
  cancelled:
    "You cancelled the payment. Your order is saved — you can complete payment any time.",
  pending:
    "We haven't received confirmation from the payment gateway yet. If money was deducted, it will be reflected on your order shortly.",
};

const toViewState = (status: string): ViewState => {
  if (status === "success") return "success";
  if (status === "cancelled") return "cancelled";
  if (status === "pending") return "checking";
  return "failed";
};

const EpsPaymentResult = ({
  initialStatus,
  orderId,
  trackingCode,
}: EpsPaymentResultProps) => {
  const router = useRouter();
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

  const goToTracking = () =>
    router.push(
      trackingCode
        ? `/track-order?code=${encodeURIComponent(trackingCode)}`
        : "/track-order",
    );

  const canRetry =
    !!orderId && (view === "failed" || view === "cancelled" || view === "pending");

  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-gradient-to-br from-stone-50 to-stone-100 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8">
        {view === "checking" ? (
          <div className="flex flex-col items-center gap-6">
            <Loader2 className="w-20 h-20 text-blue-600 animate-spin" />
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-stone-900">
                Confirming Payment
              </h2>
              <p className="text-stone-600">
                Please wait while we confirm your payment...
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-6">
            {view === "success" && (
              <CheckCircle2 className="w-20 h-20 text-green-600" />
            )}
            {view === "failed" && <XCircle className="w-20 h-20 text-red-600" />}
            {(view === "cancelled" || view === "pending") && (
              <AlertCircle className="w-20 h-20 text-orange-600" />
            )}

            <div className="text-center space-y-3">
              <h2
                className={`text-2xl font-bold ${
                  view === "success"
                    ? "text-green-600"
                    : view === "failed"
                      ? "text-red-600"
                      : "text-orange-600"
                }`}
              >
                {view === "success" && "Payment Successful!"}
                {view === "failed" && "Payment Failed"}
                {view === "cancelled" && "Payment Cancelled"}
                {view === "pending" && "Payment Not Confirmed Yet"}
              </h2>
              <p className="text-stone-600 text-sm">{MESSAGES[view]}</p>
              {trackingCode && (
                <p className="text-stone-500 text-xs">
                  {`Tracking code: `}
                  <span className="font-semibold text-stone-700">
                    {trackingCode}
                  </span>
                </p>
              )}
            </div>

            <div className="flex flex-col w-full gap-3 mt-4">
              {canRetry && (
                <button
                  onClick={handleRetry}
                  disabled={isRetrying}
                  className="w-full px-6 py-3 bg-stone-900 hover:bg-stone-800 disabled:opacity-60 text-white font-semibold rounded-lg transition-colors duration-200"
                >
                  {isRetrying ? "Redirecting..." : "Pay Now"}
                </button>
              )}
              <button
                onClick={goToTracking}
                className={`w-full px-6 py-3 font-semibold rounded-lg transition-colors duration-200 ${
                  view === "success"
                    ? "bg-green-600 hover:bg-green-700 text-white"
                    : "bg-stone-100 hover:bg-stone-200 text-stone-800"
                }`}
              >
                Track Order
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EpsPaymentResult;
