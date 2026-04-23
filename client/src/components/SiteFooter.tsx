import { Link } from "wouter";

export default function SiteFooter() {
  return (
    <footer className="bg-eo50-navy text-white/80 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid gap-8 md:grid-cols-3">
        <div>
          <div className="font-display text-2xl text-eo50-gold font-bold">EO50</div>
          <p className="mt-3 text-sm leading-relaxed text-white/70">
            Empower Over 50. A practical platform for adults 50+ navigating career transitions, identity, and reinvention.
          </p>
        </div>
        <div>
          <h2 className="text-sm uppercase tracking-wider text-eo50-gold font-semibold mb-3">Product</h2>
          <ul className="space-y-2 text-sm">
            <li><Link href="/" className="hover:text-eo50-gold">Home</Link></li>
            <li><Link href="/how-it-works" className="hover:text-eo50-gold">How it works</Link></li>
            <li><Link href="/pricing" className="hover:text-eo50-gold">Pricing</Link></li>
            <li><Link href="/upload" className="hover:text-eo50-gold">Start a rewrite</Link></li>
          </ul>
        </div>
        <div>
          <h2 className="text-sm uppercase tracking-wider text-eo50-gold font-semibold mb-3">About</h2>
          <p className="text-sm text-white/70 leading-relaxed">
            EO50 is a fellow traveler, not a coach. We acknowledge the frustration: you have decades of experience. The problem isn&apos;t you. It&apos;s that your resume isn&apos;t speaking the language these systems understand.
          </p>
        </div>
      </div>
      <div className="border-t border-[var(--eo50-navy-soft)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 text-xs text-white/60 flex flex-col sm:flex-row justify-between gap-2">
          <div>© {new Date().getFullYear()} EO50. All rights reserved.</div>
          <div>Made with care for people 50+</div>
        </div>
      </div>
    </footer>
  );
}
