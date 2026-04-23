import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "wouter";

export default function SiteHeader() {
  const { user, isAuthenticated, logout } = useAuth();
  const [, setLocation] = useLocation();
  const [open, setOpen] = useState(false);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/pricing", label: "Pricing" },
    { href: "/how-it-works", label: "How It Works" },
  ];

  return (
    <header className="bg-eo50-navy text-white sticky top-0 z-40 border-b border-[var(--eo50-navy-soft)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        <Link href="/" className="flex items-center gap-2">
          <span className="font-display text-2xl font-bold text-eo50-gold">EO50</span>
          <span className="hidden sm:inline text-sm tracking-wide text-white/80">Resume Rewriter</span>
        </Link>
        <nav aria-label="Primary" className="hidden md:flex items-center gap-6">
          {navLinks.map(l => (
            <Link key={l.href} href={l.href} className="text-sm text-white/85 hover:text-eo50-gold transition-colors">
              {l.label}
            </Link>
          ))}
          {isAuthenticated && (
            <Link href="/dashboard" className="text-sm text-white/85 hover:text-eo50-gold transition-colors">
              Dashboard
            </Link>
          )}
          {isAuthenticated && user?.role === "admin" && (
            <Link href="/admin" className="text-sm text-white/85 hover:text-eo50-gold transition-colors">
              Admin
            </Link>
          )}
        </nav>
        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <span className="text-sm text-white/70 max-w-[160px] truncate" title={user?.email ?? ""}>{user?.name ?? user?.email}</span>
              <Button
                variant="outline"
                className="bg-transparent border-white/30 text-white hover:bg-white/10 hover:text-white"
                onClick={async () => {
                  await logout();
                  setLocation("/");
                }}
              >
                Sign out
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                className="bg-transparent border-white/30 text-white hover:bg-white/10 hover:text-white"
                onClick={() => (window.location.href = getLoginUrl())}
              >
                Sign in
              </Button>
              <Button
                className="bg-eo50-gold text-eo50-navy hover:bg-[var(--eo50-gold-dark)]"
                onClick={() => setLocation("/upload")}
              >
                Fix My Resume Now
              </Button>
            </>
          )}
        </div>
        <button
          className="md:hidden p-2 rounded text-white"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen(o => !o)}
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>
      {open && (
        <div className="md:hidden border-t border-[var(--eo50-navy-soft)] bg-eo50-navy">
          <nav className="px-4 py-3 flex flex-col gap-3" aria-label="Mobile">
            {navLinks.map(l => (
              <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="text-white/90 py-1">
                {l.label}
              </Link>
            ))}
            {isAuthenticated && (
              <Link href="/dashboard" onClick={() => setOpen(false)} className="text-white/90 py-1">
                Dashboard
              </Link>
            )}
            {isAuthenticated && user?.role === "admin" && (
              <Link href="/admin" onClick={() => setOpen(false)} className="text-white/90 py-1">
                Admin
              </Link>
            )}
            <div className="pt-2 flex flex-col gap-2">
              {isAuthenticated ? (
                <Button variant="outline" className="bg-transparent border-white/30 text-white" onClick={async () => { await logout(); setOpen(false); setLocation("/"); }}>
                  Sign out
                </Button>
              ) : (
                <>
                  <Button variant="outline" className="bg-transparent border-white/30 text-white" onClick={() => (window.location.href = getLoginUrl())}>
                    Sign in
                  </Button>
                  <Button className="bg-eo50-gold text-eo50-navy hover:bg-[var(--eo50-gold-dark)]" onClick={() => { setOpen(false); setLocation("/upload"); }}>
                    Fix My Resume Now
                  </Button>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
