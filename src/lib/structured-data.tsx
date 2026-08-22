import React from 'react';

export function generateWebSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'APIAD',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://www.apiad-lobe.com',
    description: 'Formation d\'excellence en droit et immobilier pour l\'Afrique francophone',
    potentialAction: {
      '@type': 'SearchAction',
      target: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.apiad-lobe.com'}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };
}

export function generatePersonSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Dr. Kevin DIZO',
    jobTitle: 'Formateur en droit privé et sciences criminelles',
    affiliation: 'APIAD',
    description: 'Docteur en Droit privé et Sciences criminelles, ATER à Nantes Université, Élève-avocat.',
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

export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'APIAD',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://www.apiad-lobe.com',
    logo: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.apiad-lobe.com'}/logo.jpeg`,
    description: 'Académie Internationale de Formation Juridique et Immobilière pour l’Afrique francophone',
    foundingDate: '2024', // à adapter si vous connaissez la date exacte
    founder: {
      '@type': 'Person',
      name: 'Dr. Jean-Louis LOBÉ',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      email: 'contact@apiad-lobe.com', // adaptez
      areaServed: ['CI', 'SN', 'BJ', 'CM', 'FR'],
      availableLanguage: ['fr'],
    },
    sameAs: [
      'https://www.linkedin.com/company/apiad', // à adapter
      'https://www.facebook.com/apiad', // à adapter
    ],
  };
}