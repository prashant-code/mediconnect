import Link from 'next/link';
import { Calendar, Heart, Shield, Users } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <Heart className="w-8 h-8 text-primary" />
              <span className="text-2xl font-bold text-primary">Medin Connect</span>
            </div>
            <div className="flex gap-4">
              <Link
                href="/login"
                className="px-4 py-2 text-foreground hover:text-primary transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity font-medium"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl font-bold text-foreground mb-6 leading-tight">
                Your Health,
                <span className="text-primary block">Our Priority</span>
              </h1>
              <p className="text-xl text-foreground/70 mb-8 leading-relaxed">
                Experience seamless healthcare management with Medin Connect.
                Book appointments, access medical records, and connect with healthcare professionals—all in one place.
              </p>
              <div className="flex gap-4">
                <Link
                  href="/register"
                  className="px-8 py-4 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity font-semibold text-lg inline-flex items-center gap-2"
                >
                  <Calendar className="w-5 h-5" />
                  Book Now
                </Link>
                <Link
                  href="/login"
                  className="px-8 py-4 border-2 border-primary text-primary rounded-lg hover:bg-primary/5 transition-colors font-semibold text-lg"
                >
                  Learn More
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square bg-gradient-to-br from-primary/20 to-secondary/20 rounded-3xl flex items-center justify-center">
                <Heart className="w-48 h-48 text-primary/30" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-surface">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-foreground mb-12">
            Why Choose Medin Connect
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 bg-background rounded-2xl border border-border hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Calendar className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Easy Scheduling</h3>
              <p className="text-foreground/70">
                Book appointments with your preferred healthcare providers in just a few clicks.
              </p>
            </div>
            <div className="p-8 bg-background rounded-2xl border border-border hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-secondary/20 rounded-lg flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Secure & Private</h3>
              <p className="text-foreground/70">
                Your health data is protected with enterprise-grade security and encryption.
              </p>
            </div>
            <div className="p-8 bg-background rounded-2xl border border-border hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-accent/20 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Expert Care</h3>
              <p className="text-foreground/70">
                Connect with qualified healthcare professionals dedicated to your wellbeing.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-foreground mb-6">
            Ready to Take Control of Your Health?
          </h2>
          <p className="text-xl text-foreground/70 mb-8">
            Join thousands of patients who trust Medin Connect for their healthcare needs.
          </p>
          <Link
            href="/register"
            className="px-10 py-4 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity font-semibold text-lg inline-flex items-center gap-2"
          >
            <Calendar className="w-5 h-5" />
            Get Started Today
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-surface py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-foreground/60">
          <p>&copy; 2024 Medin Connect. Advanced Healthcare Platform.</p>
        </div>
      </footer>
    </div>
  );
}
