import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.apiad-lobe.com';
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/dashboard/',
          '/espace-auditeur/',
          '/espace-formateur/',
          '/profil/',
          '/login', // si vous ne voulez pas indexer la page de connexion (optionnel)
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}