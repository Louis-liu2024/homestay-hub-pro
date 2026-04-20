import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { mockShops } from "@/lib/mock-data";
import type { Shop, Channel } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Search, Store, ChevronRight } from "lucide-react";
import { toast } from "sonner";

const allChannels: Channel[] = ["携程", "美团", "Booking", "飞猪", "去哪儿", "Agoda", "途家", "小红书"];
const regions = ["华东", "华南", "华北", "华中", "西南", "西北", "东北"];

const STORAGE_KEY = "hotelos.shops.list";

function loadShops(): Shop[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    /* ignore */
  }
  return mockShops;
}

const PALETTE = [
  "from-blue-500 to-blue-600",
  "from-emerald-500 to-emerald-600",
  "from-purple-500 to-purple-600",
  "from-amber-500 to-amber-600",
  "from-rose-500 to-rose-600",
  "from-cyan-500 to-cyan-600",
  "from-indigo-500 to-indigo-600",
  "from-orange-500 to-orange-600",
];

function hashIdx(str: string, mod: number) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return h % mod;
}

export function ShopList() {
  const [shops, setShops] = useState<Shop[]>(() =>
    loadShops().map((s) => ({ ...s, published: s.published ?? true })),
  );
  const [search, setSearch] = useState("");
  const [regionFilter, setRegionFilter] = useState<string>("all");
  const [channelFilter, setChannelFilter] = useState<string>("all");

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(shops));
    } catch {
      /* ignore */
    }
  }, [shops]);

  const filtered = useMemo(() => {
    return shops.filter((s) => {
      const kw = search.trim().toLowerCase();
      const matchKw =
        !kw ||
        s.name.toLowerCase().includes(kw) ||
        s.city.toLowerCase().includes(kw) ||
        s.address.toLowerCase().includes(kw);
      const matchRegion = regionFilter === "all" || s.region === regionFilter;
      const matchChannel = channelFilter === "all" || s.channels.includes(channelFilter as Channel);
      return matchKw && matchRegion && matchChannel;
    });
  }, [shops, search, regionFilter, channelFilter]);

  const togglePublished = (id: string, next: boolean) => {
    setShops((prev) => prev.map((s) => (s.id === id ? { ...s, published: next } : s)));
    toast.success(next ? "店铺已发布" : "店铺已下线");
  };

  return (
    <div className="p-5 md:p-7 space-y-4 text-[13px]">
      {/* Filter bar */}
      <Card className="border-border/60 bg-card">
        <CardContent className="py-3">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="搜索店铺名称 / 城市 / 地址"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-8 text-[13px] pl-7 w-64"
              />
            </div>
            <Select value={regionFilter} onValueChange={setRegionFilter}>
              <SelectTrigger className="w-28 h-8 text-[13px]">
                <SelectValue placeholder="全部地域" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部地域</SelectItem>
                {regions.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={channelFilter} onValueChange={setChannelFilter}>
              <SelectTrigger className="w-32 h-8 text-[13px]">
                <SelectValue placeholder="全部渠道" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部渠道</SelectItem>
                {allChannels.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-[12px] text-muted-foreground flex items-center gap-1.5">
          <Store className="h-3.5 w-3.5 text-muted-foreground" />共{" "}
          <b className="text-foreground">{filtered.length}</b> 个店铺
        </span>
        <Button asChild size="sm" className="h-8">
          <Link to="/shops/new">
            <Plus className="h-3.5 w-3.5 mr-1" />
            新建店铺
          </Link>
        </Button>
      </div>

      {/* Card grid */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((shop) => {
          const initials = shop.name.slice(0, 2);
          const grad = PALETTE[hashIdx(shop.id, PALETTE.length)];
          const published = shop.published ?? true;
          return (
            <Card
              key={shop.id}
              className="border-border/60 bg-card transition-all hover:border-primary/40 hover:shadow-md h-full"
            >
              <CardContent className="p-4 space-y-3">
                <Link
                  to="/shops/$shopId"
                  params={{ shopId: shop.id }}
                  className="group block"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`h-12 w-12 rounded-lg bg-gradient-to-br ${grad} flex items-center justify-center text-white font-bold text-[15px] shadow-sm shrink-0`}
                    >
                      {initials}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-[14px] truncate group-hover:text-primary transition-colors">
                        {shop.name}
                      </div>
                      <div className="text-[11px] text-muted-foreground mt-0.5 truncate">
                        {shop.region} · {shop.city}
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground/60 group-hover:text-primary transition-colors shrink-0" />
                  </div>
                </Link>

                <div className="flex flex-wrap gap-1">
                  {shop.channels.slice(0, 4).map((ch) => (
                    <Badge
                      key={ch}
                      variant="secondary"
                      className="text-[10px] h-5 bg-primary/10 text-primary border-0"
                    >
                      {ch}
                    </Badge>
                  ))}
                  {shop.channels.length > 4 && (
                    <Badge variant="outline" className="text-[10px] h-5">
                      +{shop.channels.length - 4}
                    </Badge>
                  )}
                </div>

                <div className="pt-2 border-t border-border/40 flex items-center justify-between">
                  <span className="text-[11px] text-muted-foreground">API 配置</span>
                  <span className="font-semibold text-foreground text-[12px]">
                    {shop.apiConfigs.length}
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-md bg-muted/40 px-2.5 py-1.5">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        published ? "bg-success" : "bg-muted-foreground/40"
                      }`}
                    />
                    <span className="text-[12px] text-foreground">
                      {published ? "已发布" : "未发布"}
                    </span>
                  </div>
                  <Switch
                    checked={published}
                    onCheckedChange={(v) => togglePublished(shop.id, v)}
                    aria-label="切换店铺发布状态"
                  />
                </div>
              </CardContent>
            </Card>
          );
        })}

        {/* 新建占位卡片 */}
        <Link to="/shops/new" className="group">
          <Card className="border-dashed border-border/60 bg-card/50 transition-all hover:border-primary hover:bg-primary/5 cursor-pointer h-full min-h-[220px]">
            <CardContent className="p-4 h-full flex flex-col items-center justify-center text-muted-foreground group-hover:text-primary">
              <div className="h-10 w-10 rounded-full bg-muted group-hover:bg-primary/10 flex items-center justify-center mb-2 transition-colors">
                <Plus className="h-5 w-5" />
              </div>
              <span className="text-[12px] font-medium">新建店铺</span>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
