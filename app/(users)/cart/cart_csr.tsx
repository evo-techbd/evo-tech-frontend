"use client";

import CartItemRow from "./cartitem_row";
import { currencyFormatBDT } from "@/lib/all_utils";
import { PiSmileySadLight, PiInfoBold } from "react-icons/pi";
import { useSelector, useDispatch } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import {
  addPendingUpdate,
  clearPendingUpdates,
  setIsUpdating,
  updateCartItemQuantities,
  removeCartItem,
} from "@/store/slices/cartslice";
import Link from "next/link";
import { useCallback, useRef, useEffect, useMemo } from "react";
import type { MouseEvent } from "react";
import axiosLocal from "@/utils/axios/axiosLocal";
import { toast } from "sonner";
import type { CartItem } from "@/schemas/cartSchema";
import { calculateCartBreakdown } from "@/utils/cart-totals";
import { summarizeCartStock } from "@/utils/cart-stock";
import { HiMiniExclamationTriangle } from "react-icons/hi2";

const CartListing = () => {
  const cartItems = useSelector(
    (state) => (state as RootState).shoppingcart.cartdata
  );
  const pendingUpdates = useSelector(
    (state) => (state as RootState).shoppingcart.pendingUpdates
  );
  const isUpdating = useSelector(
    (state) => (state as RootState).shoppingcart.isUpdating
  );
  const dispatch = useDispatch<AppDispatch>();

  const batchUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const setCartLocal = (cartLocal: any) => {
    localStorage.setItem("evoFrontCart", JSON.stringify(cartLocal));

    // Dispatch a custom event when updating the cart
    const event = new CustomEvent("localStorageChange", {
      detail: { key: "evoFrontCart", newValue: cartLocal },
    });
    window.dispatchEvent(event);
  };

  const handleBatchUpdate = useCallback(async () => {
    if (pendingUpdates.length === 0 || isUpdating) return;

    dispatch(setIsUpdating(true));

    // Store pendingUpdates locally before clearing them
    const updatesToProcess = [...pendingUpdates];

    const localevoFrontCart = localStorage.getItem("evoFrontCart");
    const parsedCart = localevoFrontCart ? JSON.parse(localevoFrontCart) : null;

    let cartreqbody = {};
    if (parsedCart && parsedCart.ctoken) {
      cartreqbody = {
        cart_t: parsedCart.ctoken,
      };
    }

    const payload = {
      items: updatesToProcess.map((update) => ({
        item_id: update.item_id,
        item_color: update.item_color,
        item_quantity: update.new_quantity,
      })),
      ...cartreqbody,
    };

    try {
      const response = await axiosLocal.put("/api/cart/updatebatch", payload);

      if (response.data && response.data.message === "Cart items updated") {
        // Update the Redux store with the successful updates
        dispatch(updateCartItemQuantities(updatesToProcess));
        dispatch(clearPendingUpdates());

        toast.success("Cart updated");

        // Update local storage using the stored updates
        if (parsedCart && parsedCart.items && Array.isArray(parsedCart.items)) {
          const updatedCartItems = parsedCart.items.map((item: any) => {
            const update = updatesToProcess.find(
              (u) =>
                u.item_id === item.item_id && u.item_color === item.item_color
            );
            return update
              ? { ...item, item_quantity: update.new_quantity }
              : item;
          });
          const updatedCart = {
            items: updatedCartItems,
            ctoken: response.data.ctoken,
          };
          setCartLocal(updatedCart);
        }
      }
    } catch (error: any) {
      if (error.response) {
        toast.error(error.response.data.message || "Failed to update cart");
      } else {
        toast.error("Failed to update cart");
      }
      // Clear pending updates on error to prevent infinite retry
      dispatch(clearPendingUpdates());
    } finally {
      dispatch(setIsUpdating(false));
    }
  }, [pendingUpdates, isUpdating, dispatch]);

  // Effect to handle batch updates with debouncing
  useEffect(() => {
    if (pendingUpdates.length === 0) return;

    // Clear existing timeout
    if (batchUpdateTimeoutRef.current) {
      clearTimeout(batchUpdateTimeoutRef.current);
    }

    // Set new timeout for batch update
    batchUpdateTimeoutRef.current = setTimeout(() => {
      handleBatchUpdate();
    }, 1200);

    return () => {
      if (batchUpdateTimeoutRef.current) {
        clearTimeout(batchUpdateTimeoutRef.current);
      }
    };
  }, [pendingUpdates, handleBatchUpdate]);

  const handleCartItemQuantityChange = useCallback(
    (itemId: string, itemColor: string | null, newQuantity: number) => {
      dispatch(
        addPendingUpdate({
          item_id: itemId,
          item_color: itemColor,
          new_quantity: newQuantity,
        })
      );
    },
    [dispatch]
  );

  const handleCartItemRemove = useCallback(
    async (itemId: string, itemColor: string | null) => {
      dispatch(setIsUpdating(true));

      const localevoFrontCart = localStorage.getItem("evoFrontCart");
      const parsedCart = localevoFrontCart
        ? JSON.parse(localevoFrontCart)
        : null;

      let cartreqbody: { cart_t?: string } = {};
      if (parsedCart && parsedCart.ctoken) {
        cartreqbody = {
          cart_t: parsedCart.ctoken,
        };
      }

      const removeItemLocally = (ctokenOverride?: string) => {
        dispatch(removeCartItem({ item_id: itemId, item_color: itemColor }));

        if (parsedCart && parsedCart.items && Array.isArray(parsedCart.items)) {
          const updatedCartItems = parsedCart.items.filter(
            (item: any) =>
              !(item.item_id === itemId && item.item_color === itemColor)
          );
          const updatedCart = {
            items: updatedCartItems,
            ctoken: ctokenOverride ?? parsedCart.ctoken ?? "",
          };
          setCartLocal(updatedCart);
        }
      };

      try {
        const shouldSyncServer = Boolean(cartreqbody.cart_t);

        if (shouldSyncServer) {
          const response = await axiosLocal.delete("/api/cart/remove", {
            data: {
              item_id: itemId,
              item_color: itemColor,
              ...cartreqbody,
            },
          });

          if (response.data && response.data.message === "Cart item removed") {
            removeItemLocally(response.data.ctoken);
            toast.success("Item removed from cart");
            return;
          }

          throw new Error("Unexpected response while removing cart item");
        }

        // Guest carts only exist locally, so just update Redux/localStorage
        removeItemLocally(parsedCart?.ctoken);
        toast.success("Item removed from cart");
      } catch (error: any) {
        const status = error?.response?.status;
        const message = error?.response?.data?.message;

        if (status === 401 || status === 403) {
          removeItemLocally(parsedCart?.ctoken);
          toast.success("Item removed from cart");
        } else {
          toast.error(message || "Failed to remove item");
        }
      } finally {
        dispatch(setIsUpdating(false));
      }
    },
    [dispatch]
  );

  const getEffectiveQuantity = useCallback(
    (item: any) => {
      const pendingUpdate = pendingUpdates.find(
        (update) =>
          update.item_id === item.item_id &&
          update.item_color === item.item_color
      );
      return pendingUpdate ? pendingUpdate.new_quantity : item.item_quantity;
    },
    [pendingUpdates]
  );

  const cartSnapshot = useMemo<CartItem[]>(() => {
    if (!cartItems) return [];
    return cartItems.map((item) => ({
      ...item,
      item_quantity: getEffectiveQuantity(item),
    }));
  }, [cartItems, getEffectiveQuantity]);

  const {
    cartSubTotal,
    preOrderDepositDue,
    preOrderBalanceDue,
    dueNowSubtotal,
    hasPreOrderItems,
  } = useMemo(() => calculateCartBreakdown(cartSnapshot), [cartSnapshot]);

  const cartStockSummary = useMemo(
    () => summarizeCartStock(cartSnapshot),
    [cartSnapshot]
  );

  const isCheckoutBlocked = cartStockSummary.hasBlockingIssues;

  const handleCheckoutClick = useCallback(
    (event: MouseEvent<HTMLAnchorElement>) => {
      if (isCheckoutBlocked) {
        event.preventDefault();
        toast.error("Resolve stock issues before proceeding to checkout.");
      }
    },
    [isCheckoutBlocked]
  );

  return (
    <>
      {cartItems ? (
        cartItems.length > 0 ? (
          <div className="flex flex-col w-full h-fit gap-7 animate-in fade-in duration-300">
            {cartStockSummary.hasBlockingIssues && (
              <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                <p className="flex items-center gap-2 text-[13px] font-semibold">
                  <HiMiniExclamationTriangle className="h-4 w-4" />
                  Fix stock issues before checkout
                </p>
                <ul className="mt-2 space-y-1 text-[12px]">
                  {cartStockSummary.blockingIssues.map((issue) => (
                    <li key={`cart-stock-blocker-${issue.itemId}`}>
                      <span className="font-semibold">{issue.itemName}</span>{" "}
                      {issue.isOutOfStock
                        ? "is no longer available."
                        : `has only ${issue.availableStock ?? 0} unit${
                            (issue.availableStock ?? 0) === 1 ? "" : "s"
                          } available.`}
                    </li>
                  ))}
                </ul>
                <p className="mt-2 text-[11px] font-medium">
                  Please remove or adjust these items to continue.
                </p>
              </div>
            )}

            {!cartStockSummary.hasBlockingIssues &&
              cartStockSummary.warningIssues.length > 0 && (
                <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                  <p className="flex items-center gap-2 text-[13px] font-semibold">
                    <PiInfoBold className="h-4 w-4" />
                    Low stock alert
                  </p>
                  <ul className="mt-2 space-y-1 text-[12px]">
                    {cartStockSummary.warningIssues.map((issue) => (
                      <li key={`cart-stock-warning-${issue.itemId}`}>
                        <span className="font-semibold">{issue.itemName}</span>{" "}
                        {`has only ${issue.availableStock ?? 0} left.`}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

            <div className="flex flex-col w-full h-fit gap-2 overflow-x-auto scrollbar-custom">
              <div className="flex w-full h-fit gap-1">
                <div className="flex-initial min-w-[65px] w-[80px] px-2 py-1 text-center text-stone-600 tracking-tight bg-stone-50">
                  Image
                </div>
                <div className="flex-auto min-w-[80px] w-[500px] px-2 py-1 text-center text-stone-600 tracking-tight bg-stone-50">
                  Product
                </div>
                <div className="hidden lg:block flex-initial w-[220px] px-2 py-1 text-center text-stone-600 tracking-tight bg-stone-50">
                  Unit Price
                </div>
                <div className="flex-initial min-w-[120px] w-[250px] px-2 py-1 text-center text-stone-600 tracking-tight bg-stone-50">
                  Quantity
                </div>
                <div className="hidden md:block flex-initial min-w-[50px] w-[300px] px-2 py-1 text-center text-stone-600 tracking-tight bg-stone-50">
                  Total
                </div>
              </div>
              {cartSnapshot.map((eachCartItem: CartItem, index: number) => (
                <CartItemRow
                  key={`${eachCartItem.item_id}_${
                    eachCartItem.item_color || "nocolor"
                  }`}
                  cartitem={eachCartItem}
                  effectiveQuantity={getEffectiveQuantity(eachCartItem)}
                  isUpdating={isUpdating}
                  handleCartItemQuantityChange={handleCartItemQuantityChange}
                  handleCartItemRemove={handleCartItemRemove}
                />
              ))}
            </div>

            <div className="flex flex-col items-end w-full h-fit gap-2">
              <div className="flex w-fit h-fit gap-1">
                <div className="w-fit px-2 py-1 text-[13px] sm:text-[15px] text-stone-600 tracking-tight">
                  {`Subtotal:`}
                </div>
                <div className="w-fit px-2 py-1 text-[13px] sm:text-[15px] text-stone-700 tracking-tight">
                  {`BDT ${currencyFormatBDT(cartSubTotal)}`}
                </div>
              </div>

              {hasPreOrderItems && (
                <div className="flex flex-col w-full h-fit gap-1 rounded-md border border-stone-200 bg-stone-50 px-3 py-2">
                  <div className="flex items-center justify-between text-[12px] sm:text-[13px] text-stone-600">
                    <span>{`Deposit due now (50% of pre-order):`}</span>
                    <span className="font-[600] text-stone-800">
                      {`BDT ${currencyFormatBDT(preOrderDepositDue)}`}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] sm:text-[12px] text-stone-600">
                    <span>{`Balance payable later:`}</span>
                    <span className="font-[600] text-stone-800">
                      {`BDT ${currencyFormatBDT(preOrderBalanceDue)}`}
                    </span>
                  </div>
                  <p className="text-[10px] sm:text-[11px] text-stone-500">
                    {`Approximate amount due at checkout (before shipping/fees): BDT ${currencyFormatBDT(
                      dueNowSubtotal
                    )}`}
                  </p>
                </div>
              )}

              <Link
                href="/checkout"
                onClick={handleCheckoutClick}
                aria-disabled={isCheckoutBlocked}
                className={`flex w-fit h-fit px-7 sm:px-9 py-2 text-[13px] sm:text-[14px] font-[500] text-white rounded-md focus:outline-none transition-all duration-200 ease-out ${
                  isCheckoutBlocked
                    ? "bg-stone-500 cursor-not-allowed"
                    : "bg-stone-800 hover:bg-stone-700 hover:scale-105 active:scale-95"
                }`}
              >
                {isCheckoutBlocked ? "Resolve stock issues" : "Checkout"}
              </Link>
              {isCheckoutBlocked && (
                <p className="text-[11px] text-red-600">
                  Update or remove the highlighted items to unlock checkout.
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="w-full min-h-[300px] flex flex-col items-center justify-center gap-2 animate-in fade-in duration-300">
            <PiSmileySadLight className="inline w-8 h-8 sm:w-10 sm:h-10 text-stone-400 animate-in zoom-in duration-500" />
            <p className="text-[13px] sm:text-[14px] leading-6 text-stone-800">{`Cart is empty!`}</p>
            <Link
              href="/products-and-accessories"
              className="w-fit h-fit mt-6 px-4 py-1 rounded-[6px] border border-stone-800 hover:border-stone-600 text-[13px] sm:text-[14px] leading-6 text-stone-100 bg-stone-800 hover:bg-stone-600 hover:scale-105 active:scale-95 transition-all duration-200 ease-out"
            >
              Continue Shopping
            </Link>
          </div>
        )
      ) : (
        <div className="w-full min-h-[300px] flex flex-col gap-3">
          {/* Skeleton Loader for Cart */}
          <div className="flex flex-col w-full h-fit gap-2 overflow-x-auto scrollbar-custom animate-pulse">
            {/* Header */}
            <div className="flex w-full h-fit gap-1">
              <div className="flex-initial min-w-[65px] w-[80px] px-2 py-1 bg-stone-200 rounded h-8"></div>
              <div className="flex-auto min-w-[80px] w-[500px] px-2 py-1 bg-stone-200 rounded h-8"></div>
              <div className="hidden lg:block flex-initial w-[220px] px-2 py-1 bg-stone-200 rounded h-8"></div>
              <div className="flex-initial min-w-[120px] w-[250px] px-2 py-1 bg-stone-200 rounded h-8"></div>
              <div className="hidden md:block flex-initial min-w-[50px] w-[300px] px-2 py-1 bg-stone-200 rounded h-8"></div>
            </div>

            {/* Skeleton Cart Items */}
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="flex w-full h-fit gap-1 bg-white p-2 rounded border border-stone-200"
              >
                <div className="flex-initial min-w-[65px] w-[80px]">
                  <div className="w-full aspect-square bg-stone-200 rounded"></div>
                </div>
                <div className="flex-auto min-w-[80px] w-[500px] flex flex-col gap-2 justify-center px-2">
                  <div className="w-3/4 h-4 bg-stone-200 rounded"></div>
                  <div className="w-1/2 h-3 bg-stone-200 rounded"></div>
                </div>
                <div className="hidden lg:flex flex-initial w-[220px] items-center justify-center">
                  <div className="w-20 h-5 bg-stone-200 rounded"></div>
                </div>
                <div className="flex-initial min-w-[120px] w-[250px] flex items-center justify-center">
                  <div className="w-24 h-10 bg-stone-200 rounded"></div>
                </div>
                <div className="hidden md:flex flex-initial min-w-[50px] w-[300px] items-center justify-center">
                  <div className="w-20 h-5 bg-stone-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>

          {/* Skeleton for Subtotal and Checkout */}
          <div className="flex flex-col items-end w-full h-fit gap-3 mt-4 animate-pulse">
            <div className="w-48 h-6 bg-stone-200 rounded"></div>
            <div className="w-32 h-10 bg-stone-200 rounded"></div>
          </div>
        </div>
      )}
    </>
  );
};

export default CartListing;
