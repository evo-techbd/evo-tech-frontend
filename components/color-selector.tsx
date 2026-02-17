"use client";

import { memo, useMemo } from "react";
import { Tooltip } from "@nextui-org/tooltip";

type ColorOption = {
    name: string;  // Name of the color
    hex: string;    // Hex value for display
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

    return (
        <div className="flex flex-wrap items-center w-full h-fit gap-3">
            {parsedColors.map((coloroption, idx) => (
                <Tooltip key={`color_${idx}`}
                    showArrow
                    placement="top"
                    delay={100}
                    closeDelay={50}
                    offset={6}
                    classNames={{
                        base: "w-fit h-fit rounded-[10px] bg-transparent before:bg-stone-800",
                        content: "min-w-[80px] w-fit max-w-[200px] h-fit py-1 px-3 text-white bg-gradient-to-b from-stone-400 to-stone-800 font-inter text-[11px] sm:text-[12px] leading-5 font-[500]",
                    }}
                    content={coloroption.name}
                    className="w-fit rounded-[10px] bg-transparent capitalize shadow-md"
                >
                    <div
                        className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full cursor-pointer border-2 border-white ring-2 ${isColorSelected(coloroption.name) ? 'ring-stone-700' : 'ring-stone-300'}`}
                        style={{ backgroundColor: coloroption.hex }}
                        onClick={() => handleColorClick(coloroption)}
                    >
                    </div>
                </Tooltip>
            ))}
        </div>
    );
});

ColorSelector.displayName = "ColorSelector";

export default ColorSelector;
