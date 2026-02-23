"use client";

import { useState, useEffect } from 'react';
import { IoIosArrowUp } from "react-icons/io";


const ScrollBacktoTop = () => {

    const [backToTopShown, setBackToTopShown] = useState(false);

    useEffect(() => {
        const handleScrollY = () => {
            if (window?.scrollY > 600) {
                setBackToTopShown(true);
            } else {
                setBackToTopShown(false);
            }
        }

        // check if it's already scrolled on initial render
        handleScrollY();
        window.addEventListener("scroll", handleScrollY);

        return () => {
            window.removeEventListener("scroll", handleScrollY);
        }
    }, []);

    const handleBackToTopClick = () => {
        window?.scrollTo({ top: 0, behavior: "smooth" });
    };


    return (
        <button onClick={handleBackToTopClick} aria-label="back to top button" className={`z-[240] fixed right-[20px] sm:right-[30px] ${backToTopShown ? 'bottom-[20px] sm:bottom-[30px] opacity-100' : 'bottom-[-50px] opacity-0'} w-7 h-7 sm:w-9 sm:h-9 p-0.5 flex justify-center items-center bg-white rounded-full shadow-lg hover:shadow-md shadow-black/25 hover:shadow-black/30 transition-[box-shadow,_bottom,_opacity] [transition-duration:100ms,_300ms,_300ms] ease-linear group/backtotop`}>
            <IoIosArrowUp className="inline w-[15px] h-[15px] sm:w-4 sm:h-4 text-stone-900 group-hover/backtotop:mb-1.5 transition-[margin] duration-150 ease-linear" />
            <div className="absolute bottom-1/2 translate-y-[58%] mx-auto bg-stone-700 w-px sm:w-0.5 h-0 group-hover/backtotop:h-3 transition-[height] duration-150 ease-linear"></div>
        </button>
    );
}

export default ScrollBacktoTop;
