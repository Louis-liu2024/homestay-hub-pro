import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, Settings, LogOut, Bell, ChevronDown, KeyRound } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useNavigate } from "@tanstack/react-router";

export function UserMenu() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const initial = (user?.name || user?.email || "U").charAt(0).toUpperCase();
  const display = user?.name || "用户";

  const handleLogout = () => {
    logout();
    navigate({ to: "/login" });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="h-8 px-2 gap-2 hover:bg-accent rounded-md"
        >
          <div className="h-6 w-6 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-[11px] font-semibold text-primary-foreground shadow-sm">
            {initial}
          </div>
          <div className="hidden md:flex flex-col items-start leading-tight">
            <span className="text-[12px] font-semibold text-foreground">{display}</span>
            <span className="text-[10px] text-muted-foreground">管理员</span>
          </div>
          <ChevronDown className="h-3 w-3 text-muted-foreground hidden md:block" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="text-xs">
          <div className="flex flex-col gap-0.5">
            <span className="font-semibold">{display}</span>
            <span className="text-[11px] text-muted-foreground font-normal">
              {user?.email || "—"}
            </span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-xs">
          <User className="h-3.5 w-3.5 mr-2" />个人资料
        </DropdownMenuItem>
        <DropdownMenuItem
          className="text-xs"
          onClick={() => navigate({ to: "/forgot-password" })}
        >
          <KeyRound className="h-3.5 w-3.5 mr-2" />修改密码
        </DropdownMenuItem>
        <DropdownMenuItem className="text-xs">
          <Bell className="h-3.5 w-3.5 mr-2" />消息通知
        </DropdownMenuItem>
        <DropdownMenuItem className="text-xs">
          <Settings className="h-3.5 w-3.5 mr-2" />系统设置
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-xs text-destructive focus:text-destructive"
          onClick={handleLogout}
        >
          <LogOut className="h-3.5 w-3.5 mr-2" />退出登录
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
