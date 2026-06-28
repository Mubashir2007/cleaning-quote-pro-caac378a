import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { PageHeader } from "@/components/app-ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";

export const Route = createFileRoute("/_authenticated/settings")({
  component: SettingsPage,
});

type Profile = Tables<"profiles">;
type Pricing = Tables<"pricing_settings">;

function SettingsPage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [pricing, setPricing] = useState<Pricing | null>(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [p, pr] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
        supabase.from("pricing_settings").select("*").eq("user_id", user.id).maybeSingle(),
      ]);
      setProfile(p.data); setPricing(pr.data);
    })();
  }, [user]);

  return (
    <>
      <PageHeader title="Settings" subtitle="Company profile and pricing rules" />
      <Tabs defaultValue="profile">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="profile">Company profile</TabsTrigger>
          <TabsTrigger value="pricing">Pricing</TabsTrigger>
        </TabsList>
        <TabsContent value="profile" className="mt-6">
          {profile && <ProfileForm profile={profile} onSaved={setProfile} />}
        </TabsContent>
        <TabsContent value="pricing" className="mt-6">
          {pricing && <PricingForm pricing={pricing} onSaved={setPricing} />}
        </TabsContent>
      </Tabs>
    </>
  );
}

function ProfileForm({ profile, onSaved }: { profile: Profile; onSaved: (p: Profile) => void }) {
  const [f, setF] = useState(profile);
  const [busy, setBusy] = useState(false);
  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { data, error } = await supabase.from("profiles").update({
      company_name: f.company_name, company_logo_url: f.company_logo_url,
      phone: f.phone, email: f.email, website: f.website,
      business_address: f.business_address, vat_number: f.vat_number,
      currency: f.currency, default_notes: f.default_notes,
      terms_and_conditions: f.terms_and_conditions,
    }).eq("id", profile.id).select("*").single();
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Profile saved");
    onSaved(data);
  };
  return (
    <form onSubmit={save} className="grid gap-4 rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)] md:grid-cols-2">
      <Fld label="Company name" value={f.company_name} onChange={(v) => setF({ ...f, company_name: v })} className="md:col-span-2" />
      <Fld label="Company logo URL" value={f.company_logo_url ?? ""} onChange={(v) => setF({ ...f, company_logo_url: v })} className="md:col-span-2" />
      <Fld label="Phone" value={f.phone ?? ""} onChange={(v) => setF({ ...f, phone: v })} />
      <Fld label="Email" value={f.email ?? ""} onChange={(v) => setF({ ...f, email: v })} />
      <Fld label="Website" value={f.website ?? ""} onChange={(v) => setF({ ...f, website: v })} />
      <Fld label="VAT number" value={f.vat_number ?? ""} onChange={(v) => setF({ ...f, vat_number: v })} />
      <Fld label="Business address" value={f.business_address ?? ""} onChange={(v) => setF({ ...f, business_address: v })} className="md:col-span-2" />
      <div className="space-y-1.5">
        <Label>Currency</Label>
        <Select value={f.currency} onValueChange={(v) => setF({ ...f, currency: v })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="GBP">GBP (£)</SelectItem>
            <SelectItem value="USD">USD ($)</SelectItem>
            <SelectItem value="EUR">EUR (€)</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="md:col-span-2 space-y-1.5">
        <Label>Default quote notes</Label>
        <Textarea rows={3} value={f.default_notes ?? ""} onChange={(e) => setF({ ...f, default_notes: e.target.value })} />
      </div>
      <div className="md:col-span-2 space-y-1.5">
        <Label>Terms & conditions</Label>
        <Textarea rows={4} value={f.terms_and_conditions ?? ""} onChange={(e) => setF({ ...f, terms_and_conditions: e.target.value })} />
      </div>
      <div className="md:col-span-2"><Button type="submit" disabled={busy}>{busy ? "Saving…" : "Save profile"}</Button></div>
    </form>
  );
}

function PricingForm({ pricing, onSaved }: { pricing: Pricing; onSaved: (p: Pricing) => void }) {
  const [f, setF] = useState(pricing);
  const [busy, setBusy] = useState(false);
  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { user_id, created_at, updated_at, ...patch } = f;
    void user_id; void created_at; void updated_at;
    const { data, error } = await supabase.from("pricing_settings").update(patch).eq("user_id", pricing.user_id).select("*").single();
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Pricing saved");
    onSaved(data);
  };
  const num = (k: keyof Pricing, label: string) => (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Input type="number" step="0.01" value={String(f[k] ?? 0)}
        onChange={(e) => setF({ ...f, [k]: e.target.value as never })} />
    </div>
  );
  return (
    <form onSubmit={save} className="space-y-6 rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
      <Section title="Base prices">
        <div className="grid gap-4 md:grid-cols-3">
          {num("regular_base", "Regular Cleaning")}
          {num("deep_base", "Deep Cleaning")}
          {num("end_of_tenancy_base", "End of Tenancy")}
          {num("office_base", "Office Cleaning")}
          {num("airbnb_base", "Airbnb Cleaning")}
        </div>
      </Section>
      <Section title="Per-room extras">
        <div className="grid gap-4 md:grid-cols-3">
          {num("extra_bedroom", "Extra Bedroom")}
          {num("extra_bathroom", "Extra Bathroom")}
          {num("extra_living_room", "Living Room")}
        </div>
      </Section>
      <Section title="Add-on services">
        <div className="grid gap-4 md:grid-cols-3">
          {num("oven_cleaning", "Oven Cleaning")}
          {num("fridge_cleaning", "Fridge Cleaning")}
          {num("carpet_cleaning", "Carpet Cleaning")}
          {num("window_cleaning", "Window Cleaning")}
          {num("balcony", "Balcony")}
          {num("inside_cabinets", "Inside Cabinets")}
          {num("garage", "Garage")}
        </div>
      </Section>
      <Section title="Discount & tax">
        <div className="grid gap-4 md:grid-cols-2">
          {num("discount_pct", "Discount %")}
          {num("tax_pct", "Tax %")}
        </div>
      </Section>
      <Button type="submit" disabled={busy}>{busy ? "Saving…" : "Save pricing"}</Button>
    </form>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (<div><h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">{title}</h3>{children}</div>);
}

function Fld({ label, value, onChange, className = "" }: { label: string; value: string; onChange: (v: string) => void; className?: string }) {
  return (<div className={`space-y-1.5 ${className}`}><Label>{label}</Label><Input value={value} onChange={(e) => onChange(e.target.value)} /></div>);
}
