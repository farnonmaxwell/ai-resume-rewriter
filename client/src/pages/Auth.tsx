import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";
import { CheckCircle2, ShieldCheck } from "lucide-react";
import { type FormEvent, useState } from "react";
import { toast } from "sonner";
import { Link, useLocation } from "wouter";

export default function AuthPage() {
  const [, setLocation] = useLocation();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneCode, setPhoneCode] = useState("");
  const [phoneCodeSent, setPhoneCodeSent] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [phoneLoading, setPhoneLoading] = useState(false);

  const normalizedPhone = phone.trim();

  const sendPhoneCode = async () => {
    if (!normalizedPhone) {
      toast.error("Add your phone number before requesting a verification code.");
      return;
    }
    setPhoneLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({ phone: normalizedPhone });
      if (error) throw error;
      setPhoneCodeSent(true);
      toast.success("Verification code sent. Enter the code to confirm your phone number.");
    } catch (error: any) {
      toast.error(error?.message || "Phone verification is not available yet. Check the phone-auth settings and try again.");
    } finally {
      setPhoneLoading(false);
    }
  };

  const verifyPhoneCode = async () => {
    if (!normalizedPhone || !phoneCode.trim()) {
      toast.error("Enter your phone number and verification code.");
      return;
    }
    setPhoneLoading(true);
    try {
      const { error } = await supabase.auth.verifyOtp({ phone: normalizedPhone, token: phoneCode.trim(), type: "sms" });
      if (error) throw error;
      setPhoneVerified(true);
      toast.success("Phone number verified.");
    } catch (error: any) {
      toast.error(error?.message || "That verification code did not work. Please try again.");
    } finally {
      setPhoneLoading(false);
    }
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        if (!normalizedPhone) {
          toast.error("Please add a phone number so JASS can help protect your resume data.");
          return;
        }
        if (!phoneVerified) {
          toast.error("Please verify your phone number before creating your account.");
          return;
        }
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: name.trim(), phone: normalizedPhone, phone_verified: true } },
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
                <div className="rounded-xl border border-jass-mid-gray bg-white p-4 space-y-3">
                  <div className="flex items-start gap-2">
                    <ShieldCheck className="mt-0.5 h-5 w-5 text-jass-gold" />
                    <div>
                      <Label htmlFor="phone">Phone verification</Label>
                      <p className="text-xs text-jass-muted mt-1">Required for account security because resumes contain sensitive personal information. SMS delivery will activate when phone-auth keys are connected.</p>
                    </div>
                  </div>
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(event) => {
                      setPhone(event.target.value);
                      setPhoneVerified(false);
                      setPhoneCodeSent(false);
                    }}
                    required
                    placeholder="+1 555 555 5555"
                    autoComplete="tel"
                  />
                  <Button type="button" variant="outline" onClick={sendPhoneCode} disabled={phoneLoading || !normalizedPhone || phoneVerified} className="w-full border-jass-navy text-jass-navy">
                    {phoneCodeSent ? "Resend verification code" : "Send verification code"}
                  </Button>
                  {phoneCodeSent && !phoneVerified && (
                    <div className="space-y-2">
                      <Label htmlFor="phoneCode">Verification code</Label>
                      <div className="grid grid-cols-[1fr_auto] gap-2">
                        <Input id="phoneCode" inputMode="numeric" value={phoneCode} onChange={(event) => setPhoneCode(event.target.value)} placeholder="123456" />
                        <Button type="button" onClick={verifyPhoneCode} disabled={phoneLoading || !phoneCode.trim()} className="bg-jass-gold text-jass-navy hover:bg-[var(--jass-gold-dark)]">Verify</Button>
                      </div>
                    </div>
                  )}
                  {phoneVerified && (
                    <div className="flex items-center gap-2 rounded-lg bg-jass-gold/10 p-2 text-sm font-semibold text-jass-navy">
                      <CheckCircle2 className="h-4 w-4 text-jass-gold" /> Phone verified
                    </div>
                  )}
                </div>
              </>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required placeholder="you@example.com" autoComplete="email" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required minLength={6} placeholder="At least 6 characters" autoComplete={mode === "signin" ? "current-password" : "new-password"} />
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
