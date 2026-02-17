import Image from "next/image";
import Link from "next/link";
import EvoTechBDLogo from '@/public/assets/EvoTechBD-logo-gray.png';


const AuthLayout = ({ children }: { children: React.ReactNode; }) => {


    return (
        <div className="relative w-full min-h-screen h-fit flex flex-col items-center bg-[#EEEEEE] px-6 sm:px-10 pt-7 pb-8 gap-5">
            <Link href="/" className="relative w-fit h-fit focus:outline-none">
                <Image
                    src={EvoTechBDLogo}
                    alt="Evo-TechBD Logo"
                    draggable={false}
                    quality={100}
                    width={160}
                    height={60}
                    priority
                    className="w-auto h-auto max-w-[110px] sm:max-w-[120px] max-h-[50px] object-contain pointer-events-none select-none"
                />
            </Link>
            <div className="relative w-full h-fit flex flex-col items-center">
                {children}
            </div>
        </div>
    );
}

export default AuthLayout;
