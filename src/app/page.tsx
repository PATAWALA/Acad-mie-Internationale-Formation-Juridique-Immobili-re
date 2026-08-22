import Header from '@/components/public/Header';
import HeroSection from '@/components/public/HeroSection';
import PartnersMarquee from '@/components/public/PartnersMarquee';
import CertificatesGrid from '@/components/public/CertificatesGrid';
import WhyThisFormation from '@/components/public/WhyThisFormation';
import { SocialProofSection } from '@/components/public/SocialProofSection';
import FacultySection from '@/components/public/FacultySection';
import BoutiqueSection from '@/components/public/BoutiqueSection';
import { MomentsDeFierte } from '@/components/public/MomentsDeFierte';
import DynamicRegistrationForm from '@/components/public/DynamicRegistrationForm';
import StickyMobileCTA from '@/components/public/StickyMobileCTA';
import Footer from '@/components/public/Footer';
import { generateBaseMetadata } from '@/lib/metadata';
import { generateOrganizationSchema, JsonLd } from '@/lib/structured-data';

export const metadata = generateBaseMetadata({
  title: 'APIAD | Académie Internationale de Formation Juridique et Immobilière',
  description: 'Certifications professionnelles en droit des contrats, droit immobilier, gestion immobilière et droit OHADA. Formation 100% en ligne pour l’Afrique francophone.',
  keywords: [
    'formation juridique en ligne',
    'certification rédaction contrats',
    'droit immobilier',
    'certification OHADA',
    'formation droit des affaires',
    'apprendre le droit en ligne',
    "formation juridique Côte d''Ivoire",
    'formation juridique Bénin',
    'formation juridique Sénégal',
    'formation juridique Cameroun',
  ],
  openGraph: {
    title: 'APIAD – Académie de Formation Juridique et Immobilière',
    description: 'Devenez un expert du droit et de l’immobilier avec nos certifications en ligne.',
    url: 'https://www.apiad-lobe.com/',
    type: 'website',
    images: [
      {
        url: '/images/og-default.jpg', // ✅ corrigé : utilisez l’image générée
        width: 1200,
        height: 630,
        alt: 'APIAD – Formation juridique et immobilière en Afrique francophone',
      },
    ],
  },
  alternates: {
    canonical: 'https://www.apiad-lobe.com/',
  },
});

export default function HomePage() {
  return (
    <>
      {/* Schéma Organization pour l’accueil */}
      <JsonLd data={generateOrganizationSchema()} />

      <main className="min-h-screen bg-[#0B0F19] text-white">
        <Header />
        <HeroSection />
        <PartnersMarquee />
        <CertificatesGrid />
        <WhyThisFormation />
        <SocialProofSection />
        <FacultySection />
        <BoutiqueSection />
        <MomentsDeFierte />
        <DynamicRegistrationForm />
        <Footer />
        <StickyMobileCTA />
      </main>
    </>
  );
}