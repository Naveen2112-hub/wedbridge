import type { Metadata } from "next";

interface BreadcrumbItem {
  name: string;
  href: string;
}

export function generateBreadcrumbSchema(items: BreadcrumbItem[]): string {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `https://wedbridge.com${item.href}`,
    })),
  });
}

export function generatePageMetadata({
  title,
  description,
  path,
  images,
}: {
  title: string;
  description: string;
  path: string;
  images?: string[];
}): Metadata {
  const siteUrl = "https://wedbridge.com";
  const fullUrl = `${siteUrl}${path}`;
  return {
    title,
    description,
    alternates: { canonical: fullUrl },
    openGraph: {
      title,
      description,
      url: fullUrl,
      siteName: "WedBridge",
      locale: "en_IN",
      type: "website",
      images: images ?? [`${siteUrl}/icon-512.png`],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: images ?? [`${siteUrl}/icon-512.png`],
    },
  };
}
