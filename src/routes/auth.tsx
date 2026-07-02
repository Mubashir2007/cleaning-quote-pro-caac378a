import { createFileRoute, Navigate, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";

const searchSchema = z.object({
  mode: z.enum(["login", "signup", "forgot"]).optional(),
});

export const Route = createFileRoute("/auth")({
  ssr: false,
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Sign in — Cleaning Quote Pro" },
      { name: "description", content: "Log in or create a Cleaning Quote Pro account to start generating professional cleaning quotations." },
      { property: "og:title", content: "Sign in — Cleaning Quote Pro" },
      { property: "og:description", content: "Log in or create a Cleaning Quote Pro account to start quoting jobs in minutes." },
      { property: "og:url", content: "https://free-speed-quoate.lovable.app/auth" },
      { name: "robots", content: "noindex" },
    ],
    links: [{ rel: "canonical", href: "https://free-speed-quoate.lovable.app/auth" }],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { user, loading } = useAuth();
  const { mode } = Route.useSearch();
  if (loading) return null;
  if (user) return <Navigate to="/dashboard" />;

  return (
    <div className="grid min-h-screen md:grid-cols-2">
      <div className="hidden bg-sidebar p-12 text-sidebar-foreground md:flex md:flex-col md:justify-between">
        <div className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-sidebar-primary text-sidebar-primary-foreground">
            <Sparkles className="h-5 w-5" />
          </div>
          <span className="font-semibold">Cleaning Quote Pro</span>
        </div>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Win more jobs.</h2>
          <p className="mt-3 max-w-sm text-sm opacity-80">
            Generate beautiful, professional cleaning quotes in under a minute — fully branded with your company details.
          </p>
        </div>
        <p className="text-xs opacity-60">© Cleaning Quote Pro</p>
      </div>

      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <Tabs defaultValue={mode === "signup" ? "signup" : mode === "forgot" ? "forgot" : "login"}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="login">Log in</TabsTrigger>
              <TabsTrigger value="signup">Sign up</TabsTrigger>
              <TabsTrigger value="forgot">Forgot</TabsTrigger>
            </TabsList>
            <TabsContent value="login"><LoginForm /></TabsContent>
            <TabsContent value="signup"><SignupForm /></TabsContent>
            <TabsContent value="forgot"><ForgotForm /></TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

function LoginForm() {
  const [email, setEmail] = useState(""); const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Welcome back!");
    navigate({ to: "/dashboard" });
  };
  return (
    <form onSubmit={onSubmit} className="mt-6 space-y-4">
      <h1 className="text-2xl font-semibold">Welcome back</h1>
      <div className="space-y-2"><Label htmlFor="le">Email</Label>
        <Input id="le" type="email" required value={email} onChange={(e)=>setEmail(e.target.value)} /></div>
      <div className="space-y-2"><Label htmlFor="lp">Password</Label>
        <Input id="lp" type="password" required value={password} onChange={(e)=>setPassword(e.target.value)} /></div>
      <Button type="submit" disabled={busy} className="w-full">{busy ? "Signing in…" : "Log in"}</Button>
    </form>
  );
}

function SignupForm() {
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState(""); const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) return toast.error("Password must be at least 6 characters");
    setBusy(true);
    const { error } = await supabase.auth.signUp({
      email, password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
        data: { company_name: company || "My Cleaning Company" },
      },
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Account created!");
    navigate({ to: "/dashboard" });
  };
  return (
    <form onSubmit={onSubmit} className="mt-6 space-y-4">
      <h1 className="text-2xl font-semibold">Create your account</h1>
      <div className="space-y-2"><Label htmlFor="sc">Company name</Label>
        <Input id="sc" required value={company} onChange={(e)=>setCompany(e.target.value)} placeholder="Sparkle Cleaners Ltd" /></div>
      <div className="space-y-2"><Label htmlFor="se">Email</Label>
        <Input id="se" type="email" required value={email} onChange={(e)=>setEmail(e.target.value)} /></div>
      <div className="space-y-2"><Label htmlFor="sp">Password</Label>
        <Input id="sp" type="password" required minLength={6} value={password} onChange={(e)=>setPassword(e.target.value)} /></div>
      <Button type="submit" disabled={busy} className="w-full">{busy ? "Creating…" : "Sign up"}</Button>
    </form>
  );
}

function ForgotForm() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Check your email for a reset link.");
  };
  return (
    <form onSubmit={onSubmit} className="mt-6 space-y-4">
      <h1 className="text-2xl font-semibold">Reset your password</h1>
      <p className="text-sm text-muted-foreground">Enter your email and we'll send a reset link.</p>
      <div className="space-y-2"><Label htmlFor="fe">Email</Label>
        <Input id="fe" type="email" required value={email} onChange={(e)=>setEmail(e.target.value)} /></div>
      <Button type="submit" disabled={busy} className="w-full">{busy ? "Sending…" : "Send reset link"}</Button>
    </form>
  );
}
