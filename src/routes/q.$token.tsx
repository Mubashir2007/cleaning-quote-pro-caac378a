import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, X, Loader2, ShieldCheck } from "lucide-react";
import { format } from "date-fns";
import { getQuoteByToken, actOnQuoteByToken } from "@/lib/quote-token.functions";

export const Route = createFileRoute("/q/$token")({
  component: QuoteReviewPage,
  head: () => ({ meta: [{ title: "Review your quote" }, { name: "robots", content: "noindex" }] }),
});

type QuoteInfo = {
  quote_number: string;
  status: "pending" | "sent" | "accepted" | "rejected" | "completed";
  total: number;
  currency: string;
  company_name: string;
  customer_name: string;
  accepted_at: string | null;
  rejected_at: string | null;
  action: "accept" | "reject";
};

function money(v: number, ccy: string) {
  try { return new Intl.NumberFormat("en-GB", { style: "currency", currency: ccy }).format(Number(v)); }
  catch { return `${ccy} ${Number(v).toFixed(2)}`; }
}

function QuoteReviewPage() {
  const { token } = Route.useParams();
  const [info, setInfo] = useState<QuoteInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const row = await getQuoteByToken({ data: { token } });
        if (!row) setError("This link is invalid or has expired.");
        else setInfo(row as QuoteInfo);
      } catch (e: any) {
        setError(e?.message ?? "Failed to load quote.");
      }
      setLoading(false);
    })();
  }, [token]);

  const submit = async (action: "accept" | "reject") => {
    setSubmitting(true);
    try {
      const row = await actOnQuoteByToken({ data: { token, action } });
      if (row) setInfo({ ...info!, ...(row as Partial<QuoteInfo>) });
      setDone(true);
    } catch (e: any) {
      setError(e?.message ?? "Failed to submit.");
    }
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-background text-foreground">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !info) {
    return (
      <div className="grid min-h-screen place-items-center bg-background px-4 text-foreground">
        <div className="max-w-md rounded-2xl border border-border bg-card p-8 text-center shadow-lg">
          <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-xl bg-destructive/10 text-destructive"><X className="h-6 w-6" /></div>
          <h1 className="text-xl font-semibold">Link unavailable</h1>
          <p className="mt-2 text-sm text-muted-foreground">{error ?? "Please contact the sender for a new link."}</p>
        </div>
      </div>
    );
  }

  const finalized = info.status === "accepted" || info.status === "rejected" || info.status === "completed";

  return (
    <div className="min-h-screen bg-background px-4 py-10 text-foreground">
      <div className="mx-auto max-w-lg rounded-2xl border border-border bg-card p-8 shadow-lg">
        <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
          <ShieldCheck className="h-4 w-4" /> Secure quote review
        </div>
        <h1 className="mt-2 text-2xl font-bold">{info.company_name}</h1>
        <p className="mt-1 text-sm text-muted-foreground">Quotation <span className="font-medium text-foreground">{info.quote_number}</span></p>

        <div className="my-6 rounded-xl bg-muted/50 p-5">
          <div className="text-xs uppercase tracking-wide text-muted-foreground">Prepared for</div>
          <div className="mt-1 font-medium">{info.customer_name}</div>
          <div className="mt-4 text-xs uppercase tracking-wide text-muted-foreground">Total</div>
          <div className="text-3xl font-bold">{money(info.total, info.currency)}</div>
        </div>

        {finalized ? (
          <div className="rounded-xl border border-border p-5 text-center">
            {info.status === "accepted" ? (
              <>
                <div className="mx-auto mb-2 grid h-10 w-10 place-items-center rounded-full bg-success/15 text-success"><Check className="h-5 w-5" /></div>
                <div className="font-semibold text-success">Quote accepted</div>
                {info.accepted_at && <div className="mt-1 text-xs text-muted-foreground">on {format(new Date(info.accepted_at), "d MMM yyyy, HH:mm")}</div>}
              </>
            ) : info.status === "rejected" ? (
              <>
                <div className="mx-auto mb-2 grid h-10 w-10 place-items-center rounded-full bg-destructive/10 text-destructive"><X className="h-5 w-5" /></div>
                <div className="font-semibold text-destructive">Quote declined</div>
                {info.rejected_at && <div className="mt-1 text-xs text-muted-foreground">on {format(new Date(info.rejected_at), "d MMM yyyy, HH:mm")}</div>}
              </>
            ) : (
              <div className="font-semibold">Quote already finalised.</div>
            )}
            <p className="mt-3 text-sm text-muted-foreground">Thank you — {info.company_name} has been notified.</p>
          </div>
        ) : done ? (
          <div className="rounded-xl border border-border p-5 text-center text-sm text-muted-foreground">Saving your response…</div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {info.action === "accept" ? (
              <Button size="lg" className="bg-success text-white hover:bg-success/90" disabled={submitting} onClick={() => submit("accept")}>
                <Check className="mr-2 h-4 w-4" />Accept quote
              </Button>
            ) : (
              <Button size="lg" variant="destructive" disabled={submitting} onClick={() => submit("reject")}>
                <X className="mr-2 h-4 w-4" />Decline quote
              </Button>
            )}
            <div className="grid place-items-center text-xs text-muted-foreground">
              By clicking, you confirm this decision on behalf of {info.customer_name}.
            </div>
          </div>
        )}

        <p className="mt-6 text-center text-xs text-muted-foreground">This link is unique and can only be used once.</p>
      </div>
    </div>
  );
}
