"use client";

import { OrderUpdateForm } from "@/components/admin/orders/order-update-form";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { currencyFormatBDT } from "@/lib/all_utils";
import { OrderWithItemsType } from "@/schemas/admin/sales/orderSchema";
import { useEffect, useState } from "react";

const pickupPoints: { [key: string]: string } = {
  "101": "65/15, Shwapnokunzo, Tonartek, Vashantek, Dhaka Cantt., Dhaka-1206",
};

const shippingTypes: { [key: string]: string } = {
  home_delivery: "Home Delivery",
  pickup_point: "Pickup Point",
  express_delivery: "Express Delivery",
};

const paymentMethods: { [key: string]: string } = {
  cash_on_delivery: "Cash on Delivery",
  bkash: "bKash",
  nagad: "Nagad",
  credit_card: "Credit Card",
  bank_transfer: "Bank Transfer",
};

const getPaymentStatusBadge = (status: string) => {
  const statusConfig = {
    paid: { variant: "success" as const, text: "Paid" },
    partial: { variant: "warning" as const, text: "Partial" },
    pending: { variant: "failed" as const, text: "Pending" },
    failed: { variant: "failed" as const, text: "Failed" },
    refunded: { variant: "warning" as const, text: "Refunded" },
  };

  const config = statusConfig[status as keyof typeof statusConfig] || {
    variant: "outline" as const,
    text: status,
  };

  return (
    <Badge
      variant={config.variant}
      className="text-[0.625rem] leading-none py-0.5 font-medium capitalize"
    >
      {config.text}
    </Badge>
  );
};

const getOrderStatusBadge = (status: string) => {
  const statusConfig = {
    pending: { variant: "customdefault" as const, text: "Pending" },
    confirmed: { variant: "inprogress" as const, text: "Confirmed" },
    processing: { variant: "inprogress" as const, text: "Processing" },
    shipped: { variant: "warning" as const, text: "Shipped" },
    delivered: { variant: "success" as const, text: "Delivered" },
    cancelled: { variant: "failed" as const, text: "Cancelled" },
  };

  const config = statusConfig[status as keyof typeof statusConfig] || {
    variant: "outline" as const,
    text: status,
  };

  return (
    <Badge
      variant={config.variant}
      className="text-[0.625rem] leading-none py-0.5 font-medium capitalize"
    >
      {config.text}
    </Badge>
  );
};

const OrderInfo = ({ orderData }: { orderData: OrderWithItemsType }) => {
  const [paymentStatus, setPaymentStatus] = useState(orderData.paymentStatus);
  const [orderStatus, setOrderStatus] = useState(orderData.orderStatus);
  const [amountPaid, setAmountPaid] = useState(orderData.amountPaid || 0);
  const [totalPayable, setTotalPayable] = useState(orderData.totalPayable);
  const [currentOrderData, setCurrentOrderData] = useState(orderData);

  useEffect(() => {
    // Update all states when orderData changes
    setPaymentStatus(orderData.paymentStatus);
    setOrderStatus(orderData.orderStatus);
    setAmountPaid(orderData.amountPaid || 0);
    setTotalPayable(orderData.totalPayable);
    setCurrentOrderData(orderData);
  }, [orderData]);

  const handleStatusUpdate = (updatedOrder: OrderWithItemsType) => {
    setPaymentStatus(updatedOrder.paymentStatus);
    setOrderStatus(updatedOrder.orderStatus);
    setAmountPaid(updatedOrder.amountPaid || 0);
    setTotalPayable(updatedOrder.totalPayable);
    setCurrentOrderData(updatedOrder);
  };

  return (
    <>
      {/* Order Update Form */}
      <OrderUpdateForm
        orderData={currentOrderData}
        onSuccess={handleStatusUpdate}
      />

      {/* Order Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-8">
        <div className="lg:col-span-1 space-y-4">
          {/* Customer Info */}
          <Card className="bg-stone-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-base text-stone-800 underline underline-offset-2">
                Customer Info
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-stone-500 space-y-2">
              <p className="w-full h-fit">
                <span className="text-evoAdminPrimary font-semibold">{`Name: `}</span>
                {`${orderData.firstname}${
                  orderData.lastname ? ` ${orderData.lastname}` : ""
                }`}
              </p>
              {orderData.email && (
                <p className="w-full h-fit">
                  <span className="text-evoAdminPrimary font-semibold">{`Email: `}</span>
                  {`${orderData.email}`}
                </p>
              )}
              <p className="w-full h-fit">
                <span className="text-evoAdminPrimary font-semibold">{`Phone: `}</span>
                {`${orderData.phone}`}
              </p>
              <p className="w-full h-fit">
                <span className="text-evoAdminPrimary font-semibold">{`House & Street: `}</span>
                {`${orderData.houseStreet}`}
              </p>
              <p className="w-full h-fit">
                <span className="text-evoAdminPrimary font-semibold">{`District: `}</span>
                {`${orderData.city}`}
              </p>
              <p className="w-full h-fit">
                <span className="text-evoAdminPrimary font-semibold">{`Thana: `}</span>
                {`${orderData.subdistrict}`}
              </p>
              {orderData.postcode && (
                <p className="w-full h-fit">
                  <span className="text-evoAdminPrimary font-semibold">{`Postcode: `}</span>
                  {`${orderData.postcode}`}
                </p>
              )}
              <p className="w-full h-fit">
                <span className="text-evoAdminPrimary font-semibold">{`Country: `}</span>
                {`${orderData.country}`}
              </p>
            </CardContent>
          </Card>

          {/* Order Info */}
          <Card className="bg-stone-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-stone-800 underline underline-offset-2">
                Order Information
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-stone-500 space-y-2">
              <div>
                <span className="text-evoAdminPrimary font-semibold">{`Order Status: `}</span>
                {getOrderStatusBadge(orderStatus)}
              </div>

              <div>
                <span className="text-evoAdminPrimary font-semibold">{`Shipping Type: `}</span>
                {`${
                  shippingTypes[orderData.shippingType] ||
                  orderData.shippingType
                }`}
              </div>

              {orderData.pickupPointId && (
                <div>
                  <span className="text-evoAdminPrimary font-semibold">{`Pickup Point: `}</span>
                  {`${
                    pickupPoints[orderData.pickupPointId.toString()] ||
                    orderData.pickupPointId
                  }`}
                </div>
              )}

              <div>
                <span className="text-evoAdminPrimary font-semibold">{`Payment Method: `}</span>
                {`${
                  paymentMethods[orderData.paymentMethod] ||
                  orderData.paymentMethod
                }`}
              </div>

              <div>
                <span className="text-evoAdminPrimary font-semibold">{`Payment Status: `}</span>
                {getPaymentStatusBadge(paymentStatus)}
              </div>

              {(amountPaid !== undefined ||
                orderData.amountDue !== undefined) && (
                <div className="border-t border-stone-200 pt-2 space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-evoAdminPrimary font-semibold text-[11px]">{`Total Amount: `}</span>
                    <span className="text-stone-700 text-[11px] font-medium">{`BDT ${totalPayable.toFixed(
                      2
                    )}`}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-green-700 font-semibold text-[11px]">{`Amount Paid: `}</span>
                    <span className="text-green-700 text-[11px] font-medium">{`BDT ${amountPaid.toFixed(
                      2
                    )}`}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-red-700 font-semibold text-[11px]">{`Amount Due: `}</span>
                    <span className="text-red-700 text-[11px] font-medium">{`BDT ${(
                      totalPayable - amountPaid
                    ).toFixed(2)}`}</span>
                  </div>
                </div>
              )}

              {orderData.transactionId && (
                <div>
                  <span className="text-evoAdminPrimary font-semibold">{`Transaction ID: `}</span>
                  {`${orderData.transactionId}`}
                </div>
              )}

              {orderData.trackingCode && (
                <div>
                  <span className="text-evoAdminPrimary font-semibold">{`Tracking Code: `}</span>
                  {`${orderData.trackingCode}`}
                </div>
              )}

              <div>
                <span className="text-evoAdminPrimary font-semibold">{`Order Date: `}</span>
                {orderData.createdAt
                  ? new Date(orderData.createdAt).toLocaleDateString()
                  : "N/A"}
              </div>

              {orderData.deliveredAt && (
                <div>
                  <span className="text-evoAdminPrimary font-semibold">{`Delivery Date: `}</span>
                  {new Date(orderData.deliveredAt).toLocaleDateString()}
                </div>
              )}

              <div>
                <span className="text-evoAdminPrimary font-semibold">{`Terms: `}</span>
                {`${orderData.terms}`}
              </div>

              {orderData.notes && (
                <div className="flex flex-col gap-1">
                  <span className="text-evoAdminPrimary font-semibold">{`Order Notes: `}</span>
                  <p className="text-stone-600 text-xs">{`${orderData.notes}`}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Order Items & Summary */}
        <div className="lg:col-span-2">
          <Card className="bg-stone-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-stone-800 underline underline-offset-2">
                Ordered Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              {orderData.orderItems && orderData.orderItems.length > 0 ? (
                <div className="space-y-4">
                  {/* Items List */}
                  <div className="max-h-[400px] overflow-y-auto space-y-3">
                    {orderData.orderItems.map((item, index) => (
                      <div
                        key={`oitem-${index}`}
                        className="flex justify-between items-start p-3 border border-stone-200 rounded-md"
                      >
                        <div className="flex-1 text-xs">
                          <div className="flex flex-col gap-1">
                            <h4 className="font-medium text-stone-800">
                              {item.productName}
                            </h4>
                            {item.selectedColor && (
                              <p className="text-xs text-stone-500">
                                Color: {item.selectedColor}
                              </p>
                            )}
                          </div>

                          <div className="flex justify-between items-center mt-2">
                            <span className="text-stone-600">
                              {currencyFormatBDT(item.productPrice)} ×{" "}
                              {item.quantity}
                            </span>
                            <span className="font-medium text-stone-800">
                              {currencyFormatBDT(
                                item.productPrice * item.quantity
                              )}{" "}
                              BDT
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Order Summary */}
                  <div className="border-t border-stone-200 pt-4 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-stone-600">Subtotal:</span>
                      <span className="text-stone-800">
                        {currencyFormatBDT(orderData.subtotal)} BDT
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-600">Discount:</span>
                      <span className="text-stone-800">
                        -{currencyFormatBDT(orderData.discount)} BDT
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-600">Delivery:</span>
                      <span className="text-stone-800">
                        {currencyFormatBDT(orderData.deliveryCharge)} BDT
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-600">Additional:</span>
                      <span className="text-stone-800">
                        {currencyFormatBDT(orderData.additionalCharge)} BDT
                      </span>
                    </div>
                    <div className="flex justify-between text-sm font-semibold border-t border-stone-200 pt-2">
                      <span className="text-stone-800">Total:</span>
                      <span className="text-stone-800">
                        {currencyFormatBDT(orderData.totalPayable)} BDT
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-stone-500 text-xs">
                  No items found in this order.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default OrderInfo;
