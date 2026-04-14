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
    <div className="p-5 md:p-7 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild className="h-8 w-8 text-muted-foreground hover:text-foreground">
          <Link to="/data-pool">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">{hotel.name}</h1>
          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
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
      <Card className="border-border/50 bg-card/80">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">房型列表</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-border/30 hover:bg-transparent">
                <TableHead className="text-xs">房型名称</TableHead>
                <TableHead className="text-xs">价格</TableHead>
                <TableHead className="text-xs">面积</TableHead>
                <TableHead className="text-xs">床型</TableHead>
                <TableHead className="text-xs">早餐</TableHead>
                <TableHead className="text-xs">入住</TableHead>
                <TableHead className="text-xs">楼层</TableHead>
                <TableHead className="text-xs">WiFi</TableHead>
                <TableHead className="text-xs">状态</TableHead>
                <TableHead className="text-xs text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {hotel.rooms.map((room) => (
                <TableRow key={room.id} className="border-border/20">
                  <TableCell className="text-xs font-medium">{room.name}</TableCell>
                  <TableCell className="text-xs font-mono">¥{room.price}</TableCell>
                  <TableCell className="text-xs">{room.area}㎡</TableCell>
                  <TableCell className="text-xs">{room.bedType}</TableCell>
                  <TableCell>
                    <Badge variant={room.breakfast === "含早" ? "default" : "outline"} className="text-[10px] h-5">
                      {room.breakfast}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs">{room.maxGuests}人</TableCell>
                  <TableCell className="text-xs">{room.floor}</TableCell>
                  <TableCell className="text-xs">{room.wifi ? "✓" : "—"}</TableCell>
                  <TableCell>
                    <Badge variant={room.published ? "default" : "secondary"} className="text-[10px] h-5">
                      {room.published ? "已发布" : "未发布"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => toast.success(`${room.name} 已发布到OTA平台`)}>
                        <Upload className="h-3 w-3 mr-1" />发布
                      </Button>
                      <Button size="sm" variant={room.subscribedPrice ? "secondary" : "ghost"} className="h-7 text-xs" onClick={() => toast.info(room.subscribedPrice ? `已取消订阅 ${room.name} 价格` : `已订阅 ${room.name} 价格变动`)}>
                        <Bell className="h-3 w-3 mr-1" />{room.subscribedPrice ? "已订阅" : "订阅"}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
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
