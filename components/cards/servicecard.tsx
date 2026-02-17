import Image from "next/image";
import Link from "next/link";
import type { Servicecardtype } from "@/utils/types_interfaces/shared_types";

const ServiceCard = ({ gotourl = "#", imgsrc = "", name = "" }: Servicecardtype) => {


    return (
        <Link href={gotourl} className="w-full max-w-[180px] h-fit flex flex-col items-center gap-3 focus:outline-none group/servicecard">
            <div className="relative w-full h-[130px] bg-[#fefefe]/95 rounded-[10px] overflow-hidden">
                <Image
                    src={imgsrc}
                    alt={name}
                    fill
                    sizes="100%"
                    quality={90}
                    draggable="false"
                    placeholder="blur"
                    className="object-contain scale-85 hover:scale-[0.9] origin-center transition-transform duration-250 ease-linear"
                />
            </div>
            <div className="w-full h-[40px] text-left text-wrap text-[13px] leading-5 tracking-tight font-[600] text-stone-900 group-hover/servicecard:text-sky-600 line-clamp-2">
                {name}
            </div>
        </Link>
    );
}

export default ServiceCard;
