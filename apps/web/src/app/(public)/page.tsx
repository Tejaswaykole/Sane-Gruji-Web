import { Button } from "@/components/ui/button";
import { statsData, featuresData } from "@/constants/mock-data";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex flex-col gap-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-surface-container-low pt-24 pb-32 px-6">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <h1 className="text-5xl md:text-6xl font-extrabold text-on-surface leading-tight">
              Shaping Tomorrow's <span className="text-primary">Leaders</span> Today
            </h1>
            <p className="text-xl text-on-surface-variant max-w-lg">
              Experience world-class education with a focus on academic excellence, 
              character building, and holistic development.
            </p>
            <div className="flex gap-4">
              <Button size="lg" asChild>
                <Link href="/admissions">Apply Now <ArrowRight className="ml-2 w-4 h-4" /></Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/about">Learn More</Link>
              </Button>
            </div>
          </div>
          <div className="relative">
            <div className="aspect-square rounded-full bg-secondary-container/50 absolute -top-12 -right-12 w-[120%] -z-10 blur-3xl"></div>
            <img 
              src="/images/hero-students.jpg" 
              alt="Students" 
              className="rounded-2xl shadow-2xl border-4 border-white w-full object-cover aspect-[4/3] bg-surface-variant"
            />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="px-6 -mt-24 relative z-10">
        <div className="max-w-7xl mx-auto glass-card rounded-2xl p-8 grid grid-cols-2 md:grid-cols-4 gap-8 text-center shadow-xl">
          {statsData.map((stat, i) => (
            <div key={i}>
              <div className="text-4xl font-bold text-primary mb-2">{stat.value}</div>
              <div className="text-sm font-medium text-on-surface-variant uppercase tracking-wider">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-6 space-y-12">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold text-on-surface">Why Choose St. Jude's?</h2>
          <p className="text-on-surface-variant max-w-2xl mx-auto">We provide a nurturing environment where students can discover their passions and reach their full potential.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {featuresData.map((feature, i) => (
            <div key={i} className="glass-card p-8 rounded-xl hover-lift">
              <span className="material-symbols-outlined text-4xl text-secondary mb-6">{feature.icon}</span>
              <h3 className="text-xl font-bold text-on-surface mb-3">{feature.title}</h3>
              <p className="text-on-surface-variant">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
