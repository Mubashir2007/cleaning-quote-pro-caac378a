import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { PageHeader, EmptyState } from "@/components/app-ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { UserPlus, Users, Pencil, Trash2, Search } from "lucide-react";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";

export const Route = createFileRoute("/_authenticated/customers")({
  component: CustomersPage,
});

type Customer = Tables<"customers">;

const emptyForm = { full_name: "", phone: "", email: "", address: "", city: "", postcode: "", notes: "" };

function CustomersPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Customer | null>(null);
  const [form, setForm] = useState(emptyForm);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("customers").select("*").order("created_at", { ascending: false });
    setItems(data ?? []);
    setLoading(false);
  };
  useEffect(() => { if (user) load(); }, [user]);

  const filtered = items.filter((c) =>
    [c.full_name, c.email, c.phone, c.city, c.postcode].some((v) => v?.toLowerCase().includes(q.toLowerCase()))
  );

  const openNew = () => { setEditing(null); setForm(emptyForm); setOpen(true); };
  const openEdit = (c: Customer) => {
    setEditing(c);
    setForm({
      full_name: c.full_name, phone: c.phone ?? "", email: c.email ?? "",
      address: c.address ?? "", city: c.city ?? "", postcode: c.postcode ?? "", notes: c.notes ?? "",
    });
    setOpen(true);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!form.full_name.trim()) return toast.error("Full name is required");
    const payload = { ...form, user_id: user.id };
    const { error } = editing
      ? await supabase.from("customers").update(payload).eq("id", editing.id)
      : await supabase.from("customers").insert(payload);
    if (error) return toast.error(error.message);
    toast.success(editing ? "Customer updated" : "Customer created");
    setOpen(false);
    load();
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("customers").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Customer deleted");
    load();
  };

  return (
    <>
      <PageHeader
        title="Customers"
        subtitle="Manage your customer database"
        action={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button onClick={openNew}><UserPlus className="mr-2 h-4 w-4" />New customer</Button></DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader><DialogTitle>{editing ? "Edit customer" : "New customer"}</DialogTitle></DialogHeader>
              <form onSubmit={save} className="grid grid-cols-2 gap-3">
                <Field className="col-span-2" label="Full name *"><Input required value={form.full_name} onChange={(e)=>setForm({...form, full_name:e.target.value})} /></Field>
                <Field label="Phone"><Input value={form.phone} onChange={(e)=>setForm({...form, phone:e.target.value})} /></Field>
                <Field label="Email"><Input type="email" value={form.email} onChange={(e)=>setForm({...form, email:e.target.value})} /></Field>
                <Field className="col-span-2" label="Address"><Input value={form.address} onChange={(e)=>setForm({...form, address:e.target.value})} /></Field>
                <Field label="City"><Input value={form.city} onChange={(e)=>setForm({...form, city:e.target.value})} /></Field>
                <Field label="Postcode"><Input value={form.postcode} onChange={(e)=>setForm({...form, postcode:e.target.value})} /></Field>
                <Field className="col-span-2" label="Notes"><Textarea value={form.notes} onChange={(e)=>setForm({...form, notes:e.target.value})} rows={3} /></Field>
                <DialogFooter className="col-span-2"><Button type="submit">{editing ? "Save changes" : "Create customer"}</Button></DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="mb-4 flex items-center gap-3">
        <div className="relative max-w-sm flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e)=>setQ(e.target.value)} placeholder="Search by name, email, city…" className="pl-9" />
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card shadow-[var(--shadow-card)]">
        {loading ? (
          <div className="p-12 text-center text-sm text-muted-foreground">Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="p-6">
            <EmptyState icon={<Users className="h-6 w-6" />} title={items.length === 0 ? "No customers yet" : "No matches"}
              body={items.length === 0 ? "Add your first customer to start quoting." : "Try a different search term."}
              action={items.length === 0 ? <Button onClick={openNew}><UserPlus className="mr-2 h-4 w-4" />Add customer</Button> : null} />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-5 py-3">Name</th>
                  <th className="px-5 py-3">Contact</th>
                  <th className="px-5 py-3">Location</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c.id} className="border-t border-border hover:bg-muted/50">
                    <td className="px-5 py-3 font-medium">{c.full_name}</td>
                    <td className="px-5 py-3 text-muted-foreground">
                      {c.email && <div>{c.email}</div>}
                      {c.phone && <div>{c.phone}</div>}
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">{[c.city, c.postcode].filter(Boolean).join(", ") || "—"}</td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={()=>openEdit(c)}><Pencil className="h-4 w-4" /></Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild><Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-destructive" /></Button></AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader><AlertDialogTitle>Delete {c.full_name}?</AlertDialogTitle>
                              <AlertDialogDescription>This cannot be undone. Quotes linked to this customer will block deletion.</AlertDialogDescription></AlertDialogHeader>
                            <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={()=>remove(c.id)}>Delete</AlertDialogAction></AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
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

function Field({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      <Label>{label}</Label>
      {children}
    </div>
  );
}
