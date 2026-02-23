"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import axios from "@/utils/axios/axios";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useSearchParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Package,
  Search,
  Truck,
  CheckCircle2,
  XCircle,
  Clock,
  MapPin,
  CreditCard,
  Calendar,
} from "lucide-react";
import Image from "next/image";
import { currencyFormatBDT } from "@/lib/all_utils";

const trackingSchema = z.object({
  trackingCode: z
    .string()
    .min(8, "Tracking code must be at least 8 characters"),
});

type TrackingFormValues = z.infer<typeof trackingSchema>;

interface OrderItem {
  productName: string;
  quantity: number;
  selectedColor?: string;
  subtotal: number;
  product?: {
    name: string;
    price: number;
    images?: string[];
  };
}

interface TrackingData {
  order: {
    orderNumber: string;
    trackingCode: string;
    orderStatus: string;
    paymentStatus: string;
    paymentMethod: string;
    shippingType: string;
    city: string;
    subtotal: number;
    discount: number;
    deliveryCharge: number;
    additionalCharge: number;
    totalPayable: number;
    createdAt: string;
    deliveredAt?: string;
    customerName: string;
    phone: string;
  };
  items: OrderItem[];
}

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "pending":
      return "bg-yellow-100 text-yellow-800 border-yellow-300";
    case "confirmed":
      return "bg-blue-100 text-blue-800 border-blue-300";
    case "processing":
      return "bg-purple-100 text-purple-800 border-purple-300";
    case "shipped":
      return "bg-indigo-100 text-indigo-800 border-indigo-300";
    case "delivered":
      return "bg-green-100 text-green-800 border-green-300";
    case "cancelled":
      return "bg-red-100 text-red-800 border-red-300";
    default:
      return "bg-stone-100 text-stone-800 border-stone-300";
  }
};

const getPaymentStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "paid":
      return "bg-green-100 text-green-800 border-green-300";
    case "pending":
      return "bg-yellow-100 text-yellow-800 border-yellow-300";
    case "failed":
      return "bg-red-100 text-red-800 border-red-300";
    case "refunded":
      return "bg-orange-100 text-orange-800 border-orange-300";
    default:
      return "bg-stone-100 text-stone-800 border-stone-300";
  }
};

const getStatusIcon = (status: string) => {
  switch (status.toLowerCase()) {
    case "pending":
      return <Clock className="w-5 h-5" />;
    case "confirmed":
    case "processing":
      return <Package className="w-5 h-5" />;
    case "shipped":
      return <Truck className="w-5 h-5" />;
    case "delivered":
      return <CheckCircle2 className="w-5 h-5" />;
    case "cancelled":
      return <XCircle className="w-5 h-5" />;
    default:
      return <Package className="w-5 h-5" />;
  }
};

const OrderTimeline = ({ status }: { status: string }) => {
  const statuses = [
    { key: "pending", label: "Pending" },
    { key: "confirmed", label: "Confirmed" },
    { key: "processing", label: "Processing" },
    { key: "shipped", label: "Shipped" },
    { key: "delivered", label: "Delivered" },
  ];

  const currentIndex = statuses.findIndex(
    (s) => s.key === status.toLowerCase()
  );
  const progressPercentage = (currentIndex / (statuses.length - 1)) * 100;

  return (
    <div className="relative">
      <div className="flex items-center justify-between">
        {statuses.map((s, index) => (
          <div key={s.key} className="flex flex-col items-center flex-1">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                index <= currentIndex
                  ? "bg-green-500 border-green-500 text-white"
                  : "bg-white border-stone-300 text-stone-400"
              }`}
            >
              {index <= currentIndex ? (
                <CheckCircle2 className="w-5 h-5" />
              ) : (
                <div className="w-3 h-3 rounded-full bg-stone-300" />
              )}
            </div>
            <p
              className={`text-xs mt-2 text-center ${
                index <= currentIndex
                  ? "text-stone-900 font-medium"
                  : "text-stone-400"
              }`}
            >
              {s.label}
            </p>
          </div>
        ))}
      </div>
      <div className="absolute top-5 left-0 right-0 h-0.5 bg-stone-200 -z-10">
        <div
          className={`h-full bg-green-500 transition-all duration-500 ${
            currentIndex === 0
              ? "w-0"
              : currentIndex === 1
              ? "w-1/4"
              : currentIndex === 2
              ? "w-2/4"
              : currentIndex === 3
              ? "w-3/4"
              : "w-full"
          }`}
        />
      </div>
    </div>
  );
};

export default function TrackOrderClient() {
  const [trackingData, setTrackingData] = useState<TrackingData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const searchParams = useSearchParams();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<TrackingFormValues>({
    resolver: zodResolver(trackingSchema),
  });

  const fetchOrderByTrackingCode = async (trackingCode: string) => {
    setIsLoading(true);
    setTrackingData(null);

    try {
      const response = await axios.get(`/orders/track/${trackingCode}`);

      if (response.data.success) {
        setTrackingData(response.data.data);
        toast.success("Order found!");
      } else {
        toast.error(response.data.message || "Order not found");
      }
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.message ||
        "Order not found with this tracking code";
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-fetch order if tracking code is in URL
  useEffect(() => {
    const trackingCode = searchParams.get('code');
    if (trackingCode) {
      setValue('trackingCode', trackingCode);
      fetchOrderByTrackingCode(trackingCode);
    }
  }, [searchParams, setValue]);

  const onSubmit = async (data: TrackingFormValues) => {
    await fetchOrderByTrackingCode(data.trackingCode);
  };

  return (
    <div className="min-h-screen bg-stone-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Success Banner (shown when redirected from checkout) */}
        {searchParams.get('code') && !isLoading && trackingData && (
          <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 rounded-r-lg shadow-sm animate-in fade-in duration-500">
            <div className="flex items-start">
              <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div className="ml-3">
                <h3 className="text-sm font-semibold text-green-900">
                  Order Placed Successfully! 🎉
                </h3>
                <p className="text-sm text-green-700 mt-1">
                  Your order has been confirmed. A confirmation email has been sent to your email address.
                  You can track your order status below.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <Truck className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-stone-900 mb-2">
            Track Your Order
          </h1>
          <p className="text-stone-600">
            Enter your tracking code to see order details and delivery status
          </p>
        </div>

        {/* Search Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Enter Tracking Code</CardTitle>
            <CardDescription>
              Your tracking code was sent to your email after placing the order
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="flex gap-3">
              <div className="flex-1">
                <Input
                  {...register("trackingCode")}
                  placeholder="e.g., 2025111412345"
                  className="text-base"
                  disabled={isLoading}
                />
                {errors.trackingCode && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.trackingCode.message}
                  </p>
                )}
              </div>
              <Button
                type="submit"
                disabled={isLoading}
                className="min-w-[100px]"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Tracking...
                  </div>
                ) : (
                  <>
                    <Search className="w-4 h-4 mr-2" />
                    Track
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Results Section */}
        {trackingData && (
          <div className="space-y-6 animate-in fade-in duration-500">
            {/* Order Status Card */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {getStatusIcon(trackingData.order.orderStatus)}
                      Order Status
                    </CardTitle>
                    <CardDescription className="mt-1">
                      Order #{trackingData.order.orderNumber}
                    </CardDescription>
                  </div>
                  <Badge
                    className={`${getStatusColor(
                      trackingData.order.orderStatus
                    )} border font-semibold`}
                  >
                    {trackingData.order.orderStatus.toUpperCase()}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Timeline */}
                <OrderTimeline status={trackingData.order.orderStatus} />

                <Separator />

                {/* Order Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-blue-50 rounded">
                      <Package className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs text-stone-500">Tracking Code</p>
                      <p className="text-sm font-semibold text-stone-900">
                        {trackingData.order.trackingCode}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-green-50 rounded">
                      <CreditCard className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-xs text-stone-500">Payment Status</p>
                      <Badge
                        className={`${getPaymentStatusColor(
                          trackingData.order.paymentStatus
                        )} border text-xs mt-1`}
                      >
                        {trackingData.order.paymentStatus.toUpperCase()}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-purple-50 rounded">
                      <MapPin className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-xs text-stone-500">Shipping To</p>
                      <p className="text-sm font-semibold text-stone-900">
                        {trackingData.order.city}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-orange-50 rounded">
                      <Calendar className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-xs text-stone-500">Order Date</p>
                      <p className="text-sm font-semibold text-stone-900">
                        {new Date(
                          trackingData.order.createdAt
                        ).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Customer Info */}
                <div className="bg-stone-50 p-4 rounded-lg">
                  <p className="text-xs text-stone-500 mb-2">
                    Customer Information
                  </p>
                  <div className="space-y-1">
                    <p className="text-sm">
                      <span className="font-medium">Name:</span>{" "}
                      {trackingData.order.customerName}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Phone:</span>{" "}
                      {trackingData.order.phone}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Order Items Card */}
            <Card>
              <CardHeader>
                <CardTitle>Order Items</CardTitle>
                <CardDescription>
                  {trackingData.items.length} item(s) in this order
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {trackingData.items.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-4 pb-4 border-b last:border-b-0"
                    >
                      {item.product?.images?.[0] && (
                        <div className="relative w-16 h-16 bg-stone-100 rounded overflow-hidden flex-shrink-0">
                          <Image
                            src={item.product.images[0]}
                            alt={item.productName}
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-stone-900 truncate">
                          {item.productName}
                        </h4>
                        {item.selectedColor && (
                          <p className="text-xs text-stone-500">
                            Color: {item.selectedColor}
                          </p>
                        )}
                        <p className="text-xs text-stone-500">
                          Quantity: {item.quantity}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-stone-900">
                          {currencyFormatBDT(item.subtotal)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <Separator className="my-4" />

                {/* Order Summary */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-stone-600">Subtotal</span>
                    <span className="font-medium">
                      {currencyFormatBDT(trackingData.order.subtotal)}
                    </span>
                  </div>
                  {trackingData.order.discount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-stone-600">Discount</span>
                      <span className="font-medium text-green-600">
                        -{currencyFormatBDT(trackingData.order.discount)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-stone-600">Delivery Charge</span>
                    <span className="font-medium">
                      {currencyFormatBDT(trackingData.order.deliveryCharge)}
                    </span>
                  </div>
                  {trackingData.order.additionalCharge > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-stone-600">Additional Charge</span>
                      <span className="font-medium">
                        {currencyFormatBDT(trackingData.order.additionalCharge)}
                      </span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between text-base font-bold">
                    <span>Total Payable</span>
                    <span className="text-blue-600">
                      {currencyFormatBDT(trackingData.order.totalPayable)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
