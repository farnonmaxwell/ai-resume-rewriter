import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "wouter";

function titleCaseName(value?: string | null): string {
  const raw = (value || "").trim();
  if (!raw) return "";
  return raw
    .split(/\s+/)
    .map(part => part.length <= 2 && part === part.toUpperCase() ? part : part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export default function SiteHeader() {
  const { user, isAuthenticated, logout } = useAuth();
  const [, setLocation] = useLocation();
  const [open, setOpen] = useState(false);
  const displayName = titleCaseName(user?.name) || user?.email;

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/pricing", label: "Pricing" },
    { href: "/how-it-works", label: "How It Works" },
  ];

  return (
    <header className="bg-jass-navy text-white sticky top-0 z-40 border-b border-[var(--jass-navy-soft)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        <Link href="/" className="flex items-center gap-2">
          <span className="font-display text-2xl font-bold text-jass-gold">JASS</span>
          <span className="hidden sm:inline text-sm tracking-wide text-white/80">Job Application Support System</span>
        </Link>
        <nav aria-label="Primary" className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="text-sm text-white/85 hover:text-jass-gold transition-colors">
              {link.label}
            </Link>
          ))}
          {isAuthenticated && <Link href="/dashboard" className="text-sm text-white/85 hover:text-jass-gold transition-colors">Dashboard</Link>}
          {isAuthenticated && user?.role === "admin" && <Link href="/admin" className="text-sm text-white/85 hover:text-jass-gold transition-colors">Admin</Link>}
        </nav>
        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <span className="text-sm text-white/70 max-w-[160px] truncate" title={user?.email ?? ""}>{displayName}</span>
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
              <Button variant="outline" className="bg-transparent border-white/30 text-white hover:bg-white/10 hover:text-white" onClick={() => setLocation("/auth")}>Sign in</Button>
              <Button className="bg-jass-gold text-jass-navy hover:bg-[var(--jass-gold-dark)]" onClick={() => setLocation("/auth")}>Start with JASS</Button>
            </>
          )}
        </div>
        <button className="md:hidden p-2 rounded text-white" aria-label={open ? "Close menu" : "Open menu"} onClick={() => setOpen((value) => !value)}>
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>
      {open && (
        <div className="md:hidden border-t border-[var(--jass-navy-soft)] bg-jass-navy">
          <nav className="px-4 py-3 flex flex-col gap-3" aria-label="Mobile">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} onClick={() => setOpen(false)} className="text-white/90 py-1">{link.label}</Link>
            ))}
            {isAuthenticated && <Link href="/dashboard" onClick={() => setOpen(false)} className="text-white/90 py-1">Dashboard</Link>}
            {isAuthenticated && user?.role === "admin" && <Link href="/admin" onClick={() => setOpen(false)} className="text-white/90 py-1">Admin</Link>}
            <div className="pt-2 flex flex-col gap-2">
              {isAuthenticated ? (
                <Button variant="outline" className="bg-transparent border-white/30 text-white" onClick={async () => { await logout(); setOpen(false); setLocation("/"); }}>Sign out</Button>
              ) : (
                <>
                  <Button variant="outline" className="bg-transparent border-white/30 text-white" onClick={() => { setOpen(false); setLocation("/auth"); }}>Sign in</Button>
                  <Button className="bg-jass-gold text-jass-navy hover:bg-[var(--jass-gold-dark)]" onClick={() => { setOpen(false); setLocation("/auth"); }}>Start with JASS</Button>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
