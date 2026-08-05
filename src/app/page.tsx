import Header from '@/components/public/Header';
import HeroSection from '@/components/public/HeroSection';
import PartnersMarquee from '@/components/public/PartnersMarquee';
import CertificatesGrid from '@/components/public/CertificatesGrid';
import WhyThisFormation from '@/components/public/WhyThisFormation';
import { SocialProofSection } from '@/components/public/SocialProofSection';
import FacultySection from '@/components/public/FacultySection';
import BoutiqueSection from '@/components/public/BoutiqueSection'; // 🆕
import { MomentsDeFierte } from '@/components/public/MomentsDeFierte'; 
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
      <WhyThisFormation />
      <SocialProofSection />
      <FacultySection />
      <BoutiqueSection /> {/* 🆕 Juste après le corps enseignant */}
      <MomentsDeFierte />  
      <DynamicRegistrationForm />
      <Footer />
      <StickyMobileCTA />
    </main>
  );
}