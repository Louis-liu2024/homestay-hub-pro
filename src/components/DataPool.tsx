import { useState, useMemo, useEffect } from "react";
import { mockHotels } from "@/lib/mock-data";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "@tanstack/react-router";
import { Search, Download, Upload, Tag as TagIcon } from "lucide-react";
import { toast } from "sonner";
import { DataTablePagination } from "@/components/DataTablePagination";
import { PriceQueryDialog } from "@/components/PriceQueryDialog";
import { PublishDialog } from "@/components/PublishDialog";
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
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [priceHotel, setPriceHotel] = useState<Hotel | null>(null);
  const [publishHotel, setPublishHotel] = useState<Hotel | null>(null);

  useEffect(() => {
    setPage(1);
    setSelected(new Set());
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

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === paged.length) setSelected(new Set());
    else setSelected(new Set(paged.map((h) => h.id)));
  };

  const formatNum = (n: number) => n.toLocaleString("en-US");

  const handleExport = () => {
    const headers = ["酒店ID", "酒店名称", "渠道", "评分", "城市", "品牌", "标签", "评论数", "房间数"];
    const rows = filtered.map((h) => [
      h.hotelExternalId ?? h.id,
      h.name,
      h.channel,
      h.rating,
      h.city,
      h.brand,
      h.tags.join("/"),
      h.reviewCount ?? 0,
      h.roomCount,
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

      {/* Filter bar */}
      <Card className="border-border/60 bg-card">
        <CardContent className="py-3">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="搜索酒店名称 / ID / 城市 / 品牌 / 标签..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-8 text-[13px] pl-7 w-80"
              />
            </div>
            {search && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-[12px] text-muted-foreground ml-auto"
                onClick={() => setSearch("")}
              >
                重置
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Toolbar between filter & list */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-[12px] text-muted-foreground">
          共 <b className="text-foreground">{filtered.length}</b> 条数据
        </span>
        <Button size="sm" variant="outline" className="h-8" onClick={handleExport}>
          <Download className="h-3.5 w-3.5 mr-1" />导出
        </Button>
      </div>

      {/* Table */}
      <div className="border border-border/50 rounded-lg bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px] min-w-[1100px] border-separate border-spacing-0">
            <thead>
              <tr className="text-[12px] text-muted-foreground">
                <th className="sticky left-0 z-20 bg-muted/60 backdrop-blur w-10 px-3 py-2.5 text-left border-b border-border/40">
                  <Checkbox
                    checked={selected.size === paged.length && paged.length > 0}
                    onCheckedChange={toggleAll}
                  />
                </th>
                <th className="sticky left-10 z-20 bg-muted/60 backdrop-blur px-3 py-2.5 text-left font-semibold border-b border-border/40 min-w-[180px]">酒店名称</th>
                <th className="sticky left-[228px] z-20 bg-muted/60 backdrop-blur px-3 py-2.5 text-left font-semibold border-b border-r border-border/40 min-w-[140px] shadow-[2px_0_4px_-2px_rgba(0,0,0,0.08)]">酒店ID</th>
                <th className="bg-muted/40 px-3 py-2.5 text-left font-semibold border-b border-border/40">渠道</th>
                <th className="bg-muted/40 px-3 py-2.5 text-left font-semibold border-b border-border/40">评分</th>
                <th className="bg-muted/40 px-3 py-2.5 text-left font-semibold border-b border-border/40">城市</th>
                <th className="bg-muted/40 px-3 py-2.5 text-left font-semibold border-b border-border/40">品牌</th>
                <th className="bg-muted/40 px-3 py-2.5 text-left font-semibold border-b border-border/40">标签</th>
                <th className="bg-muted/40 px-3 py-2.5 text-left font-semibold border-b border-border/40">评论数</th>
                <th className="bg-muted/40 px-3 py-2.5 text-left font-semibold border-b border-border/40">房间数</th>
                <th className="sticky right-0 z-20 bg-muted/60 backdrop-blur px-3 py-2.5 text-right font-semibold border-b border-l border-border/40 w-44 shadow-[-2px_0_4px_-2px_rgba(0,0,0,0.08)]">操作</th>
              </tr>
            </thead>
            <tbody>
              {paged.map((hotel, idx) => {
                const rowBg = idx % 2 === 1 ? "bg-[var(--row-stripe)]" : "bg-card";
                return (
                  <tr key={hotel.id} className="group">
                    <td className={`sticky left-0 z-10 ${rowBg} group-hover:bg-accent/40 transition-colors px-3 py-2.5 border-b border-border/30`}>
                      <Checkbox
                        checked={selected.has(hotel.id)}
                        onCheckedChange={() => toggleSelect(hotel.id)}
                      />
                    </td>
                    <td className={`sticky left-10 z-10 ${rowBg} group-hover:bg-accent/40 transition-colors px-3 py-2.5 border-b border-border/30 min-w-[180px]`}>
                      <Link
                        to="/data-pool/$hotelId"
                        params={{ hotelId: hotel.id }}
                        className="font-medium text-foreground hover:text-primary transition-colors"
                      >
                        {hotel.name}
                      </Link>
                    </td>
                    <td className={`sticky left-[228px] z-10 ${rowBg} group-hover:bg-accent/40 transition-colors px-3 py-2.5 text-[12px] font-mono text-muted-foreground border-b border-r border-border/30 min-w-[140px] shadow-[2px_0_4px_-2px_rgba(0,0,0,0.08)]`}>
                      {hotel.hotelExternalId ?? hotel.id}
                    </td>
                    <td className="px-3 py-2.5 border-b border-border/30 group-hover:bg-accent/40 transition-colors">
                      <Badge variant="outline" className="text-[11px] h-5">
                        {hotel.channel}
                      </Badge>
                    </td>
                    <td className="px-3 py-2.5 font-semibold text-warning border-b border-border/30 group-hover:bg-accent/40 transition-colors">{hotel.rating}</td>
                    <td className="px-3 py-2.5 border-b border-border/30 group-hover:bg-accent/40 transition-colors">{hotel.city}</td>
                    <td className="px-3 py-2.5 truncate max-w-[120px] border-b border-border/30 group-hover:bg-accent/40 transition-colors">{hotel.brand}</td>
                    <td className="px-3 py-2.5 border-b border-border/30 group-hover:bg-accent/40 transition-colors">
                      <div className="flex flex-wrap gap-1">
                        {hotel.tags.slice(0, 2).map((t) => (
                          <Badge
                            key={t}
                            variant="secondary"
                            className="text-[10px] h-4 px-1.5 font-normal"
                          >
                            {t}
                          </Badge>
                        ))}
                      </div>
                    </td>
                    <td className="px-3 py-2.5 font-mono border-b border-border/30 group-hover:bg-accent/40 transition-colors">{formatNum(hotel.reviewCount ?? 0)}</td>
                    <td className="px-3 py-2.5 font-mono border-b border-border/30 group-hover:bg-accent/40 transition-colors">{formatNum(hotel.roomCount)}</td>
                    <td className={`sticky right-0 z-10 ${rowBg} group-hover:bg-accent/40 transition-colors px-3 py-2.5 border-b border-l border-border/30 shadow-[-2px_0_4px_-2px_rgba(0,0,0,0.08)]`}>
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-[12px] text-muted-foreground hover:text-primary"
                          onClick={() => setPriceHotel(hotel)}
                        >
                          <TagIcon className="h-3.5 w-3.5 mr-1" />
                          查价
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-[12px] text-muted-foreground hover:text-primary"
                          onClick={() => setPublishHotel(hotel)}
                        >
                          <Upload className="h-3.5 w-3.5 mr-1" />
                          发布
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {paged.length === 0 && (
                <tr>
                  <td colSpan={11} className="text-center py-12 text-muted-foreground border-b border-border/30">
                    暂无符合条件的数据
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <DataTablePagination
        total={filtered.length}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
      />

      <PriceQueryDialog
        hotel={priceHotel}
        open={!!priceHotel}
        onOpenChange={(o) => !o && setPriceHotel(null)}
      />
      <PublishDialog
        hotel={publishHotel}
        open={!!publishHotel}
        onOpenChange={(o) => !o && setPublishHotel(null)}
      />
    </div>
  );
}
