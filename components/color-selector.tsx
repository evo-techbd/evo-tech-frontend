"use client";

import { memo, useMemo } from "react";

type ColorOption = {
    name: string;  // Name of the color
    hex: string;    // Hex value for display
    stock?: number; // Remaining stock for this color, when known
}

type ColorSelectorProps = {
    colors: ColorOption[] | string[]; // Array of colors from API (can be strings or objects)
    selectedColor: string | null | undefined; // Selected color
    onColorSelect: (selectedColor: string) => void; // Callback to parent
}

const ColorSelector = memo(({ colors, selectedColor, onColorSelect }: ColorSelectorProps) => {

    const handleColorClick = (coloropt: ColorOption) => {
        onColorSelect(coloropt.name);
    };



    // Parse colors data if it comes as strings
    const parsedColors = useMemo(() => {
        if (!colors || colors.length === 0) return [];
        
        return colors.map((color, index) => {
            // If it's already an object, return as is
            if (typeof color === 'object' && color !== null && 'name' in color && 'hex' in color) {
                return color as ColorOption;
            }
            
            // If it's a string, try to parse it
            if (typeof color === 'string') {
                try {
                    // Handle malformed JSON by adding quotes around property names and values
                    const fixedString = color
                        .replace(/(\w+):/g, '"$1":')  // Add quotes around property names
                        .replace(/:\s*([^,}\s]+)/g, ': "$1"')  // Add quotes around values
                        .replace(/"/g, '"');  // Ensure proper quotes
                    
                    const parsed = JSON.parse(fixedString);
                    
                    // Validate parsed object has required properties
                    if (parsed.name && parsed.hex) {
                        return {
                            name: parsed.name,
                            hex: parsed.hex
                        } as ColorOption;
                    }
                } catch (error) {
                    // ignore
                }
            }
            
            // Fallback for unparseable data
            return {
                name: `Color ${index + 1}`,
                hex: '#000000'
            } as ColorOption;
        });
    }, [colors]);

    // Helper function to safely compare colors
    const isColorSelected = (colorName: string): boolean => {
        if (!selectedColor || !colorName) return false;
        return selectedColor.toLowerCase() === colorName.toLowerCase();
    };

    // A color is known to be out of stock only when stock info was provided for it
    const isOutOfStock = (coloroption: ColorOption): boolean => {
        return typeof coloroption.stock === 'number' && coloroption.stock <= 0;
    };

    return (
        <div className="flex flex-col w-full h-fit gap-2">
            <div className="flex flex-wrap items-start w-full h-fit gap-4">
                {parsedColors.map((coloroption, idx) => {
                    const outOfStock = isOutOfStock(coloroption);
                    const selected = isColorSelected(coloroption.name);

                    return (
                        <div
                            key={`color_${idx}`}
                            className="group relative flex flex-col items-center gap-1.5 cursor-pointer"
                            onClick={() => handleColorClick(coloroption)}
                        >
                            {outOfStock && (
                                <span className="absolute bottom-full left-1/2 z-10 mb-1.5 -translate-x-1/2 whitespace-nowrap rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-medium text-white shadow-sm opacity-0 pointer-events-none transition-opacity duration-150 group-hover:opacity-100">
                                    Out of stock
                                </span>
                            )}
                            <div
                                className={`relative w-8 h-8 sm:w-9 sm:h-9 rounded-full cursor-pointer border-2 border-white ring-2 transition-all duration-200 ${outOfStock
                                        ? `ring-red-500${selected ? ' ring-offset-2' : ''}`
                                        : selected
                                            ? 'ring-brand-600 ring-offset-2 scale-110'
                                            : 'ring-stone-300 hover:ring-stone-400'
                                    }`}
                                style={{ backgroundColor: coloroption.hex }}                            >
                                {outOfStock && (
                                    <span className="absolute inset-0 overflow-hidden rounded-full pointer-events-none">
                                        <span className="absolute top-1/2 left-1/2 w-[140%] h-0.5 bg-red-500 -translate-x-1/2 -translate-y-1/2 -rotate-45"></span>
                                    </span>
                                )}
                            </div>
                            <span className={`text-[10px] sm:text-[11px] font-medium capitalize max-w-[60px] text-center leading-tight ${outOfStock ? 'text-red-500' : selected ? 'text-brand-700' : 'text-stone-600'
                                }`}>
                                {coloroption.name}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
});

ColorSelector.displayName = "ColorSelector";

export default ColorSelector;
