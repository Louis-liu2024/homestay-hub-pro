import { useState, useMemo } from "react";
import { mockHotels } from "@/lib/mock-data";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "@tanstack/react-router";
import { Search, Upload, Tag, Download, TrendingUp, Pencil, BedDouble, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { DataTablePagination } from "@/components/DataTablePagination";
import { PriceQueryDialog } from "@/components/PriceQueryDialog";
import { PublishDialog } from "@/components/PublishDialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { Channel, Hotel } from "@/lib/types";

const CHANNELS: (Channel | "全部")[] = ["全部", "携程", "美团", "Booking", "飞猪", "去哪儿", "Agoda", "途家", "小红书"];

export function DataPoolList() {
  const [hotels, setHotels] = useState<Hotel[]>(() =>
    mockHotels.map((h) => ({ ...h, published: h.published ?? Math.random() > 0.4 })),
  );
  const [search, setSearch] = useState("");
  const [activeChannel, setActiveChannel] = useState<Channel | "全部">("全部");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [priceQueryHotel, setPriceQueryHotel] = useState<Hotel | null>(null);
  const [publishHotel, setPublishHotel] = useState<Hotel | null>(null);
  const [deleteHotel, setDeleteHotel] = useState<Hotel | null>(null);

  const channelCounts = useMemo(() => {
    const counts: Record<string, number> = { 全部: hotels.length };
    for (const h of hotels) counts[h.channel] = (counts[h.channel] ?? 0) + 1;
    return counts;
  }, [hotels]);

  const filtered = useMemo(() => {
    let list = hotels;
    if (activeChannel !== "全部") list = list.filter((h) => h.channel === activeChannel);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (h) =>
          h.name.toLowerCase().includes(q) ||
          h.channel.toLowerCase().includes(q) ||
          h.tags.some((t) => t.includes(q))
      );
    }
    return list;
  }, [hotels, search, activeChannel]);

  const paged = useMemo(
    () => filtered.slice((page - 1) * pageSize, page * pageSize),
    [filtered, page, pageSize]
  );

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === paged.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(paged.map((h) => h.id)));
    }
  };

  const handleBatchPublish = () => {
    setHotels((prev) =>
      prev.map((h) => (selected.has(h.id) ? { ...h, published: true } : h)),
    );
    toast.success(`已发布 ${selected.size} 个酒店`);
    setSelected(new Set());
  };

  const togglePublished = (id: string, next: boolean) => {
    setHotels((prev) => prev.map((h) => (h.id === id ? { ...h, published: next } : h)));
    toast.success(next ? "酒店已发布" : "酒店已下线");
  };

  const handleDelete = () => {
    if (!deleteHotel) return;
    setHotels((prev) => prev.filter((h) => h.id !== deleteHotel.id));
    toast.success(`已删除「${deleteHotel.name}」`);
    setDeleteHotel(null);
  };

  const handleExport = () => {
    const headers = ["酒店名称", "渠道", "评分", "城市", "品牌", "房间量", "7天空房率", "订单数", "均价"];
    const rows = filtered.map((h) => [
      h.name, h.channel, h.rating, h.city, h.brand, h.roomCount,
      `${(h.vacancyRate7d * 100).toFixed(0)}%`, h.totalOrders, h.avgPrice,
    ]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `酒店数据_${activeChannel}_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`已导出 ${filtered.length} 条数据`);
  };

  return (
    <div className="p-5 md:p-7 space-y-4 text-[13px]">
      {/* Channel Tabs */}
      <Tabs value={activeChannel} onValueChange={(v) => { setActiveChannel(v as Channel | "全部"); setPage(1); }}>
        <TabsList className="h-9 bg-muted/50 p-1 flex-wrap">
          {CHANNELS.map((ch) => (
            <TabsTrigger
              key={ch}
              value={ch}
              className="text-[13px] px-3 h-7 data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-sm"
            >
              {ch}
              <span className="ml-1.5 text-[11px] text-muted-foreground data-[state=active]:text-primary/70">
                {channelCounts[ch] ?? 0}
              </span>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Filter bar — only search + filters */}
      <Card className="border-border/60 bg-card">
        <CardContent className="py-3">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="搜索酒店名称、渠道、标签..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="h-8 text-[13px] pl-7 w-64"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Toolbar between filter & list */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-[12px] text-muted-foreground">共 <b className="text-foreground">{filtered.length}</b> 条数据</span>
        <Button size="sm" variant="outline" className="h-8" onClick={handleExport}>
          <Download className="h-3.5 w-3.5 mr-1" />导出
        </Button>
      </div>

      {/* Table — left & right frozen, middle horizontally scrollable */}
      <div className="border border-border/50 rounded-lg bg-card overflow-hidden">
        <div className="flex">
          {/* Frozen left */}
          <div className="shrink-0 border-r border-border/40 bg-card z-10" style={{ boxShadow: "2px 0 6px rgba(0,0,0,0.04)" }}>
            <div className="flex items-center h-10 border-b border-border/40 bg-muted/40 px-3 gap-3">
              <Checkbox
                checked={selected.size === paged.length && paged.length > 0}
                onCheckedChange={toggleAll}
              />
              <span className="text-[12px] font-semibold text-muted-foreground w-48">
                酒店名称
              </span>
            </div>
            {paged.map((hotel, idx) => (
              <div
                key={hotel.id}
                className={`flex items-center h-12 border-b border-border/30 px-3 gap-3 hover:bg-accent/40 transition-colors ${idx % 2 === 1 ? "bg-[var(--row-stripe)]" : "bg-card"}`}
              >
                <Checkbox
                  checked={selected.has(hotel.id)}
                  onCheckedChange={() => toggleSelect(hotel.id)}
                />
                <Link
                  to="/data-pool/$hotelId"
                  params={{ hotelId: hotel.id }}
                  className="text-[13px] font-medium text-foreground hover:text-primary truncate w-48 transition-colors"
                >
                  {hotel.name}
                </Link>
              </div>
            ))}
          </div>

          {/* Scrollable middle */}
          <div className="flex-1 overflow-x-auto min-w-0">
            <div className="flex items-center h-10 border-b border-border/40 bg-muted/40 min-w-[900px]">
              <HeaderCell w="w-16">评分</HeaderCell>
              <HeaderCell w="w-20">渠道</HeaderCell>
              <HeaderCell w="w-20">房间量</HeaderCell>
              <HeaderCell w="w-24">7天空房率</HeaderCell>
              <HeaderCell w="w-24">发布状态</HeaderCell>
              <HeaderCell w="w-40">标签</HeaderCell>
              <HeaderCell w="w-20">城市</HeaderCell>
              <HeaderCell w="w-24">品牌</HeaderCell>
              <HeaderCell w="w-20">订单数</HeaderCell>
              <HeaderCell w="w-24">均价(¥)</HeaderCell>
            </div>
            {paged.map((hotel, idx) => (
              <div
                key={hotel.id}
                className={`flex items-center h-12 border-b border-border/30 min-w-[900px] hover:bg-accent/40 transition-colors ${idx % 2 === 1 ? "bg-[var(--row-stripe)]" : "bg-card"}`}
              >
                <DataCell w="w-16">
                  <span className="text-[13px] font-semibold text-warning">{hotel.rating}</span>
                </DataCell>
                <DataCell w="w-20">
                  <Badge variant="outline" className="text-[11px] h-5 border-border/60">{hotel.channel}</Badge>
                </DataCell>
                <DataCell w="w-20"><span className="text-[13px] font-mono">{hotel.roomCount}</span></DataCell>
                <DataCell w="w-24">
                  <span className={`text-[13px] font-mono font-medium ${hotel.vacancyRate7d > 0.5 ? "text-destructive" : "text-success"}`}>
                    {(hotel.vacancyRate7d * 100).toFixed(0)}%
                  </span>
                </DataCell>
                <DataCell w="w-24">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={!!hotel.published}
                      onCheckedChange={(v) => togglePublished(hotel.id, v)}
                      aria-label="切换酒店发布状态"
                    />
                    <span
                      className={`text-[12px] ${
                        hotel.published ? "text-success" : "text-muted-foreground"
                      }`}
                    >
                      {hotel.published ? "已发布" : "未发布"}
                    </span>
                  </div>
                </DataCell>
                <DataCell w="w-40">
                  <div className="flex gap-1 flex-wrap">
                    {hotel.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-[11px] h-4 px-1.5 bg-primary/10 text-primary border-0">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </DataCell>
                <DataCell w="w-20"><span className="text-[13px]">{hotel.city}</span></DataCell>
                <DataCell w="w-24"><span className="text-[13px]">{hotel.brand}</span></DataCell>
                <DataCell w="w-20"><span className="text-[13px] font-mono">{hotel.totalOrders}</span></DataCell>
                <DataCell w="w-24"><span className="text-[13px] font-mono font-medium">¥{hotel.avgPrice}</span></DataCell>
              </div>
            ))}
          </div>

          {/* Frozen right */}
          <div className="shrink-0 border-l border-border/40 bg-card z-10" style={{ boxShadow: "-2px 0 6px rgba(0,0,0,0.04)" }}>
            <div className="flex items-center h-10 border-b border-border/40 bg-muted/40 px-3">
              <span className="text-[12px] font-semibold text-muted-foreground">操作</span>
            </div>
            {paged.map((hotel, idx) => (
              <div
                key={hotel.id}
                className={`flex items-center h-12 border-b border-border/30 px-2 gap-0.5 ${idx % 2 === 1 ? "bg-[var(--row-stripe)]" : "bg-card"}`}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-1.5 text-[12px] text-muted-foreground hover:text-primary"
                  onClick={() => toast.info(`「${hotel.name}」加价规则待配置`)}
                  title="加价"
                >
                  <TrendingUp className="h-3.5 w-3.5" />
                  <span className="ml-1">加价</span>
                </Button>
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className="h-7 px-1.5 text-[12px] text-muted-foreground hover:text-primary"
                  title="编辑"
                >
                  <Link to="/data-pool/$hotelId" params={{ hotelId: hotel.id }}>
                    <Pencil className="h-3.5 w-3.5" />
                    <span className="ml-1">编辑</span>
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className="h-7 px-1.5 text-[12px] text-muted-foreground hover:text-primary"
                  title="房型"
                >
                  <Link to="/data-pool/$hotelId" params={{ hotelId: hotel.id }}>
                    <BedDouble className="h-3.5 w-3.5" />
                    <span className="ml-1">房型</span>
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-1.5 text-[12px] text-muted-foreground hover:text-destructive"
                  onClick={() => setDeleteHotel(hotel)}
                  title="删除"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span className="ml-1">删除</span>
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <DataTablePagination
        total={filtered.length}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
      />

      {/* Floating batch publish */}
      {selected.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 glass border border-primary/30 rounded-xl px-6 py-3 flex items-center gap-4 z-50 glow-primary">
          <span className="text-[13px] font-medium text-foreground">
            已选择 <span className="text-primary font-bold">{selected.size}</span> 个酒店
          </span>
          <Button size="sm" onClick={handleBatchPublish} className="h-8">
            <Upload className="h-3.5 w-3.5 mr-1" />
            一键发布
          </Button>
        </div>
      )}

      <PriceQueryDialog
        hotel={priceQueryHotel}
        open={!!priceQueryHotel}
        onOpenChange={(o) => !o && setPriceQueryHotel(null)}
      />

      <PublishDialog
        hotel={publishHotel}
        open={!!publishHotel}
        onOpenChange={(o) => !o && setPublishHotel(null)}
      />

      <AlertDialog open={!!deleteHotel} onOpenChange={(o) => !o && setDeleteHotel(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>删除酒店</AlertDialogTitle>
            <AlertDialogDescription>
              确认删除「{deleteHotel?.name}」？该操作不可撤销，相关房型与价格信息将一并移除。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              确认删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function HeaderCell({ children, w }: { children: React.ReactNode; w: string }) {
  return (
    <div className={`${w} shrink-0 px-3 flex items-center text-[12px] font-semibold text-muted-foreground`}>
      {children}
    </div>
  );
}

function DataCell({ children, w }: { children: React.ReactNode; w: string }) {
  return (
    <div className={`${w} shrink-0 px-3 flex items-center`}>{children}</div>
  );
}
