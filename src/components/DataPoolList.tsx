import { useState, useMemo } from "react";
import { mockHotels } from "@/lib/mock-data";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Link } from "@tanstack/react-router";
import { Search, Eye, Upload, Database } from "lucide-react";
import { toast } from "sonner";

export function DataPoolList() {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    if (!search.trim()) return mockHotels;
    const q = search.toLowerCase();
    return mockHotels.filter(
      (h) =>
        h.name.toLowerCase().includes(q) ||
        h.channel.toLowerCase().includes(q) ||
        h.tags.some((t) => t.includes(q))
    );
  }, [search]);

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === filtered.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map((h) => h.id)));
    }
  };

  const handleBatchPublish = () => {
    toast.success(`已发布 ${selected.size} 个酒店`);
    setSelected(new Set());
  };

  return (
    <div className="p-5 md:p-7 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">数据池</h1>
          <p className="text-sm text-muted-foreground mt-0.5">管理酒店与民宿数据源</p>
        </div>
        <Badge variant="outline" className="text-xs border-border/50 h-6">
          <Database className="h-3 w-3 mr-1" />
          {filtered.length} 条数据
        </Badge>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="搜索酒店名称、渠道、标签..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 h-9 bg-card border-border/50 text-sm"
        />
      </div>

      {/* Table */}
      <div className="border border-border/50 rounded-lg bg-card/60 overflow-hidden">
        <div className="flex">
          {/* Frozen left */}
          <div className="shrink-0 border-r border-border/30 bg-card z-10" style={{ boxShadow: "2px 0 8px oklch(0 0 0 / 0.2)" }}>
            <div className="flex items-center h-10 border-b border-border/30 bg-muted/30 px-3 gap-3">
              <Checkbox
                checked={selected.size === filtered.length && filtered.length > 0}
                onCheckedChange={toggleAll}
              />
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider w-48">
                酒店名称
              </span>
            </div>
            {filtered.map((hotel) => (
              <div key={hotel.id} className="flex items-center h-12 border-b border-border/20 px-3 gap-3 hover:bg-accent/30 transition-colors">
                <Checkbox
                  checked={selected.has(hotel.id)}
                  onCheckedChange={() => toggleSelect(hotel.id)}
                />
                <Link
                  to="/data-pool/$hotelId"
                  params={{ hotelId: hotel.id }}
                  className="text-xs font-medium text-foreground hover:text-primary truncate w-48 transition-colors"
                >
                  {hotel.name}
                </Link>
              </div>
            ))}
          </div>

          {/* Scrollable middle */}
          <div className="flex-1 overflow-x-auto min-w-0">
            <div className="flex items-center h-10 border-b border-border/30 bg-muted/30 min-w-[800px]">
              <HeaderCell w="w-16">评分</HeaderCell>
              <HeaderCell w="w-20">渠道</HeaderCell>
              <HeaderCell w="w-20">房间量</HeaderCell>
              <HeaderCell w="w-24">7天空房率</HeaderCell>
              <HeaderCell w="w-40">标签</HeaderCell>
              <HeaderCell w="w-20">城市</HeaderCell>
              <HeaderCell w="w-24">品牌</HeaderCell>
              <HeaderCell w="w-20">订单数</HeaderCell>
              <HeaderCell w="w-24">均价(¥)</HeaderCell>
            </div>
            {filtered.map((hotel) => (
              <div key={hotel.id} className="flex items-center h-12 border-b border-border/20 min-w-[800px] hover:bg-accent/30 transition-colors">
                <DataCell w="w-16">
                  <span className="text-xs font-semibold text-warning">{hotel.rating}</span>
                </DataCell>
                <DataCell w="w-20">
                  <Badge variant="outline" className="text-[10px] h-5 border-border/50">{hotel.channel}</Badge>
                </DataCell>
                <DataCell w="w-20"><span className="text-xs font-mono">{hotel.roomCount}</span></DataCell>
                <DataCell w="w-24">
                  <span className={`text-xs font-mono font-medium ${hotel.vacancyRate7d > 0.5 ? "text-destructive" : "text-success"}`}>
                    {(hotel.vacancyRate7d * 100).toFixed(0)}%
                  </span>
                </DataCell>
                <DataCell w="w-40">
                  <div className="flex gap-1 flex-wrap">
                    {hotel.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-[10px] h-4 px-1.5 bg-primary/10 text-primary border-0">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </DataCell>
                <DataCell w="w-20"><span className="text-xs">{hotel.city}</span></DataCell>
                <DataCell w="w-24"><span className="text-xs">{hotel.brand}</span></DataCell>
                <DataCell w="w-20"><span className="text-xs font-mono">{hotel.totalOrders}</span></DataCell>
                <DataCell w="w-24"><span className="text-xs font-mono font-medium">¥{hotel.avgPrice}</span></DataCell>
              </div>
            ))}
          </div>

          {/* Frozen right */}
          <div className="shrink-0 border-l border-border/30 bg-card z-10" style={{ boxShadow: "-2px 0 8px oklch(0 0 0 / 0.2)" }}>
            <div className="flex items-center h-10 border-b border-border/30 bg-muted/30 px-3">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">操作</span>
            </div>
            {filtered.map((hotel) => (
              <div key={hotel.id} className="flex items-center h-12 border-b border-border/20 px-2 gap-1">
                <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground hover:text-primary" asChild>
                  <Link to="/data-pool/$hotelId" params={{ hotelId: hotel.id }}>
                    <Eye className="h-3.5 w-3.5" />
                    <span className="hidden lg:inline ml-1">详情</span>
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs text-muted-foreground hover:text-primary"
                  onClick={() => toast.success(`${hotel.name} 已发布`)}
                >
                  <Upload className="h-3.5 w-3.5" />
                  <span className="hidden lg:inline ml-1">发布</span>
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Floating batch publish */}
      {selected.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 glass border border-primary/30 rounded-xl px-6 py-3 flex items-center gap-4 z-50 glow-primary">
          <span className="text-sm font-medium text-foreground">
            已选择 <span className="text-primary font-bold">{selected.size}</span> 个酒店
          </span>
          <Button size="sm" onClick={handleBatchPublish} className="h-8">
            <Upload className="h-3.5 w-3.5 mr-1" />
            一键发布
          </Button>
        </div>
      )}
    </div>
  );
}

function HeaderCell({ children, w }: { children: React.ReactNode; w: string }) {
  return (
    <div className={`${w} shrink-0 px-3 flex items-center text-[11px] font-semibold text-muted-foreground uppercase tracking-wider`}>
      {children}
    </div>
  );
}

function DataCell({ children, w }: { children: React.ReactNode; w: string }) {
  return (
    <div className={`${w} shrink-0 px-3 flex items-center`}>{children}</div>
  );
}
