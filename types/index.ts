// User types
export interface User {
  _id?: string;
  uuid: string;
  userType: "admin" | "user";
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  defaultShippingAddressId?: string;
  defaultBillingAddressId?: string;
  emailVerifiedAt?: Date;
  lastActiveAt?: Date;
  rewardPoints?: number;
  newsletterOptIn?: boolean;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

// Order types
export interface Order {
  _id?: string;
  orderNumber: string;
  user: string;
  firstname: string;
  lastname: string;
  firstName?: string;
  lastName?: string;
  phone: string;
  email: string;
  houseStreet: string;
  city: string;
  subdistrict?: string;
  postcode: string;
  country: string;
  shippingType: string;
  pickupPointId?: string;
  paymentMethod: string;
  transactionId?: string;
  terms: boolean;
  subtotal: number;
  discount: number;
  deliveryCharge: number;
  additionalCharge: number;
  totalPayable: number;
  orderStatus: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  notes?: string;
  trackingCode?: string;
  viewed: boolean;
  unpaidNotified: boolean;
  deliveredAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
  itemsCount?: number;
  lineItemsCount?: number;
}

// Dashboard types
export interface UserDashboardRecentOrder {
  _id?: string;
  orderNumber: string;
  totalPayable: number;
  orderStatus: Order["orderStatus"];
  paymentStatus: Order["paymentStatus"];
  createdAt?: Date;
  itemsCount?: number;
  lineItemsCount?: number;
}

export interface UserDashboardStats {
  totalOrders: number;
  totalSpent: number;
  recentOrders: UserDashboardRecentOrder[];
  rewardPoints?: number;
  memberSince?: Date | string;
}