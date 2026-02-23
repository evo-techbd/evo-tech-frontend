import { currentRouteProps } from "@/utils/types_interfaces/shared_types";
import { OrderWithItemsType } from "@/schemas/admin/sales/orderSchema";
import axiosIntercept from "@/utils/axios/axiosIntercept";
import { unstable_noStore as noStore } from "next/cache";
import { notFound } from "next/navigation";
import OrderInfo from "@/components/admin/orders/order-info";
import { OrderDetailsHeader } from "@/components/admin/orders/order-details-header";


const getOrderDetails = async (orderId: string): Promise<{ order: OrderWithItemsType; items: any[] } | null> => {
  const axioswithIntercept = await axiosIntercept();
  noStore();

  try {
    // console.log('📦 Fetching order details for orderId:', orderId);
    
    // Call backend API directly with auth
    const response = await axioswithIntercept.get(`/orders/${orderId}`);

    // console.log('✅ Order details response:', {
    //   success: response.data?.success,
    //   hasData: !!response.data?.data,
    //   dataKeys: response.data?.data ? Object.keys(response.data.data) : null
    // });

    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    
    return null;
  } catch (error: any) {
    console.error('❌ Error fetching order details:', error.response?.data || error.message);
    return null;
  }
};


const AdminOrderDetailsPage = async ({ params }: currentRouteProps) => {
  const { orderId } = await params;
  const orderData = await getOrderDetails(orderId);

  if (!orderData) {
    notFound();
  }

  // Combine order and items into single object for components
  const orderWithItems: OrderWithItemsType = {
    ...orderData.order,
    orderItems: orderData.items,
  };

  return (
    <div className="w-full h-full flex flex-col px-5 md:px-7 py-6 font-inter">
      <div className="w-full h-full flex flex-col gap-6">
        {/* Page Header */}
        <OrderDetailsHeader order={orderWithItems} />

        <OrderInfo orderData={orderWithItems} />
      </div>
    </div>
  );
};

export default AdminOrderDetailsPage;
