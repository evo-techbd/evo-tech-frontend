import { Order, User } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// Generic API call function
async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const response = await fetch(url, {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API call failed: ${response.status} ${response.statusText}`);
  }

  return await response.json();
}

// User API functions
export const userApi = {
  // Get current user profile
  getProfile: async (userId: string, token: string): Promise<User> => {
    const response = await apiCall<User>(`/users/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  // Update user profile
  updateProfile: async (userId: string, userData: Partial<User>, token: string): Promise<User> => {
    const response = await apiCall<User>(`/users/${userId}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(userData),
    });
    return response.data;
  },

  // Get user dashboard stats
  getDashboardStats: async (token: string) => {
    const response = await apiCall(`/users/dashboard/stats`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response;
  },

  // Get user orders
  getUserOrders: async (token: string) => {
    const response = await apiCall(`/users/dashboard/orders`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response;
  },
};

// Order API functions  
export const orderApi = {
  // Get user's orders
  getUserOrders: async (token: string): Promise<Order[]> => {
    const response = await apiCall<Order[]>('/orders/my-orders', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  // Get single order
  getSingleOrder: async (orderId: string, token: string): Promise<Order> => {
    const response = await apiCall<Order>(`/orders/${orderId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },
};

// Dashboard API functions
export const dashboardApi = {
  // Get user dashboard stats
  getUserStats: async (token: string) => {
    try {
      const orders = await orderApi.getUserOrders(token);
      const totalOrders = orders.length;
      const totalSpent = orders.reduce((sum, order) => sum + (order.totalPayable || 0), 0);
      const recentOrders = orders.slice(0, 5); // Last 5 orders
      
      return {
        totalOrders,
        totalSpent,
        recentOrders,
      };
    } catch (error) {
      console.error('Error fetching user stats:', error);
      return {
        totalOrders: 0,
        totalSpent: 0,
        recentOrders: [],
      };
    }
  },
};