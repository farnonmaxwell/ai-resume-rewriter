import PageShell from "@/components/PageShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { Mail, MessageSquare, ShieldCheck } from "lucide-react";
import { type FormEvent, useState } from "react";
import { toast } from "sonner";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const submitContact = trpc.marketing.submitContact.useMutation({
    onSuccess: () => {
      toast.success("Thanks. Your message has been sent.");
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
    },
    onError: (error) => toast.error(error.message),
  });

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    submitContact.mutate({
      name: name.trim(),
      email: email.trim(),
      subject: subject.trim() || undefined,
      message: message.trim(),
      source: "contact-page",
    });
  };

  return (
    <PageShell>
      <section className="bg-jass-navy text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-16 grid md:grid-cols-[1.1fr_0.9fr] gap-8 items-center">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-jass-gold font-semibold">Contact JASS</p>
            <h1 className="font-display text-4xl md:text-5xl font-bold mt-3">Ask a question before you rewrite</h1>
            <p className="mt-4 text-white/80 text-lg">Use this form for product questions, account questions, or anything you want clarified before starting.</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-5 space-y-4 text-sm text-white/80">
            <div className="flex gap-3"><ShieldCheck className="w-5 h-5 text-jass-gold shrink-0" /><span>Your message is stored privately so it can be answered properly.</span></div>
            <div className="flex gap-3"><MessageSquare className="w-5 h-5 text-jass-gold shrink-0" /><span>Be direct. Include the plan or workflow you are asking about if relevant.</span></div>
            <div className="flex gap-3"><Mail className="w-5 h-5 text-jass-gold shrink-0" /><span>Use the email address where you want the reply sent.</span></div>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="border-jass-mid-gray">
            <CardContent className="p-5 md:p-7">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contact-name">Name</Label>
                    <Input id="contact-name" value={name} onChange={(event) => setName(event.target.value)} required maxLength={120} placeholder="Your name" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contact-email">Email</Label>
                    <Input id="contact-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required placeholder="you@example.com" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact-subject">Subject <span className="text-jass-muted font-normal">Optional</span></Label>
                  <Input id="contact-subject" value={subject} onChange={(event) => setSubject(event.target.value)} maxLength={160} placeholder="What is this about?" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact-message">Message</Label>
                  <Textarea id="contact-message" value={message} onChange={(event) => setMessage(event.target.value)} required rows={7} minLength={10} maxLength={4000} placeholder="Tell us what you need help with." />
                </div>
                <Button type="submit" disabled={submitContact.isPending} className="w-full sm:w-auto bg-jass-gold text-jass-navy hover:bg-[var(--jass-gold-dark)] h-11 px-8">
                  {submitContact.isPending ? "Sending..." : "Send message"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>
    </PageShell>
  );
}
