import Image from "next/image";
import Link from "next/link";
import { Check } from "lucide-react";
import { currencyFormatBDT } from "@/lib/all_utils";
import { getDisplayPricing } from "@/utils/product-pricing";

export type ProductGroupMember = {
  _id: string;
  name: string;
  label?: string;
  slug: string;
  mainImage?: string;
  price: number;
  previousPrice?: number | null;
  preOrderPrice?: number | null;
  isPreOrder?: boolean | null;
  inStock?: boolean;
};

export type ProductGroupData = {
  _id: string;
  title?: string;
  members: ProductGroupMember[];
};

// Other models of the same product line, cheapest first. Name and price show
// on hover (always on touch screens) to keep the cards small.
const ProductGroupSelector = ({
  group,
  currentId,
}: {
  group: ProductGroupData;
  currentId: string;
}) => {
  const members = group.members
    .map((m) => ({ ...m, displayPrice: getDisplayPricing(m).currentPrice }))
    .sort((a, b) => a.displayPrice - b.displayPrice);

  const current = members.find((m) => String(m._id) === String(currentId));
  if (!current || members.length < 2) return null;

  return (
    <div className="flex flex-col w-full h-fit gap-2.5 border-t border-stone-300 pt-4 pb-1">
      <h3 className="text-[13px] md:text-[14px] leading-5 tracking-tight font-[600] text-stone-900">
        {group.title || "Available Models"}
      </h3>
      <div className="flex w-full h-fit gap-2 overflow-x-auto pb-1">
        {members.map((m) => {
          const isCurrent = m === current;
          const diff = m.displayPrice - current.displayPrice;
          const displayName = m.label || m.name;

          return (
            <Link
              key={m._id}
              href={`/items/${m.slug}`}
              scroll={false}
              aria-current={isCurrent ? "page" : undefined}
              aria-label={`${m.name}, BDT ${currencyFormatBDT(m.displayPrice)}`}
              className={`group relative shrink-0 w-[84px] sm:w-[96px] aspect-square rounded-lg overflow-hidden bg-white border-2 transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 ${
                isCurrent
                  ? "border-brand-500 shadow-md"
                  : "border-stone-200 hover:border-stone-400"
              } ${!m.inStock && !isCurrent ? "opacity-60" : ""}`}
            >
              <Image
                src={m.mainImage || "/assets/placeholder-product.svg"}
                alt={m.name}
                fill
                sizes="96px"
                quality={75}
                className="object-contain p-1.5 group-hover:scale-105 transition-transform duration-300 ease-out"
              />

              {!isCurrent && diff !== 0 && (
                <span
                  className={`absolute top-1 left-1 px-1 py-0.5 rounded-[3px] whitespace-nowrap text-[9px] leading-none font-[600] text-white ${
                    diff < 0 ? "bg-brand-600" : "bg-stone-800"
                  }`}
                >
                  {`${diff > 0 ? "+" : "−"}BDT ${currencyFormatBDT(Math.abs(diff))}`}
                </span>
              )}

              {isCurrent && (
                <span className="absolute top-1 right-1 flex items-center justify-center w-4 h-4 rounded-full bg-brand-500 text-white">
                  <Check className="w-3 h-3" strokeWidth={3} />
                </span>
              )}

              <div className="absolute inset-0 flex flex-col justify-end p-1.5 bg-gradient-to-t from-black/80 via-black/30 to-transparent transition-opacity duration-200 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100 [@media(hover:hover)]:group-focus-visible:opacity-100">
                <span className="text-[10px] leading-tight font-[600] text-white line-clamp-2">
                  {displayName}
                </span>
                <span className="text-[10px] leading-tight font-[500] text-brand-200">
                  {`BDT ${currencyFormatBDT(m.displayPrice)}`}
                </span>
                {!m.inStock && (
                  <span className="text-[9px] leading-tight font-[500] text-red-300">
                    Out of Stock
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default ProductGroupSelector;
