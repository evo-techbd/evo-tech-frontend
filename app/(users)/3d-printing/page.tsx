import Link from "next/link";
import { Metadata } from "next";
import { PageIntro } from "@/components/page-intro";
import { PrintQuoteCalculator } from "@/components/print3d/print-quote-calculator";
import { MAX_BUILD_SIZE_MM } from "@/lib/print3d/pricing";
import { PrintPricing } from "@/lib/print3d/types";

export const metadata: Metadata = {
  title: "Custom 3D Printing Service",
  description:
    "Upload your STL, OBJ or 3MF file and get an instant 3D printing price. PLA, ABS, PETG and TPU prints delivered to your doorstep.",
};

const getPrintPricing = async (): Promise<PrintPricing | null> => {
  const backendUrl =
    process.env.NEXT_PUBLIC_BACKEND_URL || "https://api.evo-techbd.com/api/v1";
  try {
    const res = await fetch(`${backendUrl}/print-pricing`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    const pricing: PrintPricing | undefined = (await res.json())?.data;
    return pricing?.materials?.length ? pricing : null;
  } catch {
    return null;
  }
};

const STEPS = [
  "Drop in your model file",
  "Pick material, colour and quality",
  "Send us the file and quote to order",
];

const GOOD_TO_KNOW = [
  {
    title: "Preparing your file",
    body: "Export in millimetres where you can, and make sure the mesh is closed (watertight). If the size looks wrong in the calculator, switch the model units.",
  },
  {
    title: "Large parts",
    body: `Our build volume is ${MAX_BUILD_SIZE_MM} × ${MAX_BUILD_SIZE_MM} × ${MAX_BUILD_SIZE_MM} mm. Bigger models can be split and printed in parts.`,
  },
  {
    title: "Lead time",
    body: "Most orders are ready in 3–7 business days. In busy periods it can take another 5–7 days.",
  },
  {
    title: "About the price",
    body: "The calculator estimates material and print time from your model. We confirm the final price after checking the file in our slicer. Delivery is charged separately.",
  },
];

const ThreeDPrintingPage = async () => {
  const pricing = await getPrintPricing();
  const materials = pricing?.materials ?? [];
  const lowestRate = materials.length
    ? Math.min(...materials.map((m) => m.pricePerGram))
    : null;

  return (
    <div className="w-full bg-white font-inter">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <PageIntro
          eyebrow="3D Printing Service"
          title="Upload a model, see the price"
          description="Drop your STL, OBJ or 3MF file below for an instant estimate. No sign-up needed, and your file never leaves your device."
          aside={
            <ol className="flex flex-col sm:flex-row gap-3 sm:gap-6 text-sm text-stone-600">
              {STEPS.map((step, index) => (
                <li key={step} className="flex items-center gap-2">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full border border-stone-300 text-xs font-medium text-stone-700">
                    {index + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          }
        />

        {/* Calculator */}
        <section id="upload-section" className="pb-16 scroll-mt-24">
          {pricing ? (
            <PrintQuoteCalculator pricing={pricing} />
          ) : (
            <div className="rounded-xl border border-stone-200 bg-stone-50 px-6 py-12 text-center">
              <p className="text-stone-700">
                The instant quote is unavailable right now. Send us your file
                and we&apos;ll quote it directly.
              </p>
              <Link
                href="/contact-us"
                className="mt-4 inline-flex rounded-lg bg-stone-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-stone-700 transition-colors"
              >
                Contact us
              </Link>
            </div>
          )}
        </section>

        {/* Materials */}
        {materials.length > 0 && (
          <section className="py-12 border-t border-stone-200">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 mb-6">
              <h2 className="text-xl font-semibold text-stone-900">
                Materials
              </h2>
              <p className="text-sm text-stone-500">
                Priced per gram of printed material
                {lowestRate !== null && `, from ৳${lowestRate}/g`}
              </p>
            </div>

            <ul className="divide-y divide-stone-200 border-y border-stone-200">
              {materials.map((material) => (
                <li
                  key={material.name}
                  className="grid gap-1 sm:gap-6 py-4 sm:grid-cols-[180px_minmax(0,1fr)_100px] sm:items-baseline"
                >
                  <div className="flex items-baseline justify-between sm:block">
                    <p className="font-semibold text-stone-900">
                      {material.name}
                    </p>
                    {material.fullName && (
                      <p className="text-xs text-stone-500 sm:mt-0.5">
                        {material.fullName}
                      </p>
                    )}
                  </div>
                  <div className="text-sm text-stone-600">
                    {material.description && <p>{material.description}</p>}
                    <p className="mt-1 text-stone-500">
                      {material.colors.join(" · ")}
                    </p>
                  </div>
                  <p className="text-sm font-medium text-stone-900 sm:text-right">
                    ৳{material.pricePerGram}/g
                  </p>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Good to know */}
        <section className="py-12 border-t border-stone-200">
          <h2 className="text-xl font-semibold text-stone-900 mb-6">
            Good to know
          </h2>
          <dl className="grid gap-x-10 gap-y-6 sm:grid-cols-2">
            {GOOD_TO_KNOW.map((item) => (
              <div key={item.title}>
                <dt className="font-medium text-stone-900">{item.title}</dt>
                <dd className="mt-1 text-sm text-stone-600 leading-relaxed">
                  {item.body}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        {/* Contact */}
        <section className="py-12 mb-12 border-t border-stone-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-stone-900">
              Bulk orders or design help?
            </h2>
            <p className="mt-1 text-sm text-stone-600">
              Need many copies, a different material, or help getting a model
              print-ready? We&apos;ll quote it directly.
            </p>
          </div>
          <Link
            href="/contact-us"
            className="inline-flex shrink-0 justify-center rounded-lg border border-stone-300 px-5 py-2.5 text-sm font-medium text-stone-900 hover:bg-stone-50 transition-colors"
          >
            Contact us
          </Link>
        </section>
      </div>
    </div>
  );
};

export default ThreeDPrintingPage;
