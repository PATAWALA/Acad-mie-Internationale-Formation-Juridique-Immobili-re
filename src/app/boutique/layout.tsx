import type { Metadata } from 'next';
import Header from '@/components/public/Header';
import Footer from '@/components/public/Footer';

export const metadata: Metadata = {
  title: 'Boutique APIAD | Livres juridiques & immobiliers',
  description:
    'Découvrez les ouvrages du Dr. Jean-Louis LOBÉ : livres physiques et numériques pour maîtriser le droit et l’immobilier. Paiement sécurisé, livraison rapide en Côte d’Ivoire.',
  keywords: [
    'livres de droit',
    'ouvrages juridiques',
    'livres immobilier',
    'librairie juridique',
    'achat livre droit OHADA',
    'livres Dr Jean-Louis LOBÉ',
  ],
  openGraph: {
    title: 'Boutique APIAD | Livres juridiques & immobiliers',
    description: 'Livres physiques et numériques pour maîtriser le droit et l’immobilier.',
    url: 'https://www.apiad-lobe.com/boutique',
    type: 'website',
    images: [
      {
        url: '/images/og-default.jpg',
        width: 1200,
        height: 630,
        alt: 'Boutique APIAD',
      },
    ],
  },
  alternates: {
    canonical: 'https://www.apiad-lobe.com/boutique',
  },
};

export default function BoutiqueLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#020617] text-white">
      <Header />
      {children}
      <Footer />
    </div>
  );
}