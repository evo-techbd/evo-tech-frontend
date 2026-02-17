import Image from "next/image";

import BrandLogo from "@/public/assets/EvoTechBD-logo-gray.png";

const Loading = () => {
    return (
        <>
            <div className="fixed z-[260] inset-0 flex flex-col justify-center items-center gap-2 p-4 font-inter bg-stone-100">
                <div className="relative flex min-w-[110px] min-h-[52px] w-fit h-fit focus:outline-none animate-pulse">
                    <Image
                        src={BrandLogo}
                        alt="Evo-TechBD Logo"
                        draggable={false}
                        quality={100}
                        width={160}
                        height={60}
                        className={`w-auto h-auto max-w-[110px] max-h-[52px] object-contain`}
                        priority
                    />
                </div>
            </div>
        </>
    );
}

export default Loading;
