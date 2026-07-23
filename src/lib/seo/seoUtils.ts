/**
 * SEO Utilities: structured data generators, breadcrumb helpers, canonical URL.
 */

const SITE_URL = "https://wedbridge.com";

/**
 * Generate Organization schema.org JSON-LD.
 */
export function getOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "WedBridge",
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    description: "AI-powered matrimony platform connecting Tamil Nadu families.",
    sameAs: [
      "https://www.facebook.com/wedbridge",
      "https://www.instagram.com/wedbridge",
      "https://twitter.com/wedbridge",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      telephone: "+916383109341",
      email: "support@wedbridge.com",
      availableLanguage: ["English", "Tamil"],
    },
  };
}

/**
 * Generate BreadcrumbList schema.org JSON-LD.
 */
export function getBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.url}`,
    })),
  };
}

/**
 * Generate Service schema.org JSON-LD for vendor pages.
 */
export function getServiceSchema(vendor: { name: string; description: string; category: string; rating?: number; reviewCount?: number; startingPrice?: number }) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: vendor.name,
    description: vendor.description,
    category: vendor.category,
    ...(vendor.rating ? { aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: vendor.rating,
      reviewCount: vendor.reviewCount ?? 0,
    } } : {}),
    ...(vendor.startingPrice ? { offers: {
      "@type": "Offer",
      price: vendor.startingPrice,
      priceCurrency: "INR",
    } } : {}),
  };
}

/**
 * Generate Person schema.org JSON-LD for profile pages.
 */
export function getProfileSchema(profile: { name: string; bio?: string; photoURL?: string; occupation?: string; education?: string }) {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: profile.name,
    ...(profile.bio ? { description: profile.bio } : {}),
    ...(profile.photoURL ? { image: profile.photoURL } : {}),
    ...(profile.occupation ? { jobTitle: profile.occupation } : {}),
    ...(profile.education ? { knowsAbout: [profile.education] } : {}),
  };
}

/**
 * Generate FAQ schema.org JSON-LD.
 */
export function getFAQSchema(faqs: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

/**
 * Get canonical URL for a path.
 */
export function getCanonicalURL(path: string): string {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
