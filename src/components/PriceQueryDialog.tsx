import { useState, useMemo, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tag, Upload, CalendarDays, Users, Baby, BedDouble } from "lucide-react";
import { PublishDialog } from "@/components/PriceQueryDialog.publish";
import type { Hotel, PriceQueryResult } from "@/lib/types";

interface Props {
  hotel: Hotel | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Pre-select these room IDs in the publish dialog after查价 */
  preselectedRoomIds?: string[];
}

function formatDate(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function weekdayCN(d: Date) {
  return ["周日", "周一", "周二", "周三", "周四", "周五", "周六"][d.getDay()];
}

export function PriceQueryDialog({ hotel, open, onOpenChange }: Props) {
  const today = new Date();
  const tomorrow = new Date(today.getTime() + 86400000);
  const [checkIn, setCheckIn] = useState(formatDate(today));
  const [checkOut, setCheckOut] = useState(formatDate(tomorrow));
  const [rooms, setRooms] = useState(1);
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [childAges, setChildAges] = useState("");
  const [searched, setSearched] = useState(true);

  const dateLabel = useMemo(() => {
    const d = new Date(checkIn);
    if (isNaN(d.getTime())) return "—";
    return `${checkIn.slice(5)}\n${weekdayCN(d)}`;
  }, [checkIn]);

  const results: PriceQueryResult[] = useMemo(() => {
    if (!hotel) return [];
    // Generate 2 product lines per room type with 1早 / 2早 variants
    const out: PriceQueryResult[] = [];
    hotel.rooms.forEach((r, idx) => {
      const base = r.price;
      out.push({
        id: `${r.id}-1`,
        roomTypeName: r.name,
        productName: r.name,
        cancelPolicy: "入住日18:00前免费取消",
        bookingPolicy: "立即确认,供应商开票",
        breakfast: "1早",
        price: Math.round(base * 1.0 * 100) / 100,
        roomsLeft: ((idx + 1) % 3) + 1,
        date: checkIn,
      });
      out.push({
        id: `${r.id}-2`,
        roomTypeName: r.name,
        productName: r.name,
        cancelPolicy: "入住日18:00前免费取消",
        bookingPolicy: "立即确认,供应商开票",
        breakfast: "2早",
        price: Math.round(base * 1.1 * 100) / 100,
        roomsLeft: ((idx + 2) % 3) + 1,
        date: checkIn,
      });
    });
    return out;
  }, [hotel, checkIn]);

  // Group by room type for rowSpan rendering
  const grouped = useMemo(() => {
    const map = new Map<string, PriceQueryResult[]>();
    for (const r of results) {
      const arr = map.get(r.roomTypeName) ?? [];
      arr.push(r);
      map.set(r.roomTypeName, arr);
    }
    return Array.from(map.entries());
  }, [results]);

  if (!hotel) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl p-0 gap-0 bg-card">
        <DialogHeader className="px-5 py-3 border-b border-border/50">
          <DialogTitle className="text-[14px] font-semibold flex items-center gap-2">
            <span className="text-muted-foreground">查询房态</span>
            <span className="text-foreground">{hotel.name}</span>
          </DialogTitle>
        </DialogHeader>

        {/* Filter bar */}
        <div className="px-5 py-3 bg-muted/30 border-b border-border/40 flex items-center gap-4 flex-wrap text-[13px]">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">入离日期</span>
            <Input
              type="date"
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              className="h-8 w-[140px] text-[13px]"
            />
            <span className="text-muted-foreground">~</span>
            <Input
              type="date"
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              className="h-8 w-[140px] text-[13px]"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">房间数</span>
            <Input
              type="number" min={1} value={rooms}
              onChange={(e) => setRooms(Number(e.target.value) || 1)}
              className="h-8 w-14 text-[13px]"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">成人</span>
            <Input
              type="number" min={1} value={adults}
              onChange={(e) => setAdults(Number(e.target.value) || 1)}
              className="h-8 w-14 text-[13px]"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">儿童</span>
            <Input
              type="number" min={0} value={children}
              onChange={(e) => setChildren(Number(e.target.value) || 0)}
              className="h-8 w-14 text-[13px]"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">儿童年龄</span>
            <Input
              value={childAges}
              onChange={(e) => setChildAges(e.target.value)}
              placeholder=""
              className="h-8 w-[120px] text-[13px]"
            />
          </div>
          <Button size="sm" className="h-8 ml-auto" onClick={() => setSearched(true)}>
            <Search className="h-3.5 w-3.5 mr-1" />搜索
          </Button>
        </div>

        {/* Result table */}
        <div className="max-h-[60vh] overflow-auto">
          <table className="w-full text-[13px]">
            <thead className="bg-muted/40 sticky top-0">
              <tr className="border-b border-border/40">
                <th className="text-left font-semibold text-muted-foreground px-4 py-2.5 w-[180px]">房型</th>
                <th className="text-left font-semibold text-muted-foreground px-4 py-2.5 w-[200px]">产品</th>
                <th className="text-left font-semibold text-muted-foreground px-4 py-2.5">
                  <div>取消政策</div>
                  <div>预定政策</div>
                </th>
                <th className="text-left font-semibold text-muted-foreground px-4 py-2.5 w-[80px]">早餐</th>
                <th className="text-right font-semibold text-muted-foreground px-4 py-2.5 w-[120px] whitespace-pre-line">{dateLabel}</th>
              </tr>
            </thead>
            <tbody>
              {searched && grouped.map(([roomTypeName, items]) => (
                items.map((item, idx) => (
                  <tr key={item.id} className={`border-b border-border/30 ${idx % 2 === 1 ? "bg-[var(--row-stripe)]" : "bg-card"} hover:bg-accent/40`}>
                    {idx === 0 && (
                      <td className="px-4 py-3 align-top" rowSpan={items.length}>
                        <div className="font-medium text-foreground">{roomTypeName}</div>
                        <div className="text-[12px] text-muted-foreground mt-1">床型:{hotel.rooms.find(r => r.name === roomTypeName)?.bedType ?? "—"}</div>
                      </td>
                    )}
                    <td className="px-4 py-3">
                      <div className="text-foreground">{item.productName}</div>
                      <Badge className="mt-1 bg-primary text-primary-foreground hover:bg-primary text-[11px] h-5 rounded-full px-2">
                        {item.bookingPolicy}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-foreground">{item.cancelPolicy}</td>
                    <td className="px-4 py-3 text-foreground">{item.breakfast}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="font-semibold text-foreground">{item.price.toFixed(2)}</div>
                      <div className="text-[12px] text-muted-foreground">[{item.roomsLeft}间]</div>
                    </td>
                  </tr>
                ))
              ))}
              {searched && grouped.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">暂无房态数据</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </DialogContent>
    </Dialog>
  );
}
