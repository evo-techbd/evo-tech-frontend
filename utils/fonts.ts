import localFont from "next/font/local";

export const roboto_init = localFont({
  src: "../app/fonts/Roboto_Variable.ttf",
  variable: "--font-roboto",
  display: "swap",
  weight: "100 200 300 400 500 600 700 800 900",
});


export const inter_init = localFont({
  src: "../app/fonts/Inter-Variable.ttf",
  variable: "--font-inter",
  display: "swap",
  weight: "100 200 300 400 500 600 700 800 900",
});

export const inter = inter_init.variable;
export const roboto = roboto_init.variable;
