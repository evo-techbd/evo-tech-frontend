'use client';

import { useUserOrders } from '@/hooks/use-user-dashboard';
import { currencyFormatBDT } from '@/lib/all_utils';
import Link from 'next/link';
import { useState } from 'react';
import { MessageSquare } from 'lucide-react';
import ReviewModal from '@/components/reviews/review-modal';
import axios from '@/utils/axios/axios';
import { toast } from 'sonner';

export default function OrderHistoryPage() {
    const { orders, meta, loading, error } = useUserOrders();
    const [reviewModalState, setReviewModalState] = useState<{
        isOpen: boolean;
        product: any;
        orderId: string;
    } | null>(null);
    const [orderItemsModal, setOrderItemsModal] = useState<{
        isOpen: boolean;
        order: any;
        items: any[];
    } | null>(null);
    const [loadingItems, setLoadingItems] = useState(false);

    const handleReviewClick = async (order: any) => {
        setLoadingItems(true);
        
        try {
            const response = await axios.get(`/orders/${order._id}/items-for-review`);
            if (response.data?.success) {
                setOrderItemsModal({
                    isOpen: true,
                    order: order,
                    items: response.data.data.items,
                });
            }
        } catch (error: any) {
            console.error('Failed to load order items:', error);
            toast.error(error.response?.data?.message || 'Failed to load order items');
        } finally {
            setLoadingItems(false);
        }
    };

    const handleOpenReviewModal = (product: any, orderId: string) => {
        setReviewModalState({
            isOpen: true,
            product,
            orderId,
        });
        setOrderItemsModal(null);
    };

    const handleReviewSubmitted = () => {
        setReviewModalState(null);
        // Refresh the order items to update review status
        if (orderItemsModal?.order) {
            handleReviewClick(orderItemsModal.order);
        }
    };

    // Count orders needing reviews
    const deliveredOrdersCount = orders?.filter(order => order.orderStatus === 'delivered').length || 0;

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-6xl mx-auto">
                    <div className="animate-pulse">
                        <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="bg-white rounded-lg shadow-md p-6">
                                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center py-8">
                        <div className="text-red-600 mb-4">Error loading order history</div>
                        <p className="text-gray-600">{error}</p>
                        <Link href="/user/dashboard" className="mt-4 inline-block text-blue-600 hover:text-blue-800">
                            ← Back to Dashboard
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <Link href="/user/dashboard" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
                        ← Back to Dashboard
                    </Link>
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-bold text-gray-900">
                            Order History
                        </h1>
                        {deliveredOrdersCount > 0 && (
                            <span className="px-3 py-1 bg-amber-100 text-amber-800 text-sm font-medium rounded-full flex items-center gap-1">
                                <MessageSquare className="w-4 h-4" />
                                {deliveredOrdersCount} {deliveredOrdersCount === 1 ? 'order' : 'orders'} can be reviewed
                            </span>
                        )}
                    </div>
                    <p className="text-gray-600 mt-2">
                        View and track all your previous orders.
                    </p>
                </div>

                {/* Orders List */}
                <div className="space-y-6">
                    {orders && orders.length > 0 ? (
                        orders.map((order) => (
                            <div key={order._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                                <div className="p-6">
                                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4">
                                        <div className="flex-1">
                                            <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                                Order #{order.orderNumber}
                                            </h3>
                                            <p className="text-sm text-gray-600">
                                                Placed on {order.createdAt
                                                    ? new Date(order.createdAt).toLocaleDateString('en-US', {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric'
                                                    })
                                                    : '—'}
                                            </p>
                                        </div>
                                        <div className="mt-4 lg:mt-0 flex flex-col lg:items-end space-y-2">
                                            <div className="flex items-center space-x-4">
                                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                                    order.orderStatus === 'delivered' 
                                                        ? 'bg-green-100 text-green-800'
                                                        : order.orderStatus === 'processing'
                                                        ? 'bg-blue-100 text-blue-800'
                                                        : order.orderStatus === 'shipped'
                                                        ? 'bg-purple-100 text-purple-800'
                                                        : order.orderStatus === 'cancelled'
                                                        ? 'bg-red-100 text-red-800'
                                                        : 'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                    {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
                                                </span>
                                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                                    order.paymentStatus === 'paid'
                                                        ? 'bg-green-100 text-green-800'
                                                        : order.paymentStatus === 'failed'
                                                        ? 'bg-red-100 text-red-800'
                                                        : order.paymentStatus === 'refunded'
                                                        ? 'bg-gray-100 text-gray-800'
                                                        : 'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                    {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                                                </span>
                                            </div>
                                            <div className="text-lg font-semibold text-gray-900">
                                                BDT {currencyFormatBDT(order.totalPayable)}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="border-t pt-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                                            <div>
                                                <span className="text-gray-600">Items:</span>
                                                <span className="ml-2 font-medium">
                                                    {order.itemsCount ?? order.lineItemsCount ?? 0}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="text-gray-600">Shipping:</span>
                                                <span className="ml-2 font-medium">{order.shippingType}</span>
                                            </div>
                                            <div>
                                                <span className="text-gray-600">Payment:</span>
                                                <span className="ml-2 font-medium">{order.paymentMethod}</span>
                                            </div>
                                            <div>
                                                <span className="text-gray-600">Tracking:</span>
                                                <span className="ml-2 font-medium">{order.trackingCode || 'N/A'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-4 pt-4 border-t">
                                        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                                            <Link
                                                href={`/user/dashboard/order-details/${order._id}`}
                                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-center"
                                            >
                                                View Details
                                            </Link>
                                            {order.trackingCode && (
                                                <Link
                                                    href={`/user/dashboard/order-details/${order._id}`}
                                                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors text-center"
                                                >
                                                    Track Order
                                                </Link>
                                            )}
                                            {order.orderStatus === 'delivered' && (
                                                <>
                                                    <button 
                                                        onClick={() => handleReviewClick(order)}
                                                        disabled={loadingItems}
                                                        className="px-4 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600 transition-colors flex items-center justify-center gap-2"
                                                    >
                                                        <MessageSquare className="w-4 h-4" />
                                                        {loadingItems ? 'Loading...' : 'Write Review'}
                                                    </button>
                                                    <button className="px-4 py-2 bg-green-200 text-green-700 rounded-md hover:bg-green-300 transition-colors">
                                                        Reorder
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="bg-white rounded-lg shadow-md p-12 text-center">
                            <div className="max-w-md mx-auto">
                                <div className="mb-4">
                                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
                                <p className="text-gray-600 mb-6">
                                    You haven&apos;t placed any orders yet. Start shopping to see your order history here.
                                </p>
                                <Link
                                    href="/products-and-accessories"
                                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                                >
                                    Start Shopping
                                </Link>
                            </div>
                        </div>
                    )}
                </div>

                {/* Summary Section */}
                {orders && orders.length > 0 && (
                    <div className="mt-8 bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="text-center p-4 bg-gray-50 rounded-lg">
                                    <div className="text-2xl font-bold text-blue-600">{meta?.total ?? orders.length}</div>
                                    <div className="text-sm text-gray-600">Total Orders</div>
                            </div>
                            <div className="text-center p-4 bg-gray-50 rounded-lg">
                                <div className="text-2xl font-bold text-green-600">
                                    BDT {currencyFormatBDT(orders.reduce((sum, order) => sum + order.totalPayable, 0))}
                                </div>
                                <div className="text-sm text-gray-600">Total Spent</div>
                            </div>
                            <div className="text-center p-4 bg-gray-50 rounded-lg">
                                <div className="text-2xl font-bold text-purple-600">
                                    {orders.filter(order => order.orderStatus === 'delivered').length}
                                </div>
                                <div className="text-sm text-gray-600">Completed Orders</div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Review Modal for Order Items */}
                {orderItemsModal?.isOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-2xl font-bold">Write Reviews</h2>
                                    <button
                                        onClick={() => setOrderItemsModal(null)}
                                        className="text-gray-500 hover:text-gray-700 text-2xl"
                                    >
                                        ×
                                    </button>
                                </div>
                                <p className="text-sm text-gray-600 mb-6">
                                    Order #{orderItemsModal.order.orderNumber}
                                </p>

                                <div className="space-y-4">
                                    {orderItemsModal.items.map((item) => (
                                        <div key={item._id} className="border rounded-lg p-4">
                                            <div className="flex items-start gap-3 mb-3">
                                                {item.product?.mainImage && (
                                                    <img
                                                        src={item.product.mainImage}
                                                        alt={item.productName}
                                                        className="w-16 h-16 object-cover rounded"
                                                    />
                                                )}
                                                <div className="flex-1">
                                                    <h3 className="font-medium text-sm">{item.productName}</h3>
                                                    {item.selectedColor && (
                                                        <p className="text-xs text-gray-500">Color: {item.selectedColor}</p>
                                                    )}
                                                </div>
                                                {item.hasReview && (
                                                    <span className="px-3 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                                                        ✓ Reviewed
                                                    </span>
                                                )}
                                            </div>
                                            {!item.hasReview && (
                                                <button
                                                    onClick={() => handleOpenReviewModal(item.product, orderItemsModal.order._id)}
                                                    className="w-full px-4 py-2 bg-amber-500 text-white rounded hover:bg-amber-600 transition-colors"
                                                >
                                                    Write Review
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                <button
                                    onClick={() => setOrderItemsModal(null)}
                                    className="mt-6 w-full px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Individual Review Modal */}
                {reviewModalState?.isOpen && (
                    <ReviewModal
                        isOpen={reviewModalState.isOpen}
                        onClose={() => setReviewModalState(null)}
                        product={reviewModalState.product}
                        orderId={reviewModalState.orderId}
                        onReviewSubmitted={handleReviewSubmitted}
                    />
                )}
            </div>
        </div>
    );
}