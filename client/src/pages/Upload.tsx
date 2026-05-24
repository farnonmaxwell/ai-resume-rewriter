import PageShell from "@/components/PageShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { FileUp, Loader2, ShieldCheck } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { useLocation } from "wouter";

function readFileAsBase64(f: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => {
      const result = r.result as string;
      const base64 = result.includes(",") ? result.split(",")[1] : result;
      resolve(base64);
    };
    r.onerror = reject;
    r.readAsDataURL(f);
  });
}

export default function UploadPage() {
  const { isAuthenticated, loading } = useAuth();
  const [, setLocation] = useLocation();
  const [pasted, setPasted] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const upload = trpc.rewrites.upload.useMutation();

  if (loading) {
    return (
      <PageShell>
        <div className="py-24 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-jass-gold" /></div>
      </PageShell>
    );
  }

  if (!isAuthenticated) {
    return (
      <PageShell>
        <div className="max-w-xl mx-auto px-4 py-20 text-center">
          <h1 className="font-display text-3xl font-bold text-jass-navy">Sign in to start your rewrite</h1>
          <p className="text-jass-muted mt-3">Your account holds your rewrite history and lets you re-download files anytime.</p>
          <Button className="mt-6 bg-jass-gold text-jass-navy hover:bg-[var(--jass-gold-dark)] h-11 px-6" onClick={() => setLocation("/auth")}>
            Sign in to continue
          </Button>
        </div>
      </PageShell>
    );
  }

  const submit = async (mode: "file" | "paste") => {
    setBusy(true);
    try {
      let payload: { fileName?: string; mimeType?: string; fileBase64?: string; pastedText?: string };
      if (mode === "file") {
        if (!file) {
          toast.error("Please choose a PDF or DOCX file");
          setBusy(false);
          return;
        }
        const base64 = await readFileAsBase64(file);
        payload = { fileName: file.name, mimeType: file.type, fileBase64: base64 };
      } else {
        if (!pasted || pasted.trim().length < 100) {
          toast.error("Please paste at least 100 characters of resume text");
          setBusy(false);
          return;
        }
        payload = { pastedText: pasted, fileName: "pasted-resume.txt" };
      }
      const res = await upload.mutateAsync(payload);
      toast.success("Resume parsed");
      setLocation(`/intake/${res.id}`);
    } catch (e: any) {
      toast.error(e?.message ?? "Upload failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <PageShell>
      <section className="bg-jass-navy text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="font-display text-3xl md:text-4xl font-bold">Step 1: Share your current resume</h1>
          <p className="mt-3 text-white/80">Upload a PDF or DOCX, or paste your resume text. We will extract everything automatically.</p>
        </div>
      </section>

      <section className="py-10 md:py-14">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="border-jass-mid-gray">
            <CardContent className="p-6">
              <Tabs defaultValue="file">
                <TabsList className="grid w-full grid-cols-2 bg-jass-light-gray">
                  <TabsTrigger value="file" className="data-[state=active]:bg-jass-navy data-[state=active]:text-white">Upload file</TabsTrigger>
                  <TabsTrigger value="paste" className="data-[state=active]:bg-jass-navy data-[state=active]:text-white">Paste text</TabsTrigger>
                </TabsList>
                <TabsContent value="file" className="pt-6">
                  <div
                    role="button"
                    tabIndex={0}
                    aria-label="Choose a file to upload"
                    onClick={() => inputRef.current?.click()}
                    onKeyDown={e => { if (e.key === "Enter" || e.key === " ") inputRef.current?.click(); }}
                    className="border-2 border-dashed border-jass-mid-gray rounded-lg p-10 text-center hover:bg-jass-light-gray transition-colors"
                  >
                    <FileUp className="w-10 h-10 text-jass-gold mx-auto" />
                    <div className="mt-3 font-semibold text-jass-navy">{file ? file.name : "Click to choose a PDF or DOCX"}</div>
                    <div className="text-xs text-jass-muted mt-1">Max 8 MB. We do not share your file.</div>
                    <input
                      ref={inputRef}
                      type="file"
                      accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                      className="hidden"
                      onChange={e => setFile(e.target.files?.[0] ?? null)}
                    />
                  </div>
                  <Button
                    onClick={() => submit("file")}
                    disabled={busy || !file}
                    className="mt-6 w-full h-11 bg-jass-gold text-jass-navy hover:bg-[var(--jass-gold-dark)]"
                  >
                    {busy ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Parsing...</> : "Continue"}
                  </Button>
                </TabsContent>
                <TabsContent value="paste" className="pt-6">
                  <label htmlFor="pasted" className="text-sm font-semibold text-jass-navy">Paste your full resume text</label>
                  <Textarea
                    id="pasted"
                    rows={14}
                    value={pasted}
                    onChange={e => setPasted(e.target.value)}
                    placeholder="Name, contact, summary, work history, education..."
                    className="mt-2"
                  />
                  <Button
                    onClick={() => submit("paste")}
                    disabled={busy || pasted.length < 100}
                    className="mt-4 w-full h-11 bg-jass-gold text-jass-navy hover:bg-[var(--jass-gold-dark)]"
                  >
                    {busy ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Parsing...</> : "Continue"}
                  </Button>
                </TabsContent>
              </Tabs>
              <div className="mt-6 flex items-start gap-2 text-xs text-jass-muted">
                <ShieldCheck className="w-4 h-4 text-jass-gold mt-0.5" />
                <p>Your resume is used only to generate your rewrite and is stored privately under your account.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </PageShell>
  );
}
