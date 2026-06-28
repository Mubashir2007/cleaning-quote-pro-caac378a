import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { PageHeader, StatusBadge, EmptyState } from "@/components/app-ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FilePlus2, FileText, Search, Eye, Copy, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { formatMoney, cleaningTypeLabel, type CleaningType } from "@/lib/pricing";
import type { Tables } from "@/integrations/supabase/types";

export const Route = createFileRoute("/_authenticated/quotes/")({
  component: QuotesListPage,
});

type Q = Tables<"quotes"> & { customers: { full_name: string } | null };
type Status = "all" | "pending" | "accepted" | "rejected" | "completed";

function QuotesListPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<Q[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<Status>("all");
  const [currency, setCurrency] = useState("GBP");

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("quotes").select("*, customers(full_name)").order("created_at", { ascending: false });
    setItems((data as Q[]) ?? []);
    setLoading(false);
  };
  useEffect(() => {
    if (!user) return;
    load();
    supabase.from("profiles").select("currency").eq("id", user.id).maybeSingle().then(({ data }) => {
      if (data?.currency) setCurrency(data.currency);
    });
  }, [user]);

  const filtered = items.filter((i) => {
    if (status !== "all" && i.status !== status) return false;
    if (q && !`${i.quote_number} ${i.customers?.full_name ?? ""}`.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  const duplicate = async (row: Q) => {
    if (!user) return;
    const { id, quote_number, created_at, updated_at, customers, ...rest } = row;
    void id; void quote_number; void created_at; void updated_at; void customers;
    const { error } = await supabase.from("quotes").insert({ ...rest, status: "pending" });
    if (error) return toast.error(error.message);
    toast.success("Quote duplicated");
    load();
  };
  const remove = async (id: string) => {
    const { error } = await supabase.from("quotes").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    load();
  };
  const changeStatus = async (id: string, newStatus: "pending" | "accepted" | "rejected" | "completed") => {
    const { error } = await supabase.from("quotes").update({ status: newStatus }).eq("id", id);
    if (error) return toast.error(error.message);
    load();
  };

  return (
    <>
      <PageHeader title="Quotes" subtitle="All your quotations" action={
        <Link to="/quotes/new"><Button><FilePlus2 className="mr-2 h-4 w-4" />New quote</Button></Link>
      } />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative max-w-sm flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e)=>setQ(e.target.value)} placeholder="Search by number or customer…" className="pl-9" />
        </div>
        <Select value={status} onValueChange={(v) => setStatus(v as Status)}>
          <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="accepted">Accepted</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-2xl border border-border bg-card shadow-[var(--shadow-card)]">
        {loading ? (
          <div className="p-12 text-center text-sm text-muted-foreground">Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="p-6"><EmptyState icon={<FileText className="h-6 w-6" />}
            title={items.length === 0 ? "No quotes yet" : "No matches"}
            body={items.length === 0 ? "Create your first quote to get started." : "Try different filters."}
            action={items.length === 0 ? <Link to="/quotes/new"><Button><FilePlus2 className="mr-2 h-4 w-4" />New quote</Button></Link> : null}
          /></div>
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
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((row) => (
                  <tr key={row.id} className="border-t border-border hover:bg-muted/50">
                    <td className="px-5 py-3 font-medium">{row.quote_number}</td>
                    <td className="px-5 py-3">{row.customers?.full_name ?? "—"}</td>
                    <td className="px-5 py-3">{cleaningTypeLabel(row.cleaning_type as CleaningType)}</td>
                    <td className="px-5 py-3 font-medium">{formatMoney(row.total, currency)}</td>
                    <td className="px-5 py-3">
                      <Select value={row.status} onValueChange={(v) => changeStatus(row.id, v as "pending" | "accepted" | "rejected" | "completed")}>
                        <SelectTrigger className="h-7 w-32 border-0 bg-transparent p-0 hover:bg-transparent focus:ring-0">
                          <StatusBadge status={row.status} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="accepted">Accepted</SelectItem>
                          <SelectItem value="rejected">Rejected</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">{format(new Date(row.created_at), "d MMM yyyy")}</td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-1">
                        <Link to="/quotes/$id" params={{ id: row.id }}><Button size="icon" variant="ghost"><Eye className="h-4 w-4" /></Button></Link>
                        <Button size="icon" variant="ghost" onClick={() => duplicate(row)}><Copy className="h-4 w-4" /></Button>
                        <Button size="icon" variant="ghost" onClick={() => remove(row.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                      </div>
                    </td>
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
