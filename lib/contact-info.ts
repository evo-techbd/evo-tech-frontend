// Shop contact details, edited in admin under Setup & Configurations → Contact Info
export interface ContactInfo {
  email: string;
  phones: string[];
  whatsapp: string;
  address: string;
  // One "Label: value" entry per line
  businessHours: string;
  mapUrl: string;
  facebook: string;
  instagram: string;
  linkedin: string;
  youtube: string;
}

// Used until the API responds, or if it is unreachable
export const DEFAULT_CONTACT_INFO: ContactInfo = {
  email: "evotech.bd22@gmail.com",
  phones: ["+880 1799 424854", "+880 1761 490093"],
  whatsapp: "+880 1799 424854",
  address: "72/A, Matikata Bazar, Dhaka Cantonment, Dhaka-1206, Bangladesh",
  businessHours:
    "Saturday – Thursday: 10:00 AM – 7:00 PM\nFriday: Closed\nPublic holidays: By appointment",
  mapUrl: "",
  facebook: "https://www.facebook.com/EvoTechBD22",
  instagram: "",
  linkedin: "",
  youtube: "",
};

export const withContactDefaults = (
  data?: Partial<ContactInfo> | null,
): ContactInfo => ({
  ...DEFAULT_CONTACT_INFO,
  ...(data ?? {}),
  phones: data?.phones?.length ? data.phones : DEFAULT_CONTACT_INFO.phones,
});

// Server components: cached for 5 minutes like the other storefront settings
export const getContactInfo = async (): Promise<ContactInfo> => {
  const backendUrl =
    process.env.NEXT_PUBLIC_BACKEND_URL || "https://api.evo-techbd.com/api/v1";
  try {
    const res = await fetch(`${backendUrl}/settings/contact`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return DEFAULT_CONTACT_INFO;
    return withContactDefaults((await res.json())?.data);
  } catch {
    return DEFAULT_CONTACT_INFO;
  }
};

const digitsOnly = (value: string) => value.replace(/\D/g, "");

// Local Bangladeshi numbers (01XXXXXXXXX) get the 880 country code
const toIntlDigits = (phone: string) => {
  const digits = digitsOnly(phone);
  return digits.startsWith("0") ? `88${digits}` : digits;
};

export const telHref = (phone: string) => `tel:+${toIntlDigits(phone)}`;

export const whatsappHref = (phone: string) =>
  `https://wa.me/${toIntlDigits(phone)}`;

export const mapsHref = (info: Pick<ContactInfo, "mapUrl" | "address">) =>
  info.mapUrl ||
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(info.address)}`;

export const parseBusinessHours = (hours: string) =>
  hours
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      // Split on the first ": " so times like 10:00 stay intact
      const index = line.indexOf(": ");
      return index === -1
        ? { label: line, value: "" }
        : { label: line.slice(0, index), value: line.slice(index + 2) };
    });
