import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Settings, LogIn } from "lucide-react";

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full glass-card border-b px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Link href="/" className="font-bold text-2xl text-primary flex items-center gap-2">
          <span className="material-symbols-outlined">school</span>
          St. Jude's
        </Link>
        <div className="hidden md:flex items-center gap-6 ml-8 font-medium text-sm text-on-surface">
          <Link href="/about" className="hover:text-primary transition-colors">About Us</Link>
          <Link href="/academics" className="hover:text-primary transition-colors">Academics</Link>
          <Link href="/admissions" className="hover:text-primary transition-colors">Admissions</Link>
          <Link href="/faculty" className="hover:text-primary transition-colors">Faculty</Link>
          <Link href="/gallery" className="hover:text-primary transition-colors">Gallery</Link>
          <Link href="/events" className="hover:text-primary transition-colors">Events</Link>
          <Link href="/contact" className="hover:text-primary transition-colors">Contact</Link>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon">
          <Settings className="w-5 h-5" />
        </Button>
        <Button asChild>
          <Link href="/login">
            <LogIn className="w-4 h-4 mr-2" />
            Portal Login
          </Link>
        </Button>
      </div>
    </nav>
  );
}
