import { createFileRoute, Outlet, useNavigate, useLocation, redirect } from "@tanstack/react-router";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { UserMenu } from "@/components/UserMenu";
import { Button } from "@/components/ui/button";
import { Bell, Search, Store } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/_app")({
  beforeLoad: ({ location }) => {
    if (typeof window === "undefined") return;
    const raw = localStorage.getItem("hotelos.auth.user");
    if (!raw) {
      throw redirect({ to: "/login", search: { redirect: location.href } as never });
    }
  },
  component: AppLayout,
});

function AppLayout() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showShopDialog, setShowShopDialog] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate({ to: "/login" });
      return;
    }
    // 进入应用后，若没有店铺，且不在新建店铺/店铺管理页，弹出引导
    if (!user.hasShop && !location.pathname.startsWith("/shops")) {
      setShowShopDialog(true);
    } else {
      setShowShopDialog(false);
    }
  }, [user, loading, location.pathname, navigate]);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background text-[13px]">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center justify-between border-b border-border bg-card/95 backdrop-blur-md px-4 shrink-0 sticky top-0 z-30 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <SidebarTrigger className="text-muted-foreground hover:text-foreground hover:bg-accent h-8 w-8 shrink-0" />
              <div className="h-5 w-px bg-border shrink-0" />
              <Breadcrumbs />
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                <Search className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground relative">
                <Bell className="h-4 w-4" />
                <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-destructive" />
              </Button>
              <div className="h-5 w-px bg-border mx-1" />
              <UserMenu />
            </div>
          </header>
          <main className="flex-1 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>

      <Dialog open={showShopDialog} onOpenChange={setShowShopDialog}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <div className="mx-auto mb-3 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Store className="h-6 w-6 text-primary" />
            </div>
            <DialogTitle className="text-center">请先创建店铺</DialogTitle>
            <DialogDescription className="text-center">
              您还没有创建任何店铺，请先创建店铺才能开始管理订单与价格。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-center">
            <Button
              onClick={() => {
                setShowShopDialog(false);
                navigate({ to: "/shops/new" });
              }}
              className="w-full"
            >
              立即创建店铺
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
}
