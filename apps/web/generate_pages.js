const fs = require('fs');
const pages = ['about', 'academics', 'admissions', 'faculty', 'gallery', 'events', 'contact'];

pages.forEach(p => {
  const dir = 'src/app/(public)/' + p;
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(dir + '/page.tsx', `
export default function Page() {
  return (
    <div className="py-24 px-6 max-w-7xl mx-auto text-center">
      <h1 className="text-4xl font-bold capitalize text-primary">${p}</h1>
      <p className="mt-4 text-on-surface-variant">Coming soon.</p>
    </div>
  );
}
  `.trim());
});

fs.mkdirSync('src/app/login', { recursive: true });
fs.writeFileSync('src/app/login/page.tsx', `
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Login() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-container-low p-6">
      <div className="glass-card p-8 rounded-2xl max-w-md w-full shadow-xl">
        <div className="text-center mb-8">
          <span className="material-symbols-outlined text-4xl text-primary mb-2">school</span>
          <h1 className="text-2xl font-bold text-on-surface">ERP Login</h1>
          <p className="text-on-surface-variant text-sm mt-1">Welcome back to EduPortal</p>
        </div>
        
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-on-surface mb-1">Email</label>
            <Input type="email" placeholder="Enter your email" />
          </div>
          <div>
            <label className="block text-sm font-medium text-on-surface mb-1">Password</label>
            <Input type="password" placeholder="Enter your password" />
          </div>
          <Button className="w-full mt-6" size="lg">Sign In</Button>
        </form>
        
        <div className="mt-8 text-center">
          <Link href="/" className="text-sm font-medium text-secondary hover:text-primary transition-colors">
            &larr; Back to Home Page
          </Link>
        </div>
      </div>
    </div>
  );
}
`.trim());
