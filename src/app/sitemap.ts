import type { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.apiad-lobe.com';

  // Pages statiques principales
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1,
    },
    {
      url: `${baseUrl}/boutique`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  // Ajoutez ici d'autres pages publiques si nécessaire (ex: /a-propos, /contact, etc.)
  // Exemple:
  // {
  //   url: `${baseUrl}/a-propos`,
  //   lastModified: new Date(),
  //   changeFrequency: 'monthly',
  //   priority: 0.7,
  // },

  return staticPages;
}