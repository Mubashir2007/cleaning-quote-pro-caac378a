import { createFileRoute, Outlet, Link, useRouter, useRouterState, redirect } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import {
  LayoutDashboard, Users, FilePlus2, FileText, Settings, LogOut, Sparkles, Menu, X,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getSession();
    if (!data.session) throw redirect({ to: "/auth" });
  },
  component: AuthedLayout,
});

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/customers", label: "Customers", icon: Users },
  { to: "/quotes/new", label: "New Quote", icon: FilePlus2 },
  { to: "/quotes", label: "Quotes", icon: FileText },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

function AuthedLayout() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const qc = useQueryClient();
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => { setMobileOpen(false); }, [pathname]);

  if (loading) return <div className="grid min-h-screen place-items-center text-muted-foreground">Loading…</div>;
  if (!user) return null;

  const handleLogout = async () => {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    toast.success("Signed out");
    router.navigate({ to: "/auth", replace: true });
  };

  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 transform bg-sidebar text-sidebar-foreground transition-transform md:static md:translate-x-0 ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-5">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
            <Sparkles className="h-4 w-4" />
          </div>
          <span className="font-semibold">Cleaning Quote Pro</span>
        </div>
        <nav className="flex flex-col gap-1 p-3">
          {NAV.map((item) => {
            const active = pathname === item.to || (item.to !== "/dashboard" && pathname.startsWith(item.to));
            return (
              <Link key={item.to} to={item.to}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${active ? "bg-sidebar-primary text-sidebar-primary-foreground font-medium" : "hover:bg-sidebar-accent"}`}>
                <item.icon className="h-4 w-4" />{item.label}
              </Link>
            );
          })}
        </nav>
        <div className="absolute inset-x-3 bottom-3">
          <button onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-sidebar-accent">
            <LogOut className="h-4 w-4" />Logout
          </button>
        </div>
      </aside>

      {mobileOpen && <div className="fixed inset-0 z-30 bg-black/40 md:hidden" onClick={() => setMobileOpen(false)} />}

      <div className="flex min-h-screen flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur md:px-8 no-print">
          <button className="rounded-md p-2 hover:bg-muted md:hidden" onClick={() => setMobileOpen((v) => !v)}>
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <div className="ml-auto text-sm text-muted-foreground">{user.email}</div>
        </header>
        <main className="flex-1 p-4 md:p-8"><Outlet /></main>
      </div>
    </div>
  );
}
