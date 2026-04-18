import { useState, useMemo, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tag, Upload, CalendarDays, Users, Baby, BedDouble } from "lucide-react";
import { PublishDialog } from "@/components/PublishDialog";
import type { Hotel, PriceQueryResult } from "@/lib/types";

interface Props {
  hotel: Hotel | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** When provided, restricts results to these room IDs (e.g. clicked from a specific room) */
  roomFilterIds?: string[];
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

export function PriceQueryDialog({ hotel, open, onOpenChange, roomFilterIds }: Props) {
  const today = new Date();
  const tomorrow = new Date(today.getTime() + 86400000);
  const [checkIn, setCheckIn] = useState(formatDate(today));
  const [checkOut, setCheckOut] = useState(formatDate(tomorrow));
  const [rooms, setRooms] = useState(1);
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [childAges, setChildAges] = useState("");
  const [searched, setSearched] = useState(false);
  const [publishOpen, setPublishOpen] = useState(false);

  // Reset query state whenever the dialog re-opens
  useEffect(() => {
    if (open) setSearched(false);
  }, [open, hotel?.id]);

  const dateLabel = useMemo(() => {
    const d = new Date(checkIn);
    if (isNaN(d.getTime())) return "—";
    return `${checkIn.slice(5)} · ${weekdayCN(d)}`;
  }, [checkIn]);

  const targetRooms = useMemo(() => {
    if (!hotel) return [];
    if (roomFilterIds && roomFilterIds.length > 0) {
      return hotel.rooms.filter(r => roomFilterIds.includes(r.id));
    }
    return hotel.rooms;
  }, [hotel, roomFilterIds]);

  const results: PriceQueryResult[] = useMemo(() => {
    if (!hotel) return [];
    const out: PriceQueryResult[] = [];
    targetRooms.forEach((r, idx) => {
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
  }, [hotel, targetRooms, checkIn]);

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
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-5xl p-0 gap-0 bg-card overflow-hidden">
          <DialogHeader className="px-5 py-3 border-b border-border/50">
            <DialogTitle className="text-[14px] font-semibold flex items-center gap-2">
              <Tag className="h-4 w-4 text-primary" />
              <span className="text-muted-foreground">查价</span>
              <span className="text-foreground">{hotel.name}</span>
            </DialogTitle>
          </DialogHeader>

          {/* Filter bar — refined card layout */}
          <div className="px-5 py-3.5 bg-muted/20 border-b border-border/40">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-[12px]">
              <FilterField icon={<CalendarDays className="h-3.5 w-3.5" />} label="入住日期">
                <Input type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} className="h-8 text-[13px]" />
              </FilterField>
              <FilterField icon={<CalendarDays className="h-3.5 w-3.5" />} label="离店日期">
                <Input type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} className="h-8 text-[13px]" />
              </FilterField>
              <FilterField icon={<BedDouble className="h-3.5 w-3.5" />} label="房间数">
                <Input type="number" min={1} value={rooms} onChange={(e) => setRooms(Number(e.target.value) || 1)} className="h-8 text-[13px]" />
              </FilterField>
              <FilterField icon={<Users className="h-3.5 w-3.5" />} label="成人 / 儿童">
                <div className="flex gap-1.5">
                  <Input type="number" min={1} value={adults} onChange={(e) => setAdults(Number(e.target.value) || 1)} className="h-8 text-[13px]" />
                  <Input type="number" min={0} value={children} onChange={(e) => setChildren(Number(e.target.value) || 0)} className="h-8 text-[13px]" />
                </div>
              </FilterField>
              <FilterField icon={<Baby className="h-3.5 w-3.5" />} label="儿童年龄">
                <Input value={childAges} onChange={(e) => setChildAges(e.target.value)} placeholder="如:5,8" className="h-8 text-[13px]" />
              </FilterField>
            </div>
            <div className="mt-3 flex items-center justify-between gap-2">
              <div className="text-[12px] text-muted-foreground">
                共 <span className="text-foreground font-medium">{targetRooms.length}</span> 个房型可查
              </div>
              <div className="flex gap-2">
                {searched && (
                  <Button size="sm" variant="outline" className="h-8" onClick={() => setPublishOpen(true)}>
                    <Upload className="h-3.5 w-3.5 mr-1" />发布
                  </Button>
                )}
                <Button size="sm" className="h-8" onClick={() => setSearched(true)}>
                  <Tag className="h-3.5 w-3.5 mr-1" />查价
                </Button>
              </div>
            </div>
          </div>

          {/* Result table */}
          <div className="max-h-[55vh] overflow-auto">
            {!searched ? (
              <div className="px-4 py-16 text-center text-muted-foreground text-[13px]">
                请选择日期与人数后点击「查价」获取实时房态
              </div>
            ) : (
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
                    <th className="text-right font-semibold text-muted-foreground px-4 py-2.5 w-[120px]">{dateLabel}</th>
                  </tr>
                </thead>
                <tbody>
                  {grouped.map(([roomTypeName, items]) => (
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
                  {grouped.length === 0 && (
                    <tr><td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">暂无房态数据</td></tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <PublishDialog
        hotel={hotel}
        open={publishOpen}
        onOpenChange={setPublishOpen}
        preselectedRoomIds={roomFilterIds}
      />
    </>
  );
}

function FilterField({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1 text-muted-foreground">
        {icon}
        <span>{label}</span>
      </div>
      {children}
    </div>
  );
}
