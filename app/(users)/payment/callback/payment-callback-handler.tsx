"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CheckCircle2, XCircle, Loader2, AlertCircle } from "lucide-react";
import axios from "@/utils/axios/axios";
import axiosErrorLogger from "@/components/error/axios_error";

interface PaymentCallbackHandlerProps {
  searchParams: {
    paymentID?: string;
    status?: string;
    signature?: string;
  };
}

const PaymentCallbackHandler = ({
  searchParams,
}: PaymentCallbackHandlerProps) => {
  const router = useRouter();
  const [processing, setProcessing] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState<
    "success" | "failure" | "cancelled" | null
  >(null);
  const [message, setMessage] = useState("");
  const [orderId, setOrderId] = useState<string | null>(null);

  useEffect(() => {
    const processPayment = async () => {
      const { paymentID, status } = searchParams;

      // console.log("🔄 Payment callback received:", { paymentID, status });

      // Check if payment was cancelled
      if (status === "cancel" || status === "cancelled") {
        setPaymentStatus("cancelled");
        setMessage(
          "Payment was cancelled. You can try again or choose a different payment method."
        );
        setProcessing(false);
        toast.error("Payment cancelled");
        return;
      }

      // Check if payment failed
      if (status === "failure" || status === "fail") {
        setPaymentStatus("failure");
        setMessage(
          "Payment failed. Please try again or choose a different payment method."
        );
        setProcessing(false);
        toast.error("Payment failed");
        return;
      }

      // If we have a paymentID and status is success, execute the payment
      if (paymentID && status === "success") {
        try {
          // console.log("✅ Payment successful, executing payment:", paymentID);

          // Execute the payment on backend
          const executeResponse = await axios
            .post("/payment/bkash/execute", {
              paymentID: paymentID,
            })
            .then((res) => {
              // console.log("✅ Payment execution response:", res.data);
              return res.data;
            })
            .catch((error: any) => {
              // console.error("❌ Payment execution failed:", error);
              axiosErrorLogger({ error });
              return null;
            });

          if (executeResponse && executeResponse.success) {
            setPaymentStatus("success");
            setMessage(
              "Payment completed successfully! Redirecting to your order..."
            );
            toast.success("Payment successful!");

            // Get order ID from response if available
            const orderIdFromResponse = executeResponse.data?.orderId;
            if (orderIdFromResponse) {
              setOrderId(orderIdFromResponse);

              // Redirect to order page after 2 seconds
              setTimeout(() => {
                router.push(`/order/${orderIdFromResponse}`);
              }, 2000);
            } else {
              // Redirect to orders page if no specific order ID
              setTimeout(() => {
                router.push("/orders");
              }, 2000);
            }
          } else {
            setPaymentStatus("failure");
            setMessage(
              "Payment execution failed. Please contact support if the amount was deducted."
            );
            toast.error("Payment execution failed");
          }
        } catch (error) {
          console.error("❌ Payment processing error:", error);
          setPaymentStatus("failure");
          setMessage(
            "An error occurred while processing your payment. Please contact support."
          );
          toast.error("Payment processing error");
        } finally {
          setProcessing(false);
        }
      } else {
        // Invalid callback parameters
        setPaymentStatus("failure");
        setMessage("Invalid payment callback. Please try again.");
        setProcessing(false);
        toast.error("Invalid payment callback");
      }
    };

    processPayment();
  }, [searchParams, router]);

  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-gradient-to-br from-stone-50 to-stone-100 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8">
        {processing ? (
          <div className="flex flex-col items-center gap-6">
            <div className="relative">
              <Loader2 className="w-20 h-20 text-blue-600 animate-spin" />
              <div className="absolute inset-0 w-20 h-20 rounded-full bg-blue-600/10 animate-ping" />
            </div>
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-stone-900">
                Processing Payment
              </h2>
              <p className="text-stone-600">
                Please wait while we verify your payment...
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-6">
            {/* Status Icon */}
            {paymentStatus === "success" && (
              <div className="relative">
                <CheckCircle2 className="w-20 h-20 text-green-600" />
                <div className="absolute inset-0 w-20 h-20 rounded-full bg-green-600/10 animate-pulse" />
              </div>
            )}
            {paymentStatus === "failure" && (
              <div className="relative">
                <XCircle className="w-20 h-20 text-red-600" />
                <div className="absolute inset-0 w-20 h-20 rounded-full bg-red-600/10 animate-pulse" />
              </div>
            )}
            {paymentStatus === "cancelled" && (
              <div className="relative">
                <AlertCircle className="w-20 h-20 text-orange-600" />
                <div className="absolute inset-0 w-20 h-20 rounded-full bg-orange-600/10 animate-pulse" />
              </div>
            )}

            {/* Status Message */}
            <div className="text-center space-y-3">
              <h2
                className={`text-2xl font-bold ${
                  paymentStatus === "success"
                    ? "text-green-600"
                    : paymentStatus === "cancelled"
                    ? "text-orange-600"
                    : "text-red-600"
                }`}
              >
                {paymentStatus === "success" && "Payment Successful!"}
                {paymentStatus === "failure" && "Payment Failed"}
                {paymentStatus === "cancelled" && "Payment Cancelled"}
              </h2>
              <p className="text-stone-600 text-sm">{message}</p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col w-full gap-3 mt-4">
              {paymentStatus === "success" && orderId && (
                <button
                  onClick={() => router.push(`/order/${orderId}`)}
                  className="w-full px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors duration-200"
                >
                  View Order
                </button>
              )}

              {(paymentStatus === "failure" ||
                paymentStatus === "cancelled") && (
                <>
                  <button
                    onClick={() => router.push("/checkout")}
                    className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors duration-200"
                  >
                    Try Again
                  </button>
                  <button
                    onClick={() => router.push("/")}
                    className="w-full px-6 py-3 bg-stone-200 hover:bg-stone-300 text-stone-900 font-semibold rounded-lg transition-colors duration-200"
                  >
                    Go to Home
                  </button>
                </>
              )}
            </div>

            {/* Payment ID Reference */}
            {searchParams.paymentID && (
              <div className="w-full mt-4 p-4 bg-stone-50 rounded-lg border border-stone-200">
                <p className="text-xs text-stone-500 text-center">
                  Reference: {searchParams.paymentID}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentCallbackHandler;
