"use client";

import {
    Card,
    CardHeader,
    CardContent,
    CardFooter,
} from "@/components/ui/evo_card";
import Link from "next/link";

type AuthCardWrapperProps = {
    children: React.ReactNode;
    headerLabel: string;
    headerDescription?: string;
    bottomText?: string;
    bottomButtonLabel?: string;
    bottomButtonHref?: string;
};

const AuthCardWrapper = ({
    children,
    headerLabel,
    headerDescription = "",
    bottomText,
    bottomButtonLabel,
    bottomButtonHref,
}: AuthCardWrapperProps) => {
    return (
        <Card className="w-full max-w-[350px] border border-stone-300 shadow-md shadow-stone-300">
            <CardHeader className="w-full items-center">
                <h2 className="text-base sm:text-xl font-[600] text-stone-700">{headerLabel}</h2>
                {headerDescription && <p className="text-xs text-stone-500">{headerDescription}</p>}
            </CardHeader>
            <CardContent>
                {children}
            </CardContent>

            <CardFooter className="justify-center">
                <div className="flex flex-wrap justify-center gap-1 text-[12px] sm:text-[13px] leading-5 font-[500]">
                    {bottomText && <p className="text-stone-700">{bottomText}</p>}
                    {(bottomButtonLabel && bottomButtonHref) &&
                        (<Link href={bottomButtonHref} className="text-[#0866FF] hover:text-stone-800 hover:underline">
                            {bottomButtonLabel}
                        </Link>)
                    }
                </div>
            </CardFooter>
        </Card>
    );
}

export { AuthCardWrapper };
