import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { PageHeader, StatusBadge, EmptyState } from "@/components/app-ui";
import { FileText, FilePlus2, Clock, CheckCircle2, XCircle, ListChecks } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatMoney, cleaningTypeLabel, type CleaningType } from "@/lib/pricing";
import type { Tables } from "@/integrations/supabase/types";
import { format } from "date-fns";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: DashboardPage,
});

type QuoteRow = Tables<"quotes"> & { customers: { full_name: string } | null };

function DashboardPage() {
  const { user } = useAuth();
  const [quotes, setQuotes] = useState<QuoteRow[]>([]);
  const [currency, setCurrency] = useState<string>("GBP");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [q, p] = await Promise.all([
        supabase.from("quotes").select("*, customers(full_name)").order("created_at", { ascending: false }),
        supabase.from("profiles").select("currency").eq("id", user.id).maybeSingle(),
      ]);
      setQuotes((q.data as QuoteRow[]) ?? []);
      setCurrency(p.data?.currency ?? "GBP");
      setLoading(false);
    })();
  }, [user]);

  const total = quotes.length;
  const pending = quotes.filter((q) => q.status === "pending").length;
  const accepted = quotes.filter((q) => q.status === "accepted").length;
  const rejected = quotes.filter((q) => q.status === "rejected").length;

  const stats = [
    { label: "Total Quotes", value: total, icon: ListChecks, accent: "bg-accent text-accent-foreground" },
    { label: "Pending", value: pending, icon: Clock, accent: "bg-warning/20 text-warning-foreground" },
    { label: "Accepted", value: accepted, icon: CheckCircle2, accent: "bg-success/20 text-success" },
    { label: "Rejected", value: rejected, icon: XCircle, accent: "bg-destructive/15 text-destructive" },
  ];

  return (
    <>
      <PageHeader
        title="Dashboard"
        subtitle="Overview of your cleaning quotations"
        action={
          <Link to="/quotes/new">
            <Button><FilePlus2 className="mr-2 h-4 w-4" />New quote</Button>
          </Link>
        }
      />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{s.label}</span>
              <div className={`grid h-9 w-9 place-items-center rounded-lg ${s.accent}`}><s.icon className="h-4 w-4" /></div>
            </div>
            <div className="mt-3 text-3xl font-bold tracking-tight">{loading ? "—" : s.value}</div>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-2xl border border-border bg-card shadow-[var(--shadow-card)]">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="font-semibold">Recent quotes</h2>
          <Link to="/quotes" className="text-sm text-primary hover:underline">View all</Link>
        </div>
        {loading ? (
          <div className="p-12 text-center text-sm text-muted-foreground">Loading…</div>
        ) : quotes.length === 0 ? (
          <div className="p-6">
            <EmptyState
              icon={<FileText className="h-6 w-6" />}
              title="No quotes yet"
              body="Create your first professional cleaning quote in under a minute."
              action={<Link to="/quotes/new"><Button><FilePlus2 className="mr-2 h-4 w-4" />Create quote</Button></Link>}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-5 py-3">Quote #</th>
                  <th className="px-5 py-3">Customer</th>
                  <th className="px-5 py-3">Type</th>
                  <th className="px-5 py-3">Total</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {quotes.slice(0, 8).map((q) => (
                  <tr key={q.id} className="border-t border-border hover:bg-muted/50">
                    <td className="px-5 py-3 font-medium">
                      <Link to="/quotes/$id" params={{ id: q.id }} className="hover:underline">{q.quote_number}</Link>
                    </td>
                    <td className="px-5 py-3">{q.customers?.full_name ?? "—"}</td>
                    <td className="px-5 py-3">{cleaningTypeLabel(q.cleaning_type as CleaningType)}</td>
                    <td className="px-5 py-3 font-medium">{formatMoney(q.total, currency)}</td>
                    <td className="px-5 py-3"><StatusBadge status={q.status} /></td>
                    <td className="px-5 py-3 text-muted-foreground">{format(new Date(q.created_at), "d MMM yyyy")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
