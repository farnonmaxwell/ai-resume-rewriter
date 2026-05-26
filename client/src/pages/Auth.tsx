import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";
import { useState } from "react";
import { toast } from "sonner";
import { Link, useLocation } from "wouter";

export default function AuthPage() {
  const [, setLocation] = useLocation();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        if (!phone.trim()) {
          toast.error("Please add a phone number so JASS can help protect your resume data.");
          return;
        }
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: name, phone: phone.trim() } },
        });
        if (error) throw error;
        toast.success("Account created. Check your email if confirmation is enabled, then continue into JASS.");
        setLocation("/onboarding");
        return;
      }

      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      setLocation("/onboarding");
    } catch (error: any) {
      toast.error(error?.message || "Authentication failed. Check your details and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-jass-light-gray flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md border-jass-mid-gray shadow-xl">
        <CardHeader>
          <Link href="/" className="text-sm font-semibold text-jass-gold hover:underline">JASS</Link>
          <CardTitle className="font-display text-3xl text-jass-navy">
            {mode === "signin" ? "Sign in to JASS" : "Create your JASS account"}
          </CardTitle>
          <CardDescription>
            The resume tool is changing because the job market changed. We will be direct, useful, and honest.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-4">
            {mode === "signup" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Max Farnon" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone number</Label>
                  <Input id="phone" type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} required placeholder="(555) 555-5555" />
                  <p className="text-xs text-jass-muted">Required for account security because resumes contain sensitive personal information. It also helps prevent duplicate free-trial abuse.</p>
                </div>
              </>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required placeholder="you@example.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required minLength={6} placeholder="At least 6 characters" />
            </div>
            <Button disabled={loading} className="w-full bg-jass-gold text-jass-navy hover:bg-[var(--jass-gold-dark)]">
              {loading ? "Working..." : mode === "signin" ? "Sign in" : "Create account"}
            </Button>
          </form>
          <div className="mt-5 text-center text-sm text-jass-muted">
            {mode === "signin" ? "New to JASS?" : "Already have an account?"}{" "}
            <button className="font-semibold text-jass-navy underline" onClick={() => setMode(mode === "signin" ? "signup" : "signin")}> 
              {mode === "signin" ? "Create an account" : "Sign in"}
            </button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
