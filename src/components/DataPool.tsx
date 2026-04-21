import { useState, useMemo, useEffect } from "react";
import { mockHotels } from "@/lib/mock-data";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "@tanstack/react-router";
import { Search, Download, Eye, Star } from "lucide-react";
import { toast } from "sonner";
import { DataTablePagination } from "@/components/DataTablePagination";
import type { Channel, Hotel } from "@/lib/types";

const CHANNELS: (Channel | "全部")[] = [
  "全部",
  "携程",
  "美团",
  "Booking",
  "飞猪",
  "去哪儿",
  "Agoda",
  "途家",
  "小红书",
];

export function DataPool() {
  const [hotels] = useState<Hotel[]>(mockHotels);
  const [channelTab, setChannelTab] = useState<string>("全部");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  useEffect(() => {
    setPage(1);
  }, [search, channelTab]);

  const filtered = useMemo(() => {
    let list = hotels;
    if (channelTab !== "全部") list = list.filter((h) => h.channel === channelTab);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (h) =>
          h.name.toLowerCase().includes(q) ||
          (h.hotelExternalId ?? "").toLowerCase().includes(q) ||
          h.city.toLowerCase().includes(q) ||
          h.brand.toLowerCase().includes(q) ||
          h.tags.some((t) => t.includes(q)),
      );
    }
    return list;
  }, [hotels, channelTab, search]);

  const paged = useMemo(
    () => filtered.slice((page - 1) * pageSize, page * pageSize),
    [filtered, page, pageSize],
  );

  const channelCounts = useMemo(() => {
    const counts: Record<string, number> = { 全部: hotels.length };
    for (const h of hotels) counts[h.channel] = (counts[h.channel] ?? 0) + 1;
    return counts;
  }, [hotels]);

  const handleExport = () => {
    const headers = ["酒店ID", "酒店名称", "渠道", "评分", "城市", "品牌", "房间量", "标签", "订单数", "均价"];
    const rows = filtered.map((h) => [
      h.hotelExternalId ?? h.id,
      h.name,
      h.channel,
      h.rating,
      h.city,
      h.brand,
      h.roomCount,
      h.tags.join("/"),
      h.totalOrders,
      h.avgPrice,
    ]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `数据池_${channelTab}_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`已导出 ${filtered.length} 条数据`);
  };

  return (
    <div className="p-5 md:p-7 space-y-4 text-[13px]">
      {/* Channel tabs */}
      <Tabs value={channelTab} onValueChange={setChannelTab}>
        <TabsList className="h-9 bg-muted/40 flex-wrap">
          {CHANNELS.map((c) => (
            <TabsTrigger key={c} value={c} className="text-[13px] h-7 px-3">
              {c}
              <span className="ml-1.5 text-[11px] text-muted-foreground">
                {channelCounts[c] ?? 0}
              </span>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Search + Export */}
      <Card className="border-border/60 bg-card">
        <CardContent className="py-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="搜索酒店名称 / ID / 城市 / 品牌 / 标签..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-8 text-[13px] pl-7 w-80"
              />
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[12px] text-muted-foreground">
                共 <b className="text-foreground">{filtered.length}</b> 条
              </span>
              <Button size="sm" variant="outline" className="h-8" onClick={handleExport}>
                <Download className="h-3.5 w-3.5 mr-1" />
                导出
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Card grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {paged.map((hotel) => (
          <Card
            key={hotel.id}
            className="border-border/60 bg-card hover:border-primary/40 hover:shadow-md transition-all overflow-hidden group"
          >
            <div className="aspect-[16/9] bg-gradient-to-br from-muted to-muted/50 relative overflow-hidden">
              {hotel.images?.[0] ? (
                <img
                  src={hotel.images[0]}
                  alt={hotel.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-muted-foreground/40">
                  {hotel.name.slice(0, 2)}
                </div>
              )}
              <Badge
                variant="outline"
                className="absolute top-2 left-2 bg-background/90 backdrop-blur text-[11px] h-5 border-border/60"
              >
                {hotel.channel}
              </Badge>
              <Badge
                variant="outline"
                className="absolute top-2 right-2 bg-background/90 backdrop-blur text-[11px] h-5 border-warning/40 text-warning"
              >
                <Star className="h-2.5 w-2.5 mr-0.5 fill-current" />
                {hotel.rating}
              </Badge>
            </div>
            <CardContent className="p-3 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-[14px] font-semibold text-foreground line-clamp-1 flex-1">
                  {hotel.name}
                </h3>
                <span className="text-[15px] font-bold text-primary font-mono whitespace-nowrap">
                  ¥{hotel.avgPrice}
                </span>
              </div>
              <div className="flex items-center gap-2 text-[12px] text-muted-foreground">
                <span>{hotel.city}</span>
                <span className="text-border">·</span>
                <span className="truncate">{hotel.brand}</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {hotel.tags.slice(0, 3).map((t) => (
                  <Badge
                    key={t}
                    variant="secondary"
                    className="text-[10px] h-4 px-1.5 font-normal"
                  >
                    {t}
                  </Badge>
                ))}
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-border/40">
                <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                  <span>房间 {hotel.roomCount}</span>
                  <span>订单 {hotel.totalOrders}</span>
                </div>
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-[11px] text-primary hover:text-primary"
                >
                  <Link to="/data-pool/$hotelId" params={{ hotelId: hotel.id }}>
                    <Eye className="h-3 w-3 mr-1" />
                    详情
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {paged.length === 0 && (
        <div className="text-center py-16 text-muted-foreground text-[13px]">
          暂无符合条件的数据
        </div>
      )}

      <DataTablePagination
        total={filtered.length}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
      />
    </div>
  );
}
