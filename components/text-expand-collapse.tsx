"use client";

import { useState, useEffect } from 'react';
import { useClampTextCustom } from '@/hooks/use-clamp-text-custom';
import useDebounce from '@rooks/use-debounce';
import useOnWindowResize from '@rooks/use-on-window-resize';
import { cn } from '@/lib/all_utils';


const TextExpandCollapse = ({ children, maxLine = 3, ellipsisOrTrimEndChars = `...`, textWrapperClassName = ``, buttonClassName = ``, moreButtonText = `...see more`, lessButtonText = `...see less` }: {
    children: string;
    maxLine: number;
    ellipsisOrTrimEndChars: string | number;
    textWrapperClassName?: string;
    buttonClassName?: string;
    moreButtonText?: string;
    lessButtonText?: string;
}) => {

    const [isExpanded, setIsExpanded] = useState<boolean>(false);
    const [clientExceededMaxHeight, setClientExceededMaxHeight] = useState<boolean>(false);
    const setIsExpandedDebounced = useDebounce(setIsExpanded, 20);
    const setClientGTMaxHeightDebounced = useDebounce(setClientExceededMaxHeight, 20);
    const [textRef, { noClamp, clampedText, key }] = useClampTextCustom({
        text: children,
        ellipsis: ellipsisOrTrimEndChars,
        lines: maxLine,
        charWidth: 1.2,
        debounceTime: 200,
        expanded: isExpanded,
    });

    const checkClientHeightDebounced = useDebounce(() => {
        if (textRef.current) {
            const maxHeight = parseFloat(window.getComputedStyle(textRef.current).getPropertyValue(`line-height`)) * maxLine;
            if (textRef.current.clientHeight > maxHeight) {
                setClientGTMaxHeightDebounced(true);
            } else {
                setClientGTMaxHeightDebounced(false);
            }
        }
    }, 200);
    
    useEffect(() => {
        checkClientHeightDebounced();
    }, [checkClientHeightDebounced, isExpanded]);

    useOnWindowResize(() => {
        checkClientHeightDebounced();
    });

    if (!moreButtonText) { moreButtonText = `see more`; }
    if (!lessButtonText) { lessButtonText = `see less`; }

    const handleExpandorCollapse = () => {
        setIsExpandedDebounced(!isExpanded);
    };

    return (
        <div key={key} ref={textRef as React.RefObject<HTMLDivElement>} className={cn(`w-full max-w-[500px] lg:max-w-[600px] h-fit text-[12px] sm:text-[13px] leading-4 font-[400] text-stone-800 whitespace-pre-line break-words`, textWrapperClassName)}>
            {clampedText}
            {!noClamp && !isExpanded &&
                <button type="button" onClick={handleExpandorCollapse} aria-label="expand text" className={cn(`inline w-fit h-fit text-[12px] sm:text-[13px] leading-4 tracking-[-0.02em] font-[600] text-stone-800 hover:text-stone-600 whitespace-nowrap transition-colors duration-100 ease-linear`, buttonClassName)}>
                    {moreButtonText}
                </button>
            }
            {noClamp && isExpanded && clientExceededMaxHeight &&
                <button type="button" onClick={handleExpandorCollapse} aria-label="collapse text" className={cn(`inline w-fit h-fit text-[12px] sm:text-[13px] leading-4 tracking-[-0.02em] font-[600] text-stone-800 hover:text-stone-600 whitespace-nowrap transition-colors duration-100 ease-linear`, buttonClassName)}>
                    {lessButtonText}
                </button>
            }
        </div>
    );
}

export default TextExpandCollapse;
