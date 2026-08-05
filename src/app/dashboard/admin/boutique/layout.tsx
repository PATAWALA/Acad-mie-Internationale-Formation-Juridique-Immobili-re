import Header from '@/components/public/Header';
import Footer from '@/components/public/Footer';

export default function BoutiqueLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#020617] text-white">
      <Header />
      {children}
      <Footer />
    </div>
  );
}