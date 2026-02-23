"use client";

import { cn } from "@/lib/all_utils";
import { isHexColor } from "@/utils/essential_functions";


const StarRating = ({ rating = 0.0, starClassName = "", fillColorHex = "#0866FF", emptyColorHex = "#c0bdbc" }: { rating: number; starClassName?: string; fillColorHex?: string; emptyColorHex?: string; }) => {

    let ratingVal = parseFloat(rating.toFixed(1));

    let starArray: number[] = [];

    for (let i = 1; i <= 5; i++) {
        if (ratingVal >= i) {
            starArray.push(1);
        } else if ((ratingVal - i + 1) > 0) {
            starArray.push((ratingVal - i + 1));
        } else {
            starArray.push(0);
        }
    }

    if (!isHexColor(fillColorHex)) {
        fillColorHex = "#0866FF";
    }

    if (!isHexColor(emptyColorHex)) {
        emptyColorHex = "#c0bdbc";
    }


    return (
        <>
            <div className="flex items-center w-fit h-fit gap-0.5">
                {
                    starArray.map((starvalue, idx) => {
                        if (starvalue === 1 || starvalue === 0) {
                            return (
                                <div key={`ratingstar${idx}`} aria-label="star icon" className={cn(`inline w-[13px] h-[13px] sm:w-[14px] sm:h-[14px]`, starClassName)}
                                    style={{
                                        background: `${starvalue === 1 ? fillColorHex : emptyColorHex}`,
                                        clipPath: `polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)`,
                                    }}
                                >
                                </div>
                            )
                        } else {
                            return (
                                <div key={`ratingstar${idx}`} aria-label="star icon" className={cn(`inline w-[13px] h-[13px] sm:w-[14px] sm:h-[14px]`, starClassName)}
                                    style={{
                                        background: `linear-gradient(to right, ${fillColorHex} ${starvalue * 100}%, ${emptyColorHex} ${starvalue * 100}%)`,
                                        clipPath: `polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)`,
                                    }}
                                >
                                </div>
                            )
                        }
                    })
                }
            </div>
        </>
    );
}

export default StarRating;
