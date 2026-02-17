"use client";

import { m, Variants } from 'framer-motion';
import { Accordion, AccordionItem } from "@nextui-org/accordion";
import { IoChevronDown } from "react-icons/io5";
import parse from 'html-react-parser';

const ItemFAQsSection = ({ ifaqsdata, framerSectionVariants }: { ifaqsdata: any[]; framerSectionVariants: Variants; }) => {

    return (
        <m.div
            variants={framerSectionVariants}
            initial="initial"
            whileInView="visible"
            viewport={{ once: true, amount: 0.05 }}
            className="flex flex-col sm:flex-row sm:justify-between w-full min-h-[200px] px-4 sm:px-8 md:px-12 py-4 sm:py-8 md:py-10 gap-4 rounded-[12px] bg-stone-900"
        >
            <div className="flex w-fit h-fit py-2 max-sm:px-3">
                <h1 className="w-fit h-fit text-center text-[20px] leading-7 sm:text-[22px] sm:leading-8 lg:text-[27px] lg:leading-10 tracking-tight font-[600] text-stone-100">FAQs</h1>
            </div>

            <div className="flex flex-col items-center w-full max-w-[550px] min-h-[40px] h-fit">
                {ifaqsdata.length > 0 &&
                    <Accordion
                        showDivider={false}
                        selectionMode="multiple"
                        variant="light"
                        className="w-full p-0"
                        itemClasses={{
                            base: "w-full p-0 border-t border-stone-600 data-[open=true]:border-stone-500/40",
                            title: "text-[13px] sm:text-[14px] leading-5 tracking-tight font-[600] text-stone-100",
                            trigger: "px-3 sm:px-4 data-[open=true]:bg-stone-500/10 rounded-b-[4px] transition-[background-color] duration-100",
                            indicator: "data-[open=true]:rotate-[-180deg] text-stone-100",
                            content: "px-4 py-3",
                        }}
                    >
                        {
                            ifaqsdata.map((faq: any, idx: number) => (
                                <AccordionItem key={`faq${idx + 1}`} aria-label={faq.question} title={faq.question} indicator={<IoChevronDown className="inline w-4 h-4" />}>
                                    <div className="flex flex-col w-full h-fit gap-2 text-[12px] sm:text-[13px] leading-5 tracking-tight font-[400] text-stone-300 [&_a]:text-[#2BCCFF] hover:[&_a]:underline hover:[&_a]:underline-offset-4 [&_li]:py-px [&_ul]:my-1.5 [&_ol]:my-1.5">
                                        {parse(faq.answer)}
                                    </div>
                                </AccordionItem>
                            ))
                        }
                    </Accordion>
                }
            </div>
        </m.div>
    );
}

export default ItemFAQsSection;
