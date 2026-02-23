"use client";

import Link from "next/link";
import { useCallback, useState, useEffect } from "react";
import { BsFacebook, BsTwitterX } from "react-icons/bs";
import QuantityAdjuster from "@/components/quantity-adjuster";
import ColorSelector from "@/components/color-selector";
import { toast } from "sonner";
import { CustomToast } from "@/components/ui/customtoast";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { setCartData } from "@/store/slices/cartslice";
import type { CartItem } from "@/schemas/cartSchema";
import axios from "@/utils/axios/axios";

const ItemInteractivePart = ({ singleitem }: { singleitem: any }) => {
  const searchParams = useSearchParams();
  const pathName = usePathname();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const cartItems = useSelector(
    (state: RootState) => state.shoppingcart.cartdata
  );
  const [itemQuantity, setItemQuantity] = useState<number | string>(1);
  const [realTimeColorVariations, setRealTimeColorVariations] = useState<any[]>(
    singleitem.i_colorVariations || []
  );

  // Fetch real-time stock data for color variations
  useEffect(() => {
    const fetchRealTimeStock = async () => {
      if (!singleitem.itemid) return;

      try {
        const response = await axios.get(
          `/products/${singleitem.itemid}/color-variations`
        );
        if (response.data?.data) {
          setRealTimeColorVariations(response.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch real-time stock:", error);
        // Fallback to existing data if fetch fails
      }
    };

    fetchRealTimeStock();

    // Optionally refresh stock data periodically (every 30 seconds)
    const intervalId = setInterval(fetchRealTimeStock, 30000);

    return () => clearInterval(intervalId);
  }, [singleitem.itemid]);

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(name, value);

      return params.toString();
    },
    [searchParams]
  );

  const itemColorfromURL = searchParams.get("color") || "";

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    if (/^(|[1-9]\d*)$/.test(inputValue) && inputValue.length <= 4) {
      Number(inputValue) === 0
        ? setItemQuantity(inputValue)
        : setItemQuantity(Number(inputValue));
    }
  };

  const handleQuantityPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const paste = e.clipboardData.getData("text");
    if (!/^[0-9]+$/.test(paste) || paste.length > 3) {
      e.preventDefault(); // prevent pasting non-numeric input
    }
  };

  const qtyIncrement = () => {
    Number(itemQuantity) < 9999 && setItemQuantity(Number(itemQuantity) + 1);
  };

  const qtyDecrement = () => {
    Number(itemQuantity) > 1 && setItemQuantity(Number(itemQuantity) - 1);
  };

  const setCartLocal = (cartLocal: any) => {
    localStorage.setItem("evoFrontCart", JSON.stringify(cartLocal));

    // Dispatch a custom event when updating the cart
    const event = new CustomEvent("localStorageChange", {
      detail: { key: "evoFrontCart", newValue: cartLocal },
    });
    window.dispatchEvent(event);
  };

  const handleColorSelect = (selectedColor: string) => {
    const newQueryString = createQueryString("color", selectedColor);
    router.replace(`${pathName}?${newQueryString}`, { scroll: false });
  };

  const handleAddToCart = () => {
    // Validate color selection if product has color variations
    const hasColorVariations =
      realTimeColorVariations && realTimeColorVariations.length > 0;

    if (
      hasColorVariations ||
      (singleitem.i_colors && singleitem.i_colors.length > 0)
    ) {
      if (!itemColorfromURL) {
        toast.error("Please select a color first");
        return;
      }

      // Check color variation stock if applicable
      if (hasColorVariations) {
        const selectedVariation = realTimeColorVariations.find(
          (cv: any) =>
            cv.colorName.toLowerCase() === itemColorfromURL.toLowerCase()
        );

        if (!selectedVariation) {
          toast.error("Selected color not available");
          return;
        }

        if (selectedVariation.stock === 0) {
          toast.error("Selected color is out of stock");
          return;
        }

        if (selectedVariation.stock < Number(itemQuantity)) {
          toast.error(
            `Only ${selectedVariation.stock} units available for this color`
          );
          return;
        }
      } else {
        // Legacy color check for old products
        const colorExists = singleitem.i_colors.find(
          (c: { name: string; hex: string }) =>
            c.name.toLowerCase() === itemColorfromURL.toLowerCase()
        );
        if (!colorExists) {
          toast.error("Selected color not available");
          return;
        }
      }
    }

    // Validate quantity
    if (typeof itemQuantity === "string" || itemQuantity <= 0) {
      toast.error("Empty or invalid quantity");
      return;
    }

    // Get current cart from Redux/localStorage
    const currentCart = cartItems || [];

    // Check if item already exists in cart
    const existingItemIndex = currentCart.findIndex(
      (item) =>
        item.item_id === singleitem.itemid &&
        (item.item_color || "").toLowerCase() ===
        (itemColorfromURL || "").toLowerCase() &&
        (item.item_isPreOrder ?? false) === false
    );

    let updatedCart: CartItem[];

    if (existingItemIndex >= 0) {
      // Item exists - update quantity
      const existingItem = currentCart[existingItemIndex];
      const newQuantity = existingItem.item_quantity + Number(itemQuantity);

      // Optional: Add quantity limit check
      if (newQuantity > 9999) {
        toast.error("Quantity limit reached (max: 9999)");
        return;
      }

      updatedCart = [...currentCart];
      updatedCart[existingItemIndex] = {
        ...existingItem,
        item_quantity: newQuantity,
      };

      toast.custom(
        (t) => (
          <CustomToast
            toastid={t}
            title={
              <span className="text-blue-600">
                Item already in cart, quantity increased
              </span>
            }
            description="Visit the cart to update"
          />
        ),
        { duration: 4000 }
      );
    } else {
      // New item - add to cart
      const newCartItem: CartItem = {
        item_id: singleitem.itemid,
        item_name: singleitem.i_name,
        item_slug: singleitem.i_slug,
        item_mainimg: singleitem.i_mainimg || "/assets/placeholder-product.svg",
        item_category: singleitem.i_category || "",
        item_subcategory: singleitem.i_subcategory || "",
        item_brand: singleitem.i_brand || "",
        item_weight: singleitem.i_weight || 0,
        item_color: itemColorfromURL.toLowerCase() || null,
        item_quantity: Number(itemQuantity),
        item_price: singleitem.i_price,
        item_isPreOrder: false,
        item_preorderPrice: singleitem.i_preorderprice || null,
      };

      updatedCart = [...currentCart, newCartItem];
      toast.success("Item added to cart");
    }

    // Update Redux store
    dispatch(setCartData(updatedCart));

    // Update localStorage
    setCartLocal({ items: updatedCart });
  };

  const handleBuyNow = () => {
    // Validate color selection if product has color variations
    const hasColorVariations =
      realTimeColorVariations && realTimeColorVariations.length > 0;

    if (
      hasColorVariations ||
      (singleitem.i_colors && singleitem.i_colors.length > 0)
    ) {
      if (!itemColorfromURL) {
        toast.error("Please select a color first");
        return;
      }

      // Check color variation stock if applicable
      if (hasColorVariations) {
        const selectedVariation = realTimeColorVariations.find(
          (cv: any) =>
            cv.colorName.toLowerCase() === itemColorfromURL.toLowerCase()
        );

        if (!selectedVariation) {
          toast.error("Selected color not available");
          return;
        }

        if (selectedVariation.stock === 0) {
          toast.error("Selected color is out of stock");
          return;
        }

        if (selectedVariation.stock < Number(itemQuantity)) {
          toast.error(
            `Only ${selectedVariation.stock} units available for this color`
          );
          return;
        }
      } else {
        // Legacy color check for old products
        const colorExists = singleitem.i_colors.find(
          (c: { name: string; hex: string }) =>
            c.name.toLowerCase() === itemColorfromURL.toLowerCase()
        );
        if (!colorExists) {
          toast.error("Selected color not available");
          return;
        }
      }
    }

    // Validate quantity
    if (typeof itemQuantity === "string" || itemQuantity <= 0) {
      toast.error("Empty or invalid quantity");
      return;
    }

    // Get current cart from Redux/localStorage
    const currentCart = cartItems || [];

    // Check if item already exists in cart
    const existingItemIndex = currentCart.findIndex(
      (item) =>
        item.item_id === singleitem.itemid &&
        (item.item_color || "").toLowerCase() ===
        (itemColorfromURL || "").toLowerCase() &&
        (item.item_isPreOrder ?? false) === false
    );

    let updatedCart: CartItem[];

    if (existingItemIndex >= 0) {
      // Item exists - update quantity
      const existingItem = currentCart[existingItemIndex];
      const newQuantity = existingItem.item_quantity + Number(itemQuantity);

      updatedCart = [...currentCart];
      updatedCart[existingItemIndex] = {
        ...existingItem,
        item_quantity: newQuantity,
      };
    } else {
      // New item - add to cart
      const newCartItem: CartItem = {
        item_id: singleitem.itemid,
        item_name: singleitem.i_name,
        item_slug: singleitem.i_slug,
        item_mainimg: singleitem.i_mainimg || "/assets/placeholder-product.svg",
        item_category: singleitem.i_category || "",
        item_subcategory: singleitem.i_subcategory || "",
        item_brand: singleitem.i_brand || "",
        item_weight: singleitem.i_weight || 0,
        item_color: itemColorfromURL.toLowerCase() || null,
        item_quantity: Number(itemQuantity),
        item_price: singleitem.i_price,
        item_isPreOrder: false,
        item_preorderPrice: singleitem.i_preorderprice || null,
      };

      updatedCart = [...currentCart, newCartItem];
    }

    // Update Redux store
    dispatch(setCartData(updatedCart));

    // Update localStorage
    setCartLocal({ items: updatedCart });

    // Navigate to cart
    router.push("/cart");
  };

  const handlePreOrder = () => {
    // Validate color selection if product has color variations
    const hasColorVariations =
      realTimeColorVariations && realTimeColorVariations.length > 0;

    if (
      hasColorVariations ||
      (singleitem.i_colors && singleitem.i_colors.length > 0)
    ) {
      if (!itemColorfromURL) {
        toast.error("Please select a color first");
        return;
      }

      // Check color variation availability if applicable
      if (hasColorVariations) {
        const selectedVariation = realTimeColorVariations.find(
          (cv: any) =>
            cv.colorName.toLowerCase() === itemColorfromURL.toLowerCase()
        );

        if (!selectedVariation) {
          toast.error("Selected color not available");
          return;
        }

        // For pre-orders, we might allow 0 stock, but still validate color exists
      } else {
        // Legacy color check for old products
        const colorExists = singleitem.i_colors.find(
          (c: { name: string; hex: string }) =>
            c.name.toLowerCase() === itemColorfromURL.toLowerCase()
        );
        if (!colorExists) {
          toast.error("Selected color not available");
          return;
        }
      }
    }

    // Validate quantity
    if (typeof itemQuantity === "string" || itemQuantity <= 0) {
      toast.error("Empty or invalid quantity");
      return;
    }

    // Get current cart from Redux/localStorage
    const currentCart = cartItems || [];

    // Use pre-order price if available
    const itemPrice = singleitem.i_preorderprice || singleitem.i_price;

    // Check if item already exists in cart
    const existingItemIndex = currentCart.findIndex(
      (item) =>
        item.item_id === singleitem.itemid &&
        (item.item_color || "").toLowerCase() ===
        (itemColorfromURL || "").toLowerCase() &&
        (item.item_isPreOrder ?? false) === true
    );

    let updatedCart: CartItem[];

    if (existingItemIndex >= 0) {
      // Item exists - update quantity
      const existingItem = currentCart[existingItemIndex];
      const newQuantity = existingItem.item_quantity + Number(itemQuantity);

      updatedCart = [...currentCart];
      updatedCart[existingItemIndex] = {
        ...existingItem,
        item_quantity: newQuantity,
        item_price: itemPrice, // Update to pre-order price
      };
    } else {
      // New item - add to cart
      const newCartItem: CartItem = {
        item_id: singleitem.itemid,
        item_name: singleitem.i_name,
        item_slug: singleitem.i_slug,
        item_mainimg: singleitem.i_mainimg || "/assets/placeholder-product.svg",
        item_category: singleitem.i_category || "",
        item_subcategory: singleitem.i_subcategory || "",
        item_brand: singleitem.i_brand || "",
        item_weight: singleitem.i_weight || 0,
        item_color: itemColorfromURL.toLowerCase() || null,
        item_quantity: Number(itemQuantity),
        item_price: itemPrice,
        item_isPreOrder: true,
        item_preorderPrice: singleitem.i_preorderprice || null,
      };

      updatedCart = [...currentCart, newCartItem];
    }

    // Update Redux store
    dispatch(setCartData(updatedCart));

    // Update localStorage
    setCartLocal({ items: updatedCart });

    toast.success("Pre-order item added to cart!");

    // Navigate to cart
    router.push("/cart");
  };

  // Check if product has color variations
  const hasColorVariations =
    realTimeColorVariations && realTimeColorVariations.length > 0;

  // Format color variations for ColorSelector component
  const formattedColors = hasColorVariations
    ? realTimeColorVariations.map((cv: any) => ({
      name: cv.colorName,
      hex: cv.colorCode,
    }))
    : singleitem.i_colors || [];

  return (
    <div className="flex flex-col w-full h-fit gap-2">
      {formattedColors.length > 0 && (
        <div className="relative flex flex-col w-full h-fit my-2 gap-3">
          <span className="w-fit h-fit text-[13px] md:text-[14px] leading-5 tracking-tight font-[600]">{`Color:`}</span>
          <ColorSelector
            colors={formattedColors}
            selectedColor={itemColorfromURL}
            onColorSelect={handleColorSelect}
          />
          {hasColorVariations && itemColorfromURL && (
            <div className="text-[12px] text-stone-600">
              {(() => {
                const selectedVariation = realTimeColorVariations.find(
                  (cv: any) =>
                    cv.colorName.toLowerCase() ===
                    itemColorfromURL.toLowerCase()
                );
                return selectedVariation && selectedVariation.stock > 0 ? (
                  <span className="text-emerald-600 font-[500]">
                    {selectedVariation.stock} units available
                  </span>
                ) : selectedVariation && selectedVariation.stock === 0 ? (
                  <span className="text-red-500 font-[500]">Out of stock</span>
                ) : null;
              })()}
            </div>
          )}
        </div>
      )}

      <div className="relative flex items-center w-fit h-fit gap-3">
        <span className="w-fit h-fit text-[14px] md:text-[16px] leading-5 tracking-tight font-[600]">
          Quantity
        </span>
        <label htmlFor="itemquantity" className="sr-only">
          Quantity
        </label>
        <QuantityAdjuster
          itemQuantity={itemQuantity}
          qtyIncrement={qtyIncrement}
          qtyDecrement={qtyDecrement}
          handleQuantityChange={handleQuantityChange}
          handleQuantityPaste={handleQuantityPaste}
        />
      </div>

      <div className="flex flex-col w-full h-fit gap-2 max-w-[375px] mt-7 lg:mt-9">
        <div className="flex w-full h-fit gap-2">
          <button
            onClick={handleBuyNow}
            disabled={!singleitem.i_instock && !singleitem.i_ispreorder}
            type="button"
            aria-label="buy now button"
            className="w-full h-fit px-6 py-2 border border-stone-600 rounded-[4px] text-[12px] md:text-[14px] leading-5 tracking-tight font-[500] text-stone-100 bg-stone-900 disabled:bg-stone-700 disabled:hover:bg-stone-700 hover:bg-stone-800 transition-colors duration-100 ease-linear"
          >
            Buy Now
          </button>
          <button
            onClick={handleAddToCart}
            disabled={!singleitem.i_instock && !singleitem.i_ispreorder}
            type="button"
            aria-label="add to cart button"
            className="w-full h-fit px-6 py-2 border border-stone-600 rounded-[4px] text-[12px] md:text-[14px] leading-5 tracking-tight font-[500] text-stone-900 hover:text-stone-100 hover:bg-stone-900 disabled:hover:text-stone-900 disabled:hover:bg-transparent transition-colors duration-100 ease-linear"
          >
            Add To Cart
          </button>
        </div>

        {singleitem.i_preorderprice &&
          singleitem.i_preorderprice < singleitem.i_price && (
            <button
              onClick={() => handlePreOrder()}
              type="button"
              aria-label="pre-order button"
              className="w-full h-fit px-6 py-2.5 border-2 border-brand-500 rounded-[4px] text-[12px] md:text-[14px] leading-5 tracking-tight font-[600] text-white bg-brand-600 disabled:bg-brand-300 disabled:hover:bg-brand-300 hover:bg-brand-700 transition-colors duration-100 ease-linear shadow-sm"
            >
              Pre-Order Now - Save BDT{" "}
              {(singleitem.i_price - singleitem.i_preorderprice).toFixed(0)}
            </button>
          )}
      </div>
      {/* functionality for wishlist to be added later */}
      {/* <div className="flex w-full h-fit max-w-[375px]">
                <button type="button" aria-label="add to wishlist button" className="w-full h-fit px-6 py-2 border border-stone-600 rounded-[4px] text-[12px] md:text-[14px] leading-5 tracking-tight font-[500] text-stone-900 hover:text-stone-100 hover:bg-stone-900 transition-colors duration-100 ease-linear">
                    Add To Wishlist
                </button>
            </div> */}

      <div className="flex flex-wrap w-full h-fit items-center my-2 gap-2">
        <Link
          href="#"
          className="inline whitespace-nowrap w-fit h-fit text-[11px] md:text-[12px] leading-4 tracking-tight font-[500] text-stone-800 hover:text-stone-600 transition-colors duration-100 ease-linear"
        >
          Shipping & Return Policy
        </Link>
        <div className="w-[1px] h-3 bg-stone-800"></div>
        <Link
          href="#"
          className="inline whitespace-nowrap w-fit h-fit text-[11px] md:text-[12px] leading-4 tracking-tight font-[500] text-stone-800 hover:text-stone-600 transition-colors duration-100 ease-linear"
        >
          Warranty Policy
        </Link>
        <div className="w-[1px] h-3 bg-stone-800"></div>
        <div className="flex whitespace-nowrap w-fit h-fit items-center gap-1.5">
          <span className="w-fit h-fit text-[11px] md:text-[12px] leading-4 tracking-tight font-[500] text-stone-800">{`Share:`}</span>
          <button
            type="button"
            aria-label="share this item to facebook"
            className="flex w-fit h-fit px-0.5 hover:text-stone-500 transition duration-100 ease-linear focus:outline-none pointer-events-none"
          >
            <BsFacebook className="inline w-[14px] h-[14px]" />
          </button>
          <button
            type="button"
            aria-label="share this item to X"
            className="flex w-fit h-fit px-0.5 focus:outline-none pointer-events-none group"
          >
            <BsTwitterX className="inline w-[14px] h-[14px] p-0.5 rounded-full bg-stone-700 group-hover:bg-stone-500 text-white transition duration-100 ease-linear" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ItemInteractivePart;
