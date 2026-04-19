import { useState, useMemo } from "react";
import { mockHotels } from "@/lib/mock-data";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "@tanstack/react-router";
import { Search, Upload, Tag, Download } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { DataTablePagination } from "@/components/DataTablePagination";
import { PriceQueryDialog } from "@/components/PriceQueryDialog";
import { PublishDialog } from "@/components/PublishDialog";
import type { Channel, Hotel } from "@/lib/types";

const CHANNELS: (Channel | "全部")[] = ["全部", "携程", "美团", "Booking", "飞猪", "去哪儿", "Agoda", "途家", "小红书"];

export function DataPoolList() {
  const [search, setSearch] = useState("");
  const [activeChannel, setActiveChannel] = useState<Channel | "全部">("全部");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [priceQueryHotel, setPriceQueryHotel] = useState<Hotel | null>(null);
  const [publishHotel, setPublishHotel] = useState<Hotel | null>(null);

  const channelCounts = useMemo(() => {
    const counts: Record<string, number> = { 全部: mockHotels.length };
    for (const h of mockHotels) counts[h.channel] = (counts[h.channel] ?? 0) + 1;
    return counts;
  }, []);

  const filtered = useMemo(() => {
    let list = mockHotels;
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
  }, [search, activeChannel]);

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

  const allChecked = paged.length > 0 && paged.every((h) => selected.has(h.id));
  const someChecked = selected.size > 0 && !allChecked;

  const toggleAll = () => {
    if (allChecked) {
      setSelected(new Set());
    } else {
      setSelected(new Set(paged.map((h) => h.id)));
    }
  };

  const handleBatchPublish = () => {
    toast.success(`已发布 ${selected.size} 个酒店`);
    setSelected(new Set());
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

      {/* Toolbar between filter & list: count(left) + actions(right) */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-[12px] text-muted-foreground">共 <b className="text-foreground">{filtered.length}</b> 条数据</span>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" className="h-8" onClick={handleExport}>
            <Download className="h-3.5 w-3.5 mr-1" />导出
          </Button>
        </div>
      </div>

      {/* Table */}
      <Card className="border-border/60 bg-card">
        <CardContent className="pt-4">
          <div className="overflow-x-auto rounded-md border border-border/50">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 border-border/40 hover:bg-muted/40">
                  <TableHead className="w-10 h-9">
                    <Checkbox
                      checked={allChecked ? true : someChecked ? "indeterminate" : false}
                      onCheckedChange={toggleAll}
                    />
                  </TableHead>
                  <TableHead className="text-[12px] font-semibold text-muted-foreground h-9">酒店名称</TableHead>
                  <TableHead className="text-[12px] font-semibold text-muted-foreground h-9">评分</TableHead>
                  <TableHead className="text-[12px] font-semibold text-muted-foreground h-9">渠道</TableHead>
                  <TableHead className="text-[12px] font-semibold text-muted-foreground h-9 text-right">房间量</TableHead>
                  <TableHead className="text-[12px] font-semibold text-muted-foreground h-9 text-right">7天空房率</TableHead>
                  <TableHead className="text-[12px] font-semibold text-muted-foreground h-9">标签</TableHead>
                  <TableHead className="text-[12px] font-semibold text-muted-foreground h-9">城市</TableHead>
                  <TableHead className="text-[12px] font-semibold text-muted-foreground h-9">品牌</TableHead>
                  <TableHead className="text-[12px] font-semibold text-muted-foreground h-9 text-right">订单数</TableHead>
                  <TableHead className="text-[12px] font-semibold text-muted-foreground h-9 text-right">均价(¥)</TableHead>
                  <TableHead className="text-[12px] font-semibold text-muted-foreground h-9 text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paged.map((hotel, idx) => (
                  <TableRow
                    key={hotel.id}
                    className={`border-border/30 hover:bg-accent/40 ${idx % 2 === 1 ? "bg-[var(--row-stripe)]" : "bg-card"}`}
                  >
                    <TableCell className="py-2.5">
                      <Checkbox
                        checked={selected.has(hotel.id)}
                        onCheckedChange={() => toggleSelect(hotel.id)}
                      />
                    </TableCell>
                    <TableCell className="py-2.5">
                      <Link
                        to="/data-pool/$hotelId"
                        params={{ hotelId: hotel.id }}
                        className="text-[13px] font-medium text-foreground hover:text-primary hover:underline underline-offset-2 transition-colors"
                      >
                        {hotel.name}
                      </Link>
                    </TableCell>
                    <TableCell className="py-2.5">
                      <span className="text-[13px] font-semibold text-warning">{hotel.rating}</span>
                    </TableCell>
                    <TableCell className="py-2.5">
                      <Badge variant="outline" className="text-[11px] h-5 border-border/60">{hotel.channel}</Badge>
                    </TableCell>
                    <TableCell className="text-right text-[13px] tabular-nums py-2.5">{hotel.roomCount}</TableCell>
                    <TableCell className="text-right py-2.5">
                      <span className={`text-[13px] tabular-nums font-medium ${hotel.vacancyRate7d > 0.5 ? "text-destructive" : "text-success"}`}>
                        {(hotel.vacancyRate7d * 100).toFixed(0)}%
                      </span>
                    </TableCell>
                    <TableCell className="py-2.5">
                      <div className="flex gap-1 flex-wrap max-w-[180px]">
                        {hotel.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-[11px] h-4 px-1.5 bg-primary/10 text-primary border-0">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-[13px] py-2.5">{hotel.city}</TableCell>
                    <TableCell className="text-[13px] py-2.5">{hotel.brand}</TableCell>
                    <TableCell className="text-right text-[13px] tabular-nums py-2.5">{hotel.totalOrders}</TableCell>
                    <TableCell className="text-right text-[13px] tabular-nums font-medium py-2.5">¥{hotel.avgPrice}</TableCell>
                    <TableCell className="text-right py-2.5">
                      <div className="flex items-center justify-end gap-0.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-[12px] text-muted-foreground hover:text-primary"
                          onClick={() => setPriceQueryHotel(hotel)}
                        >
                          <Tag className="h-3.5 w-3.5 mr-1" />查价
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-[12px] text-muted-foreground hover:text-primary"
                          onClick={() => setPublishHotel(hotel)}
                        >
                          <Upload className="h-3.5 w-3.5 mr-1" />发布
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {paged.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={12} className="text-center text-muted-foreground text-[13px] py-10">
                      暂无数据
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <DataTablePagination
            total={filtered.length}
            page={page}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
          />
        </CardContent>
      </Card>

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
    </div>
  );
}
