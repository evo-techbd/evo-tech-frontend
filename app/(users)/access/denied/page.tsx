import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Access Denied",
};


const AccessDeniedPage = () => {

    return (
        <>
            <div className="w-full min-h-[60px] sm:min-h-[68px] bg-gradient-to-br from-stone-950 via-stone-600 via-60% to-stone-900 translate-y-[-60px] sm:translate-y-[-68px] mb-[-60px] sm:mb-[-68px]">
            </div>

            <div className='w-full min-h-[calc(100vh-100px)] flex flex-col items-center justify-center px-5 py-4 font-inter'>
                <h1 className='text-stone-700 text-[14px] md:text-[17px] leading-6 font-[600]'>
                    Access Denied
                </h1>
                <p className='text-stone-600 text-[12px] md:text-[14px] leading-6'>
                    You are not authorized to access this page.
                </p>
            </div>
        </>
    );
}

export default AccessDeniedPage;
