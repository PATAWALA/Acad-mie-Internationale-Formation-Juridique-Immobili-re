import type { Metadata } from 'next';

export const siteConfig = {
  name: 'APIAD',
  title: 'APIAD | Académie Internationale de Formation Juridique et Immobilière',
  description:
    'Certifications professionnelles en droit des contrats, droit immobilier, gestion immobilière et droit OHADA. Formation 100% en ligne pour l’Afrique francophone.',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://www.apiad-lobe.com',
  ogImage: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.apiad-lobe.com'}/images/og-default.jpg`,
  locale: 'fr_FR',
  twitterHandle: '@apiad_lobe', // à adapter si vous avez un compte Twitter
  author: 'APIAD',
  keywords: [
    'formation juridique en ligne',
    'certification rédaction contrats',
    'droit immobilier',
    'certification OHADA',
    'formation droit des affaires',
    'apprendre le droit en ligne',
    "formation juridique Côte d'Ivoire",
    'formation juridique Bénin',
    'formation juridique Sénégal',
    'formation juridique Cameroun',
    'droit comparé Afrique',
    'rédaction des conclusions et mémoires',
  ],
};

export function generateBaseMetadata(overrides?: Partial<Metadata>): Metadata {
  return {
    metadataBase: new URL(siteConfig.url),
    title: {
      default: siteConfig.title,
      template: `%s | ${siteConfig.name}`,
    },
    description: siteConfig.description,
    keywords: siteConfig.keywords,
    authors: [{ name: siteConfig.author }],
    creator: siteConfig.author,
    publisher: siteConfig.author,
    openGraph: {
      type: 'website',
      locale: siteConfig.locale,
      url: siteConfig.url,
      siteName: siteConfig.name,
      title: siteConfig.title,
      description: siteConfig.description,
      images: [
        {
          url: siteConfig.ogImage,
          width: 1200,
          height: 630,
          alt: siteConfig.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: siteConfig.title,
      description: siteConfig.description,
      images: [siteConfig.ogImage],
      creator: siteConfig.twitterHandle,
    },
    robots: {
      index: true,
      follow: true,
    },
    ...overrides,
  };
}

export function generatePageMetadata(
  title: string,
  description: string,
  path: string,
  image?: string
): Metadata {
  const url = `${siteConfig.url}${path}`;
  return generateBaseMetadata({
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      images: image ? [{ url: image, width: 1200, height: 630, alt: title }] : undefined,
    },
    twitter: {
      title,
      description,
      images: image ? [image] : undefined,
    },
    alternates: {
      canonical: url,
    },
  });
}