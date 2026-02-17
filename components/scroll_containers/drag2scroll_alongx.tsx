"use client";

import { useRef, useState, useEffect } from 'react';



const Drag2ScrollAlongX = ({ children }: { children: React.ReactNode; }) => {

    const containerRef = useRef<HTMLDivElement>(null);

    const [isDragging, setIsDragging] = useState<boolean>(false);
    const [pointerStartX, setPointerStartX] = useState<number>(0);
    const [scrollPosLeft, setScrollPosLeft] = useState<number>(0);


    useEffect(() => {

        const handleMouseMove = (e: MouseEvent) => {
            if (!isDragging || !containerRef.current) return;
            e.preventDefault();
            const deltax = (e.clientX - pointerStartX) * 1;
            containerRef.current.scrollLeft = scrollPosLeft - deltax;
        };

        const handleMouseUp = () => {
            if (!isDragging) return;
            setIsDragging(false);
        };

        const handleTouchMove = (e: TouchEvent) => {
            if (!isDragging || !containerRef.current) return;
            e.preventDefault();
            const deltax = (e.touches[0].clientX - pointerStartX) * 1;
            containerRef.current.scrollLeft = scrollPosLeft - deltax;
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        document.addEventListener('touchmove', handleTouchMove, { passive: false });
        document.addEventListener('touchend', handleMouseUp);

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            document.removeEventListener('touchmove', handleTouchMove);
            document.removeEventListener('touchend', handleMouseUp);
        };

    }, [isDragging, pointerStartX, scrollPosLeft]);

    const handleMouseDown = (e: React.MouseEvent) => {
        if (!containerRef.current) return;
        setIsDragging(true);
        setPointerStartX(e.clientX);
        setScrollPosLeft(containerRef.current.scrollLeft);
    };

    const handleTouchStart = (e: React.TouchEvent) => {
        if (!containerRef.current) return;
        setIsDragging(true);
        setPointerStartX(e.touches[0].clientX);
        setScrollPosLeft(containerRef.current.scrollLeft);
    };



    return (
        <div
            ref={containerRef}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
            className="w-full h-fit flex flex-nowrap overflow-x-auto scrollbar-hide"
        >
            {children}
        </div>
    );

}

export default Drag2ScrollAlongX;
