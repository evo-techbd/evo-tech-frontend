"use client";

import { Component, ReactNode } from "react";
import { HiMiniExclamationTriangle } from "react-icons/hi2";
import Link from "next/link";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class CartErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error("Cart Error:", error, errorInfo);
  }

  handleRefresh = () => {
    window.location.reload();
  };

  handleClearCart = () => {
    // Clear cart from localStorage
    try {
      localStorage.removeItem("evoFrontCart");
      window.location.reload();
    } catch (e) {
      console.error("Failed to clear cart:", e);
    }
  };

  render() {
    if (this.state.hasError) {
      const isUpdateDepthError = this.state.error?.message?.includes("Maximum update depth");
      
      return (
        <div className="w-full min-h-[400px] flex flex-col items-center justify-center gap-4 p-8">
          <div className="flex flex-col items-center gap-3 max-w-md text-center">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
              <HiMiniExclamationTriangle className="w-8 h-8 text-red-600" />
            </div>
            
            <h2 className="text-xl font-semibold text-stone-900">
              {isUpdateDepthError ? "Cart Update Issue" : "Something went wrong"}
            </h2>
            
            <p className="text-sm text-stone-600">
              {isUpdateDepthError
                ? "We encountered an issue while updating your cart. This usually happens when there's a temporary sync problem."
                : "We encountered an unexpected error while loading your cart."}
            </p>

            <div className="flex flex-col sm:flex-row gap-3 mt-4">
              <button
                onClick={this.handleRefresh}
                className="px-6 py-2.5 text-sm font-medium text-white bg-stone-800 rounded-md hover:bg-stone-700 transition-colors duration-200"
              >
                Refresh Cart
              </button>

              <button
                onClick={this.handleClearCart}
                className="px-6 py-2.5 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors duration-200"
              >
                Clear Cart & Restart
              </button>
              
              <Link
                href="/products-and-accessories"
                className="px-6 py-2.5 text-sm font-medium text-stone-800 bg-stone-100 rounded-md hover:bg-stone-200 transition-colors duration-200"
              >
                Continue Shopping
              </Link>
            </div>

            <p className="text-xs text-stone-500 mt-4">
              If this problem persists, please contact support.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default CartErrorBoundary;
