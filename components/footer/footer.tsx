"use client";

import Link from 'next/link';
import Image from 'next/image';
import { Accordion, AccordionItem } from "@nextui-org/accordion";
import { IoChevronDown, IoMailOutline, IoCallOutline, IoLocationOutline } from "react-icons/io5";
import { BsFacebook, BsInstagram, BsWhatsapp, BsYoutube } from "react-icons/bs";
import { BiLogoLinkedin } from "react-icons/bi";
import { useTaxonomy } from '@/hooks/use-taxonomy';

import EvoTechBDLogo from '@/public/assets/EvoTechBD-logo-white.png';
import VisaCardLogo from '@/public/assets/shared_resources/visa-logo.png';
import BkashLogo from '@/public/assets/shared_resources/bkash-logo.png';
import NagadLogo from '@/public/assets/shared_resources/nagad-logo.png';
import NpsbLogo from '@/public/assets/shared_resources/npsb-logo.png';



const Footer = () => {
    const { categories } = useTaxonomy();

    const footerPaymentMethods: { id: number; name: string; logo: any; }[] = [
        { id: 1, name: "Visa logo", logo: VisaCardLogo },
        { id: 2, name: "bKash logo", logo: BkashLogo },
        { id: 3, name: "Nagad logo", logo: NagadLogo },
        { id: 4, name: "NPSB logo", logo: NpsbLogo },
    ];


    return (
        <div className="flex justify-center w-full h-fit bg-black font-inter selection:bg-sky-900/40 selection:text-stone-100">
            <div className="flex flex-col items-center w-full max-w-[1440px] min-h-[100px] px-3 sm:px-8 md:px-12 pt-12 pb-[50px]">
                <div className="flex flex-col items-center lg:flex-row-reverse lg:items-start lg:justify-start w-full h-fit gap-5">
                    <div className="flex flex-col items-center lg:items-start w-full lg:max-w-[300px] h-fit px-4 lg:px-0">
                        <p className="w-full text-[13px] md:text-[14px] leading-6 tracking-tight font-[500] text-stone-200 first-letter:text-[18px] first-letter:text-sky-300">
                            Get special offers, discounts and more,<br />right in your inbox.<IoMailOutline className="inline w-5 h-5 text-sky-300 ml-2" />
                        </p>

                        <form className="flex w-full h-fit py-3 mt-3">
                            <input
                                type="email"
                                name="subscribe-email"
                                placeholder="Your email here"
                                className="w-full h-[50px] pl-3 text-[12px] leading-6 tracking-tight font-[500] text-stone-300 placeholder:text-[12px] placeholder:font-[400] placeholder:text-stone-500 placeholder:italic bg-transparent border border-stone-600 rounded-l-[4px] overflow-hidden focus:outline-none focus:ring-1 focus:ring-sky-400 focus:ring-opacity-80"
                            />

                            <button
                                type="submit"
                                className="flex items-center w-fit h-[50px] px-3 text-[13px] md:text-[14px] leading-6 tracking-tight font-[500] text-stone-200 bg-stone-600/40 border-y border-r border-stone-600 active:bg-stone-800/70 focus:outline-none rounded-r-[4px] [box-shadow:_inset_2px_2px_4px_-1px_var(--tw-shadow-color),_inset_-2px_-2px_4px_-1px_rgba(10_10_10_/_1)] shadow-stone-500"
                            >
                                Subscribe
                            </button>
                        </form>
                    </div>

                    <div className="flex flex-col items-center md:flex-row md:items-start w-full pb-8 md:pb-12 gap-5">
                        <div className="flex flex-col items-start w-full md:max-w-[220px] h-fit px-4 md:px-0 gap-y-3 text-stone-400">
                            <div className="relative w-fit h-fit focus:outline-none">
                                <Image
                                    src={EvoTechBDLogo}
                                    alt="Evo-TechBD Logo"
                                    draggable={false}
                                    quality={90}
                                    width={160}
                                    height={60}
                                    className="w-auto h-auto max-w-[110px] sm:max-w-[120px] max-h-[50px] object-contain pointer-events-none select-none"
                                />
                            </div>

                            <p className="relative w-fit max-w-full pl-6 text-[13px] leading-5 tracking-tight font-[400] hover:text-stone-200 transition-colors duration-100">
                                <IoMailOutline className="inline w-4 h-4 text-stone-200 absolute top-0.5 left-0" />evotech.bd22@gmail.com
                            </p>
                            <p className="relative w-fit max-w-full pl-6 text-[13px] leading-5 tracking-tight font-[400] hover:text-stone-200 transition-colors duration-100">
                                <IoCallOutline className="inline w-4 h-4 text-stone-200 absolute top-0.5 left-0" />+880 1799 424854
                            </p>
                            <p className="relative w-fit max-w-full pl-6 text-[13px] leading-5 tracking-tight font-[400] hover:text-stone-200 transition-colors duration-100">
                                <IoLocationOutline className="inline w-4 h-4 text-stone-200 absolute top-0.5 left-0" />72/A, Matikata Bazar, Dhaka Cantonment, Dhaka-1206, Bangladesh
                            </p>
                        </div>

                        <div className="hidden md:flex w-full h-fit py-2 gap-5 text-stone-400">
                            <div className="flex flex-col items-start w-full max-w-[220px] h-fit gap-2">
                                <p className="text-[14px] leading-5 font-[500] pb-2 text-stone-200 cursor-default">Products</p>
                                {categories.slice(0, 5).map((category) => (
                                    <Link key={category.id} href={`/products-and-accessories?category=${category.slug}`} className="w-fit max-w-full text-wrap text-[12px] leading-5 tracking-tight font-[400] hover:text-stone-200 transition-colors duration-100">{category.name}</Link>
                                ))}
                            </div>

                            <div className="flex flex-col items-start w-full max-w-[220px] h-fit gap-2">
                                <p className="text-[14px] leading-5 font-[500] pb-2 text-stone-200 cursor-default">Support</p>
                                <Link href="/about/terms-and-conditions" className="w-fit max-w-full text-wrap text-[12px] leading-5 tracking-tight font-[400] hover:text-stone-200 transition-colors duration-100">Terms and Conditions</Link>
                                <Link href="/about/privacy-policy" className="w-fit max-w-full text-wrap text-[12px] leading-5 tracking-tight font-[400] hover:text-stone-200 transition-colors duration-100">Privacy Policy</Link>
                                <Link href="/about/warranty-policy" className="w-fit max-w-full text-wrap text-[12px] leading-5 tracking-tight font-[400] hover:text-stone-200 transition-colors duration-100">Warranty Policy</Link>
                                <Link href="/about/shipping-return-policy" className="w-fit max-w-full text-wrap text-[12px] leading-5 tracking-tight font-[400] hover:text-stone-200 transition-colors duration-100">Shipping & Return Policy</Link>
                            </div>

                            <div className="flex flex-col items-start w-full max-w-[220px] h-fit gap-2">
                                <p className="text-[14px] leading-5 font-[500] pb-2 text-stone-200 cursor-default">Explore</p>
                                <Link href="/services" className="w-fit max-w-full text-wrap text-[12px] leading-5 tracking-tight font-[400] hover:text-stone-200 transition-colors duration-100">About Us</Link>
                                <Link href="/contact-us" className="w-fit max-w-full text-wrap text-[12px] leading-5 tracking-tight font-[400] hover:text-stone-200 transition-colors duration-100">Contact Us</Link>
                                <Link href="/about/shop-shape-tomorrow" className="w-fit max-w-full text-wrap text-[12px] leading-5 tracking-tight font-[400] hover:text-stone-200 transition-colors duration-100">Shop & Shape Tomorrow</Link>
                                <Link href="/faqs" className="w-fit max-w-full text-wrap text-[12px] leading-5 tracking-tight font-[400] hover:text-stone-200 transition-colors duration-100">FAQs</Link>
                            </div>
                        </div>

                        <div className="flex flex-col items-center md:hidden w-full h-fit mb-2">
                            <Accordion
                                showDivider={false}
                                selectionMode="multiple"
                                variant="light"
                                className="w-full p-0"
                                itemClasses={{
                                    base: "w-full p-0 border-t border-stone-600",
                                    title: "text-[13px] leading-5 tracking-tight font-[500] text-stone-200",
                                    trigger: "px-4 data-[hover=true]:bg-stone-700/30 data-[open=true]:bg-stone-700/20 data-[open=true]:data-[hover=true]:bg-stone-700/30 transition-[background-color] duration-100",
                                    indicator: "data-[open=true]:rotate-[-180deg] text-stone-400",
                                    content: "px-4 py-3 text-[12px] leading-5 tracking-tight font-[400] text-stone-400",
                                }}
                            >
                                <AccordionItem key={`footer_section1`} aria-label="Products" title="Products" indicator={<IoChevronDown />}>
                                    <div className="flex flex-col items-start w-full h-fit gap-2">
                                        {categories.slice(0, 5).map((category) => (
                                            <Link key={category.id} href={`/products-and-accessories?category=${category.slug}`} className="w-fit text-[12px] leading-5 tracking-tight font-[400] hover:text-stone-200">{category.name}</Link>
                                        ))}
                                    </div>
                                </AccordionItem>

                                <AccordionItem key={`footer_section2`} aria-label="Support" title="Support" indicator={<IoChevronDown />}>
                                    <div className="flex flex-col items-start w-full h-fit gap-2">
                                        <Link href="/about/terms-and-conditions" className="w-fit text-[12px] leading-5 tracking-tight font-[400] hover:text-stone-200">Terms and Conditions</Link>
                                        <Link href="/about/privacy-policy" className="w-fit text-[12px] leading-5 tracking-tight font-[400] hover:text-stone-200">Privacy Policy</Link>
                                        <Link href="/about/warranty-policy" className="w-fit text-[12px] leading-5 tracking-tight font-[400] hover:text-stone-200">Warranty Policy</Link>
                                        <Link href="/about/shipping-return-policy" className="w-fit text-[12px] leading-5 tracking-tight font-[400] hover:text-stone-200">Shipping & Return Policy</Link>
                                    </div>
                                </AccordionItem>

                                <AccordionItem key={`footer_section3`} aria-label="Explore" title="Explore" indicator={<IoChevronDown />}>
                                    <div className="flex flex-col items-start w-full h-fit gap-2">
                                        <Link href="/services" className="w-fit text-[12px] leading-5 tracking-tight font-[400] hover:text-stone-200">About Us</Link>
                                        <Link href="/contact-us" className="w-fit text-[12px] leading-5 tracking-tight font-[400] hover:text-stone-200">Contact Us</Link>
                                        <Link href="/about/student-discount" className="w-fit text-[12px] leading-5 tracking-tight font-[400] hover:text-stone-200">Student Discount</Link>
                                        <Link href="/about/shop-shape-tomorrow" className="w-fit text-[12px] leading-5 tracking-tight font-[400] hover:text-stone-200">Shop & Shape Tomorrow</Link>
                                        <Link href="/faqs" className="w-fit text-[12px] leading-5 tracking-tight font-[400] hover:text-stone-200">FAQs</Link>
                                    </div>
                                </AccordionItem>
                            </Accordion>
                            <div className="w-full h-px bg-stone-600"></div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row-reverse lg:justify-between items-center w-full h-fit py-5 gap-6">
                    <div className="flex w-fit h-fit px-5 text-stone-300 gap-2">
                        <a href="https://www.facebook.com/EvoTechBD22" target="_blank" rel="noopener noreferrer" aria-label="facebook link" className="flex w-fit h-fit px-2 hover:text-stone-400 transition duration-100 focus:outline-none">
                            <BsFacebook className="inline w-4 h-4 md:w-5 md:h-5" />
                        </a>
                        <a href="#" target="_blank" rel="noopener noreferrer" aria-label="instagram link" className="flex w-fit h-fit px-2 hover:text-stone-400 transition duration-100 focus:outline-none">
                            <BsInstagram className="inline w-4 h-4 md:w-5 md:h-5" />
                        </a>
                        <a href="https://wa.me/+8801799424854/" target="_blank" rel="noopener noreferrer" aria-label="whatsapp link" className="flex w-fit h-fit px-2 hover:text-stone-400 transition duration-100 focus:outline-none">
                            <BsWhatsapp className="inline w-4 h-4 md:w-5 md:h-5" />
                        </a>
                        <a href="#" target="_blank" rel="noopener noreferrer" aria-label="linkedin link" className="flex w-fit h-fit px-2 hover:text-stone-400 transition duration-100 focus:outline-none">
                            <BiLogoLinkedin className="inline w-4 h-4 md:w-5 md:h-5" />
                        </a>
                        <a href="#" target="_blank" rel="noopener noreferrer" aria-label="youtube link" className="flex w-fit h-fit px-2 hover:text-stone-400 transition duration-100 focus:outline-none">
                            <BsYoutube className="inline w-4 h-4 md:w-5 md:h-5" />
                        </a>
                    </div>

                    <div className="flex w-fit h-fit gap-1" aria-label="payment-partners">
                        {
                            footerPaymentMethods.length > 0 && footerPaymentMethods.map((pmethod) => (
                                <div key={`f_pmethod${pmethod.id}`} className="relative w-[28px] h-[16px] md:w-[36px] md:h-[20px] bg-stone-100 border-x-[4px] border-y-2 md:border-x-[6px] md:border-y-3 border-stone-100 rounded-[3px] overflow-hidden focus:outline-none">
                                    <Image
                                        src={pmethod.logo}
                                        alt={pmethod.name}
                                        fill
                                        sizes="100%"
                                        draggable={false}
                                        quality={100}
                                        className="object-contain pointer-events-none select-none"
                                    />
                                </div>
                            ))
                        }
                    </div>
                </div>

                <div className="flex flex-col items-center w-full h-fit">
                    <div className="w-full h-[1px] bg-stone-900"></div>
                    <p className="w-full h-fit px-2 py-2 text-center text-[10px] leading-3 tracking-tight font-[500] text-stone-400">
                        &copy; {new Date().getFullYear()} Evo-TechBD, All Rights Reserved.
                    </p>
                </div>
            </div>
        </div>
    );
}


export default Footer;
