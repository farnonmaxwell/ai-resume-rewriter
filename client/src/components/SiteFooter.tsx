import { Link } from "wouter";

export default function SiteFooter() {
  return (
    <footer className="bg-jass-navy text-white/80 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid gap-8 md:grid-cols-3">
        <div>
          <div className="font-display text-2xl text-jass-gold font-bold">JASS</div>
          <p className="mt-3 text-sm leading-relaxed text-white/70">
            Direct, practical resume support for people trying to get through modern hiring systems without losing their voice.
          </p>
        </div>
        <div>
          <h2 className="text-sm uppercase tracking-wider text-jass-gold font-semibold mb-3">Product</h2>
          <ul className="space-y-2 text-sm">
            <li><Link href="/" className="hover:text-jass-gold">Home</Link></li>
            <li><Link href="/how-it-works" className="hover:text-jass-gold">How it works</Link></li>
            <li><Link href="/pricing" className="hover:text-jass-gold">Pricing</Link></li>
            <li><Link href="/faq" className="hover:text-jass-gold">FAQ</Link></li>
            <li><Link href="/contact" className="hover:text-jass-gold">Contact</Link></li>
            <li><Link href="/upload" className="hover:text-jass-gold">Start a rewrite</Link></li>
          </ul>
        </div>
        <div>
          <h2 className="text-sm uppercase tracking-wider text-jass-gold font-semibold mb-3">Approach</h2>
          <p className="text-sm text-white/70 leading-relaxed">
            JASS is blunt in the right way: it shows where your resume undersells you, fixes the evidence, and adapts the format to the work you are actually pursuing.
          </p>
        </div>
      </div>
      <div className="border-t border-[var(--jass-navy-soft)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 text-xs text-white/60 flex flex-col sm:flex-row justify-between gap-2">
          <div>© {new Date().getFullYear()} JASS. All rights reserved.</div>
          <div>Built for serious job search support.</div>
        </div>
      </div>
    </footer>
  );
}
