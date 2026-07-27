import type { Metadata } from 'next';

export const siteConfig = {
  name: 'Académie Internationale',
  title: 'Académie Internationale | Formation Juridique & Immobilière',
  description:
    'L\'Académie Internationale forme les élites juridiques et immobilières. Bourse Mamadou TOURÉ disponible.',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://adonai-academie.com',
  ogImage: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://adonai-academie.com'}/images/og-default.jpg`,
  locale: 'fr_FR',
  twitterHandle: '@academie_intl',
  author: 'Académie Internationale',
  keywords: [
    'formation juridique',
    'droit OHADA',
    'bourse',
    'certificat',
    'immobilier',
    'Côte d\'Ivoire',
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