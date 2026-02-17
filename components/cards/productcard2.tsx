"use client";

import Image from "next/image";
import Link from "next/link";
import { currencyFormatBDT } from "@/lib/all_utils";
import { RiHeartLine } from "react-icons/ri";
import { IoCart } from "react-icons/io5";
import { toast } from "sonner";
import { CustomToast } from "@/components/ui/customtoast";
import axiosLocal from "@/utils/axios/axiosLocal";
import axiosErrorLogger from "@/components/error/axios_error";


const ProductCard2 = ({ eachItem }: { eachItem: any; }) => {

    const threshold = eachItem.i_lowstockthreshold || 3;
    const isLowStock = eachItem.i_stock !== undefined && eachItem.i_stock <= threshold && eachItem.i_stock > 0;

    const setCartLocal = (cartLocal: any) => {
        localStorage.setItem('evoFrontCart', JSON.stringify(cartLocal));
    
        // Dispatch a custom event when updating the cart
        const event = new CustomEvent('localStorageChange', {
            detail: { key: 'evoFrontCart', newValue: cartLocal }
        });
        window.dispatchEvent(event);
    };


    const handleAddToCart = async () => {

        const localevoFrontCart = localStorage.getItem('evoFrontCart');
        const parsedCart = localevoFrontCart ? JSON.parse(localevoFrontCart) : null;

        let cartreqbody = {};
        if (parsedCart && parsedCart.ctoken) {
            cartreqbody = {
                cart_t: parsedCart.ctoken,
            };
        }

    const cartResponse = await axiosLocal.post(`/api/shopping/add`, {
            item_id: eachItem.itemid,
            item_quantity: 1,
            item_price: eachItem.i_price,
            item_color: "",
            ...cartreqbody,
        }
        ).then((res) => res.data)
            .catch((error: any) => {
                axiosErrorLogger({ error });
                return null;
            });


        if (cartResponse && cartResponse.message && cartResponse.message === "Item added to cart") {
            const cartlocal: { items: any[]; ctoken: string } = { items: cartResponse.cartdata, ctoken: cartResponse.ctoken };
            setCartLocal(cartlocal);
            toast.success("Item added to cart");
        } else if (cartResponse && cartResponse.message && cartResponse.message === "Item already in cart, quantity updated") {
            const cartlocal: { items: any[]; ctoken: string } = { items: cartResponse.cartdata, ctoken: cartResponse.ctoken };
            setCartLocal(cartlocal);
            toast.custom((t) => (
                <CustomToast toastid={t}
                    title={<span className="text-blue-600">Item already in cart, quantity increased</span>}
                    description="visit the cart to update"
                />
            ), {
                duration: 4000,
            })
        } else if (cartResponse && cartResponse.message && cartResponse.message === "Quantity limit reached") {
            toast.error("Limit reached, cannot add more at this time");
        } else {
            toast.error("Something went wrong");
        }
    };
    

    return (
        <div className="flex flex-col items-center w-full min-w-[150px] max-[550px]:max-w-[240px] max-w-[270px] h-fit bg-[#FFFFFF] overflow-hidden rounded-[10px] shadow-sm shadow-black/15">
            <div className="flex flex-col items-center w-full min-h-[330px] h-[330px]">
                <div className="relative w-full min-h-[240px] h-[240px] px-2 pt-2 bg-[#F8F8F8]">
                    <Link href={`/items/${eachItem.i_slug}`} className="w-full h-full focus:outline-none">
                        <div className="relative w-full h-full rounded-t-[4px] overflow-hidden bg-white">
                            <Image
                                src={eachItem.i_mainimg}
                                alt={`${eachItem.i_name} image`}
                                fill
                                quality={90}
                                draggable={false}
                                sizes="100%"
                                loading="lazy"
                                className="object-cover object-center hover:scale-[1.05] transition duration-250 ease-linear"
                            />
                            {isLowStock && (
                                <div className="absolute top-2 right-2 w-3 h-3 bg-red-600 rounded-full shadow-md" title={`Only ${eachItem.i_stock} left in stock`} />
                            )}
                        </div>
                    </Link>
                </div>

                <div className="w-full h-full flex flex-col px-4 py-3 border-t border-stone-200">
                    <Link href={`/items/${eachItem.i_slug}`} className="w-full text-left line-clamp-2 font-[600] text-[14px] leading-5 text-stone-950 hover:text-[#0035FF] tracking-tight focus:outline-none transition duration-200">{eachItem.i_name}</Link>
                    <p className="w-full text-left line-clamp-1 font-[500] text-[13px] leading-6 text-stone-700 tracking-tight">
                        {eachItem.i_instock ?
                            <>
                                {`BDT ${currencyFormatBDT(eachItem.i_price)}`}{eachItem.i_prevprice !== 0 && <span className="text-[12px] text-stone-500 font-[400] line-through decoration-1 decoration-stone-600 ml-2">{currencyFormatBDT(eachItem.i_prevprice)}</span>}
                            </>
                            :
                            <span className="text-red-600">Out of Stock</span>
                        }
                    </p>
                </div>
            </div>

            <div className="flex flex-col items-center w-full h-fit p-2 gap-2">
                {eachItem.i_subcategory === "filaments" ?
                    <Link href={`/items/${eachItem.i_slug}`} className={`w-full h-fit px-5 py-2 text-center text-[12px] sm:text-[13px] leading-5 font-[600] tracking-tight text-stone-100 bg-stone-900 hover:bg-stone-700 rounded-[6px] overflow-hidden transition-colors duration-100 ease-linear focus:outline-none`}>
                        View Details
                    </Link>
                    :
                    <button type="button" aria-label="add to cart" onClick={handleAddToCart} disabled={!eachItem.i_instock && !eachItem.i_ispreorder} className="w-full h-fit px-5 py-2 text-center text-[12px] sm:text-[13px] leading-5 font-[600] tracking-tight text-stone-100 bg-stone-900 disabled:bg-stone-600 hover:bg-stone-700 rounded-[6px] overflow-hidden transition-colors duration-100 ease-linear">
                        Add to Cart
                        <IoCart className="inline w-4 h-4 ml-1" />
                    </button>
                }
                <button type="button" aria-label="add to wishlist" className="w-full h-fit px-5 py-2 text-center text-[12px] sm:text-[13px] leading-5 font-[600] tracking-tight text-stone-700 border border-stone-200 rounded-[6px] overflow-hidden hover:bg-stone-200 transition-colors duration-100 ease-linear">
                    Add to Wishlist
                    <RiHeartLine className="inline w-4 h-4 ml-1" />
                </button>
            </div>
        </div>
    );
}

export default ProductCard2;
