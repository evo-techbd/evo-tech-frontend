import Image from "next/image";
import Link from "next/link";
import type { Productcardtype } from "@/utils/types_interfaces/shared_types";
import { currencyFormatBDT } from "@/lib/all_utils";

const ProductCard = ({ imgsrc = "", prodname = "unknown product", prodslug = ``, prodprice = 0, prodprevprice = 0, instock = true, stock, lowStockThreshold }: Productcardtype) => {

    const threshold = lowStockThreshold || 3;
    const isLowStock = stock !== undefined && stock <= threshold && stock > 0;

    return (
        <div className="flex flex-col items-center w-full min-w-[150px] h-[330px] bg-[#FAFAFA] overflow-hidden rounded-[10px] group/productcard">
            <div className="w-full min-h-[240px] h-[240px] px-2 pt-2 bg-[#f8f8f8]">
                <Link href={`/items/${prodslug}`} className="relative w-full h-full focus:outline-none">
                    <div className="relative w-full h-full rounded-t-[4px] overflow-hidden">
                        <Image
                            src={imgsrc}
                            alt={`${prodname} image`}
                            fill
                            quality={90}
                            draggable={false}
                            sizes="100%"
                            loading="lazy"
                            className="object-cover object-center hover:scale-[1.05] transition duration-250 ease-linear"
                        />
                        {isLowStock && (
                            <div className="absolute top-2 right-2 w-3 h-3 bg-red-600 rounded-full shadow-md" title={`Only ${stock} left in stock`} />
                        )}
                    </div>
                </Link>
            </div>
            <div className="w-full h-full flex flex-col px-4 py-3 border-t-2 border-stone-200">
                <Link href={`/items/${prodslug}`} className="w-full text-left line-clamp-2 font-[600] text-[14px] leading-5 text-stone-950 hover:text-[#0035FF] tracking-tight focus:outline-none transition duration-200">{prodname}</Link>
                <p className="w-full text-left line-clamp-1 font-[500] text-[13px] leading-6 text-stone-700 tracking-tight">
                    {instock ?
                        <>
                            {`BDT ${currencyFormatBDT(prodprice)}`}{prodprevprice !== 0 && <span className="text-[12px] text-stone-500 font-[400] line-through decoration-1 decoration-stone-600 ml-2">{currencyFormatBDT(prodprevprice)}</span>}
                        </>
                        :
                        <span className="text-red-600">Out of Stock</span>
                    }
                </p>
            </div>
        </div>
    );
}

export default ProductCard;
