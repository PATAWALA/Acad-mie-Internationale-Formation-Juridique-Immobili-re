import Header from '@/components/public/Header';
import HeroSection from '@/components/public/HeroSection';
import PartnersMarquee from '@/components/public/PartnersMarquee';
import CertificatesGrid from '@/components/public/CertificatesGrid';
import SocialProofSection from '@/components/public/SocialProofSection';
import FacultySection from '@/components/public/FacultySection';
import DynamicRegistrationForm from '@/components/public/DynamicRegistrationForm';
import StickyMobileCTA from '@/components/public/StickyMobileCTA';
import Footer from '@/components/public/Footer';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#0B0F19] text-white">
      <Header />
      <HeroSection />
      <PartnersMarquee />
      <CertificatesGrid />
      <SocialProofSection />
      <FacultySection />
      <DynamicRegistrationForm />
      <Footer />
      <StickyMobileCTA />
    </main>
  );
}