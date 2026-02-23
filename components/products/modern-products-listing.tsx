"use client";

import { useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import EvoPagination from "@/components/ui/evo_pagination";
import EvoDropdown from "@/components/ui/evo_dropdown";
import { DropdownItem } from "@nextui-org/dropdown";
import { FiShoppingCart, FiHeart, FiStar } from "react-icons/fi";
import { BsLightning } from "react-icons/bs";
import { toast } from "sonner";
import { useDispatch, useSelector } from "react-redux";
import { setCartData } from "@/store/slices/cartslice";
import { RootState, AppDispatch } from "@/store/store";

interface ModernProductsListingProps {
  fetchedProdData: any[];
  paginationMeta: any;
  viewMode: "grid" | "list";
}

const ModernProductsListing = ({
  fetchedProdData,
  paginationMeta,
  viewMode,
}: ModernProductsListingProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const createQueryString = useCallback(
    (name: string, value: string, prevQueryString?: string) => {
      const params = new URLSearchParams(
        prevQueryString ? prevQueryString : searchParams.toString()
      );
      params.set(name, value);
      return params.toString();
    },
    [searchParams]
  );

  const removeQueryParam = useCallback(
    (name: string, prevQueryString?: string) => {
      const params = new URLSearchParams(
        prevQueryString ? prevQueryString : searchParams.toString()
      );
      params.delete(name);
      return params.toString();
    },
    [searchParams]
  );

  if (fetchedProdData.length === 0) {
    return (
      <div className="w-full h-[calc(100vh-300px)] flex flex-col items-center justify-center bg-white rounded-lg shadow-sm">
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-stone-100 flex items-center justify-center">
            <svg
              className="w-12 h-12 text-stone-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-stone-900 mb-2">
            No Products Found
          </h3>
          <p className="text-sm text-stone-600">
            Try adjusting your filters or check back later
          </p>
        </div>
      </div>
    );
  }

  const handlePaginationChange = (page: number) => {
    if (page !== paginationMeta.currentPage) {
      if (page === 1) {
        const newparams = removeQueryParam("page");
        router.push(`${pathname}${newparams ? `?${newparams}` : ""}`, {
          scroll: true,
        });
      } else {
        router.push(
          `${pathname}?${createQueryString("page", page.toString())}`,
          { scroll: true }
        );
      }
    }
  };

  const handlePerPageChange = (perPage: number) => {
    if (perPage !== paginationMeta.itemsPerPage) {
      if (perPage === 12) {
        let newparams = removeQueryParam("perpage");
        newparams = removeQueryParam("page", newparams);
        router.push(`${pathname}${newparams ? `?${newparams}` : ""}`, {
          scroll: true,
        });
      } else {
        let newparams = createQueryString("perpage", perPage.toString());
        newparams = removeQueryParam("page", newparams);
        router.push(`${pathname}${newparams ? `?${newparams}` : ""}`, {
          scroll: true,
        });
      }
    }
  };

  const handleSortChange = (sortKey: string) => {
    let newparams = "";
    if (sortKey === "default") {
      newparams = removeQueryParam("sortBy");
      newparams = removeQueryParam("sortOrder", newparams);
    } else if (sortKey === "price-asc") {
      newparams = createQueryString("sortBy", "price");
      newparams = createQueryString("sortOrder", "asc", newparams);
    } else if (sortKey === "price-desc") {
      newparams = createQueryString("sortBy", "price");
      newparams = createQueryString("sortOrder", "desc", newparams);
    } else if (sortKey === "name-asc") {
      newparams = createQueryString("sortBy", "name");
      newparams = createQueryString("sortOrder", "asc", newparams);
    } else if (sortKey === "newest") {
      newparams = createQueryString("sortBy", "createdAt");
      newparams = createQueryString("sortOrder", "desc", newparams);
    } else if (sortKey === "rating") {
      newparams = createQueryString("sortBy", "rating");
      newparams = createQueryString("sortOrder", "desc", newparams);
    }
    newparams = removeQueryParam("page", newparams);
    router.push(`${pathname}${newparams ? `?${newparams}` : ""}`, {
      scroll: false,
    });
  };

  const paginationData = {
    currentPage: paginationMeta.currentPage,
    lastPage: paginationMeta.lastPage,
    onChange: handlePaginationChange,
  };

  const currentSort = searchParams.get("sortBy")
    ? `${searchParams.get("sortBy")}-${searchParams.get("sortOrder")}`
    : "default";

  return (
    <>
      {/* Sort and Per Page Controls */}
      <div className="w-full h-fit flex flex-row justify-between items-center gap-3 px-4 py-3 bg-white rounded-lg shadow-sm mb-6">
        <div className="flex items-center gap-3">
          <EvoDropdown
            dropdownLabel="Sort By"
            onKeyChange={(key) => handleSortChange(key)}
            selectedKey={currentSort}
            ariaLabelForMenu="sort products"
            dropdownTriggerClassName="w-fit h-fit"
          >
            <DropdownItem key="default">Default</DropdownItem>
            <DropdownItem key="newest">Newest First</DropdownItem>
            <DropdownItem key="price-asc">Price: Low to High</DropdownItem>
            <DropdownItem key="price-desc">Price: High to Low</DropdownItem>
            <DropdownItem key="name-asc">Name: A to Z</DropdownItem>
            <DropdownItem key="rating">Highest Rated</DropdownItem>
          </EvoDropdown>
        </div>

        <div className="flex items-center gap-3">
          <EvoDropdown
            dropdownLabel="Show"
            onKeyChange={(key) => handlePerPageChange(parseInt(key))}
            selectedKey={paginationMeta.itemsPerPage.toString()}
            ariaLabelForMenu="items per page"
            dropdownTriggerClassName="w-fit h-fit"
          >
            <DropdownItem key="12">12 per page</DropdownItem>
            <DropdownItem key="24">24 per page</DropdownItem>
            <DropdownItem key="36">36 per page</DropdownItem>
            <DropdownItem key="48">48 per page</DropdownItem>
          </EvoDropdown>
        </div>
      </div>

      {/* Products Grid/List */}
      {viewMode === "grid" ? (
        <div className="w-full h-fit grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-3 md:gap-4">
          {fetchedProdData.map((prod: any, index: number) => (
            <ProductGridCard key={`item${index}`} product={prod} />
          ))}
        </div>
      ) : (
        <div className="w-full h-fit flex flex-col gap-4">
          {fetchedProdData.map((prod: any, index: number) => (
            <ProductListCard key={`item${index}`} product={prod} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {paginationMeta.lastPage > 1 && (
        <div className="w-full h-fit flex justify-center items-center mt-12">
          <EvoPagination paginationProps={paginationData} />
        </div>
      )}
    </>
  );
};

// Grid Card Component
const ProductGridCard = ({ product }: { product: any }) => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const cartdata = useSelector((state: RootState) => state.shoppingcart.cartdata);

  const discount =
    product.i_prevprice > product.i_price
      ? Math.round(
        ((product.i_prevprice - product.i_price) / product.i_prevprice) * 100
      )
      : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const localevoFrontCart = localStorage.getItem('evoFrontCart');
    const parsedCart = localevoFrontCart ? JSON.parse(localevoFrontCart) : { items: [], ctoken: '' };

    const existingItemIndex = parsedCart.items.findIndex(
      (item: any) => item.item_id === product.itemid && item.item_color === ""
    );

    let updatedCart;
    if (existingItemIndex >= 0) {
      // Item exists, increase quantity
      updatedCart = parsedCart.items.map((item: any, index: number) =>
        index === existingItemIndex
          ? { ...item, item_quantity: item.item_quantity + 1 }
          : item
      );
      toast.success("Item quantity increased");
    } else {
      // Add new item
      const newItem = {
        item_id: product.itemid,
        item_name: product.i_name,
        item_slug: product.i_slug,
        item_price: product.i_price,
        item_quantity: 1,
        item_color: "",
        item_mainimg: product.i_mainimg,
        item_weight: product.i_weight || 0,
        item_instock: product.i_instock,
      };
      updatedCart = [...parsedCart.items, newItem];
      toast.success("Item added to cart");
    }

    // Update localStorage
    localStorage.setItem('evoFrontCart', JSON.stringify({ ...parsedCart, items: updatedCart }));

    // Update Redux
    dispatch(setCartData(updatedCart));
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Add to cart first
    handleAddToCart(e);

    // Navigate to cart page
    setTimeout(() => {
      router.push('/cart');
    }, 500);
  };

  return (
    <Link
      href={`/items/${product.i_slug}`}
      className="group bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-stone-100 hover:border-brand-200 flex flex-col"
    >
      {/* Image Container */}
      <div className="relative w-full aspect-square overflow-hidden bg-stone-50">
        <Image
          src={product.i_mainimg || "/assets/placeholder-product.svg"}
          alt={product.i_name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover group-hover:scale-110 transition-transform duration-500"
        />

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {discount > 0 && (
            <span className="px-1.5 py-0.5 bg-red-500 text-white text-[10px] font-bold rounded">
              -{discount}%
            </span>
          )}
          {!product.i_instock && (
            <span className="px-1.5 py-0.5 bg-stone-800 text-white text-[10px] font-bold rounded">
              Out of Stock
            </span>
          )}
        </div>

        {/* Quick Actions */}
        <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            className="p-1.5 bg-white rounded-full shadow-md hover:bg-brand-50 hover:text-brand-600 transition-colors"
            aria-label="Add to wishlist"
          >
            <FiHeart className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-2 sm:p-3 flex flex-col flex-1">
        {/* Brand */}
        {product.i_brandName && (
          <p className="text-[10px] text-stone-500 uppercase tracking-wide mb-0.5 truncate">
            {product.i_brandName}
          </p>
        )}

        {/* Name */}
        <h3 className="text-xs sm:text-sm font-semibold text-stone-900 mb-1 sm:mb-2 line-clamp-2 min-h-[2.5rem] sm:min-h-[2.8rem] group-hover:text-brand-600 transition-colors leading-tight">
          {product.i_name}
        </h3>

        {/* Rating */}
        {product.i_rating > 0 && (
          <div className="flex items-center gap-1 mb-1">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <FiStar
                  key={i}
                  className={`w-2.5 h-2.5 ${i < Math.floor(product.i_rating)
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-stone-300"
                    }`}
                />
              ))}
            </div>
            <span className="text-[10px] text-stone-500">
              ({product.i_reviewCount})
            </span>
          </div>
        )}

        {/* Price */}
        <div className="flex flex-col gap-0.5 mt-auto mb-1">
          {product.i_preorderprice && product.i_ispreorder && product.i_preorderprice < product.i_price ? (
            <>
              <span className="text-sm sm:text-base font-bold text-cyan-600">
                ৳{product.i_preorderprice.toLocaleString()}
              </span>
              <span className="text-xs font-bold text-red-500 line-through">
                ৳{product.i_price.toLocaleString()}
              </span>
            </>
          ) : (
            <>
              <span className="text-sm sm:text-base font-bold text-stone-900">
                ৳{product.i_price.toLocaleString()}
              </span>
              {product.i_prevprice > product.i_price && (
                <span className="text-xs font-bold text-stone-400 line-through">
                  ৳{product.i_prevprice.toLocaleString()}
                </span>
              )}
            </>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-1 sm:mt-2 flex flex-col gap-1.5">
          <button
            onClick={handleAddToCart}
            className="w-full py-1.5 sm:py-2 bg-brand-600 text-white rounded-md hover:bg-brand-700 transition-colors flex items-center justify-center gap-1.5"
          >
            <FiShoppingCart className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            <span className="text-xs sm:text-sm font-medium whitespace-nowrap">Add to Cart</span>
          </button>
          <button
            onClick={handleBuyNow}
            className="w-full py-1.5 sm:py-2 bg-stone-800 text-white rounded-md hover:bg-stone-900 transition-colors flex items-center justify-center gap-1.5"
          >
            <BsLightning className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            <span className="text-xs sm:text-sm font-medium whitespace-nowrap">Buy Now</span>
          </button>
        </div>
      </div>
    </Link>
  );
};

// List Card Component
const ProductListCard = ({ product }: { product: any }) => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const cartdata = useSelector((state: RootState) => state.shoppingcart.cartdata);

  const discount =
    product.i_prevprice > product.i_price
      ? Math.round(
        ((product.i_prevprice - product.i_price) / product.i_prevprice) * 100
      )
      : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const localevoFrontCart = localStorage.getItem('evoFrontCart');
    const parsedCart = localevoFrontCart ? JSON.parse(localevoFrontCart) : { items: [], ctoken: '' };

    const existingItemIndex = parsedCart.items.findIndex(
      (item: any) => item.item_id === product.itemid && item.item_color === ""
    );

    let updatedCart;
    if (existingItemIndex >= 0) {
      // Item exists, increase quantity
      updatedCart = parsedCart.items.map((item: any, index: number) =>
        index === existingItemIndex
          ? { ...item, item_quantity: item.item_quantity + 1 }
          : item
      );
      toast.success("Item quantity increased");
    } else {
      // Add new item
      const newItem = {
        item_id: product.itemid,
        item_name: product.i_name,
        item_slug: product.i_slug,
        item_price: product.i_price,
        item_quantity: 1,
        item_color: "",
        item_mainimg: product.i_mainimg,
        item_weight: product.i_weight || 0,
        item_instock: product.i_instock,
      };
      updatedCart = [...parsedCart.items, newItem];
      toast.success("Item added to cart");
    }

    // Update localStorage
    localStorage.setItem('evoFrontCart', JSON.stringify({ ...parsedCart, items: updatedCart }));

    // Update Redux
    dispatch(setCartData(updatedCart));
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Add to cart first
    handleAddToCart(e);

    // Navigate to cart page
    setTimeout(() => {
      router.push('/cart');
    }, 500);
  };

  return (
    <Link
      href={`/items/${product.i_slug}`}
      className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-stone-100 hover:border-brand-200 flex flex-col sm:flex-row"
    >
      {/* Image Container */}
      <div className="relative w-full sm:w-64 h-64 sm:h-auto flex-shrink-0 overflow-hidden bg-stone-50">
        <Image
          src={product.i_mainimg || "/assets/placeholder-product.svg"}
          alt={product.i_name}
          fill
          sizes="256px"
          className="object-cover group-hover:scale-110 transition-transform duration-500"
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {discount > 0 && (
            <span className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-md">
              -{discount}%
            </span>
          )}
          {!product.i_instock && (
            <span className="px-2 py-1 bg-stone-800 text-white text-xs font-bold rounded-md">
              Out of Stock
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        {/* Brand */}
        {product.i_brandName && (
          <p className="text-sm text-stone-500 uppercase tracking-wide mb-1">
            {product.i_brandName}
          </p>
        )}

        {/* Name */}
        <h3 className="text-lg font-bold text-stone-900 mb-2 group-hover:text-brand-600 transition-colors">
          {product.i_name}
        </h3>

        {/* Rating */}
        {product.i_rating > 0 && (
          <div className="flex items-center gap-2 mb-3">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <FiStar
                  key={i}
                  className={`w-4 h-4 ${i < Math.floor(product.i_rating)
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-stone-300"
                    }`}
                />
              ))}
            </div>
            <span className="text-sm text-stone-500">
              {product.i_rating.toFixed(1)} ({product.i_reviewCount} reviews)
            </span>
          </div>
        )}

        {/* Description */}
        {product.i_description && (
          <p className="text-sm text-stone-600 mb-4 line-clamp-2">
            {product.i_description}
          </p>
        )}

        {/* Features */}
        {product.i_features && product.i_features.length > 0 && (
          <ul className="mb-4 space-y-1">
            {product.i_features
              .slice(0, 3)
              .map((feature: string, idx: number) => (
                <li
                  key={idx}
                  className="flex items-start gap-2 text-sm text-stone-600"
                >
                  <BsLightning className="w-4 h-4 text-brand-600 flex-shrink-0 mt-0.5" />
                  <span>{feature}</span>
                </li>
              ))}
          </ul>
        )}

        {/* Price and Action */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-auto">
          <div className="flex flex-col gap-1">
            {product.i_preorderprice && product.i_ispreorder && product.i_preorderprice < product.i_price ? (
              <>
                <span className="text-2xl font-bold text-cyan-600">
                  BDT {product.i_preorderprice.toLocaleString()}
                </span>
                <span className="text-base text-red-500 line-through">
                  BDT {product.i_price.toLocaleString()}
                </span>
              </>
            ) : (
              <>
                <span className="text-2xl font-bold text-stone-900">
                  BDT {product.i_price.toLocaleString()}
                </span>
                {product.i_prevprice > product.i_price && (
                  <span className="text-base text-stone-400 line-through">
                    BDT {product.i_prevprice.toLocaleString()}
                  </span>
                )}
              </>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <button
              onClick={handleAddToCart}
              className="px-6 py-2.5 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors flex items-center justify-center gap-2"
            >
              <FiShoppingCart className="w-4 h-4" />
              <span className="text-sm font-medium">Add to Cart</span>
            </button>
            <button
              onClick={handleBuyNow}
              className="px-6 py-2.5 bg-stone-800 text-white rounded-lg hover:bg-stone-900 transition-colors flex items-center justify-center gap-2"
            >
              <BsLightning className="w-4 h-4" />
              <span className="text-sm font-medium">Buy Now</span>
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
};

export { ModernProductsListing };