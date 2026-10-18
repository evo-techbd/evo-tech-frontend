import { ReactNode } from "react";

interface PageIntroProps {
  eyebrow: string;
  title: string;
  description: ReactNode;
  // Shown to the right on large screens, below on small ones
  aside?: ReactNode;
}

// Shared heading for the storefront info pages (services, contact, 3D printing)
export function PageIntro({
  eyebrow,
  title,
  description,
  aside,
}: PageIntroProps) {
  return (
    <section className="pt-10 sm:pt-14 pb-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
      <div>
        <p className="text-sm font-medium text-brand-600">{eyebrow}</p>
        <h1 className="mt-2 text-3xl sm:text-4xl font-semibold tracking-tight text-stone-900">
          {title}
        </h1>
        <p className="mt-3 max-w-xl text-stone-600 leading-relaxed">
          {description}
        </p>
      </div>
      {aside}
    </section>
  );
}
