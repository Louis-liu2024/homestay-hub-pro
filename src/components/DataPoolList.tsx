import { useState, useMemo } from "react";
import { mockHotels } from "@/lib/mock-data";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Link } from "@tanstack/react-router";
import { Search, Eye, Upload } from "lucide-react";
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
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">数据池</h1>
        <span className="text-sm text-muted-foreground">
          共 {filtered.length} 条数据
        </span>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="搜索酒店名称、渠道、标签..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Table with frozen columns */}
      <div className="border rounded-lg bg-card overflow-hidden">
        <div className="flex">
          {/* Frozen left: checkbox + hotel name */}
          <div className="shrink-0 border-r bg-card z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
            {/* Header */}
            <div className="flex items-center h-11 border-b bg-muted/50 px-3 gap-3">
              <Checkbox
                checked={selected.size === filtered.length && filtered.length > 0}
                onCheckedChange={toggleAll}
              />
              <span className="text-sm font-medium text-muted-foreground w-48">
                酒店名称
              </span>
            </div>
            {/* Rows */}
            {filtered.map((hotel) => (
              <div
                key={hotel.id}
                className="flex items-center h-14 border-b px-3 gap-3"
              >
                <Checkbox
                  checked={selected.has(hotel.id)}
                  onCheckedChange={() => toggleSelect(hotel.id)}
                />
                <Link
                  to="/data-pool/$hotelId"
                  params={{ hotelId: hotel.id }}
                  className="text-sm font-medium text-foreground hover:text-primary truncate w-48"
                >
                  {hotel.name}
                </Link>
              </div>
            ))}
          </div>

          {/* Scrollable middle */}
          <div className="flex-1 overflow-x-auto min-w-0">
            {/* Header */}
            <div className="flex items-center h-11 border-b bg-muted/50 min-w-[800px]">
              <Cell w="w-16">评分</Cell>
              <Cell w="w-20">渠道</Cell>
              <Cell w="w-20">房间量</Cell>
              <Cell w="w-24">7天空房率</Cell>
              <Cell w="w-40">标签</Cell>
              <Cell w="w-20">城市</Cell>
              <Cell w="w-24">品牌</Cell>
              <Cell w="w-20">订单数</Cell>
              <Cell w="w-24">均价(¥)</Cell>
            </div>
            {/* Rows */}
            {filtered.map((hotel) => (
              <div
                key={hotel.id}
                className="flex items-center h-14 border-b min-w-[800px]"
              >
                <Cell w="w-16">
                  <span className="text-sm font-semibold text-amber-600">
                    {hotel.rating}
                  </span>
                </Cell>
                <Cell w="w-20">
                  <Badge variant="outline" className="text-xs">
                    {hotel.channel}
                  </Badge>
                </Cell>
                <Cell w="w-20">
                  <span className="text-sm">{hotel.roomCount}</span>
                </Cell>
                <Cell w="w-24">
                  <span
                    className={`text-sm font-medium ${
                      hotel.vacancyRate7d > 0.5
                        ? "text-destructive"
                        : "text-green-600"
                    }`}
                  >
                    {(hotel.vacancyRate7d * 100).toFixed(0)}%
                  </span>
                </Cell>
                <Cell w="w-40">
                  <div className="flex gap-1 flex-wrap">
                    {hotel.tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="text-xs"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </Cell>
                <Cell w="w-20">
                  <span className="text-sm">{hotel.city}</span>
                </Cell>
                <Cell w="w-24">
                  <span className="text-sm">{hotel.brand}</span>
                </Cell>
                <Cell w="w-20">
                  <span className="text-sm">{hotel.totalOrders}</span>
                </Cell>
                <Cell w="w-24">
                  <span className="text-sm font-medium">
                    ¥{hotel.avgPrice}
                  </span>
                </Cell>
              </div>
            ))}
          </div>

          {/* Frozen right: actions */}
          <div className="shrink-0 border-l bg-card z-10 shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.1)]">
            {/* Header */}
            <div className="flex items-center h-11 border-b bg-muted/50 px-3">
              <span className="text-sm font-medium text-muted-foreground">
                操作
              </span>
            </div>
            {/* Rows */}
            {filtered.map((hotel) => (
              <div
                key={hotel.id}
                className="flex items-center h-14 border-b px-3 gap-2"
              >
                <Button variant="ghost" size="sm" asChild>
                  <Link
                    to="/data-pool/$hotelId"
                    params={{ hotelId: hotel.id }}
                  >
                    <Eye className="h-4 w-4" />
                    <span className="hidden md:inline">详情</span>
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toast.success(`${hotel.name} 已发布`)}
                >
                  <Upload className="h-4 w-4" />
                  <span className="hidden md:inline">发布</span>
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Floating batch publish */}
      {selected.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground rounded-lg shadow-lg px-6 py-3 flex items-center gap-4 z-50">
          <span className="text-sm font-medium">
            已选择 {selected.size} 个酒店
          </span>
          <Button
            size="sm"
            variant="secondary"
            onClick={handleBatchPublish}
          >
            <Upload className="h-4 w-4 mr-1" />
            一键发布
          </Button>
        </div>
      )}
    </div>
  );
}

function Cell({
  children,
  w,
}: {
  children: React.ReactNode;
  w: string;
}) {
  return (
    <div className={`${w} shrink-0 px-3 flex items-center`}>{children}</div>
  );
}
