import React from 'react';

export function generateWebSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Académie Internationale',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://adonai-academie.com',
    description: 'Formation d\'excellence en droit et immobilier',
    potentialAction: {
      '@type': 'SearchAction',
      target: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://adonai-academie.com'}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };
}

export function generatePersonSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Dr. Jean-Louis LOBÉ',
    jobTitle: 'Directeur Académique',
    affiliation: 'Académie Internationale',
    description: 'Docteur en Droit, 15 ans d\'expérience en formation juridique.',
  };
}

export function generateBreadcrumbSchema(items: { name: string; url: string }[]) {
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

export function JsonLd({ data }: { data: any }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}