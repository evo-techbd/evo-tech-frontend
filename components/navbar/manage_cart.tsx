"use client";

import { useState, useEffect, useMemo } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { currencyFormatBDT } from "@/lib/all_utils";
import { IoCart, IoClose } from "react-icons/io5";
import { PiSmileySadLight } from "react-icons/pi";
import { createPortal } from "react-dom";
import { m, LazyMotion, AnimatePresence } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { setCartData } from "@/store/slices/cartslice";
import { calculateCartBreakdown } from "@/utils/cart-totals";

const LoadMotionFeatures = () =>
  import("@/utils/framer/features").then((res) => res.default);

const ManageCart = () => {
  const [cartTrayOpen, setCartTrayOpen] = useState<boolean>(false);
  const pathname = usePathname();
  const cartData = useSelector(
    (state: RootState) => state.shoppingcart.cartdata
  );
  const dispatch = useDispatch<AppDispatch>();
  const cartBreakdown = useMemo(
    () => calculateCartBreakdown(cartData),
    [cartData]
  );
  const {
    cartSubTotal,
    preOrderDepositDue,
    preOrderBalanceDue,
    dueNowSubtotal,
    hasPreOrderItems,
  } = cartBreakdown;

  useEffect(() => {
    const fetchCartDB = async () => {
      // Load cart from localStorage only (using Redux, not backend)
      const localevoFrontCart = localStorage.getItem("evoFrontCart");
      const parsedCart = localevoFrontCart
        ? JSON.parse(localevoFrontCart)
        : null;

      if (parsedCart && parsedCart.items) {
        dispatch(setCartData(parsedCart.items));
      } else {
        dispatch(setCartData([]));
      }
    };

    if (cartData === null) {
      fetchCartDB();
    }
  }, [dispatch, cartData]);

  useEffect(() => {
    const updateCartCount = () => {
      const localevoFrontCart = localStorage.getItem("evoFrontCart");
      const parsedCart = localevoFrontCart
        ? JSON.parse(localevoFrontCart)
        : null;
      if (parsedCart && parsedCart.items && Array.isArray(parsedCart.items)) {
        dispatch(setCartData(parsedCart.items));
      } else {
        dispatch(setCartData([]));
      }
    };

    // listen for custom event
    window.addEventListener("localStorageChange", (event: any) => {
      if (event.detail.key === "evoFrontCart") {
        updateCartCount();
      }
    });
    // listen for storage event
    window.addEventListener("storage", (event: StorageEvent) => {
      if (event.key === "evoFrontCart") {
        updateCartCount();
      }
    });

    return () => {
      window.removeEventListener("localStorageChange", (event: any) => {
        if (event.detail.key === "evoFrontCart") {
          updateCartCount();
        }
      });

      window.removeEventListener("storage", (event: StorageEvent) => {
        if (event.key === "evoFrontCart") {
          updateCartCount();
        }
      });
    };
  }, [dispatch]);

  useEffect(() => {
    if (pathname === "/cart" || pathname === "/checkout") {
      setCartTrayOpen(false);
    }
  }, [pathname]);

  const handleCartTrayOpen = () => {
    if (pathname === "/cart" || pathname === "/checkout") return;
    setCartTrayOpen(true);
  };

  return (
    <>
      <button
        type="button"
        onClick={handleCartTrayOpen}
        className="relative flex w-fit h-fit p-1 rounded-full group focus:outline-none"
        title={`cart: ${
          cartData ? (cartData.length > 9 ? `9+` : cartData.length) : "0"
        } items`}
        aria-label="cart icon"
      >
        <IoCart className="block w-4 h-4 sm:w-5 sm:h-5 group-hover:opacity-65 transition-opacity duration-200 ease-linear" />
        {cartData && cartData.length > 0 && (
          <div className="absolute top-[-7px] right-[-6px] min-w-4 min-h-4 w-fit h-fit px-1 py-0.5 flex justify-center items-center rounded-full bg-[#0866ff] text-[10px] leading-[12px] font-[600] text-[#FFFFFF]">
            {cartData.length > 9 ? `9+` : cartData.length}
          </div>
        )}
      </button>

      {typeof window !== "undefined" &&
        createPortal(
          <>
            <LazyMotion features={LoadMotionFeatures} strict>
              <AnimatePresence>
                {cartTrayOpen && (
                  <m.div
                    key="carttrayoverlay" // direct child of AnimatePresence must have an unique key
                    initial={{ opacity: 0 }}
                    animate={{ opacity: cartTrayOpen ? 1 : 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    aria-label="cart tray overlay"
                    onClick={() => setCartTrayOpen(false)}
                    className={`z-[346] fixed inset-0 bg-black bg-opacity-30`}
                  ></m.div>
                )}
                <div
                  className={`z-[350] fixed inset-y-0 flex flex-col w-[360px] h-screen rounded-l-md overflow-hidden flex-initial ${
                    cartTrayOpen ? "right-0" : "right-[-500px]"
                  } transition-[right] duration-500 bg-white`}
                >
                  <div className="flex justify-between items-center w-full h-fit px-4 py-3 bg-stone-800">
                    <span className="w-fit h-fit font-inter font-[500] text-[13px] sm:text-[14px] leading-6 tracking-tight text-stone-50">
                      Cart
                    </span>
                    <button
                      onClick={() => setCartTrayOpen(false)}
                      type="button"
                      aria-label="close cart"
                      className="flex w-fit h-fit rounded-full group focus:outline-none"
                    >
                      <IoClose className="inline w-5 h-5 text-stone-50 hover:text-stone-400" />
                    </button>
                  </div>

                  <div className="flex flex-col w-full h-full px-4 py-3 overflow-y-auto scrollbar-custom">
                    {cartData && cartData.length > 0 ? (
                      cartData.map((eachCartItem: any, index: number) => (
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

                          <div className="flex flex-col w-full h-fit px-2 py-1 gap-1 text-left font-inter font-[500] text-[12px] sm:text-[13px] leading-5 tracking-tight text-stone-600 break-words">
                            <Link
                              href={`/items/${eachCartItem.item_slug}`}
                              className="w-full h-fit hover:text-[#0866FF]"
                            >
                              {eachCartItem.item_name}
                            </Link>
                            {eachCartItem.item_color && (
                              <p className="w-full h-fit text-stone-900 text-[12px]">{`Color: ${eachCartItem.item_color}`}</p>
                            )}
                            <p className="w-full h-fit font-[600] text-stone-900 tracking-tight text-[12px]">{`BDT ${currencyFormatBDT(
                              eachCartItem.item_price
                            )} x ${
                              eachCartItem.item_quantity
                            } = ${currencyFormatBDT(
                              eachCartItem.item_price *
                                eachCartItem.item_quantity
                            )}`}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="flex flex-col items-center justify-center w-full h-full gap-2">
                        <PiSmileySadLight className="inline w-6 h-6 sm:w-8 sm:h-8 text-stone-400" />
                        <p className="text-[12px] sm:text-[13px] leading-6 text-stone-800">{`Cart is empty!`}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col w-full h-fit px-4 py-3 bg-white border-t border-stone-300 gap-1">
                    <div className="flex justify-between w-full h-fit gap-1 py-1">
                      <div className="w-fit h-fit text-[13px] sm:text-[14px] font-[500] text-stone-600 tracking-tight">
                        {`Subtotal:`}
                      </div>
                      <div className="w-fit h-fit text-[13px] sm:text-[14px] font-[500] text-stone-800 tracking-tight">
                        {`${currencyFormatBDT(cartSubTotal)} BDT`}
                      </div>
                    </div>

                    {hasPreOrderItems && (
                      <div className="flex flex-col w-full h-fit gap-1 rounded-md border border-stone-200 bg-stone-50 px-3 py-2">
                        <div className="flex items-center justify-between text-[11px] sm:text-[12px] text-stone-600">
                          <span>{`Deposit (50%) due now:`}</span>
                          <span className="font-[600] text-stone-800">{`${currencyFormatBDT(
                            preOrderDepositDue
                          )} BDT`}</span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] sm:text-[12px] text-stone-600">
                          <span>{`Balance later:`}</span>
                          <span className="font-[600] text-stone-800">{`${currencyFormatBDT(
                            preOrderBalanceDue
                          )} BDT`}</span>
                        </div>
                        <p className="text-[10px] sm:text-[11px] text-stone-500">
                          {`Approx. due at checkout (before shipping/fees): ${currencyFormatBDT(
                            dueNowSubtotal
                          )} BDT`}
                        </p>
                      </div>
                    )}

                    <p className="flex w-full h-fit text-[11px] sm:text-[12px] font-[500] text-stone-400 tracking-tight pb-1">
                      {`Shipping and discounts will be calculated at checkout.`}
                    </p>

                    <div className="flex w-full h-fit gap-1 py-px">
                      <Link
                        href="/cart"
                        className="flex w-fit h-fit px-6 py-2 flex-none whitespace-nowrap text-[13px] sm:text-[14px] leading-5 font-[500] text-white bg-[#0866FF] rounded-[20px] focus:outline-none hover:bg-[#0646FF] transition-colors duration-100"
                      >
                        View Cart
                      </Link>
                      <Link
                        href="/checkout"
                        className={`flex justify-center w-full h-fit px-6 py-2 text-[13px] sm:text-[14px] leading-5 font-[500] text-white rounded-[20px] focus:outline-none transition-colors duration-100 ease-linear ${
                          cartData && cartData.length > 0
                            ? `bg-stone-800 hover:bg-stone-900`
                            : `pointer-events-none bg-stone-600`
                        }`}
                      >
                        Checkout
                      </Link>
                    </div>
                  </div>
                </div>
              </AnimatePresence>
            </LazyMotion>
          </>,
          document.body
        )}
    </>
  );
};

export default ManageCart;
