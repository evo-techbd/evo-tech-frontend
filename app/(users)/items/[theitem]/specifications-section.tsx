"use client";

import { m, Variants } from "framer-motion";

const ItemSpecsSection = ({
  ispecsdata,
  framerSectionVariants,
}: {
  ispecsdata: any[];
  framerSectionVariants: Variants;
}) => {
  return (
    <m.div
      variants={framerSectionVariants}
      initial="initial"
      whileInView="visible"
      viewport={{ once: true, amount: 0.05 }}
      className="flex flex-col items-center w-full min-h-[200px] py-4 sm:pb-8"
    >
      <h1 className="w-fit h-fit py-4 text-center text-[20px] leading-7 sm:text-[22px] sm:leading-8 lg:text-[27px] lg:leading-10 tracking-tight font-[600] text-stone-800 first-letter:text-[24px] sm:first-letter:text-[28px] first-letter:text-[#0866FF]">
        Specifications
      </h1>

      {ispecsdata.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-3 grid-flow-row w-full h-fit p-4 gap-x-7 gap-y-4 min-[700px]:gap-y-7">
          {ispecsdata.map((spec, index) => (
            <div
              key={`spec_no${index + 1}`}
              className="grid max-[699px]:grid-cols-subgrid max-[699px]:col-span-2 min-[700px]:flex min-[700px]:flex-col w-full h-fit gap-x-3 gap-y-1"
            >
              <p className="max-[699px]:col-start-1 w-full h-fit text-[12px] min-[700px]:text-[13px] leading-5 font-[500] text-stone-400">{`${spec.title}`}</p>
              <p className="max-[699px]:col-start-2 w-full h-fit text-[12px] min-[700px]:text-[13px] leading-5 font-[600] text-stone-800 text-balance break-words">{`${spec.value}`}</p>
            </div>
          ))}
        </div>
      )}
    </m.div>
  );
};

export default ItemSpecsSection;
