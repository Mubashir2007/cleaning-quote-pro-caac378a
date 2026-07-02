import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { Sparkles, ShieldCheck, Zap, FileText } from "lucide-react";
import { Link } from "@tanstack/react-router";

const SITE_URL = "https://free-speed-quoate.lovable.app";

export const Route = createFileRoute("/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Cleaning Quote Pro — Professional Cleaning Quotes in Minutes" },
      { name: "description", content: "Cleaning Quote Pro helps cleaning companies generate branded, itemised quotations in under a minute. Manage customers, pricing, and quotes in one place." },
      { property: "og:title", content: "Cleaning Quote Pro — Professional Cleaning Quotes in Minutes" },
      { property: "og:description", content: "Generate branded cleaning quotations in under a minute. Customers, pricing, and quotes in one place." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE_URL}/` },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/` }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "Cleaning Quote Pro",
          url: SITE_URL,
          description: "SaaS for cleaning companies to create professional quotations in under a minute.",
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "Cleaning Quote Pro",
          url: SITE_URL,
        }),
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/dashboard" />;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/60 bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground">
              <Sparkles className="h-5 w-5" />
            </div>
            <span className="font-semibold tracking-tight">Cleaning Quote Pro</span>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/auth" className="rounded-md px-3 py-2 text-sm font-medium hover:bg-muted">Log in</Link>
            <Link to="/auth" search={{ mode: "signup" }} className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
              Get started free
            </Link>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 pt-20 pb-16 text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-brand/40 bg-accent px-3 py-1 text-xs font-medium text-accent-foreground">
          <Sparkles className="h-3 w-3" /> Built for cleaning companies
        </span>
        <h1 className="mx-auto mt-6 max-w-3xl text-5xl font-bold tracking-tight md:text-6xl">
          Professional cleaning quotes in <span className="text-primary">under a minute</span>.
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
          Customers, pricing, and beautifully branded quotations — all in one place. Send polished PDFs and win more jobs.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Link to="/auth" search={{ mode: "signup" }} className="rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-pop)] hover:bg-primary/90">
            Start free
          </Link>
          <Link to="/auth" className="rounded-lg border border-border bg-card px-6 py-3 text-sm font-semibold hover:bg-muted">
            I have an account
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-24" aria-labelledby="features-heading">
        <h2 id="features-heading" className="sr-only">Features</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { icon: Zap, title: "60-second quotes", body: "Multi-step form auto-calculates totals from your pricing rules." },
            { icon: FileText, title: "Branded PDFs", body: "Logo, terms, totals — printable and shareable in one click." },
            { icon: ShieldCheck, title: "Your data, secured", body: "Row-level security keeps every company's data private." },
          ].map((f) => (
            <div key={f.title} className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-accent text-accent-foreground">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-semibold">{f.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{f.body}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
