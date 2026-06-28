import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { PageHeader } from "@/components/app-ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, Check, UserPlus } from "lucide-react";
import {
  CLEANING_TYPES, FREQUENCIES, EXTRA_OPTIONS, calculateQuote,
  formatMoney, type CleaningType, type Frequency, type ExtraKey,
} from "@/lib/pricing";
import type { Tables } from "@/integrations/supabase/types";

export const Route = createFileRoute("/_authenticated/quotes/new")({
  component: NewQuotePage,
});

type Customer = Tables<"customers">;
type Pricing = Tables<"pricing_settings">;

const STEPS = ["Customer", "Cleaning Type", "Property", "Extras", "Price"] as const;

function NewQuotePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [pricing, setPricing] = useState<Pricing | null>(null);
  const [currency, setCurrency] = useState("GBP");

  const [customerId, setCustomerId] = useState<string>("");
  const [cleaningType, setCleaningType] = useState<CleaningType>("regular");
  const [bedrooms, setBedrooms] = useState(2);
  const [bathrooms, setBathrooms] = useState(1);
  const [livingRooms, setLivingRooms] = useState(1);
  const [sqft, setSqft] = useState<string>("");
  const [frequency, setFrequency] = useState<Frequency>("one_time");
  const [extras, setExtras] = useState<ExtraKey[]>([]);
  const [notes, setNotes] = useState("");

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [c, p, prof] = await Promise.all([
        supabase.from("customers").select("*").order("full_name"),
        supabase.from("pricing_settings").select("*").eq("user_id", user.id).maybeSingle(),
        supabase.from("profiles").select("currency").eq("id", user.id).maybeSingle(),
      ]);
      setCustomers(c.data ?? []);
      setPricing(p.data);
      if (prof.data?.currency) setCurrency(prof.data.currency);
    })();
  }, [user]);

  const breakdown = useMemo(() => {
    if (!pricing) return null;
    return calculateQuote({
      cleaning_type: cleaningType, bedrooms, bathrooms, living_rooms: livingRooms, frequency, extras,
    }, pricing);
  }, [pricing, cleaningType, bedrooms, bathrooms, livingRooms, frequency, extras]);

  const canNext = () => {
    if (step === 0) return !!customerId;
    return true;
  };

  const save = async () => {
    if (!user || !pricing || !breakdown) return;
    if (!customerId) return toast.error("Pick a customer");
    setSaving(true);
    const { data, error } = await supabase.from("quotes").insert({
      user_id: user.id,
      customer_id: customerId,
      cleaning_type: cleaningType,
      bedrooms, bathrooms, living_rooms: livingRooms,
      square_footage: sqft ? Number(sqft) : null,
      frequency,
      extras: extras as unknown as never,
      base_price: breakdown.base_price,
      bedroom_extra_total: breakdown.bedroom_extra_total,
      bathroom_extra_total: breakdown.bathroom_extra_total,
      living_room_total: breakdown.living_room_total,
      extras_total: breakdown.extras_total,
      discount_amount: breakdown.discount_amount,
      tax_amount: breakdown.tax_amount,
      total: breakdown.total,
      notes: notes || null,
    }).select("id").single();
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Quote created");
    navigate({ to: "/quotes/$id", params: { id: data.id } });
  };

  return (
    <>
      <PageHeader title="New quote" subtitle="Generate a quotation in under a minute" />

      {/* Stepper */}
      <ol className="mb-8 flex flex-wrap items-center gap-2 text-sm">
        {STEPS.map((s, i) => (
          <li key={s} className="flex items-center gap-2">
            <span className={`grid h-7 w-7 place-items-center rounded-full text-xs font-semibold ${i <= step ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
              {i < step ? <Check className="h-4 w-4" /> : i + 1}
            </span>
            <span className={i === step ? "font-medium" : "text-muted-foreground"}>{s}</span>
            {i < STEPS.length - 1 && <span className="mx-2 text-muted-foreground">›</span>}
          </li>
        ))}
      </ol>

      <div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)] md:p-8">
        {step === 0 && (
          <StepCustomer customers={customers} value={customerId} onChange={setCustomerId} onCreated={(c) => { setCustomers((cs) => [c, ...cs]); setCustomerId(c.id); }} />
        )}
        {step === 1 && (
          <div className="max-w-md space-y-3">
            <Label>Cleaning type</Label>
            <Select value={cleaningType} onValueChange={(v) => setCleaningType(v as CleaningType)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{CLEANING_TYPES.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        )}
        {step === 2 && (
          <div className="grid gap-4 md:grid-cols-2">
            <NumberField label="Bedrooms" value={bedrooms} onChange={setBedrooms} min={1} />
            <NumberField label="Bathrooms" value={bathrooms} onChange={setBathrooms} min={1} />
            <NumberField label="Living Rooms" value={livingRooms} onChange={setLivingRooms} min={1} />
            <div className="space-y-1.5">
              <Label>Square Footage (optional)</Label>
              <Input type="number" value={sqft} onChange={(e) => setSqft(e.target.value)} />
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <Label>Frequency</Label>
              <Select value={frequency} onValueChange={(v) => setFrequency(v as Frequency)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{FREQUENCIES.map((f) => <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
        )}
        {step === 3 && (
          <div className="grid gap-3 md:grid-cols-2">
            {EXTRA_OPTIONS.map((opt) => {
              const checked = extras.includes(opt.key);
              const price = pricing ? Number(pricing[opt.key as keyof Pricing] ?? 0) : 0;
              return (
                <label key={opt.key}
                  className={`flex cursor-pointer items-center justify-between gap-3 rounded-xl border p-4 transition ${checked ? "border-primary bg-accent/40" : "border-border hover:bg-muted/50"}`}>
                  <div className="flex items-center gap-3">
                    <Checkbox checked={checked} onCheckedChange={(v) => {
                      setExtras((cur) => v ? [...cur, opt.key] : cur.filter((k) => k !== opt.key));
                    }} />
                    <span className="font-medium">{opt.label}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">{formatMoney(price, currency)}</span>
                </label>
              );
            })}
            <div className="md:col-span-2 space-y-1.5">
              <Label>Quote notes (optional)</Label>
              <Textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>
          </div>
        )}
        {step === 4 && breakdown && (
          <div>
            <h3 className="text-lg font-semibold">Price breakdown</h3>
            <div className="mt-4 space-y-2 rounded-xl border border-border bg-muted/30 p-5 text-sm">
              <Row label="Base price" value={formatMoney(breakdown.base_price, currency)} />
              {breakdown.bedroom_extra_total > 0 && <Row label="Extra bedrooms" value={formatMoney(breakdown.bedroom_extra_total, currency)} />}
              {breakdown.bathroom_extra_total > 0 && <Row label="Extra bathrooms" value={formatMoney(breakdown.bathroom_extra_total, currency)} />}
              {breakdown.living_room_total > 0 && <Row label="Extra living rooms" value={formatMoney(breakdown.living_room_total, currency)} />}
              {breakdown.extra_line_items.map((e) => <Row key={e.key} label={e.label} value={formatMoney(e.price, currency)} />)}
              {breakdown.discount_amount > 0 && <Row label="Discount" value={`− ${formatMoney(breakdown.discount_amount, currency)}`} />}
              {breakdown.tax_amount > 0 && <Row label="Tax" value={formatMoney(breakdown.tax_amount, currency)} />}
            </div>
            <div className="mt-6 flex items-center justify-between rounded-xl bg-primary px-6 py-5 text-primary-foreground">
              <span className="text-sm uppercase tracking-wide opacity-80">Final total</span>
              <span className="text-4xl font-bold">{formatMoney(breakdown.total, currency)}</span>
            </div>
          </div>
        )}

        <div className="mt-8 flex items-center justify-between">
          <Button variant="ghost" disabled={step === 0} onClick={() => setStep((s) => Math.max(0, s - 1))}>
            <ArrowLeft className="mr-2 h-4 w-4" />Back
          </Button>
          {step < STEPS.length - 1 ? (
            <Button disabled={!canNext()} onClick={() => setStep((s) => s + 1)}>
              Next<ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={save} disabled={saving}>{saving ? "Saving…" : "Create quote"}</Button>
          )}
        </div>
      </div>
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return <div className="flex justify-between"><span className="text-muted-foreground">{label}</span><span className="font-medium">{value}</span></div>;
}

function NumberField({ label, value, onChange, min = 0 }: { label: string; value: number; onChange: (n: number) => void; min?: number }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Input type="number" min={min} value={value} onChange={(e) => onChange(Math.max(min, Number(e.target.value) || 0))} />
    </div>
  );
}

function StepCustomer({ customers, value, onChange, onCreated }: {
  customers: Customer[]; value: string; onChange: (id: string) => void; onCreated: (c: Customer) => void;
}) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ full_name: "", phone: "", email: "", address: "", city: "", postcode: "" });
  const [busy, setBusy] = useState(false);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!form.full_name.trim()) return toast.error("Name required");
    setBusy(true);
    const { data, error } = await supabase.from("customers").insert({ ...form, user_id: user.id }).select("*").single();
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Customer added");
    onCreated(data as Customer);
    setOpen(false);
    setForm({ full_name: "", phone: "", email: "", address: "", city: "", postcode: "" });
  };

  return (
    <div className="max-w-md space-y-4">
      <div className="space-y-1.5">
        <Label>Select customer</Label>
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger><SelectValue placeholder={customers.length ? "Choose a customer…" : "No customers yet"} /></SelectTrigger>
          <SelectContent>{customers.map((c) => <SelectItem key={c.id} value={c.id}>{c.full_name}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      <div className="text-center text-sm text-muted-foreground">or</div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild><Button variant="outline" className="w-full"><UserPlus className="mr-2 h-4 w-4" />Create new customer</Button></DialogTrigger>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>New customer</DialogTitle></DialogHeader>
          <form onSubmit={create} className="grid grid-cols-2 gap-3">
            <div className="col-span-2 space-y-1.5"><Label>Full name *</Label><Input required value={form.full_name} onChange={(e)=>setForm({...form, full_name:e.target.value})} /></div>
            <div className="space-y-1.5"><Label>Phone</Label><Input value={form.phone} onChange={(e)=>setForm({...form, phone:e.target.value})} /></div>
            <div className="space-y-1.5"><Label>Email</Label><Input type="email" value={form.email} onChange={(e)=>setForm({...form, email:e.target.value})} /></div>
            <div className="col-span-2 space-y-1.5"><Label>Address</Label><Input value={form.address} onChange={(e)=>setForm({...form, address:e.target.value})} /></div>
            <div className="space-y-1.5"><Label>City</Label><Input value={form.city} onChange={(e)=>setForm({...form, city:e.target.value})} /></div>
            <div className="space-y-1.5"><Label>Postcode</Label><Input value={form.postcode} onChange={(e)=>setForm({...form, postcode:e.target.value})} /></div>
            <DialogFooter className="col-span-2"><Button type="submit" disabled={busy}>{busy ? "Saving…" : "Add customer"}</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
