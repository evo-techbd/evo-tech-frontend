import Link from "next/link";

const NotFound = () => {

    return (
        <>
            <div className="w-full min-h-[60px] sm:min-h-[68px] bg-gradient-to-br from-stone-950 via-stone-600 via-60% to-stone-900 translate-y-[-60px] sm:translate-y-[-68px] mb-[-60px] sm:mb-[-68px]">
            </div>

            <div className="flex flex-col items-center w-full min-h-screen gap-4 md:gap-5 p-4 font-inter bg-stone-100 text-stone-700">
                <h1 className="w-fit h-fit pt-7 pb-1 text-base md:text-xl tracking-tight font-[600] text-center">404 - Not Found</h1>
                <p className="w-fit h-fit p-1 text-[12px] md:text-[13px] leading-5 tracking-tight font-[500] text-center">{`Sorry, the requested resource couldn't be found.`}</p>
                <Link href="/" className="w-fit h-fit px-3 py-1 md:px-5 md:py-2 border-2 border-stone-500 rounded-[6px] text-[11px] md:text-[12px] leading-5 tracking-tight font-[500] hover:bg-stone-500/10 transition-colors duration-100 ease-linear">
                    Back to Home
                </Link>
            </div>
        </>
    );
}

export default NotFound;
