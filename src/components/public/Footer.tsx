import Link from 'next/link';
import { Award, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#0B0F19] border-t border-[#1E293B] pt-16 pb-24 lg:pb-8 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-3 gap-10 mb-12">
          {/* Marque */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Award className="w-6 h-6 text-[#D4AF37]" />
              <span className="text-white font-['Playfair_Display'] text-lg">
                Académie<span className="text-[#D4AF37]">Internationale</span>
              </span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Université d&apos;Été de Droit — Former l&apos;élite juridique et immobilière depuis 15 ans.
            </p>
          </div>

          {/* Liens rapides */}
          <div>
            <h4 className="text-white font-semibold mb-4">Navigation</h4>
            <ul className="space-y-2">
              <li><a href="#certificates" className="text-gray-400 text-sm hover:text-[#D4AF37] transition-colors">Programmes</a></li>
              <li><a href="#bourse" className="text-gray-400 text-sm hover:text-[#D4AF37] transition-colors">Bourse</a></li>
              <li><a href="#testimonials" className="text-gray-400 text-sm hover:text-[#D4AF37] transition-colors">Témoignages</a></li>
              <li><a href="#faculty" className="text-gray-400 text-sm hover:text-[#D4AF37] transition-colors">Corps enseignant</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-gray-400 text-sm">
                <MapPin className="w-4 h-4 text-[#D4AF37] flex-shrink-0" />
                Abidjan, Côte d&apos;Ivoire
              </li>
              <li className="flex items-start gap-3 text-gray-400 text-sm">
                <Mail className="w-4 h-4 text-[#D4AF37] flex-shrink-0 mt-0.5" />
                <div className="flex flex-col">
                  <a href="mailto:jeanlouislobe11@gmail.com" className="hover:text-[#D4AF37] transition-colors">
                    jeanlouislobe11@gmail.com
                  </a>
                  <a href="mailto:jeanlouis.lobe21@gmail.com" className="hover:text-[#D4AF37] transition-colors">
                    jeanlouis.lobe21@gmail.com
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3 text-gray-400 text-sm">
                <Phone className="w-4 h-4 text-[#D4AF37] flex-shrink-0 mt-0.5" />
                <div className="flex flex-col space-y-1">
                  <div>
                    <span className="text-xs text-gray-500">Côte d&apos;Ivoire</span>
                    <div className="flex flex-col">
                      <a href="tel:+2250757279676" className="hover:text-[#D4AF37] transition-colors">
                        +225 07 57 27 96 76
                      </a>
                      <a href="tel:+2250767191919" className="hover:text-[#D4AF37] transition-colors">
                        +225 07 67 19 19 19
                      </a>
                      <a href="tel:+2250768171717" className="hover:text-[#D4AF37] transition-colors">
                        +225 07 68 17 17 17
                      </a>
                    </div>
                  </div>
                  <div className="pt-1">
                    <span className="text-xs text-gray-500">France</span>
                    <div>
                      <a href="tel:+33777969831" className="hover:text-[#D4AF37] transition-colors">
                        +33 7 77 96 98 31
                      </a>
                    </div>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bas de footer */}
        <div className="border-t border-[#1E293B] pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} Académie Internationale — Tous droits réservés
          </p>
          <div className="flex items-center gap-2">
            <span className="text-gray-500 text-sm">Site réalisé par</span>
            <span className="text-[#D4AF37] text-sm font-medium">M. LOBE</span>
          </div>
        </div>
      </div>
    </footer>
  );
}