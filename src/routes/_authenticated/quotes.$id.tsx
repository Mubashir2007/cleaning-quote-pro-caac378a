import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Printer, Pencil, Send, Copy, Check, X } from "lucide-react";
import { format } from "date-fns";
import {
  EXTRA_OPTIONS, cleaningTypeLabel, frequencyLabel, formatMoney,
  type CleaningType, type Frequency, type ExtraKey,
} from "@/lib/pricing";
import type { Tables } from "@/integrations/supabase/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatusBadge } from "@/components/app-ui";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/quotes/$id")({
  component: QuoteDetailPage,
});

type Quote = Tables<"quotes"> & { customers: Tables<"customers"> | null };
type Profile = Tables<"profiles">;

function QuoteDetailPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const [quote, setQuote] = useState<Quote | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("quotes").select("*, customers(*)").eq("id", id).maybeSingle();
    setQuote(data as Quote | null);
    if (data?.user_id) {
      const { data: p } = await supabase.from("profiles").select("*").eq("id", data.user_id).maybeSingle();
      setProfile(p);
    }
    setLoading(false);
  };
  useEffect(() => { load(); }, [id]);

  if (loading) return <div className="text-muted-foreground">Loading…</div>;
  if (!quote) return <div>Quote not found.</div>;

  const currency = profile?.currency ?? "GBP";
  const extras = (quote.extras as unknown as ExtraKey[]) ?? [];

  const updateStatus = async (s: "pending" | "sent" | "accepted" | "rejected" | "completed") => {
    const { error } = await supabase.from("quotes").update({ status: s }).eq("id", quote.id);
    if (error) return toast.error(error.message);
    toast.success("Status updated");
    load();
  };

  const ensureTokens = async () => {
    if (quote.accept_token && quote.reject_token) return { accept: quote.accept_token, reject: quote.reject_token };
    const rand = () => crypto.getRandomValues(new Uint8Array(24)).reduce((s, b) => s + b.toString(16).padStart(2, "0"), "");
    const accept = rand(), reject = rand();
    const { error } = await supabase.from("quotes")
      .update({ accept_token: accept, reject_token: reject, status: "sent", sent_at: new Date().toISOString() })
      .eq("id", quote.id);
    if (error) { toast.error(error.message); return null; }
    await load();
    return { accept, reject };
  };

  const sendToCustomer = async () => {
    if (!quote.customers?.email) return toast.error("Customer has no email address on file.");
    const t = await ensureTokens();
    if (!t) return;
    const base = window.location.origin;
    const acceptUrl = `${base}/q/${t.accept}`;
    const rejectUrl = `${base}/q/${t.reject}`;
    const subject = encodeURIComponent(`Quotation ${quote.quote_number} from ${profile?.company_name ?? "us"}`);
    const body = encodeURIComponent(
`Hi ${quote.customers.full_name},

Please find your quotation ${quote.quote_number} for ${formatMoney(quote.total, currency)}.

Approve the quote: ${acceptUrl}
Decline the quote: ${rejectUrl}

Thank you,
${profile?.company_name ?? ""}`);
    window.location.href = `mailto:${quote.customers.email}?subject=${subject}&body=${body}`;
    toast.success("Quote marked as sent. Your email client is opening.");
  };

  const copyLink = async (kind: "accept" | "reject") => {
    const t = await ensureTokens();
    if (!t) return;
    const url = `${window.location.origin}/q/${kind === "accept" ? t.accept : t.reject}`;
    await navigator.clipboard.writeText(url);
    toast.success(`${kind === "accept" ? "Accept" : "Reject"} link copied`);
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 no-print">
        <Button variant="ghost" onClick={() => navigate({ to: "/quotes" })}>
          <ArrowLeft className="mr-2 h-4 w-4" />Back to quotes
        </Button>
        <div className="flex flex-wrap items-center gap-2">
          <Select value={quote.status} onValueChange={(v) => updateStatus(v as "pending" | "sent" | "accepted" | "rejected" | "completed")}>
            <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="sent">Sent</SelectItem>
              <SelectItem value="accepted">Accepted</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => copyLink("accept")}><Check className="mr-2 h-4 w-4 text-success" />Accept link</Button>
          <Button variant="outline" onClick={() => copyLink("reject")}><X className="mr-2 h-4 w-4 text-destructive" />Reject link</Button>
          <Button onClick={sendToCustomer}><Send className="mr-2 h-4 w-4" />Send to customer</Button>
          <Button variant="outline" onClick={() => window.print()}>
            <Printer className="mr-2 h-4 w-4" />Download PDF
          </Button>
          <Link to="/quotes/new"><Button variant="outline"><Pencil className="mr-2 h-4 w-4" />New quote</Button></Link>
        </div>
      </div>

      {/* Printable quote */}
      <div className="mx-auto max-w-3xl rounded-2xl border border-border bg-card p-8 shadow-[var(--shadow-card)] print:shadow-none print:border-0">
        <div className="flex items-start justify-between border-b border-border pb-6">
          <div>
            {profile?.company_logo_url ? (
              <img src={profile.company_logo_url} alt={profile.company_name} className="mb-2 h-12 object-contain" />
            ) : (
              <div className="mb-2 grid h-12 w-12 place-items-center rounded-xl bg-primary text-lg font-bold text-primary-foreground">
                {profile?.company_name?.[0] ?? "C"}
              </div>
            )}
            <h1 className="text-xl font-bold">{profile?.company_name ?? "Your Company"}</h1>
            {profile?.business_address && <p className="text-sm text-muted-foreground">{profile.business_address}</p>}
            <p className="text-sm text-muted-foreground">
              {[profile?.phone, profile?.email, profile?.website].filter(Boolean).join(" • ")}
            </p>
            {profile?.vat_number && <p className="text-xs text-muted-foreground">VAT: {profile.vat_number}</p>}
          </div>
          <div className="text-right">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">Quotation</div>
            <div className="text-lg font-bold">{quote.quote_number}</div>
            <div className="mt-1 text-sm text-muted-foreground">{format(new Date(quote.created_at), "d MMMM yyyy")}</div>
            <div className="mt-2 no-print"><StatusBadge status={quote.status} /></div>
          </div>
        </div>

        <div className="grid gap-6 py-6 md:grid-cols-2">
          <div>
            <h3 className="text-xs uppercase tracking-wide text-muted-foreground">Bill to</h3>
            <div className="mt-1 font-semibold">{quote.customers?.full_name}</div>
            {quote.customers?.address && <div className="text-sm text-muted-foreground">{quote.customers.address}</div>}
            <div className="text-sm text-muted-foreground">{[quote.customers?.city, quote.customers?.postcode].filter(Boolean).join(", ")}</div>
            {quote.customers?.phone && <div className="text-sm text-muted-foreground">{quote.customers.phone}</div>}
            {quote.customers?.email && <div className="text-sm text-muted-foreground">{quote.customers.email}</div>}
          </div>
          <div>
            <h3 className="text-xs uppercase tracking-wide text-muted-foreground">Cleaning details</h3>
            <div className="mt-1 text-sm">{cleaningTypeLabel(quote.cleaning_type as CleaningType)}</div>
            <div className="text-sm text-muted-foreground">Frequency: {frequencyLabel(quote.frequency as Frequency)}</div>
            <div className="text-sm text-muted-foreground">
              {quote.bedrooms} bed • {quote.bathrooms} bath • {quote.living_rooms} living
              {quote.square_footage ? ` • ${quote.square_footage} sqft` : ""}
            </div>
          </div>
        </div>

        <div className="border-t border-border pt-6">
          <h3 className="text-xs uppercase tracking-wide text-muted-foreground">Breakdown</h3>
          <table className="mt-2 w-full text-sm">
            <tbody>
              <Line label="Base price" value={formatMoney(quote.base_price, currency)} />
              {Number(quote.bedroom_extra_total) > 0 && <Line label={`Extra bedrooms (${quote.bedrooms - 1})`} value={formatMoney(quote.bedroom_extra_total, currency)} />}
              {Number(quote.bathroom_extra_total) > 0 && <Line label={`Extra bathrooms (${quote.bathrooms - 1})`} value={formatMoney(quote.bathroom_extra_total, currency)} />}
              {Number(quote.living_room_total) > 0 && <Line label={`Extra living rooms (${quote.living_rooms - 1})`} value={formatMoney(quote.living_room_total, currency)} />}
              {extras.map((k) => {
                const opt = EXTRA_OPTIONS.find((o) => o.key === k);
                return <Line key={k} label={opt?.label ?? k} value="" />;
              })}
              {Number(quote.extras_total) > 0 && <Line label="Extras subtotal" value={formatMoney(quote.extras_total, currency)} />}
              {Number(quote.discount_amount) > 0 && <Line label="Discount" value={`− ${formatMoney(quote.discount_amount, currency)}`} />}
              {Number(quote.tax_amount) > 0 && <Line label="Tax" value={formatMoney(quote.tax_amount, currency)} />}
            </tbody>
          </table>

          <div className="mt-6 flex items-center justify-between rounded-xl bg-primary px-6 py-5 text-primary-foreground">
            <span className="text-sm uppercase tracking-wide opacity-80">Total</span>
            <span className="text-3xl font-bold">{formatMoney(quote.total, currency)}</span>
          </div>
        </div>

        {(quote.notes || profile?.default_notes) && (
          <div className="mt-6 border-t border-border pt-6">
            <h3 className="text-xs uppercase tracking-wide text-muted-foreground">Notes</h3>
            <p className="mt-1 whitespace-pre-line text-sm">{quote.notes || profile?.default_notes}</p>
          </div>
        )}
        {profile?.terms_and_conditions && (
          <div className="mt-6 border-t border-border pt-6">
            <h3 className="text-xs uppercase tracking-wide text-muted-foreground">Terms & conditions</h3>
            <p className="mt-1 whitespace-pre-line text-xs text-muted-foreground">{profile.terms_and_conditions}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function Line({ label, value }: { label: string; value: string }) {
  return (
    <tr className="border-b border-border/50 last:border-0">
      <td className="py-2 text-muted-foreground">{label}</td>
      <td className="py-2 text-right font-medium">{value}</td>
    </tr>
  );
}
