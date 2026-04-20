import { Database, Calculator, ClipboardList, Hotel, BarChart3, Store, KeyRound, ChevronDown, List } from "lucide-react";
import { Link, useLocation } from "@tanstack/react-router";
import { useState } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";

type MenuItem = {
  title: string;
  url: string;
  icon: typeof BarChart3;
  children?: { title: string; url: string; icon: typeof List }[];
};

const items: MenuItem[] = [
  { title: "数据大盘", url: "/dashboard", icon: BarChart3 },
  { title: "数据池", url: "/data-pool", icon: Database },
  { title: "价格计算器", url: "/price-calculator", icon: Calculator },
  { title: "订单管理", url: "/orders", icon: ClipboardList },
  { title: "OTA账号", url: "/ota-accounts", icon: KeyRound },
  {
    title: "店铺管理",
    url: "/shops",
    icon: Store,
    children: [
      { title: "店铺列表", url: "/shops", icon: List },
      { title: "酒店列表", url: "/shops/hotels", icon: Hotel },
    ],
  },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const isShopsActive = location.pathname.startsWith("/shops");
  const [openShops, setOpenShops] = useState(isShopsActive);

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="border-b border-sidebar-border h-14 px-3 flex items-center justify-center">
        <Link to="/dashboard" className={`flex items-center gap-2.5 ${collapsed ? "justify-center" : ""}`}>
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-md shadow-primary/20 shrink-0">
            <Hotel className="h-4 w-4 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div className="flex flex-col leading-tight">
              <span className="text-[14px] font-bold tracking-tight text-sidebar-foreground">
                HotelOS
              </span>
              <span className="text-[10px] text-muted-foreground leading-none mt-0.5">
                酒店管理平台
              </span>
            </div>
          )}
        </Link>
      </SidebarHeader>
      <SidebarContent className="pt-3">
        <SidebarGroup className="px-0">
          {!collapsed && (
            <SidebarGroupLabel className="px-4 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70 mb-1">
              主菜单
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu className={`space-y-0.5 ${collapsed ? "px-1.5" : "px-2"}`}>
              {items.map((item) => {
                const isActive =
                  item.url === "/shops"
                    ? location.pathname === "/shops" || location.pathname.startsWith("/shops/")
                    : location.pathname.startsWith(item.url);
                const hasChildren = !!item.children?.length;

                if (hasChildren && !collapsed) {
                  const isOpen = openShops || isShopsActive;
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        onClick={() => setOpenShops((o) => !o)}
                        isActive={isActive}
                        className={`h-9 rounded-md transition-all px-3 ${
                          isActive
                            ? "bg-primary/10 text-primary font-semibold hover:bg-primary/15 hover:text-primary"
                            : "text-sidebar-foreground/80 hover:text-foreground hover:bg-sidebar-accent"
                        }`}
                      >
                        <item.icon className={`h-4 w-4 shrink-0 ${isActive ? "text-primary" : ""}`} />
                        <span className="text-[13px]">{item.title}</span>
                        <ChevronDown
                          className={`ml-auto h-3.5 w-3.5 transition-transform ${
                            isOpen ? "rotate-0" : "-rotate-90"
                          }`}
                        />
                      </SidebarMenuButton>
                      {isOpen && (
                        <div className="mt-0.5 ml-4 pl-3 border-l border-sidebar-border/60 space-y-0.5 py-0.5">
                          {item.children!.map((c) => {
                            const childActive =
                              c.url === "/shops"
                                ? location.pathname === "/shops" ||
                                  /^\/shops\/(new|[a-zA-Z0-9_-]+)$/.test(location.pathname)
                                : location.pathname.startsWith(c.url);
                            return (
                              <Link
                                key={c.title}
                                to={c.url}
                                className={`flex items-center gap-2 h-8 px-2.5 rounded-md text-[12.5px] transition-colors ${
                                  childActive
                                    ? "bg-primary/10 text-primary font-semibold"
                                    : "text-sidebar-foreground/75 hover:text-foreground hover:bg-sidebar-accent"
                                }`}
                              >
                                <c.icon
                                  className={`h-3.5 w-3.5 shrink-0 ${
                                    childActive ? "text-primary" : ""
                                  }`}
                                />
                                <span>{c.title}</span>
                                {childActive && (
                                  <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />
                                )}
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </SidebarMenuItem>
                  );
                }

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={collapsed ? item.title : undefined}
                      className={`h-9 rounded-md transition-all ${
                        collapsed ? "!size-9 !p-0 justify-center" : "px-3"
                      } ${
                        isActive
                          ? "bg-primary/10 text-primary font-semibold hover:bg-primary/15 hover:text-primary"
                          : "text-sidebar-foreground/80 hover:text-foreground hover:bg-sidebar-accent"
                      }`}
                    >
                      <Link to={item.url} className="flex items-center gap-2.5">
                        <item.icon className={`h-4 w-4 shrink-0 ${isActive ? "text-primary" : ""}`} />
                        {!collapsed && <span className="text-[13px]">{item.title}</span>}
                        {!collapsed && isActive && !hasChildren && (
                          <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
