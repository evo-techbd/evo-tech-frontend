import type { Config } from "tailwindcss";
import defaultTheme from "tailwindcss/defaultTheme";
const plugin = require("tailwindcss/plugin");

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],

  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      fontFamily: {
        inter: ["var(--font-inter)", ...defaultTheme.fontFamily.sans],
        roboto: ["var(--font-roboto)", ...defaultTheme.fontFamily.sans],
      },
      textShadow: {
        sm: "0 1px 2px var(--tw-shadow-color)",
        base: "0 0px 4px var(--tw-shadow-color)",
        md: "0 4px 8px var(--tw-shadow-color)",
        lg: "0 6px 12px var(--tw-shadow-color)",
        xl: "0 8px 16px var(--tw-shadow-color)",
      },
      boxShadow: {
        hrsm: "1px 0px 2px 0px var(--tw-shadow-color), -1px 0px 2px 0px var(--tw-shadow-color)",
        hrbase:
          "2px 0px 3px -1px var(--tw-shadow-color), -2px 0px 3px -1px var(--tw-shadow-color)",
        hrmd: "4px 0px 6px -2px var(--tw-shadow-color), -4px 0px 6px -2px var(--tw-shadow-color)",
        hrlg: "8px 0px 8px -5px var(--tw-shadow-color), -8px 0px 8px -5px var(--tw-shadow-color)",
        hrxl: "10px 0px 12px -7px var(--tw-shadow-color), -10px 0px 12px -7px var(--tw-shadow-color)",
        insm: "inset 2px 2px 5px -1px var(--tw-shadow-color), inset -2px -2px 5px -1px var(--tw-shadow-color)",
        inbase:
          "inset 11px 11px 6px -8px var(--tw-shadow-color), inset -11px -11px 6px -8px var(--tw-shadow-color)",
        inmd: "inset 14px 14px 11px -10px var(--tw-shadow-color), inset -14px -14px 11px -10px var(--tw-shadow-color)",
        inlg: "inset 8px 8px 12px 6px var(--tw-shadow-color), inset -8px -8px 12px 6px var(--tw-shadow-color)",
      },
      keyframes: {
        "hr-slide": {
          "0%": {
            transform: "translateX(0)",
          },
          "100%": {
            transform: "translateX(-100%)",
          },
        },
        "slowreveal-flex": {
          "0%": {
            display: "none",
            opacity: "0",
          },
          "50%": {
            display: "none",
            opacity: "0",
          },
          "100%": {
            display: "flex",
            opacity: "1",
          },
        },
        "go-up": {
          "0%": {
            transform: "translateY(10px)",
            opacity: "0",
          },
          "100%": {
            transform: "translateY(0px)",
            opacity: "1",
          },
        },
      },
      animation: {
        "infinite-slide-hr": "hr-slide 30s linear infinite",
        "slow-reveal-flex": "slowreveal-flex 0.3s linear",
        "go-up": "go-up 0.3s ease-out",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        // Brand color and emerald alias so existing `emerald-*` classes map to your brand (#0ea5e9)
        brand: {
          DEFAULT: "#0ea5e9",
          50: "#eaf6fb",
          100: "#d5f0fb",
          200: "#abe6fb",
          300: "#7fdaf9",
          400: "#54cfee",
          500: "#2fbfe6",
          600: "#0ea5e9",
          700: "#0b8fc6",
          800: "#086f99",
          900: "#064a66",
        },
        emerald: {
          50: "#eaf6fb",
          100: "#d5f0fb",
          200: "#abe6fb",
          300: "#7fdaf9",
          400: "#54cfee",
          500: "#2fbfe6",
          600: "#0ea5e9",
          700: "#0b8fc6",
          800: "#086f99",
          900: "#064a66",
        },
        evoAdminPrimary: "#232734",
        evoAdminAccent: "#0866FF",
      },
    },
  },

  darkMode: ["class", "class"],

  plugins: [
    plugin(function ({
      matchUtilities,
      theme,
    }: {
      matchUtilities: any;
      theme: any;
    }): void {
      matchUtilities(
        {
          "text-shadow": (value: any) => ({
            textShadow: value,
          }),
        },
        { values: theme("textShadow") }
      );
    }),
    require("tailwindcss-animate"),
  ],
};

export default config;
