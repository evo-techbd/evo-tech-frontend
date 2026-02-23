"use client";

import Image from "next/image";
import Link from "next/link";
import { currencyFormatBDT } from "@/lib/all_utils";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/store/store";
import { setCartData } from "@/store/slices/cartslice";
import { toast } from "sonner";
import { type SubmitHandler, useForm, Controller } from "react-hook-form";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/evo_popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/evo_command";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { checkoutSchema } from "@/schemas";
import type { CartItem } from "@/schemas/cartSchema";
import { EvoFormInputError } from "@/components/error/form-input-error";
import { districtsOfBD } from "@/utils/bd_districts";
import { IoChevronDown, IoCheckmark } from "react-icons/io5";
import { useEffect, useMemo, useState } from "react";
import axios from "@/utils/axios/axios";
import createAxiosClient from "@/utils/axios/axiosClient";
import axiosErrorLogger from "@/components/error/axios_error";
import { useRouter } from "next/navigation";
import { calculatePayment } from "./checkout_payment_calc";
import { useCurrentUser } from "@/hooks/use-current-user";
import { validateCoupon } from "@/actions/user/coupons";
import { applyCoupon, removeCoupon } from "@/store/slices/discountSlice";
import { summarizeCartStock, assessCartItemStock } from "@/utils/cart-stock";
import { HiMiniExclamationTriangle } from "react-icons/hi2";
import { PiInfoBold } from "react-icons/pi";

type CheckoutFormValuesType = z.infer<typeof checkoutSchema>;

const CheckoutParts = () => {
  const [isCityPopoverOpen, setIsCityPopoverOpen] = useState(false);
  const [deliveryCharge, setDeliveryCharge] = useState<number | null>(null);
  const [couponCode, setCouponCode] = useState("");
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const cartItems = useSelector(
    (state: RootState) => state.shoppingcart.cartdata,
  );
  const discountAmount = useSelector(
    (state: RootState) => state.discount.discountAmount,
  );
  const appliedCouponCode = useSelector(
    (state: RootState) => state.discount.couponCode,
  );
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const currentUser = useCurrentUser();
  const isAuthenticated = !!currentUser;
  const {
    register,
    control,
    watch,
    setValue,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CheckoutFormValuesType>({
    defaultValues: {
      city: "",
      country: "Bangladesh",
      terms: false,
      paymentMethod: "",
      pickupPointId: "",
      transactionId: "",
      email: "",
      phone: "",
    },
    resolver: zodResolver(checkoutSchema),
  });

  // Auto-populate email and phone for logged-in users
  useEffect(() => {
    if (currentUser) {
      if (currentUser.email) {
        setValue("email", currentUser.email);
      }
      if (currentUser.phone) {
        setValue("phone", currentUser.phone);
      }
    }
  }, [currentUser, setValue]);

  const paymentMethod = watch("paymentMethod");
  const shippingType = watch("shippingType");
  const cityValue = watch("city");

  // Log validation errors when they change
  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      // console.log("❌ Form validation errors:", errors);
    }
  }, [errors]);

  const {
    cartSubTotal,
    chargeforWeight,
    codCharge,
    bKashCharge,
    preOrderSubtotal,
    preOrderDepositDue,
    preOrderBalanceDue,
    dueNowSubtotal,
    hasPreOrderItems,
    preOrderItemsCount,
    regularSubtotal,
  } = useMemo(() => {
    return calculatePayment(cartItems ?? [], paymentMethod, cityValue);
  }, [cartItems, paymentMethod, cityValue]);

  const totalPayableAmount = useMemo(() => {
    return (
      cartSubTotal + (deliveryCharge ?? 0) + codCharge + bKashCharge - (discountAmount ?? 0)
    );
  }, [cartSubTotal, deliveryCharge, codCharge, bKashCharge, discountAmount]);

  const dueNowTotal = useMemo(() => {
    const baseAmount =
      dueNowSubtotal +
      (deliveryCharge ?? 0) +
      codCharge +
      bKashCharge -
      (discountAmount ?? 0);
    return Math.max(Math.round(baseAmount * 100) / 100, 0);
  }, [dueNowSubtotal, deliveryCharge, codCharge, bKashCharge, discountAmount]);

  const payLaterAmount = hasPreOrderItems ? preOrderBalanceDue : 0;

  const cartStockSummary = useMemo(
    () => summarizeCartStock(cartItems ?? []),
    [cartItems],
  );

  const isPlaceOrderDisabled =
    isSubmitting || cartStockSummary.hasBlockingIssues;

  // delivery charge calculation
  useEffect(() => {
    const isPickupOrExpress =
      shippingType === "pickup_point" || shippingType === "express_delivery";

    // Delivery charge based on shipping type: regular delivery uses weight-based charge, pickup/express = 0
    const delCharge = !cityValue
      ? null
      : isPickupOrExpress
        ? 0
        : shippingType === "regular_delivery"
          ? chargeforWeight // Weight-based shipping charge for all payment methods
          : null;

    setDeliveryCharge(delCharge);
  }, [shippingType, chargeforWeight, cityValue]);

  useEffect(() => {
    // Reset to default when shipping type changes
    if (shippingType) {
      // Reset payment method to trigger re-selection
      setValue("paymentMethod", "");

      // Reset pickup point ID
      setValue("pickupPointId", "");

      // Reset transaction ID since it's tied to payment method
      setValue("transactionId", "");
    }
  }, [shippingType, setValue]);

  const onSubmit: SubmitHandler<CheckoutFormValuesType> = async (data) => {
    // console.log("🚀 Place Order button clicked! Form data:", data);
    // console.log("💰 Cart calculations:", {
    //   cartSubTotal,
    //   deliveryCharge,
    //   bKashCharge,
    //   discountAmount,
    //   totalPayableAmount,
    //   dueNowTotal,
    //   preOrderSubtotal,
    //   preOrderDepositDue,
    //   preOrderBalanceDue,
    //   cartItems: cartItems?.length || 0,
    // });

    const localevoFrontCart = localStorage.getItem("evoFrontCart");
    const parsedCart = localevoFrontCart ? JSON.parse(localevoFrontCart) : null;

    let cartReqBody = {};
    if (parsedCart && parsedCart.ctoken) {
      cartReqBody = {
        cart_t: parsedCart.ctoken,
      };
    }

    const checkoutDetails = {
      firstname: data.fullName,
      lastname: "", // Not collected anymore
      phone: data.phone,
      email: data.email,
      houseStreet: data.address, // Renamed from housestreet to address
      city: districtsOfBD.find((district) => district.key === data.city)
        ?.itemvalue,
      subdistrict: data.subdistrict,
      postcode: "", // Not collected anymore
      country: data.country,
      notes: data.notes,
      shippingType: data.shippingType,
      pickupPointId:
        data.pickupPointId && data.pickupPointId !== ""
          ? data.pickupPointId
          : "",
      paymentMethod: data.paymentMethod,
      transactionId:
        data.transactionId && data.transactionId !== ""
          ? data.transactionId
          : "",
      terms: data.terms, // Fixed: Send boolean true/false instead of string
      subtotal: cartSubTotal || 0, // Fixed: Use proper field name and ensure it's a number
      discount: discountAmount || 0,
      couponCode: appliedCouponCode || undefined, // Include applied coupon code
      deliveryCharge: deliveryCharge ?? 0,
      additionalCharge: (codCharge ?? 0) + (bKashCharge ?? 0),
      totalPayable: totalPayableAmount || 0, // Fixed: Ensure it's a number, not NaN
      items: cartItems ? cartItems : [],
    };

    // Determine endpoint based on authentication status
    const orderEndpoint = isAuthenticated ? "/orders" : "/orders/guest";
    // console.log(
    //   "📡 Sending order to:",
    //   orderEndpoint,
    //   "| Authenticated:",
    //   isAuthenticated
    // );
    // console.log("📦 Order details:", checkoutDetails);

    // Log the exact request body being sent
    const requestBody = {
      ...checkoutDetails,
      ...cartReqBody,
    };
    // console.log("📤 Final request body:", requestBody);
    // console.log("🔢 Payment fields in request:", {
    //   subtotal: requestBody.subtotal,
    //   subtotalType: typeof requestBody.subtotal,
    //   totalPayable: requestBody.totalPayable,
    //   totalPayableType: typeof requestBody.totalPayable,
    //   deliveryCharge: requestBody.deliveryCharge,
    //   additionalCharge: requestBody.additionalCharge,
    // });

    // Use authenticated axios instance if user is logged in, otherwise use guest axios
    const axiosInstance = isAuthenticated ? await createAxiosClient() : axios;

    let lastOrderErrorMessage = "";

    const orderResponse = await axiosInstance
      .post(orderEndpoint, requestBody)
      .then((res) => {
        return res.data;
      })
      .catch((error: any) => {
        console.error("❌ Order failed:", error);
        axiosErrorLogger({ error });
        lastOrderErrorMessage =
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message ||
          "";
        return error?.response?.data ?? null;
      });

    // Check for successful order response
    if (orderResponse && orderResponse.success && orderResponse.data?.order) {
      const order = orderResponse.data.order;

      // Show success toast
      toast.success("Order placed successfully!");

      // Clear cart
      dispatch(setCartData([]));
      localStorage.setItem(
        "evoFrontCart",
        JSON.stringify({ items: [], ctoken: orderResponse.ctoken || "" }),
      );
      const event = new CustomEvent("localStorageChange", {
        detail: {
          key: "evoFrontCart",
          newValue: { items: [], ctoken: orderResponse.ctoken || "" },
        },
      });
      window.dispatchEvent(event);

      // AUTOMATIC BKASH PAYMENT GATEWAY - COMMENTED FOR MANUAL TRANSACTION ID FLOW
      // TODO: Re-enable this when automatic bKash payment gateway is needed
      /*
      // If bKash payment is selected, initiate payment gateway
      if (data.paymentMethod === "bkash") {
        try {

          // Use guest endpoint if not authenticated, otherwise use authenticated endpoint
          const bkashEndpoint = isAuthenticated
            ? "/payment/bkash/create"
            : "/payment/bkash/create/guest";


          // Create bKash payment - use authenticated axios if user is logged in
          const paymentResponse = await axiosInstance
            .post(bkashEndpoint, {
              amount: order.totalPayable,
              orderId: order._id,
            })
            .then((res) => {
              return res.data;
            })
            .catch((error: any) => {
              console.error("❌ bKash payment creation failed:", error);
              axiosErrorLogger({ error });
              return null;
            });

          if (
            paymentResponse &&
            paymentResponse.success &&
            paymentResponse.data?.bkashURL
          ) {
            toast.success("Redirecting to bKash payment...");

            // Small delay to show toast before redirect
            setTimeout(() => {
              window.location.href = paymentResponse.data.bkashURL;
            }, 1000);
            return;
          } else {
            toast.error(
              "Failed to initiate bKash payment. Redirecting to order page..."
            );
            // Still redirect to order page
            setTimeout(() => {
              router.push(`/order/${order._id}`);
            }, 1500);
          }
        } catch (error) {
          toast.error("Failed to initiate bKash payment");
          // Redirect to order page anyway
          setTimeout(() => {
            router.push(`/order/${order._id}`);
          }, 1500);
        }
      } else {
        // For other payment methods, redirect to order confirmation page
        setTimeout(() => {
          router.push(`/order/${order._id}`);
        }, 1500);
      }
      */

      // MANUAL TRANSACTION ID FLOW (Current Implementation)
      // Redirect to track order page with tracking code
      const trackingCode = order.trackingCode || order.trackingId || "";

      if (trackingCode) {
        toast.success("Redirecting to order tracking...");
        setTimeout(() => {
          router.push(`/track-order?code=${encodeURIComponent(trackingCode)}`);
        }, 1500);
      } else {
        // Fallback to order page if no tracking code
        setTimeout(() => {
          router.push(`/order/${order._id}`);
        }, 1500);
      }
    } else {
      const backendMessage =
        lastOrderErrorMessage ||
        orderResponse?.message ||
        orderResponse?.error ||
        "";
      toast.error(
        backendMessage ||
        "Sorry! Order could not be placed. Please review your cart and try again.",
      );
    }
  };

  const handleCitySelection = (cityKey: string) => {
    setValue("city", cityKey);
    setIsCityPopoverOpen(false); // close the popover after selection
  };

  // implement coupon code apply functionality
  const handleCouponApply = async () => {
    if (!couponCode.trim()) {
      toast.error("Please enter a coupon code");
      return;
    }

    if (cartSubTotal === 0) {
      toast.error("Your cart is empty");
      return;
    }

    setIsApplyingCoupon(true);

    try {
      const result = await validateCoupon(couponCode.trim(), cartSubTotal);

      if (result.success && result.data) {
        dispatch(
          applyCoupon({
            code: result.data.code,
            amount: result.data.discountAmount,
            type: result.data.discountType,
          }),
        );
        toast.success(`Coupon "${result.data.code}" applied successfully!`);
      } else {
        toast.error(result.error || "Invalid coupon code");
      }
    } catch (error) {
      toast.error("Failed to apply coupon. Please try again.");
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    dispatch(removeCoupon());
    setCouponCode("");
    toast.success("Coupon removed");
  };

  if (!cartItems) {
    return (
      <div className="flex flex-col items-center md:flex-row md:justify-start md:items-start w-full h-fit gap-5 animate-pulse">
        <div className="flex flex-col w-full h-fit gap-4 pb-3 sm:pb-5">
          <div className="flex max-[300px]:flex-col w-full h-fit gap-x-2 gap-y-4">
            <div className="w-full h-[40px] bg-stone-300 rounded"></div>
            <div className="w-full h-[40px] bg-stone-300 rounded"></div>
          </div>
          <div className="flex max-[410px]:flex-col w-full h-fit gap-x-2 gap-y-4">
            <div className="w-full h-[40px] bg-stone-300 rounded"></div>
            <div className="w-full h-[40px] bg-stone-300 rounded"></div>
          </div>
          <div className="relative w-full h-fit pt-1.5">
            <div className="w-full h-[40px] bg-stone-300 rounded"></div>
          </div>
          <div className="flex max-[410px]:flex-col w-full h-fit gap-x-2 gap-y-4">
            <div className="w-full h-[40px] bg-stone-300 rounded"></div>
            <div className="w-full h-[40px] bg-stone-300 rounded"></div>
          </div>
          <div className="flex max-[410px]:flex-col w-full h-fit gap-x-2 gap-y-4">
            <div className="w-full h-[40px] bg-stone-300 rounded"></div>
            <div className="w-full h-[40px] bg-stone-300 rounded"></div>
          </div>
          <div className="relative w-full h-fit">
            <div className="w-full h-[96px] bg-stone-300 rounded"></div>
          </div>

          <div className="w-[116px] h-[24px] mt-5 bg-stone-300 rounded"></div>
          <div className="flex flex-col w-full h-fit py-2 gap-2.5 border-t border-stone-300">
            <div className="w-[110px] h-[24px] bg-stone-300 rounded"></div>
            <div className="w-[110px] h-[24px] bg-stone-300 rounded"></div>
            <div className="w-[100px] h-[24px] bg-stone-300 rounded"></div>
          </div>
          <div className="w-[124px] h-[24px] mt-5 bg-stone-300 rounded"></div>
          <div className="flex flex-col w-full h-fit py-2 gap-2.5 border-t border-stone-300">
            <div className="w-[116px] h-[24px] bg-stone-300 rounded"></div>
            <div className="w-[70px] h-[24px] bg-stone-300 rounded"></div>
            <div className="w-[100px] h-[24px] bg-stone-300 rounded"></div>
          </div>
          <div className="flex flex-col w-full h-fit py-0.5 mt-5">
            <div className="w-[170px] h-[24px] bg-stone-300 rounded"></div>
          </div>
        </div>

        <div className="flex flex-col w-full md:max-w-[280px] min-[900px]:max-w-[350px] lg:max-w-[400px] min-[1250px]:max-w-[450px] h-fit gap-2 px-5 lg:px-8 py-1">
          <div className="flex flex-col w-full h-[220px] py-3 bg-stone-300 rounded"></div>
          <div className="flex w-full h-10 bg-stone-300 rounded"></div>
          <div className="flex flex-col w-full h-fit gap-2 py-2 border-t border-stone-300">
            <div className="flex w-full h-7 bg-stone-300 rounded"></div>
            <div className="flex w-full h-7 bg-stone-300 rounded"></div>
            <div className="flex w-full h-7 bg-stone-300 rounded"></div>
          </div>
          <div className="flex flex-col w-full h-fit gap-2 py-2 border-t border-stone-300">
            <div className="flex w-full h-7 bg-stone-300 rounded"></div>
          </div>
          <div className="flex justify-center w-44 h-9 bg-stone-300 rounded-[6px] overflow-hidden"></div>
        </div>
      </div>
    );
  }
  if (cartItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-[300px]">
        <p className="text-[13px] sm:text-[14px] leading-6 text-stone-800">{`Cart is empty!`}</p>
        <Link
          href="/products-and-accessories"
          className="w-fit h-fit mt-6 px-4 py-1 rounded-[6px] border border-stone-800 hover:border-stone-600 text-[13px] sm:text-[14px] leading-6 text-stone-100 bg-stone-800 hover:bg-stone-600 transition-colors duration-100 ease-linear"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  const onInvalidSubmit = (errors: any) => {
    // console.log("❌ Form submission blocked due to validation errors:", errors);
    toast.error("Please fill in all required fields correctly");
  };

  return (
    <>
      {(cartStockSummary.hasBlockingIssues ||
        cartStockSummary.warningIssues.length > 0) && (
          <div className="flex w-full flex-col gap-3 rounded-md border border-stone-200 bg-white/60 p-4 mb-2">
            {cartStockSummary.hasBlockingIssues && (
              <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                <p className="flex items-center gap-2 text-[13px] font-semibold">
                  <HiMiniExclamationTriangle className="h-4 w-4" />
                  Resolve stock issues to place your order
                </p>
                <ul className="mt-2 space-y-1 text-[12px]">
                  {cartStockSummary.blockingIssues.map((issue) => (
                    <li key={`checkout-stock-blocker-${issue.itemId}`}>
                      <span className="font-semibold">{issue.itemName}</span>{" "}
                      {issue.isOutOfStock
                        ? "is currently out of stock."
                        : `has only ${issue.availableStock ?? 0} unit${(issue.availableStock ?? 0) === 1 ? "" : "s"
                        } left. Please lower the quantity.`}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {!cartStockSummary.hasBlockingIssues &&
              cartStockSummary.warningIssues.length > 0 && (
                <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                  <p className="flex items-center gap-2 text-[13px] font-semibold">
                    <PiInfoBold className="h-4 w-4" />
                    Low stock reminder
                  </p>
                  <ul className="mt-2 space-y-1 text-[12px]">
                    {cartStockSummary.warningIssues.map((issue) => (
                      <li key={`checkout-stock-warning-${issue.itemId}`}>
                        <span className="font-semibold">{issue.itemName}</span>{" "}
                        {`has only ${issue.availableStock ?? 0} left.`}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
          </div>
        )}

      <div className="relative flex flex-col items-center md:flex-row md:justify-start md:items-start w-full h-fit gap-5">
        <form
          id="checkoutform"
          onSubmit={handleSubmit(onSubmit, onInvalidSubmit)}
          className="flex flex-col items-center w-full h-fit gap-4 pb-3 sm:pb-5"
        >
          <h3 className="flex items-center w-full h-fit text-center text-[14px] sm:text-[15px] leading-6 font-[600] text-stone-800">
            <span className="flex justify-center items-center w-5 h-5 text-[13px] leading-4 mr-1.5 text-stone-700 bg-stone-200 rounded-full">
              1
            </span>
            Customer Information
          </h3>

          <div className="relative w-full h-fit pt-1.5">
            <input
              type="text"
              id="fullName"
              {...register("fullName")}
              placeholder="Enter your name"
              autoCorrect="off"
              spellCheck="false"
              className="peer w-full h-[40px] custom-input-style1 hover:border-[#0866FF] hover:border-t-transparent"
            />
            <label
              htmlFor="fullName"
              className="custom-floating-label1 text-[11px] sm:text-[12px] font-[600] leading-3 text-stone-500 before:border-stone-400 peer-focus:before:border-[#0866FF] after:border-stone-400 peer-focus:after:border-[#0866FF] peer-focus:text-[#0866FF] peer-hover:before:border-[#0866FF] peer-hover:after:border-[#0866FF] peer-hover:text-[#0866FF] peer-disabled:before:border-stone-300 peer-disabled:after:border-stone-300"
            >
              {`Name*`}
            </label>
            {errors.fullName && (
              <EvoFormInputError>{errors.fullName.message}</EvoFormInputError>
            )}
          </div>

          <div className="flex max-[410px]:flex-col w-full h-fit gap-x-2 gap-y-4">
            <div className="relative w-full h-fit pt-1.5">
              <input
                type="text"
                id="phone"
                {...register("phone")}
                placeholder="Enter Phone No"
                autoCorrect="off"
                inputMode="tel"
                autoComplete="tel"
                className="peer w-full h-[40px] custom-input-style1 hover:border-[#0866FF] hover:border-t-transparent"
              />
              <label
                htmlFor="phone"
                className="custom-floating-label1 text-[11px] sm:text-[12px] font-[600] leading-3 text-stone-500 before:border-stone-400 peer-focus:before:border-[#0866FF] after:border-stone-400 peer-focus:after:border-[#0866FF] peer-focus:text-[#0866FF] peer-hover:before:border-[#0866FF] peer-hover:after:border-[#0866FF] peer-hover:text-[#0866FF] peer-disabled:before:border-stone-300 peer-disabled:after:border-stone-300"
              >
                {`Phone*`}
              </label>
              {errors.phone && (
                <EvoFormInputError>{errors.phone.message}</EvoFormInputError>
              )}
            </div>

            <div className="relative w-full h-fit pt-1.5">
              <input
                type="text"
                id="email"
                {...register("email")}
                placeholder="Enter email"
                autoCorrect="off"
                spellCheck="false"
                inputMode="email"
                autoComplete="email"
                className="peer w-full h-[40px] custom-input-style1 hover:border-[#0866FF] hover:border-t-transparent"
              />
              <label
                htmlFor="email"
                className="custom-floating-label1 text-[11px] sm:text-[12px] font-[600] leading-3 text-stone-500 before:border-stone-400 peer-focus:before:border-[#0866FF] after:border-stone-400 peer-focus:after:border-[#0866FF] peer-focus:text-[#0866FF] peer-hover:before:border-[#0866FF] peer-hover:after:border-[#0866FF] peer-hover:text-[#0866FF] peer-disabled:before:border-stone-300 peer-disabled:after:border-stone-300"
              >
                {`Email`}
              </label>
              {errors.email && (
                <EvoFormInputError>{errors.email.message}</EvoFormInputError>
              )}
            </div>
          </div>

          <div className="relative w-full h-fit pt-1.5">
            <input
              type="text"
              id="address"
              {...register("address")}
              placeholder="Enter your address"
              autoCorrect="off"
              spellCheck="false"
              className="peer w-full h-[40px] custom-input-style1 hover:border-[#0866FF] hover:border-t-transparent"
            />
            <label
              htmlFor="address"
              className="custom-floating-label1 text-[11px] sm:text-[12px] font-[600] leading-3 text-stone-500 before:border-stone-400 peer-focus:before:border-[#0866FF] after:border-stone-400 peer-focus:after:border-[#0866FF] peer-focus:text-[#0866FF] peer-hover:before:border-[#0866FF] peer-hover:after:border-[#0866FF] peer-hover:text-[#0866FF] peer-disabled:before:border-stone-300 peer-disabled:after:border-stone-300"
            >
              {`Address*`}
            </label>
            {errors.address && (
              <EvoFormInputError>{errors.address.message}</EvoFormInputError>
            )}
          </div>

          <div className="flex max-[410px]:flex-col w-full h-fit gap-x-2 gap-y-4">
            <div className="relative w-full h-fit pt-1.5">
              <Controller
                name="city"
                control={control}
                render={({ field }) => (
                  <Popover
                    open={isCityPopoverOpen}
                    onOpenChange={setIsCityPopoverOpen}
                  >
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        aria-label={`city or district`}
                        className={`peer/city relative z-[0] flex items-center w-full h-[40px] text-[12px] leading-4 font-[500] ${field.value ? `text-stone-900` : `text-stone-400`
                          } px-2 py-1 bg-stone-100 border rounded-[4px] border-stone-400 border-t-transparent overflow-hidden focus-visible:outline-none focus-visible:border-x-[#0866FF] focus-visible:border-t-transparent focus-visible:border-b-[#0866FF] hover:border-x-[#0866FF] hover:border-t-transparent hover:border-b-[#0866FF]`}
                      >
                        <p className="w-full h-fit text-left truncate capitalize">
                          {field.value
                            ? districtsOfBD.find(
                              (district) => district.key === field.value,
                            )?.itemvalue
                            : `Select city/district`}
                        </p>
                        <div className="absolute z-0 inset-y-0 right-0 flex items-center w-fit px-1 py-1 bg-stone-100">
                          <IoChevronDown className="inline w-[14px] h-[14px] text-stone-700" />
                        </div>
                      </button>
                    </PopoverTrigger>

                    <PopoverContent
                      sideOffset={10}
                      className="w-[150px] sm:w-[250px] h-fit p-1 bg-stone-50 border-stone-300 shadow-md"
                    >
                      <Command>
                        <CommandInput
                          placeholder="Find city..."
                          className="h-9"
                        />
                        <CommandList className="max-h-[180px] scrollbar-custom">
                          <CommandEmpty>{`City not found.`}</CommandEmpty>
                          <CommandGroup>
                            {districtsOfBD
                              .sort((a, b) => a.key.localeCompare(b.key))
                              .map((districtItem) => (
                                <CommandItem
                                  key={districtItem.key}
                                  value={districtItem.key}
                                  onSelect={() => {
                                    field.onChange(districtItem.key);
                                    handleCitySelection(districtItem.key);
                                  }}
                                  className={`font-[500] tracking-tight ${districtItem.key === field.value
                                      ? "text-[#0866FF]"
                                      : "text-stone-600"
                                    }`}
                                >
                                  {districtItem.itemvalue}
                                  <IoCheckmark
                                    className={`inline w-4 h-4 ml-auto ${districtItem.key === field.value
                                        ? "text-[#0866FF] opacity-100"
                                        : "text-transparent opacity-0"
                                      }`}
                                  />
                                </CommandItem>
                              ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                )}
              />
              <p
                id="citylabel"
                className="custom-floating-label1 text-[11px] sm:text-[12px] font-[600] leading-3 text-stone-700 before:border-stone-400 after:border-stone-400 peer-focus-visible/city:before:border-[#0866FF] peer-focus-visible/city:after:border-[#0866FF] peer-focus-visible/city:text-[#0866FF] peer-hover/city:before:border-[#0866FF] peer-hover/city:after:border-[#0866FF] peer-hover/city:text-[#0866FF] peer-disabled/city:before:border-stone-300 peer-disabled/city:after:border-stone-300"
              >
                {`City/District*`}
              </p>
              {errors.city && (
                <EvoFormInputError>{errors.city.message}</EvoFormInputError>
              )}
            </div>

            <div className="relative w-full h-fit pt-1.5">
              <input
                type="text"
                id="country"
                {...register("country")}
                placeholder="Enter country"
                autoCorrect="off"
                disabled
                autoComplete="off"
                className="peer w-full h-[40px] custom-input-style1 disabled:cursor-default"
              />
              <label
                htmlFor="country"
                className="custom-floating-label1 text-[11px] sm:text-[12px] font-[600] leading-3 text-stone-500 before:border-stone-400 peer-focus:before:border-[#0866FF] after:border-stone-400 peer-focus:after:border-[#0866FF] peer-focus:text-[#0866FF] peer-disabled:before:border-stone-300 peer-disabled:after:border-stone-300"
              >
                {`Country*`}
              </label>
              {errors.country && (
                <EvoFormInputError>{errors.country.message}</EvoFormInputError>
              )}
            </div>
          </div>

          <div className="relative w-full h-fit pt-4">
            <textarea
              id="notes"
              {...register("notes")}
              placeholder="Enter any notes"
              autoCorrect="off"
              spellCheck="false"
              className="peer w-full h-[90px] custom-textarea-style1 resize-none"
            />
            <label
              htmlFor="notes"
              className="absolute top-0 left-2.5 text-[11px] sm:text-[12px] font-[600] leading-3 text-stone-500 peer-focus:text-[#0866FF] peer-disabled:text-stone-400"
            >
              {`Notes (optional)`}
            </label>
            {errors.notes && (
              <EvoFormInputError>{errors.notes.message}</EvoFormInputError>
            )}
          </div>

          <h3 className="flex items-center w-full h-fit mt-5 text-center text-[14px] sm:text-[15px] leading-6 font-[600] text-stone-900">
            <span className="flex justify-center items-center w-5 h-5 text-[13px] leading-4 mr-1.5 text-[#0866FF] bg-[#0866FF]/15 rounded-full">
              2
            </span>
            {`Shipping Type*`}
          </h3>

          <div className="flex flex-col w-full h-fit py-2 gap-2.5 border-t border-stone-300">
            <div className="flex items-center w-full h-fit py-0.5">
              <input
                type="radio"
                id="regular_delivery"
                {...register("shippingType")}
                value="regular_delivery"
                className="mr-2 accent-stone-800"
              />
              <label
                htmlFor="regular_delivery"
                className="text-[12px] sm:text-[13px] font-[600] text-stone-700"
              >
                Regular Delivery
              </label>
            </div>

            <div className="flex items-center w-full h-fit py-0.5">
              <input
                type="radio"
                id="express_delivery"
                {...register("shippingType")}
                value="express_delivery"
                className="mr-2 accent-stone-800"
              />
              <label
                htmlFor="express_delivery"
                className="text-[12px] sm:text-[13px] font-[600] text-stone-700"
              >
                Express Delivery
              </label>
            </div>

            <div className="flex items-center w-full h-fit py-0.5">
              <input
                type="radio"
                id="pickup_point"
                {...register("shippingType")}
                value="pickup_point"
                className="mr-2 accent-stone-800"
              />
              <label
                htmlFor="pickup_point"
                className="text-[12px] sm:text-[13px] font-[600] text-stone-700"
              >
                Pickup Point
              </label>
            </div>

            {errors.shippingType && (
              <EvoFormInputError>
                {errors.shippingType.message}
              </EvoFormInputError>
            )}

            {/* Pickup Point Selection */}
            {watch("shippingType") === "pickup_point" && (
              <div className="flex flex-col w-full h-fit mt-2 p-2 rounded-[4px] border border-stone-300">
                <h4 className="text-[11px] sm:text-[12px] font-[600] text-stone-700 mb-2">
                  Select Pickup Point:
                </h4>

                <div className="flex items-center w-full h-fit py-1">
                  <input
                    type="radio"
                    id="pickup_101"
                    {...register("pickupPointId")}
                    value="101"
                    className="mr-2 accent-stone-800"
                  />
                  <label
                    htmlFor="pickup_101"
                    className="text-[11px] sm:text-[12px] font-[500] text-stone-600"
                  >
                    {`65/15, Shwapnokunzo, Tonartek, Vashantek, Dhaka Cantt., Dhaka-1206`}
                  </label>
                </div>

                {errors.pickupPointId && (
                  <EvoFormInputError>
                    {errors.pickupPointId.message}
                  </EvoFormInputError>
                )}
              </div>
            )}

            {shippingType ? (
              <div className="w-full h-fit border-b border-stone-300">
                <p className="w-full h-fit text-[11px] sm:text-[12px] font-[400] text-[#687069]">
                  {shippingType === "pickup_point" ? (
                    "Pickup available during business hours. (10:00 AM - 6:00 PM)"
                  ) : shippingType === "express_delivery" ? (
                    <span>
                      {`Your order will be delivered within 06-12 hours `}
                      <br />
                      {`(only inside Dhaka, delivery charge may vary according to the location).`}
                    </span>
                  ) : (
                    "Usually takes 1-2 days inside Dhaka and 2-5 days outside Dhaka."
                  )}
                </p>
              </div>
            ) : null}
          </div>

          {shippingType && (
            <>
              <h3 className="flex items-center w-full h-fit text-center text-[14px] sm:text-[15px] leading-6 font-[600] text-stone-900">
                <span className="flex justify-center items-center w-5 h-5 text-[13px] leading-4 mr-1.5 text-[#0866FF] bg-[#0866FF]/15 rounded-full">
                  3
                </span>
                {`Payment Method*`}
              </h3>

              <div className="flex flex-col w-full h-fit py-2 gap-2.5 border-t border-stone-300">
                {shippingType !== "pickup_point" &&
                  shippingType !== "express_delivery" && (
                    <div className="flex items-center w-full h-fit py-0.5">
                      <input
                        type="radio"
                        id="cod"
                        {...register("paymentMethod")}
                        value="cod"
                        className="mr-2 accent-stone-800"
                      />
                      <label
                        htmlFor="cod"
                        className="text-[12px] sm:text-[13px] font-[600] text-stone-700"
                      >
                        Cash on Delivery
                      </label>
                    </div>
                  )}

                {shippingType === "pickup_point" && (
                  <div className="flex items-center w-full h-fit py-0.5">
                    <input
                      type="radio"
                      id="cop"
                      {...register("paymentMethod")}
                      value="cop"
                      className="mr-2 accent-stone-800"
                    />
                    <label
                      htmlFor="cop"
                      className="text-[12px] sm:text-[13px] font-[600] text-stone-700"
                    >
                      Cash on Pickup
                    </label>
                  </div>
                )}

                <div className="flex items-center w-full h-fit py-0.5">
                  <input
                    type="radio"
                    id="bkash"
                    {...register("paymentMethod")}
                    value="bkash"
                    className="mr-2 accent-stone-800"
                  />
                  <label
                    htmlFor="bkash"
                    className="text-[12px] sm:text-[13px] font-[600] text-stone-700"
                  >
                    bKash
                  </label>
                </div>

                <div className="flex items-center w-full h-fit py-0.5">
                  <input
                    type="radio"
                    id="bank_transfer"
                    {...register("paymentMethod")}
                    value="bank_transfer"
                    className="mr-2 accent-stone-800"
                  />
                  <label
                    htmlFor="bank_transfer"
                    className="text-[12px] sm:text-[13px] font-[600] text-stone-700"
                  >
                    Bank Transfer
                  </label>
                </div>

                {errors.paymentMethod && (
                  <EvoFormInputError>
                    {errors.paymentMethod.message}
                  </EvoFormInputError>
                )}

                {/* bKash Manual Payment (Similar to Bank Transfer) */}
                {paymentMethod === "bkash" && (
                  <div className="flex flex-col w-full h-fit mt-2 p-3 rounded-[4px] border border-[#E2136E] bg-gradient-to-br from-[#E2136E]/5 to-transparent gap-2">
                    <div className="flex flex-col w-full h-fit py-2 gap-1">
                      <p className="text-[11px] sm:text-[12px] font-[600] leading-4 text-[#E2136E]">
                        {`Payment Instruction:`}
                      </p>

                      <div className="text-[11px] sm:text-[12px] font-[500] leading-4 text-stone-700">
                        <ul className="list-disc list-inside space-y-1">
                          <li>
                            {`Send Money to: `}
                            <span className="text-[#E2136E] font-semibold">{`01761490093`}</span>
                          </li>
                          <li>
                            {`Account Type: `}
                            <span className="text-[#E2136E] font-semibold">{`Personal`}</span>
                          </li>
                          <li>
                            {`Payable amount: `}
                            <span className="text-[#E2136E] font-semibold">{`${currencyFormatBDT(
                              totalPayableAmount,
                            )} BDT`}</span>
                          </li>
                          <li>
                            {`After completing the payment, enter your `}
                            <span className="text-[#E2136E] font-semibold">{`Transaction ID (TrxID)`}</span>
                            {` below.`}
                          </li>
                          <li>{`Once your order is placed, payment status will be updated in a while.`}</li>
                          <li>{`Orders will be processed and shipped only after the payment has been successfully received.`}</li>
                        </ul>
                      </div>
                    </div>

                    <div className="relative w-full h-fit pt-1.5">
                      <input
                        type="text"
                        id="bkashTranId"
                        {...register("transactionId")}
                        placeholder="Enter TrxID"
                        autoCorrect="off"
                        spellCheck="false"
                        className="peer w-full h-[40px] custom-input-style1"
                      />
                      <label
                        htmlFor="bkashTranId"
                        className="custom-floating-label1 text-[11px] sm:text-[12px] font-[600] leading-3 text-stone-500 before:border-stone-400 peer-focus:before:border-[#E2136E] after:border-stone-400 peer-focus:after:border-[#E2136E] peer-focus:text-[#E2136E] peer-disabled:before:border-stone-300 peer-disabled:after:border-stone-300"
                      >
                        {`Transaction ID`}
                      </label>
                      {errors.transactionId && (
                        <EvoFormInputError>
                          {errors.transactionId.message}
                        </EvoFormInputError>
                      )}
                    </div>
                  </div>
                )}

                {/* Bank Transfer Manual Payment */}
                {paymentMethod === "bank_transfer" && (
                  <div className="flex flex-col w-full h-fit mt-2 p-3 rounded-[4px] border border-[#1e40af] bg-gradient-to-br from-[#1e40af]/5 to-transparent gap-2">
                    <div className="flex flex-col w-full h-fit py-2 gap-1">
                      <p className="text-[11px] sm:text-[12px] font-[600] leading-4 text-[#1e40af]">
                        {`Payment Instruction:`}
                      </p>

                      <div className="text-[11px] sm:text-[12px] font-[500] leading-4 text-stone-700">
                        <ul className="list-disc list-inside space-y-1">
                          <li>
                            {`Bank Name: `}
                            <span className="text-[#1e40af] font-semibold">{`Islami Bank Bangladesh PLC.`}</span>
                          </li>
                          <li>
                            {`Branch: `}
                            <span className="text-[#1e40af] font-semibold">{`Cantonment Branch, Dhaka`}</span>
                          </li>
                          <li>
                            {`Name: `}
                            <span className="text-[#1e40af] font-semibold">{`EVO TECH BANGLADESH`}</span>
                          </li>
                          <li>
                            {`Account No: `}
                            <span className="text-[#1e40af] font-semibold">{`20507770101133583`}</span>
                          </li>
                          <li>
                            {`Payable amount: `}
                            <span className="text-[#1e40af] font-semibold">{`${currencyFormatBDT(
                              totalPayableAmount,
                            )} BDT`}</span>
                          </li>
                          <li>
                            {`After completing the payment, enter your `}
                            <span className="text-[#1e40af] font-semibold">{`Transaction ID`}</span>
                            {` below.`}
                          </li>
                          <li>{`Once your order is placed, payment status will be updated in a while.`}</li>
                          <li>{`Orders will be processed and shipped only after the payment has been successfully received.`}</li>
                        </ul>
                      </div>
                    </div>

                    <div className="relative w-full h-fit pt-1.5">
                      <input
                        type="text"
                        id="tranId"
                        {...register("transactionId")}
                        placeholder="Enter TrxID"
                        autoCorrect="off"
                        spellCheck="false"
                        className="peer w-full h-[40px] custom-input-style1"
                      />
                      <label
                        htmlFor="tranId"
                        className="custom-floating-label1 text-[11px] sm:text-[12px] font-[600] leading-3 text-stone-500 before:border-stone-400 peer-focus:before:border-[#1e40af] after:border-stone-400 peer-focus:after:border-[#1e40af] peer-focus:text-[#1e40af] peer-disabled:before:border-stone-300 peer-disabled:after:border-stone-300"
                      >
                        {`Transaction ID`}
                      </label>
                      {errors.transactionId && (
                        <EvoFormInputError>
                          {errors.transactionId.message}
                        </EvoFormInputError>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          <div className="flex flex-col w-full h-fit py-0.5 mt-1">
            <div className="flex items-center w-full h-fit">
              <input
                type="checkbox"
                id="terms"
                {...register("terms")}
                className="mr-2 accent-stone-800 flex-shrink-0"
              />
              <label
                htmlFor="terms"
                className="text-[12px] sm:text-[13px] leading-5 font-[500] text-stone-700"
              >
                {`I accept the `}
                <Link
                  href="/about/terms-and-conditions"
                  className="text-[#0866FF] hover:underline"
                >{`terms and conditions`}</Link>
                {`, `}
                <Link
                  href="/about/warranty-policy"
                  className="text-[#0866FF] hover:underline"
                >{`Warranty Policy`}</Link>
                {`, `}
                <Link
                  href="/about/shipping-return-policy"
                  className="text-[#0866FF] hover:underline"
                >{`Shipping & Return Policy`}</Link>
                {`*`}
              </label>
            </div>
            {errors.terms && (
              <EvoFormInputError>{errors.terms.message}</EvoFormInputError>
            )}
          </div>

          <button
            type="submit"
            disabled={isPlaceOrderDisabled}
            className={`w-full h-[44px] flex items-center justify-center px-6 py-2 mt-3 text-[13px] sm:text-[14px] leading-5 font-[600] text-white rounded-[4px] transition-colors duration-100 ${isPlaceOrderDisabled
                ? "bg-stone-700 cursor-not-allowed"
                : "bg-stone-900 hover:bg-stone-800"
              }`}
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <svg
                  className="animate-spin h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Processing...
              </span>
            ) : (
              "Place Order"
            )}
          </button>
          {cartStockSummary.hasBlockingIssues && (
            <p className="text-center md:text-left text-[12px] font-medium text-red-600">
              Remove or adjust the highlighted items to place your order.
            </p>
          )}
        </form>

        <div className="md:sticky md:top-24 flex flex-col w-full md:max-w-[280px] min-[900px]:max-w-[350px] lg:max-w-[400px] min-[1250px]:max-w-[450px] h-fit gap-2 px-5 lg:px-8 py-1 text-stone-700 md:border-l-2 md:border-stone-300">
          <div className="flex flex-col w-full h-[220px] py-3 border-y-2 max-md:border-t-stone-300 border-t-transparent border-b-stone-300 overflow-y-auto scrollbar-custom">
            {cartItems.map((eachCartItem: CartItem, index: number) => {
              const stockStatus = assessCartItemStock(eachCartItem);
              return (
                <div
                  key={`cartitem${index}`}
                  className="flex w-full h-fit py-2 border-t border-[#dddbda] gap-1"
                >
                  <div className="flex w-fit h-fit py-1">
                    <div
                      className="relative w-[45px] sm:w-[50px] aspect-square flex-none border border-stone-300 rounded-[3px] overflow-hidden focus:outline-none bg-[#ffffff]"
                      aria-label={`${eachCartItem.item_name}`}
                    >
                      <Image
                        src={eachCartItem.item_mainimg}
                        alt={`item image`}
                        fill
                        quality={100}
                        draggable="false"
                        sizes="100%"
                        className="object-cover object-center"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col w-full h-fit py-1">
                    <h4 className="text-[11px] sm:text-[12px] leading-4 font-[600] text-stone-800">
                      {`${eachCartItem.item_name}${eachCartItem.item_color
                          ? ` (${eachCartItem.item_color})`
                          : ""
                        }`}
                    </h4>
                    <p className="text-[10px] sm:text-[11px] leading-4 font-[500] text-stone-600">
                      {`${eachCartItem.item_quantity} x ${currencyFormatBDT(
                        eachCartItem.item_price,
                      )} BDT`}
                    </p>
                    {(stockStatus.isOutOfStock || stockStatus.exceedsStock) && (
                      <p className="mt-1 flex items-center gap-1 text-[10px] font-medium text-red-600">
                        <HiMiniExclamationTriangle className="h-3 w-3" />
                        {stockStatus.isOutOfStock
                          ? "This item is currently unavailable."
                          : stockStatus.message}
                      </p>
                    )}
                    {!stockStatus.isOutOfStock &&
                      !stockStatus.exceedsStock &&
                      stockStatus.isLowStock &&
                      stockStatus.availableStock !== null && (
                        <p className="mt-1 flex items-center gap-1 text-[10px] font-medium text-amber-600">
                          <PiInfoBold className="h-3 w-3" />
                          {`Only ${stockStatus.availableStock} left.`}
                        </p>
                      )}
                  </div>

                  <div className="flex items-start justify-end w-[65px] sm:w-[75px] h-fit py-1">
                    <p className="text-[11px] sm:text-[12px] leading-4 font-[600] text-stone-800">
                      {currencyFormatBDT(
                        eachCartItem.item_quantity * eachCartItem.item_price,
                      )}{" "}
                      BDT
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {!appliedCouponCode ? (
            <div className="flex items-center justify-between w-full h-fit py-0.5">
              <input
                type="text"
                placeholder="Enter coupon code"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                disabled={isApplyingCoupon}
                className="w-full h-[40px] px-4 text-[11px] sm:text-[12px] leading-4 font-[500] text-stone-800 border border-stone-300 rounded-l-[4px] outline-none uppercase placeholder:normal-case disabled:bg-stone-100"
              />
              <button
                type="button"
                onClick={handleCouponApply}
                disabled={isApplyingCoupon || !couponCode.trim()}
                className="flex items-center justify-center w-[80px] h-[40px] text-[11px] sm:text-[12px] leading-4 font-[600] text-white bg-blue-600 rounded-r-[4px] hover:bg-blue-700 transition-colors duration-100 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isApplyingCoupon ? "..." : "Apply"}
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between w-full h-fit py-2 px-3 bg-green-50 border border-green-200 rounded-[4px]">
              <div className="flex items-center gap-2">
                <span className="text-[11px] sm:text-[12px] leading-4 font-[600] text-green-700">
                  {appliedCouponCode}
                </span>
                <span className="text-[10px] sm:text-[11px] leading-4 font-[500] text-green-600">
                  applied
                </span>
              </div>
              <button
                type="button"
                onClick={handleRemoveCoupon}
                className="text-[11px] sm:text-[12px] leading-4 font-[600] text-red-600 hover:text-red-700 underline"
              >
                Remove
              </button>
            </div>
          )}

          {discountAmount > 0 && (
            <div className="flex items-center justify-between w-full h-fit py-0.5 px-2 bg-green-50 rounded-[4px]">
              <p className="text-[11px] sm:text-[12px] leading-4 font-[500] text-green-700">
                {`Discount Applied:`}
              </p>
              <p className="text-[11px] sm:text-[12px] leading-4 font-[600] text-green-700">
                - {currencyFormatBDT(discountAmount)} BDT
              </p>
            </div>
          )}

          {hasPreOrderItems && (
            <div className="flex flex-col w-full h-fit gap-1 py-2 px-3 rounded-[6px] border border-stone-200 bg-stone-50">
              <div className="flex items-center justify-between text-[11px] sm:text-[12px] leading-4 font-[500] text-stone-600">
                <span>{`Pre-order items:`}</span>
                <span className="font-[600] text-stone-800">
                  {preOrderItemsCount}
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px] sm:text-[12px] leading-4 font-[500] text-stone-600">
                <span>{`Pre-order subtotal:`}</span>
                <span className="font-[600] text-stone-800">
                  {currencyFormatBDT(preOrderSubtotal)} BDT
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px] sm:text-[12px] leading-4 font-[600] text-stone-900">
                <span>{`Deposit due now (50%):`}</span>
                <span className="text-brand-700">
                  {currencyFormatBDT(preOrderDepositDue)} BDT
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px] sm:text-[12px] leading-4 font-[500] text-stone-600">
                <span>{`Balance payable later:`}</span>
                <span className="font-[600] text-stone-800">
                  {currencyFormatBDT(preOrderBalanceDue)} BDT
                </span>
              </div>

              <div className="mt-2 p-2 rounded border border-amber-200 bg-amber-50">
                <p className="text-[11px] sm:text-[12px] leading-4 font-[600] text-amber-800 mb-1">
                  {`� Before Placing a Pre-Order, Please Note:`}
                </p>
                <ul className="text-[10px] sm:text-[11px] leading-4 text-amber-700 space-y-0.5 list-none pl-0">
                  <li>{`✅ 50% advance payment is required, and the remaining balance must be paid on delivery.`}</li>
                  <li>{`✅ Delivery is expected within 45 working days, though international shipping and logistics may cause delays.`}</li>
                  <li>{`✅ We promise timely delivery. If we take more than 60 working days, you'll receive a full refund with 2% bonus.`}</li>
                </ul>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between w-full h-fit py-0.5">
            <p className="text-[11px] sm:text-[12px] leading-4 font-[500] text-stone-600">
              {`Cart value (all items):`}
            </p>
            <p className="text-[11px] sm:text-[12px] leading-4 font-[600] text-stone-800">
              {currencyFormatBDT(cartSubTotal)} BDT
            </p>
          </div>

          <div className="flex items-center justify-between w-full h-fit py-0.5">
            <p className="text-[11px] sm:text-[12px] leading-4 font-[500] text-stone-600">
              {`Discount:`}
            </p>
            <p className="text-[11px] sm:text-[12px] leading-4 font-[600] text-stone-800">
              {currencyFormatBDT(discountAmount ?? 0)} BDT
            </p>
          </div>

          <div className="flex items-center justify-between w-full h-fit py-0.5">
            <p className="text-[11px] sm:text-[12px] leading-4 font-[500] text-stone-600">
              {`Additional Charge:`}
            </p>
            <p className="text-[11px] sm:text-[12px] leading-4 font-[600] text-stone-800">
              {currencyFormatBDT(codCharge + bKashCharge)} BDT
            </p>
          </div>

          <div className="flex items-center justify-between w-full h-fit py-1.5 border-t border-stone-300">
            <p className="text-[12px] sm:text-[13px] leading-5 font-[600] text-stone-900">
              {`Due Now (at checkout):`}
            </p>
            <p className="text-[13px] sm:text-[14px] leading-5 font-[700] text-brand-700">
              {currencyFormatBDT(dueNowTotal)} BDT
            </p>
          </div>

          <div className="flex flex-col gap-1 w-full text-[11px] sm:text-[12px] leading-4 text-stone-600">
            <div className="flex items-center justify-between">
              <span>{`Regular items today:`}</span>
              <span className="font-[600] text-stone-800">
                {currencyFormatBDT(regularSubtotal)} BDT
              </span>
            </div>
            {hasPreOrderItems && (
              <div className="flex items-center justify-between">
                <span>{`Pre-order deposit today:`}</span>
                <span className="font-[600] text-stone-800">
                  {currencyFormatBDT(preOrderDepositDue)} BDT
                </span>
              </div>
            )}
            {deliveryCharge !== null && (
              <div className="flex items-center justify-between">
                <span>{`Shipping estimate:`}</span>
                <span className="font-[600] text-stone-800">
                  {currencyFormatBDT(deliveryCharge || 0)} BDT
                </span>
              </div>
            )}
            {codCharge > 0 && (
              <div className="flex items-center justify-between">
                <span>{`COD processing fee:`}</span>
                <span className="font-[600] text-stone-800">
                  {currencyFormatBDT(codCharge)} BDT
                </span>
              </div>
            )}
            {bKashCharge > 0 && (
              <div className="flex items-center justify-between">
                <span>{`Digital payment fee:`}</span>
                <span className="font-[600] text-stone-800">
                  {currencyFormatBDT(bKashCharge)} BDT
                </span>
              </div>
            )}
            {discountAmount ? (
              <div className="flex items-center justify-between text-rose-600">
                <span>{`Discount applied:`}</span>
                <span className="font-[600]">
                  -{currencyFormatBDT(discountAmount)} BDT
                </span>
              </div>
            ) : null}
          </div>

          {hasPreOrderItems && (
            <div className="flex items-center justify-between w-full h-fit py-0.5">
              <p className="text-[11px] sm:text-[12px] leading-4 font-[500] text-stone-600">
                {`Pay Later (pre-order balance):`}
              </p>
              <p className="text-[11px] sm:text-[12px] leading-4 font-[600] text-stone-800">
                {currencyFormatBDT(payLaterAmount)} BDT
              </p>
            </div>
          )}

          <div className="flex items-center justify-between w-full h-fit py-1">
            <p className="text-[13px] sm:text-[14px] leading-5 font-[600] text-stone-900">
              {`Total Order Value:`}
            </p>
            <p className="text-[14px] sm:text-[15px] leading-5 font-[700] text-stone-900">
              {currencyFormatBDT(totalPayableAmount)} BDT
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default CheckoutParts;
