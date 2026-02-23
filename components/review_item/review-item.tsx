"use client";

import Image from 'next/image';
import { Avatar } from "@nextui-org/avatar";
import StarRating from '@/components/star-rating';
import TextExpandCollapse from '@/components/text-expand-collapse';
import { getNameInitials } from '@/utils/essential_functions';


const ReviewItem = ({ individualreview }: { individualreview: any; }) => {

    return (
        <div className="flex flex-col w-full h-fit gap-1 py-4 md:py-5 border-t border-stone-300">
            <div className="flex w-fit h-fit items-center gap-3">
                <Avatar
                    aria-label={`avatar of ${individualreview.reviewer}`}
                    showFallback
                    name={getNameInitials(individualreview.reviewer)}
                    radius="full"
                    classNames={{
                        base: "w-6 h-6 sm:w-7 sm:h-7 bg-stone-900 box-border border-0 outline-0 focus:outline-none ring-1 ring-stone-500 cursor-default",
                        name: "text-stone-50 text-[9px] sm:text-[11px] leading-3 font-[600]",
                        icon: "w-[18px] h-[18px] sm:w-5 sm:h-5 text-stone-100",
                    }}
                />
                <div className="flex flex-col w-fit h-fit gap-px sm:gap-0.5">
                    <p className="w-[180px] h-fit text-[12px] sm:text-[13px] leading-5 font-[500] text-stone-900 truncate">{individualreview.reviewer}</p>
                    <p className="w-[180px] h-fit text-[11px] sm:text-[12px] leading-4 font-[400] text-stone-600 truncate">{individualreview.updated_at}</p>
                </div>
            </div>
            <div className="flex w-full h-fit my-1.5 sm:my-2">
                <StarRating rating={individualreview.rating} starClassName="md:w-[15px] md:h-[15px]" fillColorHex="#0035FF" />
            </div>
            <div className="flex flex-col lg:flex-row lg:justify-between w-full h-fit gap-x-5 gap-y-3 mt-1">
                <TextExpandCollapse maxLine={3} ellipsisOrTrimEndChars={30} moreButtonText="...show more" lessButtonText="&nbsp;&nbsp;show less">
                    {individualreview.review_content}
                </TextExpandCollapse>
                {
                    individualreview.review_images.length > 0 &&
                    <div className="flex flex-wrap w-fit h-fit gap-2 md:gap-3">
                        {individualreview.review_images.length <= 3 ?
                            individualreview.review_images.sort((a: any, b: any) => a.sortorder_user - b.sortorder_user).map((img: any, imgIdx: number) => (
                                <div key={`review_img${imgIdx}`} className="relative w-[40px] h-[40px] md:w-[45px] md:h-[45px] lg:w-[52px] lg:h-[52px] bg-white rounded-[4px] overflow-hidden ring-1 ring-stone-400 shadow-md shadow-black/15">
                                    <Image
                                        src={img.imgurl}
                                        alt={`reviewer's image ${imgIdx + 1}`}
                                        fill
                                        quality={100}
                                        draggable="false"
                                        sizes="100%"
                                        className="object-cover object-center"
                                    />
                                    <div className="absolute z-[1] inset-0 hover:backdrop-brightness-95 cursor-zoom-in"></div>
                                </div>
                            ))
                            :
                            individualreview.review_images.sort((a: any, b: any) => a.sortorder_user - b.sortorder_user).slice(0, 3).map((img: any, imgIdx: number) => (
                                <div key={`review_img${imgIdx}`} className="relative w-[40px] h-[40px] md:w-[45px] md:h-[45px] lg:w-[52px] lg:h-[52px] bg-white rounded-[4px] overflow-hidden ring-1 ring-stone-400 shadow-md shadow-black/15">
                                    <Image
                                        src={img.imgurl}
                                        alt={`reviewer's image ${imgIdx + 1}`}
                                        fill
                                        quality={100}
                                        draggable="false"
                                        sizes="100%"
                                        className="object-cover object-center"
                                    />
                                    {imgIdx === 2 && <div className="absolute z-[2] inset-0 flex justify-center items-center backdrop-brightness-[.70] text-stone-50 text-[13px] md:text-[14px] leading-5 font-[400] cursor-pointer">{(individualreview.review_images.length - 3 > 99) ? '99+' : `+${individualreview.review_images.length - 2}`}</div>}
                                    <div className="absolute z-[1] inset-0 hover:backdrop-brightness-95 cursor-zoom-in"></div>
                                </div>
                            ))
                        }
                    </div>
                }

            </div>
        </div>
    );
}

export default ReviewItem;
