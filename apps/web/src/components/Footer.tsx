import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-on-tertiary-fixed text-white py-12 px-6 mt-20">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <h3 className="font-bold text-xl mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined">school</span>
            St. Jude's
          </h3>
          <p className="text-inverse-on-surface text-sm">
            Empowering Future Leaders with excellence in education, character building, and innovation since 1995.
          </p>
        </div>
        <div>
          <h4 className="font-semibold mb-4 text-primary-fixed">Quick Links</h4>
          <ul className="space-y-2 text-sm text-inverse-on-surface">
            <li><Link href="/about" className="hover:text-white">About Us</Link></li>
            <li><Link href="/academics" className="hover:text-white">Academics</Link></li>
            <li><Link href="/admissions" className="hover:text-white">Admissions</Link></li>
            <li><Link href="/contact" className="hover:text-white">Contact</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-4 text-primary-fixed">Portals</h4>
          <ul className="space-y-2 text-sm text-inverse-on-surface">
            <li><Link href="/login" className="hover:text-white">Student Portal</Link></li>
            <li><Link href="/login" className="hover:text-white">Parent Portal</Link></li>
            <li><Link href="/login" className="hover:text-white">Staff Portal</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-4 text-primary-fixed">Contact Us</h4>
          <address className="not-italic text-sm text-inverse-on-surface space-y-2">
            <p>123 Education Boulevard</p>
            <p>Knowledge City, ST 12345</p>
            <p>Phone: +1 (555) 123-4567</p>
            <p>Email: info@stjudes.edu</p>
          </address>
        </div>
      </div>
      <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-white/20 text-center text-sm text-inverse-on-surface">
        &copy; {new Date().getFullYear()} St. Jude's Institutional. All rights reserved.
      </div>
    </footer>
  );
}
