import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
 
export const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs));
}


export const formatBytes = (
    bytes: number,
    opts: {
        decimals?: number
        sizeType?: "accurate" | "normal"
    } = {}
) => {
    const { decimals = 0, sizeType = "normal" } = opts

    const sizes = ["Bytes", "KB", "MB", "GB", "TB"]
    const accurateSizes = ["Bytes", "KiB", "MiB", "GiB", "TiB"]
    if (bytes === 0) return "0 Byte"
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return `${(bytes / Math.pow(1024, i)).toFixed(decimals)} ${sizeType === "accurate"
            ? (accurateSizes[i] ?? "Bytes")
            : (sizes[i] ?? "Bytes")
        }`
}


export const slugify = (text: string): string => {
    return text
        .toString() // Convert to string
        .replace(/^\d+/, '') // Remove leading numbers
        .toLowerCase() // Convert to lowercase
        .trim() // Remove leading and trailing whitespace
        .replace(/[\s\W-]+/g, '-') // Replace spaces and non-word characters with hyphens
        .replace(/--+/g, '-') // Replace multiple hyphens with a single hyphen
        .replace(/^-+/, '') // Remove leading hyphen
        .replace(/-+$/, ''); // Remove trailing hyphen
}


// format numbers
export const currencyFormatBDT = (value: number) => {

    return new Intl.NumberFormat(
        'en-US',
        {
            minimumIntegerDigits: 1,
            maximumFractionDigits: 0,
        },
    ).format(value);

};
