"use client";

import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useState, useEffect, useRef, useCallback } from 'react';
import useDebounce from '@rooks/use-debounce';
import { LazyMotion, Variants } from 'framer-motion';

const ItemFeaturesSection = dynamic(() => import('./features-section'), { ssr: false, loading: () => <div className="flex w-full h-[200px] justify-center items-center"><div className="w-5 h-5 sm:w-6 sm:h-6 border-2 sm:border-3 border-stone-400 border-t-stone-800 rounded-full animate-[spin_2s_linear_infinite]"></div></div> });
const ItemSpecsSection = dynamic(() => import('./specifications-section'), { ssr: false, loading: () => <div className="flex w-full h-[200px] justify-center items-center"><div className="w-5 h-5 sm:w-6 sm:h-6 border-2 sm:border-3 border-stone-400 border-t-stone-800 rounded-full animate-[spin_2s_linear_infinite]"></div></div> });
const ItemReviewsSection = dynamic(() => import('./reviews-section'), { ssr: false, loading: () => <div className="flex w-full h-[200px] justify-center items-center"><div className="w-5 h-5 sm:w-6 sm:h-6 border-2 sm:border-3 border-stone-400 border-t-stone-800 rounded-full animate-[spin_2s_linear_infinite]"></div></div> });
const ItemFAQsSection = dynamic(() => import('./faqs-section'), { ssr: false, loading: () => <div className="flex w-full h-[200px] justify-center items-center"><div className="w-5 h-5 sm:w-6 sm:h-6 border-2 sm:border-3 border-stone-400 border-t-stone-800 rounded-full animate-[spin_2s_linear_infinite]"></div></div> });
const LoadMotionFeatures = () => import("@/utils/framer/features").then((res) => res.default);



    const ItemSections = ({ itemId, featuresdata, specsdata, faqsdata }: { itemId: string; featuresdata: any; specsdata: any[]; faqsdata: any[]; }) => {
    const [activeSection, setActiveSection] = useState<string>("features");
    const setActiveSectionDebounced = useDebounce(setActiveSection, 100);
    const sectionRefs = useRef<HTMLElement[]>([]);

    const figureOutActiveSection = useCallback(() => {
        const viewportTriggerPosition = Math.floor(window.innerHeight / 2 - 40);
        const sectionTopPositions = sectionRefs.current.map((section) => section.getBoundingClientRect().top);
        const sectionBottomPositions = sectionRefs.current.map((section) => (section.getBoundingClientRect().top + section.getBoundingClientRect().height));

        if (sectionTopPositions[0] >= viewportTriggerPosition) {
            setActiveSectionDebounced(sectionRefs.current[0].id);
            return;
        } else if (sectionBottomPositions[sectionBottomPositions.length - 1] <= viewportTriggerPosition) {
            setActiveSectionDebounced(sectionRefs.current[sectionRefs.current.length - 1].id);
            return;
        } else {
            for (let i = 0; i < sectionTopPositions.length; i++) {
                if (sectionTopPositions[i] <= viewportTriggerPosition && sectionBottomPositions[i] > viewportTriggerPosition) {
                    setActiveSectionDebounced(sectionRefs.current[i].id);
                }
            }
        }
    }, [setActiveSectionDebounced]);

    const updateOnScrollDebounced = useDebounce(() => {
        if (sectionRefs.current.length > 0) {
            figureOutActiveSection();
        }
    }, 200);

    useEffect(() => {
        // run once after mounting
        updateOnScrollDebounced();
        window.addEventListener("scroll", updateOnScrollDebounced as EventListener);
        
        return () => {
            window.removeEventListener("scroll", updateOnScrollDebounced as EventListener);
        };
    }, [updateOnScrollDebounced]);



    const sectionVariants: Variants = {
        initial: {
            opacity: 0,
            y: 20,
        },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 1,
            },
        },
    };


    return (
        <>
            <div id="item-page-sections" className="flex flex-col items-center w-full h-fit text-stone-700">
                <div className="sticky z-[10] top-[60px] sm:top-[64px] flex flex-wrap justify-center items-center w-full h-fit px-4 py-5 gap-2 bg-stone-50 rounded-[6px]">
                    <Link href="#features" className={`flex w-fit h-fit px-2 sm:px-3 font-[600] text-[12px] sm:text-[14px] leading-6 tracking-[-0.02em] ${activeSection === 'features' ? 'text-stone-700' : 'text-[#c2c2c2]'} hover:text-stone-700 transition-colors duration-75 ease-linear`}>Features</Link>
                    <Link href="#specifications" className={`flex w-fit h-fit px-2 sm:px-3 font-[600] text-[12px] sm:text-[14px] leading-6 tracking-[-0.02em] ${activeSection === 'specifications' ? 'text-stone-700' : 'text-[#c2c2c2]'} hover:text-stone-700 transition-colors duration-75 ease-linear`}>Specifications</Link>
                    <Link href="#reviews" className={`flex w-fit h-fit px-2 sm:px-3 font-[600] text-[12px] sm:text-[14px] leading-6 tracking-[-0.02em] ${activeSection === 'reviews' ? 'text-stone-700' : 'text-[#c2c2c2]'} hover:text-stone-700 transition-colors duration-75 ease-linear`}>Reviews</Link>
                    <Link href="#faqs" className={`flex w-fit h-fit px-2 sm:px-3 font-[600] text-[12px] sm:text-[14px] leading-6 tracking-[-0.02em] ${activeSection === 'faqs' ? 'text-stone-700' : 'text-[#c2c2c2]'} hover:text-stone-700 transition-colors duration-75 ease-linear`}>FAQs</Link>
                </div>

                <div className="flex flex-col items-center w-full h-fit px-4 sm:px-8 md:px-12 pt-3 pb-8 sm:pb-12 mb-[50px] gap-2">
                    <LazyMotion features={LoadMotionFeatures} strict>
                        <section id="features"
                            ref={(el) => { if (el) sectionRefs.current[0] = el; }}
                            className="flex flex-col items-center w-full h-fit scroll-mt-[124px] sm:scroll-mt-[132px]"
                        >
                            <ItemFeaturesSection ifeaturesdata={featuresdata} framerSectionVariants={sectionVariants} />
                        </section>

                        <section id="specifications"
                            ref={(el) => { if (el) sectionRefs.current[1] = el; }}
                            className="flex flex-col items-center w-full h-fit scroll-mt-[124px] sm:scroll-mt-[132px] border-t border-dashed border-stone-400"
                        >
                            <ItemSpecsSection ispecsdata={specsdata} framerSectionVariants={sectionVariants} />
                        </section>

                        <section id="reviews"
                            ref={(el) => { if (el) sectionRefs.current[2] = el; }}
                            className="flex flex-col items-center w-full h-fit scroll-mt-[124px] sm:scroll-mt-[132px] border-t border-dashed border-stone-400"
                        >
                            <ItemReviewsSection reviewsItemId={itemId} framerSectionVariants={sectionVariants} />
                        </section>

                        <section id="faqs"
                            ref={(el) => { if (el) sectionRefs.current[3] = el; }}
                            className="flex flex-col items-center w-full h-fit scroll-mt-[124px] sm:scroll-mt-[132px] border-t border-dashed border-stone-400"
                        >
                            <ItemFAQsSection ifaqsdata={faqsdata} framerSectionVariants={sectionVariants} />
                        </section>
                    </LazyMotion>
                </div>
            </div>
        </>
    );
}

export default ItemSections;
