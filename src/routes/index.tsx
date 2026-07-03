import { createFileRoute, Navigate, Link } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { motion, useInView, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import {
  Sparkles, ArrowRight, PlayCircle, CheckCircle2, Clock, Users, Mail,
  FileText, Palette, LayoutDashboard, Smartphone, DollarSign, Send,
  UserPlus, FileSignature, Trophy, XCircle, Check, Zap, ShieldCheck,
  Database, TrendingUp, ChevronDown, Twitter, Github, Linkedin,
  FileSpreadsheet, Calculator, FileType,
} from "lucide-react";

const SITE_URL = "https://free-speed-quoate.lovable.app";

export const Route = createFileRoute("/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Cleaning Quote Pro — Professional Cleaning Quotes in Minutes" },
      { name: "description", content: "Generate branded cleaning quotations in minutes. Manage customers, customize pricing, and send professional PDF quotes from one dashboard." },
      { property: "og:title", content: "Cleaning Quote Pro — Professional Cleaning Quotes in Minutes" },
      { property: "og:description", content: "Generate branded cleaning quotations in minutes. Manage customers, customize pricing, and send professional PDF quotes from one dashboard." },
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
          description: "SaaS for cleaning companies to create professional quotations in minutes.",
        }),
      },
    ],
  }),
  component: Landing,
});

/* ---------- shared motion helpers ---------- */
const fadeUp: import("framer-motion").Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const } },
};
const stagger: import("framer-motion").Variants = { show: { transition: { staggerChildren: 0.08 } } };


function Reveal({ children, className, delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  return (
    <motion.div
      className={className}
      variants={fadeUp}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-80px" }}
      transition={{ delay }}
    >
      {children}
    </motion.div>
  );
}

/* ---------- animated counter ---------- */
function Counter({ to, suffix = "" }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const mv = useMotionValue(0);
  const rounded = useTransform(mv, (v) => Math.round(v).toLocaleString());
  const [val, setVal] = useState("0");
  useEffect(() => {
    if (!inView) return;
    const controls = animate(mv, to, { duration: 1.6, ease: [0.22, 1, 0.36, 1] });
    const unsub = rounded.on("change", (v) => setVal(v));
    return () => { controls.stop(); unsub(); };
  }, [inView, to, mv, rounded]);
  return <span ref={ref}>{val}{suffix}</span>;
}

function Landing() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/dashboard" />;

  return (
    <div
      className="min-h-screen text-white antialiased overflow-x-hidden"
      style={{
        background: "#09090B",
        fontFamily: 'ui-sans-serif, system-ui, -apple-system, "Inter", "Segoe UI", Roboto, sans-serif',
      }}
    >
      <Nav />
      <Hero />
      <Problem />
      <Solution />
      <HowItWorks />
      <Screenshots />
      <WhyChooseUs />
      <Benefits />
      <FAQ />
      <FinalCTA />
      <Footer />
    </div>
  );
}

/* ============================ NAV ============================ */
function Nav() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/5 backdrop-blur-xl" style={{ background: "rgba(9,9,11,0.65)" }}>
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-2.5">
          <div
            className="grid h-9 w-9 place-items-center rounded-xl shadow-lg"
            style={{ background: "linear-gradient(135deg,#2563EB,#38BDF8)", boxShadow: "0 8px 24px -8px rgba(37,99,235,0.6)" }}
          >
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <span className="font-semibold tracking-tight text-white">Cleaning Quote Pro</span>
        </Link>
        <nav className="hidden items-center gap-8 md:flex">
          <a href="#features" className="text-sm text-white/60 transition hover:text-white">Features</a>
          <a href="#how" className="text-sm text-white/60 transition hover:text-white">How it works</a>
          <a href="#why" className="text-sm text-white/60 transition hover:text-white">Why us</a>
          <a href="#faq" className="text-sm text-white/60 transition hover:text-white">FAQ</a>
        </nav>
        <div className="flex items-center gap-2">
          <Link to="/auth" className="hidden rounded-lg px-3 py-2 text-sm font-medium text-white/70 transition hover:text-white sm:inline-block">Log in</Link>
          <Link
            to="/auth"
            search={{ mode: "signup" }}
            className="rounded-lg px-4 py-2 text-sm font-semibold text-white transition hover:brightness-110"
            style={{ background: "linear-gradient(135deg,#2563EB,#38BDF8)", boxShadow: "0 8px 24px -10px rgba(37,99,235,0.7)" }}
          >
            Start free
          </Link>
        </div>
      </div>
    </header>
  );
}

/* ============================ HERO ============================ */
function Hero() {
  return (
    <section className="relative overflow-hidden px-6 pt-20 pb-24 md:pt-28 md:pb-32">
      {/* soft glows */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-[500px] w-[900px] -translate-x-1/2 rounded-full opacity-40 blur-[120px]" style={{ background: "radial-gradient(circle,#2563EB 0%,transparent 60%)" }} />
        <div className="absolute right-0 top-40 h-[400px] w-[400px] rounded-full opacity-25 blur-[100px]" style={{ background: "radial-gradient(circle,#38BDF8 0%,transparent 60%)" }} />
        {/* subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage: "linear-gradient(to right,#fff 1px,transparent 1px),linear-gradient(to bottom,#fff 1px,transparent 1px)",
            backgroundSize: "56px 56px",
            maskImage: "radial-gradient(ellipse at center,black 40%,transparent 75%)",
          }}
        />
      </div>

      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-16 lg:grid-cols-[1.05fr_1fr]">
        <div>
          <Reveal>
            <span
              className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium text-white/80"
              style={{ borderColor: "rgba(56,189,248,0.3)", background: "rgba(37,99,235,0.08)" }}
            >
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: "#38BDF8", boxShadow: "0 0 12px #38BDF8" }} />
              Built for UK cleaning businesses
            </span>
          </Reveal>
          <Reveal delay={0.05}>
            <h1 className="mt-6 text-4xl font-semibold leading-[1.05] tracking-tight text-white sm:text-5xl md:text-6xl lg:text-[68px]">
              Generate professional{" "}
              <span
                className="bg-clip-text text-transparent"
                style={{ backgroundImage: "linear-gradient(135deg,#60A5FA 0%,#38BDF8 60%,#22D3EE 100%)" }}
              >
                cleaning quotes
              </span>{" "}
              in minutes
            </h1>
          </Reveal>
          <Reveal delay={0.12}>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/60">
              Create branded quotes, manage customers, customize pricing, and send professional
              quotations from one simple dashboard.
            </p>
          </Reveal>
          <Reveal delay={0.2}>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/auth"
                search={{ mode: "signup" }}
                className="group inline-flex items-center gap-2 rounded-xl px-6 py-3.5 text-sm font-semibold text-white transition hover:brightness-110"
                style={{ background: "linear-gradient(135deg,#2563EB,#38BDF8)", boxShadow: "0 20px 50px -15px rgba(37,99,235,0.7)" }}
              >
                Start free
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
              </Link>
              <a
                href="#how"
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-white/[0.06]"
              >
                <PlayCircle className="h-4 w-4" />
                Watch demo
              </a>
            </div>
          </Reveal>
          <Reveal delay={0.28}>
            <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/60">
              {["Built for cleaning businesses", "Fast quote generation", "Professional PDF quotes"].map((t) => (
                <li key={t} className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" style={{ color: "#38BDF8" }} />
                  {t}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>

        {/* Dashboard mockup */}
        <Reveal delay={0.15}>
          <DashboardMock />
        </Reveal>
      </div>
    </section>
  );
}

function DashboardMock() {
  return (
    <motion.div
      animate={{ y: [0, -10, 0] }}
      transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      className="relative"
    >
      <div
        className="absolute -inset-6 -z-10 rounded-[32px] opacity-60 blur-2xl"
        style={{ background: "linear-gradient(135deg,rgba(37,99,235,0.5),rgba(56,189,248,0.3))" }}
      />
      <div
        className="overflow-hidden rounded-2xl border border-white/10 shadow-2xl backdrop-blur-xl"
        style={{ background: "linear-gradient(180deg,rgba(24,24,27,0.9),rgba(9,9,11,0.9))" }}
      >
        {/* browser bar */}
        <div className="flex items-center gap-2 border-b border-white/5 px-4 py-3">
          <span className="h-2.5 w-2.5 rounded-full bg-red-400/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-yellow-400/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-green-400/70" />
          <div className="ml-4 flex-1 rounded-md bg-white/5 px-3 py-1 text-[11px] text-white/40">app.cleaningquotepro.com/dashboard</div>
        </div>
        <div className="grid grid-cols-[140px_1fr] min-h-[380px]">
          {/* sidebar */}
          <div className="border-r border-white/5 p-3 space-y-1 text-xs text-white/60">
            {[
              { icon: LayoutDashboard, label: "Dashboard", active: true },
              { icon: Users, label: "Customers" },
              { icon: FileText, label: "Quotes" },
              { icon: DollarSign, label: "Pricing" },
              { icon: Palette, label: "Branding" },
            ].map((i) => (
              <div
                key={i.label}
                className={`flex items-center gap-2 rounded-lg px-2.5 py-2 ${i.active ? "text-white" : ""}`}
                style={i.active ? { background: "rgba(37,99,235,0.15)", boxShadow: "inset 0 0 0 1px rgba(56,189,248,0.2)" } : undefined}
              >
                <i.icon className="h-3.5 w-3.5" />
                <span>{i.label}</span>
              </div>
            ))}
          </div>
          {/* content */}
          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[10px] uppercase tracking-wider text-white/40">Overview</div>
                <div className="mt-0.5 text-sm font-semibold">Good morning, Sarah</div>
              </div>
              <div className="rounded-md px-2.5 py-1 text-[10px] font-medium text-white" style={{ background: "linear-gradient(135deg,#2563EB,#38BDF8)" }}>+ New quote</div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "Quotes", value: "128", accent: "#38BDF8" },
                { label: "Pending", value: "12", accent: "#F59E0B" },
                { label: "Accepted", value: "94", accent: "#10B981" },
              ].map((s) => (
                <div key={s.label} className="rounded-lg border border-white/5 bg-white/[0.02] p-2.5">
                  <div className="text-[9px] uppercase tracking-wider text-white/40">{s.label}</div>
                  <div className="mt-1 text-lg font-semibold text-white">{s.value}</div>
                  <div className="mt-1 h-1 rounded-full" style={{ background: `linear-gradient(90deg,${s.accent} 0%,transparent 100%)`, opacity: 0.7 }} />
                </div>
              ))}
            </div>
            <div className="rounded-lg border border-white/5 bg-white/[0.02] p-3">
              <div className="mb-2 text-[10px] uppercase tracking-wider text-white/40">Recent quotes</div>
              {[
                { name: "Whitfield Residence", type: "Deep clean", total: "£320" },
                { name: "Blossom Café Ltd.", type: "Office weekly", total: "£210" },
                { name: "Harper Airbnb", type: "Turnover", total: "£145" },
              ].map((r, i) => (
                <div key={r.name} className={`flex items-center justify-between py-1.5 text-xs ${i > 0 ? "border-t border-white/5" : ""}`}>
                  <div>
                    <div className="text-white/90">{r.name}</div>
                    <div className="text-[10px] text-white/40">{r.type}</div>
                  </div>
                  <div className="font-semibold" style={{ color: "#38BDF8" }}>{r.total}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* floating badge */}
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute -left-6 top-1/3 hidden rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 backdrop-blur-xl md:block"
        style={{ boxShadow: "0 20px 50px -20px rgba(56,189,248,0.5)" }}
      >
        <div className="flex items-center gap-2 text-xs">
          <CheckCircle2 className="h-4 w-4" style={{ color: "#10B981" }} />
          <span className="text-white/80">Quote sent</span>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ============================ PROBLEM ============================ */
function Problem() {
  const items = [
    { icon: Clock, title: "Manual quotations waste valuable time", body: "Hours spent formatting Word docs and re-doing maths for every job." },
    { icon: FileSpreadsheet, title: "Customer info scattered across spreadsheets", body: "Names, jobs and addresses lost between tabs, notes and email threads." },
    { icon: Mail, title: "Following up with clients becomes difficult", body: "No single place to track who received a quote, or what stage it's at." },
  ];
  return (
    <section className="relative px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: "#38BDF8" }}>The problem</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl md:text-5xl">
            Creating cleaning quotes shouldn't take hours
          </h2>
        </Reveal>
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          className="mt-14 grid gap-6 md:grid-cols-3"
        >
          {items.map((i) => (
            <motion.div
              key={i.title}
              variants={fadeUp}
              className="group rounded-2xl border border-white/5 p-6 backdrop-blur-xl transition hover:border-white/10"
              style={{ background: "linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))" }}
            >
              <div
                className="grid h-11 w-11 place-items-center rounded-xl transition group-hover:scale-105"
                style={{ background: "rgba(37,99,235,0.12)", boxShadow: "inset 0 0 0 1px rgba(56,189,248,0.2)" }}
              >
                <i.icon className="h-5 w-5" style={{ color: "#38BDF8" }} />
              </div>
              <h3 className="mt-5 text-lg font-semibold text-white">{i.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/55">{i.body}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ============================ SOLUTION / FEATURES ============================ */
function Solution() {
  const features = [
    { icon: Users, title: "Customer management", body: "One organized CRM for every cleaning client and job history." },
    { icon: FileSignature, title: "Quote generation", body: "5-step wizard auto-calculates totals from your pricing rules." },
    { icon: FileText, title: "Professional PDF quotes", body: "Branded, printable quotations with itemised pricing and terms." },
    { icon: Send, title: "Email quotes", body: "Share polished quotations with clients in a single click." },
    { icon: DollarSign, title: "Custom pricing", body: "Set your own base rates, extras, discounts and VAT." },
    { icon: Palette, title: "Company branding", body: "Add your logo, colours, terms and business details." },
    { icon: LayoutDashboard, title: "Dashboard", body: "See pending, accepted and rejected quotes at a glance." },
    { icon: Smartphone, title: "Responsive design", body: "Works beautifully on desktop, tablet and mobile." },
  ];
  return (
    <section id="features" className="relative px-6 py-24">
      <div className="mx-auto max-w-7xl">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: "#38BDF8" }}>The solution</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl md:text-5xl">
            Everything you need to manage cleaning quotes
          </h2>
          <p className="mt-4 text-lg text-white/55">One elegant dashboard replaces spreadsheets, Word docs and calculators.</p>
        </Reveal>
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          {features.map((f) => (
            <motion.div
              key={f.title}
              variants={fadeUp}
              whileHover={{ y: -4 }}
              className="group relative overflow-hidden rounded-2xl border border-white/5 p-6 backdrop-blur-xl transition"
              style={{ background: "linear-gradient(180deg,rgba(255,255,255,0.035),rgba(255,255,255,0.01))" }}
            >
              <div
                className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100"
                style={{ background: "radial-gradient(circle,#2563EB 0%,transparent 70%)" }}
              />
              <div
                className="grid h-10 w-10 place-items-center rounded-xl"
                style={{ background: "linear-gradient(135deg,rgba(37,99,235,0.25),rgba(56,189,248,0.15))", boxShadow: "inset 0 0 0 1px rgba(56,189,248,0.25)" }}
              >
                <f.icon className="h-5 w-5 text-white" />
              </div>
              <h3 className="mt-5 text-base font-semibold text-white">{f.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-white/55">{f.body}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ============================ HOW IT WORKS ============================ */
function HowItWorks() {
  const steps = [
    { icon: UserPlus, title: "Add customer", body: "Save your client's details to your CRM in seconds." },
    { icon: FileSignature, title: "Generate quote", body: "Pick the cleaning type, rooms and extras. Totals calculate live." },
    { icon: Send, title: "Send PDF quote", body: "Share a branded PDF by email or download instantly." },
    { icon: Trophy, title: "Win more cleaning jobs", body: "Look professional. Convert more leads. Grow revenue." },
  ];
  return (
    <section id="how" className="relative px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: "#38BDF8" }}>How it works</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl md:text-5xl">
            From lead to signed job in four steps
          </h2>
        </Reveal>

        <div className="relative mt-16">
          {/* connector line */}
          <div
            className="pointer-events-none absolute left-0 right-0 top-6 hidden h-px lg:block"
            style={{ background: "linear-gradient(90deg,transparent,rgba(56,189,248,0.35),transparent)" }}
          />
          <motion.ol
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-60px" }}
            className="grid gap-8 lg:grid-cols-4"
          >
            {steps.map((s, i) => (
              <motion.li key={s.title} variants={fadeUp} className="relative">
                <div
                  className="relative z-10 grid h-12 w-12 place-items-center rounded-full text-sm font-semibold text-white"
                  style={{ background: "linear-gradient(135deg,#2563EB,#38BDF8)", boxShadow: "0 12px 30px -10px rgba(56,189,248,0.7)" }}
                >
                  {i + 1}
                </div>
                <div className="mt-5 flex items-center gap-2">
                  <s.icon className="h-4 w-4" style={{ color: "#38BDF8" }} />
                  <h3 className="text-base font-semibold text-white">{s.title}</h3>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-white/55">{s.body}</p>
              </motion.li>
            ))}
          </motion.ol>
        </div>
      </div>
    </section>
  );
}

/* ============================ SCREENSHOTS ============================ */
function Screenshots() {
  const shots = [
    { label: "Dashboard", node: <ShotDashboard /> },
    { label: "Customer management", node: <ShotCustomers /> },
    { label: "Pricing settings", node: <ShotPricing /> },
    { label: "Quote generator", node: <ShotQuote /> },
    { label: "Company profile", node: <ShotProfile /> },
  ];
  const [active, setActive] = useState(0);
  return (
    <section className="relative px-6 py-24">
      <div className="mx-auto max-w-7xl">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: "#38BDF8" }}>Product tour</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl md:text-5xl">
            A closer look inside
          </h2>
        </Reveal>

        <Reveal delay={0.05}>
          <div className="mt-10 flex flex-wrap justify-center gap-2">
            {shots.map((s, i) => (
              <button
                key={s.label}
                onClick={() => setActive(i)}
                className={`rounded-full border px-4 py-2 text-xs font-medium transition ${active === i ? "text-white" : "text-white/60 hover:text-white"}`}
                style={
                  active === i
                    ? { background: "linear-gradient(135deg,rgba(37,99,235,0.3),rgba(56,189,248,0.2))", borderColor: "rgba(56,189,248,0.4)" }
                    : { borderColor: "rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.02)" }
                }
              >
                {s.label}
              </button>
            ))}
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="relative mt-10">
            <div
              className="absolute -inset-8 -z-10 rounded-[40px] opacity-40 blur-3xl"
              style={{ background: "linear-gradient(135deg,rgba(37,99,235,0.5),rgba(56,189,248,0.3))" }}
            />
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="overflow-hidden rounded-2xl border border-white/10 shadow-2xl backdrop-blur-xl"
              style={{ background: "linear-gradient(180deg,rgba(24,24,27,0.95),rgba(9,9,11,0.95))" }}
            >
              <div className="flex items-center gap-2 border-b border-white/5 px-4 py-3">
                <span className="h-2.5 w-2.5 rounded-full bg-red-400/70" />
                <span className="h-2.5 w-2.5 rounded-full bg-yellow-400/70" />
                <span className="h-2.5 w-2.5 rounded-full bg-green-400/70" />
                <div className="ml-4 flex-1 rounded-md bg-white/5 px-3 py-1 text-[11px] text-white/40">
                  app.cleaningquotepro.com/{shots[active].label.toLowerCase().replace(" ", "-")}
                </div>
              </div>
              <div className="min-h-[360px] p-6">{shots[active].node}</div>
            </motion.div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function ShotDashboard() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { l: "Total quotes", v: "128", c: "#38BDF8" },
          { l: "Pending", v: "12", c: "#F59E0B" },
          { l: "Accepted", v: "94", c: "#10B981" },
          { l: "Revenue", v: "£24,180", c: "#8B5CF6" },
        ].map((s) => (
          <div key={s.l} className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
            <div className="text-[10px] uppercase tracking-wider text-white/40">{s.l}</div>
            <div className="mt-1.5 text-2xl font-semibold text-white">{s.v}</div>
            <div className="mt-2 h-1 rounded-full" style={{ background: `linear-gradient(90deg,${s.c},transparent)` }} />
          </div>
        ))}
      </div>
      <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
        <div className="mb-3 text-xs uppercase tracking-wider text-white/40">Recent quotes</div>
        {["Whitfield Residence", "Blossom Café Ltd.", "Harper Airbnb", "Northlane Offices"].map((n, i) => (
          <div key={n} className={`flex items-center justify-between py-2 text-sm ${i > 0 ? "border-t border-white/5" : ""}`}>
            <span className="text-white/90">{n}</span>
            <span className="rounded-full px-2 py-0.5 text-[10px] font-medium" style={{ background: "rgba(56,189,248,0.15)", color: "#38BDF8" }}>Sent</span>
          </div>
        ))}
      </div>
    </div>
  );
}
function ShotCustomers() {
  return (
    <div className="rounded-xl border border-white/5 bg-white/[0.02]">
      <div className="grid grid-cols-[1.5fr_1fr_1fr_80px] gap-3 border-b border-white/5 px-4 py-3 text-[10px] uppercase tracking-wider text-white/40">
        <div>Customer</div><div>Email</div><div>Phone</div><div>Quotes</div>
      </div>
      {[
        ["Sarah Whitfield", "sarah@whitfield.co.uk", "07700 900 123", "4"],
        ["Blossom Café", "hello@blossom.cafe", "020 7946 0018", "7"],
        ["Harper Estates", "ops@harperbnb.com", "07700 900 445", "12"],
        ["Northlane Offices", "facilities@northlane.io", "020 3129 4402", "3"],
      ].map((r, i) => (
        <div key={r[0]} className={`grid grid-cols-[1.5fr_1fr_1fr_80px] gap-3 px-4 py-3 text-sm ${i > 0 ? "border-t border-white/5" : ""}`}>
          <div className="font-medium text-white">{r[0]}</div>
          <div className="text-white/60">{r[1]}</div>
          <div className="text-white/60">{r[2]}</div>
          <div className="text-white/60">{r[3]}</div>
        </div>
      ))}
    </div>
  );
}
function ShotPricing() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {[
        { l: "Regular clean (base)", v: "£80" },
        { l: "Deep clean (base)", v: "£150" },
        { l: "End of tenancy", v: "£200" },
        { l: "Office clean", v: "£120" },
        { l: "Oven cleaning", v: "£30" },
        { l: "Carpet cleaning", v: "£40" },
      ].map((p) => (
        <div key={p.l} className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3">
          <span className="text-sm text-white/80">{p.l}</span>
          <span className="rounded-md px-2.5 py-1 text-sm font-semibold text-white" style={{ background: "linear-gradient(135deg,rgba(37,99,235,0.3),rgba(56,189,248,0.2))" }}>{p.v}</span>
        </div>
      ))}
    </div>
  );
}
function ShotQuote() {
  return (
    <div className="grid gap-4 md:grid-cols-[1fr_260px]">
      <div className="space-y-3">
        {["Customer", "Cleaning type", "Property size", "Extras"].map((s, i) => (
          <div key={s} className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
            <div className="flex items-center gap-2 text-xs text-white/50">
              <span className="grid h-5 w-5 place-items-center rounded-full text-[10px] font-semibold text-white" style={{ background: "linear-gradient(135deg,#2563EB,#38BDF8)" }}>{i + 1}</span>
              <span className="uppercase tracking-wider">Step {i + 1}</span>
            </div>
            <div className="mt-1.5 text-sm font-medium text-white">{s}</div>
          </div>
        ))}
      </div>
      <div className="rounded-xl border border-white/5 p-4" style={{ background: "linear-gradient(180deg,rgba(37,99,235,0.15),rgba(56,189,248,0.05))" }}>
        <div className="text-[10px] uppercase tracking-wider text-white/50">Live total</div>
        <div className="mt-2 text-3xl font-semibold text-white">£320.00</div>
        <div className="mt-3 space-y-1 text-xs text-white/60">
          <div className="flex justify-between"><span>Base</span><span>£240</span></div>
          <div className="flex justify-between"><span>Extras</span><span>£60</span></div>
          <div className="flex justify-between"><span>VAT</span><span>£20</span></div>
        </div>
      </div>
    </div>
  );
}
function ShotProfile() {
  return (
    <div className="grid gap-4 md:grid-cols-[220px_1fr]">
      <div className="grid place-items-center rounded-2xl border border-dashed border-white/15 p-8">
        <div className="grid h-16 w-16 place-items-center rounded-2xl" style={{ background: "linear-gradient(135deg,#2563EB,#38BDF8)" }}>
          <Sparkles className="h-7 w-7 text-white" />
        </div>
        <div className="mt-3 text-xs text-white/50">Company logo</div>
      </div>
      <div className="space-y-3">
        {[
          ["Company name", "Sparkle & Shine Cleaning Ltd."],
          ["Email", "hello@sparkleshine.co.uk"],
          ["Website", "sparkleshine.co.uk"],
          ["VAT number", "GB 123 4567 89"],
        ].map(([l, v]) => (
          <div key={l} className="rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3">
            <div className="text-[10px] uppercase tracking-wider text-white/40">{l}</div>
            <div className="mt-0.5 text-sm text-white">{v}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ============================ WHY CHOOSE US ============================ */
function WhyChooseUs() {
  return (
    <section id="why" className="relative px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: "#38BDF8" }}>Why choose us</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl md:text-5xl">
            Leave old-school quoting behind
          </h2>
        </Reveal>

        <div className="mt-14 grid gap-6 lg:grid-cols-2">
          <Reveal>
            <div className="h-full rounded-2xl border border-white/5 p-8" style={{ background: "linear-gradient(180deg,rgba(255,255,255,0.02),transparent)" }}>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/60">
                The old way
              </div>
              <ul className="space-y-4">
                {[
                  { icon: FileSpreadsheet, t: "Spreadsheets", b: "Broken formulas, VLOOKUP hell, no branding." },
                  { icon: Calculator, t: "Manual calculations", b: "Prone to typos and margin errors." },
                  { icon: FileType, t: "Word documents", b: "Copy-paste templates that look amateur." },
                ].map((r) => (
                  <li key={r.t} className="flex items-start gap-3">
                    <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-white/10 bg-white/[0.03]">
                      <XCircle className="h-4 w-4 text-white/40" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-white/70 line-through decoration-white/20">{r.t}</div>
                      <div className="text-sm text-white/45">{r.b}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div
              className="relative h-full overflow-hidden rounded-2xl border p-8"
              style={{
                background: "linear-gradient(180deg,rgba(37,99,235,0.12),rgba(56,189,248,0.05))",
                borderColor: "rgba(56,189,248,0.25)",
                boxShadow: "0 30px 80px -30px rgba(37,99,235,0.5)",
              }}
            >
              <div className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full opacity-40 blur-3xl" style={{ background: "radial-gradient(circle,#38BDF8,transparent)" }} />
              <div className="mb-6 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium text-white" style={{ background: "linear-gradient(135deg,#2563EB,#38BDF8)" }}>
                <Sparkles className="h-3 w-3" /> Cleaning Quote Pro
              </div>
              <ul className="grid gap-3 sm:grid-cols-2">
                {[
                  { icon: Zap, t: "Fast" },
                  { icon: ShieldCheck, t: "Professional" },
                  { icon: Palette, t: "Branded" },
                  { icon: Database, t: "Organized" },
                  { icon: Sparkles, t: "Modern" },
                  { icon: TrendingUp, t: "Higher conversion" },
                ].map((r) => (
                  <li key={r.t} className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.03] px-3 py-2.5">
                    <div className="grid h-8 w-8 place-items-center rounded-lg" style={{ background: "linear-gradient(135deg,#2563EB,#38BDF8)" }}>
                      <Check className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex items-center gap-2 text-sm font-semibold text-white">
                      <r.icon className="h-4 w-4" style={{ color: "#38BDF8" }} />
                      {r.t}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ============================ BENEFITS (counters) ============================ */
function Benefits() {
  const stats = [
    { icon: Clock, value: 8, suffix: "h", label: "Saved every week", body: "Automated pricing and templates cut admin time." },
    { icon: Sparkles, value: 100, suffix: "%", label: "Professional branding", body: "Every quote carries your logo, colours and terms." },
    { icon: Database, value: 1, suffix: "", label: "Centralized database", body: "All customers, jobs and history in one place." },
    { icon: Zap, value: 60, suffix: "s", label: "Faster quote creation", body: "From lead to sent PDF in under a minute." },
  ];
  return (
    <section className="relative px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: "#38BDF8" }}>Benefits</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl md:text-5xl">
            Built to help you grow
          </h2>
        </Reveal>
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          {stats.map((s) => (
            <motion.div
              key={s.label}
              variants={fadeUp}
              className="relative overflow-hidden rounded-2xl border border-white/5 p-6 backdrop-blur-xl"
              style={{ background: "linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))" }}
            >
              <div className="grid h-10 w-10 place-items-center rounded-xl" style={{ background: "rgba(37,99,235,0.15)", boxShadow: "inset 0 0 0 1px rgba(56,189,248,0.25)" }}>
                <s.icon className="h-5 w-5" style={{ color: "#38BDF8" }} />
              </div>
              <div className="mt-5 text-4xl font-semibold tracking-tight text-white">
                <Counter to={s.value} suffix={s.suffix} />
              </div>
              <div className="mt-1 text-sm font-medium text-white/85">{s.label}</div>
              <div className="mt-1 text-xs leading-relaxed text-white/50">{s.body}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ============================ FAQ ============================ */
function FAQ() {
  const faqs = [
    { q: "Can I customize pricing?", a: "Yes. Set your own base rates for each cleaning type, add extras (oven, carpets, windows), and configure discounts and VAT." },
    { q: "Can I send quotes by email?", a: "Absolutely. Every quote can be shared as a branded PDF via email in one click." },
    { q: "Can I add my company logo?", a: "Yes. Upload your logo and business details in Company Profile — every quote is branded automatically." },
    { q: "Can I generate PDF quotations?", a: "Yes. Every quote is printable and downloadable as a professional PDF with itemised pricing and terms." },
    { q: "Is the platform mobile friendly?", a: "Yes. Cleaning Quote Pro is fully responsive and works beautifully on desktop, tablet and mobile." },
  ];
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="relative px-6 py-24">
      <div className="mx-auto max-w-3xl">
        <Reveal className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: "#38BDF8" }}>FAQ</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl md:text-5xl">
            Questions, answered
          </h2>
        </Reveal>
        <Reveal delay={0.05}>
          <div className="mt-12 space-y-3">
            {faqs.map((f, i) => {
              const isOpen = open === i;
              return (
                <div
                  key={f.q}
                  className="overflow-hidden rounded-2xl border border-white/5"
                  style={{ background: "linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))" }}
                >
                  <button
                    onClick={() => setOpen(isOpen ? null : i)}
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition hover:bg-white/[0.02]"
                    aria-expanded={isOpen}
                  >
                    <span className="text-sm font-semibold text-white sm:text-base">{f.q}</span>
                    <ChevronDown
                      className={`h-4 w-4 shrink-0 text-white/50 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                    />
                  </button>
                  <motion.div
                    initial={false}
                    animate={{ height: isOpen ? "auto" : 0, opacity: isOpen ? 1 : 0 }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 pb-5 text-sm leading-relaxed text-white/60">{f.a}</div>
                  </motion.div>
                </div>
              );
            })}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ============================ FINAL CTA ============================ */
function FinalCTA() {
  return (
    <section className="relative px-6 py-24">
      <div className="mx-auto max-w-5xl">
        <Reveal>
          <div
            className="relative overflow-hidden rounded-3xl border p-12 text-center md:p-16"
            style={{
              background: "linear-gradient(180deg,rgba(37,99,235,0.15),rgba(9,9,11,0.6))",
              borderColor: "rgba(56,189,248,0.25)",
              boxShadow: "0 40px 100px -30px rgba(37,99,235,0.6)",
            }}
          >
            <div className="pointer-events-none absolute inset-x-0 -top-24 mx-auto h-64 w-[80%] rounded-full opacity-50 blur-3xl" style={{ background: "radial-gradient(circle,#2563EB,transparent 60%)" }} />
            <div className="pointer-events-none absolute -bottom-32 left-1/2 h-64 w-[60%] -translate-x-1/2 rounded-full opacity-30 blur-3xl" style={{ background: "radial-gradient(circle,#38BDF8,transparent 70%)" }} />
            <h2 className="relative text-3xl font-semibold tracking-tight text-white sm:text-4xl md:text-5xl">
              Ready to simplify your cleaning quotes?
            </h2>
            <p className="relative mx-auto mt-4 max-w-xl text-base text-white/60 sm:text-lg">
              Join cleaning businesses saving hours every week with branded, professional quotations.
            </p>
            <div className="relative mt-8 flex flex-wrap justify-center gap-3">
              <Link
                to="/auth"
                search={{ mode: "signup" }}
                className="group inline-flex items-center gap-2 rounded-xl px-7 py-4 text-sm font-semibold text-white transition hover:brightness-110"
                style={{ background: "linear-gradient(135deg,#2563EB,#38BDF8)", boxShadow: "0 20px 50px -15px rgba(37,99,235,0.8)" }}
              >
                Start free today
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
              </Link>
              <Link
                to="/auth"
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-7 py-4 text-sm font-semibold text-white transition hover:bg-white/[0.06]"
              >
                I have an account
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ============================ FOOTER ============================ */
function Footer() {
  return (
    <footer className="border-t border-white/5 px-6 py-14">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="grid h-9 w-9 place-items-center rounded-xl" style={{ background: "linear-gradient(135deg,#2563EB,#38BDF8)" }}>
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <span className="font-semibold text-white">Cleaning Quote Pro</span>
            </div>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/50">
              Professional cleaning quotations for modern cleaning businesses in the UK.
            </p>
            <div className="mt-5 flex gap-2">
              {[
                { icon: Twitter, label: "Twitter" },
                { icon: Linkedin, label: "LinkedIn" },
                { icon: Github, label: "GitHub" },
              ].map((s) => (
                <a
                  key={s.label}
                  href="#"
                  aria-label={s.label}
                  className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 bg-white/[0.03] text-white/60 transition hover:border-white/20 hover:text-white"
                >
                  <s.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
          {[
            { title: "Product", links: [["Features", "#features"], ["Pricing", "#"], ["How it works", "#how"]] },
            { title: "Company", links: [["Contact", "#"], ["About", "#"], ["Blog", "#"]] },
            { title: "Legal", links: [["Privacy policy", "#"], ["Terms", "#"], ["Cookies", "#"]] },
          ].map((col) => (
            <div key={col.title}>
              <div className="text-xs font-semibold uppercase tracking-[0.15em] text-white/40">{col.title}</div>
              <ul className="mt-4 space-y-2.5">
                {col.links.map(([l, h]) => (
                  <li key={l}>
                    <a href={h} className="text-sm text-white/60 transition hover:text-white">{l}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-white/5 pt-6 text-xs text-white/40 md:flex-row">
          <div>© {new Date().getFullYear()} Cleaning Quote Pro. All rights reserved.</div>
          <div>Made for cleaning businesses in the UK.</div>
        </div>
      </div>
    </footer>
  );
}
