"use client";

import { FallbackProps } from 'react-error-boundary';


const ErrorBoundaryFallback = (props: FallbackProps) => {
    const { error, resetErrorBoundary } = props;

    return (
        <>
            <div className="w-full h-fit flex justify-center bg-[#EEEEEE]">
                <div className="w-full max-w-[1440px] min-h-screen h-fit flex flex-col justify-start items-center p-10 md:p-20 gap-9 font-inter">
                    <div className="w-fit h-fit flex flex-col items-start px-6 py-4 gap-3 border-y border-stone-400/30">
                        <h3 className="text-[13px] leading-5 sm:text-base font-[600] text-stone-800">Oops!! Something went wrong</h3>
                        <p className="text-[11px] leading-4 sm:text-[13px] sm:leading-5 font-[400] text-red-500 bg-red-500/5 px-5 py-2 border-0 border-l-2 border-l-red-500">{error.message}</p>
                    </div>
                    <button onClick={resetErrorBoundary} className="px-4 py-2 text-[11px] leading-4 sm:text-[13px] font-[500] text-white rounded-md bg-stone-500/50 outline-0 focus:bg-stone-500/70 transform focus:scale-[.97] transition-all duration-75">
                        Try Refreshing
                    </button>
                </div>
            </div>
        </>
    );
}

export { ErrorBoundaryFallback };
