// Utility functions for generating structured data (JSON-LD) for SEO

export interface Product {
  name: string;
  description?: string;
  price: number;
  previousPrice?: number;
  images?: string[];
  sku?: string;
  brand?: string;
  inStock?: boolean;
  url: string;
  rating?: number;
  reviewCount?: number;
}

export interface Organization {
  name: string;
  url: string;
  logo?: string;
  contactPoint?: {
    telephone: string;
    contactType: string;
    email?: string;
  };
  sameAs?: string[];
}

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export function generateProductSchema(product: Product) {
  const baseUrl = process.env.NEXT_PUBLIC_FEND_URL || 'https://evo-techbd.com';

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description || `Buy ${product.name} at Evo-Tech Bangladesh`,
    image: product.images && product.images.length > 0 ? product.images : undefined,
    sku: product.sku,
    brand: product.brand ? {
      '@type': 'Brand',
      name: product.brand,
    } : undefined,
    offers: {
      '@type': 'Offer',
      url: product.url,
      priceCurrency: 'BDT',
      price: product.price,
      priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
      availability: product.inStock
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: 'Evo-Tech Bangladesh',
      },
    },
    aggregateRating: product.rating && product.reviewCount ? {
      '@type': 'AggregateRating',
      ratingValue: product.rating,
      reviewCount: product.reviewCount,
    } : undefined,
  };
}

export function generateOrganizationSchema(org: Organization) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: org.name,
    url: org.url,
    logo: org.logo,
    contactPoint: org.contactPoint ? {
      '@type': 'ContactPoint',
      telephone: org.contactPoint.telephone,
      contactType: org.contactPoint.contactType,
      email: org.contactPoint.email,
    } : undefined,
    sameAs: org.sameAs,
  };
}

export function generateBreadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function generateWebSiteSchema(url: string, name: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: name,
    url: url,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${url}/products-and-accessories?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

export function generateLocalBusinessSchema() {
  const baseUrl = process.env.NEXT_PUBLIC_FEND_URL || 'https://evo-techbd.com';

  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${baseUrl}/#organization`,
    name: 'Evo-Tech Bangladesh',
    image: `${baseUrl}/assets/EvoTechBD-logo-white.png`,
    description: 'Leading tech e-commerce in Bangladesh offering 3D printers, filaments, electronics, and professional 3D printing services.',
    url: baseUrl,
    telephone: '+880-1234-567890', // Replace with actual phone
    email: 'evotech.bd22@gmail.com', // Replace with actual email
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Dhaka', // Add actual address
      addressLocality: 'Dhaka',
      addressRegion: 'Dhaka Division',
      postalCode: '1206',
      addressCountry: 'BD',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 23.8103, // Replace with actual coordinates
      longitude: 90.4125,
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        opens: '10:00',
        closes: '20:00',
      },
    ],
    priceRange: 'BDT BDT -BDT BDT BDT ',
    sameAs: [
      // Add your social media profiles here
      // 'https://www.facebook.com/evotechbd',
      // 'https://www.instagram.com/evotechbd',
      // 'https://twitter.com/evotechbd',
    ],
  };
}

export function generateFAQSchema(faqs: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

// Helper function to inject JSON-LD into page
export function StructuredData({ data }: { data: any }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
