"use client";

import { sumOfNumArrValues } from "@/utils/essential_functions";


const StarRatingChart = ({ reviewsCountPerStarArray }: { reviewsCountPerStarArray: number[]; }) => {

    const totalReviews = sumOfNumArrValues(reviewsCountPerStarArray);

    return (
        <div className="flex flex-col flex-none w-[180px] sm:w-[220px] md:w-[250px] h-fit gap-1">
            {reviewsCountPerStarArray.length > 0 &&
                reviewsCountPerStarArray.map((count, idx) => {
                    return (
                        <div key={`starcount${idx}`} className="flex items-center w-full h-fit gap-2">
                            <div className="flex flex-none justify-end items-center w-[30px] h-fit text-[12px] sm:text-[13px] md:text-[14px] leading-3 sm:leading-4 md:leading-5 font-[500] text-stone-800">
                                {`${reviewsCountPerStarArray.length - idx}`}<span className="hidden sm:inline text-[14px] md:text-[15px] leading-4 md:leading-5 text-[#0866FF] ml-1">★</span>
                            </div>

                            <div className="flex w-full h-[6px] md:h-[7px] rounded-[6px]"
                                style={{
                                    background: totalReviews === 0 ? "#cccfcf" : `linear-gradient(to right, #0866FF ${((count / totalReviews) * 100).toFixed(2)}%, #cccfcf ${((count / totalReviews) * 100).toFixed(2)}%)`,
                                }}
                            >
                            </div>
                        </div>
                    )
                })
            }

        </div>
    );
}

export default StarRatingChart;
