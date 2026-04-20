import { useState, useMemo, useEffect } from "react";
import { mockHotels, mockShops } from "@/lib/mock-data";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Link } from "@tanstack/react-router";
import { Search, Download, TrendingUp, Pencil, BedDouble, Trash2, DoorOpen, DoorClosed } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { DataTablePagination } from "@/components/DataTablePagination";
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
import type { Hotel, Shop } from "@/lib/types";

const SHOP_KEY = "hotelos.shops.list";

function loadShops(): Shop[] {
  try {
    const raw = localStorage.getItem(SHOP_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    /* ignore */
  }
  return mockShops;
}

export function DataPoolList() {
  const [shops] = useState<Shop[]>(() => loadShops());
  const [hotels, setHotels] = useState<Hotel[]>(() =>
    mockHotels.map((h, i) => ({
      ...h,
      published: h.published ?? i % 3 !== 0,
      saleStatus: h.saleStatus ?? (i % 4 === 0 ? "关房" : "开房"),
    })),
  );
  const [search, setSearch] = useState("");
  const [shopFilter, setShopFilter] = useState<string>("all");
  const [publishFilter, setPublishFilter] = useState<string>("all");
  const [saleFilter, setSaleFilter] = useState<string>("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [deleteHotel, setDeleteHotel] = useState<Hotel | null>(null);

  useEffect(() => {
    setPage(1);
  }, [search, shopFilter, publishFilter, saleFilter]);

  const filtered = useMemo(() => {
    let list = hotels;
    if (shopFilter !== "all") list = list.filter((h) => h.shopId === shopFilter);
    if (publishFilter !== "all") {
      const want = publishFilter === "published";
      list = list.filter((h) => !!h.published === want);
    }
    if (saleFilter !== "all") list = list.filter((h) => (h.saleStatus ?? "开房") === saleFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (h) =>
          h.name.toLowerCase().includes(q) ||
          (h.hotelExternalId ?? "").toLowerCase().includes(q) ||
          h.tags.some((t) => t.includes(q)),
      );
    }
    return list;
  }, [hotels, search, shopFilter, publishFilter, saleFilter]);

  const paged = useMemo(
    () => filtered.slice((page - 1) * pageSize, page * pageSize),
    [filtered, page, pageSize],
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
    if (selected.size === paged.length) setSelected(new Set());
    else setSelected(new Set(paged.map((h) => h.id)));
  };

  const togglePublished = (id: string, next: boolean) => {
    setHotels((prev) => prev.map((h) => (h.id === id ? { ...h, published: next } : h)));
    toast.success(next ? "酒店已发布" : "酒店已下线");
  };

  const toggleSaleStatus = (id: string, next: "开房" | "关房") => {
    setHotels((prev) => prev.map((h) => (h.id === id ? { ...h, saleStatus: next } : h)));
    toast.success(next === "开房" ? "已开房" : "已关房");
  };

  const handleBatchSale = (status: "开房" | "关房") => {
    if (selected.size === 0) return;
    setHotels((prev) =>
      prev.map((h) => (selected.has(h.id) ? { ...h, saleStatus: status } : h)),
    );
    toast.success(`已${status === "开房" ? "批量开房" : "批量关房"} ${selected.size} 个酒店`);
    setSelected(new Set());
  };

  const handleDelete = () => {
    if (!deleteHotel) return;
    setHotels((prev) => prev.filter((h) => h.id !== deleteHotel.id));
    toast.success(`已删除「${deleteHotel.name}」`);
    setDeleteHotel(null);
  };

  const handleExport = () => {
    const headers = ["酒店ID", "酒店名称", "所属店铺", "评分", "城市", "品牌", "房间量", "发布状态", "售卖状态", "订单数", "均价"];
    const rows = filtered.map((h) => [
      h.hotelExternalId ?? h.id,
      h.name,
      shops.find((s) => s.id === h.shopId)?.name ?? "-",
      h.rating,
      h.city,
      h.brand,
      h.roomCount,
      h.published ? "已发布" : "未发布",
      h.saleStatus ?? "开房",
      h.totalOrders,
      h.avgPrice,
    ]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `酒店列表_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`已导出 ${filtered.length} 条数据`);
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
                placeholder="搜索酒店名称 / ID / 标签..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-8 text-[13px] pl-7 w-64"
              />
            </div>
            <Select value={shopFilter} onValueChange={setShopFilter}>
              <SelectTrigger className="w-40 h-8 text-[13px]">
                <SelectValue placeholder="全部店铺" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部店铺</SelectItem>
                {shops.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={publishFilter} onValueChange={setPublishFilter}>
              <SelectTrigger className="w-32 h-8 text-[13px]">
                <SelectValue placeholder="发布状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部状态</SelectItem>
                <SelectItem value="published">已发布</SelectItem>
                <SelectItem value="unpublished">未发布</SelectItem>
              </SelectContent>
            </Select>
            <Select value={saleFilter} onValueChange={setSaleFilter}>
              <SelectTrigger className="w-32 h-8 text-[13px]">
                <SelectValue placeholder="售卖状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部售卖</SelectItem>
                <SelectItem value="开房">开房</SelectItem>
                <SelectItem value="关房">关房</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Toolbar */}
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
            <div className="flex items-center h-10 border-b border-border/40 bg-muted/40 min-w-[1000px]">
              <HeaderCell w="w-28">酒店ID</HeaderCell>
              <HeaderCell w="w-16">评分</HeaderCell>
              <HeaderCell w="w-32">所属店铺</HeaderCell>
              <HeaderCell w="w-20">房间量</HeaderCell>
              <HeaderCell w="w-28">发布状态</HeaderCell>
              <HeaderCell w="w-28">售卖状态</HeaderCell>
              <HeaderCell w="w-20">城市</HeaderCell>
              <HeaderCell w="w-24">品牌</HeaderCell>
              <HeaderCell w="w-20">订单数</HeaderCell>
              <HeaderCell w="w-24">均价(¥)</HeaderCell>
            </div>
            {paged.map((hotel, idx) => {
              const shop = shops.find((s) => s.id === hotel.shopId);
              const sale = hotel.saleStatus ?? "开房";
              return (
                <div
                  key={hotel.id}
                  className={`flex items-center h-12 border-b border-border/30 min-w-[1000px] hover:bg-accent/40 transition-colors ${idx % 2 === 1 ? "bg-[var(--row-stripe)]" : "bg-card"}`}
                >
                  <DataCell w="w-28">
                    <span className="text-[12px] font-mono text-muted-foreground truncate">{hotel.hotelExternalId ?? hotel.id}</span>
                  </DataCell>
                  <DataCell w="w-16">
                    <span className="text-[13px] font-semibold text-warning">{hotel.rating}</span>
                  </DataCell>
                  <DataCell w="w-32">
                    <span className="text-[12px] truncate">{shop?.name ?? "-"}</span>
                  </DataCell>
                  <DataCell w="w-20"><span className="text-[13px] font-mono">{hotel.roomCount}</span></DataCell>
                  <DataCell w="w-28">
                    <div className="flex items-center gap-1.5 whitespace-nowrap">
                      <Switch
                        checked={!!hotel.published}
                        onCheckedChange={(v) => togglePublished(hotel.id, v)}
                        aria-label="切换发布状态"
                      />
                      <span className={`text-[12px] ${hotel.published ? "text-success" : "text-muted-foreground"}`}>
                        {hotel.published ? "已发布" : "未发布"}
                      </span>
                    </div>
                  </DataCell>
                  <DataCell w="w-28">
                    <Badge
                      variant="outline"
                      className={`text-[11px] h-5 cursor-pointer ${sale === "开房" ? "border-success/60 text-success bg-success/10" : "border-destructive/50 text-destructive bg-destructive/10"}`}
                      onClick={() => toggleSaleStatus(hotel.id, sale === "开房" ? "关房" : "开房")}
                    >
                      {sale === "开房" ? <DoorOpen className="h-3 w-3 mr-1" /> : <DoorClosed className="h-3 w-3 mr-1" />}
                      {sale}
                    </Badge>
                  </DataCell>
                  <DataCell w="w-20"><span className="text-[13px]">{hotel.city}</span></DataCell>
                  <DataCell w="w-24"><span className="text-[13px]">{hotel.brand}</span></DataCell>
                  <DataCell w="w-20"><span className="text-[13px] font-mono">{hotel.totalOrders}</span></DataCell>
                  <DataCell w="w-24"><span className="text-[13px] font-mono font-medium">¥{hotel.avgPrice}</span></DataCell>
                </div>
              );
            })}
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

      {/* Floating batch actions */}
      {selected.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 glass border border-primary/30 rounded-xl px-6 py-3 flex items-center gap-3 z-50 glow-primary">
          <span className="text-[13px] font-medium text-foreground">
            已选择 <span className="text-primary font-bold">{selected.size}</span> 个酒店
          </span>
          <Button size="sm" variant="outline" className="h-8" onClick={() => handleBatchSale("开房")}>
            <DoorOpen className="h-3.5 w-3.5 mr-1" />
            批量开房
          </Button>
          <Button size="sm" variant="outline" className="h-8" onClick={() => handleBatchSale("关房")}>
            <DoorClosed className="h-3.5 w-3.5 mr-1" />
            批量关房
          </Button>
          <Button size="sm" variant="ghost" className="h-8" onClick={() => setSelected(new Set())}>
            取消
          </Button>
        </div>
      )}

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
