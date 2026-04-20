import { Link, useLocation, useParams } from "@tanstack/react-router";
import { ChevronRight, Home } from "lucide-react";
import { mockHotels, mockShops } from "@/lib/mock-data";

const ROUTE_LABELS: Record<string, { label: string; subtitle?: string }> = {
  "/dashboard": { label: "数据大盘", subtitle: "全面监控运营核心数据指标" },
  "/data-pool": { label: "数据池", subtitle: "管理酒店与民宿数据源" },
  "/price-calculator": { label: "价格计算器", subtitle: "配置发布价格涨幅规则" },
  "/orders": { label: "订单管理", subtitle: "跟踪与处理订房任务" },
  "/ota-accounts": { label: "OTA账号", subtitle: "管理多平台账号与配额" },
  "/shops": { label: "店铺管理", subtitle: "管理店铺信息与渠道API" },
};

function findShop(id: string) {
  // 优先 localStorage（新建的店铺）
  try {
    const raw = localStorage.getItem("hotelos.shops.list");
    if (raw) {
      const list = JSON.parse(raw) as { id: string; name: string }[];
      const s = list.find((x) => x.id === id);
      if (s) return s;
    }
  } catch {
    /* ignore */
  }
  return mockShops.find((s) => s.id === id);
}

export function Breadcrumbs() {
  const location = useLocation();
  const params = useParams({ strict: false }) as { hotelId?: string; shopId?: string };
  const path = location.pathname;

  const crumbs: { label: string; to?: string }[] = [];

  if (path.startsWith("/dashboard")) {
    crumbs.push({ label: "数据大盘" });
  } else if (path.startsWith("/data-pool")) {
    crumbs.push({ label: "数据池", to: "/data-pool" });
    if (params.hotelId) {
      const hotel = mockHotels.find((h) => h.id === params.hotelId);
      crumbs.push({ label: hotel?.name || "酒店详情" });
    }
  } else if (path.startsWith("/price-calculator")) {
    crumbs.push({ label: "价格计算器" });
  } else if (path.startsWith("/orders")) {
    crumbs.push({ label: "订单管理" });
  } else if (path.startsWith("/ota-accounts")) {
    crumbs.push({ label: "OTA账号" });
  } else if (path.startsWith("/shops")) {
    crumbs.push({ label: "店铺管理", to: "/shops" });
    if (path === "/shops/new") {
      crumbs.push({ label: "新建店铺" });
    } else if (path === "/shops/hotels") {
      crumbs.push({ label: "酒店列表" });
    } else if (params.shopId) {
      const shop = findShop(params.shopId);
      crumbs.push({ label: shop?.name || "店铺详情" });
    } else if (path === "/shops") {
      crumbs.push({ label: "店铺列表" });
    }
  }

  const matchKey = Object.keys(ROUTE_LABELS).find((k) => path.startsWith(k));
  const meta = matchKey ? ROUTE_LABELS[matchKey] : undefined;

  return (
    <div className="flex items-center gap-3 min-w-0">
      <nav className="flex items-center gap-1.5 text-[13px] min-w-0" aria-label="面包屑">
        <Link
          to="/dashboard"
          className="flex items-center text-muted-foreground hover:text-foreground transition-colors shrink-0"
        >
          <Home className="h-3.5 w-3.5" />
        </Link>
        {crumbs.map((c, i) => (
          <div key={i} className="flex items-center gap-1.5 min-w-0">
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60 shrink-0" />
            {c.to && i < crumbs.length - 1 ? (
              <Link to={c.to} className="text-muted-foreground hover:text-foreground transition-colors truncate">
                {c.label}
              </Link>
            ) : (
              <span className="font-semibold text-foreground truncate">{c.label}</span>
            )}
          </div>
        ))}
      </nav>
      {meta?.subtitle && crumbs.length === 1 && (
        <>
          <span className="h-4 w-px bg-border shrink-0" />
          <span className="text-[12px] text-muted-foreground truncate hidden md:inline">
            {meta.subtitle}
          </span>
        </>
      )}
    </div>
  );
}
