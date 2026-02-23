"use client";

import { DEFAULT_SIGNIN_REDIRECT_USER } from "@/routeslist";
import { signIn } from "next-auth/react";
import { FcGoogle } from "react-icons/fc";


const SocialProviders = () => {

    const handleProviderClick = (provider: "google") => {
        signIn(provider, {
            redirectTo: DEFAULT_SIGNIN_REDIRECT_USER,
        })
    };

    return (
        <div className="flex flex-wrap w-full justify-center gap-2">
            <button type="button"
                onClick={() => handleProviderClick("google")}
                aria-label="sign in with google"
                className="flex justify-center w-full px-4 py-1.5 sm:px-5 sm:py-2 gap-1 text-[12px] sm:text-[13px] leading-5 font-[500] text-stone-700 rounded-[6px] border border-stone-300 shadow-md shadow-stone-300 hover:shadow transition-all duration-100 ease-linear"
            >
                <FcGoogle className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Sign in with Google</span>
            </button>
        </div>
    );
}

export { SocialProviders };
