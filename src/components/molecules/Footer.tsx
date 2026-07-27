import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-dark-800 border-t border-dark-700 py-8 text-center">
      <p className="text-gray-500 text-sm">
        © {new Date().getFullYear()} Académie Internationale. Tous droits réservés.
      </p>
      <Link href="/mentions-legales" className="text-gray-600 text-xs hover:text-gray-400">
        Mentions légales
      </Link>
    </footer>
  );
}