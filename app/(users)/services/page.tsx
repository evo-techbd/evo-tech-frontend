import { Metadata } from "next";
import Link from "next/link";
import { PageIntro } from "@/components/page-intro";
import { getContactInfo, telHref, whatsappHref } from "@/lib/contact-info";

export const metadata: Metadata = {
  title: "Our Services",
  description:
    "3D printing, laser engraving, thesis writing support, project development, and web & app development from Evo-Tech Bangladesh.",
};

const SERVICES = [
  {
    title: "3D Printing",
    description:
      "Custom parts printed from your own model, delivered to your doorstep.",
    features: [
      "PLA, ABS, PETG and TPU in multiple colours",
      "Instant price from your STL, OBJ or 3MF file",
      "Ready in 3–7 business days",
    ],
    cta: { label: "Get an instant quote", href: "/3d-printing" },
  },
  {
    title: "Laser Engraving",
    description:
      "Precision engraving for personalisation and branding on wood, acrylic, leather and metal.",
    features: [
      "High precision engraving",
      "Custom designs welcome",
      "Gifts, signage and branding",
    ],
    cta: {
      label: "Visit Facebook page",
      href: "https://www.facebook.com/mergein.bd25",
      external: true,
    },
  },
  {
    title: "Thesis Writing Support",
    description:
      "Guidance for students on structuring, researching and presenting academic work.",
    features: [
      "Research methodology guidance",
      "Data analysis support",
      "Formatting and referencing",
    ],
    cta: { label: "Contact us", href: "/contact-us" },
  },
  {
    title: "Project Development",
    description:
      "From concept to working prototype for students and professionals.",
    features: [
      "Embedded systems and IoT",
      "Automation projects",
      "Hardware and software integration",
    ],
    cta: { label: "Contact us", href: "/contact-us" },
  },
  {
    title: "Web & App Development",
    description:
      "Modern, responsive web and mobile applications built to your requirements.",
    features: [
      "Websites and web apps",
      "E-commerce solutions",
      "Mobile apps and custom software",
    ],
    cta: { label: "View details", href: "/services/web-and-app-development" },
  },
];

const ctaClass =
  "inline-flex items-center gap-1 text-sm font-medium text-stone-900 underline decoration-stone-300 underline-offset-4 hover:decoration-stone-900 transition-colors whitespace-nowrap";

const DEVELOPERS = [
  {
    initials: "HR",
    name: "Habibur Rahman",
    role: "Full Stack Developer",
    affiliation: "Data Science @ UIU",
    bio: "Full-stack developer working with React, Next.js, Express, MongoDB and PostgreSQL. Passionate about data-driven web applications, Data Science and Machine Learning.",
    skills: [
      "React",
      "Next.js",
      "TypeScript",
      "Node.js",
      "MongoDB",
      "PostgreSQL",
      "Python",
      "Machine Learning",
    ],
    links: [
      { label: "GitHub", href: "https://github.com/habib-153" },
      { label: "Portfolio", href: "https://habiburrahman-web.vercel.app/" },
      {
        label: "LinkedIn",
        href: "https://www.linkedin.com/in/habiburrahman153/",
      },
    ],
  },
  {
    initials: "AH",
    name: "Syed Md. Abu Horaira",
    role: "Full Stack Developer",
    affiliation: "Zoology @ Dhaka College",
    bio: "Junior web developer with expertise in React, HTML, CSS, JavaScript and TypeScript, working with modern tools like Vite, Express, MongoDB and Next.js.",
    skills: [
      "React",
      "Next.js",
      "JavaScript",
      "TypeScript",
      "Express",
      "MongoDB",
      "Vite",
      "Tailwind CSS",
    ],
    links: [
      { label: "GitHub", href: "https://github.com/Ahnabu" },
      { label: "Portfolio", href: "https://portfolio-abu-horaira.vercel.app/" },
      { label: "LinkedIn", href: "https://www.linkedin.com/in/sm-abu-horaira" },
    ],
  },
];

const SITE_STACK = [
  "Next.js",
  "React",
  "TypeScript",
  "Node.js",
  "Express",
  "MongoDB",
  "Tailwind CSS",
  "Redux Toolkit",
];

const ServicesPage = async () => {
  const contact = await getContactInfo();

  return (
    <div className="w-full bg-white font-inter">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <PageIntro
          eyebrow="Services"
          title="More than a parts shop"
          description="Alongside components and tools, we print, engrave and build. Pick a service below, or tell us what you need."
        />

        <ul className="divide-y divide-stone-200 border-y border-stone-200">
          {SERVICES.map((service) => (
            <li
              key={service.title}
              className="grid gap-4 py-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_200px] lg:gap-10"
            >
              <div>
                <h2 className="text-lg font-semibold text-stone-900">
                  {service.title}
                </h2>
                <p className="mt-1.5 text-sm text-stone-600 leading-relaxed">
                  {service.description}
                </p>
              </div>
              <ul className="list-disc pl-4 space-y-1 text-sm text-stone-600 marker:text-stone-300">
                {service.features.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
              <div className="lg:text-right">
                {service.cta.external ? (
                  <a
                    href={service.cta.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={ctaClass}
                  >
                    {service.cta.label} ↗
                  </a>
                ) : (
                  <Link href={service.cta.href} className={ctaClass}>
                    {service.cta.label} →
                  </Link>
                )}
              </div>
            </li>
          ))}
        </ul>

        <section className="py-12 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-stone-900">
              Not sure where to start?
            </h2>
            <p className="mt-1 text-sm text-stone-600">
              Tell us what you&apos;re working on and we&apos;ll point you in
              the right direction.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <a
              href={telHref(contact.phones[0])}
              className="inline-flex justify-center rounded-lg bg-stone-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-stone-700 transition-colors"
            >
              Call {contact.phones[0]}
            </a>
            {contact.whatsapp && (
              <a
                href={whatsappHref(contact.whatsapp)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex justify-center rounded-lg border border-stone-300 px-5 py-2.5 text-sm font-medium text-stone-900 hover:bg-stone-50 transition-colors"
              >
                WhatsApp
              </a>
            )}
          </div>
        </section>

        {/* Development team */}
        <section className="py-12 mb-12 border-t border-stone-200">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 mb-8">
            <div>
              <h2 className="text-xl font-semibold text-stone-900">
                Meet our development team
              </h2>
              <p className="mt-1 text-sm text-stone-600">
                This website was designed and built by full-stack developers
                from Bangladesh.
              </p>
            </div>
            <p className="text-sm text-stone-500">
              Built with {SITE_STACK.join(", ")}
            </p>
          </div>

          <div className="grid gap-10 md:grid-cols-2">
            {DEVELOPERS.map((dev) => (
              <article key={dev.name}>
                <div className="flex items-center gap-4">
                  <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-stone-100 text-sm font-semibold text-stone-700">
                    {dev.initials}
                  </span>
                  <div>
                    <h3 className="font-semibold text-stone-900">{dev.name}</h3>
                    <p className="text-sm text-stone-500">
                      {dev.role} · {dev.affiliation}
                    </p>
                  </div>
                </div>
                <p className="mt-4 text-sm text-stone-600 leading-relaxed">
                  {dev.bio}
                </p>
                <p className="mt-3 text-sm text-stone-500">
                  {dev.skills.join(" · ")}
                </p>
                <div className="mt-4 flex gap-5">
                  {dev.links.map((link) => (
                    <a
                      key={link.label}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={ctaClass}
                    >
                      {link.label} ↗
                    </a>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default ServicesPage;
