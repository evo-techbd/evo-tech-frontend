
const isHexColor = (colorCode: string) => {
    // valid for both shorthand and full hex color codes
    return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(colorCode);
}

const sumOfNumArrValues = (arr: number[]) => {
    // returns 0 for empty array without iterating further
    return arr.reduce((acc, val) => acc + val, 0);
}

const calcMeanRating = (arr: number[]) => {
    if (!Array.isArray(arr) || arr.length === 0) return 0;  // avoid invalid input
    
    const denominator = sumOfNumArrValues(arr);
    if (denominator === 0) return 0; // avoid division by zero

    const weightedrating = arr.map((val, idx) => val * (arr.length - idx));  // weighted rating, where index 0 = highest and last index = lowest
    const meanWithoutRounding = sumOfNumArrValues(weightedrating) / denominator;
    
    return isNaN(meanWithoutRounding) ? 0 : parseFloat(meanWithoutRounding.toFixed(1));
}

const getNameInitials = (name: string) => {
    if (!name) return ""; // if empty or undefined
    const words = name.trim().split(" ").filter(word => /^[a-zA-Z]/.test(word)); // filter out non-alphabetic words
    if (words.length === 0) return ""; // if no valid words
    if (words.length === 1) return words[0][0].toUpperCase();
    return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}


export interface DeliveryChargeSettings {
    insideDhakaCharge: number;
    outsideDhakaCharge: number;
    additionalChargePerKg: number;
}

// Fallback used only if the admin-configured settings haven't loaded yet
export const DEFAULT_DELIVERY_CHARGE_SETTINGS: DeliveryChargeSettings = {
    insideDhakaCharge: 70,
    outsideDhakaCharge: 120,
    additionalChargePerKg: 20,
};

const getAdditionalChargeforWeight = (
    weight: number, // weight in grams
    isInsideDhaka: boolean = true,
    settings: DeliveryChargeSettings = DEFAULT_DELIVERY_CHARGE_SETTINGS
) => {
    const baseCharge = isInsideDhaka ? settings.insideDhakaCharge : settings.outsideDhakaCharge;
    const additionalChargeStep = settings.additionalChargePerKg; // charge for every additional kg
  
    if (weight <= 1000) return baseCharge; // for weight below or equal to 1kg
  
    // Calculate additional kg beyond 1kg
    const additionalWeight = weight - 1000;
    const additionalKg = Math.ceil(additionalWeight / 1000); // Ceil to include partial kg

    return baseCharge + additionalKg * additionalChargeStep;
};

const getCODCharge = (productTotal: number) => {
    // 1% of total product price for COD
    return Math.round(productTotal * 0.01);
};

export { isHexColor, sumOfNumArrValues, calcMeanRating, getNameInitials, getAdditionalChargeforWeight, getCODCharge };
