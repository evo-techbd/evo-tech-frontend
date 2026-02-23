"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "@/utils/axios/axios";
import { getCurrentUser } from "@/utils/cookies";

export default function OrderDetailsPage() {
  const params = useParams() as { id?: string };
  const router = useRouter();
  const orderId = params?.id;

  const [order, setOrder] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const currentUser = getCurrentUser();
    
    if (!currentUser || !orderId) {
      setLoading(false);
      setError("Unable to load order details");
      return;
    }

    (async () => {
      try {
        setLoading(true);
        const res = await axios.get(`/orders/${orderId}`);
        if (res.data?.success) {
          const payload = res.data.data;
          if (payload?.order) {
            setOrder({ ...payload.order, items: payload.items || [] });
          } else {
            setOrder(payload);
          }
        } else {
          setError(res.data?.message || "Failed to load order");
        }
      } catch (err: any) {
        setError(
          err?.response?.data?.message || err.message || "Failed to load order"
        );
      } finally {
        setLoading(false);
      }
    })();
  }, [orderId]);

  if (!orderId) {
    return <div className="p-6">No order specified</div>;
  }

  if (loading) return <div className="p-6">Loading order...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto bg-white rounded shadow p-6">
        <h2 className="text-xl font-semibold mb-2">Order Details</h2>
        <div className="mb-4 text-sm text-gray-600">
          Order #{order.orderNumber || order._id}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <div className="text-sm text-gray-600">Status</div>
            <div className="font-medium">{order.orderStatus}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Payment</div>
            <div className="font-medium">{order.paymentStatus}</div>
          </div>
        </div>

        <div className="border-t pt-4">
          <h3 className="font-semibold mb-2">Shipping</h3>
          <div className="text-sm text-gray-700">
            {order.firstname} {order.lastname}
            <div>
              {order.houseStreet}, {order.city} {order.postcode}
            </div>
            <div>{order.phone}</div>
          </div>
        </div>

        <div className="mt-4 border-t pt-4">
          <h3 className="font-semibold mb-2">Items</h3>
          {order.items && order.items.length > 0 ? (
            <ul className="space-y-2">
              {order.items.map((it: any) => (
                <li
                  key={it._id || `${it.product}-${it.quantity}`}
                  className="flex justify-between"
                >
                  <div>
                    <div className="font-medium">{it.productName}</div>
                    <div className="text-sm text-gray-600">
                      Qty: {it.quantity}
                    </div>
                  </div>
                  <div className="font-medium">BDT {it.subtotal}</div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-sm text-gray-500">
              No items information available
            </div>
          )}
        </div>

        <div className="mt-4 pt-4 border-t flex items-center justify-between">
          <div className="text-sm text-gray-600">Total</div>
          <div className="text-lg font-semibold">BDT {order.totalPayable}</div>
        </div>

        <div className="mt-6 flex gap-2">
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-gray-200 rounded"
          >
            Back
          </button>
          {order.trackingCode && (
            <a
              href={`https://tracking.example.com/${order.trackingCode}`}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 bg-blue-600 text-white rounded"
            >
              Track
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
