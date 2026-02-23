"use client";

import type { LensProps } from '@/utils/types_interfaces/shared_interfaces';

const ZoomLens = ({ children, cursorPosition, zoomFactor = 1.5, lensSize = 200 }: LensProps) => {

    return (
        <div className={`absolute z-[10] inset-0 rounded-[8px] overflow-hidden pointer-events-none select-none`}
            style={{
                maskImage: `radial-gradient(circle ${lensSize / 2}px at ${cursorPosition.x}px ${cursorPosition.y}px, black ${lensSize / 2 - 3}px, transparent ${lensSize / 2 - 2}px, rgba(0, 0, 0, 0.5) ${lensSize / 2 - 1}px, rgba(0, 0, 0, 0.1)${lensSize / 2}px, transparent 100%)`,
                WebkitMaskImage: `radial-gradient(circle ${lensSize / 2}px at ${cursorPosition.x}px ${cursorPosition.y}px, black ${lensSize / 2 - 3}px, transparent ${lensSize / 2 - 2}px, rgba(0, 0, 0, 0.5) ${lensSize / 2 - 1}px, rgba(0, 0, 0, 0.1)${lensSize / 2}px, transparent 100%)`,
            }}
        >
            <div className="relative w-full h-full overflow-hidden bg-white"
                style={{
                    transform: `scale(${zoomFactor})`,
                    transformOrigin: `${cursorPosition.x}px ${cursorPosition.y}px`,
                }}
            >
                {children}
            </div>
        </div>
    );
}

export default ZoomLens;
