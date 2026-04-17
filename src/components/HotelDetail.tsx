import { mockHotels } from "@/lib/mock-data";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { ArrowLeft, Upload, Bell, MapPin, Phone, Star } from "lucide-react";
import { toast } from "sonner";

export function HotelDetail({ hotelId }: { hotelId: string }) {
  const hotel = mockHotels.find((h) => h.id === hotelId);

  if (!hotel) {
    return (
      <div className="p-7 text-center">
        <p className="text-muted-foreground">酒店未找到</p>
        <Button asChild variant="link" className="mt-4">
          <Link to="/data-pool">返回列表</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="p-5 md:p-7 space-y-5 text-[13px]">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild className="h-8 w-8 text-muted-foreground hover:text-foreground">
          <Link to="/data-pool">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="min-w-0">
          <h2 className="text-base font-bold tracking-tight text-foreground truncate">{hotel.name}</h2>
          <div className="flex items-center gap-3 mt-0.5 text-[12px] text-muted-foreground flex-wrap">
            <span className="flex items-center gap-1">
              <Star className="h-3 w-3 text-warning" />{hotel.rating}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />{hotel.address}
            </span>
            <span className="flex items-center gap-1">
              <Phone className="h-3 w-3" />{hotel.contactPhone}
            </span>
          </div>
        </div>
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <InfoCard label="渠道来源" value={hotel.channel} />
        <InfoCard label="品牌" value={hotel.brand} />
        <InfoCard label="房间数" value={String(hotel.roomCount)} />
        <InfoCard label="7天空房率" value={`${(hotel.vacancyRate7d * 100).toFixed(0)}%`} highlight={hotel.vacancyRate7d > 0.5} />
        <InfoCard label="总订单" value={String(hotel.totalOrders)} />
        <InfoCard label="均价" value={`¥${hotel.avgPrice}`} />
        <InfoCard label="城市" value={hotel.city} />
        <div className="rounded-lg border border-border/50 bg-card/80 p-4">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">标签</p>
          <div className="flex gap-1 flex-wrap">
            {hotel.tags.map((t) => (
              <Badge key={t} variant="secondary" className="text-[10px] bg-primary/10 text-primary border-0">{t}</Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Room types */}
      <Card className="border-border/60 bg-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-[13px] font-semibold">房型列表</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-md border border-border/50">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 border-border/40 hover:bg-muted/40">
                  <TableHead className="text-[12px] font-semibold text-muted-foreground h-9">房型名称</TableHead>
                  <TableHead className="text-[12px] font-semibold text-muted-foreground h-9">价格</TableHead>
                  <TableHead className="text-[12px] font-semibold text-muted-foreground h-9">面积</TableHead>
                  <TableHead className="text-[12px] font-semibold text-muted-foreground h-9">床型</TableHead>
                  <TableHead className="text-[12px] font-semibold text-muted-foreground h-9">早餐</TableHead>
                  <TableHead className="text-[12px] font-semibold text-muted-foreground h-9">入住</TableHead>
                  <TableHead className="text-[12px] font-semibold text-muted-foreground h-9">楼层</TableHead>
                  <TableHead className="text-[12px] font-semibold text-muted-foreground h-9">WiFi</TableHead>
                  <TableHead className="text-[12px] font-semibold text-muted-foreground h-9">状态</TableHead>
                  <TableHead className="text-[12px] font-semibold text-muted-foreground h-9 text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {hotel.rooms.map((room, idx) => (
                  <TableRow
                    key={room.id}
                    className={`border-border/30 hover:bg-accent/40 ${idx % 2 === 1 ? "bg-[var(--row-stripe)]" : "bg-card"}`}
                  >
                    <TableCell className="text-[13px] font-medium py-2.5">{room.name}</TableCell>
                    <TableCell className="text-[13px] font-mono py-2.5">¥{room.price}</TableCell>
                    <TableCell className="text-[13px] py-2.5">{room.area}㎡</TableCell>
                    <TableCell className="text-[13px] py-2.5">{room.bedType}</TableCell>
                    <TableCell className="py-2.5">
                      <Badge variant={room.breakfast === "含早" ? "default" : "outline"} className="text-[11px] h-5">
                        {room.breakfast}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-[13px] py-2.5">{room.maxGuests}人</TableCell>
                    <TableCell className="text-[13px] py-2.5">{room.floor}</TableCell>
                    <TableCell className="text-[13px] py-2.5">{room.wifi ? "✓" : "—"}</TableCell>
                    <TableCell className="py-2.5">
                      <Badge variant={room.published ? "default" : "secondary"} className="text-[11px] h-5">
                        {room.published ? "已发布" : "未发布"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right py-2.5">
                      <div className="flex justify-end gap-1">
                        <Button size="sm" variant="ghost" className="h-7 text-[12px]" onClick={() => toast.success(`${room.name} 已发布到OTA平台`)}>
                          <Upload className="h-3 w-3 mr-1" />发布
                        </Button>
                        <Button size="sm" variant={room.subscribedPrice ? "secondary" : "ghost"} className="h-7 text-[12px]" onClick={() => toast.info(room.subscribedPrice ? `已取消订阅 ${room.name} 价格` : `已订阅 ${room.name} 价格变动`)}>
                          <Bell className="h-3 w-3 mr-1" />{room.subscribedPrice ? "已订阅" : "订阅"}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function InfoCard({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="rounded-lg border border-border/50 bg-card/80 p-4 card-hover">
      <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">{label}</p>
      <p className={`text-lg font-bold tracking-tight ${highlight ? "text-destructive" : "text-foreground"}`}>{value}</p>
    </div>
  );
}
