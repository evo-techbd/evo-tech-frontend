import { Metadata } from "next";
import { PageIntro } from "@/components/page-intro";
import {
  getContactInfo,
  mapsHref,
  parseBusinessHours,
  telHref,
  whatsappHref,
} from "@/lib/contact-info";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with Evo-Tech Bangladesh. Call, message or visit us for help with orders, products and services.",
};

const linkClass =
  "text-stone-900 underline decoration-stone-300 underline-offset-4 hover:decoration-stone-900 transition-colors";

const ContactUsPage = async () => {
  const contact = await getContactInfo();
  const hours = parseBusinessHours(contact.businessHours);
  const socials = [
    { label: "Facebook", href: contact.facebook },
    { label: "Instagram", href: contact.instagram },
    { label: "LinkedIn", href: contact.linkedin },
    { label: "YouTube", href: contact.youtube },
  ].filter((social) => social.href);

  const channels = [
    {
      label: "Phone",
      content: (
        <div className="flex flex-col gap-1">
          {contact.phones.map((phone) => (
            <a key={phone} href={telHref(phone)} className={linkClass}>
              {phone}
            </a>
          ))}
        </div>
      ),
    },
    contact.whatsapp && {
      label: "WhatsApp",
      content: (
        <a
          href={whatsappHref(contact.whatsapp)}
          target="_blank"
          rel="noopener noreferrer"
          className={linkClass}
        >
          {contact.whatsapp}
        </a>
      ),
    },
    contact.email && {
      label: "Email",
      content: (
        <a
          href={`mailto:${contact.email}`}
          className={`${linkClass} break-all`}
        >
          {contact.email}
        </a>
      ),
    },
    socials.length > 0 && {
      label: "Social",
      content: (
        <div className="flex flex-wrap gap-x-4 gap-y-1">
          {socials.map((social) => (
            <a
              key={social.label}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              className={linkClass}
            >
              {social.label}
            </a>
          ))}
        </div>
      ),
    },
  ].filter(Boolean) as { label: string; content: React.ReactNode }[];

  return (
    <div className="w-full bg-white font-inter">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <PageIntro
          eyebrow="Contact"
          title="Get in touch"
          description="Questions about an order, a product or one of our services? Call or message us, or drop by the shop."
          aside={
            <div className="flex flex-col sm:flex-row gap-3">
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
                  Message on WhatsApp
                </a>
              )}
            </div>
          }
        />

        <div className="grid gap-12 pb-20 lg:grid-cols-2">
          {/* Reach us */}
          <section>
            <h2 className="text-xl font-semibold text-stone-900 mb-4">
              Reach us
            </h2>
            <dl className="divide-y divide-stone-200 border-y border-stone-200">
              {channels.map((channel) => (
                <div
                  key={channel.label}
                  className="grid grid-cols-[110px_minmax(0,1fr)] gap-4 py-4 text-sm"
                >
                  <dt className="text-stone-500">{channel.label}</dt>
                  <dd>{channel.content}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-4 text-sm text-stone-500">
              We usually reply within 24 hours on business days.
            </p>
          </section>

          {/* Visit us */}
          <section>
            <h2 className="text-xl font-semibold text-stone-900 mb-4">
              Visit us
            </h2>
            <address className="not-italic text-stone-900 leading-relaxed">
              {contact.address}
            </address>
            <a
              href={mapsHref(contact)}
              target="_blank"
              rel="noopener noreferrer"
              className={`${linkClass} mt-2 inline-block text-sm`}
            >
              Open in Google Maps
            </a>

            {hours.length > 0 && (
              <dl className="mt-6 divide-y divide-stone-200 border-y border-stone-200 text-sm">
                {hours.map((row) => (
                  <div
                    key={row.label}
                    className="flex justify-between gap-4 py-3"
                  >
                    <dt className="text-stone-500">{row.label}</dt>
                    <dd className="text-right text-stone-900">{row.value}</dd>
                  </div>
                ))}
              </dl>
            )}

            {contact.address && (
              <iframe
                title="Shop location on Google Maps"
                src={`https://www.google.com/maps?q=${encodeURIComponent(contact.address)}&output=embed`}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="mt-6 h-64 w-full rounded-xl border border-stone-200"
              />
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default ContactUsPage;
